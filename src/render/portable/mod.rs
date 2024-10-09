mod plot;
pub(crate) mod utils;
use crate::render::portable::plot::get_min_max;
use crate::render::portable::plot::render_plots;
use crate::render::portable::utils::minify_js;
use crate::render::Renderer;
use crate::spec::{AdditionalColumnSpec, LinkToUrlSpecEntry};
use crate::spec::{
    BarPlot, DatasetSpecs, DisplayMode, HeaderSpecs, Heatmap, ItemSpecs, ItemsSpec, LinkSpec,
    RenderColumnSpec, TickPlot,
};
use crate::utils::column_index::ColumnIndex;
use crate::utils::column_position;
use crate::utils::column_type::IsNa;
use crate::utils::column_type::{classify_table, ColumnType};
use crate::utils::compress::compress;
use crate::utils::row_address::RowAddressFactory;
use anyhow::Result;
use anyhow::{bail, Context as AnyhowContext};
use chrono::{DateTime, Local};
use itertools::Itertools;
use serde::Serialize;
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};

use minify_html::{minify, Cfg};
use std::fs;
use std::fs::File;
use std::io::Write;
use std::option::Option::Some;
use std::path::Path;
use std::str::FromStr;
use tera::{escape_html, Context, Tera};
use thiserror::Error;
use typed_builder::TypedBuilder;

#[derive(TypedBuilder, Debug)]
pub(crate) struct ItemRenderer {
    specs: ItemsSpec,
}

type LinkedTable = HashMap<(String, String), ColumnIndex>;

impl Renderer for ItemRenderer {
    /// Render all items of user config
    fn render_tables<P>(&self, path: P, webview_host: &str, debug: bool) -> Result<()>
    where
        P: AsRef<Path>,
    {
        let view_sizes: HashMap<_, _> = self
            .specs
            .views
            .iter()
            .filter(|(_, v)| v.dataset.is_some())
            .map(|(n, v)| {
                (
                    n.to_string(),
                    self.specs
                        .datasets
                        .get(v.dataset.as_ref().unwrap())
                        .unwrap()
                        .size()
                        .unwrap(),
                )
            })
            .filter(|(view_name, size)| {
                size == &0
                    || (self
                        .specs
                        .views
                        .get(view_name)
                        .unwrap()
                        .render_plot
                        .is_none()
                        && self
                            .specs
                            .views
                            .get(view_name)
                            .unwrap()
                            .render_html
                            .is_none())
            })
            .map(|(view_name, size)| {
                if size == 0 {
                    (view_name, "empty".to_string())
                } else {
                    (view_name, format!("{size} rows"))
                }
            })
            .collect();
        for (name, table) in &self.specs.views {
            let out_path = Path::new(path.as_ref()).join(name);
            fs::create_dir(&out_path)?;
            if table.render_plot.is_some() {
                if let Some(datasets) = &table.datasets {
                    // Render plot with multiple datasets
                    render_plot_page_with_multiple_datasets(
                        &out_path,
                        &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                        name,
                        table,
                        datasets
                            .iter()
                            .map(|(n, name)| {
                                (n.to_string(), self.specs.datasets.get(name).unwrap())
                            })
                            .collect(),
                        &self.specs.views,
                        &self.specs.default_view,
                    )?;
                    continue;
                }
            }

            let dataset = if let Some(d) = table.dataset.as_ref() {
                match self.specs.datasets.get(d) {
                    Some(dataset) => dataset,
                    None => {
                        bail!(DatasetError::NotFound {
                            dataset_name: table.dataset.as_ref().unwrap().clone()
                        })
                    }
                }
            } else {
                &DatasetSpecs::default()
            };

            let records_length = if table.render_img.is_none() {
                dataset.size()?
            } else {
                0
            };
            let is_empty = if table.render_img.is_none() {
                dataset.is_empty()?
            } else {
                false
            };
            if !is_empty {
                let linked_tables = if table.render_img.is_none() {
                    get_linked_tables(name, &self.specs)?
                } else {
                    HashMap::new()
                };
                // Render plot
                if table.render_plot.is_some() {
                    render_plot_page(
                        &out_path,
                        &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                        name,
                        table,
                        dataset,
                        &linked_tables,
                        dataset.links.as_ref().unwrap(),
                        &self.specs.views,
                        &self.specs.default_view,
                        &self.specs.report_name,
                        self.specs.needs_excel_sheet(),
                        &view_sizes,
                    )?;
                // Render HTML
                } else if let Some(table_specs) = &table.render_html {
                    render_html_page(
                        &out_path,
                        &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                        name,
                        table,
                        dataset,
                        &self.specs.views,
                        &self.specs.default_view,
                        table_specs.script_path.to_string(),
                        &self.specs.aux_libraries,
                        &self.specs.report_name,
                        self.specs.needs_excel_sheet(),
                        &view_sizes,
                    )?;
                } else if let Some(table_specs) = &table.render_img {
                    render_img_page(
                        &out_path,
                        &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                        name,
                        table,
                        &self.specs.views,
                        &self.specs.default_view,
                        table_specs.path.to_string(),
                        &self.specs.report_name,
                        &view_sizes,
                    )?;
                }
                // Render table
                else if let Some(table_specs) = &table.render_table {
                    let data_path = out_path.join("data");
                    fs::create_dir(&data_path)?;
                    let row_address_factory = RowAddressFactory::new(table.page_size);
                    let pages = row_address_factory.get(records_length - 1).page + 1;

                    let is_single_page = if let Some(max_rows) = table.max_in_memory_rows {
                        records_length <= max_rows
                    } else {
                        records_length <= self.specs.max_in_memory_rows
                    };

                    let headers = dataset
                        .reader()?
                        .headers()?
                        .iter()
                        .map(|s| s.to_owned())
                        .collect_vec();

                    // Filter out optional columns that are not in the headers
                    let table_specs: &HashMap<String, RenderColumnSpec> = &table_specs
                        .columns
                        .clone()
                        .into_iter()
                        .filter(|(k, s)| !s.optional || headers.contains(k))
                        .collect();
                    // Assert that remaining columns are present in dataset.
                    // This should be guaranteed by the validation that happens before.
                    for column in table_specs.keys() {
                        assert!(headers.contains(column));
                    }

                    let additional_headers = if dataset.header_rows > 1 {
                        Some(
                            dataset
                                .reader()?
                                .records()?
                                .take(dataset.header_rows - 1)
                                .collect_vec(),
                        )
                    } else {
                        None
                    };

                    for (page, grouped_records) in &dataset
                        .reader()?
                        .records()?
                        .skip(dataset.header_rows - 1)
                        .enumerate()
                        .chunk_by(|(i, _)| row_address_factory.get(*i).page)
                    {
                        let records = grouped_records.collect_vec();
                        render_page(
                            &out_path,
                            page + 1,
                            records.iter().map(|(_, records)| records).collect_vec(),
                            &headers,
                            &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                            name,
                            &linked_tables,
                            dataset.links.as_ref().unwrap(),
                            &self.specs.report_name,
                            &self.specs.views,
                            &self.specs.default_view,
                            is_single_page,
                            debug,
                        )?;
                    }
                    if !is_single_page {
                        render_search_dialogs(&out_path, &headers, dataset, table.page_size)?;
                    }
                    render_table_javascript(
                        &out_path,
                        &headers,
                        table_specs,
                        &table.render_table.as_ref().unwrap().additional_columns,
                        additional_headers,
                        &table.render_table.as_ref().unwrap().headers,
                        is_single_page,
                        table.single_page_page_size,
                        pages,
                        webview_host,
                        self.specs.webview_controls,
                        debug,
                        name,
                        dataset,
                        &view_sizes,
                        &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                        &self.specs.default_view,
                        self.specs.needs_excel_sheet(),
                        table.description.as_deref(),
                        &self.specs.report_name,
                        name,
                    )?;
                    render_custom_javascript_functions(
                        &out_path,
                        table_specs,
                        &table.render_table.as_ref().unwrap().additional_columns,
                    )?;
                    render_plots(&out_path, dataset, debug)?;
                }
            } else {
                render_empty_dataset(
                    &out_path,
                    name,
                    &self.specs.report_name,
                    &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                    self.specs.needs_excel_sheet(),
                    &view_sizes,
                )?;
            }
        }
        if self.specs.needs_excel_sheet() {
            render_excel_sheet(&self.specs, path)?;
        }
        Ok(())
    }
}

#[allow(clippy::too_many_arguments)]
/// Render single page of a table
fn render_page<P: AsRef<Path>>(
    output_path: P,
    page_index: usize,
    data: Vec<&Vec<String>>,
    titles: &[String],
    tables: &[String],
    name: &str,
    linked_tables: &LinkedTable,
    links: &HashMap<String, LinkSpec>,
    report_name: &str,
    views: &HashMap<String, ItemSpecs>,
    default_view: &Option<String>,
    is_single_page: bool,
    debug: bool,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "table.html.tera",
        include_str!("../../../templates/table.html.tera"),
    )?;
    templates.add_raw_template(
        "data.js.tera",
        include_str!("../../../templates/data.js.tera"),
    )?;
    let mut context = Context::new();

    let data = data
        .iter()
        .map(|s| s.iter().map(|s| s.to_string()).collect_vec())
        .collect_vec();

    let compressed_linkouts = if !links.is_empty() {
        let linkouts = data
            .iter()
            .map(|r| {
                render_link_column(
                    r,
                    linked_tables,
                    titles,
                    links,
                    views.get(name).unwrap().dataset.as_ref().unwrap(),
                )
                .unwrap()
            })
            .collect_vec();
        Some(compress(json!(linkouts))?)
    } else {
        None
    };

    let compressed_data = compress(json!(data))?;

    context.insert("data", &json!(compressed_data).to_string());
    context.insert("linkouts", &json!(compressed_linkouts).to_string());
    context.insert("current_page", &page_index);
    context.insert("is_single_page", &is_single_page);
    context.insert(
        "tables",
        &tables
            .iter()
            .filter(|t| !views.get(*t).unwrap().hidden)
            .filter(|t| {
                if let Some(default_view) = default_view {
                    t != &default_view
                } else {
                    true
                }
            })
            .collect_vec(),
    );
    context.insert("default_view", default_view);
    context.insert("report_name", report_name);

    let file_path = Path::new(output_path.as_ref())
        .join(Path::new(&format!("index_{page_index}")).with_extension("html"));

    let html = templates.render("table.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    if debug {
        file.write_all(html.as_bytes())?;
    } else {
        file.write_all(&minify(html.as_bytes(), &Cfg::new()))?;
    }

    let data_file_path = Path::new(output_path.as_ref())
        .join("data")
        .join(Path::new(&format!("data_{page_index}")).with_extension("js"));

    let js = templates.render("data.js.tera", &context)?;

    let mut data_file = fs::File::create(data_file_path)?;
    data_file.write_all(js.as_bytes())?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
/// Render javascript files for each table containing formatters
fn render_table_javascript<P: AsRef<Path>>(
    output_path: P,
    titles: &[String],
    render_columns: &HashMap<String, RenderColumnSpec>,
    additional_columns: &Option<HashMap<String, AdditionalColumnSpec>>,
    additional_headers: Option<Vec<Vec<String>>>,
    header_specs: &Option<HashMap<u32, HeaderSpecs>>,
    is_single_page: bool,
    page_size: usize,
    pages: usize,
    webview_host: &str,
    webview_controls: bool,
    debug: bool,
    view: &str,
    dataset: &DatasetSpecs,
    view_sizes: &HashMap<String, String>,
    tables: &[String],
    default_view: &Option<String>,
    has_excel_sheet: bool,
    description: Option<&str>,
    report_name: &String,
    title: &String,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "config.js.tera",
        include_str!("../../../templates/config.js.tera"),
    )?;
    let mut context = Context::new();

    let config = JavascriptConfig::from_column_config(
        render_columns,
        additional_columns,
        is_single_page,
        page_size,
        titles,
        webview_host,
        webview_controls,
        header_specs,
        dataset,
        pages,
        view_sizes,
        tables,
        default_view,
        has_excel_sheet,
        description,
        report_name,
        title,
    );

    let custom_plot_config =
        CustomPlotsConfig::from_column_config(render_columns, additional_columns, view);
    let header_config = HeaderConfig::from_headers(header_specs, &titles, additional_headers);

    context.insert("config", &config);
    context.insert("custom_plot_config", &custom_plot_config);
    context.insert("header_config", &header_config);

    let file_path = Path::new(output_path.as_ref()).join(Path::new("config").with_extension("js"));

    let js = templates.render("config.js.tera", &context)?;

    let mut file = File::create(file_path)?;
    let minified = minify_js(&js, debug)?;
    file.write_all(&minified)?;

    Ok(())
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct CustomPlotsConfig(Vec<CustomPlotConfig>);

impl CustomPlotsConfig {
    fn from_column_config(
        config: &HashMap<String, RenderColumnSpec>,
        additional_columns: &Option<HashMap<String, AdditionalColumnSpec>>,
        view: &str,
    ) -> Self {
        CustomPlotsConfig(
            config
                .iter()
                .filter(|(_, k)| k.custom_plot.is_some())
                .map(|(k, v)| {
                    let mut custom_plot = v.custom_plot.as_ref().unwrap().to_owned();
                    custom_plot.read_schema().unwrap();
                    CustomPlotConfig {
                        title: k.to_string(),
                        specs: serde_json::Value::from_str(&custom_plot.schema.unwrap())
                            .context(SpecError::CouldNotParse {
                                column: k.to_string(),
                                view: view.to_string(),
                            })
                            .unwrap(),
                        data_function: JavascriptFunction(custom_plot.plot_data).name(),
                        vega_controls: custom_plot.vega_controls,
                    }
                })
                .chain(
                    additional_columns
                        .as_ref()
                        .unwrap_or(&HashMap::new())
                        .iter()
                        .filter(|(_, v)| v.custom_plot.is_some())
                        .map(|(k, v)| {
                            let mut custom_plot = v.custom_plot.as_ref().unwrap().to_owned();
                            custom_plot.read_schema().unwrap();
                            CustomPlotConfig {
                                title: k.to_string(),
                                specs: serde_json::Value::from_str(&custom_plot.schema.unwrap())
                                    .context(SpecError::CouldNotParse {
                                        column: k.to_string(),
                                        view: view.to_string(),
                                    })
                                    .unwrap(),
                                data_function: JavascriptFunction(custom_plot.plot_data).name(),
                                vega_controls: custom_plot.vega_controls,
                            }
                        }),
                )
                .collect(),
        )
    }
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct HeaderConfig {
    headers: Vec<HeaderRowConfig>,
    heatmaps: Vec<HeaderHeatmapConfig>,
    ellipsis: Vec<HeaderEllipsisConfig>,
}

impl HeaderConfig {
    fn from_headers(
        header_specs: &Option<HashMap<u32, HeaderSpecs>>,
        columns: &&[String],
        additional_headers: Option<Vec<Vec<String>>>,
    ) -> Self {
        let mut headers = vec![];
        let mut heatmaps = vec![];
        let mut ellipsis = vec![];
        if let Some(hs) = header_specs {
            let header_rows = additional_headers.unwrap();
            for (row, specs) in hs {
                headers.push(HeaderRowConfig {
                    row: *row as usize,
                    header: header_rows[*row as usize - 1]
                        .iter()
                        .enumerate()
                        .map(|(i, v)| (columns[i].to_string(), v.to_string()))
                        .collect(),
                    label: specs.label.clone(),
                });

                if let Some(e) = &specs.ellipsis {
                    ellipsis.push(HeaderEllipsisConfig {
                        row: *row,
                        ellipsis: *e,
                    })
                }

                if let Some(p) = &specs.plot {
                    heatmaps.push(HeaderHeatmapConfig {
                        row: *row as usize,
                        heatmap: p.heatmap.clone().unwrap(),
                    });
                }
            }
        }
        HeaderConfig {
            headers,
            heatmaps,
            ellipsis,
        }
    }
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct HeaderRowConfig {
    row: usize,
    header: HashMap<String, String>,
    label: Option<String>,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct HeaderHeatmapConfig {
    row: usize,
    heatmap: Heatmap,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct HeaderEllipsisConfig {
    // serialize this field with index
    #[serde(rename = "index")]
    row: u32,
    ellipsis: u32,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct CustomPlotConfig {
    title: String,
    specs: Value,
    data_function: String,
    vega_controls: bool,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptConfig {
    detail_mode: bool,
    webview_controls: bool,
    webview_host: String,
    is_single_page: bool,
    page_size: usize,
    columns: Vec<String>,
    displayed_columns: Vec<String>,
    hidden_columns: Vec<String>,
    displayed_numeric_columns: Vec<String>,
    tick_titles: Vec<String>,
    bar_titles: Vec<String>,
    heatmap_titles: Vec<String>,
    custom_plot_titles: Vec<String>,
    links: Vec<String>,
    column_config: HashMap<String, JavascriptColumnConfig>,
    header_label_length: usize,
    ticks: Vec<JavascriptTickAndBarConfig>,
    bars: Vec<JavascriptTickAndBarConfig>,
    heatmaps: Vec<JavascriptHeatmapConfig>,
    brush_domains: HashMap<String, Vec<f32>>,
    aux_domains: HashMap<String, Vec<String>>,
    link_urls: Vec<JavascriptLinkConfig>,
    ellipsis: Vec<JavascriptEllipsisConfig>,
    format: HashMap<String, String>,
    additional_colums: HashMap<String, String>,
    unique_column_values: HashMap<String, usize>,
    pages: usize,
    view_sizes: HashMap<String, String>,
    tables: Vec<String>,
    default_view: Option<String>,
    has_excel_sheet: bool,
    description: Option<String>,
    report_name: String,
    time: String,
    version: String,
    title: String,
}

impl JavascriptConfig {
    #[allow(clippy::too_many_arguments)]
    fn from_column_config(
        config: &HashMap<String, RenderColumnSpec>,
        additional_columns: &Option<HashMap<String, AdditionalColumnSpec>>,
        is_single_page: bool,
        page_size: usize,
        columns: &[String],
        webview_host: &str,
        webview_controls: bool,
        header_specs: &Option<HashMap<u32, HeaderSpecs>>,
        dataset: &DatasetSpecs,
        pages: usize,
        view_sizes: &HashMap<String, String>,
        tables: &[String],
        default_view: &Option<String>,
        has_excel_sheet: bool,
        description: Option<&str>,
        report_name: &String,
        title: &String,
    ) -> Self {
        let column_classification = classify_table(dataset).unwrap();
        let header_label_length = if let Some(headers) = header_specs {
            headers.iter().filter(|(_, v)| v.label.is_some()).count()
        } else {
            0
        };
        let local: DateTime<Local> = Local::now();
        let column_display_mode_filter = |dp_mode: DisplayMode| -> Vec<String> {
            columns
                .iter()
                .map(|c| c.to_string())
                .filter(|c| config.get(c).unwrap().display_mode == dp_mode)
                .chain(
                    additional_columns
                        .as_ref()
                        .unwrap_or(&HashMap::new())
                        .iter()
                        .filter(|(_, v)| v.display_mode == dp_mode)
                        .map(|(k, _)| k.to_string()),
                )
                .collect()
        };
        let sorted_tables = tables.iter().sorted().map(|s| s.to_owned()).collect_vec();
        Self {
            detail_mode: config
                .iter()
                .filter(|(_, spec)| spec.display_mode == DisplayMode::Detail)
                .count()
                > 0,
            webview_controls,
            webview_host: webview_host.to_string(),
            is_single_page,
            page_size,
            columns: columns.iter().map(|c| c.to_string()).chain(additional_columns.as_ref().unwrap_or(&HashMap::new()).keys().map(|c| c.to_string())).collect(),
            displayed_columns: column_display_mode_filter(DisplayMode::Normal),
            hidden_columns: column_display_mode_filter(DisplayMode::Hidden),
            displayed_numeric_columns: classify_table(dataset)
                .unwrap()
                .iter()
                .map(|(k, v)| (k.to_owned(), v.is_numeric()))
                .filter(|(_, v)| *v)
                .map(|(k, _)| k)
                .collect(),
            tick_titles: filter_plot_columns(config, |(_, k)| k.plot.as_ref().unwrap().tick_plot.is_some()),
            bar_titles: filter_plot_columns(config, |(_, k)| k.plot.as_ref().unwrap().bar_plot.is_some()),
            heatmap_titles: filter_plot_columns(config, |(_, k)| k.plot.as_ref().unwrap().heatmap.is_some()),
            custom_plot_titles: filter_columns_for(config, additional_columns, |(_, k)| k.custom_plot.is_some(), |(_, k)| k.custom_plot.is_some()),
            links: filter_columns_for(config, additional_columns, |(_, k)| k.link_to_url.is_some(), |(_, k)| k.link_to_url.is_some()),
            column_config: config
                .iter()
                .map(|(k, v)| {
                    (
                        k.to_string(),
                        JavascriptColumnConfig::from_column_spec(
                            v,
                            column_classification.get(k).unwrap_or_else(|| panic!("bug: failed to obtain column type for column '{k}'")),
                        ),
                    )
                })
                .chain(
            additional_columns.as_ref().unwrap_or(&HashMap::new()).iter().map(|(k, _)| (k.to_owned(), JavascriptColumnConfig {
                label: None,
                is_float: false,
                precision: 0
            }))
            )
                .collect(),
            header_label_length,
            ticks: config
                .iter()
                .filter(|(_, v)| v.plot.is_some())
                .filter(|(_, v)| v.plot.as_ref().unwrap().tick_plot.is_some())
                .map(|(k, v)| {
                    JavascriptTickAndBarConfig::from_config(
                        k.to_string(),
                        render_tick_plot(
                            k,
                            dataset,
                            v.plot.as_ref().unwrap().tick_plot.as_ref().unwrap(),
                            v.precision,
                        )
                        .unwrap(),
                    )
                })
                .collect(),
            bars: config
                .iter()
                .filter(|(_, v)| v.plot.is_some())
                .filter(|(_, v)| v.plot.as_ref().unwrap().bar_plot.is_some())
                .map(|(k, v)| {
                    JavascriptTickAndBarConfig::from_config(
                        k.to_string(),
                        render_bar_plot(
                            k,
                            dataset,
                            v.plot.as_ref().unwrap().bar_plot.as_ref().unwrap(),
                            v.precision,
                        )
                        .unwrap(),
                    )
                })
                .collect(),
            heatmaps: config
                .iter()
                .filter(|(_, k)| k.plot.is_some())
                .filter(|(_, k)| k.plot.as_ref().unwrap().heatmap.is_some())
                .map(|(k, v)| {
                    JavascriptHeatmapConfig::from_config(
                        k.to_string(),
                        v.plot.as_ref().unwrap().heatmap.as_ref().unwrap(),
                        get_column_domain(
                            k,
                            dataset,
                            v.plot.as_ref().unwrap().heatmap.as_ref().unwrap(),
                        )
                        .unwrap(),
                    )
                })
                .collect(),
            brush_domains: config
                .iter()
                .filter_map(|(title, k)| k.plot.as_ref().map(|plot| (title, plot)))
                .filter_map(|(title, k)| k.tick_plot.as_ref().map(|tick_plot| (title, tick_plot)))
                .filter_map(|(title, k)| k.domain.as_ref().map(|domain| (title, domain)))
                .map(|(title, k)| (title.to_string(), k.to_vec()))
                .chain(
                    config
                        .iter()
                        .filter(|(title, _)| column_classification.get(&title.to_string()).unwrap().is_numeric())
                        .filter_map(|(title, k)| k.plot.as_ref().map(|plot| (title, plot)))
                        .filter_map(|(title, k)| k.heatmap.as_ref().map(|heatmap| (title, heatmap)))
                        .filter(|(_, k)| k.custom_content.is_none())
                        .filter_map(|(title, k)| k.domain.as_ref().map(|domain| (title, domain)))
                        .map(|(title, k)| {
                            (
                                title.to_string(),
                                k.iter().map(|s| f32::from_str(s).context(format!("Could not parse given domain value {s} for column {title}.")).unwrap()).collect_vec(),
                            )
                        }),
                )
                .collect(),
            aux_domains: config
                .iter()
                .filter_map(|(title, k)| k.plot.as_ref().map(|plot| (title, plot)))
                .filter_map(|(title, k)| k.tick_plot.as_ref().map(|tick_plot| (title, tick_plot)))
                .filter_map(|(title, k)| {
                    k.aux_domain_columns
                        .0
                        .as_ref()
                        .map(|domains| (title, domains))
                })
                .map(|(title, k)| (title.to_string(), k.to_vec()))
                .chain(
                    config
                        .iter()
                        .filter_map(|(title, k)| k.plot.as_ref().map(|plot| (title, plot)))
                        .filter_map(|(title, k)| k.heatmap.as_ref().map(|heatmap| (title, heatmap)))
                        .filter_map(|(title, k)| {
                            k.aux_domain_columns
                                .0
                                .as_ref()
                                .map(|domains| (title, domains))
                        })
                        .map(|(title, k)| (title.to_string(), k.to_vec())),
                )
                .collect(),
            link_urls: config
                .iter()
                .filter(|(_, v)| v.link_to_url.is_some())
                .map(|(k, v)| JavascriptLinkConfig {
                    title: k.to_string(),
                    links: v.link_to_url.as_ref().unwrap().entries.iter().map(|(link_name, link_spec)| JavascriptLink {
                        name: link_name.to_string(),
                        link: link_spec.to_owned(),
                    }).collect(),
                    custom_content: v.link_to_url.as_ref().unwrap().custom_content.to_owned().map(|c| JavascriptFunction(c).name()),
                })
                .chain(
                    additional_columns
                        .as_ref()
                        .unwrap_or(&HashMap::new())
                        .iter()
                        .filter(|(_,v)| v.link_to_url.is_some())
                        .map(|(k, v)| JavascriptLinkConfig {
                            title: k.to_string(),
                            links: v.link_to_url.as_ref().unwrap().entries.iter().map(|(link_name, link_spec)| JavascriptLink {
                                name: link_name.to_string(),
                                link: link_spec.to_owned(),
                            }).collect(),
                            custom_content: v.link_to_url.as_ref().unwrap().custom_content.to_owned().map(|c| JavascriptFunction(c).name()),
                        })
                )
                .collect(),
            ellipsis: config
                .iter()
                .filter(|(_, v)| v.ellipsis.is_some())
                .map(|(k, v)| JavascriptEllipsisConfig {
                    title: k.to_string(),
                    ellipsis: v.ellipsis.as_ref().unwrap().to_owned(),
                })
                .collect(),
            format: config
                .iter()
                .filter(|(_, k)| k.custom.is_some())
                .map(|(k, v)| (k.to_owned(), JavascriptFunction(v.custom.as_ref().unwrap().to_owned()).name()))
                .collect(),
            additional_colums: additional_columns.as_ref().unwrap_or(&HashMap::new()).iter().map(|(k, v)| (k.to_owned(), JavascriptFunction(v.value.to_string()).name())).collect(),
            unique_column_values: dataset.unique_column_values().unwrap(),
            pages,
            view_sizes: view_sizes.to_owned(),
            tables: sorted_tables,
            default_view: default_view.to_owned(),
            has_excel_sheet,
            description: description.map(escape_html),
            report_name: report_name.to_owned(),
            time: local.format("%a %b %e %T %Y").to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            title: title.to_string(),
        }
    }
}

fn filter_plot_columns<F>(
    config: &HashMap<String, RenderColumnSpec>,
    filter_fn_render_columns: F,
) -> Vec<String>
where
    F: Fn(&(&String, &RenderColumnSpec)) -> bool,
{
    config
        .iter()
        .filter(|(_, k)| k.plot.is_some())
        .filter(|(k, v)| filter_fn_render_columns(&(*k, v)))
        .map(|(k, _)| k.to_string())
        .collect()
}

fn filter_columns_for<F, G>(
    config: &HashMap<String, RenderColumnSpec>,
    additional_columns: &Option<HashMap<String, AdditionalColumnSpec>>,
    filter_fn_render_columns: F,
    filter_fn_additional_columns: G,
) -> Vec<String>
where
    F: Fn(&(&String, &RenderColumnSpec)) -> bool,
    G: Fn(&(&String, &AdditionalColumnSpec)) -> bool,
{
    config
        .iter()
        .filter(|(k, v)| filter_fn_render_columns(&(*k, v)))
        .map(|(k, _)| k.to_string())
        .chain(
            additional_columns
                .as_ref()
                .unwrap_or(&HashMap::new())
                .iter()
                .filter(|(k, v)| filter_fn_additional_columns(&(*k, v)))
                .map(|(k, _)| k.to_string()),
        )
        .collect()
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptColumnConfig {
    label: Option<String>,
    is_float: bool,
    precision: u32,
}

impl JavascriptColumnConfig {
    fn from_column_spec(spec: &RenderColumnSpec, column_type: &ColumnType) -> Self {
        Self {
            label: spec.label.clone(),
            is_float: column_type == &ColumnType::Float,
            precision: spec.precision,
        }
    }
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptTickAndBarConfig {
    title: String,
    slug_title: String,
    specs: Value,
}

impl JavascriptTickAndBarConfig {
    fn from_config(title: String, specs: String) -> Self {
        Self {
            title: title.clone(),
            slug_title: slug::slugify(&title),
            specs: serde_json::from_str(&specs).unwrap(),
        }
    }
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptHeatmapConfig {
    title: String,
    slug_title: String,
    heatmap: Heatmap,
    domain: Value,
}

impl JavascriptHeatmapConfig {
    fn from_config(title: String, heatmap: &Heatmap, domain: String) -> Self {
        let js_function_name = heatmap
            .custom_content
            .as_ref()
            .map(|custom_content| JavascriptFunction(custom_content.to_owned()).name());
        let js_heatmap = Heatmap {
            vega_type: None,
            scale_type: heatmap.scale_type,
            clamp: heatmap.clamp,
            color_scheme: heatmap.color_scheme.clone(),
            color_range: heatmap.color_range.clone(),
            domain: heatmap.domain.clone(),
            domain_mid: heatmap.domain_mid,
            aux_domain_columns: heatmap.aux_domain_columns.clone(),
            custom_content: js_function_name,
        };
        Self {
            title: title.clone(),
            slug_title: slug::slugify(&title),
            heatmap: js_heatmap,
            domain: serde_json::from_str(&domain).unwrap(),
        }
    }
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptLinkConfig {
    title: String,
    links: Vec<JavascriptLink>,
    custom_content: Option<String>,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptLink {
    name: String,
    link: LinkToUrlSpecEntry,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptEllipsisConfig {
    title: String,
    ellipsis: u32,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptFunction(String);

impl JavascriptFunction {
    fn name(&self) -> String {
        format!("custom_func_{:x}", md5::compute(self.0.as_bytes()))
    }

    fn body(&self) -> String {
        self.0
            .split_once('{')
            .unwrap()
            .1
            .rsplit_once('}')
            .unwrap()
            .0
            .to_string()
    }

    fn args(&self) -> String {
        self.0
            .split_once('(')
            .unwrap()
            .1
            .split_once(')')
            .unwrap()
            .0
            .to_string()
    }

    fn to_javascript_function(&self, column: &String) -> String {
        format!(
            "function {}({}) {{ try {{ {} }} catch (e) {{ datavzrd.custom_error(e, '{}') }}}}",
            &self.name(),
            &self.args(),
            &self.body(),
            column,
        )
    }
}

/// Render javascript functions into functions.js file per view
fn render_custom_javascript_functions<P: AsRef<Path>>(
    output_path: P,
    render_columns: &HashMap<String, RenderColumnSpec>,
    additional_columns: &Option<HashMap<String, AdditionalColumnSpec>>,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "functions.js.tera",
        include_str!("../../../templates/functions.js.tera"),
    )?;

    let mut context = Context::new();

    let functions = render_columns
        .iter()
        .filter(|(_, k)| k.custom.is_some())
        .map(|(k, v)| {
            JavascriptFunction(v.custom.as_ref().unwrap().to_owned()).to_javascript_function(k)
        })
        .chain(
            render_columns
                .iter()
                .filter(|(_, k)| k.link_to_url.is_some())
                .filter(|(_, k)| k.link_to_url.as_ref().unwrap().custom_content.is_some())
                .map(|(k, v)| {
                    JavascriptFunction(
                        v.link_to_url
                            .as_ref()
                            .unwrap()
                            .custom_content
                            .as_ref()
                            .unwrap()
                            .to_string(),
                    )
                    .to_javascript_function(k)
                }),
        )
        .chain(
            render_columns
                .iter()
                .filter(|(_, k)| k.custom_plot.is_some())
                .map(|(k, v)| {
                    JavascriptFunction(v.custom_plot.as_ref().unwrap().plot_data.to_owned())
                        .to_javascript_function(k)
                }),
        )
        .chain(
            render_columns
                .iter()
                .filter(|(_, k)| k.plot.is_some())
                .map(|(k, v)| (k, v.plot.as_ref().unwrap()))
                .filter(|(_, k)| k.heatmap.is_some())
                .map(|(k, v)| (k, v.heatmap.as_ref().unwrap()))
                .filter(|(_, k)| k.custom_content.is_some())
                .map(|(k, v)| {
                    JavascriptFunction(v.custom_content.as_ref().unwrap().to_owned())
                        .to_javascript_function(k)
                }),
        )
        .chain(
            additional_columns
                .as_ref()
                .unwrap_or(&HashMap::new())
                .iter()
                .map(|(k, v)| JavascriptFunction(v.value.to_string()).to_javascript_function(k)),
        )
        .collect_vec();

    context.insert("functions", &functions);

    let file_path =
        Path::new(output_path.as_ref()).join(Path::new("functions").with_extension("js"));

    let js = templates.render("functions.js.tera", &context)?;

    let mut file = File::create(file_path)?;
    file.write_all(js.as_bytes())?;

    Ok(())
}

/// Renders an empty page when datasets are empty
fn render_empty_dataset<P: AsRef<Path>>(
    output_path: P,
    name: &str,
    report_name: &str,
    tables: &[String],
    has_excel_sheet: bool,
    view_sizes: &HashMap<String, String>,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "empty.html.tera",
        include_str!("../../../templates/empty.html.tera"),
    )?;
    let mut context = Context::new();
    let local: DateTime<Local> = Local::now();

    context.insert("view_sizes", &view_sizes);
    context.insert("tables", tables);
    context.insert("name", name);
    context.insert("report_name", report_name);
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));
    context.insert("has_excel_sheet", &has_excel_sheet);

    let file_path =
        Path::new(output_path.as_ref()).join(Path::new("index_1").with_extension("html"));

    let html = templates.render("empty.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;

    Ok(())
}

/// Renders search dialog modals for individual columns of every table
fn render_search_dialogs<P: AsRef<Path>>(
    path: P,
    titles: &[String],
    dataset: &DatasetSpecs,
    page_size: usize,
) -> Result<()> {
    let output_path = Path::new(path.as_ref()).join("search");
    fs::create_dir(&output_path)?;
    let table_classes = classify_table(dataset)?;
    for (column, title) in titles.iter().enumerate() {
        if table_classes.get(title).unwrap() != &ColumnType::Float {
            let mut reader = dataset.reader()?;

            let row_address_factory = RowAddressFactory::new(page_size);

            let records = &reader
                .records()?
                .skip(dataset.header_rows - 1)
                .map(|row| row.get(column).unwrap().to_string())
                .enumerate()
                .map(|(i, row)| (row, row_address_factory.get(i)))
                .map(|(row, address)| (row, address.page + 1, address.row))
                .collect_vec();

            let compressed_data = compress(json!(records))?;

            let mut templates = Tera::default();
            templates.add_raw_template(
                "search_dialog.html.tera",
                include_str!("../../../templates/search_dialog.html.tera"),
            )?;
            let mut context = Context::new();
            context.insert("data", &json!(compressed_data).to_string());
            context.insert("records", &records);
            context.insert("title", &title);

            let file_path = Path::new(&output_path)
                .join(Path::new(&format!("column_{column}")).with_extension("html"));

            let html = templates.render("search_dialog.html.tera", &context)?;

            let mut file = fs::File::create(file_path)?;
            file.write_all(html.as_bytes())?;
        }
    }
    Ok(())
}

fn get_linked_tables(table: &str, specs: &ItemsSpec) -> Result<LinkedTable> {
    let table_spec = specs.views.get(table).unwrap();
    let dataset = &specs
        .datasets
        .get(table_spec.dataset.as_ref().unwrap())
        .unwrap();
    let links = &dataset
        .links
        .as_ref()
        .unwrap()
        .iter()
        .filter_map(|(_, link_spec)| link_spec.table_row.as_ref())
        .map(|link| link.split_once('/').unwrap())
        .collect_vec();

    let mut result = HashMap::new();

    for (table, column) in links {
        let linked_table = &specs.views.get(*table).unwrap();
        let other_dataset = match specs.datasets.get(linked_table.dataset.as_ref().unwrap()) {
            Some(dataset) => dataset,
            None => {
                bail!(DatasetError::NotFound {
                    dataset_name: table_spec.dataset.as_ref().unwrap().clone()
                })
            }
        };
        let page_size = specs.views.get(*table).unwrap().page_size;

        let column_index = ColumnIndex::new(other_dataset, column, page_size)?;

        result.insert((table.to_string(), column.to_string()), column_index);
    }
    Ok(result)
}

/// Renders tick plots for given csv column
fn render_tick_plot(
    title: &str,
    dataset: &DatasetSpecs,
    tick_plot: &TickPlot,
    precision: u32,
) -> Result<String> {
    let mut reader = dataset.reader()?;

    let column_index = reader.headers().map(|s| {
        s.iter()
            .position(|t| t == title)
            .context(ColumnError::NotFound {
                column: title.to_string(),
                path: dataset.path.to_str().unwrap().to_string(),
            })
            .unwrap()
    })?;

    let (min, max) = if let Some(domain) = &tick_plot.domain {
        (domain[0], domain[1])
    } else if let Some(aux_domain_columns) = &tick_plot.aux_domain_columns.0 {
        let columns = aux_domain_columns
            .iter()
            .map(|s| s.to_string())
            .chain(vec![title.to_string()])
            .collect();
        get_min_max_multiple_columns(dataset, columns, Some(precision))?
    } else {
        get_min_max(dataset, column_index, Some(precision))?
    };

    let mut templates = Tera::default();
    templates.add_raw_template(
        "tick_plot.vl.tera",
        include_str!("../../../templates/tick_plot.vl.tera"),
    )?;
    let mut context = Context::new();
    context.insert("minimum", &min);
    context.insert("maximum", &max);
    context.insert("field", &title);
    context.insert("scale_type", &tick_plot.scale_type);
    context.insert("color_definition", &tick_plot.color);

    Ok(templates.render("tick_plot.vl.tera", &context)?)
}

/// Renders bar plots for given csv column
fn render_bar_plot(
    title: &str,
    dataset: &DatasetSpecs,
    bar_plot: &BarPlot,
    precision: u32,
) -> Result<String> {
    let mut reader = dataset.reader()?;

    let column_index = reader.headers().map(|s| {
        s.iter()
            .position(|t| t == title)
            .context(ColumnError::NotFound {
                column: title.to_string(),
                path: dataset.path.to_str().unwrap().to_string(),
            })
            .unwrap()
    })?;

    let (min, max) = if let Some(domain) = &bar_plot.domain {
        (domain[0], domain[1])
    } else if let Some(aux_domain_columns) = &bar_plot.aux_domain_columns.0 {
        let columns = aux_domain_columns
            .iter()
            .map(|s| s.to_string())
            .chain(vec![title.to_string()])
            .collect();
        get_min_max_multiple_columns(dataset, columns, Some(precision))?
    } else {
        get_min_max(dataset, column_index, Some(precision))?
    };

    let mut templates = Tera::default();
    templates.add_raw_template(
        "bar_plot.vl.tera",
        include_str!("../../../templates/bar_plot.vl.tera"),
    )?;
    let mut context = Context::new();
    context.insert("minimum", &min);
    context.insert("maximum", &max);
    context.insert("field", &title);
    context.insert("scale_type", &bar_plot.scale_type);
    context.insert("color_definition", &bar_plot.color);

    Ok(templates.render("bar_plot.vl.tera", &context)?)
}

pub(crate) fn get_column_domain(
    title: &str,
    dataset: &DatasetSpecs,
    heatmap: &Heatmap,
) -> Result<String> {
    if let Some(domain) = &heatmap.domain {
        return Ok(json!(domain).to_string());
    }

    let mut reader = dataset.reader()?;

    let column_index = column_position(title, dataset)?;

    if !heatmap.scale_type.is_quantitative() {
        if let Some(aux_domain_columns) = &heatmap.aux_domain_columns.0 {
            let columns = aux_domain_columns
                .iter()
                .map(|s| s.to_string())
                .chain(vec![title.to_string()])
                .collect_vec();
            let column_indexes: HashSet<_> = dataset.reader()?.headers().map(|s| {
                s.iter()
                    .enumerate()
                    .filter(|(_, title)| columns.contains(&title.to_string()))
                    .map(|(index, _)| index)
                    .collect()
            })?;
            Ok(json!(reader
                .records()?
                .skip(dataset.header_rows - 1)
                .flat_map(|r| r
                    .iter()
                    .enumerate()
                    .filter(|(index, _)| column_indexes.contains(index))
                    .filter(|(_, value)| !value.as_str().is_na())
                    .map(|(_, value)| value.to_string())
                    .collect_vec())
                .unique()
                .sorted()
                .collect_vec())
            .to_string())
        } else {
            Ok(json!(reader
                .records()?
                .skip(dataset.header_rows - 1)
                .map(|r| r.get(column_index).unwrap().to_owned())
                .filter(|value| !value.as_str().is_na())
                .unique()
                .sorted()
                .collect_vec())
            .to_string())
        }
    } else if let Some(aux_domain_columns) = &heatmap.aux_domain_columns.0 {
        let columns = aux_domain_columns
            .iter()
            .map(|s| s.to_string())
            .chain(vec![title.to_string()])
            .collect();
        Ok(json!(get_min_max_multiple_columns(dataset, columns, None)?).to_string())
    } else {
        Ok(json!(get_min_max(dataset, column_index, None)?).to_string())
    }
}

/// Returns the minimum and maximum for multiple given columns
fn get_min_max_multiple_columns(
    dataset: &DatasetSpecs,
    columns: Vec<String>,
    precision: Option<u32>,
) -> Result<(f32, f32)> {
    let mut mins = Vec::new();
    let mut maxs = Vec::new();
    for column in columns {
        let column_index = column_position(&column, dataset)?;
        let (min, max) = get_min_max(dataset, column_index, precision)?;
        mins.push(min);
        maxs.push(max);
    }
    Ok((
        mins.into_iter().reduce(f32::min).unwrap(),
        maxs.into_iter().reduce(f32::max).unwrap(),
    ))
}

#[allow(clippy::too_many_arguments)]
/// Renders a plot page from given render-plot spec
fn render_plot_page<P: AsRef<Path>>(
    output_path: P,
    tables: &[String],
    name: &str,
    item_spec: &ItemSpecs,
    dataset: &DatasetSpecs,
    linked_tables: &LinkedTable,
    links: &HashMap<String, LinkSpec>,
    views: &HashMap<String, ItemSpecs>,
    default_view: &Option<String>,
    report_name: &String,
    has_excel_sheet: bool,
    view_sizes: &HashMap<String, String>,
) -> Result<()> {
    let headers = dataset
        .reader()?
        .headers()?
        .iter()
        .map(|s| s.to_owned())
        .collect_vec();
    let mut records: Vec<HashMap<String, String>> = dataset
        .reader()?
        .records()?
        .skip(&dataset.header_rows - 1)
        .map(|row| {
            row.iter()
                .enumerate()
                .map(|(index, record)| (headers.get(index).unwrap().to_owned(), record.to_owned()))
                .collect()
        })
        .collect_vec();
    if !links.is_empty() {
        let linkouts = dataset
            .reader()?
            .records()?
            .skip(&dataset.header_rows - 1)
            .map(|row| {
                render_linkouts(
                    &row.iter().map(|s| s.to_owned()).collect_vec(),
                    linked_tables,
                    &headers,
                    links,
                    views.get(name).unwrap().dataset.as_ref().unwrap(),
                )
                .unwrap()
            })
            .collect_vec();

        assert_eq!(records.len(), linkouts.len());

        for (i, record) in records.iter_mut().enumerate() {
            for linkout in &linkouts[i] {
                record.insert(linkout.name.to_string(), linkout.url.to_string());
            }
        }
    }

    let mut render_plot_specs = item_spec.render_plot.clone().unwrap();
    render_plot_specs.read_schema()?;

    let mut templates = Tera::default();
    templates.add_raw_template(
        "plot.html.tera",
        include_str!("../../../templates/plot.html.tera"),
    )?;
    let mut context = Context::new();

    let local: DateTime<Local> = Local::now();

    let compressed_data = compress(json!(records))?;

    context.insert("data", &json!(compressed_data).to_string());
    context.insert("description", &item_spec.description);
    context.insert("has_excel_sheet", &has_excel_sheet);
    context.insert(
        "tables",
        &tables
            .iter()
            .filter(|t| !views.get(*t).unwrap().hidden)
            .filter(|t| {
                if let Some(default_view) = default_view {
                    t != &default_view
                } else {
                    true
                }
            })
            .collect_vec(),
    );
    context.insert("view_sizes", &view_sizes);
    context.insert("default_view", default_view);
    context.insert("report_name", report_name);
    context.insert("name", name);
    context.insert("specs", &render_plot_specs.schema.as_ref().unwrap());
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));

    let file_path =
        Path::new(output_path.as_ref()).join(Path::new("index_1").with_extension("html"));

    let html = templates.render("plot.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
/// Renders a plot page from given render-plot spec
fn render_html_page<P: AsRef<Path>>(
    output_path: P,
    tables: &[String],
    name: &str,
    item_spec: &ItemSpecs,
    dataset: &DatasetSpecs,
    views: &HashMap<String, ItemSpecs>,
    default_view: &Option<String>,
    script_path: String,
    aux_libraries: &Option<Vec<String>>,
    report_name: &String,
    has_excel_sheet: bool,
    view_sizes: &HashMap<String, String>,
) -> Result<()> {
    let headers = dataset
        .reader()?
        .headers()?
        .iter()
        .map(|s| s.to_owned())
        .collect_vec();
    let records: Vec<HashMap<String, String>> = dataset
        .reader()?
        .records()?
        .skip(&dataset.header_rows - 1)
        .map(|row| {
            row.iter()
                .enumerate()
                .map(|(index, record)| (headers.get(index).unwrap().to_owned(), record.to_owned()))
                .collect()
        })
        .collect_vec();

    let script = fs::read_to_string(script_path)?;

    let mut templates = Tera::default();
    templates.add_raw_template(
        "html.html.tera",
        include_str!("../../../templates/html.html.tera"),
    )?;
    let mut context = Context::new();

    let local: DateTime<Local> = Local::now();

    context.insert("data", &json!(records).to_string());
    context.insert("script", &script);
    context.insert("aux_libraries", &aux_libraries);
    context.insert("description", &item_spec.description);
    context.insert("has_excel_sheet", &has_excel_sheet);
    context.insert(
        "tables",
        &tables
            .iter()
            .filter(|t| !views.get(*t).unwrap().hidden)
            .filter(|t| {
                if let Some(default_view) = default_view {
                    t != &default_view
                } else {
                    true
                }
            })
            .collect_vec(),
    );
    context.insert("view_sizes", &view_sizes);
    context.insert("default_view", default_view);
    context.insert("report_name", report_name);
    context.insert("name", name);
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));

    let file_path =
        Path::new(output_path.as_ref()).join(Path::new("index_1").with_extension("html"));

    let html = templates.render("html.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
/// Renders a plot page from given render-plot spec
fn render_img_page<P: AsRef<Path>>(
    output_path: P,
    tables: &[String],
    name: &str,
    item_spec: &ItemSpecs,
    views: &HashMap<String, ItemSpecs>,
    default_view: &Option<String>,
    img_path: String,
    report_name: &String,
    view_sizes: &HashMap<String, String>,
) -> Result<()> {
    let img_file = Path::new(&img_path);
    let img_file_name = img_file.file_name().unwrap();
    let img_file_path = Path::new(output_path.as_ref()).join(img_file_name);
    fs::copy(img_file, &img_file_path)?;

    let mut templates = Tera::default();
    templates.add_raw_template(
        "img.html.tera",
        include_str!("../../../templates/img.html.tera"),
    )?;
    let mut context = Context::new();

    let local: DateTime<Local> = Local::now();

    context.insert("description", &item_spec.description);
    context.insert("img", &img_file_name.to_str().unwrap());
    context.insert(
        "tables",
        &tables
            .iter()
            .filter(|t| !views.get(*t).unwrap().hidden)
            .filter(|t| {
                if let Some(default_view) = default_view {
                    t != &default_view
                } else {
                    true
                }
            })
            .collect_vec(),
    );
    context.insert("view_sizes", &view_sizes);
    context.insert("default_view", default_view);
    context.insert("report_name", report_name);
    context.insert("name", name);
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));

    let file_path =
        Path::new(output_path.as_ref()).join(Path::new("index_1").with_extension("html"));

    let img = templates.render("img.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(img.as_bytes())?;

    Ok(())
}

/// Renders a plot page from given render-plot spec containing multiple datasets
fn render_plot_page_with_multiple_datasets<P: AsRef<Path>>(
    output_path: P,
    tables: &[String],
    name: &str,
    item_spec: &ItemSpecs,
    datasets: HashMap<String, &DatasetSpecs>,
    views: &HashMap<String, ItemSpecs>,
    default_view: &Option<String>,
) -> Result<()> {
    let mut data = HashMap::new();

    for (name, dataset) in datasets {
        let mut reader = dataset.reader()?;

        let headers = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();
        let records: Vec<HashMap<String, String>> = reader
            .records()?
            .skip(&dataset.header_rows - 1)
            .map(|row| {
                row.iter()
                    .enumerate()
                    .map(|(index, record)| {
                        (headers.get(index).unwrap().to_owned(), record.to_owned())
                    })
                    .collect()
            })
            .collect_vec();

        data.insert(name.to_string(), records);
    }

    let mut render_plot_specs = item_spec.render_plot.clone().unwrap();
    render_plot_specs.read_schema()?;
    let mut templates = Tera::default();
    templates.add_raw_template(
        "plot.html.tera",
        include_str!("../../../templates/plot.html.tera"),
    )?;
    let mut context = Context::new();

    let local: DateTime<Local> = Local::now();

    let compressed_data = compress(json!(data))?;

    context.insert("datasets", &json!(compressed_data).to_string());
    context.insert("description", &item_spec.description);
    context.insert(
        "tables",
        &tables
            .iter()
            .filter(|t| !views.get(*t).unwrap().hidden)
            .filter(|t| {
                if let Some(default_view) = default_view {
                    t != &default_view
                } else {
                    true
                }
            })
            .collect_vec(),
    );
    context.insert("default_view", default_view);
    context.insert("name", name);
    context.insert("specs", &render_plot_specs.schema.as_ref().unwrap());
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));

    let file_path =
        Path::new(output_path.as_ref()).join(Path::new("index_1").with_extension("html"));

    let html = templates.render("plot.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;

    Ok(())
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct Linkout {
    name: String,
    url: String,
}

/// Renders the additional column with buttons for tables that contains the linkouts
fn render_link_column(
    row: &[String],
    linked_tables: &LinkedTable,
    titles: &[String],
    links: &HashMap<String, LinkSpec>,
    dataset_name: &str,
) -> Result<String> {
    let linkouts = render_linkouts(row, linked_tables, titles, links, dataset_name)?;

    let mut templates = Tera::default();
    templates.add_raw_template(
        "linkout_button.html.tera",
        include_str!("../../../templates/linkout_button.html.tera"),
    )?;
    let mut context = Context::new();
    context.insert("links", &linkouts);

    Ok(templates.render("linkout_button.html.tera", &context)?)
}

/// Formats linkouts from given links config
fn render_linkouts(
    row: &[String],
    linked_tables: &LinkedTable,
    titles: &[String],
    links: &HashMap<String, LinkSpec>,
    dataset_name: &str,
) -> Result<Vec<Linkout>> {
    let mut linkouts = Vec::new();
    for (name, link_specs) in links {
        let index = titles.iter().position(|t| t == &link_specs.column).unwrap();
        if let Some(table) = &link_specs.view {
            let val = table.replace("{value}", &row[index]);
            linkouts.push(Linkout {
                name: name.to_string(),
                url: format!("../{val}/index_1.html"),
            })
        } else if let Some(table_row) = &link_specs.table_row {
            let (table, linked_column) = table_row.split_once('/').unwrap();
            let linked_values = linked_tables
                .get(&(table.to_string(), linked_column.to_string()))
                .unwrap();
            let linked_value = match linked_values.index.get(&row[index]) {
                Some(value) => value,
                None => {
                    if !link_specs.optional {
                        bail!(TableLinkingError::NotFound {
                            not_found: row[index].to_string(),
                            column: linked_column.to_string(),
                            table: table.to_string(),
                            link_definition: name.to_string(),
                            dataset_name: dataset_name.to_string()
                        })
                    } else {
                        continue;
                    }
                }
            };
            linkouts.push(Linkout {
                name: name.to_string(),
                url: format!(
                    "../{}/index_{}.html?highlight={}",
                    table,
                    linked_value.page + 1,
                    linked_value.row,
                ),
            });
        } else {
            unreachable!()
        }
    }
    Ok(linkouts)
}

/// Coverts all given csv files to a single xlxs file with one worksheet per csv file
fn render_excel_sheet<P: AsRef<Path>>(specs: &ItemsSpec, output_path: P) -> Result<()> {
    let mut wb = simple_excel_writer::Workbook::create(
        output_path
            .as_ref()
            .join("data")
            .with_extension("xlsx")
            .to_str()
            .unwrap(),
    );

    for (view, spec) in &specs.views {
        let export = if let Some(dataset) = &spec.dataset {
            specs.datasets.get(dataset).unwrap().offer_excel
        } else {
            false
        };
        if spec.render_plot.is_none() && spec.render_html.is_none() && export {
            let dataset = specs.datasets.get(spec.dataset.as_ref().unwrap()).unwrap();
            let mut rdr = dataset.reader()?;

            let mut sheet = wb.create_sheet(view);

            wb.write_sheet(&mut sheet, |sw| {
                for result in rdr.records().unwrap() {
                    let mut row = simple_excel_writer::Row::new();
                    for field in result.iter() {
                        row.add_cell(field.to_string());
                    }
                    sw.append_row(row)?;
                }
                Ok(())
            })?;
        }
    }

    wb.close()?;
    Ok(())
}

#[derive(Error, Debug)]
pub enum TableLinkingError {
    #[error("Could not find {not_found:?} in column {column:?} of table {table:?} when calculating link definition {link_definition:?} of dataset {dataset_name:?}.")]
    NotFound {
        not_found: String,
        column: String,
        table: String,
        link_definition: String,
        dataset_name: String,
    },
}

#[derive(Error, Debug)]
pub enum ColumnError {
    #[error("Could not find column {column:?} in dataset with path {path:?}. If this is intentional try to use optional: true.")]
    NotFound { column: String, path: String },
}

#[derive(Error, Debug)]
pub enum DatasetError {
    #[error("Could not find dataset {dataset_name:?}.")]
    NotFound { dataset_name: String },
}

#[derive(Error, Debug)]
pub enum SpecError {
    #[error("Could not parse specs of plot for {column:?} in view {view:?}. Please make sure your specs contain valid JSON.")]
    CouldNotParse { column: String, view: String },
}

#[cfg(test)]
mod tests {
    use crate::render::portable::{render_tick_plot, JavascriptFunction};
    use crate::spec::{Color, ColorDefinition, ColorRange, DatasetSpecs, ScaleType, TickPlot};
    use std::path::PathBuf;

    #[test]
    fn test_javascript_function_body_parsing() {
        let function = JavascriptFunction(String::from("function (value) { return value; }"));
        assert_eq!(function.body().trim(), "return value;")
    }

    #[test]
    fn test_javascript_function_arg_parsing() {
        let function = JavascriptFunction(String::from("function (value, row) { return value; }"));
        assert_eq!(function.args(), "value, row")
    }

    #[test]
    fn test_javascript_function_name() {
        let f = r#"
        function(value, row) {
            let custom_value = 'This is a custom function';
            if (value.length === 0) {
              return ``
            }
            const len = value.split(',').length;
            return `<span data-toggle="popover" data-content="${{custom_value}}">${len}</span>`;
        }
        "#;
        let function = JavascriptFunction(f.to_string());
        assert_eq!(
            function.name(),
            "custom_func_51101d9f2c9ec9e08100de43d906d9ab"
        );
    }

    #[test]
    fn test_render_tick_plot() {
        let tick_plot_spec = TickPlot {
            scale_type: ScaleType::Linear,
            domain: Some(vec![-350855931678.0, 760134568300.0]),
            aux_domain_columns: Default::default(),
            color: None,
        };

        let dataset = DatasetSpecs {
            path: PathBuf::from("tests/data/uniform_datatypes.csv"),
            separator: ',',
            header_rows: 1,
            offer_excel: false,
            links: None,
        };

        let tick_plot = render_tick_plot("price", &dataset, &tick_plot_spec, 2);
        assert!(tick_plot.is_ok());
        assert!(serde_json::from_str::<serde_json::Value>(&tick_plot.unwrap()).is_ok());
    }

    #[test]
    fn test_render_tick_plot_with_color_definition() {
        let tick_plot_spec = TickPlot {
            scale_type: ScaleType::Linear,
            domain: Some(vec![-350855931678.0, 760134568300.0]),
            aux_domain_columns: Default::default(),
            color: Some(ColorDefinition {
                scale_type: ScaleType::Linear,
                color_range: ColorRange(
                    [Color("#ebedf0".to_string()), Color("#9be9a8".to_string())].to_vec(),
                ),
                domain: Some(vec![
                    "-350855931678.0".to_string(),
                    "760134568300.0".to_string(),
                ]),
                domain_mid: None,
            }),
        };

        let dataset = DatasetSpecs {
            path: PathBuf::from("tests/data/uniform_datatypes.csv"),
            separator: ',',
            header_rows: 1,
            offer_excel: false,
            links: None,
        };

        let tick_plot = render_tick_plot("price", &dataset, &tick_plot_spec, 2);
        assert!(tick_plot.is_ok());
        assert!(serde_json::from_str::<serde_json::Value>(&tick_plot.unwrap()).is_ok());
    }

    #[test]
    fn test_render_bar_plot() {
        let bar_plot_spec = TickPlot {
            scale_type: ScaleType::Linear,
            domain: Some(vec![-350855931678.0, 760134568300.0]),
            aux_domain_columns: Default::default(),
            color: None,
        };

        let dataset = DatasetSpecs {
            path: PathBuf::from("tests/data/uniform_datatypes.csv"),
            separator: ',',
            header_rows: 1,
            offer_excel: false,
            links: None,
        };

        let bar_plot = render_tick_plot("price", &dataset, &bar_plot_spec, 2);
        assert!(bar_plot.is_ok());
        assert!(serde_json::from_str::<serde_json::Value>(&bar_plot.unwrap()).is_ok());
    }

    #[test]
    fn test_render_bar_plot_with_color_definition() {
        let bar_plot_spec = TickPlot {
            scale_type: ScaleType::Linear,
            domain: Some(vec![-350855931678.0, 760134568300.0]),
            aux_domain_columns: Default::default(),
            color: Some(ColorDefinition {
                scale_type: ScaleType::Linear,
                color_range: ColorRange(
                    [Color("#ebedf0".to_string()), Color("#9be9a8".to_string())].to_vec(),
                ),
                domain: Some(vec![
                    "-350855931678.0".to_string(),
                    "760134568300.0".to_string(),
                ]),
                domain_mid: None,
            }),
        };

        let dataset = DatasetSpecs {
            path: PathBuf::from("tests/data/uniform_datatypes.csv"),
            separator: ',',
            header_rows: 1,
            offer_excel: false,
            links: None,
        };

        let bar_plot = render_tick_plot("price", &dataset, &bar_plot_spec, 2);
        assert!(bar_plot.is_ok());
        assert!(serde_json::from_str::<serde_json::Value>(&bar_plot.unwrap()).is_ok());
    }
}

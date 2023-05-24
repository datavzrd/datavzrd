mod plot;
pub(crate) mod utils;

use crate::render::portable::plot::get_min_max;
use crate::render::portable::plot::render_plots;
use crate::render::portable::utils::get_column_labels;
use crate::render::portable::utils::minify_js;
use crate::render::Renderer;
use crate::spec::LinkToUrlSpec;
use crate::spec::{
    BarPlot, DatasetSpecs, DisplayMode, HeaderSpecs, Heatmap, ItemSpecs, ItemsSpec, LinkSpec,
    RenderColumnSpec, ScaleType, TickPlot,
};
use crate::utils::column_index::ColumnIndex;
use crate::utils::column_position;
use crate::utils::column_type::IsNa;
use crate::utils::column_type::{classify_table, ColumnType};
use crate::utils::row_address::RowAddressFactory;
use anyhow::Result;
use anyhow::{bail, Context as AnyhowContext};
use chrono::{DateTime, Local};
use csv::{Reader, StringRecord};
use itertools::Itertools;
use lz_str::compress_to_utf16;
use serde::Serialize;
use serde_json::{json, Value};
use std::cmp::max;
use std::collections::{HashMap, HashSet};

use std::fs;
use std::fs::File;
use std::io::Write;
use std::option::Option::Some;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use tera::{Context, Tera};
use thiserror::Error;
use typed_builder::TypedBuilder;

#[derive(TypedBuilder, Debug)]
pub(crate) struct ItemRenderer {
    specs: ItemsSpec,
}

type LinkedTable = HashMap<(String, String), ColumnIndex>;

impl Renderer for ItemRenderer {
    /// Render all items of user config
    fn render_tables<P>(&self, path: P, webview_host: String, debug: bool) -> Result<()>
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
                        .size(),
                )
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
            let dataset = match self.specs.datasets.get(table.dataset.as_ref().unwrap()) {
                Some(dataset) => dataset,
                None => {
                    bail!(DatasetError::NotFound {
                        dataset_name: table.dataset.as_ref().unwrap().clone()
                    })
                }
            };

            let generate_reader = || -> csv::Result<Reader<File>> {
                csv::ReaderBuilder::new()
                    .delimiter(dataset.separator as u8)
                    .from_path(&dataset.path)
            };

            let mut counter_reader = generate_reader()
                .context(format!("Could not read file with path {:?}", &dataset.path))?;
            let records_length = counter_reader.records().count() - (dataset.header_rows - 1);
            if records_length > 0 {
                let linked_tables = get_linked_tables(name, &self.specs)?;
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
                }
                // Render table
                else if let Some(table_specs) = &table.render_table {
                    let row_address_factory = RowAddressFactory::new(table.page_size);
                    let pages = row_address_factory
                        .get(records_length - dataset.header_rows)
                        .page
                        + 1;

                    let is_single_page = if let Some(max_rows) = table.max_in_memory_rows {
                        records_length <= max_rows
                    } else {
                        records_length <= self.specs.max_in_memory_rows
                    };

                    let mut reader = generate_reader()
                        .context(format!("Could not read file with path {:?}", &dataset.path))?;
                    let headers = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();

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
                        let mut additional_header_reader = generate_reader().context(format!(
                            "Could not read file with path {:?}",
                            &dataset.path
                        ))?;
                        Some(
                            additional_header_reader
                                .records()
                                .take(dataset.header_rows - 1)
                                .map(|r| r.unwrap())
                                .collect_vec(),
                        )
                    } else {
                        None
                    };

                    for (page, grouped_records) in &reader
                        .records()
                        .skip(dataset.header_rows - 1)
                        .enumerate()
                        .group_by(|(i, _)| row_address_factory.get(*i).page)
                    {
                        let records = grouped_records.collect_vec();
                        render_page(
                            &out_path,
                            page + 1,
                            pages,
                            records
                                .iter()
                                .map(|(_, records)| records.as_ref().unwrap())
                                .collect_vec(),
                            &headers,
                            &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                            name,
                            table.description.as_deref(),
                            &linked_tables,
                            dataset.links.as_ref().unwrap(),
                            &self.specs.report_name,
                            &self.specs.views,
                            &self.specs.default_view,
                            is_single_page,
                            self.specs.needs_excel_sheet(),
                            &webview_host,
                            &view_sizes,
                        )?;
                    }
                    if is_single_page {
                        render_table_heatmap(
                            &out_path,
                            &dataset.path,
                            dataset.separator,
                            table_specs,
                            &headers,
                            dataset.header_rows,
                        )?;
                    } else {
                        render_search_dialogs(
                            &out_path,
                            &headers,
                            &dataset.path,
                            dataset.separator,
                            table.page_size,
                            dataset.header_rows,
                        )?;
                    }
                    render_table_javascript(
                        &out_path,
                        &headers,
                        &dataset.path,
                        dataset.separator,
                        table_specs,
                        additional_headers,
                        &table.render_table.as_ref().unwrap().headers,
                        is_single_page,
                        table.single_page_page_size,
                        &webview_host,
                        self.specs.webview_controls,
                        debug,
                    )?;
                    render_custom_javascript_functions(&out_path, table_specs, debug)?;
                    render_plots(
                        &out_path,
                        &dataset.path,
                        dataset.separator,
                        dataset.header_rows,
                        debug,
                    )?;
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
    pages: usize,
    data: Vec<&StringRecord>,
    titles: &[String],
    tables: &[String],
    name: &str,
    description: Option<&str>,
    linked_tables: &LinkedTable,
    links: &HashMap<String, LinkSpec>,
    report_name: &str,
    views: &HashMap<String, ItemSpecs>,
    default_view: &Option<String>,
    is_single_page: bool,
    has_excel_sheet: bool,
    webview_host: &String,
    view_sizes: &HashMap<String, usize>,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "table.html.tera",
        include_str!("../../../templates/table.html.tera"),
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
        Some(compress_to_utf16(&json!(linkouts).to_string()))
    } else {
        None
    };

    let compressed_data = compress_to_utf16(&json!(data).to_string());

    let local: DateTime<Local> = Local::now();

    context.insert("data", &json!(compressed_data).to_string());
    context.insert("linkouts", &json!(compressed_linkouts).to_string());
    context.insert("titles", &titles.iter().collect_vec());
    context.insert("current_page", &page_index);
    context.insert("pages", &pages);
    context.insert("view_sizes", &view_sizes);
    context.insert("description", &description);
    context.insert("is_single_page", &is_single_page);
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
    context.insert("default_view", default_view);
    context.insert("name", name);
    context.insert("report_name", report_name);
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));
    context.insert("webview_host", &webview_host);

    let file_path = Path::new(output_path.as_ref())
        .join(Path::new(&format!("index_{page_index}")).with_extension("html"));

    let html = templates.render("table.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;

    Ok(())
}

fn render_table_heatmap<P: AsRef<Path>>(
    output_path: P,
    csv_path: &Path,
    separator: char,
    render_columns: &HashMap<String, RenderColumnSpec>,
    titles: &[String],
    header_rows: usize,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "table_heatmap.js.tera",
        include_str!("../../../templates/table_heatmap.js.tera"),
    )?;
    let mut context = Context::new();

    let hidden_columns: HashSet<_> = render_columns
        .iter()
        .filter(|(_, v)| v.display_mode == DisplayMode::Hidden)
        .map(|(k, _)| k)
        .collect();

    let columns = titles
        .iter()
        .filter(|t| !hidden_columns.contains(t))
        .collect_vec();

    let labels = get_column_labels(render_columns);

    let table_classes = classify_table(csv_path, separator, header_rows)?;
    let column_types: HashMap<_, _> = table_classes
        .iter()
        .map(|(t, c)| match c {
            ColumnType::None | ColumnType::String => (t, "nominal"),
            ColumnType::Float | ColumnType::Integer => (t, "quantitative"),
        })
        .collect();
    let marks: HashMap<_, _> = titles
        .iter()
        .map(|title| {
            if let Some(rc) = render_columns.get(&title.to_string()) {
                if let Some(plot) = &rc.plot {
                    if plot.bar_plot.is_some() {
                        (title, "bar")
                    } else {
                        (title, "rect")
                    }
                } else {
                    (title, "text")
                }
            } else {
                (title, "text")
            }
        })
        .collect();

    let tick_domains: HashMap<_, _> = render_columns
        .iter()
        .filter(|(_, r)| r.plot.is_some())
        .map(|(t, rc)| (t, rc.plot.as_ref().unwrap()))
        .filter(|(_, p)| p.tick_plot.is_some())
        .map(|(t, p)| (t, p.tick_plot.as_ref().unwrap()))
        .filter(|(_, h)| h.domain.is_some() || h.aux_domain_columns.0.is_some())
        .map(|(t, h)| {
            let domain = if let Some(domain) = h.domain.as_ref() {
                domain.clone()
            } else {
                let mut aux_domains = h.aux_domain_columns.0.as_ref().unwrap().to_vec();
                aux_domains.push(t.to_string());
                let d = get_min_max_multiple_columns(
                    csv_path,
                    separator,
                    header_rows,
                    aux_domains,
                    None,
                )
                .unwrap();
                vec![d.0, d.1]
            };
            (t, domain)
        })
        .collect();

    let heatmap_domains: HashMap<_, _> = render_columns
        .iter()
        .filter(|(_, r)| r.plot.is_some())
        .map(|(t, rc)| (t, rc.plot.as_ref().unwrap()))
        .filter(|(_, p)| p.heatmap.is_some())
        .map(|(t, p)| (t, p.heatmap.as_ref().unwrap()))
        .filter(|(_, h)| h.domain.is_some() || h.aux_domain_columns.0.is_some())
        .map(|(t, h)| {
            (
                t,
                get_column_domain(t, csv_path, separator, header_rows, h).unwrap(),
            )
        })
        .collect();

    let scales: HashMap<_, _> = render_columns
        .iter()
        .filter(|(_, r)| r.plot.is_some())
        .map(|(t, rc)| (t, rc.plot.as_ref().unwrap()))
        .map(|(t, p)| {
            if let Some(heatmap) = &p.heatmap {
                (t, heatmap.scale_type)
            } else if let Some(ticks) = &p.tick_plot {
                (t, ticks.scale_type)
            } else {
                (t, ScaleType::None)
            }
        })
        .filter(|(_, s)| s != &ScaleType::None)
        .collect();

    let ranges: HashMap<_, _> = render_columns
        .iter()
        .filter(|(_, r)| r.plot.is_some())
        .map(|(t, rc)| (t, rc.plot.as_ref().unwrap()))
        .filter(|(_, p)| p.heatmap.is_some())
        .map(|(t, p)| {
            let heatmap = p.heatmap.as_ref().unwrap();
            (t, &heatmap.color_range)
        })
        .collect();

    let schemes: HashMap<_, _> = render_columns
        .iter()
        .filter(|(_, r)| r.plot.is_some())
        .map(|(t, rc)| (t, rc.plot.as_ref().unwrap()))
        .filter(|(_, p)| p.heatmap.is_some())
        .map(|(t, p)| {
            let heatmap = p.heatmap.as_ref().unwrap();
            (t, &heatmap.color_scheme)
        })
        .filter(|(_, s)| !s.is_empty())
        .collect();

    let clamps: HashMap<_, _> = render_columns
        .iter()
        .filter(|(_, r)| r.plot.is_some())
        .map(|(t, rc)| (t, rc.plot.as_ref().unwrap()))
        .filter(|(_, p)| p.heatmap.is_some())
        .map(|(t, p)| (t, &p.heatmap.as_ref().unwrap().clamp))
        .collect();

    let remove_legend: HashMap<_, _> = titles
        .iter()
        .tuple_windows()
        .map(|(t1, t2)| {
            match (
                tick_domains.get(t1),
                tick_domains.get(t2),
                heatmap_domains.get(t1),
                heatmap_domains.get(t2),
            ) {
                (Some(d1), Some(d2), _, _) => (t1, d1 == d2),
                (_, _, Some(d1), Some(d2)) => (t1, d1 == d2),
                _ => (t1, false),
            }
        })
        .collect();

    let plot_legends: HashMap<_, _> = render_columns
        .iter()
        .map(|(t, rc)| (t, rc.plot_view_legend))
        .collect();

    let column_widths: HashMap<_, _> = marks
        .iter()
        .filter(|(_, m)| *m != &"text")
        .map(|(t, _)| {
            (
                t,
                max(
                    20,
                    6 * get_column_width(t, csv_path, separator, header_rows).unwrap(),
                ),
            )
        })
        .collect();

    context.insert("remove_legend", &remove_legend);
    context.insert("column_widths", &column_widths);
    context.insert("plot_legends", &plot_legends);
    context.insert("tick_domains", &tick_domains);
    context.insert("heatmap_domains", &heatmap_domains);
    context.insert("ranges", &ranges);
    context.insert("schemes", &schemes);
    context.insert("scales", &scales);
    context.insert("clamps", &clamps);
    context.insert("columns", &columns);
    context.insert("types", &column_types);
    context.insert("marks", &marks);
    context.insert("labels", &labels);

    let js = templates.render("table_heatmap.js.tera", &context)?;

    let file_path = Path::new(output_path.as_ref()).join(Path::new("heatmap").with_extension("js"));

    let mut file = File::create(file_path)?;
    file.write_all(js.as_bytes())?;

    Ok(())
}

fn get_column_width(
    column: &str,
    csv_path: &Path,
    separator: char,
    header_rows: usize,
) -> Result<i32> {
    let mut reader = csv::ReaderBuilder::new()
        .delimiter(separator as u8)
        .from_path(csv_path)
        .context(format!("Could not read file with path {csv_path:?}"))?;

    let column_index = reader.headers().map(|s| {
        s.iter()
            .position(|t| t == column)
            .context(ColumnError::NotFound {
                column: column.to_string(),
                path: csv_path.to_str().unwrap().to_string(),
            })
            .unwrap()
    })?;

    let width = reader
        .records()
        .skip(header_rows - 1)
        .map(|row| row.unwrap())
        .map(|row| row.get(column_index).unwrap().to_string())
        .map(|s| s.len())
        .max()
        .unwrap_or(0);

    Ok(width as i32)
}

#[allow(clippy::too_many_arguments)]
/// Render javascript files for each table containing formatters
fn render_table_javascript<P: AsRef<Path>>(
    output_path: P,
    titles: &[String],
    csv_path: &Path,
    separator: char,
    render_columns: &HashMap<String, RenderColumnSpec>,
    additional_headers: Option<Vec<StringRecord>>,
    header_specs: &Option<HashMap<u32, HeaderSpecs>>,
    is_single_page: bool,
    page_size: usize,
    webview_host: &String,
    webview_controls: bool,
    debug: bool,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "config.js.tera",
        include_str!("../../../templates/config.js.tera"),
    )?;
    let mut context = Context::new();

    let header_row_length = additional_headers.clone().unwrap_or_default().len() + 1;

    let config = JavascriptConfig::from_column_config(
        render_columns,
        is_single_page,
        page_size,
        titles,
        webview_host,
        webview_controls,
        csv_path,
        separator,
        header_row_length,
        header_specs,
    );

    let custom_plot_config = CustomPlotsConfig::from_column_config(render_columns);
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
    fn from_column_config(config: &HashMap<String, RenderColumnSpec>) -> Self {
        CustomPlotsConfig(
            config
                .iter()
                .filter(|(_, k)| k.custom_plot.is_some())
                .map(|(k, v)| {
                    let mut custom_plot = v.custom_plot.as_ref().unwrap().to_owned();
                    custom_plot.read_schema().unwrap();
                    CustomPlotConfig {
                        title: k.to_string(),
                        specs: serde_json::Value::from_str(&custom_plot.schema.unwrap()).unwrap(),
                        data_function: JavascriptFunction(custom_plot.plot_data).name(),
                        vega_controls: custom_plot.vega_controls,
                    }
                })
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
        additional_headers: Option<Vec<StringRecord>>,
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
}

impl JavascriptConfig {
    #[allow(clippy::too_many_arguments)]
    fn from_column_config(
        config: &HashMap<String, RenderColumnSpec>,
        is_single_page: bool,
        page_size: usize,
        columns: &[String],
        webview_host: &String,
        webview_controls: bool,
        csv_path: &Path,
        separator: char,
        header_row_length: usize,
        header_specs: &Option<HashMap<u32, HeaderSpecs>>,
    ) -> Self {
        let column_classification = classify_table(csv_path, separator, header_row_length).unwrap();
        let header_label_length = if let Some(headers) = header_specs {
            headers.iter().filter(|(_, v)| v.label.is_some()).count()
        } else {
            0
        };
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
            columns: columns.iter().map(|c| c.to_string()).collect(),
            displayed_columns: columns
                .iter()
                .map(|c| c.to_string())
                .filter(|c| config.get(c).unwrap().display_mode == DisplayMode::Normal)
                .collect(),
            hidden_columns: columns
                .iter()
                .map(|c| c.to_string())
                .filter(|c| config.get(c).unwrap().display_mode == DisplayMode::Hidden)
                .collect(),
            displayed_numeric_columns: classify_table(csv_path, separator, header_row_length)
                .unwrap()
                .iter()
                .map(|(k, v)| (k.to_owned(), v.is_numeric()))
                .filter(|(_, v)| *v)
                .map(|(k, _)| k)
                .collect(),
            tick_titles: config
                .iter()
                .filter(|(_, k)| k.plot.is_some())
                .filter(|(_, k)| k.plot.as_ref().unwrap().tick_plot.is_some())
                .map(|(k, _)| k.to_string())
                .collect(),
            bar_titles: config
                .iter()
                .filter(|(_, k)| k.plot.is_some())
                .filter(|(_, k)| k.plot.as_ref().unwrap().bar_plot.is_some())
                .map(|(k, _)| k.to_string())
                .collect(),
            heatmap_titles: config
                .iter()
                .filter(|(_, k)| k.plot.is_some())
                .filter(|(_, k)| k.plot.as_ref().unwrap().heatmap.is_some())
                .map(|(k, _)| k.to_string())
                .collect(),
            custom_plot_titles: config
                .iter()
                .filter(|(_, k)| k.custom_plot.is_some())
                .map(|(k, _)| k.to_string())
                .collect(),
            links: config
                .iter()
                .filter(|(_, v)| v.link_to_url.is_some())
                .map(|(k, _)| k.to_string())
                .collect(),
            column_config: config
                .iter()
                .map(|(k, v)| {
                    (
                        k.to_string(),
                        JavascriptColumnConfig::from_column_spec(
                            v,
                            column_classification.get(k).expect(&format!("bug: failed to obtain column type for column '{k}'")),
                        ),
                    )
                })
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
                            csv_path,
                            separator,
                            header_row_length,
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
                            csv_path,
                            separator,
                            header_row_length,
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
                            csv_path,
                            separator,
                            header_row_length,
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
                    links: v.link_to_url.as_ref().unwrap().iter().map(|(link_name, link_spec)| JavascriptLink {
                        name: link_name.to_string(),
                        link: link_spec.to_owned(),
                    }).collect(),
                })
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
        }
    }
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
        Self {
            title: title.clone(),
            slug_title: slug::slugify(&title),
            heatmap: heatmap.to_owned(),
            domain: serde_json::from_str(&domain).unwrap(),
        }
    }
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptLinkConfig {
    title: String,
    links: Vec<JavascriptLink>,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct JavascriptLink {
    name: String,
    link: LinkToUrlSpec,
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

    fn to_javascript_function(&self) -> String {
        format!(
            "function {}({}",
            &self.name(),
            &self.0.split_once('(').unwrap().1
        )
    }
}

/// Render javascript functions into functions.js file per view
fn render_custom_javascript_functions<P: AsRef<Path>>(
    output_path: P,
    render_columns: &HashMap<String, RenderColumnSpec>,
    debug: bool,
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
        .map(|(_, v)| {
            JavascriptFunction(v.custom.as_ref().unwrap().to_owned()).to_javascript_function()
        })
        .chain(
            render_columns
                .iter()
                .filter(|(_, k)| k.custom_plot.is_some())
                .map(|(_, v)| {
                    JavascriptFunction(v.custom_plot.as_ref().unwrap().plot_data.to_owned())
                        .to_javascript_function()
                }),
        )
        .collect_vec();

    context.insert("functions", &functions);

    let file_path =
        Path::new(output_path.as_ref()).join(Path::new("functions").with_extension("js"));

    let js = templates.render("functions.js.tera", &context)?;

    let mut file = File::create(file_path)?;
    let minified = minify_js(&js, debug)?;
    file.write_all(&minified)?;

    Ok(())
}

/// Renders an empty page when datasets are empty
fn render_empty_dataset<P: AsRef<Path>>(
    output_path: P,
    name: &str,
    report_name: &str,
    tables: &[String],
    has_excel_sheet: bool,
    view_sizes: &HashMap<String, usize>,
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
    csv_path: &Path,
    separator: char,
    page_size: usize,
    header_rows: usize,
) -> Result<()> {
    let output_path = Path::new(path.as_ref()).join("search");
    fs::create_dir(&output_path)?;
    for (column, title) in titles.iter().enumerate() {
        let mut reader = csv::ReaderBuilder::new()
            .delimiter(separator as u8)
            .from_path(csv_path)
            .context(format!("Could not read file with path {csv_path:?}"))?;

        let row_address_factory = RowAddressFactory::new(page_size);

        let records = &reader
            .records()
            .skip(header_rows - 1)
            .map(|row| row.unwrap())
            .map(|row| row.get(column).unwrap().to_string())
            .enumerate()
            .map(|(i, row)| (row, row_address_factory.get(i)))
            .map(|(row, address)| (row, address.page + 1, address.row))
            .collect_vec();

        let mut templates = Tera::default();
        templates.add_raw_template(
            "search_dialog.html.tera",
            include_str!("../../../templates/search_dialog.html.tera"),
        )?;
        let mut context = Context::new();
        context.insert("records", &records);
        context.insert("title", &title);

        let file_path = Path::new(&output_path)
            .join(Path::new(&format!("column_{column}")).with_extension("html"));

        let html = templates.render("search_dialog.html.tera", &context)?;

        let mut file = fs::File::create(file_path)?;
        file.write_all(html.as_bytes())?;
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

        let column_index = ColumnIndex::new(
            &other_dataset.path,
            other_dataset.separator,
            column,
            page_size,
            other_dataset.header_rows,
        )?;

        result.insert((table.to_string(), column.to_string()), column_index);
    }
    Ok(result)
}

/// Renders tick plots for given csv column
fn render_tick_plot(
    title: &str,
    csv_path: &Path,
    separator: char,
    header_rows: usize,
    tick_plot: &TickPlot,
    precision: u32,
) -> Result<String> {
    let mut reader = csv::ReaderBuilder::new()
        .delimiter(separator as u8)
        .from_path(csv_path)
        .context(format!("Could not read file with path {csv_path:?}"))?;

    let column_index = reader.headers().map(|s| {
        s.iter()
            .position(|t| t == title)
            .context(ColumnError::NotFound {
                column: title.to_string(),
                path: csv_path.to_str().unwrap().to_string(),
            })
            .unwrap()
    })?;

    let (min, max) = if let Some(domain) = &tick_plot.domain {
        (domain[0], domain[1])
    } else if let Some(aux_domain_columns) = &tick_plot.aux_domain_columns.0 {
        let columns = aux_domain_columns
            .iter()
            .map(|s| s.to_string())
            .chain(vec![title.to_string()].into_iter())
            .collect();
        get_min_max_multiple_columns(csv_path, separator, header_rows, columns, Some(precision))?
    } else {
        get_min_max(
            csv_path,
            separator,
            column_index,
            header_rows,
            Some(precision),
        )?
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

    Ok(templates.render("tick_plot.vl.tera", &context)?)
}

/// Renders bar plots for given csv column
fn render_bar_plot(
    title: &str,
    csv_path: &Path,
    separator: char,
    header_rows: usize,
    bar_plot: &BarPlot,
    precision: u32,
) -> Result<String> {
    let mut reader = csv::ReaderBuilder::new()
        .delimiter(separator as u8)
        .from_path(csv_path)
        .context(format!("Could not read file with path {csv_path:?}"))?;

    let column_index = reader.headers().map(|s| {
        s.iter()
            .position(|t| t == title)
            .context(ColumnError::NotFound {
                column: title.to_string(),
                path: csv_path.to_str().unwrap().to_string(),
            })
            .unwrap()
    })?;

    let (min, max) = if let Some(domain) = &bar_plot.domain {
        (domain[0], domain[1])
    } else if let Some(aux_domain_columns) = &bar_plot.aux_domain_columns.0 {
        let columns = aux_domain_columns
            .iter()
            .map(|s| s.to_string())
            .chain(vec![title.to_string()].into_iter())
            .collect();
        get_min_max_multiple_columns(csv_path, separator, header_rows, columns, Some(precision))?
    } else {
        get_min_max(
            csv_path,
            separator,
            column_index,
            header_rows,
            Some(precision),
        )?
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

    Ok(templates.render("bar_plot.vl.tera", &context)?)
}

pub(crate) fn get_column_domain(
    title: &str,
    csv_path: &Path,
    separator: char,
    header_rows: usize,
    heatmap: &Heatmap,
) -> Result<String> {
    if let Some(domain) = &heatmap.domain {
        return Ok(json!(domain).to_string());
    }

    let mut reader = csv::ReaderBuilder::new()
        .delimiter(separator as u8)
        .from_path(csv_path)
        .context(format!("Could not read file with path {csv_path:?}"))?;

    let column_index = column_position(title, &mut reader)?;

    if !heatmap.scale_type.is_quantitative() {
        if let Some(aux_domain_columns) = &heatmap.aux_domain_columns.0 {
            let columns = aux_domain_columns
                .iter()
                .map(|s| s.to_string())
                .chain(vec![title.to_string()].into_iter())
                .collect_vec();
            let column_indexes: HashSet<_> = reader.headers().map(|s| {
                s.iter()
                    .enumerate()
                    .filter(|(_, title)| columns.contains(&title.to_string()))
                    .map(|(index, _)| index)
                    .collect()
            })?;
            Ok(json!(reader
                .records()
                .skip(header_rows - 1)
                .map(|r| r.unwrap())
                .flat_map(|r| r
                    .iter()
                    .enumerate()
                    .filter(|(index, _)| column_indexes.contains(index))
                    .filter(|(_, value)| !value.is_na())
                    .map(|(_, value)| value.to_string())
                    .collect_vec())
                .unique()
                .sorted()
                .collect_vec())
            .to_string())
        } else {
            Ok(json!(reader
                .records()
                .skip(header_rows - 1)
                .map(|r| r.unwrap())
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
            .chain(vec![title.to_string()].into_iter())
            .collect();
        Ok(json!(get_min_max_multiple_columns(
            csv_path,
            separator,
            header_rows,
            columns,
            None
        )?)
        .to_string())
    } else {
        Ok(json!(get_min_max(
            csv_path,
            separator,
            column_index,
            header_rows,
            None
        )?)
        .to_string())
    }
}

/// Returns the minimum and maximum for multiple given columns
fn get_min_max_multiple_columns(
    csv_path: &Path,
    separator: char,
    header_rows: usize,
    columns: Vec<String>,
    precision: Option<u32>,
) -> Result<(f32, f32)> {
    let mut mins = Vec::new();
    let mut maxs = Vec::new();
    for column in columns {
        let mut reader = csv::ReaderBuilder::new()
            .delimiter(separator as u8)
            .from_path(csv_path)
            .context(format!("Could not read file with path {csv_path:?}"))?;
        let column_index = column_position(&column, &mut reader)?;
        let (min, max) = get_min_max(csv_path, separator, column_index, header_rows, precision)?;
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
    view_sizes: &HashMap<String, usize>,
) -> Result<()> {
    let generate_reader = || -> csv::Result<Reader<File>> {
        csv::ReaderBuilder::new()
            .delimiter(dataset.separator as u8)
            .from_path(&dataset.path)
    };
    let mut reader =
        generate_reader().context(format!("Could not read file with path {:?}", &dataset.path))?;

    let headers = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();
    let mut records: Vec<HashMap<String, String>> = reader
        .records()
        .skip(&dataset.header_rows - 1)
        .map(|row| {
            row.unwrap()
                .iter()
                .enumerate()
                .map(|(index, record)| (headers.get(index).unwrap().to_owned(), record.to_owned()))
                .collect()
        })
        .collect_vec();

    if !links.is_empty() {
        let mut linkout_reader = generate_reader()
            .context(format!("Could not read file with path {:?}", &dataset.path))?;
        let linkouts = linkout_reader
            .records()
            .skip(&dataset.header_rows - 1)
            .map(|row| {
                render_linkouts(
                    &row.unwrap().iter().map(|s| s.to_owned()).collect_vec(),
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

    let compressed_data = compress_to_utf16(&json!(records).to_string());

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
    view_sizes: &HashMap<String, usize>,
) -> Result<()> {
    let generate_reader = || -> csv::Result<Reader<File>> {
        csv::ReaderBuilder::new()
            .delimiter(dataset.separator as u8)
            .from_path(&dataset.path)
    };
    let mut reader =
        generate_reader().context(format!("Could not read file with path {:?}", &dataset.path))?;

    let headers = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();
    let records: Vec<HashMap<String, String>> = reader
        .records()
        .skip(&dataset.header_rows - 1)
        .map(|row| {
            row.unwrap()
                .iter()
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
    let generate_reader = |separator: char, path: &PathBuf| -> csv::Result<Reader<File>> {
        csv::ReaderBuilder::new()
            .delimiter(separator as u8)
            .from_path(path)
    };

    let mut data = HashMap::new();

    for (name, dataset) in datasets {
        let mut reader = generate_reader(dataset.separator, &dataset.path)
            .context(format!("Could not read file with path {:?}", &dataset.path))?;

        let headers = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();
        let records: Vec<HashMap<String, String>> = reader
            .records()
            .skip(&dataset.header_rows - 1)
            .map(|row| {
                row.unwrap()
                    .iter()
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

    let compressed_data = compress_to_utf16(&json!(data).to_string());

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
            let mut rdr = csv::ReaderBuilder::new()
                .has_headers(false)
                .flexible(true)
                .delimiter(
                    specs
                        .datasets
                        .get(spec.dataset.as_ref().unwrap())
                        .unwrap()
                        .separator as u8,
                )
                .from_path(
                    &specs
                        .datasets
                        .get(spec.dataset.as_ref().unwrap())
                        .unwrap()
                        .path,
                )?;

            let mut sheet = wb.create_sheet(view);

            wb.write_sheet(&mut sheet, |sw| {
                for result in rdr.records() {
                    let mut row = simple_excel_writer::Row::new();
                    for field in result?.iter() {
                        row.add_cell(field);
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

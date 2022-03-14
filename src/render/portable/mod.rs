mod plot;
pub(crate) mod utils;

use crate::render::portable::plot::get_min_max;
use crate::render::portable::plot::render_plots;
use crate::render::Renderer;
use crate::spec::{
    CustomPlot, DatasetSpecs, Heatmap, ItemSpecs, ItemsSpec, LinkSpec, RenderColumnSpec, TickPlot,
};
use crate::utils::column_index::ColumnIndex;
use crate::utils::column_type::{classify_table, ColumnType};
use crate::utils::row_address::RowAddressFactory;
use anyhow::Result;
use anyhow::{bail, Context as AnyhowContext};
use chrono::{DateTime, Local};
use csv::{Reader, StringRecord};
use itertools::Itertools;
use lz_str::compress_to_utf16;
use serde::Serialize;
use serde_json::json;
use slugify::slugify;
use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::option::Option::Some;
use std::path::Path;
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
    fn render_tables<P>(&self, path: P) -> Result<()>
    where
        P: AsRef<Path>,
    {
        for (name, table) in &self.specs.views {
            let dataset = match self.specs.datasets.get(&table.dataset) {
                Some(dataset) => dataset,
                None => {
                    bail!(DatasetError::NotFound {
                        dataset_name: table.dataset.clone()
                    })
                }
            };

            let generate_reader = || -> csv::Result<Reader<File>> {
                csv::ReaderBuilder::new()
                    .delimiter(dataset.separator as u8)
                    .from_path(&dataset.path)
            };

            let out_path = Path::new(path.as_ref()).join(name);
            fs::create_dir(&out_path)?;

            let linked_tables = get_linked_tables(name, &self.specs)?;

            let mut counter_reader = generate_reader()
                .context(format!("Could not read file with path {:?}", &dataset.path))?;
            let records_length = counter_reader.records().count();
            if records_length > 0 {
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
                    )?;
                }
                // Render table
                else if let Some(table_specs) = &table.render_table {
                    let row_address_factory = RowAddressFactory::new(table.page_size);
                    let pages = row_address_factory
                        .get(records_length - dataset.header_rows)
                        .page
                        + 1;

                    let mut reader = generate_reader()
                        .context(format!("Could not read file with path {:?}", &dataset.path))?;
                    let headers = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();

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
                        .into_iter()
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
                            table_specs,
                            name,
                            table.description.as_deref(),
                            &linked_tables,
                            dataset.links.as_ref().unwrap(),
                            &self.specs.report_name,
                        )?;
                    }
                    render_table_javascript(
                        &out_path,
                        &headers,
                        &dataset.path,
                        dataset.separator,
                        table_specs,
                        additional_headers,
                        table.pin_columns,
                    )?;
                    render_plots(
                        &out_path,
                        &dataset.path,
                        dataset.separator,
                        dataset.header_rows,
                    )?;
                    render_search_dialogs(
                        &out_path,
                        &headers,
                        &dataset.path,
                        dataset.separator,
                        table.page_size,
                        dataset.header_rows,
                    )?;
                }
            } else {
                render_empty_dataset(
                    &out_path,
                    name,
                    &self.specs.report_name,
                    &self.specs.views.keys().map(|s| s.to_owned()).collect_vec(),
                )?;
            }
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
    render_columns: &HashMap<String, RenderColumnSpec>,
    name: &str,
    description: Option<&str>,
    linked_tables: &LinkedTable,
    links: &HashMap<String, LinkSpec>,
    report_name: &str,
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
            .map(|r| render_link_column(r, linked_tables, titles, links).unwrap())
            .collect_vec();
        Some(compress_to_utf16(&json!(linkouts).to_string()))
    } else {
        None
    };
    let data = data
        .iter()
        .enumerate()
        .map(|(i, r)| link_columns(render_columns, titles, r.to_vec(), i).unwrap())
        .collect_vec();
    let compressed_data = compress_to_utf16(&json!(data).to_string());

    let local: DateTime<Local> = Local::now();

    context.insert("data", &json!(compressed_data).to_string());
    context.insert("linkouts", &json!(compressed_linkouts).to_string());
    context.insert("titles", &titles.iter().collect_vec());
    context.insert("current_page", &page_index);
    context.insert("pages", &pages);
    context.insert("description", &description);
    context.insert("tables", tables);
    context.insert("name", name);
    context.insert("report_name", report_name);
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));

    let file_path = Path::new(output_path.as_ref())
        .join(Path::new(&format!("index_{}", page_index)).with_extension("html"));

    let html = templates.render("table.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;

    Ok(())
}

/// Render javascript files for each table containing formatters
fn render_table_javascript<P: AsRef<Path>>(
    output_path: P,
    titles: &[String],
    csv_path: &Path,
    separator: char,
    render_columns: &HashMap<String, RenderColumnSpec>,
    additional_headers: Option<Vec<StringRecord>>,
    pin_columns: usize,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "table.js.tera",
        include_str!("../../../templates/table.js.tera"),
    )?;
    let mut context = Context::new();

    let header_row_length = additional_headers
        .clone()
        .unwrap_or_else(|| vec![StringRecord::from(vec![""])])
        .len();

    let formatters: HashMap<String, String> = render_columns
        .iter()
        .filter(|(_, k)| k.custom.is_some())
        .map(|(k, v)| (k.to_owned(), v.custom.as_ref().unwrap().to_owned()))
        .collect();

    let numeric: HashMap<String, bool> = classify_table(csv_path, separator)?
        .iter()
        .map(|(k, v)| (k.to_owned(), *v != ColumnType::String))
        .collect();

    let custom_plots: HashMap<String, CustomPlot> = render_columns
        .iter()
        .filter(|(_, k)| k.custom_plot.is_some())
        .map(|(k, v)| (k.to_owned(), v.custom_plot.as_ref().unwrap().to_owned()))
        .collect();

    let tick_plots: HashMap<String, String> = render_columns
        .iter()
        .filter(|(_, k)| k.plot.is_some())
        .filter(|(_, k)| k.plot.as_ref().unwrap().tick_plot.is_some())
        .map(|(k, v)| {
            (
                k.to_owned(),
                render_tick_plot(
                    k,
                    csv_path,
                    separator,
                    header_row_length,
                    v.plot.as_ref().unwrap().tick_plot.as_ref().unwrap(),
                )
                .unwrap(),
            )
        })
        .collect();

    let heatmaps: HashMap<String, (&Heatmap, String)> = render_columns
        .iter()
        .filter(|(_, k)| k.plot.is_some())
        .filter(|(_, k)| k.plot.as_ref().unwrap().heatmap.is_some())
        .map(|(k, v)| {
            (
                k.to_owned(),
                (
                    v.plot.as_ref().unwrap().heatmap.as_ref().unwrap(),
                    get_column_domain(
                        k,
                        csv_path,
                        separator,
                        header_row_length,
                        v.plot.as_ref().unwrap().heatmap.as_ref().unwrap(),
                    )
                    .unwrap(),
                ),
            )
        })
        .collect();

    let header_rows = additional_headers.map(|headers| {
        headers
            .iter()
            .map(|r| {
                r.iter()
                    .enumerate()
                    .map(|(i, v)| (&titles[i], v.to_string()))
                    .collect::<HashMap<_, _>>()
            })
            .collect_vec()
    });

    context.insert("titles", &titles.iter().collect_vec());
    context.insert("additional_headers", &header_rows);
    context.insert("formatter", &Some(formatters));
    context.insert("custom_plots", &custom_plots);
    context.insert("tick_plots", &tick_plots);
    context.insert("heatmaps", &heatmaps);
    context.insert("num", &numeric);
    context.insert("pin_columns", &pin_columns);

    let file_path = Path::new(output_path.as_ref()).join(Path::new("table").with_extension("js"));

    let js = templates.render("table.js.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(js.as_bytes())?;

    Ok(())
}

/// Apply render columns specs to a single table row
fn link_columns(
    render_columns: &HashMap<String, RenderColumnSpec>,
    titles: &[String],
    column: Vec<String>,
    row: usize,
) -> Result<Vec<String>> {
    let mut result = Vec::new();
    for (i, title) in titles.iter().enumerate() {
        if let Some(render_column) = render_columns.get(title) {
            if let Some(mut link) = render_column.link_to_url.clone() {
                for (j, t) in titles.iter().enumerate() {
                    link = link.replace(&format!("{{{t}}}"), &column[j])
                }
                result.push(format!(
                    "<a href='{}' target='_blank' >{}</a>",
                    link.replace("{value}", &column[i]),
                    column[i]
                ));
            } else if render_column.custom_plot.is_some() || render_column.plot.is_some() {
                result.push(format!(
                    "<div id='{}-{}' data-value='{}'>{}</div>",
                    slugify!(title),
                    row,
                    column[i],
                    column[i]
                ));
            } else {
                result.push(column[i].to_string());
            }
        } else {
            result.push(column[i].to_string());
        }
    }
    Ok(result)
}

/// Renders an empty page when datasets are empty
fn render_empty_dataset<P: AsRef<Path>>(
    output_path: P,
    name: &str,
    report_name: &str,
    tables: &[String],
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "empty.html.tera",
        include_str!("../../../templates/empty.html.tera"),
    )?;
    let mut context = Context::new();
    let local: DateTime<Local> = Local::now();

    context.insert("tables", tables);
    context.insert("name", name);
    context.insert("report_name", report_name);
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));

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
            .context(format!("Could not read file with path {:?}", csv_path))?;

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
            .join(Path::new(&format!("column_{}", column)).with_extension("html"));

        let html = templates.render("search_dialog.html.tera", &context)?;

        let mut file = fs::File::create(file_path)?;
        file.write_all(html.as_bytes())?;
    }
    Ok(())
}

fn get_linked_tables(table: &str, specs: &ItemsSpec) -> Result<LinkedTable> {
    let table_spec = specs.views.get(table).unwrap();
    let dataset = &specs.datasets.get(&table_spec.dataset).unwrap();
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
        let other_dataset = match specs.datasets.get(&linked_table.dataset) {
            Some(dataset) => dataset,
            None => {
                bail!(DatasetError::NotFound {
                    dataset_name: table_spec.dataset.clone()
                })
            }
        };
        let page_size = specs.views.get(*table).unwrap().page_size;

        let column_index = ColumnIndex::new(
            &other_dataset.path,
            other_dataset.separator,
            column,
            page_size,
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
) -> Result<String> {
    let mut reader = csv::ReaderBuilder::new()
        .delimiter(separator as u8)
        .from_path(csv_path)
        .context(format!("Could not read file with path {:?}", csv_path))?;

    let column_index = reader
        .headers()
        .map(|s| s.iter().position(|t| t == title).unwrap())?;

    let (min, max) = if let Some(domain) = &tick_plot.domain {
        (domain[0], domain[1])
    } else {
        get_min_max(csv_path, separator, column_index, header_rows)?
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

fn get_column_domain(
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
        .context(format!("Could not read file with path {:?}", csv_path))?;

    let column_index = reader
        .headers()
        .map(|s| s.iter().position(|t| t == title).unwrap())?;

    match heatmap.scale_type.as_str() {
        "ordinal" => Ok(json!(reader
            .records()
            .map(|r| r.unwrap())
            .map(|r| r.get(column_index).unwrap().to_owned())
            .unique()
            .collect_vec())
        .to_string()),
        _ => Ok(json!(get_min_max(csv_path, separator, column_index, header_rows)?).to_string()),
    }
}

/// Renders a plot page from given render-plot spec
fn render_plot_page<P: AsRef<Path>>(
    output_path: P,
    tables: &[String],
    name: &str,
    item_spec: &ItemSpecs,
    dataset: &DatasetSpecs,
    linked_tables: &LinkedTable,
    links: &HashMap<String, LinkSpec>,
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
            .map(|row| {
                render_linkouts(
                    &row.unwrap().iter().map(|s| s.to_owned()).collect_vec(),
                    linked_tables,
                    &headers,
                    links,
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

    let mut templates = Tera::default();
    templates.add_raw_template(
        "plot.html.tera",
        include_str!("../../../templates/plot.html.tera"),
    )?;
    let mut context = Context::new();

    let local: DateTime<Local> = Local::now();

    context.insert("data", &json!(records).to_string());
    context.insert("description", &item_spec.description);
    context.insert("tables", tables);
    context.insert("name", name);
    context.insert("specs", &item_spec.render_plot.as_ref().unwrap().schema);
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
) -> Result<String> {
    let linkouts = render_linkouts(row, linked_tables, titles, links)?;

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
) -> Result<Vec<Linkout>> {
    let mut linkouts = Vec::new();
    for (name, link_specs) in links {
        let index = titles.iter().position(|t| t == &link_specs.column).unwrap();
        if let Some(table) = &link_specs.item {
            let val = table.replace("{value}", &row[index]);
            linkouts.push(Linkout {
                name: name.to_string(),
                url: format!("../{}/index_1.html", val),
            })
        } else if let Some(table_row) = &link_specs.table_row {
            let (table, linked_column) = table_row.split_once('/').unwrap();
            let linked_values = linked_tables
                .get(&(table.to_string(), linked_column.to_string()))
                .unwrap();
            let linked_value = match linked_values.index.get(&row[index]) {
                Some(value) => value,
                None => {
                    bail!(TableLinkingError::NotFound {
                        not_found: row[index].to_string(),
                        column: linked_column.to_string(),
                        table: table.to_string(),
                    })
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

#[derive(Error, Debug)]
pub enum TableLinkingError {
    #[error("Could not find {not_found:?} in column {column:?} of table {table:?}")]
    NotFound {
        not_found: String,
        column: String,
        table: String,
    },
}

#[derive(Error, Debug)]
pub enum DatasetError {
    #[error("Could not find dataset {dataset_name:?}.")]
    NotFound { dataset_name: String },
}

mod plot;
pub(crate) mod utils;

use crate::render::portable::plot::render_plots;
use crate::render::Renderer;
use crate::spec::{RenderColumnSpec, TablesSpec};
use crate::utils::column_type::{classify_table, ColumnType};
use crate::utils::row_address::RowAddressFactory;
use anyhow::Result;
use chrono::{DateTime, Local};
use csv::{Reader, StringRecord};
use itertools::Itertools;
use lz_str::compress_to_utf16;
use serde_json::json;
use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use tera::{Context, Tera};
use typed_builder::TypedBuilder;

#[derive(TypedBuilder, Debug)]
pub(crate) struct TableRenderer {
    specs: TablesSpec,
}

impl Renderer for TableRenderer {
    fn render_tables<P>(&self, path: P) -> Result<()>
    where
        P: AsRef<Path>,
    {
        for (name, table) in &self.specs.tables {
            let generate_reader = || -> csv::Result<Reader<File>> {
                csv::ReaderBuilder::new()
                    .delimiter(table.separator as u8)
                    .from_path(&table.path)
            };

            let mut counter_reader = generate_reader()?;

            let row_address_factory = RowAddressFactory::new(table.page_size);
            let pages = counter_reader.records().count() / table.page_size;

            let out_path = Path::new(path.as_ref()).join(name);
            fs::create_dir(&out_path)?;

            let mut reader = generate_reader()?;
            let headers = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();

            for (page, grouped_records) in &reader
                .records()
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
                    &self.specs.tables.keys().map(|s| s.to_owned()).collect_vec(),
                    &table.render_columns,
                    name,
                )?;
            }
            render_table_javascript(
                &out_path,
                &headers,
                &table.path,
                table.separator,
                &table.render_columns,
            )?;
            render_plots(&out_path, &table.path, table.separator)?;
        }
        Ok(())
    }
}

fn render_page<P: AsRef<Path>>(
    output_path: P,
    page_index: usize,
    pages: usize,
    data: Vec<&StringRecord>,
    titles: &Vec<String>,
    tables: &Vec<String>,
    render_columns: &HashMap<String, RenderColumnSpec>,
    name: &str,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "table.html.tera",
        include_str!("../../../templates/table.html.tera"),
    )?;
    let mut context = Context::new();

    let data = data
        .iter()
        .map(|s| s.iter().collect_vec())
        .map(|r| link_columns(render_columns, titles, r))
        .collect_vec();
    let compressed_data = compress_to_utf16(&json!(data).to_string());

    let local: DateTime<Local> = Local::now();

    context.insert("data", &json!(compressed_data).to_string());
    context.insert("titles", &titles.iter().collect_vec());
    context.insert("current_page", &page_index);
    context.insert("pages", &pages);
    context.insert("tables", tables);
    context.insert("name", name);
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));

    let file_path = Path::new(output_path.as_ref())
        .join(Path::new(&format!("index_{}", page_index)).with_extension("html"));

    let html = templates.render("table.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;

    Ok(())
}

fn render_table_javascript<P: AsRef<Path>>(
    output_path: P,
    titles: &Vec<String>,
    csv_path: &Path,
    separator: char,
    render_columns: &HashMap<String, RenderColumnSpec>,
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "table.js.tera",
        include_str!("../../../templates/table.js.tera"),
    )?;
    let mut context = Context::new();

    let formatters: HashMap<String, String> = render_columns
        .iter()
        .filter(|(_, k)| k.custom.is_some())
        .map(|(k, v)| (k.to_owned(), v.custom.as_ref().unwrap().to_owned()))
        .collect();

    let numeric: HashMap<String, bool> = classify_table(csv_path, separator)?
        .iter()
        .map(|(k, v)| (k.to_owned(), *v != ColumnType::String))
        .collect();

    context.insert("titles", &titles.iter().collect_vec());
    context.insert("formatter", &Some(formatters));
    context.insert("num", &numeric);

    let file_path = Path::new(output_path.as_ref()).join(Path::new("table").with_extension("js"));

    let js = templates.render("table.js.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(js.as_bytes())?;

    Ok(())
}

#[allow(clippy::if_same_then_else)]
fn link_columns(
    render_columns: &HashMap<String, RenderColumnSpec>,
    titles: &Vec<String>,
    column: Vec<&str>,
) -> Vec<String> {
    let mut result = Vec::new();
    for (i, title) in titles.iter().enumerate() {
        if let Some(render_column) = render_columns.get(title) {
            if let Some(link) = render_column.link_to_url.clone() {
                result.push(format!(
                    "<a href='{}' target='_blank' >{}</a>",
                    link.replace("{value}", column[i]),
                    column[i]
                ));
            } else if let Some(table) = render_column.link_to_table.clone() {
                result.push(format!(
                    "<a href='../{}/index_1.html'>{}</a>",
                    table.replace("{value}", column[i]),
                    column[i]
                ));
            } else if let Some(_table_row) = render_column.link_to_table_row.clone() {
                result.push(column[i].to_string()); // TODO: Implement link-to-table-row and remove #[allow(clippy::if_same_then_else)]
            } else {
                result.push(column[i].to_string());
            }
        } else {
            result.push(column[i].to_string());
        }
    }
    result
}

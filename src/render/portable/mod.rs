mod plot;
pub(crate) mod utils;

use crate::render::portable::plot::render_plots;
use crate::render::Renderer;
use crate::spec::TablesSpec;
use crate::utils::row_address::RowAddressFactory;
use anyhow::Result;
use chrono::{DateTime, Local};
use csv::StringRecord;
use itertools::Itertools;
use lz_str::compress_to_utf16;
use serde_json::json;
use std::fs;
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
            let mut reader = csv::ReaderBuilder::new()
                .delimiter(table.separator as u8)
                .from_path(&table.path)?;

            let row_address_factory = RowAddressFactory::new(table.page_size);
            let pages = reader.records().count() / table.page_size;

            dbg!("Render Table:");
            dbg!(&reader);
            dbg!(&reader.records().collect_vec());
            dbg!(table.separator as u8, &table.path);

            let out_path = Path::new(path.as_ref()).join(name);
            fs::create_dir(&out_path)?;

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
                    page,
                    pages,
                    records
                        .iter()
                        .map(|(_, records)| records.as_ref().unwrap())
                        .collect_vec(),
                    &headers,
                )?;
            }

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
) -> Result<()> {
    let mut templates = Tera::default();
    templates.add_raw_template(
        "index.html.tera",
        include_str!("../../../templates/index.html.tera"),
    )?;
    let mut context = Context::new();

    let data = data.iter().map(|s| s.iter().collect_vec()).collect_vec();
    let compressed_data = compress_to_utf16(&json!(data).to_string());

    let local: DateTime<Local> = Local::now();

    context.insert("data", &json!(compressed_data).to_string());
    context.insert("titles", &titles.iter().collect_vec());
    context.insert("page", &page_index);
    context.insert("pages", &pages);
    context.insert("time", &local.format("%a %b %e %T %Y").to_string());
    context.insert("version", &env!("CARGO_PKG_VERSION"));

    let file_path = Path::new(output_path.as_ref())
        .join(Path::new(&format!("index_{}", page_index)).with_extension("html"));

    let html = templates.render("csv_report.html.tera", &context)?;

    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;

    Ok(())
}

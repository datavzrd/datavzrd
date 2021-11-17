use crate::render::Renderer;
use crate::spec::{TableSpec, TablesSpec};
use crate::utils::column_type::{classify_table, ColumnType};
use crate::utils::row_address::RowAddressFactory;
use anyhow::Result;
use csv::StringRecord;
use itertools::Itertools;
use std::path::{Path, PathBuf};
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

            for (page, grouped_records) in &reader
                .records()
                .into_iter()
                .enumerate()
                .group_by(|(i, record)| row_address_factory.get(*i).page)
            {
                let records = grouped_records.collect_vec();
                render_page(
                    &path,
                    page,
                    records
                        .iter()
                        .map(|(_, records)| records.as_ref().unwrap())
                        .collect_vec(),
                )?;
            }
            render_plots(&path, &table.path, *&table.separator)?;
        }
        Ok(())
    }
}

fn render_page<P: AsRef<Path>>(
    output_path: P,
    page_index: usize,
    data: Vec<&StringRecord>,
) -> Result<()> {
    unimplemented!()
}

fn render_plots<P: AsRef<Path>>(output_path: P, csv_path: &PathBuf, separator: char) -> Result<()> {
    let column_types = classify_table(csv_path, separator)?;

    let mut reader = csv::ReaderBuilder::new()
        .delimiter(separator as u8)
        .from_path(csv_path)?;

    for column in reader.headers()? {
        match column_types.get(column) {
            None | Some(ColumnType::None) => unreachable!(),
            Some(ColumnType::String) => {
                // Generate plot with nominal values
            }
            Some(ColumnType::Integer) => {
                // Generate plot with integer values
            }
            Some(ColumnType::Float) => {
                // Generate plot with float values
            }
        }
    }
    unimplemented!()
}

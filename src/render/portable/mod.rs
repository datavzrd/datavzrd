mod plot;
mod utils;

use crate::render::portable::plot::render_plots;
use crate::render::Renderer;
use crate::spec::TablesSpec;
use crate::utils::row_address::RowAddressFactory;
use anyhow::Result;
use csv::StringRecord;
use itertools::Itertools;
use std::fs;
use std::path::Path;
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
                .group_by(|(i, _)| row_address_factory.get(*i).page)
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

            let out_path = Path::new(path.as_ref()).join(name);
            fs::create_dir(&out_path)?;

            render_plots(&out_path, &table.path, table.separator)?;
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

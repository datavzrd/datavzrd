use crate::render::Renderer;
use crate::spec::{TableSpec, TablesSpec};
use crate::utils::row_address::RowAddressFactory;
use itertools::Itertools;
use std::path::Path;
use typed_builder::TypedBuilder;

#[derive(TypedBuilder, Debug)]
pub(crate) struct TableRenderer {
    specs: TablesSpec,
}

impl Renderer for TableRenderer {
    fn render_tables<P>(&self, path: P) -> anyhow::Result<()>
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
                dbg!(page, records);
                // TODO: Render page to file
            }
        }
        Ok(())
    }
}

use crate::render::Renderer;
use crate::spec::TableSpec;
use crate::utils::row_address::RowAddressFactory;
use itertools::Itertools;
use std::path::Path;
use typed_builder::TypedBuilder;

#[derive(TypedBuilder, Debug)]
pub(crate) struct TableRenderer {
    specs: TableSpec,
}

impl Renderer for TableRenderer {
    fn render_table<P>(&self, path: P) -> anyhow::Result<()>
    where
        P: AsRef<Path>,
    {
        let mut reader = csv::ReaderBuilder::new()
            .delimiter(self.specs.separator as u8)
            .from_path(&self.specs.path)?;

        let row_address_factory = RowAddressFactory::new(self.specs.page_size);

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
        Ok(())
    }
}

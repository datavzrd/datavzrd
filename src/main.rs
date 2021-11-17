use crate::render::portable::TableRenderer;
use crate::render::Renderer;
use crate::spec::TablesSpec;
use structopt::StructOpt;

use anyhow::Result;

pub(crate) mod cli;
pub(crate) mod render;
pub(crate) mod spec;
pub(crate) mod utils;

fn main() -> Result<()> {
    let opt = cli::Datavzrd::from_args();
    let config = TablesSpec::from_file(opt.config).unwrap();
    for (name, table) in config.tables {
        let renderer = TableRenderer::builder().specs(table).build();
        renderer.render_table(&opt.output)?;
    }
    Ok(())
}

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
    let renderer = TableRenderer::builder().specs(config).build();
    renderer.render_tables(&opt.output)?;

    Ok(())
}

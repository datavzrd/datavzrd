use crate::render::portable::utils::{render_index_file, render_static_files};
use crate::render::portable::ItemRenderer;
use crate::render::Renderer;
use crate::spec::ItemsSpec;
use anyhow::{bail, Context, Result};
use structopt::StructOpt;

pub(crate) mod cli;
pub(crate) mod render;
pub(crate) mod spec;
pub(crate) mod utils;

fn main() -> Result<()> {
    let opt = cli::Datavzrd::from_args();
    let config = ItemsSpec::from_file(&opt.config).context(format!(
        "Could not find config file under given path {:?}",
        &opt.config
    ))?;

    if !opt.output.exists() {
        bail!("Given output directory {:?} does not exist", &opt.output);
    }

    render_index_file(&opt.output, &config)?;
    render_static_files(&opt.output)?;

    let renderer = ItemRenderer::builder().specs(config).build();
    renderer.render_tables(&opt.output)?;

    Ok(())
}

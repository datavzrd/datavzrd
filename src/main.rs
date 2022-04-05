use crate::render::portable::utils::{render_index_file, render_static_files};
use crate::render::portable::ItemRenderer;
use crate::render::Renderer;
use crate::spec::ItemsSpec;
use anyhow::{Context, Result};
use log::LevelFilter;
use simplelog::{Config, SimpleLogger};
use structopt::StructOpt;

pub(crate) mod cli;
pub(crate) mod render;
pub(crate) mod spec;
pub(crate) mod utils;

fn main() -> Result<()> {
    let opt = cli::Datavzrd::from_args();
    let _ = SimpleLogger::init(LevelFilter::Warn, Config::default());
    let config = ItemsSpec::from_file(&opt.config).context(format!(
        "Could not find config file under given path {:?}",
        &opt.config
    ))?;
    config.validate()?;

    if !opt.output.exists() {
        std::fs::create_dir(&opt.output)?;
    }

    render_index_file(&opt.output, &config)?;
    render_static_files(&opt.output)?;

    let renderer = ItemRenderer::builder().specs(config).build();
    renderer.render_tables(&opt.output)?;

    Ok(())
}

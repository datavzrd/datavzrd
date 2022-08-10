use crate::render::portable::utils::{render_index_file, render_static_files};
use crate::render::portable::ItemRenderer;
use crate::render::Renderer;
use crate::spec::ItemsSpec;
use anyhow::Result;
use log::LevelFilter;
use simplelog::{ColorChoice, Config, TermLogger, TerminalMode};
use structopt::StructOpt;

pub(crate) mod cli;
pub(crate) mod render;
pub(crate) mod spec;
pub(crate) mod utils;

fn main() -> Result<()> {
    let opt = cli::Datavzrd::from_args();
    let _ = TermLogger::init(
        LevelFilter::Warn,
        Config::default(),
        TerminalMode::Stderr,
        ColorChoice::Auto,
    );
    let config = ItemsSpec::from_file(&opt.config)?;
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

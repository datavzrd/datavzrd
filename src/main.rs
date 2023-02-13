use crate::render::portable::utils::{render_index_file, render_static_files};
use crate::render::portable::ItemRenderer;
use crate::render::Renderer;
use crate::spec::ItemsSpec;
use anyhow::{bail, Result};
use log::LevelFilter;
use simplelog::{ColorChoice, Config, TermLogger, TerminalMode};
use std::fs;
use std::path::PathBuf;
use structopt::StructOpt;
use thiserror::Error;

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
    } else {
        if !opt.output.read_dir()?.next().is_none() {
            if opt.overwrite_output {
                fs::remove_dir_all(&opt.output)?;
                std::fs::create_dir(&opt.output)?;
            } else {
                bail!(OutputError::OutputDirectoryNotEmpty {
                    output_path: opt.output
                })
            }
        }
    }

    render_index_file(&opt.output, &config)?;
    render_static_files(&opt.output)?;

    let renderer = ItemRenderer::builder().specs(config).build();
    renderer.render_tables(&opt.output, opt.webview_url, opt.debug)?;

    Ok(())
}

#[derive(Error, Debug)]
pub enum OutputError {
    #[error("Given output directory {output_path:?} was not empty. If you wish to overwrite it please use the --overwrite-output option.")]
    OutputDirectoryNotEmpty { output_path: PathBuf },
}

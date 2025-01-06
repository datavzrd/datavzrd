use crate::cli::{CliError, Command};
use crate::render::portable::utils::{render_index_file, render_static_files};
use crate::render::portable::ItemRenderer;
use crate::render::Renderer;
use crate::spec::ItemsSpec;
use anyhow::{bail, Context, Result};
use clap::Parser;
use log::{info, LevelFilter};
use simplelog::{ColorChoice, Config, TermLogger, TerminalMode};
use std::fs;
use std::path::PathBuf;
use thiserror::Error;

pub(crate) mod cli;
pub(crate) mod publish;
pub(crate) mod render;
pub(crate) mod spec;
pub(crate) mod spells;
pub(crate) mod utils;

fn main() -> Result<()> {
    let opt = cli::Datavzrd::parse();
    let _ = TermLogger::init(
        LevelFilter::Warn,
        Config::default(),
        TerminalMode::Stderr,
        ColorChoice::Auto,
    );

    match opt.command {
        Some(Command::Publish {
            repo_name,
            report_path,
            org,
        }) => {
            unimplemented!("Publishing to GitHub Pages is not yet implemented.")
        }
        None => {
            let config = opt
                .config
                .ok_or(CliError::MissingConfig)
                .with_context(|| "Error validating required arguments")?;

            let output = opt
                .output
                .ok_or(CliError::MissingOutput)
                .with_context(|| "Error validating required arguments")?;

            let config = ItemsSpec::from_file(&config)?;
            config.validate()?;

            if !output.exists() {
                fs::create_dir(&output)?;
            } else if output.read_dir()?.next().is_some() {
                if opt.overwrite_output {
                    fs::remove_dir_all(&output)?;
                    fs::create_dir(&output)?;
                } else {
                    bail!(OutputError::OutputDirectoryNotEmpty {
                        output_path: output
                    })
                }
            }

            render_index_file(&output, &config)?;
            render_static_files(&output)?;

            let renderer = ItemRenderer::builder().specs(config).build();
            renderer.render_tables(&output, &opt.webview_url, opt.debug)?;
        }
    }

    Ok(())
}

#[derive(Error, Debug)]
pub enum OutputError {
    #[error("Given output directory {output_path:?} was not empty. If you wish to overwrite it please use the --overwrite-output option.")]
    OutputDirectoryNotEmpty { output_path: PathBuf },
}

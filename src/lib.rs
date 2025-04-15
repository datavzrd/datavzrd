use crate::render::portable::utils::{render_index_file, render_static_files};
use crate::render::portable::ItemRenderer;
use crate::render::Renderer;
use crate::spec::ItemsSpec;
use anyhow::{bail, Result};
use std::fs;
use std::path::PathBuf;
use thiserror::Error;

pub mod render;
pub mod spec;
pub mod spells;
pub mod utils;

/// Renders a report based on the provided configuration file and outputs it to the specified directory.
///
/// # Arguments
///
/// * `config_file` - A `PathBuf` reference to the configuration file containing the report specifications.
/// * `output` - A `PathBuf` reference to the directory where the rendered report will be saved.
/// * `webview_url` - A string slice representing the base URL for webview links in the report.
/// * `debug` - A boolean flag indicating whether to enable debug mode for rendering.
/// * `overwrite_output` - A boolean flag indicating whether to overwrite the output directory if it is not empty.
///
/// # Returns
///
/// * `Result<()>` - Returns `Ok(())` if the report is successfully rendered, or an error if any step fails.
///
/// # Errors
///
/// * Returns an error if the configuration file is invalid or cannot be read.
/// * Returns an error if the output directory is not empty and `overwrite_output` is not set to `true`.
/// * Returns an error if any of the rendering steps fail.
pub fn render_report(
    config_file: &PathBuf,
    output: &PathBuf,
    webview_url: &str,
    debug: bool,
    overwrite_output: bool,
) -> Result<()> {
    let config = ItemsSpec::from_file(config_file)?;
    config.validate()?;

    if !output.exists() {
        fs::create_dir(output)?;
    } else if output.read_dir()?.next().is_some() {
        if overwrite_output {
            fs::remove_dir_all(output)?;
            fs::create_dir(output)?;
        } else {
            bail!(OutputError::OutputDirectoryNotEmpty {
                output_path: output.to_path_buf(),
            })
        }
    }

    render_index_file(output, &config)?;
    render_static_files(output)?;

    let renderer = ItemRenderer::builder().specs(config).build();
    renderer.render_tables(output, webview_url, debug)?;

    Ok(())
}

#[derive(Error, Debug)]
pub enum OutputError {
    #[error("Given output directory {output_path:?} was not empty. If you wish to overwrite it please use the --overwrite-output option.")]
    OutputDirectoryNotEmpty { output_path: PathBuf },
}

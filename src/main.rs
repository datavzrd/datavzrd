use crate::cli::{CliError, Command};
use anyhow::{bail, Context, Result};
use clap::Parser;
use datavzrd_lib::render_report;
use log::LevelFilter;
use simplelog::{ColorChoice, Config, TermLogger, TerminalMode};
use std::io::{stdout, Write};

pub(crate) mod cli;
pub(crate) mod publish;
mod suggest;

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
            entry,
        }) => {
            let repo = publish::Repository::new(repo_name, org, report_path, entry)?;
            repo.publish()?;
        }
        Some(Command::Suggest {
            files,
            separators,
            name,
        }) => {
            if files.len() != separators.len() {
                bail!(CliError::MismatchedSeparators);
            }
            let config = suggest::suggest(files, separators, name)?;
            stdout().write_all(config.as_bytes())?;
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

            render_report(
                &config,
                &output,
                &opt.webview_url,
                opt.debug,
                opt.overwrite_output,
            )?;
        }
    }

    Ok(())
}

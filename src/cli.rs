use clap::Parser;
use std::path::PathBuf;

/// A tool to create visual HTML reports from collections of CSV/TSV tables.
#[derive(Parser, Debug)]
#[command(
    name = "datavzrd",
    about = "A tool to create visual HTML reports from collections of CSV/TSV tables."
)]
pub struct Datavzrd {
    /// Verbose mode (-v, -vv, -vvv, etc.)
    #[arg(short, long, action = clap::ArgAction::Count)]
    pub(crate) _verbose: u8,

    /// Activates debug mode. Javascript files are not minified.
    #[arg(long)]
    pub(crate) debug: bool,

    /// Config file containing file paths and settings
    #[arg(value_name = "CONFIG", value_parser)]
    pub(crate) config: PathBuf,

    /// Sets the URL of the webview host. Note that when using the link the row data can temporarily occur (in base64-encoded form) in the server logs of the given webview host.
    #[arg(
        short = 'w',
        long,
        default_value = "https://datavzrd.github.io/view/",
        env = "DATAVZRD_WEBVIEW_URL"
    )]
    pub(crate) webview_url: String,

    /// Overwrites the contents of the given output directory if it is not empty.
    #[arg(long)]
    pub(crate) overwrite_output: bool,

    /// Output file
    #[arg(short, long, value_parser)]
    pub(crate) output: PathBuf,
}

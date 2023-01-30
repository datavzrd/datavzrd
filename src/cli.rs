use std::path::PathBuf;
use structopt::StructOpt;

#[derive(StructOpt, Debug)]
#[structopt(
    about = "A tool to create visual HTML reports from collections of CSV/TSV tables.",
    name = "datavzrd"
)]
pub struct Datavzrd {
    // The number of occurrences of the `v/verbose` flag
    /// Verbose mode (-v, -vv, -vvv, etc.)
    #[structopt(short, long, parse(from_occurrences))]
    pub(crate) _verbose: u8,

    /// Config file containing file paths and settings
    #[structopt(name = "CONFIG", parse(from_os_str))]
    pub(crate) config: PathBuf,

    /// Sets the URL of the webview host. Note that when using the link the row data can temporarily occur (in base64-encoded form) in the server logs of the given webview host.
    #[structopt(short = "w", long, default_value = "https://datavzrd.github.io/view/", env = "DATAVZRD_WEBVIEW_HOST")]
    pub(crate) webview_host: String,

    /// Output file
    #[structopt(short, long, parse(from_os_str))]
    pub(crate) output: PathBuf,
}

use std::path::PathBuf;
use structopt::StructOpt;

/// A basic example
#[derive(StructOpt, Debug)]
#[structopt(
    about = "A tool to create visual HTML reports from collections of CSV/TSV tables.",
    name = "datavzrd"
)]
pub struct Datavzrd {
    // The number of occurrences of the `v/verbose` flag
    /// Verbose mode (-v, -vv, -vvv, etc.)
    #[structopt(short, long, parse(from_occurrences))]
    verbose: u8,

    /// Config file containing file paths and settings
    #[structopt(name = "CONFIG", parse(from_os_str))]
    config: PathBuf,

    /// Output file
    #[structopt(short, long, parse(from_os_str))]
    output: PathBuf,
}

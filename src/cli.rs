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
    pub(crate) verbose: u8,

    /// Config file containing file paths and settings
    #[structopt(name = "CONFIG", parse(from_os_str))]
    pub(crate) config: PathBuf,

    /// Output file
    #[structopt(short, long, parse(from_os_str))]
    pub(crate) output: PathBuf,
}

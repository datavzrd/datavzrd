use std::path::PathBuf;

use structopt::StructOpt;

#[derive(Debug, StructOpt)]
#[structopt(
    name = "datavzrd",
    about = "A tool to generate HTML reports from collections of tables."
)]
pub(crate) struct Opt {
    #[structopt(parse(from_os_str), help = "Specification javascript file to use.")]
    spec: PathBuf,
}

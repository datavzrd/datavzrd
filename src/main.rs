use crate::spec::TablesSpec;
use structopt::StructOpt;

pub(crate) mod cli;
pub(crate) mod render;
pub(crate) mod spec;
pub(crate) mod utils;

fn main() {
    let opt = cli::Datavzrd::from_args();
    let _config = TablesSpec::from_file(opt.config).unwrap();
}

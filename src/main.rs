use structopt::StructOpt;
use crate::spec::TablesSpec;

pub(crate) mod cli;
pub(crate) mod render;
pub(crate) mod spec;

fn main() {
    let opt = cli::Datavzrd::from_args();
    let config = TablesSpec::from_file(opt.config).unwrap();
}

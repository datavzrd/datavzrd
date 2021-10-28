use structopt::StructOpt;

pub(crate) mod cli;
pub(crate) mod render;

fn main() {
    let opt = cli::Datavzrd::from_args();
    // call renderer
}

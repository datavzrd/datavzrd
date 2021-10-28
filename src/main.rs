use structopt::StructOpt;

pub(crate) mod cli;
pub(crate) mod render;

fn main() {
    let opt = cli::Opt::from_args();
    // call renderer from here.
}

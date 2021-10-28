use structopt::StructOpt;
mod cli;

fn main() {
    let opt = cli::Datavzrd::from_args();
    println!("{:?}", opt);
}

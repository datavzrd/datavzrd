use std::path::PathBuf;

fn main() {
    // run webpack in web directory
    println!("hello from build.rs");
    let output = std::process::Command::new("webpack")
        .current_dir("web/")
        .spawn()
        .expect("failed to execute webpack");
}
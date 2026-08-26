use fs_extra::dir::CopyOptions;
use std::env;
use std::path::PathBuf;

const DOCS_URL: &str = "https://raw.githubusercontent.com/datavzrd/datavzrd.github.io/refs/heads/main/src/docs/configuration.rst";

fn main() {
    println!("cargo:rerun-if-changed=web/");
    let out_dir = env::var("OUT_DIR").unwrap();

    let docs_path = PathBuf::from(&out_dir).join("configuration.rst");
    std::fs::write(&docs_path, fetch_configuration_reference())
        .expect("failed to write the configuration reference");
    let web_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("web");
    fs_extra::dir::copy(
        web_dir,
        out_dir,
        &CopyOptions {
            overwrite: true,
            ..CopyOptions::new()
        },
    )
    .expect("failed to copy web/ into OUT_DIR/");

    let work_dir = PathBuf::from(std::env::var("OUT_DIR").unwrap()).join("web");

    std::process::Command::new("pnpm")
        .arg("install")
        .current_dir(work_dir.to_str().expect("failed to get work dir"))
        .status()
        .expect("failed to install packages");

    std::process::Command::new("pnpm")
        .arg("exec")
        .arg("rspack")
        .arg("build")
        .current_dir(work_dir.to_str().expect("failed to get work dir"))
        .status()
        .expect("failed to execute pnpm exec rspack build");
}

fn fetch_configuration_reference() -> String {
    let mut last_error = String::new();
    for attempt in 1..=5 {
        match ureq::get(DOCS_URL).call() {
            Ok(response) => {
                return response
                    .into_string()
                    .expect("failed to read the configuration reference")
            }
            Err(error) => {
                last_error = error.to_string();
                std::thread::sleep(std::time::Duration::from_secs(attempt));
            }
        }
    }
    panic!("failed to fetch the configuration reference from {DOCS_URL}: {last_error}");
}

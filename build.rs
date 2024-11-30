use fs_extra::dir::CopyOptions;
use std::env;
use std::path::PathBuf;

fn main() {
    println!("cargo:rerun-if-changed=web/");
    let out_dir = env::var("OUT_DIR").unwrap();
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

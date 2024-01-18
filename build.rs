use std::path::PathBuf;

fn main() {
    println!("cargo:rerun-if-changed=web/");
    std::process::Command::new("cp")
        .args([
            "-r",
            "-v",
            "web/",
            PathBuf::from(std::env::var("OUT_DIR").unwrap())
                .to_str()
                .unwrap(),
        ])
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .status()
        .expect("failed to copy web/ into OUT_DIR/");

    let work_dir = PathBuf::from(std::env::var("OUT_DIR").unwrap()).join("web/");

    std::process::Command::new("npm")
        .arg("install")
        .current_dir(work_dir.to_str().expect("failed to get work dir"))
        .status()
        .expect("failed to execute webpack");

    std::process::Command::new("npx")
        .arg("webpack")
        .current_dir(work_dir.to_str().expect("failed to get work dir"))
        .status()
        .expect("failed to execute webpack");
}

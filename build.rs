use std::path::PathBuf;

fn main() {
    let work_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("web/");
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

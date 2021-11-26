use anyhow::Result;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;

pub(crate) fn render_static_files<P: AsRef<Path>>(path: P) -> Result<()> {
    let path = Path::new(path.as_ref()).join("static");
    fs::create_dir(&path)?;
    let files = vec![
        (
            "bootstrap.bundle.min.js",
            include_str!("../../../static/bootstrap.bundle.min.js"),
        ),
        (
            "bootstrap-table.min.js",
            include_str!("../../../static/bootstrap-table.min.js"),
        ),
        (
            "jquery.min.js",
            include_str!("../../../static/jquery.min.js"),
        ),
        ("jsonm.min.js", include_str!("../../../static/jsonm.min.js")),
        (
            "lz-string.min.js",
            include_str!("../../../static/lz-string.min.js"),
        ),
        ("vega.min.js", include_str!("../../../static/vega.min.js")),
        (
            "vega-lite.min.js",
            include_str!("../../../static/vega-lite.min.js"),
        ),
        (
            "vega-embed.min.js",
            include_str!("../../../static/vega-embed.min.js"),
        ),
        (
            "bootstrap.min.css",
            include_str!("../../../static/bootstrap.min.css"),
        ),
        (
            "bootstrap-table.min.css",
            include_str!("../../../static/bootstrap-table.min.css"),
        ),
    ];

    for (name, file) in files {
        let mut out = File::create(path.join(Path::new(name)))?;
        out.write_all(file.as_bytes())?;
    }
    Ok(())
}

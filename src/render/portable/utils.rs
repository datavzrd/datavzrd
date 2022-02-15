use crate::spec::ItemsSpec;
use anyhow::Result;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use tera::{Context, Tera};

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
            "bootstrap-table-fixed-columns.min.js",
            include_str!("../../../static/bootstrap-table-fixed-columns.min.js"),
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
        (
            "bootstrap-table-fixed-columns.min.css",
            include_str!("../../../static/bootstrap-table-fixed-columns.min.css"),
        ),
        ("datavzrd.css", include_str!("../../../static/datavzrd.css")),
        (
            "showdown.min.js",
            include_str!("../../../static/showdown.min.js"),
        ),
    ];

    for (name, file) in files {
        let mut out = File::create(path.join(Path::new(name)))?;
        out.write_all(file.as_bytes())?;
    }
    Ok(())
}

pub(crate) fn render_index_file<P: AsRef<Path>>(path: P, specs: &ItemsSpec) -> Result<()> {
    let table = specs.views.keys().next().unwrap();
    let mut templates = Tera::default();
    templates.add_raw_template(
        "index.html.tera",
        include_str!("../../../templates/index.html.tera"),
    )?;
    let mut context = Context::new();
    context.insert("table", table);
    let file_path = Path::new(path.as_ref()).join(Path::new("index").with_extension("html"));
    let html = templates.render("index.html.tera", &context)?;
    let mut file = fs::File::create(file_path)?;
    file.write_all(html.as_bytes())?;
    Ok(())
}

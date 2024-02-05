use crate::{ItemsSpec, RenderColumnSpec};
use anyhow::Result;
use minify_js::{minify, Session, TopLevelMode};
use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use tera::{Context, Tera};

pub fn render_static_files<P: AsRef<Path>>(path: P) -> Result<()> {
    let path = Path::new(path.as_ref()).join("static");
    fs::create_dir(&path)?;
    let files = vec![
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
            "bootstrap-select.min.css",
            include_str!("../../../static/bootstrap-select.min.css"),
        ),
        (
            "bundle.js",
            include_str!(concat!(env!("OUT_DIR"), "/web/dist/bundle.js")),
        ),
    ];

    for (name, file) in files {
        let mut out = File::create(path.join(Path::new(name)))?;
        out.write_all(file.as_bytes())?;
    }
    Ok(())
}

pub(crate) fn minify_js(file: &str, debug: bool) -> Result<Vec<u8>> {
    if !debug {
        let mut minified: Vec<u8> = Vec::new();
        minify(
            &Session::new(),
            TopLevelMode::Global,
            file.as_bytes(),
            &mut minified,
        )
        .expect("Failed minifying js");
        Ok(minified)
    } else {
        Ok(file.as_bytes().to_vec())
    }
}

pub fn render_index_file<P: AsRef<Path>>(path: P, specs: &ItemsSpec) -> Result<()> {
    let table = if let Some(default_view) = &specs.default_view {
        default_view
    } else {
        specs.views.keys().next().unwrap()
    };
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

pub(crate) fn get_column_labels(
    render_columns: &HashMap<String, RenderColumnSpec>,
) -> HashMap<String, String> {
    render_columns
        .iter()
        .filter(|(_, v)| v.label.is_some())
        .map(|(k, v)| (k.to_owned(), v.label.as_ref().unwrap().to_owned()))
        .collect()
}

pub(crate) fn round(x: f32, decimals: u32) -> f32 {
    let y = 10i32.pow(decimals) as f32;
    (x * y).round() / y
}

#[cfg(test)]
mod tests {
    use crate::{render_index_file, render_static_files, ItemsSpec};
    use std::fs;
    use std::path::Path;

    #[test]
    fn test_render_index_file() {
        let spec = ItemsSpec {
            report_name: "".to_string(),
            datasets: Default::default(),
            default_view: Some("my-view".to_string()),
            max_in_memory_rows: 1000,
            views: Default::default(),
            aux_libraries: None,
            webview_controls: false,
        };
        render_index_file(Path::new("/tmp"), &spec).unwrap();
        let rendered_file_content = fs::read_to_string("/tmp/index.html")
            .expect("Could not read rendered test index file.");
        fs::remove_file("/tmp/index.html")
            .expect("Could not read remove rendered test index file.");
        assert_eq!(
            rendered_file_content,
            include_str!("../../../tests/expected/index.html")
        )
    }

    #[test]
    fn test_render_static_files() {
        render_static_files(Path::new("/tmp")).unwrap();
        let files = vec![
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
                "bootstrap-select.min.css",
                include_str!("../../../static/bootstrap-select.min.css"),
            ),
            (
                "bundle.js",
                include_str!(concat!(env!("OUT_DIR"), "/web/dist/bundle.js")),
            ),
        ];

        for (name, file) in files {
            let rendered_file_content = fs::read_to_string(format!("/tmp/static/{}", name))
                .expect("Could not read rendered test index file.");
            assert_eq!(rendered_file_content, file);
        }

        for entry in fs::read_dir("/tmp/static").unwrap() {
            fs::remove_file(entry.unwrap().path()).unwrap();
        }
        fs::remove_dir("/tmp/static").unwrap();
    }
}

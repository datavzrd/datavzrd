use std::path::Path;

use anyhow::Result;

pub mod portable;

pub trait Renderer {
    fn render_tables<P>(&self, path: P, webview_host: &str, debug: bool) -> Result<()>
    where
        P: AsRef<Path>;
}

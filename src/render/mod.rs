use std::path::Path;

use anyhow::Result;

pub(crate) mod portable;

pub(crate) trait Renderer {
    fn render_table<P>(&self, path: P) -> Result<()>
    where
        P: AsRef<Path>;
}

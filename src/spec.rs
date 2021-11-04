use anyhow::Result;
use derefable::Derefable;
use serde;
use serde::de::Deserializer;
use serde::Deserialize;
use serde_yaml;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Derefable, Deserialize, Debug, Clone)]
pub(crate) struct TablesSpec(#[deref] HashMap<String, TableSpec>);

impl TablesSpec {
    pub(crate) fn from_file<P: AsRef<Path>>(path: P) -> Result<TablesSpec> {
        let config_file = fs::read_to_string(path)?;
        Ok(serde_yaml::from_str(&config_file)?)
    }
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct TableSpec {
    path: PathBuf,
    #[serde(default)]
    render_columns: HashMap<String, RenderColumnSpec>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct RenderColumnSpec {
    #[serde(default)]
    custom: Option<String>,
    #[serde(default)]
    link_to_table_row: Option<String>,
    #[serde(default)]
    link_to_table: Option<String>,
    #[serde(default)]
    link_to_url: Option<String>,
    #[serde(default)]
    plot: Option<PlotSpec>,
    #[serde(default)]
    custom_plot: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
pub(crate) struct PlotSpec {
    #[serde(rename = "type")]
    plot_type: String,
}

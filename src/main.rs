use derefable::Derefable;
use serde;
use serde::de::Deserializer;
use serde::Deserialize;
use std::collections::HashMap;
use std::path::Path;
use structopt::StructOpt;

pub(crate) mod cli;
pub(crate) mod render;

fn main() {
    let opt = cli::Datavzrd::from_args();
    // call renderer
}

#[derive(Derefable, Deserialize, Debug, Clone)]
pub(crate) struct TablesSpec<P: AsRef<Path>>(HashMap<String, TableSpec<P>>);

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct TableSpec<P: AsRef<Path>> {
    path: P,
    #[serde(default)]
    render_columns: HashMap<String, RenderColumnSpec>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct RenderColumnSpec {
    #[serde(default)]
    custom: Option<JSFunction>,
    #[serde(default)]
    link_to_table_row: Option<String>,
    #[serde(default)]
    link_to_table: Option<String>,
    #[serde(default)]
    link_to_url: Option<String>,
    #[serde(default)]
    plot: Option<PlotSpec>,
    #[serde(default)]
    custom_plot: Option<CustomPlotSpec>,
}

#[derive(Deserialize, Debug, Clone)]
pub(crate) struct PlotSpec {
    #[serde(rename = "type")]
    plot_type: String,
}

/// Placeholder for vega plot specs (we do not need to access their contents in rust)
#[derive(Default, Debug, Clone)]
pub(crate) struct CustomPlotSpec;

impl<'de> Deserialize<'de> for CustomPlotSpec {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Ok(CustomPlotSpec::default())
    }
}

/// Placeholder for JS functions (we do not need to access their contents in rust)
#[derive(Default, Debug, Clone)]
pub(crate) struct JSFunction;

impl<'de> Deserialize<'de> for JSFunction {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Ok(JSFunction::default())
    }
}

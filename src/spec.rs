use anyhow::Result;
use derefable::Derefable;
use serde;
use serde::Deserialize;
use serde_yaml;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Derefable, Deserialize, Debug, Clone, PartialEq)]
pub(crate) struct TablesSpec {
    #[deref]
    tables: HashMap<String, TableSpec>,
}

impl TablesSpec {
    pub(crate) fn from_file<P: AsRef<Path>>(path: P) -> Result<TablesSpec> {
        let config_file = fs::read_to_string(path)?;
        Ok(serde_yaml::from_str(&config_file)?)
    }
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct TableSpec {
    path: PathBuf,
    #[serde(default)]
    render_columns: HashMap<String, RenderColumnSpec>,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
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
    custom_plot: Option<CustomPlot>,
    #[serde(default)]
    summary_plot: Option<String>,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
pub(crate) struct CustomPlot {
    #[serde(default, rename = "data")]
    plot_data: String,
    #[serde(default)]
    schema: String,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
pub(crate) struct PlotSpec {
    #[serde(rename = "type")]
    plot_type: String,
}

#[test]
fn test_config_deserialization() {
    let expected_render_columns = RenderColumnSpec {
        custom: None,
        link_to_table_row: Some(String::from("some-value")),
        link_to_table: Some(String::from("table-b")),
        link_to_url: Some(String::from("https://www.rust-lang.org")),
        plot: None,
        custom_plot: None,
        summary_plot: None,
    };

    let expected_table_spec = TableSpec {
        path: PathBuf::from("test.tsv"),
        render_columns: HashMap::from([(String::from("x"), expected_render_columns)]),
    };

    let expected_config = TablesSpec {
        tables: HashMap::from([(String::from("table-a"), expected_table_spec)]),
    };

    let raw_config = r#"
    tables:
        table-a:
            path: test.tsv
            render-columns:
                x:
                    link-to-table-row: some-value
                    link-to-table: table-b
                    link-to-url: https://www.rust-lang.org
    "#;

    let config: TablesSpec = serde_yaml::from_str(raw_config).unwrap();
    assert_eq!(config, expected_config);
}

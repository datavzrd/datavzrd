use anyhow::bail;
use anyhow::Result;
use derefable::Derefable;
use itertools::Itertools;
use lazy_static::lazy_static;
use regex::Regex;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use thiserror::Error;

#[derive(Derefable, Deserialize, Debug, Clone, PartialEq)]
pub(crate) struct ItemsSpec {
    #[deref]
    pub(crate) items: HashMap<String, ItemSpecs>,
}

impl ItemsSpec {
    pub(crate) fn from_file<P: AsRef<Path>>(path: P) -> Result<ItemsSpec> {
        let config_file = fs::read_to_string(path)?;
        let mut items_spec: ItemsSpec = serde_yaml::from_str(&config_file)?;
        for (_, spec) in items_spec.items.iter_mut() {
            if spec.render_table.is_some() {
                spec.column_index_to_value()?;
            }
        }
        Ok(items_spec)
    }
}

fn default_separator() -> char {
    char::from_str(",").unwrap()
}

fn default_page_size() -> usize {
    100_usize
}

fn default_header_size() -> usize {
    1_usize
}

fn default_render_table() -> Option<HashMap<String, RenderColumnSpec>> {
    Some(HashMap::new())
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct ItemSpecs {
    pub(crate) path: PathBuf,
    #[serde(default = "default_separator")]
    pub(crate) separator: char,
    #[serde(default = "default_page_size")]
    pub(crate) page_size: usize,
    #[serde(default = "default_header_size")]
    pub(crate) header_rows: usize,
    #[serde(rename = "desc")]
    pub(crate) description: Option<String>,
    #[serde(default = "default_render_table")]
    pub(crate) render_table: Option<HashMap<String, RenderColumnSpec>>,
    #[serde(default)]
    pub(crate) render_plot: Option<RenderPlotSpec>,
}

lazy_static! {
    static ref INDEX: Regex = Regex::new(r"index\(([0-9]+)\)").unwrap();
}

impl ItemSpecs {
    /// Converts columns addressed with index to the actual header values of the table
    fn column_index_to_value(&mut self) -> Result<()> {
        let mut indexed_keys = HashMap::new();
        let mut reader = csv::ReaderBuilder::new()
            .delimiter(self.separator as u8)
            .from_path(&self.path)?;
        let headers = reader.headers()?;
        for (key, render_column_specs) in self.render_table.as_ref().unwrap().iter() {
            if INDEX.is_match(key) {
                let index = usize::from_str(
                    INDEX
                        .captures_iter(key)
                        .collect_vec()
                        .pop()
                        .unwrap()
                        .get(1)
                        .unwrap()
                        .as_str(),
                )?;
                match headers.get(index) {
                    None => {
                        bail!(ConfigError::IndexTooLarge {
                            index,
                            header_length: headers.len(),
                            table_path: self.path.clone(),
                        })
                    }
                    Some(k) => {
                        if indexed_keys
                            .insert(k.to_string(), render_column_specs.clone())
                            .is_some()
                        {
                            bail!(ConfigError::DuplicateColumn {
                                column: k.to_string(),
                                table_path: self.path.clone(),
                            })
                        };
                    }
                }
            } else if indexed_keys
                .insert(key.to_string(), render_column_specs.clone())
                .is_some()
            {
                bail!(ConfigError::DuplicateColumn {
                    column: key.to_string(),
                    table_path: self.path.clone(),
                })
            }
        }
        self.render_table = Some(indexed_keys);
        Ok(())
    }
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct RenderColumnSpec {
    #[serde(default)]
    pub(crate) custom: Option<String>,
    #[serde(default)]
    pub(crate) link_to_table_row: Option<String>,
    #[serde(default)]
    pub(crate) link_to_table: Option<String>,
    #[serde(default)]
    pub(crate) link_to_url: Option<String>,
    #[serde(default)]
    pub(crate) plot: Option<PlotSpec>,
    #[serde(default)]
    pub(crate) custom_plot: Option<CustomPlot>,
    #[serde(default)]
    summary_plot: Option<String>,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct RenderPlotSpec {
    #[serde(default)]
    pub(crate) schema: String,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct CustomPlot {
    #[serde(default, rename = "data")]
    plot_data: String,
    #[serde(default)]
    schema: String,
    #[serde(default = "default_vega_controls")]
    vega_controls: String,
}

fn default_vega_controls() -> String {
    "false".to_string()
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
pub(crate) struct PlotSpec {
    #[serde(rename = "ticks")]
    pub(crate) tick_plot: Option<TickPlot>,
    pub(crate) heatmap: Option<Heatmap>,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
pub(crate) struct TickPlot {
    #[serde(default, rename = "scale")]
    pub(crate) scale_type: String,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
pub(crate) struct Heatmap {
    #[serde(default, rename = "scale")]
    pub(crate) scale_type: String,
    #[serde(default, rename = "scheme")]
    color_scheme: String,
    #[serde(default, rename = "range")]
    color_range: Vec<String>,
}

#[derive(Error, Debug)]
pub enum ConfigError {
    #[error("Could not find column with index {index:?} under path {table_path:?} with only {header_length:?} columns.")]
    IndexTooLarge {
        index: usize,
        header_length: usize,
        table_path: PathBuf,
    },
    #[error("Column {column:?} under path {table_path:?} seems to have multiple definitions. Please check your config file.")]
    DuplicateColumn { column: String, table_path: PathBuf },
}

#[cfg(test)]
mod tests {
    use crate::spec::{ItemSpecs, ItemsSpec, RenderColumnSpec, RenderPlotSpec};
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_table_config_deserialization() {
        let expected_render_columns = RenderColumnSpec {
            custom: None,
            link_to_table_row: Some(String::from("some-value")),
            link_to_table: Some(String::from("table-b")),
            link_to_url: Some(String::from("https://www.rust-lang.org")),
            plot: None,
            custom_plot: None,
            summary_plot: None,
        };

        let expected_table_spec = ItemSpecs {
            path: PathBuf::from("test.tsv"),
            separator: ',',
            page_size: 100,
            header_rows: 1,
            description: None,
            render_table: Some(HashMap::from([(
                String::from("x"),
                expected_render_columns,
            )])),
            render_plot: None,
        };

        let expected_config = ItemsSpec {
            items: HashMap::from([(String::from("table-a"), expected_table_spec)]),
        };

        let raw_config = r#"
    items:
        table-a:
            path: test.tsv
            page-size: 100
            render-table:
                x:
                    link-to-table-row: some-value
                    link-to-table: table-b
                    link-to-url: https://www.rust-lang.org
    "#;

        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert_eq!(config, expected_config);
    }

    #[test]
    fn test_plot_config_deserialization() {
        let expected_render_plot = RenderPlotSpec {
            schema: "{'$schema': 'https://vega.github.io/schema/vega-lite/v5.json'}\n".to_string(),
        };

        let expected_item_spec = ItemSpecs {
            path: PathBuf::from("test.tsv"),
            separator: ',',
            page_size: 100,
            header_rows: 1,
            description: Some("my table".parse().unwrap()),
            render_table: None,
            render_plot: Some(expected_render_plot),
        };

        let expected_config = ItemsSpec {
            items: HashMap::from([(String::from("plot-a"), expected_item_spec)]),
        };

        let raw_config = r#"
    items:
        plot-a:
            path: test.tsv
            desc: "my table"
            render-plot:
                schema: |
                    {'$schema': 'https://vega.github.io/schema/vega-lite/v5.json'}
    "#;

        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert_eq!(config, expected_config);
    }
}

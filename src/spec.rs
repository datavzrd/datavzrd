use crate::render::portable::DatasetError;
use anyhow::Result;
use anyhow::{bail, Context};
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
    #[serde(default, rename = "name")]
    pub(crate) report_name: String,
    pub(crate) datasets: HashMap<String, DatasetSpecs>,
    #[deref]
    pub(crate) views: HashMap<String, ItemSpecs>,
}

impl ItemsSpec {
    pub(crate) fn from_file<P: AsRef<Path>>(path: P) -> Result<ItemsSpec> {
        let config_file = fs::read_to_string(path)?;
        let mut items_spec: ItemsSpec = serde_yaml::from_str(&config_file)?;
        for (_, spec) in items_spec.views.iter_mut() {
            if spec.render_table.is_some() {
                let dataset = match items_spec.datasets.get(&spec.dataset) {
                    Some(dataset) => dataset,
                    None => {
                        bail!(DatasetError::NotFound {
                            dataset_name: spec.dataset.clone()
                        })
                    }
                };
                spec.column_index_to_value(dataset)?;
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

fn default_links() -> Option<HashMap<String, LinkSpec>> {
    Some(HashMap::new())
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct DatasetSpecs {
    pub(crate) path: PathBuf,
    #[serde(default = "default_separator")]
    pub(crate) separator: char,
    #[serde(default = "default_header_size")]
    pub(crate) header_rows: usize,
    #[serde(default = "default_links")]
    pub(crate) links: Option<HashMap<String, LinkSpec>>,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct ItemSpecs {
    pub(crate) dataset: String,
    #[serde(default = "default_page_size")]
    pub(crate) page_size: usize,
    #[serde(default)]
    pub(crate) pin_columns: usize,
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
    fn column_index_to_value(&mut self, dataset: &DatasetSpecs) -> Result<()> {
        let mut indexed_keys = HashMap::new();
        let mut reader = csv::ReaderBuilder::new()
            .delimiter(dataset.separator as u8)
            .from_path(&dataset.path)
            .context(format!("Could not read file with path {:?}", &dataset.path))?;
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
                            table_path: dataset.path.clone(),
                        })
                    }
                    Some(k) => {
                        if indexed_keys
                            .insert(k.to_string(), render_column_specs.clone())
                            .is_some()
                        {
                            bail!(ConfigError::DuplicateColumn {
                                column: k.to_string(),
                                table_path: dataset.path.clone(),
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
                    table_path: dataset.path.clone(),
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

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct LinkSpec {
    #[serde(default)]
    pub(crate) column: String,
    #[serde(default)]
    pub(crate) item: Option<String>,
    #[serde(default)]
    pub(crate) table_row: Option<String>,
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
    use crate::spec::{
        default_links, default_render_table, DatasetSpecs, ItemSpecs, ItemsSpec, LinkSpec,
        RenderColumnSpec, RenderPlotSpec,
    };
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_table_config_deserialization() {
        let expected_render_columns = RenderColumnSpec {
            custom: None,
            link_to_url: Some(String::from("https://www.rust-lang.org")),
            plot: None,
            custom_plot: None,
            summary_plot: None,
        };

        let expected_dataset_spec = DatasetSpecs {
            path: PathBuf::from("test.tsv"),
            separator: ',',
            header_rows: 1,
            links: default_links(),
        };

        let expected_table_spec = ItemSpecs {
            dataset: "table-a".to_string(),
            page_size: 100,
            pin_columns: 1,
            description: None,
            render_table: Some(HashMap::from([(
                String::from("x"),
                expected_render_columns,
            )])),
            render_plot: None,
        };

        let expected_config = ItemsSpec {
            datasets: HashMap::from([(String::from("table-a"), expected_dataset_spec)]),
            views: HashMap::from([(String::from("table-a"), expected_table_spec)]),
            report_name: "my_report".to_string(),
        };

        let raw_config = r#"
    name: my_report
    datasets:
        table-a:
            path: test.tsv
    views:
        table-a:
            dataset: table-a
            page-size: 100
            pin-columns: 1
            render-table:
                x:
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

        let expected_links = HashMap::from([(
            "my-link".to_string(),
            LinkSpec {
                column: "test".to_string(),
                item: Some("other-table".to_string()),
                table_row: None,
            },
        )]);

        let expected_dataset_spec = DatasetSpecs {
            path: PathBuf::from("test.tsv"),
            separator: ',',
            header_rows: 1,
            links: Some(expected_links),
        };

        let expected_item_spec = ItemSpecs {
            dataset: "table-a".to_string(),
            page_size: 100,
            pin_columns: 0,
            description: Some("my table".parse().unwrap()),
            render_table: default_render_table(),
            render_plot: Some(expected_render_plot),
        };

        let expected_config = ItemsSpec {
            datasets: HashMap::from([(String::from("table-a"), expected_dataset_spec)]),
            views: HashMap::from([(String::from("plot-a"), expected_item_spec)]),
            report_name: "".to_string(),
        };

        let raw_config = r#"
    datasets:
        table-a:
            path: test.tsv
            links:
                my-link:
                    column: test
                    item: other-table
    views:
        plot-a:
            dataset: table-a
            desc: "my table"
            render-plot:
                schema: |
                    {'$schema': 'https://vega.github.io/schema/vega-lite/v5.json'}
    "#;

        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert_eq!(config, expected_config);
    }
}

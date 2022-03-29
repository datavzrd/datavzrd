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
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use thiserror::Error;

#[derive(Derefable, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct ItemsSpec {
    #[serde(default, rename = "name")]
    pub(crate) report_name: String,
    pub(crate) datasets: HashMap<String, DatasetSpecs>,
    #[deref]
    pub(crate) default_view: Option<String>,
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
                spec.preprocess_columns(dataset)?;
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
    static ref INDEX_RE: Regex = Regex::new(r"^index\(([0-9]+)\)$").unwrap();
}

lazy_static! {
    static ref REGEX_RE: Regex = Regex::new(r"^regex\('(.+)'\)$").unwrap();
}

impl ItemSpecs {
    /// Preprocesses columns with index and regex notation
    fn preprocess_columns(&mut self, dataset: &DatasetSpecs) -> Result<()> {
        let mut indexed_keys = HashMap::new();
        let mut reader = csv::ReaderBuilder::new()
            .delimiter(dataset.separator as u8)
            .from_path(&dataset.path)
            .context(format!("Could not read file with path {:?}", &dataset.path))?;
        let headers = reader.headers()?;

        for (key, render_column_specs) in self.render_table.as_ref().unwrap().iter() {
            let get_first_match_group = |regex: &Regex| {
                regex
                    .captures_iter(key)
                    .collect_vec()
                    .pop()
                    .unwrap()
                    .get(1)
                    .unwrap()
                    .as_str()
            };
            if INDEX_RE.is_match(key) {
                let index = usize::from_str(get_first_match_group(&INDEX_RE))?;
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
            } else if REGEX_RE.is_match(key) {
                let pattern = get_first_match_group(&REGEX_RE);
                let regex = Regex::new(pattern).context(format!(
                    "Failed to parse provided column regex {key}.",
                    key = key
                ))?;
                for header in headers.iter().filter(|header| regex.is_match(header)) {
                    if indexed_keys
                        .insert(header.to_string(), render_column_specs.clone())
                        .is_some()
                    {
                        bail!(ConfigError::DuplicateColumn {
                            column: header.to_string(),
                            table_path: dataset.path.clone()
                        })
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

fn default_display_mode() -> String {
    String::from("normal")
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct RenderColumnSpec {
    #[serde(default)]
    pub(crate) optional: bool,
    #[serde(default)]
    pub(crate) custom: Option<String>,
    #[serde(default = "default_display_mode")]
    pub(crate) display_mode: String,
    #[serde(default)]
    pub(crate) link_to_url: Option<String>,
    #[serde(default)]
    pub(crate) plot: Option<PlotSpec>,
    #[serde(default)]
    pub(crate) custom_plot: Option<CustomPlot>,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct RenderPlotSpec {
    #[serde(default, rename = "spec")]
    pub(crate) schema: Option<String>,
    #[serde(default, rename = "spec-path")]
    pub(crate) schema_path: Option<String>,
}

impl RenderPlotSpec {
    /// Reads schema for RenderPlotSpec from path and saves it under the schema attribute
    pub(crate) fn read_schema(&mut self) -> Result<()> {
        if let Some(path) = self.schema_path.as_ref() {
            let mut file = File::open(path)?;
            let mut contents = String::new();
            file.read_to_string(&mut contents)?;
            self.schema = Some(contents);
        }
        Ok(())
    }
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct LinkSpec {
    #[serde(default)]
    pub(crate) column: String,
    #[serde(default)]
    pub(crate) view: Option<String>,
    #[serde(default)]
    pub(crate) table_row: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct CustomPlot {
    #[serde(default, rename = "data")]
    plot_data: String,
    #[serde(default, rename = "spec")]
    schema: Option<String>,
    #[serde(default, rename = "spec-path")]
    schema_path: Option<String>,
    #[serde(default = "default_vega_controls")]
    vega_controls: String,
}

impl CustomPlot {
    /// Reads schema for CustomPlot from path and saves it under the schema attribute
    pub(crate) fn read_schema(&mut self) -> Result<()> {
        if let Some(path) = self.schema_path.as_ref() {
            let mut file = File::open(path)?;
            let mut contents = String::new();
            file.read_to_string(&mut contents)?;
            self.schema = Some(contents);
        }
        Ok(())
    }
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
    #[serde(default)]
    pub(crate) domain: Option<Vec<f32>>,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct Heatmap {
    #[serde(default, rename = "scale")]
    pub(crate) scale_type: String,
    #[serde(default)]
    color_scheme: String,
    #[serde(default, rename = "range")]
    color_range: Vec<String>,
    #[serde(default)]
    pub(crate) domain: Option<Vec<String>>,
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
            optional: false,
            custom: None,
            display_mode: "normal".to_string(),
            link_to_url: Some(String::from("https://www.rust-lang.org")),
            plot: None,
            custom_plot: None,
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
            default_view: None,
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
            schema: Some(
                "{'$schema': 'https://vega.github.io/schema/vega-lite/v5.json'}\n".to_string(),
            ),
            schema_path: None,
        };

        let expected_links = HashMap::from([(
            "my-link".to_string(),
            LinkSpec {
                column: "test".to_string(),
                view: Some("other-table".to_string()),
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
            default_view: Some("table-a".to_string()),
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
                    view: other-table
    default-view: table-a
    views:
        plot-a:
            dataset: table-a
            desc: "my table"
            render-plot:
                spec: |
                    {'$schema': 'https://vega.github.io/schema/vega-lite/v5.json'}
    "#;

        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert_eq!(config, expected_config);
    }

    #[test]
    fn test_config_preprocessing() {
        let config = ItemsSpec::from_file(".examples/example-config.yaml").unwrap();
        let oscar_config = config
            .views
            .get("oscars")
            .unwrap()
            .render_table
            .as_ref()
            .unwrap();
        let expected_render_column_spec = RenderColumnSpec {
            optional: false,
            custom: None,
            display_mode: "detail".to_string(),
            link_to_url: None,
            plot: None,
            custom_plot: None,
        };
        assert_eq!(
            oscar_config.get("oscar_no").unwrap().to_owned(),
            expected_render_column_spec
        );
        assert_eq!(
            oscar_config.get("birth_mo").unwrap().to_owned(),
            expected_render_column_spec
        );
        assert_eq!(
            oscar_config.get("birth_d").unwrap().to_owned(),
            expected_render_column_spec
        );
        assert_eq!(
            oscar_config.get("birth_y").unwrap().to_owned(),
            expected_render_column_spec
        );
    }
}

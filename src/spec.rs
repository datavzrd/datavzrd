use crate::render::portable::get_column_domain;
use crate::render::portable::DatasetError;
use crate::spec::ConfigError::{
    ConflictingConfiguration, LinkToMissingView, LogScaleDomainIncludesZero, LogScaleIncludesZero,
    MissingLinkoutColumn, PlotAndTablePresentConfiguration, UnsupportedColorScheme,
    ValueOutsideDomain, WrongColumnTypeMidDomain, WrongDomainLengthWithMidDomain,
    WrongRangeLengthWithMidDomain,
};
use crate::utils::column_position;
use crate::utils::column_type::{classify_table, ColumnType};
use anyhow::{anyhow, Result};
use anyhow::{bail, Context};
use derefable::Derefable;
use fancy_regex::Regex;
use itertools::Itertools;
use lazy_static::lazy_static;

use crate::spells::SpellSpec;
use format_serde_error::SerdeError;
use serde::Deserialize;
use serde::Serialize;
use std::borrow::BorrowMut;
use std::collections::HashMap;
use std::fmt::Debug;
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use thiserror::Error;

#[derive(Derefable, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct ItemsSpec {
    #[serde(default, rename = "name")]
    pub(crate) report_name: String,
    pub(crate) datasets: HashMap<String, DatasetSpecs>,
    #[deref]
    pub(crate) default_view: Option<String>,
    #[serde(default = "default_single_page_threshold")]
    pub(crate) max_in_memory_rows: usize,
    pub(crate) views: HashMap<String, ItemSpecs>,
    pub(crate) aux_libraries: Option<Vec<String>>,
    #[serde(default)]
    pub(crate) webview_controls: bool,
}

impl ItemsSpec {
    pub(crate) fn from_file<P: AsRef<Path> + Debug>(path: P) -> Result<ItemsSpec> {
        let config_file = fs::read_to_string(&path).context(format!(
            "Could not find config file under given path {:?}",
            &path
        ))?;
        let mut items_spec: ItemsSpec = serde_yaml::from_str(&config_file)
            .map_err(|err| SerdeError::new(config_file.to_string(), err))?;
        for (_, spec) in items_spec.views.iter_mut() {
            if let Some(spell) = spec.spell.as_ref() {
                let rendered_spec = spell.render_item_spec()?;
                *spec = spec.merge_item_specs(&rendered_spec)?;
            }
            if spec.render_table.is_some() && spec.render_plot.is_none() {
                let dataset = match items_spec.datasets.get(spec.dataset.as_ref().unwrap()) {
                    Some(dataset) => dataset,
                    None => {
                        bail!(DatasetError::NotFound {
                            dataset_name: spec.dataset.as_ref().unwrap().clone()
                        })
                    }
                };
                spec.preprocess_columns(dataset, items_spec.max_in_memory_rows)?;
            }
        }
        Ok(items_spec)
    }

    pub(crate) fn needs_excel_sheet(&self) -> bool {
        self.datasets.values().any(|dataset| dataset.offer_excel)
    }

    pub(crate) fn validate(&self) -> Result<()> {
        if let Some(view) = &self.default_view {
            if !self.views.contains_key(view) {
                bail!(ConfigError::MissingDefaultView {
                    view: view.to_string()
                })
            }
        }
        for (name, view) in &self.views {
            if let Some(render_table) = &view.render_table {
                if view.datasets.is_none() {
                    if view.dataset.is_none() {
                        bail!(ConfigError::MissingDatasetProperty {
                            view: name.to_string()
                        })
                    }
                    if !self.datasets.contains_key(view.dataset.as_ref().unwrap()) {
                        bail!(ConfigError::MissingDataset {
                            dataset: view.dataset.as_ref().unwrap().to_string()
                        })
                    }
                    if !render_table.columns.is_empty() && view.render_plot.is_some() {
                        bail!(PlotAndTablePresentConfiguration {
                            view: name.to_string()
                        });
                    }
                    if let Some(headers) = &render_table.headers {
                        if headers.get(&0_u32).is_some() {
                            bail!(ConfigError::HeadersFirstColumnCustomized {
                                view: name.to_string()
                            })
                        }
                    }
                    let dataset = self.datasets.get(view.dataset.as_ref().unwrap()).unwrap();
                    let mut reader = dataset.reader()?;
                    let titles = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();
                    let column_types = classify_table(dataset)?;
                    for (column, render_columns) in &render_table.columns {
                        if !titles.contains(column) && !render_columns.optional {
                            bail!(ConfigError::MissingColumn {
                                column: column.to_string(),
                                view: name.to_string()
                            })
                        }
                        if titles.contains(column) {
                            let mut possible_conflicting = Vec::new();
                            if render_columns.ellipsis.is_some() {
                                possible_conflicting.push("ellipsis".to_string());
                            }
                            if render_columns.link_to_url.is_some() {
                                possible_conflicting.push("link-to-url".to_string());
                            }
                            if render_columns.custom.is_some() {
                                possible_conflicting.push("custom".to_string());
                            }
                            if render_columns.custom_plot.is_some() {
                                possible_conflicting.push("custom-plot".to_string());
                            }
                            if let Some(plot) = &render_columns.plot {
                                if plot.heatmap.is_some() {
                                    possible_conflicting.push("heatmap".to_string());
                                } else if plot.tick_plot.is_some() {
                                    possible_conflicting.push("ticks".to_string());
                                }
                            }
                            if possible_conflicting.len() > 1
                                && !(possible_conflicting.contains(&"heatmap".to_string())
                                    && possible_conflicting.contains(&"ellipsis".to_string())
                                    && possible_conflicting.len() == 2)
                            {
                                bail!(ConflictingConfiguration {
                                    view: name.to_string(),
                                    column: column.to_string(),
                                    conflict: possible_conflicting
                                })
                            }
                            if let Some(plot_spec) = &render_columns.plot {
                                let domain = if let Some(tick_plot) = &plot_spec.tick_plot {
                                    tick_plot.domain.clone()
                                } else if let Some(bar_plot) = &plot_spec.bar_plot {
                                    bar_plot.domain.clone()
                                } else if let Some(heatmap) = &plot_spec.heatmap {
                                    if !heatmap.color_scheme.is_empty()
                                        && column_types.get(column).unwrap().is_numeric()
                                        && !matches!(
                                            heatmap.color_scheme.to_lowercase().as_str(),
                                            "blues"
                                                | "greens"
                                                | "greys"
                                                | "oranges"
                                                | "purples"
                                                | "reds"
                                                | "viridis"
                                                | "inferno"
                                                | "magma"
                                                | "plasma"
                                                | "cividis"
                                        )
                                    {
                                        bail!(UnsupportedColorScheme {
                                            view: name.to_string(),
                                            column: column.to_string(),
                                            scheme: heatmap.color_scheme.to_string(),
                                        })
                                    }
                                    if heatmap.domain_mid.is_some() {
                                        if column_types
                                            .get(column)
                                            .is_some_and(|ct| !ct.is_numeric())
                                            && !dataset.is_empty()?
                                        {
                                            bail!(WrongColumnTypeMidDomain {
                                                view: name.to_string(),
                                                column: column.to_string(),
                                            })
                                        }
                                        if heatmap.color_range.0.len() != 3 {
                                            bail!(WrongRangeLengthWithMidDomain {
                                                view: name.to_string(),
                                                column: column.to_string(),
                                            })
                                        }
                                        if let Some(heatmap_domain) = &heatmap.domain {
                                            if heatmap_domain.len() != 3 {
                                                bail!(WrongDomainLengthWithMidDomain {
                                                    view: name.to_string(),
                                                    column: column.to_string(),
                                                })
                                            }
                                        }
                                    }
                                    if let Some(domain) = &heatmap.domain {
                                        if let Some(colum_type) = column_types.get(column) {
                                            if colum_type == &ColumnType::Float {
                                                Some(
                                                    domain
                                                        .iter()
                                                        .map(|d| f32::from_str(d).unwrap())
                                                        .collect_vec(),
                                                )
                                            } else {
                                                None
                                            }
                                        } else {
                                            None
                                        }
                                    } else {
                                        None
                                    }
                                } else {
                                    None
                                };
                                let scale_type = if let Some(tick_plot) = &plot_spec.tick_plot {
                                    Some(tick_plot.scale_type)
                                } else if let Some(bar_plot) = &plot_spec.bar_plot {
                                    Some(bar_plot.scale_type)
                                } else {
                                    plot_spec.heatmap.as_ref().map(|heatmap| heatmap.scale_type)
                                };
                                let clamp = if let Some(heatmap) = &plot_spec.heatmap {
                                    heatmap.clamp
                                } else {
                                    false
                                };
                                if let Some(domain) = domain {
                                    let mut reader = dataset.reader()?;
                                    let colum_pos = column_position(column, dataset)?;
                                    for record in reader.records()? {
                                        let value = record.get(colum_pos).unwrap();
                                        if let Ok(value) = value.parse::<f32>() {
                                            if (value < domain[0]
                                                || value > domain[domain.len() - 1])
                                                && !clamp
                                            {
                                                bail!(ValueOutsideDomain {
                                                    view: name.to_string(),
                                                    column: column.to_string(),
                                                    value
                                                })
                                            }
                                            if let Some(scale_type) = scale_type {
                                                if scale_type == ScaleType::Log && value <= 0_f32 {
                                                    bail!(LogScaleIncludesZero {
                                                        view: name.to_string(),
                                                        column: column.to_string(),
                                                        value
                                                    })
                                                }
                                            }
                                        }
                                    }
                                    if let Some(scale) = scale_type {
                                        if scale == ScaleType::Log
                                            && domain[0] <= 0_f32
                                            && 0_f32 <= domain[domain.len() - 1]
                                        {
                                            bail!(LogScaleDomainIncludesZero {
                                                view: name.to_string(),
                                                column: column.to_string(),
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (name, dataset) in &self.datasets {
            if let Some(linkouts) = &dataset.links {
                for (link_name, link) in linkouts {
                    let mut reader = dataset.reader()?;
                    let titles = reader.headers()?.iter().map(|s| s.to_owned()).collect_vec();
                    if !titles.contains(&link.column) {
                        bail!(MissingLinkoutColumn {
                            column: link.column.to_string(),
                            dataset: name.to_string(),
                            link: link_name.to_string(),
                        })
                    }
                    if let Some(table_row) = &link.table_row {
                        let (table, linked_column) = table_row
                            .split_once('/')
                            .expect("Missing expected delimiter / in table-row configuration.");
                        if let Some(table_spec) = self.views.get(table) {
                            if let Some(table_dataset) = &table_spec.dataset {
                                if let Some(dataset) = self.datasets.get(table_dataset) {
                                    let mut reader = dataset.reader()?;
                                    let titles = reader
                                        .headers()?
                                        .iter()
                                        .map(|s| s.to_owned())
                                        .collect_vec();
                                    if !titles.contains(&linked_column.to_string()) {
                                        bail!(ConfigError::LinkToMissingColumn {
                                            view: table.to_string(),
                                            column: linked_column.to_string(),
                                            link: link_name.to_string()
                                        })
                                    }
                                } else {
                                    bail!(ConfigError::MissingDataset {
                                        dataset: table_dataset.to_string()
                                    })
                                }
                            }
                        } else {
                            bail!(LinkToMissingView {
                                view: table.to_string(),
                                link: link_name.to_string()
                            })
                        }
                    }
                }
            }
        }
        Ok(())
    }
}

fn default_single_page_threshold() -> usize {
    20000_usize
}

fn default_separator() -> char {
    char::from_str(",").unwrap()
}

fn default_page_size() -> usize {
    20
}

fn default_header_size() -> usize {
    1_usize
}

fn default_render_table() -> Option<RenderTableSpecs> {
    Some(RenderTableSpecs {
        columns: HashMap::from([]),
        additional_columns: None,
        headers: None,
    })
}

fn default_links() -> Option<HashMap<String, LinkSpec>> {
    Some(HashMap::new())
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct DatasetSpecs {
    pub(crate) path: PathBuf,
    #[serde(default = "default_separator")]
    pub(crate) separator: char,
    #[serde(default = "default_header_size", rename = "headers")]
    pub(crate) header_rows: usize,
    #[serde(default = "default_links")]
    pub(crate) links: Option<HashMap<String, LinkSpec>>,
    #[serde(default)]
    pub(crate) offer_excel: bool,
}

impl DatasetSpecs {
    pub(crate) fn size(&self) -> Result<usize> {
        Ok(self.reader()?.records()?.count() - (self.header_rows - 1))
    }

    pub(crate) fn is_empty(&self) -> Result<bool> {
        Ok(self.size()? == 0)
    }

    pub(crate) fn reader(&self) -> Result<readervzrd::FileReader> {
        let path = &self
            .path
            .to_str()
            .ok_or(anyhow!("Failed to create dataset reader."))?;
        let reader = readervzrd::FileReader::new(path, Some(self.separator))?;
        Ok(reader)
    }

    /// Returns a hashmap counting the number of unique values of all columns of the dataset
    pub(crate) fn unique_column_values(&self) -> Result<HashMap<String, usize>> {
        let mut reader = self.reader()?;
        let headers = reader.headers()?.clone();
        let column_counts: HashMap<String, usize> = headers
            .iter()
            .enumerate()
            .map(|(index, column)| {
                let mut reader = self.reader().unwrap();
                (
                    column.to_string(),
                    reader
                        .records()
                        .unwrap()
                        .map(|row| row.get(index).unwrap().to_string())
                        .unique()
                        .collect_vec()
                        .len(),
                )
            })
            .collect();

        Ok(column_counts)
    }
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct ItemSpecs {
    #[serde(default)]
    pub(crate) hidden: bool,
    pub(crate) dataset: Option<String>,
    pub(crate) datasets: Option<HashMap<String, String>>,
    #[serde(default = "default_page_size")]
    pub(crate) page_size: usize,
    #[serde(skip)]
    pub(crate) single_page_page_size: usize,
    #[serde(rename = "desc")]
    pub(crate) description: Option<String>,
    #[serde(default = "default_render_table")]
    pub(crate) render_table: Option<RenderTableSpecs>,
    #[serde(default)]
    pub(crate) render_plot: Option<RenderPlotSpec>,
    #[serde(default)]
    pub(crate) render_html: Option<RenderHtmlSpec>,
    #[serde(default)]
    pub(crate) max_in_memory_rows: Option<usize>,
    #[serde(default)]
    pub(crate) spell: Option<SpellSpec>,
}

impl ItemSpecs {
    fn merge_item_specs(&self, other: &ItemSpecs) -> Result<ItemSpecs> {
        let mut merged = self.clone();
        merged.hidden = other.hidden;
        if let Some(dataset) = &other.dataset {
            merged.dataset = Some(dataset.to_string());
        }
        if let Some(datasets) = &other.datasets {
            merged.datasets = Some(datasets.clone());
        }
        merged.page_size = other.page_size;
        if let Some(description) = &other.description {
            merged.description = Some(description.to_string());
        }
        if let Some(render_table) = &other.render_table {
            merged.render_table = Some(render_table.clone());
        }
        if let Some(render_plot) = &other.render_plot {
            merged.render_plot = Some(render_plot.clone());
        }
        if let Some(render_html) = &other.render_html {
            merged.render_html = Some(render_html.clone());
        }
        if let Some(max_in_memory_rows) = &other.max_in_memory_rows {
            merged.max_in_memory_rows = Some(*max_in_memory_rows);
        }
        Ok(merged)
    }
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct RenderTableSpecs {
    #[serde(default)]
    pub(crate) columns: HashMap<String, RenderColumnSpec>,
    #[serde(default, rename = "add-columns")]
    pub(crate) additional_columns: Option<HashMap<String, AdditionalColumnSpec>>,
    #[serde(default)]
    pub(crate) headers: Option<HashMap<u32, HeaderSpecs>>,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct AdditionalColumnSpec {
    #[serde(default = "default_value_function")]
    pub(crate) value: String,
    #[serde(default)]
    pub(crate) display_mode: DisplayMode,
    #[serde(default)]
    pub(crate) custom_plot: Option<CustomPlot>,
    #[serde(default)]
    pub(crate) link_to_url: Option<LinkToUrlSpec>,
}

fn default_value_function() -> String {
    String::from("function(row) { return '' }")
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct HeaderSpecs {
    #[serde(default)]
    pub(crate) label: Option<String>,
    #[serde(default)]
    pub(crate) plot: Option<PlotSpec>,
    #[serde(default)]
    pub(crate) display_mode: HeaderDisplayMode,
    #[serde(default)]
    pub(crate) ellipsis: Option<u32>,
}

lazy_static! {
    static ref INDEX_RE: Regex = Regex::new(r"^index\(([0-9]+)\)$").unwrap();
}

lazy_static! {
    static ref REGEX_RE: Regex = Regex::new(r#"^regex\((?:'|")(.+)(?:'|")\)$"#).unwrap();
}

lazy_static! {
    static ref RANGE_RE: Regex = Regex::new(r"^range\(([0-9]+,[0-9]+)\)$").unwrap();
}

fn get_first_match_group(regex: &Regex, key: &str) -> String {
    regex
        .captures_iter(key)
        .collect_vec()
        .pop()
        .unwrap()
        .unwrap()
        .get(1)
        .unwrap()
        .as_str()
        .to_string()
}

impl ItemSpecs {
    /// Preprocesses columns with index and regex notation
    fn preprocess_columns(
        &mut self,
        dataset: &DatasetSpecs,
        single_page_threshold: usize,
    ) -> Result<()> {
        let mut indexed_keys = HashMap::new();
        let mut reader = dataset.reader()?;
        let rows = &reader.records()?.count();
        self.single_page_page_size = self.page_size;
        if rows <= &single_page_threshold {
            self.page_size = *rows;
        }
        let headers = dataset.reader()?.headers()?;
        if let Some(render_table) = self.render_table.borrow_mut() {
            for (title, render_column_specs) in render_table.columns.iter_mut() {
                render_column_specs.preprocess(dataset, title)?;
            }
        }
        for (key, render_column_specs) in self.render_table.as_ref().unwrap().columns.iter() {
            let mut apply_indexed_config = |index: usize| {
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
                Ok(())
            };
            if INDEX_RE.is_match(key).unwrap() {
                let index = usize::from_str(&get_first_match_group(&INDEX_RE, key))?;
                apply_indexed_config(index)?;
            } else if RANGE_RE.is_match(key).unwrap() {
                let group = get_first_match_group(&RANGE_RE, key);
                let range = group.split_once(',').unwrap();
                let from = usize::from_str(range.0)?;
                let to = usize::from_str(range.1)?;
                for index in from..to {
                    apply_indexed_config(index)?;
                }
            } else if REGEX_RE.is_match(key).unwrap() {
                let pattern = get_first_match_group(&REGEX_RE, key);
                let regex = Regex::new(&pattern)
                    .context(format!("Failed to parse provided column regex {key}."))?;
                for header in headers
                    .iter()
                    .filter(|header| regex.is_match(header).unwrap())
                {
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
        self.render_table = Some(RenderTableSpecs {
            columns: indexed_keys,
            additional_columns: self.render_table.clone().unwrap().additional_columns,
            headers: self.render_table.clone().unwrap().headers,
        });
        let mut rendered_spells = HashMap::new();
        for (key, render_column_specs) in self.render_table.as_ref().unwrap().columns.iter() {
            if let Some(spell) = &render_column_specs.spell {
                let spell_column_spec = spell.render_column_spec()?;
                rendered_spells.insert(
                    key.to_string(),
                    render_column_specs.merge_render_column_spec(spell_column_spec)?,
                );
            } else {
                rendered_spells.insert(key.to_string(), render_column_specs.clone());
            }
        }
        self.render_table = Some(RenderTableSpecs {
            columns: rendered_spells,
            additional_columns: self.render_table.clone().unwrap().additional_columns,
            headers: self.render_table.clone().unwrap().headers,
        });
        // Generate default RenderColumnSpecs for columns that are not specified in the config
        for header in headers {
            if !self
                .render_table
                .as_ref()
                .unwrap()
                .columns
                .contains_key(&header)
            {
                self.render_table
                    .as_mut()
                    .unwrap()
                    .columns
                    .insert(header.to_string(), Default::default());
            }
        }
        Ok(())
    }
}

fn default_precision() -> u32 {
    2_u32
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct RenderColumnSpec {
    #[serde(default)]
    pub(crate) optional: bool,
    #[serde(default = "default_precision")]
    pub(crate) precision: u32,
    #[serde(default)]
    pub(crate) label: Option<String>,
    #[serde(default)]
    pub(crate) custom: Option<String>,
    #[serde(default)]
    pub(crate) custom_path: Option<String>,
    #[serde(default)]
    pub(crate) display_mode: DisplayMode,
    #[serde(default)]
    pub(crate) link_to_url: Option<LinkToUrlSpec>,
    #[serde(default)]
    pub(crate) plot: Option<PlotSpec>,
    #[serde(default)]
    pub(crate) custom_plot: Option<CustomPlot>,
    #[serde(default)]
    pub(crate) ellipsis: Option<u32>,
    #[serde(default)]
    pub(crate) plot_view_legend: bool,
    #[serde(default)]
    pub(crate) spell: Option<SpellSpec>,
}

impl Default for RenderColumnSpec {
    fn default() -> Self {
        RenderColumnSpec {
            optional: false,
            precision: default_precision(),
            label: None,
            custom: None,
            custom_path: None,
            display_mode: DisplayMode::Normal,
            link_to_url: None,
            plot: None,
            custom_plot: None,
            ellipsis: None,
            plot_view_legend: false,
            spell: None,
        }
    }
}

impl RenderColumnSpec {
    fn merge_render_column_spec(&self, other: RenderColumnSpec) -> Result<RenderColumnSpec> {
        let mut merged = self.clone();
        merged.optional = other.optional;
        merged.precision = other.precision;
        if let Some(label) = &other.label {
            merged.label = Some(label.to_string());
        }
        if let Some(custom) = &other.custom {
            merged.custom = Some(custom.to_string());
        }
        merged.custom_path = None; // custom_path is not merged since it is already processed when spell is fetched.
        merged.display_mode = other.display_mode;
        if let Some(link_to_url) = &other.link_to_url {
            merged.link_to_url = Some(link_to_url.clone());
        }
        if let Some(plot) = &other.plot {
            merged.plot = Some(plot.clone());
        }
        if let Some(custom_plot) = &other.custom_plot {
            merged.custom_plot = Some(custom_plot.clone());
        }
        if let Some(ellipsis) = &other.ellipsis {
            merged.ellipsis = Some(*ellipsis);
        }
        merged.plot_view_legend = other.plot_view_legend;
        Ok(merged)
    }
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"))]
pub(crate) struct LinkToUrlSpec {
    #[serde(flatten)]
    pub(crate) entries: HashMap<String, LinkToUrlSpecEntry>,
    pub(crate) custom_content: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct LinkToUrlSpecEntry {
    url: String,
    #[serde(default = "default_new_window")]
    new_window: bool,
}

fn default_new_window() -> bool {
    true
}

#[derive(Default, Deserialize, Serialize, Debug, Clone, PartialEq, Copy)]
#[serde(rename_all = "lowercase")]
pub(crate) enum DisplayMode {
    #[default]
    Normal,
    Detail,
    Hidden,
}

#[derive(Default, Deserialize, Serialize, Debug, Clone, PartialEq, Copy)]
#[serde(rename_all = "lowercase")]
pub(crate) enum HeaderDisplayMode {
    #[default]
    Normal,
    Hidden,
}

impl RenderColumnSpec {
    fn preprocess(&mut self, dataset: &DatasetSpecs, title: &str) -> Result<()> {
        if !dataset.is_empty()? {
            if let Some(plot) = &mut self.plot {
                if let Some(ticks) = &mut plot.tick_plot {
                    ticks.preprocess(dataset)?;
                } else if let Some(heatmap) = &mut plot.heatmap {
                    heatmap.preprocess(dataset, title)?;
                } else if let Some(bars) = &mut plot.bar_plot {
                    bars.preprocess(dataset)?;
                }
            }
        }
        if let Some(path) = self.custom_path.as_ref() {
            let mut file = File::open(path)?;
            let mut contents = String::new();
            file.read_to_string(&mut contents)?;
            self.custom = Some(contents);
        }
        Ok(())
    }
}

impl TickPlot {
    fn preprocess(&mut self, dataset: &DatasetSpecs) -> Result<()> {
        if let Some(color_definition) = &mut self.color {
            color_definition.preprocess()?;
        }
        self.aux_domain_columns.preprocess(dataset)
    }
}

impl Heatmap {
    fn preprocess(&mut self, dataset: &DatasetSpecs, title: &str) -> Result<()> {
        self.aux_domain_columns.preprocess(dataset)?;
        match self.vega_type {
            Some(VegaType::Nominal) | Some(VegaType::Ordinal) => {
                self.scale_type = ScaleType::Ordinal;
                self.color_scheme = "category20".to_string();
            }
            Some(VegaType::Quantitative) => {
                self.scale_type = ScaleType::Linear;
                self.color_scheme = "blues".to_string();
            }
            _ => {}
        }
        if self.domain.is_none() {
            let d = get_column_domain(title, dataset, self)?;
            let domain: Vec<String> = if self.scale_type.is_quantitative() {
                let floating_domain: Vec<f64> = serde_json::from_str(&d)?;
                floating_domain.iter().map(|x| x.to_string()).collect()
            } else {
                serde_json::from_str(&d)?
            };
            self.domain = Some(domain);
        }
        if let Some(domain_mid) = &self.domain_mid {
            let old_domain = self.domain.as_mut().unwrap();
            old_domain.insert(1, domain_mid.to_string());
            self.domain = Some(old_domain.to_owned())
        }
        if !self.color_range.0.is_empty() {
            self.color_range.preprocess()?;
        }
        Ok(())
    }
}

impl BarPlot {
    fn preprocess(&mut self, dataset: &DatasetSpecs) -> Result<()> {
        if let Some(color_definition) = &mut self.color {
            color_definition.preprocess()?;
        }
        self.aux_domain_columns.preprocess(dataset)
    }
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
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
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct RenderHtmlSpec {
    pub(crate) script_path: String,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct LinkSpec {
    #[serde(default)]
    pub(crate) column: String,
    #[serde(default)]
    pub(crate) view: Option<String>,
    #[serde(default)]
    pub(crate) table_row: Option<String>,
    #[serde(default)]
    pub(crate) optional: bool,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct CustomPlot {
    #[serde(default, rename = "data")]
    pub(crate) plot_data: String,
    #[serde(default, rename = "spec")]
    pub(crate) schema: Option<String>,
    #[serde(default, rename = "spec-path")]
    pub(crate) schema_path: Option<String>,
    #[serde(default)]
    pub(crate) vega_controls: bool,
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

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct PlotSpec {
    #[serde(rename = "ticks")]
    pub(crate) tick_plot: Option<TickPlot>,
    pub(crate) heatmap: Option<Heatmap>,
    #[serde(rename = "bars")]
    pub(crate) bar_plot: Option<BarPlot>,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct TickPlot {
    #[serde(default, rename = "scale")]
    pub(crate) scale_type: ScaleType,
    #[serde(default)]
    pub(crate) domain: Option<Vec<f32>>,
    #[serde(default)]
    pub(crate) aux_domain_columns: AuxDomainColumns,
    #[serde(default)]
    pub(crate) color: Option<ColorDefinition>,
}
#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct ColorDefinition {
    #[serde(default, rename = "scale")]
    pub(crate) scale_type: ScaleType,
    #[serde(default, rename = "range")]
    pub(crate) color_range: ColorRange,
    #[serde(default)]
    pub(crate) domain: Option<Vec<String>>,
    #[serde(default)]
    pub(crate) domain_mid: Option<f32>,
}

impl ColorDefinition {
    fn preprocess(&mut self) -> Result<()> {
        self.color_range.preprocess()
    }
}

fn default_clamp() -> bool {
    true
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct Heatmap {
    #[serde(default, rename = "type")]
    pub(crate) vega_type: Option<VegaType>,
    #[serde(default, rename = "scale")]
    pub(crate) scale_type: ScaleType,
    #[serde(default = "default_clamp")]
    pub(crate) clamp: bool,
    #[serde(default)]
    pub(crate) color_scheme: String,
    #[serde(default, rename = "range")]
    pub(crate) color_range: ColorRange,
    #[serde(default)]
    pub(crate) domain: Option<Vec<String>>,
    #[serde(default)]
    pub(crate) domain_mid: Option<f32>,
    #[serde(default)]
    pub(crate) aux_domain_columns: AuxDomainColumns,
    #[serde(default)]
    pub(crate) custom_content: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq, Default)]
pub(crate) struct ColorRange(pub(crate) Vec<Color>);

impl ColorRange {
    fn preprocess(&mut self) -> Result<()> {
        self.0.iter_mut().try_for_each(|color| color.preprocess())
    }
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
pub(crate) struct Color(pub(crate) String);

impl Color {
    fn preprocess(&mut self) -> Result<()> {
        if let Some(hex) = COLOR_MAPPING.get(self.0.as_str()) {
            self.0 = hex.to_string()
        }
        Ok(())
    }
}

lazy_static! {
    static ref COLOR_MAPPING: HashMap<&'static str, &'static str> = {
        let mut m = HashMap::new();
        m.insert("red", "#d62728");
        m.insert("blue", "#1f77b4");
        m.insert("yellow", "#eeca3b");
        m.insert("green", "#2ca02c");
        m.insert("purple", "#9467bd");
        m.insert("orange", "#ff7f0e");
        m.insert("pink", "#e377c2");
        m.insert("black", "#000000");
        m.insert("white", "#ffffff");
        m.insert("gray", "#7f7f7f");
        m.insert("grey", "#7f7f7f");
        m.insert("brown", "#8c564b");
        m.insert("olive", "#bcbd22");
        m.insert("cyan", "#17becf");
        m.insert("lime", "#98df8a");
        m.insert("magenta", "#ff9896");
        m
    };
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct BarPlot {
    #[serde(default, rename = "scale")]
    pub(crate) scale_type: ScaleType,
    #[serde(default)]
    pub(crate) domain: Option<Vec<f32>>,
    #[serde(default)]
    pub(crate) aux_domain_columns: AuxDomainColumns,
    #[serde(default)]
    pub(crate) color: Option<ColorDefinition>,
}

#[derive(Default, Deserialize, Serialize, Debug, Clone, PartialEq, Copy)]
#[serde(rename_all = "lowercase")]
pub(crate) enum ScaleType {
    Linear,
    Pow,
    Sqrt,
    SymLog,
    Log,
    Time,
    Utc,
    Ordinal,
    Band,
    Point,
    #[default]
    None,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq, Copy)]
#[serde(rename_all = "lowercase")]
pub(crate) enum VegaType {
    Nominal,
    Ordinal,
    Quantitative,
    None,
}

impl ScaleType {
    pub(crate) fn is_quantitative(&self) -> bool {
        matches!(
            self,
            ScaleType::Linear
                | ScaleType::Pow
                | ScaleType::Sqrt
                | ScaleType::SymLog
                | ScaleType::Log
        )
    }
}

#[derive(Default, Deserialize, Serialize, Debug, Clone, PartialEq, Eq)]
pub struct AuxDomainColumns(pub(crate) Option<Vec<String>>);

impl AuxDomainColumns {
    fn preprocess(&mut self, dataset: &DatasetSpecs) -> Result<()> {
        let mut reader = dataset.reader()?;
        let headers = reader.headers()?;
        let mut new_tick_plot_aux_domain_columns = Vec::new();
        if let Some(columns) = &self.0 {
            for column in columns {
                if REGEX_RE.is_match(column).unwrap() {
                    let pattern = get_first_match_group(&REGEX_RE, column);
                    let regex = Regex::new(&pattern)
                        .context(format!("Failed to parse provided column regex {column}."))?;
                    for header in headers
                        .iter()
                        .filter(|header| regex.is_match(header).unwrap())
                    {
                        new_tick_plot_aux_domain_columns.push(header.to_string());
                    }
                } else if RANGE_RE.is_match(column).unwrap() {
                    let group = get_first_match_group(&RANGE_RE, column);
                    let range = group.split_once(',').unwrap();
                    let from = usize::from_str(range.0)?;
                    let to = usize::from_str(range.1)?;
                    for index in from..to {
                        new_tick_plot_aux_domain_columns.push(
                            headers
                                .get(index)
                                .context(
                                    "Failed to apply given range {range} for aux-domain-columns.",
                                )
                                .unwrap()
                                .to_string(),
                        );
                    }
                } else {
                    new_tick_plot_aux_domain_columns.push(column.to_string());
                }
            }
        }
        self.0 = Some(new_tick_plot_aux_domain_columns);
        Ok(())
    }
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
    #[error("View {view:?} is missing dataset property.")]
    MissingDatasetProperty { view: String },
    #[error("Could not find dataset named {dataset:?} in given config.")]
    MissingDataset { dataset: String },
    #[error("Could not find default view named {view:?} in given config.")]
    MissingDefaultView { view: String },
    #[error("View {view:?} consists of a configuration with render-plot and render-table present while only one should be present. If you want both please define two separate views.")]
    PlotAndTablePresentConfiguration { view: String },
    #[error("Found conflicting render-table configuration for column {column:?} of view {view:?}. The conflicting configuration are {conflict:?}.")]
    ConflictingConfiguration {
        view: String,
        column: String,
        conflict: Vec<String>,
    },
    #[error("Given domain for column {column:?} of view {view:?} does not fit value {value:?}.")]
    ValueOutsideDomain {
        view: String,
        column: String,
        value: f32,
    },
    #[error("Given argument mid-domain for domain for column {column:?} of view {view:?} requires the dataset to only include numerical values in column {column:?}.")]
    WrongColumnTypeMidDomain { view: String, column: String },
    #[error("Given domain for column {column:?} of view {view:?} does not allow usage with mid-domain. Please use a domain length of 2.")]
    WrongDomainLengthWithMidDomain { view: String, column: String },
    #[error("Given range for column {column:?} of view {view:?} with specified domain-mid must be of length 3.")]
    WrongRangeLengthWithMidDomain { view: String, column: String },
    #[error(
        "Given domain for column {column:?} of view {view:?} with scale type log cannot include 0."
    )]
    LogScaleDomainIncludesZero { view: String, column: String },
    #[error(
    "Given color-scheme {scheme:?} for numeric column {column:?} of view {view:?} is not supported. Please use a sequential scheme from d3."
    )]
    UnsupportedColorScheme {
        view: String,
        column: String,
        scheme: String,
    },
    #[error(
    "Given value for column {column:?} of view {view:?} with scale type log cannot include value {value:?}."
    )]
    LogScaleIncludesZero {
        view: String,
        column: String,
        value: f32,
    },
    #[error(
        "Could not find column named {column:?} in given dataset {dataset:?} in linkout {link:?}."
    )]
    MissingLinkoutColumn {
        column: String,
        dataset: String,
        link: String,
    },
    #[error("Could not find column named '{column}' in the dataset that is used by view {view}.")]
    MissingColumn { column: String, view: String },
    #[error(
        "Could not find view named {view:?} in given config that is referred to with {link:?}."
    )]
    LinkToMissingView { view: String, link: String },
    #[error("Could not find column named {column:?} in {view:?} in given config that is referred to with {link:?}.")]
    LinkToMissingColumn {
        view: String,
        column: String,
        link: String,
    },
    #[error("Cannot customize the first header row of view {view:?} in given config. Please start customizing additional headers at index 1.")]
    HeadersFirstColumnCustomized { view: String },
}

#[cfg(test)]
mod tests {
    use crate::spec::{
        default_links, default_page_size, default_precision, default_render_table,
        default_single_page_threshold, AuxDomainColumns, ColorRange, DatasetSpecs, DisplayMode,
        HeaderDisplayMode, HeaderSpecs, Heatmap, ItemSpecs, ItemsSpec, LinkSpec, LinkToUrlSpec,
        LinkToUrlSpecEntry, PlotSpec, RenderColumnSpec, RenderHtmlSpec, RenderPlotSpec,
        RenderTableSpecs, ScaleType, TickPlot,
    };
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_table_config_deserialization() {
        let expected_render_columns = RenderColumnSpec {
            precision: default_precision(),
            optional: false,
            custom: None,
            custom_path: None,
            display_mode: DisplayMode::Normal,
            link_to_url: Some(LinkToUrlSpec {
                custom_content: None,
                entries: HashMap::from([(
                    "Rust".to_string(),
                    LinkToUrlSpecEntry {
                        url: "https://www.rust-lang.org".to_string(),
                        new_window: true,
                    },
                )]),
            }),
            plot: None,
            custom_plot: None,
            ellipsis: None,
            plot_view_legend: false,
            label: None,
            spell: None,
        };

        let expected_dataset_spec = DatasetSpecs {
            path: PathBuf::from("test.tsv"),
            separator: ',',
            header_rows: 1,
            links: default_links(),
            offer_excel: false,
        };

        let expected_table_spec = ItemSpecs {
            hidden: false,
            dataset: Some("table-a".to_string()),
            datasets: None,
            page_size: 100,
            single_page_page_size: 0,
            description: None,
            render_table: Some(RenderTableSpecs {
                columns: HashMap::from([("x".to_string(), expected_render_columns)]),
                additional_columns: None,
                headers: None,
            }),
            render_plot: None,
            render_html: None,
            max_in_memory_rows: None,
            spell: None,
        };

        let expected_config = ItemsSpec {
            datasets: HashMap::from([("table-a".to_string(), expected_dataset_spec)]),
            default_view: None,
            max_in_memory_rows: 20000,
            views: HashMap::from([("table-a".to_string(), expected_table_spec)]),
            report_name: "my_report".to_string(),
            aux_libraries: None,
            webview_controls: false,
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
            render-table:
                columns:
                    x:
                        link-to-url:
                            Rust:
                                url: https://www.rust-lang.org
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
                optional: false,
            },
        )]);

        let expected_dataset_spec = DatasetSpecs {
            path: PathBuf::from("test.tsv"),
            separator: ',',
            header_rows: 1,
            links: Some(expected_links),
            offer_excel: false,
        };

        let expected_item_spec = ItemSpecs {
            hidden: false,
            dataset: Some("table-a".to_string()),
            datasets: None,
            page_size: default_page_size(),
            single_page_page_size: 0,
            description: Some("my table".parse().unwrap()),
            render_table: default_render_table(),
            render_plot: Some(expected_render_plot),
            render_html: None,
            max_in_memory_rows: None,
            spell: None,
        };

        let expected_config = ItemsSpec {
            datasets: HashMap::from([("table-a".to_string(), expected_dataset_spec)]),
            default_view: Some("table-a".to_string()),
            max_in_memory_rows: 20000,
            views: HashMap::from([("plot-a".to_string(), expected_item_spec)]),
            report_name: "".to_string(),
            aux_libraries: None,
            webview_controls: false,
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
    fn test_html_config_deserialization() {
        let expected_render_html = RenderHtmlSpec {
            script_path: "my-script.js".to_string(),
        };

        let expected_dataset_spec = DatasetSpecs {
            path: PathBuf::from("test.tsv"),
            separator: ',',
            header_rows: 1,
            links: Some(HashMap::from([])),
            offer_excel: false,
        };

        let expected_item_spec = ItemSpecs {
            hidden: false,
            dataset: Some("table-a".to_string()),
            datasets: None,
            page_size: default_page_size(),
            single_page_page_size: 0,
            description: Some("my table".parse().unwrap()),
            render_table: default_render_table(),
            render_plot: None,
            render_html: Some(expected_render_html),
            max_in_memory_rows: None,
            spell: None,
        };

        let expected_config = ItemsSpec {
            datasets: HashMap::from([("table-a".to_string(), expected_dataset_spec)]),
            default_view: None,
            max_in_memory_rows: 20000,
            views: HashMap::from([("plot-a".to_string(), expected_item_spec)]),
            report_name: "".to_string(),
            aux_libraries: Some(Vec::from(["https://cdnjs.org/d3.js".to_string()])),
            webview_controls: false,
        };

        let raw_config = r#"
            datasets:
                table-a:
                    path: test.tsv
            views:
                plot-a:
                    dataset: table-a
                    desc: "my table"
                    render-html:
                        script-path: my-script.js
            aux-libraries:
                - https://cdnjs.org/d3.js
            "#;

        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert_eq!(config, expected_config);
    }

    #[test]
    fn test_additional_header_config_deserialization() {
        let expected_item_spec = ItemSpecs {
            hidden: false,
            dataset: Some("table-a".to_string()),
            datasets: None,
            page_size: default_page_size(),
            single_page_page_size: 0,
            description: None,
            render_table: Some(RenderTableSpecs {
                columns: Default::default(),
                additional_columns: None,
                headers: Some(HashMap::from([(
                    1_u32,
                    HeaderSpecs {
                        label: Some("my header".to_string()),
                        plot: Some(PlotSpec {
                            tick_plot: None,
                            heatmap: Some(Heatmap {
                                vega_type: None,
                                scale_type: ScaleType::Ordinal,
                                clamp: true,
                                color_scheme: "category20".to_string(),
                                color_range: ColorRange(vec![]),
                                domain: None,
                                domain_mid: None,
                                aux_domain_columns: Default::default(),
                                custom_content: None,
                            }),
                            bar_plot: None,
                        }),
                        display_mode: HeaderDisplayMode::Normal,
                        ellipsis: None,
                    },
                )])),
            }),
            render_plot: None,
            render_html: None,
            max_in_memory_rows: None,
            spell: None,
        };

        let expected_config = ItemsSpec {
            datasets: HashMap::from([(
                "table-a".to_string(),
                DatasetSpecs {
                    path: PathBuf::from("test.tsv"),
                    separator: ',',
                    header_rows: 2,
                    links: Some(HashMap::from([])),
                    offer_excel: false,
                },
            )]),
            default_view: None,
            max_in_memory_rows: 20000,
            views: HashMap::from([("plot-a".to_string(), expected_item_spec)]),
            report_name: "".to_string(),
            aux_libraries: None,
            webview_controls: false,
        };

        let raw_config = r#"
            datasets:
                table-a:
                    headers: 2
                    path: test.tsv
            views:
                plot-a:
                    dataset: table-a
                    render-table:
                        headers:
                            1:
                                label: my header
                                plot:
                                    heatmap:
                                        scale: ordinal
                                        color-scheme: category20
            "#;

        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert_eq!(config, expected_config);
    }

    #[test]
    fn test_valid_config_validation() {
        let config = ItemsSpec::from_file(".examples/example-config.yaml").unwrap();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_missing_dataset_config_validation() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: tests/data/uniform_datatypes.csv
            views:
                plot-b:
                    dataset: table-b
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_missing_default_view_config_validation() {
        let raw_config = r#"
            default-view: table-b
            datasets:
                table-a:
                    path: tests/data/uniform_datatypes.csv
            views:
                table-a:
                    dataset: table-a
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_value_outside_domain_config_validation() {
        let raw_config = r#"
            datasets:
                oscars:
                    path: ".examples/data/oscars.csv"
            views:
                oscars:
                    dataset: oscars
                    render-table:
                        columns:
                            age:
                                plot:
                                    ticks:
                                        scale: linear
                                        domain:
                                            - 50
                                            - 60
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_log_scale_includes_zero_config_validation() {
        let raw_config = r#"
            datasets:
                oscars:
                    path: ".examples/data/oscars.csv"
            views:
                oscars:
                    dataset: oscars
                    render-table:
                        columns:
                            age:
                                plot:
                                    ticks:
                                        scale: log
                                        domain:
                                            - 0
                                            - 100
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_customize_first_header_row_view_config_validation() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: tests/data/uniform_datatypes.csv
            views:
                table-a:
                    dataset: table-a
                    render-table:
                        headers:
                            0:
                                plot:
                                    heatmap:
                                        scale: ordinal
                                        color-scheme: category20
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_missing_view_in_dataset_link_config_validation() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: .examples/data/oscars.csv
                    links:
                        link to non existing view:
                            column: age
                            table-row: some-non-existent-view/some-column
            views:
                table-a:
                    dataset: table-a
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_missing_column_in_dataset_link_config_validation() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: .examples/data/oscars.csv
                    links:
                        link from non existing column:
                            column: non-existing-column
                            view: other-table-a
            views:
                table-a:
                    dataset: table-a
                other-table-a:
                    dataset: table-a
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_missing_column_in_linked_table_row_link_config_validation() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: .examples/data/oscars.csv
                    links:
                        link to non existing column:
                            column: age
                            table-row: "other-table-a/non existing column"
            views:
                table-a:
                    dataset: table-a
                other-table-a:
                    dataset: table-a
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_conflicting_config_validation() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: tests/data/uniform_datatypes.csv
            views:
                table-a:
                    dataset: table-a
                    render-table:
                        columns:
                            some-column:
                                plot:
                                    ticks:
                                        scale: linear
                                ellipsis: 25
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_wrong_scale_config_validation() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: tests/data/uniform_datatypes.csv
            views:
                table-a:
                    dataset: table-a
                    render-table:
                        columns:
                            some-column:
                                plot:
                                    heatmap:
                                        scale: inverse-quadruplic
            "#;
        let config = serde_yaml::from_str::<ItemSpecs>(raw_config).is_err();
        assert!(config);
    }

    #[test]
    fn test_plot_and_table_present_config_validation() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: tests/data/uniform_datatypes.csv
            views:
                table-a:
                    dataset: table-a
                    render-table:
                        columns:
                            x:
                                link-to-url:
                                    lmgtfy:
                                        url: "https://lmgtfy.app/?q=Is {name} in {movie}?"
                    render-plot:
                        spec-path: ".examples/specs/movies.vl.json"
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_unknown_keyword() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: tests/data/uniform_datatypes.csv
            non-existing-keyword: 42
            views:
                table-a:
                    dataset: table-a
            "#;
        let err = serde_yaml::from_str::<ItemsSpec>(raw_config).unwrap_err();
        assert_eq!(err.to_string(), "unknown field `non-existing-keyword`, expected one of `name`, `datasets`, `default-view`, `max-in-memory-rows`, `views`, `aux-libraries`, `webview-controls` at line 5 column 13");
    }

    #[test]
    fn test_config_preprocessing() {
        let config = ItemsSpec::from_file(".examples/example-config.yaml").unwrap();
        let oscar_config = &config
            .views
            .get("oscars")
            .unwrap()
            .render_table
            .as_ref()
            .unwrap()
            .columns;
        let expected_render_column_spec = RenderColumnSpec {
            precision: default_precision(),
            optional: false,
            custom: None,
            custom_path: None,
            display_mode: DisplayMode::Detail,
            link_to_url: None,
            plot: None,
            custom_plot: None,
            ellipsis: None,
            plot_view_legend: false,
            label: None,
            spell: None,
        };
        let expected_render_column_spec_oscar_no = RenderColumnSpec {
            precision: default_precision(),
            optional: false,
            custom: None,
            custom_path: None,
            display_mode: DisplayMode::Hidden,
            link_to_url: None,
            plot: None,
            custom_plot: None,
            ellipsis: None,
            plot_view_legend: false,
            label: None,
            spell: None,
        };
        assert_eq!(
            oscar_config.get("oscar_no").unwrap().to_owned(),
            expected_render_column_spec_oscar_no
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

    #[test]
    fn test_aux_domain_columns_preprocessing() {
        let raw_config = r#"
            datasets:
                table-a:
                    path: .examples/data/oscars.csv
            views:
                table-a:
                    dataset: table-a
                    render-table:
                        columns:
                            age:
                                plot:
                                    ticks:
                                        scale: linear
                                        aux-domain-columns:
                                            - regex('birth_.+')
            "#;
        let config: ItemsSpec = serde_yaml::from_str(raw_config).unwrap();
        let mut item_specs = config.views.get("table-a").unwrap().clone();
        item_specs
            .preprocess_columns(
                config.datasets.get("table-a").unwrap(),
                default_single_page_threshold(),
            )
            .unwrap();
        let expected_ticks = TickPlot {
            scale_type: ScaleType::Linear,
            domain: None,
            aux_domain_columns: AuxDomainColumns(Some(vec![
                "birth_mo".to_string(),
                "birth_d".to_string(),
                "birth_y".to_string(),
            ])),
            color: None,
        };
        let expected_plot = PlotSpec {
            tick_plot: Some(expected_ticks),
            heatmap: None,
            bar_plot: None,
        };
        let expected_render_columns = RenderColumnSpec {
            optional: false,
            precision: default_precision(),
            label: None,
            custom: None,
            custom_path: None,
            display_mode: DisplayMode::default(),
            link_to_url: None,
            plot: Some(expected_plot),
            custom_plot: None,
            ellipsis: None,
            plot_view_legend: false,
            spell: None,
        };
        let expected_item_specs = ItemSpecs {
            hidden: false,
            dataset: Some("table-a".to_string()),
            datasets: None,
            page_size: 184_usize,
            single_page_page_size: default_page_size(),
            description: None,
            render_table: Some(RenderTableSpecs {
                columns: HashMap::from([
                    ("age".to_string(), expected_render_columns),
                    ("oscar_no".parse().unwrap(), Default::default()),
                    ("oscar_yr".parse().unwrap(), Default::default()),
                    ("award".parse().unwrap(), Default::default()),
                    ("name".parse().unwrap(), Default::default()),
                    ("movie".parse().unwrap(), Default::default()),
                    ("birth place".parse().unwrap(), Default::default()),
                    ("birth date".parse().unwrap(), Default::default()),
                    ("birth_mo".parse().unwrap(), Default::default()),
                    ("birth_d".parse().unwrap(), Default::default()),
                    ("birth_y".parse().unwrap(), Default::default()),
                    (
                        "overall_wins_and_overall_nominations".parse().unwrap(),
                        Default::default(),
                    ),
                ]),
                additional_columns: None,
                headers: None,
            }),
            render_plot: None,
            render_html: None,
            max_in_memory_rows: None,
            spell: None,
        };

        assert_eq!(item_specs, expected_item_specs);
    }

    #[test]
    fn test_dataset_size() {
        let config = ItemsSpec::from_file(".examples/example-config.yaml").unwrap();
        assert_eq!(config.datasets.get("movies").unwrap().size().unwrap(), 184);
    }

    #[test]
    fn test_dataset_size_with_json() {
        let dataset = DatasetSpecs {
            path: PathBuf::from("tests/data/uniform_datatypes.json"),
            separator: ',',
            header_rows: 1,
            links: None,
            offer_excel: false,
        };
        assert_eq!(dataset.size().unwrap(), 4);
    }

    #[test]
    fn test_dataset_empty() {
        let empty_dataset = DatasetSpecs {
            path: PathBuf::from("tests/data/empty_table.csv"),
            separator: ',',
            header_rows: 4,
            links: None,
            offer_excel: false,
        };
        assert!(empty_dataset.is_empty().unwrap());
    }

    #[test]
    fn test_dataset_unique_column_values() {
        let config = ItemsSpec::from_file(".examples/example-config.yaml").unwrap();
        let unique_column_values = config
            .datasets
            .get("oscars")
            .unwrap()
            .unique_column_values()
            .unwrap();
        assert_eq!(unique_column_values.get("oscar_yr").unwrap(), &91_usize);
        assert_eq!(unique_column_values.get("award").unwrap(), &2_usize);
    }
}

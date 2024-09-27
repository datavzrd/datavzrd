use crate::spec::{ItemSpecs, RenderColumnSpec};
use anyhow::Result;
use fancy_regex::Regex;
use lazy_static::lazy_static;
use pyo3::prelude::*;
use pyo3::types::IntoPyDict;
use pyo3::types::PyModule;
use reqwest::blocking::get;
use serde::Deserialize;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct SpellSpec {
    pub(crate) url: String,
    #[serde(default)]
    pub(crate) with: HashMap<String, String>,
}

lazy_static! {
    static ref SPELL_RE: Regex = Regex::new(r"^(v\d+\.\d+\.\d+)/([^/]+)/(.+)$").unwrap();
}

impl SpellSpec {
    pub(crate) fn render_column_spec(&self) -> Result<RenderColumnSpec> {
        let mut specs: RenderColumnSpec = self.render_spec()?;
        if let Some(path) = &specs.custom_path {
            let contents = fetch_content(&self.url, path)?;
            specs.custom = Some(contents);
        }
        Ok(specs)
    }

    pub(crate) fn render_item_spec(&self) -> Result<ItemSpecs> {
        let mut specs: ItemSpecs = self.render_spec()?;
        if let Some(render_table) = &specs.clone().render_table {
            for (column, column_spec) in &render_table.columns {
                if let Some(path) = &column_spec.custom_path {
                    let mut column_spec = column_spec.clone();
                    let contents = fetch_content(&self.url, path)?;
                    column_spec.custom = Some(contents);
                    specs
                        .render_table
                        .as_mut()
                        .unwrap()
                        .columns
                        .insert(column.clone(), column_spec);
                }
            }
        }
        Ok(specs)
    }

    fn render_spec<T: serde::de::DeserializeOwned>(&self) -> Result<T> {
        let template = fetch_spell(&self.url)?;
        let yaml_string = call_process_yaml(&template, self.with.clone())?;
        let yaml = serde_yaml::from_str(&yaml_string)?;
        Ok(yaml)
    }
}

pub fn fetch_content(url: &String, relative_path: &String) -> Result<String> {
    if url.starts_with("http://") || url.starts_with("https://") {
        let base_url = url.rsplit_once('/').unwrap_or(("", "")).0;
        let full_url = format!("{}/{}", base_url, relative_path.trim_start_matches('/'));
        let content = get(full_url)?.text()?;
        Ok(content)
    } else {
        let path = Path::new(url).join(relative_path);
        let content = fs::read_to_string(path)?;
        Ok(content)
    }
}

pub fn fetch_spell(input: &str) -> Result<String> {
    if let Ok(Some(captures)) = SPELL_RE.captures(input) {
        let version = captures.get(1).unwrap().as_str();
        let category = captures.get(2).unwrap().as_str();
        let spell = captures.get(3).unwrap().as_str();
        fetch_from_url(&format!("https://github.com/datavzrd/datavzrd-spells/raw/{version}/{category}/{spell}/spell.yaml"))
    } else if input.starts_with("http://") || input.starts_with("https://") {
        fetch_from_url(input)
    } else {
        fetch_from_file(input)
    }
}

/// Fetches content from a URL.
fn fetch_from_url(url: &str) -> Result<String> {
    let response = get(url)?.text()?;
    Ok(response)
}

/// Fetches content from a local file.
fn fetch_from_file(path: &str) -> Result<String> {
    let content = fs::read_to_string(Path::new(path))?;
    Ok(content)
}

/// Call the `process_yaml` function from the Python `yte` module.
fn call_process_yaml(template: &str, variables: HashMap<String, String>) -> Result<String> {
    Python::with_gil(|py| {
        let yte_module = PyModule::import_bound(py, "yte")?;
        let kwargs = [("variables".to_string(), variables)].into_py_dict_bound(py);
        let result = yte_module
            .getattr("process_yaml")?
            .call((template,), Some(kwargs).as_ref())?;
        let yaml_module = PyModule::import_bound(py, "yaml")?;
        let yaml_string = yaml_module
            .call_method1("dump", (result,))?
            .extract::<String>()?;
        Ok(yaml_string)
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::spec::{Color, ColorRange, Heatmap, PlotSpec, ScaleType};

    #[test]
    fn call_process_yaml_valid_input() {
        let yaml_content = r#"
        ?if True:
          foo: 1
        ?elif False:
          bar: 2
        ?else:
          bar: 1"#;
        let result = call_process_yaml(yaml_content, HashMap::new()).unwrap();
        assert_eq!(result, "foo: 1\n");
    }

    #[test]
    fn call_process_yaml_with_variables() {
        let yaml_content = r#"
        ?if True:
          foo: ?two
        ?elif False:
          bar: 2
        ?else:
          bar: 1"#;
        let result = call_process_yaml(
            yaml_content,
            HashMap::from([("two".to_string(), "2".to_string())]),
        )
        .unwrap();
        assert_ne!(result, "bar: 2\n");
    }

    #[test]
    fn test_render_spell() {
        let spell = SpellSpec {
            url: "tests/spells/p-value.spell.yaml".to_string(),
            with: HashMap::from([(String::from("significance_threshold"), String::from("0.05"))]),
        };
        let result = spell.render_column_spec().unwrap();
        let expected = RenderColumnSpec {
            optional: false,
            precision: 2,
            label: None,
            custom: None,
            custom_path: None,
            display_mode: Default::default(),
            link_to_url: None,
            plot: Some(PlotSpec {
                tick_plot: None,
                heatmap: Some(Heatmap {
                    vega_type: None,
                    scale_type: ScaleType::Linear,
                    clamp: true,
                    color_scheme: "".to_string(),
                    color_range: ColorRange {
                        0: vec![
                            Color("#a1d99b".to_string()),
                            Color("white".to_string()),
                            Color("#fdae6b".to_string()),
                        ],
                    },
                    domain: Some(vec![
                        "0".to_string(),
                        "0.05".to_string(),
                        "0.25".to_string(),
                    ]),
                    domain_mid: None,
                    aux_domain_columns: Default::default(),
                    custom_content: None,
                }),
                bar_plot: None,
            }),
            custom_plot: None,
            ellipsis: None,
            plot_view_legend: false,
            spell: None,
        };
        assert_eq!(result, expected);
    }

    #[test]
    fn test_fetch_content_remote() {
        let url = "https://raw.githubusercontent.com/datavzrd/datavzrd/refs/heads/main/src/cli.rs"
            .to_string();
        let relative_path = "../README.md".to_string();
        let result = fetch_content(&url, &relative_path).unwrap();
        assert!(result.contains("A tool to create visual and interactive HTML reports from collections of CSV/TSV tables."));
    }
}

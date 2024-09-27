use crate::spec::RenderColumnSpec;
use anyhow::Result;
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

impl SpellSpec {
    pub(crate) fn render_column_spec(&self) -> Result<RenderColumnSpec> {
        let variables = self.with.clone();
        let template = fetch_spell(&self.url)?;
        let yaml_string = call_process_yaml(&template, variables)?;
        let yaml = serde_yaml::from_str(&yaml_string)?;
        Ok(yaml)
    }
}

pub fn fetch_spell(input: &str) -> Result<String> {
    if input.starts_with("http://") || input.starts_with("https://") {
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
            precision: 0,
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
                    clamp: false,
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
    }
}

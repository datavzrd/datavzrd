use std::fs;
use std::path::Path;
use reqwest::blocking::get;
use std::collections::HashMap;
use serde::Deserialize;
use crate::spec::RenderColumnSpec;
use anyhow::Result;
use pyo3::prelude::*;
use pyo3::types::{PyModule, PyAny};

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(deserialize = "kebab-case"), deny_unknown_fields)]
pub(crate) struct SpellSpec {
    pub(crate) url: String,
    #[serde(default)]
    pub(crate) with: HashMap<String, String>,
}

impl SpellSpec {
    pub(crate) fn render(&self) -> Result<RenderColumnSpec> {
        unimplemented!()
    }

    pub(crate) fn variables(&self) -> Result<String> {
        let variables = HashMap::from([("__variables__".to_string(), self.with.clone())]);
        Ok(serde_yaml::to_string(&variables)?)
    }
}

pub fn fetch_spell(input: &str) -> Result<String, Box<dyn std::error::Error>> {
    if input.starts_with("http://") || input.starts_with("https://") {
        fetch_from_url(input)
    } else {
        fetch_from_file(input)
    }
}

/// Fetches content from a URL.
fn fetch_from_url(url: &str) -> Result<String, Box<dyn std::error::Error>> {
    let response = get(url)?.text()?;
    Ok(response)
}

/// Fetches content from a local file.
fn fetch_from_file(path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(Path::new(path))?;
    Ok(content)
}

/// Call the `process_yaml` function from the Python `yte` module.
fn call_process_yaml(yaml_content: &str) -> Result<String> {
    Python::with_gil(|py| {
        let yte_module = PyModule::import_bound(py, "yte")?;
        let result = yte_module.getattr("process_yaml")?.call1((yaml_content,))?;
        let result_str: String = result.extract()?;
        Ok(result_str)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn call_process_yaml_valid_input() {
        let yaml_content = r#"
        ?if True:
          foo: 1
        ?elif False:
          bar: 2
        ?else:
          bar: 1"#;
        let result = call_process_yaml(yaml_content).unwrap();
        assert_eq!(result, "foo: 1");
    }
}

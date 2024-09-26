use std::fs;
use std::path::Path;
use reqwest::blocking::get;
use reqwest::Error;
use std::collections::HashMap;
use serde::Deserialize;
use crate::spec::RenderColumnSpec;
use anyhow::Result;

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

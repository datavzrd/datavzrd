use anyhow::{bail, Context, Result};
use datavzrd::spec::RenderColumnSpec;
use schemars::schema_for;
use serde::Deserialize;
use serde_json::{json, Map, Value};
use std::collections::HashMap;
use std::time::Duration;

const DOCS: &str = include_str!(concat!(env!("OUT_DIR"), "/configuration.rst"));

const PREAMBLE: &str = "You configure a datavzrd report from tabular data. For every column, decide how it should be rendered (plot, linkout, formatting, custom rendering, ...) and choose a short report name. Reply with a single JSON object of the form {\"report_name\": \"<name>\", \"columns\": {\"<exact column name>\": {<column configuration>}}}. Configure each column strictly according to the datavzrd configuration reference below. Add a link-to-url whenever a column clearly holds an identifier with a canonical web resource, choosing a fitting destination from the column's domain (e.g. gene symbol -> ClinVar or GeneCards, dbSNP rs id -> dbSNP, variant -> ClinVar, movie title -> IMDb, PubMed id -> PubMed, UniProt/Ensembl accession -> the respective database). Use only the exact column names given, and omit columns that need no special configuration.";

pub(crate) struct LlmConfig {
    pub url: String,
    pub model: String,
    pub token: Option<String>,
    pub prompt: String,
}

pub(crate) struct ColumnContext {
    pub name: String,
    pub description: String,
}

#[derive(Deserialize)]
pub(crate) struct Draft {
    #[serde(default)]
    pub report_name: Option<String>,
    #[serde(default)]
    pub columns: HashMap<String, Value>,
}

pub(crate) fn ask_prompt() -> Result<String> {
    let description = inquire::Text::new("Describe how the report should look:")
        .with_help_message("Guides how datavzrd renders each column")
        .prompt()?;
    if description.trim().is_empty() {
        bail!("No prompt provided for the LLM backend.");
    }
    Ok(description)
}

/// Requests a report draft from the LLM endpoint for the given columns.
pub(crate) fn request_draft(config: &LlmConfig, columns: &[ColumnContext]) -> Result<Draft> {
    let column_list = columns
        .iter()
        .map(|column| format!("- {}: {}", column.name, column.description))
        .collect::<Vec<_>>()
        .join("\n");
    let system = format!("{PREAMBLE}\n\n=== datavzrd configuration reference ===\n{DOCS}");
    let user = format!(
        "Description of the desired report:\n{}\n\nColumns:\n{}\n\nReply with the JSON object.",
        config.prompt, column_list
    );
    let body = json!({
        "model": config.model,
        "stream": false,
        "temperature": 0,
        "response_format": {
            "type": "json_schema",
            "json_schema": { "name": "datavzrd_report", "schema": schema(columns) }
        },
        "messages": [
            { "role": "system", "content": system },
            { "role": "user", "content": user },
        ],
    });
    let endpoint = format!("{}/chat/completions", config.url.trim_end_matches('/'));
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(600))
        .build()?;
    let mut request = client
        .post(&endpoint)
        .header("content-type", "application/json");
    if let Some(token) = &config.token {
        request = request.bearer_auth(token);
    }
    let response = request
        .body(body.to_string())
        .send()
        .with_context(|| format!("Could not reach the LLM endpoint at {endpoint}"))?;
    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().unwrap_or_default();
        bail!("The LLM endpoint returned status {status} for {endpoint}: {body}");
    }
    let chat: ChatResponse = serde_json::from_str(&response.text()?)
        .context("Unexpected response from the LLM endpoint")?;
    let content = chat
        .choices
        .into_iter()
        .next()
        .context("The LLM endpoint returned no choices")?
        .message
        .content;
    serde_json::from_str(&content)
        .context("The LLM endpoint did not return a valid JSON draft of the report")
}

fn schema(columns: &[ColumnContext]) -> Value {
    let root = schema_for!(RenderColumnSpec);
    let mut definitions = serde_json::to_value(&root.definitions).unwrap_or_else(|_| json!({}));
    if let (Some(map), Ok(column_schema)) = (
        definitions.as_object_mut(),
        serde_json::to_value(&root.schema),
    ) {
        map.insert("RenderColumnSpec".to_string(), column_schema);
    }
    let column_properties: Map<String, Value> = columns
        .iter()
        .map(|column| {
            (
                column.name.clone(),
                json!({ "$ref": "#/definitions/RenderColumnSpec" }),
            )
        })
        .collect();
    let mut schema = json!({
        "type": "object",
        "properties": {
            "report_name": { "type": "string" },
            "columns": {
                "type": "object",
                "properties": column_properties,
                "additionalProperties": false
            }
        },
        "required": ["columns"],
        "definitions": definitions
    });
    flatten_single_all_of(&mut schema);
    schema
}

// Guided-decoding backends often ignore constraints nested inside `allOf`, and schemars
// wraps every field carrying a `#[serde(default)]` as `{ "default": …, "allOf": [<schema>] }`.
// Replacing such nodes with their single inner schema restores enforcement.
fn flatten_single_all_of(value: &mut Value) {
    match value {
        Value::Object(map) => {
            if let Some(Value::Array(items)) = map.get("allOf") {
                if items.len() == 1 {
                    *value = items[0].clone();
                    flatten_single_all_of(value);
                    return;
                }
            }
            map.values_mut().for_each(flatten_single_all_of);
        }
        Value::Array(items) => items.iter_mut().for_each(flatten_single_all_of),
        _ => {}
    }
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Deserialize)]
struct ChatChoice {
    message: ChatMessage,
}

#[derive(Deserialize)]
struct ChatMessage {
    content: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn flatten_single_all_of_unwraps_and_keeps_multi() {
        // A single-element `allOf` wrapper is replaced by its inner schema.
        let mut single = json!({ "field": { "default": 1, "allOf": [{ "type": "integer" }] } });
        flatten_single_all_of(&mut single);
        assert_eq!(single, json!({ "field": { "type": "integer" } }));

        // An `allOf` with several entries is left untouched.
        let mut multi = json!({ "allOf": [{ "type": "string" }, { "minLength": 1 }] });
        let untouched = multi.clone();
        flatten_single_all_of(&mut multi);
        assert_eq!(multi, untouched);
    }
}

use crate::llm::{self, ColumnContext, Draft, LlmConfig};
use anyhow::{Context, Result};
use datavzrd::spec::{
    default_page_size, Color, ColorRange, DatasetSpecs, ItemSpecs, ItemsSpec, PlotSpec,
    RenderColumnSpec, RenderTableSpecs, ScaleType,
};
use datavzrd::utils::column_type::{ColumnType, IsNa};
use log::warn;
use std::collections::HashMap;
use std::path::PathBuf;

const MAX_EXAMPLES: usize = 2;
const EXAMPLE_MAX_CHARS: usize = 25;

pub(crate) fn suggest(
    files: Vec<PathBuf>,
    separator: Vec<char>,
    name: String,
    llm: Option<LlmConfig>,
) -> Result<String> {
    let mut items_spec = ItemsSpec::new(name);
    for (file, sep) in files.iter().zip(separator.iter()) {
        let dataset = DatasetSpecs {
            path: file.to_owned(),
            separator: sep.to_owned(),
            header_rows: 1,
            links: None,
            offer_excel: false,
        };
        let dataset_name = file
            .file_stem()
            .and_then(|stem| stem.to_str())
            .with_context(|| format!("Could not derive a dataset name from {}", file.display()))?
            .to_string();
        items_spec
            .datasets
            .insert(dataset_name.clone(), dataset.clone());
        let column_types = datavzrd::utils::column_type::classify_table(&dataset, true)?;
        let mut columns: HashMap<String, RenderColumnSpec> = column_types
            .iter()
            .map(|(name, column_type)| (name.to_string(), baseline_column(column_type)))
            .collect();
        if let Some(llm) = &llm {
            let contexts = build_contexts(&dataset, &column_types)?;
            // Retry once
            let draft = llm::request_draft(llm, &contexts)
                .or_else(|_| llm::request_draft(llm, &contexts))?;
            apply_draft(
                draft,
                &mut items_spec.report_name,
                &dataset_name,
                &dataset,
                &column_types,
                &mut columns,
            );
        }
        items_spec
            .views
            .insert(dataset_name.clone(), make_view(&dataset_name, columns));
    }
    Ok(serde_yaml::to_string(&items_spec)?)
}

fn apply_draft(
    draft: Draft,
    report_name: &mut String,
    dataset_name: &str,
    dataset: &DatasetSpecs,
    column_types: &HashMap<String, ColumnType>,
    columns: &mut HashMap<String, RenderColumnSpec>,
) {
    if let Some(name) = draft.report_name.filter(|name| !name.trim().is_empty()) {
        *report_name = name;
    }
    let suggested: Vec<(String, RenderColumnSpec)> = draft
        .columns
        .into_iter()
        .filter_map(|(name, value)| {
            if !columns.contains_key(&name) {
                warn!("ignoring suggestion for unknown column {name:?}");
                return None;
            }
            match serde_json::from_value(value) {
                Ok(mut spec) => {
                    fill_default_colors(&mut spec, &column_types[&name]);
                    Some((name, spec))
                }
                Err(error) => {
                    warn!("column {name:?} fell back to the default because its suggested configuration could not be parsed: {error}");
                    None
                }
            }
        })
        .collect();

    // Keep each suggestion only if it still validates alongside the rest, else revert to the baseline column.
    for (name, spec) in suggested {
        let baseline = columns.insert(name.clone(), spec);
        if validate_columns(report_name, dataset_name, dataset, columns).is_err() {
            let rejected = serde_yaml::to_string(&columns[&name]).unwrap_or_default();
            warn!("column {name:?} fell back to the default because its suggested configuration was invalid. The rejected configuration was:\n{rejected}");
            if let Some(baseline) = baseline {
                columns.insert(name, baseline);
            }
        }
    }
}

fn validate_columns(
    report_name: &str,
    dataset_name: &str,
    dataset: &DatasetSpecs,
    columns: &HashMap<String, RenderColumnSpec>,
) -> Result<()> {
    let mut items_spec = ItemsSpec::new(report_name.to_string());
    items_spec
        .datasets
        .insert(dataset_name.to_string(), dataset.clone());
    items_spec.views.insert(
        dataset_name.to_string(),
        make_view(dataset_name, columns.clone()),
    );
    items_spec.preprocess()?;
    items_spec.validate()
}

fn make_view(dataset_name: &str, columns: HashMap<String, RenderColumnSpec>) -> ItemSpecs {
    ItemSpecs {
        hidden: false,
        narrow: false,
        dataset: Some(dataset_name.to_string()),
        datasets: None,
        page_size: default_page_size(),
        single_page_page_size: default_page_size(),
        description: None,
        render_table: Some(RenderTableSpecs {
            columns,
            additional_columns: None,
            headers: None,
        }),
        render_plot: None,
        render_html: None,
        render_img: None,
        max_in_memory_rows: None,
        spell: None,
    }
}

fn build_contexts(
    dataset: &DatasetSpecs,
    column_types: &HashMap<String, ColumnType>,
) -> Result<Vec<ColumnContext>> {
    let mut reader = dataset.reader()?;
    let headers = reader.headers()?.clone();
    let mut examples: HashMap<String, Vec<String>> = headers
        .iter()
        .map(|h| (h.to_string(), Vec::new()))
        .collect();
    let mut ranges: HashMap<String, (f64, f64)> = HashMap::new();
    for record in reader.records()?.skip(dataset.header_rows - 1) {
        for (header, value) in headers.iter().zip(record.iter()) {
            if value.is_na() {
                continue;
            }
            let seen = examples.get_mut(header).unwrap();
            if seen.len() < MAX_EXAMPLES && !seen.iter().any(|example| example == value) {
                seen.push(value.to_string());
            }
            if let Ok(number) = value.parse::<f64>() {
                let range = ranges.entry(header.to_string()).or_insert((number, number));
                range.0 = range.0.min(number);
                range.1 = range.1.max(number);
            }
        }
    }
    Ok(headers
        .iter()
        .map(|header| {
            let mut description = column_types[header].to_string();
            if let Some((min, max)) = ranges.get(header) {
                description += &format!(", range {min}..{max}");
            }
            let seen = &examples[header];
            if !seen.is_empty() {
                let previews = seen
                    .iter()
                    .map(|value| {
                        let preview: String = value.chars().take(EXAMPLE_MAX_CHARS).collect();
                        if value.chars().count() > EXAMPLE_MAX_CHARS {
                            format!("{preview}…")
                        } else {
                            preview
                        }
                    })
                    .collect::<Vec<_>>()
                    .join(", ");
                description += &format!(", e.g. {previews}");
            }
            ColumnContext {
                name: header.to_string(),
                description,
            }
        })
        .collect())
}

fn baseline_column(column_type: &ColumnType) -> RenderColumnSpec {
    let plot = match column_type {
        ColumnType::None => None,
        ColumnType::String => Some(PlotSpec::heatmap(
            ScaleType::Ordinal,
            "category20".to_string(),
            ColorRange::default(),
        )),
        ColumnType::Integer | ColumnType::Float => Some(PlotSpec::heatmap(
            ScaleType::Linear,
            String::new(),
            ColorRange(vec![Color("white".to_string()), Color("blue".to_string())]),
        )),
    };
    RenderColumnSpec {
        plot,
        ..RenderColumnSpec::default()
    }
}

/// Completes a suggested pills or heatmap plot that the model left uncolored with a
/// sensible default scheme (`category20` for categorical values, `blues` for numeric
/// ones), so the model's feature choice survives validation instead of falling back.
fn fill_default_colors(spec: &mut RenderColumnSpec, column_type: &ColumnType) {
    let Some(plot) = spec.plot.as_mut() else {
        return;
    };
    if let Some(pills) = plot.pills.as_mut() {
        if pills.color_scheme.is_empty() && pills.color_range.0.is_empty() {
            pills.color_scheme = "category20".to_string();
        }
    }
    if let Some(heatmap) = plot.heatmap.as_mut() {
        if heatmap.vega_type.is_none()
            && heatmap.color_scheme.is_empty()
            && heatmap.color_range.0.is_empty()
        {
            heatmap.color_scheme = match column_type {
                ColumnType::Integer | ColumnType::Float => "blues",
                _ => "category20",
            }
            .to_string();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;
    use std::io::Write;
    use std::path::PathBuf;

    #[test]
    fn test_suggest() -> Result<()> {
        let files = vec![
            PathBuf::from(".examples/data/movies.csv"),
            PathBuf::from(".examples/data/oscars.csv"),
        ];
        let separators = vec![',', ','];
        let name = "Test Report".to_string();
        let result = suggest(files, separators, name, None);
        assert!(result.is_ok());
        let tmp = tempfile::NamedTempFile::new()?;
        tmp.as_file().write_all(result.unwrap().as_bytes())?;
        let config = ItemsSpec::from_file(tmp.path())?;
        assert!(config.validate().is_ok());
        Ok(())
    }

    fn movies() -> (
        DatasetSpecs,
        HashMap<String, ColumnType>,
        HashMap<String, RenderColumnSpec>,
    ) {
        let dataset = DatasetSpecs {
            path: PathBuf::from(".examples/data/movies.csv"),
            separator: ',',
            header_rows: 1,
            links: None,
            offer_excel: false,
        };
        let column_types = datavzrd::utils::column_type::classify_table(&dataset, true).unwrap();
        let columns = column_types
            .iter()
            .map(|(name, column_type)| (name.to_string(), baseline_column(column_type)))
            .collect();
        (dataset, column_types, columns)
    }

    #[test]
    fn apply_draft_updates_name_and_ignores_unknown_columns() {
        let (dataset, column_types, mut columns) = movies();
        let baseline = columns.clone();
        let draft = Draft {
            report_name: Some("New Name".to_string()),
            columns: HashMap::from([(
                "totally_unknown".to_string(),
                serde_json::json!({ "display-mode": "hidden" }),
            )]),
        };
        let mut name = "Old".to_string();
        apply_draft(
            draft,
            &mut name,
            "movies",
            &dataset,
            &column_types,
            &mut columns,
        );
        assert_eq!(name, "New Name");
        assert_eq!(columns, baseline);
    }

    #[test]
    fn apply_draft_reverts_invalid_suggestion_to_baseline() {
        let (dataset, column_types, mut columns) = movies();
        let target = columns.keys().next().unwrap().clone();
        let baseline = columns[&target].clone();
        // A link-to-url with only custom-content and no url is invalid and cannot be
        // auto-completed, so the column must fall back to its baseline.
        let draft = Draft {
            report_name: None,
            columns: HashMap::from([(
                target.clone(),
                serde_json::json!({
                    "link-to-url": { "custom-content": "function(value, row) { return value; }" }
                }),
            )]),
        };
        let mut name = "keep".to_string();
        apply_draft(
            draft,
            &mut name,
            "movies",
            &dataset,
            &column_types,
            &mut columns,
        );
        assert_eq!(name, "keep");
        assert_eq!(columns[&target], baseline);
    }

    #[test]
    fn apply_draft_auto_fills_missing_pills_color() {
        let (dataset, column_types, mut columns) = movies();
        let target = columns.keys().next().unwrap().clone();
        // Pills without a color would be rejected; the auto-fill completes them so the
        // model's pills choice is kept instead of falling back.
        let draft = Draft {
            report_name: None,
            columns: HashMap::from([(
                target.clone(),
                serde_json::json!({ "plot": { "pills": { "separator": ";" } } }),
            )]),
        };
        let mut name = "keep".to_string();
        apply_draft(
            draft,
            &mut name,
            "movies",
            &dataset,
            &column_types,
            &mut columns,
        );
        let pills = columns[&target]
            .plot
            .as_ref()
            .and_then(|plot| plot.pills.as_ref())
            .expect("pills should be kept, not dropped");
        assert!(!pills.color_scheme.is_empty());
    }
}

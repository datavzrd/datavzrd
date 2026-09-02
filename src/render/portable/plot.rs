use crate::render::portable::utils::minify_js;
use crate::spec::DatasetSpecs;
use crate::utils::column_store::DatasetSummary;
use crate::utils::column_type::IsNa;
use anyhow::Result;
use itertools::Itertools;
use serde::Serialize;
use serde_json::json;
use std::collections::HashMap;
use std::fs;
use std::io::Write;
use std::path::Path;
use std::str::FromStr;
use tera::{Context, Tera};

/// Renders plots to javascript file
pub(crate) fn render_plots<P: AsRef<Path>>(
    output_path: P,
    dataset: &DatasetSpecs,
    summary: &DatasetSummary,
    records_length: usize,
    debug: bool,
) -> Result<()> {
    let path = Path::new(output_path.as_ref()).join("plots");
    fs::create_dir(&path)?;

    let numeric_indices: Vec<usize> = (0..summary.headers.len())
        .filter(|index| summary.column_at(*index).column_type.is_numeric())
        .collect();
    let mut numeric_plots: HashMap<usize, Option<Vec<BinnedPlotRecord>>> = HashMap::new();
    for chunk in numeric_indices.chunks(column_batch_size(records_length)) {
        for (offset, values) in read_columns(dataset, chunk)?.into_iter().enumerate() {
            numeric_plots.insert(chunk[offset], generate_numeric_plot(&values));
        }
    }

    let mut plots = Vec::new();
    for (index, column) in summary.headers.iter().enumerate() {
        let mut templates = Tera::default();
        let mut context = Context::new();
        context.insert("title", &column);
        context.insert("index", &index);
        if summary.column_at(index).column_type.is_numeric() {
            templates.add_raw_template(
                "plot.js.tera",
                include_str!("../../../templates/numeric_plot.js.tera"),
            )?;
            context.insert(
                "table",
                &json!(numeric_plots.remove(&index).unwrap()).to_string(),
            );
        } else {
            let plot = generate_nominal_plot(&summary.column_at(index).value_counts);
            templates.add_raw_template(
                "plot.js.tera",
                include_str!("../../../templates/nominal_plot.js.tera"),
            )?;
            context.insert("table", &json!(plot).to_string());
        }
        let js = templates.render("plot.js.tera", &context)?;
        plots.push(js);
    }
    let js_plots = plots.join("\n");
    let file_path = path.join(Path::new(&"plots".to_string()).with_extension("js"));
    let mut file = fs::File::create(file_path)?;
    let minified = minify_js(&js_plots, debug)?;
    file.write_all(&minified)?;
    Ok(())
}

const COLUMN_BUFFER_CELLS: usize = 4_000_000;

pub(crate) fn column_batch_size(records_length: usize) -> usize {
    (COLUMN_BUFFER_CELLS / records_length.max(1)).max(1)
}

pub(crate) fn read_columns(dataset: &DatasetSpecs, columns: &[usize]) -> Result<Vec<Vec<String>>> {
    let mut buffers: Vec<Vec<String>> = columns.iter().map(|_| Vec::new()).collect();
    for record in dataset.reader()?.records()?.skip(dataset.header_rows - 1) {
        for (buffer, &column) in buffers.iter_mut().zip(columns) {
            buffer.push(record.get(column).unwrap().to_string());
        }
    }
    Ok(buffers)
}

fn binned_counts(values: &[f32], min: f32, max: f32, num_bins: usize) -> Vec<u32> {
    let bin_width = (max - min) / num_bins as f32;
    let mut counts = vec![0u32; num_bins];
    for &v in values {
        let idx = ((v - min) / bin_width) as usize;
        counts[idx.min(num_bins - 1)] += 1;
    }
    counts
}

fn counts_to_records(counts: &[u32], min: f32, max: f32) -> Vec<BinnedPlotRecord> {
    let bin_width = (max - min) / counts.len() as f32;
    counts
        .iter()
        .enumerate()
        .map(|(i, &value)| BinnedPlotRecord {
            bin_start: min + i as f32 * bin_width,
            bin_end: min + (i + 1) as f32 * bin_width,
            value,
        })
        .collect()
}

fn refined_bins(values: &[f32], min: f32, max: f32) -> Vec<BinnedPlotRecord> {
    let mut num_bins = NUMERIC_BINS;
    let mut counts = binned_counts(values, min, max, num_bins);

    for _ in 0..MAX_BIN_REFINEMENT_ROUNDS {
        let max_idx = counts
            .iter()
            .enumerate()
            .max_by_key(|(_, &c)| c)
            .map(|(i, _)| i)
            .unwrap_or(0);

        let doubled = binned_counts(values, min, max, num_bins * 2);
        let left = doubled[max_idx * 2];
        let right = doubled[max_idx * 2 + 1];
        let total = left + right;

        if total == 0 {
            break;
        }

        let ratio = left as f32 / total as f32;
        if (ratio - 0.5).abs() <= 0.1 {
            break;
        }

        num_bins *= 2;
        counts = doubled;
    }

    counts_to_records(&counts, min, max)
}

fn generate_numeric_plot(values: &[String]) -> Option<Vec<BinnedPlotRecord>> {
    let mut numbers = Vec::new();
    let mut nan = 0u32;
    let mut min = f32::INFINITY;
    let mut max = f32::NEG_INFINITY;

    for value in values {
        if let Ok(number) = f32::from_str(value) {
            numbers.push(number);
            min = min.min(number);
            max = max.max(number);
        } else {
            nan += 1;
        }
    }

    if min == max {
        return None;
    }

    let mut result = refined_bins(&numbers, min, max);

    if nan > 0 {
        result.push(BinnedPlotRecord {
            bin_start: f32::NAN,
            bin_end: f32::NAN,
            value: nan,
        });
    }

    Some(result)
}

/// Generates plot records for columns of type String
fn generate_nominal_plot(value_counts: &HashMap<String, usize>) -> Option<Vec<PlotRecord>> {
    let mut counts: HashMap<&str, u32> = HashMap::new();
    for (value, count) in value_counts {
        let key = if value.as_str().is_na() {
            "NA"
        } else {
            value.as_str()
        };
        *counts.entry(key).or_insert(0) += *count as u32;
    }

    let mut plot_data = counts
        .iter()
        .map(|(key, value)| PlotRecord {
            key: key.to_string(),
            value: *value,
        })
        .collect_vec();

    let unique_values = counts.values().unique().count();
    if unique_values <= 1 {
        return None;
    };

    if plot_data.len() > MAX_NOMINAL_BINS {
        plot_data.sort_by_key(|b| std::cmp::Reverse(b.value));
        plot_data = plot_data.into_iter().take(MAX_NOMINAL_BINS).collect();
    }

    Some(plot_data)
}

const MAX_NOMINAL_BINS: usize = 10;
const NUMERIC_BINS: usize = 20;
const MAX_BIN_REFINEMENT_ROUNDS: usize = 3;

#[derive(Serialize, Debug, Clone, Ord, PartialOrd, Eq, PartialEq)]
struct PlotRecord {
    key: String,
    value: u32,
}

#[derive(Serialize, Debug, Clone, PartialEq)]
struct BinnedPlotRecord {
    bin_start: f32,
    bin_end: f32,
    value: u32,
}

#[cfg(test)]
mod tests {
    use crate::render::portable::plot::{generate_nominal_plot, PlotRecord};
    use crate::spec::DatasetSpecs;
    use crate::utils::column_store::DatasetSummary;
    use std::str::FromStr;

    #[test]
    fn test_nominal_plot_generation() {
        let dataset = DatasetSpecs {
            path: "tests/data/uniform_datatypes.csv"
                .to_string()
                .parse()
                .unwrap(),
            separator: char::from_str(",").unwrap(),
            header_rows: 1,
            links: None,
            offer_excel: false,
        };
        let summary = DatasetSummary::build(&dataset).unwrap();
        let mut records = generate_nominal_plot(&summary.column_at(0).value_counts).unwrap();
        records.sort_unstable();
        let mut expected = vec![
            PlotRecord {
                key: String::from("George"),
                value: 2,
            },
            PlotRecord {
                key: String::from("Delia"),
                value: 1,
            },
            PlotRecord {
                key: String::from("Winnie"),
                value: 1,
            },
        ];
        expected.sort_unstable();
        assert_eq!(records, expected);
    }
}

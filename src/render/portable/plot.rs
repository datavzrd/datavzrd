use crate::render::portable::utils::{minify_js, round};
use crate::spec::DatasetSpecs;
use crate::utils::column_type::IsNa;
use crate::utils::column_type::{classify_table, ColumnType};
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
    debug: bool,
) -> Result<()> {
    let column_types = classify_table(dataset, true)?;

    let mut reader = dataset.reader()?;

    let path = Path::new(output_path.as_ref()).join("plots");
    fs::create_dir(&path)?;
    let mut plots = Vec::new();

    for (index, column) in reader.headers()?.iter().enumerate() {
        let mut templates = Tera::default();
        let mut context = Context::new();
        context.insert("title", &column);
        context.insert("index", &index);
        match column_types.get(column) {
            None => unreachable!(),
            Some(ColumnType::String) | Some(ColumnType::None) => {
                let plot = generate_nominal_plot(dataset, index)?;
                templates.add_raw_template(
                    "plot.js.tera",
                    include_str!("../../../templates/nominal_plot.js.tera"),
                )?;
                context.insert("table", &json!(plot).to_string())
            }
            Some(ColumnType::Integer) | Some(ColumnType::Float) => {
                let plot = generate_numeric_plot(dataset, index)?;
                templates.add_raw_template(
                    "plot.js.tera",
                    include_str!("../../../templates/numeric_plot.js.tera"),
                )?;
                context.insert("table", &json!(plot).to_string())
            }
        };
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

fn generate_numeric_plot(
    dataset: &DatasetSpecs,
    column_index: usize,
) -> Result<Option<Vec<BinnedPlotRecord>>> {
    let mut reader = dataset.reader()?;

    let (min, max) = get_min_max(dataset, column_index, None)?;

    if min == max {
        return Ok(None);
    }

    let mut values = Vec::new();
    let mut nan = 0u32;

    for record in reader.records()?.skip(dataset.header_rows - 1) {
        let value = record.get(column_index).unwrap();
        if let Ok(number) = f32::from_str(value) {
            values.push(number);
        } else {
            nan += 1;
        }
    }

    let mut result = refined_bins(&values, min, max);

    if nan > 0 {
        result.push(BinnedPlotRecord {
            bin_start: f32::NAN,
            bin_end: f32::NAN,
            value: nan,
        });
    }

    Ok(Some(result))
}

/// Finds the numeric minimum and maximum value of a csv column
pub(crate) fn get_min_max(
    dataset: &DatasetSpecs,
    column_index: usize,
    precision: Option<u32>,
) -> Result<(f32, f32)> {
    let mut min_reader = dataset.reader()?;
    let mut max_reader = dataset.reader()?;

    let min = min_reader
        .records()?
        .skip(dataset.header_rows - 1)
        .map(|r| r.get(column_index).unwrap().to_string())
        .filter_map(|s| s.parse().ok())
        .fold(f32::INFINITY, |a, b| a.min(b));
    let max = max_reader
        .records()?
        .skip(dataset.header_rows - 1)
        .map(|r| r.get(column_index).unwrap().to_string())
        .filter_map(|s| s.parse().ok())
        .fold(f32::NEG_INFINITY, |a, b| a.max(b));

    if let Some(p) = precision {
        Ok((round(min, p), round(max, p)))
    } else {
        Ok((min, max))
    }
}

/// Generates plot records for columns of type String
fn generate_nominal_plot(
    dataset: &DatasetSpecs,
    column_index: usize,
) -> Result<Option<Vec<PlotRecord>>> {
    let mut reader = dataset.reader()?;

    let mut count_values = HashMap::new();

    for result in reader.records()?.skip(dataset.header_rows - 1) {
        let value = result.get(column_index).unwrap();
        if !value.as_str().is_na() {
            let entry = count_values.entry(value.to_owned()).or_insert_with(|| 0);
            *entry += 1;
        } else {
            let entry = count_values.entry("NA".to_owned()).or_insert_with(|| 0);
            *entry += 1;
        }
    }

    let mut plot_data = count_values
        .iter()
        .map(|(k, v)| PlotRecord {
            key: k.to_string(),
            value: *v,
        })
        .collect_vec();

    let unique_values = count_values.values().unique().count();
    if unique_values <= 1 {
        return Ok(None);
    };

    if plot_data.len() > MAX_NOMINAL_BINS {
        plot_data.sort_by(|a, b| b.value.cmp(&a.value));
        plot_data = plot_data.into_iter().take(MAX_NOMINAL_BINS).collect();
    }

    Ok(Some(plot_data))
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
        let mut records = generate_nominal_plot(&dataset, 0).unwrap().unwrap();
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

use crate::render::portable::utils::{minify_js, round};
use crate::spec::DatasetSpecs;
use crate::utils::column_type::IsNa;
use crate::utils::column_type::{classify_table, ColumnType};
use anyhow::Result;
use itertools::Itertools;
use ndhistogram::axis::Uniform;
use ndhistogram::{ndhistogram, Histogram};
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
    let column_types = classify_table(dataset)?;

    let mut reader = dataset.reader()?;

    let path = Path::new(output_path.as_ref()).join("plots");
    fs::create_dir(&path)?;

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
        let file_path = path.join(Path::new(&format!("plot_{index}")).with_extension("js"));
        let mut file = fs::File::create(file_path)?;
        let minified = minify_js(&js, debug)?;
        file.write_all(&minified)?;
    }
    Ok(())
}

/// Generates plot records for columns of types Float and Integer
fn generate_numeric_plot(
    dataset: &DatasetSpecs,
    column_index: usize,
) -> Result<Option<Vec<BinnedPlotRecord>>> {
    let mut reader = dataset.reader()?;

    let (min, max) = get_min_max(dataset, column_index, None)?;

    if min == max {
        return Ok(None);
    }

    let mut hist = ndhistogram!(Uniform::new(NUMERIC_BINS, min, max));
    let mut nan = 0;

    for record in reader.records()?.skip(dataset.header_rows - 1) {
        let value = record.get(column_index).unwrap();
        if let Ok(number) = f32::from_str(value) {
            hist.fill(&number)
        } else {
            nan += 1;
        }
    }

    let mut result = hist
        .iter()
        .map(|h| BinnedPlotRecord::new(h.bin.start(), h.bin.end(), *h.value))
        .collect_vec();

    if nan > 0 {
        result.push(BinnedPlotRecord {
            bin_start: f32::NAN,
            bin_end: f32::NAN,
            value: nan,
        })
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

impl BinnedPlotRecord {
    fn new(start: Option<f32>, end: Option<f32>, value: f64) -> BinnedPlotRecord {
        BinnedPlotRecord {
            bin_start: start.unwrap_or(f32::NEG_INFINITY),
            bin_end: end.unwrap_or(f32::INFINITY),
            value: value as u32,
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::render::portable::plot::{generate_nominal_plot, PlotRecord};

    #[test]
    fn test_nominal_plot_generation() {
        let mut records =
            generate_nominal_plot("tests/data/uniform_datatypes.csv".as_ref(), ',', 0, 1)
                .unwrap()
                .unwrap();
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

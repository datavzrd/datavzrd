use crate::spec::DatasetSpecs;
use crate::utils::column_type::ColumnType;
use anyhow::Result;
use std::collections::HashMap;

pub(crate) struct ColumnSummary {
    pub(crate) column_type: ColumnType,
    pub(crate) min: f32,
    pub(crate) max: f32,
    pub(crate) value_counts: HashMap<String, usize>,
}

impl ColumnSummary {
    pub(crate) fn unique_count(&self) -> usize {
        self.value_counts.len()
    }
}

pub(crate) struct DatasetSummary {
    pub(crate) headers: Vec<String>,
    columns: Vec<ColumnSummary>,
    positions: HashMap<String, usize>,
}

impl DatasetSummary {
    pub(crate) fn build(dataset: &DatasetSpecs) -> Result<Self> {
        let headers = dataset.reader()?.headers()?.clone();
        let mut columns: Vec<ColumnSummary> = headers
            .iter()
            .map(|_| ColumnSummary {
                column_type: ColumnType::default(),
                min: f32::INFINITY,
                max: f32::NEG_INFINITY,
                value_counts: HashMap::new(),
            })
            .collect();
        for record in dataset.reader()?.records()?.skip(dataset.header_rows - 1) {
            for (summary, (title, value)) in
                columns.iter_mut().zip(headers.iter().zip(record.iter()))
            {
                summary.column_type.update(value, title, true)?;
                if let Ok(number) = value.parse::<f32>() {
                    summary.min = summary.min.min(number);
                    summary.max = summary.max.max(number);
                }
                *summary.value_counts.entry(value.to_string()).or_insert(0) += 1;
            }
        }
        let positions = headers
            .iter()
            .enumerate()
            .map(|(index, header)| (header.clone(), index))
            .collect();
        Ok(Self {
            headers,
            columns,
            positions,
        })
    }

    pub(crate) fn column(&self, title: &str) -> &ColumnSummary {
        &self.columns[self.positions[title]]
    }

    pub(crate) fn column_at(&self, index: usize) -> &ColumnSummary {
        &self.columns[index]
    }
}

#[cfg(test)]
mod tests {
    use super::DatasetSummary;
    use crate::spec::DatasetSpecs;
    use crate::utils::column_type::classify_table;
    use std::collections::HashSet;
    use std::str::FromStr;

    fn dataset(path: &str, header_rows: usize) -> DatasetSpecs {
        DatasetSpecs {
            path: path.to_string().parse().unwrap(),
            separator: char::from_str(",").unwrap(),
            header_rows,
            links: None,
            offer_excel: false,
        }
    }

    fn min_max(dataset: &DatasetSpecs, index: usize) -> (f32, f32) {
        dataset
            .reader()
            .unwrap()
            .records()
            .unwrap()
            .skip(dataset.header_rows - 1)
            .filter_map(|record| record.get(index).unwrap().parse::<f32>().ok())
            .fold((f32::INFINITY, f32::NEG_INFINITY), |(min, max), value| {
                (min.min(value), max.max(value))
            })
    }

    fn unique_count(dataset: &DatasetSpecs, index: usize) -> usize {
        dataset
            .reader()
            .unwrap()
            .records()
            .unwrap()
            .skip(dataset.header_rows - 1)
            .map(|record| record.get(index).unwrap().to_string())
            .collect::<HashSet<_>>()
            .len()
    }

    #[test]
    fn test_summary_matches_standalone_functions() {
        for (path, header_rows) in [
            ("tests/data/uniform_datatypes.csv", 1),
            ("tests/data/non_uniform_datatypes.csv", 1),
            ("tests/data/empty_table.csv", 1),
            ("tests/data/additional_header_rows.csv", 2),
        ] {
            let dataset = dataset(path, header_rows);
            let summary = DatasetSummary::build(&dataset).unwrap();
            let classification = classify_table(&dataset, false).unwrap();

            for (index, header) in summary.headers.iter().enumerate() {
                let column = summary.column_at(index);
                assert_eq!(&column.column_type, classification.get(header).unwrap());
                assert_eq!(column.unique_count(), unique_count(&dataset, index));
                assert_eq!((column.min, column.max), min_max(&dataset, index));
            }
        }
    }
}

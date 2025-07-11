use crate::spec::DatasetSpecs;
use anyhow::Result;
use log::warn;
use std::collections::HashMap;
use std::iter::FromIterator;
use std::str::FromStr;

#[derive(Debug, PartialEq, Default)]
pub enum ColumnType {
    #[default]
    None,
    String,
    Integer,
    Float,
}

impl ColumnType {
    fn update(&mut self, value: &str, warn: bool) -> Result<bool> {
        let mut float_warning = warn;
        if !value.is_na() {
            *self = match (
                f64::from_str(value).is_ok(),
                i64::from_str(value).is_ok(),
                &self,
            ) {
                (true, true, ColumnType::None) | (true, true, ColumnType::Integer) => {
                    ColumnType::Integer
                }
                (true, false, ColumnType::None)
                | (true, _, ColumnType::Float)
                | (true, false, ColumnType::Integer) => ColumnType::Float,
                (false, false, _) | (_, _, ColumnType::String) => {
                    let replaced_comma = value.replace(",", ".");
                    if f64::from_str(&replaced_comma).is_ok() && value.contains(",") && !warn {
                        warn!("The value '{value}' and potentially more values of the same column contain a comma and may be a float and will not be parsed as a one. Consider using '.' for decimal points.");
                        float_warning = true;
                    }
                    ColumnType::String
                }
                (false, true, _) => unreachable!(),
            };
        }
        Ok(float_warning)
    }

    pub(crate) fn is_numeric(&self) -> bool {
        self == &ColumnType::Integer || self == &ColumnType::Float
    }
}

/// Classifies table columns as String, Integer or Float
/// The warn parameter controls whether warnings are printed to the console.
pub fn classify_table(dataset: &DatasetSpecs, warn: bool) -> Result<HashMap<String, ColumnType>> {
    let headers = dataset.reader()?.headers()?.clone();
    let mut classification = HashMap::from_iter(
        headers
            .iter()
            .map(|f| (f.to_owned(), ColumnType::default())),
    );
    let mut warnings: HashMap<String, bool> =
        HashMap::from_iter(headers.iter().cloned().map(|s| (s.to_string(), !warn)));
    for record in dataset.reader()?.records()?.skip(dataset.header_rows - 1) {
        for (title, value) in headers.iter().zip(record.iter()) {
            let column_type = classification.get_mut(title).unwrap();
            warnings.insert(
                title.to_string(),
                column_type.update(value, *warnings.get(title).unwrap())?,
            );
        }
    }

    Ok(classification)
}

pub(crate) trait IsNa {
    fn is_na(&self) -> bool;
}

impl IsNa for &str {
    fn is_na(&self) -> bool {
        self.is_empty() || self == &"NA"
    }
}

#[cfg(test)]
mod tests {
    use crate::spec::DatasetSpecs;
    use crate::utils::column_type::{classify_table, ColumnType};
    use std::collections::HashMap;
    use std::str::FromStr;

    #[test]
    fn test_classify_uniform_table() {
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
        let classification = classify_table(&dataset, true).unwrap();
        let expected = HashMap::from([
            (String::from("first"), ColumnType::String),
            (String::from("last"), ColumnType::String),
            (String::from("ccnumber"), ColumnType::Integer),
            (String::from("price"), ColumnType::Float),
        ]);
        assert_eq!(classification, expected);
    }

    #[test]
    fn test_classify_non_uniform_table() {
        let dataset = DatasetSpecs {
            path: "tests/data/non_uniform_datatypes.csv"
                .to_string()
                .parse()
                .unwrap(),
            separator: char::from_str(",").unwrap(),
            header_rows: 1,
            links: None,
            offer_excel: false,
        };
        let classification = classify_table(&dataset, true).unwrap();
        let expected = HashMap::from([
            (String::from("first"), ColumnType::String),
            (String::from("last"), ColumnType::String),
            (String::from("ccnumber"), ColumnType::Float),
            (String::from("price"), ColumnType::Float),
        ]);
        assert_eq!(classification, expected);
    }

    #[test]
    fn test_empty_column() {
        let dataset = DatasetSpecs {
            path: "tests/data/empty_table.csv".to_string().parse().unwrap(),
            separator: char::from_str(",").unwrap(),
            header_rows: 1,
            links: None,
            offer_excel: false,
        };
        let classification = classify_table(&dataset, true).unwrap();
        for column_type in classification.values() {
            assert_eq!(&ColumnType::None, column_type)
        }
    }

    #[test]
    fn test_is_numeric() {
        let integer = ColumnType::Integer;
        let float = ColumnType::Float;
        let string = ColumnType::String;
        let none = ColumnType::None;
        assert!(integer.is_numeric());
        assert!(float.is_numeric());
        assert!(!string.is_numeric());
        assert!(!none.is_numeric())
    }
}

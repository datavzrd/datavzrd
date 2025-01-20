use crate::spec::DatasetSpecs;
use anyhow::Result;
use log::warn;
use std::collections::HashMap;
use std::iter::FromIterator;
use std::str::FromStr;

#[derive(Debug, PartialEq, Default)]
pub(crate) enum ColumnType {
    #[default]
    None,
    String,
    Integer,
    Float,
}

impl ColumnType {
    fn update(&mut self, value: &str) -> Result<()> {
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
                    if f64::from_str(&replaced_comma).is_ok() {
                        warn!("The value '{value}' contains a comma and will not be parsed as a float. Consider using '.' for decimal points.")
                    }
                    ColumnType::String
                }
                (false, true, _) => unreachable!(),
            };
        }
        Ok(())
    }

    pub(crate) fn is_numeric(&self) -> bool {
        self == &ColumnType::Integer || self == &ColumnType::Float
    }
}

/// Classifies table columns as String, Integer or Float
pub(crate) fn classify_table(dataset: &DatasetSpecs) -> Result<HashMap<String, ColumnType>> {
    let headers = dataset.reader()?.headers()?.clone();
    let mut classification = HashMap::from_iter(
        headers
            .iter()
            .map(|f| (f.to_owned(), ColumnType::default())),
    );
    for record in dataset.reader()?.records()?.skip(dataset.header_rows - 1) {
        for (title, value) in headers.iter().zip(record.iter()) {
            let column_type = classification.get_mut(title).unwrap();
            column_type.update(value)?;
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
        let classification = classify_table(&dataset).unwrap();
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
        let classification = classify_table(&dataset).unwrap();
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
        let classification = classify_table(&dataset).unwrap();
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

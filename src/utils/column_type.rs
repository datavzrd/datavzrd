use anyhow::Result;
use csv::StringRecord;
use std::collections::HashMap;
use std::path::Path;
use std::str::FromStr;

#[derive(Debug, PartialEq)]
enum ColumnType {
    String,
    Integer,
    Float,
}

fn classify_column(rows: &Vec<StringRecord>, column_index: usize) -> ColumnType {
    let integers = rows
        .iter()
        .filter(|x| i64::from_str(&x[column_index]).is_ok())
        .count();
    let floats = rows
        .iter()
        .filter(|x| f64::from_str(&x[column_index]).is_ok())
        .count();
    let non_integers = rows.len() - integers;

    match (floats > integers, floats >= non_integers) {
        (true, true) => ColumnType::Float,
        (false, true) => ColumnType::Integer,
        (_, false) => ColumnType::String,
    }
}

fn classify_table<P: AsRef<Path>>(path: P, separator: char) -> Result<HashMap<String, ColumnType>> {
    let mut reader = csv::ReaderBuilder::new()
        .delimiter(separator as u8)
        .from_path(path)?;

    let mut classification = HashMap::new();

    let records: Vec<_> = reader.records().into_iter().map(|r| r.unwrap()).collect();
    let headers = reader.headers()?;
    for (i, title) in headers.iter().enumerate() {
        classification.insert(title.to_owned(), classify_column(&records, i));
    }
    Ok(classification)
}

#[test]
fn test_classify_table() {
    let classification =
        classify_table("tests/data/sales.csv", char::from_str(",").unwrap()).unwrap();
    let expected = HashMap::from([
        (String::from("first"), ColumnType::String),
        (String::from("last"), ColumnType::String),
        (String::from("ccnumber"), ColumnType::Integer),
        (String::from("price"), ColumnType::Float),
    ]);
    assert_eq!(classification, expected);
}

use std::collections::HashMap;
use std::path::Path;

use anyhow::Result;

use crate::utils::row_address::{RowAddress, RowAddressFactory};
use std::str::FromStr;

#[derive(Debug, Clone, PartialEq)]
pub(crate) struct ColumnIndex {
    index: HashMap<String, RowAddress>,
}

impl ColumnIndex {
    /// Build index from a given table and column name.
    pub(crate) fn new<P>(
        path: P,
        separator: char,
        column_name: &str,
        page_size: usize,
    ) -> Result<Self>
    where
        P: AsRef<Path>,
    {
        // Load the column values into the hash map while keeping the row number as value.
        let mut reader = csv::ReaderBuilder::new()
            .delimiter(separator as u8)
            .from_path(path)?;

        let headers = reader.headers()?;
        let column_index = headers.iter().position(|r| r == column_name).unwrap();
        let mut index = HashMap::new();
        let address_factory = RowAddressFactory::new(page_size);
        for (i, result) in reader.records().enumerate() {
            index.insert(
                result?.get(column_index).unwrap().to_owned(),
                address_factory.get(i),
            );
        }
        Ok(ColumnIndex { index })
    }

    /// Obtain subset of index given a set of keys. This can e.g. be used to obtain
    /// an index for serialization to JSON for use in a specific page of a foreign table.
    pub(crate) fn subset<R, K>(&self, keys: K) -> HashMap<String, Option<RowAddress>>
    where
        R: AsRef<str>,
        K: Iterator<Item = R>,
    {
        keys.map(|key| {
            (
                key.as_ref().to_owned(),
                self.index.get(key.as_ref()).cloned(),
            )
        })
        .collect()
    }
}

#[cfg(test)]
mod tests {
    use crate::utils::column_index::ColumnIndex;
    use crate::utils::row_address::RowAddress;
    use std::collections::HashMap;
    use std::str::FromStr;

    #[test]
    fn test_column_index() {
        let column_index = ColumnIndex::new(
            "tests/data/sales.csv",
            char::from_str(",").unwrap(),
            "first",
            3,
        )
        .unwrap();
        let expected_column_index = ColumnIndex {
            index: HashMap::from([
                (String::from("Delia"), RowAddress::new(0, 0)),
                (String::from("Douglas"), RowAddress::new(0, 1)),
                (String::from("Winnie"), RowAddress::new(0, 2)),
                (String::from("George"), RowAddress::new(1, 0)),
            ]),
        };

        assert_eq!(column_index, expected_column_index)
    }
}

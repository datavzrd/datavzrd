use crate::spec::DatasetSpecs;
use anyhow::Result;
use std::collections::HashMap;

use crate::utils::row_address::{RowAddress, RowAddressFactory};

#[derive(Debug, Clone, PartialEq)]
pub(crate) struct ColumnIndex {
    pub(crate) index: HashMap<String, Vec<RowAddress>>,
    pub(crate) in_memory: bool,
}

impl ColumnIndex {
    /// Build index from a given table and column name.
    pub(crate) fn new(
        dataset: &DatasetSpecs,
        column_name: &str,
        page_size: usize,
        max_in_memory_rows: usize,
    ) -> Result<Self> {
        // Load the column values into the hash map while keeping the row numbers as value.
        let headers = dataset.reader()?.headers()?;
        let column_index = headers.iter().position(|r| r == column_name).unwrap();
        let mut index: HashMap<String, Vec<RowAddress>> = HashMap::new();
        let address_factory = RowAddressFactory::new(page_size);
        for (i, result) in dataset.records()?.enumerate() {
            index
                .entry(result.get(column_index).unwrap().to_owned())
                .or_default()
                .push(address_factory.get(i));
        }
        let in_memory = index.values().map(Vec::len).sum::<usize>() <= max_in_memory_rows;
        Ok(ColumnIndex { index, in_memory })
    }

    /// Obtain subset of index given a set of keys. This can e.g. be used to obtain
    /// an index for serialization to JSON for use in a specific page of a foreign table.
    pub(crate) fn _subset<R, K>(&self, keys: K) -> HashMap<String, Option<Vec<RowAddress>>>
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
    use crate::spec::DatasetSpecs;
    use crate::utils::column_index::ColumnIndex;
    use crate::utils::row_address::RowAddress;
    use std::collections::HashMap;
    use std::str::FromStr;

    #[test]
    fn test_column_index() {
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
        let column_index = ColumnIndex::new(&dataset, "first", 3, 3).unwrap();
        let expected_column_index = ColumnIndex {
            index: HashMap::from([
                (String::from("Delia"), vec![RowAddress { page: 0, row: 0 }]),
                (
                    String::from("George"),
                    vec![
                        RowAddress { page: 0, row: 1 },
                        RowAddress { page: 1, row: 0 },
                    ],
                ),
                (String::from("Winnie"), vec![RowAddress { page: 0, row: 2 }]),
            ]),
            in_memory: false,
        };

        assert_eq!(column_index, expected_column_index)
    }
}

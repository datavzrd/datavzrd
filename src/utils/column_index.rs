use std::collections::HashMap;
use std::path::Path;

use anyhow::Result;

use crate::utils::row_address::RowAddress;

#[derive(Debug, Clone)]
pub(crate) struct ColumnIndex {
    index: HashMap<String, RowAddress>,
}

impl ColumnIndex {
    /// Build index from a given table and column name.
    pub(crate) fn new<P>(path: P, column_name: &str) -> Result<Self>
    where
        P: AsRef<Path>,
    {
        // Load the column values into the hash map while keeping the row number as value.
        unimplemented!()
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

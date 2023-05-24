use std::io::Read;

use anyhow::Result;

pub(crate) mod column_index;
pub(crate) mod column_type;
pub(crate) mod row_address;

/// Returns the index of the given column of a csv header
pub(crate) fn column_position<R: Read>(column: &str, reader: &mut csv::Reader<R>) -> Result<usize> {
    // TODO implement something like a lookup table for this, and wrap
    // the csv::Reader in a struct that does this lookup.
    for (index, c) in reader.headers()?.iter().enumerate() {
        if c == column {
            return Ok(index);
        }
    }
    panic!("bug: column {column} not found in dataset but no error thrown by spec validation");
}

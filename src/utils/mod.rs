use std::{io::Read, path::Path};

use anyhow::Result;
use csv::StringRecord;

use crate::render::portable::ColumnError;

pub(crate) mod column_index;
pub(crate) mod column_type;
pub(crate) mod row_address;

/// Returns the index of the given column of a csv header
pub(crate) fn column_position<R: Read>(
    column: &str,
    reader: &mut csv::Reader<R>,
    csv_path: &Path,
) -> Result<usize> {
    for (index, c) in reader.headers()?.iter().enumerate() {
        if c == column {
            return Ok(index);
        }
    }
    Err(ColumnError::NotFound {
        column: column.to_string(),
        path: csv_path.to_str().unwrap().to_string(),
    }
    .into())
}

use anyhow::Result;
use jsonm::packer::{PackOptions, Packer};
use lz_str::compress_to_utf16;
use serde_json::{json, Value};

pub(crate) fn compress(data: Value) -> Result<String> {
    let mut packer = Packer::new();
    let options = PackOptions::new();
    let jsonm = packer.pack(&data, &options)?;
    Ok(compress_to_utf16(&json!(jsonm).to_string()))
}

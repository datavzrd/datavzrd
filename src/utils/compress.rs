use anyhow::Result;
use jsonm::packer::{PackOptions, Packer};
use lz_str::compress_to_utf16;
use serde_json::{json, Value};

pub(crate) fn compress(data: Value, debug: bool) -> Result<String> {
    if debug {
        return Ok(data.to_string());
    }
    let mut packer = Packer::new();
    let options = PackOptions::new();
    let jsonm = packer.pack(&data, &options)?;
    Ok(json!(compress_to_utf16(&json!(jsonm).to_string())).to_string())
}

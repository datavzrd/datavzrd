use anyhow::Result;
use itertools::Itertools;
use jsonm::packer::{PackOptions, Packer};
use lz_str::compress_to_utf16;
use serde_json::{json, Value};
use rmp_serde::to_vec;

pub(crate) fn compress(data: Value) -> Result<String> {
    let mut packer = Packer::new();
    let options = PackOptions::new();
    let jsonm = packer.pack(&data, &options)?;
    let msgpack_data = to_vec(&data)?.iter().map(|&byte| format!("{:08b}", byte)).join("");
    Ok(compress_to_utf16(&msgpack_data))
}

pub(crate) fn compress_no_msgpack(data: Value) -> Result<String> {
    let mut packer = Packer::new();
    let options = PackOptions::new();
    let jsonm = packer.pack(&data, &options)?;
    Ok(compress_to_utf16(&jsonm.to_string()))
}

enum Compression {
    JSONM,
    MESSAGEPACK,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_compress() {
        let data = json!({
            "float": "13.489732".parse::<f64>().unwrap(),
            "another_float": "7.87437848".parse::<f64>().unwrap(),
        });
        let compressed = compress(data.clone()).unwrap();
        println!("{} is the result with msgpack", compressed.chars().count());
        let compressed_no_msgpack = compress_no_msgpack(data.clone()).unwrap();
        println!("{} is the result without msgpack.", compressed_no_msgpack.chars().count());
    }
}
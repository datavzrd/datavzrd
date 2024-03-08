use anyhow::Result;
use itertools::Itertools;
use jsonm::packer::{PackOptions, Packer};
use lz_str::compress_to_utf16;
use serde_json::{json, Value};
use rmp_serde::to_vec;

pub(crate) fn compress(data: Value) -> Result<String> {
    dbg!(&data);
    let mut packer = Packer::new();
    let options = PackOptions::new();
    let jsonm = packer.pack(&data, &options)?;
    let msgpack_data = to_vec(&jsonm)?.iter().map(|&byte| format!("{:08b}", byte)).join("");
    Ok(compress_to_utf16(&msgpack_data))
}

enum Compression {
    JSONM,
    MESSAGEPACK,
}

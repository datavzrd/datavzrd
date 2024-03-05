use anyhow::Result;
use itertools::Itertools;
use jsonm::packer::{PackOptions, Packer};
use lz_str::compress_to_utf16;
use serde_json::{json, Value};
use rmp_serde::to_vec;

pub(crate) fn compress(data: Value) -> Result<String> {
    // let mut packer = Packer::new();
    // let options = PackOptions::new();
    // let jsonm = packer.pack(&data, &options)?;
    let msgpack_data = String::from_utf16(&to_vec(&data)?.iter().map(|c| *c as u16).collect_vec())?;
    Ok(compress_to_utf16(&msgpack_data))
}

enum Compression {
    JSONM,
    MESSAGEPACK,
}

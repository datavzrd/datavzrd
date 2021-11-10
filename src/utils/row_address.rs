use derive_new::new;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub(crate) struct RowAddress {
    page: usize,
    row: usize,
}

#[derive(new, Debug, Clone)]
pub(crate) struct RowAddressFactory {
    page_size: usize,
}

impl RowAddressFactory {
    pub(crate) fn get(&self, row: usize) -> RowAddress {
        RowAddress {
            page: row / self.page_size,
            row: row % self.page_size,
        }
    }
}

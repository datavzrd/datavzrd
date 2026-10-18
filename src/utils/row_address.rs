use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub(crate) struct RowAddress {
    pub(crate) page: usize,
    pub(crate) row: usize,
}

#[derive(Debug, Clone)]
pub(crate) struct RowAddressFactory {
    page_size: usize,
}

impl RowAddressFactory {
    pub(crate) fn new(page_size: usize) -> Self {
        RowAddressFactory { page_size }
    }

    pub(crate) fn get(&self, row: usize) -> RowAddress {
        RowAddress {
            page: row / self.page_size,
            row: row % self.page_size,
        }
    }
}

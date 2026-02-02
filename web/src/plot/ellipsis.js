import $ from "jquery";

export function shortenColumn(
  ah,
  columns,
  title,
  ellipsis,
  detail_mode,
  header_label_length,
  columnIndexMap,
) {
  let index = columnIndexMap[title];
  let row = 0;
  $(`table > tbody > tr td:nth-child(${index})`).each(function () {
    let value = this.innerHTML;
    if (ellipsis === 0) {
      this.innerHTML = `<div style="width: 100%; height: 100%;" data-toggle="tooltip" data-trigger="hover click focus" title='${value}'></div>`;
    } else if (value.length > ellipsis) {
      this.innerHTML = `<span data-toggle="tooltip" data-trigger="hover click focus" title='${value}'>${value.substring(0, ellipsis)}...</span>`;
    }
    row++;
  });
}

export function shortenHeaderRow(row, ellipsis, skip_label) {
  $(`table > thead > tr:nth-child(${row + 1}) > td`).each(function () {
    let value = this.innerHTML;
    if (ellipsis === 0 && !skip_label) {
      this.innerHTML = `<div style="width: 100%; height: 100%;" data-toggle="tooltip" data-trigger="hover click focus" title='${value}'></div>`;
    } else if (value.length > ellipsis && !skip_label) {
      this.innerHTML = `<span data-toggle="tooltip" data-trigger="hover click focus" title='${value}'>${value.substring(0, ellipsis)}...</span>`;
    }
    skip_label = false;
  });
}

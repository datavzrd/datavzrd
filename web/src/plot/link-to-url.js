import $ from "jquery";

export function createLinkHtml(columns, link_urls, value, shown_value, row) {
  if (link_urls.length == 1) {
    let link = link_urls[0].link.url.replaceAll("{value}", value);
    for (const column of columns) {
      link = link.replaceAll(`{${column}}`, row[column]);
    }
    if (link_urls[0].link["new-window"]) {
      return `<a href="${link}" target="_blank" rel="noopener noreferrer" >${shown_value}</a>`;
    } else {
      return `<a href="${link}">${shown_value}</a>`;
    }
  } else {
    let links = "";
    for (let l of link_urls) {
      let link = l.link.url.replaceAll("{value}", value);
      for (const column of columns) {
        link = link.replaceAll(`{${column}}`, row[column]);
      }
      if (l.link["new-window"]) {
        links = `${links}<a class="dropdown-item" href="${link}" target='_blank' rel="noopener noreferrer" >${l.name}</a>`;
      } else {
        links = `${links}<a class="dropdown-item" href="${link}" >${l.name}</a>`;
      }
    }
    return `
              <div class="linkout-raw-value">${shown_value}</div>
              <div class="btn-group linkout-group">
                <button class="btn btn-outline-secondary btn-table btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  ${shown_value}
                </button>
                <div class="dropdown-menu">
                  ${links}
                </div>
              </div>
            `;
  }
}

export function linkUrlColumn(
  columns,
  title,
  link_urls,
  custom_content,
  columnIndexMap,
) {
  let index = columnIndexMap[title];
  let table_rows = $("#table").bootstrapTable("getData");
  $(`table > tbody > tr td:nth-child(${index})`).each(function () {
    let row = this.parentElement.dataset.index;
    let value = table_rows[row][title];
    let shown_value = value;
    if (custom_content) {
      shown_value = window[custom_content](value, table_rows[row]);
    }
    this.innerHTML = createLinkHtml(
      columns,
      link_urls,
      value,
      shown_value,
      table_rows[row],
    );
    row++;
  });
}

export function linkDetailUrlColumn(row, div, link_urls, columns) {
  var custom_content = link_urls["custom-content"];
  var value = row[link_urls["title"]];
  var shown_value = value;
  if (custom_content) {
    shown_value = window[custom_content](value, row);
  }
  $(`${div}`)[0].innerHTML = createLinkHtml(
    columns,
    link_urls["links"],
    value,
    shown_value,
    row,
  );
}

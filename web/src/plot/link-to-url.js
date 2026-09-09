import $ from "jquery";

function buildLinkUrl(url, columns, value, row, pill_value) {
  let link = url.replaceAll("{value}", value);
  if (pill_value !== undefined) {
    link = link.replaceAll("{pill-value}", pill_value);
  }
  for (const column of columns) {
    link = link.replaceAll(`{${column}}`, row[column]);
  }
  return link;
}

export function dropdownItems(columns, link_urls, value, row, pill_value) {
  let items = "";
  for (let l of link_urls) {
    let link = buildLinkUrl(l.link.url, columns, value, row, pill_value);
    if (l.link["new-window"]) {
      items = `${items}<a class="dropdown-item" href="${link}" target='_blank' rel="noopener noreferrer" >${l.name}</a>`;
    } else {
      items = `${items}<a class="dropdown-item" href="${link}" >${l.name}</a>`;
    }
  }
  return items;
}

export function createLinkHtml(
  columns,
  link_urls,
  value,
  shown_value,
  row,
  pill_value,
) {
  if (link_urls.length == 1) {
    let link = buildLinkUrl(link_urls[0].link.url, columns, value, row, pill_value);
    if (link_urls[0].link["new-window"]) {
      return `<a href="${link}" target="_blank" rel="noopener noreferrer" >${shown_value}</a>`;
    } else {
      return `<a href="${link}">${shown_value}</a>`;
    }
  } else {
    return `
              <div class="linkout-raw-value">${shown_value}</div>
              <div class="btn-group linkout-group">
                <button class="btn btn-outline-secondary btn-table btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  ${shown_value}
                </button>
                <div class="dropdown-menu">
                  ${dropdownItems(columns, link_urls, value, row, pill_value)}
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

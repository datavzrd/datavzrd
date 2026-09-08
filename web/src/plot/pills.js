import $ from "jquery";
import {
  isDark,
  datavzrdScale
} from "./heatmap";
import { createLinkHtml, dropdownItems } from "./link-to-url";

function renderPill(
  value,
  color,
  ellipsis,
  merge = false,
  position = "middle",
  dropdown = false,
) {
  let styles = `padding: 4px 8px; background-color: ${color};`;
  if (isDark(color)) {
    styles += "color: white;";
  }
  if (!merge) {
    styles += "margin: 2px; border-radius: 12px;";
  } else {
    let radius =
      position === "first"
        ? "12px 0 0 12px"
        : position === "last"
          ? "0 12px 12px 0"
          : position === "only"
            ? "12px"
            : "0";
    styles += `border-radius: ${radius}; margin: 0;`;
  }
  if (dropdown) {
    styles += "cursor: pointer;";
  }
  let toggle = dropdown
    ? ' class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"'
    : "";
  let tooltip = dropdown
    ? ""
    : ' data-toggle="tooltip" data-trigger="hover click focus"';

  if (ellipsis === 0) {
    return `<span style="${styles}; padding:6px 12px; height:24px; width:24px;"${toggle}${tooltip} title='${value}'></span>`;
  } else if (ellipsis === undefined || value.length <= ellipsis) {
    return `<span style="${styles}"${toggle}>${value}</span>`;
  } else {
    return `<span style="${styles}"${toggle}${tooltip} title='${value}'>${value.substring(0, ellipsis)}...</span>`;
  }
}

export function pillsToHeatmap(pills) {
  return {
    heatmap: {
      scale: "ordinal",
      domain: pills.pills.domain,
      range: pills.pills.range,
      "color-scheme": pills.pills["color-scheme"],
      clamp: true,
      "custom-content": undefined,
      legend: pills.pills.legend,
    },
  };
}

function renderPillGroup(value, pills, scale, link, columns, row) {
  let values = value.split(pills.pills.separator).map((item) => item.trim());
  return values
    .map((v, i) => {
      let pos =
        values.length === 1
          ? "only"
          : i === 0
            ? "first"
            : i === values.length - 1
              ? "last"
              : "middle";
      if (link && link.links.length > 1) {
        let toggle = renderPill(
          v,
          scale(v),
          pills.pills.ellipsis,
          pills.pills.merge,
          pos,
          true,
        );
        let items = dropdownItems(columns, link.links, value, row, v);
        return `<span class="btn-group pill-dropdown">${toggle}<div class="dropdown-menu">${items}</div></span>`;
      }
      let pill = renderPill(
        v,
        scale(v),
        pills.pills.ellipsis,
        pills.pills.merge,
        pos,
      );
      if (link) {
        return createLinkHtml(columns, link.links, value, pill, row, v);
      }
      return pill;
    })
    .join("");
}

export function renderPills(
  ah,
  columns,
  pills,
  detail_mode,
  header_label_length,
  columnIndexMap,
  link,
  link_columns,
) {
  let index = columnIndexMap[pills.title];
  let row = 0;
  var table_rows = $("#table").bootstrapTable("getData", {
    useCurrentPage: "true",
  });
  let heatmap = pillsToHeatmap(pills);
  let scale = datavzrdScale(heatmap);

  $(`table > tbody > tr td:nth-child(${index})`).each(function () {
    var value = table_rows[row][pills.title];
    if (value !== "") {
      let content = renderPillGroup(
        value,
        pills,
        scale,
        link,
        link_columns,
        table_rows[row],
      );
      this.innerHTML = `<div class="pills-cell" style="display: inline-block; margin: 8px 0;">${content}</div>`;
    }
    row++;
  });
}

export function renderDetailPills(value, div, pills, link, link_columns, row) {
  let heatmap = pillsToHeatmap(pills);
  let scale = datavzrdScale(heatmap);

  if (value !== "") {
    let content = renderPillGroup(value, pills, scale, link, link_columns, row);
    $(`${div}`)[0].innerHTML = `<div class="detail-pills-wrapper">${content}</div>`;
  }
  $('[data-toggle="tooltip"]').tooltip({
    sanitizeFn: function (content) {
      return content;
    },
  });
}

import $ from "jquery";
import {
  isDark,
  datavzrdScale
} from "./heatmap";

function renderPill(
  value,
  color,
  ellipsis,
  merge = false,
  position = "middle",
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

  if (ellipsis === 0) {
    return `<span style="${styles}; padding:6px 12px; height:24px; width:24px;" data-toggle="tooltip" data-trigger="hover click focus" title='${value}'></span>`;
  } else if (ellipsis === undefined || value.length <= ellipsis) {
    return `<span style="${styles}">${value}</span>`;
  } else {
    return `<span style="${styles}" data-toggle="tooltip" data-trigger="hover click focus" title='${value}'>${value.substring(0, ellipsis)}...</span>`;
  }
}

function pillsToHeatmap(pills) {
  return {
    heatmap: {
      scale: "ordinal",
      domain: pills.pills.domain,
      range: pills.pills.range,
      "color-scheme": pills.pills["color-scheme"],
      clamp: true,
      "custom-content": undefined,
    },
  };
}

export function renderPills(
  ah,
  columns,
  pills,
  detail_mode,
  header_label_length,
  columnIndexMap,
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
      let values = value
        .split(pills.pills.separator)
        .map((item) => item.trim());
      let content = values
        .map((v, i) => {
          let pos =
            values.length === 1
              ? "only"
              : i === 0
                ? "first"
                : i === values.length - 1
                  ? "last"
                  : "middle";
          let color = scale(v);
          return renderPill(
            v,
            color,
            pills.pills.ellipsis,
            pills.pills.merge,
            pos,
          );
        })
        .join("");
      this.innerHTML = `<div style="display: inline-block; margin: 8px 0;">${content}</div>`;
    }
    row++;
  });
}

export function renderDetailPills(value, div, pills) {
  let heatmap = pillsToHeatmap(pills);
  let scale = datavzrdScale(heatmap);

  if (value !== "") {
    let values = value.split(pills.pills.separator).map((item) => item.trim());
    let content = values
      .map((v, i) => {
        let pos =
          values.length === 1
            ? "only"
            : i === 0
              ? "first"
              : i === values.length - 1
                ? "last"
                : "middle";
        let color = scale(v);
        return renderPill(
          v,
          color,
          pills.pills.ellipsis,
          pills.pills.merge,
          pos,
        );
      })
      .join("");
    $(`${div}`)[0].innerHTML = `<div class="detail-pills-wrapper">${content}</div>`;
  }
  $('[data-toggle="tooltip"]').tooltip({
    sanitizeFn: function (content) {
      return content;
    },
  });
}

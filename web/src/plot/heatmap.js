import $ from "jquery";
import * as vega from "vega";
import * as d3 from "d3";
import { precision_formatter } from "../utils";

export function colorizeColumn(
  ah,
  columns,
  heatmap,
  detail_mode,
  header_label_length,
  columnIndexMap,
) {
  let index = columnIndexMap[heatmap.title];
  let row = 0;
  var table_rows = $("#table").bootstrapTable("getData", {
    useCurrentPage: "true",
  });
  var custom_func = heatmap.heatmap["custom-content"];

  let scale = datavzrdScale(heatmap);

  $(`table > tbody > tr td:nth-child(${index})`).each(function () {
    var value = table_rows[row][heatmap.title];
    let color = scale(value);
    if (value !== "") {
      this.style.setProperty("background-color", color, "important");
    }
    if (isDark(color)) {
      this.style.setProperty("color", "white", "important");
    }
    if (custom_func) {
      var data_function = window[custom_func];
      value = data_function(value, table_rows[row]);
      this.innerHTML = value;
    }
    row++;
  });
}

export function datavzrdScale(heatmap) {
  let scale = null;
  if (heatmap.heatmap.scale == "ordinal") {
    if (heatmap.heatmap["color-scheme"] != "") {
      scale = vega
        .scale(heatmap.heatmap.scale)()
        .domain(heatmap.heatmap.domain)
        .range(vega.scheme(heatmap.heatmap["color-scheme"]));
    } else if (!heatmap.heatmap.range.length == 0) {
      scale = vega
        .scale(heatmap.heatmap.scale)()
        .domain(heatmap.heatmap.domain)
        .range(heatmap.heatmap.range);
    } else {
      scale = vega
        .scale(heatmap.heatmap.scale)()
        .domain(heatmap.heatmap.domain);
    }
  } else {
    if (heatmap.heatmap["color-scheme"] != "") {
      let scheme = heatmap.heatmap["color-scheme"];
      let d3_scheme =
        d3[
          `interpolate${scheme.charAt(0).toUpperCase()}${scheme.slice(1).toLowerCase()}`
        ];
      let s = heatmap.heatmap.scale;
      if (heatmap.heatmap.scale == "linear") {
        s = ""; // Use scaleSequential if scale is linear
      }
      scale = d3[
        `scaleSequential${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`
      ](heatmap.heatmap.domain, d3_scheme);
    } else if (!heatmap.heatmap.range == 0) {
      scale = vega
        .scale(heatmap.heatmap.scale)()
        .domain(heatmap.heatmap.domain)
        .clamp(heatmap.heatmap.clamp)
        .range(heatmap.heatmap.range);
    } else {
      scale = vega
        .scale(heatmap.heatmap.scale)()
        .domain(heatmap.heatmap.domain)
        .clamp(heatmap.heatmap.clamp);
    }
  }

  return scale;
}

export function colorizeDetailCard(value, div, heatmap, row, is_float, precision) {
  let scale = datavzrdScale(heatmap);

  if (value !== "") {
    let color = scale(value);
    $(`${div}`).css("background-color", color);
    if (isDark(color)) {
      $(`${div}`).css("color", "white", "important");
    }
  }
  if (heatmap.heatmap["custom-content"]) {
    var data_function = window[heatmap.heatmap["custom-content"]];
    value = data_function(value, row);
    $(`${div}`)[0].innerHTML = value;
  } else if (is_float && precision !== undefined) {
    value = precision_formatter(precision, value);
    $(`${div}`)[0].innerHTML = value;
  }
}

export function colorizeHeaderRow(row, heatmap, header_label_length) {
  let scale = null;

  if (heatmap.scale == "ordinal") {
    if (heatmap.domain != null) {
      if (heatmap["color-scheme"] != "") {
        scale = vega
          .scale(heatmap.scale)()
          .domain(heatmap.domain)
          .range(vega.scheme(heatmap["color-scheme"]));
      } else if (!heatmap.range.length == 0) {
        scale = vega
          .scale(heatmap.scale)()
          .domain(heatmap.domain)
          .range(heatmap.range);
      } else {
        scale = vega.scale(heatmap.scale)().domain(heatmap.domain);
      }
    } else {
      if (heatmap["color-scheme"] != "") {
        scale = vega
          .scale(heatmap.scale)()
          .range(vega.scheme(heatmap["color-scheme"]));
      } else if (!heatmap.range.length == 0) {
        scale = vega.scale(heatmap.scale)().range(heatmap.range);
      } else {
        scale = vega.scale(heatmap.scale)();
      }
    }
  } else {
    if (heatmap.domain != null) {
      if (heatmap["color-scheme"] != "") {
        scale = vega
          .scale(heatmap.scale)()
          .domain(heatmap.domain)
          .clamp(heatmap.clamp)
          .range(vega.scheme(heatmap["color-scheme"]));
      } else if (!heatmap.range == 0) {
        scale = vega
          .scale(heatmap.scale)()
          .domain(heatmap.domain)
          .clamp(heatmap.clamp)
          .range(heatmap.range);
      } else {
        scale = vega
          .scale(heatmap.scale)()
          .domain(heatmap.domain)
          .clamp(heatmap.clamp);
      }
    } else {
      if (heatmap["color-scheme"] != "") {
        scale = vega
          .scale(heatmap.scale)()
          .clamp(heatmap.clamp)
          .range(vega.scheme(heatmap["color-scheme"]));
      } else if (!heatmap.range == 0) {
        scale = vega
          .scale(heatmap.scale)()
          .clamp(heatmap.clamp)
          .range(heatmap.range);
      } else {
        scale = vega.scale(heatmap.scale)().clamp(heatmap.clamp);
      }
    }
  }
  var start = 0;
  if (header_label_length > 0) {
    start = 1;
  }
  $(`table > thead > tr:nth-child(${row + 1}) > td:gt(${start})`).each(
    function () {
      var value = this.innerHTML;
      if (value !== "") {
        this.style.setProperty("background-color", scale(value), "important");
      }
    },
  );
}

export function isDark(c) {
  let rgb = d3.color(c).rgb();
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b < 128;
}

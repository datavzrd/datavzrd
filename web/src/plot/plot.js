import $ from "jquery";
import { precision_formatter } from "../utils";
import vegaEmbed from "vega-embed";

let VEGA_EMBED_OPTIONS = { renderer: "svg", actions: false };

export function renderPlot(
  ah,
  columns,
  title,
  slug_title,
  specs,
  is_float,
  precision,
  detail_mode,
  header_label_length,
  columnIndexMap,
) {
  let index = columnIndexMap[title];
  let row = 0;
  let table_rows = $("#table").bootstrapTable("getData", {
    useCurrentPage: true,
  });
  $(`table > tbody > tr td:nth-child(${index})`).each(function () {
    var id = `${slug_title}-${row}`;
    this.classList.add("plotcell");
    const div = document.createElement("div");
    let value = table_rows[row][title];
    if (is_float && precision !== undefined) {
      value = precision_formatter(precision, value);
    }
    if (value != "") {
      this.innerHTML = "";
      this.appendChild(div);
      var data = [];
      var v = {};
      v[title] = value;
      data.push(v);
      var s = specs;
      s.data = {};
      s.data.values = data;
      vegaEmbed(div, JSON.parse(JSON.stringify(s)), VEGA_EMBED_OPTIONS);
    }
    row++;
  });
}

export function renderDetailTickBarBubblePlot(value, div, specs, title) {
  if (value != "") {
    var data = [];
    var v = {};
    v[title] = value;
    data.push(v);
    var s = specs;
    s.data = {};
    s.data.values = data;
    vegaEmbed(div, JSON.parse(JSON.stringify(s)), VEGA_EMBED_OPTIONS);
  }
}

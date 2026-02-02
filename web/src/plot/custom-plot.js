import $ from "jquery";
import vegaEmbed from "vega-embed";

export function renderCustomPlot(
  ah,
  dp_columns,
  plot,
  dm,
  header_label_length,
  columnIndexMap,
) {
  let index = columnIndexMap[plot.title];
  var data_function = window[plot.data_function];
  var specs = plot.specs;
  let row = 0;
  let table_rows = $("#table").bootstrapTable("getData", {
    useCurrentPage: true,
  });
  let all_rows = $("#table").bootstrapTable("getData");
  $(`table > tbody > tr td:nth-child(${index})`).each(function () {
    var id = `${plot.title}-${row}`;
    this.classList.add("plotcell");
    const div = document.createElement("div");
    let value = table_rows[row][plot.title];
    let value_row = table_rows[row];
    var data = data_function(value, value_row, all_rows);
    var s = specs;
    s.data = {};
    s.data.values = data;
    if (plot.legend) {
      disableVegaLegend(s);
    }
    var opt = { actions: plot.vega_controls, renderer: "svg" };
    this.innerHTML = "";
    this.appendChild(div);
    vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
    row++;
  });
}

export function renderCustomPlotDetailView(
  value,
  row,
  div,
  data_function,
  specs,
  vega_controls,
  legend,
) {
  let all_rows = $("#table").bootstrapTable("getData");
  var data = data_function(value, row, all_rows);
  var s = specs;
  s.data = {};
  s.data.values = data;
  if (legend) {
    disableVegaLegend(s);
  }
  var opt = { actions: vega_controls, renderer: "svg" };
  vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
}

function disableVegaLegend(spec) {
  if (!spec.config) spec.config = {};
  spec.config.legend = {
    ...(spec.config.legend || {}),
    disable: true,
  };
}

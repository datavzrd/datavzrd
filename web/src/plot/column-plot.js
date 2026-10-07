import $ from "jquery";
import vegaEmbed from "vega-embed";
import { download } from "../utils";

const MARKS = ["point", "circle", "square", "tick", "line", "area", "bar", "boxplot"];
const POINT_MARKS = ["point", "circle", "square"];
const TYPES = ["quantitative", "ordinal", "nominal", "temporal"];
const SCALES = ["linear", "log", "sqrt", "symlog"];
const AGGREGATES = ["count", "sum", "mean", "median", "min", "max"];
const HEIGHT = 400;
const MAX_SIZE = 2000;
const LABEL_STEP = 14;
const EXPORTS = {
  svg: async ({ view }) => [await view.toSVG(), "image/svg+xml"],
  png: async ({ view }) => [await (await fetch(await view.toImageURL("png", 2))).blob(), "image/png"],
  json: (plot) => [JSON.stringify(withData(plot), null, 2), "application/json"],
  html: (plot) => [standaloneHtml(plot), "text/html"],
  yaml: (plot) => [viewConfig(plot), "text/yaml"],
};

let selectedColumn = null;
let currentPlot = null;

export function columnPlotIcon(index) {
  return `<span class="sym ic plot-column-icon" data-column="${index}" title="Plot against another column" onclick="datavzrd.selectPlotColumn(${index})"><svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h1v13h13v1H1z"/><circle cx="5" cy="10" r="1.5"/><circle cx="8" cy="6" r="1.5"/><circle cx="11.5" cy="8.5" r="1.5"/><circle cx="13" cy="3.5" r="1.5"/></svg></span>`;
}

// The first click marks a column, the second one opens the plot of both.
export function selectPlotColumn(index) {
  const column = config.columns[index];
  if (selectedColumn !== null && selectedColumn !== column) {
    openColumnPlot(selectedColumn, column);
  }
  selectedColumn = selectedColumn === null ? column : null;
  $(".plot-column-icon").removeClass("active");
  $(`.plot-column-icon[data-column="${index}"]`).toggleClass("active", selectedColumn !== null);
}

function columnPlotSpec(options) {
  const x = channel(options.x, options.xType);
  const y =
    options.aggregate === "count"
      ? { type: "quantitative" }
      : channel(options.y, options.yType);
  if (options.aggregate) {
    y.aggregate = options.aggregate;
  }
  addScale(x, options.xScale, options.mark);
  addScale(y, options.yScale, options.mark);

  const mark = {
    type: options.mark,
    ...(options.mark !== "boxplot" && { tooltip: { content: "data" } }),
    ...(options.opacity < 1 && { opacity: Number(options.opacity) }),
  };
  const encoding = {
    x,
    y,
    ...(options.color && { color: channel(options.color, defaultType(options.color)) }),
    ...(options.size && { size: channel(options.size, defaultType(options.size)) }),
    ...(options.shape && { shape: channel(options.shape, "nominal") }),
  };

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
    ...(options.title && { title: options.title }),
    width: Number(options.width),
    height: Number(options.height),
    autosize: { type: "fit", contains: "padding" },
    ...(options.zoom && {
      params: [{ name: "zoom", select: "interval", bind: "scales" }],
    }),
    mark,
    encoding,
  };
}

// Sizes an axis to the available space or, if it is discrete and has more
// categories than fit, to one step per category so that its labels stay
// readable. The plot then scrolls, and the sliders can still change the size.
function fitAxis(axis) {
  const form = document.getElementById("column-plot-options");
  const slider = form.elements[axis === "x" ? "width" : "height"];
  const column = form.elements[axis].value;
  const discrete = ["nominal", "ordinal"].includes(form.elements[`${axis}Type`].value);
  const categories = discrete ? new Set(tableData().map((row) => row[column])).size : 0;
  const available = axis === "x" ? $("#column-plot").width() : HEIGHT;
  const size = Math.max(available, categories * LABEL_STEP);
  slider.max = Math.max(MAX_SIZE, size);
  slider.value = size;
}

function channel(column, type) {
  // Vega-Lite reads dots, brackets and quotes in field names as nested access.
  const field = column.replace(/[.[\]'"\\]/g, "\\$&");
  const encoding = { field, type };
  const title = label(column) ?? column;
  if (title !== field) {
    encoding.title = title;
  }
  return encoding;
}

function addScale(encoding, type, mark) {
  if (encoding.type !== "quantitative") return;
  const scale = {};
  if (type && type !== "linear") {
    scale.type = type;
  }
  // Bars and areas are anchored at zero, everything else should fit the data.
  // Log scales have no zero.
  if (type !== "log" && mark !== "bar" && mark !== "area") {
    scale.zero = false;
  }
  if (Object.keys(scale).length > 0) {
    encoding.scale = scale;
  }
}

function openColumnPlot(x, y) {
  if ($("#column-plot-modal").length === 0) {
    initModal();
  }
  const form = document.getElementById("column-plot-options");
  for (const [axis, column] of [["x", x], ["y", y]]) {
    form.elements[axis].value = column;
    form.elements[`${axis}Type`].value = defaultType(column);
  }
  $("#column-plot-modal").modal("show");
}

function initModal() {
  $("#modal-container").append(modal());
  const form = $("#column-plot-options");
  for (const name of ["x", "y", "color", "size", "shape"]) {
    form
      .find(`[name=${name}]`)
      .append(datasetColumns().map((c) => new Option(label(c) ?? c, c)));
  }
  form.find("[name=x], [name=y], [name=xType], [name=yType]").on("change", function () {
    const axis = this.name[0];
    if (this.name === axis) {
      form.find(`[name=${axis}Type]`).val(defaultType(this.value));
    }
    fitAxis(axis);
  });
  form.on("change", render);
  form.on("submit", (event) => event.preventDefault());
  $("#column-plot-swap").on("click", swapAxes);
  $("#column-plot-copy").on("click", function () {
    navigator.clipboard.writeText(viewConfig(currentPlot)).then(() => {
      $(this).text("Copied");
      setTimeout(() => $(this).text("Copy"), 1500);
    });
  });
  $("#column-plot-modal").on("click", "[data-export]", async function () {
    const plot = currentPlot;
    const { view } = await plot.embedding;
    const format = this.dataset.export;
    const [content, type] = await EXPORTS[format]({ ...plot, view });
    download(content, type, `${plot.name}.${format}`);
  });
  $("#column-plot-modal").on("shown.bs.modal", () => {
    fitAxis("x");
    fitAxis("y");
    render();
  });
}

function render() {
  const form = document.getElementById("column-plot-options");
  updateControls(form);
  const options = Object.fromEntries(new FormData(form));
  const plot = { name: viewName(options), spec: columnPlotSpec(options), data: tableData() };
  plot.embedding = vegaEmbed("#column-plot", withData(plot), { actions: false });
  plot.embedding.catch((error) => {
    $("#column-plot").empty().append($('<p class="text-danger">').text(error.message));
  });
  currentPlot = plot;
  $("#column-plot-width").text(`${options.width} px`);
  $("#column-plot-height").text(`${options.height} px`);
  $("#column-plot-yaml").text(viewConfig(plot));
}

// Disabled controls are left out of the form data and hence out of the spec.
function updateControls(form) {
  const { mark, aggregate, yType, xType } = form.elements;
  const canAggregate = mark.value !== "boxplot";
  const count = canAggregate && aggregate.value === "count";
  const enabled = {
    xScale: xType.value === "quantitative",
    y: !count,
    yType: !count,
    yScale: count || yType.value === "quantitative",
    aggregate: canAggregate,
    size: POINT_MARKS.includes(mark.value),
    shape: mark.value === "point",
    zoom: mark.value !== "boxplot",
  };
  for (const [name, isEnabled] of Object.entries(enabled)) {
    form.elements[name].disabled = !isEnabled;
  }
}

function swapAxes() {
  const form = document.getElementById("column-plot-options");
  for (const suffix of ["", "Type", "Scale"]) {
    const x = form.elements[`x${suffix}`];
    const y = form.elements[`y${suffix}`];
    [x.value, y.value] = [y.value, x.value];
  }
  fitAxis("x");
  fitAxis("y");
  render();
}

// Rows as currently filtered and sorted in the table, restricted to the
// dataset columns so that tooltips do not show linkouts or share buttons.
function tableData() {
  const columns = datasetColumns();
  return $("#table")
    .bootstrapTable("getData")
    .map((row) => Object.fromEntries(columns.map((c) => [c, row[c]])));
}

// Added columns only exist in the table and can therefore not be part of an
// exported plot view.
function datasetColumns() {
  return config.columns.filter((column) => !config.additional_colums[column]);
}

function defaultType(column) {
  return config.displayed_numeric_columns.includes(column)
    ? "quantitative"
    : "nominal";
}

function label(column) {
  return config.column_config[column]?.label;
}

function viewName(options) {
  const name =
    options.aggregate === "count"
      ? `${options.x} counts`
      : `${options.y} vs ${options.x}`;
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "plot"
  );
}

function withData({ spec, data }) {
  return { ...spec, data: { values: data } };
}

function viewConfig({ name, spec }) {
  const dataset = /^[A-Za-z_][\w.-]*$/.test(config.dataset)
    ? config.dataset
    : JSON.stringify(config.dataset);
  return [
    "views:",
    `  ${name}:`,
    `    dataset: ${dataset}`,
    "    render-plot:",
    "      spec: |",
    JSON.stringify(spec, null, 2).replace(/^/gm, "        "),
    "",
  ].join("\n");
}

function standaloneHtml(plot) {
  // Escape "<" so that values like "</script>" cannot end the script early.
  const spec = JSON.stringify(withData(plot)).replace(/</g, "\\u003c");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${plot.name}</title>
  <script src="https://cdn.jsdelivr.net/npm/vega@6"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-lite@6"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-embed@7"></script>
</head>
<body>
  <div id="vis"></div>
  <script>vegaEmbed("#vis", ${spec}, { actions: false });</script>
</body>
</html>
`;
}

function select(name, values, placeholder) {
  const options = values.map((v) => `<option value="${v}">${v}</option>`);
  if (placeholder !== undefined) {
    options.unshift(`<option value="">${placeholder}</option>`);
  }
  return `<select name="${name}" class="custom-select custom-select-sm">${options.join("")}</select>`;
}

function field(title, content) {
  return `<div class="form-group mb-2"><div class="small text-muted mb-1">${title}</div>${content}</div>`;
}

function modal() {
  const axis = (name) => `
    ${select(name, [])}
    <div class="form-row mt-1">
      <div class="col">${select(`${name}Type`, TYPES)}</div>
      <div class="col">${select(`${name}Scale`, SCALES)}</div>
    </div>`;
  return `
    <div class="modal fade" id="column-plot-modal" tabindex="-1" role="dialog" aria-labelledby="column-plot-title" aria-hidden="true">
      <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="column-plot-title">Plot columns</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <form id="column-plot-options" class="col-lg-3">
                ${field("X axis", axis("x"))}
                ${field("Y axis", axis("y"))}
                ${field("Aggregate y", select("aggregate", AGGREGATES, "none"))}
                ${field("Mark", select("mark", MARKS))}
                ${field("Color", select("color", [], "none"))}
                ${field("Size", select("size", [], "none"))}
                ${field("Shape", select("shape", [], "none"))}
                ${field("Opacity", '<input type="range" class="custom-range" name="opacity" min="0.1" max="1" step="0.1" value="1">')}
                ${field('Width <span id="column-plot-width"></span>', '<input type="range" class="custom-range" name="width" min="200" max="2000" step="10">')}
                ${field('Height <span id="column-plot-height"></span>', '<input type="range" class="custom-range" name="height" min="200" max="1200" step="10" value="400">')}
                ${field("Title", '<input type="text" name="title">')}
                <div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input" id="column-plot-zoom" name="zoom">
                  <label class="custom-control-label small" for="column-plot-zoom">Zoom and pan</label>
                </div>
              </form>
              <div class="col-lg-9">
                <div id="column-plot"></div>
              </div>
            </div>
            <div class="collapse mt-3" id="column-plot-export">
              <p class="small text-muted">
                Add this view to your datavzrd config to render the plot as a separate page.
                Note that the view shows all rows of the dataset, regardless of the filters applied to the table.
              </p>
              <pre id="column-plot-yaml"></pre>
              <button type="button" class="btn btn-sm btn-outline-secondary" id="column-plot-copy">Copy</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" data-export="yaml">Download</button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary mr-auto" id="column-plot-swap">Swap axes</button>
            <div class="dropup">
              <button type="button" class="btn btn-outline-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Download</button>
              <div class="dropdown-menu">
                <button type="button" class="dropdown-item" data-export="svg">SVG image</button>
                <button type="button" class="dropdown-item" data-export="png">PNG image</button>
                <button type="button" class="dropdown-item" data-export="json">Vega-Lite JSON</button>
                <button type="button" class="dropdown-item" data-export="html">HTML page</button>
              </div>
            </div>
            <button type="button" class="btn btn-outline-secondary" data-toggle="collapse" data-target="#column-plot-export">Export as view</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>`;
}

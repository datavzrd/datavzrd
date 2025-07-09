import $ from "jquery";
import LZString from "lz-string";
import showdown from "showdown";
import showdownKatex from "showdown-katex";
import jsonm from "jsonm";
import * as vega from "vega";
import vegaEmbed from "vega-embed";
import QRCode from "qrcode";
import * as d3 from "d3";
import "bootstrap";
import "bootstrap-table/src/bootstrap-table.js";
import "bootstrap-select";
import * as htmlToImage from "html-to-image";
import {
  render_html_contents,
  render_plot_size_controls,
  render_landing_page,
} from "./page";
import "../style/bootstrap.min.css";
import "../style/bootstrap-table.min.css";
import "../style/bootstrap-select.min.css";
import "../style/bootstrap-table-fixed-columns.min.css";
import "../style/datavzrd.css";

let LINE_NUMBERS = false;

let VEGA_EMBED_OPTIONS = { renderer: "svg", actions: false };

function renderMarkdownDescription(is_plot_view) {
  var innerDescription = document.getElementById("innerDescription");
  const converter = new showdown.Converter({
    extensions: [
      showdownKatex({
        throwOnError: true,
        displayMode: false,
        errorColor: "#1500ff",
      }),
    ],
  });
  converter.setFlavor("github");
  if (innerDescription.dataset.markdown != "null") {
    innerDescription.innerHTML = converter.makeHtml(
      innerDescription.dataset.markdown,
    );
  }
  if (!is_plot_view) {
    var heatmaps = config.heatmaps;
    if (header_config.heatmaps) {
      for (const e of header_config.heatmaps) {
        var domain = (domain = [
          ...new Set(
            header_config.headers
              .filter((d) => d.row === e.row)
              .flatMap((d) => Object.values(d.header)),
          ),
        ]);
        if (e.heatmap.scale !== "ordinal") {
          const numericDomain = domain
            .map(parseFloat)
            .filter((n) => !Number.isNaN(n));
          domain = [Math.min(...numericDomain), Math.max(...numericDomain)];
        }
        if (!e.heatmap.domain) {
          e.heatmap.domain = domain;
        }
        heatmaps.push({
          heatmap: e.heatmap,
          domain: domain,
        });
      }
    }
    var legends = renderHeatmapLegends(heatmaps);
    innerDescription.innerHTML += legends;
  }
  if (innerDescription.offsetHeight < window.screen.height / 3) {
    $("#table-container").css(
      "padding-top",
      innerDescription.offsetHeight - 25,
    );
    $("#vis-container").css("padding-top", innerDescription.offsetHeight + 50);
  }
}

function renderMarkdownTableDescriptions() {
  const converter = new showdown.Converter({
    extensions: [
      showdownKatex({
        throwOnError: true,
        displayMode: false,
        errorColor: "#1500ff",
      }),
    ],
  });
  converter.setFlavor("github");

  document.querySelectorAll("table tbody td:nth-child(2)").forEach((td) => {
    td.innerHTML = converter.makeHtml(td.dataset.markdown);
  });
}

function renderHeatmapLegends(heatmaps) {
  const legends = {};

  for (const h of heatmaps) {
    const { legend } = h.heatmap;
    if (
      !legend ||
      legends[legend.title] ||
      !(legend.domain || h.heatmap.domain)?.length
    )
      continue;

    const legendTitle = legend.title;
    const domain = legend.domain || h.heatmap.domain;

    const scale = datavzrdScale(h);
    const scaleType = h.heatmap.scale;

    if (scaleType === "ordinal") {
      const legendItems = domain.map((val) => {
        const color = scale(val);
        return `<span style="display:inline-flex;align-items:center;margin-right:10px;">
                    <span style="width:10px;height:10px;border-radius:50%;background-color:${color};display:inline-block;margin-right:5px;"></span>
                    ${val}
                </span>`;
      });
      legends[legendTitle] =
        `<div><strong>${legendTitle}</strong>: ${legendItems.join(" ")}</div>`;
    } else {
      const gradientHTML = generateSVGGradientLegend(
        scale,
        domain,
        `grad-${legendTitle.replace(/\s+/g, "-")}`,
      );
      legends[legendTitle] = `
                <div style="display:flex;align-items:center;gap:10px;margin:5px 0;">
                    <div style="font-weight:bold;">${legendTitle}:</div>
                    ${gradientHTML}
                </div>`;
    }
  }

  return Object.values(legends).join("<br>");
}

function generateSVGGradientLegend(scale, domain, legendId) {
  const stops = domain
    .map((val, i) => {
      const offset = (i / (domain.length - 1)) * 100;
      const color = scale(val);
      return `<stop offset="${offset}%" stop-color="${color}" />`;
    })
    .join("\n");

  const min = domain[0];
  const max = domain[domain.length - 1];

  return `
        <div style="display:flex;flex-direction:column;">
            <svg width="100%" height="10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="${legendId}" x1="0%" y1="0%" x2="100%" y2="0%">
                        ${stops}
                    </linearGradient>
                </defs>
                <rect x="0" y="0" width="100%" height="10" fill="url(#${legendId})" stroke="#ccc" rx="2" ry="2" />
            </svg>
            <div style="display:flex;justify-content:space-between;font-size:smaller;margin-top:2px;">
                <span>${min}</span>
                <span>${max}</span>
            </div>
        </div>`;
}

export function downloadCSV() {
  var data = $("#table").bootstrapTable("getData");
  data = JSON.parse(JSON.stringify(data));
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error("No data found or data format is invalid.");
    return;
  }

  var csvContent = "data:text/csv;charset=utf-8,";
  var headers = config["columns"];
  csvContent += headers.join(",") + "\n";

  data.forEach(function (item) {
    var row = [];
    headers.forEach(function (header) {
      var value = item[header];
      if (typeof value === "string" && value.includes(",")) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      row.push(value);
    });
    csvContent += row.join(",") + "\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${$("#view-selection").attr("title")}.csv`);
  document.body.appendChild(link);
  link.click();
}

function precision_formatter(precision, value) {
  if (value == "") {
    return "";
  }
  value = parseFloat(value);
  if (1 / 10 ** precision < Math.abs(value) || value == 0) {
    return value.toFixed(precision).toString();
  } else {
    return value.toExponential(precision);
  }
}

function createShareURL(index, webhost_url) {
  var data = $("#table").bootstrapTable("getData")[index];
  delete data["linkouts"];
  delete data["share"];
  delete data["line_number"];
  var c = JSON.parse(JSON.stringify(config));
  c["format"] = {}; // Remove any custom function
  delete c["unique_column_values"];
  c["data"] = data;
  const packer = new jsonm.Packer();
  let packedMessage = packer.pack(c);
  let compressed = LZString.compressToEncodedURIComponent(
    JSON.stringify(packedMessage),
  );
  let url = `${webhost_url}?config=${compressed}&version=${$("#datavzrd-version").text()}`;
  return url;
}

function shareRow(index, webhost_url) {
  $("#qr-modal").modal("show");
  document.getElementById("qr-code").innerHTML = "";
  let url = createShareURL(index, webhost_url);
  $("#open-url").attr("href", url);
  QRCode.toCanvas(document.getElementById("qr-code"), url, {
    width: window.innerHeight / 1.8,
  });
}

function renderTickPlot(
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

function renderBarPlot(
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

function renderDetailTickBarPlot(value, div, specs, title) {
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

function colorizeColumn(
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
    if (value !== "") {
      this.style.setProperty("background-color", scale(value), "important");
    }
    if (custom_func) {
      var data_function = window[custom_func];
      value = data_function(value, table_rows[row]);
      this.innerHTML = value;
    }
    row++;
  });
}

function renderPill(
  value,
  color,
  ellipsis,
  merge = false,
  position = "middle",
) {
  let styles = `padding: 4px 8px; background-color: ${color};`;
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

function renderPills(
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

function renderDetailPills(value, div, pills) {
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
    $(`${div}`)[0].innerHTML = content;
  }
  $('[data-toggle="tooltip"]').tooltip({
    sanitizeFn: function (content) {
      return content;
    },
  });
}

function datavzrdScale(heatmap) {
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

function shortenColumn(
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

function shortenHeaderRow(row, ellipsis, skip_label) {
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

function linkUrlColumn(
  ah,
  dp_columns,
  columns,
  title,
  link_urls,
  custom_content,
  detail_mode,
  header_label_length,
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
    if (link_urls.length == 1) {
      let link = link_urls[0].link.url.replaceAll("{value}", value);
      for (const column of columns) {
        link = link.replaceAll(`{${column}}`, table_rows[row][column]);
      }
      if (link_urls[0].link["new-window"]) {
        this.innerHTML = `<a href="${link}" target="_blank" rel="noopener noreferrer" >${shown_value}</a>`;
      } else {
        this.innerHTML = `<a href="${link}">${shown_value}</a>`;
      }
    } else {
      let links = "";
      for (let l of link_urls) {
        let link = l.link.url.replaceAll("{value}", value);
        for (const column of columns) {
          link = link.replaceAll(`{${column}}`, table_rows[row][column]);
        }
        if (l.link["new-window"]) {
          links = `${links}<a class="dropdown-item" href="${link}" target='_blank' rel="noopener noreferrer" >${l.name}</a>`;
        } else {
          links = `${links}<a class="dropdown-item" href="${link}" >${l.name}</a>`;
        }
      }
      this.innerHTML = `
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
    row++;
  });
}

function colorizeDetailCard(value, div, heatmap, row, is_float, precision) {
  let scale = datavzrdScale(heatmap);

  if (value !== "") {
    $(`${div}`).css("background-color", scale(value));
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

function colorizeHeaderRow(row, heatmap, header_label_length) {
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

function renderCustomPlot(
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
  $(`table > tbody > tr td:nth-child(${index})`).each(function () {
    var id = `${plot.title}-${row}`;
    this.classList.add("plotcell");
    const div = document.createElement("div");
    let value = table_rows[row][plot.title];
    let value_row = table_rows[row];
    var data = data_function(value, value_row);
    var s = specs;
    s.data = {};
    s.data.values = data;
    var opt = { actions: plot.vega_controls, renderer: "svg" };
    this.innerHTML = "";
    this.appendChild(div);
    vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
    row++;
  });
}

function renderCustomPlotDetailView(
  value,
  row,
  div,
  data_function,
  specs,
  vega_controls,
) {
  var data = data_function(value, row);
  var s = specs;
  s.data = {};
  s.data.values = data;
  var opt = { actions: vega_controls, renderer: "svg" };
  vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
}

export function embedSearch(index) {
  var source = `search/column_${index}.html`;
  document.getElementById("search-iframe").setAttribute("src", source);
}

export function embedHistogram(show_plot, index, plot) {
  $("#histogram-modal-title").text(config.columns[index]);
  if (show_plot) {
    vegaEmbed("#histogram-plot", plot);
  } else {
    document.getElementById("histogram-plot").innerHTML =
      "<p>No reasonable plot possible.</p>";
  }
}
function addNumClass(dp_num, ah, detail_mode, config) {
  for (let i in dp_num) {
    if (dp_num[i]) {
      let row = 0;
      let n = parseInt(i) + 2;
      if (detail_mode) {
        n += 1;
      }
      $(`table > tbody > tr td:nth-child(${n})`).each(function () {
        this.classList.add("num-cell");
        row++;
      });
    }
  }
}

function detailFormatter(index, row) {
  let cp = config.custom_plot_titles;
  let ticks = config.tick_titles;
  let bars = config.bar_titles;
  let displayed_columns = config.displayed_columns;
  let hidden_columns = config.hidden_columns;
  var html = [];
  $.each(row, function (key, value) {
    if (
      !hidden_columns.includes(key) &&
      !displayed_columns.includes(key) &&
      key !== "linkouts" &&
      key !== "share" &&
      key !== "line_number"
    ) {
      let id;
      let card_title = key;
      if (config.column_config[key].label) {
        card_title = config.column_config[key].label;
      }
      if (cp.includes(key) || ticks.includes(key) || bars.includes(key)) {
        if (cp.includes(key)) {
          id = `detail-plot-${index}-cp-${config.columns.indexOf(key)}`;
        } else if (bars.includes(key)) {
          id = `detail-plot-${index}-bars-${config.columns.indexOf(key)}`;
        } else {
          id = `detail-plot-${index}-ticks-${config.columns.indexOf(key)}`;
        }
        var card = `<div class="card">
                   <div class="card-header">
                     ${card_title}
                   </div>
                   <div class="card-body">
                     <div id="${id}"></div>
                   </div>
                 </div>`;
        html.push(card);
      } else if (config.heatmap_titles.includes(key)) {
        id = `heatmap-${index}-${config.columns.indexOf(key)}`;
        var card = `<div class="card">
                  <div class="card-header">
                    ${card_title}
                  </div>
                  <div id="${id}" class="card-body">
                    ${value}
                  </div>
                </div>`;
        html.push(card);
      } else if (config.pill_titles.includes(key)) {
        id = `pills-${index}-${config.columns.indexOf(key)}`;
        var card = `<div class="card">
                  <div class="card-header">
                    ${card_title}
                  </div>
                  <div id="${id}" class="card-body">
                    ${value}
                  </div>
                </div>`;
        html.push(card);
      } else if (config.format[key] !== undefined) {
        var data_function = window[config.format[key]];
        value = data_function(value, row);
        var card = `<div class="card">
                   <div class="card-header">
                     ${card_title}
                   </div>
                   <div class="card-body">
                    ${value}
                   </div>
                 </div>`;
        html.push(card);
      } else {
        var card = `<div class="card">
                   <div class="card-header">
                     ${card_title}
                   </div>
                   <div class="card-body">
                    ${value}
                   </div>
                 </div>`;
        html.push(card);
      }
    }
  });
  return `<div class="d-flex flex-wrap">${html.join("")}</div>`;
}

// Renders plots, heatmaps etc. when the table is loaded or on page change
function render(
  additional_headers,
  displayed_columns,
  table_rows,
  columns,
  config,
  render_headers,
  custom_plots,
  columnIndexMap,
  columnIdMap,
) {
  for (const o of custom_plots) {
    if (displayed_columns.includes(o.title)) {
      renderCustomPlot(
        additional_headers.length,
        displayed_columns,
        o,
        config.detail_mode,
        config.header_label_length,
        columnIndexMap,
      );
    }
  }

  for (const o of config.ticks) {
    if (displayed_columns.includes(o.title)) {
      renderTickPlot(
        additional_headers.length,
        displayed_columns,
        o.title,
        o.slug_title,
        o.specs,
        config.column_config[o.title].is_float,
        config.column_config[o.title].precision,
        config.detail_mode,
        config.header_label_length,
        columnIndexMap,
      );
    }
  }

  for (const o of config.bars) {
    if (displayed_columns.includes(o.title)) {
      renderBarPlot(
        additional_headers.length,
        displayed_columns,
        o.title,
        o.slug_title,
        o.specs,
        config.column_config[o.title].is_float,
        config.column_config[o.title].precision,
        config.detail_mode,
        config.header_label_length,
        columnIndexMap,
      );
    }
  }

  for (const o of config.link_urls) {
    if (displayed_columns.includes(o.title)) {
      linkUrlColumn(
        additional_headers.length,
        displayed_columns,
        columns,
        o.title,
        o.links,
        o["custom-content"],
        config.detail_mode,
        config.header_label_length,
        columnIndexMap,
      );
    }
  }

  for (const o of config.heatmaps) {
    if (displayed_columns.includes(o.title)) {
      colorizeColumn(
        additional_headers.length,
        displayed_columns,
        o,
        config.detail_mode,
        config.header_label_length,
        columnIndexMap,
      );
    }
  }

  for (const o of config.pills) {
    if (displayed_columns.includes(o.title)) {
      renderPills(
        additional_headers.length,
        displayed_columns,
        o,
        config.detail_mode,
        config.header_label_length,
        columnIndexMap,
      );
    }
  }

  for (const o of config.ellipsis) {
    if (displayed_columns.includes(o.title)) {
      shortenColumn(
        additional_headers.length,
        displayed_columns,
        o.title,
        o.ellipsis,
        config.detail_mode,
        config.header_label_length,
        columnIndexMap,
      );
    }
  }

  if (render_headers) {
    for (const o of header_config.heatmaps) {
      colorizeHeaderRow(o.row, o.heatmap, config.header_label_length);
    }

    for (const o of header_config.ellipsis) {
      shortenHeaderRow(o.index, o.ellipsis, config.header_label_length > 0);
    }
  }

  $('[data-toggle="popover"]').popover({
    sanitizeFn: function (content) {
      return content;
    },
  });
  $('[data-toggle="tooltip"]').tooltip({
    sanitizeFn: function (content) {
      return content;
    },
  });

  for (var i in displayed_columns) {
    $(`#filter-${i}-container`).popover("update");
  }

  if (!LINE_NUMBERS) {
    line_numbers("none");
  }

  if (config["to_be_hidden"]) {
    for (const hc of config["to_be_hidden"]) {
      hide(columnIdMap[hc], true, columnIndexMap);
    }
  }
}

export function load() {
  $(document).ready(function () {
    document.title = "datavzrd report";
    const columnIndexMap = buildColumnIndexMap();
    window.columnIndexMap = columnIndexMap;
    render_html_contents();
    $(".table-container").show();
    $(".loading").hide();
    $("#pagination").show();
    $("select").selectpicker();
    $(function () {
      $('[data-toggle="tooltip"]').tooltip({
        sanitizeFn: function (content) {
          return content;
        },
      });
    });
    $(function () {
      $('[data-toggle="popover"]').popover({
        sanitizeFn: function (content) {
          return content;
        },
      });
    });
    $(".modal").on("shown.bs.modal", function () {
      window.dispatchEvent(new Event("resize"));
    });
    if ($("#collapseDescription").length > 0) {
      renderMarkdownDescription(false);
    }

    let decompressed = decompress(data);

    for (row of decompressed) {
      var row_with_keys = Object.fromEntries(
        config.columns.map((k, i) => [k, row[i]]),
      );
      for (const column of config.columns) {
        if (config.additional_colums[column]) {
          let value_function = window[config.additional_colums[column]];
          let new_value = value_function(row_with_keys);
          row.push(new_value);
        }
      }
    }

    let bs_table_cols = [];

    if (!config.detail_mode && config.header_label_length > 0) {
      bs_table_cols.push({
        field: "",
        title: "",
        formatter: function (value) {
          return value;
        },
      });
    }

    bs_table_cols.push({
      field: "line_number",
      title: "",
      formatter: function (value) {
        return value;
      },
    });

    const columnIdMap = config.columns.reduce((acc, col, i) => {
      acc[col] = i;
      return acc;
    }, {});

    for (const column of config.columns) {
      if (config.displayed_columns.includes(column)) {
        let field = column;
        let title = "";
        if (config.column_config[column].label) {
          title = config.column_config[column].label;
        } else {
          title = column.replace(/_/g, " ");
        }

        // Add histogram button
        let histogram_icon = `<span class="sym ic" style="margin-left: 2px;" data-toggle="modal" data-target="#histogram_modal" onclick="datavzrd.embedHistogram(show_plot_${columnIdMap[column]}, ${columnIdMap[column]}, plot_${columnIdMap[column]})"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-bar-chart-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="5" x="1" y="10" rx="1"/><rect width="4" height="9" x="6" y="6" rx="1"/><rect width="4" height="14" x="11" y="1" rx="1"/></svg></span>`;
        if (!config.additional_colums[column]) {
          title += histogram_icon;
        }

        // Add static search if not single page mode
        if (
          !config.is_single_page &&
          !config.additional_colums[column] &&
          !config.column_config[column].is_float
        ) {
          title += `<span class="sym ic" style="margin-left: 2px;" data-toggle="modal" onclick="datavzrd.embedSearch(${columnIdMap[column]})" data-target="#search"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/></svg></span>`;
        }

        if (config.is_single_page) {
          title += `
                    <div class="sym sym-container" style="position: relative;">
                        <svg onclick="datavzrd.sort(${columnIdMap[column]}, 'asc', this)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                          <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                        </svg>
                        <svg onclick="datavzrd.sort(${columnIdMap[column]}, 'desc', this)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-caret-down" viewBox="0 0 16 16">
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                        </svg>
                    </div>
                    <div class="sym hide-sym" onclick="datavzrd.hide(${columnIdMap[column]}, false, window.columnIndexMap)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                            <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                            <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                        </svg>
                    </div>
                    `;
        }

        let formatter = undefined;
        if (config.format[column] != undefined) {
          formatter = config.format[column];
        } else {
          if (
            config.column_config[column].precision !== undefined &&
            config.column_config[column].is_float
          ) {
            formatter = function (value) {
              return precision_formatter(
                config.column_config[column].precision,
                value,
              );
            };
          } else {
            formatter = function (value) {
              return value;
            };
          }
        }

        let column_config = {
          field: field,
          title: title,
          formatter: formatter,
        };

        if (config.is_single_page) {
          column_config["filterControl"] = "input";
        }

        bs_table_cols.push(column_config);
      }
    }

    if (linkouts != null) {
      bs_table_cols.push({
        field: "linkouts",
        title: "",
        formatter: function (value) {
          return value;
        },
      });
      var decompressed_linkouts = decompress(linkouts);
    }

    if (config.webview_controls) {
      bs_table_cols.push({
        field: "share",
        title: "",
        formatter: function (value) {
          return value;
        },
      });
    }

    var bs_table_config = {
      columns: bs_table_cols,
      data: [],
    };

    if (config.is_single_page) {
      bs_table_config.pagination = true;
      bs_table_config.pageSize = config.page_size;
      bs_table_config.sortable = true;
    }

    if (config.detail_mode) {
      bs_table_config.detailView = true;
      bs_table_config.detailFormatter = detailFormatter;
    }

    $("#table").bootstrapTable(bs_table_config);

    let additional_headers = "";

    for (const ah of header_config.headers) {
      additional_headers += "<tr>";
      if (config.detail_mode || ah.label) {
        additional_headers += "<td";
        if (!config.detail_mode) {
          additional_headers += " style='border: none !important;'";
        }
        additional_headers += ">";
        if (ah.label) {
          additional_headers += `<b>${ah.label}</b>`;
        }
        additional_headers += "</td>";
      }
      additional_headers += "<td></td>";
      for (const title of config.columns) {
        if (config.displayed_columns.includes(title)) {
          if (ah.header[title] === undefined) {
            additional_headers += "<td></td>";
          } else {
            additional_headers += `<td>${ah.header[title]}</td>`;
          }
        }
      }
      additional_headers += "</tr>";
    }

    var header_height =
      (80 +
        6 *
          Math.max(
            ...config.displayed_columns.map((el) => {
              var columnConfig = config.column_config[el];
              return columnConfig && columnConfig.label
                ? columnConfig.label.length
                : el.length;
            }),
          ) *
          Math.SQRT2) /
        2 +
      80;

    $("th").css("height", header_height);

    var table_rows = [];
    var j = 0;
    for (const r of decompressed) {
      var i = 0;
      var row = {};
      if (!config.is_single_page) {
        row["line_number"] = j + 1 + config.page_size * (CURRENT_PAGE - 1);
      } else {
        row["line_number"] = j + 1;
      }
      for (const element of r) {
        row[config.columns[i]] = element;
        i++;
      }
      if (linkouts != null) {
        row["linkouts"] = decompressed_linkouts[j];
      }
      if (config.webview_controls) {
        row["share"] =
          `<span data-toggle="tooltip" data-placement="left" title="Share link via QR code. Note that when using the link the row data can temporarily occur (in base64-encoded form) in the server logs of ${config.webview_host}.">
            <button class="btn btn-outline-secondary btn-table share-btn" data-row="${j}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-qr-code" viewBox="0 0 16 16">
                <path d="M2 2h2v2H2V2Z"/>
                <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"/>
                <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"/>
                <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"/>
                <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"/>
            </svg></button>
            </span>
            <span data-toggle="tooltip" data-placement="left" title="Copy portable share link to clipboard. Note that when using the link the row data can temporarily occur (in base64-encoded form) in the server logs of ${config.webview_host}.">
                <button type="button" data-row="${j}" class="btn btn-outline-secondary btn-table copy-url">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard2" viewBox="0 0 16 16">
                        <path d="M3.5 2a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-12a.5.5 0 0 0-.5-.5H12a.5.5 0 0 1 0-1h.5A1.5 1.5 0 0 1 14 2.5v12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-12A1.5 1.5 0 0 1 3.5 1H4a.5.5 0 0 1 0 1h-.5Z"/>
                        <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5Z"/>
                    </svg>
                </button>
            </span>`;
      }
      j++;
      table_rows.push(row);
    }

    $(document).on("click", ".share-btn", function () {
      shareRow($(this).data("row"), config.webview_host);
    });

    $(document).on("click", ".copy-url", function () {
      navigator.clipboard.writeText(
        createShareURL($(this).data("row"), config.webview_host),
      );
    });

    $("#table").find("thead").append(additional_headers);
    $("#table").bootstrapTable("append", table_rows);

    $("#table").on("expand-row.bs.table", (event, index, row, detailView) => {
      for (const o of custom_plots) {
        if (!config.displayed_columns.includes(o.title)) {
          renderCustomPlotDetailView(
            row[o.title],
            row,
            `#detail-plot-${index}-cp-${columnIdMap[o.title]}`,
            window[o.data_function],
            o.specs,
            o.vega_controls,
          );
        }
      }

      for (const o of config.heatmaps) {
        if (!config.displayed_columns.includes(o.title)) {
          colorizeDetailCard(
            row[o.title],
            `#heatmap-${index}-${columnIdMap[o.title]}`,
            o,
            row,
            config.column_config[o.title].is_float,
            config.column_config[o.title].precision,
          );
        }
      }

      for (const o of config.pills) {
        if (!config.displayed_columns.includes(o.title)) {
          renderDetailPills(
            row[o.title],
            `#pills-${index}-${columnIdMap[o.title]}`,
            o,
          );
        }
      }

      for (const o of config.ticks) {
        if (!config.displayed_columns.includes(o.title)) {
          renderDetailTickBarPlot(
            row[o.title],
            `#detail-plot-${index}-ticks-${columnIdMap[o.title]}`,
            o.specs,
            o.title,
          );
        }
      }

      for (const o of config.bars) {
        if (!config.displayed_columns.includes(o.title)) {
          renderDetailTickBarPlot(
            row[o.title],
            `#detail-plot-${index}-bars-${columnIdMap[o.title]}`,
            o.specs,
            o.title,
          );
        }
      }
    });

    $("#markdown-btn").click(function () {
      renderMarkdownDescription(false);
    });

    $(".btn-sm").click(function () {
      var col = $(this).data("col");
      var field = $(this).data("val").toString();
      if (field.startsWith("<div")) {
        var temp = $(field);
        field = temp[0].dataset.value;
      }
      var marker = { bin_start: field };
      var index = config.columns.indexOf(col);
      var plot_id = `plot_${index}`;
      var modal_id = `#modal_${index}`;
      if (window[plot_id]["layer"].length > 1) {
        $(modal_id).modal();
        var marked_plot = JSON.parse(JSON.stringify(window[plot_id]));
        marked_plot["layer"][1]["data"]["values"].push(marker);
        vegaEmbed(`#${plot_id}`, marked_plot);
      }
    });
    addNumClass(
      config.displayed_numeric_columns,
      additional_headers.length,
      config.detail_mode,
      config,
    );

    render(
      additional_headers,
      config.displayed_columns,
      table_rows,
      config.columns,
      config,
      true,
      custom_plots,
      columnIndexMap,
      columnIdMap,
    );
    config["to_be_hidden"] = new Set();

    if (!config.detail_mode && !config.header_label_length == 0) {
      $("table > thead > tr:first-child th:first-child").css(
        "visibility",
        "hidden",
      );
      $(`table > tbody > tr td:first-child`).each(function () {
        this.style.setProperty("visibility", "hidden");
        this.style.setProperty("border", "none");
      });
    }

    if (config.is_single_page) {
      $("#sidebar-list").append(
        $(
          '<li class="list-group-item sidebar-btn" id="clear-filter">Clear filters</li>',
        ),
      );
      let filter_boundaries = {};
      let filters = {};
      let checkbox_filters = {};
      for (const title of config.displayed_columns) {
        checkbox_filters[title] = [];
      }
      let tick_brush_specs = {
        width: 50,
        height: 12,
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: [] },
        mark: "tick",
        encoding: {
          tooltip: { field: "value", type: "quantitative" },
          x: {
            field: "value",
            type: "quantitative",
            scale: { type: "linear", zero: false },
            axis: {
              title: null,
              orient: "top",
              labelFontWeight: "lighter",
              labelExpr: "datum.value",
            },
          },
          color: {
            condition: { param: "selection", value: "#0275d8" },
            value: "grey",
          },
        },
        params: [{ name: "selection", select: "interval" }],
        config: {
          axis: { grid: false },
          background: null,
          style: { cell: { stroke: "transparent" } },
          tick: { thickness: 0.5, bandSize: 10 },
        },
      };

      let brush_domains = config.brush_domains;
      let aux_domains = config.aux_domains;

      function render_brush_plots(reset) {
        let tick_brush = 0;
        for (const title of config.displayed_columns) {
          let index = tick_brush + 2;
          if (config.detail_mode || config.header_label_length > 0) {
            index += 1;
          }
          if (config.displayed_numeric_columns.includes(title)) {
            let plot_data = [];
            let values = [];
            for (const row of table_rows) {
              if (row[title] != "" && row[title] != "NA") {
                plot_data.push({ value: parseFloat(row[title]) });
                values.push(parseFloat(row[title]));
              }
            }
            let min = Math.min(...values);
            let max = Math.max(...values);
            if (
              brush_domains[title] != undefined &&
              config.tick_titles.includes(title)
            ) {
              min = Math.min(...brush_domains[title]);
              max = Math.max(...brush_domains[title]);
            } else if (aux_domains[title] != undefined) {
              let aux_values = [min, max];
              for (const col of aux_domains[title]) {
                for (const row of table_rows) {
                  aux_values.push(parseFloat(row[col]));
                }
              }
              min = Math.min(...aux_values);
              max = Math.max(...aux_values);
            }
            if (Number.isInteger(min)) {
              min = parseInt(min.toString());
            }
            if (Number.isInteger(max)) {
              max = parseInt(max.toString());
            }
            let legend_tick_length =
              min.toString().length + max.toString().length;
            var s = tick_brush_specs;
            let has_labels = legend_tick_length < 8;
            s.encoding.x.axis.labels = has_labels;
            s.data.values = plot_data;
            s.name = title;
            s.encoding.x.axis.values = [min, max];
            s.encoding.x.scale.domain = [min, max];
            let brush_class = "";
            if (!has_labels) {
              brush_class = "no-labels";
            }
            if (!reset && !config.additional_colums[title]) {
              let search_icon =
                '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/></svg>';
              $(
                `table > thead > tr th:nth-child(${index})  > div.th-inner`,
              ).append(
                `<div class="sym ic" data-s='${JSON.stringify(s)}' data-brush="${tick_brush}" id="filter-${index}-container" data-toggle="popover" data-placement="top" data-trigger="click focus" data-html="true" data-content="<div class='filter-brush-container'><div class='filter-brush ${brush_class}' id='brush-${tick_brush}'></div></div>"> ${search_icon}</div>`,
              );
            }
            var opt = { actions: false };
            $(`#filter-${index}-container`).on("click", function (e) {
              var b_specs = JSON.parse(e.currentTarget.dataset.s);
              if (filter_boundaries[b_specs.name] != undefined) {
                b_specs.params[0].value = {
                  x: filter_boundaries[b_specs.name].value,
                };
              }
              vegaEmbed(
                `#brush-${e.currentTarget.dataset.brush}`,
                b_specs,
                opt,
              ).then(({ spec, view }) => {
                view.addSignalListener("selection", function (name, value) {
                  filter_boundaries[spec.name] = value;
                });
                document
                  .getElementById(`brush-${e.currentTarget.dataset.brush}`)
                  .addEventListener("click", function (event) {
                    $("#table").bootstrapTable(
                      "filterBy",
                      { "": "" },
                      {
                        filterAlgorithm: customFilter,
                      },
                    );
                  });
                // Add another event listener so the filter is still triggered when the brush is dragged outside the plot.
                view.addEventListener("mouseleave", function (event) {
                  // Only apply filter when mouseleave events happens while mouse is pressed
                  if (event.buttons > 0) {
                    $("#table").bootstrapTable(
                      "filterBy",
                      { "": "" },
                      {
                        filterAlgorithm: customFilter,
                      },
                    );
                  }
                });
              });
            });
          } else if (config.unique_column_values[title] <= 10) {
            if (!reset) {
              let search_icon =
                '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/></svg>';
              let data_content = ``;
              let column_values = [];
              for (let v of table_rows) {
                column_values.push(v[title]);
              }
              let values = [...new Set(column_values)];
              for (let opt of values) {
                let checkbox = `<div class='form-check'>
                                                    <input type='checkbox' class='form-check-input' id='${opt}' checked>
                                                    <label class='form-check-label' for='${opt}'>${opt}</label>
                                                </div>`;
                data_content = data_content.concat(checkbox);
              }
              $(
                `table > thead > tr th:nth-child(${index}) > div.th-inner`,
              ).append(
                `<div class="sym ic" id="filter-${index}-container" data-column-title='${title.replace(/'/g, "&#39;")}' data-toggle="popover" data-placement="top" data-trigger="click focus" data-html="true" data-content="${data_content}"> ${search_icon}</div>`,
              );
              $(`#filter-${index}-container`).on(
                "shown.bs.popover",
                function (e) {
                  $("input:checkbox").change(function (event) {
                    if (!event.currentTarget.checked) {
                      checkbox_filters[title].push(event.currentTarget.id);
                    } else {
                      checkbox_filters[title] = checkbox_filters[title].filter(
                        function (v) {
                          return v !== event.currentTarget.id;
                        },
                      );
                    }
                    $("#table").bootstrapTable(
                      "filterBy",
                      { "": "" },
                      {
                        filterAlgorithm: customFilter,
                      },
                    );
                  });
                },
              );
              $(`#filter-${index}-container`).on(
                "inserted.bs.popover",
                function (e) {
                  for (let val of checkbox_filters[
                    e.currentTarget.dataset.columnTitle
                  ]) {
                    if (
                      checkbox_filters[
                        e.currentTarget.dataset.columnTitle
                      ].includes(val)
                    ) {
                      $(`[id='${val}']`).prop("checked", false);
                    }
                  }
                },
              );
            }
          } else {
            if (!reset) {
              let search_icon =
                '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/></svg>';
              $(
                `table > thead > tr th:nth-child(${index}) > div.th-inner`,
              ).append(
                `<div class="sym ic" id="filter-${index}-container" data-column-title='${title.replace(/'/g, "&#39;")}' data-toggle="popover" data-placement="top" data-trigger="click focus" data-html="true" data-content="<input class='form-control form-control-sm' id='filter-${index}' data-title='${title.replace(/'/g, "&#39;")}' placeholder='Filter...'>"> ${search_icon}</div>`,
              );
              $(`#filter-${index}-container`).on(
                "shown.bs.popover",
                function (e) {
                  $(`#filter-${index}`).on("input", function (event) {
                    filters[event.target.dataset.title] = $(
                      `#filter-${index}`,
                    ).val();
                    $("#table").bootstrapTable(
                      "filterBy",
                      { "": "" },
                      {
                        filterAlgorithm: customFilter,
                      },
                    );
                  });
                },
              );
              $(`#filter-${index}-container`).on(
                "inserted.bs.popover",
                function (e) {
                  if (
                    filters[e.currentTarget.dataset.columnTitle] != undefined
                  ) {
                    $(`#filter-${index}`).val(
                      filters[e.currentTarget.dataset.columnTitle],
                    );
                  }
                },
              );
            }
          }
          tick_brush++;
        }
      }

      render_brush_plots(false);

      $("#clear-filter").click(function clearFilter() {
        filter_boundaries = {};
        filters = {};
        checkbox_filters = {};
        for (const title of config.displayed_columns) {
          checkbox_filters[title] = [];
        }
        $("#table").bootstrapTable(
          "filterBy",
          { "": "" },
          {
            filterAlgorithm: customFilter,
          },
        );
        $(".form-control").each(function () {
          $(this).val("");
        });
        render_brush_plots(true);
      });

      function customFilter(row, filter) {
        for (const title of config.displayed_columns) {
          if (
            filter_boundaries[title] !== undefined &&
            !$.isEmptyObject(filter_boundaries[title])
          ) {
            if (
              row[title] < filter_boundaries[title]["value"][0] ||
              row[title] > filter_boundaries[title]["value"][1]
            ) {
              return false;
            }
          }
          if (filters[title] !== undefined && filters[title] !== "") {
            if (
              !row[title].toLowerCase().includes(filters[title].toLowerCase())
            ) {
              return false;
            }
          }
          if (checkbox_filters[title] !== undefined && filters[title] !== []) {
            if (checkbox_filters[title].includes(row[title])) {
              return false;
            }
          }
        }
        return true;
      }
    }

    if (config.is_single_page) {
      $("#table").on("post-body.bs.table", (number, size) => {
        render(
          additional_headers,
          config.displayed_columns,
          table_rows,
          config.columns,
          config,
          false,
          custom_plots,
          columnIndexMap,
          columnIdMap,
        );
      });
      $("#unhide-btn").on("click", function () {
        config["to_be_hidden"] = new Set();
        $(`table > thead > tr:first-child th`).each(function () {
          this.style.setProperty("display", "");
        });
        $(`table > tbody > tr td`).each(function () {
          this.style.setProperty("display", "");
        });
        if (!LINE_NUMBERS) {
          line_numbers("none");
        }
      });
      $("#unsort-btn").on("click", function () {
        render(
          additional_headers,
          config.displayed_columns,
          table_rows,
          config.columns,
          config,
          false,
          custom_plots,
          columnIndexMap,
          columnIdMap,
        );
      });
      $("#downloadCSV-btn").on("click", function () {
        downloadCSV();
      });
      $("#toggleLineNumbers").on("click", function () {
        toggle_line_numbers();
      });
      $("#screenshotTable").on("click", function () {
        screenshot_table();
      });
      $("#btnExcel").on("click", function () {
        window.location.href = "../data.xlsx";
      });
    }

    var rect = $(".fixed-table-container")[0].getBoundingClientRect();
    if (rect.left < 0 || rect.right > $(window).width()) {
      add_scroll_button();
    }

    let urlParams = new URLSearchParams(window.location.search);
    let highlightIndex = urlParams.get("highlight");
    let highlightValue = urlParams.get("highlight_value");
    let highlightColumn = urlParams.get("highlight_column");

    let to_be_highlighted = parseInt(highlightIndex, 10);
    if (!isNaN(to_be_highlighted)) {
      highlightRow(to_be_highlighted);
    } else if (highlightValue !== null && highlightColumn !== null) {
      let index = $("#table")
        .bootstrapTable("getData")
        .findIndex((row) => row[highlightColumn] === highlightValue);
      if (index !== -1) {
        highlightRow(index);
      } else {
        showNotification(
          `Could not find row with value <strong>${highlightValue}</strong> in column <strong>${highlightColumn}</strong>.`,
        );
      }
    }

    for (const title of config.available_columns) {
      hide(columnIdMap[title], false, columnIndexMap);
    }

    $(window).resize(function () {
      var he = $(window).height() - 150;
      // $('#table').bootstrapTable('resetView',{height: he});
    });

    $("#colum-filter-icon").on("shown.bs.popover", function () {
      const $select = $("#filter-columns-select");

      // Populate the select with columns
      $select.empty();
      config.displayed_columns.forEach((col) => {
        if (!config.pinned_columns.includes(col)) {
          if (config.available_columns.includes(col)) {
            $select.append(`<option value="${col}">${col}</option>`);
          } else {
            $select.append(`<option value="${col}" selected>${col}</option>`);
          }
        }
      });

      $select.selectpicker("refresh"); // Required after dynamic population
      $("#colum-filter-icon").popover("update");
      $select.selectpicker("toggle");

      // Listen for selection changes
      $select.on("changed.bs.select", function () {
        const selectedCols = new Set($(this).val());
        const displayedCols = new Set(config.displayed_columns);
        const pinnedCols = new Set(config.pinned_columns);
        const hiddenCols = config.to_be_hidden;

        // Columns to hide: in displayed but not selected and not already hidden
        const toHide = [...displayedCols].filter(
          (col) =>
            !selectedCols.has(col) &&
            !hiddenCols.has(col) &&
            !pinnedCols.has(col),
        );

        // Columns to unhide: in hidden but now selected
        const toUnhide = [...hiddenCols].filter((col) => selectedCols.has(col));

        for (const col of toHide) {
          hide(columnIdMap[col], false, columnIndexMap);
        }

        for (const col of toUnhide) {
          unhide(columnIdMap[col], columnIndexMap);
        }

        $select.selectpicker("refresh");
      });
    });
  });
}

function highlightRow(row) {
  let page_size = $("#table").bootstrapTable("getOptions").pageSize;
  if (config.is_single_page) {
    $("#table").bootstrapTable("selectPage", Math.floor(row / page_size) + 1);
  }
  let rows = $("table > tbody > tr");
  rows.each(function () {
    if (this.dataset.index == row) {
      $(this).children().addClass("active-row");
      if (!config.detail_mode && !config.header_label_length == 0) {
        $(this).children().first().removeClass("active-row");
      }
      var value = row;
      if (config.is_single_page) {
        value = row % page_size;
      }
      $("#table").bootstrapTable("scrollTo", { unit: "rows", value: value });
    }
  });
}

function showNotification(message) {
  const toast = document.getElementById("warningToast");
  const toastBody = toast.querySelector(".toast-body");
  toastBody.innerHTML = message;
  $(toast).toast({ delay: 5000 });
  $(toast).toast("show");
}

export function landing_page() {
  $("body").append(render_landing_page());
  renderMarkdownTableDescriptions();
}

export function get_config_from_url_query() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const compressed_config = urlParams.get("config");
  const jsonm_config = JSON.parse(
    LZString.decompressFromEncodedURIComponent(compressed_config),
  );
  const unpacker = new jsonm.Unpacker();
  return unpacker.unpack(jsonm_config);
}

export function compress_data(data) {
  return LZString.compressToUTF16(JSON.stringify([data]));
}

export function load_plot(specs, data, multiple_datasets, resize) {
  $("#markdown-btn").click(function () {
    renderMarkdownDescription(true);
  });
  if ($("#collapseDescription").length > 0) {
    renderMarkdownDescription(true);
  }
  if (multiple_datasets) {
    specs.datasets = {};
    specs.datasets = decompress(data);
  } else {
    specs.data = {};
    specs.data.values = decompress(data);
  }
  if (specs.width == "container") {
    $("#vis").css("width", "100%");
  } else if (!resize && !specs.hconcat && !specs.vconcat) {
    render_plot_size_controls();
  }
  vegaEmbed("#vis", specs).then(({ spec, view }) => {
    if (resize && specs.width !== "container") {
      let width = view.width();
      let height = view.height();
      let aspect_ratio = height / width;
      specs.width = width + resize;
      specs.height = height + resize * aspect_ratio;
      view
        .width(width + resize)
        .height(height + resize * aspect_ratio)
        .run();
    }
  });
}

export function custom_error(e, column) {
  $("#error-modal").modal("show");
  $("#error-column").html(column);
  $("#error-modal-text").html(e.toString() + "\n" + e.stack.toString());
}

$(document).click(function (event) {
  var clickover = $(event.target);
  var $navbar = $("#sidebar");
  var _opened = $navbar.hasClass("show");
  if (_opened === true && !clickover.hasClass("sidebar-btn")) {
    $navbar.collapse("hide");
  }
});

export function load_search() {
  $(document).ready(function () {
    window.$ = window.jQuery = require("jquery");
    window[
      "bootstrap-table"
    ] = require("bootstrap-table/src/bootstrap-table.js");
    let decompressed = decompress(search_data);
    let table_data = [];
    for (var i = 0; i < decompressed.length; i++) {
      var row = decompressed[i];
      table_data.push({
        page: `<a target="_parent" href="../index_${row[1]}.html?highlight=${row[2]}" style="display: table-cell">${row[1]}</a>`,
        title: row[0],
      });
    }
    $("#search-table").bootstrapTable({
      columns: [
        { field: "page", title: "page" },
        { field: "title", title: table_title },
      ],
      data: table_data,
      search: true,
    });
    $("#search-table").bootstrapTable({
      onPostHeader: function () {
        $(".search-input").focus();
      },
    });
    $(".search-input").focus();
  });
}

function line_numbers(style) {
  const hasLabel = header_config.headers.some((header) => header.label);
  var table = document.getElementById("table");
  var rows = table.getElementsByTagName("tr");
  var cell_index = config.detail_mode || hasLabel ? 1 : 0;
  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName("td");
    if (cells.length > 0) {
      cells[cell_index].style.display = style;
    }
  }
  // also hide table head
  var ths = table.getElementsByTagName("th");
  ths[cell_index].style.display = style;
}

export function toggle_line_numbers() {
  if (LINE_NUMBERS) {
    line_numbers("none");
  } else {
    line_numbers("table-cell");
  }
  LINE_NUMBERS = !LINE_NUMBERS;
}

function downloadSVG(dataUrl, fileName) {
  const blob = new Blob([decodeURIComponent(dataUrl.split(",")[1])], {
    type: "image/svg+xml",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function filter(node) {
  return !(node.classList && node.classList.contains("sym"));
}

export function screenshot_table() {
  let header_height = parseFloat($(this).css("height"));
  $("th").each(function () {
    $(this).css("height", `${header_height - 80}`);
  });
  document.querySelectorAll("table tr").forEach((row) => {
    const cells = row.querySelectorAll("td");
    let s = linkouts !== null ? -2 : -1;
    if (!config.webview_controls) {
      s += 1;
    }
    if (s < 0) {
      const lastTwo = Array.from(cells).slice(s);
      lastTwo.forEach((cell) => (cell.style.display = "none"));
    }
  });
  if (config.detail_mode) {
    document.querySelectorAll("table tr").forEach((row) => {
      const cells = row.querySelectorAll("td, th");
      const first = Array.from(cells).slice(0, 1);
      first.forEach((cell) => (cell.style.display = "none"));
    });
  }
  document
    .querySelectorAll(".linkout-group")
    .forEach((el) => (el.style.display = "none"));
  document
    .querySelectorAll(".linkout-raw-value")
    .forEach((el) => (el.style.display = "table-cell"));
  const table_element = document.getElementById("table");
  htmlToImage
    .toSvg(table_element, { filter: filter })
    .then((dataUrl) =>
      downloadSVG(dataUrl, `${$("#view-selection").attr("title")}.svg`),
    );
  if (config.detail_mode) {
    document.querySelectorAll("table tr").forEach((row) => {
      const cells = row.querySelectorAll("td, th");
      const first = Array.from(cells).slice(0, 1);
      first.forEach((cell) => (cell.style.display = "block"));
      document.querySelectorAll("table tr").forEach((row) => {
        const cells = row.querySelectorAll("td");
        let s = linkouts !== null ? -2 : -1;
        if (!config.webview_controls) {
          s += 1;
        }
        if (s < 0) {
          const lastTwo = Array.from(cells).slice(s);
          lastTwo.forEach((cell) => (cell.style.display = "table-cell"));
        }
      });
      document
        .querySelectorAll(".linkout-group")
        .forEach((el) => (el.style.display = "table-cell"));
      document
        .querySelectorAll(".linkout-raw-value")
        .forEach((el) => (el.style.display = "none"));
      $("th").each(function () {
        $(this).css("height", `${header_height}px`);
      });
    });
  }
}

function decompress(data) {
  var decompressed = JSON.parse(LZString.decompressFromUTF16(data));
  const unpacker = new jsonm.Unpacker();
  decompressed = unpacker.unpack(decompressed);
  return decompressed;
}

export function sort(c, order, svg) {
  let column = config.columns[c];
  const options = $("#table").bootstrapTable("getOptions");
  if (options.sortName === column && options.sortOrder === order) {
    $("#table").bootstrapTable("sortBy", { "": "" });
    document
      .querySelectorAll(".sym-container svg")
      .forEach((svg) => (svg.style.color = "currentColor"));
    svg.style.color = "#007bff";
    return;
  }
  document
    .querySelectorAll(".sym-container svg")
    .forEach((svg) => (svg.style.color = "currentColor"));
  svg.style.color = "#c21f30";
  $("#table").bootstrapTable("sortBy", { field: column, sortOrder: order });
}

function buildColumnIndexMap() {
  const map = {};
  const base_offset =
    2 + (config.detail_mode || config.header_label_length !== 0 ? 1 : 0);

  config.displayed_columns.forEach((col, i) => {
    map[col] = base_offset + i;
  });

  return map;
}

export function hide(c, render, columnIndexMap) {
  let column = config.columns[c];
  const column_index = columnIndexMap[column];
  $(`table > thead > tr:first-child th:nth-child(${column_index})`).css(
    "display",
    "none",
  );
  $(`table > tbody > tr td:nth-child(${column_index})`).each(function () {
    this.style.setProperty("display", "none");
  });
  if (!render) {
    config["to_be_hidden"].add(column);
  }
}

export function unhide(c, columnIndexMap) {
  let column = config.columns[c];
  const column_index = columnIndexMap[column];
  $(`table > thead > tr:first-child th:nth-child(${column_index})`).css(
    "display",
    "",
  );
  $(`table > tbody > tr td:nth-child(${column_index})`).each(function () {
    this.style.setProperty("display", "");
  });
  config["to_be_hidden"].delete(column);
}

function add_scroll_button() {
  var buttonHTML = `
    <div class="float-left">
        <button type="button" class="btn btn-primary pulsating-button" data-toggle="tooltip" data-placement="top" title="Datavzrd allows horizontal scrolling when the table exceeds the viewport">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mouse-fill" viewBox="0 0 16 16">
                <path d="M3 5a5 5 0 0 1 10 0v6a5 5 0 0 1-10 0zm5.5-1.5a.5.5 0 0 0-1 0v2a.5.5 0 0 0 1 0z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
            </svg>
        </button>
    </div>
  `;

  var targetElement = document.querySelector("#pagination");

  if (config.is_single_page) {
    targetElement = document.querySelector(".float-right.pagination");
  }

  if (targetElement) {
    targetElement.insertAdjacentHTML("beforebegin", buttonHTML);
    var button = targetElement.previousElementSibling;
    $(button).tooltip();
  } else {
    console.error('No element found with class "float-right pagination".');
  }
}

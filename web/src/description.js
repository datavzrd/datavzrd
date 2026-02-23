import showdown from "showdown";
import showdownKatex from "showdown-katex";
import $ from "jquery";
import { datavzrdScale } from "./plot/heatmap";
import vegaEmbed from "vega-embed";

export function renderMarkdownDescription(is_plot_view) {
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
    for (const cp of custom_plots) {
      if (cp.legend) {
        const wrapper = document.createElement("div");
        wrapper.style.margin = "6px 0";
        const title = document.createElement("strong");
        title.textContent = cp.title.replace(/_/g, " ");
        wrapper.appendChild(title);
        const legendDiv = document.createElement("div");
        legendDiv.style.display = "inline-block";
        wrapper.appendChild(legendDiv);
        innerDescription.appendChild(wrapper);
        renderVegaLegend(legendDiv, cp.specs);
      }
    }
  }
  $("#table-container").css(
    "padding-top",
    innerDescription.offsetHeight,
  );
  $("#vis-container").css("padding-top", innerDescription.offsetHeight + 50);
}

export function renderMarkdownTableDescriptions() {
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

function renderVegaLegend(div, specs) {
  const legendSpec = JSON.parse(JSON.stringify(specs));
  legendSpec.width = 0;
  legendSpec.height = 0;
  legendSpec.mark = legendSpec.mark || "point";
  legendSpec.config = legendSpec.config || {};
  legendSpec.config.view = { stroke: null };
  if (!legendSpec.data) {
    legendSpec.data = { values: [] };
  }
  const embedOpts = {
    actions: false,
    renderer: "svg",
  };
  vegaEmbed(div, legendSpec, embedOpts);
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

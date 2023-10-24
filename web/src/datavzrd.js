import $ from 'jquery';
import LZString from 'lz-string';
import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import jsonm from 'jsonm';
import * as vega from "vega";
import vegaEmbed from 'vega-embed';
import vegalite from 'vega-lite';
import QRCode from 'qrcode';
import 'bootstrap';
import 'bootstrap-table';
import 'bootstrap-select';

function renderMarkdownDescription() {
    var innerDescription = document.getElementById('innerDescription');
    const converter = new showdown.Converter({
        extensions: [
            showdownKatex({
                throwOnError: true,
                displayMode: false,
                errorColor: '#1500ff',
            }),
        ],
    });
    converter.setFlavor('github');
    innerDescription.innerHTML = converter.makeHtml(innerDescription.dataset.markdown);
}

function precision_formatter(precision, value) {
    if (value == "") {
        return "";
    }
    value = parseFloat(value)
    if (1 / (10 ** precision) < Math.abs(value) || value == 0) {
        return value.toFixed(precision).toString()
    } else {
        return value.toExponential(precision)
    }
}

function createShareURL(index, webhost_url) {
    var data = $('#table').bootstrapTable('getData')[index];
    delete data["linkouts"];
    delete data["share"];
    var c = JSON.parse(JSON.stringify(config));
    c["data"] = data;
    const packer = new jsonm.Packer();
    let packedMessage = packer.pack(c);
    let compressed = LZString.compressToEncodedURIComponent(JSON.stringify(packedMessage))
    let url = `${webhost_url}?config=${compressed}&version=${$("#datavzrd-version").text()}`;
    return url;
}

function shareRow(index, webhost_url) {
    $('#qr-modal').modal('show');
    document.getElementById("qr-code").innerHTML = "";
    let url = createShareURL(index, webhost_url);
    $('#open-url').attr("href", url);
    QRCode.toCanvas(document.getElementById('qr-code'), url)
}

function renderTickPlot(ah, columns, title, slug_title, specs, is_float, precision, detail_mode, header_label_length) {
    let index = columns.indexOf(title) + 1;
    if (detail_mode || header_label_length !== 0) {
        index += 1;
    }
    let row = 0;
    let table_rows = $('#table').bootstrapTable('getData', { useCurrentPage: true });
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function () {
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
                var opt = { "actions": false };
                vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
            }
            row++;
        }
    );
}

function renderBarPlot(ah, columns, title, slug_title, specs, is_float, precision, detail_mode, header_label_length) {
    let index = columns.indexOf(title) + 1;
    if (detail_mode || header_label_length !== 0) {
        index += 1;
    }
    let row = 0;
    let table_rows = $('#table').bootstrapTable('getData', { useCurrentPage: true });
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function () {
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
                var opt = { "actions": false };
                vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
            }
            row++;
        }
    );
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
        var opt = { "actions": false };
        vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
    }
}

function colorizeColumn(ah, columns, heatmap, detail_mode, header_label_length) {
    let index = columns.indexOf(heatmap.title) + 1;
    if (detail_mode || header_label_length !== 0) {
        index += 1;
    }
    let row = 0;
    var table_rows = $("#table").bootstrapTable('getData', {useCurrentPage: "true"});
    var custom_func = heatmap.heatmap.custom_content;

    let scale = null;

    if (heatmap.heatmap.scale == "ordinal") {
        if (heatmap.heatmap.color_scheme != "") {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(vega.scheme(heatmap.heatmap.color_scheme));
        } else if (!heatmap.heatmap.range.length == 0) {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(heatmap.heatmap.range);
        } else {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain);
        }
    } else {
        if (heatmap.heatmap.color_scheme != "") {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(vega.scheme(heatmap.heatmap.color_scheme));
        } else if (!heatmap.heatmap.range == 0) {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(heatmap.heatmap.range);
        } else {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp);
        }
    }

    $(`table > tbody > tr td:nth-child(${index})`).each(
        function() {
            var value = table_rows[row][heatmap.title];
            if (value !== "") {
                this.style.setProperty("background-color", scale(value), "important");
            }
            if (custom_func !== null) {
                var data_function = window[custom_func];
                value = data_function(value, table_rows[row]);
                this.innerHTML = value;
            }
            row++;
        }
    );
}

function shortenColumn(ah, columns, title, ellipsis, detail_mode, header_label_length) {
    let index = columns.indexOf(title) + 1;
    if (detail_mode || header_label_length !== 0) {
        index += 1;
    }
    let row = 0;
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function () {
            let value = this.innerHTML;
            if (ellipsis === 0) {
                this.innerHTML = `<div style="width: 100%; height: 100%;" data-toggle="tooltip" data-trigger="hover click focus" title='${value}'></div>`;
            } else if (value.length > ellipsis) {
                this.innerHTML = `<span data-toggle="tooltip" data-trigger="hover click focus" title='${value}'>${value.substring(0, ellipsis)}...</span>`;
            }
            row++;
        }
    );
}

function shortenHeaderRow(row, ellipsis, skip_label) {
    $(`table > thead > tr:nth-child(${row + 1}) > td`).each(
        function() {
            let value = this.innerHTML;
            if (ellipsis === 0 && !skip_label) {
                this.innerHTML = `<div style="width: 100%; height: 100%;" data-toggle="tooltip" data-trigger="hover click focus" title='${value}'></div>`;
            } else if (value.length > ellipsis && !skip_label) {
                this.innerHTML = `<span data-toggle="tooltip" data-trigger="hover click focus" title='${value}'>${value.substring(0, ellipsis)}...</span>`;
            }
            skip_label = false;
        }
    );
}


function linkUrlColumn(ah, dp_columns, columns, title, link_urls, detail_mode, header_label_length) {
    let index = dp_columns.indexOf(title) + 1;
    if (detail_mode || header_label_length !== 0) {
        index += 1;
    }
    let table_rows = $('#table').bootstrapTable('getData');
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function () {
            let row = this.parentElement.dataset.index;
            let value = table_rows[row][title];
            if (link_urls.length == 1) {
                let link = link_urls[0].link.url.replaceAll("{value}", value);
                for (const column of columns) {
                    link = link.replaceAll(`{${column}}`, table_rows[row][column]);
                }
                if (link_urls[0].link.new_window) {
                    this.innerHTML = `<a href='${link}' target='_blank' rel='noopener noreferrer' >${value}</a>`;
                } else {
                    this.innerHTML = `<a href='${link}'>${value}</a>`;
                }
            } else {
                let links = "";
                for (let l of link_urls) {
                    let link = l.link.url.replaceAll("{value}", value);
                    for (const column of columns) {
                        link = link.replaceAll(`{${column}}`, table_rows[row][column]);
                    }
                    if (l.link.new_window) {
                        links = `${links}<a class="dropdown-item" href='${link}' target='_blank' rel='noopener noreferrer' >${l.name}</a>`;
                    } else {
                        links = `${links}<a class="dropdown-item" href='${link}' >${l.name}</a>`;
                    }
                }
                this.innerHTML = `
                <div class="btn-group">
                  <button class="btn btn-outline-secondary btn-table btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${value}
                  </button>
                  <div class="dropdown-menu">
                    ${links}
                  </div>
                </div>
                `;
            }
            row++;
        }
    );
}

function colorizeDetailCard(value, div, heatmap, row) {
    let scale = null;

    if (heatmap.heatmap.scale == "ordinal") {
        if (heatmap.heatmap.color_scheme != "") {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(vega.scheme(heatmap.heatmap.color_scheme));
        } else if (!heatmap.heatmap.range.length == 0) {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(heatmap.heatmap.range);
        } else {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain);
        }
    } else {
        if (heatmap.heatmap.color_scheme != "") {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(vega.scheme(heatmap.heatmap.color_scheme));
        } else if (!heatmap.heatmap.range == 0) {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(heatmap.heatmap.range);
        } else {
            scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp);
        }
    }

    if (value !== "") {
        $(`${div}`).css( "background-color", scale(value) );
    }
    if (heatmap.heatmap.custom_content !== null) {
        var data_function = window[heatmap.heatmap.custom_content];
        value = data_function(value, row);
        $(`${div}`)[0].innerHTML = value;
    }
}

function colorizeHeaderRow(row, heatmap, header_label_length) {
    let scale = null;

    if (heatmap.scale == "ordinal") {
        if (heatmap.domain != null) {
            if (heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.scale)().domain(heatmap.domain).range(vega.scheme(heatmap.color_scheme));
            } else if (!heatmap.range.length == 0) {
                scale = vega.scale(heatmap.scale)().domain(heatmap.domain).range(heatmap.range);
            } else {
                scale = vega.scale(heatmap.scale)().domain(heatmap.domain);
            }
        } else {
            if (heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.scale)().range(vega.scheme(heatmap.color_scheme));
            } else if (!heatmap.range.length == 0) {
                scale = vega.scale(heatmap.scale)().range(heatmap.range);
            } else {
                scale = vega.scale(heatmap.scale)();
            }
        }
    } else {
        if (heatmap.domain != null) {
            if (heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.scale)().domain(heatmap.domain).clamp(heatmap.clamp).range(vega.scheme(heatmap.color_scheme));
            } else if (!heatmap.range == 0) {
                scale = vega.scale(heatmap.scale)().domain(heatmap.domain).clamp(heatmap.clamp).range(heatmap.range);
            } else {
                scale = vega.scale(heatmap.scale)().domain(heatmap.domain).clamp(heatmap.clamp);
            }
        } else {
            if (heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.scale)().clamp(heatmap.clamp).range(vega.scheme(heatmap.color_scheme));
            } else if (!heatmap.range == 0) {
                scale = vega.scale(heatmap.scale)().clamp(heatmap.clamp).range(heatmap.range);
            } else {
                scale = vega.scale(heatmap.scale)().clamp(heatmap.clamp);
            }
        }
    }
    var skip_label = header_label_length > 0;
    $(`table > thead > tr:nth-child(${row + 1}) > td`).each(
        function() {
            var value = this.innerHTML;
            if (value !== "" && !skip_label) {
                this.style.setProperty("background-color", scale(value), "important");
            }
            skip_label = false;
        }
    );
}

function renderCustomPlot(ah, dp_columns, plot, dm, header_label_length) {
    let index = dp_columns.indexOf(plot.title) + 1;
    if (dm || header_label_length > 0) {
        index += 1;
    }
    let detail_mode = dp_columns.indexOf(plot.title) == -1;
    var data_function = window[plot.data_function];
    var specs = plot.specs;
    let row = 0;
    let table_rows = $('#table').bootstrapTable('getData', { useCurrentPage: true });
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function() {
            if (!detail_mode) {
                var id = `${plot.title}-${row}`;
                this.classList.add("plotcell");
                const div = document.createElement("div");
                let value = table_rows[row][plot.title];
                let value_row = table_rows[row];
                var data = data_function(value, value_row);
                var s = specs;
                s.data = {};
                s.data.values = data;
                var opt = {"actions": plot.vega_controls};
                this.innerHTML = "";
                this.appendChild(div);
                vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
            }
            row++;
        }
    );
}

function renderCustomPlotDetailView(value, div, data_function, specs, vega_controls) {
    var data = data_function(value);
    var s = specs;
    s.data = {};
    s.data.values = data;
    var opt = {"actions": vega_controls};
    vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
}

export function embedSearch(index) {
    var source = `search/column_${index}.html`;
    document.getElementById('search-iframe').setAttribute("src",source);
}

export function embedHistogram(show_plot, index, plot) {
    if (show_plot) {
        vegaEmbed(`#plot_${index}`, plot);
    } else {
        document.getElementById(`plot_${index}`).innerHTML = '<p>No reasonable plot possible.</p>';
    }
}
function addNumClass(dp_num, ah, detail_mode) {
    for (let i in dp_num) {
        if (dp_num[i]) {
            let row = 0;
            let n = parseInt(i) + 1;
            if (detail_mode) {
                n += 1;
            }
            $(`table > tbody > tr td:nth-child(${n})`).each(
                function() {
                    this.classList.add("num-cell");
                    row++;
                }
            );
        }
    }
}

function detailFormatter(index, row) {
    let cp = config.custom_plot_titles;
    let ticks = config.tick_titles;
    let bars = config.bar_titles;
    let displayed_columns = config.displayed_columns;
    let hidden_columns = config.hidden_columns;
    var html = []
    $.each(row, function (key, value) {
        if (!hidden_columns.includes(key) && !displayed_columns.includes(key) && key !== "linkouts" && key !== "share") {
            let id;
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
                     ${key}
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
                    ${key}
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
                     ${key}
                   </div>
                   <div class="card-body">
                    ${value}
                   </div>
                 </div>`;
                html.push(card);
            } else {
                var card = `<div class="card">
                   <div class="card-header">
                     ${key}
                   </div>
                   <div class="card-body">
                    ${value}
                   </div>
                 </div>`;
                html.push(card);
            }
        }
    })
    return `<div class="d-flex flex-wrap">${html.join('')}</div>`
}

// Renders plots, heatmaps etc. when the table is loaded or on page change
function render(additional_headers, displayed_columns, table_rows, columns, config, render_headers, custom_plots) {
    for (const o of custom_plots) {
        if (displayed_columns.includes(o.title)) {
            renderCustomPlot(additional_headers.length, displayed_columns, o, config.detail_mode, config.header_label_length);
        }
    }

    for (const o of config.ticks) {
        if (displayed_columns.includes(o.title)) {
            renderTickPlot(additional_headers.length, displayed_columns, o.title, o.slug_title, o.specs, config.column_config[o.title].is_float, config.column_config[o.title].precision, config.detail_mode, config.header_label_length);
        }
    }

    for (const o of config.bars) {
        if (displayed_columns.includes(o.title)) {
            renderBarPlot(additional_headers.length, displayed_columns, o.title, o.slug_title, o.specs, config.column_config[o.title].is_float, config.column_config[o.title].precision, config.detail_mode, config.header_label_length);
        }
    }

    for (const o of config.link_urls) {
        if (displayed_columns.includes(o.title)) {
            linkUrlColumn(additional_headers.length, displayed_columns, columns, o.title, o.links, config.detail_mode, config.header_label_length);
        }
    }

    for (const o of config.heatmaps) {
        if (displayed_columns.includes(o.title)) {
            colorizeColumn(additional_headers.length, displayed_columns, o, config.detail_mode, config.header_label_length);
        }
    }

    for (const o of config.ellipsis) {
        if (displayed_columns.includes(o.title)) {
            shortenColumn(additional_headers.length, displayed_columns, o.title, o.ellipsis, config.detail_mode, config.header_label_length);
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

    $('[data-toggle="popover"]').popover({ sanitizeFn: function (content) { return content; } })
    $('[data-toggle="tooltip"]').tooltip({ sanitizeFn: function (content) { return content; } })
}

export function load() {
    $(document).ready(function() {
        $('.table-container').show();
        $('.loading').hide();
        $('#pagination').show();
        $(function () {
            $('[data-toggle="tooltip"]').tooltip({ sanitizeFn: function (content) { return content; } })
        });
        $(function () {
            $('[data-toggle="popover"]').popover({ sanitizeFn: function (content) { return content; } })
        });
        $('.modal').on('shown.bs.modal', function () {
            window.dispatchEvent(new Event('resize'));
        });
        if ($("#collapseDescription").length > 0) {
            renderMarkdownDescription();
        }
        var decompressed = JSON.parse(LZString.decompressFromUTF16(data));

        let bs_table_cols = [];

        if (!config.detail_mode && config.header_label_length > 0) {
            bs_table_cols.push({
                field: '',
                title: '',
                formatter: function(value) {
                    return value;
                }
            });
        }

        for (const column of config.columns) {
            if (config.displayed_columns.includes(column)) {
                let field = column;
                let title = ""
                if (config.column_config[column].label) {
                    title = config.column_config[column].label;
                } else {
                    title = column;
                }

                // Add histogram button
                let histogram_icon = ` <a class="sym" data-toggle="modal" data-target="#modal_${config.columns.indexOf(column)}" onclick="datavzrd.embedHistogram(show_plot_${config.columns.indexOf(column)}, ${config.columns.indexOf(column)}, plot_${config.columns.indexOf(column)})"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-bar-chart-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="5" x="1" y="10" rx="1"/><rect width="4" height="9" x="6" y="6" rx="1"/><rect width="4" height="14" x="11" y="1" rx="1"/></svg></a>`;
                title += histogram_icon;

                // Add static search if not single page mode
                if (!config.is_single_page) {
                    title += ` <a class="sym" data-toggle="modal" onclick="datavzrd.embedSearch(${config.columns.indexOf(column)})" data-target="#search"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/></svg></a>`;
                }

                let formatter = undefined;
                if (config.format[column] != undefined) {
                    formatter = config.format[column];
                } else {
                    if (config.column_config[column].precision && config.column_config[column].is_float) {
                        formatter = function(value) { return precision_formatter(config.column_config[column].precision, value); };
                    } else {
                        formatter = function(value) { return value; };
                    }
                }

                let column_config = {
                    field: field,
                    title: title,
                    formatter: formatter,
                }

                if (config.is_single_page) {
                    column_config["filterControl"] = "input";
                }

                bs_table_cols.push(column_config);
            }
        }

        if (linkouts != null) {
            bs_table_cols.push({field: 'linkouts', title: '', formatter: function(value){ return value }});
            var decompressed_linkouts = JSON.parse(LZString.decompressFromUTF16(linkouts));
        }

        if (config.webview_controls) {
            bs_table_cols.push({field: 'share', title: '', formatter: function(value){ return value }});
        }

        var bs_table_config = {
            columns: bs_table_cols,
            data: [],
        };

        if (config.is_single_page) {
            bs_table_config.pagination = true;
            bs_table_config.pageSize = config.page_size;
        }

        if (config.detail_mode) {
            bs_table_config.detailView = true;
            bs_table_config.detailFormatter = detailFormatter;
        }

        $('#table').bootstrapTable(bs_table_config);

        let additional_headers = "";

        for (const ah of header_config.headers) {
            additional_headers += "<tr>";
            if (config.detail_mode || ah.label != undefined) {
                additional_headers += "<td";
                if (!config.detail_mode) {
                    additional_headers += " style='border: none !important;'";
                }
                additional_headers += ">";
                if (ah.label != undefined) {
                    additional_headers += `<b>${ah.label}</b>`;
                }
                additional_headers += "</td>";
            }
            for (const title of config.columns) {
                if (config.displayed_columns.includes(title)) {
                    additional_headers += `<td>${ah.header[title]}</td>`;
                }
            }
            additional_headers += "</tr>";
        }


        var header_height = (80+6*Math.max(...(config.displayed_columns.map(el => el.length)))*Math.SQRT2)/2;
        if (config.is_single_page) {
            header_height += 70;
        }
        $('th').css("height", header_height);

        var table_rows = [];
        var j = 0;
        for (const r of decompressed) {
            var i = 0;
            var row = {};
            for (const element of r) {
                row[config.columns[i]] = element;
                i++;
            }
            if (linkouts != null) {
                row["linkouts"] = decompressed_linkouts[j];
            }
            if (config.webview_controls) {
                row["share"] = `<span data-toggle="tooltip" data-placement="left" title="Share link via QR code. Note that when using the link the row data can temporarily occur (in base64-encoded form) in the server logs of ${config.webview_host}.">
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

        $(document).on('click', '.share-btn', function() {
            shareRow($(this).data('row'), config.webview_host);
        });

        $(document).on('click', '.copy-url', function() {
            navigator.clipboard.writeText(createShareURL($(this).data('row'), config.webview_host));
        });

        $( "#btnHeatmap" ).on( "click", function() {
            var i = 0;
            var heatmap_data = JSON.parse(JSON.stringify(table_rows));
            for (const r of heatmap_data) {
                if (r.hasOwnProperty('linkouts')) delete r['linkouts']
                if (r.hasOwnProperty('share')) delete r['share']
                r.index = i;
                i++;
            }
            heatmap_plot.data.values = heatmap_data;
            vegaEmbed('#heatmap-plot', heatmap_plot);
        });

        $('#table').find('thead').append(additional_headers);
        $('#table').bootstrapTable('append', table_rows);

        $('#table').on('expand-row.bs.table', (event, index, row, detailView) => {
            for (const o of custom_plots) {
                if (!config.displayed_columns.includes(o.title)) {
                    renderCustomPlotDetailView(row[o.title], `#detail-plot-${index}-cp-${config.columns.indexOf(o.title)}`, window[o.data_function], o.specs, o.vega_controls);
                }
            }

            for (const o of config.heatmaps) {
                colorizeDetailCard(row[o.title], `#heatmap-${index}-${config.columns.indexOf(o.title)}`, o, row);
            }

            for (const o of config.ticks) {
                if (!config.displayed_columns.includes(o.title)) {
                    renderDetailTickBarPlot(row[o.title], `#detail-plot-${index}-ticks-${config.columns.indexOf(o.title)}`, o.specs, o.title);
                }
            }

            for (const o of config.bars) {
                if (!config.displayed_columns.includes(o.title)) {
                    renderDetailTickBarPlot(row[o.title], `#detail-plot-${index}-bars-${config.columns.indexOf(o.title)}`, o.specs, o.title);
                }
            }
        })

        $("#markdown-btn").click(function() { renderMarkdownDescription(); });

        $( ".btn-sm" ).click(function() {
            var col = $(this).data( "col" );
            var field = $(this).data("val").toString();
            if (field.startsWith("<div")) {
                var temp = $(field);
                field = temp[0].dataset.value;
            }
            var marker = { "bin_start": field};
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
        addNumClass(config.displayed_numeric_columns, additional_headers.length, config.detail_mode);

        render(additional_headers, config.displayed_columns, table_rows, config.columns, config, true, custom_plots);

        if (!config.detail_mode && !config.header_label_length == 0) {
            $("table > thead > tr:first-child th:first-child").css("visibility", "hidden");
            $(`table > tbody > tr td:first-child`).each(function() {this.style.setProperty("visibility", "hidden"); this.style.setProperty("border", "none");});
        }

        if (config.is_single_page) {
            $('#sidebar-list').append($('<li class="list-group-item sidebar-btn" id="clear-filter">Clear filters</li>'))
            let filter_boundaries = {};
            let filters = {};
            let tick_brush_specs = {
                "width": 50,
                "height": 12,
                "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
                "data": {"values":[]},
                "mark": "tick",
                "encoding": {
                    "tooltip": {"field": "value", "type": "quantitative"},
                    "x": {
                        "field": "value",
                        "type": "quantitative",
                        "scale": {"type": "linear", "zero": false},
                        "axis": {
                            "title": null,
                            "orient": "top",
                            "labelFontWeight": "lighter"
                        }
                    },
                    "color": {"condition": {"param": "selection", "value": "#0275d8"}, "value": "grey"}
                },
                "params": [{"name": "selection", "select": "interval"}],
                "config": {"axis": {"grid": false},"background": null, "style": {"cell": {"stroke": "transparent"}}, "tick": {"thickness": 0.5, "bandSize": 10}}
            };

            let brush_domains = config.brush_domains;
            let aux_domains = config.aux_domains;

            function render_brush_plots(reset) {
                let tick_brush = 0;
                for (const title of config.displayed_columns) {
                    let index = tick_brush + 1;
                    if (config.detail_mode || config.header_label_length > 0) {
                        index += 1;
                    }
                    if (config.displayed_numeric_columns.includes(title)) {
                        let plot_data = [];
                        let values = []
                        for (const row of table_rows) {
                            if (row[title] != "" && row[title] != "NA") {
                                plot_data.push({"value": parseFloat(row[title])});
                                values.push(parseFloat(row[title]));
                            }
                        }
                        let min = Math.min(...values);
                        let max = Math.max(...values);
                        if (brush_domains[title] != undefined && config.tick_titles.includes(title)) {
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
                        let legend_tick_length = min.toString().length + max.toString().length;
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
                        if(!reset) {
                            let search_icon = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/></svg>';
                            $(`table > thead > tr th:nth-child(${index})  > div.th-inner`).append(`<div class="sym" data-s='${JSON.stringify(s)}' data-brush="${tick_brush}" id="filter-${index}-container" data-toggle="popover" data-placement="top" data-trigger="hover click focus" data-html="true" data-content="<div class='filter-brush-container'><div class='filter-brush ${brush_class}' id='brush-${tick_brush}'></div></div>"> ${search_icon}</div>`);
                        }
                        var opt = {"actions": false};
                        $(`#filter-${index}-container`).on('mouseover', function (e) {
                            vegaEmbed(`#brush-${e.currentTarget.dataset.brush}`, JSON.parse(e.currentTarget.dataset.s), opt).then(({spec, view}) => {
                                view.addSignalListener('selection', function(name, value) {
                                    filter_boundaries[spec.name] = value;
                                });
                                view.addEventListener('mouseup', function(event) {
                                    $('#table').bootstrapTable('filterBy', {"":""}, {
                                        'filterAlgorithm': customFilter
                                    })
                                });
                                // Add another event listener so the filter is still triggered when the brush is dragged outside the plot.
                                view.addEventListener('mouseleave', function(event) {
                                    // Only apply filter when mouseleave events happens while mouse is pressed
                                    if (event.buttons > 0) {
                                        $('#table').bootstrapTable('filterBy', {"":""}, {
                                            'filterAlgorithm': customFilter
                                        })
                                    }
                                });
                            })
                        });
                    } else {
                        if(!reset) {
                            let search_icon = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/></svg>';
                            $(`table > thead > tr th:nth-child(${index}) > div.th-inner`).append(`<div class="sym" id="filter-${index}-container" data-toggle="popover" data-placement="top" data-trigger="hover click focus" data-html="true" data-content="<input class='form-control form-control-sm' id='filter-${index}' data-title='${title}' placeholder='Filter...'>"> ${search_icon}</div>`);
                            $(`#filter-${index}-container`).on('click', function (e) {
                                $(`#filter-${index}`).on('input', function(event) {
                                    filters[event.target.dataset.title] = $(`#filter-${index}`).val();
                                    $('#table').bootstrapTable('filterBy', {"":""}, {
                                        'filterAlgorithm': customFilter
                                    })
                                });
                            });
                        }
                    }
                    tick_brush++;
                }
            }

            render_brush_plots(false);

            $('#clear-filter').click(function clearFilter() {
                filter_boundaries = {};
                filters = {};
                $('#table').bootstrapTable('filterBy', {"":""}, {
                    'filterAlgorithm': customFilter
                })
                $('.form-control').each( function() {
                    $(this).val('');
                });
                render_brush_plots(true);
            });

            function customFilter(row, filter) {
                for (const title of config.displayed_columns) {
                    if (filter_boundaries[title] !== undefined && !$.isEmptyObject(filter_boundaries[title])) {
                        if (row[title] < filter_boundaries[title]['value'][0] || row[title] > filter_boundaries[title]['value'][1]) {
                            return false;
                        }
                    }
                    if (filters[title] !== undefined && filters[title] !== "") {
                        if (!row[title].includes(filters[title])) {
                            return false;
                        }
                    }
                }
                return true
            }
        }

        if (config.is_single_page) {
            $('#table').on('page-change.bs.table', (number, size) => {
                setTimeout(function (){
                    render(additional_headers, config.displayed_columns, table_rows, config.columns, config, false, custom_plots);
                }, 0);
            })
        }

        let to_be_highlighted = parseInt(window.location.href.toString().split("highlight=").pop(), 10);
        let page_size = $('#table').bootstrapTable('getOptions').pageSize;
        if (config.is_single_page) {
            $('#table').bootstrapTable('selectPage', Math.floor(to_be_highlighted / page_size) + 1);
        }
        let rows = $("table > tbody > tr");
        rows.each(function() {
            if (this.dataset.index == to_be_highlighted) {
                $(this).children().addClass('active-row');
                if (!config.detail_mode && !config.header_label_length == 0) {
                    $(this).children().first().removeClass('active-row');
                }
                var value = to_be_highlighted;
                if (config.is_single_page) {
                    value = to_be_highlighted % page_size;
                }
                $('#table').bootstrapTable('scrollTo', {unit: 'rows', value: to_be_highlighted})
            }
        });

        $( window ).resize(function() {
            var he = $( window ).height() - 150;
            // $('#table').bootstrapTable('resetView',{height: he});
        })
    });
}

export function get_config_from_url_query() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const compressed_config = urlParams.get('config');
    const jsonm_config = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed_config));
    const unpacker = new jsonm.Unpacker();
    return unpacker.unpack(jsonm_config);
}

export function compress_data(data) {
    return LZString.compressToUTF16(JSON.stringify([data]));
}

export function load_table(specs, data, multiple_datasets) {
    $("#markdown-btn").click(function() { renderMarkdownDescription(); });
    if ($("#collapseDescription").length > 0) {
        renderMarkdownDescription();
    }
    if (multiple_datasets) {
        specs.datasets = {};
        specs.datasets = JSON.parse(LZString.decompressFromUTF16(data));
    } else {
        specs.data = {};
        specs.data.values = JSON.parse(LZString.decompressFromUTF16(data));
    }
    if (specs.width == "container") { $("#vis").css("width", "100%"); }
    vegaEmbed('#vis', specs);
}

export function custom_error(e, column) {
    $('#error-modal').modal('show')
    $('#error-column').html(column)
    $('#error-modal-text').html(e.toString() + e.stack.toString())
}

$(document).click(function (event) {
    var clickover = $(event.target);
    var $navbar = $("#sidebar");
    var _opened = $navbar.hasClass("show");
    if (_opened === true && !clickover.hasClass("sidebar-btn")) {
        $navbar.collapse('hide');
    }
});

export function load_search() {
    $(document).ready(function() {
        window.$ = window.jQuery = require("jquery");
        $('.table').bootstrapTable({
            onPostHeader: function () {
                $(".search-input").focus();
            }
        });
        $(".search-input").focus();
    });
}
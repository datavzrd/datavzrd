// Changes to these functions should lead to incrementing datavzrd_row_encoding_version

function renderMarkdownDescription() {
    var innerDescription = document.getElementById('innerDescription');
    var converter = new showdown.Converter();
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
    // Update this version number when the config or datavzrd.js changes
    c["datavzrd_row_encoding_version"] = 2;
    const packer = new jsonm.Packer();
    let packedMessage = packer.pack(c);
    let compressed = LZString.compressToEncodedURIComponent(JSON.stringify(packedMessage))
    let url = `${webhost_url}?config=${compressed}`;
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
        if (heatmap.heatmap.domain != null) {
            if (heatmap.heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(vega.scheme(heatmap.heatmap.color_scheme));
            } else if (!heatmap.heatmap.range.length == 0) {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(heatmap.heatmap.range);
            } else {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain);
            }
        } else {
            if (heatmap.heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.heatmap.scale)().range(vega.scheme(heatmap.heatmap.color_scheme));
            } else if (!heatmap.heatmap.range.length == 0) {
                scale = vega.scale(heatmap.heatmap.scale)().range(heatmap.heatmap.range);
            } else {
                scale = vega.scale(heatmap.heatmap.scale)();
            }
        }
    } else {
        if (heatmap.heatmap.domain != null) {
            if (heatmap.heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(vega.scheme(heatmap.heatmap.color_scheme));
            } else if (!heatmap.heatmap.range == 0) {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(heatmap.heatmap.range);
            } else {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp);
            }
        } else {
            if (heatmap.heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.heatmap.scale)().clamp(heatmap.heatmap.clamp).range(vega.scheme(heatmap.heatmap.color_scheme));
            } else if (!heatmap.heatmap.range == 0) {
                scale = vega.scale(heatmap.heatmap.scale)().clamp(heatmap.heatmap.clamp).range(heatmap.heatmap.range);
            } else {
                scale = vega.scale(heatmap.heatmap.scale)().clamp(heatmap.heatmap.clamp);
            }
        }
    }

    $(`table > tbody > tr td:nth-child(${index})`).each(
        function() {
            var value = table_rows[row][heatmap.title];
            if (custom_func !== null) {
                value = custom_func(value, table_rows[row]);
            }
            if (value !== "") {
                this.style.setProperty("background-color", scale(value), "important");
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
            value = this.innerHTML;
            if (value.length > ellipsis) {
                this.innerHTML = `<span data-toggle="tooltip" data-trigger="hover click focus" title='${value}'>${value.substring(0, ellipsis)}...</span>`;
            }
            row++;
        }
    );
}

function shortenHeaderRow(row, ellipsis, skip_label) {
    $(`table > thead > tr:nth-child(${row + 1}) > td`).each(
        function() {
            value = this.innerHTML;
            if (value.length > ellipsis && !skip_label) {
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
                for (column of columns) {
                    link = link.replaceAll(`{${column}}`, table_rows[row][column]);
                }
                if (link_urls[0].link.new_window) {
                    this.innerHTML = `<a href='${link}' target='_blank' >${value}</a>`;
                } else {
                    this.innerHTML = `<a href='${link}'>${value}</a>`;
                }
            } else {
                let links = "";
                for (let l of link_urls) {
                    let link = l.link.url.replaceAll("{value}", value);
                    for (column of columns) {
                        link = link.replaceAll(`{${column}}`, table_rows[row][column]);
                    }
                    if (l.link.new_window) {
                        links = `${links}<a class="dropdown-item" href='${link}' target='_blank' >${l.name}</a>`;
                    } else {
                        links = `${links}<a class="dropdown-item" href='${link}' >${l.name}</a>`;
                    }
                }
                this.innerHTML = `
                <div class="btn-group">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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

function colorizeDetailCard(value, div, heatmap) {
    let scale = null;

    if (heatmap.heatmap.scale == "ordinal") {
        if (heatmap.heatmap.domain != null) {
            if (heatmap.heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(vega.scheme(heatmap.heatmap.color_scheme));
            } else if (!heatmap.heatmap.range.length == 0) {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(heatmap.heatmap.range);
            } else {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain);
            }
        } else {
            if (heatmap.heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.heatmap.scale)().range(vega.scheme(heatmap.heatmap.color_scheme));
            } else if (!heatmap.heatmap.range.length == 0) {
                scale = vega.scale(heatmap.heatmap.scale)().range(heatmap.heatmap.range);
            } else {
                scale = vega.scale(heatmap.heatmap.scale)();
            }
        }
    } else {
        if (heatmap.heatmap.domain != null) {
            if (heatmap.heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(vega.scheme(heatmap.heatmap.color_scheme));
            } else if (!heatmap.heatmap.range == 0) {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(heatmap.heatmap.range);
            } else {
                scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp);
            }
        } else {
            if (heatmap.heatmap.color_scheme != "") {
                scale = vega.scale(heatmap.heatmap.scale)().clamp(heatmap.heatmap.clamp).range(vega.scheme(heatmap.heatmap.color_scheme));
            } else if (!heatmap.heatmap.range == 0) {
                scale = vega.scale(heatmap.heatmap.scale)().clamp(heatmap.heatmap.clamp).range(heatmap.heatmap.range);
            } else {
                scale = vega.scale(heatmap.heatmap.scale)().clamp(heatmap.heatmap.clamp);
            }
        }
    }

    if (value !== "") {
        $(`${div}`).css( "background-color", scale(value) );
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
    var data_function = plot.data_function;
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

function embedSearch(index) {
    var source = `search/column_${index}.html`;
    document.getElementById('search-iframe').setAttribute("src",source);
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
            if (cp.includes(key) || ticks.includes(key) || bars.includes(key)) {
                if (cp.includes(key)) {
                    id = `detail-plot-${index}-cp-${config.columns.indexOf(key)}`;
                } else if (bars.includes(key)) {
                    id = `detail-plot-${index}-bars-${bars.indexOf(key)}`;
                } else {
                    id = `detail-plot-${index}-ticks-${ticks.indexOf(key)}`;
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
                id = `heatmap-${index}-${config.heatmap_titles.indexOf(key)}`;
                var card = `<div class="card">
                  <div class="card-header">
                    ${key}
                  </div>
                  <div id="${id}" class="card-body">
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
    for (o of custom_plots) {
        if (displayed_columns.includes(o.title)) {
            renderCustomPlot(additional_headers.length, displayed_columns, o, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.ticks) {
        if (displayed_columns.includes(o.title)) {
            renderTickPlot(additional_headers.length, displayed_columns, o.title, o.slug_title, o.specs, config[o.title].is_float, config[o.title].precision, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.bars) {
        if (displayed_columns.includes(o.title)) {
            renderBarPlot(additional_headers.length, displayed_columns, o.title, o.slug_title, o.specs, config[o.title].is_float, config[o.title].precision, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.link_urls) {
        if (displayed_columns.includes(o.title)) {
            linkUrlColumn(additional_headers.length, displayed_columns, columns, o.title, o.links, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.heatmaps) {
        if (displayed_columns.includes(o.title)) {
            colorizeColumn(additional_headers.length, displayed_columns, o, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.ellipsis) {
        if (displayed_columns.includes(o.title)) {
            shortenColumn(additional_headers.length, displayed_columns, o.title, o.ellipsis, config.detail_mode, config.header_label_length);
        }
    }

    if (render_headers) {
        for (o of header_config.heatmaps) {
            colorizeHeaderRow(o.row, o.heatmap, config.header_label_length);
        }

        for (o of config.header_ellipsis) {
            shortenHeaderRow(o.index, o.ellipsis, config.header_label_length > 0);
        }
    }

    $('[data-toggle="popover"]').popover()
    $('[data-toggle="tooltip"]').tooltip()
    if (!config.detail_mode && !config.header_label_length == 0) {
        $(`table > thead > tr:first-child > th`).each(function() {this.style.setProperty("visibility", "hidden"); this.style.setProperty("border", "none");});
    }
}
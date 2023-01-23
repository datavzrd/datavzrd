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
                this.innerHTML = `${value.substring(0, ellipsis)}<a tabindex="0" role="button" href="#" data-toggle="popover" data-trigger="focus" data-html='true' data-content='<div style="overflow: auto; max-height: 30vh; max-width: 25vw;">${value}</div>'>...</a>`;
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
                this.innerHTML = `${value.substring(0, ellipsis)}<a tabindex="0" role="button" href="#" data-toggle="popover" data-trigger="focus" data-html='true' data-content='<div style="overflow: auto; max-height: 30vh; max-width: 25vw;">${value}</div>'>...</a>`;
            }
            skip_label = false;
        }
    );
}


function linkUrlColumn(ah, dp_columns, columns, title, link_url, detail_mode, header_label_length) {
    let index = dp_columns.indexOf(title) + 1;
    if (detail_mode || header_label_length !== 0) {
        index += 1;
    }
    let table_rows = $('#table').bootstrapTable('getData');
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function () {
            let row = this.parentElement.dataset.index;
            let value = table_rows[row][title];
            let link = link_url.replaceAll("{value}", value);
            for (column of columns) {
                link = link.replaceAll(`{${column}}`, table_rows[row][column]);
            }
            this.innerHTML = `<a href='${link}' target='_blank' >${value}</a>`;
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
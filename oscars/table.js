$(document).ready(function() {
    $('.table-container').show();
    $('.loading').hide();
    $('#pagination').show();
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });
    $(function () {
        $('[data-toggle="popover"]').popover()
    });
    $('.modal').on('shown.bs.modal', function () {
        window.dispatchEvent(new Event('resize'));
    });
    var decompressed = JSON.parse(LZString.decompressFromUTF16(data));

    if (linkouts != null) {
        var decompressed_linkouts = JSON.parse(LZString.decompressFromUTF16(linkouts));
    }

    var format = [];

    let bs_table_cols = [{
    field: 'oscar_yr',
    title: 'oscar_yr\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_1\" onclick=\"if (show_plot_1) {vegaEmbed(\'#plot_1\', plot_1)} else {document.getElementById(\'plot_1\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input"
    },{
    field: 'award',
    title: 'award\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_2\" onclick=\"if (show_plot_2) {vegaEmbed(\'#plot_2\', plot_2)} else {document.getElementById(\'plot_2\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input"
    },{
    field: 'name',
    title: 'name\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_3\" onclick=\"if (show_plot_3) {vegaEmbed(\'#plot_3\', plot_3)} else {document.getElementById(\'plot_3\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input"
    },{
    field: 'movie',
    title: 'movie\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_4\" onclick=\"if (show_plot_4) {vegaEmbed(\'#plot_4\', plot_4)} else {document.getElementById(\'plot_4\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input"
    },{
    field: 'age',
    title: 'age\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_5\" onclick=\"if (show_plot_5) {vegaEmbed(\'#plot_5\', plot_5)} else {document.getElementById(\'plot_5\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input"
    },{
    field: 'birth place',
    title: 'birth place\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_6\" onclick=\"if (show_plot_6) {vegaEmbed(\'#plot_6\', plot_6)} else {document.getElementById(\'plot_6\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input"
    },{
    field: 'birth date',
    title: 'birth date\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_7\" onclick=\"if (show_plot_7) {vegaEmbed(\'#plot_7\', plot_7)} else {document.getElementById(\'plot_7\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input"
    },];

    if (linkouts != null) {
        bs_table_cols.push({field: 'linkouts', title: '', formatter: function(value){ return value }});
    }

    $('#table').bootstrapTable({
        columns: bs_table_cols,
        pagination: true,
        data: [],
        detailView: true, detailFormatter: "detailFormatter",
    })

    let additional_headers = [];
    let columns = ["oscar_no","oscar_yr","award","name","movie","age","birth place","birth date","birth_mo","birth_d","birth_y"];
    let displayed_columns = ["oscar_yr","award","name","movie","age","birth place","birth date",];
    let num = [true,true,false,false,false,true,false,false,true,true,true];
    let dp_num = [true,false,false,false,true,false,false,];
    let ticks = ["age"];
    let cp = [];
    let links = ["movie","name"];

    var header_height = (80+6*Math.max(...(displayed_columns.map(el => el.length)))*Math.SQRT2)/2  + 35;
    $('th').css("height", header_height);

    var table_rows = [];
    var j = 0;
    for (const r of decompressed) {
        var i = 0;
        row = {};
        for (const element of r) {
            row[columns[i]] = element;
            i++;
        }
        if (linkouts != null) {
            row["linkouts"] = decompressed_linkouts[j];
        }
        j++;
        table_rows.push(row);
    }
    $('#table').bootstrapTable('append', additional_headers)
    $('#table').bootstrapTable('append', table_rows)

    $('#table').on('expand-row.bs.table', (event, index, row, detailView) => {
        let cp = [];
        let columns = ["oscar_no","oscar_yr","award","name","movie","age","birth place","birth date","birth_mo","birth_d","birth_y"];
        
    })

    $( ".btn-sm" ).click(function() {
        var col = $(this).data( "col" );
        var field = $(this).data("val").toString();
        if (field.startsWith("<div")) {
            var temp = $(field);
            field = temp[0].dataset.value;
        }
        var marker = { "bin_start": field};
        var index = columns.indexOf(col);
        switch (index) {
            case 0:
                if (plot_0["layer"].length > 1) {
                    $('#modal_0').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_0));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_0', marked_plot);
                }
                break;
            case 1:
                if (plot_1["layer"].length > 1) {
                    $('#modal_1').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_1));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_1', marked_plot);
                }
                break;
            case 2:
                if (plot_2["layer"].length > 1) {
                    $('#modal_2').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_2));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_2', marked_plot);
                }
                break;
            case 3:
                if (plot_3["layer"].length > 1) {
                    $('#modal_3').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_3));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_3', marked_plot);
                }
                break;
            case 4:
                if (plot_4["layer"].length > 1) {
                    $('#modal_4').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_4));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_4', marked_plot);
                }
                break;
            case 5:
                if (plot_5["layer"].length > 1) {
                    $('#modal_5').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_5));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_5', marked_plot);
                }
                break;
            case 6:
                if (plot_6["layer"].length > 1) {
                    $('#modal_6').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_6));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_6', marked_plot);
                }
                break;
            case 7:
                if (plot_7["layer"].length > 1) {
                    $('#modal_7').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_7));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_7', marked_plot);
                }
                break;
            case 8:
                if (plot_8["layer"].length > 1) {
                    $('#modal_8').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_8));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_8', marked_plot);
                }
                break;
            case 9:
                if (plot_9["layer"].length > 1) {
                    $('#modal_9').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_9));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_9', marked_plot);
                }
                break;
            case 10:
                if (plot_10["layer"].length > 1) {
                    $('#modal_10').modal();
                    var marked_plot = JSON.parse(JSON.stringify(plot_10));
                    marked_plot["layer"][1]["data"]["values"].push(marker);
                    vegaEmbed('#plot_10', marked_plot);
                }
                break;
            
        }
    });
    addNumClass(dp_num, additional_headers.length);

    render(additional_headers, displayed_columns, table_rows, columns);

    
    $('.btn-group + .btn-group').before($('<div class="btn-group" style="padding-right: 4px;"><button class="btn btn-primary" type="button" id="clear-filter">clear filters</button></div>'))
    let filter_boundaries = {};
    let filters = {};
    let tick_brush_specs = {
        "width": 50,
        "height": 8,
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
            "color": {"condition": {"param": "selection"}, "value": "grey"}
        },
        "params": [{"name": "selection", "select": "interval"}],
        "config": {"axis": {"grid": false},"background": null, "style": {"cell": {"stroke": "transparent"}}, "tick": {"thickness": 0.5, "bandSize": 6}}
        };

    let brush_domains = {"age":[20.0,100.0]};
    let aux_domains = {"age":[],"award":[]};

   function render_brush_plots(reset) {
   let tick_brush = 0;
       for (title of displayed_columns) {
           let index = tick_brush + 1 + 1;
           if (dp_num[tick_brush]) {
               let plot_data = [];
               let values = []
               for (row of table_rows) {
                   plot_data.push({"value": parseFloat(row[title])});
                   values.push(parseFloat(row[title]));
               }
               let min = Math.min(...values);
               let max = Math.max(...values);
               if (brush_domains[title] != undefined) {
                   min = brush_domains[title][0];
                   max = brush_domains[title][1];
               } else if (aux_domains[title] != undefined) {
                   aux_values = [min, max];
                   for (col of aux_domains[title]) {
                        for (row of table_rows) {
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
               if(!reset) $(`table > thead > tr th:nth-child(${index})`).append(`<div class="filter-brush-container"><div class="filter-brush ${brush_class}" id="brush-${tick_brush}"></div></div>`);
               var opt = {"actions": false};
               vegaEmbed(`#brush-${tick_brush}`, JSON.parse(JSON.stringify(s)), opt).then(({spec, view}) => {
                   view.addSignalListener('selection', function(name, value) {
                       filter_boundaries[spec.name] = value;
                   });
                   view.addEventListener('mouseup', function(name, value) {
                       $('#table').bootstrapTable('filterBy', {"":""}, {
                           'filterAlgorithm': customFilter
                       })
                   });
               })
           } else {
           if(!reset){
               $(`table > thead > tr th:nth-child(${index})`).append(`<input class="form-control form-control-sm" id="filter-${index}" data-title="${title}" placeholder="Filter...">`);
                   $(`#filter-${index}`).on('input', function(event) {
                       filters[event.target.dataset.title] = $(`#filter-${index}`).val();
                       $('#table').bootstrapTable('filterBy', {"":""}, {
                           'filterAlgorithm': customFilter
                       })
                   });
               }
           }
           tick_brush++;
       }
   }

   render_brush_plots(false);


    function customFilter(row, filter) {
        for (title of displayed_columns) {
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


    $('#table').on('page-change.bs.table', (number, size) => {
        setTimeout(function (){
        render(additional_headers, displayed_columns, table_rows, columns);
        }, 0);
    })

    let to_be_highlighted = parseInt(window.location.href.toString().split("highlight=").pop(), 10) + additional_headers.length;
    
    let page_size = $('#table').bootstrapTable('getOptions').pageSize;
    $('#table').bootstrapTable('selectPage', Math.floor(to_be_highlighted / page_size) + 1);
    
    let rows = $("table > tbody > tr");
    rows.each(function() {
        if (this.dataset.index == to_be_highlighted) {
            $(this).children().addClass('active-row');
            $('#table').bootstrapTable('scrollTo', {unit: 'rows', value: to_be_highlighted  % page_size})
        }
    });

    $( window ).resize(function() {
        var he = $( window ).height() - 150;
        // $('#table').bootstrapTable('resetView',{height: he});
    })
});

function renderMarkdownDescription() {
    var innerDescription = document.getElementById('innerDescription');
    var converter = new showdown.Converter();
    converter.setFlavor('github');
    innerDescription.innerHTML = converter.makeHtml(innerDescription.dataset.markdown);
}




function renderTickPlots0(ah, columns) {
    let index = columns.indexOf("age") + 1 + 1;
    var specs =  {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 50,
    "height": 10,
    "encoding": {
        "x": {
            "field": "age",
            "type": "quantitative",
            "scale": {"type": "linear","domain": [20, 100]},
            "axis": {
                "title": null,
                "ticks": false,
                "labels": false,
                "grid": false,
                "offset": -11
            }
        },
        "y": {"value": 0, "scale": {"domain": [0, 1]}}
    },
    "layer": [
        {"mark": "tick"},
        {
        "mark": {"type": "text", "yOffset": -8, "xOffset": 12},
        "encoding": {"text": {"field": "age"}}
        }
    ],
    "config": {
        "tick": {"thickness": 2},
        "background": null,
        "style": {"cell": {"stroke": "transparent"}}
    }
};
    let row = 0;
    let table_rows = $('#table').bootstrapTable('getData');
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function() {
            if (row < ah) {
                row++;
                return;
            }
            var id = `age-${row}`;
            this.classList.add("plotcell");
            const div = document.createElement("div");
            let value = table_rows[row]["age"];
            if (value != "") {
                this.innerHTML = "";
                this.appendChild(div);
                var data = [{"age": value}];
                var s = specs;
                s.data = {};
                s.data.values = data;
                var opt = {"actions": false};
                vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
            }
            row++;
        }
    );
}



function colorizeColumn0(ah, columns) {
    let index = columns.indexOf("award") + 1 + 1;
    var ordinal = vega.scale('ordinal');
    var scale = ordinal().domain(["Best actor","Best actress"]).range(["#add8e6","#ffb6c1"]);
    let row = 0;
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function() {
            if (row < ah) {
                row++;
                return;
            }
            value = this.innerHTML;
            this.style.backgroundColor = scale(value);
            row++;
        }
    );
}





    function linkUrlColumn0(ah, dp_columns, columns) {
        let index = dp_columns.indexOf("movie") + 1 + 1;
        let link_url = "https://de.wikipedia.org/wiki/{value}";
        let table_rows = $('#table').bootstrapTable('getData');
        $(`table > tbody > tr td:nth-child(${index})`).each(
            function() {
                let row = this.parentElement.dataset.index;
                let value = table_rows[row]["movie"];
                let link = link_url.replaceAll("{value}", value);
                for (column of columns) {
                link = link.replaceAll(`{${column}}`, table_rows[row][column]);
                }
                this.innerHTML = `<a href='${link}' target='_blank' >${value}</a>`;
                row++;
            }
        );
    }

    function linkUrlColumn1(ah, dp_columns, columns) {
        let index = dp_columns.indexOf("name") + 1 + 1;
        let link_url = "https://lmgtfy.app/?q=Is {name} in {movie}?";
        let table_rows = $('#table').bootstrapTable('getData');
        $(`table > tbody > tr td:nth-child(${index})`).each(
            function() {
                let row = this.parentElement.dataset.index;
                let value = table_rows[row]["name"];
                let link = link_url.replaceAll("{value}", value);
                for (column of columns) {
                link = link.replaceAll(`{${column}}`, table_rows[row][column]);
                }
                this.innerHTML = `<a href='${link}' target='_blank' >${value}</a>`;
                row++;
            }
        );
    }


function embedSearch(index) {
    var source = `search/column_${index}.html`;
    document.getElementById('search-iframe').setAttribute("src",source);
}


function detailFormatter(index, row) {
    let cp = [];
    var html = []
    $.each(row, function (key, value) {
        if (cp.includes(key)) {
            id = `detail-plot-${index}-${cp.indexOf(key)}`;
            html.push('<p><b>' + key + ':</b> ' + `<div id="${id}"></div>` + '</p>')
        } else {
            html.push('<p><b>' + key + ':</b> ' + value + '</p>')
        }
    })
    return html.join('')
}




function addNumClass(dp_num, ah) {
    for (let i in dp_num) {
        if (dp_num[i]) {
            let row = 0;
            let n = parseInt(i) +  + 2;
            $(`table > tbody > tr td:nth-child(${n})`).each(
                function() {
                    if (row < ah) {
                        row++;
                        return;
                    }
                    this.classList.add("num-cell");
                    row++;
                }
            );
        }
    }
}

function render(additional_headers, displayed_columns, table_rows, columns) {



    renderTickPlots0(additional_headers.length, displayed_columns);



    linkUrlColumn0(additional_headers.length, displayed_columns, columns);

    linkUrlColumn1(additional_headers.length, displayed_columns, columns);



    colorizeColumn0(additional_headers.length, displayed_columns);



$('[data-toggle="popover"]').popover()
}

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
    field: 'Title',
    title: 'Title\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_0\" onclick=\"if (show_plot_0) {vegaEmbed(\'#plot_0\', plot_0)} else {document.getElementById(\'plot_0\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["Title"] != undefined){ return format["Title"](value, row, index, field) } else { return value } }
    },{
    field: 'Year',
    title: 'Year\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_1\" onclick=\"if (show_plot_1) {vegaEmbed(\'#plot_1\', plot_1)} else {document.getElementById(\'plot_1\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["Year"] != undefined){ return format["Year"](value, row, index, field) } else { return value } }
    },{
    field: 'Rated',
    title: 'Rated\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_2\" onclick=\"if (show_plot_2) {vegaEmbed(\'#plot_2\', plot_2)} else {document.getElementById(\'plot_2\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["Rated"] != undefined){ return format["Rated"](value, row, index, field) } else { return value } }
    },{
    field: 'Released',
    title: 'Released\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_3\" onclick=\"if (show_plot_3) {vegaEmbed(\'#plot_3\', plot_3)} else {document.getElementById(\'plot_3\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["Released"] != undefined){ return format["Released"](value, row, index, field) } else { return value } }
    },{
    field: 'Runtime',
    title: 'Runtime\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_4\" onclick=\"if (show_plot_4) {vegaEmbed(\'#plot_4\', plot_4)} else {document.getElementById(\'plot_4\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["Runtime"] != undefined){ return format["Runtime"](value, row, index, field) } else { return value } }
    },{
    field: 'Genre',
    title: 'Genre\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_5\" onclick=\"if (show_plot_5) {vegaEmbed(\'#plot_5\', plot_5)} else {document.getElementById(\'plot_5\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["Genre"] != undefined){ return format["Genre"](value, row, index, field) } else { return value } }
    },{
    field: 'Director',
    title: 'Director\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_6\" onclick=\"if (show_plot_6) {vegaEmbed(\'#plot_6\', plot_6)} else {document.getElementById(\'plot_6\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["Director"] != undefined){ return format["Director"](value, row, index, field) } else { return value } }
    },{
    field: 'imdbRating',
    title: 'imdbRating\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_7\" onclick=\"if (show_plot_7) {vegaEmbed(\'#plot_7\', plot_7)} else {document.getElementById(\'plot_7\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["imdbRating"] != undefined){ return format["imdbRating"](value, row, index, field) } else { return precision_formatter(2,value) } }
    },{
    field: 'imdbID',
    title: 'imdbID\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_8\" onclick=\"if (show_plot_8) {vegaEmbed(\'#plot_8\', plot_8)} else {document.getElementById(\'plot_8\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl: "input",
        formatter: function(value, row, index, field) { if (format["imdbID"] != undefined){ return format["imdbID"](value, row, index, field) } else { return value } }
    }];

    if (linkouts != null) {
        bs_table_cols.push({field: 'linkouts', title: '', formatter: function(value){ return value }});
    }

    $('#table').bootstrapTable({
        columns: bs_table_cols,
        pagination: true, pageSize: 100,
        data: [],
        
    })

    let additional_headers = "";
    let columns = ["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];
    let displayed_columns = ["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];
    let num = [false,true,false,false,false,false,false,true,false];
    let dp_num = [false,true,false,false,false,false,false,true,false];
    let ticks = ["imdbRating"];
    let cp = [];
    let links = ["Title","imdbID"];

    var header_height = (80+6*Math.max(...(displayed_columns.map(el => el.length)))*Math.SQRT2)/2  + 45;
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
    $('#table').find('thead').append(additional_headers);
    $('#table').bootstrapTable('append', table_rows);

    $('#table').on('expand-row.bs.table', (event, index, row, detailView) => {
        let cp = [];
        let ticks = ["imdbRating"];
        let heatmaps = ["Rated"];
        let columns = ["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];
        
        
        
        colorizeDetailCard0(row[heatmaps[0]], `#heatmap-${index}-0`);
        
        
        
        renderDetailTickPlots0(row[ticks[0]], `#detail-plot-${index}-ticks-0`);
        
    })

    window.addEventListener('beforeprint', (event) => {
        setTimeout(function (){
            $('#table').bootstrapTable('togglePagination');
            render(additional_headers, displayed_columns, table_rows, columns);
            $('th').css("height", header_height - 15);
            
            if (links.length > 0) {
            $(`table > tbody > tr td:last-child`).each(function() {this.style.setProperty("display", "none");});
            $("table > thead > tr th:last-child").css("display", "none");
            }
        }, 0);
    });

    $("#btnPrint").on("click", function () {
        window.print();
    });

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
            
        }
    });
    addNumClass(dp_num, additional_headers.length);

    render(additional_headers, displayed_columns, table_rows, columns);

    

    
    $('.btn-group + .bootstrap-select').before($('<div class="btn-group" style="padding-right: 4px;"><button class="btn btn-primary" type="button" id="clear-filter">clear filters</button></div>'))
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

    let brush_domains = {"imdbRating":[1.0,10.0]};
    let aux_domains = {"Rated":[],"imdbRating":[]};

   function render_brush_plots(reset) {
   let tick_brush = 0;
       for (title of displayed_columns) {
           let index = tick_brush + 1;
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

    let to_be_highlighted = parseInt(window.location.href.toString().split("highlight=").pop(), 10);
    
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

function precision_formatter(precision, value) {
    value = parseFloat(value)
    if (1 / (10 ** precision) < value) {
        return value.toString()
    } else {
        return value.toExponential(precision)
    }
}




function renderTickPlots0(ah, columns) {
    let index = columns.indexOf("imdbRating") + 1;
    let detail_mode = columns.indexOf("imdbRating") == -1;
    var specs =  {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 50,
    "height": 10,
    "encoding": {
        "x": {
            "field": "imdbRating",
            "type": "quantitative",
            "scale": {"type": "linear","domain": [1, 10]},
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
        "encoding": {"x": {"value": 0}, "text": {"field": "imdbRating"}}
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
            var id = `imdbrating-${row}`;
            this.classList.add("plotcell");
            const div = document.createElement("div");
            let value = table_rows[row]["imdbRating"];
            
            value = precision_formatter(2,value);
            if (value != "" && !detail_mode) {
                this.innerHTML = "";
                this.appendChild(div);
                var data = [{"imdbRating": value}];
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



function renderDetailTickPlots0(value, div) {
    var specs =  {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 50,
    "height": 10,
    "encoding": {
        "x": {
            "field": "imdbRating",
            "type": "quantitative",
            "scale": {"type": "linear","domain": [1, 10]},
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
        "encoding": {"x": {"value": 0}, "text": {"field": "imdbRating"}}
        }
    ],
    "config": {
        "tick": {"thickness": 2},
        "background": null,
        "style": {"cell": {"stroke": "transparent"}}
    }
};
    if (value != "") {
        var data = [{"imdbRating": value}];
        var s = specs;
        s.data = {};
        s.data.values = data;
        var opt = {"actions": true};
        vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
    }
}



function colorizeColumn0(ah, columns) {
    let detail_mode = columns.indexOf("Rated") == -1;
    let index = columns.indexOf("Rated") + 1;
    var ordinal = vega.scale('ordinal');
    var scale = ordinal().domain(["Unrated","Passed","PG-13","R","Approved","Not Rated","M/PG","G","TV-MA","PG","N/A","M"]).range(vega.scheme('accent'));
    let row = 0;
    var table_rows = $("#table").bootstrapTable('getData', {useCurrentPage: "true"});
    
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function() {
            var value = table_rows[row]["Rated"];
            
            if (value !== "" && !detail_mode) {
                this.style.setProperty("background-color", scale(value), "important");
            }
            row++;
        }
    );
}





function colorizeDetailCard0(value, div) {
    var ordinal = vega.scale('ordinal');
    var scale = ordinal().domain(["Unrated","Passed","PG-13","R","Approved","Not Rated","M/PG","G","TV-MA","PG","N/A","M"]).range(vega.scheme('accent'));
    if (value !== "") {
        $(`${div}`).css( "background-color", scale(value) );
    }
}



    function shortenColumn0(ah, columns) {
        let index = columns.indexOf("Genre") + 1;
        let row = 0;
        $(`table > tbody > tr td:nth-child(${index})`).each(
            function() {
                value = this.innerHTML;
                if (value.length > 15) {
                    this.innerHTML = `${value.substring(0,15)}<a tabindex="0" role="button" href="#" data-toggle="popover" data-trigger="focus" data-html='true' data-content='<div style="overflow: auto; max-height: 30vh; max-width: 25vw;">${value}</div>'>...</a>`;
                }
                row++;
            }
        );
    }



    function linkUrlColumn0(ah, dp_columns, columns) {
        let index = dp_columns.indexOf("Title") + 1;
        let link_url = "https://de.wikipedia.org/wiki/{value}";
        let table_rows = $('#table').bootstrapTable('getData');
        $(`table > tbody > tr td:nth-child(${index})`).each(
            function() {
                let row = this.parentElement.dataset.index;
                let value = table_rows[row]["Title"];
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
        let index = dp_columns.indexOf("imdbID") + 1;
        let link_url = "https://www.imdb.com/title/{value}/";
        let table_rows = $('#table').bootstrapTable('getData');
        $(`table > tbody > tr td:nth-child(${index})`).each(
            function() {
                let row = this.parentElement.dataset.index;
                let value = table_rows[row]["imdbID"];
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





function addNumClass(dp_num, ah) {
    for (let i in dp_num) {
        if (dp_num[i]) {
            let row = 0;
            let n = parseInt(i) +  + 1;
            $(`table > tbody > tr td:nth-child(${n})`).each(
                function() {
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



    shortenColumn0(additional_headers.length, displayed_columns);



$('[data-toggle="popover"]').popover()

}
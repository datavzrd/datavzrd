$(document).ready(function() {
    $('.table-container').show();
    $('.loading').hide();
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });
    $(function () {
    $('[data-toggle="popover"]').popover()
    });
    $('#table').bootstrapTable( 'resetView' , {height: window.innerHeight - 200} );
    $('.modal').on('shown.bs.modal', function () {
        window.dispatchEvent(new Event('resize'));
    });
    var decompressed = JSON.parse(LZString.decompressFromUTF16(data));

    if (linkouts != null) {
        var decompressed_linkouts = JSON.parse(LZString.decompressFromUTF16(linkouts));
    }

    var format = [];

    var he = $( window ).height() - 195;

    let bs_table_cols = [{
    field: 'Title',
    title: 'Title\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_0\" onclick=\"if (show_plot_0) {vegaEmbed(\'#plot_0\', plot_0)} else {document.getElementById(\'plot_0\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(0)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    },{
    field: 'Year',
    title: 'Year\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_1\" onclick=\"if (show_plot_1) {vegaEmbed(\'#plot_1\', plot_1)} else {document.getElementById(\'plot_1\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(1)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    },{
    field: 'Rated',
    title: 'Rated\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_2\" onclick=\"if (show_plot_2) {vegaEmbed(\'#plot_2\', plot_2)} else {document.getElementById(\'plot_2\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(2)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    },{
    field: 'Released',
    title: 'Released\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_3\" onclick=\"if (show_plot_3) {vegaEmbed(\'#plot_3\', plot_3)} else {document.getElementById(\'plot_3\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(3)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    },{
    field: 'Runtime',
    title: 'Runtime\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_4\" onclick=\"if (show_plot_4) {vegaEmbed(\'#plot_4\', plot_4)} else {document.getElementById(\'plot_4\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(4)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    },{
    field: 'Genre',
    title: 'Genre\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_5\" onclick=\"if (show_plot_5) {vegaEmbed(\'#plot_5\', plot_5)} else {document.getElementById(\'plot_5\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(5)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    },{
    field: 'Director',
    title: 'Director\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_6\" onclick=\"if (show_plot_6) {vegaEmbed(\'#plot_6\', plot_6)} else {document.getElementById(\'plot_6\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(6)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    },{
    field: 'imdbRating',
    title: 'imdbRating\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_7\" onclick=\"if (show_plot_7) {vegaEmbed(\'#plot_7\', plot_7)} else {document.getElementById(\'plot_7\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(7)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    },{
    field: 'imdbID',
    title: 'imdbID\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_8\" onclick=\"if (show_plot_8) {vegaEmbed(\'#plot_8\', plot_8)} else {document.getElementById(\'plot_8\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        <a class=\"sym\" data-toggle=\"modal\" onclick=\"embedSearch(8)\" data-target=\"#search\">\r\n                        <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-search\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <path fill-rule=\"evenodd\" d=\"M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z\"\/>\r\n                                <path fill-rule=\"evenodd\" d=\"M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z\"\/>\r\n                            <\/svg>\r\n                        <\/a>'
    }];

    var fixed_right = 0;
    var fixed = false;

    if (linkouts != null) {
        bs_table_cols.push({field: 'linkouts', title: '', formatter: function(value){ return value }});
        fixed_right = 1;
    }

    $('#table').bootstrapTable({
        height: he,
        columns: bs_table_cols,
        data: [],
        
        fixedColumns: true,
        fixedRightNumber: fixed_right,
        fixedNumber: 0
    })

    let additional_headers = [];
    let columns = ["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];
    let displayed_columns = ["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];
    let num = [false,false,false,false,false,false,false,true,false];
    let ticks = ["imdbRating"];
    let cp = [];
    let links = ["Title","imdbID"];
    var table_rows = [];
    var j = 0;
    for (const r of decompressed) {
        var i = 0;
        row = {};
        for (const element of r) {
            var el = element;
            if (element.length > 30 && format[columns[i]] == undefined && !ticks.includes(columns[i]) && !cp.includes(columns[i]) && !links.includes(columns[i])) {
                el = `${element.substring(0,30)}<a tabindex="0" role="button" href="#" data-toggle="popover" data-trigger="focus" data-html='true' data-content='<div style="overflow: auto; max-height: 30vh; max-width: 25vw;">${element}</div>'>...</a>`;
            }
            if (num[i] && !ticks.includes(columns[i]) && !cp.includes(columns[i]) ) {
                row[columns[i]] = el + "<button type=\"button\" class=\"btn btn-primary btn-sm\" data-val=\"" + el + "\" data-col=\"" + columns[i] + "\"><svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-bar-chart-fill\" viewBox=\"0 0 16 16\">\r\n  <path d=\"M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z\"\/>\r\n<\/svg><\/button>";
            } else {
                row[columns[i]] = el;
            }
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

    

    
        renderTickPlots0(additional_headers.length, displayed_columns);
    

    
        linkUrlColumn0(additional_headers.length, displayed_columns, table_rows);
    
        linkUrlColumn1(additional_headers.length, displayed_columns, table_rows);
    

    
        colorizeColumn0(additional_headers.length, displayed_columns);
    

let to_be_highlighted = parseInt(window.location.href.toString().split("highlight=").pop(), 10) + additional_headers.length;
    let rows = $("table > tbody > tr");
    rows.each(function() {
        if (this.dataset.index == to_be_highlighted) {
            $(this).children().addClass('active-row');
            $('#table').bootstrapTable('scrollTo', {unit: 'rows', value: to_be_highlighted})
        }
    });

    $( window ).resize(function() {
        var he = $( window ).height() - 150;
        $('#table').bootstrapTable('resetView',{height: he});
    })
});

function renderMarkdownDescription() {
    var innerDescription = document.getElementById('innerDescription');
    var converter = new showdown.Converter();
    converter.setFlavor('github');
    innerDescription.innerHTML = converter.makeHtml(innerDescription.dataset.markdown);
}




function renderTickPlots0(ah, columns) {
    let index = columns.indexOf("imdbRating") + 1;
    var specs =  {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 50,
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
                "offset": -20
            }
        },
        "y": {"value": 0, "scale": {"domain": [0, 1]}}
    },
    "layer": [
        {"mark": "tick"},
        {
        "mark": {"type": "text", "yOffset": -8, "xOffset": 12},
        "encoding": {"text": {"field": "imdbRating"}}
        }
    ],
    "config": {
        "tick": {"thickness": 2},
        "background": null,
        "style": {"cell": {"stroke": "transparent"}}
    }
};
    let row = 0;
    $(`table > tbody > tr td:nth-child(${index})`).each(
        function() {
            if (row < ah) {
                row++;
                return;
            }
            var id = `imdbrating-${row}`;
            this.classList.add("plotcell");
            const div = document.createElement("div");
            value = this.innerHTML;
            this.innerHTML = "";
            this.appendChild(div);
            var data = [{"imdbRating": value}];
            var s = specs;
            s.data = {};
            s.data.values = data;
            var opt = {"actions": false};
            vegaEmbed(div, JSON.parse(JSON.stringify(s)), opt);
            row++;
        }
    );
}



function colorizeColumn0(ah, columns) {
    let index = columns.indexOf("Rated") + 1;
    var ordinal = vega.scale('ordinal');
    var scale = ordinal().domain(["TV-G","Unrated","Passed","PG-13","R","Approved","Not Rated","M/PG","G","TV-MA","PG","N/A","M"]).range(vega.scheme('accent'));
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



    function linkUrlColumn0(ah, columns, table_rows) {
        let index = columns.indexOf("Title") + 1;
        let link_url = "https://de.wikipedia.org/wiki/{value}";
        let row = 0;
        $(`table > tbody > tr td:nth-child(${index})`).each(
            function() {
                if (row < ah) {
                    row++;
                    return;
                }
                value = this.innerHTML;
                link = link_url.replaceAll("{value}", value);
                for (column of columns) {
                link = link.replaceAll(`{${column}}`, table_rows[row][column]);
                }
                this.innerHTML = `<a href='${link}' target='_blank' >${value}</a>`;
                row++;
            }
        );
    }

    function linkUrlColumn1(ah, columns, table_rows) {
        let index = columns.indexOf("imdbID") + 1;
        let link_url = "https://www.imdb.com/title/{value}/";
        let row = 0;
        $(`table > tbody > tr td:nth-child(${index})`).each(
            function() {
                if (row < ah) {
                    row++;
                    return;
                }
                value = this.innerHTML;
                link = link_url.replaceAll("{value}", value);
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


let show_plot_2 = true;
let plot_2 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"R","value":57},{"key":"PG-13","value":27},{"key":"PG","value":25},{"key":"Passed","value":23},{"key":"Approved","value":19},{"key":"Not Rated","value":11},{"key":"G","value":8},{"key":"Unrated","value":7},{"key":"N/A","value":2},{"key":"M/PG","value":2}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "Rated"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

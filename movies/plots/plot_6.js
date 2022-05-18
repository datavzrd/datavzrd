let show_plot_6 = true;
let plot_6 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"William Wyler","value":7},{"key":"George Cukor","value":5},{"key":"James L. Brooks","value":3},{"key":"Milos Forman","value":3},{"key":"Daniel Mann","value":3},{"key":"Jonathan Demme","value":3},{"key":"Martin Scorsese","value":3},{"key":"Victor Fleming","value":2},{"key":"Fred Zinnemann","value":2},{"key":"Woody Allen","value":2}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "Director"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

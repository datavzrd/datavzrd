let show_plot_3 = true;
let plot_3 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"Katharine Hepburn","value":4},{"key":"Daniel Day-Lewis","value":3},{"key":"Tom Hanks","value":2},{"key":"Dustin Hoffman","value":2},{"key":"Sean Penn","value":2},{"key":"Luise Rainer","value":2},{"key":"Jack Nicholson","value":2},{"key":"Ingrid Bergman","value":2},{"key":"Gary Cooper","value":2},{"key":"Jane Fonda","value":2}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "name"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

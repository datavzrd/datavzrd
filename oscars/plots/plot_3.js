let show_plot_3 = true;
let plot_3 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"Katharine Hepburn","value":4},{"key":"Daniel Day-Lewis","value":3},{"key":"Meryl Streep","value":2},{"key":"Tom Hanks","value":2},{"key":"Sally Field","value":2},{"key":"Hilary Swank","value":2},{"key":"Sean Penn","value":2},{"key":"Frances McDormand","value":2},{"key":"Vivien Leigh","value":2},{"key":"Marlon Brando","value":2}]},
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

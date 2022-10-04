let show_plot_4 = true;
let plot_4 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"Coming Home","value":2},{"key":"The Silence of the Lambs","value":2},{"key":"It Happened One Night","value":2},{"key":"Network","value":2},{"key":"On Golden Pond","value":2},{"key":"Captains Courageous","value":1},{"key":"Rain Man","value":1},{"key":"High Noon","value":1},{"key":"Disraeli","value":1},{"key":"One Flew Over The Cuckoo's Nest","value":1}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "movie"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

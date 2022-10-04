let show_plot_0 = true;
let plot_0 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"The Silence of the Lambs","value":2},{"key":"Network","value":2},{"key":"Coming Home","value":2},{"key":"It Happened One Night","value":2},{"key":"On Golden Pond","value":2},{"key":"All the King's Men","value":1},{"key":"Mystic River","value":1},{"key":"Mary Poppins","value":1},{"key":"Two Women","value":1},{"key":"Monster's Ball","value":1}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "Title"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

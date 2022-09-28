let show_plot_0 = true;
let plot_0 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"Network","value":2},{"key":"The Silence of the Lambs","value":2},{"key":"On Golden Pond","value":2},{"key":"Coming Home","value":2},{"key":"It Happened One Night","value":2},{"key":"Still Alice","value":1},{"key":"Kramer vs. Kramer","value":1},{"key":"The Private Life of Henry VIII","value":1},{"key":"One Flew Over The Cuckoo's Nest","value":1},{"key":"Tender Mercies","value":1}]},
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

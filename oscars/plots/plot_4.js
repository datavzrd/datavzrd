let show_plot_4 = true;
let plot_4 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"The Silence of the Lambs","value":2},{"key":"On Golden Pond","value":2},{"key":"It Happened One Night","value":2},{"key":"Network","value":2},{"key":"Coming Home","value":2},{"key":"I Want to Live!","value":1},{"key":"My Fair Lady","value":1},{"key":"Who's Afraid of Virginia Woolf","value":1},{"key":"Charly","value":1},{"key":"Kung Fu Ghandi","value":1}]},
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

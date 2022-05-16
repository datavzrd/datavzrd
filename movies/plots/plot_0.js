let show_plot_0 = true;
let plot_0 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"Coming Home","value":2},{"key":"Network","value":2},{"key":"The Silence of the Lambs","value":2},{"key":"It Happened One Night","value":2},{"key":"On Golden Pond","value":2},{"key":"Blue Jasmine","value":1},{"key":"The Last King of Scotland","value":1},{"key":"La La Land","value":1},{"key":"Who's Afraid of Virginia Woolf","value":1},{"key":"Boys Town","value":1}]},
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

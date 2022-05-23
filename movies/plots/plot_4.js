let show_plot_4 = true;
let plot_4 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"111 min","value":7},{"key":"114 min","value":6},{"key":"122 min","value":6},{"key":"118 min","value":6},{"key":"105 min","value":6},{"key":"108 min","value":5},{"key":"112 min","value":4},{"key":"110 min","value":4},{"key":"120 min","value":4},{"key":"128 min","value":4}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "Runtime"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

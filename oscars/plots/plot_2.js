let show_plot_2 = false;
let plot_2 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": null},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "award"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

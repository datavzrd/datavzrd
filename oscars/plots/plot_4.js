let show_plot_4 = true;
let plot_4 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"It Happened One Night","value":2},{"key":"The Silence of the Lambs","value":2},{"key":"On Golden Pond","value":2},{"key":"Coming Home","value":2},{"key":"Network","value":2},{"key":"Blue Sky","value":1},{"key":"The Queen","value":1},{"key":"7th Heaven","value":1},{"key":"Guess Who's Coming to Dinner","value":1},{"key":"Anastasia","value":1}]},
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

let show_plot_4 = true;
let plot_4 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"On Golden Pond","value":2},{"key":"Coming Home","value":2},{"key":"Network","value":2},{"key":"It Happened One Night","value":2},{"key":"The Silence of the Lambs","value":2},{"key":"Blue Jasmine","value":1},{"key":"Who's Afraid of Virginia Woolf","value":1},{"key":"The Prime of Miss Jean Brodie","value":1},{"key":"The Sin of Madelon Claudet","value":1},{"key":"Come Back, Little Sheba","value":1}]},
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

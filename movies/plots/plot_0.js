let show_plot_0 = true;
let plot_0 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"The Silence of the Lambs","value":2},{"key":"Coming Home","value":2},{"key":"Network","value":2},{"key":"On Golden Pond","value":2},{"key":"It Happened One Night","value":2},{"key":"The Private Life of Henry VIII","value":1},{"key":"In the Heat of the Night","value":1},{"key":"Crazy Heart","value":1},{"key":"The Three Faces of Eve","value":1},{"key":"Black Swan","value":1}]},
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

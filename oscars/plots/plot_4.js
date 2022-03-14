let show_plot_4 = true;
let plot_4 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"Network","value":2},{"key":"On Golden Pond","value":2},{"key":"Coming Home","value":2},{"key":"It Happened One Night","value":2},{"key":"The Silence of the Lambs","value":2},{"key":"The Last King of Scotland","value":1},{"key":"Manchester by the Sea","value":1},{"key":"A Touch of Class","value":1},{"key":"The Champ","value":1},{"key":"Coal Miner's Daughter","value":1}]},
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

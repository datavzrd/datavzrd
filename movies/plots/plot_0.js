let show_plot_0 = true;
let plot_0 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"It Happened One Night","value":2},{"key":"Network","value":2},{"key":"Coming Home","value":2},{"key":"The Silence of the Lambs","value":2},{"key":"On Golden Pond","value":2},{"key":"Coal Miner's Daughter","value":1},{"key":"The Accused","value":1},{"key":"Room at the Top","value":1},{"key":"Captains Courageous","value":1},{"key":"The Bridge on the River Kwai","value":1}]},
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

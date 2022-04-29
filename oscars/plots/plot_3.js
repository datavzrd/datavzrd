let show_plot_3 = true;
let plot_3 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"Katharine Hepburn","value":4},{"key":"Daniel Day-Lewis","value":3},{"key":"Jodie Foster","value":2},{"key":"Sally Field","value":2},{"key":"Bette Davis","value":2},{"key":"Jane Fonda","value":2},{"key":"Luise Rainer","value":2},{"key":"Fredric March","value":2},{"key":"Meryl Streep","value":2},{"key":"Glenda Jackson","value":2}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "name"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

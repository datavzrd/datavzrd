let show_plot_1 = true;
let plot_1 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"1997","value":4},{"key":"2010","value":4},{"key":"1979","value":3},{"key":"1990","value":3},{"key":"1996","value":3},{"key":"1931","value":3},{"key":"1960","value":3},{"key":"1968","value":3},{"key":"2006","value":3},{"key":"1986","value":3}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "Year"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

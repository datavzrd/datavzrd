let show_plot_7 = true;
let plot_7 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"1907-05-12","value":4},{"key":"1957-04-29","value":3},{"key":"1900-04-05","value":2},{"key":"1910-01-12","value":2},{"key":"1901-05-07","value":2},{"key":"1956-07-09","value":2},{"key":"1908-04-05","value":2},{"key":"1937-12-21","value":2},{"key":"1924-04-03","value":2},{"key":"1962-11-19","value":2}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "birth date"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

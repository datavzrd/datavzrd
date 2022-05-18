let show_plot_5 = true;
let plot_5 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"key":"Drama","value":30},{"key":"Drama, Romance","value":24},{"key":"Comedy, Drama, Romance","value":12},{"key":"Biography, Drama, History","value":8},{"key":"Biography, Drama, Music","value":8},{"key":"Biography, Drama","value":8},{"key":"Comedy, Romance","value":6},{"key":"Drama, Thriller","value":5},{"key":"Crime, Drama","value":5},{"key":"Biography, Crime, Drama","value":4}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "key",
                    "sort": {"field": "value", "order": "descending"},
                    "title": "Genre"
                },
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        }
    ]
};

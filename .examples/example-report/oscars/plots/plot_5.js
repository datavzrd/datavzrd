let show_plot_5 = true;
let plot_5 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"bin_end":21.0,"bin_start":null,"value":0},{"bin_end":23.950000762939453,"bin_start":21.0,"value":3},{"bin_end":26.899999618530273,"bin_start":23.950000762939453,"value":14},{"bin_end":29.850000381469727,"bin_start":26.899999618530273,"value":16},{"bin_end":32.79999923706055,"bin_start":29.850000381469727,"value":16},{"bin_end":35.75,"bin_start":32.79999923706055,"value":24},{"bin_end":38.70000076293945,"bin_start":35.75,"value":21},{"bin_end":41.650001525878906,"bin_start":38.70000076293945,"value":22},{"bin_end":44.599998474121094,"bin_start":41.650001525878906,"value":16},{"bin_end":47.54999923706055,"bin_start":44.599998474121094,"value":11},{"bin_end":50.5,"bin_start":47.54999923706055,"value":10},{"bin_end":53.45000076293945,"bin_start":50.5,"value":7},{"bin_end":56.400001525878906,"bin_start":53.45000076293945,"value":7},{"bin_end":59.349998474121094,"bin_start":56.400001525878906,"value":1},{"bin_end":62.29999923706055,"bin_start":59.349998474121094,"value":12},{"bin_end":65.25,"bin_start":62.29999923706055,"value":1},{"bin_end":68.19999694824219,"bin_start":65.25,"value":0},{"bin_end":71.1500015258789,"bin_start":68.19999694824219,"value":0},{"bin_end":74.0999984741211,"bin_start":71.1500015258789,"value":1},{"bin_end":77.05000305175781,"bin_start":74.0999984741211,"value":1},{"bin_end":80.0,"bin_start":77.05000305175781,"value":0},{"bin_end":null,"bin_start":80.0,"value":1}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "bin_start",
                    "bin": "binned",
                    "title": "age"
                },
                "x2": {"field": "bin_end"},
                "y": {"field": "value", "type": "quantitative", "title": null}
            }
        },
        {
            "data": {
                "values":[]
            },
            "mark": "rule",
            "encoding": {
                "x": {"field": "bin_start", "bin": "binned"},
                "color": {"value": "red"}
            }
        }
    ]
};

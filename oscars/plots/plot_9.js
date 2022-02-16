let show_plot_9 = true;
let plot_9 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"bin_end":1.0,"bin_start":null,"value":0},{"bin_end":2.5,"bin_start":1.0,"value":11},{"bin_end":4.0,"bin_start":2.5,"value":5},{"bin_end":5.5,"bin_start":4.0,"value":18},{"bin_end":7.0,"bin_start":5.5,"value":8},{"bin_end":8.5,"bin_start":7.0,"value":15},{"bin_end":10.0,"bin_start":8.5,"value":9},{"bin_end":11.5,"bin_start":10.0,"value":5},{"bin_end":13.0,"bin_start":11.5,"value":10},{"bin_end":14.5,"bin_start":13.0,"value":8},{"bin_end":16.0,"bin_start":14.5,"value":4},{"bin_end":17.5,"bin_start":16.0,"value":8},{"bin_end":19.0,"bin_start":17.5,"value":2},{"bin_end":20.5,"bin_start":19.0,"value":14},{"bin_end":22.0,"bin_start":20.5,"value":5},{"bin_end":23.5,"bin_start":22.0,"value":15},{"bin_end":25.0,"bin_start":23.5,"value":5},{"bin_end":26.5,"bin_start":25.0,"value":11},{"bin_end":28.0,"bin_start":26.5,"value":4},{"bin_end":29.5,"bin_start":28.0,"value":16},{"bin_end":31.0,"bin_start":29.5,"value":7},{"bin_end":null,"bin_start":31.0,"value":4}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "bin_start",
                    "bin": "binned",
                    "title": "birth_d"
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

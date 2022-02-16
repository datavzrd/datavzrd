let show_plot_0 = true;
let plot_0 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"bin_end":1.0,"bin_start":null,"value":0},{"bin_end":5.5,"bin_start":1.0,"value":11},{"bin_end":10.0,"bin_start":5.5,"value":8},{"bin_end":14.5,"bin_start":10.0,"value":10},{"bin_end":19.0,"bin_start":14.5,"value":8},{"bin_end":23.5,"bin_start":19.0,"value":10},{"bin_end":28.0,"bin_start":23.5,"value":8},{"bin_end":32.5,"bin_start":28.0,"value":10},{"bin_end":37.0,"bin_start":32.5,"value":8},{"bin_end":41.5,"bin_start":37.0,"value":11},{"bin_end":46.0,"bin_start":41.5,"value":8},{"bin_end":50.5,"bin_start":46.0,"value":10},{"bin_end":55.0,"bin_start":50.5,"value":8},{"bin_end":59.5,"bin_start":55.0,"value":10},{"bin_end":64.0,"bin_start":59.5,"value":8},{"bin_end":68.5,"bin_start":64.0,"value":10},{"bin_end":73.0,"bin_start":68.5,"value":8},{"bin_end":77.5,"bin_start":73.0,"value":10},{"bin_end":82.0,"bin_start":77.5,"value":8},{"bin_end":86.5,"bin_start":82.0,"value":10},{"bin_end":91.0,"bin_start":86.5,"value":8},{"bin_end":null,"bin_start":91.0,"value":2}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "bin_start",
                    "bin": "binned",
                    "title": "oscar_no"
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

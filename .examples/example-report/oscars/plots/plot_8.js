let show_plot_8 = true;
let plot_8 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"bin_end":1.0,"bin_start":null,"value":0},{"bin_end":1.5499999523162842,"bin_start":1.0,"value":17},{"bin_end":2.0999999046325684,"bin_start":1.5499999523162842,"value":8},{"bin_end":2.6500000953674316,"bin_start":2.0999999046325684,"value":0},{"bin_end":3.200000047683716,"bin_start":2.6500000953674316,"value":13},{"bin_end":3.75,"bin_start":3.200000047683716,"value":0},{"bin_end":4.300000190734863,"bin_start":3.75,"value":27},{"bin_end":4.849999904632568,"bin_start":4.300000190734863,"value":0},{"bin_end":5.400000095367432,"bin_start":4.849999904632568,"value":18},{"bin_end":5.949999809265137,"bin_start":5.400000095367432,"value":0},{"bin_end":6.5,"bin_start":5.949999809265137,"value":10},{"bin_end":7.050000190734863,"bin_start":6.5,"value":19},{"bin_end":7.599999904632568,"bin_start":7.050000190734863,"value":0},{"bin_end":8.149999618530273,"bin_start":7.599999904632568,"value":16},{"bin_end":8.699999809265137,"bin_start":8.149999618530273,"value":0},{"bin_end":9.25,"bin_start":8.699999809265137,"value":12},{"bin_end":9.800000190734863,"bin_start":9.25,"value":0},{"bin_end":10.350000381469727,"bin_start":9.800000190734863,"value":14},{"bin_end":10.899999618530273,"bin_start":10.350000381469727,"value":0},{"bin_end":11.449999809265137,"bin_start":10.899999618530273,"value":14},{"bin_end":12.0,"bin_start":11.449999809265137,"value":0},{"bin_end":null,"bin_start":12.0,"value":16}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "bin_start",
                    "bin": "binned",
                    "title": "birth_mo"
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

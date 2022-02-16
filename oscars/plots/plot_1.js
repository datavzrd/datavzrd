let show_plot_1 = true;
let plot_1 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"bin_end":1929.0,"bin_start":null,"value":0},{"bin_end":1933.5,"bin_start":1929.0,"value":11},{"bin_end":1938.0,"bin_start":1933.5,"value":8},{"bin_end":1942.5,"bin_start":1938.0,"value":10},{"bin_end":1947.0,"bin_start":1942.5,"value":8},{"bin_end":1951.5,"bin_start":1947.0,"value":10},{"bin_end":1956.0,"bin_start":1951.5,"value":8},{"bin_end":1960.5,"bin_start":1956.0,"value":10},{"bin_end":1965.0,"bin_start":1960.5,"value":8},{"bin_end":1969.5,"bin_start":1965.0,"value":11},{"bin_end":1974.0,"bin_start":1969.5,"value":8},{"bin_end":1978.5,"bin_start":1974.0,"value":10},{"bin_end":1983.0,"bin_start":1978.5,"value":8},{"bin_end":1987.5,"bin_start":1983.0,"value":10},{"bin_end":1992.0,"bin_start":1987.5,"value":8},{"bin_end":1996.5,"bin_start":1992.0,"value":10},{"bin_end":2001.0,"bin_start":1996.5,"value":8},{"bin_end":2005.5,"bin_start":2001.0,"value":10},{"bin_end":2010.0,"bin_start":2005.5,"value":8},{"bin_end":2014.5,"bin_start":2010.0,"value":10},{"bin_end":2019.0,"bin_start":2014.5,"value":8},{"bin_end":null,"bin_start":2019.0,"value":2}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "bin_start",
                    "bin": "binned",
                    "title": "oscar_yr"
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

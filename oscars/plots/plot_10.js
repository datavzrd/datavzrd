let show_plot_10 = true;
let plot_10 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"bin_end":1868.0,"bin_start":null,"value":0},{"bin_end":1874.0999755859375,"bin_start":1868.0,"value":2},{"bin_end":1880.199951171875,"bin_start":1874.0999755859375,"value":1},{"bin_end":1886.300048828125,"bin_start":1880.199951171875,"value":3},{"bin_end":1892.4000244140625,"bin_start":1886.300048828125,"value":3},{"bin_end":1898.5,"bin_start":1892.4000244140625,"value":5},{"bin_end":1904.5999755859375,"bin_start":1898.5,"value":13},{"bin_end":1910.699951171875,"bin_start":1904.5999755859375,"value":20},{"bin_end":1916.800048828125,"bin_start":1910.699951171875,"value":16},{"bin_end":1922.9000244140625,"bin_start":1916.800048828125,"value":9},{"bin_end":1929.0,"bin_start":1922.9000244140625,"value":12},{"bin_end":1935.0999755859375,"bin_start":1929.0,"value":15},{"bin_end":1941.199951171875,"bin_start":1935.0999755859375,"value":14},{"bin_end":1947.300048828125,"bin_start":1941.199951171875,"value":12},{"bin_end":1953.4000244140625,"bin_start":1947.300048828125,"value":10},{"bin_end":1959.5,"bin_start":1953.4000244140625,"value":12},{"bin_end":1965.5999755859375,"bin_start":1959.5,"value":12},{"bin_end":1971.699951171875,"bin_start":1965.5999755859375,"value":7},{"bin_end":1977.800048828125,"bin_start":1971.699951171875,"value":12},{"bin_end":1983.9000244140625,"bin_start":1977.800048828125,"value":3},{"bin_end":1990.0,"bin_start":1983.9000244140625,"value":2},{"bin_end":null,"bin_start":1990.0,"value":1}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "bin_start",
                    "bin": "binned",
                    "title": "birth_y"
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

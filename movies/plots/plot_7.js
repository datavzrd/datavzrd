let show_plot_7 = true;
let plot_7 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": "container",
    "layer": [
        {
            "data": {"values": [{"bin_end":5.099999904632568,"bin_start":null,"value":0},{"bin_end":5.304999828338623,"bin_start":5.099999904632568,"value":1},{"bin_end":5.509999752044678,"bin_start":5.304999828338623,"value":0},{"bin_end":5.714999675750732,"bin_start":5.509999752044678,"value":3},{"bin_end":5.920000076293945,"bin_start":5.714999675750732,"value":0},{"bin_end":6.125,"bin_start":5.920000076293945,"value":1},{"bin_end":6.329999923706055,"bin_start":6.125,"value":1},{"bin_end":6.534999847412109,"bin_start":6.329999923706055,"value":6},{"bin_end":6.739999771118164,"bin_start":6.534999847412109,"value":5},{"bin_end":6.944999694824219,"bin_start":6.739999771118164,"value":5},{"bin_end":7.149999618530273,"bin_start":6.944999694824219,"value":10},{"bin_end":7.354999542236328,"bin_start":7.149999618530273,"value":23},{"bin_end":7.559999465942383,"bin_start":7.354999542236328,"value":29},{"bin_end":7.764999866485596,"bin_start":7.559999465942383,"value":31},{"bin_end":7.96999979019165,"bin_start":7.764999866485596,"value":24},{"bin_end":8.175000190734863,"bin_start":7.96999979019165,"value":29},{"bin_end":8.380000114440918,"bin_start":8.175000190734863,"value":7},{"bin_end":8.585000038146973,"bin_start":8.380000114440918,"value":2},{"bin_end":8.789999961853027,"bin_start":8.585000038146973,"value":5},{"bin_end":8.994999885559082,"bin_start":8.789999961853027,"value":1},{"bin_end":9.199999809265137,"bin_start":8.994999885559082,"value":0},{"bin_end":null,"bin_start":9.199999809265137,"value":1}]},
            "mark": "bar",
            "encoding": {
                "x": {
                    "field": "bin_start",
                    "bin": "binned",
                    "title": "imdbRating"
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

const heatmap_plot = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "values": []
    },
    "hconcat": [
        
        {
            "mark": "text",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'Title'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "text": {
                    "field": "Title",
                    "type": "nominal",
                    "title": "Title",
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        },
        
        {
            "mark": "text",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'Year'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "text": {
                    "field": "Year",
                    "type": "quantitative",
                    "title": "Year",
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        },
        
        {
            "mark": "rect",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'Rated'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "color": {
                    "field": "Rated",
                    "type": "nominal",
                    "title": "Rated",
                    "scale": {
                        "domain": ["Unrated","Passed","PG-13","R","Approved","Not Rated","M/PG","G","TV-MA","PG","N/A","M"],
                        "type": "ordinal",
                        "scheme": "accent",
                        
                    },
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        },
        
        {
            "mark": "text",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'Released'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "text": {
                    "field": "Released",
                    "type": "nominal",
                    "title": "Released",
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        },
        
        {
            "mark": "text",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'Runtime'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "text": {
                    "field": "Runtime",
                    "type": "nominal",
                    "title": "Runtime",
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        },
        
        {
            "mark": "text",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'Genre'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "text": {
                    "field": "Genre",
                    "type": "nominal",
                    "title": "Genre",
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        },
        
        {
            "mark": "text",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'Director'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "text": {
                    "field": "Director",
                    "type": "nominal",
                    "title": "Director",
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        },
        
        {
            "mark": "rect",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'imdbRating'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "color": {
                    "field": "imdbRating",
                    "type": "quantitative",
                    "title": "imdbRating",
                    "scale": {
                        "domain": [1.0,10.0],
                        "type": "linear",
                        "scheme": "blues",
                        
                    },
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        },
        
        {
            "mark": "text",
            "encoding": {
                "x": {
                "field": "dummy",
                    "axis": {
                        "labelExpr": "'imdbID'",
                        "labelAngle": -45,
                        "title": null,
                        "ticks": false,
                        "orient": "top",
                        "domain": false
                    }
                },
                "y": {
                    "field": "index",
                    "type": "ordinal",
                    "axis": null,
                },
                "text": {
                    "field": "imdbID",
                    "type": "nominal",
                    "title": "imdbID",
                    "legend": {
                        "orient": "bottom",
                        "direction": "vertical",
                        "gradientLength": 50
                    }
                }
            }
        }
        
    ],
    "config": {
        "style": {"cell": {"stroke": "transparent"}, "guide-label": {"fontWeight": "bold"}},
        "concat": {"spacing": 4},
        "text": {"limit": 135}
    }
}
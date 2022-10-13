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
                        "labelExpr": "'oscar_yr'",
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
                    "field": "oscar_yr",
                    "type": "quantitative",
                    "title": "oscar_yr",
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
                        "labelExpr": "'award'",
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
                    "field": "award",
                    "type": "nominal",
                    "title": "award",
                    "scale": {
                        "domain": ["Best actor","Best actress"],
                        "type": "ordinal",
                        
                        "range": ["#add8e6","#ffb6c1"],
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
                        "labelExpr": "'name'",
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
                    "field": "name",
                    "type": "nominal",
                    "title": "name",
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
                        "labelExpr": "'movie'",
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
                    "field": "movie",
                    "type": "nominal",
                    "title": "movie",
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
                        "labelExpr": "'age'",
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
                    "field": "age",
                    "type": "quantitative",
                    "title": "age",
                    "scale": {
                        "domain": [20.0,100.0],
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
                        "labelExpr": "'birth place'",
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
                    "field": "birth place",
                    "type": "nominal",
                    "title": "birth place",
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
                        "labelExpr": "'birth date'",
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
                    "field": "birth date",
                    "type": "nominal",
                    "title": "birth date",
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
                        "labelExpr": "'birth_mo'",
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
                    "field": "birth_mo",
                    "type": "quantitative",
                    "title": "birth_mo",
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
                        "labelExpr": "'birth_d'",
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
                    "field": "birth_d",
                    "type": "quantitative",
                    "title": "birth_d",
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
                        "labelExpr": "'birth_y'",
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
                    "field": "birth_y",
                    "type": "quantitative",
                    "title": "birth_y",
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
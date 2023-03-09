const heatmap_plot = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "values": []
    },
    "hconcat": [
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'year'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        
                    }
                }
            }
            
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "rect",
                    "align":"left",
                    "width": 72
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'award'",
                            "labelAngle": -90,
                            
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
                        "legend": null
                    }
                }
            }
            ,
            {
                "mark": {
                    "type": "text",
                    "align":"left",
                    "xOffset": -6
                },
                "encoding": {
                    "text": {"field": "award"},
                    "y": {
                        "field": "index",
                        "type": "ordinal",
                        "axis": null,
                    }
                }
            }
        
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'name'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        
                    }
                }
            }
            
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'movie'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        
                    }
                }
            }
            
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "rect",
                    "align":"left",
                    "width": 20
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'age'",
                            "labelAngle": -90,
                            
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
                        "legend": null
                    }
                }
            }
            ,
            {
                "mark": {
                    "type": "text",
                    "align":"left",
                    "xOffset": -6
                },
                "encoding": {
                    "text": {"field": "age"},
                    "y": {
                        "field": "index",
                        "type": "ordinal",
                        "axis": null,
                    }
                }
            }
        
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'birth place'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        
                    }
                }
            }
            
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'birth date'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        
                    }
                }
            }
            
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'birth_mo'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        
                    }
                }
            }
            
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'birth_d'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        
                    }
                }
            }
            
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'birth_y'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        
                    }
                }
            }
            
        ]},
        
        {
            
            "layer": [
            
            {
                "mark": {
                    "type": "text",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'overall_wins_and_overall_nominations'",
                            "labelAngle": -90,
                            "labelOffset": 7,
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
                        "field": "overall_wins_and_overall_nominations",
                        "type": "nominal",
                        "title": "overall_wins_and_overall_nominations",
                        
                    }
                }
            }
            
        ]}
        
    ],
    "config": {
        "style": {"cell": {"stroke": "transparent"}, "guide-label": {"fontWeight": "bold"}},
        "concat": {"spacing": 0},
        "text": {"limit": 135}
    }
}
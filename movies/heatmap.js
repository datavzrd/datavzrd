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
                            "labelExpr": "'Title'",
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
                        "field": "Title",
                        "type": "nominal",
                        "title": "Title",
                        
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
                            "labelExpr": "'Year'",
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
                        "field": "Year",
                        "type": "quantitative",
                        "title": "Year",
                        
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
                            "labelExpr": "'Rated'",
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
                        "field": "Rated",
                        "type": "nominal",
                        "title": "Rated",
                        "scale": {
                            "domain": [],
                            "type": "ordinal",
                            "scheme": "tableau20",
                            
                            
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
                    "text": {"field": "Rated"},
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
                            "labelExpr": "'Released'",
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
                        "field": "Released",
                        "type": "nominal",
                        "title": "Released",
                        
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
                            "labelExpr": "'Runtime'",
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
                        "field": "Runtime",
                        "type": "nominal",
                        "title": "Runtime",
                        
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
                            "labelExpr": "'Genre'",
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
                        "field": "Genre",
                        "type": "nominal",
                        "title": "Genre",
                        
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
                            "labelExpr": "'Director'",
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
                        "field": "Director",
                        "type": "nominal",
                        "title": "Director",
                        
                    }
                }
            }
            
        ]},
        
        {
            "width": 50,
            "layer": [
            {
                "mark": {
                    "type": "bar",
                    "align":"left"
                },
                "encoding": {
                    "x": {
                        "field": "imdbRating",
                        "type": "quantitative",
                        "axis": null
                    },
                    "y": {
                        "field": "index",
                        "type": "ordinal",
                        "axis": null,
                    },
                    "color": {"value": "#6baed6"},
                    "axis": null,
                    "legend": {"title": null}
                }
            },
            
            {
                "mark": {
                    "type": "text",
                    "align":"left",
                    "xOffset": -20
                },
                "encoding": {
                    "x": {
                        "field": "dummy",
                        "axis": {
                            "labelExpr": "'imdbRating'",
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
                    "text": {
                        "field": "imdbRating",
                        "type": "quantitative",
                        "title": "imdbRating",
                        "legend": null
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
                            "labelExpr": "'imdbID'",
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
                        "field": "imdbID",
                        "type": "nominal",
                        "title": "imdbID",
                        
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
const config={"aux_domains":{"age":[],"award":[]},"bar_titles":[],"bars":[],"brush_domains":{"age":[20.0,100.0]},"column_config":{"age":{"is_float":false,"label":null,"precision":2},"award":{"is_float":false,"label":null,"precision":2},"birth date":{"is_float":false,"label":null,"precision":2},"birth place":{"is_float":false,"label":null,"precision":2},"birth_d":{"is_float":false,"label":null,"precision":2},"birth_mo":{"is_float":false,"label":null,"precision":2},"birth_y":{"is_float":false,"label":null,"precision":2},"movie":{"is_float":false,"label":null,"precision":2},"name":{"is_float":false,"label":null,"precision":2},"oscar_no":{"is_float":false,"label":null,"precision":2},"oscar_yr":{"is_float":false,"label":"year","precision":2},"overall_wins_and_overall_nominations":{"is_float":false,"label":null,"precision":2}},"columns":["oscar_no","oscar_yr","award","name","movie","age","birth place","birth date","birth_mo","birth_d","birth_y","overall_wins_and_overall_nominations"],"custom_plot_titles":["overall_wins_and_overall_nominations"],"detail_mode":true,"displayed_columns":["oscar_yr","award","name","movie","age","birth place","birth date"],"displayed_numeric_columns":["birth_mo","age","birth_d","oscar_yr","oscar_no","birth_y"],"ellipsis":[],"format":{},"header_label_length":0,"heatmap_titles":["award"],"heatmaps":[{"domain":["Best actor","Best actress"],"heatmap":{"aux_domain_columns":[],"clamp":true,"color_scheme":"","custom_content":null,"domain":["Best actor","Best actress"],"range":["#add8e6","#ffb6c1"],"scale":"ordinal"},"slug_title":"award","title":"award"}],"hidden_columns":["oscar_no"],"is_single_page":true,"link_urls":[{"links":[{"link":{"new_window":true,"url":"https://de.wikipedia.org/wiki/{value}"},"name":"Wikipedia"}],"title":"movie"},{"links":[{"link":{"new_window":true,"url":"https://lmgtfy.app/?q=Is {name} in {movie}?"},"name":"lmgtfy"}],"title":"name"}],"links":["movie","name"],"page_size":25,"tick_titles":["age"],"ticks":[{"slug_title":"age","specs":{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","config":{"background":null,"style":{"cell":{"stroke":"transparent"}},"tick":{"thickness":2}},"encoding":{"x":{"axis":{"grid":false,"labels":false,"offset":-11,"ticks":false,"title":null},"field":"age","scale":{"domain":[20.0,100.0],"type":"linear"},"type":"quantitative"},"y":{"scale":{"domain":[0,1]},"value":0}},"height":10,"layer":[{"mark":"tick"},{"encoding":{"text":{"field":"age"},"x":{"value":0}},"mark":{"type":"text","xOffset":12,"yOffset":-8}}],"width":50},"title":"age"}],"webview_controls":true,"webview_host":"https://datavzrd.github.io/view/"};const custom_plots=[{"data_function":"custom_func_bdeb9ccd63a6f2944da7a80b24245f51","specs":{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"values":[]},"encoding":{"color":{"field":"category","scale":{"domain":["nominations","wins"],"range":["#f2e34c","#31a354"]},"type":"nominal"},"theta":{"field":"amount","type":"quantitative"},"tooltip":[{"field":"category","type":"nominal"},{"field":"amount","type":"quantitative"}]},"mark":"arc"},"title":"overall_wins_and_overall_nominations","vega_controls":false}];const header_config={"ellipsis":[],"headers":[],"heatmaps":[]}
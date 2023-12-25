const config={"additional_colums":{"birth_season":`custom_func_681872f53fef3af326344cd4b9202655`},"aux_domains":{"age":[],"award":[]},"bar_titles":[],"bars":[],"brush_domains":{"age":[20,100]},"column_config":{"age":{"is_float":!1,"label":null,"precision":2},"award":{"is_float":!1,"label":null,"precision":2},"birth date":{"is_float":!1,"label":null,"precision":2},"birth place":{"is_float":!1,"label":null,"precision":2},"birth_d":{"is_float":!1,"label":null,"precision":2},"birth_mo":{"is_float":!1,"label":null,"precision":2},"birth_season":{"is_float":!1,"label":null,"precision":0},"birth_y":{"is_float":!1,"label":null,"precision":2},"movie":{"is_float":!1,"label":null,"precision":2},"name":{"is_float":!1,"label":null,"precision":2},"oscar_no":{"is_float":!1,"label":null,"precision":2},"oscar_yr":{"is_float":!1,"label":`year`,"precision":2},"overall_wins_and_overall_nominations":{"is_float":!1,"label":null,"precision":2}},"columns":[`oscar_no`,`oscar_yr`,`award`,`name`,`movie`,`age`,`birth place`,`birth date`,`birth_mo`,`birth_d`,`birth_y`,`overall_wins_and_overall_nominations`,`birth_season`],"custom_plot_titles":[`overall_wins_and_overall_nominations`],"detail_mode":!0,"displayed_columns":[`oscar_yr`,`award`,`name`,`movie`,`age`,`birth place`,`birth date`,`birth_season`],"displayed_numeric_columns":[`oscar_yr`,`age`,`birth_mo`,`oscar_no`,`birth_y`,`birth_d`],"ellipsis":[],"format":{},"header_label_length":0,"heatmap_titles":[`award`],"heatmaps":[{"domain":[`Best actor`,`Best actress`],"heatmap":{"aux_domain_columns":[],"clamp":!0,"color_scheme":``,"custom_content":null,"domain":[`Best actor`,`Best actress`],"domain_mid":null,"range":[`#add8e6`,`#ffb6c1`],"scale":`ordinal`,"type":null},"slug_title":`award`,"title":`award`}],"hidden_columns":[`oscar_no`],"is_single_page":!0,"link_urls":[{"custom_content":null,"links":[{"link":{"new_window":!0,"url":`https://de.wikipedia.org/wiki/{value}`},"name":`Wikipedia`}],"title":`movie`},{"custom_content":null,"links":[{"link":{"new_window":!0,"url":`https://lmgtfy.app/?q=Is {name} in {movie}?`},"name":`lmgtfy`}],"title":`name`}],"links":[`movie`,`name`],"page_size":25,"tick_titles":[`age`],"ticks":[{"slug_title":`age`,"specs":{"$schema":`https://vega.github.io/schema/vega-lite/v5.json`,"config":{"background":null,"style":{"cell":{"stroke":`transparent`}},"tick":{"thickness":2}},"encoding":{"x":{"axis":{"grid":!1,"labels":!1,"offset":-11,"ticks":!1,"title":null},"field":`age`,"scale":{"domain":[20,100],"type":`linear`},"type":`quantitative`},"y":{"scale":{"domain":[0,1]},"value":0}},"height":10,"layer":[{"mark":`tick`},{"encoding":{"text":{"field":`age`},"x":{"value":0}},"mark":{"type":`text`,"xOffset":12,"yOffset":-8}}],"width":50},"title":`age`}],"unique_column_values":{"age":43,"award":2,"birth date":158,"birth place":51,"birth_d":31,"birth_mo":12,"birth_y":86,"movie":179,"name":158,"oscar_no":91,"oscar_yr":91,"overall_wins_and_overall_nominations":26},"webview_controls":!0,"webview_host":`https://datavzrd.github.io/view/`};const custom_plots=[{"data_function":`custom_func_bdeb9ccd63a6f2944da7a80b24245f51`,"specs":{"$schema":`https://vega.github.io/schema/vega-lite/v5.json`,"data":{"values":[]},"encoding":{"color":{"field":`category`,"scale":{"domain":[`nominations`,`wins`],"range":[`#f2e34c`,`#31a354`]},"type":`nominal`},"theta":{"field":`amount`,"type":`quantitative`},"tooltip":[{"field":`category`,"type":`nominal`},{"field":`amount`,"type":`quantitative`}]},"mark":`arc`},"title":`overall_wins_and_overall_nominations`,"vega_controls":!1}];const header_config={"ellipsis":[],"headers":[],"heatmaps":[]}
const config={"detail_mode":!0,"webview_controls":!0,"webview_host":`https://datavzrd.github.io/view/`,"is_single_page":!0,"page_size":25,"columns":[`oscar_no`,`oscar_yr`,`award`,`name`,`movie`,`age`,`birth place`,`birth date`,`birth_mo`,`birth_d`,`birth_y`,`overall_wins_and_overall_nominations`,`birth_season`],"displayed_columns":[`oscar_yr`,`award`,`name`,`movie`,`age`,`birth place`,`birth date`,`birth_season`],"hidden_columns":[`oscar_no`],"displayed_numeric_columns":[`age`,`birth_mo`,`birth_d`,`birth_y`,`oscar_yr`,`oscar_no`],"tick_titles":[`age`],"bar_titles":[],"heatmap_titles":[`award`],"custom_plot_titles":[`overall_wins_and_overall_nominations`],"links":[`movie`,`name`],"column_config":{"award":{"label":null,"is_float":!1,"precision":2},"age":{"label":null,"is_float":!1,"precision":2},"birth_d":{"label":null,"is_float":!1,"precision":2},"overall_wins_and_overall_nominations":{"label":`overall wins and nominations`,"is_float":!1,"precision":2},"birth_season":{"label":null,"is_float":!1,"precision":0},"birth_mo":{"label":null,"is_float":!1,"precision":2},"oscar_yr":{"label":`year`,"is_float":!1,"precision":2},"birth date":{"label":null,"is_float":!1,"precision":2},"movie":{"label":null,"is_float":!1,"precision":2},"birth_y":{"label":null,"is_float":!1,"precision":2},"name":{"label":null,"is_float":!1,"precision":2},"birth place":{"label":null,"is_float":!1,"precision":2},"oscar_no":{"label":null,"is_float":!1,"precision":2}},"header_label_length":0,"ticks":[{"title":`age`,"slug_title":`age`,"specs":{"$schema":`https://vega.github.io/schema/vega-lite/v5.json`,"width":50,"height":10,"encoding":{"x":{"field":`age`,"type":`quantitative`,"scale":{"type":`linear`,"domain":[20,100]},"axis":{"title":null,"ticks":!1,"labels":!1,"grid":!1,"offset":-11}},"y":{"value":0,"scale":{"domain":[0,1]}}},"layer":[{"mark":`tick`},{"mark":{"type":`text`,"yOffset":-8,"xOffset":12},"encoding":{"x":{"value":0},"text":{"field":`age`}}}],"config":{"tick":{"thickness":2},"background":null,"style":{"cell":{"stroke":`transparent`}}}}}],"bars":[],"heatmaps":[{"title":`award`,"slug_title":`award`,"heatmap":{"type":null,"scale":`ordinal`,"clamp":!0,"color_scheme":``,"range":[`#add8e6`,`#ffb6c1`],"domain":[`Best actor`,`Best actress`],"domain_mid":null,"aux_domain_columns":[],"custom_content":null},"domain":[`Best actor`,`Best actress`]}],"brush_domains":{"age":[20,100]},"aux_domains":{"age":[],"award":[]},"link_urls":[{"title":`movie`,"links":[{"name":`Wikipedia`,"link":{"url":`https://en.wikipedia.org/wiki/{value}`,"new_window":!0}}],"custom_content":null},{"title":`name`,"links":[{"name":`lmgtfy`,"link":{"url":`https://www.google.com/search?q={name}`,"new_window":!0}}],"custom_content":null}],"ellipsis":[],"format":{},"additional_colums":{"birth_season":`custom_func_681872f53fef3af326344cd4b9202655`},"unique_column_values":{"birth place":51,"birth_y":86,"overall_wins_and_overall_nominations":26,"oscar_yr":91,"movie":179,"name":158,"oscar_no":91,"award":2,"birth date":158,"birth_mo":12,"birth_d":31,"age":43},"pages":1,"view_sizes":{"oscars":`184 rows`,"movies":`184 rows`},"tables":[`movies`,`movies-plot`,`oscar-plot`,`oscars`],"default_view":`oscars`,"has_excel_sheet":!0,"description":`### All winning oscars beginning in the year 1929.
This table contains *all* winning oscars for best actress and best actor.
`,"report_name":`My oscar report`,"time":`Mon Dec  9 16:20:06 2024`,"version":`2.44.4`,"title":`oscars`};const custom_plots=[{"title":`overall_wins_and_overall_nominations`,"specs":{"$schema":`https://vega.github.io/schema/vega-lite/v5.json`,"data":{"values":[]},"mark":`arc`,"encoding":{"theta":{"field":`amount`,"type":`quantitative`},"color":{"field":`category`,"type":`nominal`,"scale":{"domain":[`nominations`,`wins`],"range":[`#f2e34c`,`#31a354`]}},"tooltip":[{"field":`category`,"type":`nominal`},{"field":`amount`,"type":`quantitative`}]}},"data_function":`custom_func_bdeb9ccd63a6f2944da7a80b24245f51`,"vega_controls":!1}];const header_config={"headers":[],"heatmaps":[],"ellipsis":[]}
const config={"detail_mode":!0,"webview_controls":!0,"webview_host":`https://datavzrd.github.io/view/`,"is_single_page":!0,"page_size":25,"columns":[`oscar_no`,`oscar_yr`,`award`,`name`,`movie`,`age`,`birth place`,`birth date`,`birth_mo`,`birth_d`,`birth_y`,`overall_wins_and_overall_nominations`,`birth_season`],"displayed_columns":[`oscar_yr`,`award`,`name`,`movie`,`age`,`birth place`,`birth date`,`birth_season`],"hidden_columns":[`oscar_no`],"displayed_numeric_columns":[`oscar_no`,`age`,`birth_y`,`birth_mo`,`birth_d`,`oscar_yr`],"tick_titles":[],"bar_titles":[],"heatmap_titles":[`award`,`age`],"custom_plot_titles":[`overall_wins_and_overall_nominations`],"links":[`movie`,`name`],"column_config":{"overall_wins_and_overall_nominations":{"label":`overall wins and nominations`,"is_float":!1,"precision":2},"birth_mo":{"label":null,"is_float":!1,"precision":2},"birth_season":{"label":null,"is_float":!1,"precision":0},"award":{"label":null,"is_float":!1,"precision":2},"age":{"label":null,"is_float":!1,"precision":2},"oscar_yr":{"label":`year`,"is_float":!1,"precision":2},"name":{"label":null,"is_float":!1,"precision":2},"birth_d":{"label":null,"is_float":!1,"precision":2},"birth_y":{"label":null,"is_float":!1,"precision":2},"birth place":{"label":null,"is_float":!1,"precision":2},"movie":{"label":null,"is_float":!1,"precision":2},"birth date":{"label":null,"is_float":!1,"precision":2},"oscar_no":{"label":null,"is_float":!1,"precision":2}},"header_label_length":0,"ticks":[],"bars":[],"heatmaps":[{"title":`award`,"slug_title":`award`,"heatmap":{"type":null,"scale":`ordinal`,"clamp":!0,"color_scheme":``,"range":[`#add8e6`,`#ffb6c1`],"domain":[`Best actor`,`Best actress`],"domain_mid":null,"aux_domain_columns":[],"custom_content":null},"domain":[`Best actor`,`Best actress`]},{"title":`age`,"slug_title":`age`,"heatmap":{"type":null,"scale":`linear`,"clamp":!0,"color_scheme":``,"range":[`#a1d99b`,`white`,`#fdae6b`],"domain":[`0`,`0.05`,`0.25`],"domain_mid":null,"aux_domain_columns":null,"custom_content":null},"domain":[`0`,`0.05`,`0.25`]}],"brush_domains":{"age":[0,0.05000000074505806,0.25]},"aux_domains":{"award":[]},"link_urls":[{"title":`movie`,"links":[{"name":`Wikipedia`,"link":{"url":`https://de.wikipedia.org/wiki/{value}`,"new_window":!0}}],"custom_content":null},{"title":`name`,"links":[{"name":`lmgtfy`,"link":{"url":`https://letmegooglethat.com/?q=Is {name} in {movie}?`,"new_window":!0}}],"custom_content":null}],"ellipsis":[],"format":{},"additional_colums":{"birth_season":`custom_func_681872f53fef3af326344cd4b9202655`},"unique_column_values":{"oscar_yr":91,"name":158,"age":43,"birth place":51,"birth_y":86,"movie":179,"oscar_no":91,"birth date":158,"birth_mo":12,"award":2,"birth_d":31,"overall_wins_and_overall_nominations":26},"pages":1,"view_sizes":{"oscars":`184 rows`,"movies":`184 rows`},"tables":[`movies`,`movies-plot`,`oscar-plot`,`oscars`],"default_view":`oscars`,"has_excel_sheet":!0,"description":`### All winning oscars beginning in the year 1929.
This table contains *all* winning oscars for best actress and best actor.
`,"report_name":`My oscar report`,"time":`Fri Sep 27 15:50:48 2024`,"version":`2.42.1`,"title":`oscars`};const custom_plots=[{"title":`overall_wins_and_overall_nominations`,"specs":{"$schema":`https://vega.github.io/schema/vega-lite/v5.json`,"data":{"values":[]},"mark":`arc`,"encoding":{"theta":{"field":`amount`,"type":`quantitative`},"color":{"field":`category`,"type":`nominal`,"scale":{"domain":[`nominations`,`wins`],"range":[`#f2e34c`,`#31a354`]}},"tooltip":[{"field":`category`,"type":`nominal`},{"field":`amount`,"type":`quantitative`}]}},"data_function":`custom_func_bdeb9ccd63a6f2944da7a80b24245f51`,"vega_controls":!1}];const header_config={"headers":[],"heatmaps":[],"ellipsis":[]}
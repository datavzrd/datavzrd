const config={"detail_mode":!1,"webview_controls":!0,"webview_host":`https://datavzrd.github.io/view/`,"is_single_page":!0,"page_size":20,"columns":[`Title`,`Year`,`Rated`,`Released`,`Runtime`,`Genre`,`Director`,`imdbRating`,`imdbID`],"displayed_columns":[`Title`,`Year`,`Rated`,`Released`,`Runtime`,`Genre`,`Director`,`imdbRating`,`imdbID`],"hidden_columns":[],"displayed_numeric_columns":[`imdbRating`,`Year`],"tick_titles":[],"bar_titles":[`imdbRating`],"heatmap_titles":[`Rated`],"pill_titles":[`Genre`],"custom_plot_titles":[],"links":[`Title`,`imdbID`],"column_config":{"Runtime":{"label":null,"is_float":!1,"precision":2},"Rated":{"label":null,"is_float":!1,"precision":2},"imdbRating":{"label":null,"is_float":!0,"precision":1},"Year":{"label":null,"is_float":!1,"precision":2},"Director":{"label":null,"is_float":!1,"precision":2},"Released":{"label":null,"is_float":!1,"precision":2},"Genre":{"label":null,"is_float":!1,"precision":2},"imdbID":{"label":null,"is_float":!1,"precision":2},"Title":{"label":null,"is_float":!1,"precision":2}},"header_label_length":0,"ticks":[],"bars":[{"title":`imdbRating`,"slug_title":`imdbrating`,"specs":{"$schema":`https://vega.github.io/schema/vega-lite/v5.json`,"width":50,"height":10,"encoding":{"x":{"field":`imdbRating`,"type":`quantitative`,"scale":{"type":`linear`,"domain":[1,10]},"axis":null},"y":{"value":0,"scale":{"domain":[0,1]}}},"layer":[{"mark":{"type":`bar`,"height":12,"yOffset":11},"encoding":{"color":{"scale":{"type":`linear`,"range":[`#d62728`,`#2ca02c`],"domain":[1,10]},"field":`imdbRating`,"legend":null,"type":`quantitative`}}},{"mark":{"type":`text`,"yOffset":11,"xOffset":12},"encoding":{"x":{"value":0},"text":{"field":`imdbRating`},"color":{"value":`black`}}}],"config":{"background":null,"style":{"cell":{"stroke":`transparent`}}}}}],"heatmaps":[{"title":`Rated`,"slug_title":`rated`,"heatmap":{"scale":`ordinal`,"clamp":!0,"color-scheme":`tableau20`,"range":[],"domain":[`Approved`,`G`,`M`,`M/PG`,`N/A`,`Not Rated`,`PG`,`PG-13`,`Passed`,`R`,`TV-MA`,`Unrated`],"aux-domain-columns":[]},"domain":[`Approved`,`G`,`M`,`M/PG`,`N/A`,`Not Rated`,`PG`,`PG-13`,`Passed`,`R`,`TV-MA`,`Unrated`]}],"pills":[{"title":`Genre`,"slug_title":`genre`,"pills":{"separator":`,`,"color-scheme":`category20`,"range":[],"domain":[`Action`,`Adventure`,`Animation`,`Biography`,`Comedy`,`Crime`,`Drama`,`Family`,`Fantasy`,`Film-Noir`,`History`,`Horror`,`Music`,`Musical`,`Mystery`,`Romance`,`Sci-Fi`,`Short`,`Sport`,`Thriller`,`War`,`Western`],"ellipsis":5,"aux-domain-columns":[]}}],"brush_domains":{},"aux_domains":{"Rated":[]},"link_urls":[{"title":`Title`,"links":[{"name":`Wikipedia`,"link":{"url":`https://en.wikipedia.org/wiki/{value}`,"new-window":!0}},{"name":`Letterboxd`,"link":{"url":`https://letterboxd.com/search/{value}`,"new-window":!1}}],"custom_content":null},{"title":`imdbID`,"links":[{"name":`IMDB`,"link":{"url":`https://www.imdb.com/title/{value}/`,"new-window":!0}}],"custom_content":null}],"ellipsis":[{"title":`Director`,"ellipsis":40}],"format":{"Runtime":`custom_func_25c0740391f9f68757894e517ef35361`},"additional_colums":{},"unique_column_values":{"Director":143,"imdbID":177,"Year":92,"Released":175,"Runtime":74,"Rated":12,"imdbRating":30,"Genre":60,"Title":179},"pages":1,"view_sizes":{"movies":`184 rows`,"oscars":`184 rows`},"tables":[`movies`,`movies-plot`,`oscar-plot`,`oscars`],"default_view":null,"has_excel_sheet":!0,"description":null,"report_name":`My oscar report`,"time":`Wed Feb 26 07:47:01 2025`,"version":`2.52.0`,"title":`movies`};const custom_plots=[];const header_config={"headers":[],"heatmaps":[],"ellipsis":[]}
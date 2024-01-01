const config={"additional_colums":{},"aux_domains":{"Rated":[]},"bar_titles":[`imdbRating`],"bars":[{"slug_title":`imdbrating`,"specs":{"$schema":`https://vega.github.io/schema/vega-lite/v5.json`,"config":{"background":null,"style":{"cell":{"stroke":`transparent`}}},"encoding":{"x":{"axis":null,"field":`imdbRating`,"scale":{"domain":[1,10],"type":`linear`},"type":`quantitative`},"y":{"scale":{"domain":[0,1]},"value":0}},"height":10,"layer":[{"encoding":{"color":{"field":`imdbRating`,"legend":null,"scale":{"domain":[1,10],"range":[`#d62728`,`#2ca02c`],"type":`linear`},"type":`quantitative`}},"mark":{"height":12,"type":`bar`,"yOffset":11}},{"encoding":{"color":{"value":`black`},"text":{"field":`imdbRating`},"x":{"value":0}},"mark":{"type":`text`,"xOffset":12,"yOffset":11}}],"width":50},"title":`imdbRating`}],"brush_domains":{},"column_config":{"Director":{"is_float":!1,"label":null,"precision":2},"Genre":{"is_float":!1,"label":null,"precision":2},"Rated":{"is_float":!1,"label":null,"precision":2},"Released":{"is_float":!1,"label":null,"precision":2},"Runtime":{"is_float":!1,"label":null,"precision":2},"Title":{"is_float":!1,"label":null,"precision":2},"Year":{"is_float":!1,"label":null,"precision":2},"imdbID":{"is_float":!1,"label":null,"precision":2},"imdbRating":{"is_float":!0,"label":null,"precision":1}},"columns":[`Title`,`Year`,`Rated`,`Released`,`Runtime`,`Genre`,`Director`,`imdbRating`,`imdbID`],"custom_plot_titles":[],"detail_mode":!1,"displayed_columns":[`Title`,`Year`,`Rated`,`Released`,`Runtime`,`Genre`,`Director`,`imdbRating`,`imdbID`],"displayed_numeric_columns":[`Year`,`imdbRating`],"ellipsis":[{"ellipsis":15,"title":`Genre`}],"format":{"Runtime":`custom_func_25c0740391f9f68757894e517ef35361`},"header_label_length":0,"heatmap_titles":[`Rated`],"heatmaps":[{"domain":[`Approved`,`G`,`M`,`M/PG`,`N/A`,`Not Rated`,`PG`,`PG-13`,`Passed`,`R`,`TV-MA`,`Unrated`],"heatmap":{"aux_domain_columns":[],"clamp":!0,"color_scheme":`tableau20`,"custom_content":null,"domain":[`Approved`,`G`,`M`,`M/PG`,`N/A`,`Not Rated`,`PG`,`PG-13`,`Passed`,`R`,`TV-MA`,`Unrated`],"domain_mid":null,"range":[],"scale":`ordinal`,"type":null},"slug_title":`rated`,"title":`Rated`}],"hidden_columns":[],"is_single_page":!0,"link_urls":[{"custom_content":null,"links":[{"link":{"new_window":!0,"url":`https://www.imdb.com/title/{value}/`},"name":`IMDB`}],"title":`imdbID`},{"custom_content":null,"links":[{"link":{"new_window":!1,"url":`https://letterboxd.com/search/{value}`},"name":`Letterboxd`},{"link":{"new_window":!0,"url":`https://de.wikipedia.org/wiki/{value}`},"name":`Wikipedia`}],"title":`Title`}],"links":[`imdbID`,`Title`],"page_size":20,"tick_titles":[],"ticks":[],"unique_column_values":{"Director":143,"Genre":60,"Rated":12,"Released":175,"Runtime":74,"Title":179,"Year":92,"imdbID":177,"imdbRating":30},"webview_controls":!0,"webview_host":`https://datavzrd.github.io/view/`};const custom_plots=[];const header_config={"ellipsis":[],"headers":[],"heatmaps":[]}
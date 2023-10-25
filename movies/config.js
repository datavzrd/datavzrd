const config={"aux_domains":{"Rated":[]},"bar_titles":["imdbRating"],"bars":[{"slug_title":"imdbrating","specs":{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","config":{"background":null,"style":{"cell":{"stroke":"transparent"}}},"encoding":{"color":{"value":"#6baed6"},"x":{"axis":null,"field":"imdbRating","scale":{"domain":[1.0,10.0],"type":"linear"},"type":"quantitative"},"y":{"scale":{"domain":[0,1]},"value":0}},"height":10,"layer":[{"mark":{"height":12,"type":"bar","yOffset":11}},{"encoding":{"color":{"value":"black"},"text":{"field":"imdbRating"},"x":{"value":0}},"mark":{"type":"text","xOffset":12,"yOffset":11}}],"width":50},"title":"imdbRating"}],"brush_domains":{},"column_config":{"Director":{"is_float":false,"label":null,"precision":2},"Genre":{"is_float":false,"label":null,"precision":2},"Rated":{"is_float":false,"label":null,"precision":2},"Released":{"is_float":false,"label":null,"precision":2},"Runtime":{"is_float":false,"label":null,"precision":2},"Title":{"is_float":false,"label":null,"precision":2},"Year":{"is_float":false,"label":null,"precision":2},"imdbID":{"is_float":false,"label":null,"precision":2},"imdbRating":{"is_float":true,"label":null,"precision":1}},"columns":["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"],"custom_plot_titles":[],"detail_mode":false,"displayed_columns":["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"],"displayed_numeric_columns":["Year","imdbRating"],"ellipsis":[{"ellipsis":15,"title":"Genre"}],"format":{"Runtime":"custom_func_25c0740391f9f68757894e517ef35361"},"header_label_length":0,"heatmap_titles":["Rated"],"heatmaps":[{"domain":["Approved","G","M","M/PG","N/A","Not Rated","PG","PG-13","Passed","R","TV-MA","Unrated"],"heatmap":{"aux_domain_columns":[],"clamp":true,"color_scheme":"tableau20","custom_content":null,"domain":["Approved","G","M","M/PG","N/A","Not Rated","PG","PG-13","Passed","R","TV-MA","Unrated"],"range":[],"scale":"ordinal","type":null},"slug_title":"rated","title":"Rated"}],"hidden_columns":[],"is_single_page":true,"link_urls":[{"links":[{"link":{"new_window":true,"url":"https://de.wikipedia.org/wiki/{value}"},"name":"Wikipedia"},{"link":{"new_window":false,"url":"https://letterboxd.com/search/{value}"},"name":"Letterboxd"}],"title":"Title"},{"links":[{"link":{"new_window":true,"url":"https://www.imdb.com/title/{value}/"},"name":"IMDB"}],"title":"imdbID"}],"links":["Title","imdbID"],"page_size":20,"tick_titles":[],"ticks":[],"webview_controls":true,"webview_host":"https://datavzrd.github.io/view/"};const custom_plots=[];const header_config={"ellipsis":[],"headers":[],"heatmaps":[]}
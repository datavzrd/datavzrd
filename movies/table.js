$(document).ready(function(){$('.table-container').show();$('.loading').hide();$('#pagination').show();$(function(){$('[data-toggle="tooltip"]').tooltip()});$(function(){$('[data-toggle="popover"]').popover()});$('.modal').on('shown.bs.modal',function(){window.dispatchEvent(new Event('resize'))});var a=JSON.parse(LZString.decompressFromUTF16(data));if(linkouts!=null){var b=JSON.parse(LZString.decompressFromUTF16(linkouts))};var c={"Runtime":function B(C,D){const E=parseInt(C.split(' ')[0]);const F=Math.floor(E/60);const G=E%60;return `${F}h ${G}m`}};let j=[{field:'Title',title:'Title\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_0\" onclick=\"if (show_plot_0) {vegaEmbed(\'#plot_0\', plot_0)} else {document.getElementById(\'plot_0\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["Title"]!=undefined){return c["Title"](B,C,D,E)}else{return B}}},{field:'Year',title:'Year\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_1\" onclick=\"if (show_plot_1) {vegaEmbed(\'#plot_1\', plot_1)} else {document.getElementById(\'plot_1\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["Year"]!=undefined){return c["Year"](B,C,D,E)}else{return B}}},{field:'Rated',title:'Rated\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_2\" onclick=\"if (show_plot_2) {vegaEmbed(\'#plot_2\', plot_2)} else {document.getElementById(\'plot_2\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["Rated"]!=undefined){return c["Rated"](B,C,D,E)}else{return B}}},{field:'Released',title:'Released\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_3\" onclick=\"if (show_plot_3) {vegaEmbed(\'#plot_3\', plot_3)} else {document.getElementById(\'plot_3\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["Released"]!=undefined){return c["Released"](B,C,D,E)}else{return B}}},{field:'Runtime',title:'Runtime\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_4\" onclick=\"if (show_plot_4) {vegaEmbed(\'#plot_4\', plot_4)} else {document.getElementById(\'plot_4\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["Runtime"]!=undefined){return c["Runtime"](B,C,D,E)}else{return B}}},{field:'Genre',title:'Genre\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_5\" onclick=\"if (show_plot_5) {vegaEmbed(\'#plot_5\', plot_5)} else {document.getElementById(\'plot_5\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["Genre"]!=undefined){return c["Genre"](B,C,D,E)}else{return B}}},{field:'Director',title:'Director\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_6\" onclick=\"if (show_plot_6) {vegaEmbed(\'#plot_6\', plot_6)} else {document.getElementById(\'plot_6\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["Director"]!=undefined){return c["Director"](B,C,D,E)}else{return B}}},{field:'imdbRating',title:'imdbRating\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_7\" onclick=\"if (show_plot_7) {vegaEmbed(\'#plot_7\', plot_7)} else {document.getElementById(\'plot_7\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["imdbRating"]!=undefined){return c["imdbRating"](B,C,D,E)}else{return precision_formatter(1,B)}}},{field:'imdbID',title:'imdbID\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_8\" onclick=\"if (show_plot_8) {vegaEmbed(\'#plot_8\', plot_8)} else {document.getElementById(\'plot_8\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(B,C,D,E){if(c["imdbID"]!=undefined){return c["imdbID"](B,C,D,E)}else{return B}}}];if(linkouts!=null){j.push({field:'linkouts',title:'',formatter:function(B){return B}})};$('#table').bootstrapTable({columns:j,pagination:true,pageSize:100,data:[]});let k="";let l=["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];let m=["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];let n=[false,true,false,false,false,false,false,true,false];let o=[false,true,false,false,false,false,false,true,false];let p=[];let q=["imdbRating"];let r=[];let s=["Title","imdbID"];var d=(80+ 6*Math.max(...(m.map(B=>B.length)))*Math.SQRT2)/2+ 45;$('th').css("height",d);var e=[];var f=0;for(const B of a){var g=0;row={};for(const C of B){row[l[g]]=C;g++};if(linkouts!=null){row["linkouts"]=b[f]};f++;e.push(row)};$("#btnHeatmap").on("click",function(){var B=0;var C=JSON.parse(JSON.stringify(e));for(const D of C){if(D.hasOwnProperty('linkouts'))delete D['linkouts'];D.index=B;B++};heatmap_plot.data.values=C;vegaEmbed('#heatmap-plot',heatmap_plot)});$('#table').find('thead').append(k);$('#table').bootstrapTable('append',e);$('#table').on('expand-row.bs.table',(B,C,D,E)=>{let F=[];let G=[];let H=["imdbRating"];let I=["Rated"];let J=["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];colorizeDetailCard0(D[I[0]],`#heatmap-${C}-0`);renderDetailBarPlots0(D[H[0]],`#detail-plot-${C}-bars-0`)});window.addEventListener('beforeprint',B=>{setTimeout(function(){$('#table').bootstrapTable('togglePagination');render(k,m,e,l);$('th').css("height",d- 15);if(s.length>0){$(`table > tbody > tr td:last-child`).each(function(){this.style.setProperty("display","none")});$("table > thead > tr th:last-child").css("display","none")}},0)});$(".btn-sm").click(function(){var B=$(this).data("col");var C=$(this).data("val").toString();if(C.startsWith("<div")){var D=$(C);C=D[0].dataset.value};var E={"bin_start":C};var F=l.indexOf(B);switch(F){case 0:if(plot_0["layer"].length>1){$('#modal_0').modal();var G=JSON.parse(JSON.stringify(plot_0));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_0',G)};break;case 1:if(plot_1["layer"].length>1){$('#modal_1').modal();var G=JSON.parse(JSON.stringify(plot_1));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_1',G)};break;case 2:if(plot_2["layer"].length>1){$('#modal_2').modal();var G=JSON.parse(JSON.stringify(plot_2));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_2',G)};break;case 3:if(plot_3["layer"].length>1){$('#modal_3').modal();var G=JSON.parse(JSON.stringify(plot_3));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_3',G)};break;case 4:if(plot_4["layer"].length>1){$('#modal_4').modal();var G=JSON.parse(JSON.stringify(plot_4));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_4',G)};break;case 5:if(plot_5["layer"].length>1){$('#modal_5').modal();var G=JSON.parse(JSON.stringify(plot_5));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_5',G)};break;case 6:if(plot_6["layer"].length>1){$('#modal_6').modal();var G=JSON.parse(JSON.stringify(plot_6));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_6',G)};break;case 7:if(plot_7["layer"].length>1){$('#modal_7').modal();var G=JSON.parse(JSON.stringify(plot_7));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_7',G)};break;case 8:if(plot_8["layer"].length>1){$('#modal_8').modal();var G=JSON.parse(JSON.stringify(plot_8));G["layer"][1]["data"]["values"].push(E);vegaEmbed('#plot_8',G)};break}});addNumClass(o,k.length);render(k,m,e,l);$('#right-top-nav').append($('<div class="btn-group" style="padding-right: 4px;"><span data-toggle="tooltip" data-placement="left" title="Clear filters"><button class="btn btn-outline-secondary" type="button" id="clear-filter"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-funnel" viewBox="0 0 16 16"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button></span></div>'));let t={};let u={};let v={"width":50,"height":12,"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"values":[]},"mark":"tick","encoding":{"tooltip":{"field":"value","type":"quantitative"},"x":{"field":"value","type":"quantitative","scale":{"type":"linear","zero":false},"axis":{"title":null,"orient":"top","labelFontWeight":"lighter"}},"color":{"condition":{"param":"selection","value":"#0275d8"},"value":"grey"}},"params":[{"name":"selection","select":"interval"}],"config":{"axis":{"grid":false},"background":null,"style":{"cell":{"stroke":"transparent"}},"tick":{"thickness":0.5,"bandSize":10}}};let w={};let x={"Rated":[]};function h(B){let E=0;for(title of m){let F=E+ 1;if(o[E]){let G=[];let H=[];for(row of e){G.push({"value":parseFloat(row[title])});H.push(parseFloat(row[title]))};let I=Math.min(...H);let J=Math.max(...H);if(w[title]!=undefined&&p.includes(title)){I=Math.min(...w[title]);J=Math.max(...w[title])}else if(x[title]!=undefined){aux_values=[I,J];for(col of x[title]){for(row of e){aux_values.push(parseFloat(row[col]))}};I=Math.min(...aux_values);J=Math.max(...aux_values)};if(Number.isInteger(I)){I=parseInt(I.toString())};if(Number.isInteger(J)){J=parseInt(J.toString())};let K=I.toString().length+ J.toString().length;var C=v;let L=K<8;C.encoding.x.axis.labels=L;C.data.values=G;C.name=title;C.encoding.x.axis.values=[I,J];C.encoding.x.scale.domain=[I,J];let M="";if(!L){M="no-labels"};if(!B)$(`table > thead > tr th:nth-child(${F})`).append(`<div class="filter-brush-container"><div class="filter-brush ${M}" id="brush-${E}"></div></div>`);var D={"actions":false};vegaEmbed(`#brush-${E}`,JSON.parse(JSON.stringify(C)),D).then(({spec:N,view:O})=>{O.addSignalListener('selection',function(P,Q){t[N.name]=Q});O.addEventListener('mouseup',function(P,Q){$('#table').bootstrapTable('filterBy',{"":""},{'filterAlgorithm':i})})})}else{if(!B){$(`table > thead > tr th:nth-child(${F})`).append(`<input class="form-control form-control-sm" id="filter-${F}" data-title="${title}" placeholder="Filter...">`);$(`#filter-${F}`).on('input',function(G){u[G.target.dataset.title]=$(`#filter-${F}`).val();$('#table').bootstrapTable('filterBy',{"":""},{'filterAlgorithm':i})})}};E++}}h(false);function i(B,C){for(title of m){if(t[title]!==undefined&&!$.isEmptyObject(t[title])){if(B[title]<t[title]['value'][0]||B[title]>t[title]['value'][1]){return false}};if(u[title]!==undefined&&u[title]!==""){if(!B[title].includes(u[title])){return false}}};return true}$('#clear-filter').click(function B(){t={};u={};$('#table').bootstrapTable('filterBy',{"":""},{'filterAlgorithm':i});$('.form-control').each(function(){$(this).val('')});h(true)});$('#table').on('page-change.bs.table',(B,C)=>{setTimeout(function(){render(k,m,e,l)},0)});let y=parseInt(window.location.href.toString().split("highlight=").pop(),10);let z=$('#table').bootstrapTable('getOptions').pageSize;$('#table').bootstrapTable('selectPage',Math.floor(y/z)+ 1);let A=$("table > tbody > tr");A.each(function(){if(this.dataset.index==y){$(this).children().addClass('active-row');$('#table').bootstrapTable('scrollTo',{unit:'rows',value:y%z})}});$(window).resize(function(){var B=$(window).height()- 150})});function renderMarkdownDescription(){var a=document.getElementById('innerDescription');var b=new showdown.Converter();b.setFlavor('github');a.innerHTML=b.makeHtml(a.dataset.markdown)}function precision_formatter(a,b){if(b==""){return ""};b=parseFloat(b);if(1/10**a<Math.abs(b)||b==0){return b.toFixed(a).toString()}else{return b.toExponential(a)}}function renderBarPlots0(a,b){let d=b.indexOf("imdbRating")+ 1;let e=b.indexOf("imdbRating")==-1;var c={"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":50,"height":10,"encoding":{"x":{"field":"imdbRating","type":"quantitative","scale":{"type":"linear","domain":[1,10]},"axis":null},"y":{"value":0,"scale":{"domain":[0,1]}},"color":{"value":"#6baed6"}},"layer":[{"mark":{"type":"bar","height":12,"yOffset":11}},{"mark":{"type":"text","yOffset":11,"xOffset":12},"encoding":{"x":{"value":0},"text":{"field":"imdbRating"},"color":{"value":"black"}}}],"config":{"background":null,"style":{"cell":{"stroke":"transparent"}}}};let f=0;let g=$('#table').bootstrapTable('getData');$(`table > tbody > tr td:nth-child(${d})`).each(function(){var h=`imdbrating-${f}`;this.classList.add("plotcell");const l=document.createElement("div");let m=g[f]["imdbRating"];m=precision_formatter(1,m);if(m!=""&&!e){this.innerHTML="";this.appendChild(l);var i=[{"imdbRating":m}];var j=c;j.data={};j.data.values=i;var k={"actions":false};vegaEmbed(l,JSON.parse(JSON.stringify(j)),k)};f++})}function renderDetailBarPlots0(a,b){var c={"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":50,"height":10,"encoding":{"x":{"field":"imdbRating","type":"quantitative","scale":{"type":"linear","domain":[1,10]},"axis":null},"y":{"value":0,"scale":{"domain":[0,1]}},"color":{"value":"#6baed6"}},"layer":[{"mark":{"type":"bar","height":12,"yOffset":11}},{"mark":{"type":"text","yOffset":11,"xOffset":12},"encoding":{"x":{"value":0},"text":{"field":"imdbRating"},"color":{"value":"black"}}}],"config":{"background":null,"style":{"cell":{"stroke":"transparent"}}}};if(a!=""){var d=[{"imdbRating":a}];var e=c;e.data={};e.data.values=d;var f={"actions":true};vegaEmbed(b,JSON.parse(JSON.stringify(e)),f)}}function colorizeColumn0(a,b){let f=b.indexOf("Rated")==-1;let g=b.indexOf("Rated")+ 1;var c=vega.scale('ordinal');var d=c().domain(["Approved","G","M","M/PG","N/A","Not Rated","PG","PG-13","Passed","R","TV-MA","Unrated"]).range(vega.scheme('accent'));let h=0;var e=$("#table").bootstrapTable('getData',{useCurrentPage:"true"});$(`table > tbody > tr td:nth-child(${g})`).each(function(){var i=e[h]["Rated"];if(i!==""&&!f){this.style.setProperty("background-color",d(i),"important")};h++})}function colorizeDetailCard0(a,b){var c=vega.scale('ordinal');var d=c().domain(["Approved","G","M","M/PG","N/A","Not Rated","PG","PG-13","Passed","R","TV-MA","Unrated"]).range(vega.scheme('accent'));if(a!==""){$(`${b}`).css("background-color",d(a))}}function shortenColumn0(a,b){let c=b.indexOf("Genre")+ 1;let d=0;$(`table > tbody > tr td:nth-child(${c})`).each(function(){value=this.innerHTML;if(value.length>15){this.innerHTML=`${value.substring(0,15)}<a tabindex="0" role="button" href="#" data-toggle="popover" data-trigger="focus" data-html='true' data-content='<div style="overflow: auto; max-height: 30vh; max-width: 25vw;">${value}</div>'>...</a>`};d++})}function linkUrlColumn0(a,b,c){let d=b.indexOf("Title")+ 1;let e="https://de.wikipedia.org/wiki/{value}";let f=$('#table').bootstrapTable('getData');$(`table > tbody > tr td:nth-child(${d})`).each(function(){let g=this.parentElement.dataset.index;let h=f[g]["Title"];let i=e.replaceAll("{value}",h);for(column of c){i=i.replaceAll(`{${column}}`,f[g][column])};this.innerHTML=`<a href='${i}' target='_blank' >${h}</a>`;g++})}function linkUrlColumn1(a,b,c){let d=b.indexOf("imdbID")+ 1;let e="https://www.imdb.com/title/{value}/";let f=$('#table').bootstrapTable('getData');$(`table > tbody > tr td:nth-child(${d})`).each(function(){let g=this.parentElement.dataset.index;let h=f[g]["imdbID"];let i=e.replaceAll("{value}",h);for(column of c){i=i.replaceAll(`{${column}}`,f[g][column])};this.innerHTML=`<a href='${i}' target='_blank' >${h}</a>`;g++})}function embedSearch(a){var b=`search/column_${a}.html`;document.getElementById('search-iframe').setAttribute("src",b)}function addNumClass(a,b){for(let c in a){if(a[c]){let d=0;let e=parseInt(c)+ +1;$(`table > tbody > tr td:nth-child(${e})`).each(function(){this.classList.add("num-cell");d++})}}}function render(a,b,c,d){renderBarPlots0(a.length,b);linkUrlColumn0(a.length,b,d);linkUrlColumn1(a.length,b,d);colorizeColumn0(a.length,b);shortenColumn0(a.length,b);$('[data-toggle="popover"]').popover()}
$(document).ready(function(){$('.table-container').show();$('.loading').hide();$('#pagination').show();$(function(){$('[data-toggle="tooltip"]').tooltip()});$(function(){$('[data-toggle="popover"]').popover()});$('.modal').on('shown.bs.modal',function(){window.dispatchEvent(new Event('resize'))});var a=JSON.parse(LZString.decompressFromUTF16(data));if(linkouts!=null){var b=JSON.parse(LZString.decompressFromUTF16(linkouts))};var c=[];let j=[{field:'Title',title:'Title\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_0\" onclick=\"if (show_plot_0) {vegaEmbed(\'#plot_0\', plot_0)} else {document.getElementById(\'plot_0\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["Title"]!=undefined){return c["Title"](A,B,C,D)}else{return A}}},{field:'Year',title:'Year\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_1\" onclick=\"if (show_plot_1) {vegaEmbed(\'#plot_1\', plot_1)} else {document.getElementById(\'plot_1\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["Year"]!=undefined){return c["Year"](A,B,C,D)}else{return A}}},{field:'Rated',title:'Rated\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_2\" onclick=\"if (show_plot_2) {vegaEmbed(\'#plot_2\', plot_2)} else {document.getElementById(\'plot_2\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["Rated"]!=undefined){return c["Rated"](A,B,C,D)}else{return A}}},{field:'Released',title:'Released\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_3\" onclick=\"if (show_plot_3) {vegaEmbed(\'#plot_3\', plot_3)} else {document.getElementById(\'plot_3\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["Released"]!=undefined){return c["Released"](A,B,C,D)}else{return A}}},{field:'Runtime',title:'Runtime\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_4\" onclick=\"if (show_plot_4) {vegaEmbed(\'#plot_4\', plot_4)} else {document.getElementById(\'plot_4\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["Runtime"]!=undefined){return c["Runtime"](A,B,C,D)}else{return A}}},{field:'Genre',title:'Genre\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_5\" onclick=\"if (show_plot_5) {vegaEmbed(\'#plot_5\', plot_5)} else {document.getElementById(\'plot_5\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["Genre"]!=undefined){return c["Genre"](A,B,C,D)}else{return A}}},{field:'Director',title:'Director\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_6\" onclick=\"if (show_plot_6) {vegaEmbed(\'#plot_6\', plot_6)} else {document.getElementById(\'plot_6\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["Director"]!=undefined){return c["Director"](A,B,C,D)}else{return A}}},{field:'imdbRating',title:'imdbRating\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_7\" onclick=\"if (show_plot_7) {vegaEmbed(\'#plot_7\', plot_7)} else {document.getElementById(\'plot_7\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["imdbRating"]!=undefined){return c["imdbRating"](A,B,C,D)}else{return precision_formatter(1,A)}}},{field:'imdbID',title:'imdbID\r\n                        <a class=\"sym\" data-toggle=\"modal\" data-target=\"#modal_8\" onclick=\"if (show_plot_8) {vegaEmbed(\'#plot_8\', plot_8)} else {document.getElementById(\'plot_8\').innerHTML = \'<p>No reasonable plot possible.</p>\'}\">\r\n                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-bar-chart-fill\" fill=\"currentColor\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n                                <rect width=\"4\" height=\"5\" x=\"1\" y=\"10\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"9\" x=\"6\" y=\"6\" rx=\"1\"\/>\r\n                                <rect width=\"4\" height=\"14\" x=\"11\" y=\"1\" rx=\"1\"\/>\r\n                            <\/svg>\r\n                        <\/a>\r\n                        ',filterControl:"input",formatter:function(A,B,C,D){if(c["imdbID"]!=undefined){return c["imdbID"](A,B,C,D)}else{return A}}}];if(linkouts!=null){j.push({field:'linkouts',title:'',formatter:function(A){return A}})};$('#table').bootstrapTable({columns:j,pagination:true,pageSize:100,data:[]});let k="";let l=["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];let m=["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];let n=[false,true,false,false,false,false,false,true,false];let o=[false,true,false,false,false,false,false,true,false];let p=["imdbRating"];let q=[];let r=["Title","imdbID"];var d=(80+ 6*Math.max(...(m.map(A=>A.length)))*Math.SQRT2)/2+ 45;$('th').css("height",d);var e=[];var f=0;for(const A of a){var g=0;row={};for(const B of A){row[l[g]]=B;g++};if(linkouts!=null){row["linkouts"]=b[f]};f++;e.push(row)};$("#btnHeatmap").on("click",function(){var A=0;var B=JSON.parse(JSON.stringify(e));for(const C of B){if(C.hasOwnProperty('linkouts'))delete C['linkouts'];C.index=A;A++};heatmap_plot.data.values=B;vegaEmbed('#heatmap-plot',heatmap_plot)});$('#table').find('thead').append(k);$('#table').bootstrapTable('append',e);$('#table').on('expand-row.bs.table',(A,B,C,D)=>{let E=[];let F=["imdbRating"];let G=["Rated"];let H=["Title","Year","Rated","Released","Runtime","Genre","Director","imdbRating","imdbID"];colorizeDetailCard0(C[G[0]],`#heatmap-${B}-0`);renderDetailTickPlots0(C[F[0]],`#detail-plot-${B}-ticks-0`)});window.addEventListener('beforeprint',A=>{setTimeout(function(){$('#table').bootstrapTable('togglePagination');render(k,m,e,l);$('th').css("height",d- 15);if(r.length>0){$(`table > tbody > tr td:last-child`).each(function(){this.style.setProperty("display","none")});$("table > thead > tr th:last-child").css("display","none")}},0)});$(".btn-sm").click(function(){var A=$(this).data("col");var B=$(this).data("val").toString();if(B.startsWith("<div")){var C=$(B);B=C[0].dataset.value};var D={"bin_start":B};var E=l.indexOf(A);switch(E){case 0:if(plot_0["layer"].length>1){$('#modal_0').modal();var F=JSON.parse(JSON.stringify(plot_0));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_0',F)};break;case 1:if(plot_1["layer"].length>1){$('#modal_1').modal();var F=JSON.parse(JSON.stringify(plot_1));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_1',F)};break;case 2:if(plot_2["layer"].length>1){$('#modal_2').modal();var F=JSON.parse(JSON.stringify(plot_2));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_2',F)};break;case 3:if(plot_3["layer"].length>1){$('#modal_3').modal();var F=JSON.parse(JSON.stringify(plot_3));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_3',F)};break;case 4:if(plot_4["layer"].length>1){$('#modal_4').modal();var F=JSON.parse(JSON.stringify(plot_4));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_4',F)};break;case 5:if(plot_5["layer"].length>1){$('#modal_5').modal();var F=JSON.parse(JSON.stringify(plot_5));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_5',F)};break;case 6:if(plot_6["layer"].length>1){$('#modal_6').modal();var F=JSON.parse(JSON.stringify(plot_6));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_6',F)};break;case 7:if(plot_7["layer"].length>1){$('#modal_7').modal();var F=JSON.parse(JSON.stringify(plot_7));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_7',F)};break;case 8:if(plot_8["layer"].length>1){$('#modal_8').modal();var F=JSON.parse(JSON.stringify(plot_8));F["layer"][1]["data"]["values"].push(D);vegaEmbed('#plot_8',F)};break}});addNumClass(o,k.length);render(k,m,e,l);$('.btn-group + .bootstrap-select').before($('<div class="btn-group" style="padding-right: 4px;"><button class="btn btn-primary" type="button" id="clear-filter">clear filters</button></div>'));let s={};let t={};let u={"width":50,"height":12,"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"values":[]},"mark":"tick","encoding":{"tooltip":{"field":"value","type":"quantitative"},"x":{"field":"value","type":"quantitative","scale":{"type":"linear","zero":false},"axis":{"title":null,"orient":"top","labelFontWeight":"lighter"}},"color":{"condition":{"param":"selection","value":"#0275d8"},"value":"grey"}},"params":[{"name":"selection","select":"interval"}],"config":{"axis":{"grid":false},"background":null,"style":{"cell":{"stroke":"transparent"}},"tick":{"thickness":0.5,"bandSize":10}}};let v={"imdbRating":[1.0,10.0]};let w={"Rated":[],"imdbRating":[]};function h(A){let D=0;for(title of m){let E=D+ 1;if(o[D]){let F=[];let G=[];for(row of e){F.push({"value":parseFloat(row[title])});G.push(parseFloat(row[title]))};let H=Math.min(...G);let I=Math.max(...G);if(v[title]!=undefined&&p.includes(title)){H=Math.min(...v[title]);I=Math.max(...v[title])}else if(w[title]!=undefined){aux_values=[H,I];for(col of w[title]){for(row of e){aux_values.push(parseFloat(row[col]))}};H=Math.min(...aux_values);I=Math.max(...aux_values)};if(Number.isInteger(H)){H=parseInt(H.toString())};if(Number.isInteger(I)){I=parseInt(I.toString())};let J=H.toString().length+ I.toString().length;var B=u;let K=J<8;B.encoding.x.axis.labels=K;B.data.values=F;B.name=title;B.encoding.x.axis.values=[H,I];B.encoding.x.scale.domain=[H,I];let L="";if(!K){L="no-labels"};if(!A)$(`table > thead > tr th:nth-child(${E})`).append(`<div class="filter-brush-container"><div class="filter-brush ${L}" id="brush-${D}"></div></div>`);var C={"actions":false};vegaEmbed(`#brush-${D}`,JSON.parse(JSON.stringify(B)),C).then(({spec:M,view:N})=>{N.addSignalListener('selection',function(O,P){s[M.name]=P});N.addEventListener('mouseup',function(O,P){$('#table').bootstrapTable('filterBy',{"":""},{'filterAlgorithm':i})})})}else{if(!A){$(`table > thead > tr th:nth-child(${E})`).append(`<input class="form-control form-control-sm" id="filter-${E}" data-title="${title}" placeholder="Filter...">`);$(`#filter-${E}`).on('input',function(F){t[F.target.dataset.title]=$(`#filter-${E}`).val();$('#table').bootstrapTable('filterBy',{"":""},{'filterAlgorithm':i})})}};D++}}h(false);function i(A,B){for(title of m){if(s[title]!==undefined&&!$.isEmptyObject(s[title])){if(A[title]<s[title]['value'][0]||A[title]>s[title]['value'][1]){return false}};if(t[title]!==undefined&&t[title]!==""){if(!A[title].includes(t[title])){return false}}};return true}$('#clear-filter').click(function A(){s={};t={};$('#table').bootstrapTable('filterBy',{"":""},{'filterAlgorithm':i});$('.form-control').each(function(){$(this).val('')});h(true)});$('#table').on('page-change.bs.table',(A,B)=>{setTimeout(function(){render(k,m,e,l)},0)});let x=parseInt(window.location.href.toString().split("highlight=").pop(),10);let y=$('#table').bootstrapTable('getOptions').pageSize;$('#table').bootstrapTable('selectPage',Math.floor(x/y)+ 1);let z=$("table > tbody > tr");z.each(function(){if(this.dataset.index==x){$(this).children().addClass('active-row');$('#table').bootstrapTable('scrollTo',{unit:'rows',value:x%y})}});$(window).resize(function(){var A=$(window).height()- 150})});function renderMarkdownDescription(){var a=document.getElementById('innerDescription');var b=new showdown.Converter();b.setFlavor('github');a.innerHTML=b.makeHtml(a.dataset.markdown)}function precision_formatter(a,b){b=parseFloat(b);if(1/10**a<Math.abs(b)||b==0){return b.toFixed(a).toString()}else{return b.toExponential(a)}}function renderTickPlots0(a,b){let d=b.indexOf("imdbRating")+ 1;let e=b.indexOf("imdbRating")==-1;var c={"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":50,"height":10,"encoding":{"x":{"field":"imdbRating","type":"quantitative","scale":{"type":"linear","domain":[1,10]},"axis":{"title":null,"ticks":false,"labels":false,"grid":false,"offset":-11}},"y":{"value":0,"scale":{"domain":[0,1]}}},"layer":[{"mark":"tick"},{"mark":{"type":"text","yOffset":-8,"xOffset":12},"encoding":{"x":{"value":0},"text":{"field":"imdbRating"}}}],"config":{"tick":{"thickness":2},"background":null,"style":{"cell":{"stroke":"transparent"}}}};let f=0;let g=$('#table').bootstrapTable('getData');$(`table > tbody > tr td:nth-child(${d})`).each(function(){var h=`imdbrating-${f}`;this.classList.add("plotcell");const l=document.createElement("div");let m=g[f]["imdbRating"];m=precision_formatter(1,m);if(m!=""&&!e){this.innerHTML="";this.appendChild(l);var i=[{"imdbRating":m}];var j=c;j.data={};j.data.values=i;var k={"actions":false};vegaEmbed(l,JSON.parse(JSON.stringify(j)),k)};f++})}function renderDetailTickPlots0(a,b){var c={"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":50,"height":10,"encoding":{"x":{"field":"imdbRating","type":"quantitative","scale":{"type":"linear","domain":[1,10]},"axis":{"title":null,"ticks":false,"labels":false,"grid":false,"offset":-11}},"y":{"value":0,"scale":{"domain":[0,1]}}},"layer":[{"mark":"tick"},{"mark":{"type":"text","yOffset":-8,"xOffset":12},"encoding":{"x":{"value":0},"text":{"field":"imdbRating"}}}],"config":{"tick":{"thickness":2},"background":null,"style":{"cell":{"stroke":"transparent"}}}};if(a!=""){var d=[{"imdbRating":a}];var e=c;e.data={};e.data.values=d;var f={"actions":true};vegaEmbed(b,JSON.parse(JSON.stringify(e)),f)}}function colorizeColumn0(a,b){let f=b.indexOf("Rated")==-1;let g=b.indexOf("Rated")+ 1;var c=vega.scale('ordinal');var d=c().domain(["Approved","G","M","M/PG","N/A","Not Rated","PG","PG-13","Passed","R","TV-MA","Unrated"]).range(vega.scheme('accent'));let h=0;var e=$("#table").bootstrapTable('getData',{useCurrentPage:"true"});$(`table > tbody > tr td:nth-child(${g})`).each(function(){var i=e[h]["Rated"];if(i!==""&&!f){this.style.setProperty("background-color",d(i),"important")};h++})}function colorizeDetailCard0(a,b){var c=vega.scale('ordinal');var d=c().domain(["Approved","G","M","M/PG","N/A","Not Rated","PG","PG-13","Passed","R","TV-MA","Unrated"]).range(vega.scheme('accent'));if(a!==""){$(`${b}`).css("background-color",d(a))}}function shortenColumn0(a,b){let c=b.indexOf("Genre")+ 1;let d=0;$(`table > tbody > tr td:nth-child(${c})`).each(function(){value=this.innerHTML;if(value.length>15){this.innerHTML=`${value.substring(0,15)}<a tabindex="0" role="button" href="#" data-toggle="popover" data-trigger="focus" data-html='true' data-content='<div style="overflow: auto; max-height: 30vh; max-width: 25vw;">${value}</div>'>...</a>`};d++})}function linkUrlColumn0(a,b,c){let d=b.indexOf("Title")+ 1;let e="https://de.wikipedia.org/wiki/{value}";let f=$('#table').bootstrapTable('getData');$(`table > tbody > tr td:nth-child(${d})`).each(function(){let g=this.parentElement.dataset.index;let h=f[g]["Title"];let i=e.replaceAll("{value}",h);for(column of c){i=i.replaceAll(`{${column}}`,f[g][column])};this.innerHTML=`<a href='${i}' target='_blank' >${h}</a>`;g++})}function linkUrlColumn1(a,b,c){let d=b.indexOf("imdbID")+ 1;let e="https://www.imdb.com/title/{value}/";let f=$('#table').bootstrapTable('getData');$(`table > tbody > tr td:nth-child(${d})`).each(function(){let g=this.parentElement.dataset.index;let h=f[g]["imdbID"];let i=e.replaceAll("{value}",h);for(column of c){i=i.replaceAll(`{${column}}`,f[g][column])};this.innerHTML=`<a href='${i}' target='_blank' >${h}</a>`;g++})}function embedSearch(a){var b=`search/column_${a}.html`;document.getElementById('search-iframe').setAttribute("src",b)}function addNumClass(a,b){for(let c in a){if(a[c]){let d=0;let e=parseInt(c)+ +1;$(`table > tbody > tr td:nth-child(${e})`).each(function(){this.classList.add("num-cell");d++})}}}function render(a,b,c,d){renderTickPlots0(a.length,b);linkUrlColumn0(a.length,b,d);linkUrlColumn1(a.length,b,d);colorizeColumn0(a.length,b);shortenColumn0(a.length,b);$('[data-toggle="popover"]').popover()}
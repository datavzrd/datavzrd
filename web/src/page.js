export function render_html_contents() {
    let description_html = `
        <div class="row description-box">
            <div class="col-md-12">
                <div class="collapse show" id="collapseDescription">
                    <div class="card card-body description-card-body">
                        <button id="close-description" type="button" data-toggle="collapse" data-target="#collapseDescription" class="close" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <div id="innerDescription" data-markdown="${DESCRIPTION}"></div>
                    </div>
                </div>
            </div>
        </div>`;
    let inner_pagination_html = "";
    if (CURRENT_PAGE > 1) {
        if (CURRENT_PAGE !== 2) {
            inner_pagination_html += `<li class="page-item"><a class="page-link" href="index_1.html">First</a></li><li class="page-item disabled"><a class="page-link" href="">...</a></li>`;
        }
        inner_pagination_html += `<li class="page-item"><a class="page-link" href="index_${CURRENT_PAGE - 1}.html">${CURRENT_PAGE - 1}</a></li>`;
    }
    inner_pagination_html += `<li class="page-item active"><a class="page-link" href="index_${CURRENT_PAGE}.html">${CURRENT_PAGE}</a></li>`;
    if (CURRENT_PAGE < config.pages) {
        inner_pagination_html += `<li class="page-item"><a class="page-link" href="index_${CURRENT_PAGE + 1}.html">${CURRENT_PAGE + 1}</a></li>`;
        if (CURRENT_PAGE !== (config.pages - 1)) {
            inner_pagination_html += `<li class="page-item disabled"><a class="page-link" href="">...</a></li><li class="page-item"><a class="page-link" href="index_${config.pages}.html">Last</a></li>`;
        }
    }
    let pagination_html = `
        <div id="pagination">
            <nav aria-label="page navigation">
                <ul class="pagination justify-content-center">
                    ${inner_pagination_html}
                </ul>
            </nav>
        </div>`;
    if (config.is_single_page) {
        pagination_html = "";
    }
    let report_name_html = "";
    if (REPORT_NAME !== "") {
        report_name_html = `<li class="breadcrumb-item"><div>${REPORT_NAME}</div></li>`;
    }
    let selection_html = "";
    if (config.default_view) {
        selection_html += `<option value="../${config.default_view}/index_1.html" data-content="${config.default_view} ${config.view_sizes[config.default_view] ? `<span class='badge badge-light'>${config.view_sizes[config.default_view]}</span>` : ""}">${config.default_view}</option>`;
    }
    for (let table of config.tables) {
        if (table === config.default_view) {
            continue;
        }
        selection_html += `<option value="../${table}/index_1.html" data-content="${table} ${config.view_sizes[table] ? `<span class='badge badge-light'>${config.view_sizes[table]}</span>` : ""}">${table}</option>`;
    }
    let nav_html = `
        <ol class="navbar-nav mr-auto breadcrumb">
            ${report_name_html}
            <li class="breadcrumb-item">
                <select id="view-selection" title="${TITLE}" data-width="fit" onchange="location = this.value;" data-live-search-placeholder="Filter..." class="selectpicker" data-style="select-view" data-live-search="true">
                    ${selection_html}
                </select>
            </li>
        </ol>`;
    let sidebar_html = "";
    if (config.is_single_page) {
        sidebar_html += '<li class="list-group-item sidebar-btn" id="btnHeatmap" data-toggle="modal" data-target="#heatmap-plot-modal">Show as plot</li>';
    }
    if (config.has_excel_sheet) {
        sidebar_html += '<li class="list-group-item sidebar-btn" id="btnExcel" onclick="window.location=\'../data.xlsx\'">Download excel sheet</li>';
    }
    if (DESCRIPTION !== "") {
        sidebar_html += '<li class="list-group-item sidebar-btn" id="markdown-btn" type="button" data-toggle="collapse" data-target="#collapseDescription" aria-expanded="false" aria-controls="collapseDescription">Show description</li>';
    }
    if (config.is_single_page) {
        sidebar_html += '<li class="list-group-item sidebar-btn" onclick="datavzrd.downloadCSV()">Download CSV</li>';
    }
    sidebar_html += '<li class="list-group-item sidebar-btn" id="toggleLineNumbers" onclick="datavzrd.toggle_line_numbers()">Show/Hide Line Numbers</li>';
    const content = `
        <div class="collapse" id="sidebar">
            <div class="card" id="sidebar-card">
                <ul class="list-group list-group-flush" id="sidebar-list">
                    ${sidebar_html}
                </ul>
            </div>
        </div>
        <div id="page-container">
            <div id="content-wrap">
                <div class="fixed-top">
                    <nav class="navbar navbar-expand navbar-light navbar-top">
                        <div class="collapse navbar-collapse" id="navbarText2">
                            ${nav_html}
                        </div>
                        <span class="pull-right">
                            <button class="navbar-toggler nav-btn" type="button" data-toggle="collapse" data-target="#sidebar" aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                        </span>
                    </nav>
                </div>
                <div class="container-fluid">
                    ${description_html}
                    <div class="row justify-content-center">
                        <div class="col-md-12 loading text-center">
                            <div class="spinner-border" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                        <div id="table-container" class="col-md-12 table-container">
                            <table id="table" class="table" data-classes="table">
                            </table>
                        </div>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-md-12">
                        ${pagination_html}
                        </div>
                    </div>
                    <div id="modal-container">
                        <div class="modal fade" id="histogram_modal" tabindex="-1" role="dialog" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="histogram-modal-title"></h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div id="histogram-plot">
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabelqr" id="qr-modal" aria-hidden="true">
                            <div class="modal-dialog modal-lg" id="modal-dialog-qr">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title">Share data</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <p class="text-right small">Scan the QR code to view the shared data</p>
                                        <div class="text-center">
                                            <canvas id="qr-code"></canvas>
                                        </div>
                                        <div class="modal-footer">
                                            <span data-toggle="tooltip" data-placement="left" title="Open portable share link. Note that when using the link the row data can temporarily occur (in base64-encoded form) in the server logs of ${config.webview_host}.">
                                                <a href="#" target="_blank" rel="noopener noreferrer" type="button" id="open-url" class="btn btn-primary">Open link</a>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" id="heatmap-plot-modal" aria-hidden="true">
                            <div class="modal-dialog modal-lg" id="modal-dialog-heatmap">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title">Plot-View</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <p class="text-right small">Click "..."-button for export options</p>
                                        <div id="heatmap-plot">
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade" id="search" tabindex="-1" role="dialog" aria-hidden="true" data-focus="false">
                            <div class="modal-dialog modal-dialog-centered modal-md" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title">Search</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <iframe id="search-iframe" src="" frameBorder="0"></iframe>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade" id="error-modal" tabindex="-1" role="dialog">
                            <div class="modal-dialog modal-lg" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title">Error</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <p>Error when calling custom function for column <b id="error-column"></b> (please fix the function definition in the datavzrd config):</p>
                                        <pre id="error-modal-text"></pre>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer class="footer">
                <nav class="navbar navbar-expand navbar-light navbar-top">
                    <a class="navbar-brand" href="#">datavzrd</a>
                    <div class="collapse navbar-collapse" id="navbarText">
                        <ul class="navbar-nav mr-auto">
                            <li class="nav-item">
                                <a class="nav-link" id="datavzrd-version" href="https://github.com/datavzrd/datavzrd/blob/master/CHANGELOG.md">${VERSION}</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="https://github.com/datavzrd/datavzrd">github</a>
                            </li>
                        </ul>
                        <span class="navbar-text">
                            created ${TIME}
                        </span>
                    </div>
                </nav>
            </footer>
        </div>`;
    document.querySelector('body').innerHTML = content;
}
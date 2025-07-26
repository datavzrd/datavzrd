import $ from "jquery";

export function render_html_contents() {
    let description_html = `
        <div class="row description-box">
            <div class="col-md-12">
                <div class="collapse show" id="collapseDescription">
                    <div class="card card-body description-card-body">
                        <button id="close-description" type="button" data-toggle="collapse" data-target="#collapseDescription" class="close" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <div id="innerDescription" data-markdown="${config.description}"></div>
                    </div>
                </div>
            </div>
        </div>`;
    if (!config.description && !config.heatmaps.some(h => h.heatmap.legend)) {
        description_html = "";
    }
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
    if (config.report_name !== "") {
        report_name_html = `<li class="breadcrumb-item"><div>${config.report_name}</div></li>`;
    }
    let selection_html = "";
    if (!config.default_view) {
        selection_html += `<option value="../index.html">Back to overview</option>`;
    }
    if (config.default_view) {
        selection_html += `<option value="../${config.default_view}/index_1.html" data-content="${config.default_view.replace(/_/g, " ")} ${config.view_sizes[config.default_view] ? `<span class='badge badge-light'>${config.view_sizes[config.default_view]}</span>` : ""}">${config.default_view.replace(/_/g, " ")}</option>`;
    }
    for (let table of config.tables) {
        if (table === config.default_view) {
            continue;
        }
        selection_html += `<option value="../${table}/index_1.html" data-content="${table.replace(/_/g, " ")} ${config.view_sizes[table] ? `<span class='badge badge-light'>${config.view_sizes[table]}</span>` : ""}">${table.replace(/_/g, " ")}</option>`;
    }
    let nav_html = `
        <ol class="navbar-nav mr-auto breadcrumb">
            ${report_name_html}
            <li class="breadcrumb-item">
                <select id="view-selection" title="${config.title.replace(/_/g, " ")}" data-width="fit" onchange="location = this.value;" data-live-search-placeholder="Filter..." class="selectpicker" data-style="select-view" data-live-search="true">
                    ${selection_html}
                </select>
            </li>
        </ol>`;
        let sidebar_html = "";

        // Group: Visual Changes
        if (config.description) {
            sidebar_html += '<li class="list-group-item sidebar-btn" id="markdown-btn" type="button" data-toggle="collapse" data-target="#collapseDescription" aria-expanded="false" aria-controls="collapseDescription">Show description</li>';
        }
        if (config.is_single_page) {
            sidebar_html += '<li class="list-group-item sidebar-btn" id="unhide-btn">Unhide columns</li>';
        }
        sidebar_html += '<li class="list-group-item sidebar-btn" id="toggleLineNumbers">Show/Hide Line Numbers</li>';
        
        // Group: Downloads
        if (config.has_excel_sheet) {
            sidebar_html += '<li class="list-group-item sidebar-btn" id="btnExcel">Download Excel Sheet</li>';
        }
        if (config.is_single_page) {
            sidebar_html += '<li class="list-group-item sidebar-btn" id="downloadCSV-btn">Download CSV</li>';
        }
        sidebar_html += '<li class="list-group-item sidebar-btn" id="screenshotTable">Export Table Page as SVG</li>';
    let toast_html = `
    <div class="toast m-3" role="alert" aria-live="polite" aria-atomic="true" id="warningToast" style="z-index: 1050; position: absolute; top: 0; left: 0;">
        <div class="toast-header">
            <strong class="mr-auto">Error</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body alert-danger" id="toastBody"></div>
    </div>`;
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
                        <span
                            class="pull-right"
                            id="colum-filter-icon"
                            tabindex="0"
                            data-toggle="popover"
                            data-trigger="click"
                            data-html="true"
                            data-placement="left"
                            data-content='<select id="filter-columns-select" class="selectpicker form-control form-control-sm" multiple data-live-search="true" data-actions-box="true" title="Filter columns..."></select>'
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(0,0,0,.5)" class="bi bi-search" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                          </svg>
                        </span>
                        <span class="pull-right">
                            <button class="navbar-toggler nav-btn" type="button" data-toggle="collapse" data-target="#sidebar" aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                        </span>
                    </nav>
                </div>
                <div class="container-fluid">
                    ${description_html}
                    ${toast_html}
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
            ${footer(config.version, config.time)}
        </div>`;
    document.querySelector('body').innerHTML = content;
}

function footer(version, time) {
    return `
    <footer class="footer">
        <nav class="navbar navbar-expand navbar-light navbar-top">
            <a class="navbar-brand" href="#">datavzrd</a>
            <div class="collapse navbar-collapse" id="navbarText">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                        <a class="nav-link" id="datavzrd-version" href="https://github.com/datavzrd/datavzrd/blob/master/CHANGELOG.md">${version}</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="https://github.com/datavzrd/datavzrd">github</a>
                    </li>
                </ul>
                <span class="navbar-text">
                    ${time || ""}
                </span>
            </div>
        </nav>
    </footer>`;
}

export function render_plot_size_controls() {
    let controls = `
        <div id="plot-size-control">
            <div class="btn-group btn-group-sm" role="group">
                <button type="button" id="zoom" class="btn btn-sm btn-outline-secondary" onclick="datavzrd.load_plot(specs, data, false, 100)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrows-angle-expand" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707"/>
                    </svg>
                </button>
                <button type="button" id="unzoom" class="btn btn-sm btn-outline-secondary"onclick="datavzrd.load_plot(specs, data, false, -100)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrows-angle-contract" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707M15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707"/>
                    </svg>
                </button>
            </div>
        </div>`;
    $('.container-fluid').append(controls);
}

export function render_landing_page() {
    let landing_page = `
        <div class="container mt-4" style="height: 85vh; overflow-y: auto;">
            <h1>${name}</h1>
            <table class="table" id="landing-table">
                <thead class="thead">
                    <tr>
                        <th>View</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(views).sort(([a], [b]) => a.localeCompare(b)).map(([table, description]) => `
                        <tr>
                            <td><a href="./${table}/index_1.html">${table.replace(/_/g, " ")}</a></td>
                            <td data-markdown="${description || 'No description available'}"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ${footer(version)}`;
    return landing_page;
}

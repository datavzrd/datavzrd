export function renderModals() {
    const modals = `
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
                                <span data-toggle="tooltip" data-placement="left" title="Open portable share link. Note that when using the link the row data can temporarily occur (in base64-encoded form) in the server logs of {{webview_host}}.">
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
            `;
    document.getElementById('modal-container').innerHTML = modals;
}
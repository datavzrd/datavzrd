import $ from "jquery";

function showError(details, ...description) {
  $(() => {
    $("#error-modal-description").empty().append(...description);
    $("#error-modal-text").text(details).toggle(details !== "");
    $("#error-modal").modal("show");
  });
}

function errorDetails(error) {
  return `${error}\n${error.stack}`;
}

export function customFunctionError(error, column) {
  showError(
    errorDetails(error),
    "Error when calling custom function for column ",
    $("<b>").text(column),
    " (please fix the function definition in the datavzrd config):",
  );
}

export function customPlotError(error, column) {
  showError(
    errorDetails(error),
    "Error when rendering custom plot for column ",
    $("<b>").text(column),
    " (please fix the plot specification in the datavzrd config):",
  );
}

export function plotViewError(error) {
  showError(
    errorDetails(error),
    "Error when rendering the plot of this view (please fix the plot specification in the datavzrd config):",
  );
}

export function functionsLoadError() {
  showError(
    "",
    "The custom functions of this view could not be loaded because one of them contains a syntax error. When rendering the report, datavzrd printed a warning naming the affected column (please fix the function definition in the datavzrd config).",
  );
}

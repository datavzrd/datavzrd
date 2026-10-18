import $ from "jquery";

function showError(error, ...description) {
  $(() => {
    $("#error-modal-description").empty().append(...description);
    $("#error-modal-text").text(`${error}\n${error.stack}`);
    $("#error-modal").modal("show");
  });
}

export function customFunctionError(error, column) {
  showError(
    error,
    "Error when calling custom function for column ",
    $("<b>").text(column),
    " (please fix the function definition in the datavzrd config):",
  );
}

export function customPlotError(error, column) {
  showError(
    error,
    "Error when rendering custom plot for column ",
    $("<b>").text(column),
    " (please fix the plot specification in the datavzrd config):",
  );
}

export function plotViewError(error) {
  showError(
    error,
    "Error when rendering the plot of this view (please fix the plot specification in the datavzrd config):",
  );
}

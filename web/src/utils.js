export function precision_formatter(precision, value) {
  if (value == "") {
    return "";
  }
  value = parseFloat(value);
  if (1 / 10 ** precision < Math.abs(value) || value == 0) {
    return value.toFixed(precision).toString();
  } else {
    return value.toExponential(precision);
  }
}

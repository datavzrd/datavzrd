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

export function download(content, type, fileName) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function precision_formatter(precision, value) {
  if (value == "") {
    return "";
  }
  const number = parseFloat(value);
  if (Number.isNaN(number)) {
    return value;
  }
  if (1 / 10 ** precision < Math.abs(number) || number == 0) {
    return number.toFixed(precision).toString();
  } else {
    return number.toExponential(precision);
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

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

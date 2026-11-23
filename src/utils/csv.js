function encodeCsvCell(value) {
  if (value === null || value === undefined) return '""';

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  let text = String(value);
  if (/^[\s\ufeff]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export function createCsvContent(headers, rows) {
  return [headers, ...rows]
    .map((row) => row.map(encodeCsvCell).join(","))
    .join("\r\n");
}

export function downloadCsv(filename, headers, rows) {
  const blob = new Blob(["\uFEFF", createCsvContent(headers, rows)], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

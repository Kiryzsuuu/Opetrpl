function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers, rows) {
  const lines = [];
  lines.push(headers.map((h) => csvEscape(h.label)).join(','));

  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h.key])).join(','));
  }

  // Add UTF-8 BOM so Excel opens Indonesian characters correctly
  return `\uFEFF${lines.join('\r\n')}`;
}

module.exports = {
  csvEscape,
  toCsv
};

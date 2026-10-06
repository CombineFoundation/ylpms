/** CSV for spreadsheet exports, safe to open in Excel / Google Sheets. */

export function csvCell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value);
  // Prefix formula-like values (even after leading whitespace) so spreadsheets don't execute them.
  const safe = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export const toCsv = (rows: unknown[][]) => rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

/** Browser only: saves `rows` as a UTF-8 CSV (with BOM so Excel reads Urdu names correctly). */
export function downloadCsv(fileName: string, rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

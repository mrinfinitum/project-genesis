export function toCsv<T extends Record<string, unknown>>(rows: T[]) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const raw = row[header];
        const value = Array.isArray(raw) || (raw && typeof raw === "object") ? JSON.stringify(raw) : String(raw ?? "");
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...lines].join("\n");
}

export function parseCsv(csv: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  const [headers = [], ...records] = rows;
  return records.map((record) =>
    headers.reduce<Record<string, string>>((result, header, index) => {
      result[header] = record[index] ?? "";
      return result;
    }, {})
  );
}

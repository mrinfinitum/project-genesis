import { NextResponse } from "next/server";
import { getRows, isEditableTable, upsertRow } from "@/lib/data";
import { parseCsv } from "@/lib/export/csv";
import { tableConfigs } from "@/lib/tables";

type Params = {
  params: Promise<{ table: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { table } = await params;

  if (!isEditableTable(table)) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  const rows = await getRows(table);
  return NextResponse.json({ rows });
}

export async function POST(request: Request, { params }: Params) {
  const { table } = await params;

  if (!isEditableTable(table)) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("text/csv")) {
    const csv = await request.text();
    const config = tableConfigs[table];
    const rows = parseCsv(csv).map((row) =>
      config.fields.reduce<Record<string, unknown>>((result, field) => {
        const value = row[field.key] ?? "";
        if (field.type === "number") {
          result[field.key] = Number(value || 0);
        } else if (field.type === "array") {
          try {
            const parsed = JSON.parse(value);
            result[field.key] = Array.isArray(parsed) ? parsed : [];
          } catch {
            result[field.key] = value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
          }
        } else if (field.type === "boolean") {
          result[field.key] = ["true", "yes", "enabled", "1"].includes(value.toLowerCase());
        } else {
          result[field.key] = value === "" ? null : value;
        }
        return result;
      }, {})
    );
    const saved = [];
    for (const row of rows) {
      saved.push(await upsertRow(table, row));
    }
    return NextResponse.json({ rows: saved });
  }

  const row = await request.json();
  const saved = await upsertRow(table, row);
  return NextResponse.json({ row: saved });
}

import { NextResponse } from "next/server";
import { deleteRow, isEditableTable } from "@/lib/data";

type Params = {
  params: Promise<{ table: string; id: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const { table, id } = await params;

  if (!isEditableTable(table)) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  await deleteRow(table, id);
  return NextResponse.json({ ok: true });
}

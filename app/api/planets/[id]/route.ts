import { NextResponse } from "next/server";
import { deleteRow } from "@/lib/data";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Planet ID is required." }, { status: 400 });
  }

  await deleteRow("generated_planets", id);
  return NextResponse.json({ ok: true });
}

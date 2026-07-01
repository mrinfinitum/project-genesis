import { NextResponse } from "next/server";
import { deleteRow, getRows } from "@/lib/data";
import { createSupabaseAdminClient, getAssetBucketName, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Concept art ID is required." }, { status: 400 });
  }

  const rows = await getRows("conceptual_art");
  const row = rows.find((item) => item.id === id);

  if (hasSupabaseServerConfig() && row?.storage_path) {
    const supabase = createSupabaseAdminClient();
    const paths = [String(row.storage_path), String(row.preview_storage_path ?? "")].filter(Boolean);
    const { error } = await supabase.storage.from(getAssetBucketName()).remove(paths);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await deleteRow("conceptual_art", id);
  return NextResponse.json({ ok: true });
}

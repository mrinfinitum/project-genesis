import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProductionSourceFile } from "@/lib/assets/asset-production";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

async function readPrivateSource(storagePath: string) {
  if (storagePath.startsWith("studio-private://assets/")) {
    const relativePath = storagePath.replace("studio-private://assets/", "");
    return readFile(path.join(process.cwd(), ".local-data", "private-assets", relativePath));
  }

  if (storagePath.startsWith("studio-private://supabase/")) {
    const rest = storagePath.replace("studio-private://supabase/", "");
    const [bucket, ...parts] = rest.split("/");
    const { data, error } = await createSupabaseAdminClient().storage.from(bucket).download(parts.join("/"));
    if (error || !data) throw new Error(error?.message ?? "Could not read private source file.");
    return Buffer.from(await data.arrayBuffer());
  }

  if (storagePath.startsWith("/uploads/")) {
    return readFile(path.join(process.cwd(), "public", storagePath));
  }

  throw new Error("Source file is not downloadable from this environment.");
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const source = await getProductionSourceFile(id);
    if (!source) return NextResponse.json({ error: "Source version not found." }, { status: 404 });

    const buffer = await readPrivateSource(source.storagePath);
    return new NextResponse(buffer, {
      headers: {
        "content-type": source.mimeType || "application/octet-stream",
        "content-disposition": `attachment; filename="${source.filename.replaceAll('"', "")}"`,
        "cache-control": "private, no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not download source file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

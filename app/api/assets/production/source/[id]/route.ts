import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProductionAssetForSourceFile } from "@/lib/assets/asset-production";
import { resolveAssetDownloadEligibility, sourceDownloadHttpStatus } from "@/lib/assets/download-eligibility";
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
    const record = await getProductionAssetForSourceFile(id);
    if (!record) return NextResponse.json({ error: "Source version not found.", code: "source_missing" }, { status: 404 });

    const derivative = record.asset.derivatives.find((item) => item.sourceFileId === record.sourceFile.id && item.publishStatus === "published" && item.publicUrl)
      ?? record.asset.derivatives.find((item) => item.sourceFileId === record.sourceFile.id && item.publicUrl)
      ?? null;
    const eligibility = resolveAssetDownloadEligibility({ asset: record.asset, sourceVersion: record.sourceFile, derivative, environment: process.env.VERCEL ? "vercel" : process.env.NODE_ENV ?? "development", userAccess: "studio" });
    if (!eligibility.canDownloadSource) {
      return NextResponse.json({
        error: eligibility.userMessage,
        code: eligibility.reasonCode,
        sourceAvailability: eligibility.sourceAvailability,
        preferredDownloadType: eligibility.preferredDownloadType,
        remediationAction: eligibility.remediationAction,
        diagnosticContext: eligibility.diagnosticContext
      }, { status: sourceDownloadHttpStatus(eligibility.reasonCode) });
    }

    const buffer = await readPrivateSource(record.sourceFile.storagePath);
    return new NextResponse(buffer, {
      headers: {
        "content-type": record.sourceFile.mimeType || "application/octet-stream",
        "content-disposition": `attachment; filename="${record.sourceFile.filename.replaceAll('"', "")}"`,
        "cache-control": "private, no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not download source file.";
    return NextResponse.json({ error: message, code: "source_not_available_in_environment" }, { status: 409 });
  }
}

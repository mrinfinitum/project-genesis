import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_ASSET_BUCKET || "project-genesis-assets";
const uploadsRoot = path.join(process.cwd(), "public", "uploads", bucket);
const apply = process.argv.includes("--apply");

type AssetPatch = {
  id: string;
  name: string;
  type: string;
  category: string;
  prompt: string;
  file_url: string;
  source_file_url: string;
  source_file_type: string;
  parent_asset_id: string | null;
  slice_name: string;
  roblox_asset_id: string;
  export_status: string;
  status: string;
  notes: string;
};

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before migrating local assets.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function contentTypeFor(filename: string) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".psd")) {
    return "image/vnd.adobe.photoshop";
  }

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (lower.endsWith(".webp")) {
    return "image/webp";
  }

  return "application/octet-stream";
}

function fileBaseName(filename: string) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function nameFromAssetId(assetId: string) {
  return assetId
    .replace(/^asset-/, "")
    .replace(/^(upgrades|buildings|research)-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || assetId;
}

function categoryForAsset(assetId: string) {
  if (assetId.startsWith("asset-upgrades-")) {
    return "Upgrade Icon";
  }

  if (assetId.startsWith("asset-buildings-")) {
    return "Building Render";
  }

  if (assetId.startsWith("asset-research-")) {
    return "Research Icon";
  }

  return "Asset";
}

function linkedSource(assetId: string) {
  if (assetId.startsWith("asset-upgrades-")) {
    return { table: "upgrades", id: assetId.replace(/^asset-upgrades-/, "") };
  }

  if (assetId.startsWith("asset-buildings-")) {
    return { table: "buildings", id: assetId.replace(/^asset-buildings-/, "") };
  }

  if (assetId.startsWith("asset-research-")) {
    return { table: "research", id: assetId.replace(/^asset-research-/, "") };
  }

  return null;
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walkFiles(entryPath);
      }

      if (entry.isFile()) {
        return [entryPath];
      }

      return [];
    })
  );

  return files.flat();
}

async function loadLocalAssetRows() {
  try {
    const localRows = JSON.parse(await readFile(path.join(process.cwd(), ".local-data", "assets.json"), "utf8"));
    return Array.isArray(localRows) ? (localRows as Partial<AssetPatch>[]) : [];
  } catch {
    return [];
  }
}

async function publicUrlFor(storagePath: string) {
  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

async function main() {
  const rootStat = await stat(uploadsRoot).catch(() => null);

  if (!rootStat?.isDirectory()) {
    console.log(`No local upload directory found at ${uploadsRoot}`);
    return;
  }

  const files = await walkFiles(uploadsRoot);
  const localRows = await loadLocalAssetRows();
  const rowById = new Map<string, Partial<AssetPatch>>();

  for (const row of localRows) {
    const id = String(row.id ?? "");

    if (id) {
      rowById.set(id, row);
    }
  }

  const assetFiles = new Map<string, { exports: string[] }>();

  for (const file of files) {
    const storagePath = path.relative(uploadsRoot, file).split(path.sep).join("/");
    const [assetId, kind] = storagePath.split("/");

    if (!assetId || !kind) {
      continue;
    }

    const group = assetFiles.get(assetId) ?? { exports: [] };

    if (kind === "source") {
      console.log(`Skipping local-only source file ${storagePath}`);
      assetFiles.set(assetId, group);
      continue;
    }

    if (kind === "exports") {
      group.exports.push(storagePath);
    } else {
      assetFiles.set(assetId, group);
      continue;
    }

    assetFiles.set(assetId, group);

    console.log(`${apply ? "Uploading" : "Would upload"} ${storagePath}`);

    if (apply) {
      const buffer = await readFile(file);
      const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
        contentType: contentTypeFor(file),
        upsert: true
      });

      if (error) {
        throw new Error(`${storagePath}: ${error.message}`);
      }
    }
  }

  const rows: AssetPatch[] = [];

  for (const [assetId, group] of assetFiles.entries()) {
    const existing = rowById.get(assetId) ?? {};
    const exportPath = [...group.exports].sort().at(-1) ?? "";

    if (!exportPath) {
      continue;
    }

    const exportUrl = exportPath ? await publicUrlFor(exportPath) : String(existing.file_url ?? "");
    const exportFile = exportPath ? path.basename(exportPath) : "";

    rows.push({
      id: assetId,
      name: String(existing.name ?? (fileBaseName(exportFile) || nameFromAssetId(assetId))),
      type: String(existing.type === "PSD Source" ? "Image" : existing.type ?? "Image"),
      category: String(existing.category === "Source Artwork" ? categoryForAsset(assetId) : existing.category ?? categoryForAsset(assetId)),
      prompt: String(existing.prompt ?? ""),
      file_url: exportUrl,
      source_file_url: "",
      source_file_type: "",
      parent_asset_id: (existing.parent_asset_id as string | null | undefined) ?? null,
      slice_name: String(existing.slice_name ?? ""),
      roblox_asset_id: String(existing.roblox_asset_id ?? ""),
      export_status: String(existing.export_status === "Source Uploaded" ? "PNG Uploaded" : existing.export_status ?? "PNG Uploaded"),
      status: String(existing.status === "Source Uploaded" ? "Uploaded" : existing.status ?? "Uploaded"),
      notes: String(existing.notes ?? `Migrated from local public/uploads/${bucket}/${assetId}.`)
    });
  }

  console.log(`${apply ? "Upserting" : "Would upsert"} ${rows.length} asset rows.`);

  if (apply && rows.length) {
    const { error } = await supabase.from("assets").upsert(rows);

    if (error) {
      throw new Error(`assets upsert: ${error.message}`);
    }

    for (const row of rows) {
      const source = linkedSource(row.id);

      if (!source) {
        continue;
      }

      const { error: linkError } = await supabase.from(source.table).update({ asset_id: row.id }).eq("id", source.id);

      if (linkError) {
        console.warn(`Could not link ${row.id} to ${source.table}:${source.id}: ${linkError.message}`);
      } else {
        console.log(`Linked ${row.id} to ${source.table}:${source.id}`);
      }
    }
  }

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to upload files and upsert asset rows.");
  } else {
    console.log("Local asset migration complete.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

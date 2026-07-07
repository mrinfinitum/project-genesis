import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_ASSET_BUCKET || "project-genesis-assets";
const apply = process.argv.includes("--apply");

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before cleaning remote PSD sources.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function cleanedNotes(value: unknown) {
  return String(value ?? "")
    .split("\n")
    .filter((line) => !/source psd/i.test(line))
    .join("\n")
    .trim();
}

async function cleanupAssetRows() {
  const { data, error } = await supabase.from("assets").select("*");

  if (error) {
    throw new Error(`assets select: ${error.message}`);
  }

  const updates = (data ?? [])
    .filter((row) => row.source_file_url || row.source_file_type === "PSD" || row.type === "PSD Source" || row.category === "Source Artwork")
    .map((row) => ({
      ...row,
      type: row.type === "PSD Source" ? "Image" : row.type,
      category: row.category === "Source Artwork" ? "Asset" : row.category,
      source_file_url: "",
      source_file_type: "",
      export_status: row.export_status === "Source Uploaded" ? (row.file_url ? "PNG Uploaded" : "") : row.export_status,
      status: row.status === "Source Uploaded" ? (row.file_url ? "Uploaded" : "Draft") : row.status,
      notes: cleanedNotes(row.notes)
    }));

  console.log(`${apply ? "Clearing" : "Would clear"} PSD source metadata on ${updates.length} asset row${updates.length === 1 ? "" : "s"}.`);

  if (apply && updates.length) {
    const { error: upsertError } = await supabase.from("assets").upsert(updates);

    if (upsertError) {
      throw new Error(`assets upsert: ${upsertError.message}`);
    }
  }
}

async function cleanupPlanetRenderRows() {
  const { data, error } = await supabase.from("planet_render_library").select("*");

  if (error) {
    throw new Error(`planet_render_library select: ${error.message}`);
  }

  const updates = (data ?? [])
    .filter((row) => row.landscape_source_path || row.orbital_source_path || /source psd/i.test(String(row.notes ?? "")))
    .map((row) => ({
      ...row,
      landscape_source_path: "",
      orbital_source_path: "",
      notes: cleanedNotes(row.notes),
      updated_at: new Date().toISOString()
    }));

  console.log(`${apply ? "Clearing" : "Would clear"} PSD source metadata on ${updates.length} planet render row${updates.length === 1 ? "" : "s"}.`);

  if (apply && updates.length) {
    const { error: upsertError } = await supabase.from("planet_render_library").upsert(updates);

    if (upsertError) {
      throw new Error(`planet_render_library upsert: ${upsertError.message}`);
    }
  }
}

async function walkStorage(prefix = ""): Promise<string[]> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: {
      column: "name",
      order: "asc"
    }
  });

  if (error) {
    throw new Error(`storage list ${prefix || "/"}: ${error.message}`);
  }

  const found: string[] = [];

  for (const item of data ?? []) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    const isFolder = !item.id && !item.metadata;

    if (isFolder) {
      found.push(...(await walkStorage(fullPath)));
      continue;
    }

    found.push(fullPath);
  }

  return found;
}

async function cleanupStoragePsdObjects() {
  const objects = await walkStorage();
  const psdObjects = objects.filter((objectPath) => objectPath.toLowerCase().endsWith(".psd"));

  console.log(`${apply ? "Deleting" : "Would delete"} ${psdObjects.length} remote PSD storage object${psdObjects.length === 1 ? "" : "s"}.`);

  for (const objectPath of psdObjects.slice(0, 25)) {
    console.log(`- ${objectPath}`);
  }

  if (psdObjects.length > 25) {
    console.log(`...and ${psdObjects.length - 25} more.`);
  }

  if (apply && psdObjects.length) {
    for (let index = 0; index < psdObjects.length; index += 100) {
      const batch = psdObjects.slice(index, index + 100);
      const { error } = await supabase.storage.from(bucket).remove(batch);

      if (error) {
        throw new Error(`storage remove: ${error.message}`);
      }
    }
  }
}

async function main() {
  await cleanupAssetRows();
  await cleanupPlanetRenderRows();
  await cleanupStoragePsdObjects();

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to clear metadata and delete remote PSD files.");
  } else {
    console.log("Remote PSD cleanup complete. Local PSD files were not touched.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

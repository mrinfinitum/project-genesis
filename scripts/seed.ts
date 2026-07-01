import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import { handoffData } from "../data/handoff";

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running npm run seed.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function upsert(table: keyof typeof handoffData) {
  const rows = handoffData[table] as Record<string, unknown>[];
  const { error } = await supabase.from(table).upsert(rows);
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
  console.log(`Seeded ${rows.length} ${table}`);
}

async function main() {
  await upsert("research_branches");
  await upsert("research");
  await upsert("districts");
  await upsert("assets");
  await upsert("buildings");
  await upsert("unlock_matrix");
  await upsert("wonders");
  await upsert("upgrades");
  await upsert("building_relationships");
  await upsert("building_chains");
  await upsert("game_constants");
  await upsert("feature_flags");
  await upsert("release_notes");
  await upsert("changelog");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

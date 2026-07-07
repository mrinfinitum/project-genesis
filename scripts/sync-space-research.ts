import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import {
  buildSpaceResearchNodes,
  buildSpaceUnlockMatrixRows,
  SPACE_RESEARCH_BRANCH_PURPOSE
} from "../data/space-research-progression";

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes("--apply");

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before syncing Space research.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (!apply) {
    console.log(`[dry-run] Would upsert ${rows.length} rows into ${table}.`);
    return;
  }

  const { error } = await supabase.from(table).upsert(rows);
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`Upserted ${rows.length} rows into ${table}.`);
}

async function main() {
  const research = buildSpaceResearchNodes();
  const unlockMatrix = buildSpaceUnlockMatrixRows(research);

  console.log(`Space branch purpose: ${SPACE_RESEARCH_BRANCH_PURPOSE}`);
  console.log(`Space research nodes: ${research.length}`);
  console.log(`Space unlock matrix rows: ${unlockMatrix.length}`);

  await upsert("research_branches", [
    {
      id: "branch-space",
      name: "Space",
      purpose: SPACE_RESEARCH_BRANCH_PURPOSE
    }
  ]);
  await upsert("research", research);
  await upsert("unlock_matrix", unlockMatrix);

  if (!apply) {
    console.log("Dry run complete. Re-run with --apply to write to Supabase.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

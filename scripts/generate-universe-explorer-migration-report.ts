import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildUniverseExplorerModel, buildExplorerMigrationReport } from "@/lib/universe-explorer";
import { buildBaseGameRuntimeData } from "@/lib/runtime/game-runtime";

async function main() {
  const runtime = await buildBaseGameRuntimeData();
  if (!runtime.identityRelationshipGraph) throw new Error("Canonical identity and relationship graph is unavailable.");
  const report = buildExplorerMigrationReport(buildUniverseExplorerModel(runtime.identityRelationshipGraph));
  const output = join(process.cwd(), "reports", "universe-explorer-migration-report.json");
  await mkdir(join(process.cwd(), "reports"), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ output, records: report.records, unresolvedMappings: report.recordsThatCannotYetBePlaced.length }, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

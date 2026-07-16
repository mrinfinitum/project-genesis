import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();

  console.log(JSON.stringify({
    ok: true,
    synchronized: true,
    schemaVersion: runtime.metadata.schemaVersion,
    contentVersion: runtime.metadata.contentVersion,
    validationStatus: runtime.metadata.validationStatus,
    note: "Runtime payload read successfully; no local mutation required."
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

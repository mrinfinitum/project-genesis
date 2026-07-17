import { getArchitectureState, validateArchitectureState } from "@/lib/architecture";
import { validateCoreArchitectureAudit } from "@/lib/architecture/core-audit";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [state, runtime] = await Promise.all([getArchitectureState(), buildCanonicalRuntimeExportPayload()]);
  const architectureErrors = validateArchitectureState(state).filter((issue) => issue.severity === "error");
  assert(!architectureErrors.length, `Architecture validation failed: ${architectureErrors.map((issue) => issue.message).join("; ")}`);

  const audit = state.coreArchitectureAudit;
  const auditIssues = validateCoreArchitectureAudit(audit, Object.keys(runtime));
  assert(!auditIssues.length, `Core architecture audit failed: ${auditIssues.join("; ")}`);
  assert(audit.ownershipMatrix.length >= 30, "Ownership matrix must cover all major current domains.");
  assert(audit.ownershipMatrix.some((row) => row.domain === "player Action instances" && row.canonicalOwner === "Game"), "Player Action instances must be Game-owned.");
  assert(audit.ownershipMatrix.some((row) => row.domain === "Premium Crystal transactions" && row.canonicalOwner === "Game Backend"), "Premium Crystal transactions must be backend-owned.");
  assert(audit.ownershipMatrix.some((row) => row.domain === "Population definitions" && row.canonicalOwner === "Studio"), "Population definitions must be Studio-owned.");
  assert(audit.ownershipMatrix.every((row) => row.prohibitedDuplication.length > 0), "Every ownership row needs prohibited duplication guidance.");

  console.log(JSON.stringify({
    ok: true,
    architectureVersion: audit.architectureVersion,
    runtimeVersion: audit.runtimeVersion,
    contentVersion: audit.contentVersion,
    ownershipRows: audit.ownershipMatrix.length,
    studioOwned: audit.ownershipMatrix.filter((row) => row.canonicalOwner === "Studio").length,
    gameOwned: audit.ownershipMatrix.filter((row) => row.canonicalOwner === "Game").length,
    backendOwned: audit.ownershipMatrix.filter((row) => row.canonicalOwner.includes("Backend")).length,
    healthMetrics: Object.fromEntries(audit.healthMetrics.map((metric) => [metric.id, metric.value]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

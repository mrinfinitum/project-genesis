import { getArchitectureState } from "@/lib/architecture";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];

function validateKnowledge(payload: Awaited<ReturnType<typeof buildCanonicalRuntimeExportPayload>>, label: string) {
  const unknown = payload.galaxyEngineContract.knowledgeVisibility.find((state) => state.id === "unknown");
  assert(unknown, `${label} must define unknown knowledge state.`);
  assert(unknown?.unknownDisplayName === "???", `${label} unknown objects must display ???.`);
  assert(unknown?.canShowName === false, `${label} unknown objects must hide names.`);
  assert(unknown?.canShowRegistry === false, `${label} unknown objects must hide registry attribution.`);
  assert(unknown?.canShowResources === false, `${label} unknown objects must hide resources.`);
  assert(unknown?.canShowBodyCount === false, `${label} unknown objects must hide body count.`);
  assert(unknown?.canShowDiscoveries === false, `${label} unknown objects must hide discoveries.`);
  const earlyVisibility = payload.planetDevelopmentFramework.visibilityMatrix.filter((rule) => ["unknown", "detected", "probe_queued", "probing", "probed", "survey_queued", "surveying"].includes(rule.stateId));
  assert(earlyVisibility.length > 0, `${label} must define early planet-development visibility rules.`);
  for (const rule of earlyVisibility) {
    assert(rule.canShowCsi === false, `${label} ${rule.stateId} must hide CSI before survey.`);
    assert(rule.canShowSvi === false, `${label} ${rule.stateId} must hide SVI before survey.`);
    assert(rule.canShowOpportunityScores === false, `${label} ${rule.stateId} must hide opportunity scores before survey.`);
  }
}

async function main() {
  const [state, runtime, ...exports] = await Promise.all([
    getArchitectureState(),
    buildCanonicalRuntimeExportPayload(),
    ...targets.map((target) => buildGameEngineExport(target))
  ]);
  validateKnowledge(runtime, "Canonical runtime");
  for (const payload of exports) {
    assert(payload.validation.status === "Ready", `${payload.target} export must remain Ready.`);
    const canonicalLike = {
      ...runtime,
      galaxyEngineContract: payload.canonical.galaxy_engine_contract,
      planetDevelopmentFramework: payload.canonical.planet_development_framework
    };
    validateKnowledge(canonicalLike, `${payload.target} export`);
  }
  assert(state.coreArchitectureAudit.knowledgeVisibilityFindings.some((finding) => finding.id === "knowledge_unknown_mask" && finding.status === "validated"), "Audit must document unknown masking validation.");
  console.log(JSON.stringify({
    ok: true,
    knowledgeStates: runtime.galaxyEngineContract.knowledgeVisibility.length,
    planetVisibilityRules: runtime.planetDevelopmentFramework.visibilityMatrix.length,
    findings: state.coreArchitectureAudit.knowledgeVisibilityFindings.map((finding) => ({ id: finding.id, status: finding.status })),
    exports: Object.fromEntries(exports.map((payload, index) => [targets[index], payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

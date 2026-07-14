import { architectureSectionIds, getArchitectureState, validateArchitectureState } from "@/lib/architecture";
import { buildGameEngineExport } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertNoPrivateLeak(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/\/Users\/|studio-private:\/\/|SERVICE_ROLE|PRIVATE_KEY|clientSecret|apiKey|databaseUrl/i.test(text), `${label} leaked a private path or secret marker.`);
}

async function main() {
  const [state, runtime, genericExport] = await Promise.all([
    getArchitectureState(),
    buildCanonicalRuntimeExportPayload(),
    buildGameEngineExport("generic")
  ]);
  const issues = validateArchitectureState(state);
  const errors = issues.filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `Architecture validation failed: ${errors.map((issue) => issue.message).join("; ")}`);

  assert(state.gameName === "NOVERIS", "Architecture must define NOVERIS as game name.");
  assert(state.tagline === "The Future We Build", "Architecture must define the canonical tagline.");
  assert(state.architectureVersion.current === "1.0.0", "Architecture version must be 1.0.0.");
  assert(state.currentRuntimeVersion === runtime.metadata.schemaVersion, "Architecture runtime version must match canonical runtime schemaVersion.");
  assert(state.currentContentVersion === runtime.metadata.contentVersion, "Architecture content version must match canonical runtime contentVersion.");
  assert(state.currentSaveVersion.length > 0, "Architecture must document current save version.");
  assert(state.sections.length >= architectureSectionIds.length, "Architecture is missing required sections.");
  assert(state.decisions.length >= 8, "Architecture decision log is too thin.");
  assert(state.recentDecisions.length > 0, "Architecture must expose recent decisions.");
  assert(state.outstandingDecisions.some((decision) => decision.id === "ARCH-DECISION-CLIENT-RESPONSIBILITIES"), "Architecture must track outstanding client responsibility documentation.");
  for (const id of architectureSectionIds) {
    assert(state.sections.some((section) => section.id === id), `Missing Architecture section ${id}.`);
  }
  for (const client of ["Web", "Roblox", "iOS", "Android", "Unity", "Unreal", "Godot"]) {
    assert(state.supportedClients.includes(client), `Architecture missing supported client ${client}.`);
  }
  assert(state.sections.some((section) => section.id === "hierarchy" && section.content.join(" ").includes("Civilization -> Galaxy -> Sector -> Star System -> Planet -> Settlement")), "Architecture must document the canonical hierarchy.");
  assert(state.sections.some((section) => section.id === "economy" && section.content.join(" ").includes("Labor") && section.content.join(" ").includes("Premium Crystals")), "Architecture must document the canonical HUD economy.");
  assert(state.sections.some((section) => section.id === "ai-agent" && section.content.join(" ").includes("AI Agent replaces Auto Click")), "Architecture must document AI Agent replacing Auto Click.");
  assert(state.sections.some((section) => section.id === "supabase" && section.content.join(" ").includes("separate databases")), "Architecture must document Studio/Game Supabase separation.");
  assert(state.codexHandoffRule.includes("Read Architecture Workspace"), "Architecture must document Codex handoff instructions.");
  assert(state.codexHandoffRule.includes("Architecture wins"), "Architecture must document conflict resolution.");
  assert(state.runtimeSafetyRule.includes("not runtime gameplay"), "Architecture must remain documentation-only.");
  assert(genericExport.validation.status === "Ready", `Generic export must remain Ready; received ${genericExport.validation.status}.`);
  assert(!Object.prototype.hasOwnProperty.call(genericExport.canonical, "architecture"), "Architecture must not be added to runtime/gameplay exports.");
  assertNoPrivateLeak("Architecture state", state);

  console.log(JSON.stringify({
    ok: true,
    architectureVersion: state.architectureVersion.current,
    runtimeVersion: state.currentRuntimeVersion,
    contentVersion: state.currentContentVersion,
    saveVersion: state.currentSaveVersion,
    health: state.architectureHealth,
    healthScore: state.healthScore,
    sections: state.sections.length,
    decisions: state.decisions.length,
    outstandingDecisions: state.outstandingDecisions.length,
    supportedClients: state.supportedClients,
    genericExportValidation: genericExport.validation.status
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

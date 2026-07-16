import { canonicalActionSystem } from "@/lib/actions/action-system";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { planetDevelopmentFramework, validatePlanetDevelopmentFramework } from "@/lib/planets/development-framework";
import { canonicalPlanetOpportunityProfiles } from "@/lib/planets/opportunity-profiles";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertFramework(framework: typeof planetDevelopmentFramework, label: string) {
  const actionIds = new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id));
  const profileIds = new Set(canonicalPlanetOpportunityProfiles.map((profile) => profile.id));
  const issues = validatePlanetDevelopmentFramework(framework, actionIds, profileIds).filter((issue) => issue.severity === "error");
  assert(issues.length === 0, `${label} Planet Development Framework failed validation: ${issues.map((issue) => issue.message).join("; ")}`);

  const detected = framework.knowledgeLifecycle.find((state) => state.id === "detected");
  assert(detected && !detected.allowedTransitions.includes("operational"), `${label} must not allow detected -> operational.`);
  assert(detected && !detected.allowedTransitions.includes("preserved"), `${label} must not allow detected -> preserved.`);

  const preSurvey = framework.visibilityMatrix.filter((rule) => ["unknown", "detected", "probe_queued", "probing", "probed", "survey_queued", "surveying"].includes(rule.stateId));
  assert(preSurvey.every((rule) => !rule.canShowCsi && !rule.canShowSvi && !rule.canShowNickname && !rule.canShowRecommendations && !rule.canShowValidDevelopmentActions), `${label} leaks evaluation data before survey.`);

  const gasGiant = framework.developmentProfiles.find((profile) => profile.sourceOpportunityProfileId === "planet_opportunity_gas_giant");
  assert(gasGiant?.capabilities.surfaceColonization === "prohibited", `${label} gas giants must prohibit surface colonization.`);
  assert(gasGiant?.blockedActionReasons.some((reason) => reason.actionId === "establish_colony" && reason.reasonCode === "blocked_no_solid_surface"), `${label} gas giant colony block reason missing.`);

  const protectedWorld = framework.developmentProfiles.find((profile) => profile.sourceOpportunityProfileId === "planet_opportunity_forest");
  assert(protectedWorld?.restrictions.includes("protected_ecology"), `${label} protected living worlds must publish preservation restrictions.`);

  for (const profile of framework.developmentProfiles) {
    assert(profile.csi.value >= 0 && profile.csi.value <= 100, `${label} ${profile.id} CSI out of range.`);
    assert(profile.svi.value >= 0 && profile.svi.value <= 100, `${label} ${profile.id} SVI out of range.`);
    assert(profile.validActionIds.every((actionId) => actionIds.has(actionId)), `${label} ${profile.id} has unresolved valid action.`);
    assert(profile.blockedActionReasons.every((reason) => reason.reasonCode), `${label} ${profile.id} has blocked action without reason code.`);
  }
  assert(!/activePlayerProject|startedAt|completedAt|queueContents|playerBalances|\/Users\//i.test(JSON.stringify(framework)), `${label} leaked player-owned or private state.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 26, `Runtime contentVersion must be at least 26; received ${gameRuntimeContentVersion}.`);
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);

  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must be Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must be Ready; received ${roblox.metadata.validationStatus}.`);
  assertFramework(canonical.planetDevelopmentFramework, "Canonical runtime");
  assertFramework(roblox.planetDevelopmentFramework, "Roblox runtime");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(targets.map(async (target) => {
    const payload = await buildGameEngineExport(target);
    const modules = payload.canonical as Record<string, unknown>;
    const framework = modules.planet_development_framework as typeof planetDevelopmentFramework;
    const planets = (modules.planets as Array<{ id: string; opportunityProfileId?: string }> | undefined) ?? [];
    const celestialBodies = (modules.celestial_bodies as Array<{ id: string; opportunityProfileId?: string }> | undefined) ?? [];
    const profileIds = new Set((framework?.developmentProfiles ?? []).map((profile) => profile.sourceOpportunityProfileId));

    assert(payload.validation.status === "Ready", `${target} export must remain Ready; received ${payload.validation.status}.`);
    assertFramework(framework, `${target} export`);
    for (const record of [...planets, ...celestialBodies]) {
      assert(record.opportunityProfileId && profileIds.has(record.opportunityProfileId), `${target} ${record.id} cannot resolve a Planet Development Profile from ${record.opportunityProfileId ?? "(missing)"}.`);
    }
    return {
      target,
      validationStatus: payload.validation.status,
      developmentProfiles: framework.developmentProfiles.length,
      planetCount: planets.length,
      celestialBodyCount: celestialBodies.length
    };
  }));

  console.log(JSON.stringify({
    contentVersion: gameRuntimeContentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    framework: {
      id: canonical.planetDevelopmentFramework.id,
      lifecycle: canonical.planetDevelopmentFramework.knowledgeLifecycle.map((state) => state.id),
      visibilityRules: canonical.planetDevelopmentFramework.visibilityMatrix.length,
      csiBands: canonical.planetDevelopmentFramework.csiBands.map((band) => band.id),
      sviBands: canonical.planetDevelopmentFramework.sviBands.map((band) => band.id),
      archetypes: canonical.planetDevelopmentFramework.opportunityArchetypes.length,
      actionReferences: canonical.planetDevelopmentFramework.actionReferences.map((reference) => reference.actionId),
      developmentProfiles: canonical.planetDevelopmentFramework.developmentProfiles.length,
      assetRequirements: canonical.planetDevelopmentFramework.assetRequirements.length
    },
    engineExports
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { canonicalPlanetOpportunityProfiles, validatePlanetOpportunityProfiles } from "@/lib/planets/opportunity-profiles";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";

type OpportunityLinkedRecord = {
  id: string;
  planet_class?: string | null;
  planet_subclass?: string | null;
  primary_biome?: string | null;
  biome?: string | null;
  celestial_body_type?: string | null;
  opportunityProfileId?: string;
  opportunity_profile_id?: string;
};

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateLinkedRecords(records: OpportunityLinkedRecord[], profileIds: Set<string>, label: string) {
  for (const record of records) {
    assert(record.opportunityProfileId, `${label} ${record.id} is missing opportunityProfileId.`);
    assert(record.opportunity_profile_id, `${label} ${record.id} is missing opportunity_profile_id.`);
    assert(record.opportunityProfileId === record.opportunity_profile_id, `${label} ${record.id} opportunityProfileId aliases do not match.`);
    const opportunityProfileId = record.opportunityProfileId;
    assert(opportunityProfileId && profileIds.has(opportunityProfileId), `${label} ${record.id} references unresolved profile ${opportunityProfileId ?? "(missing)"}.`);
  }
}

async function main() {
  const profileIds = new Set(canonicalPlanetOpportunityProfiles.map((profile) => profile.id));
  const validationErrors = validatePlanetOpportunityProfiles().filter((issue) => issue.severity === "error");
  assert(validationErrors.length === 0, `Planet Opportunity Profiles have validation errors: ${validationErrors.map((issue) => issue.message).join("; ")}`);
  assert(gameRuntimeContentVersion >= 22, `Runtime contentVersion must be at least 22; received ${gameRuntimeContentVersion}.`);

  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);
  assert(canonical.metadata.contentVersion === gameRuntimeContentVersion, "Canonical runtime contentVersion mismatch.");
  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must be Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must be Ready; received ${roblox.metadata.validationStatus}.`);
  assert(canonical.planetOpportunityProfiles.length === canonicalPlanetOpportunityProfiles.length, "Canonical runtime profile count mismatch.");
  assert(roblox.planetOpportunityProfiles.length === canonicalPlanetOpportunityProfiles.length, "Roblox runtime profile count mismatch.");
  assert(canonical.planetOpportunityProfiles.every((profile) => profileIds.has(profile.id)), "Canonical runtime published an unknown Planet Opportunity Profile.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineResults = await Promise.all(targets.map(async (target) => {
    const payload = await buildGameEngineExport(target);
    const canonicalModules = payload.canonical as Record<string, unknown>;
    const profiles = canonicalModules.planet_opportunity_profiles as Array<{ id: string }> | undefined;
    const planets = (canonicalModules.planets as OpportunityLinkedRecord[] | undefined) ?? [];
    const celestialBodies = (canonicalModules.celestial_bodies as OpportunityLinkedRecord[] | undefined) ?? [];
    const exportedProfileIds = new Set((profiles ?? []).map((profile) => profile.id));

    assert(payload.validation.status === "Ready", `${target} export must remain Ready; received ${payload.validation.status}.`);
    assert((profiles?.length ?? 0) === canonicalPlanetOpportunityProfiles.length, `${target} export profile count mismatch.`);
    for (const id of profileIds) {
      assert(exportedProfileIds.has(id), `${target} export missing Planet Opportunity Profile ${id}.`);
    }
    validateLinkedRecords(planets, exportedProfileIds, `${target} planet`);
    validateLinkedRecords(celestialBodies, exportedProfileIds, `${target} celestial body`);

    return {
      target,
      validationStatus: payload.validation.status,
      profileCount: profiles?.length ?? 0,
      planetCount: planets.length,
      celestialBodyCount: celestialBodies.length
    };
  }));

  console.log(JSON.stringify({
    contentVersion: gameRuntimeContentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    runtime: {
      canonicalValidationStatus: canonical.metadata.validationStatus,
      robloxValidationStatus: roblox.metadata.validationStatus,
      planetOpportunityProfileCount: canonical.planetOpportunityProfiles.length
    },
    profiles: canonicalPlanetOpportunityProfiles.map((profile) => ({
      id: profile.id,
      planetClass: profile.planetClass,
      primaryUse: profile.recommendedUses.primaryUse,
      colonization: profile.suitability.colonization,
      mining: profile.suitability.mining,
      research: profile.suitability.scientificResearch
    })),
    engineExports: engineResults
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

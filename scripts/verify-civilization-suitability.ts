import { planetDevelopmentFramework } from "@/lib/planets/development-framework";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function verifyBands(value: number, bandId: string, bands: typeof planetDevelopmentFramework.csiBands, label: string) {
  const band = bands.find((item) => item.id === bandId);
  assert(band, `${label} references missing band ${bandId}.`);
  assert(band && value >= band.min && value <= band.max, `${label} value ${value} does not fit band ${bandId}.`);
}

function verifyFramework(framework: typeof planetDevelopmentFramework, label: string) {
  for (const profile of framework.developmentProfiles) {
    verifyBands(profile.csi.value, profile.csi.bandId, framework.csiBands, `${label} ${profile.id} CSI`);
    verifyBands(profile.svi.value, profile.svi.bandId, framework.sviBands, `${label} ${profile.id} SVI`);
    assert(profile.csi.value >= 0 && profile.csi.value <= 100, `${label} ${profile.id} CSI must be 0-100.`);
    assert(profile.svi.value >= 0 && profile.svi.value <= 100, `${label} ${profile.id} SVI must be 0-100.`);
    assert(profile.csi.version === framework.calculationVersion, `${label} ${profile.id} CSI version mismatch.`);
    assert(profile.svi.version === framework.calculationVersion, `${label} ${profile.id} SVI version mismatch.`);
  }

  const earthLike = framework.developmentProfiles.find((profile) => profile.sourceOpportunityProfileId === "planet_opportunity_earth_like");
  assert(earthLike && earthLike.csi.value >= 75, `${label} Earth-like profile should have excellent civilization suitability.`);
  assert(earthLike && earthLike.svi.value >= 75, `${label} Earth-like profile should retain high strategic value.`);

  const gasGiant = framework.developmentProfiles.find((profile) => profile.sourceOpportunityProfileId === "planet_opportunity_gas_giant");
  assert(gasGiant && gasGiant.csi.value <= 30, `${label} Gas Giant CSI must stay low for habitation.`);
  assert(gasGiant && gasGiant.svi.value >= 90, `${label} Gas Giant SVI must capture harvesting/orbital value.`);
  assert(gasGiant?.opportunityScores.colonization === 0, `${label} Gas Giant colonization score must be 0.`);

  const asteroid = framework.developmentProfiles.find((profile) => profile.sourceOpportunityProfileId === "planet_opportunity_asteroid_belt");
  assert(asteroid && asteroid.csi.value <= 30, `${label} Asteroid Belt CSI must stay low for habitation.`);
  assert(asteroid && asteroid.svi.value >= 80, `${label} Asteroid Belt SVI must capture mining/orbital value.`);

  const preSurvey = framework.visibilityMatrix.filter((rule) => ["unknown", "detected", "probe_queued", "probing", "probed", "survey_queued", "surveying"].includes(rule.stateId));
  assert(preSurvey.every((rule) => !rule.canShowCsi && !rule.canShowSvi), `${label} must hide CSI/SVI before survey.`);
  const surveyed = framework.visibilityMatrix.find((rule) => rule.stateId === "surveyed");
  assert(surveyed?.canShowCsi && surveyed.canShowSvi && surveyed.canShowRecommendations, `${label} must reveal CSI/SVI/recommendations after survey.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 26, `Runtime contentVersion must be at least 26; received ${gameRuntimeContentVersion}.`);
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);
  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must be Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must be Ready; received ${roblox.metadata.validationStatus}.`);
  verifyFramework(canonical.planetDevelopmentFramework, "Canonical runtime");
  verifyFramework(roblox.planetDevelopmentFramework, "Roblox runtime");

  console.log(JSON.stringify({
    contentVersion: gameRuntimeContentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    profileCount: canonical.planetDevelopmentFramework.developmentProfiles.length,
    examples: canonical.planetDevelopmentFramework.developmentProfiles
      .filter((profile) => ["planet_opportunity_earth_like", "planet_opportunity_gas_giant", "planet_opportunity_asteroid_belt"].includes(profile.sourceOpportunityProfileId))
      .map((profile) => ({
        id: profile.id,
        sourceOpportunityProfileId: profile.sourceOpportunityProfileId,
        csi: profile.csi.value,
        csiBand: profile.csi.bandId,
        svi: profile.svi.value,
        sviBand: profile.svi.bandId,
        archetype: profile.opportunityArchetypeId,
        validActions: profile.validActionIds
      }))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

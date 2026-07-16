import {
  civilizationAlignmentScores,
  civilizationAges,
  civilizationBonuses,
  civilizationIdentity,
  civilizationMilestones,
  civilizationTitles,
  civilizationUnlockedMilestones,
  primaryCivilizationId
} from "@/data/civilization-identity";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);
  const expectedAges = ["Survival Age", "Ancient Age", "Medieval Age", "Renaissance Age", "Industrial Age", "Modern Age", "Space Age", "Interstellar Age", "Galactic Age"];
  const ageNames = civilizationAges.map((age) => age.name);
  const identity = civilizationIdentity.find((row) => row.id === primaryCivilizationId);

  assert(ageNames.join("|") === expectedAges.join("|"), "Civilization Identity must publish the nine canonical ages in order.");
  assert(Boolean(identity), "Primary civilization identity is missing.");
  assert(identity?.civilization_name === "Humanity", "Primary civilization identity must remain Humanity.");
  assert(identity?.current_age === "Survival Age", "Seed civilization identity must start at Survival Age.");
  assert(civilizationAlignmentScores.length >= 5, "Civilization Identity must publish core alignment scores.");
  assert(civilizationMilestones.length >= 20, "Civilization Identity must publish milestone definitions.");
  assert(civilizationUnlockedMilestones.every((row) => row.civilization_id === primaryCivilizationId), "Unlocked civilization milestones must resolve to the primary civilization.");
  assert(civilizationTitles.length >= 10, "Civilization Identity must publish title definitions.");
  assert(civilizationBonuses.every((row) => row.civilization_id === primaryCivilizationId), "Civilization bonuses must resolve to the primary civilization.");
  assert(canonical.civilizationProgressionFramework.civilizationIdentitySource === "civilization_identity", "Canonical runtime progression must reference Civilization Identity.");
  assert(roblox.civilizationProgressionFramework.civilizationIdentitySource === "civilization_identity", "Roblox runtime progression must reference Civilization Identity.");

  console.log(JSON.stringify({
    ok: true,
    contentVersion: gameRuntimeContentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    ages: ageNames,
    identity: identity ? {
      id: identity.id,
      civilizationName: identity.civilization_name,
      currentAge: identity.current_age,
      title: identity.civilization_title,
      primaryAlignment: identity.primary_alignment
    } : null,
    alignments: civilizationAlignmentScores.length,
    milestones: civilizationMilestones.length,
    titles: civilizationTitles.length,
    bonuses: civilizationBonuses.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

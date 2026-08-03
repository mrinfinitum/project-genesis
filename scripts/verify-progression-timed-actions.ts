import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { canonicalActionSystem, validateActionSystem } from "@/lib/actions/action-system";
import { canonicalProgressionSystem, generateProgressionLevels, validateProgressionSystem } from "@/lib/progression/progression-system";

async function main() {
  const early = canonicalProgressionSystem.progressionProfiles[0];
  const future = canonicalProgressionSystem.progressionProfiles.at(-1)!;
  const first = generateProgressionLevels(early, { baseCost: 10, baseOutput: 1, resourceId: "RESOURCE-IRON" });
  const second = generateProgressionLevels(early, { baseCost: 10, baseOutput: 1, resourceId: "RESOURCE-IRON" });
  const late = generateProgressionLevels(future, { baseCost: 10, baseOutput: 1 });

  assert.equal(first.length, 100, "profiles generate Levels 1-100");
  assert.deepEqual(first, second, "same inputs generate identical explicit values and checksums");
  assert.equal(first[0].level, 1);
  assert.equal(first[99].level, 100);
  assert.equal(first[99].milestoneEffects.includes("mastery"), true, "Level 100 mastery override applies");
  assert.ok(first[9].xpRequired < first[99].xpRequired, "early progression is faster than late progression");
  assert.ok(first[9].durationSeconds < first[99].durationSeconds, "late durations exceed early durations");
  assert.ok(late[99].outputValue > first[99].outputValue, "future-era mastery output exceeds early-era mastery output");
  assert.ok(late[99].laborCost > first[99].laborCost, "future-era labor cost exceeds early-era labor cost");
  assert.ok(canonicalProgressionSystem.upgradeXpSourceProfiles.length >= 16, "XP source registry is complete");
  assert.ok(canonicalProgressionSystem.crystalChunks.every((chunk) => chunk.maximumUse > 0 && chunk.crystalCost > 0), "crystal chunks are capped and priced");
  assert.ok(canonicalProgressionSystem.crystalAccelerationProfiles.every((profile) => profile.prerequisiteBypassAllowed === false), "crystals protect prerequisites");
  assert.equal(validateProgressionSystem().filter((issue) => issue.severity === "error").length, 0, "progression validates");

  assert.equal(canonicalActionSystem.canonicalActionProfiles.length, canonicalActionSystem.actionDefinitions.length, "every action resolves a normalized profile");
  assert.ok(canonicalActionSystem.canonicalActionProfiles.some((profile) => profile.domain === "research"), "research actions resolve");
  assert.ok(canonicalActionSystem.canonicalActionProfiles.some((profile) => profile.domain === "mining"), "mining actions resolve");
  assert.ok(canonicalActionSystem.canonicalActionProfiles.some((profile) => profile.domain === "travel"), "travel actions resolve");
  assert.deepEqual(
    ["prepare_mission", "execute_mission", "return_mission"].map((id) => canonicalActionSystem.canonicalActionProfiles.some((profile) => profile.id === `action_profile_${id}`)),
    [true, true, true],
    "mission preparation, execution, and return phases resolve"
  );
  assert.ok(canonicalActionSystem.canonicalActionProfiles.some((profile) => profile.id === "action_profile_found_settlement"), "settlement actions resolve");
  assert.ok(canonicalActionSystem.canonicalActionProfiles.some((profile) => profile.id === "action_profile_construct_ship"), "ship construction resolves");
  assert.ok(canonicalActionSystem.actionQueueProfiles.every((profile) => profile.maxQueued >= profile.maxConcurrent), "queue limits are valid");
  assert.equal(validateActionSystem().filter((issue) => issue.severity === "error").length, 0, "action system validates");

  await Promise.all([
    "migration-audit/progression-system-before.json",
    "migration-audit/action-system-before.json",
    "migration-audit/crystal-system-before.json",
    "migration-audit/timer-system-before.json",
    "migration-audit/progression-migration-report.md",
    "migration-audit/action-migration-report.md"
  ].map((path) => access(path)));

  console.log(JSON.stringify({
    status: "Ready",
    progressionProfiles: canonicalProgressionSystem.progressionProfiles.length,
    generatedProfileLevels: canonicalProgressionSystem.generatedLevelCount,
    xpSources: canonicalProgressionSystem.upgradeXpSourceProfiles.length,
    crystalProfiles: canonicalProgressionSystem.crystalAccelerationProfiles.length,
    crystalChunks: canonicalProgressionSystem.crystalChunks.length,
    actionProfiles: canonicalActionSystem.canonicalActionProfiles.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

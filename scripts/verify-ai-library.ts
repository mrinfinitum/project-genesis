import { readFile } from "node:fs/promises";
import path from "node:path";
import { aiLibraryCategories, aiLibraryDesignContract, aiLibraryLegacyIdMigrations, aiLibraryRarities, aiLibraryVolumes, canonicalAiLibraryAgents, resolveCanonicalAiLibraryId, validateCanonicalAiLibrary } from "../lib/ai-agents/foundations";
import { groupAiRecords, normalizeAiRecord, parseAiBrowseMode, searchAiRecords } from "../lib/ai-agents/browser-utils";
import { AI_VOLUMES, romanNumeral } from "../lib/ai-agents/ai-volumes";
import { buildGameEngineExport, type EngineTarget } from "../lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, validateGameRuntimeData, validateRobloxRuntimePayload } from "../lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const validation = validateCanonicalAiLibrary();
  assert(validation.status === "Ready", validation.issues.join("\n"));
  assert(canonicalAiLibraryAgents.length === 2000, "AI Library Volumes I-XX must contain 2,000 agents.");
  assert(Math.min(...canonicalAiLibraryAgents.map((agent) => agent.max_level)) === 40 && Math.max(...canonicalAiLibraryAgents.map((agent) => agent.max_level)) === 150, "AI Library rarity level caps must span 40 through 150.");
  assert(canonicalAiLibraryAgents.filter((agent) => agent.rarity === "Genesis").length <= 40, "Genesis companions must remain below two percent of the library.");
  assert(new Set(canonicalAiLibraryAgents.map((agent) => agent.name.toLowerCase())).size === 2000, "Every AI companion must have a unique recognizable name.");
  assert(aiLibraryVolumes.length === 20, "AI Library must publish all twenty canonical volumes.");
  assert(aiLibraryDesignContract.activeAiSlots === 1 && aiLibraryDesignContract.inactiveBonusesEnabled === false, "AI Library must allow exactly one active companion and no inactive bonuses.");
  assert(aiLibraryDesignContract.directResourceProduction === false, "AI companions must never directly produce resources.");
  assert(canonicalAiLibraryAgents.every((agent) => agent.dialogue_examples.length === 3 && agent.generation && agent.discovery_location && agent.signature_passive_name), "Every AI companion must include its complete v2 identity contract.");
  assert(canonicalAiLibraryAgents.every((agent) => ["labor_efficiency", "manual_labor_bonus", "offline_labor_bonus", "xp_gain_modifier", "level_scaling", "automation_efficiency", "exploration_efficiency"].includes(agent.special_effect_type)), "Every AI effect must remain Labor, progression, automation, or exploration focused.");
  assert(aiLibraryLegacyIdMigrations.length === 1000, "Packs A and B must publish 1,000 legacy AI ID migrations.");
  assert(resolveCanonicalAiLibraryId("ai_v01_001_nova") === "ai_v01_001_byte_link", "Pack A must migrate the former first Volume I AI ID.");
  assert(resolveCanonicalAiLibraryId("ai_v05_100_lyric_guide") === "ai_v05_100_ledger_system", "Pack A must migrate the former final Volume V AI ID.");
  assert(resolveCanonicalAiLibraryId("ai_v06_001_yield_archive") === "ai_v06_001_margin_steward", "Pack B must migrate the former first Volume VI AI ID.");
  assert(resolveCanonicalAiLibraryId("ai_v10_100_nimbus_nexus") === "ai_v10_100_gaia_system", "Pack B must migrate the former final Volume X AI ID.");
  const authoredVolumeElevenAgents = canonicalAiLibraryAgents.filter((agent) => agent.volume === 11 && agent.tags.includes("authored_volume_11"));
  assert(authoredVolumeElevenAgents.length === 100, "Volume XI must include all one hundred authored Terraforming Initiative companions.");
  assert(authoredVolumeElevenAgents[0]?.name === "Auriga" && authoredVolumeElevenAgents[0]?.legacy_ai_ids?.includes("AI-XI-001"), "Authored Volume XI IDs must resolve through stable canonical aliases.");
  assert(authoredVolumeElevenAgents[20]?.name === "Verdigris" && authoredVolumeElevenAgents[20]?.legacy_ai_ids?.includes("AI-XI-021"), "Authored Volume XI Part 2 IDs must resolve through stable canonical aliases.");
  assert(authoredVolumeElevenAgents[39]?.name === "Genesis Bloom" && authoredVolumeElevenAgents[39]?.legacy_ai_ids?.includes("AI-XI-040"), "Authored Volume XI Part 2 must include Genesis Bloom at slot forty.");
  assert(authoredVolumeElevenAgents[40]?.name === "Aurora" && authoredVolumeElevenAgents[40]?.legacy_ai_ids?.includes("AI-XI-041"), "Authored Volume XI Part 3 IDs must resolve through stable canonical aliases.");
  assert(authoredVolumeElevenAgents[59]?.name === "Genesis Terra" && authoredVolumeElevenAgents[59]?.legacy_ai_ids?.includes("AI-XI-060"), "Authored Volume XI Part 3 must include Genesis Terra at slot sixty.");
  assert(authoredVolumeElevenAgents[60]?.name === "Verdantis" && authoredVolumeElevenAgents[60]?.legacy_ai_ids?.includes("AI-XI-061"), "Authored Volume XI Part 4 IDs must resolve through stable canonical aliases.");
  assert(authoredVolumeElevenAgents[79]?.name === "Genesis Sky" && authoredVolumeElevenAgents[79]?.legacy_ai_ids?.includes("AI-XI-080"), "Authored Volume XI Part 4 must include Genesis Sky at slot eighty.");
  assert(authoredVolumeElevenAgents[80]?.name === "Worldseed" && authoredVolumeElevenAgents[80]?.legacy_ai_ids?.includes("AI-XI-081"), "Authored Volume XI Part 5 IDs must resolve through stable canonical aliases.");
  assert(authoredVolumeElevenAgents[99]?.name === "Genesis" && authoredVolumeElevenAgents[99]?.legacy_ai_ids?.includes("AI-XI-100"), "Authored Volume XI Part 5 must include Genesis at slot one hundred.");
  const authoredVolumeTwelveAgents = canonicalAiLibraryAgents.filter((agent) => agent.volume === 12 && agent.tags.includes("authored_volume_12"));
  assert(authoredVolumeTwelveAgents.length === 20, "Volume XII must include the first twenty authored Education & Knowledge companions.");
  assert(authoredVolumeTwelveAgents[0]?.name === "Sagan" && authoredVolumeTwelveAgents[0]?.legacy_ai_ids?.includes("AI-XII-001"), "Authored Volume XII IDs must resolve through stable canonical aliases.");
  assert(authoredVolumeTwelveAgents[19]?.name === "Athena" && authoredVolumeTwelveAgents[19]?.legacy_ai_ids?.includes("AI-XII-020"), "Authored Volume XII Part 1 must include Athena at slot twenty.");

  assert(romanNumeral(11) === "XI" && romanNumeral(20) === "XX", "AI Library volume labels must use canonical Roman numerals.");
  const normalizedLegacy = normalizeAiRecord({ ai_id: "legacy-ai", name: "Legacy", title: "LEGACY", volume: 1, category: "General Intelligence", subcategory: "Universal Assistants", rarity: "Common", labor_per_second: 2, click_bonus: 3, offline_bonus: 1.5, passive: "Legacy Passive", discoveryLocation: "Archive" });
  assert(normalizedLegacy.baseLaborPerSecond === 2 && normalizedLegacy.baseClickLaborBonus === 3 && normalizedLegacy.offlineGenerationMultiplier === 1.5, "Legacy AI numeric fields must normalize without mutating imports.");
  assert(normalizedLegacy.signaturePassiveName === "Legacy Passive" && normalizedLegacy.discoveryLocation === "Archive", "Legacy AI text aliases must normalize.");
  const browserRecords = canonicalAiLibraryAgents.map(normalizeAiRecord);
  const volumeGroups = groupAiRecords(browserRecords, "volume");
  assert(volumeGroups.length === AI_VOLUMES.length && volumeGroups.every((group) => group.count === 100), "Volume browse mode must expose twenty data-driven groups of 100 canonical records.");
  assert(groupAiRecords(browserRecords, "category").length === 20, "Category browse mode must preserve all canonical categories.");
  assert(groupAiRecords(browserRecords, "rarity").length === 7, "Rarity browse mode must expose all seven canonical rarities.");
  assert(searchAiRecords(browserRecords, "AI-XI-021").some((record) => record.name === "Verdigris"), "AI Library search must resolve imported AI aliases.");
  assert(searchAiRecords(browserRecords, "Living Ground").some((record) => record.name === "Verdigris"), "AI Library search must include signature passives.");
  assert(parseAiBrowseMode("origin") === "origin" && parseAiBrowseMode("invalid") === "volume", "AI Library browse mode parsing must provide a stable Volume fallback.");

  const expectedCategoryCounts = new Map([
    ["civilization_systems", 100],
    ["exploration_systems", 100],
    ["general_intelligence", 100],
    ["industrial_systems", 100],
    ["scientific_systems", 100],
    ["economic_systems", 100],
    ["logistics_transportation", 100],
    ["medical_population", 100],
    ["government_administration", 100],
    ["environmental_systems", 100],
    ["terraforming_initiative", 100],
    ["education_knowledge", 100],
    ["cultural_preservation", 100],
    ["historical_archives", 100],
    ["first_contact", 100],
    ["ancient_intelligence", 100],
    ["experimental_intelligence", 100],
    ["genesis_intelligence", 100],
    ["companion_ai", 100],
    ["legendary_singularity_ai", 100]
  ]);
  assert(aiLibraryCategories.length === expectedCategoryCounts.size, "Canonical AI Library must contain the twenty authored categories.");
  for (const category of aiLibraryCategories) {
    const expectedCount = expectedCategoryCounts.get(category.id);
    assert(expectedCount !== undefined, `Unexpected AI Library category ${category.id}.`);
    assert(canonicalAiLibraryAgents.filter((agent) => agent.category_id === category.id).length === expectedCount, `${category.displayName} must contain ${expectedCount} agents.`);
    assert(category.subcategories.length > 0, `${category.displayName} must define at least one subcategory.`);
    assert(canonicalAiLibraryAgents.filter((agent) => agent.category_id === category.id).every((agent) => category.subcategories.includes(agent.subcategory)), `${category.displayName} contains an agent with an unresolved subcategory.`);
  }

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeValidation = validateGameRuntimeData(runtime);
  assert(runtime.aiLibrary.length === 2000, "Canonical runtime must export 2,000 AI Library records.");
  assert(runtime.aiCategories.length === aiLibraryCategories.length, "Canonical runtime category catalog is incomplete.");
  assert(runtime.aiRarity.length === aiLibraryRarities.length, "Canonical runtime rarity catalog is incomplete.");
  assert(runtimeValidation.status === "Ready", runtimeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const roblox = buildRobloxRuntimePayload(runtime);
  const robloxValidation = validateRobloxRuntimePayload(roblox);
  assert(roblox.aiLibrary.length === 2000, "Roblox runtime must export 2,000 AI Library records.");
  assert(robloxValidation.status === "Ready", robloxValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  for (const target of targets) {
    const payload = await buildGameEngineExport(target);
    assert(payload.validation.status === "Ready", `${target} export is not Ready.`);
    assert(Array.isArray(payload.canonical.ai_library) && payload.canonical.ai_library.length === 2000, `${target} export is missing the canonical AI Library.`);
  }

  const exported = JSON.parse(await readFile(path.join(process.cwd(), "data", "ai-agents", "exports", "ai_library.json"), "utf8")) as unknown[];
  assert(exported.length === 2000, "Generated ai_library.json must contain 2,000 records.");
  console.log(JSON.stringify({ status: "Ready", agents: 2000, volumes: 20, categories: aiLibraryCategories.length, rarities: aiLibraryRarities.length, engineExports: targets.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

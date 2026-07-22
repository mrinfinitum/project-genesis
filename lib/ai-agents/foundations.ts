import sourcePackA from "@/data/ai-agents/source/noveris_ai_library_pack_a_volumes_01_to_05.json";
import sourcePackAIdMigrations from "@/data/ai-agents/source/noveris_ai_library_pack_a_id_migrations.json";
import sourcePackB from "@/data/ai-agents/source/noveris_ai_library_pack_b_volumes_06_to_10.json";
import sourcePackBIdMigrations from "@/data/ai-agents/source/noveris_ai_library_pack_b_id_migrations.json";
import sourcePackC from "@/data/ai-agents/source/noveris_ai_library_pack_c_volumes_11_to_15.json";
import sourcePackD from "@/data/ai-agents/source/noveris_ai_library_pack_d_volumes_16_to_20.json";
import type { CanonicalAiLibraryAgent } from "@/types/runtime";

export const AI_LIBRARY_VERSION = sourcePackC.schemaVersion;
export const AI_LIBRARY_CONTENT_VERSION = Math.max(...sourcePackA.agents.map((agent) => agent.content_version), ...sourcePackB.agents.map((agent) => agent.content_version), ...sourcePackC.agents.map((agent) => agent.content_version), ...sourcePackD.agents.map((agent) => agent.content_version));
export const AI_LIBRARY_VOLUME_ID = "ai-volume-01-foundations";

export const aiLibraryDesignContract = {
  ...sourcePackC.designContract,
  libraryVersion: AI_LIBRARY_VERSION,
  totalVolumes: 20,
  targetAgentCount: 2000
} as const;

export const aiLibraryRarities = [
  { id: "common", displayName: "Common", order: 1, volumeOneAllowed: true },
  { id: "uncommon", displayName: "Uncommon", order: 2, volumeOneAllowed: true },
  { id: "rare", displayName: "Rare", order: 3, volumeOneAllowed: true },
  { id: "epic", displayName: "Epic", order: 4, volumeOneAllowed: true },
  { id: "legendary", displayName: "Legendary", order: 5, volumeOneAllowed: true },
  { id: "ancient", displayName: "Ancient", order: 6, volumeOneAllowed: true },
  { id: "genesis", displayName: "Genesis", order: 7, volumeOneAllowed: true }
] as const;

const sourceAgents = [...sourcePackA.agents, ...sourcePackB.agents, ...sourcePackC.agents, ...sourcePackD.agents];

const canonicalNamesById = new Map<string, string>();
const usedCanonicalNames = new Set<string>();
for (const agent of sourceAgents) {
  let candidate = agent.name;
  let qualifierIndex = 0;
  const qualifiers = [agent.subcategory, agent.category, `Volume ${agent.volume}`];
  while (usedCanonicalNames.has(candidate.toLowerCase())) {
    candidate = `${agent.name} ${qualifiers[qualifierIndex] ?? agent.library_index}`;
    qualifierIndex += 1;
  }
  canonicalNamesById.set(agent.ai_id, candidate);
  usedCanonicalNames.add(candidate.toLowerCase());
}

export const aiLibraryLegacyIdMigrations = [...sourcePackAIdMigrations.migrations, ...sourcePackBIdMigrations.migrations];
const canonicalIdByLegacyId = new Map(aiLibraryLegacyIdMigrations.map((migration) => [migration.legacyAiId, migration.canonicalAiId]));
const legacyIdsByCanonicalId = new Map(aiLibraryLegacyIdMigrations.map((migration) => [migration.canonicalAiId, [migration.legacyAiId]]));

export function resolveCanonicalAiLibraryId(aiId: string) {
  return canonicalIdByLegacyId.get(aiId) ?? aiId;
}

const volumeTitles = new Map<number, string>([
  ...sourcePackA.volumes.map((volume) => [volume.number, volume.title] as const),
  ...sourcePackB.volumes.map((volume) => [volume.number, volume.title] as const),
  ...sourcePackC.volumes.map((volume) => [volume.number, volume.title] as const),
  ...sourcePackD.volumes.map((volume) => [volume.number, volume.title] as const)
]);

function volumeId(volume: number, title: string) {
  return `ai-volume-${String(volume).padStart(2, "0")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

function canonicalLaborEffectType(value: string) {
  if (/offline/i.test(value)) return "offline_labor_bonus";
  if (/click|hands_on/i.test(value)) return "manual_labor_bonus";
  if (/experience|\bxp\b/i.test(value)) return "xp_gain_modifier";
  if (/level|upgrade_discount/i.test(value)) return "level_scaling";
  if (/explor|discover|signal|survey|navigation/i.test(value)) return "exploration_efficiency";
  if (/automation|maintenance|logistics|route|cargo|construction|manufacturing/i.test(value)) return "automation_efficiency";
  return "labor_efficiency";
}

export const aiLibraryVolumes = [...volumeTitles.entries()].map(([number, name]) => ({
  id: volumeId(number, name),
  number,
  name,
  version: AI_LIBRARY_VERSION
}));

export const aiLibraryPersonalities = [...new Set(sourceAgents.flatMap((agent) => [agent.personality_primary, agent.personality_secondary]))].sort();
export const aiLibraryVoices = [...new Set(sourceAgents.map((agent) => agent.voice_style))].sort();
export const aiLibraryAssignmentRoles = ["Active AI Assistant", "Labor Generation", "Offline Labor Generation"] as const;

export type CategoryProfile = {
  id: string;
  displayName: string;
  subcategory: string;
  subcategories: string[];
  purpose: string;
  primaryFunction: string;
  secondaryFunctions: string[];
  assignments: string[];
  bonuses: { labor: number; action: number; building: number; research: number; colony: number; automation: number };
  theme: string;
};

const categoryDefinitions = [
  ...sourceAgents
    .filter((agent, index, agents) => agents.findIndex((candidate) => candidate.category_id === agent.category_id) === index)
    .map((agent) => ({ id: agent.category_id, displayName: agent.category, subcategories: [] as string[] }))
];

export const aiLibraryCategories: CategoryProfile[] = categoryDefinitions.map((category) => ({
  id: category.id,
  displayName: category.displayName,
  subcategory: "Multiple specializations",
  subcategories: [...new Set([
    ...category.subcategories,
    ...sourceAgents.filter((agent) => agent.category_id === category.id).map((agent) => agent.subcategory)
  ])],
  purpose: aiLibraryDesignContract.primaryPurpose,
  primaryFunction: "Generate passive Labor",
  secondaryFunctions: ["Increase active click Labor", "Support offline Labor generation"],
  assignments: [...aiLibraryAssignmentRoles],
  bonuses: { labor: 1, action: 0, building: 0, research: 0, colony: 0, automation: 1 },
  theme: "Collectible NOVERIS companion intelligence"
}));

export const canonicalAiLibraryAgents: CanonicalAiLibraryAgent[] = sourceAgents.map((agent) => {
  const canonicalName = canonicalNamesById.get(agent.ai_id) ?? agent.name;
  const renamed = canonicalName !== agent.name;
  return {
    ...agent,
    name: canonicalName,
    codename: renamed ? canonicalName.toUpperCase() : agent.codename,
    hud_display_name: canonicalName,
    description: renamed ? agent.description.replaceAll(agent.name, canonicalName) : agent.description,
    lore: renamed ? agent.lore.replaceAll(agent.name, canonicalName) : agent.lore,
    library_sort: { ...agent.library_sort, quaternary: canonicalName },
    generation: "generation" in agent ? agent.generation : `Generation ${Math.min(9, Math.ceil(agent.volume / 2))}`,
    volume: agent.volume as CanonicalAiLibraryAgent["volume"],
    volume_title: agent.volume_title as CanonicalAiLibraryAgent["volume_title"],
    volume_id: volumeId(agent.volume, agent.volume_title),
    collection: volumeTitles.get(agent.volume) ?? agent.volume_title,
    category_id: agent.category_id,
    special_effect_type: canonicalLaborEffectType(agent.special_effect_type),
    legacy_ai_ids: legacyIdsByCanonicalId.get(agent.ai_id) ?? [],
    legacy_names: renamed ? [agent.name] : [],
    assignment_roles: agent.supports_offline_generation ? [...aiLibraryAssignmentRoles] : ["Active AI Assistant", "Labor Generation"],
    runtime_metadata: {
      schemaVersion: agent.schema_version,
      runtimeEnabled: agent.runtime_status === "Active",
      status: "canonical",
      localizationKey: `ai_agent.${agent.ai_id}`,
      portraitArtKey: `ai_agent_${agent.ai_id}_portrait`
    }
  };
});

export const aiLibraryLocalizationPlaceholders = canonicalAiLibraryAgents.map((agent) => ({
  id: agent.runtime_metadata.localizationKey,
  name: agent.name,
  description: agent.description,
  lore: agent.lore,
  primaryFunction: agent.primary_function,
  secondaryFunction: agent.secondary_function
}));

export function validateCanonicalAiLibrary(agents: CanonicalAiLibraryAgent[] = canonicalAiLibraryAgents) {
  const issues: string[] = [];
  const unique = (values: Array<string | number>) => new Set(values).size === values.length;
  const validRarities = new Set<string>(aiLibraryRarities.filter((rarity) => rarity.volumeOneAllowed).map((rarity) => rarity.displayName));
  const categories = new Map(aiLibraryCategories.map((category) => [category.id, category]));
  const laborEffectTypes = new Set(["labor_efficiency", "manual_labor_bonus", "offline_labor_bonus", "xp_gain_modifier", "level_scaling", "automation_efficiency", "exploration_efficiency"]);

  if (agents.length !== 2000) issues.push(`AI Library Volumes I-XX must contain exactly 2,000 agents; received ${agents.length}.`);
  if (!unique(agents.map((agent) => agent.ai_id))) issues.push("AI IDs must be unique.");
  if (!unique(agents.map((agent) => agent.name.toLowerCase()))) issues.push("AI companion names must be unique.");
  if (!unique(agents.map((agent) => `${agent.volume}:${agent.library_index}`))) issues.push("AI library indexes must be unique within each volume.");
  if (aiLibraryLegacyIdMigrations.length !== 1000) issues.push(`Packs A and B must provide exactly 1,000 legacy ID migrations; received ${aiLibraryLegacyIdMigrations.length}.`);
  if (!unique(aiLibraryLegacyIdMigrations.map((migration) => migration.legacyAiId))) issues.push("Legacy AI IDs must be unique across Packs A and B.");
  if (!unique(aiLibraryLegacyIdMigrations.map((migration) => migration.canonicalAiId))) issues.push("Canonical migration targets must be unique across Packs A and B.");
  if (aiLibraryLegacyIdMigrations.some((migration) => !agents.some((agent) => agent.ai_id === migration.canonicalAiId))) issues.push("Every AI ID migration must resolve to a canonical AI record.");

  for (const [volume, title] of volumeTitles) {
    const volumeAgents = agents.filter((agent) => agent.volume === volume);
    if (volumeAgents.length !== 100) issues.push(`Volume ${volume} must contain exactly 100 agents; received ${volumeAgents.length}.`);
    if (volumeAgents.some((agent) => agent.volume_title !== title)) issues.push(`Volume ${volume} must use the title ${title}.`);
  }

  for (const agent of agents) {
    if (!/^ai_v(?:0[1-9]|1\d|20)_\d{3}_[a-z0-9_]+$/.test(agent.ai_id)) issues.push(`${agent.ai_id} does not use the Volumes I-XX stable ID format.`);
    const category = categories.get(agent.category_id);
    if (!category || category.displayName !== agent.category || !category.subcategories.includes(agent.subcategory)) issues.push(`${agent.ai_id} has invalid category metadata.`);
    if (!validRarities.has(agent.rarity)) issues.push(`${agent.ai_id} uses invalid canonical rarity ${agent.rarity}.`);
    if (!agent.portrait_prompt || !agent.assignment_roles.length || !agent.primary_function || !agent.description || !agent.personality_primary || !agent.voice_style || !agent.discovery_location || !agent.generation || !agent.signature_passive_name || !agent.signature_passive_description || agent.dialogue_examples.length !== 3 || !agent.memory_fragment_1 || !agent.memory_fragment_2 || !agent.memory_fragment_3) issues.push(`${agent.ai_id} is missing required canonical companion fields.`);
    if (agent.starting_level !== 1 || agent.max_level < agent.starting_level) issues.push(`${agent.ai_id} has an invalid level range.`);
    if (agent.active_slot_limit !== aiLibraryDesignContract.activeAiSlots || !agent.can_be_active) issues.push(`${agent.ai_id} violates the one-active-assistant contract.`);
    if (!laborEffectTypes.has(agent.special_effect_type)) issues.push(`${agent.ai_id} uses non-canonical companion effect ${agent.special_effect_type}.`);
    if (!/labor/i.test(`${agent.primary_function} ${agent.secondary_function}`)) issues.push(`${agent.ai_id} must improve Labor rather than directly produce resources.`);
    if ([agent.base_labor_per_second, agent.base_click_labor_bonus, agent.offline_generation_multiplier, agent.experience_rate_multiplier, agent.level_growth_multiplier, agent.upgrade_cost_growth_multiplier].some((value) => !Number.isFinite(value) || value < 0)) issues.push(`${agent.ai_id} has invalid numeric progression values.`);
  }

  const actualDistribution = Object.fromEntries(aiLibraryRarities.map((rarity) => [rarity.displayName, agents.filter((agent) => agent.rarity === rarity.displayName).length]));
  const packAVolumeOneAgents = sourcePackA.agents.filter((agent) => agent.volume === 1);
  const packARarityDistribution = Object.fromEntries(aiLibraryRarities.map((rarity) => [rarity.displayName, packAVolumeOneAgents.filter((agent) => agent.rarity === rarity.displayName).length]));
  for (const [rarity, expectedPerVolume] of Object.entries(packARarityDistribution)) {
    const expected = expectedPerVolume * 20;
    if (actualDistribution[rarity] !== expected) issues.push(`${rarity} rarity count must be ${expected}; received ${actualDistribution[rarity] ?? 0}.`);
  }

  return { status: issues.length ? "Invalid" as const : "Ready" as const, issues };
}

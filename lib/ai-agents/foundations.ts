import sourcePackA from "@/data/ai-agents/source/noveris_ai_library_pack_a_volumes_01_to_05.json";
import sourcePackAIdMigrations from "@/data/ai-agents/source/noveris_ai_library_pack_a_id_migrations.json";
import sourcePackB from "@/data/ai-agents/source/noveris_ai_library_pack_b_volumes_06_to_10.json";
import sourcePackBIdMigrations from "@/data/ai-agents/source/noveris_ai_library_pack_b_id_migrations.json";
import type { CanonicalAiLibraryAgent } from "@/types/runtime";

export const AI_LIBRARY_VERSION = sourcePackA.schemaVersion;
export const AI_LIBRARY_CONTENT_VERSION = Math.max(...sourcePackA.agents.map((agent) => agent.content_version), ...sourcePackB.agents.map((agent) => agent.content_version));
export const AI_LIBRARY_VOLUME_ID = "ai-volume-01-foundations";

export const aiLibraryDesignContract = sourcePackA.designContract;

export const aiLibraryRarities = [
  { id: "common", displayName: "Common", order: 1, volumeOneAllowed: true },
  { id: "uncommon", displayName: "Uncommon", order: 2, volumeOneAllowed: true },
  { id: "specialized", displayName: "Specialized", order: 3, volumeOneAllowed: false },
  { id: "rare", displayName: "Rare", order: 4, volumeOneAllowed: true },
  { id: "epic", displayName: "Epic", order: 5, volumeOneAllowed: true },
  { id: "legendary", displayName: "Legendary", order: 6, volumeOneAllowed: true },
  { id: "ancient", displayName: "Ancient", order: 7, volumeOneAllowed: true },
  { id: "genesis", displayName: "Genesis", order: 8, volumeOneAllowed: true },
  { id: "mythic", displayName: "Mythic", order: 9, volumeOneAllowed: false },
  { id: "singularity", displayName: "Singularity", order: 10, volumeOneAllowed: false }
] as const;

const sourceAgents = [...sourcePackA.agents, ...sourcePackB.agents];

export const aiLibraryLegacyIdMigrations = [...sourcePackAIdMigrations.migrations, ...sourcePackBIdMigrations.migrations];
const canonicalIdByLegacyId = new Map(aiLibraryLegacyIdMigrations.map((migration) => [migration.legacyAiId, migration.canonicalAiId]));
const legacyIdsByCanonicalId = new Map(aiLibraryLegacyIdMigrations.map((migration) => [migration.canonicalAiId, [migration.legacyAiId]]));

export function resolveCanonicalAiLibraryId(aiId: string) {
  return canonicalIdByLegacyId.get(aiId) ?? aiId;
}

const volumeTitles = new Map<number, string>([
  ...sourcePackA.volumes.map((volume) => [volume.number, volume.title] as const),
  ...sourcePackB.volumes.map((volume) => [volume.number, volume.title] as const)
]);

function volumeId(volume: number, title: string) {
  return `ai-volume-${String(volume).padStart(2, "0")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
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

export const canonicalAiLibraryAgents: CanonicalAiLibraryAgent[] = sourceAgents.map((agent) => ({
  ...agent,
  volume: agent.volume as CanonicalAiLibraryAgent["volume"],
  volume_title: agent.volume_title as CanonicalAiLibraryAgent["volume_title"],
  volume_id: volumeId(agent.volume, agent.volume_title),
  collection: volumeTitles.get(agent.volume) ?? agent.volume_title,
  category_id: agent.category_id,
  legacy_ai_ids: legacyIdsByCanonicalId.get(agent.ai_id) ?? [],
  assignment_roles: agent.supports_offline_generation ? [...aiLibraryAssignmentRoles] : ["Active AI Assistant", "Labor Generation"],
  runtime_metadata: {
    schemaVersion: agent.schema_version,
    runtimeEnabled: agent.runtime_status === "Active",
    status: "canonical",
    localizationKey: `ai_agent.${agent.ai_id}`,
    portraitArtKey: `ai_agent_${agent.ai_id}_portrait`
  }
}));

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

  if (agents.length !== 1000) issues.push(`AI Library Volumes I-X must contain exactly 1,000 agents; received ${agents.length}.`);
  if (!unique(agents.map((agent) => agent.ai_id))) issues.push("AI IDs must be unique.");
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
    if (!/^ai_v(?:0[1-9]|10)_\d{3}_[a-z0-9_]+$/.test(agent.ai_id)) issues.push(`${agent.ai_id} does not use the Volumes I-X stable ID format.`);
    const category = categories.get(agent.category_id);
    if (!category || category.displayName !== agent.category || !category.subcategories.includes(agent.subcategory)) issues.push(`${agent.ai_id} has invalid category metadata.`);
    if (!validRarities.has(agent.rarity)) issues.push(`${agent.ai_id} uses invalid canonical rarity ${agent.rarity}.`);
    if (!agent.portrait_prompt || !agent.assignment_roles.length || !agent.primary_function || !agent.description || !agent.personality_primary || !agent.voice_style) issues.push(`${agent.ai_id} is missing required canonical fields.`);
    if (agent.starting_level !== 1 || agent.max_level < agent.starting_level) issues.push(`${agent.ai_id} has an invalid level range.`);
    if (agent.active_slot_limit !== aiLibraryDesignContract.activeAiSlots || !agent.can_be_active) issues.push(`${agent.ai_id} violates the one-active-assistant contract.`);
    if ([agent.base_labor_per_second, agent.base_click_labor_bonus, agent.offline_generation_multiplier, agent.experience_rate_multiplier, agent.level_growth_multiplier, agent.upgrade_cost_growth_multiplier].some((value) => !Number.isFinite(value) || value < 0)) issues.push(`${agent.ai_id} has invalid numeric progression values.`);
  }

  const actualDistribution = Object.fromEntries(aiLibraryRarities.map((rarity) => [rarity.displayName, agents.filter((agent) => agent.rarity === rarity.displayName).length]));
  const packAVolumeOneAgents = sourcePackA.agents.filter((agent) => agent.volume === 1);
  const packARarityDistribution = Object.fromEntries(aiLibraryRarities.map((rarity) => [rarity.displayName, packAVolumeOneAgents.filter((agent) => agent.rarity === rarity.displayName).length]));
  for (const [rarity, expectedPerVolume] of Object.entries(packARarityDistribution)) {
    const expected = expectedPerVolume * 10;
    if (actualDistribution[rarity] !== expected) issues.push(`${rarity} rarity count must be ${expected}; received ${actualDistribution[rarity] ?? 0}.`);
  }

  return { status: issues.length ? "Invalid" as const : "Ready" as const, issues };
}

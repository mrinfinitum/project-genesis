import sourcePackA from "@/data/ai-agents/source/noveris_ai_library_pack_a_volumes_01_to_05.json";
import sourcePackAIdMigrations from "@/data/ai-agents/source/noveris_ai_library_pack_a_id_migrations.json";
import sourcePackB from "@/data/ai-agents/source/noveris_ai_library_pack_b_volumes_06_to_10.json";
import sourcePackBIdMigrations from "@/data/ai-agents/source/noveris_ai_library_pack_b_id_migrations.json";
import sourcePackC from "@/data/ai-agents/source/noveris_ai_library_pack_c_volumes_11_to_15.json";
import sourcePackD from "@/data/ai-agents/source/noveris_ai_library_pack_d_volumes_16_to_20.json";
import authoredVolumeEleven from "@/data/ai-agents/source/volume_11_terraforming_initiative_authored.json";
import authoredVolumeElevenPartTwo from "@/data/ai-agents/source/volume_11_terraforming_initiative_part_2_authored.json";
import authoredVolumeElevenPartThree from "@/data/ai-agents/source/volume_11_terraforming_initiative_part_3_authored.json";
import type { CanonicalAiLibraryAgent } from "@/types/runtime";

export const AI_LIBRARY_VERSION = sourcePackC.schemaVersion;
export const AI_LIBRARY_CONTENT_VERSION = 5;
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

const authoredRarityProfiles = {
  Common: { rank: 1, weight: 55, maxLevel: 40, labor: 2.2, click: 1.1, offline: 0.35 },
  Uncommon: { rank: 2, weight: 28, maxLevel: 50, labor: 5.2, click: 2, offline: 0.6 },
  Rare: { rank: 3, weight: 11, maxLevel: 60, labor: 10.5, click: 3.5, offline: 1 },
  Epic: { rank: 4, weight: 4, maxLevel: 75, labor: 22, click: 6.5, offline: 1.7 },
  Legendary: { rank: 5, weight: 1.4, maxLevel: 90, labor: 45, click: 12, offline: 2.8 },
  Ancient: { rank: 6, weight: 0.4, maxLevel: 120, labor: 82, click: 23, offline: 4.5 },
  Genesis: { rank: 7, weight: 0.02, maxLevel: 150, labor: 150, click: 42, offline: 8.5 }
} as const;

const authoredVolumeElevenByIndex = new Map([
  ...authoredVolumeEleven.agents,
  ...authoredVolumeElevenPartTwo.agents,
  ...authoredVolumeElevenPartThree.agents
].map((agent) => [Number(agent.ai_id.split("-").at(-1)), agent]));
const authoredVolumeElevenAliases = new Map<string, string>();

function applyAuthoredVolumeEleven(agent: (typeof sourcePackC.agents)[number]) {
  if (agent.volume !== 11) return agent;
  const authored = authoredVolumeElevenByIndex.get(agent.library_index);
  if (!authored) return agent;
  const rarity = authoredRarityProfiles[authored.rarity as keyof typeof authoredRarityProfiles];
  authoredVolumeElevenAliases.set(agent.ai_id, authored.ai_id);
  return {
    ...agent,
    name: authored.name,
    codename: authored.name.toUpperCase(),
    title: authored.title,
    subcategory: authored.subcategory,
    rarity: authored.rarity,
    rarity_rank: rarity.rank,
    drop_weight: rarity.weight,
    origin: authored.discovery_location,
    discovery_location: authored.discovery_location,
    base_labor_per_second: rarity.labor,
    base_click_labor_bonus: rarity.click,
    offline_generation_multiplier: rarity.offline,
    max_level: rarity.maxLevel,
    evolution_id: rarity.rank >= 5 ? `${agent.ai_id}_awakened` : "",
    evolution_name: rarity.rank >= 5 ? `${authored.name} Awakened` : "",
    signature_passive_name: authored.signature_passive,
    signature_passive_description: `${authored.signature_passive} improves ${authored.subcategory.toLowerCase()} Labor efficiency while ${authored.name} is active.`,
    primary_function: "Generate passive Labor",
    secondary_function: `Improve Labor through ${authored.subcategory}`,
    description: `${authored.name}, ${authored.title}, is a ${authored.rarity.toLowerCase()} companion intelligence specializing in ${authored.subcategory.toLowerCase()} and Labor generation.`,
    lore: `${authored.name} was recovered from ${authored.discovery_location}. Three sealed memories preserve the unfinished story behind ${authored.signature_passive}.`,
    dialogue_examples: [`${authored.name} online. Ready when you are.`, `${authored.subcategory} systems are responding.`, "There is more in my memory than I can reach."],
    memory_fragment_1: `At level 10, ${authored.name} recalls arriving at ${authored.discovery_location}.`,
    memory_fragment_2: `At level 25, ${authored.name} reveals the first use of ${authored.signature_passive}.`,
    memory_fragment_3: `At level ${Math.min(50, rarity.maxLevel)}, ${authored.name} identifies the civilization that entrusted it with its final directive.`,
    portrait_prompt: `Premium NOVERIS sci-fi companion portrait of ${authored.name}, ${authored.title}, terraforming intelligence specializing in ${authored.subcategory.toLowerCase()}, ${authored.rarity.toLowerCase()} rarity treatment, centered memorable holographic persona, dark deep-space card background, cinematic rim light, collectible-quality game artwork, no text, square composition`,
    hud_display_name: authored.name,
    content_version: AI_LIBRARY_CONTENT_VERSION,
    tags: ["companion", "collectible", "labor", "terraforming_initiative", authored.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, "_"), authored.rarity.toLowerCase(), authored.signature_passive.toLowerCase().replace(/[^a-z0-9]+/g, "_"), "authored_volume_11"],
    library_sort: { ...agent.library_sort, secondary: authored.subcategory, tertiary: authored.rarity, quaternary: authored.name }
  };
}

const sourceAgents = [...sourcePackA.agents, ...sourcePackB.agents, ...sourcePackC.agents.map(applyAuthoredVolumeEleven), ...sourcePackD.agents];

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
    legacy_ai_ids: [...(legacyIdsByCanonicalId.get(agent.ai_id) ?? []), ...(authoredVolumeElevenAliases.has(agent.ai_id) ? [authoredVolumeElevenAliases.get(agent.ai_id)!] : [])],
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

  const genesisCount = agents.filter((agent) => agent.rarity === "Genesis").length;
  if (genesisCount < 20 || genesisCount > Math.floor(agents.length * 0.02)) issues.push(`Genesis companions must remain exceptionally rare; received ${genesisCount} of ${agents.length}.`);

  return { status: issues.length ? "Invalid" as const : "Ready" as const, issues };
}

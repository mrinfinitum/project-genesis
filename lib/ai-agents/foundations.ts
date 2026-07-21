import sourceLibrary from "@/data/ai-agents/source/noveris_ai_library_volume_1_full.json";
import type { CanonicalAiLibraryAgent } from "@/types/runtime";

export const AI_LIBRARY_VERSION = sourceLibrary.schemaVersion;
export const AI_LIBRARY_CONTENT_VERSION = sourceLibrary.contentVersion;
export const AI_LIBRARY_VOLUME_ID = "ai-volume-01-foundations";

export const aiLibraryDesignContract = sourceLibrary.designContract;

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

const sourceAgents = sourceLibrary.agents;

export const aiLibraryPersonalities = [...new Set(sourceAgents.flatMap((agent) => [agent.personality_primary, agent.personality_secondary]))].sort();
export const aiLibraryVoices = [...new Set(sourceAgents.map((agent) => agent.voice_style))].sort();
export const aiLibraryAssignmentRoles = ["Active AI Assistant", "Labor Generation", "Offline Labor Generation"] as const;

export type CategoryProfile = {
  id: string;
  displayName: string;
  subcategory: string;
  purpose: string;
  primaryFunction: string;
  secondaryFunctions: string[];
  assignments: string[];
  bonuses: { labor: number; action: number; building: number; research: number; colony: number; automation: number };
  theme: string;
};

export const aiLibraryCategories: CategoryProfile[] = [{
  id: "ai-assistant",
  displayName: "AI Assistant",
  subcategory: "Labor Generation",
  purpose: aiLibraryDesignContract.primaryPurpose,
  primaryFunction: "Generate passive Labor",
  secondaryFunctions: ["Increase active click Labor", "Support offline Labor generation"],
  assignments: [...aiLibraryAssignmentRoles],
  bonuses: { labor: 1, action: 0, building: 0, research: 0, colony: 0, automation: 1 },
  theme: "Collectible NOVERIS companion intelligence"
}];

export const canonicalAiLibraryAgents: CanonicalAiLibraryAgent[] = sourceAgents.map((agent) => ({
  ...agent,
  volume: 1,
  volume_title: "Foundations",
  volume_id: AI_LIBRARY_VOLUME_ID,
  collection: sourceLibrary.volume.title,
  category_id: "ai-assistant",
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

  if (agents.length !== sourceLibrary.volume.agentCount || agents.length !== 100) issues.push(`Volume I must contain exactly 100 agents; received ${agents.length}.`);
  if (!unique(agents.map((agent) => agent.ai_id))) issues.push("AI IDs must be unique.");
  if (!unique(agents.map((agent) => agent.name.toLowerCase()))) issues.push("AI names must be unique.");
  if (!unique(agents.map((agent) => agent.codename.toLowerCase()))) issues.push("AI codenames must be unique.");
  if (!unique(agents.map((agent) => agent.library_index))) issues.push("AI library indexes must be unique.");

  for (const agent of agents) {
    if (!/^ai_v01_\d{3}_[a-z0-9_]+$/.test(agent.ai_id)) issues.push(`${agent.ai_id} does not use the Volume I stable ID format.`);
    if (agent.volume !== 1 || agent.volume_title !== "Foundations") issues.push(`${agent.ai_id} has invalid volume metadata.`);
    if (!agent.category || !agent.subcategory || agent.category_id !== "ai-assistant") issues.push(`${agent.ai_id} has invalid category metadata.`);
    if (!validRarities.has(agent.rarity)) issues.push(`${agent.ai_id} uses invalid Volume I rarity ${agent.rarity}.`);
    if (!agent.portrait_prompt || !agent.assignment_roles.length || !agent.primary_function || !agent.description || !agent.personality_primary || !agent.voice_style) issues.push(`${agent.ai_id} is missing required canonical fields.`);
    if (agent.starting_level !== 1 || agent.max_level < agent.starting_level) issues.push(`${agent.ai_id} has an invalid level range.`);
    if (agent.active_slot_limit !== aiLibraryDesignContract.activeAiSlots || !agent.can_be_active) issues.push(`${agent.ai_id} violates the one-active-assistant contract.`);
    if ([agent.base_labor_per_second, agent.base_click_labor_bonus, agent.offline_generation_multiplier, agent.experience_rate_multiplier, agent.level_growth_multiplier, agent.upgrade_cost_growth_multiplier].some((value) => !Number.isFinite(value) || value < 0)) issues.push(`${agent.ai_id} has invalid numeric progression values.`);
  }

  const actualDistribution = Object.fromEntries(aiLibraryRarities.map((rarity) => [rarity.displayName, agents.filter((agent) => agent.rarity === rarity.displayName).length]));
  for (const [rarity, expected] of Object.entries(sourceLibrary.rarityDistribution)) {
    if (actualDistribution[rarity] !== expected) issues.push(`${rarity} rarity count must be ${expected}; received ${actualDistribution[rarity] ?? 0}.`);
  }

  return { status: issues.length ? "Invalid" as const : "Ready" as const, issues };
}

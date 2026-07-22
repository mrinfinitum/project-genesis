import { AI_VOLUMES, aiVolumeLabel } from "@/lib/ai-agents/ai-volumes";

export const AI_BROWSE_MODES = ["volume", "category", "rarity", "origin", "discovery-location"] as const;
export const AI_RARITY_NAMES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Ancient", "Genesis"] as const;
export type AiBrowseMode = (typeof AI_BROWSE_MODES)[number];

export type AiAgentBrowserRecord = {
  id: string; name: string; codename: string; title?: string; volume: number; volumeTitle: string; volumeLabel: string; libraryIndex: number;
  description: string; lore: string; categoryId: string; categoryName: string; subcategory: string; rarity: string; aiType: string;
  primaryFunction: string; secondaryFunction: string; personalityPrimary: string; personalitySecondary: string; voiceStyle: string;
  origin: string; discoveryLocation: string; discoveryMethod: string; activationMethod: string; baseLaborPerSecond: number;
  baseClickLaborBonus: number; offlineGenerationMultiplier: number; experienceRateMultiplier: number; maxLevel: number; evolutionName: string;
  signaturePassiveName: string; signaturePassiveDescription: string; memoryFragments: string[]; dialogueExamples: string[]; portraitPrompt: string;
  tags: string[]; aliases: string[]; assignmentRoles: string[]; runtimeStatus: string; portraitUrl?: string;
};

export type AiBrowseSubgroup = { id: string; label: string; count: number; records: AiAgentBrowserRecord[] };
export type AiBrowseGroup = { id: string; label: string; count: number; records: AiAgentBrowserRecord[]; children: AiBrowseSubgroup[] };
export type AiAgentBrowserState = { records: AiAgentBrowserRecord[]; totalRecords: number; validationWarnings: string[] };

function text(value: unknown, fallback = "") { return typeof value === "string" && value.trim() ? value.trim() : fallback; }
function number(value: unknown, fallback = 0) { const parsed = typeof value === "number" ? value : Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function stringArray(value: unknown) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : typeof value === "string" && value.trim() ? [value.trim()] : []; }

export function slug(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

export function normalizeAiRecord(input: unknown): AiAgentBrowserRecord {
  const record = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const volume = number(record.volume);
  const volumeTitle = text(record.volume_title, AI_VOLUMES.find((entry) => entry.volume === volume)?.title ?? "Unknown Volume");
  const runtimeMetadata = (record.runtime_metadata && typeof record.runtime_metadata === "object" ? record.runtime_metadata : {}) as Record<string, unknown>;
  return {
    id: text(record.ai_id, text(record.id, "missing-ai-id")), name: text(record.name, "Unnamed Assistant"),
    codename: text(record.codename, text(record.title, text(record.name, "Unnamed Assistant"))), title: text(record.title) || undefined,
    volume, volumeTitle, volumeLabel: aiVolumeLabel(volume, volumeTitle), libraryIndex: number(record.library_index),
    description: text(record.description, "No canonical description has been authored."), lore: text(record.lore, "No canonical lore has been authored."),
    categoryId: text(record.category_id, slug(text(record.category, "uncategorized"))), categoryName: text(record.category, "Uncategorized"),
    subcategory: text(record.subcategory, "Uncategorized"), rarity: text(record.rarity, "Common"), aiType: text(record.ai_type, "AI Assistant"),
    primaryFunction: text(record.primary_function, "Not authored"), secondaryFunction: text(record.secondary_function, "Not authored"),
    personalityPrimary: text(record.personality_primary, text(record.personality, "Not authored")), personalitySecondary: text(record.personality_secondary, "Not authored"),
    voiceStyle: text(record.voice_style, "Not authored"), origin: text(record.origin, "Unknown"),
    discoveryLocation: text(record.discovery_location, text(record.discoveryLocation, "Unknown")), discoveryMethod: text(record.discovery_method, "Unknown"),
    activationMethod: text(record.activation_method, "Unknown"), baseLaborPerSecond: number(record.base_labor_per_second, number(record.labor_per_second)),
    baseClickLaborBonus: number(record.base_click_labor_bonus, number(record.click_bonus)), offlineGenerationMultiplier: number(record.offline_generation_multiplier, number(record.offline_bonus, 1)),
    experienceRateMultiplier: number(record.experience_rate_multiplier, 1), maxLevel: number(record.max_level), evolutionName: text(record.evolution_name, "None"),
    signaturePassiveName: text(record.signature_passive_name, text(record.passive, "Not authored")), signaturePassiveDescription: text(record.signature_passive_description, "No passive description has been authored."),
    memoryFragments: [record.memory_fragment_1, record.memory_fragment_2, record.memory_fragment_3].map((value) => text(value)).filter(Boolean),
    dialogueExamples: stringArray(record.dialogue_examples), portraitPrompt: text(record.portrait_prompt), tags: stringArray(record.tags), aliases: stringArray(record.legacy_ai_ids),
    assignmentRoles: stringArray(record.assignment_roles), runtimeStatus: text(record.runtime_status, "Unknown"), portraitUrl: text(record.portrait_url, text(runtimeMetadata.portraitUrl)) || undefined
  };
}

function recordsBy<T extends string | number>(records: AiAgentBrowserRecord[], key: (record: AiAgentBrowserRecord) => T) {
  const groups = new Map<T, AiAgentBrowserRecord[]>();
  for (const record of records) groups.set(key(record), [...(groups.get(key(record)) ?? []), record]);
  return groups;
}

function subgroups(records: AiAgentBrowserRecord[], field: (record: AiAgentBrowserRecord) => string) {
  return [...recordsBy(records, field).entries()].map(([label, members]) => ({ id: slug(label), label, count: members.length, records: members.slice().sort((a, b) => a.libraryIndex - b.libraryIndex) })).sort((a, b) => a.label.localeCompare(b.label));
}

export function groupAiRecords(records: AiAgentBrowserRecord[], mode: AiBrowseMode): AiBrowseGroup[] {
  if (mode === "volume") {
    const byVolume = recordsBy(records, (record) => record.volume);
    return AI_VOLUMES.map((volume) => { const members = byVolume.get(volume.volume) ?? []; return { id: `volume-${volume.volume}`, label: aiVolumeLabel(volume.volume), count: members.length, records: members, children: subgroups(members, (record) => record.subcategory) }; });
  }
  const definitions = mode === "rarity" ? [...AI_RARITY_NAMES] : [...new Set(records.map((record) => mode === "category" ? record.categoryName : mode === "origin" ? record.origin : record.discoveryLocation))].sort();
  return definitions.map((label) => {
    const members = records.filter((record) => (mode === "category" ? record.categoryName : mode === "rarity" ? record.rarity : mode === "origin" ? record.origin : record.discoveryLocation) === label);
    return { id: `${mode}-${slug(label)}`, label, count: members.length, records: members, children: subgroups(members, mode === "category" ? (record) => record.subcategory : (record) => record.categoryName) };
  });
}

export function searchAiRecords(records: AiAgentBrowserRecord[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return records;
  return records.filter((record) => [record.name, record.codename, record.id, ...record.aliases, record.volumeTitle, record.categoryName, record.subcategory, record.rarity, record.origin, record.discoveryLocation, record.signaturePassiveName, ...record.tags].join(" ").toLowerCase().includes(needle));
}

export function parseAiBrowseMode(value: unknown): AiBrowseMode { return typeof value === "string" && (AI_BROWSE_MODES as readonly string[]).includes(value) ? value as AiBrowseMode : "volume"; }

export function validateAiBrowserRecords(records: AiAgentBrowserRecord[]) {
  const warnings: string[] = [];
  const validRarities = new Set<string>(AI_RARITY_NAMES);
  const ids = new Set<string>();
  for (const record of records) {
    if (!record.id || record.id === "missing-ai-id") warnings.push("A record is missing ai_id."); else if (ids.has(record.id)) warnings.push(`${record.id} is duplicated.`);
    ids.add(record.id);
    if (!record.name || record.name === "Unnamed Assistant") warnings.push(`${record.id} is missing a name.`);
    if (!AI_VOLUMES.some((volume) => volume.volume === record.volume)) warnings.push(`${record.id} has invalid volume ${record.volume}.`);
    if (!validRarities.has(record.rarity)) warnings.push(`${record.id} has unknown rarity ${record.rarity}.`);
    if (!record.categoryName || record.categoryName === "Uncategorized") warnings.push(`${record.id} is missing a category.`);
    if (!record.subcategory || record.subcategory === "Uncategorized") warnings.push(`${record.id} is missing a subcategory.`);
    if (record.primaryFunction === "Not authored") warnings.push(`${record.id} is missing its primary function.`);
    if (record.baseLaborPerSecond < 0 || record.baseClickLaborBonus < 0 || record.offlineGenerationMultiplier < 0) warnings.push(`${record.id} has invalid Labor values.`);
    if (record.signaturePassiveName === "Not authored") warnings.push(`${record.id} is missing its signature passive.`);
    if (!record.portraitPrompt) warnings.push(`${record.id} is missing its portrait prompt.`);
    if (record.memoryFragments.length < 3) warnings.push(`${record.id} is missing memory fragments.`);
  }
  return warnings;
}

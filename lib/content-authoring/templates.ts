import { civilizationAges } from "@/data/civilization-identity";
import { survivalContentPack, type ContentPackCategory } from "@/data/content-packs/survival";

export type AuthoringStatus = "Draft" | "Ready" | "In Review" | "Approved" | "Published";
export type TemplateKind =
  | "Resource"
  | "Building"
  | "Research"
  | "Production Chain"
  | "Upgrade Chain"
  | "Mission"
  | "Event"
  | "Collectible"
  | "Era";

export type ContentTemplateDefinition = {
  id: string;
  kind: TemplateKind;
  title: string;
  status: AuthoringStatus;
  description: string;
  requirementProfiles: string[];
  assetRequirements: string[];
  validationDefaults: string[];
  productionMetadata: string[];
  relationships: string[];
};

export type WizardStep = {
  id: string;
  title: string;
  choices: string[];
  output: string;
};

export type AuthoringWizardDefinition = {
  id: string;
  kind: TemplateKind;
  title: string;
  steps: WizardStep[];
};

export type ScaffoldItemType =
  | "resource"
  | "building"
  | "research"
  | "production_chain"
  | "upgrade_chain"
  | "mission"
  | "event"
  | "collectible"
  | "art_requirement"
  | "audio"
  | "production_task";

export type EraScaffoldItem = {
  id: string;
  type: ScaffoldItemType;
  name: string;
  status: AuthoringStatus;
  templateId: string;
  description: string;
  linkedIds: string[];
  requirementProfileId: string;
  assetRequirementIds: string[];
  validationDefaults: string[];
  productionTaskId: string;
};

export type EraScaffoldRelationship = {
  id: string;
  fromId: string;
  toId: string;
  relationship: string;
  suggestedBy: string;
};

export type EraProductionEstimate = {
  hours: number;
  assets: number;
  research: number;
  buildings: number;
  production: number;
  art: number;
  audio: number;
  overallCompletion: number;
};

export type EraScaffoldValidation = {
  status: "Valid Draft" | "Needs Review";
  duplicateIds: string[];
  missingLinks: string[];
  missingRequirementProfiles: string[];
  missingProductionTasks: string[];
  checks: Array<{ label: string; passed: boolean }>;
};

export type EraScaffold = {
  id: string;
  eraId: string;
  eraName: string;
  sourceEraId?: string;
  sourceEraName?: string;
  status: AuthoringStatus;
  mode: "starter_kit" | "duplicate_era" | "procedural_scaffold";
  createdAt: string;
  updatedAt: string;
  items: EraScaffoldItem[];
  relationships: EraScaffoldRelationship[];
  estimates: EraProductionEstimate;
  validation: EraScaffoldValidation;
  notes: string;
};

export type ContentAuthoringState = {
  templates: ContentTemplateDefinition[];
  wizards: AuthoringWizardDefinition[];
  scaffolds: EraScaffold[];
  nextSuggestedEra: { id: string; name: string };
  stats: {
    templateCount: number;
    wizardCount: number;
    scaffoldCount: number;
    draftItemCount: number;
    estimatedHours: number;
  };
};

type EraProfile = {
  eraId: string;
  eraName: string;
  resources: string[];
  buildings: string[];
  research: string[];
  missions: string[];
  events: string[];
  collectibles: string[];
  productionChains: string[];
  upgradeChains: string[];
  art: string[];
  audio: string[];
};

const createdAt = "2026-07-13T00:00:00.000Z";

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const contentTemplateDefinitions: ContentTemplateDefinition[] = [
  {
    id: "template_resource",
    kind: "Resource",
    title: "Resource Template",
    status: "Ready",
    description: "Canonical resource authoring shell with Resource Catalog identity, economy usage, production hooks, and art requirements.",
    requirementProfiles: ["resource_identity_v1", "resource_usage_v1", "resource_art_v1"],
    assetRequirements: ["icon", "thumbnail", "card"],
    validationDefaults: ["stable id", "unique name", "category selected", "era selected", "production uses linked"],
    productionMetadata: ["priority", "owner", "estimate", "source table", "export readiness"],
    relationships: ["research unlocks", "building inputs", "production outputs", "mission rewards", "art requirements"]
  },
  {
    id: "template_building",
    kind: "Building",
    title: "Building Template",
    status: "Ready",
    description: "Building shell with unlock research, inputs, outputs, workers, upgrade path, requirement profile, and production tasks.",
    requirementProfiles: ["building_gameplay_v1", "building_art_v1", "building_balance_v1"],
    assetRequirements: ["icon", "card", "thumbnail", "model or render"],
    validationDefaults: ["stable id", "unlock exists", "inputs resolve", "outputs resolve", "upgrade path defined"],
    productionMetadata: ["workers", "construction tier", "balance estimate", "art owner"],
    relationships: ["resources consumed", "resources produced", "research unlock", "mission objective", "upgrade chain"]
  },
  {
    id: "template_research",
    kind: "Research",
    title: "Research Template",
    status: "Ready",
    description: "Research node shell that suggests downstream buildings, resources, missions, events, production chains, and art.",
    requirementProfiles: ["research_unlock_v1", "research_art_v1", "research_progression_v1"],
    assetRequirements: ["icon", "card", "tree node"],
    validationDefaults: ["stable id", "era exists", "dependencies resolve", "unlock rows exist", "icon key present"],
    productionMetadata: ["science cost", "era position", "alignment effect", "unlock summary"],
    relationships: ["prerequisite research", "unlocked buildings", "unlocked resources", "missions", "events"]
  },
  {
    id: "template_production_chain",
    kind: "Production Chain",
    title: "Production Chain Template",
    status: "Ready",
    description: "Visual chain shell for inputs, intermediate transforms, outputs, consumers, balance, and blockers.",
    requirementProfiles: ["chain_visual_v1", "chain_balance_v1"],
    assetRequirements: ["diagram", "node icons"],
    validationDefaults: ["input IDs resolve", "output IDs resolve", "consumer exists", "no circular missing links"],
    productionMetadata: ["throughput", "required building", "unlock stage"],
    relationships: ["resource input", "building processor", "resource output", "mission objective"]
  },
  {
    id: "template_upgrade_chain",
    kind: "Upgrade Chain",
    title: "Upgrade Chain Template",
    status: "Ready",
    description: "Five-step upgrade shell with costs, modifiers, research requirements, and UI placement.",
    requirementProfiles: ["upgrade_balance_v1", "upgrade_art_v1"],
    assetRequirements: ["icon", "panel badge"],
    validationDefaults: ["tab exists", "cost resource exists", "era exists", "levels are sequential"],
    productionMetadata: ["cost curve", "effect curve", "runtime tab"],
    relationships: ["research prerequisite", "resource cost", "building affected", "runtime upgrade tab"]
  },
  {
    id: "template_mission",
    kind: "Mission",
    title: "Mission Template",
    status: "Ready",
    description: "Mission shell with objectives, rewards, prerequisites, tutorial hooks, and production status.",
    requirementProfiles: ["mission_objectives_v1", "mission_rewards_v1", "mission_art_v1"],
    assetRequirements: ["icon", "objective card"],
    validationDefaults: ["objectives exist", "rewards resolve", "prerequisites resolve", "completion path exists"],
    productionMetadata: ["priority", "difficulty", "estimated minutes", "tutorial role"],
    relationships: ["research prerequisite", "building objective", "resource reward", "event trigger"]
  },
  {
    id: "template_event",
    kind: "Event",
    title: "Event Template",
    status: "Ready",
    description: "Event shell with triggers, counters, effects, art/audio needs, and mission hooks.",
    requirementProfiles: ["event_trigger_v1", "event_counterplay_v1", "event_art_audio_v1"],
    assetRequirements: ["event art", "icon", "audio sting"],
    validationDefaults: ["trigger exists", "counter exists", "effect target exists", "severity selected"],
    productionMetadata: ["frequency", "severity", "counterplay", "timeline importance"],
    relationships: ["resource pressure", "building counter", "research counter", "mission branch"]
  },
  {
    id: "template_collectible",
    kind: "Collectible",
    title: "Collectible Template",
    status: "Ready",
    description: "Collectible shell with rarity, discovery source, gameplay effect, art, and journal metadata.",
    requirementProfiles: ["collectible_discovery_v1", "collectible_art_v1"],
    assetRequirements: ["icon", "card", "thumbnail"],
    validationDefaults: ["rarity selected", "source exists", "journal tag exists", "art key present"],
    productionMetadata: ["drop source", "rarity", "museum value", "collection set"],
    relationships: ["resource source", "building source", "event source", "mission reward"]
  },
  {
    id: "template_era",
    kind: "Era",
    title: "Era Template",
    status: "Ready",
    description: "Era starter kit that generates draft content, estimates, tasks, requirement profiles, and relationship scaffolds.",
    requirementProfiles: ["era_pack_v1", "era_art_v1", "era_progression_v1"],
    assetRequirements: ["hero", "banner", "loading", "background", "timeline icon"],
    validationDefaults: ["era id unique", "canonical order preserved", "draft items unique", "tasks generated"],
    productionMetadata: ["estimated hours", "asset count", "draft count", "completion target"],
    relationships: ["resources", "buildings", "research", "chains", "missions", "events", "art", "audio"]
  }
];

export const authoringWizards: AuthoringWizardDefinition[] = [
  {
    id: "wizard_resource",
    kind: "Resource",
    title: "New Resource",
    steps: [
      { id: "category", title: "Category", choices: ["Element", "Compound", "Biological", "Manufactured", "Energy"], output: "resourceClass and category" },
      { id: "era", title: "Era", choices: civilizationAges.map((age) => age.name.replace(/\s+Age$/, "")), output: "discoveredEra and usableEra" },
      { id: "dependencies", title: "Dependencies", choices: ["Research", "Building", "Production Chain", "Mission"], output: "relationship suggestions" },
      { id: "artwork", title: "Artwork", choices: ["Icon", "Card", "Thumbnail"], output: "asset requirements" },
      { id: "production", title: "Production", choices: ["Input", "Output", "Tradable", "Crafting"], output: "production metadata and validation" }
    ]
  },
  {
    id: "wizard_building",
    kind: "Building",
    title: "New Building",
    steps: [
      { id: "role", title: "Role", choices: ["Housing", "Production", "Research", "Storage", "Defense", "Trade"], output: "building category" },
      { id: "unlock", title: "Unlock", choices: ["Research", "Mission", "Era Start"], output: "unlock relationship" },
      { id: "inputs_outputs", title: "Inputs / Outputs", choices: ["Resources", "Workers", "Population", "Power"], output: "production chain suggestions" },
      { id: "upgrade", title: "Upgrade Path", choices: ["Five Levels", "Era Variant", "No Upgrade"], output: "upgrade chain scaffold" },
      { id: "assets", title: "Artwork", choices: ["Icon", "Card", "Render"], output: "asset tasks" }
    ]
  },
  {
    id: "wizard_research",
    kind: "Research",
    title: "New Research",
    steps: [
      { id: "branch", title: "Branch", choices: ["Survival", "Industry", "Science", "Culture", "Economy", "Exploration"], output: "research branch" },
      { id: "dependencies", title: "Dependencies", choices: ["Previous Research", "Mission", "Building"], output: "prerequisite graph" },
      { id: "unlocks", title: "Unlocks", choices: ["Buildings", "Resources", "Production Chains", "Missions", "Events", "Art"], output: "suggested related content" },
      { id: "balance", title: "Balance", choices: ["Cost", "Era Position", "Discovery Points"], output: "progression defaults" },
      { id: "assets", title: "Artwork", choices: ["Icon", "Tree Node", "Card"], output: "asset tasks" }
    ]
  },
  {
    id: "wizard_mission",
    kind: "Mission",
    title: "New Mission",
    steps: [
      { id: "purpose", title: "Purpose", choices: ["Tutorial", "Progression", "Discovery", "Production", "Event Response"], output: "mission type" },
      { id: "objectives", title: "Objectives", choices: ["Gather", "Build", "Research", "Explore", "Survive"], output: "objective records" },
      { id: "rewards", title: "Rewards", choices: ["Resources", "Research", "Unlock", "Collectible"], output: "reward records" },
      { id: "links", title: "Links", choices: ["Building", "Research", "Event", "Production Chain"], output: "relationship graph" },
      { id: "assets", title: "Artwork", choices: ["Icon", "Objective Card"], output: "asset tasks" }
    ]
  },
  {
    id: "wizard_event",
    kind: "Event",
    title: "New Event",
    steps: [
      { id: "trigger", title: "Trigger", choices: ["Timer", "Resource Shortage", "Building", "Mission", "Random Pool"], output: "event trigger" },
      { id: "effect", title: "Effect", choices: ["Resource", "Population", "Production", "Morale", "Stability"], output: "effect target" },
      { id: "counter", title: "Counterplay", choices: ["Research", "Building", "Resource", "Mission"], output: "counter relationships" },
      { id: "severity", title: "Severity", choices: ["Low", "Medium", "High", "Legendary"], output: "balance defaults" },
      { id: "assets", title: "Artwork / Audio", choices: ["Event Art", "Icon", "Stinger"], output: "production tasks" }
    ]
  }
];

const eraProfiles: EraProfile[] = [
  {
    eraId: "ancient",
    eraName: "Ancient",
    resources: ["Grain", "Copper", "Bronze", "Pottery", "Papyrus", "Salt", "Limestone", "Olive Oil", "Livestock", "Charcoal"],
    buildings: ["Granary", "Farmstead", "Pottery Kiln", "Copper Mine", "Bronze Workshop", "Irrigation Canal", "Marketplace", "Scribe Hall", "Stone Road", "Shrine"],
    research: ["Agriculture", "Pottery", "Irrigation", "Bronze Working", "Writing", "Mathematics", "Trade Routes", "Masonry", "Animal Husbandry", "Civic Rituals"],
    missions: ["Plant First Fields", "Build Granary", "Fire Pottery Kiln", "Mine Copper", "Forge Bronze Tools", "Write First Records", "Open Marketplace", "Reach Medieval Era"],
    events: ["River Flood", "Locust Swarm", "Harvest Festival", "Bronze Shortage", "Market Boom", "Temple Omen"],
    collectibles: ["Ceremonial Seal", "Bronze Idol", "Clay Tablet", "Royal Scarab", "Ancient Coin"],
    productionChains: ["Grain to Population", "Clay to Pottery", "Copper and Tin to Bronze", "Limestone to Masonry"],
    upgradeChains: ["Farm Efficiency", "Bronze Tooling", "Road Logistics", "Market Trade"],
    art: ["Ancient Hero", "Ancient Banner", "Ancient Loading Screen", "Ancient Resource Icons", "Ancient Building Cards"],
    audio: ["Ancient Theme", "Marketplace Loop", "Temple Chime", "River Ambience"]
  },
  {
    eraId: "medieval",
    eraName: "Medieval",
    resources: ["Iron", "Wool", "Timber", "Leather", "Grain", "Stone", "Silver", "Herbs"],
    buildings: ["Castle Keep", "Blacksmith", "Guild Hall", "Water Mill", "Market Square", "Monastery", "Watchtower", "Stables"],
    research: ["Feudal Contracts", "Iron Forging", "Guild Labor", "Milling", "Navigation", "Herbal Medicine", "Fortifications", "Regional Trade"],
    missions: ["Build Keep", "Form Guild", "Forge Iron Tools", "Open Regional Market", "Defend Settlement", "Reach Renaissance"],
    events: ["Bandit Raid", "Plague Scare", "Tournament", "Bad Harvest", "Merchant Caravan", "Border Dispute"],
    collectibles: ["Knight Crest", "Guild Charter", "Monk Manuscript", "Silver Chalice"],
    productionChains: ["Iron Ore to Tools", "Grain to Flour", "Wool to Cloth", "Timber to Fortifications"],
    upgradeChains: ["Guild Productivity", "Fortress Defense", "Market Logistics"],
    art: ["Medieval Hero", "Medieval Banner", "Medieval Building Cards", "Medieval Event Art"],
    audio: ["Medieval Theme", "Market Crowd", "Forge Loop"]
  }
];

function fallbackEraProfile(eraId: string, eraName: string): EraProfile {
  const label = eraName.replace(/\s+Age$/, "");
  return {
    eraId,
    eraName: label,
    resources: [`${label} Material`, `${label} Energy`, `${label} Data`, `${label} Alloy`, `${label} Culture`],
    buildings: [`${label} Hub`, `${label} Workshop`, `${label} Research Center`, `${label} Storage`, `${label} Trade Node`],
    research: [`${label} Foundations`, `${label} Production`, `${label} Logistics`, `${label} Discovery`, `${label} Governance`],
    missions: [`Begin ${label}`, `Build ${label} Hub`, `Research ${label} Foundations`, `Stabilize ${label} Production`, `Complete ${label}`],
    events: [`${label} Breakthrough`, `${label} Shortage`, `${label} Festival`, `${label} Crisis`],
    collectibles: [`${label} Relic`, `${label} Prototype`, `${label} Chronicle`],
    productionChains: [`${label} Input to Output`, `${label} Material to Building`],
    upgradeChains: [`${label} Efficiency`, `${label} Capacity`],
    art: [`${label} Hero`, `${label} Banner`, `${label} Card Set`, `${label} Icon Set`],
    audio: [`${label} Theme`, `${label} Ambience`]
  };
}

export function eraIdFromName(value: string) {
  const normalized = value.toLowerCase().replace(/\s+age$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized === "space" ? "space-age" : normalized;
}

export function canonicalEraOptions() {
  return civilizationAges.map((age) => {
    const name = age.name.replace(/\s+Age$/, "");
    return { id: eraIdFromName(age.name), name };
  });
}

export function getEraProfile(eraId: string) {
  const canonical = canonicalEraOptions().find((era) => era.id === eraId);
  return eraProfiles.find((profile) => profile.eraId === eraId) ?? fallbackEraProfile(eraId, canonical?.name ?? titleCase(eraId));
}

export function nextSuggestedEra(scaffolds: EraScaffold[]) {
  const scaffolded = new Set(scaffolds.map((item) => item.eraId));
  return canonicalEraOptions().find((era) => era.id !== "survival" && !scaffolded.has(era.id)) ?? { id: "ancient", name: "Ancient" };
}

function item(type: ScaffoldItemType, eraId: string, name: string, templateId: string, linkedIds: string[] = []): EraScaffoldItem {
  const id = `draft_${eraId}_${type}_${slug(name)}`;
  return {
    id,
    type,
    name,
    status: "Draft",
    templateId,
    description: `${name} draft generated from ${templateId.replace("template_", "").replaceAll("_", " ")} template.`,
    linkedIds,
    requirementProfileId: `${templateId.replace("template_", "")}_draft_profile_v1`,
    assetRequirementIds: [`asset_req_${id}_icon`, `asset_req_${id}_card`],
    validationDefaults: contentTemplateDefinitions.find((template) => template.id === templateId)?.validationDefaults ?? [],
    productionTaskId: `task_${id}`
  };
}

function itemsForProfile(profile: EraProfile) {
  const resources = profile.resources.map((name) => item("resource", profile.eraId, name, "template_resource"));
  const research = profile.research.map((name, index) => item("research", profile.eraId, name, "template_research", resources.slice(Math.max(0, index - 2), index + 1).map((row) => row.id)));
  const buildings = profile.buildings.map((name, index) => item("building", profile.eraId, name, "template_building", [research[index % research.length]?.id, resources[index % resources.length]?.id].filter(Boolean)));
  const productionChains = profile.productionChains.map((name, index) => item("production_chain", profile.eraId, name, "template_production_chain", [resources[index % resources.length]?.id, buildings[index % buildings.length]?.id].filter(Boolean)));
  const upgradeChains = profile.upgradeChains.map((name, index) => item("upgrade_chain", profile.eraId, name, "template_upgrade_chain", [research[index % research.length]?.id, buildings[index % buildings.length]?.id].filter(Boolean)));
  const missions = profile.missions.map((name, index) => item("mission", profile.eraId, name, "template_mission", [research[index % research.length]?.id, buildings[index % buildings.length]?.id, productionChains[index % productionChains.length]?.id].filter(Boolean)));
  const events = profile.events.map((name, index) => item("event", profile.eraId, name, "template_event", [buildings[index % buildings.length]?.id, research[index % research.length]?.id].filter(Boolean)));
  const collectibles = profile.collectibles.map((name, index) => item("collectible", profile.eraId, name, "template_collectible", [resources[index % resources.length]?.id, events[index % events.length]?.id].filter(Boolean)));
  const art = profile.art.map((name) => item("art_requirement", profile.eraId, name, "template_era"));
  const audio = profile.audio.map((name) => item("audio", profile.eraId, name, "template_era"));
  return [...resources, ...buildings, ...research, ...productionChains, ...upgradeChains, ...missions, ...events, ...collectibles, ...art, ...audio];
}

function relationshipsFor(items: EraScaffoldItem[]) {
  return items.flatMap((row) =>
    row.linkedIds.map((linkedId) => ({
      id: `rel_${row.id}_to_${linkedId}`,
      fromId: row.id,
      toId: linkedId,
      relationship: "suggested_dependency",
      suggestedBy: row.templateId
    }))
  );
}

function estimateFor(items: EraScaffoldItem[]): EraProductionEstimate {
  const count = (type: ScaffoldItemType) => items.filter((row) => row.type === type).length;
  const assets = items.reduce((sum, row) => sum + row.assetRequirementIds.length, 0);
  const production = count("production_chain") + count("upgrade_chain");
  return {
    hours: Math.round(items.length * 1.8 + assets * 0.6 + production * 2),
    assets,
    research: count("research"),
    buildings: count("building"),
    production,
    art: count("art_requirement"),
    audio: count("audio"),
    overallCompletion: 0
  };
}

function validateScaffold(items: EraScaffoldItem[], relationships: EraScaffoldRelationship[]): EraScaffoldValidation {
  const ids = items.map((row) => row.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const itemIds = new Set(ids);
  const isAllowedExternalId = (id: string) => /^RES-[A-Z0-9-]+$/.test(id) || /^(building|research|chain|mission|event|collectible|ancient_age_unlock)_/.test(id);
  const missingLinks = relationships.filter((relationship) => !itemIds.has(relationship.toId) && !isAllowedExternalId(relationship.toId)).map((relationship) => relationship.id);
  const missingRequirementProfiles = items.filter((row) => !row.requirementProfileId).map((row) => row.id);
  const missingProductionTasks = items.filter((row) => !row.productionTaskId).map((row) => row.id);
  const checks = [
    { label: "stable canonical draft IDs", passed: ids.every((id) => /^draft_[a-z0-9-]+_[a-z_]+_[a-z0-9_]+$/.test(id)) },
    { label: "no duplicate IDs", passed: duplicateIds.length === 0 },
    { label: "relationships generated", passed: relationships.length > 0 },
    { label: "requirement profiles created", passed: missingRequirementProfiles.length === 0 },
    { label: "production tasks created", passed: missingProductionTasks.length === 0 }
  ];
  return {
    status: checks.every((check) => check.passed) && missingLinks.length === 0 ? "Valid Draft" : "Needs Review",
    duplicateIds,
    missingLinks,
    missingRequirementProfiles,
    missingProductionTasks,
    checks
  };
}

function scaffoldFromItems(input: { eraId: string; eraName: string; mode: EraScaffold["mode"]; items: EraScaffoldItem[]; sourceEraId?: string; sourceEraName?: string; timestamp?: string }): EraScaffold {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const relationships = relationshipsFor(input.items);
  return {
    id: `scaffold_${input.eraId}_${input.mode}`,
    eraId: input.eraId,
    eraName: input.eraName,
    sourceEraId: input.sourceEraId,
    sourceEraName: input.sourceEraName,
    status: "Draft",
    mode: input.mode,
    createdAt: timestamp,
    updatedAt: timestamp,
    items: input.items,
    relationships,
    estimates: estimateFor(input.items),
    validation: validateScaffold(input.items, relationships),
    notes: input.mode === "duplicate_era" ? `Duplicated from ${input.sourceEraName}. IDs were regenerated for ${input.eraName}.` : `${input.eraName} starter kit generated from reusable content templates.`
  };
}

function categoryToType(category: ContentPackCategory): ScaffoldItemType {
  const map: Record<ContentPackCategory, ScaffoldItemType> = {
    resources: "resource",
    buildings: "building",
    research: "research",
    productionChains: "production_chain",
    missions: "mission",
    events: "event",
    collectibles: "collectible",
    art: "art_requirement",
    audio: "audio",
    ui: "production_task",
    balance: "production_task",
    progression: "production_task"
  };
  return map[category];
}

export function duplicateSurvivalToEra(eraId: string, timestamp = new Date().toISOString()) {
  const profile = getEraProfile(eraId);
  const sourceRows = Object.entries(survivalContentPack.categories).flatMap(([category, rows]) =>
    rows.map((row) => ({ category: category as ContentPackCategory, row }))
  );
  const idMap = new Map(
    sourceRows.map(({ category, row }) => {
      const type = categoryToType(category as ContentPackCategory);
      return [row.id, `draft_${profile.eraId}_${type}_${slug(row.name)}`];
    })
  );
  const items = sourceRows.map(({ category, row }) => {
    const type = categoryToType(category);
    const id = idMap.get(row.id) ?? `draft_${profile.eraId}_${type}_${slug(row.name)}`;
      return {
        id,
        type,
        name: row.name.replace(/Survival/g, profile.eraName),
        status: "Draft" as const,
        templateId: type === "building" ? "template_building" : type === "research" ? "template_research" : type === "mission" ? "template_mission" : type === "event" ? "template_event" : type === "collectible" ? "template_collectible" : type === "production_chain" ? "template_production_chain" : type === "resource" ? "template_resource" : "template_era",
        description: row.description.replace(/Survival/g, profile.eraName),
        linkedIds: (row.linkedIds ?? []).map((linkedId) => idMap.get(linkedId) ?? linkedId.replace(/survival/g, profile.eraId)),
        requirementProfileId: `${type}_draft_profile_v1`,
        assetRequirementIds: [`asset_req_${id}_icon`, `asset_req_${id}_card`],
        validationDefaults: ["stable id", "relationships require review after clone", "draft status enforced"],
        productionTaskId: `task_${id}`
      };
  });
  return scaffoldFromItems({
    eraId: profile.eraId,
    eraName: profile.eraName,
    sourceEraId: "survival",
    sourceEraName: "Survival",
    mode: "duplicate_era",
    items,
    timestamp
  });
}

export function generateEraStarterKit(eraId: string, timestamp = new Date().toISOString()) {
  const profile = getEraProfile(eraId);
  return scaffoldFromItems({
    eraId: profile.eraId,
    eraName: profile.eraName,
    mode: "starter_kit",
    items: itemsForProfile(profile),
    timestamp
  });
}

export function productionTasksForScaffold(scaffold: EraScaffold) {
  return scaffold.items.map((row) => ({
    id: row.productionTaskId,
    title: `Author ${row.name}`,
    type: row.type,
    status: row.status,
    era: scaffold.eraName,
    blockers: row.validationDefaults,
    assetRequirementIds: row.assetRequirementIds,
    requirementProfileId: row.requirementProfileId
  }));
}

export function initialContentAuthoringState(scaffolds: EraScaffold[] = []): ContentAuthoringState {
  const draftItemCount = scaffolds.reduce((sum, scaffold) => sum + scaffold.items.length, 0);
  return {
    templates: contentTemplateDefinitions,
    wizards: authoringWizards,
    scaffolds,
    nextSuggestedEra: nextSuggestedEra(scaffolds),
    stats: {
      templateCount: contentTemplateDefinitions.length,
      wizardCount: authoringWizards.length,
      scaffoldCount: scaffolds.length,
      draftItemCount,
      estimatedHours: scaffolds.reduce((sum, scaffold) => sum + scaffold.estimates.hours, 0)
    }
  };
}

export { createdAt as contentAuthoringTemplateVersionDate };

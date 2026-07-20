import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";
import { findAssetForPreviewKeys, resolveProductionAssetPreview, type VisualPreview } from "@/lib/assets/visual-previews";
import { AI_LIBRARY_VERSION, AI_LIBRARY_VOLUME_ID, aiLibraryAssignmentRoles, aiLibraryCategories, aiLibraryPersonalities as aiLibraryPersonalityCatalog, aiLibraryRarities, aiLibraryVoices, canonicalAiLibraryAgents, validateCanonicalAiLibrary } from "@/lib/ai-agents/foundations";
import type {
  AiAgentAnimationProfileDefinition,
  AiAgentDefinition,
  AiAgentPersonalityDefinition,
  AiAgentSaveSchemaDefinition,
  AiAgentVariantDefinition,
  AiAgentVisualState,
  AutomationPresentationDefinition,
  CanonicalAiLibraryAgent
} from "@/types/runtime";

export type AiAgentState = "Idle" | "Blink" | "Thinking" | "Working" | "Research" | "Offline" | "Warning" | "Celebration" | "Sleeping" | "Surprised";
export type AiAgentRarity = AiAgentDefinition["rarity"];
export type AiAgentArtworkStatus = "Missing" | "Source Needed" | "Source Uploaded" | "Derivatives Queued" | "Needs Review" | "Approved" | "Published";

export type AiAgentArtworkSlot = {
  id: string;
  label: string;
  artKey: string;
  kind: "head" | "eyes_open" | "eyes_blink" | "eyes_closed" | "idle_animation" | "blink_animation" | "expression" | "accent" | "accessory" | "shadow";
  visualState: AiAgentVisualState;
  required: boolean;
  acceptedSourceFormats: Array<"PSD" | "PSB" | "PNG" | "SVG" | "source_package">;
  derivativePresetIds: string[];
  minimumDimensions: string;
  preferredDimensions: string;
  alphaRequired: boolean;
  status: AiAgentArtworkStatus;
  linkedAssetId?: string;
  preview: VisualPreview;
  notes: string;
};

export type AiAgentExpressionVariant = {
  id: AiAgentVisualState;
  label: string;
  supportedStates: AiAgentState[];
  artKey: string;
  requiredForV1: boolean;
  status: AiAgentArtworkStatus;
};

export type AiAgentDialogueProfile = {
  id: string;
  tone: string;
  greeting: string;
  thinkingLine: string;
  warningLine: string;
  celebrationLine: string;
  offlineLine: string;
};

export type AiAgentVoiceProfile = {
  id: string;
  status: "Future" | "Planned" | "In Design" | "Ready";
  voiceKey: string | null;
  notes: string;
};

export type AiAgentRecord = {
  id: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  personalityId: string;
  colorTheme: AiAgentDefinition["colorTheme"];
  rarity: AiAgentRarity;
  unlockRequirements: string[];
  defaultForNewPlayers: boolean;
  eraAvailability: AiAgentDefinition["eraAvailability"];
  supportedStates: AiAgentState[];
  artworkSlots: AiAgentArtworkSlot[];
  expressionVariants: AiAgentExpressionVariant[];
  animationProfileId: string;
  dialogueProfile: AiAgentDialogueProfile;
  voiceProfile: AiAgentVoiceProfile;
  gameplayModifiers: Record<string, never>;
  automationPresentationId: string;
  status: AiAgentDefinition["status"];
  approvalState: AiAgentDefinition["approvalState"];
  publishState: AiAgentDefinition["publishState"];
  aliases: string[];
  componentLibraryReferences: string[];
  notes: string[];
  agentClass?: string;
  specialization?: string;
  catalogRarity?: string;
  catalogPersonality?: string;
  terminalType?: string;
  discoverySource?: string;
  primaryBonusIds?: string[];
  unlockMethod?: string;
  restorationAction?: string;
  memoryIntegrityStart?: string;
  levelCap?: number;
  relationshipGroup?: string;
  dialoguePackId?: string;
  runtimeEnabled?: boolean;
  sourceStatus?: string;
  libraryDefinition?: CanonicalAiLibraryAgent;
};

export type AiAgentSummary = Pick<AiAgentRecord, "id" | "displayName" | "shortDisplayName" | "description" | "personalityId" | "rarity" | "colorTheme" | "unlockRequirements" | "defaultForNewPlayers" | "supportedStates" | "componentLibraryReferences" | "approvalState" | "publishState" | "agentClass" | "specialization" | "catalogRarity" | "catalogPersonality" | "terminalType" | "discoverySource" | "primaryBonusIds" | "unlockMethod" | "restorationAction" | "memoryIntegrityStart" | "levelCap" | "relationshipGroup" | "dialoguePackId" | "runtimeEnabled" | "sourceStatus"> & {
  artworkReady: number;
  artworkTotal: number;
  expressionReady: number;
  expressionTotal: number;
  primaryPreview: VisualPreview;
  webReady: boolean;
  robloxReady: boolean;
  iosReady: boolean;
  androidReady: boolean;
  blockers: string[];
};

export type AiAgentTerminalRecord = {
  id: string;
  displayName: string;
  agentIds: string[];
  discoverySources: string[];
  restorationAction: string;
  status: "draft" | "published";
};

export type AiAgentCatalogPersonality = {
  id: string;
  displayName: string;
  agentIds: string[];
  status: "draft" | "published";
};

export type AiAgentLibraryModuleRecord = {
  id: string;
  displayName: string;
  agentIds: string[];
  status: "draft" | "published";
};

export type AiAgentLibraryState = {
  volume: { id: typeof AI_LIBRARY_VOLUME_ID; number: 1; name: "Foundations"; version: typeof AI_LIBRARY_VERSION };
  libraryAgents: CanonicalAiLibraryAgent[];
  categories: typeof aiLibraryCategories;
  rarityCatalog: typeof aiLibraryRarities;
  personalityCatalog: typeof aiLibraryPersonalityCatalog;
  voiceCatalog: typeof aiLibraryVoices;
  assignmentRoles: typeof aiLibraryAssignmentRoles;
  agents: AiAgentSummary[];
  records: AiAgentRecord[];
  variants: AiAgentVariantDefinition[];
  personalities: AiAgentPersonalityDefinition[];
  animationProfiles: AiAgentAnimationProfileDefinition[];
  automationPresentation: AutomationPresentationDefinition;
  defaultAiAgentId: string;
  saveSchema: AiAgentSaveSchemaDefinition;
  derivativePresetIds: string[];
  acceptedSourceFormats: AiAgentArtworkSlot["acceptedSourceFormats"];
  terminals: AiAgentTerminalRecord[];
  catalogPersonalities: AiAgentCatalogPersonality[];
  memoryFragments: AiAgentLibraryModuleRecord[];
  dialoguePacks: AiAgentLibraryModuleRecord[];
  relationships: AiAgentLibraryModuleRecord[];
  stats: {
    total: number;
    published: number;
    publishedVariants: number;
    selectableAgents: number;
    selectableVariants: number;
    completeThreeStateArtSets: number;
    approved: number;
    missingArtwork: number;
    missingOpenEyeArt: number;
    missingBlinkArt: number;
    missingOfflineArt: number;
    animationReady: number;
    webReady: number;
    robloxReady: number;
    mobileReady: number;
    pendingReview: number;
    derivativeOutputsPerSlot: number;
    componentReferences: number;
  };
  generatedAt: string;
};

export const defaultAiAgentId = "AI-AGENT-DEFAULT";
export const defaultAiAgentVariantId = "AI-VARIANT-DEFAULT-T1";
export const defaultAiAgentPersonalityId = "AI-PERSONALITY-OPTIMIST";
export const defaultAiAgentAnimationProfileId = "AI-ANIM-BLINK-DEFAULT";
export const automationPresentationId = "AI-AUTOMATION-PRESENTATION-DEFAULT";
export const aiAgentSafePublishedDefaultArtKeys = ["auto_robot_circle", "auto_robot_icon", "auto_robot_blink_icon"] as const;
const safePublishedDefaultArtKeys = new Set<string>(aiAgentSafePublishedDefaultArtKeys);
export const aiAgentStates: AiAgentState[] = ["Idle", "Blink", "Thinking", "Working", "Research", "Offline", "Warning", "Celebration", "Sleeping", "Surprised"];
export const aiAgentRuntimeStates: AiAgentVisualState[] = ["idle", "blink", "working", "thinking", "researching", "celebrating", "warning", "offline", "sleeping", "surprised"];
export const aiAgentDerivativeSizes = [64, 96, 128, 256, 512, 1024] as const;
export const aiAgentDerivativePresetIds = aiAgentDerivativeSizes.map((size) => `ai_agent_${size}_png`);

export const aiAgentPersonalities: AiAgentPersonalityDefinition[] = [
  { id: "AI-PERSONALITY-EXPLORER", displayName: "Explorer", tone: "Curious and adventurous", shortDescription: "Celebrates discovery and scanning progress.", dialogueStyle: "Short discovery prompts with confident calls to action.", preferredExpressions: ["thinking", "celebrating", "surprised"], notificationStyle: "Signal pings and discovery callouts.", futureVoiceProfile: "bright-explorer" },
  { id: "AI-PERSONALITY-ENGINEER", displayName: "Engineer", tone: "Practical and systems-minded", shortDescription: "Frames automation as maintenance and optimization.", dialogueStyle: "Operational status, diagnostics, and concise next steps.", preferredExpressions: ["working", "warning"], notificationStyle: "Checklist-driven maintenance alerts.", futureVoiceProfile: "calm-engineer" },
  { id: "AI-PERSONALITY-SCIENTIST", displayName: "Scientist", tone: "Analytical and precise", shortDescription: "Supports research, resources, and anomaly analysis.", dialogueStyle: "Measured findings and probability language.", preferredExpressions: ["researching", "thinking"], notificationStyle: "Research notes and lab-style observations.", futureVoiceProfile: "clear-scientist" },
  { id: "AI-PERSONALITY-DIPLOMAT", displayName: "Diplomat", tone: "Measured and empathetic", shortDescription: "Future-ready for factions, civilizations, and negotiations.", dialogueStyle: "Contextual, careful, and relationship-aware.", preferredExpressions: ["idle", "warning"], notificationStyle: "Soft warnings and relationship framing.", futureVoiceProfile: "warm-diplomat" },
  { id: "AI-PERSONALITY-GUARDIAN", displayName: "Guardian", tone: "Protective and direct", shortDescription: "Emphasizes hazards, safety, and defense readiness.", dialogueStyle: "Brief warnings and secure-action language.", preferredExpressions: ["warning", "working"], notificationStyle: "Priority safety alerts.", futureVoiceProfile: "steady-guardian" },
  { id: "AI-PERSONALITY-ANALYST", displayName: "Analyst", tone: "Neutral and data-forward", shortDescription: "Surfaces metrics, gains, and system deltas.", dialogueStyle: "Compact summaries with numeric context.", preferredExpressions: ["thinking", "working"], notificationStyle: "Metric deltas and trend notices.", futureVoiceProfile: "neutral-analyst" },
  { id: defaultAiAgentPersonalityId, displayName: "Optimist", tone: "Clear, optimistic, concise", shortDescription: "Default player-facing companion tone.", dialogueStyle: "Encouraging but brief, with practical guidance.", preferredExpressions: ["idle", "celebrating", "thinking"], notificationStyle: "Positive status confirmations.", futureVoiceProfile: "friendly-optimist" },
  { id: "AI-PERSONALITY-MINIMALIST", displayName: "Minimalist", tone: "Quiet and restrained", shortDescription: "Low-interruption personality for experienced players.", dialogueStyle: "Minimal status copy and fewer flourish lines.", preferredExpressions: ["idle", "offline"], notificationStyle: "Silent unless important.", futureVoiceProfile: "soft-minimal" }
];

export const aiAgentAnimationProfiles: AiAgentAnimationProfileDefinition[] = [
  {
    id: defaultAiAgentAnimationProfileId,
    displayName: "Default Blink",
    idleFrame: "eyesOpenAssetKey",
    blinkFrame: "eyesBlinkAssetKey",
    minIntervalMs: 3000,
    maxIntervalMs: 7000,
    blinkDurationMs: 120,
    doubleBlinkChance: 0.12,
    reducedMotionBehavior: "static_open",
    visibleOnlyBehavior: "pause_when_hidden",
    allowedStates: ["idle", "blink", "working", "thinking", "researching", "celebrating", "warning", "offline"]
  }
];

export const automationPresentation: AutomationPresentationDefinition = {
  id: automationPresentationId,
  systemId: "automation",
  displayName: "AI Agent",
  previousDisplayName: "Auto Click",
  powerLabel: "Labor Assistance",
  previousPowerLabel: "Auto Click Power",
  enabledLabel: "Agent Online",
  disabledLabel: "Agent Offline",
  preservedInternalIds: ["auto-click", "auto_click", "base-auto-click-power", "automationActive", "automationUnlocked"],
  notes: "AI Agent is the presentation and companion layer. Existing automation IDs remain stable for save compatibility and balance."
};

export const aiAgentSaveSchema: AiAgentSaveSchemaDefinition = {
  id: "AI-AGENT-SAVE-SCHEMA-V1",
  selectedAiAgentIdDefault: defaultAiAgentId,
  selectedAiAgentVariantIdDefault: defaultAiAgentVariantId,
  fields: {
    selectedAiAgentId: { status: "active", default: defaultAiAgentId, notes: "Active v1 player preference. Studio exports definitions only, not player-owned state." },
    selectedAiAgentVariantId: { status: "active", default: defaultAiAgentVariantId, notes: "Active v1 cosmetic variant preference. Variant selection does not alter automation power." },
    unlockedAiAgentIds: { status: "player_owned", default: [defaultAiAgentId], notes: "Player-owned unlock state belongs to the Game save. Studio publishes only schema/default guidance." },
    unlockedAiAgentVariantIds: { status: "player_owned", default: [defaultAiAgentVariantId], notes: "Player-owned variant unlock state belongs to the Game save." },
    selectedAiAgentSkinId: { status: "future", default: null, notes: "Reserved for future cosmetic skin selection." },
    selectedEyeColorId: { status: "future", default: null, notes: "Reserved for future eye-color cosmetic selection." },
    selectedPersonalityId: { status: "future", default: null, notes: "Reserved for future personality override selection." }
  },
  migrationHints: [
    {
      id: "migration_selected_ai_agent_default",
      field: "selectedAiAgentId",
      defaultValue: defaultAiAgentId,
      unknownIdBehavior: "Fall back to default for rendering, preserve unresolved value for diagnostics if the save contains an unknown agent ID.",
      notes: "Saves without selectedAiAgentId receive AI-AGENT-DEFAULT."
    },
    {
      id: "migration_selected_ai_agent_variant_default",
      field: "selectedAiAgentVariantId",
      defaultValue: defaultAiAgentVariantId,
      unknownIdBehavior: "Fall back to the default variant for rendering, preserve unresolved value for diagnostics if the save contains an unknown variant ID.",
      notes: "Saves without selectedAiAgentVariantId receive AI-VARIANT-DEFAULT-T1."
    }
  ]
};

const eraAvailability: AiAgentDefinition["eraAvailability"] = {
  survival: { available: true, visualTheme: "compact mechanical helper" },
  ancient: { available: true, visualTheme: "rugged utility design" },
  medieval: { available: true, visualTheme: "rugged utility design" },
  renaissance: { available: true, visualTheme: "precision instrument companion" },
  industrial: { available: true, visualTheme: "reinforced mechanical unit" },
  modern: { available: true, visualTheme: "polished digital assistant" },
  "space-age": { available: true, visualTheme: "advanced autonomous companion" },
  interstellar: { available: true, visualTheme: "synthetic intelligence" },
  galactic: { available: true, visualTheme: "galactic synthetic intelligence" }
};

const missingPreview = (label: string): VisualPreview => ({
  id: `ai-agent:${label}:missing-preview`,
  objectId: label,
  objectType: "ai_agent",
  title: label,
  status: "Missing",
  mode: "icon",
  size: "card",
  url: "",
  alt: `${label} missing preview`,
  source: "missing",
  mimeType: "unknown",
  width: null,
  height: null,
  format: "PNG, SVG, PSD/PSB, or source package required",
  sourceVersion: "No current preview",
  approvalStatus: "missing",
  publishStatus: "missing",
  dimensionsLabel: "512 minimum / 1024 preferred",
  metadata: [{ label: "Required", value: "Transparent layered source" }],
  safeForPublicRuntime: false,
  sanitized: true
});

function slot(id: string, label: string, artKey: string, kind: AiAgentArtworkSlot["kind"], visualState: AiAgentVisualState, required = true): AiAgentArtworkSlot {
  return {
    id,
    label,
    artKey,
    kind,
    visualState,
    required,
    acceptedSourceFormats: ["PNG", "SVG", "PSD", "PSB", "source_package"],
    derivativePresetIds: aiAgentDerivativePresetIds,
    minimumDimensions: "512x512",
    preferredDimensions: "1024x1024",
    alphaRequired: true,
    status: "Missing",
    preview: missingPreview(label),
    notes: "Source masters stay private; approved transparent derivatives are the runtime-facing outputs."
  };
}

function expression(id: AiAgentVisualState, label: string, states: AiAgentState[], artKey: string, requiredForV1 = false): AiAgentExpressionVariant {
  return { id, label, supportedStates: states, artKey, requiredForV1, status: "Missing" };
}

type ImportedAiAgentSeed = {
  agent_id: string;
  name: string;
  class: string;
  specialization: string;
  rarity: string;
  description: string;
  terminal_type: string;
  discovery_source: string;
  personality: string;
  primary_bonuses: string;
  unlock_method: string;
  restoration_action: string;
  memory_integrity_start: string;
  level_cap: number;
  relationship_group: string;
  dialogue_pack: string;
  runtime_enabled: boolean;
  status: string;
};

const importedPersonalityIds: Record<string, string> = {
  Curious: "AI-PERSONALITY-EXPLORER",
  Compassionate: "AI-PERSONALITY-DIPLOMAT",
  Pragmatic: "AI-PERSONALITY-ENGINEER",
  Efficient: "AI-PERSONALITY-ANALYST",
  Patient: "AI-PERSONALITY-MINIMALIST",
  Analytical: "AI-PERSONALITY-SCIENTIST",
  Protective: "AI-PERSONALITY-GUARDIAN",
  Reflective: "AI-PERSONALITY-MINIMALIST",
  Visionary: "AI-PERSONALITY-EXPLORER",
  Enigmatic: "AI-PERSONALITY-MINIMALIST"
};

const importedClassColors: Record<string, AiAgentDefinition["colorTheme"]> = {
  Explorer: { primary: "#67e8f9", secondary: "#2563eb", accent: "#f8fafc" },
  Medical: { primary: "#fda4af", secondary: "#0f766e", accent: "#f8fafc" },
  Engineer: { primary: "#fbbf24", secondary: "#b45309", accent: "#f8fafc" },
  Logistics: { primary: "#38bdf8", secondary: "#0369a1", accent: "#f8fafc" },
  Botanist: { primary: "#6ee7b7", secondary: "#047857", accent: "#f8fafc" },
  Scientist: { primary: "#a78bfa", secondary: "#4338ca", accent: "#f8fafc" },
  Security: { primary: "#fb7185", secondary: "#9f1239", accent: "#f8fafc" },
  Historian: { primary: "#fcd34d", secondary: "#92400e", accent: "#f8fafc" },
  "Galaxy Cartographer": { primary: "#22d3ee", secondary: "#4f46e5", accent: "#f8fafc" },
  "Precursor Intelligence": { primary: "#c084fc", secondary: "#0e7490", accent: "#f8fafc" }
};

function runtimeRarity(rarity: string): AiAgentRarity {
  return ["Common", "Uncommon", "Rare", "Epic", "Legendary"].includes(rarity) ? rarity as AiAgentRarity : "Legendary";
}

function importedAgentRecord(seed: ImportedAiAgentSeed): AiAgentRecord {
  const artPrefix = `ai_agent_${seed.agent_id.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
  return {
    id: seed.agent_id,
    displayName: seed.name,
    shortDisplayName: seed.name,
    description: seed.description,
    personalityId: importedPersonalityIds[seed.personality] ?? defaultAiAgentPersonalityId,
    colorTheme: importedClassColors[seed.class] ?? { primary: "#67e8f9", secondary: "#334155", accent: "#f8fafc" },
    rarity: runtimeRarity(seed.rarity),
    unlockRequirements: [seed.unlock_method],
    defaultForNewPlayers: false,
    eraAvailability,
    supportedStates: aiAgentStates,
    artworkSlots: [
      slot("head", "Head/Base Artwork", `${artPrefix}_head`, "head", "idle"),
      slot("eyes-open", "Eyes Open Artwork", `${artPrefix}_eyes_open`, "eyes_open", "idle"),
      slot("eyes-blink", "Blink / Eyes Closed Artwork", `${artPrefix}_eyes_blink`, "eyes_blink", "blink"),
      slot("eyes-closed", "Offline Eyes Closed Artwork", `${artPrefix}_eyes_closed`, "eyes_closed", "offline")
    ],
    expressionVariants: [],
    animationProfileId: defaultAiAgentAnimationProfileId,
    dialogueProfile: { id: `AI-DIALOGUE-PENDING-${seed.agent_id}`, tone: "", greeting: "", thinkingLine: "", warningLine: "", celebrationLine: "", offlineLine: "" },
    voiceProfile: { id: `AI-VOICE-FUTURE-${seed.agent_id}`, status: "Future", voiceKey: null, notes: "Voice profile is not yet authored." },
    gameplayModifiers: {},
    automationPresentationId,
    status: "locked",
    approvalState: "draft",
    publishState: "draft",
    aliases: [seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")],
    componentLibraryReferences: ["AiAgentPortrait", "AiAgentPanel", "AiAgentStatus", "AiAgentSelector", "AiAgentCard", "AiAgentVariantCard"],
    notes: ["Imported from NOVERIS AI Agents Studio Module seed. Draft until artwork, dialogue, relationships, and runtime review are complete."],
    agentClass: seed.class,
    specialization: seed.specialization,
    catalogRarity: seed.rarity,
    catalogPersonality: seed.personality,
    terminalType: seed.terminal_type,
    discoverySource: seed.discovery_source,
    primaryBonusIds: seed.primary_bonuses.split(",").map((value) => value.trim()).filter(Boolean),
    unlockMethod: seed.unlock_method,
    restorationAction: seed.restoration_action,
    memoryIntegrityStart: seed.memory_integrity_start,
    levelCap: seed.level_cap,
    relationshipGroup: seed.relationship_group,
    dialoguePackId: seed.dialogue_pack,
    runtimeEnabled: seed.runtime_enabled,
    sourceStatus: seed.status
  };
}

function foundationAgentRecord(definition: CanonicalAiLibraryAgent): AiAgentRecord {
  const artPrefix = definition.runtime_metadata.portraitArtKey.replace(/_portrait$/, "");
  const runtimePersonalityId = importedPersonalityIds[definition.personality] ?? defaultAiAgentPersonalityId;
  const rarity = runtimeRarity(definition.rarity);
  return {
    id: definition.ai_id,
    displayName: definition.name,
    shortDisplayName: definition.name,
    description: definition.description,
    personalityId: runtimePersonalityId,
    colorTheme: importedClassColors[definition.category] ?? { primary: "#67e8f9", secondary: "#334155", accent: "#f8fafc" },
    rarity,
    unlockRequirements: [definition.activation_method],
    defaultForNewPlayers: false,
    eraAvailability,
    supportedStates: aiAgentStates,
    artworkSlots: [
      slot("head", "Head/Base Artwork", `${artPrefix}_head`, "head", "idle"),
      slot("eyes-open", "Eyes Open Artwork", `${artPrefix}_eyes_open`, "eyes_open", "idle"),
      slot("eyes-blink", "Blink / Eyes Closed Artwork", `${artPrefix}_eyes_blink`, "eyes_blink", "blink"),
      slot("eyes-closed", "Offline Eyes Closed Artwork", `${artPrefix}_eyes_closed`, "eyes_closed", "offline")
    ],
    expressionVariants: [],
    animationProfileId: defaultAiAgentAnimationProfileId,
    dialogueProfile: {
      id: `AI-DIALOGUE-${definition.ai_id}`,
      tone: definition.personality,
      greeting: definition.dialogue_examples[0],
      thinkingLine: definition.dialogue_examples[1],
      warningLine: `${definition.name}: assignment conditions require attention.`,
      celebrationLine: `${definition.name}: assignment complete.`,
      offlineLine: `${definition.name} is offline.`
    },
    voiceProfile: { id: `AI-VOICE-${definition.ai_id}`, status: "Planned", voiceKey: null, notes: definition.voice_style },
    gameplayModifiers: {},
    automationPresentationId,
    status: "locked",
    approvalState: "approved",
    publishState: "published",
    aliases: [definition.codename.toLowerCase()],
    componentLibraryReferences: ["AiAgentPortrait", "AiAgentPanel", "AiAgentStatus", "AiAgentSelector", "AiAgentCard", "AiAgentVariantCard"],
    notes: ["Canonical AI Library Volume I definition. Runtime bonuses are applied through Labor and the Action System."],
    agentClass: definition.category,
    specialization: definition.subcategory,
    catalogRarity: definition.rarity,
    catalogPersonality: definition.personality,
    terminalType: definition.activation_method,
    discoverySource: definition.origin,
    primaryBonusIds: ["labor_bonus", "action_bonus", "building_bonus", "research_bonus", "colony_bonus", "automation_bonus"].filter((key) => definition[key as keyof CanonicalAiLibraryAgent] !== 0),
    unlockMethod: definition.activation_method,
    restorationAction: definition.activation_method === "Recovered" || definition.activation_method === "Discovered" ? "Recover AI Core" : "Activate AI Core",
    memoryIntegrityStart: definition.activation_method === "Recovered" ? "20-80%" : "100%",
    levelCap: definition.max_level,
    relationshipGroup: definition.category_id,
    dialoguePackId: `AI-DIALOGUE-${definition.ai_id}`,
    runtimeEnabled: definition.runtime_metadata.runtimeEnabled,
    sourceStatus: definition.runtime_metadata.status,
    libraryDefinition: definition
  };
}

const importedAgentRecords = canonicalAiLibraryAgents.map(foundationAgentRecord);

const seedAgents: AiAgentRecord[] = [
  {
    id: defaultAiAgentId,
    displayName: "Genesis Assistant",
    shortDisplayName: "Genesis",
    description: "Default player-facing AI Agent for automation assistance, tutorials, research prompts, and system status.",
    personalityId: defaultAiAgentPersonalityId,
    colorTheme: { primary: "#67e8f9", secondary: "#2563eb", accent: "#f8fafc" },
    rarity: "Common",
    unlockRequirements: ["default"],
    defaultForNewPlayers: true,
    eraAvailability,
    supportedStates: aiAgentStates,
    artworkSlots: [
      slot("head", "Head/Base Artwork", "auto_robot_circle", "head", "idle"),
      slot("eyes-open", "Eyes Open Artwork", "auto_robot_icon", "eyes_open", "idle"),
      slot("eyes-blink", "Blink / Eyes Closed Artwork", "auto_robot_blink_icon", "eyes_blink", "blink"),
      slot("eyes-closed", "Offline Eyes Closed Artwork", "auto_robot_blink_icon", "eyes_closed", "offline"),
      slot("idle", "Idle Animation", "auto_robot_icon", "idle_animation", "idle", false),
      slot("blink", "Blink Animation", "auto_robot_blink_icon", "blink_animation", "blink", false)
    ],
    expressionVariants: [
      expression("idle", "Idle/Open", ["Idle"], "auto_robot_icon", true),
      expression("blink", "Blink/Closed", ["Blink"], "auto_robot_blink_icon", true),
      expression("offline", "Offline", ["Offline"], "auto_robot_blink_icon", true),
      expression("thinking", "Thinking", ["Thinking", "Research"], "auto_robot_icon"),
      expression("researching", "Research", ["Research"], "auto_robot_icon"),
      expression("working", "Working", ["Working"], "auto_robot_icon"),
      expression("warning", "Warning", ["Warning"], "auto_robot_blink_icon"),
      expression("celebrating", "Celebration", ["Celebration"], "auto_robot_icon"),
      expression("surprised", "Surprised", ["Surprised"], "auto_robot_icon"),
      expression("sleeping", "Sleeping", ["Sleeping"], "auto_robot_blink_icon")
    ],
    animationProfileId: defaultAiAgentAnimationProfileId,
    dialogueProfile: {
      id: "AI-DIALOGUE-DEFAULT",
      tone: "Clear, optimistic, concise",
      greeting: "Systems online. Ready when you are.",
      thinkingLine: "Analyzing the next best path.",
      warningLine: "That path needs attention before we proceed.",
      celebrationLine: "Breakthrough confirmed.",
      offlineLine: "Agent offline. Core systems remain available."
    },
    voiceProfile: { id: "AI-VOICE-FUTURE-DEFAULT", status: "Future", voiceKey: null, notes: "Reserved for future narrated assistant personality." },
    gameplayModifiers: {},
    automationPresentationId,
    status: "available",
    approvalState: "approved",
    publishState: "published",
    aliases: ["ai_agent_nova", "auto_click_robot", "robot_head"],
    componentLibraryReferences: ["AiAgentPortrait", "AiAgentPanel", "AiAgentStatus", "AiAgentSelector", "AiAgentCard", "AiAgentVariantCard", "AiAgentExpressionPreview", "AiAgentBlinkPreview"],
    notes: ["Cosmetic v1 agent. No gameplay modifiers or balance changes."]
  },
  {
    id: "AI-AGENT-ORION",
    displayName: "Orion Analyst",
    shortDisplayName: "Orion",
    description: "Research-focused AI Agent variant for discovery analysis, science milestones, and deep-space scanning.",
    personalityId: "AI-PERSONALITY-SCIENTIST",
    colorTheme: { primary: "#a78bfa", secondary: "#38bdf8", accent: "#facc15" },
    rarity: "Rare",
    unlockRequirements: ["research_completed:system_scan", "era_reached:space-age"],
    defaultForNewPlayers: false,
    eraAvailability: {
      ...eraAvailability,
      survival: { available: false, visualTheme: "locked" },
      ancient: { available: false, visualTheme: "locked" },
      medieval: { available: false, visualTheme: "locked" },
      renaissance: { available: false, visualTheme: "locked" },
      industrial: { available: false, visualTheme: "locked" },
      modern: { available: false, visualTheme: "locked" }
    },
    supportedStates: ["Idle", "Blink", "Thinking", "Research", "Warning", "Celebration", "Offline"],
    artworkSlots: [
      slot("head", "Head/Base Artwork", "ai_agent_orion_head", "head", "idle"),
      slot("eyes-open", "Eyes Open Artwork", "ai_agent_orion_eyes_open", "eyes_open", "idle"),
      slot("eyes-blink", "Blink / Eyes Closed Artwork", "ai_agent_orion_eyes_blink", "eyes_blink", "blink"),
      slot("eyes-closed", "Offline Eyes Closed Artwork", "ai_agent_orion_eyes_closed", "eyes_closed", "offline"),
      slot("idle", "Idle Animation", "ai_agent_orion_idle", "idle_animation", "idle", false),
      slot("blink", "Blink Animation", "ai_agent_orion_blink", "blink_animation", "blink", false)
    ],
    expressionVariants: [
      expression("researching", "Research", ["Research"], "ai_agent_orion_expression_research"),
      expression("thinking", "Thinking", ["Thinking"], "ai_agent_orion_expression_thinking"),
      expression("warning", "Warning", ["Warning"], "ai_agent_orion_expression_warning"),
      expression("celebrating", "Celebration", ["Celebration"], "ai_agent_orion_expression_celebration")
    ],
    animationProfileId: defaultAiAgentAnimationProfileId,
    dialogueProfile: {
      id: "AI-DIALOGUE-ORION",
      tone: "Analytical, curious, precise",
      greeting: "Telemetry linked. Research channel open.",
      thinkingLine: "Cross-referencing discovery data.",
      warningLine: "The signal is unstable. Scan confidence is low.",
      celebrationLine: "Discovery confirmed and logged.",
      offlineLine: "Research agent unavailable."
    },
    voiceProfile: { id: "AI-VOICE-FUTURE-ORION", status: "Future", voiceKey: null, notes: "Future voice profile should distinguish research cadence from default guidance." },
    gameplayModifiers: {},
    automationPresentationId,
    status: "locked",
    approvalState: "draft",
    publishState: "draft",
    aliases: ["ai_agent_orion"],
    componentLibraryReferences: ["AiAgentPortrait", "AiAgentPanel", "AiAgentStatus", "AiAgentSelector", "AiAgentCard", "AiAgentVariantCard", "AiAgentExpressionPreview", "AiAgentBlinkPreview"],
    notes: ["Future cosmetic unlock. No gameplay modifiers or balance changes."]
  },
  ...importedAgentRecords
];

function readinessFromAsset(match: ProductionAsset | null | undefined): AiAgentArtworkStatus {
  if (!match) return "Missing";
  if (match.platformMappings.web) return "Published";
  if (match.approvalStatus === "approved") return "Approved";
  if (match.derivatives.length) return "Needs Review";
  if (match.sourceFiles.length) return "Source Uploaded";
  return "Source Needed";
}

function runtimeReadiness(status: AiAgentArtworkStatus): AiAgentDefinition["assetReadiness"][string] {
  if (status === "Published") return "published";
  if (status === "Approved" || status === "Needs Review") return "approved";
  if (status === "Source Uploaded" || status === "Derivatives Queued") return "source_uploaded";
  return "missing";
}

function runtimeReadinessFor(status: AiAgentArtworkStatus, artKey: string): AiAgentDefinition["assetReadiness"][string] {
  if (safePublishedDefaultArtKeys.has(artKey)) return "published";
  return runtimeReadiness(status);
}

function enrichSlot(slotRecord: AiAgentArtworkSlot, assets: ProductionAsset[] | undefined): AiAgentArtworkSlot {
  const match = assets ? findAssetForPreviewKeys(assets, [slotRecord.linkedAssetId, slotRecord.artKey, slotRecord.label]) : null;
  if (!match) return slotRecord;
  const preview = resolveProductionAssetPreview(match, { size: "card", mode: "icon" });
  return { ...slotRecord, linkedAssetId: match.id, preview, status: readinessFromAsset(match) };
}

function enrichAgent(agent: AiAgentRecord, assetState?: AssetProductionState): AiAgentRecord {
  return {
    ...agent,
    artworkSlots: agent.artworkSlots.map((artworkSlot) => enrichSlot(artworkSlot, assetState?.assets)),
    expressionVariants: agent.expressionVariants.map((variant) => {
      const match = assetState ? findAssetForPreviewKeys(assetState.assets, [variant.artKey, variant.label]) : null;
      return match ? { ...variant, status: readinessFromAsset(match) } : variant;
    })
  };
}

function summarize(agent: AiAgentRecord): AiAgentSummary {
  const artworkReady = agent.artworkSlots.filter((artworkSlot) => ["Approved", "Published"].includes(artworkSlot.status)).length;
  const expressionReady = agent.expressionVariants.filter((variant) => ["Approved", "Published"].includes(variant.status)).length;
  const webReady = agent.artworkSlots.some((slotRecord) => slotRecord.status === "Published");
  const robloxReady = agent.artworkSlots.some((slotRecord) => slotRecord.status === "Approved" || slotRecord.status === "Published");
  const blockers = [
    ...agent.artworkSlots.filter((artworkSlot) => artworkSlot.required && !["Approved", "Published"].includes(artworkSlot.status)).map((artworkSlot) => `${artworkSlot.label}: ${artworkSlot.status}`),
    ...agent.expressionVariants.filter((variant) => variant.requiredForV1 && !["Approved", "Published"].includes(variant.status)).map((variant) => `${variant.label}: ${variant.status}`)
  ];
  return {
    id: agent.id,
    displayName: agent.displayName,
    shortDisplayName: agent.shortDisplayName,
    description: agent.description,
    personalityId: agent.personalityId,
    rarity: agent.rarity,
    colorTheme: agent.colorTheme,
    unlockRequirements: agent.unlockRequirements,
    defaultForNewPlayers: agent.defaultForNewPlayers,
    supportedStates: agent.supportedStates,
    componentLibraryReferences: agent.componentLibraryReferences,
    approvalState: agent.approvalState,
    publishState: agent.publishState,
    agentClass: agent.agentClass,
    specialization: agent.specialization,
    catalogRarity: agent.catalogRarity,
    catalogPersonality: agent.catalogPersonality,
    terminalType: agent.terminalType,
    discoverySource: agent.discoverySource,
    primaryBonusIds: agent.primaryBonusIds,
    unlockMethod: agent.unlockMethod,
    restorationAction: agent.restorationAction,
    memoryIntegrityStart: agent.memoryIntegrityStart,
    levelCap: agent.levelCap,
    relationshipGroup: agent.relationshipGroup,
    dialoguePackId: agent.dialoguePackId,
    runtimeEnabled: agent.runtimeEnabled,
    sourceStatus: agent.sourceStatus,
    artworkReady,
    artworkTotal: agent.artworkSlots.length,
    expressionReady,
    expressionTotal: agent.expressionVariants.length,
    primaryPreview: agent.artworkSlots[0]?.preview ?? missingPreview(agent.displayName),
    webReady,
    robloxReady,
    iosReady: webReady,
    androidReady: webReady,
    blockers
  };
}

function runtimeAgent(agent: AiAgentRecord): AiAgentDefinition {
  const slotByKind = new Map(agent.artworkSlots.map((slotRecord) => [slotRecord.kind, slotRecord]));
  const head = slotByKind.get("head");
  const eyesOpen = slotByKind.get("eyes_open");
  const eyesBlink = slotByKind.get("eyes_blink");
  const eyesClosed = slotByKind.get("eyes_closed");
  const baseVariantId = agent.id === defaultAiAgentId ? defaultAiAgentVariantId : `AI-VARIANT-${agent.id.replace(/^AI-AGENT-/, "")}-T1`;
  const expressionAssets = Object.fromEntries(agent.expressionVariants.map((variant) => [variant.id, variant.artKey])) as AiAgentDefinition["expressionAssets"];
  const assetReadiness = Object.fromEntries([
    ...agent.artworkSlots.map((slotRecord) => [slotRecord.artKey, runtimeReadinessFor(slotRecord.status, slotRecord.artKey)]),
    ...agent.expressionVariants.map((variant) => [variant.artKey, runtimeReadinessFor(variant.status, variant.artKey)])
  ]);
  return {
    id: agent.id,
    displayName: agent.displayName,
    shortDisplayName: agent.shortDisplayName,
    description: agent.description,
    personalityId: agent.personalityId,
    rarity: agent.rarity,
    unlockRequirements: agent.defaultForNewPlayers ? { default: true } : { anyOf: agent.unlockRequirements },
    defaultForNewPlayers: agent.defaultForNewPlayers,
    eraAvailability: agent.eraAvailability,
    colorTheme: agent.colorTheme,
    baseVariantId,
    availableVariantIds: [baseVariantId],
    assetKeys: {
      open: eyesOpen?.artKey ?? "",
      blink: eyesBlink?.artKey ?? "",
      offline: eyesClosed?.artKey ?? "",
      working: expressionAssets.working ?? eyesOpen?.artKey ?? "",
      thinking: expressionAssets.thinking ?? eyesOpen?.artKey ?? "",
      warning: expressionAssets.warning ?? eyesClosed?.artKey ?? "",
      celebration: expressionAssets.celebrating ?? eyesOpen?.artKey ?? ""
    },
    presentation: {
      portraitShape: "circle",
      preferredPanelMode: "compact",
      colorTheme: agent.colorTheme,
      fallbackVariantId: baseVariantId
    },
    headAssetKey: head?.artKey ?? "",
    eyesOpenAssetKey: eyesOpen?.artKey ?? "",
    eyesBlinkAssetKey: eyesBlink?.artKey ?? "",
    eyesClosedAssetKey: eyesClosed?.artKey ?? "",
    expressionAssets,
    animationProfileId: agent.animationProfileId,
    dialogueProfileId: agent.dialogueProfile.id,
    voiceProfileId: agent.voiceProfile.voiceKey,
    gameplayModifiers: {},
    automationPresentationId: agent.automationPresentationId,
    mobilePresentation: {
      portraitSizeInPanel: 96,
      touchTarget: 48,
      reducedMotionDefault: false,
      blinkPerformanceTier: "standard",
      densityAssetSelection: ["1x", "2x", "3x"],
      safeAreaBehavior: "Profile modal must respect mobile safe-area bounds and avoid bottom home indicator overlap."
    },
    assetReadiness,
    status: agent.status,
    approvalState: agent.approvalState,
    publishState: agent.publishState,
    aliases: agent.aliases
  };
}

function runtimeVariant(agent: AiAgentRecord): AiAgentVariantDefinition {
  const slotByKind = new Map(agent.artworkSlots.map((slotRecord) => [slotRecord.kind, slotRecord]));
  const readyKinds = ["head", "eyes_open", "eyes_blink", "eyes_closed"] as const;
  const coreArtReady = readyKinds.every((kind) => {
    const slotRecord = slotByKind.get(kind);
    return Boolean(slotRecord && (["Approved", "Published"].includes(slotRecord.status) || safePublishedDefaultArtKeys.has(slotRecord.artKey)));
  });
  const open = slotByKind.get("eyes_open")?.artKey ?? "";
  const blink = slotByKind.get("eyes_blink")?.artKey ?? open;
  const offline = slotByKind.get("eyes_closed")?.artKey ?? blink;
  const head = slotByKind.get("head")?.artKey ?? open;
  const expressionAssets = Object.fromEntries(agent.expressionVariants.map((variant) => [variant.id, variant.artKey])) as Partial<Record<AiAgentVisualState, string>>;
  return {
    id: agent.id === defaultAiAgentId ? defaultAiAgentVariantId : `AI-VARIANT-${agent.id.replace(/^AI-AGENT-/, "")}-T1`,
    agentId: agent.id,
    displayName: `${agent.displayName} Mk I`,
    shortDisplayName: `${agent.shortDisplayName} I`,
    description: "Base cosmetic AI Agent visual variant. Automation level controls Labor Assistance separately.",
    tier: 1,
    variantType: "base",
    unlockRequirements: agent.defaultForNewPlayers ? { default: true } : { anyOf: agent.unlockRequirements },
    unlockText: agent.defaultForNewPlayers ? "Available by default" : "Requires linked progression unlocks",
    progressionMapping: {
      cosmeticIdentity: true,
      automationPowerSource: "automation_upgrade_levels",
      notes: "AI Agent variants are visual identity only. Automation upgrade levels continue to define Labor Assistance strength."
    },
    assetKeys: {
      head,
      open,
      blink,
      offline,
      working: expressionAssets.working ?? open,
      thinking: expressionAssets.thinking ?? open,
      warning: expressionAssets.warning ?? offline,
      celebration: expressionAssets.celebrating ?? open
    },
    safeFallbacks: {
      working: open,
      thinking: open,
      researching: open,
      warning: offline,
      celebrating: open,
      sleeping: offline,
      surprised: open
    },
    platformReadiness: {
      web: coreArtReady ? "ready" : "missing",
      roblox: coreArtReady ? "ready" : "missing",
      ios: coreArtReady ? "ready" : "missing",
      android: coreArtReady ? "ready" : "missing",
      preview: coreArtReady ? "ready" : "missing",
      transparency: "required"
    },
    status: agent.status,
    approvalState: agent.approvalState,
    publishState: agent.publishState
  };
}

function publishedAgentRecords(records: AiAgentRecord[]) {
  return records.filter((agent) => agent.status === "available" && agent.approvalState === "approved" && agent.publishState === "published");
}

export function getAiAgentRuntimeModules(assetState?: AssetProductionState) {
  const records = seedAgents.map((agent) => enrichAgent(agent, assetState));
  const publishedRecords = publishedAgentRecords(records);
  return {
    aiAgents: publishedRecords.map(runtimeAgent),
    aiAgentVariants: publishedRecords.map(runtimeVariant),
    aiAgentPersonalities,
    aiAgentAnimationProfiles,
    automationPresentation,
    defaultAiAgentId,
    aiAgentSaveSchema
  };
}

export async function getAiAgentLibraryState(assetState?: AssetProductionState): Promise<AiAgentLibraryState> {
  const records = seedAgents.map((agent) => enrichAgent(agent, assetState));
  const agents = records.map(summarize);
  const variants = records.map(runtimeVariant);
  const completeThreeStateArtSets = records.filter((agent) => {
    const requiredKinds = ["eyes_open", "eyes_blink", "eyes_closed"] as const;
    return requiredKinds.every((kind) => ["Approved", "Published"].includes(agent.artworkSlots.find((slotRecord) => slotRecord.kind === kind)?.status ?? "Missing"));
  }).length;
  const importedRecords = records.filter((agent) => /^AI-\d{4}$/.test(agent.id));
  const terminals = [...new Set(importedRecords.map((agent) => agent.terminalType).filter((value): value is string => Boolean(value)))].map((terminalType) => ({
    id: `AI-TERMINAL-${terminalType.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
    displayName: terminalType,
    agentIds: importedRecords.filter((agent) => agent.terminalType === terminalType).map((agent) => agent.id),
    discoverySources: [...new Set(importedRecords.filter((agent) => agent.terminalType === terminalType).map((agent) => agent.discoverySource).filter((value): value is string => Boolean(value)))],
    restorationAction: importedRecords.find((agent) => agent.terminalType === terminalType)?.restorationAction ?? "",
    status: "draft" as const
  }));
  const catalogPersonalities = [...new Set(importedRecords.map((agent) => agent.catalogPersonality).filter((value): value is string => Boolean(value)))].map((personality) => ({
    id: `AI-CATALOG-PERSONALITY-${personality.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
    displayName: personality,
    agentIds: importedRecords.filter((agent) => agent.catalogPersonality === personality).map((agent) => agent.id),
    status: "draft" as const
  }));
  const dialoguePacks = importedRecords.filter((agent) => agent.dialoguePackId).map((agent) => ({ id: agent.dialoguePackId!, displayName: agent.dialoguePackId!, agentIds: [agent.id], status: "draft" as const }));
  const relationships = importedRecords.filter((agent) => agent.relationshipGroup).map((agent) => ({ id: agent.relationshipGroup!, displayName: agent.relationshipGroup!, agentIds: [agent.id], status: "draft" as const }));
  return {
    volume: { id: AI_LIBRARY_VOLUME_ID, number: 1, name: "Foundations", version: AI_LIBRARY_VERSION },
    libraryAgents: canonicalAiLibraryAgents,
    categories: aiLibraryCategories,
    rarityCatalog: aiLibraryRarities,
    personalityCatalog: aiLibraryPersonalityCatalog,
    voiceCatalog: aiLibraryVoices,
    assignmentRoles: aiLibraryAssignmentRoles,
    agents,
    records,
    variants,
    personalities: aiAgentPersonalities,
    animationProfiles: aiAgentAnimationProfiles,
    automationPresentation,
    defaultAiAgentId,
    saveSchema: aiAgentSaveSchema,
    derivativePresetIds: aiAgentDerivativePresetIds,
    acceptedSourceFormats: ["PNG", "SVG", "PSD", "PSB", "source_package"],
    terminals,
    catalogPersonalities,
    memoryFragments: [],
    dialoguePacks,
    relationships,
    stats: {
      total: records.length,
      published: records.filter((agent) => agent.publishState === "published").length,
      publishedVariants: variants.filter((variant) => variant.publishState === "published").length,
      selectableAgents: records.filter((agent) => agent.status === "available" && agent.approvalState === "approved" && agent.publishState === "published").length,
      selectableVariants: variants.filter((variant) => variant.status === "available" && variant.approvalState === "approved" && variant.publishState === "published").length,
      completeThreeStateArtSets,
      approved: records.filter((agent) => agent.approvalState === "approved").length,
      missingArtwork: agents.filter((agent) => agent.blockers.length > 0).length,
      missingOpenEyeArt: records.filter((agent) => !["Approved", "Published"].includes(agent.artworkSlots.find((slotRecord) => slotRecord.kind === "eyes_open")?.status ?? "Missing")).length,
      missingBlinkArt: records.filter((agent) => !["Approved", "Published"].includes(agent.artworkSlots.find((slotRecord) => slotRecord.kind === "eyes_blink")?.status ?? "Missing")).length,
      missingOfflineArt: records.filter((agent) => !["Approved", "Published"].includes(agent.artworkSlots.find((slotRecord) => slotRecord.kind === "eyes_closed")?.status ?? "Missing")).length,
      animationReady: records.filter((agent) => agent.animationProfileId && agent.artworkSlots.some((slotRecord) => slotRecord.kind === "eyes_open") && agent.artworkSlots.some((slotRecord) => slotRecord.kind === "eyes_blink")).length,
      webReady: agents.filter((agent) => agent.webReady).length,
      robloxReady: agents.filter((agent) => agent.robloxReady).length,
      mobileReady: agents.filter((agent) => agent.iosReady && agent.androidReady).length,
      pendingReview: records.filter((agent) => agent.artworkSlots.some((slotRecord) => slotRecord.status === "Needs Review") || agent.expressionVariants.some((variant) => variant.status === "Needs Review")).length,
      derivativeOutputsPerSlot: aiAgentDerivativePresetIds.length,
      componentReferences: new Set(records.flatMap((agent) => agent.componentLibraryReferences)).size
    },
    generatedAt: new Date().toISOString()
  };
}

export function validateAiAgentLibrary(state: AiAgentLibraryState) {
  const issues: string[] = [];
  const ids = state.records.map((agent) => agent.id);
  const variantIds = state.variants.map((variant) => variant.id);
  if (new Set(ids).size !== ids.length) issues.push("AI agent IDs must be unique.");
  if (new Set(variantIds).size !== variantIds.length) issues.push("AI agent variant IDs must be unique.");
  const importedIds = state.records.filter((agent) => /^AI-\d{4}$/.test(agent.id)).map((agent) => agent.id);
  if (importedIds.length !== 75) issues.push("AI Library Volume I must contain exactly 75 numbered records.");
  for (let index = 1; index <= 75; index += 1) {
    const expectedId = `AI-${String(index).padStart(4, "0")}`;
    if (!importedIds.includes(expectedId)) issues.push(`AI Library Volume I is missing ${expectedId}.`);
  }
  issues.push(...validateCanonicalAiLibrary().issues);
  if (!state.records.length) issues.push("At least one AI agent record is required.");
  if (!state.variants.length) issues.push("At least one AI agent variant record is required.");
  const defaults = state.records.filter((agent) => agent.defaultForNewPlayers);
  if (defaults.length !== 1) issues.push("Exactly one AI agent must be defaultForNewPlayers.");
  if (state.defaultAiAgentId !== defaultAiAgentId) issues.push(`Default AI agent ID must be ${defaultAiAgentId}.`);
  const defaultAgent = state.records.find((agent) => agent.id === state.defaultAiAgentId);
  if (!defaultAgent) issues.push("Default AI agent record is missing.");
  if (defaultAgent && (defaultAgent.status !== "available" || defaultAgent.approvalState !== "approved" || defaultAgent.publishState !== "published")) issues.push("Default AI agent must be available, approved, and published.");
  const defaultVariant = state.variants.find((variant) => variant.id === defaultAiAgentVariantId);
  if (!defaultVariant) issues.push(`Default AI agent variant ${defaultAiAgentVariantId} is missing.`);
  if (state.saveSchema.selectedAiAgentVariantIdDefault !== defaultAiAgentVariantId) issues.push(`Default AI agent variant save schema must be ${defaultAiAgentVariantId}.`);
  for (const agent of state.records) {
    if (!agent.artworkSlots.some((slotRecord) => slotRecord.kind === "head")) issues.push(`${agent.id} is missing head artwork.`);
    if (!agent.artworkSlots.some((slotRecord) => slotRecord.kind === "eyes_open")) issues.push(`${agent.id} is missing open-eye artwork.`);
    if (!agent.artworkSlots.some((slotRecord) => slotRecord.kind === "eyes_blink")) issues.push(`${agent.id} is missing blink artwork.`);
    if (!agent.artworkSlots.some((slotRecord) => slotRecord.kind === "eyes_closed")) issues.push(`${agent.id} is missing offline/closed-eye artwork.`);
    if (Object.keys(agent.gameplayModifiers).length) issues.push(`${agent.id} must not define gameplay modifiers in v1.`);
    for (const slotRecord of agent.artworkSlots) {
      const missingPreset = aiAgentDerivativePresetIds.filter((presetId) => !slotRecord.derivativePresetIds.includes(presetId));
      if (missingPreset.length) issues.push(`${agent.id}/${slotRecord.id} is missing derivative presets: ${missingPreset.join(", ")}.`);
      if (!slotRecord.acceptedSourceFormats.includes("PSD") || !slotRecord.acceptedSourceFormats.includes("PNG")) issues.push(`${agent.id}/${slotRecord.id} must accept PSD and PNG sources.`);
      if (!slotRecord.alphaRequired) issues.push(`${agent.id}/${slotRecord.id} must require alpha.`);
    }
    if (!agent.componentLibraryReferences.includes("AiAgentPortrait")) issues.push(`${agent.id} must reference AiAgentPortrait.`);
    if (!agent.componentLibraryReferences.includes("AiAgentVariantCard")) issues.push(`${agent.id} must reference AiAgentVariantCard.`);
    if (JSON.stringify(agent).includes("/Users/") || JSON.stringify(agent).includes("studio-private://")) issues.push(`${agent.id} leaked a private source path.`);
  }
  for (const variantRecord of state.variants) {
    if (!ids.includes(variantRecord.agentId)) issues.push(`${variantRecord.id} must resolve agentId ${variantRecord.agentId}.`);
    if (!variantRecord.progressionMapping.cosmeticIdentity || variantRecord.progressionMapping.automationPowerSource !== "automation_upgrade_levels") issues.push(`${variantRecord.id} must remain cosmetic and use automation upgrade levels for Labor Assistance strength.`);
  }
  return { valid: issues.length === 0, issues };
}

export async function getAiAgentLibraryRuntimeExports(assetState?: AssetProductionState) {
  const state = await getAiAgentLibraryState(assetState);
  const validation = validateAiAgentLibrary(state);
  if (!validation.valid) throw new Error(`AI Agent Library validation failed: ${validation.issues.join(" ")}`);
  const runtime = getAiAgentRuntimeModules(assetState);
  return {
    ai_library: state.libraryAgents,
    ai_categories: state.categories,
    ai_rarity: state.rarityCatalog,
    ai_personality_catalog: state.personalityCatalog,
    ai_voice_catalog: state.voiceCatalog,
    ai_assignment_roles: state.assignmentRoles,
    ai_agents: runtime.aiAgents,
    forgotten_terminals: state.terminals.filter((record) => record.status === "published"),
    memory_fragments: state.memoryFragments.filter((record) => record.status === "published"),
    ai_relationships: state.relationships.filter((record) => record.status === "published"),
    dialogue_packs: state.dialoguePacks.filter((record) => record.status === "published")
  };
}

export const aiAgentInitialRecords = seedAgents;

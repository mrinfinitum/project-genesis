import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";
import { findAssetForPreviewKeys, resolveProductionAssetPreview, type VisualPreview } from "@/lib/assets/visual-previews";
import type {
  AiAgentAnimationProfileDefinition,
  AiAgentDefinition,
  AiAgentPersonalityDefinition,
  AiAgentSaveSchemaDefinition,
  AiAgentVisualState,
  AutomationPresentationDefinition
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
};

export type AiAgentSummary = Pick<AiAgentRecord, "id" | "displayName" | "shortDisplayName" | "description" | "personalityId" | "rarity" | "colorTheme" | "unlockRequirements" | "defaultForNewPlayers" | "supportedStates" | "componentLibraryReferences" | "approvalState" | "publishState"> & {
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

export type AiAgentLibraryState = {
  agents: AiAgentSummary[];
  records: AiAgentRecord[];
  personalities: AiAgentPersonalityDefinition[];
  animationProfiles: AiAgentAnimationProfileDefinition[];
  automationPresentation: AutomationPresentationDefinition;
  defaultAiAgentId: string;
  saveSchema: AiAgentSaveSchemaDefinition;
  derivativePresetIds: string[];
  acceptedSourceFormats: AiAgentArtworkSlot["acceptedSourceFormats"];
  stats: {
    total: number;
    published: number;
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
export const defaultAiAgentPersonalityId = "AI-PERSONALITY-OPTIMIST";
export const defaultAiAgentAnimationProfileId = "AI-ANIM-BLINK-DEFAULT";
export const automationPresentationId = "AI-AUTOMATION-PRESENTATION-DEFAULT";
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
    reducedMotionBehavior: "static_open"
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
  fields: {
    selectedAiAgentId: { status: "active", default: defaultAiAgentId, notes: "Active v1 player preference. Studio exports definitions only, not player-owned state." },
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
      slot("head", "Head/Base Artwork", "ai_agent_default_head", "head", "idle"),
      slot("eyes-open", "Eyes Open Artwork", "ai_agent_default_eyes_open", "eyes_open", "idle"),
      slot("eyes-blink", "Blink / Eyes Closed Artwork", "ai_agent_default_eyes_blink", "eyes_blink", "blink"),
      slot("eyes-closed", "Offline Eyes Closed Artwork", "ai_agent_default_eyes_closed", "eyes_closed", "offline"),
      slot("idle", "Idle Animation", "ai_agent_default_idle", "idle_animation", "idle", false),
      slot("blink", "Blink Animation", "ai_agent_default_blink", "blink_animation", "blink", false)
    ],
    expressionVariants: [
      expression("idle", "Idle/Open", ["Idle"], "ai_agent_default_expression_idle", true),
      expression("blink", "Blink/Closed", ["Blink"], "ai_agent_default_expression_blink", true),
      expression("offline", "Offline", ["Offline"], "ai_agent_default_expression_offline", true),
      expression("thinking", "Thinking", ["Thinking", "Research"], "ai_agent_default_expression_thinking"),
      expression("researching", "Research", ["Research"], "ai_agent_default_expression_researching"),
      expression("working", "Working", ["Working"], "ai_agent_default_expression_working"),
      expression("warning", "Warning", ["Warning"], "ai_agent_default_expression_warning"),
      expression("celebrating", "Celebration", ["Celebration"], "ai_agent_default_expression_celebration"),
      expression("surprised", "Surprised", ["Surprised"], "ai_agent_default_expression_surprised"),
      expression("sleeping", "Sleeping", ["Sleeping"], "ai_agent_default_expression_sleeping")
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
    componentLibraryReferences: ["AiAgentPortrait", "AiAgentPanel", "AiAgentStatus", "AiAgentSelector", "AiAgentCard", "AiAgentExpressionPreview", "AiAgentBlinkPreview"],
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
    componentLibraryReferences: ["AiAgentPortrait", "AiAgentPanel", "AiAgentStatus", "AiAgentSelector", "AiAgentCard", "AiAgentExpressionPreview", "AiAgentBlinkPreview"],
    notes: ["Future cosmetic unlock. No gameplay modifiers or balance changes."]
  }
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
  const expressionAssets = Object.fromEntries(agent.expressionVariants.map((variant) => [variant.id, variant.artKey])) as AiAgentDefinition["expressionAssets"];
  const assetReadiness = Object.fromEntries([
    ...agent.artworkSlots.map((slotRecord) => [slotRecord.artKey, runtimeReadiness(slotRecord.status)]),
    ...agent.expressionVariants.map((variant) => [variant.artKey, runtimeReadiness(variant.status)])
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

export function getAiAgentRuntimeModules(assetState?: AssetProductionState) {
  const records = seedAgents.map((agent) => enrichAgent(agent, assetState));
  return {
    aiAgents: records.map(runtimeAgent),
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
  return {
    agents,
    records,
    personalities: aiAgentPersonalities,
    animationProfiles: aiAgentAnimationProfiles,
    automationPresentation,
    defaultAiAgentId,
    saveSchema: aiAgentSaveSchema,
    derivativePresetIds: aiAgentDerivativePresetIds,
    acceptedSourceFormats: ["PNG", "SVG", "PSD", "PSB", "source_package"],
    stats: {
      total: records.length,
      published: records.filter((agent) => agent.publishState === "published").length,
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
  if (new Set(ids).size !== ids.length) issues.push("AI agent IDs must be unique.");
  if (!state.records.length) issues.push("At least one AI agent record is required.");
  const defaults = state.records.filter((agent) => agent.defaultForNewPlayers);
  if (defaults.length !== 1) issues.push("Exactly one AI agent must be defaultForNewPlayers.");
  if (state.defaultAiAgentId !== defaultAiAgentId) issues.push(`Default AI agent ID must be ${defaultAiAgentId}.`);
  const defaultAgent = state.records.find((agent) => agent.id === state.defaultAiAgentId);
  if (!defaultAgent) issues.push("Default AI agent record is missing.");
  if (defaultAgent && (defaultAgent.status !== "available" || defaultAgent.approvalState !== "approved" || defaultAgent.publishState !== "published")) issues.push("Default AI agent must be available, approved, and published.");
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
    if (JSON.stringify(agent).includes("/Users/") || JSON.stringify(agent).includes("studio-private://")) issues.push(`${agent.id} leaked a private source path.`);
  }
  return { valid: issues.length === 0, issues };
}

export const aiAgentInitialRecords = seedAgents;

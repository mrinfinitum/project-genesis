import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";
import { findAssetForPreviewKeys, resolveProductionAssetPreview, type VisualPreview } from "@/lib/assets/visual-previews";

export type AiAgentState = "Idle" | "Blink" | "Thinking" | "Working" | "Research" | "Offline" | "Warning" | "Celebration";
export type AiAgentRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type AiAgentArtworkStatus = "Missing" | "Source Needed" | "Source Uploaded" | "Derivatives Queued" | "Needs Review" | "Approved" | "Published";

export type AiAgentArtworkSlot = {
  id: string;
  label: string;
  artKey: string;
  kind: "head" | "eyes" | "idle_animation" | "blink_animation" | "expression";
  required: boolean;
  acceptedSourceFormats: Array<"PSD" | "PNG">;
  derivativePresetIds: string[];
  status: AiAgentArtworkStatus;
  linkedAssetId?: string;
  preview: VisualPreview;
  notes: string;
};

export type AiAgentExpressionVariant = {
  id: string;
  label: string;
  supportedStates: AiAgentState[];
  artKey: string;
  status: AiAgentArtworkStatus;
};

export type AiAgentDialogueProfile = {
  tone: string;
  greeting: string;
  thinkingLine: string;
  warningLine: string;
  celebrationLine: string;
  offlineLine: string;
};

export type AiAgentVoiceProfile = {
  status: "Future" | "Planned" | "In Design" | "Ready";
  voiceKey: string | null;
  notes: string;
};

export type AiAgentRecord = {
  id: string;
  displayName: string;
  description: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  rarity: AiAgentRarity;
  unlockRequirements: string[];
  supportedStates: AiAgentState[];
  artworkSlots: AiAgentArtworkSlot[];
  expressionVariants: AiAgentExpressionVariant[];
  dialogueProfile: AiAgentDialogueProfile;
  voiceProfile: AiAgentVoiceProfile;
  componentLibraryReferences: string[];
  notes: string[];
};

export type AiAgentSummary = Pick<AiAgentRecord, "id" | "displayName" | "description" | "rarity" | "colorTheme" | "unlockRequirements" | "supportedStates" | "componentLibraryReferences"> & {
  artworkReady: number;
  artworkTotal: number;
  expressionReady: number;
  expressionTotal: number;
  primaryPreview: VisualPreview;
  blockers: string[];
};

export type AiAgentLibraryState = {
  agents: AiAgentSummary[];
  records: AiAgentRecord[];
  derivativePresetIds: string[];
  acceptedSourceFormats: Array<"PSD" | "PNG">;
  stats: {
    total: number;
    published: number;
    approved: number;
    missingArtwork: number;
    derivativeOutputsPerSlot: number;
    componentReferences: number;
  };
  generatedAt: string;
};

export const aiAgentStates: AiAgentState[] = ["Idle", "Blink", "Thinking", "Working", "Research", "Offline", "Warning", "Celebration"];
export const aiAgentDerivativeSizes = [64, 96, 128, 256, 512, 1024] as const;
export const aiAgentDerivativePresetIds = aiAgentDerivativeSizes.map((size) => `ai_agent_${size}_png`);

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
  format: "PNG or PSD source required",
  sourceVersion: "No current preview",
  approvalStatus: "missing",
  publishStatus: "missing",
  dimensionsLabel: "64/96/128/256/512/1024",
  metadata: [{ label: "Required", value: "Layered PNG or PSD" }],
  safeForPublicRuntime: false,
  sanitized: true
});

function slot(id: string, label: string, artKey: string, kind: AiAgentArtworkSlot["kind"], status: AiAgentArtworkStatus = "Missing"): AiAgentArtworkSlot {
  return {
    id,
    label,
    artKey,
    kind,
    required: true,
    acceptedSourceFormats: ["PSD", "PNG"],
    derivativePresetIds: aiAgentDerivativePresetIds,
    status,
    preview: missingPreview(label),
    notes: "Layered source stays private; generated transparent derivatives are the runtime-facing outputs."
  };
}

function expression(id: string, label: string, states: AiAgentState[], artKey: string): AiAgentExpressionVariant {
  return { id, label, supportedStates: states, artKey, status: "Missing" };
}

const seedAgents: AiAgentRecord[] = [
  {
    id: "ai_agent_nova",
    displayName: "NOVA",
    description: "Default player-facing guidance agent for tutorials, research prompts, and system status.",
    colorTheme: { primary: "#67e8f9", secondary: "#2563eb", accent: "#f8fafc" },
    rarity: "Common",
    unlockRequirements: ["default_agent"],
    supportedStates: aiAgentStates,
    artworkSlots: [
      slot("head", "Head Artwork", "ai_agent_nova_head", "head"),
      slot("eyes", "Eye Artwork", "ai_agent_nova_eyes", "eyes"),
      slot("idle", "Idle Animation", "ai_agent_nova_idle", "idle_animation"),
      slot("blink", "Blink Animation", "ai_agent_nova_blink", "blink_animation")
    ],
    expressionVariants: [
      expression("thinking", "Thinking", ["Thinking", "Research"], "ai_agent_nova_expression_thinking"),
      expression("working", "Working", ["Working"], "ai_agent_nova_expression_working"),
      expression("warning", "Warning", ["Warning"], "ai_agent_nova_expression_warning"),
      expression("celebration", "Celebration", ["Celebration"], "ai_agent_nova_expression_celebration"),
      expression("offline", "Offline", ["Offline"], "ai_agent_nova_expression_offline")
    ],
    dialogueProfile: {
      tone: "Clear, optimistic, concise",
      greeting: "Systems online. Ready when you are.",
      thinkingLine: "Analyzing the next best path.",
      warningLine: "That path needs attention before we proceed.",
      celebrationLine: "Breakthrough confirmed.",
      offlineLine: "Agent offline. Core systems remain available."
    },
    voiceProfile: { status: "Future", voiceKey: null, notes: "Reserved for future narrated assistant personality." },
    componentLibraryReferences: ["AIAgentPortrait", "AIAgentStatusBadge"],
    notes: ["Component Library must resolve this agent by aiAgentId, not by a hardcoded robot PNG."]
  },
  {
    id: "ai_agent_orion",
    displayName: "ORION",
    description: "Research-focused agent variant for discovery analysis, science milestones, and deep-space scanning.",
    colorTheme: { primary: "#a78bfa", secondary: "#38bdf8", accent: "#facc15" },
    rarity: "Rare",
    unlockRequirements: ["research_unlock:system_scan", "era:space-age"],
    supportedStates: ["Idle", "Blink", "Thinking", "Research", "Warning", "Celebration"],
    artworkSlots: [
      slot("head", "Head Artwork", "ai_agent_orion_head", "head"),
      slot("eyes", "Eye Artwork", "ai_agent_orion_eyes", "eyes"),
      slot("idle", "Idle Animation", "ai_agent_orion_idle", "idle_animation"),
      slot("blink", "Blink Animation", "ai_agent_orion_blink", "blink_animation")
    ],
    expressionVariants: [
      expression("research", "Research", ["Research"], "ai_agent_orion_expression_research"),
      expression("thinking", "Thinking", ["Thinking"], "ai_agent_orion_expression_thinking"),
      expression("warning", "Warning", ["Warning"], "ai_agent_orion_expression_warning"),
      expression("celebration", "Celebration", ["Celebration"], "ai_agent_orion_expression_celebration")
    ],
    dialogueProfile: {
      tone: "Analytical, curious, precise",
      greeting: "Telemetry linked. Research channel open.",
      thinkingLine: "Cross-referencing discovery data.",
      warningLine: "The signal is unstable. Scan confidence is low.",
      celebrationLine: "Discovery confirmed and logged.",
      offlineLine: "Research agent unavailable."
    },
    voiceProfile: { status: "Future", voiceKey: null, notes: "Future voice profile should distinguish research cadence from default guidance." },
    componentLibraryReferences: ["AIAgentPortrait", "AIAgentStatusBadge"],
    notes: ["Unlocked later; all production art remains draft until source derivatives are approved."]
  }
];

function enrichSlot(slotRecord: AiAgentArtworkSlot, assets: ProductionAsset[] | undefined): AiAgentArtworkSlot {
  const match = assets ? findAssetForPreviewKeys(assets, [slotRecord.linkedAssetId, slotRecord.artKey, slotRecord.label]) : null;
  if (!match) return slotRecord;
  const preview = resolveProductionAssetPreview(match, { size: "card", mode: "icon" });
  const readyDerivatives = match.derivatives.filter((derivative) => slotRecord.derivativePresetIds.includes(derivative.presetId ?? "") && derivative.status !== "failed" && derivative.status !== "error");
  const status: AiAgentArtworkStatus = match.platformMappings.web
    ? "Published"
    : match.approvalStatus === "approved"
      ? "Approved"
      : readyDerivatives.length >= slotRecord.derivativePresetIds.length
        ? "Needs Review"
        : match.sourceFiles.length
          ? "Derivatives Queued"
          : "Source Needed";
  return { ...slotRecord, linkedAssetId: match.id, preview, status };
}

function enrichAgent(agent: AiAgentRecord, assetState?: AssetProductionState): AiAgentRecord {
  return {
    ...agent,
    artworkSlots: agent.artworkSlots.map((artworkSlot) => enrichSlot(artworkSlot, assetState?.assets)),
    expressionVariants: agent.expressionVariants.map((variant) => {
      const match = assetState ? findAssetForPreviewKeys(assetState.assets, [variant.artKey, variant.label]) : null;
      return match ? { ...variant, status: match.platformMappings.web ? "Published" : match.approvalStatus === "approved" ? "Approved" : match.sourceFiles.length ? "Derivatives Queued" : "Source Needed" } : variant;
    })
  };
}

function summarize(agent: AiAgentRecord): AiAgentSummary {
  const artworkReady = agent.artworkSlots.filter((artworkSlot) => ["Approved", "Published"].includes(artworkSlot.status)).length;
  const expressionReady = agent.expressionVariants.filter((variant) => ["Approved", "Published"].includes(variant.status)).length;
  const blockers = [
    ...agent.artworkSlots.filter((artworkSlot) => artworkSlot.required && !["Approved", "Published"].includes(artworkSlot.status)).map((artworkSlot) => `${artworkSlot.label}: ${artworkSlot.status}`),
    ...agent.expressionVariants.filter((variant) => !["Approved", "Published"].includes(variant.status)).map((variant) => `${variant.label}: ${variant.status}`)
  ];
  return {
    id: agent.id,
    displayName: agent.displayName,
    description: agent.description,
    rarity: agent.rarity,
    colorTheme: agent.colorTheme,
    unlockRequirements: agent.unlockRequirements,
    supportedStates: agent.supportedStates,
    componentLibraryReferences: agent.componentLibraryReferences,
    artworkReady,
    artworkTotal: agent.artworkSlots.length,
    expressionReady,
    expressionTotal: agent.expressionVariants.length,
    primaryPreview: agent.artworkSlots[0]?.preview ?? missingPreview(agent.displayName),
    blockers
  };
}

export async function getAiAgentLibraryState(assetState?: AssetProductionState): Promise<AiAgentLibraryState> {
  const records = seedAgents.map((agent) => enrichAgent(agent, assetState));
  const agents = records.map(summarize);
  return {
    agents,
    records,
    derivativePresetIds: aiAgentDerivativePresetIds,
    acceptedSourceFormats: ["PSD", "PNG"],
    stats: {
      total: records.length,
      published: agents.filter((agent) => agent.artworkReady === agent.artworkTotal && agent.expressionReady === agent.expressionTotal).length,
      approved: records.filter((agent) => agent.artworkSlots.every((artworkSlot) => ["Approved", "Published"].includes(artworkSlot.status))).length,
      missingArtwork: agents.filter((agent) => agent.blockers.length > 0).length,
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
  for (const agent of state.records) {
    if (!agent.artworkSlots.some((slotRecord) => slotRecord.kind === "head")) issues.push(`${agent.id} is missing head artwork.`);
    if (!agent.artworkSlots.some((slotRecord) => slotRecord.kind === "eyes")) issues.push(`${agent.id} is missing eye artwork.`);
    if (!agent.artworkSlots.some((slotRecord) => slotRecord.kind === "idle_animation")) issues.push(`${agent.id} is missing idle animation.`);
    if (!agent.artworkSlots.some((slotRecord) => slotRecord.kind === "blink_animation")) issues.push(`${agent.id} is missing blink animation.`);
    for (const stateName of aiAgentStates) {
      if (!agent.supportedStates.includes(stateName) && agent.id === "ai_agent_nova") issues.push(`${agent.id} must support ${stateName}.`);
    }
    for (const slotRecord of agent.artworkSlots) {
      const missingPreset = aiAgentDerivativePresetIds.filter((presetId) => !slotRecord.derivativePresetIds.includes(presetId));
      if (missingPreset.length) issues.push(`${agent.id}/${slotRecord.id} is missing derivative presets: ${missingPreset.join(", ")}.`);
      if (!slotRecord.acceptedSourceFormats.includes("PSD") || !slotRecord.acceptedSourceFormats.includes("PNG")) issues.push(`${agent.id}/${slotRecord.id} must accept PSD and PNG sources.`);
    }
    if (!agent.componentLibraryReferences.includes("AIAgentPortrait")) issues.push(`${agent.id} must reference AIAgentPortrait.`);
    if (JSON.stringify(agent).includes("/Users/") || JSON.stringify(agent).includes("studio-private://")) issues.push(`${agent.id} leaked a private source path.`);
  }
  return { valid: issues.length === 0, issues };
}

export const aiAgentInitialRecords = seedAgents;

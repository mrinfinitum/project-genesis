import type { ImportIssue } from "@/types/runtime";

export type ProgressionCurveMode = "linear" | "exponential" | "quadratic" | "logarithmic" | "stepped" | "milestone" | "piecewise" | "explicit" | "formula" | "hybrid";

export type ProgressionCurve = {
  mode: ProgressionCurveMode;
  base: number;
  growth: number;
  exponent?: number;
  stepSize?: number;
  minimum?: number;
  maximum?: number;
};

export type EraScalingProfile = {
  eraId: string;
  order: number;
  xp: number;
  labor: number;
  money: number;
  resources: number;
  duration: number;
  output: number;
  research: number;
  crystal: number;
};

export type ProgressionLevelOverride = {
  level: number;
  milestoneEffects: string[];
  unlockEffects: string[];
  outputMultiplier?: number;
  notes: string;
};

export type ProgressionGeneratedLevel = {
  level: number;
  xpRequired: number;
  cumulativeXp: number;
  laborCost: number;
  moneyCost: number;
  resourceCosts: Array<{ resourceId: string; amount: number }>;
  durationSeconds: number;
  outputValue: number;
  researchValue: number;
  efficiencyValue: number;
  milestoneEffects: string[];
  unlockEffects: string[];
  crystalAccelerationCost: number;
  prerequisiteOverrides: string[];
  notes: string;
  sourceProfileVersion: string;
  checksum: string;
};

export type ProgressionProfile = {
  id: string;
  version: "1.0.0";
  status: "approved" | "draft";
  displayName: string;
  description: string;
  domain: "upgrade" | "research" | "building" | "production" | "mining" | "exploration" | "mission" | "ship" | "settlement" | "colony" | "civilization" | "resource" | "custom";
  era: string;
  tier: string;
  minLevel: number;
  maxLevel: number;
  curveMode: ProgressionCurveMode;
  xpCurve: ProgressionCurve;
  laborCurve: ProgressionCurve;
  moneyCurve: ProgressionCurve;
  resourceCurves: Array<{ resourceId: string; curve: ProgressionCurve }>;
  durationCurve: ProgressionCurve;
  outputCurve: ProgressionCurve;
  researchCurve: ProgressionCurve;
  milestoneRules: ProgressionLevelOverride[];
  crystalRules: { profileId: string; prerequisiteBypassAllowed: false };
  masteryXpOverflowPolicy: "carry_forward" | "clamp_to_requirement" | "discard";
  prerequisiteRules: string[];
  offlineRules: string[];
  validation: { status: "Ready"; rules: string[] };
  createdAt: string;
  updatedAt: string;
};

export type UpgradeXpSourceProfile = {
  id: string;
  displayName: string;
  sourceType: "production_generated" | "research_generated" | "resources_processed" | "buildings_completed" | "missions_completed" | "exploration_completed" | "distance_traveled" | "scans_completed" | "discoveries_made" | "population_generated" | "civic_actions_completed" | "trade_completed" | "mining_completed" | "manufacturing_completed" | "time_active" | "custom_event";
  conversionRate: number;
  unit: string;
  eligibleEventTypes: string[];
  filters: string[];
  caps: { daily: number | null; perEvent: number | null };
  diminishingReturns: string;
  offlineEligibility: boolean;
  modifiers: string[];
  combinationMode: "primary" | "weighted";
};

export type CrystalAccelerationProfile = {
  id: string;
  displayName: string;
  accelerationMode: "reduce_remaining_time" | "instant_completion" | "progress_chunk";
  baseCrystalCost: number;
  costCurve: ProgressionCurve;
  costPerSecond: number;
  costPerMinute: number;
  costPerHour: number;
  chunkSize: number | null;
  chunkType: string | null;
  instantCompletionAllowed: boolean;
  partialAccelerationAllowed: boolean;
  prerequisiteBypassAllowed: false;
  minimumCost: number;
  maximumCost: number;
  roundingRule: "ceil";
  eraMultiplier: boolean;
  tierMultiplier: number;
  rarityMultiplier: number;
  discountRules: string[];
  validation: string[];
};

export type CrystalChunk = {
  id: string;
  displayName: string;
  value: number;
  unit: string;
  targetDomains: string[];
  crystalCost: number;
  scaling: "fixed" | "era_scaled";
  maximumUse: number;
  cooldownSeconds: number;
  eligibilityRules: string[];
};

export type ProgressionSystemContract = {
  id: "canonical_progression_system_v1";
  version: "1.0.0";
  ownership: { studioOwns: string[]; gameOwns: string[] };
  curveModes: ProgressionCurveMode[];
  eraScalingProfiles: EraScalingProfile[];
  progressionProfiles: ProgressionProfile[];
  upgradeXpSourceProfiles: UpgradeXpSourceProfile[];
  crystalAccelerationProfiles: CrystalAccelerationProfile[];
  crystalChunks: CrystalChunk[];
  reconciliationPolicy: {
    id: "progression_reconciliation_v1";
    version: "1.0.0";
    xpRequirementsChanged: "preserve_absolute_xp";
    maxLevelDecreased: "preserve_level";
    maxLevelIncreased: "preserve_level";
    laborCostChanged: "use_new_cost_for_future_levels";
    effectCurveChanged: "recalculate_from_current_level";
    xpSourceChanged: "preserve_absolute_xp";
    overflowPolicyChanged: "apply_on_next_xp_award";
    upgradeDeprecated: "preserve_level";
  };
  generatedLevelCount: number;
  validationStatus: "Ready" | "Blocked";
};

const canonicalTimestamp = "2026-08-03T00:00:00.000Z";
export const progressionCurveModes: ProgressionCurveMode[] = ["linear", "exponential", "quadratic", "logarithmic", "stepped", "milestone", "piecewise", "explicit", "formula", "hybrid"];

const eraIds = ["survival", "ancient", "medieval", "renaissance", "industrial", "modern", "space-age", "interstellar", "galactic"];
export const eraScalingProfiles: EraScalingProfile[] = eraIds.map((eraId, index) => {
  const order = index + 1;
  return {
    eraId,
    order,
    xp: Number((0.72 + order * 0.28).toFixed(2)),
    labor: Number((0.65 + order * 0.35).toFixed(2)),
    money: Number((0.55 + order * 0.45).toFixed(2)),
    resources: Number((0.6 + order * 0.4).toFixed(2)),
    duration: Number((0.55 + order * 0.5).toFixed(2)),
    output: Number((0.35 + Math.pow(order, 1.45) * 0.4).toFixed(2)),
    research: Number((0.5 + order * 0.38).toFixed(2)),
    crystal: Number((0.7 + order * 0.3).toFixed(2))
  };
});

const milestones: ProgressionLevelOverride[] = [
  { level: 10, milestoneEffects: ["early_specialization"], unlockEffects: [], outputMultiplier: 1.05, notes: "Early engagement milestone." },
  { level: 25, milestoneEffects: ["specialization_unlock"], unlockEffects: ["profile_specialization"], outputMultiplier: 1.08, notes: "Specialization milestone." },
  { level: 50, milestoneEffects: ["major_efficiency"], unlockEffects: [], outputMultiplier: 1.15, notes: "Major effect milestone." },
  { level: 75, milestoneEffects: ["advanced_specialization"], unlockEffects: [], outputMultiplier: 1.2, notes: "Long-term specialization milestone." },
  { level: 100, milestoneEffects: ["mastery"], unlockEffects: ["mastered_state"], outputMultiplier: 1.35, notes: "Canonical mastered state." }
];

export const progressionProfiles: ProgressionProfile[] = eraScalingProfiles.map((era) => ({
  id: `progression_upgrade_${era.eraId}`,
  version: "1.0.0",
  status: "approved",
  displayName: `${era.eraId.replace(/-/g, " ")} Upgrade Curve`,
  description: `Canonical level 1-100 upgrade pacing for ${era.eraId}.`,
  domain: "upgrade",
  era: era.eraId,
  tier: era.order <= 3 ? "early" : era.order <= 6 ? "mid" : "future",
  minLevel: 1,
  maxLevel: 100,
  curveMode: "hybrid",
  xpCurve: { mode: "hybrid", base: 18, growth: 1.095 + era.order * 0.004, exponent: 2.08 },
  laborCurve: { mode: "hybrid", base: 4, growth: 1.075 + era.order * 0.004, exponent: 1.86 },
  moneyCurve: { mode: "exponential", base: 8, growth: 1.07 + era.order * 0.005 },
  resourceCurves: [],
  durationCurve: { mode: "hybrid", base: 30, growth: 1.07 + era.order * 0.004, exponent: 1.75, maximum: 60 * 60 * 24 * 120 },
  outputCurve: { mode: "quadratic", base: 0.1, growth: 0.018, exponent: 1.62 },
  researchCurve: { mode: "quadratic", base: 0.05, growth: 0.012, exponent: 1.55 },
  milestoneRules: milestones,
  crystalRules: { profileId: "crystal_time_standard", prerequisiteBypassAllowed: false },
  masteryXpOverflowPolicy: "carry_forward",
  prerequisiteRules: ["canonical_unlock_requirements", "previous_level_complete", "mastery_xp_full"],
  offlineRules: ["xp_sources_must_explicitly_allow_offline_progress", "active_timers_use_authoritative_elapsed_time"],
  validation: { status: "Ready", rules: ["levels_are_contiguous", "costs_are_non_negative", "level_100_is_mastery"] },
  createdAt: canonicalTimestamp,
  updatedAt: canonicalTimestamp
}));

export const upgradeXpSourceProfiles: UpgradeXpSourceProfile[] = [
  ["xp_production", "Production Generated", "production_generated", "production"],
  ["xp_research", "Research Generated", "research_generated", "research"],
  ["xp_resources", "Resources Processed", "resources_processed", "resources"],
  ["xp_buildings", "Buildings Completed", "buildings_completed", "buildings"],
  ["xp_missions", "Missions Completed", "missions_completed", "missions"],
  ["xp_exploration", "Exploration Completed", "exploration_completed", "exploration"],
  ["xp_travel", "Distance Traveled", "distance_traveled", "distance"],
  ["xp_scans", "Scans Completed", "scans_completed", "scans"],
  ["xp_discoveries", "Discoveries Made", "discoveries_made", "discoveries"],
  ["xp_population", "Population Generated", "population_generated", "population"],
  ["xp_civic", "Civic Actions Completed", "civic_actions_completed", "actions"],
  ["xp_trade", "Trade Completed", "trade_completed", "trade"],
  ["xp_mining", "Mining Completed", "mining_completed", "mining"],
  ["xp_manufacturing", "Manufacturing Completed", "manufacturing_completed", "manufacturing"],
  ["xp_time_active", "Time Active", "time_active", "seconds"],
  ["xp_custom_event", "Custom Event", "custom_event", "events"]
].map(([id, displayName, sourceType, unit]) => ({
  id, displayName, sourceType: sourceType as UpgradeXpSourceProfile["sourceType"], conversionRate: 1, unit,
  eligibleEventTypes: [sourceType], filters: [], caps: { daily: null, perEvent: null }, diminishingReturns: "none",
  offlineEligibility: sourceType === "production_generated" || sourceType === "research_generated" || sourceType === "time_active",
  modifiers: [], combinationMode: "primary"
}));

export const crystalAccelerationProfiles: CrystalAccelerationProfile[] = [
  { id: "crystal_time_standard", displayName: "Standard Time Acceleration", accelerationMode: "reduce_remaining_time", baseCrystalCost: 1, costCurve: { mode: "linear", base: 1, growth: 1 }, costPerSecond: 0, costPerMinute: 0.02, costPerHour: 1.2, chunkSize: null, chunkType: null, instantCompletionAllowed: false, partialAccelerationAllowed: true, prerequisiteBypassAllowed: false, minimumCost: 1, maximumCost: 100000, roundingRule: "ceil", eraMultiplier: true, tierMultiplier: 1, rarityMultiplier: 1, discountRules: [], validation: ["cost_positive", "requirements_preserved", "minimum_duration_preserved"] },
  { id: "crystal_instant_eligible", displayName: "Eligible Instant Completion", accelerationMode: "instant_completion", baseCrystalCost: 5, costCurve: { mode: "linear", base: 5, growth: 1.25 }, costPerSecond: 0, costPerMinute: 0.04, costPerHour: 2.4, chunkSize: null, chunkType: null, instantCompletionAllowed: true, partialAccelerationAllowed: false, prerequisiteBypassAllowed: false, minimumCost: 5, maximumCost: 250000, roundingRule: "ceil", eraMultiplier: true, tierMultiplier: 1.5, rarityMultiplier: 1, discountRules: [], validation: ["action_must_allow_instant_completion", "requirements_preserved"] },
  { id: "crystal_progress_chunk", displayName: "Canonical Progress Chunk", accelerationMode: "progress_chunk", baseCrystalCost: 2, costCurve: { mode: "stepped", base: 2, growth: 1, stepSize: 5 }, costPerSecond: 0, costPerMinute: 0, costPerHour: 0, chunkSize: 60, chunkType: "domain_progress", instantCompletionAllowed: false, partialAccelerationAllowed: true, prerequisiteBypassAllowed: false, minimumCost: 2, maximumCost: 50000, roundingRule: "ceil", eraMultiplier: true, tierMultiplier: 1, rarityMultiplier: 1, discountRules: [], validation: ["chunk_cap_enforced", "requirements_preserved"] }
];

export const crystalChunks: CrystalChunk[] = ["labor", "research", "production", "mining", "mission", "construction", "travel"].map((domain, index) => ({
  id: `crystal_${domain}_chunk`, displayName: `${domain[0].toUpperCase()}${domain.slice(1)} Chunk`, value: index < 2 ? 100 : 60,
  unit: index < 2 ? "points" : "progress_seconds", targetDomains: [domain], crystalCost: 2 + index, scaling: "era_scaled",
  maximumUse: 20, cooldownSeconds: 0, eligibilityRules: ["target_action_is_valid", "hard_prerequisites_satisfied", "server_authoritative_transaction"]
}));

function fnv1a(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function curveValue(curve: ProgressionCurve, level: number) {
  const x = Math.max(1, level);
  let value: number;
  switch (curve.mode) {
    case "linear": value = curve.base + curve.growth * (x - 1); break;
    case "exponential": value = curve.base * Math.pow(curve.growth, x - 1); break;
    case "quadratic": value = curve.base + curve.growth * Math.pow(x, curve.exponent ?? 2); break;
    case "logarithmic": value = curve.base + curve.growth * Math.log2(x + 1); break;
    case "stepped": value = curve.base + curve.growth * Math.floor((x - 1) / Math.max(1, curve.stepSize ?? 10)); break;
    default: {
      const early = curve.base * Math.pow(curve.growth, Math.min(x, 30) - 1);
      const late = Math.pow(Math.max(0, x - 30), curve.exponent ?? 2) * curve.growth;
      value = early + late;
    }
  }
  return Math.min(curve.maximum ?? Number.MAX_SAFE_INTEGER, Math.max(curve.minimum ?? 0, value));
}

export function progressionProfileForEra(eraId: string) {
  return progressionProfiles.find((profile) => profile.era === eraId) ?? progressionProfiles[0];
}

export function xpSourceProfileForDomain(domain: string) {
  const lookup: Record<string, string> = { science: "xp_research", technology: "xp_research", industry: "xp_manufacturing", workforce: "xp_production" };
  return upgradeXpSourceProfiles.find((profile) => profile.id === (lookup[domain] ?? "xp_production")) ?? upgradeXpSourceProfiles[0];
}

export function generateProgressionLevels(profile: ProgressionProfile, options: { baseCost?: number; baseOutput?: number; resourceId?: string | null } = {}): ProgressionGeneratedLevel[] {
  const era = eraScalingProfiles.find((item) => item.eraId === profile.era) ?? eraScalingProfiles[0];
  let cumulativeXp = 0;
  return Array.from({ length: profile.maxLevel - profile.minLevel + 1 }, (_, offset) => {
    const level = profile.minLevel + offset;
    const override = profile.milestoneRules.find((item) => item.level === level);
    const xpRequired = level === 1 ? 0 : Math.round(curveValue(profile.xpCurve, level) * era.xp);
    cumulativeXp += xpRequired;
    const outputMultiplier = override?.outputMultiplier ?? 1;
    const row = {
      level,
      xpRequired,
      cumulativeXp,
      laborCost: level === 1 ? 0 : Math.round(curveValue(profile.laborCurve, level) * era.labor),
      moneyCost: level === 1 ? 0 : Math.round((curveValue(profile.moneyCurve, level) + (options.baseCost ?? 0)) * era.money),
      resourceCosts: options.resourceId && level > 1 ? [{ resourceId: options.resourceId, amount: Math.max(1, Math.round(level * era.resources)) }] : [],
      durationSeconds: level === 1 ? 0 : Math.round(curveValue(profile.durationCurve, level) * era.duration),
      outputValue: Number(((options.baseOutput ?? 1) * curveValue(profile.outputCurve, level) * era.output * outputMultiplier).toFixed(4)),
      researchValue: Number((curveValue(profile.researchCurve, level) * era.research).toFixed(4)),
      efficiencyValue: Number((1 + Math.log10(level + 1) * 0.08).toFixed(4)),
      milestoneEffects: override?.milestoneEffects ?? [],
      unlockEffects: override?.unlockEffects ?? [],
      crystalAccelerationCost: level === 1 ? 0 : Math.max(1, Math.ceil(curveValue(profile.durationCurve, level) / 3600 * era.crystal)),
      prerequisiteOverrides: [],
      notes: override?.notes ?? "",
      sourceProfileVersion: profile.version
    };
    return { ...row, checksum: fnv1a(JSON.stringify(row)) };
  });
}

export function validateProgressionSystem(system: ProgressionSystemContract = canonicalProgressionSystem): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const ids = new Set<string>();
  const validOverflowPolicies = new Set(["carry_forward", "clamp_to_requirement", "discard"]);
  const validMilestoneEffects = new Set(milestones.flatMap((milestone) => milestone.milestoneEffects));
  for (const profile of system.progressionProfiles) {
    if (ids.has(profile.id)) issues.push({ severity: "error", code: "duplicate_progression_profile", message: `Duplicate progression profile ${profile.id}.`, records: [profile.id] });
    ids.add(profile.id);
    const levels = generateProgressionLevels(profile);
    if (levels.length !== profile.maxLevel || levels.at(-1)?.level !== 100 || levels.some((row, index) => row.level !== index + 1)) issues.push({ severity: "error", code: "progression_level_gap", message: `${profile.id} must generate contiguous levels 1-100.`, records: [profile.id] });
    if (new Set(levels.map((row) => row.level)).size !== levels.length) issues.push({ severity: "error", code: "progression_level_duplicate", message: `${profile.id} generated duplicate levels.`, records: [profile.id] });
    if (levels.some((row) => row.xpRequired < 0 || row.laborCost < 0 || row.moneyCost < 0 || row.durationSeconds < 0 || row.outputValue < 0)) issues.push({ severity: "error", code: "negative_progression_value", message: `${profile.id} generated a negative value.`, records: [profile.id] });
    if (levels.some((row, index) => index > 0 && row.cumulativeXp < levels[index - 1].cumulativeXp)) issues.push({ severity: "error", code: "progression_cumulative_xp_not_monotonic", message: `${profile.id} cumulative XP must be monotonic.`, records: [profile.id] });
    if (levels.some((row) => !Number.isFinite(row.outputValue) || !Number.isFinite(row.crystalAccelerationCost) || !row.sourceProfileVersion || !row.checksum)) issues.push({ severity: "error", code: "progression_level_not_executable", message: `${profile.id} generated an incomplete executable row.`, records: [profile.id] });
    if (levels.some((row) => row.milestoneEffects.some((effectId) => !validMilestoneEffects.has(effectId)))) issues.push({ severity: "error", code: "progression_milestone_effect_missing", message: `${profile.id} references an unknown milestone effect.`, records: [profile.id] });
    if (!validOverflowPolicies.has(profile.masteryXpOverflowPolicy)) issues.push({ severity: "error", code: "progression_overflow_policy_missing", message: `${profile.id} must resolve a mastery XP overflow policy.`, records: [profile.id] });
    if ((levels[99]?.xpRequired ?? 0) <= (levels[9]?.xpRequired ?? 0) || (levels[99]?.durationSeconds ?? 0) <= (levels[9]?.durationSeconds ?? 0)) issues.push({ severity: "error", code: "late_progression_not_slower", message: `${profile.id} late progression must exceed early progression.`, records: [profile.id] });
  }
  for (const profile of system.crystalAccelerationProfiles) {
    if (profile.baseCrystalCost <= 0 || profile.minimumCost <= 0 || profile.prerequisiteBypassAllowed) issues.push({ severity: "error", code: "unsafe_crystal_profile", message: `${profile.id} is not safe.`, records: [profile.id] });
  }
  return issues;
}

export const canonicalProgressionSystem: ProgressionSystemContract = {
  id: "canonical_progression_system_v1",
  version: "1.0.0",
  ownership: {
    studioOwns: ["curve definitions", "explicit generated levels", "XP sources", "era scaling", "labor costs", "crystal acceleration rules", "validation", "runtime publication"],
    gameOwns: ["player levels", "mastery XP progress", "active timers", "queues", "saves", "player modifiers", "protected transactions"]
  },
  curveModes: progressionCurveModes,
  eraScalingProfiles,
  progressionProfiles,
  upgradeXpSourceProfiles,
  crystalAccelerationProfiles,
  crystalChunks,
  reconciliationPolicy: {
    id: "progression_reconciliation_v1",
    version: "1.0.0",
    xpRequirementsChanged: "preserve_absolute_xp",
    maxLevelDecreased: "preserve_level",
    maxLevelIncreased: "preserve_level",
    laborCostChanged: "use_new_cost_for_future_levels",
    effectCurveChanged: "recalculate_from_current_level",
    xpSourceChanged: "preserve_absolute_xp",
    overflowPolicyChanged: "apply_on_next_xp_award",
    upgradeDeprecated: "preserve_level"
  },
  generatedLevelCount: progressionProfiles.reduce((sum, profile) => sum + profile.maxLevel, 0),
  validationStatus: "Ready"
};

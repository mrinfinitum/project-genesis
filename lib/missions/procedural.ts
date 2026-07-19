import { appendTimelineEvent, upsertDiscoveryJournalEntry } from "@/lib/explorer/discovery-log";
import { generateFallbackColonies, type ColonyRecord } from "@/lib/colonies/procedural";
import { buildEconomyState, type MarketRecord, type TradeRoute } from "@/lib/economy/trade";
import { generateFallbackFactions, hashText, type FactionRecord } from "@/lib/factions/procedural";
import { handoffData } from "@/data/handoff";
import { generatedCelestialBodyRows, generatedStarSystemRows, getLocalBubbleSystems } from "@/lib/universe/fallback-data";
import { ResourceService } from "@/lib/resources/service";
import type { CelestialBodyRecord, GeneratedPlanet, ResearchNode, StarSystemRecord } from "@/types/schema";

export const missionStatuses = ["available", "accepted", "active", "completed", "failed", "expired", "abandoned"] as const;
export const missionDifficulties = ["trivial", "easy", "moderate", "hard", "extreme", "legendary"] as const;
export const missionTypes = ["Exploration", "Research", "Colony", "Trade", "Faction", "Security"] as const;
export const objectiveTypes = [
  "scan_sector",
  "scan_star_system",
  "scan_planet",
  "discover_resource",
  "discover_faction",
  "chart_location",
  "claim_planet",
  "colonize_planet",
  "establish_colony",
  "construct_building",
  "produce_resource",
  "deliver_resource",
  "establish_trade_route",
  "stabilize_market",
  "resolve_shortage",
  "escort_trade_route",
  "survey_anomaly",
  "complete_research"
] as const;
export const rewardTypes = ["discovery_points", "credits", "resource", "research_points", "research_unlock", "faction_reputation", "colony_bonus", "trade_access", "unique_item", "title", "collectible"] as const;

export type MissionStatus = (typeof missionStatuses)[number];
export type MissionDifficulty = (typeof missionDifficulties)[number];
export type MissionType = (typeof missionTypes)[number];
export type MissionObjectiveType = (typeof objectiveTypes)[number];
export type MissionRewardType = (typeof rewardTypes)[number];

export type MissionObjective = {
  id: string;
  missionId: string;
  objectiveType: MissionObjectiveType;
  targetId: string;
  targetType: string;
  targetCount: number;
  currentCount: number;
  requiredState?: string;
  locationId?: string;
  optional: boolean;
  completed: boolean;
  description: string;
};

export type MissionReward = {
  id: string;
  missionId: string;
  rewardType: MissionRewardType;
  resourceId?: string;
  researchId?: string;
  factionId?: string;
  amount: number;
  description: string;
};

export type MissionHistoryEvent = {
  id: string;
  eventType: "generated" | "accepted" | "tracked" | "untracked" | "objective_progress" | "completed" | "failed" | "expired" | "abandoned" | "rewards_claimed";
  title: string;
  description: string;
  timestamp: string;
};

export type MissionRecord = {
  id: string;
  seedId: string;
  title: string;
  description: string;
  missionType: MissionType;
  status: MissionStatus;
  difficulty: MissionDifficulty;
  rarity: string;
  priority: number;
  issuingFactionId?: string;
  targetFactionId?: string;
  galaxyId?: string;
  sectorId?: string;
  starSystemId?: string;
  planetId?: string;
  colonyId?: string;
  marketId?: string;
  tradeRouteId?: string;
  objectiveIds: string[];
  rewardIds: string[];
  prerequisiteResearchIds: string[];
  requiredDiscoveryState?: string;
  generatedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  repeatable: boolean;
  generatedName: string;
  displayName?: string;
  tags: string[];
  rewardsClaimed: boolean;
  tracked: boolean;
  history: MissionHistoryEvent[];
};

export type MissionBundle = {
  missions: MissionRecord[];
  objectives: MissionObjective[];
  rewards: MissionReward[];
  trackedMissionIds: string[];
  generationMetadata: typeof missionGenerationMetadata;
};

export type MissionProgressEvent = {
  objectiveType: MissionObjectiveType;
  targetId?: string;
  targetType?: string;
  locationId?: string;
  amount?: number;
};

export type MissionGenerationInput = {
  missionSeed?: string;
  galaxies?: Array<Record<string, unknown>>;
  sectors?: Array<Record<string, unknown>>;
  starSystems?: Array<Partial<StarSystemRecord> & { id: string; system_name?: string; sector_id?: string }>;
  planets?: GeneratedPlanet[];
  celestialBodies?: Array<Partial<CelestialBodyRecord> & { id: string; name: string; system_id?: string; celestial_body_type?: string; colonizable?: boolean; colonizable_status?: string; is_starting_body?: boolean }>;
  factions?: FactionRecord[];
  colonies?: ColonyRecord[];
  markets?: MarketRecord[];
  tradeRoutes?: TradeRoute[];
  research?: ResearchNode[];
  generatedAt?: string;
};

export const MISSIONS_STORAGE_KEY = "project-genesis-missions-state";
export const MISSIONS_UPDATED_EVENT = "project-genesis-missions-updated";

export const missionGenerationMetadata = {
  deterministicInputs: ["mission seed", "current state snapshot", "issuing faction", "target location", "mission type"],
  availabilityRules: ["required objects exist", "target links resolve", "research prerequisites are met", "required discovery state is satisfied", "invalid/deleted targets are rejected"],
  hierarchyRule: "Missions reference Galaxy -> Sector -> Star System -> Planet / Celestial Body without adding Region or Cluster layers."
};

export const missionSchemas = {
  mission: "MissionRecord",
  objective: "MissionObjective",
  reward: "MissionReward",
  statusValues: missionStatuses,
  difficultyValues: missionDifficulties,
  objectiveTypes,
  rewardTypes
};

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function nowIso() {
  return new Date().toISOString();
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function history(missionId: string, eventType: MissionHistoryEvent["eventType"], title: string, description: string, timestamp = nowIso()): MissionHistoryEvent {
  return {
    id: `mission-history-${slug(`${missionId}-${eventType}-${timestamp}`)}`,
    eventType,
    title,
    description,
    timestamp
  };
}

function missionBase(input: {
  seedId: string;
  title: string;
  description: string;
  missionType: MissionType;
  difficulty: MissionDifficulty;
  rarity?: string;
  priority?: number;
  issuingFactionId?: string;
  targetFactionId?: string;
  galaxyId?: string;
  sectorId?: string;
  starSystemId?: string;
  planetId?: string;
  colonyId?: string;
  marketId?: string;
  tradeRouteId?: string;
  prerequisiteResearchIds?: string[];
  requiredDiscoveryState?: string;
  expiresAt?: string;
  repeatable?: boolean;
  tags?: string[];
  generatedAt: string;
}): MissionRecord {
  const id = `mission-${slug(input.seedId)}`;
  return {
    id,
    seedId: input.seedId,
    title: input.title,
    description: input.description,
    missionType: input.missionType,
    status: "available",
    difficulty: input.difficulty,
    rarity: input.rarity ?? "Common",
    priority: input.priority ?? (hashText(input.seedId) % 100),
    issuingFactionId: input.issuingFactionId,
    targetFactionId: input.targetFactionId,
    galaxyId: input.galaxyId,
    sectorId: input.sectorId,
    starSystemId: input.starSystemId,
    planetId: input.planetId,
    colonyId: input.colonyId,
    marketId: input.marketId,
    tradeRouteId: input.tradeRouteId,
    objectiveIds: [],
    rewardIds: [],
    prerequisiteResearchIds: input.prerequisiteResearchIds ?? [],
    requiredDiscoveryState: input.requiredDiscoveryState,
    generatedAt: input.generatedAt,
    expiresAt: input.expiresAt,
    repeatable: input.repeatable ?? false,
    generatedName: input.title,
    displayName: input.title,
    tags: input.tags ?? [input.missionType],
    rewardsClaimed: false,
    tracked: false,
    history: [history(id, "generated", "Mission Generated", input.description, input.generatedAt)]
  };
}

function objective(missionId: string, objectiveType: MissionObjectiveType, targetId: string, targetType: string, description: string, targetCount = 1, locationId?: string, requiredState?: string): MissionObjective {
  return {
    id: `objective-${slug(`${missionId}-${objectiveType}-${targetId}`)}`,
    missionId,
    objectiveType,
    targetId,
    targetType,
    targetCount,
    currentCount: 0,
    requiredState,
    locationId,
    optional: false,
    completed: false,
    description
  };
}

function reward(missionId: string, rewardType: MissionRewardType, amount: number, description: string, extra: Partial<MissionReward> = {}): MissionReward {
  return {
    id: `reward-${slug(`${missionId}-${rewardType}-${extra.resourceId ?? extra.researchId ?? extra.factionId ?? amount}`)}`,
    missionId,
    rewardType,
    amount,
    description,
    ...extra
  };
}

function attach(mission: MissionRecord, objectives: MissionObjective[], rewards: MissionReward[]) {
  return {
    mission: {
      ...mission,
      objectiveIds: objectives.map((row) => row.id),
      rewardIds: rewards.map((row) => row.id)
    },
    objectives,
    rewards
  };
}

function defaultStateInput(): Required<Pick<MissionGenerationInput, "starSystems" | "celestialBodies" | "factions" | "colonies" | "markets" | "tradeRoutes" | "research">> {
  const starSystems = generatedStarSystemRows(8);
  const celestialBodies = generatedCelestialBodyRows(1);
  const factions = generateFallbackFactions();
  const colonies = generateFallbackColonies();
  const economy = buildEconomyState(colonies, factions, [], "derived");
  return {
    starSystems,
    celestialBodies,
    factions,
    colonies,
    markets: economy.markets,
    tradeRoutes: economy.tradeRoutes,
    research: handoffData.research
  };
}

export function generateMissionBundle(input: MissionGenerationInput = {}): MissionBundle {
  const defaults = defaultStateInput();
  const missionSeed = input.missionSeed ?? "project-genesis-missions-v1";
  const generatedAt = input.generatedAt ?? "derived";
  const starSystems = input.starSystems?.length ? input.starSystems : defaults.starSystems;
  const celestialBodies = input.celestialBodies?.length ? input.celestialBodies : defaults.celestialBodies;
  const factions = input.factions?.length ? input.factions : defaults.factions;
  const colonies = input.colonies?.length ? input.colonies : defaults.colonies;
  const markets = input.markets?.length ? input.markets : defaults.markets;
  const tradeRoutes = input.tradeRoutes?.length ? input.tradeRoutes : defaults.tradeRoutes;
  const research = input.research?.length ? input.research : defaults.research;
  const solSystem = starSystems.find((system) => system.id === "system-sol") ?? starSystems[0];
  const solBodies = celestialBodies.filter((body) => body.system_id === solSystem?.id && body.celestial_body_type === "Planet");
  const mars = solBodies.find((body) => body.id === "body-mars") ?? solBodies.find((body) => body.colonizable && !body.is_starting_body);
  const faction = factions[0];
  const colony = colonies[0];
  const colonyMarket = colony ? markets.find((market) => market.colonyId === colony.id) ?? markets[0] : markets[0];
  const tradeRoute = tradeRoutes[0];
  const researchTarget = research.find((row) => row.id === "research-trade" || /trade|research|survey|agriculture/i.test(row.name)) ?? research[0];
  const colonizationResearch = research.find((row) => /planetary colonization|colonization/i.test(row.name));
  const tradeResearch = research.find((row) => /^trade$|trade routes|trade networks/i.test(row.name));

  const rows: Array<{ mission: MissionRecord; objectives: MissionObjective[]; rewards: MissionReward[] }> = [];

  if (solSystem) {
    const mission = missionBase({
      seedId: `${missionSeed}:scan-sol-planets`,
      title: "Scan Three Planets in Sol",
      description: "Resolve planetary survey data for three Sol planets to expand the Curiosity Library and unlock deeper local-space planning.",
      missionType: "Exploration",
      difficulty: "easy",
      rarity: "Common",
      galaxyId: "galaxy-milky-way",
      sectorId: solSystem.sector_id ?? "sector-local-bubble",
      starSystemId: solSystem.id,
      requiredDiscoveryState: "detected",
      tags: ["Exploration", "Sol", "Scanning"],
      generatedAt
    });
    rows.push(attach(mission, [objective(mission.id, "scan_planet", solSystem.id, "star_system", "Scan any three planets in the Sol star system.", 3, solSystem.id, "scanned")], [
      reward(mission.id, "discovery_points", 350, "Award 350 discovery points.")
    ]));
  }

  if (mars && !colonies.some((row) => row.planetId === mars.id)) {
    const mission = missionBase({
      seedId: `${missionSeed}:establish-mars-colony`,
      title: `Establish a Colony on ${mars.name}`,
      description: `${mars.name} is an eligible colonization target. Found a colony and connect it to the Studio ownership layer.`,
      missionType: "Colony",
      difficulty: "moderate",
      rarity: "Uncommon",
      galaxyId: "galaxy-milky-way",
      sectorId: "sector-local-bubble",
      starSystemId: mars.system_id,
      planetId: mars.id,
      prerequisiteResearchIds: colonizationResearch ? [colonizationResearch.id] : [],
      requiredDiscoveryState: "scanned",
      tags: ["Colony", "Sol", mars.name],
      generatedAt
    });
    rows.push(attach(mission, [objective(mission.id, "establish_colony", mars.id, "planet", `Establish a colony on ${mars.name}.`, 1, mars.system_id, "colonized")], [
      reward(mission.id, "credits", 1200, "Award 1,200 credits for founding logistics."),
      reward(mission.id, "colony_bonus", 1, "Apply a starter colony development bonus.")
    ]));
  }

  if (colonyMarket && tradeRoute) {
    const resourceId = tradeRoute.resourceIds.find((id) => ResourceService.getById(id)) ?? "RES-0190";
    const mission = missionBase({
      seedId: `${missionSeed}:deliver-market-resource`,
      title: `Deliver ${ResourceService.nameForId(resourceId)}`,
      description: `Move ${ResourceService.nameForId(resourceId)} along ${tradeRoute.name} to prove the new trade economy loop.`,
      missionType: "Trade",
      difficulty: "moderate",
      rarity: "Uncommon",
      galaxyId: colonyMarket.galaxyId,
      sectorId: colonyMarket.sectorId,
      starSystemId: colonyMarket.starSystemId,
      colonyId: colonyMarket.colonyId,
      marketId: colonyMarket.id,
      tradeRouteId: tradeRoute.id,
      prerequisiteResearchIds: tradeResearch ? [tradeResearch.id] : [],
      tags: ["Trade", "Delivery", ResourceService.nameForId(resourceId)],
      generatedAt
    });
    rows.push(attach(mission, [objective(mission.id, "deliver_resource", resourceId, "resource", `Deliver ${ResourceService.nameForId(resourceId)} through ${tradeRoute.name}.`, 1, tradeRoute.id)], [
      reward(mission.id, "credits", Math.max(500, tradeRoute.profitability), "Award credits based on route profitability."),
      reward(mission.id, "trade_access", 1, "Unlock a trade access note for this route.")
    ]));
  }

  if (researchTarget) {
    const mission = missionBase({
      seedId: `${missionSeed}:complete-research-${researchTarget.id}`,
      title: `Complete ${researchTarget.name}`,
      description: `Complete ${researchTarget.name} to progress mission, market, and exploration capabilities.`,
      missionType: "Research",
      difficulty: "easy",
      rarity: "Common",
      prerequisiteResearchIds: researchTarget.prerequisite_id ? [researchTarget.prerequisite_id] : [],
      tags: ["Research", researchTarget.era],
      generatedAt
    });
    rows.push(attach(mission, [objective(mission.id, "complete_research", researchTarget.id, "research", `Complete research: ${researchTarget.name}.`, 1)], [
      reward(mission.id, "research_points", Math.max(100, researchTarget.cost_experimental), "Award research momentum."),
      reward(mission.id, "research_unlock", 1, `Unlock reference: ${researchTarget.name}.`, { researchId: researchTarget.id })
    ]));
  }

  if (faction) {
    const mission = missionBase({
      seedId: `${missionSeed}:survey-faction-space-${faction.id}`,
      title: `Survey ${faction.name} Space`,
      description: `Survey the faction-controlled system associated with ${faction.name} and document their strategic footprint.`,
      missionType: "Faction",
      difficulty: faction.type === "Pirate Clan" ? "hard" : "moderate",
      rarity: faction.type === "Ancient Remnant" || faction.type === "Alien Civilization" ? "Rare" : "Common",
      issuingFactionId: faction.id,
      targetFactionId: faction.id,
      galaxyId: faction.homeGalaxyId,
      sectorId: faction.homeSectorId,
      starSystemId: faction.homeStarSystemId,
      planetId: faction.homePlanetId,
      requiredDiscoveryState: "detected",
      tags: ["Faction", faction.type, faction.disposition],
      generatedAt
    });
    rows.push(attach(mission, [
      objective(mission.id, "discover_faction", faction.id, "faction", `Confirm contact with ${faction.name}.`, 1, faction.homeStarSystemId),
      objective(mission.id, "scan_star_system", faction.homeStarSystemId, "star_system", `Scan ${faction.homeStarSystemId}.`, 1, faction.homeStarSystemId, "scanned")
    ], [
      reward(mission.id, "faction_reputation", 15, `Improve standing with ${faction.name}.`, { factionId: faction.id }),
      reward(mission.id, "discovery_points", 250, "Award faction survey discovery points.")
    ]));
  }

  const missions = rows.map((row) => row.mission).filter((mission, index, values) => values.findIndex((candidate) => candidate.id === mission.id) === index);
  const missionIds = new Set(missions.map((mission) => mission.id));
  return {
    missions,
    objectives: rows.flatMap((row) => row.objectives).filter((row) => missionIds.has(row.missionId)),
    rewards: rows.flatMap((row) => row.rewards).filter((row) => missionIds.has(row.missionId)),
    trackedMissionIds: [],
    generationMetadata: missionGenerationMetadata
  };
}

function readStoredBundle(): MissionBundle | null {
  if (!canUseStorage()) return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MISSIONS_STORAGE_KEY) ?? "null");
    if (!parsed || !Array.isArray(parsed.missions) || !Array.isArray(parsed.objectives) || !Array.isArray(parsed.rewards)) return null;
    return parsed as MissionBundle;
  } catch {
    return null;
  }
}

function writeBundle(bundle: MissionBundle) {
  if (!canUseStorage()) return bundle;
  window.localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(bundle));
  window.dispatchEvent(new CustomEvent(MISSIONS_UPDATED_EVENT));
  return bundle;
}

export function readMissionBundle() {
  return readStoredBundle() ?? generateMissionBundle({ generatedAt: "derived" });
}

export function resetGeneratedMissions() {
  return writeBundle(generateMissionBundle({ generatedAt: nowIso() }));
}

function updateMissionBundle(updater: (bundle: MissionBundle) => MissionBundle) {
  const next = updater(readMissionBundle());
  return writeBundle(next);
}

function syncMissionJournalAndTimeline(mission: MissionRecord, eventType: "mission_accepted" | "mission_completed" | "mission_failed" | "mission_abandoned") {
  upsertDiscoveryJournalEntry({
    objectId: mission.id,
    objectType: "mission",
    objectName: mission.displayName ?? mission.title,
    generatedName: mission.generatedName,
    displayName: mission.displayName,
    discoveryState: mission.status,
    discoveredAt: mission.generatedAt,
    discoveredBy: "Studio Explorer",
    discoveryPoints: mission.priority,
    galaxyId: mission.galaxyId,
    sectorId: mission.sectorId,
    starSystemId: mission.starSystemId,
    rarity: mission.rarity,
    tags: mission.tags,
    notes: mission.description
  });
  appendTimelineEvent({
    eventType,
    title: `${mission.displayName ?? mission.title} ${eventType === "mission_completed" ? "Completed" : eventType === "mission_accepted" ? "Accepted" : "Updated"}`,
    description: mission.description,
    galaxyId: mission.galaxyId,
    sectorId: mission.sectorId,
    starSystemId: mission.starSystemId,
    planetId: mission.planetId,
    relatedObjectId: mission.id,
    relatedObjectType: "mission",
    importance: mission.rarity === "Rare" || mission.difficulty === "legendary" ? "high" : "medium"
  });
}

export function acceptMission(missionId: string) {
  const timestamp = nowIso();
  return updateMissionBundle((bundle) => ({
    ...bundle,
    missions: bundle.missions.map((mission) => {
      if (mission.id !== missionId || mission.status !== "available") return mission;
      const next = { ...mission, status: "accepted" as MissionStatus, acceptedAt: timestamp, history: [history(mission.id, "accepted", "Mission Accepted", "Mission accepted for tracking.", timestamp), ...mission.history] };
      syncMissionJournalAndTimeline(next, "mission_accepted");
      return next;
    })
  }));
}

export function setMissionTracked(missionId: string, tracked: boolean) {
  const timestamp = nowIso();
  return updateMissionBundle((bundle) => {
    const trackedMissionIds = tracked ? [...new Set([missionId, ...bundle.trackedMissionIds])].slice(0, 3) : bundle.trackedMissionIds.filter((id) => id !== missionId);
    return {
      ...bundle,
      trackedMissionIds,
      missions: bundle.missions.map((mission) => (mission.id === missionId ? { ...mission, tracked, history: [history(mission.id, tracked ? "tracked" : "untracked", tracked ? "Mission Tracked" : "Mission Untracked", tracked ? "Mission added to tracker." : "Mission removed from tracker.", timestamp), ...mission.history] } : mission))
    };
  });
}

export function abandonMission(missionId: string) {
  const timestamp = nowIso();
  return updateMissionBundle((bundle) => ({
    ...bundle,
    trackedMissionIds: bundle.trackedMissionIds.filter((id) => id !== missionId),
    missions: bundle.missions.map((mission) => {
      if (mission.id !== missionId || mission.status === "completed") return mission;
      const next = { ...mission, status: "abandoned" as MissionStatus, tracked: false, history: [history(mission.id, "abandoned", "Mission Abandoned", "Mission abandoned without deleting history.", timestamp), ...mission.history] };
      syncMissionJournalAndTimeline(next, "mission_abandoned");
      return next;
    })
  }));
}

function maybeCompleteMission(bundle: MissionBundle, mission: MissionRecord, timestamp: string) {
  const required = bundle.objectives.filter((objectiveRow) => objectiveRow.missionId === mission.id && !objectiveRow.optional);
  if (!required.length || required.some((objectiveRow) => !objectiveRow.completed)) return mission;
  if (mission.status === "completed") return mission;
  const next = {
    ...mission,
    status: "completed" as MissionStatus,
    completedAt: timestamp,
    rewardsClaimed: true,
    tracked: false,
    history: [
      history(mission.id, "completed", "Mission Completed", "All required objectives were completed and rewards were granted once.", timestamp),
      history(mission.id, "rewards_claimed", "Rewards Claimed", "Mission rewards were claimed.", timestamp),
      ...mission.history
    ]
  };
  syncMissionJournalAndTimeline(next, "mission_completed");
  return next;
}

export function completeMissionForTest(missionId: string) {
  const timestamp = nowIso();
  return updateMissionBundle((bundle) => {
    const objectives = bundle.objectives.map((objectiveRow) => (objectiveRow.missionId === missionId ? { ...objectiveRow, currentCount: objectiveRow.targetCount, completed: true } : objectiveRow));
    const nextBundle = { ...bundle, objectives };
    return {
      ...nextBundle,
      trackedMissionIds: nextBundle.trackedMissionIds.filter((id) => id !== missionId),
      missions: nextBundle.missions.map((mission) => (mission.id === missionId ? maybeCompleteMission(nextBundle, mission, timestamp) : mission))
    };
  });
}

export function recordMissionProgress(event: MissionProgressEvent) {
  const timestamp = nowIso();
  return updateMissionBundle((bundle) => {
    const activeMissionIds = new Set(bundle.missions.filter((mission) => ["accepted", "active", "available"].includes(mission.status)).map((mission) => mission.id));
    let changed = false;
    const changedMissionIds = new Set<string>();
    const objectives = bundle.objectives.map((objectiveRow) => {
      if (!activeMissionIds.has(objectiveRow.missionId) || objectiveRow.completed || objectiveRow.objectiveType !== event.objectiveType) return objectiveRow;
      const targetMatches = !event.targetId || objectiveRow.targetId === event.targetId || objectiveRow.locationId === event.targetId || objectiveRow.locationId === event.locationId;
      const typeMatches = !event.targetType || objectiveRow.targetType === event.targetType || objectiveRow.objectiveType === event.objectiveType;
      if (!targetMatches || !typeMatches) return objectiveRow;
      changed = true;
      changedMissionIds.add(objectiveRow.missionId);
      const currentCount = Math.min(objectiveRow.targetCount, objectiveRow.currentCount + (event.amount ?? 1));
      return { ...objectiveRow, currentCount, completed: currentCount >= objectiveRow.targetCount };
    });
    if (!changed) return bundle;
    const nextBundle = { ...bundle, objectives };
    const missions = nextBundle.missions.map((mission) => {
      if (!activeMissionIds.has(mission.id)) return mission;
      const progressed = changedMissionIds.has(mission.id);
      if (!progressed) return mission;
      const activeMission = mission.status === "available" ? { ...mission, status: "active" as MissionStatus } : mission;
      const withHistory = { ...activeMission, history: [history(mission.id, "objective_progress", "Objective Progress", `Progress recorded for ${event.objectiveType}.`, timestamp), ...activeMission.history] };
      return maybeCompleteMission(nextBundle, withHistory, timestamp);
    });
    return {
      ...nextBundle,
      missions,
      trackedMissionIds: nextBundle.trackedMissionIds.filter((id) => missions.find((mission) => mission.id === id)?.status !== "completed")
    };
  });
}

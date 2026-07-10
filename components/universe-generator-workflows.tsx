"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, CirclePlus, Orbit, Pencil, Plus, Search, Sparkles, Star, Trash2, Waypoints, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handoffData } from "@/data/handoff";
import { createColonyRecord, upsertDiscoveredColony, type ColonyRecord } from "@/lib/colonies/procedural";
import { appendTimelineEvent, renameDiscoveryObject, upsertDiscoveryJournalEntry, type DiscoveryObjectType, type TimelineImportance, type TimelineEventType } from "@/lib/explorer/discovery-log";
import { generateFaction, upsertDiscoveredFaction, type FactionRecord } from "@/lib/factions/procedural";
import { DEFAULT_UNIVERSE_SEED } from "@/lib/universe/fallback-data";
import {
  generateCelestialBodies,
  generateGalaxy,
  generateSector,
  generateSectors,
  generateStarSystem,
  generateStarSystems,
  generateUniverse,
  type CelestialBodyNode,
  type GalaxyNode,
  type SectorNode,
  type StarSystemNode
} from "@/lib/universe/generator";
import { cn } from "@/lib/utils";
import { fixedSolGeneratedPlanets } from "@/lib/planets/fixed-sol-planets";
import { normalizeResourceNames, resourceNames } from "@/lib/resources/service";
import type { GeneratedPlanet } from "@/types/schema";

type DiscoveryState = "undiscovered" | "detected" | "scanned" | "charted" | "explored" | "colonized";
type FeatureId = "sector_scan" | "system_scan" | "planet_scan" | "claim_planet" | "colony_claim" | "colonization" | "resource_scan" | "intergalactic_travel";

type DiscoveryFields = {
  discoveryState: DiscoveryState;
  discoveryPoints: number;
  discoveredAt: string | null;
  discoveredBy: string;
  scanProgress: number;
  isClaimable: boolean;
  isColonizable: boolean;
  generatedName?: string;
  displayName?: string;
  factionIds?: string[];
  factionPresence?: FactionRecord[];
  faction?: FactionRecord;
  colonyId?: string;
  colony?: ColonyRecord;
  colonizationStatus?: string;
};

type PlayerProgressionState = {
  completedResearchIds: string[];
  unlockedFeatureIds: FeatureId[];
  discoveryPoints: number;
  totalScannedSectors: number;
  totalScannedSystems: number;
  totalScannedPlanets: number;
  totalClaimedPlanets: number;
  totalColonizedPlanets: number;
};

type ProgressionApi = PlayerProgressionState & {
  canUseFeature: (featureId: FeatureId) => boolean;
  canScanSector: () => boolean;
  canScanSystem: () => boolean;
  canScanPlanet: () => boolean;
  canClaimPlanet: () => boolean;
  canColonizePlanet: () => boolean;
  canTravelIntergalactic: () => boolean;
  requirementText: (featureId: FeatureId) => string;
  completeResearchForFeature: (featureId: FeatureId) => void;
  resetProgression: () => void;
  awardDiscovery: (kind: "sector" | "system" | "planet", points: number) => void;
  recordClaim: () => void;
  recordColonization: () => void;
};

type AssignmentContext = {
  galaxy: GalaxyNode;
  sector: SectorNode;
  system: StarSystemNode;
};

type PlanetAssignmentData = {
  assignedPlanetId?: string;
  assignedSystemId?: string;
  assignedSystemName?: string;
  assignedSectorId?: string;
  assignedSectorName?: string;
  assignedGalaxyId?: string;
  assignedGalaxyName?: string;
  orbitIndex?: number;
  orbitalRole?: "Planet";
  parentStarClass?: string;
  parentStarSeed?: string;
  image_url?: string | null;
  seed_id?: string;
  story?: string;
  discovery_points?: number;
  source_planet?: GeneratedPlanet;
};

type BodyCardState = CelestialBodyNode & PlanetAssignmentData & DiscoveryFields;

type PlanetAssignmentFields = Partial<DiscoveryFields> & {
  galaxyId?: string;
  galaxyName?: string;
  sectorId?: string;
  sectorName?: string;
  starSystemId?: string;
  starSystemName?: string;
  orbitIndex?: number;
  orbitalRole?: "Planet";
  parentStarClass?: string;
  parentStarSeed?: string;
  faction?: FactionRecord;
  colonyId?: string;
  colony?: ColonyRecord;
  colonizationStatus?: string;
};

type AssignedPlanet = GeneratedPlanet & PlanetAssignmentFields;

type LinkedStarSystemNode = StarSystemNode & DiscoveryFields & {
  galaxyId?: string;
  galaxyName?: string;
  sectorId?: string;
  sectorName?: string;
  planetIds?: string[];
  planets?: AssignedPlanet[];
};

type StarSystemCardState = {
  system: LinkedStarSystemNode;
  bodies: BodyCardState[];
  planets: AssignedPlanet[];
  factions: FactionRecord[];
};

type StarSystemSeedModel = {
  id: string;
  seedId: string;
  name: string;
  type: string;
  rarity: string;
  discoveryPoints: number;
  starClass: string;
  starColor: string;
  systemType: string;
  stability: string;
  gravityProfile: string;
  radiationLevel: string;
  habitableZone: string;
  planetCount: number;
  habitableWorlds: number;
  gasGiants: number;
  moonCount: number;
  asteroidBelts: number;
  resourceValue: string;
  dangerLevel: number;
  colonizationPotential: string;
  explorationRisk: string;
  anomalyDensity: string;
  resources: string[];
  traits: string[];
  hazards: string[];
  anomalies: string[];
  modifiers: string[];
  collectibles: string[];
  events: string[];
  spaceConditions: string[];
  colonization: Record<string, string | number | boolean>;
  science: Record<string, string | number | boolean>;
  economy: Record<string, string | number | boolean>;
  visualTheme: Record<string, string | number | boolean>;
  description: string;
};

type SectorCardState = {
  sector: SectorNode & DiscoveryFields;
  systems: StarSystemCardState[];
  factions: FactionRecord[];
};

type SectorSeedModel = {
  id: string;
  seedId: string;
  name: string;
  type: string;
  rarity: string;
  discoveryPoints: number;
  sectorClass: string;
  systemDensity: string;
  coordinates: string;
  difficulty: number;
  systemCapacity: number;
  generatedSystems: number;
  systemCount: number;
  resourceBias: string;
  dangerLevel: string;
  discoveryLevel: string;
  colonizationPotential: string;
  tradeValue: string;
  patrolRisk: string;
  anomalyDensity: string;
  resources: string[];
  traits: string[];
  hazards: string[];
  anomalies: string[];
  modifiers: string[];
  events: string[];
  visualTheme: Record<string, string | number | boolean>;
  description: string;
};

type GalaxyCardState = {
  galaxy: GalaxyNode & DiscoveryFields;
  sectors: SectorCardState[];
};

type GalaxyDNA = NonNullable<GalaxyNode["galaxy_dna"]>;

type GalaxySeedModel = {
  id: string;
  seedId: string;
  name: string;
  type: string;
  rarity: string;
  discoveryPoints: number;
  galaxyClass: string;
  galaxyScale: string;
  sectorCount: number;
  generatedSectors: number;
  estimatedSystems: number;
  estimatedBodies: number;
  discoveryPercent: number;
  startingSector: string;
  resourceBias: string;
  civilizationPresence: string;
  explorationRisk: string;
  anomalyDensity: string;
  isUnlimited: boolean;
  theoreticalSystemCapacity: string;
  generatedSystemCount: number;
  discoveredSystemCount: number;
  discoveredSectorCount: number;
  discoveryPercentDisplay: string;
  generatedPlanetCount: number;
  discoveredPlanetCount: number;
  isUnlocked: boolean;
  unlockRequirement: string;
  galaxyDNA: GalaxyDNA;
  resources: string[];
  traits: string[];
  hazards: string[];
  anomalies: string[];
  modifiers: string[];
  events: string[];
  visualTheme: Record<string, string | number | boolean>;
  description: string;
};

const galaxyTypes = ["Any", "Spiral Galaxy", "Elliptical Galaxy", "Ring Galaxy", "Barred Spiral", "Irregular Galaxy", "Ancient Galaxy", "Nebula Cluster", "Void Galaxy", "Artificial Galaxy", "Harmony Galaxy"];
const galaxySizes = ["Any", "Small", "Medium", "Large"];
const sectorTypes = ["Any", "Core Worlds", "Civilized Space", "Outer Rim", "Ancient Expanse", "Nebula", "Frontier", "Deep Space", "Void Region", "Harmony Region", "Uncharted Space"];
const rarityOptions = ["Any", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Relic", "Genesis"];
const starCountRules = ["Generated", "Single Star", "Binary", "Trinary"];

const featureGateCopy: Record<FeatureId, { label: string; requirement: string; researchNames: string[]; unlockTerms: string[] }> = {
  sector_scan: {
    label: "Sector Scanning",
    requirement: "Requires Sector Scanning research",
    researchNames: ["Astronomy", "Precision Optics"],
    unlockTerms: ["sky mapping", "early detection", "Space research chain"]
  },
  system_scan: {
    label: "Star System Scanning",
    requirement: "Requires Star System Scanning research",
    researchNames: ["Planetary Exploration", "Long-Range Sensors", "Interstellar Navigation"],
    unlockTerms: ["home star system map", "nearby star system discovery", "deep scans", "interstellar surveys"]
  },
  planet_scan: {
    label: "Planet Scanning",
    requirement: "Requires Planet Scanning research",
    researchNames: ["Satellites", "Planetary Exploration"],
    unlockTerms: ["planet scanning", "planet cards", "scan data"]
  },
  claim_planet: {
    label: "Planet Claim",
    requirement: "Requires Planet Claim research",
    researchNames: ["Planetary Exploration", "Colony Ships"],
    unlockTerms: ["planet cards", "new colony deployment", "colonization workflow"]
  },
  colony_claim: {
    label: "Colony Claim",
    requirement: "Requires Colony Claim research",
    researchNames: ["Colony Ships"],
    unlockTerms: ["colony ships", "new colony deployment"]
  },
  colonization: {
    label: "Colonization",
    requirement: "Requires Colonization research",
    researchNames: ["Planetary Colonization", "Interstellar Colonization"],
    unlockTerms: ["colonization of landable planets", "colonization workflow", "nearby star colonization"]
  },
  resource_scan: {
    label: "Resource Scan",
    requirement: "Requires Resource Scanning research",
    researchNames: ["Asteroid Mining", "Gas Giant Harvesting", "Autonomous Exploration", "Long-Range Sensors"],
    unlockTerms: ["asteroid resource nodes", "gas refineries", "automated surveys", "deep scans"]
  },
  intergalactic_travel: {
    label: "Intergalactic Travel",
    requirement: "Requires Intergalactic Travel research",
    researchNames: ["Artificial Wormholes", "Intergalactic Navigation"],
    unlockTerms: ["intergalactic gates", "galaxy-to-galaxy travel", "new galaxies", "intergalactic map"]
  }
};

const defaultGalaxyDNA: GalaxyDNA = {
  age: "Mature",
  metallicity: "Balanced",
  civilizationDensity: "Medium",
  anomalyDensity: "Low",
  resourceRichness: "Balanced",
  hostility: "Moderate",
  terraformDifficulty: "Standard",
  technologyLevel: "Mixed",
  dominantStarTypes: ["Yellow Main Sequence", "Red Dwarf"],
  rarePhenomena: ["Ancient Ruins", "Rogue Planets"],
  earthlikeWorldChance: "Medium",
  ruinChance: "Low",
  blackHoleChance: "Very Low"
};

const milkyWayGalaxyProfile: {
  slug: string;
  name: string;
  galaxyClass: string;
  galaxyScale: string;
  unlocked: boolean;
  discoveryState: string;
  unlockRequirement: string;
  dna: GalaxyDNA;
} = {
  slug: "milky-way",
  name: "Milky Way",
  galaxyClass: "Spiral Galaxy",
  galaxyScale: "Mythic",
  unlocked: true,
  discoveryState: "Starting Galaxy",
  unlockRequirement: "Unlocked by default as the Project Genesis origin galaxy.",
  dna: defaultGalaxyDNA
};

const galaxyDnaPools = {
  age: ["Young", "Mature", "Ancient", "Primeval"],
  metallicity: ["Low", "Balanced", "Rich", "Exotic"],
  civilizationDensity: ["Low", "Medium", "High", "Lost", "Unknown"],
  anomalyDensity: ["Low", "Medium", "High", "Extreme"],
  resourceRichness: ["Scarce", "Balanced", "High", "Exotic"],
  hostility: ["Low", "Moderate", "High", "Variable", "Extreme"],
  terraformDifficulty: ["Standard", "Hard", "Extreme", "Unknown"],
  technologyLevel: ["Emerging", "Mixed", "Ancient", "Unknown"],
  dominantStarTypes: ["Yellow Main Sequence", "Red Dwarf", "Blue Giant", "Binary Star", "White Dwarf", "Red Giant", "Neutron Star"],
  rarePhenomena: ["Ancient Ruins", "Rogue Planets", "Megastructures", "Dark Matter Fields", "Nebula Storms", "Energy Anomalies", "Deep-Space Beacons", "Reality Fractures"],
  chance: ["Very Low", "Low", "Medium", "High"]
};

const rarityClasses: Record<string, string> = {
  Common: "border-white/40 text-white",
  Uncommon: "border-[#2ECC71]/70 text-[#2ECC71]",
  Rare: "border-[#3498DB]/70 text-[#3498DB]",
  Epic: "border-[#9B59B6]/80 text-[#9B59B6]",
  Legendary: "border-[#F39C12]/80 text-[#F39C12]",
  Mythic: "border-[#E74C3C]/80 text-[#E74C3C]",
  Relic: "border-[#FF3CAC]/80 text-[#FF3CAC]",
  Genesis: "border-[#FFD700]/90 text-[#FFD700]"
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function featureResearchIds(featureId: FeatureId) {
  const gate = featureGateCopy[featureId];
  const names = gate.researchNames.map((name) => name.toLowerCase());
  const terms = gate.unlockTerms.map((term) => term.toLowerCase());
  const directResearch = handoffData.research
    .filter((row) => {
      const haystack = [row.id, row.name, row.unlock_summary, row.gameplay_effect, row.primary_unlock_type, row.design_purpose, ...row.unlocks].join(" ").toLowerCase();
      return names.some((name) => row.name.toLowerCase() === name) || terms.some((term) => haystack.includes(term));
    })
    .map((row) => row.id);
  const unlockSources = handoffData.unlock_matrix
    .filter((row) => {
      const haystack = [row.unlock_id, row.unlock_name, row.unlock_type, row.notes, row.source_name].join(" ").toLowerCase();
      return terms.some((term) => haystack.includes(term)) || haystack.includes(featureId.replace(/_/g, " "));
    })
    .map((row) => row.source_id)
    .filter(Boolean);

  return [...new Set([...directResearch, ...unlockSources])];
}

const featureResearchIdMap = Object.fromEntries((Object.keys(featureGateCopy) as FeatureId[]).map((featureId) => [featureId, featureResearchIds(featureId)])) as Record<FeatureId, string[]>;

const defaultCompletedResearchIds = [
  ...featureResearchIdMap.sector_scan,
  ...featureResearchIdMap.system_scan,
  ...featureResearchIdMap.planet_scan
];

const defaultProgressionState: PlayerProgressionState = {
  completedResearchIds: [...new Set(defaultCompletedResearchIds)],
  unlockedFeatureIds: [],
  discoveryPoints: 0,
  totalScannedSectors: 0,
  totalScannedSystems: 0,
  totalScannedPlanets: 0,
  totalClaimedPlanets: 0,
  totalColonizedPlanets: 0
};

function hasFeatureResearch(featureId: FeatureId, completedResearchIds: string[]) {
  const researchIds = featureResearchIdMap[featureId] ?? [];
  return researchIds.some((id) => completedResearchIds.includes(id));
}

function usePlayerProgression(): ProgressionApi {
  const [state, setState] = useState<PlayerProgressionState>(defaultProgressionState);

  function canUseFeature(featureId: FeatureId) {
    if (featureId === "intergalactic_travel" && state.totalScannedSystems < 12) return false;
    if (state.unlockedFeatureIds.includes(featureId)) return true;
    if (hasFeatureResearch(featureId, state.completedResearchIds)) return true;
    if (featureId === "claim_planet" && hasFeatureResearch("colony_claim", state.completedResearchIds)) return true;
    return false;
  }

  function completeResearchForFeature(featureId: FeatureId) {
    logTimeline({
      eventType: featureId === "intergalactic_travel" ? "intergalactic_travel_unlocked" : "research_completed",
      title: `${featureGateCopy[featureId].label} Research Completed`,
      description: `${featureGateCopy[featureId].label} is now available to the exploration loop.`,
      relatedObjectId: featureId,
      relatedObjectType: "civilization",
      importance: featureId === "intergalactic_travel" ? "legendary" : "medium"
    });
    setState((current) => ({
      ...current,
      completedResearchIds: [...new Set([...current.completedResearchIds, ...(featureResearchIdMap[featureId] ?? [])])],
      unlockedFeatureIds: current.unlockedFeatureIds.includes(featureId) ? current.unlockedFeatureIds : [...current.unlockedFeatureIds, featureId]
    }));
  }

  function awardDiscovery(kind: "sector" | "system" | "planet", points: number) {
    setState((current) => ({
      ...current,
      discoveryPoints: current.discoveryPoints + points,
      totalScannedSectors: current.totalScannedSectors + (kind === "sector" ? 1 : 0),
      totalScannedSystems: current.totalScannedSystems + (kind === "system" ? 1 : 0),
      totalScannedPlanets: current.totalScannedPlanets + (kind === "planet" ? 1 : 0)
    }));
  }

  return {
    ...state,
    canUseFeature,
    canScanSector: () => canUseFeature("sector_scan"),
    canScanSystem: () => canUseFeature("system_scan"),
    canScanPlanet: () => canUseFeature("planet_scan"),
    canClaimPlanet: () => canUseFeature("claim_planet") || canUseFeature("colony_claim"),
    canColonizePlanet: () => canUseFeature("colonization"),
    canTravelIntergalactic: () => canUseFeature("intergalactic_travel") && state.totalScannedSystems >= 12,
    requirementText: (featureId) => {
      if (featureId === "intergalactic_travel" && state.totalScannedSystems < 12) return `${featureGateCopy[featureId].requirement}; scan 12 star systems first`;
      return featureGateCopy[featureId].requirement;
    },
    completeResearchForFeature,
    resetProgression: () => setState(defaultProgressionState),
    awardDiscovery,
    recordClaim: () => setState((current) => ({ ...current, totalClaimedPlanets: current.totalClaimedPlanets + 1 })),
    recordColonization: () => setState((current) => ({ ...current, totalColonizedPlanets: current.totalColonizedPlanets + 1 }))
  };
}

const discoveryOrder: DiscoveryState[] = ["undiscovered", "detected", "scanned", "charted", "explored", "colonized"];

function normalizeDiscoveryState(value: unknown, fallback: DiscoveryState = "undiscovered"): DiscoveryState {
  const normalized = String(value ?? fallback).toLowerCase().replace(/\s+/g, "-");
  if (normalized === "undetected") return "undiscovered";
  if (normalized === "discovered" || normalized === "surveyed") return "scanned";
  if (normalized === "starting-galaxy" || normalized === "unlocked") return "charted";
  return discoveryOrder.includes(normalized as DiscoveryState) ? (normalized as DiscoveryState) : fallback;
}

function discoveryAtLeast(value: DiscoveryState, minimum: DiscoveryState) {
  return discoveryOrder.indexOf(value) >= discoveryOrder.indexOf(minimum);
}

function scanProgressFor(state: DiscoveryState) {
  return {
    undiscovered: 0,
    detected: 25,
    scanned: 60,
    charted: 75,
    explored: 100,
    colonized: 100
  }[state];
}

function discoveryLabel(state: DiscoveryState) {
  return state.charAt(0).toUpperCase() + state.slice(1);
}

function discoveryBadgeClass(state: DiscoveryState) {
  if (state === "colonized") return "border-emerald-300/55 text-emerald-100";
  if (state === "explored") return "border-cyan-300/55 text-cyan-100";
  if (state === "charted") return "border-sky-300/55 text-sky-100";
  if (state === "scanned") return "border-amber-300/55 text-amber-100";
  if (state === "detected") return "border-slate-400/60 text-slate-200";
  return "border-slate-600/55 text-slate-400";
}

function withDiscovery<T extends Record<string, unknown>>(
  value: T,
  fallbackState: DiscoveryState,
  discoveryPoints: number,
  isColonizable = false
): T & DiscoveryFields {
  const state = normalizeDiscoveryState(value.discoveryState ?? value.discovery_state, fallbackState);
  const points = Number(value.discoveryPoints ?? value.discovery_points ?? value.discovery_value ?? discoveryPoints) || discoveryPoints;
  const generatedName = typeof value.generatedName === "string" ? value.generatedName : typeof value.generated_name === "string" ? value.generated_name : typeof value.name === "string" ? value.name : typeof value.sector_name === "string" ? value.sector_name : typeof value.system_name === "string" ? value.system_name : undefined;
  return {
    ...value,
    discoveryState: state,
    discoveryPoints: points,
    discoveredAt: typeof value.discoveredAt === "string" ? value.discoveredAt : typeof value.discovered_at === "string" ? value.discovered_at : state === "undiscovered" ? null : null,
    discoveredBy: typeof value.discoveredBy === "string" ? value.discoveredBy : "",
    scanProgress: Number(value.scanProgress ?? scanProgressFor(state)) || scanProgressFor(state),
    isClaimable: Boolean(value.isClaimable ?? discoveryAtLeast(state, "charted")),
    isColonizable: Boolean(value.isColonizable ?? isColonizable),
    generatedName,
    displayName: typeof value.displayName === "string" ? value.displayName : typeof value.display_name === "string" ? value.display_name : undefined
  };
}

function withDiscoveredAt<T extends DiscoveryFields>(value: T, state: DiscoveryState): T {
  return {
    ...value,
    discoveryState: state,
    scanProgress: scanProgressFor(state),
    discoveredAt: value.discoveredAt ?? new Date().toISOString(),
    discoveredBy: value.discoveredBy || "Studio Explorer",
    isClaimable: value.isClaimable || discoveryAtLeast(state, "charted")
  };
}

function maskName(value: string, state: DiscoveryState, fallback: string) {
  if (state === "undiscovered") return fallback;
  return value;
}

function namedValue(value: { displayName?: string; generatedName?: string }, generatedName: string) {
  return value.displayName || value.generatedName || generatedName;
}

function renamePrompt(currentName: string) {
  const next = window.prompt("Rename discovery", currentName);
  return next?.trim() || "";
}

function explorationSummary(sectors: SectorCardState[]) {
  const systems = sectors.flatMap((sector) => sector.systems);
  const bodies = systems.flatMap((system) => [...system.bodies, ...system.planets.map((planet) => planetToBodySnapshot(planet as AssignedPlanet))]);
  return {
    sectors: sectors.length,
    detectedSectors: sectors.filter((sector) => discoveryAtLeast(sector.sector.discoveryState, "detected")).length,
    scannedSectors: sectors.filter((sector) => discoveryAtLeast(sector.sector.discoveryState, "scanned")).length,
    systems: systems.length,
    scannedSystems: systems.filter((system) => discoveryAtLeast(system.system.discoveryState, "scanned")).length,
    bodies: bodies.length,
    scannedBodies: bodies.filter((body) => discoveryAtLeast(body.discoveryState, "scanned")).length,
    discoveryPoints: sectors.reduce(
      (total, sector) =>
        total +
        (discoveryAtLeast(sector.sector.discoveryState, "scanned") ? sector.sector.discoveryPoints : 0) +
        sector.systems.reduce(
          (systemTotal, system) =>
            systemTotal +
            (discoveryAtLeast(system.system.discoveryState, "scanned") ? system.system.discoveryPoints : 0) +
            system.bodies.reduce((bodyTotal, body) => bodyTotal + (discoveryAtLeast(body.discoveryState, "scanned") ? body.discoveryPoints : 0), 0) +
            system.planets.reduce((planetTotal, planet) => planetTotal + (discoveryAtLeast(normalizeDiscoveryState(planet.discoveryState), "scanned") ? (planet.discoveryPoints ?? planet.discovery_points ?? 0) : 0), 0),
          0
        ),
      0
    )
  };
}

function optionValue(value: string) {
  return value === "Any" || value === "Generated" ? null : value;
}

function applyGalaxyBias(galaxy: GalaxyNode, type: string, size: string): GalaxyNode {
  const nextSize = optionValue(size);

  return {
    ...galaxy,
    galaxy_type: optionValue(type) ?? galaxy.galaxy_type,
    galaxy_size: nextSize ?? galaxy.galaxy_size,
    sector_count: nextSize === "Small" ? 1000 : nextSize === "Medium" ? 5000 : nextSize === "Large" ? 20000 : galaxy.sector_count
  };
}

function galaxyProfileFor(galaxy: GalaxyNode) {
  return galaxy.name.toLowerCase() === milkyWayGalaxyProfile.name.toLowerCase() || galaxy.galaxy_seed.toLowerCase().includes(milkyWayGalaxyProfile.slug) ? milkyWayGalaxyProfile : null;
}

function galaxySeedSlug(galaxy: GalaxyNode) {
  const profile = galaxyProfileFor(galaxy);
  if (profile) return profile.slug;
  return `galaxy-${galaxy.generation_index ?? hashText(galaxy.galaxy_seed)}-${slug(galaxy.name || galaxy.galaxy_seed)}`;
}

function seededPick<T>(seed: string, key: string, values: T[]) {
  return values[hashText(`${seed}:${key}`) % values.length];
}

function seededPickMany<T>(seed: string, key: string, values: T[], count: number) {
  const selected: T[] = [];
  for (let index = 0; index < values.length && selected.length < count; index += 1) {
    const value = values[(hashText(`${seed}:${key}:${index}`) + index) % values.length];
    if (!selected.includes(value)) selected.push(value);
  }
  return selected;
}

function proceduralGalaxyDNA(galaxy: GalaxyNode): GalaxyDNA {
  const seed = galaxy.galaxy_seed;
  return {
    age: seededPick(seed, "age", galaxyDnaPools.age),
    metallicity: seededPick(seed, "metallicity", galaxyDnaPools.metallicity),
    civilizationDensity: seededPick(seed, "civilization-density", galaxyDnaPools.civilizationDensity),
    anomalyDensity: seededPick(seed, "anomaly-density", galaxyDnaPools.anomalyDensity),
    resourceRichness: seededPick(seed, "resource-richness", galaxyDnaPools.resourceRichness),
    hostility: seededPick(seed, "hostility", galaxyDnaPools.hostility),
    terraformDifficulty: seededPick(seed, "terraform-difficulty", galaxyDnaPools.terraformDifficulty),
    technologyLevel: seededPick(seed, "technology-level", galaxyDnaPools.technologyLevel),
    dominantStarTypes: seededPickMany(seed, "dominant-star-types", galaxyDnaPools.dominantStarTypes, 3),
    rarePhenomena: seededPickMany(seed, "rare-phenomena", galaxyDnaPools.rarePhenomena, 3),
    earthlikeWorldChance: seededPick(seed, "earthlike-world-chance", galaxyDnaPools.chance),
    ruinChance: seededPick(seed, "ruin-chance", galaxyDnaPools.chance),
    blackHoleChance: seededPick(seed, "black-hole-chance", galaxyDnaPools.chance)
  };
}

function withGalaxyExpansionProfile(galaxy: GalaxyNode, profile = galaxyProfileFor(galaxy)): GalaxyNode {
  if (!profile) {
    const generatedDna = galaxy.galaxy_dna ?? proceduralGalaxyDNA(galaxy);
    return {
      ...galaxy,
      is_unlocked: galaxy.is_unlocked ?? false,
      is_unlimited: true,
      discovery_state: galaxy.discovery_state ?? "Locked",
      discovery_percent_display: galaxy.discovery_percent_display ?? "0%",
      generated_sector_count: galaxy.generated_sector_count ?? 0,
      generated_system_count: galaxy.generated_system_count ?? 0,
      generated_planet_count: galaxy.generated_planet_count ?? 0,
      discovered_sector_count: galaxy.discovered_sector_count ?? 0,
      discovered_system_count: galaxy.discovered_system_count ?? 0,
      discovered_planet_count: galaxy.discovered_planet_count ?? 0,
      sector_ids: galaxy.sector_ids ?? [],
      galaxy_dna: generatedDna
    };
  }

  return {
    ...galaxy,
    id: profile.slug === "milky-way" ? galaxy.id : `galaxy-${profile.slug}`,
    galaxy_seed: `PROJECT-GENESIS:${profile.slug}`,
    name: profile.name,
    galaxy_type: profile.galaxyClass,
    galaxy_size: profile.galaxyScale,
    sector_count: 100000,
    is_fixed: profile.slug === "milky-way" ? galaxy.is_fixed : false,
    is_procedural: profile.slug !== "milky-way",
    is_unlocked: galaxy.is_unlocked ?? profile.unlocked,
    is_unlimited: true,
    discovery_state: galaxy.discovery_state ?? profile.discoveryState,
    discovery_percent_display: galaxy.discovery_percent_display ?? (profile.slug === "milky-way" ? "<0.0001%" : "0%"),
    generated_sector_count: galaxy.generated_sector_count ?? 0,
    generated_system_count: galaxy.generated_system_count ?? 0,
    generated_planet_count: galaxy.generated_planet_count ?? 0,
    discovered_sector_count: galaxy.discovered_sector_count ?? 0,
    discovered_system_count: galaxy.discovered_system_count ?? 0,
    discovered_planet_count: galaxy.discovered_planet_count ?? 0,
    sector_ids: galaxy.sector_ids ?? [],
    galaxy_dna: profile.dna
  };
}

function createExpansionGalaxy(universeSeed: string, profileIndex: number): GalaxyNode {
  const profile = profileIndex === 0 ? milkyWayGalaxyProfile : null;
  const base = generateGalaxy(universeSeed, profileIndex);
  return withGalaxyExpansionProfile(base, profile);
}

function applySectorBias(sector: SectorNode, sectorType: string, rarity: string): SectorNode {
  return {
    ...sector,
    sector_type: optionValue(sectorType) ?? sector.sector_type,
    sector_rarity: optionValue(rarity) ?? sector.sector_rarity
  };
}

function applySystemBias(system: StarSystemNode, rarity: string, starRule: string): StarSystemNode {
  const starCount = starRule === "Single Star" ? 1 : starRule === "Binary" ? 2 : starRule === "Trinary" ? 3 : system.star_count;

  return {
    ...system,
    system_rarity: optionValue(rarity) ?? system.system_rarity,
    star_count: starCount
  };
}

function slug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const solMajorPlanetNames = new Set(["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]);

function withAssignment(body: CelestialBodyNode, context: AssignmentContext, orbitIndex: number, assignedPlanetId?: string): BodyCardState {
  return withDiscovery({
    ...body,
    assignedPlanetId,
    assignedSystemId: context.system.id,
    assignedSystemName: context.system.system_name,
    assignedSectorId: context.sector.id,
    assignedSectorName: context.sector.sector_name,
    assignedGalaxyId: context.galaxy.id,
    assignedGalaxyName: context.galaxy.name,
    orbitIndex,
    orbitalRole: "Planet",
    parentStarClass: context.system.star_type,
    parentStarSeed: context.system.system_seed,
    seed_id: body.seed ?? body.id
  }, "detected", seededRange(body.seed ?? body.id, "body-discovery-points", 25, 180), body.colonizable);
}

function assignPlanetToContext(planet: GeneratedPlanet, context: AssignmentContext, orbitIndex: number): AssignedPlanet {
  const discovery = withDiscovery(planet as unknown as Record<string, unknown>, normalizeDiscoveryState(planet.discoveryState, "detected"), planet.discovery_points ?? 120, planet.colonizable);
  return {
    ...planet,
    ...discovery,
    galaxyId: context.galaxy.id,
    galaxyName: context.galaxy.name,
    sectorId: context.sector.id,
    sectorName: context.sector.sector_name,
    starSystemId: context.system.id,
    starSystemName: context.system.system_name,
    orbitIndex,
    orbitalRole: "Planet",
    parentStarClass: context.system.star_type,
    parentStarSeed: context.system.system_seed,
    galaxy_sector: context.sector.sector_name,
    star_system: context.system.system_name,
    orbit_position: orbitIndex,
    star_type: context.system.star_type,
    discovery_points: discovery.discoveryPoints
  };
}

function fixedSolBodyType(planet: GeneratedPlanet) {
  if (planet.traits.includes("Moon") || planet.distance_from_star.startsWith("Moon of ")) return "Moon";
  if (planet.traits.includes("Dwarf Planet") || planet.planet_class === "Dwarf Planet") return "Dwarf Planet";
  if (planet.traits.includes("Asteroid Belt") || planet.planet_subclass.includes("Belt")) return "Asteroid Belt";
  return "Planet";
}

function fixedSolOrbitParent(planet: GeneratedPlanet) {
  if (planet.distance_from_star.startsWith("Moon of ")) return planet.distance_from_star.replace("Moon of ", "");
  return planet.star_system || "Sol";
}

function fixedSolCelestialBodyToCard(body: CelestialBodyNode, context: AssignmentContext, sourcePlanet?: GeneratedPlanet): BodyCardState {
  const assigned = sourcePlanet ? assignPlanetToContext(sourcePlanet, context, sourcePlanet.orbit_position) : undefined;
  const gasGiant = body.uses_orbital_gameplay || body.planet_class === "Gas Giant";
  const orbitIndex = body.orbit_position ?? sourcePlanet?.orbit_position ?? body.generation_index ?? 0;

  return withDiscovery({
    ...body,
    id: sourcePlanet?.id ?? body.id,
    system_id: context.system.id,
    name: body.name,
    celestial_body_type: sourcePlanet ? fixedSolBodyType(sourcePlanet) : body.celestial_body_type,
    planet_class: sourcePlanet?.planet_class ?? body.planet_class,
    planet_subclass: sourcePlanet?.planet_subclass ?? body.planet_subclass,
    planet_rarity: sourcePlanet?.rarity ?? body.planet_rarity,
    biome: sourcePlanet?.primary_biome ?? body.biome,
    atmosphere: sourcePlanet?.atmosphere ?? body.atmosphere,
    gravity: sourcePlanet?.gravity ?? body.gravity,
    orbit_position: orbitIndex,
    orbit_parent: sourcePlanet ? fixedSolOrbitParent(sourcePlanet) : body.orbit_parent,
    landable: sourcePlanet?.landable ?? body.landable,
    colonizable: sourcePlanet?.colonizable ?? body.colonizable,
    colonizable_status: sourcePlanet
      ? sourcePlanet.colonized
        ? "Already Colonized"
        : sourcePlanet.colonizable
          ? "Colonizable"
          : "Not Colonizable"
      : body.colonizable_status,
    uses_orbital_gameplay: gasGiant,
    is_fixed: true,
    is_starting_body: body.is_starting_body || sourcePlanet?.name === "Earth" || Boolean(sourcePlanet?.modifiers.includes("Starting Body")),
    is_procedural: false,
    unlock_requirement: sourcePlanet?.required_technology?.[0] ?? body.unlock_requirement ?? "Survey Required",
    resources: sourcePlanet?.resources ?? body.resources,
    notes: sourcePlanet?.notes ?? body.notes,
    seed: sourcePlanet?.seed ?? body.seed,
    generation_parent_seed: context.system.system_seed,
    generation_index: orbitIndex,
    generation_version: "fixed-sol-v1",
    assignedPlanetId: sourcePlanet?.id,
    assignedSystemId: context.system.id,
    assignedSystemName: context.system.system_name,
    assignedSectorId: context.sector.id,
    assignedSectorName: context.sector.sector_name,
    assignedGalaxyId: context.galaxy.id,
    assignedGalaxyName: context.galaxy.name,
    orbitIndex,
    orbitalRole: "Planet",
    parentStarClass: context.system.star_type,
    parentStarSeed: context.system.system_seed,
    image_url: sourcePlanet ? planetImageUrl(sourcePlanet) : null,
    seed_id: sourcePlanet?.seed ?? body.seed ?? body.id,
    story: sourcePlanet?.story ?? body.notes,
    discovery_points: sourcePlanet?.discovery_points,
    source_planet: assigned
  }, "charted", sourcePlanet?.discovery_points ?? seededRange(body.seed ?? body.id, "body-discovery-points", 75, 240), sourcePlanet?.colonizable ?? body.colonizable);
}

function linkSystemToPlanets(system: StarSystemNode, context: AssignmentContext, planets: AssignedPlanet[]): LinkedStarSystemNode {
  return withDiscovery({
    ...system,
    galaxyId: context.galaxy.id,
    galaxyName: context.galaxy.name,
    sectorId: context.sector.id,
    sectorName: context.sector.sector_name,
    planetIds: planets.map((planet) => planet.id),
    planets,
    planet_count: planets.length || system.planet_count
  }, isSolSystem(system) ? "charted" : normalizeDiscoveryState(system.discoveryState ?? system.discovery_state, "detected"), seededRange(system.system_seed, "system-discovery-points", 200, 900), false);
}

function toSystemState(system: StarSystemNode, galaxy?: GalaxyNode, sector?: SectorNode): StarSystemCardState {
  const context = galaxy && sector ? { galaxy, sector, system } : null;
  const fixedSolPlanets = context && system.is_fixed ? fixedSolGeneratedPlanets() : [];
  const fixedSolBodies = context && system.is_fixed ? generateCelestialBodies(system).filter((body) => body.celestial_body_type !== "Star") : [];
  const fixedSolPlanetByName = new Map(fixedSolPlanets.map((planet) => [planet.name, planet]));
  const planets =
    context && system.is_fixed
      ? fixedSolPlanets
          .filter((planet) => solMajorPlanetNames.has(planet.name))
          .sort((left, right) => left.orbit_position - right.orbit_position)
          .map((planet) => assignPlanetToContext(planet, context, planet.orbit_position))
      : [];
  const bodies =
    context && system.is_fixed
      ? fixedSolBodies
          .filter((body) => !solMajorPlanetNames.has(body.name))
          .sort((left, right) => (left.orbit_position ?? 99) - (right.orbit_position ?? 99) || left.name.localeCompare(right.name))
          .map((body) => fixedSolCelestialBodyToCard(body, context, fixedSolPlanetByName.get(body.name)))
      : [];

  return {
    system: context ? linkSystemToPlanets(system, context, planets) : withDiscovery(system, isSolSystem(system) ? "charted" : "detected", seededRange(system.system_seed, "system-discovery-points", 200, 900)),
    bodies,
    planets,
    factions: []
  };
}

function toSectorState(sector: SectorNode, galaxy?: GalaxyNode): SectorCardState {
  const system = galaxy && sector.is_fixed ? generateStarSystems(sector, 1)[0] : null;
  return { sector: withDiscovery(sector, sector.is_fixed ? "charted" : "detected", sector.discovery_value, sector.colonized_worlds > 0), systems: system ? [toSystemState(system, galaxy, sector)] : [], factions: [] };
}

function toGalaxyState(galaxy: GalaxyNode): GalaxyCardState {
  const expanded = withGalaxyExpansionProfile(galaxy);
  return { galaxy: withDiscovery(expanded, isMilkyWay(expanded) ? "charted" : "undiscovered", isMilkyWay(expanded) ? 2500 : 1000, false), sectors: [] };
}

function normalizeGalaxySector(galaxy: GalaxyNode, sector: SectorNode, sectorIndex: number): SectorNode {
  if (!galaxy.is_unlimited || sector.is_fixed) return sector;
  const galaxySlug = galaxySeedSlug(galaxy);
  const sectorSeed = `PROJECT-GENESIS:${galaxySlug}:sector-${sectorIndex}`;
  const sectorName = sectorIndex === 0 && isMilkyWay(galaxy) ? "Local Bubble" : `${sector.sector_name.replace(/-\d+$/, "")}-${String(sectorIndex).padStart(4, "0")}`;

  return {
    ...sector,
    id: `sector-${galaxySlug}-${sectorIndex}`,
    galaxy_id: galaxy.id,
    sector_seed: sectorSeed,
    sector_name: sectorName,
    system_count: seededRange(sectorSeed, "system-capacity", 12, 50),
    generation_parent_seed: galaxy.galaxy_seed,
    generation_index: sectorIndex
  };
}

function normalizeGalaxySystem(sector: SectorNode, system: StarSystemNode, systemIndex: number): StarSystemNode {
  if (!sector.sector_seed.startsWith("PROJECT-GENESIS:") || system.is_fixed) return system;
  const systemSeed = `${sector.sector_seed}:system-${systemIndex}`;
  const seedParts = sector.sector_seed.split(":");
  const galaxySlug = seedParts[1] ?? "galaxy";

  return {
    ...system,
    id: `system-${slug(systemSeed)}`,
    sector_id: sector.id,
    system_seed: systemSeed,
    catalog_designation: `${galaxySlug.slice(0, 3).toUpperCase()}-${String(sector.generation_index ?? 0).padStart(4, "0")}-${String(systemIndex).padStart(3, "0")}`,
    generation_parent_seed: sector.sector_seed,
    generation_index: systemIndex
  };
}

function defaultGalaxyCards(universeSeed: string) {
  const universe = generateUniverse(universeSeed);
  const galaxy = createExpansionGalaxy(universe.universe_seed, 0);
  const sector = generateSectors(galaxy, 1)[0];
  const system = sector ? generateStarSystems(sector, 1)[0] : null;
  const galaxyState = toGalaxyState(galaxy);
  const sectorState = sector ? toSectorState(sector, galaxyState.galaxy) : null;

  return [
    {
      galaxy: galaxyState.galaxy,
      sectors: sectorState ? [{ ...sectorState, systems: system ? [toSystemState(system, galaxyState.galaxy, sectorState.sector)] : [] }] : []
    }
  ];
}

function defaultSectorCards(universeSeed: string, galaxyIndex: number) {
  const universe = generateUniverse(universeSeed);
  const galaxy = createExpansionGalaxy(universe.universe_seed, galaxyIndex);
  const sector = normalizeGalaxySector(galaxy, generateSector(galaxy, 0), 0);
  const system = sector ? generateStarSystems(sector, 1)[0] : null;
  const sectorState = sector ? toSectorState(sector, galaxy) : null;

  return sectorState
    ? [
        {
          ...sectorState,
          systems: system ? [toSystemState(system, galaxy, sectorState.sector)] : []
        }
      ]
    : [];
}

function defaultSystemCards(universeSeed: string, galaxyIndex: number, sectorIndex: number) {
  const universe = generateUniverse(universeSeed);
  const galaxy = createExpansionGalaxy(universe.universe_seed, galaxyIndex);
  const sector = normalizeGalaxySector(galaxy, generateSector(galaxy, sectorIndex), sectorIndex);
  const system = sector ? normalizeGalaxySystem(sector, generateStarSystem(sector, 0), 0) : null;
  return system && sector ? [toSystemState(system, galaxy, sector)] : [];
}

function useGeneratedPlanetPool() {
  const [planets, setPlanets] = useState<GeneratedPlanet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlanets() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/planets");
        const payload = (await response.json().catch(() => ({}))) as { rows?: GeneratedPlanet[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load generated planets.");
        }

        if (!cancelled) {
          setPlanets(payload.rows ?? []);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Could not load generated planets.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPlanets();

    return () => {
      cancelled = true;
    };
  }, []);

  return { planets, loading, error };
}

function assignedPlanetIdsInSystems(systems: StarSystemCardState[]) {
  return new Set(
    systems.flatMap((system) => [
      ...system.planets.map((planet) => planet.id),
      ...(system.system.planetIds ?? []),
      ...system.bodies.map((body) => body.assignedPlanetId).filter(Boolean)
    ] as string[])
  );
}

function assignedPlanetIdsInSectors(sectors: SectorCardState[]) {
  return new Set(sectors.flatMap((sector) => [...assignedPlanetIdsInSystems(sector.systems)]));
}

function assignedPlanetIdsInGalaxies(galaxies: GalaxyCardState[]) {
  return new Set(galaxies.flatMap((galaxy) => [...assignedPlanetIdsInSectors(galaxy.sectors)]));
}

function addGeneratedPlanetsToSystem(card: StarSystemCardState, context: AssignmentContext, planets: GeneratedPlanet[], planetIds: string[]) {
  const existingPlanetIds = new Set([...card.planets.map((planet) => planet.id), ...(card.system.planetIds ?? [])]);
  const selectedPlanets = planetIds
    .filter((id) => !existingPlanetIds.has(id))
    .map((id) => planets.find((planet) => planet.id === id))
    .filter(Boolean) as GeneratedPlanet[];

  if (!selectedPlanets.length) {
    return card;
  }

  const currentMaxOrbit = [...card.planets.map((planet) => planet.orbitIndex ?? planet.orbit_position ?? 0), ...card.bodies.map((body) => body.orbitIndex ?? body.orbit_position ?? 0)].reduce(
    (max, orbit) => Math.max(max, orbit),
    0
  );
  const addedPlanets = selectedPlanets.map((planet, index) => assignPlanetToContext(planet, context, currentMaxOrbit + index + 1));
  const nextPlanets = [...card.planets, ...addedPlanets];

  return {
    ...card,
    system: {
      ...linkSystemToPlanets(card.system, context, nextPlanets),
      planet_count: nextPlanets.length + card.bodies.filter((body) => body.celestial_body_type === "Planet").length
    },
    planets: nextPlanets
  };
}

function removePlanetFromSystem(card: StarSystemCardState, planetId: string) {
  const nextPlanets = card.planets.filter((planet) => planet.id !== planetId);

  return {
    ...card,
    system: {
      ...card.system,
      planets: nextPlanets,
      planetIds: nextPlanets.map((planet) => planet.id),
      planet_count: nextPlanets.length + card.bodies.filter((body) => body.celestial_body_type === "Planet").length
    },
    planets: nextPlanets
  };
}

function galaxyVisual(galaxy: GalaxyNode) {
  if (galaxy.galaxy_type.includes("Void")) return "from-fuchsia-950 via-slate-950 to-black";
  if (galaxy.galaxy_type.includes("Ancient")) return "from-amber-900/50 via-slate-950 to-black";
  if (galaxy.galaxy_type.includes("Artificial")) return "from-cyan-950 via-slate-950 to-black";
  if (galaxy.galaxy_type.includes("Harmony")) return "from-emerald-950 via-slate-950 to-black";
  return "from-cyan-950 via-indigo-950 to-black";
}

function sectorVisual(sector: SectorNode) {
  if (sector.sector_type.includes("Void")) return "from-fuchsia-950 via-slate-950 to-black";
  if (sector.sector_type.includes("Ancient")) return "from-amber-950 via-slate-950 to-black";
  if (sector.sector_type.includes("Nebula")) return "from-purple-950 via-indigo-950 to-black";
  if (sector.sector_type.includes("Civilized")) return "from-cyan-950 via-slate-950 to-black";
  return "from-sky-950 via-slate-950 to-black";
}

function systemVisual(system: StarSystemNode) {
  if (system.star_type.includes("Red")) return "from-red-950 via-slate-950 to-black";
  if (system.star_type.includes("Blue")) return "from-blue-950 via-slate-950 to-black";
  if (system.star_type.includes("White")) return "from-slate-700 via-slate-950 to-black";
  if (system.star_type.includes("Black Hole")) return "from-purple-950 via-black to-black";
  return "from-amber-950 via-slate-950 to-black";
}

function systemVisualTone(system: StarSystemNode) {
  if (system.star_type.includes("Red")) return "Crimson";
  if (system.star_type.includes("Blue")) return "Azure";
  if (system.star_type.includes("White")) return "White";
  if (system.star_type.includes("Black Hole")) return "Violet";
  return "Gold";
}

function bodyVisual(body: CelestialBodyNode) {
  if (body.planet_class === "Gas Giant") return "from-emerald-950 via-slate-950 to-black";
  if (body.planet_class === "Lava") return "from-orange-950 via-slate-950 to-black";
  if (body.planet_class === "Ice") return "from-cyan-950 via-slate-950 to-black";
  if (body.celestial_body_type === "Moon") return "from-slate-700 via-slate-950 to-black";
  return "from-cyan-950 via-slate-950 to-black";
}

function planetImageUrl(planet: GeneratedPlanet) {
  const variants = planet.image_variants ?? [];
  const largest = variants.reduce<(typeof variants)[number] | null>((best, variant) => (!best || variant.size > best.size ? variant : best), null);
  return largest?.url ?? planet.image_url ?? planet.orbit_view_image_url ?? null;
}

function hydrateAssignedPlanetArtwork(planet: AssignedPlanet, planetPool: GeneratedPlanet[]): AssignedPlanet {
  const libraryPlanet = planetPool.find((candidate) => candidate.id === planet.id || candidate.seed === planet.seed);

  if (!libraryPlanet) {
    return planet;
  }

  return {
    ...libraryPlanet,
    ...planet,
    discoveryState: normalizeDiscoveryState(planet.discoveryState ?? libraryPlanet.discoveryState, "detected"),
    image_url: libraryPlanet.image_url ?? planet.image_url,
    orbit_view_image_url: libraryPlanet.orbit_view_image_url ?? planet.orbit_view_image_url,
    surface_landscape_image_url: libraryPlanet.surface_landscape_image_url ?? planet.surface_landscape_image_url,
    surface_landscape_status: libraryPlanet.surface_landscape_status ?? planet.surface_landscape_status,
    image_status: libraryPlanet.image_status ?? planet.image_status,
    image_variants: libraryPlanet.image_variants ?? planet.image_variants,
    image_prompt: libraryPlanet.image_prompt ?? planet.image_prompt,
    orbit_view_prompt: libraryPlanet.orbit_view_prompt ?? planet.orbit_view_prompt
  };
}

function hydrateBodyArtwork(body: BodyCardState, planetPool: GeneratedPlanet[]): BodyCardState {
  const libraryPlanet = planetPool.find((candidate) => candidate.id === body.assignedPlanetId || candidate.seed === body.seed);

  if (!libraryPlanet) {
    return body;
  }

  const imageUrl = planetImageUrl(libraryPlanet);

  return {
    ...body,
    image_url: imageUrl ?? body.image_url,
    source_planet: body.source_planet ? hydrateAssignedPlanetArtwork(body.source_planet as AssignedPlanet, planetPool) : libraryPlanet
  };
}

function planetPlaceholderStyle(planet: GeneratedPlanet): CSSProperties {
  const text = [planet.planet_class, planet.planet_subclass, planet.primary_biome, planet.climate, planet.atmosphere].join(" ").toLowerCase();
  if (text.includes("lava") || text.includes("volcanic")) return { background: "radial-gradient(circle at 35% 28%, #ffb26b, #f97316 28%, #42110b 72%)" };
  if (text.includes("ice") || text.includes("frozen")) return { background: "radial-gradient(circle at 35% 28%, #e0f2fe, #38bdf8 35%, #0f172a 76%)" };
  if (text.includes("swamp") || text.includes("living") || text.includes("organic")) return { background: "radial-gradient(circle at 35% 28%, #dcfce7, #22c55e 34%, #052e16 76%)" };
  if (text.includes("desert")) return { background: "radial-gradient(circle at 35% 28%, #fde68a, #d97706 38%, #451a03 78%)" };
  if (text.includes("void")) return { background: "radial-gradient(circle at 35% 28%, #f5d0fe, #7e22ce 36%, #020617 76%)" };
  if (text.includes("gas")) return { background: "radial-gradient(circle at 35% 28%, #ccfbf1, #14b8a6 34%, #0f172a 76%)" };
  return { background: "radial-gradient(circle at 35% 28%, #cffafe, #0284c7 34%, #0f172a 76%)" };
}

function planetToBodySnapshot(planet: AssignedPlanet): BodyCardState {
  const gasGiant = planet.uses_orbital_gameplay || planet.planet_class === "Gas Giant";
  const orbitIndex = planet.orbitIndex ?? planet.orbit_position ?? 0;
  return withDiscovery({
    id: planet.id,
    system_id: planet.starSystemId ?? "",
    parent_body_id: null,
    name: planet.name,
    celestial_body_type: "Planet",
    planet_class: planet.planet_class,
    planet_subclass: planet.planet_subclass,
    planet_rarity: planet.rarity,
    biome: planet.primary_biome,
    atmosphere: planet.atmosphere,
    gravity: planet.gravity,
    orbit_position: orbitIndex,
    orbit_parent: planet.starSystemName ?? planet.star_system,
    landable: planet.landable,
    colonizable: planet.colonizable,
    colonizable_status: planet.colonized ? "Already Colonized" : planet.colonizable ? "Colonizable" : "Not Colonizable",
    uses_orbital_gameplay: gasGiant,
    is_fixed: false,
    is_starting_body: false,
    is_procedural: true,
    unlock_requirement: planet.required_technology?.[0] ?? "Survey Required",
    resources: planet.resources,
    notes: planet.notes,
    seed: planet.seed,
    generation_parent_seed: planet.parentStarSeed ?? planet.seed,
    generation_index: orbitIndex,
    generation_version: "star-system-assignment-v1",
    assignedPlanetId: planet.id,
    assignedSystemId: planet.starSystemId,
    assignedSystemName: planet.starSystemName,
    assignedSectorId: planet.sectorId,
    assignedSectorName: planet.sectorName,
    assignedGalaxyId: planet.galaxyId,
    assignedGalaxyName: planet.galaxyName,
    orbitIndex,
    orbitalRole: "Planet",
    parentStarClass: planet.parentStarClass,
    parentStarSeed: planet.parentStarSeed,
    image_url: planetImageUrl(planet),
    seed_id: planet.seed,
    story: planet.story,
    discovery_points: planet.discovery_points,
    faction: planet.faction,
    factionIds: planet.faction ? [planet.faction.id] : [],
    factionPresence: planet.faction ? [planet.faction] : [],
    colonyId: planet.colonyId,
    colony: planet.colony,
    colonizationStatus: planet.colonizationStatus,
    source_planet: planet
  }, normalizeDiscoveryState(planet.discoveryState, "detected"), planet.discoveryPoints ?? planet.discovery_points ?? 120, planet.colonizable);
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em]", className)}>
      {children}
    </span>
  );
}

function FactionBadges({ factions, compact = false }: { factions?: FactionRecord[]; compact?: boolean }) {
  if (!factions?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {factions.slice(0, compact ? 2 : 4).map((faction) => (
        <Badge key={faction.id} className={cn("border-violet-300/45 text-violet-100", faction.disposition === "Hostile" && "border-rose-300/45 text-rose-100", faction.disposition === "Friendly" && "border-emerald-300/45 text-emerald-100")}>
          {compact ? faction.type : `${faction.name} - ${faction.type}`}
        </Badge>
      ))}
    </div>
  );
}

function ColonyBadge({ colony, compact = false }: { colony?: ColonyRecord; compact?: boolean }) {
  if (!colony) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="border-emerald-300/45 bg-emerald-400/10 text-emerald-100">
        {compact ? `Colony ${colony.colonyLevel}` : `${colony.name} - ${colony.status}`}
      </Badge>
    </div>
  );
}

function StatChip({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-semibold text-slate-100", tone)}>{value}</p>
    </div>
  );
}

function CardStatChip({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="min-w-0 rounded border border-cyan-300/10 bg-slate-950/45 px-2 py-1.5">
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={cn("mt-0.5 truncate text-xs font-medium text-slate-100", tone)}>{value}</p>
    </div>
  );
}

function cardList(values: string[]) {
  return values.filter(Boolean).slice(0, 6).join(", ") || "None";
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/65"
      />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-300/65"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function HeaderTextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: number;
}) {
  return (
    <input
      aria-label={label}
      type={type}
      min={min}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/65"
    />
  );
}

function HeaderSelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-300/65"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-cyan-300/60" /> : null}
          <span className={index === items.length - 1 ? "text-cyan-100" : ""}>{item}</span>
        </span>
      ))}
    </div>
  );
}

function GeneratorShell({
  eyebrow,
  title,
  description,
  actions,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
        </div>
        {actions ? <div className="w-full xl:max-w-[82rem]">{actions}</div> : null}
      </section>
      {children}
    </div>
  );
}

function DeleteButton({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onDelete();
      }}
      className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-md border border-red-300/25 bg-slate-950/70 text-red-100 transition hover:border-red-300/70 hover:bg-red-500/20"
      aria-label={`Delete ${label}`}
      title={`Delete ${label}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function CardImage({ variant, icon: Icon, label, compact = false }: { variant: string; icon: React.ElementType; label: string; compact?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-t-md bg-gradient-to-br", compact ? "h-40" : "h-56", variant)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(103,232,249,0.35),transparent_12%),radial-gradient(circle_at_42%_56%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_60%_45%,rgba(147,51,234,0.25),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-70" />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/25 bg-black/35 shadow-[0_0_45px_rgba(34,211,238,0.2)]",
          compact ? "h-16 w-16" : "h-24 w-24"
        )}
      >
        <Icon className={cn("text-cyan-100/85", compact ? "h-8 w-8" : "h-11 w-11")} />
      </div>
      <p className="absolute bottom-4 left-5 text-[0.65rem] font-black uppercase tracking-[0.24em] text-cyan-100/75">{label}</p>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-6 text-sm font-semibold text-slate-400">{children}</div>;
}

function ProgressionGatePanel({ progression }: { progression: ProgressionApi }) {
  const featureIds = Object.keys(featureGateCopy) as FeatureId[];

  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Progression Gates</p>
          <h2 className="mt-1 text-xl font-black text-white">Research Unlock Matrix</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Actions read from completed research and canonical feature IDs. Discovery Points earned here can feed future research spending.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[28rem]">
          <StatChip label="Discovery Points" value={formatNumber(progression.discoveryPoints)} />
          <StatChip label="Scanned Systems" value={progression.totalScannedSystems} />
          <StatChip label="Claimed / Colonized" value={`${progression.totalClaimedPlanets} / ${progression.totalColonizedPlanets}`} />
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {featureIds.map((featureId) => {
          const unlocked = progression.canUseFeature(featureId);
          const researchIds = featureResearchIdMap[featureId] ?? [];
          return (
            <div key={featureId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-white">{featureGateCopy[featureId].label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{unlocked ? "Unlocked" : progression.requirementText(featureId)}</p>
                  <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">{researchIds.length} linked research rows</p>
                </div>
                <Badge className={unlocked ? "border-emerald-300/45 text-emerald-100" : "border-amber-300/45 text-amber-100"}>{unlocked ? "Open" : "Locked"}</Badge>
              </div>
              {!unlocked ? (
                <Button type="button" className="mt-3 w-full border-slate-600 bg-slate-900/70 text-slate-100" onClick={() => progression.completeResearchForFeature(featureId)}>
                  Complete Research
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRange(seed: string, key: string, min: number, max: number) {
  return min + (hashText(`${seed}:${key}`) % (max - min + 1));
}

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function starColor(system: StarSystemNode) {
  const signature = `${system.primary_star} ${system.star_type}`.toLowerCase();
  if (signature.includes("red")) return "Red";
  if (signature.includes("blue")) return "Blue";
  if (signature.includes("white")) return "White";
  if (signature.includes("black")) return "Violet";
  if (signature.includes("neutron")) return "Electric Blue";
  if (signature.includes("orange")) return "Orange";
  return "Yellow";
}

function isSolSystem(system: StarSystemNode) {
  return system.starting_system || system.system_name.toLowerCase() === "sol";
}

function isLocalBubble(sector: SectorNode) {
  return sector.is_fixed || sector.sector_name.toLowerCase() === "local bubble";
}

function isMilkyWay(galaxy: GalaxyNode) {
  return galaxy.is_fixed || galaxy.name.toLowerCase() === "milky way";
}

function dangerLabel(value: number) {
  if (value >= 85) return "Extreme";
  if (value >= 65) return "High";
  if (value >= 35) return "Moderate";
  return "Low";
}

function densityLabel(value: number) {
  if (value >= 9) return "Dense";
  if (value >= 4) return "Balanced";
  return "Sparse";
}

function anomalyDensityLabel(count: number, danger = 0) {
  if (count >= 6 || danger >= 85) return "High";
  if (count >= 3 || danger >= 55) return "Moderate";
  if (count >= 1 || danger >= 25) return "Low";
  return "None";
}

function starStability(system: StarSystemNode) {
  if (isSolSystem(system)) return "Stable";
  if (system.danger_level >= 85) return "Collapsing";
  if (system.danger_level >= 65) return "Volatile";
  if (system.danger_level >= 40) return "Variable";
  return "Stable";
}

function radiationLevel(system: StarSystemNode) {
  const signature = `${system.primary_star} ${system.star_type}`.toLowerCase();
  if (signature.includes("black") || signature.includes("neutron") || signature.includes("blue")) return "Extreme";
  if (system.danger_level >= 70) return "High";
  if (signature.includes("red") || system.danger_level < 35) return "Low";
  return "Moderate";
}

function systemStats(card: StarSystemCardState) {
  const { system, bodies } = card;
  const assignedPlanetBodies = card.planets.map((planet) => planetToBodySnapshot(planet));
  const nonStarBodies = [...assignedPlanetBodies, ...bodies.filter((body) => body.celestial_body_type !== "Star")];
  const planets = nonStarBodies.filter((body) => body.celestial_body_type === "Planet");
  const moons = nonStarBodies.filter((body) => body.celestial_body_type === "Moon");
  const belts = nonStarBodies.filter((body) => body.celestial_body_type === "Asteroid Belt");
  const gasGiants = nonStarBodies.filter((body) => body.planet_class === "Gas Giant");
  const iceWorlds = nonStarBodies.filter((body) => body.planet_class === "Ice" || body.biome === "Ice");
  const habitablePlanets = nonStarBodies.filter((body) => body.landable && body.colonizable);
  const colonizedWorlds = nonStarBodies.filter((body) => body.colonizable_status === "Colonized" || body.is_starting_body);
  const stationLike = nonStarBodies.filter((body) => /station|outpost|depot|platform/i.test(`${body.celestial_body_type} ${body.name}`));
  const anomalyLike = nonStarBodies.filter((body) => /anomaly|rift|signal|relic|void/i.test(`${body.name} ${body.notes}`));
  const derivedBelts = belts.length || (system.resource_bias.toLowerCase().includes("mineral") ? 1 : 0);
  const habitableZone = system.starting_system ? "Stable" : system.danger_level < 45 ? "Likely" : system.danger_level < 75 ? "Unstable" : "Hostile";
  const colonizationStatus = system.colonized_at || colonizedWorlds.length ? "Colonized" : system.visited_at ? "Visited" : system.surveyed_at ? "Surveyed" : "Unclaimed";
  const discoveryStatus = system.discovery_state || (system.discovered ? "Discovered" : "Undetected");

  return {
    nonStarBodies,
    planets,
    moons,
    belts,
    gasGiants,
    iceWorlds,
    habitablePlanets,
    colonizedWorlds,
    stationLike,
    anomalyLike,
    planetCount: planets.length || system.planet_count,
    moonCount: moons.length,
    beltCount: derivedBelts,
    habitableZone,
    colonizationStatus,
    discoveryStatus,
    starColor: starColor(system),
    stability: starStability(system),
    radiation: radiationLevel(system),
    starAge: `${(seededRange(system.system_seed, "age", 80, 980) / 100).toFixed(1)} billion years`,
    starMass: `${(seededRange(system.system_seed, "mass", 65, 245) / 100).toFixed(2)} solar masses`,
    starRadius: `${(seededRange(system.system_seed, "radius", 55, 330) / 100).toFixed(2)} solar radii`,
    temperature: `${formatNumber(seededRange(system.system_seed, "temperature", 2800, 11200))} K`,
    luminosity: `${(seededRange(system.system_seed, "luminosity", 15, 620) / 100).toFixed(2)} L`,
    resourceValue: system.system_rarity === "Common" ? system.resource_bias : `${system.system_rarity} ${system.resource_bias}`
  };
}

function systemType(system: StarSystemNode) {
  if (isSolSystem(system)) return "Home System";
  const source = `${system.system_role} ${system.system_type} ${system.resource_bias}`.toLowerCase();
  if (source.includes("trade") || source.includes("civilized")) return "Trade Hub";
  if (source.includes("ancient") || source.includes("relic")) return "Ancient System";
  if (source.includes("resource") || source.includes("mineral") || source.includes("mining")) return "Mining System";
  if (source.includes("void") || source.includes("hazard") || system.danger_level >= 70) return "Hostile System";
  return "Frontier System";
}

function gravityProfile(system: StarSystemNode) {
  if (/black hole|neutron/i.test(`${system.primary_star} ${system.star_type}`)) return "Extreme";
  if (system.danger_level >= 70) return "High Variance";
  if (system.danger_level <= 25) return "Calm";
  return "Standard";
}

function systemDiscoveryPoints(system: StarSystemNode, stats: ReturnType<typeof systemStats>) {
  if (isSolSystem(system)) return 250;
  const rarityBase: Record<string, number> = {
    Common: 250,
    Uncommon: 500,
    Rare: 1000,
    Epic: 2500,
    Legendary: 6000,
    Mythic: 15000,
    Relic: 40000,
    Genesis: 100000
  };
  return (rarityBase[system.system_rarity] ?? 250) + seededRange(system.system_seed, "discovery-points", 0, 180) + stats.planetCount * 15 + stats.beltCount * 25;
}

function systemSpaceConditions(card: StarSystemCardState) {
  const { system } = card;
  const stats = systemStats(card);
  return uniqueValues([
    `${stats.radiation} Radiation`,
    `${stats.stability} Stellar Output`,
    system.danger_level >= 65 ? "Solar Storm Windows" : "Predictable Solar Weather",
    stats.beltCount ? "Asteroid Drift" : null,
    stats.gasGiants.length ? "Gas Giant Magnetospheres" : null
  ]).slice(0, 8);
}

function systemSeedModel(card: StarSystemCardState): StarSystemSeedModel {
  const { system } = card;
  const stats = systemStats(card);
  const discoveryPoints = systemDiscoveryPoints(system, stats);
  const systemTypeValue = systemType(system);
  const resources = inferredResources(card);
  const hazards = inferredHazards(card);
  const traits = inferredTraits(card);
  const anomalies = inferredAnomalies(card);
  const sol = isSolSystem(system);
  const planetCount = sol ? 8 : stats.planetCount;
  const habitableWorlds = sol ? 1 : stats.habitablePlanets.length;
  const gasGiants = sol ? 4 : stats.gasGiants.length;
  const asteroidBelts = sol ? 1 : stats.beltCount;
  const explorationRisk = dangerLabel(system.danger_level);
  const colonizationPotential = sol ? "High" : habitableWorlds >= 2 ? "High" : habitableWorlds === 1 ? "Moderate" : "Low";

  return {
    id: system.id,
    seedId: system.system_seed || system.catalog_designation,
    name: namedValue(system, system.system_name),
    type: "Star System",
    rarity: system.system_rarity,
    discoveryPoints,
    starClass: system.star_type,
    starColor: stats.starColor,
    systemType: systemTypeValue,
    stability: stats.stability,
    gravityProfile: gravityProfile(system),
    radiationLevel: stats.radiation,
    habitableZone: stats.habitableZone,
    planetCount,
    habitableWorlds,
    gasGiants,
    moonCount: stats.moonCount,
    asteroidBelts,
    resourceValue: stats.resourceValue,
    dangerLevel: system.danger_level,
    colonizationPotential,
    explorationRisk,
    anomalyDensity: anomalyDensityLabel(anomalies.length, system.danger_level),
    resources,
    traits,
    hazards,
    anomalies,
    modifiers: inferredModifiers(card),
    collectibles: inferredCollectibles(card),
    events: inferredEvents(card),
    spaceConditions: systemSpaceConditions(card),
    colonization: {
      Status: stats.colonizationStatus,
      "Habitable Zone": stats.habitableZone,
      "Candidate Worlds": stats.habitablePlanets.length,
      "Colonized Worlds": stats.colonizedWorlds.length,
      "Starting System": system.starting_system ? "Yes" : "No"
    },
    science: {
      "Discovery Status": stats.discoveryStatus,
      "Survey Value": discoveryPoints,
      "Radiation Level": stats.radiation,
      "Known Anomalies": anomalies.length,
      "Star Signature": system.known_star_signature ?? system.primary_star
    },
    economy: {
      "Resource Bias": system.resource_bias,
      "Resource Value": stats.resourceValue,
      "Fuel Potential": gasGiants ? "High" : "Moderate",
      "Mining Corridors": asteroidBelts,
      "Trade Potential": systemTypeValue === "Trade Hub" || sol ? "High" : "Developing"
    },
    visualTheme: {
      "Star Color": stats.starColor,
      "Primary Tone": systemVisualTone(system),
      Lighting: stats.stability === "Stable" ? "Soft" : "Volatile",
      "Orbital Density": stats.planetCount >= 8 ? "Dense" : stats.planetCount >= 4 ? "Balanced" : "Sparse",
      "Danger Glow": system.danger_level >= 70 ? "High" : "Low"
    },
    description: systemDescription(card)
  };
}

function sectorSeedModel(card: SectorCardState): SectorSeedModel {
  const { sector, systems } = card;
  const systemModels = systems.map((systemCard) => systemSeedModel(systemCard));
  const localBubble = isLocalBubble(sector);
  const systemCapacity = localBubble ? 24 : sector.system_count;
  const generatedSystems = localBubble ? Math.max(systems.length, 1) : systems.length;
  const resources = normalizeResourceNames([...systemModels.flatMap((model) => model.resources), ...resourceNames(["RES-0192"])]).slice(0, 10);
  const hazards = uniqueValues([
    sector.difficulty >= 70 ? "Hostile Navigation" : null,
    sector.difficulty >= 45 ? "Patrol Risk" : "Low Navigation Risk",
    ...systemModels.flatMap((model) => model.hazards)
  ]).slice(0, 8);
  const traits = uniqueValues([sector.modifier, sector.discovery_level, `${systemCapacity} System Capacity`, ...systemModels.flatMap((model) => model.traits)]).slice(0, 8);
  const anomalies = uniqueValues([...systemModels.flatMap((model) => model.anomalies), sector.sector_rarity === "Relic" ? "Relic Signal" : null]).slice(0, 8);
  const discoveryPoints = sector.discovery_value + generatedSystems * 100;
  const dangerLevel = localBubble ? "Low" : dangerLabel(sector.difficulty);
  const systemDensity = localBubble ? "Balanced" : densityLabel(systemCapacity);

  return {
    id: sector.id,
    seedId: sector.sector_seed,
    name: namedValue(sector, sector.sector_name),
    type: "Sector",
    rarity: sector.sector_rarity,
    discoveryPoints,
    sectorClass: localBubble ? "Civilized Space" : sector.sector_type,
    systemDensity,
    coordinates: `${sector.coordinates_x}, ${sector.coordinates_y}, ${sector.coordinates_z}`,
    difficulty: sector.difficulty,
    systemCapacity,
    generatedSystems,
    systemCount: generatedSystems || systemCapacity,
    resourceBias: sector.resource_signal,
    dangerLevel,
    discoveryLevel: sector.discovery_level,
    colonizationPotential: localBubble ? "High" : sector.colonized_worlds ? "High" : sector.difficulty >= 65 ? "Low" : "Moderate",
    tradeValue: localBubble ? "High" : sector.resource_signal.toLowerCase().includes("trade") || sector.colonized_worlds ? "High" : "Developing",
    patrolRisk: localBubble ? "Low" : sector.difficulty >= 70 ? "High" : sector.difficulty >= 40 ? "Moderate" : "Low",
    anomalyDensity: anomalyDensityLabel(anomalies.length, sector.difficulty),
    resources,
    traits,
    hazards,
    anomalies,
    modifiers: uniqueValues([sector.modifier, `${sector.resource_signal} Bias`, sector.colonized_worlds ? "Colonized Presence" : null]).slice(0, 8),
    events: uniqueValues([sector.discovered ? "Sector Charted" : "Awaiting Discovery", sector.difficulty >= 70 ? "Hazard Advisory" : "Survey Window Open"]).slice(0, 8),
    visualTheme: {
      Coordinates: `${sector.coordinates_x}, ${sector.coordinates_y}, ${sector.coordinates_z}`,
      "Sector Type": sector.sector_type,
      "Discovery Level": sector.discovery_level,
      "Resource Signal": sector.resource_signal,
      "System Density": systemDensity
    },
    description: `${sector.sector_name} is a ${sector.sector_rarity.toLowerCase()} ${localBubble ? "civilized space" : sector.sector_type.toLowerCase()} sector with ${systemDensity.toLowerCase()} system density and ${dangerLevel.toLowerCase()} danger. Its ${sector.resource_signal.toLowerCase()} signal supports ${sector.discovery_value.toLocaleString()} baseline discovery value.`
  };
}

function galaxySeedModel(card: GalaxyCardState): GalaxySeedModel {
  const { galaxy, sectors } = card;
  const sectorModels = sectors.map((sectorCard) => sectorSeedModel(sectorCard));
  const milkyWay = isMilkyWay(galaxy);
  const galaxyDna = galaxy.galaxy_dna ?? (milkyWay ? defaultGalaxyDNA : proceduralGalaxyDNA(galaxy));
  const unlocked = galaxy.is_unlocked ?? milkyWay;
  const discovered = sectors.filter((sector) => sector.sector.discovered).length;
  const discoveryPercent = milkyWay ? 13 : sectors.length ? Math.min(95, Math.round((discovered / Math.max(1, sectors.length)) * 100)) : 0;
  const generatedSystemCount = sectors.reduce((total, sector) => total + sector.systems.length, 0);
  const discoveredSystemCount = sectors.reduce(
    (total, sector) => total + sector.systems.filter((system) => system.system.discovered || system.system.discovery_state !== "Undetected").length,
    0
  );
  const generatedPlanetCount = sectors.reduce((total, sector) => total + sector.systems.reduce((systemTotal, system) => systemTotal + system.planets.length + system.bodies.filter((body) => body.celestial_body_type === "Planet").length, 0), 0);
  const discoveredPlanetCount = generatedPlanetCount;
  const estimatedSystems = generatedSystemCount;
  const estimatedBodies = generatedPlanetCount;
  const rarity = sectors.find((sector) => ["Genesis", "Relic", "Mythic", "Legendary"].includes(sector.sector.sector_rarity))?.sector.sector_rarity ?? (milkyWay ? "Common" : "Uncommon");
  const galaxyClass = milkyWay ? "Spiral" : galaxy.galaxy_type.replace(" Galaxy", "");
  const galaxyScale = milkyWay ? "Mythic" : galaxy.galaxy_size === "Large" ? "Vast" : galaxy.galaxy_size === "Small" ? "Local" : galaxy.galaxy_size === "Starting Galaxy" ? "Mythic" : "Regional";
  const startingSector = milkyWay ? "Local Bubble" : sectors[0]?.sector.sector_name ?? "None";
  const resourceBias = sectorModels[0]?.resourceBias ?? `${galaxyDna.resourceRichness} Resources`;
  const anomalyDensity = galaxyDna.anomalyDensity;
  const discoveryDisplay = milkyWay ? "<0.0001%" : sectors.length ? `${discoveryPercent}%` : "0%";

  return {
    id: galaxy.id,
    seedId: galaxy.galaxy_seed,
    name: galaxy.name,
    type: "Galaxy",
    rarity,
    discoveryPoints: milkyWay ? 2500 : 1000 + sectors.length * 500 + generatedSystemCount * 125 + generatedPlanetCount * 25,
    galaxyClass,
    galaxyScale,
    sectorCount: galaxy.sector_count,
    generatedSectors: sectors.length,
    estimatedSystems,
    estimatedBodies,
    discoveryPercent,
    startingSector,
    resourceBias,
    civilizationPresence: milkyWay ? "Established Origin" : galaxyDna.civilizationDensity,
    explorationRisk: galaxyDna.hostility,
    anomalyDensity,
    isUnlimited: true,
    theoreticalSystemCapacity: "Unlimited",
    generatedSystemCount,
    discoveredSystemCount,
    discoveredSectorCount: discovered,
    discoveryPercentDisplay: discoveryDisplay,
    generatedPlanetCount,
    discoveredPlanetCount,
    isUnlocked: unlocked,
    unlockRequirement: milkyWay ? milkyWayGalaxyProfile.unlockRequirement : "Requires intergalactic navigation research. Dev override is available for testing.",
    galaxyDNA: galaxyDna,
    resources: normalizeResourceNames([...sectorModels.flatMap((model) => model.resources), ...resourceNames(["RES-0193", "RES-0194"])]).slice(0, 10),
    traits: uniqueValues([galaxyScale, galaxyClass, milkyWay ? "Sol Origin" : "Procedural Expansion", `${galaxyDna.age} Galaxy`, `${galaxyDna.resourceRichness} Resources`, ...sectorModels.flatMap((model) => model.traits)]).slice(0, 8),
    hazards: uniqueValues([...sectorModels.flatMap((model) => model.hazards), galaxy.galaxy_type.includes("Void") ? "Void Routes" : null]).slice(0, 8),
    anomalies: uniqueValues([...sectorModels.flatMap((model) => model.anomalies), ...galaxyDna.rarePhenomena]).slice(0, 8),
    modifiers: uniqueValues([`${galaxyScale} Scale`, "Unlimited System Capacity", galaxy.is_fixed ? "Sol Origin" : "Procedural Expansion", `${galaxyDna.terraformDifficulty} Terraforming`]).slice(0, 8),
    events: uniqueValues([galaxy.is_fixed ? "Milky Way Baseline Loaded" : unlocked ? "Galaxy Unlocked" : "Galaxy Locked", sectors.length ? "Sectors Available" : "Awaiting Sector Generation"]).slice(0, 8),
    visualTheme: {
      "Galaxy Type": galaxy.galaxy_type,
      Scale: galaxyScale,
      "System Capacity": "Unlimited",
      "Generated Sectors": sectors.length,
      "Generated Systems": generatedSystemCount,
      "Dominant Stars": galaxyDna.dominantStarTypes.join(", ")
    },
    description: milkyWay
      ? `${galaxy.name} is an effectively unlimited ${galaxyClass.toLowerCase()} galaxy with ${generatedSystemCount} generated systems and discovery still below measurable galactic scale.`
      : `${galaxy.name} is a procedurally generated ${galaxyClass.toLowerCase()} galaxy with ${galaxyDna.age.toLowerCase()} stellar DNA, ${galaxyDna.resourceRichness.toLowerCase()} resources, and unlimited explorable sectors.`
  };
}

function inferredResources(card: StarSystemCardState) {
  return normalizeResourceNames([
    ...card.planets.flatMap((planet) => planet.resources),
    ...card.bodies.flatMap((body) => body.resources),
    ...resourceNames(["RES-0191", "RES-0192"])
  ]).slice(0, 10);
}

function inferredHazards(card: StarSystemCardState) {
  const values = ["Radiation Belts"];
  if (card.system.danger_level >= 70) values.push("High Gravity Stress", "Unstable Orbits");
  if (card.system.danger_level >= 45) values.push("Solar Storms");
  systemStats(card).nonStarBodies.forEach((body) => {
    if (body.planet_class === "Gas Giant") values.push("Atmospheric Turbulence");
    if (body.planet_class === "Lava") values.push("Extreme Heat");
    if (body.planet_class === "Void") values.push("Void Distortion");
  });
  return uniqueValues(values).slice(0, 8);
}

function inferredTraits(card: StarSystemCardState) {
  const stats = systemStats(card);
  return uniqueValues([
    card.system.system_role,
    `${stats.stability} Star`,
    `${stats.habitableZone} Habitable Zone`,
    stats.gasGiants.length ? "Orbital Resource Worlds" : null,
    stats.habitablePlanets.length ? "Colonization Candidates" : null
  ]).slice(0, 8);
}

function inferredAnomalies(card: StarSystemCardState) {
  const stats = systemStats(card);
  return uniqueValues([
    ...stats.anomalyLike.map((body) => body.name),
    card.system.danger_level >= 80 ? "Deep Space Distortion" : null,
    card.system.system_rarity === "Relic" || card.system.system_rarity === "Genesis" ? "Ancient Signal" : null
  ]).slice(0, 8);
}

function inferredModifiers(card: StarSystemCardState) {
  const stats = systemStats(card);
  return uniqueValues([
    `${card.system.resource_bias} Bias`,
    `${stats.radiation} Radiation`,
    stats.habitablePlanets.length ? "Colony Opportunity" : null,
    stats.beltCount ? "Mining Corridor" : null
  ]).slice(0, 8);
}

function inferredEvents(card: StarSystemCardState) {
  return uniqueValues([
    card.system.starting_system ? "Starting System Established" : "Long Range Survey",
    card.system.danger_level >= 70 ? "Hazard Alert" : "Routine Survey",
    card.system.discovery_state === "Colonized" ? "Colonial Logistics" : null
  ]).slice(0, 8);
}

function inferredCollectibles(card: StarSystemCardState) {
  const rareBodies = systemStats(card).nonStarBodies.filter((body) => ["Rare", "Epic", "Legendary", "Mythic", "Relic", "Genesis"].includes(body.planet_rarity ?? ""));
  return uniqueValues([
    rareBodies.length ? "Rare Survey Cache" : "Survey Fragments",
    "Stellar Cartography",
    card.system.system_rarity === "Genesis" ? "Genesis Archive" : null,
    card.system.system_rarity === "Relic" ? "Relic Beacon" : null
  ]).slice(0, 8);
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
      <h4 className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ChipList({ values }: { values: string[] }) {
  if (!values.length) return <p className="text-sm font-semibold text-slate-500">None detected.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span key={value} className="rounded-md border border-slate-500/60 bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-slate-200">
          {value}
        </span>
      ))}
    </div>
  );
}

function KeyValueGrid({ values }: { values: Record<string, string | number | boolean> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(values).map(([label, value]) => (
        <StatChip key={label} label={label} value={String(value)} />
      ))}
    </div>
  );
}

function starLightStyle(model: StarSystemSeedModel): CSSProperties {
  const color = model.starColor.toLowerCase();
  if (color.includes("red")) return { background: "radial-gradient(circle at 35% 34%, #fee2e2, #ef4444 24%, #7f1d1d 52%, transparent 72%)" };
  if (color.includes("blue") || color.includes("electric")) return { background: "radial-gradient(circle at 35% 34%, #eff6ff, #38bdf8 24%, #1d4ed8 52%, transparent 72%)" };
  if (color.includes("white")) return { background: "radial-gradient(circle at 35% 34%, #ffffff, #cbd5e1 28%, #475569 56%, transparent 74%)" };
  if (color.includes("violet")) return { background: "radial-gradient(circle at 35% 34%, #f5d0fe, #a855f7 26%, #581c87 54%, transparent 74%)" };
  if (color.includes("orange")) return { background: "radial-gradient(circle at 35% 34%, #ffedd5, #fb923c 25%, #9a3412 54%, transparent 74%)" };
  return { background: "radial-gradient(circle at 35% 34%, #fef9c3, #facc15 24%, #92400e 54%, transparent 74%)" };
}

function StarSystemVisual({ model, large = false }: { model: StarSystemSeedModel; large?: boolean }) {
  const orbitCount = Math.min(6, Math.max(3, Math.ceil(model.planetCount / 2)));
  const planetDots = Array.from({ length: orbitCount }, (_, index) => ({
    orbit: 25 + index * 11,
    angle: seededRange(model.seedId, `orbit-angle-${index}`, 0, 359),
    size: seededRange(model.seedId, `orbit-size-${index}`, 5, 10)
  }));

  return (
    <div className={cn("relative overflow-hidden border-cyan-300/10 bg-black", large ? "h-[clamp(18rem,42vh,26rem)] rounded-md border" : "h-36 border-b")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", systemVisual({ star_type: model.starClass } as StarSystemNode))} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_42%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_62%_54%,rgba(147,51,234,0.1),transparent_30%)]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/5" />
      {planetDots.map((dot, index) => {
        const radius = dot.orbit;
        const x = 50 + Math.cos((dot.angle * Math.PI) / 180) * (radius / 2);
        const y = 50 + Math.sin((dot.angle * Math.PI) / 180) * (radius / 2);
        return (
          <div key={index}>
            <div
              className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/10"
              style={{ width: `${radius}%` }}
            />
            <div
              className="absolute rounded-full border border-cyan-100/35 bg-cyan-100/80 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
              style={{ left: `${x}%`, top: `${y}%`, width: dot.size, height: dot.size }}
            />
          </div>
        );
      })}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_80px_rgba(250,204,21,0.22)]",
          large ? "h-32 w-32" : "h-14 w-14"
        )}
        style={starLightStyle(model)}
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.16),rgba(2,6,23,0.72))]" />
    </div>
  );
}

function SectorVisual({ model, large = false }: { model: SectorSeedModel; large?: boolean }) {
  const nodes = Array.from({ length: Math.min(9, Math.max(4, model.systemCount || 4)) }, (_, index) => ({
    x: seededRange(model.seedId, `sector-node-x-${index}`, 16, 84),
    y: seededRange(model.seedId, `sector-node-y-${index}`, 18, 82),
    size: seededRange(model.seedId, `sector-node-size-${index}`, 6, 12)
  }));

  return (
    <div className={cn("relative overflow-hidden border-cyan-300/10 bg-black", large ? "h-[clamp(18rem,42vh,26rem)] rounded-md border" : "h-36 border-b")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-85", sectorVisual({ sector_type: model.sectorClass } as SectorNode))} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_34%,rgba(34,211,238,0.18),transparent_22%),radial-gradient(circle_at_68%_58%,rgba(168,85,247,0.13),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:38px_38px] opacity-50" />
      <svg className="absolute inset-0 h-full w-full opacity-50" aria-hidden="true">
        {nodes.slice(1).map((node, index) => (
          <line key={`${node.x}-${node.y}`} x1={`${nodes[0].x}%`} y1={`${nodes[0].y}%`} x2={`${node.x}%`} y2={`${node.y}%`} stroke="rgba(103,232,249,0.18)" strokeWidth="1" />
        ))}
      </svg>
      {nodes.map((node, index) => (
        <div
          key={index}
          className="absolute rounded-full border border-cyan-100/35 bg-cyan-200/80 shadow-[0_0_18px_rgba(34,211,238,0.45)]"
          style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.size, height: node.size }}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.12),rgba(2,6,23,0.72))]" />
    </div>
  );
}

function GalaxyVisual({ model, large = false }: { model: GalaxySeedModel; large?: boolean }) {
  const arms = Array.from({ length: 5 }, (_, index) => ({
    rotate: index * 72 + seededRange(model.seedId, `galaxy-arm-${index}`, -10, 10),
    scale: 0.7 + seededRange(model.seedId, `galaxy-scale-${index}`, 0, 30) / 100
  }));

  return (
    <div className={cn("relative overflow-hidden border-cyan-300/10 bg-black", large ? "h-[clamp(18rem,42vh,26rem)] rounded-md border" : "h-36 border-b")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-85", galaxyVisual({ galaxy_type: model.galaxyClass } as GalaxyNode))} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.22),transparent_5%),radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.2),transparent_21%),radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.14),transparent_38%)]" />
      {arms.map((arm, index) => (
        <div
          key={index}
          className="absolute left-1/2 top-1/2 h-12 w-[58%] origin-left -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-100/45 via-cyan-300/12 to-transparent blur-sm"
          style={{ transform: `rotate(${arm.rotate}deg) scaleX(${arm.scale})` }}
        />
      ))}
      <div className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_60px_rgba(103,232,249,0.5)]", large ? "h-16 w-16" : "h-10 w-10")} />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.04),rgba(2,6,23,0.72))]" />
    </div>
  );
}

function systemDescription(card: StarSystemCardState) {
  const { system } = card;
  const stats = systemStats(card);
  const density = stats.planetCount >= 9 ? "high planet density" : stats.planetCount >= 5 ? "balanced planet density" : "sparse planet density";
  const risk = system.danger_level >= 70 ? "high exploration risk" : system.danger_level >= 40 ? "moderate exploration risk" : "low exploration risk";
  const outerBodies = stats.gasGiants.length || stats.beltCount ? "outer bodies contain orbital resource targets and possible anomalies" : "outer orbits are still awaiting survey resolution";
  return `${system.system_name} is a ${system.star_type.toLowerCase()} system with a ${stats.habitableZone.toLowerCase()} habitable zone, ${density}, and ${risk}. Its resource profile leans toward ${system.resource_bias.toLowerCase()}, while ${outerBodies}.`;
}

function DiscoveryProgress({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-900">
      <div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function DiscoveryStatusBadge({ state }: { state: DiscoveryState }) {
  return <Badge className={discoveryBadgeClass(state)}>{discoveryLabel(state)}</Badge>;
}

function DiscoveryLockedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-semibold leading-6 text-amber-100">
      {children}
    </div>
  );
}

function GatedButton({
  allowed,
  requirement,
  children,
  className,
  disabled,
  title,
  ...props
}: React.ComponentProps<typeof Button> & {
  allowed: boolean;
  requirement: string;
}) {
  return (
    <Button type="button" disabled={!allowed || disabled} title={allowed ? title : requirement} className={className} {...props}>
      {children}
    </Button>
  );
}

function BodyCard({ body, onOpen, onDelete }: { body: BodyCardState; onOpen: () => void; onDelete: () => void }) {
  const scanned = discoveryAtLeast(body.discoveryState, "scanned");
  const displayName = maskName(namedValue(body, body.name), body.discoveryState, "Detected Body");
  return (
    <article
      className="relative cursor-pointer overflow-hidden rounded-md border border-cyan-300/15 bg-genesis-panel/95 transition hover:border-cyan-300/55 hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]"
      onClick={onOpen}
    >
      <DeleteButton label={body.name} onDelete={onDelete} />
      {body.image_url ? (
        <div className="grid h-36 place-items-center overflow-hidden border-b border-cyan-300/10 bg-black p-4">
          <img className="h-28 max-h-full w-28 max-w-full object-contain" src={body.image_url} alt={`${body.name} render`} />
        </div>
      ) : (
        <CardImage variant={bodyVisual(body)} icon={body.celestial_body_type === "Moon" ? Orbit : Star} label={body.celestial_body_type} />
      )}
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{body.planet_class ?? body.celestial_body_type}</p>
          <h4 className="mt-2 truncate text-2xl font-bold text-white">{displayName}</h4>
          <p className="mt-1 truncate font-mono text-xs text-slate-500">{body.seed_id ?? body.id}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <DiscoveryStatusBadge state={body.discoveryState} />
            <span className="text-xs font-bold text-cyan-100">{body.discoveryPoints} pts</span>
          </div>
          <DiscoveryProgress value={body.scanProgress} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatChip label="System" value={body.assignedSystemName ?? body.orbit_parent ?? "Unassigned"} />
          <StatChip label="Orbit" value={body.orbitIndex ?? body.orbit_position ?? "Pending"} />
          <StatChip label="Subclass" value={scanned ? body.planet_subclass ?? "None" : "Scan Required"} />
          <StatChip label="Rarity" value={body.planet_rarity ?? "Body"} tone={rarityClasses[body.planet_rarity ?? ""]?.split(" ")[1]} />
          <StatChip label="Biome" value={scanned ? body.biome ?? "Unknown" : "Hidden"} />
          <StatChip label="Gravity" value={scanned ? body.gravity ?? "Unknown" : "Hidden"} />
        </div>
        <div className="flex flex-wrap gap-2">
          {body.landable ? <Badge className="border-emerald-300/45 text-emerald-100">Landable</Badge> : <Badge className="border-amber-300/45 text-amber-100">Not Landable</Badge>}
          {body.uses_orbital_gameplay ? <Badge className="border-cyan-300/45 text-cyan-100">Orbital World</Badge> : null}
        </div>
        <FactionBadges factions={body.factionPresence ?? (body.faction ? [body.faction] : [])} compact />
        <ColonyBadge colony={body.colony} compact />
      </div>
    </article>
  );
}

function BodyDetailOverlay({
  body,
  onClose,
  onScan,
  onClaim,
  onRename,
  progression
}: {
  body: BodyCardState;
  onClose: () => void;
  onScan: () => void;
  onClaim: () => void;
  onRename: (displayName: string) => void;
  progression: ProgressionApi;
}) {
  const assignment = [
    { label: "System", value: body.assignedSystemName ?? body.orbit_parent ?? "Unassigned" },
    { label: "Sector", value: body.assignedSectorName ?? "Unassigned" },
    { label: "Galaxy", value: body.assignedGalaxyName ?? "Unassigned" },
    { label: "Orbit", value: body.orbitIndex ?? body.orbit_position ?? "Pending" },
    { label: "Parent Star", value: body.parentStarClass ?? "Unknown" },
    { label: "Parent Star Seed", value: body.parentStarSeed ?? "Unknown" }
  ];
  const scanned = discoveryAtLeast(body.discoveryState, "scanned");
  const explored = discoveryAtLeast(body.discoveryState, "explored");
  const canSeeResources = explored || progression.canUseFeature("resource_scan");
  const displayName = maskName(namedValue(body, body.name), body.discoveryState, "Detected Body");

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/86 px-4 py-8 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-md border border-cyan-300/20 bg-genesis-panel/95 shadow-[0_0_50px_rgba(8,145,178,0.1)]" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-cyan-300/15 p-6">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-cyan-300/35 text-cyan-100">{body.planet_class ?? body.celestial_body_type}</Badge>
              <Badge className={rarityClasses[body.planet_rarity ?? ""] ?? "border-cyan-300/25 text-cyan-100"}>{body.planet_rarity ?? "Body"}</Badge>
              {body.is_fixed ? <Badge className="border-amber-300/45 text-amber-100">Fixed Sol Body</Badge> : null}
              <DiscoveryStatusBadge state={body.discoveryState} />
            </div>
            <h3 className="mt-3 text-4xl font-black text-white">{displayName}</h3>
            <p className="mt-2 font-mono text-sm text-slate-500">{body.seed_id ?? body.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="border-slate-600 bg-slate-900/70 text-slate-100"
              onClick={() => {
                const next = renamePrompt(displayName);
                if (next) onRename(next);
              }}
            >
              <Pencil className="h-4 w-4" />
              Rename
            </Button>
            <GatedButton allowed={progression.canScanPlanet()} requirement={progression.requirementText("planet_scan")} onClick={onScan}>
              <Sparkles className="h-4 w-4" />
              {scanned ? "Explore Planet" : "Scan Planet"}
            </GatedButton>
            {body.isClaimable ? (
              <GatedButton allowed={progression.canClaimPlanet() && progression.canColonizePlanet()} requirement={progression.canClaimPlanet() ? progression.requirementText("colonization") : progression.requirementText("claim_planet")} onClick={onClaim} className="border-emerald-300/35 bg-emerald-500/15 text-emerald-100">
                <Waypoints className="h-4 w-4" />
                {body.discoveryState === "colonized" ? "Colonized" : "Claim / Colonize"}
              </GatedButton>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
              aria-label="Close planet detail"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-5">
            <div className="grid min-h-80 place-items-center overflow-hidden rounded-md border border-cyan-300/10 bg-black p-6">
              {body.image_url ? (
                <img className="max-h-[28rem] max-w-full object-contain" src={body.image_url} alt={`${body.name} render`} />
              ) : (
                <div className="h-48 w-48 rounded-full border border-cyan-300/25" style={body.source_planet ? planetPlaceholderStyle(body.source_planet) : undefined} />
              )}
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-5">
              <p className="text-base font-semibold leading-8 text-slate-200">{scanned ? body.story ?? body.notes : "Long-range sensors have detected a body here. Scan it to resolve surface data, resources, and claim eligibility."}</p>
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                <span>{discoveryLabel(body.discoveryState)}</span>
                <span>{body.scanProgress}%</span>
              </div>
              <DiscoveryProgress value={body.scanProgress} />
              <p className="mt-3 text-sm font-semibold text-slate-300">Earned Discovery Points: {discoveryAtLeast(body.discoveryState, "scanned") ? body.discoveryPoints : 0}</p>
            </div>
          </div>
          <div className="space-y-4">
            <DetailSection title="Assignment">
              <div className="grid gap-3">
                {assignment.map((item) => (
                  <StatChip key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </DetailSection>
            <DetailSection title="Planet Specs">
              <div className="grid gap-3">
                <StatChip label="Subclass" value={scanned ? body.planet_subclass ?? "None" : "Scan Required"} />
                <StatChip label="Biome" value={scanned ? body.biome ?? "Unknown" : "Hidden"} />
                <StatChip label="Gravity" value={scanned ? body.gravity ?? "Unknown" : "Hidden"} />
                <StatChip label="Atmosphere" value={scanned ? body.atmosphere ?? "Unknown" : "Hidden"} />
                <StatChip label="Colonization" value={body.colonizable_status} />
                <StatChip label="Discovery Points" value={body.discoveryPoints} />
              </div>
            </DetailSection>
            <DetailSection title="Resources">
              {canSeeResources ? <ChipList values={body.resources} /> : <DiscoveryLockedPanel>{progression.requirementText("resource_scan")} or explore this body to unlock deeper resource details.</DiscoveryLockedPanel>}
            </DetailSection>
            <DetailSection title="Faction Presence">
              {body.factionPresence?.length || body.faction ? <FactionBadges factions={body.factionPresence ?? (body.faction ? [body.faction] : [])} /> : <p className="text-sm font-semibold text-slate-500">No faction presence detected.</p>}
            </DetailSection>
            <DetailSection title="Colony Summary">
              {body.colony ? (
                <div className="grid gap-3">
                  <StatChip label="Colony" value={body.colony.name} />
                  <StatChip label="Status" value={body.colony.status} />
                  <StatChip label="Population" value={body.colony.population.toLocaleString()} />
                  <StatChip label="Production" value={body.colony.productionRating} />
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-500">No colony founded on this world.</p>
              )}
            </DetailSection>
          </div>
        </div>
      </article>
      </div>
    </ModalPortal>
  );
}

function PlanetPickerCard({
  planet,
  selected,
  onToggle
}: {
  planet: GeneratedPlanet;
  selected: boolean;
  onToggle: () => void;
}) {
  const imageUrl = planetImageUrl(planet);

  return (
    <button
      type="button"
      className={cn(
        "group overflow-hidden rounded-md border bg-genesis-panel/95 text-left transition hover:border-cyan-300/60 hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]",
        selected ? "border-cyan-300/75 shadow-[0_0_28px_rgba(34,211,238,0.16)]" : "border-cyan-300/15"
      )}
      onClick={onToggle}
    >
      <div className="relative grid h-36 place-items-center overflow-hidden border-b border-cyan-300/10 bg-black p-4">
        {imageUrl ? (
          <img className="h-28 max-h-full w-28 max-w-full object-contain" src={imageUrl} alt={`${planet.name} render`} />
        ) : (
          <div className="h-24 w-24 rounded-full border border-cyan-300/25" style={planetPlaceholderStyle(planet)} />
        )}
        <span
          className={cn(
            "absolute right-3 top-3 rounded-md border px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em]",
            selected ? "border-cyan-200 bg-cyan-300/20 text-cyan-50" : "border-slate-500/50 bg-black/55 text-slate-300"
          )}
        >
          {selected ? "Selected" : "Available"}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="truncate text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{planet.planet_class}</p>
          <h4 className="mt-2 truncate text-xl font-bold text-white">{planet.name}</h4>
          <p className="mt-1 truncate font-mono text-xs text-slate-500">{planet.seed}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatChip label="Rarity" value={planet.rarity} tone={rarityClasses[planet.rarity]?.split(" ")[1]} />
          <StatChip label="Biome" value={planet.primary_biome} />
          <StatChip label="Subclass" value={planet.planet_subclass} />
          <StatChip label="Gravity" value={planet.gravity} />
        </div>
        <div className="space-y-1 text-xs text-slate-400">
          <p className="truncate">
            <span className="text-slate-500">Resources:</span> {planet.resources.join(", ")}
          </p>
          <p className="truncate">
            <span className="text-slate-500">Traits:</span> {planet.traits.join(", ")}
          </p>
        </div>
      </div>
    </button>
  );
}

function AssignedPlanetCard({ planet, onOpen, onUnassign }: { planet: AssignedPlanet; onOpen: () => void; onUnassign: () => void }) {
  const imageUrl = planetImageUrl(planet);
  const rarityClass = rarityClasses[planet.rarity] ?? "border-cyan-300/25 text-cyan-100";
  const discoveryState = normalizeDiscoveryState(planet.discoveryState, "detected");
  const scanned = discoveryAtLeast(discoveryState, "scanned");

  return (
    <article
      className="relative cursor-pointer overflow-hidden rounded-md border border-cyan-300/15 bg-genesis-panel/95 transition hover:border-cyan-300/55 hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]"
      onClick={onOpen}
    >
      <DeleteButton label={`Remove ${planet.name} from ${planet.starSystemName ?? "system"}`} onDelete={onUnassign} />
      <div className="grid h-36 place-items-center overflow-hidden border-b border-cyan-300/10 bg-black p-4">
        {imageUrl ? (
          <img className="h-28 max-h-full w-28 max-w-full object-contain" src={imageUrl} alt={`${planet.name} render`} />
        ) : (
          <div className="h-24 w-24 rounded-full border border-cyan-300/25" style={planetPlaceholderStyle(planet)} />
        )}
      </div>
      <div className="space-y-4 p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{planet.planet_class}</p>
            <Badge className={rarityClass}>{planet.rarity}</Badge>
            <DiscoveryStatusBadge state={discoveryState} />
          </div>
          <h4 className="mt-2 truncate text-2xl font-bold text-white">{maskName(namedValue(planet, planet.name), discoveryState, "Detected Planet")}</h4>
          <p className="mt-1 truncate font-mono text-xs text-slate-500">{planet.seed}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatChip label="System" value={planet.starSystemName ?? planet.star_system ?? "Unassigned"} />
          <StatChip label="Orbit" value={planet.orbitIndex ?? planet.orbit_position ?? "Pending"} />
          <StatChip label="Sector" value={planet.sectorName ?? planet.galaxy_sector ?? "Unassigned"} />
          <StatChip label="Galaxy" value={planet.galaxyName ?? "Unassigned"} />
          <StatChip label="Biome" value={scanned ? planet.primary_biome : "Hidden"} />
          <StatChip label="Parent Star" value={planet.parentStarClass ?? planet.star_type ?? "Unknown"} />
        </div>
        <div className="space-y-1 text-xs text-slate-400">
          <p className="truncate">
            <span className="text-slate-500">Resources:</span> {discoveryAtLeast(discoveryState, "explored") ? planet.resources.join(", ") : "Explore required"}
          </p>
          <p className="truncate">
            <span className="text-slate-500">Traits:</span> {planet.traits.join(", ")}
          </p>
        </div>
        <FactionBadges factions={planet.factionPresence ?? (planet.faction ? [planet.faction] : [])} compact />
        <ColonyBadge colony={planet.colony} compact />
      </div>
    </article>
  );
}

function AssignedPlanetDetailOverlay({
  planet,
  onClose,
  onScan,
  onClaim,
  onRename,
  progression
}: {
  planet: AssignedPlanet;
  onClose: () => void;
  onScan: () => void;
  onClaim: () => void;
  onRename: (displayName: string) => void;
  progression: ProgressionApi;
}) {
  return <BodyDetailOverlay body={planetToBodySnapshot(planet)} onClose={onClose} onScan={onScan} onClaim={onClaim} onRename={onRename} progression={progression} />;
}

function StarSystemCard({
  card,
  onOpen,
  onDelete
}: {
  card: StarSystemCardState;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const { system } = card;
  const model = systemSeedModel(card);
  const rarityClass = rarityClasses[model.rarity] ?? "border-cyan-300/25 text-cyan-100";
  const scanned = discoveryAtLeast(system.discoveryState, "scanned");

  return (
    <article
      className="group relative cursor-pointer overflow-hidden rounded-md border border-cyan-400/15 bg-[#07101e]/85 shadow-glow transition hover:border-cyan-300/55"
      onClick={onOpen}
    >
      <StarSystemVisual model={model} />
      <div className="border-b border-cyan-300/10 bg-slate-950/45 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">{model.type}</p>
            <h3 className="mt-1 truncate text-base font-bold text-white">{model.name}</h3>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
              <span className="min-w-0 truncate font-mono text-xs text-slate-500">{model.seedId}</span>
              <Badge className={rarityClass}>{model.rarity}</Badge>
              <DiscoveryStatusBadge state={system.discoveryState} />
            </div>
          </div>
          <div className="relative flex shrink-0 gap-2">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-md border border-red-300/20 text-red-200 opacity-80 transition hover:bg-red-400/10 group-hover:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              aria-label={`Delete ${model.name}`}
              title={`Delete ${model.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-3">
        <div className="grid grid-cols-3 gap-2">
          <CardStatChip label="Star Class" value={model.starClass} />
          <CardStatChip label="System Type" value={scanned ? model.systemType : "Signal"} />
          <CardStatChip label="Stability" value={scanned ? model.stability : "Scan Required"} tone={model.stability === "Collapsing" || model.stability === "Volatile" ? "text-red-200" : "text-slate-100"} />
        </div>
        <p className="line-clamp-2 text-xs leading-5 text-slate-300">{scanned ? model.description : "Detected stellar signal. Scan this star system to resolve orbital data."}</p>
        <div className="space-y-1 text-xs text-slate-400">
          <p className="truncate">
            <span className="text-slate-500">Resources:</span> {scanned ? cardList(model.resources) : "Hidden"}
          </p>
          <p className="truncate">
            <span className="text-slate-500">Traits:</span> {cardList(model.traits)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">{model.discoveryPoints} discovery pts</span>
        </div>
        <FactionBadges factions={card.factions} compact />
      </div>
    </article>
  );
}

function StarSystemDetailPanel({
  card,
  context,
  progression,
  planetPool,
  assignedPlanetIds,
  planetPoolLoading,
  planetPoolError,
  onClose,
  onDelete,
  onRenameSystem,
  onScanSystem,
  onGenerateBodies,
  onAddBody,
  onDeleteBody,
  onUnassignPlanet,
  onScanBody,
  onClaimBody,
  onRenameBody
}: {
  card: StarSystemCardState;
  context: AssignmentContext;
  progression: ProgressionApi;
  planetPool: GeneratedPlanet[];
  assignedPlanetIds: Set<string>;
  planetPoolLoading: boolean;
  planetPoolError: string;
  onClose: () => void;
  onDelete: () => void;
  onRenameSystem: (displayName: string) => void;
  onScanSystem: () => void;
  onGenerateBodies: () => void;
  onAddBody: (planetIds: string[]) => void;
  onDeleteBody: (bodyId: string) => void;
  onUnassignPlanet: (planetId: string) => void;
  onScanBody: (bodyId: string, source: "body" | "planet") => void;
  onClaimBody: (bodyId: string, source: "body" | "planet") => void;
  onRenameBody: (bodyId: string, source: "body" | "planet", displayName: string) => void;
}) {
  const { system } = card;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPlanetIds, setSelectedPlanetIds] = useState<string[]>([]);
  const [selectedBody, setSelectedBody] = useState<BodyCardState | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<AssignedPlanet | null>(null);
  const stats = systemStats(card);
  const model = systemSeedModel(card);
  const systemScanned = discoveryAtLeast(system.discoveryState, "scanned");
  const availablePlanets = planetPool.filter((planet) => !assignedPlanetIds.has(planet.id));
  const assignedPlanets = card.planets.map((planet) => hydrateAssignedPlanetArtwork(planet, planetPool));
  const assignedBodies = card.bodies.map((body) => hydrateBodyArtwork(body, planetPool));
  const composition = [
    { label: "Inner Planets", value: Math.min(stats.planetCount, 4) },
    { label: "Habitable Planets", value: stats.habitablePlanets.length },
    { label: "Gas Giants", value: stats.gasGiants.length },
    { label: "Ice Worlds", value: stats.iceWorlds.length },
    { label: "Asteroid Belts", value: stats.beltCount },
    { label: "Anomalies", value: stats.anomalyLike.length },
    { label: "Stations / Outposts", value: stats.stationLike.length },
    { label: "Colonized Worlds", value: stats.colonizedWorlds.length }
  ];

  return (
    <article className="overflow-hidden rounded-md border border-cyan-300/20 bg-genesis-panel/95 shadow-[0_0_50px_rgba(8,145,178,0.08)]">
      <header className="flex flex-col gap-5 border-b border-cyan-300/15 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="border-cyan-300/35 text-cyan-100">{model.type}</Badge>
            <Badge className={rarityClasses[model.rarity] ?? "border-cyan-300/25 text-cyan-100"}>{model.rarity}</Badge>
            {system.starting_system ? <Badge className="border-emerald-300/45 text-emerald-100">Starting</Badge> : null}
            {system.colonized_at || stats.colonizedWorlds.length ? <Badge className="border-emerald-300/45 text-emerald-100">Colonized</Badge> : null}
            {system.discovered || system.discovery_state !== "Undetected" ? <Badge className="border-cyan-300/45 text-cyan-100">Discovered</Badge> : null}
            <DiscoveryStatusBadge state={system.discoveryState} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{model.starClass}</p>
            <h2 className="mt-2 text-4xl font-black text-white">{model.name}</h2>
            <p className="mt-2 font-mono text-sm text-slate-500">{model.seedId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            className="border-slate-600 bg-slate-900/70 text-slate-100"
            onClick={() => {
              const next = renamePrompt(model.name);
              if (next) onRenameSystem(next);
            }}
          >
            <Pencil className="h-4 w-4" />
            Rename
          </Button>
          <GatedButton allowed={progression.canScanSystem()} requirement={progression.requirementText("system_scan")} onClick={onScanSystem}>
            <Sparkles className="h-4 w-4" />
            {systemScanned ? "Chart System" : "Scan Star System"}
          </GatedButton>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
            aria-label="Close star system detail"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="grid h-11 w-11 place-items-center rounded-md border border-red-300/25 bg-red-500/10 text-red-100 transition hover:border-red-200/60 hover:bg-red-500/20"
            aria-label={`Delete ${system.system_name}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="space-y-6 p-6">
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            <span>{discoveryLabel(system.discoveryState)}</span>
            <span>{system.scanProgress}%</span>
          </div>
          <DiscoveryProgress value={system.scanProgress} />
          <p className="mt-3 text-sm font-semibold text-slate-300">Earned Discovery Points: {systemScanned ? model.discoveryPoints : 0}</p>
        </div>
        {!systemScanned ? <DiscoveryLockedPanel>Scan this star system to reveal full stats, planets, moons, resources, and orbital hazards.</DiscoveryLockedPanel> : null}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
          <div className={cn("space-y-5", !systemScanned && "select-none blur-sm")}>
            <StarSystemVisual model={model} large />

            <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-5">
              <p className="text-base font-semibold leading-8 text-slate-200">{model.description}</p>
            </div>
          </div>

          <div className={cn("grid content-start gap-5 md:grid-cols-2 xl:grid-cols-1", !systemScanned && "select-none blur-sm")}>
            <DetailSection title="Resources">
              <ChipList values={model.resources} />
            </DetailSection>
            <DetailSection title="Hazards">
              <ChipList values={model.hazards} />
            </DetailSection>
            <DetailSection title="Traits">
              <ChipList values={model.traits} />
            </DetailSection>
            <DetailSection title="Anomalies">
              <ChipList values={model.anomalies} />
            </DetailSection>
            <DetailSection title="Modifiers">
              <ChipList values={model.modifiers} />
            </DetailSection>
            <DetailSection title="Collectibles">
              <ChipList values={model.collectibles} />
            </DetailSection>
            <DetailSection title="Weather / Space Conditions">
              <ChipList values={model.spaceConditions} />
            </DetailSection>
            <DetailSection title="Events">
              <ChipList values={model.events} />
            </DetailSection>
            <DetailSection title="Faction Presence">
              {card.factions.length ? <FactionBadges factions={card.factions} /> : <p className="text-sm font-semibold text-slate-500">No faction presence detected.</p>}
            </DetailSection>
          </div>
        </div>

        <div className={cn("grid gap-5 xl:grid-cols-2", !systemScanned && "select-none blur-sm")}>
          <DetailSection title="Star System Specs">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              <StatChip label="Star Class" value={model.starClass} />
              <StatChip label="System Type" value={model.systemType} />
              <StatChip label="Stability" value={model.stability} />
              <StatChip label="Planet Count" value={model.planetCount} />
              <StatChip label="Habitable Worlds" value={model.habitableWorlds} />
              <StatChip label="Gas Giants" value={model.gasGiants} />
              <StatChip label="Asteroid Belts" value={model.asteroidBelts} />
              <StatChip label="Radiation Level" value={model.radiationLevel} />
              <StatChip label="Resource Value" value={model.resourceValue} />
              <StatChip label="Discovery Points" value={model.discoveryPoints} />
              <StatChip label="Colonization Potential" value={model.colonizationPotential} />
              <StatChip label="Exploration Risk" value={model.explorationRisk} />
              <StatChip label="Anomaly Density" value={model.anomalyDensity} />
            </div>
          </DetailSection>

          <DetailSection title="System Composition">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {composition.map((item) => (
                <StatChip key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Colonization">
            <KeyValueGrid values={model.colonization} />
          </DetailSection>
          <DetailSection title="Science">
            <KeyValueGrid values={model.science} />
          </DetailSection>
          <DetailSection title="Economy">
            <KeyValueGrid values={model.economy} />
          </DetailSection>
          <DetailSection title="Visual Theme">
            <KeyValueGrid values={model.visualTheme} />
          </DetailSection>
        </div>
      </div>

      <section className="space-y-4 border-t border-cyan-300/15 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-black text-white">Celestial Bodies</h3>
            <p className="mt-1 text-sm font-semibold text-slate-400">Real assigned planets plus generated moons, asteroid belts, stations, and anomalies inside this star system.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <GatedButton allowed={progression.canScanSystem()} requirement={progression.requirementText("system_scan")} onClick={onGenerateBodies}>
              <Sparkles className="h-4 w-4" />
              Generate / Reveal Planets
            </GatedButton>
            <Button
              type="button"
              onClick={() => {
                setPickerOpen((current) => !current);
                setSelectedPlanetIds([]);
              }}
              className="border-slate-600 bg-slate-900/70 text-slate-100"
            >
              <CirclePlus className="h-4 w-4" />
              Add Planet
            </Button>
          </div>
        </div>
        {pickerOpen ? (
          <div className="space-y-4 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-xl font-black text-white">Available Generated Planets</h4>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  Choose planets that are not assigned to any star system in this workflow. They will be stamped into {context.system.system_name} with orbit and parent-star metadata.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={!selectedPlanetIds.length}
                  onClick={() => {
                    onAddBody(selectedPlanetIds);
                    setSelectedPlanetIds([]);
                    setPickerOpen(false);
                  }}
                >
                  <CirclePlus className="h-4 w-4" />
                  Add Selected to System
                </Button>
                <Button
                  type="button"
                  className="border-slate-600 bg-slate-900/70 text-slate-100"
                  onClick={() => {
                    setSelectedPlanetIds([]);
                    setPickerOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
            {planetPoolError ? <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-100">{planetPoolError}</p> : null}
            {planetPoolLoading ? <EmptyState>Loading generated planet cards...</EmptyState> : null}
            {!planetPoolLoading && availablePlanets.length ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {availablePlanets.map((planet) => (
                  <PlanetPickerCard
                    key={planet.id}
                    planet={planet}
                    selected={selectedPlanetIds.includes(planet.id)}
                    onToggle={() =>
                      setSelectedPlanetIds((current) => (current.includes(planet.id) ? current.filter((id) => id !== planet.id) : [...current, planet.id]))
                    }
                  />
                ))}
              </div>
            ) : null}
            {!planetPoolLoading && !availablePlanets.length ? <EmptyState>No unassigned generated planets are available. Generate more planets first.</EmptyState> : null}
          </div>
        ) : null}
        {assignedPlanets.length || assignedBodies.length ? (
          <div className={cn("grid gap-4 md:grid-cols-2 2xl:grid-cols-3", !systemScanned && "select-none blur-sm")}>
            {assignedPlanets.map((planet) => (
              <AssignedPlanetCard key={planet.id} planet={planet} onOpen={() => setSelectedPlanet(planet)} onUnassign={() => onUnassignPlanet(planet.id)} />
            ))}
            {assignedBodies.map((body) => (
              <BodyCard key={body.id} body={body} onOpen={() => setSelectedBody(body)} onDelete={() => onDeleteBody(body.id)} />
            ))}
          </div>
        ) : (
          <EmptyState>No planets yet. Generate planets to populate this star system.</EmptyState>
        )}
      </section>
      {selectedPlanet ? (
        <AssignedPlanetDetailOverlay
          planet={selectedPlanet}
          progression={progression}
          onClose={() => setSelectedPlanet(null)}
          onScan={() => {
            const scanned = scanBodyState(withDiscovery(selectedPlanet as unknown as Record<string, unknown>, normalizeDiscoveryState(selectedPlanet.discoveryState, "detected"), selectedPlanet.discoveryPoints ?? selectedPlanet.discovery_points ?? 120, selectedPlanet.colonizable)) as AssignedPlanet;
            setSelectedPlanet({ ...selectedPlanet, ...scanned });
            onScanBody(selectedPlanet.id, "planet");
          }}
          onRename={(displayName) => {
            setSelectedPlanet({ ...selectedPlanet, displayName, generatedName: selectedPlanet.generatedName ?? selectedPlanet.name });
            onRenameBody(selectedPlanet.id, "planet", displayName);
          }}
          onClaim={() => {
            const claimed = claimDiscovery(withDiscovery(selectedPlanet as unknown as Record<string, unknown>, normalizeDiscoveryState(selectedPlanet.discoveryState, "scanned"), selectedPlanet.discoveryPoints ?? selectedPlanet.discovery_points ?? 120, selectedPlanet.colonizable)) as AssignedPlanet;
            const colony = createColonyForBody(context, planetToBodySnapshot({ ...selectedPlanet, ...claimed } as AssignedPlanet));
            setSelectedPlanet({ ...selectedPlanet, ...claimed, colonized: true, colonizationStatus: "colonized", colonyId: colony.id, colony });
            onClaimBody(selectedPlanet.id, "planet");
          }}
        />
      ) : null}
      {selectedBody ? (
        <BodyDetailOverlay
          body={selectedBody}
          progression={progression}
          onClose={() => setSelectedBody(null)}
          onScan={() => {
            const scanned = scanBodyState(selectedBody);
            setSelectedBody(scanned);
            onScanBody(selectedBody.id, "body");
          }}
          onRename={(displayName) => {
            setSelectedBody({ ...selectedBody, displayName, generatedName: selectedBody.generatedName ?? selectedBody.name });
            onRenameBody(selectedBody.id, "body", displayName);
          }}
          onClaim={() => {
            const claimed = { ...claimDiscovery(selectedBody), colonizable_status: "Colonized" };
            const colony = createColonyForBody(context, claimed);
            setSelectedBody({ ...claimed, colonizationStatus: "colonized", colonyId: colony.id, colony });
            onClaimBody(selectedBody.id, "body");
          }}
        />
      ) : null}
    </article>
  );
}

function StarSystemDetailOverlay(props: {
  card: StarSystemCardState;
  context: AssignmentContext;
  progression: ProgressionApi;
  planetPool: GeneratedPlanet[];
  assignedPlanetIds: Set<string>;
  planetPoolLoading: boolean;
  planetPoolError: string;
  onClose: () => void;
  onDelete: () => void;
  onRenameSystem: (displayName: string) => void;
  onScanSystem: () => void;
  onGenerateBodies: () => void;
  onAddBody: (planetIds: string[]) => void;
  onDeleteBody: (bodyId: string) => void;
  onUnassignPlanet: (planetId: string) => void;
  onScanBody: (bodyId: string, source: "body" | "planet") => void;
  onClaimBody: (bodyId: string, source: "body" | "planet") => void;
  onRenameBody: (bodyId: string, source: "body" | "planet", displayName: string) => void;
}) {
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/82 px-4 py-8 backdrop-blur-sm"
        onClick={props.onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${props.card.system.system_name} star system details`}
      >
        <div className="mx-auto w-full max-w-[78rem]" onClick={(event) => event.stopPropagation()}>
          <StarSystemDetailPanel {...props} />
        </div>
      </div>
    </ModalPortal>
  );
}

function SectorCard({
  card,
  galaxy,
  progression,
  planetPool,
  assignedPlanetIds,
  planetPoolLoading,
  planetPoolError,
  open,
  onOpen,
  onRenameSector,
  onScanSector,
  onGenerateSystems,
  onAddSystem,
  onDelete,
  onDeleteSystem,
  onRenameSystem,
  onScanSystem,
  onGenerateBodies,
  onAddBody,
  onDeleteBody,
  onUnassignPlanet,
  onScanBody,
  onClaimBody,
  onRenameBody,
  openSystemId,
  setOpenSystemId
}: {
  card: SectorCardState;
  galaxy: GalaxyNode;
  progression: ProgressionApi;
  planetPool: GeneratedPlanet[];
  assignedPlanetIds: Set<string>;
  planetPoolLoading: boolean;
  planetPoolError: string;
  open: boolean;
  onOpen: () => void;
  onRenameSector: (displayName: string) => void;
  onScanSector: () => void;
  onGenerateSystems: () => void;
  onAddSystem: () => void;
  onDelete: () => void;
  onDeleteSystem: (systemId: string) => void;
  onRenameSystem: (systemId: string, displayName: string) => void;
  onScanSystem: (systemId: string) => void;
  onGenerateBodies: (systemId: string) => void;
  onAddBody: (systemId: string, planetIds: string[]) => void;
  onDeleteBody: (systemId: string, bodyId: string) => void;
  onUnassignPlanet: (systemId: string, planetId: string) => void;
  onScanBody: (systemId: string, bodyId: string, source: "body" | "planet") => void;
  onClaimBody: (systemId: string, bodyId: string, source: "body" | "planet") => void;
  onRenameBody: (systemId: string, bodyId: string, source: "body" | "planet", displayName: string) => void;
  openSystemId: string | null;
  setOpenSystemId: (systemId: string | null) => void;
}) {
  const { sector, systems } = card;
  const model = sectorSeedModel(card);
  const selectedSystem = systems.find((systemCard) => systemCard.system.id === openSystemId);
  const rarityClass = rarityClasses[model.rarity] ?? "border-cyan-300/25 text-cyan-100";
  const sectorScanned = discoveryAtLeast(sector.discoveryState, "scanned");

  return (
    <>
      <article
        className={cn("group relative cursor-pointer overflow-hidden rounded-md border bg-[#07101e]/85 shadow-glow transition hover:border-cyan-300/55", open ? "border-cyan-300/65" : "border-cyan-400/15")}
        onClick={onOpen}
      >
        <SectorVisual model={model} />
        <div className="border-b border-cyan-300/10 bg-slate-950/45 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">{model.type}</p>
              <h3 className="mt-1 truncate text-base font-bold text-white">{model.name}</h3>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                <span className="min-w-0 truncate font-mono text-xs text-slate-500">{model.seedId}</span>
                <Badge className={rarityClass}>{model.rarity}</Badge>
                <DiscoveryStatusBadge state={sector.discoveryState} />
              </div>
            </div>
            <div className="relative flex shrink-0 gap-2">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-md border border-red-300/20 text-red-200 opacity-80 transition hover:bg-red-400/10 group-hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                aria-label={`Delete ${model.name}`}
                title={`Delete ${model.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-3 p-3">
          <div className="grid grid-cols-3 gap-2">
            <CardStatChip label="Sector Class" value={model.sectorClass} />
            <CardStatChip label="System Density" value={model.systemDensity} />
            <CardStatChip label="Danger Level" value={model.dangerLevel} tone={model.dangerLevel === "High" || model.dangerLevel === "Extreme" ? "text-red-200" : "text-slate-100"} />
          </div>
          <p className="line-clamp-2 text-xs leading-5 text-slate-300">{model.description}</p>
          <div className="space-y-1 text-xs text-slate-400">
            <p className="truncate">
              <span className="text-slate-500">Resources:</span> {cardList(model.resources)}
            </p>
            <p className="truncate">
              <span className="text-slate-500">Traits:</span> {cardList(model.traits)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">{model.discoveryPoints} discovery pts</span>
          </div>
          <FactionBadges factions={card.factions} compact />
        </div>
      </article>
      {open ? (
        <ModalPortal>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/86 px-4 py-8 backdrop-blur-sm" onClick={onOpen} role="dialog" aria-modal="true" aria-label={`${model.name} sector details`}>
          <div className="mx-auto w-full max-w-6xl space-y-5 overflow-hidden rounded-md border border-cyan-300/20 bg-[#07101e]/95 p-5 shadow-[0_0_60px_rgba(8,47,73,0.5)]" onClick={(event) => event.stopPropagation()}>
          <header className="flex flex-col gap-4 border-b border-cyan-300/15 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="border-cyan-300/35 text-cyan-100">{model.type}</Badge>
                <Badge className={rarityClass}>{model.rarity}</Badge>
                <DiscoveryStatusBadge state={sector.discoveryState} />
              </div>
              <h2 className="mt-3 text-3xl font-black text-white">{model.name}</h2>
              <p className="mt-1 font-mono text-sm text-slate-500">{model.seedId}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="border-slate-600 bg-slate-900/70 text-slate-100"
                onClick={() => {
                  const next = renamePrompt(model.name);
                  if (next) onRenameSector(next);
                }}
              >
                <Pencil className="h-4 w-4" />
                Rename
              </Button>
              <GatedButton allowed={progression.canScanSector()} requirement={progression.requirementText("sector_scan")} onClick={onScanSector}>
                <Sparkles className="h-4 w-4" />
                {sectorScanned ? "Chart Sector" : "Scan Sector"}
              </GatedButton>
              <button
                type="button"
                onClick={onOpen}
                className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
                aria-label="Close sector detail"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>
          <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
              <span>{discoveryLabel(sector.discoveryState)}</span>
              <span>{sector.scanProgress}%</span>
            </div>
            <DiscoveryProgress value={sector.scanProgress} />
            <p className="mt-3 text-sm font-semibold text-slate-300">Earned Discovery Points: {sectorScanned ? model.discoveryPoints : 0}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="space-y-4">
              <SectorVisual model={model} large />
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
                <p className="text-sm font-semibold leading-7 text-slate-200">{model.description}</p>
              </div>
              <DetailSection title="Sector Specs">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <StatChip label="Sector Class" value={model.sectorClass} />
                  <StatChip label="System Density" value={model.systemDensity} />
                  <StatChip label="Coordinates" value={model.coordinates} />
                  <StatChip label="System Capacity" value={model.systemCapacity} />
                  <StatChip label="Generated Systems" value={model.generatedSystems} />
                  <StatChip label="Resource Bias" value={model.resourceBias} />
                  <StatChip label="Discovery Level" value={model.discoveryLevel} />
                  <StatChip label="Colonization Potential" value={model.colonizationPotential} />
                  <StatChip label="Trade Value" value={model.tradeValue} />
                  <StatChip label="Patrol Risk" value={model.patrolRisk} />
                  <StatChip label="Anomaly Density" value={model.anomalyDensity} />
                  <StatChip label="Danger Level" value={model.dangerLevel} />
                  <StatChip label="Discovery Points" value={model.discoveryPoints} />
                </div>
              </DetailSection>
            </div>
            <div className="space-y-4">
              <DetailSection title="Resources"><ChipList values={model.resources} /></DetailSection>
              <DetailSection title="Hazards"><ChipList values={model.hazards} /></DetailSection>
              <DetailSection title="Traits"><ChipList values={model.traits} /></DetailSection>
              <DetailSection title="Anomalies"><ChipList values={model.anomalies} /></DetailSection>
              <DetailSection title="Modifiers"><ChipList values={model.modifiers} /></DetailSection>
              <DetailSection title="Events"><ChipList values={model.events} /></DetailSection>
              <DetailSection title="Visual Theme"><KeyValueGrid values={model.visualTheme} /></DetailSection>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumbs items={["Galaxy", sector.sector_name, "Star Systems"]} />
            <div className="flex flex-wrap gap-2">
              <GatedButton allowed={progression.canScanSector()} requirement={progression.requirementText("sector_scan")} onClick={onScanSector}>
                <Sparkles className="h-4 w-4" />
                Scan Sector
              </GatedButton>
              <GatedButton allowed={progression.canScanSector()} requirement={progression.requirementText("sector_scan")} onClick={onGenerateSystems}>
                <Sparkles className="h-4 w-4" />
                Generate Star Systems
              </GatedButton>
              <Button type="button" onClick={onAddSystem} className="border-slate-600 bg-slate-900/70 text-slate-100">
                <CirclePlus className="h-4 w-4" />
                Add Star System
              </Button>
            </div>
          </div>
          {systems.length ? (
            <div className={cn("grid gap-4 md:grid-cols-2 2xl:grid-cols-3", !sectorScanned && "select-none blur-sm")}>
              {systems.map((systemCard) => (
                <StarSystemCard
                  key={systemCard.system.id}
                  card={systemCard}
                  onOpen={() => {
                    if (sectorScanned) setOpenSystemId(systemCard.system.id);
                  }}
                  onDelete={() => onDeleteSystem(systemCard.system.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No star systems yet. Generate star systems to populate this sector.</EmptyState>
          )}
          {!sectorScanned && systems.length ? <DiscoveryLockedPanel>Scan this sector to resolve star system cards and open individual system scans.</DiscoveryLockedPanel> : null}
          {selectedSystem ? (
            <StarSystemDetailOverlay
              card={selectedSystem}
              context={{ galaxy, sector, system: selectedSystem.system }}
              progression={progression}
              planetPool={planetPool}
              assignedPlanetIds={assignedPlanetIds}
              planetPoolLoading={planetPoolLoading}
              planetPoolError={planetPoolError}
              onClose={() => setOpenSystemId(null)}
              onDelete={() => {
                onDeleteSystem(selectedSystem.system.id);
                setOpenSystemId(null);
              }}
              onRenameSystem={(displayName) => onRenameSystem(selectedSystem.system.id, displayName)}
              onScanSystem={() => onScanSystem(selectedSystem.system.id)}
              onGenerateBodies={() => onGenerateBodies(selectedSystem.system.id)}
              onAddBody={(planetIds) => onAddBody(selectedSystem.system.id, planetIds)}
              onDeleteBody={(bodyId) => onDeleteBody(selectedSystem.system.id, bodyId)}
              onUnassignPlanet={(planetId) => onUnassignPlanet(selectedSystem.system.id, planetId)}
              onScanBody={(bodyId, source) => onScanBody(selectedSystem.system.id, bodyId, source)}
              onClaimBody={(bodyId, source) => onClaimBody(selectedSystem.system.id, bodyId, source)}
              onRenameBody={(bodyId, source, displayName) => onRenameBody(selectedSystem.system.id, bodyId, source, displayName)}
            />
      ) : null}
          </div>
        </div>
        </ModalPortal>
      ) : null}
    </>
  );
}

function GalaxyCard({
  card,
  progression,
  planetPool,
  assignedPlanetIds,
  planetPoolLoading,
  planetPoolError,
  open,
  onOpen,
  onUnlock,
  onGenerateSectors,
  onAddSector,
  onDelete,
  onDeleteSector,
  onRenameSector,
  onScanSector,
  onGenerateSystems,
  onAddSystem,
  onDeleteSystem,
  onRenameSystem,
  onScanSystem,
  onGenerateBodies,
  onAddBody,
  onDeleteBody,
  onUnassignPlanet,
  onScanBody,
  onClaimBody,
  onRenameBody,
  openSectorId,
  setOpenSectorId,
  openSystemId,
  setOpenSystemId
}: {
  card: GalaxyCardState;
  progression: ProgressionApi;
  planetPool: GeneratedPlanet[];
  assignedPlanetIds: Set<string>;
  planetPoolLoading: boolean;
  planetPoolError: string;
  open: boolean;
  onOpen: () => void;
  onUnlock: () => void;
  onGenerateSectors: () => void;
  onAddSector: () => void;
  onDelete: () => void;
  onDeleteSector: (sectorId: string) => void;
  onRenameSector: (sectorId: string, displayName: string) => void;
  onScanSector: (sectorId: string) => void;
  onGenerateSystems: (sectorId: string) => void;
  onAddSystem: (sectorId: string) => void;
  onDeleteSystem: (sectorId: string, systemId: string) => void;
  onRenameSystem: (sectorId: string, systemId: string, displayName: string) => void;
  onScanSystem: (sectorId: string, systemId: string) => void;
  onGenerateBodies: (sectorId: string, systemId: string) => void;
  onAddBody: (sectorId: string, systemId: string, planetIds: string[]) => void;
  onDeleteBody: (sectorId: string, systemId: string, bodyId: string) => void;
  onUnassignPlanet: (sectorId: string, systemId: string, planetId: string) => void;
  onScanBody: (sectorId: string, systemId: string, bodyId: string, source: "body" | "planet") => void;
  onClaimBody: (sectorId: string, systemId: string, bodyId: string, source: "body" | "planet") => void;
  onRenameBody: (sectorId: string, systemId: string, bodyId: string, source: "body" | "planet", displayName: string) => void;
  openSectorId: string | null;
  setOpenSectorId: (sectorId: string | null) => void;
  openSystemId: string | null;
  setOpenSystemId: (systemId: string | null) => void;
}) {
  const { galaxy, sectors } = card;
  const model = galaxySeedModel(card);
  const rarityClass = rarityClasses[model.rarity] ?? "border-cyan-300/25 text-cyan-100";
  const summary = explorationSummary(sectors);

  return (
    <>
      <article
        className={cn("group relative cursor-pointer overflow-hidden rounded-md border bg-[#07101e]/85 shadow-glow transition hover:border-cyan-300/55", open ? "border-cyan-300/65" : "border-cyan-400/15")}
        onClick={onOpen}
      >
        <GalaxyVisual model={model} />
        <div className="border-b border-cyan-300/10 bg-slate-950/45 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">{model.type}</p>
              <h3 className="mt-1 truncate text-base font-bold text-white">{model.name}</h3>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                <span className="min-w-0 truncate font-mono text-xs text-slate-500">{model.seedId}</span>
                <Badge className={rarityClass}>{model.rarity}</Badge>
                {galaxy.is_fixed ? <Badge className="border-amber-300/45 text-amber-100">Starting</Badge> : null}
                <Badge className={model.isUnlocked ? "border-emerald-300/45 text-emerald-100" : "border-slate-500/45 text-slate-300"}>{model.isUnlocked ? "Unlocked" : "Locked"}</Badge>
                <DiscoveryStatusBadge state={galaxy.discoveryState} />
              </div>
            </div>
            <div className="relative flex shrink-0 gap-2">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-md border border-red-300/20 text-red-200 opacity-80 transition hover:bg-red-400/10 group-hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                aria-label={`Delete ${model.name}`}
                title={`Delete ${model.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-3 p-3">
          <div className="grid grid-cols-3 gap-2">
            <CardStatChip label="Galaxy Class" value={model.galaxyClass} />
            <CardStatChip label="Galaxy Scale" value={model.galaxyScale} />
            <CardStatChip label="Discovery" value={model.discoveryPercentDisplay} />
          </div>
          <p className="line-clamp-2 text-xs leading-5 text-slate-300">{model.description}</p>
          <div className="space-y-1 text-xs text-slate-400">
            <p className="truncate">
              <span className="text-slate-500">Resources:</span> {cardList(model.resources)}
            </p>
            <p className="truncate">
              <span className="text-slate-500">Traits:</span> {cardList(model.traits)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">{formatNumber(model.discoveryPoints)} discovery pts</span>
          </div>
        </div>
      </article>
      {open ? (
        <ModalPortal>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/86 px-4 py-8 backdrop-blur-sm" onClick={onOpen} role="dialog" aria-modal="true" aria-label={`${model.name} galaxy details`}>
          <div className="mx-auto w-full max-w-6xl space-y-5 overflow-hidden rounded-md border border-cyan-300/20 bg-[#07101e]/95 p-5 shadow-[0_0_60px_rgba(8,47,73,0.5)]" onClick={(event) => event.stopPropagation()}>
          <header className="flex flex-col gap-4 border-b border-cyan-300/15 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="border-cyan-300/35 text-cyan-100">{model.type}</Badge>
                <Badge className={rarityClass}>{model.rarity}</Badge>
                {galaxy.is_fixed ? <Badge className="border-amber-300/45 text-amber-100">Starting</Badge> : null}
                <Badge className={model.isUnlocked ? "border-emerald-300/45 text-emerald-100" : "border-slate-500/45 text-slate-300"}>{model.isUnlocked ? "Unlocked" : "Locked"}</Badge>
                <DiscoveryStatusBadge state={galaxy.discoveryState} />
              </div>
              <h2 className="mt-3 text-3xl font-black text-white">{model.name}</h2>
              <p className="mt-1 font-mono text-sm text-slate-500">{model.seedId}</p>
            </div>
            <button
              type="button"
              onClick={onOpen}
              className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
              aria-label="Close galaxy detail"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="grid gap-3 md:grid-cols-4">
            <StatChip label="Detected Sectors" value={`${summary.detectedSectors} / ${summary.sectors}`} />
            <StatChip label="Scanned Systems" value={`${summary.scannedSystems} / ${summary.systems}`} />
            <StatChip label="Scanned Bodies" value={`${summary.scannedBodies} / ${summary.bodies}`} />
            <StatChip label="Earned Discovery Points" value={formatNumber(summary.discoveryPoints)} />
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="space-y-4">
              <GalaxyVisual model={model} large />
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
                <p className="text-sm font-semibold leading-7 text-slate-200">{model.description}</p>
              </div>
              <DetailSection title="Galaxy Specs">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <StatChip label="Galaxy Class" value={model.galaxyClass} />
                  <StatChip label="Galaxy Scale" value={model.galaxyScale} />
                  <StatChip label="System Capacity" value={model.theoreticalSystemCapacity} />
                  <StatChip label="Generated Sectors" value={model.generatedSectors} />
                  <StatChip label="Discovered Sectors" value={model.discoveredSectorCount} />
                  <StatChip label="Generated Systems" value={model.generatedSystemCount} />
                  <StatChip label="Discovered Systems" value={model.discoveredSystemCount} />
                  <StatChip label="Generated Planets" value={model.generatedPlanetCount} />
                  <StatChip label="Discovered Planets" value={model.discoveredPlanetCount} />
                  <StatChip label="Starting Sector" value={model.startingSector} />
                  <StatChip label="Resource Bias" value={model.resourceBias} />
                  <StatChip label="Civilization Presence" value={model.civilizationPresence} />
                  <StatChip label="Exploration Risk" value={model.explorationRisk} />
                  <StatChip label="Anomaly Density" value={model.anomalyDensity} />
                  <StatChip label="Estimated Bodies" value={model.estimatedBodies ? formatNumber(model.estimatedBodies) : "Pending"} />
                  <StatChip label="Discovery" value={model.discoveryPercentDisplay} />
                  <StatChip label="Discovery Points" value={formatNumber(model.discoveryPoints)} />
                </div>
              </DetailSection>
              <DetailSection title="Galaxy DNA">
                <KeyValueGrid
                  values={{
                    Age: model.galaxyDNA.age,
                    Metallicity: model.galaxyDNA.metallicity,
                    "Civilization Density": model.galaxyDNA.civilizationDensity,
                    "Anomaly Density": model.galaxyDNA.anomalyDensity,
                    "Resource Richness": model.galaxyDNA.resourceRichness,
                    Hostility: model.galaxyDNA.hostility,
                    "Terraform Difficulty": model.galaxyDNA.terraformDifficulty,
                    "Technology Level": model.galaxyDNA.technologyLevel,
                    "Dominant Star Types": model.galaxyDNA.dominantStarTypes.join(", "),
                    "Rare Phenomena": model.galaxyDNA.rarePhenomena.join(", "),
                    "Earthlike Chance": model.galaxyDNA.earthlikeWorldChance,
                    "Ruin Chance": model.galaxyDNA.ruinChance,
                    "Black Hole Chance": model.galaxyDNA.blackHoleChance
                  }}
                />
              </DetailSection>
            </div>
            <div className="space-y-4">
              <DetailSection title="Resources"><ChipList values={model.resources} /></DetailSection>
              <DetailSection title="Hazards"><ChipList values={model.hazards} /></DetailSection>
              <DetailSection title="Traits"><ChipList values={model.traits} /></DetailSection>
              <DetailSection title="Anomalies"><ChipList values={model.anomalies} /></DetailSection>
              <DetailSection title="Modifiers"><ChipList values={model.modifiers} /></DetailSection>
              <DetailSection title="Events"><ChipList values={model.events} /></DetailSection>
              <DetailSection title="Visual Theme"><KeyValueGrid values={model.visualTheme} /></DetailSection>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumbs items={["Universe", galaxy.name, "Sectors"]} />
            <div className="flex flex-wrap gap-2">
              {model.isUnlocked ? (
                <>
                  <Button type="button" onClick={model.isUnlimited ? onAddSector : onGenerateSectors}>
                    <Sparkles className="h-4 w-4" />
                    Generate New Sector
                  </Button>
                  <Button type="button" onClick={onAddSector} className="border-slate-600 bg-slate-900/70 text-slate-100">
                    <CirclePlus className="h-4 w-4" />
                    {isMilkyWay(galaxy) ? "Continue Exploring Milky Way" : "Continue Exploring Galaxy"}
                  </Button>
                  <GatedButton allowed={progression.canTravelIntergalactic()} requirement={progression.requirementText("intergalactic_travel")} onClick={onAddSector} className="border-violet-300/35 bg-violet-500/15 text-violet-100">
                    <Waypoints className="h-4 w-4" />
                    Intergalactic Travel
                  </GatedButton>
                </>
              ) : (
                <Button type="button" onClick={onUnlock} className="border-amber-300/30 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15">
                  <Sparkles className="h-4 w-4" />
                  Unlock Galaxy
                </Button>
              )}
            </div>
          </div>
          {!model.isUnlocked ? (
            <div className="rounded-md border border-amber-300/25 bg-amber-500/10 p-4 text-sm font-semibold leading-6 text-amber-100">
              {model.unlockRequirement}
            </div>
          ) : null}
          {sectors.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sectors.map((sectorCard) => (
                <SectorCard
                  key={sectorCard.sector.id}
                  card={sectorCard}
                  galaxy={galaxy}
                  progression={progression}
                  planetPool={planetPool}
                  assignedPlanetIds={assignedPlanetIds}
                  planetPoolLoading={planetPoolLoading}
                  planetPoolError={planetPoolError}
                  open={openSectorId === sectorCard.sector.id}
                  onOpen={() => setOpenSectorId(openSectorId === sectorCard.sector.id ? null : sectorCard.sector.id)}
                  onRenameSector={(displayName) => onRenameSector(sectorCard.sector.id, displayName)}
                  onScanSector={() => onScanSector(sectorCard.sector.id)}
                  onDelete={() => onDeleteSector(sectorCard.sector.id)}
                  onGenerateSystems={() => onGenerateSystems(sectorCard.sector.id)}
                  onAddSystem={() => onAddSystem(sectorCard.sector.id)}
                  onDeleteSystem={(systemId) => onDeleteSystem(sectorCard.sector.id, systemId)}
                  onRenameSystem={(systemId, displayName) => onRenameSystem(sectorCard.sector.id, systemId, displayName)}
                  onScanSystem={(systemId) => onScanSystem(sectorCard.sector.id, systemId)}
                  onGenerateBodies={(systemId) => onGenerateBodies(sectorCard.sector.id, systemId)}
                  onAddBody={(systemId, planetIds) => onAddBody(sectorCard.sector.id, systemId, planetIds)}
                  onDeleteBody={(systemId, bodyId) => onDeleteBody(sectorCard.sector.id, systemId, bodyId)}
                  onUnassignPlanet={(systemId, planetId) => onUnassignPlanet(sectorCard.sector.id, systemId, planetId)}
                  onScanBody={(systemId, bodyId, source) => onScanBody(sectorCard.sector.id, systemId, bodyId, source)}
                  onClaimBody={(systemId, bodyId, source) => onClaimBody(sectorCard.sector.id, systemId, bodyId, source)}
                  onRenameBody={(systemId, bodyId, source, displayName) => onRenameBody(sectorCard.sector.id, systemId, bodyId, source, displayName)}
                  openSystemId={openSystemId}
                  setOpenSystemId={setOpenSystemId}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No sectors yet. Generate sectors to populate this galaxy.</EmptyState>
          )}
          </div>
        </div>
        </ModalPortal>
      ) : null}
    </>
  );
}

function LayersIcon(props: React.ComponentProps<typeof Waypoints>) {
  return <Waypoints {...props} />;
}

function scanState(current: DiscoveryState, scannedNext: DiscoveryState = "scanned") {
  if (current === "undiscovered" || current === "detected") return scannedNext;
  if (current === "scanned") return "charted";
  if (current === "charted") return "explored";
  return current;
}

function scanDiscovery<T extends DiscoveryFields>(value: T, scannedNext: DiscoveryState = "scanned"): T {
  return withDiscoveredAt(value, scanState(value.discoveryState, scannedNext));
}

function scanBodyState<T extends DiscoveryFields>(value: T): T {
  return withDiscoveredAt(value, value.discoveryState === "scanned" || value.discoveryState === "charted" ? "explored" : "scanned");
}

function claimDiscovery<T extends DiscoveryFields>(value: T): T {
  return withDiscoveredAt({ ...value, isClaimable: true, isColonizable: true }, "colonized");
}

function logDiscoveryEntry(input: {
  objectId: string;
  objectType: DiscoveryObjectType;
  objectName: string;
  generatedName?: string;
  displayName?: string;
  discoveryState: DiscoveryState;
  discoveredAt?: string | null;
  discoveredBy?: string;
  discoveryPoints: number;
  galaxyId?: string;
  sectorId?: string;
  starSystemId?: string;
  rarity?: string;
  tags?: string[];
  notes?: string;
}) {
  upsertDiscoveryJournalEntry({
    objectId: input.objectId,
    objectType: input.objectType,
    objectName: input.objectName,
    generatedName: input.generatedName ?? input.objectName,
    displayName: input.displayName,
    discoveryState: input.discoveryState,
    discoveredAt: input.discoveredAt,
    discoveredBy: input.discoveredBy || "Studio Explorer",
    discoveryPoints: input.discoveryPoints,
    galaxyId: input.galaxyId,
    sectorId: input.sectorId,
    starSystemId: input.starSystemId,
    rarity: input.rarity,
    tags: input.tags,
    notes: input.notes
  });
}

function logTimeline(input: {
  eventType: TimelineEventType;
  title: string;
  description: string;
  relatedObjectId: string;
  relatedObjectType: DiscoveryObjectType;
  importance?: TimelineImportance;
  galaxyId?: string;
  sectorId?: string;
  starSystemId?: string;
  planetId?: string;
}) {
  appendTimelineEvent({
    eventType: input.eventType,
    title: input.title,
    description: input.description,
    galaxyId: input.galaxyId,
    sectorId: input.sectorId,
    starSystemId: input.starSystemId,
    planetId: input.planetId,
    relatedObjectId: input.relatedObjectId,
    relatedObjectType: input.relatedObjectType,
    importance: input.importance ?? "medium"
  });
}

function scanBodyInSystem(card: StarSystemCardState, bodyId: string, source: "body" | "planet") {
  if (source === "planet") {
    return {
      ...card,
      planets: card.planets.map((planet) => (planet.id === bodyId ? { ...planet, ...scanBodyState(withDiscovery(planet as unknown as Record<string, unknown>, normalizeDiscoveryState(planet.discoveryState, "detected"), planet.discoveryPoints ?? planet.discovery_points ?? 120, planet.colonizable)) } : planet))
    };
  }

  return {
    ...card,
    bodies: card.bodies.map((body) => (body.id === bodyId ? scanBodyState(body) : body))
  };
}

function claimBodyInSystem(card: StarSystemCardState, bodyId: string, source: "body" | "planet", colony?: ColonyRecord) {
  if (source === "planet") {
    return {
      ...card,
      planets: card.planets.map((planet) =>
        planet.id === bodyId
          ? {
              ...planet,
              ...claimDiscovery(withDiscovery(planet as unknown as Record<string, unknown>, normalizeDiscoveryState(planet.discoveryState, "scanned"), planet.discoveryPoints ?? planet.discovery_points ?? 120, planet.colonizable)),
              colonized: true,
              colonizationStatus: "colonized",
              colonyId: colony?.id,
              colony
            }
          : planet
      )
    };
  }

  return {
    ...card,
    bodies: card.bodies.map((body) => (body.id === bodyId ? { ...claimDiscovery(body), colonizable_status: "Colonized", colonizationStatus: "colonized", colonyId: colony?.id, colony } : body))
  };
}

function renameBodyInSystem(card: StarSystemCardState, bodyId: string, source: "body" | "planet", displayName: string) {
  if (source === "planet") {
    return {
      ...card,
      planets: card.planets.map((planet) => (planet.id === bodyId ? { ...planet, generatedName: planet.generatedName ?? planet.name, displayName } : planet))
    };
  }

  return {
    ...card,
    bodies: card.bodies.map((body) => (body.id === bodyId ? { ...body, generatedName: body.generatedName ?? body.name, displayName } : body))
  };
}

function bodyDiscoveryPoints(card: StarSystemCardState, bodyId: string, source: "body" | "planet") {
  if (source === "planet") {
    const planet = card.planets.find((item) => item.id === bodyId);
    if (!planet || discoveryAtLeast(normalizeDiscoveryState(planet.discoveryState, "detected"), "scanned")) return 0;
    return planet.discoveryPoints ?? planet.discovery_points ?? 120;
  }

  const body = card.bodies.find((item) => item.id === bodyId);
  if (!body || discoveryAtLeast(body.discoveryState, "scanned")) return 0;
  return body.discoveryPoints;
}

function logSectorDiscovery(galaxy: GalaxyNode, sector: SectorNode & DiscoveryFields, eventType: TimelineEventType = "sector_scanned") {
  const name = namedValue(sector, sector.sector_name);
  logDiscoveryEntry({
    objectId: sector.id,
    objectType: "sector",
    objectName: name,
    generatedName: sector.generatedName ?? sector.sector_name,
    displayName: sector.displayName,
    discoveryState: sector.discoveryState,
    discoveredAt: sector.discoveredAt,
    discoveredBy: sector.discoveredBy,
    discoveryPoints: sector.discoveryPoints,
    galaxyId: galaxy.id,
    rarity: sector.sector_rarity,
    tags: [sector.sector_type, sector.resource_signal],
    notes: `${name} belongs to ${galaxy.name}.`
  });
  logTimeline({
    eventType,
    title: `${name} ${eventType === "sector_detected" ? "Detected" : "Scanned"}`,
    description: `${name} advanced to ${discoveryLabel(sector.discoveryState)} in ${galaxy.name}.`,
    relatedObjectId: sector.id,
    relatedObjectType: "sector",
    galaxyId: galaxy.id,
    sectorId: sector.id,
    importance: sector.sector_rarity === "Legendary" || sector.sector_rarity === "Mythic" ? "legendary" : "medium"
  });
}

function logSystemDiscovery(galaxy: GalaxyNode, sector: SectorNode, system: LinkedStarSystemNode) {
  const name = namedValue(system, system.system_name);
  logDiscoveryEntry({
    objectId: system.id,
    objectType: "star_system",
    objectName: name,
    generatedName: system.generatedName ?? system.system_name,
    displayName: system.displayName,
    discoveryState: system.discoveryState,
    discoveredAt: system.discoveredAt,
    discoveredBy: system.discoveredBy,
    discoveryPoints: system.discoveryPoints,
    galaxyId: galaxy.id,
    sectorId: sector.id,
    rarity: system.system_rarity,
    tags: [system.star_type, system.system_type, system.resource_bias],
    notes: `${name} is linked to ${sector.sector_name}.`
  });
  logTimeline({
    eventType: "star_system_discovered",
    title: `${name} Discovered`,
    description: `${name} advanced to ${discoveryLabel(system.discoveryState)} in ${sector.sector_name}.`,
    relatedObjectId: system.id,
    relatedObjectType: "star_system",
    galaxyId: galaxy.id,
    sectorId: sector.id,
    starSystemId: system.id,
    importance: system.system_rarity === "Legendary" || system.system_rarity === "Mythic" || system.system_rarity === "Genesis" ? "legendary" : "medium"
  });
}

function logBodyDiscovery(context: AssignmentContext, body: BodyCardState, eventType: TimelineEventType, importance: TimelineImportance = "medium") {
  const objectType: DiscoveryObjectType = body.celestial_body_type === "Planet" ? "planet" : "celestial_body";
  const name = namedValue(body, body.name);
  logDiscoveryEntry({
    objectId: body.id,
    objectType,
    objectName: name,
    generatedName: body.generatedName ?? body.name,
    displayName: body.displayName,
    discoveryState: body.discoveryState,
    discoveredAt: body.discoveredAt,
    discoveredBy: body.discoveredBy,
    discoveryPoints: body.discoveryPoints,
    galaxyId: context.galaxy.id,
    sectorId: context.sector.id,
    starSystemId: context.system.id,
    rarity: body.planet_rarity ?? undefined,
    tags: [body.celestial_body_type, body.planet_class ?? "", body.biome ?? ""].filter(Boolean),
    notes: `${name} is orbiting ${context.system.system_name}.`
  });
  logTimeline({
    eventType,
    title: `${name} ${eventType === "planet_claimed" ? "Claimed" : eventType === "planet_colonized" ? "Colonized" : "Scanned"}`,
    description: `${name} advanced to ${discoveryLabel(body.discoveryState)} in ${context.system.system_name}.`,
    relatedObjectId: body.id,
    relatedObjectType: objectType,
    galaxyId: context.galaxy.id,
    sectorId: context.sector.id,
    starSystemId: context.system.id,
    planetId: objectType === "planet" ? body.id : undefined,
    importance
  });
  if (eventType === "planet_scanned" && ["Rare", "Epic", "Legendary", "Mythic", "Relic", "Genesis"].includes(body.planet_rarity ?? "")) {
    logTimeline({
      eventType: "rare_resource_found",
      title: `Rare Resource Signal Found on ${name}`,
      description: `${name} exposed a high-value resource signature: ${body.resources.slice(0, 3).join(", ") || "unclassified resource signal"}.`,
      relatedObjectId: body.id,
      relatedObjectType: objectType,
      galaxyId: context.galaxy.id,
      sectorId: context.sector.id,
      starSystemId: context.system.id,
      planetId: objectType === "planet" ? body.id : undefined,
      importance: body.planet_rarity === "Genesis" || body.planet_rarity === "Relic" || body.planet_rarity === "Mythic" ? "legendary" : "high"
    });
  }
}

function logFactionDiscovery(faction: FactionRecord) {
  upsertDiscoveredFaction(faction);
  upsertDiscoveryJournalEntry({
    objectId: faction.id,
    objectType: "faction",
    objectName: faction.name,
    generatedName: faction.name,
    discoveryState: faction.discoveryState,
    discoveredBy: "Studio Explorer",
    discoveryPoints: faction.type === "Ancient Remnant" || faction.type === "Alien Civilization" ? 750 : 350,
    galaxyId: faction.homeGalaxyId,
    sectorId: faction.homeSectorId,
    starSystemId: faction.homeStarSystemId,
    rarity: faction.technologyLevel,
    tags: [faction.type, faction.alignment, faction.disposition, faction.economyType],
    notes: faction.description
  });
  logTimeline({
    eventType: "faction_discovered",
    title: `${faction.name} Contacted`,
    description: faction.description,
    relatedObjectId: faction.id,
    relatedObjectType: "faction",
    galaxyId: faction.homeGalaxyId,
    sectorId: faction.homeSectorId,
    starSystemId: faction.homeStarSystemId,
    planetId: faction.homePlanetId,
    importance: faction.type === "Ancient Remnant" || faction.type === "Alien Civilization" || faction.type === "AI Collective" ? "high" : "medium"
  });
}

function createColonyForBody(context: AssignmentContext, body: BodyCardState) {
  return createColonyRecord({
    planetId: body.id,
    planetName: namedValue(body, body.name),
    galaxyId: context.galaxy.id,
    sectorId: context.sector.id,
    starSystemId: context.system.id,
    planetClass: body.planet_class,
    biome: body.biome,
    rarity: body.planet_rarity,
    gravity: body.gravity,
    atmosphere: body.atmosphere,
    temperature: body.source_planet?.temperature,
    resources: body.resources,
    resourceIds: body.source_planet?.resourceIds ?? (body as unknown as { resourceIds?: string[] }).resourceIds,
    hazards: body.source_planet?.hazards,
    colonizable: body.colonizable,
    landable: body.landable,
    faction: body.factionPresence?.[0] ?? body.faction
  });
}

function logColonyFounded(context: AssignmentContext, body: BodyCardState, colony: ColonyRecord) {
  upsertDiscoveredColony(colony);
  upsertDiscoveryJournalEntry({
    objectId: colony.id,
    objectType: "colony",
    objectName: colony.name,
    generatedName: colony.name,
    discoveryState: "colonized",
    discoveredBy: "Studio Explorer",
    discoveryPoints: Math.max(400, body.discoveryPoints + colony.colonyLevel * 120),
    galaxyId: context.galaxy.id,
    sectorId: context.sector.id,
    starSystemId: context.system.id,
    rarity: body.planet_rarity ?? colony.status,
    tags: ["Colony", colony.status, colony.ownerType, body.planet_class ?? "World"],
    notes: colony.description
  });
  logTimeline({
    eventType: "colony_founded",
    title: `${colony.name} Founded`,
    description: `${colony.name} was founded on ${namedValue(body, body.name)} with ${colony.population.toLocaleString()} settlers.`,
    relatedObjectId: colony.id,
    relatedObjectType: "colony",
    galaxyId: context.galaxy.id,
    sectorId: context.sector.id,
    starSystemId: context.system.id,
    planetId: body.id,
    importance: colony.status === "growing" || colony.colonyLevel > 1 ? "high" : "medium"
  });
}

function factionForSystem(context: AssignmentContext, system: LinkedStarSystemNode) {
  return generateFaction({
    galaxyId: context.galaxy.id,
    sectorId: context.sector.id,
    starSystemId: system.id,
    systemName: system.system_name,
    rarity: system.system_rarity,
    resourceBias: system.resource_bias,
    dangerLevel: system.danger_level
  });
}

function factionForBody(context: AssignmentContext, body: BodyCardState) {
  return generateFaction({
    galaxyId: context.galaxy.id,
    sectorId: context.sector.id,
    starSystemId: context.system.id,
    planetId: body.id,
    systemName: context.system.system_name,
    planetName: body.name,
    rarity: body.planet_rarity ?? undefined,
    resourceBias: body.resources[0],
    dangerLevel: body.planet_class === "Lava" || body.planet_class === "Void" ? 75 : 25
  });
}

function addFactionToSystem(card: StarSystemCardState, faction: FactionRecord | null) {
  if (!faction || card.factions.some((row) => row.id === faction.id)) return card;
  return {
    ...card,
    system: {
      ...card.system,
      factionIds: [...(card.system.factionIds ?? []), faction.id],
      factionPresence: [...(card.system.factionPresence ?? []), faction]
    },
    factions: [...card.factions, faction]
  };
}

function mergeFactionList(factions: FactionRecord[], faction: FactionRecord | null) {
  if (!faction || factions.some((row) => row.id === faction.id)) return factions;
  return [...factions, faction];
}

function attachFactionToBody(card: StarSystemCardState, bodyId: string, source: "body" | "planet", faction: FactionRecord | null) {
  const withSystemFaction = addFactionToSystem(card, faction);
  if (!faction) return withSystemFaction;

  if (source === "planet") {
    return {
      ...withSystemFaction,
      planets: withSystemFaction.planets.map((planet) =>
        planet.id === bodyId
          ? { ...planet, faction, factionIds: [...(planet.factionIds ?? []), faction.id], factionPresence: [...(planet.factionPresence ?? []), faction] }
          : planet
      )
    };
  }

  return {
    ...withSystemFaction,
    bodies: withSystemFaction.bodies.map((body) =>
      body.id === bodyId
        ? { ...body, faction, factionIds: [...(body.factionIds ?? []), faction.id], factionPresence: [...(body.factionPresence ?? []), faction] }
        : body
    )
  };
}

export function GalaxyGeneratorWorkflow() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [count, setCount] = useState(2);
  const [type, setType] = useState("Any");
  const [size, setSize] = useState("Any");
  const [galaxies, setGalaxies] = useState<GalaxyCardState[]>(() => defaultGalaxyCards(DEFAULT_UNIVERSE_SEED));
  const [openGalaxyId, setOpenGalaxyId] = useState<string | null>(null);
  const [openSectorId, setOpenSectorId] = useState<string | null>(null);
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const progression = usePlayerProgression();
  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const planetPool = useGeneratedPlanetPool();
  const assignedPlanetIds = useMemo(() => assignedPlanetIdsInGalaxies(galaxies), [galaxies]);

  function generateGalaxyCards() {
    const next = Array.from({ length: Math.max(1, count) }, (_, index) => {
      const galaxy = createExpansionGalaxy(universe.universe_seed, index);
      return toGalaxyState(galaxy.is_fixed ? galaxy : applyGalaxyBias(galaxy, type, size));
    });
    setGalaxies(next);
    setOpenGalaxyId(null);
    setOpenSectorId(null);
    setOpenSystemId(null);
  }

  function updateGalaxy(galaxyId: string, updater: (card: GalaxyCardState) => GalaxyCardState) {
    setGalaxies((current) => current.map((card) => (card.galaxy.id === galaxyId ? updater(card) : card)));
  }

  function generateSectorsForGalaxy(galaxyId: string, append = false) {
    updateGalaxy(galaxyId, (card) => {
      if (card.galaxy.is_unlocked === false) return card;
      const startIndex = append ? card.sectors.length : 0;
      const batchSize = card.galaxy.is_unlimited ? 1 : 6;
      const generated = Array.from({ length: batchSize }, (_, index) => {
        const sectorIndex = startIndex + index;
        return toSectorState(normalizeGalaxySector(card.galaxy, generateSector(card.galaxy, sectorIndex), sectorIndex), card.galaxy);
      });
      return {
        ...card,
        galaxy: withDiscoveredAt(card.galaxy, card.galaxy.discoveryState === "undiscovered" ? "detected" : card.galaxy.discoveryState),
        sectors: append ? [...card.sectors, ...generated] : generated
      };
    });
  }

  function scanSectorInGalaxy(galaxyId: string, sectorId: string) {
    if (!progression.canScanSector()) return;
    const sectorCard = galaxies.find((card) => card.galaxy.id === galaxyId)?.sectors.find((sector) => sector.sector.id === sectorId);
    const galaxyCard = galaxies.find((card) => card.galaxy.id === galaxyId);
    if (sectorCard && galaxyCard && !discoveryAtLeast(sectorCard.sector.discoveryState, "scanned")) {
      progression.awardDiscovery("sector", sectorCard.sector.discoveryPoints);
      logSectorDiscovery(galaxyCard.galaxy, scanDiscovery(sectorCard.sector));
    }
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sectorCard) => (sectorCard.sector.id === sectorId ? { ...sectorCard, sector: scanDiscovery(sectorCard.sector) } : sectorCard))
    }));
  }

  function generateSystemsForSector(galaxyId: string, sectorId: string, append = false) {
    if (!progression.canScanSector()) return;
    const sectorCard = galaxies.find((card) => card.galaxy.id === galaxyId)?.sectors.find((sector) => sector.sector.id === sectorId);
    const galaxyCard = galaxies.find((card) => card.galaxy.id === galaxyId);
    if (sectorCard && galaxyCard && !discoveryAtLeast(sectorCard.sector.discoveryState, "scanned")) {
      progression.awardDiscovery("sector", sectorCard.sector.discoveryPoints);
      logSectorDiscovery(galaxyCard.galaxy, scanDiscovery(sectorCard.sector));
    }
    updateGalaxy(galaxyId, (galaxyCard) => ({
      ...galaxyCard,
      sectors: galaxyCard.sectors.map((sectorCard) => {
        if (sectorCard.sector.id !== sectorId) return sectorCard;
        const startIndex = append ? sectorCard.systems.length : 0;
        const generated = Array.from({ length: 6 }, (_, index) => {
          const systemIndex = startIndex + index;
          return toSystemState(normalizeGalaxySystem(sectorCard.sector, generateStarSystem(sectorCard.sector, systemIndex), systemIndex), galaxyCard.galaxy, sectorCard.sector);
        });
        return { ...sectorCard, sector: scanDiscovery(sectorCard.sector), systems: append ? [...sectorCard.systems, ...generated] : generated };
      })
    }));
  }

  function scanSystemInGalaxy(galaxyId: string, sectorId: string, systemId: string) {
    if (!progression.canScanSystem()) return;
    const galaxyCard = galaxies.find((card) => card.galaxy.id === galaxyId);
    const sectorCard = galaxyCard?.sectors.find((sector) => sector.sector.id === sectorId);
    const systemCard = sectorCard?.systems.find((system) => system.system.id === systemId);
    const context = galaxyCard && sectorCard && systemCard ? { galaxy: galaxyCard.galaxy, sector: sectorCard.sector, system: systemCard.system } : null;
    const faction = context && systemCard && !discoveryAtLeast(systemCard.system.discoveryState, "scanned") ? factionForSystem(context, systemCard.system) : null;
    if (galaxyCard && sectorCard && systemCard && !discoveryAtLeast(systemCard.system.discoveryState, "scanned")) {
      progression.awardDiscovery("system", systemCard.system.discoveryPoints);
      logSystemDiscovery(galaxyCard.galaxy, sectorCard.sector, scanDiscovery(systemCard.system));
      if (faction) logFactionDiscovery(faction);
    }
    updateGalaxy(galaxyId, (galaxyCard) => ({
      ...galaxyCard,
      sectors: galaxyCard.sectors.map((sectorCard) => ({
        ...sectorCard,
        factions: sectorCard.sector.id === sectorId ? mergeFactionList(sectorCard.factions, faction) : sectorCard.factions,
        systems: sectorCard.sector.id === sectorId ? sectorCard.systems.map((systemCard) => (systemCard.system.id === systemId ? addFactionToSystem({ ...systemCard, system: scanDiscovery(systemCard.system) }, faction) : systemCard)) : sectorCard.systems
      }))
    }));
  }

  function unlockGalaxy(galaxyId: string) {
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      galaxy: {
        ...card.galaxy,
        is_unlocked: true,
        discovery_state: "Unlocked",
        discovery_percent_display: card.sectors.length ? card.galaxy.discovery_percent_display : "0%"
      }
    }));
  }

  function generateBodiesForSystem(galaxyId: string, sectorId: string, systemId: string, append = false) {
    if (!progression.canScanSystem()) return;
    const galaxyCard = galaxies.find((card) => card.galaxy.id === galaxyId);
    const sectorCard = galaxyCard?.sectors.find((sector) => sector.sector.id === sectorId);
    const systemCard = sectorCard?.systems.find((system) => system.system.id === systemId);
    const context = galaxyCard && sectorCard && systemCard ? { galaxy: galaxyCard.galaxy, sector: sectorCard.sector, system: systemCard.system } : null;
    const faction = context && systemCard && !discoveryAtLeast(systemCard.system.discoveryState, "scanned") ? factionForSystem(context, systemCard.system) : null;
    if (galaxyCard && sectorCard && systemCard && !discoveryAtLeast(systemCard.system.discoveryState, "scanned")) {
      progression.awardDiscovery("system", systemCard.system.discoveryPoints);
      logSystemDiscovery(galaxyCard.galaxy, sectorCard.sector, scanDiscovery(systemCard.system));
      if (faction) logFactionDiscovery(faction);
    }
    updateGalaxy(galaxyId, (galaxyCard) => ({
      ...galaxyCard,
      sectors: galaxyCard.sectors.map((sectorCard) => ({
        ...sectorCard,
        factions: sectorCard.sector.id === sectorId ? mergeFactionList(sectorCard.factions, faction) : sectorCard.factions,
        systems: sectorCard.sector.id === sectorId
          ? sectorCard.systems.map((systemCard) => {
              if (systemCard.system.id !== systemId) return systemCard;
              const context = { galaxy: galaxyCard.galaxy, sector: sectorCard.sector, system: systemCard.system };
              const bodies = generateCelestialBodies(systemCard.system)
                .filter((body) => !["Star", "Planet"].includes(body.celestial_body_type))
                .map((body, index) => withAssignment(body, context, body.orbit_position ?? index + 1, undefined));
              return addFactionToSystem({ ...systemCard, system: scanDiscovery(systemCard.system), bodies: append ? [...systemCard.bodies, ...bodies.slice(systemCard.bodies.length, systemCard.bodies.length + 1)] : bodies }, faction);
            })
          : sectorCard.systems
      }))
    }));
  }

  function scanBodyInGalaxy(galaxyId: string, sectorId: string, systemId: string, bodyId: string, source: "body" | "planet") {
    if (!progression.canScanPlanet()) return;
    const galaxyCard = galaxies.find((card) => card.galaxy.id === galaxyId);
    const sectorCard = galaxyCard?.sectors.find((sector) => sector.sector.id === sectorId);
    const systemCard = sectorCard?.systems.find((system) => system.system.id === systemId);
    const points = systemCard ? bodyDiscoveryPoints(systemCard, bodyId, source) : 0;
    const context = galaxyCard && sectorCard && systemCard ? { galaxy: galaxyCard.galaxy, sector: sectorCard.sector, system: systemCard.system } : null;
    const currentBody = source === "planet" ? systemCard?.planets.find((planet) => planet.id === bodyId) : systemCard?.bodies.find((body) => body.id === bodyId);
    const scannedBody = currentBody ? scanBodyState(source === "planet" ? planetToBodySnapshot(currentBody as AssignedPlanet) : (currentBody as BodyCardState)) : null;
    const faction = context && scannedBody && points ? factionForBody(context, scannedBody) : null;
    if (points && galaxyCard && sectorCard && systemCard) {
      progression.awardDiscovery("planet", points);
      if (scannedBody) logBodyDiscovery({ galaxy: galaxyCard.galaxy, sector: sectorCard.sector, system: systemCard.system }, scannedBody, "planet_scanned");
      if (faction) logFactionDiscovery(faction);
    }
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sector) => ({
        ...sector,
        factions: sector.sector.id === sectorId ? mergeFactionList(sector.factions, faction) : sector.factions,
        systems: sector.sector.id === sectorId ? sector.systems.map((system) => (system.system.id === systemId ? attachFactionToBody(scanBodyInSystem(system, bodyId, source), bodyId, source, faction) : system)) : sector.systems
      }))
    }));
  }

  function claimBodyInGalaxy(galaxyId: string, sectorId: string, systemId: string, bodyId: string, source: "body" | "planet") {
    if (!progression.canClaimPlanet() || !progression.canColonizePlanet()) return;
    progression.recordClaim();
    progression.recordColonization();
    const galaxyCard = galaxies.find((card) => card.galaxy.id === galaxyId);
    const sectorCard = galaxyCard?.sectors.find((sector) => sector.sector.id === sectorId);
    const systemCard = sectorCard?.systems.find((system) => system.system.id === systemId);
    const currentBody = source === "planet" ? systemCard?.planets.find((planet) => planet.id === bodyId) : systemCard?.bodies.find((body) => body.id === bodyId);
    let colony: ColonyRecord | undefined;
    if (galaxyCard && sectorCard && systemCard && currentBody) {
      const context = { galaxy: galaxyCard.galaxy, sector: sectorCard.sector, system: systemCard.system };
      const claimed = claimDiscovery(source === "planet" ? planetToBodySnapshot(currentBody as AssignedPlanet) : (currentBody as BodyCardState));
      colony = createColonyForBody(context, claimed);
      const claimedWithColony = { ...claimed, colonizable_status: "Colonized", colonizationStatus: "colonized", colonyId: colony.id, colony };
      logBodyDiscovery(context, claimedWithColony, "planet_claimed", "high");
      logBodyDiscovery(context, claimedWithColony, "planet_colonized", "high");
      logColonyFounded(context, claimedWithColony, colony);
    }
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sector) => ({
        ...sector,
        systems: sector.sector.id === sectorId ? sector.systems.map((system) => (system.system.id === systemId ? claimBodyInSystem(system, bodyId, source, colony) : system)) : sector.systems
      }))
    }));
  }

  function deleteGalaxy(galaxyId: string) {
    const galaxy = galaxies.find((card) => card.galaxy.id === galaxyId);
    if (!galaxy || !window.confirm(`Delete ${galaxy.galaxy.name} and all generated sectors/star systems inside it?`)) return;
    setGalaxies((current) => current.filter((card) => card.galaxy.id !== galaxyId));
  }

  function deleteSector(galaxyId: string, sectorId: string) {
    const galaxy = galaxies.find((card) => card.galaxy.id === galaxyId);
    const sector = galaxy?.sectors.find((card) => card.sector.id === sectorId);
    if (!sector || !window.confirm(`Delete ${sector.sector.sector_name} and all generated star systems inside it?`)) return;
    updateGalaxy(galaxyId, (card) => ({ ...card, sectors: card.sectors.filter((item) => item.sector.id !== sectorId) }));
  }

  function deleteSystem(galaxyId: string, sectorId: string, systemId: string) {
    const galaxy = galaxies.find((card) => card.galaxy.id === galaxyId);
    const sector = galaxy?.sectors.find((card) => card.sector.id === sectorId);
    const system = sector?.systems.find((card) => card.system.id === systemId);
    if (!system || !window.confirm(`Delete ${system.system.system_name} and all generated planets/bodies inside it?`)) return;
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((item) => (item.sector.id === sectorId ? { ...item, systems: item.systems.filter((systemCard) => systemCard.system.id !== systemId) } : item))
    }));
  }

  function deleteBody(galaxyId: string, sectorId: string, systemId: string, bodyId: string) {
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sector) => ({
        ...sector,
        systems: sector.sector.id === sectorId
          ? sector.systems.map((system) => (system.system.id === systemId ? { ...system, bodies: system.bodies.filter((body) => body.id !== bodyId) } : system))
          : sector.systems
      }))
    }));
  }

  function unassignPlanet(galaxyId: string, sectorId: string, systemId: string, planetId: string) {
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sector) => ({
        ...sector,
        systems: sector.sector.id === sectorId ? sector.systems.map((system) => (system.system.id === systemId ? removePlanetFromSystem(system, planetId) : system)) : sector.systems
      }))
    }));
  }

  function renameSectorInGalaxy(galaxyId: string, sectorId: string, displayName: string) {
    renameDiscoveryObject(sectorId, "sector", displayName);
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sector) => (sector.sector.id === sectorId ? { ...sector, sector: { ...sector.sector, generatedName: sector.sector.generatedName ?? sector.sector.sector_name, displayName } } : sector))
    }));
  }

  function renameSystemInGalaxy(galaxyId: string, sectorId: string, systemId: string, displayName: string) {
    renameDiscoveryObject(systemId, "star_system", displayName);
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sector) => ({
        ...sector,
        systems: sector.sector.id === sectorId ? sector.systems.map((system) => (system.system.id === systemId ? { ...system, system: { ...system.system, generatedName: system.system.generatedName ?? system.system.system_name, displayName } } : system)) : sector.systems
      }))
    }));
  }

  function renameBodyInGalaxy(galaxyId: string, sectorId: string, systemId: string, bodyId: string, source: "body" | "planet", displayName: string) {
    renameDiscoveryObject(bodyId, source === "planet" ? "planet" : "celestial_body", displayName);
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sector) => ({
        ...sector,
        systems: sector.sector.id === sectorId ? sector.systems.map((system) => (system.system.id === systemId ? renameBodyInSystem(system, bodyId, source, displayName) : system)) : sector.systems
      }))
    }));
  }

  function addPlanetsToSystem(galaxyId: string, sectorId: string, systemId: string, planetIds: string[]) {
    updateGalaxy(galaxyId, (galaxyCard) => ({
      ...galaxyCard,
      sectors: galaxyCard.sectors.map((sectorCard) => ({
        ...sectorCard,
        systems:
          sectorCard.sector.id === sectorId
            ? sectorCard.systems.map((systemCard) =>
                systemCard.system.id === systemId
                  ? addGeneratedPlanetsToSystem(systemCard, { galaxy: galaxyCard.galaxy, sector: sectorCard.sector, system: systemCard.system }, planetPool.planets, planetIds)
                  : systemCard
              )
            : sectorCard.systems
      }))
    }));
  }

  const visibleGalaxies = galaxies.filter((card) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const model = galaxySeedModel(card);
    return [model.name, model.seedId, model.type, model.rarity, model.galaxyClass, model.galaxyScale, model.description].some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <GeneratorShell
      eyebrow="Universe Workflow"
      title="Galaxies"
      description="Generate visual galaxy cards, drill into sectors, and shape the content hierarchy before it moves into the game app."
      actions={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_6rem_11rem_10rem_auto] xl:items-center">
          <HeaderTextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="Universe seed" />
          <HeaderTextInput label="Galaxy Count" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <HeaderSelectInput label="Galaxy Type" value={type} options={galaxyTypes} onChange={setType} />
          <HeaderSelectInput label="Galaxy Size" value={size} options={galaxySizes} onChange={setSize} />
          <Button type="button" onClick={generateGalaxyCards} className="h-11 px-5">
            <Plus className="h-4 w-4" />
            Generate Galaxies
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 sm:flex-row sm:items-center">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          placeholder="Search galaxies"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <ProgressionGatePanel progression={progression} />

      {visibleGalaxies.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleGalaxies.map((card) => (
            <GalaxyCard
              key={card.galaxy.id}
              card={card}
              progression={progression}
              planetPool={planetPool.planets}
              assignedPlanetIds={assignedPlanetIds}
              planetPoolLoading={planetPool.loading}
              planetPoolError={planetPool.error}
              open={openGalaxyId === card.galaxy.id}
              onOpen={() => setOpenGalaxyId(openGalaxyId === card.galaxy.id ? null : card.galaxy.id)}
              onUnlock={() => unlockGalaxy(card.galaxy.id)}
              onDelete={() => deleteGalaxy(card.galaxy.id)}
              onRenameSector={(sectorId, displayName) => renameSectorInGalaxy(card.galaxy.id, sectorId, displayName)}
              onScanSector={(sectorId) => scanSectorInGalaxy(card.galaxy.id, sectorId)}
              onGenerateSectors={() => generateSectorsForGalaxy(card.galaxy.id)}
              onAddSector={() => generateSectorsForGalaxy(card.galaxy.id, true)}
              onDeleteSector={(sectorId) => deleteSector(card.galaxy.id, sectorId)}
              onGenerateSystems={(sectorId) => generateSystemsForSector(card.galaxy.id, sectorId)}
              onAddSystem={(sectorId) => generateSystemsForSector(card.galaxy.id, sectorId, true)}
              onDeleteSystem={(sectorId, systemId) => deleteSystem(card.galaxy.id, sectorId, systemId)}
              onRenameSystem={(sectorId, systemId, displayName) => renameSystemInGalaxy(card.galaxy.id, sectorId, systemId, displayName)}
              onScanSystem={(sectorId, systemId) => scanSystemInGalaxy(card.galaxy.id, sectorId, systemId)}
              onGenerateBodies={(sectorId, systemId) => generateBodiesForSystem(card.galaxy.id, sectorId, systemId)}
              onAddBody={(sectorId, systemId, planetIds) => addPlanetsToSystem(card.galaxy.id, sectorId, systemId, planetIds)}
              onDeleteBody={(sectorId, systemId, bodyId) => deleteBody(card.galaxy.id, sectorId, systemId, bodyId)}
              onUnassignPlanet={(sectorId, systemId, planetId) => unassignPlanet(card.galaxy.id, sectorId, systemId, planetId)}
              onScanBody={(sectorId, systemId, bodyId, source) => scanBodyInGalaxy(card.galaxy.id, sectorId, systemId, bodyId, source)}
              onClaimBody={(sectorId, systemId, bodyId, source) => claimBodyInGalaxy(card.galaxy.id, sectorId, systemId, bodyId, source)}
              onRenameBody={(sectorId, systemId, bodyId, source, displayName) => renameBodyInGalaxy(card.galaxy.id, sectorId, systemId, bodyId, source, displayName)}
              openSectorId={openSectorId}
              setOpenSectorId={setOpenSectorId}
              openSystemId={openSystemId}
              setOpenSystemId={setOpenSystemId}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No galaxies yet. Generate galaxies to begin the universe hierarchy.</EmptyState>
      )}
    </GeneratorShell>
  );
}

export function SectorGeneratorWorkflow() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [galaxyIndex, setGalaxyIndex] = useState(0);
  const [count, setCount] = useState(8);
  const [sectorType, setSectorType] = useState("Any");
  const [rarity, setRarity] = useState("Any");
  const [cards, setCards] = useState<SectorCardState[]>(() => defaultSectorCards(DEFAULT_UNIVERSE_SEED, 0));
  const [openSectorId, setOpenSectorId] = useState<string | null>(null);
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const progression = usePlayerProgression();
  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxy = useMemo(() => createExpansionGalaxy(universe.universe_seed, galaxyIndex), [galaxyIndex, universe.universe_seed]);
  const planetPool = useGeneratedPlanetPool();
  const assignedPlanetIds = useMemo(() => assignedPlanetIdsInSectors(cards), [cards]);

  function generateSectorCards() {
    const next = Array.from({ length: Math.max(1, count) }, (_, index) => {
      const normalizedSector = normalizeGalaxySector(galaxy, generateSector(galaxy, index), index);
      return toSectorState(normalizedSector.is_fixed ? normalizedSector : applySectorBias(normalizedSector, sectorType, rarity), galaxy);
    });
    setCards(next);
    setOpenSectorId(null);
    setOpenSystemId(null);
  }

  function updateSector(sectorId: string, updater: (card: SectorCardState) => SectorCardState) {
    setCards((current) => current.map((card) => (card.sector.id === sectorId ? updater(card) : card)));
  }

  function generateSystems(sectorId: string, append = false) {
    if (!progression.canScanSector()) return;
    const sectorCard = cards.find((item) => item.sector.id === sectorId);
    if (sectorCard && !discoveryAtLeast(sectorCard.sector.discoveryState, "scanned")) {
      progression.awardDiscovery("sector", sectorCard.sector.discoveryPoints);
      logSectorDiscovery(galaxy, scanDiscovery(sectorCard.sector));
    }
    updateSector(sectorId, (card) => {
      const startIndex = append ? card.systems.length : 0;
      const generated = Array.from({ length: 6 }, (_, index) => {
        const systemIndex = startIndex + index;
        return toSystemState(normalizeGalaxySystem(card.sector, generateStarSystem(card.sector, systemIndex), systemIndex), galaxy, card.sector);
      });
      return { ...card, sector: scanDiscovery(card.sector), systems: append ? [...card.systems, ...generated] : generated };
    });
  }

  function scanSector(sectorId: string) {
    if (!progression.canScanSector()) return;
    const card = cards.find((item) => item.sector.id === sectorId);
    if (card && !discoveryAtLeast(card.sector.discoveryState, "scanned")) {
      progression.awardDiscovery("sector", card.sector.discoveryPoints);
      logSectorDiscovery(galaxy, scanDiscovery(card.sector));
    }
    updateSector(sectorId, (card) => ({ ...card, sector: scanDiscovery(card.sector) }));
  }

  function scanSystem(sectorId: string, systemId: string) {
    if (!progression.canScanSystem()) return;
    const sectorCard = cards.find((card) => card.sector.id === sectorId);
    const systemCard = sectorCard?.systems.find((system) => system.system.id === systemId);
    const context = sectorCard && systemCard ? { galaxy, sector: sectorCard.sector, system: systemCard.system } : null;
    const faction = context && systemCard && !discoveryAtLeast(systemCard.system.discoveryState, "scanned") ? factionForSystem(context, systemCard.system) : null;
    if (sectorCard && systemCard && !discoveryAtLeast(systemCard.system.discoveryState, "scanned")) {
      progression.awardDiscovery("system", systemCard.system.discoveryPoints);
      logSystemDiscovery(galaxy, sectorCard.sector, scanDiscovery(systemCard.system));
      if (faction) logFactionDiscovery(faction);
    }
    updateSector(sectorId, (sectorCard) => ({
      ...sectorCard,
      factions: mergeFactionList(sectorCard.factions, faction),
      systems: sectorCard.systems.map((systemCard) => (systemCard.system.id === systemId ? addFactionToSystem({ ...systemCard, system: scanDiscovery(systemCard.system) }, faction) : systemCard))
    }));
  }

  function generateBodies(sectorId: string, systemId: string, append = false) {
    if (!progression.canScanSystem()) return;
    const sectorCard = cards.find((card) => card.sector.id === sectorId);
    const systemCard = sectorCard?.systems.find((system) => system.system.id === systemId);
    const context = sectorCard && systemCard ? { galaxy, sector: sectorCard.sector, system: systemCard.system } : null;
    const faction = context && systemCard && !discoveryAtLeast(systemCard.system.discoveryState, "scanned") ? factionForSystem(context, systemCard.system) : null;
    if (sectorCard && systemCard && !discoveryAtLeast(systemCard.system.discoveryState, "scanned")) {
      progression.awardDiscovery("system", systemCard.system.discoveryPoints);
      logSystemDiscovery(galaxy, sectorCard.sector, scanDiscovery(systemCard.system));
      if (faction) logFactionDiscovery(faction);
    }
    updateSector(sectorId, (sectorCard) => ({
      ...sectorCard,
      factions: mergeFactionList(sectorCard.factions, faction),
      systems: sectorCard.systems.map((systemCard) => {
        if (systemCard.system.id !== systemId) return systemCard;
        const context = { galaxy, sector: sectorCard.sector, system: systemCard.system };
        const bodies = generateCelestialBodies(systemCard.system)
          .filter((body) => !["Star", "Planet"].includes(body.celestial_body_type))
          .map((body, index) => withAssignment(body, context, body.orbit_position ?? index + 1));
        return addFactionToSystem({ ...systemCard, system: scanDiscovery(systemCard.system), bodies: append ? [...systemCard.bodies, ...bodies.slice(systemCard.bodies.length, systemCard.bodies.length + 1)] : bodies }, faction);
      })
    }));
  }

  function addPlanets(sectorId: string, systemId: string, planetIds: string[]) {
    updateSector(sectorId, (sectorCard) => ({
      ...sectorCard,
      systems: sectorCard.systems.map((systemCard) =>
        systemCard.system.id === systemId
          ? addGeneratedPlanetsToSystem(systemCard, { galaxy, sector: sectorCard.sector, system: systemCard.system }, planetPool.planets, planetIds)
          : systemCard
      )
    }));
  }

  function unassignPlanet(sectorId: string, systemId: string, planetId: string) {
    updateSector(sectorId, (sectorCard) => ({
      ...sectorCard,
      systems: sectorCard.systems.map((systemCard) => (systemCard.system.id === systemId ? removePlanetFromSystem(systemCard, planetId) : systemCard))
    }));
  }

  function scanBody(sectorId: string, systemId: string, bodyId: string, source: "body" | "planet") {
    if (!progression.canScanPlanet()) return;
    const sectorCard = cards.find((card) => card.sector.id === sectorId);
    const systemCard = sectorCard?.systems.find((system) => system.system.id === systemId);
    const points = systemCard ? bodyDiscoveryPoints(systemCard, bodyId, source) : 0;
    const context = sectorCard && systemCard ? { galaxy, sector: sectorCard.sector, system: systemCard.system } : null;
    const currentBody = source === "planet" ? systemCard?.planets.find((planet) => planet.id === bodyId) : systemCard?.bodies.find((body) => body.id === bodyId);
    const scannedBody = currentBody ? scanBodyState(source === "planet" ? planetToBodySnapshot(currentBody as AssignedPlanet) : (currentBody as BodyCardState)) : null;
    const faction = context && scannedBody && points ? factionForBody(context, scannedBody) : null;
    if (points && sectorCard && systemCard) {
      progression.awardDiscovery("planet", points);
      if (scannedBody) logBodyDiscovery({ galaxy, sector: sectorCard.sector, system: systemCard.system }, scannedBody, "planet_scanned");
      if (faction) logFactionDiscovery(faction);
    }
    updateSector(sectorId, (sectorCard) => ({
      ...sectorCard,
      factions: mergeFactionList(sectorCard.factions, faction),
      systems: sectorCard.systems.map((systemCard) => (systemCard.system.id === systemId ? attachFactionToBody(scanBodyInSystem(systemCard, bodyId, source), bodyId, source, faction) : systemCard))
    }));
  }

  function claimBody(sectorId: string, systemId: string, bodyId: string, source: "body" | "planet") {
    if (!progression.canClaimPlanet() || !progression.canColonizePlanet()) return;
    progression.recordClaim();
    progression.recordColonization();
    const sectorCard = cards.find((card) => card.sector.id === sectorId);
    const systemCard = sectorCard?.systems.find((system) => system.system.id === systemId);
    const currentBody = source === "planet" ? systemCard?.planets.find((planet) => planet.id === bodyId) : systemCard?.bodies.find((body) => body.id === bodyId);
    let colony: ColonyRecord | undefined;
    if (sectorCard && systemCard && currentBody) {
      const context = { galaxy, sector: sectorCard.sector, system: systemCard.system };
      const claimed = claimDiscovery(source === "planet" ? planetToBodySnapshot(currentBody as AssignedPlanet) : (currentBody as BodyCardState));
      colony = createColonyForBody(context, claimed);
      const claimedWithColony = { ...claimed, colonizable_status: "Colonized", colonizationStatus: "colonized", colonyId: colony.id, colony };
      logBodyDiscovery(context, claimedWithColony, "planet_claimed", "high");
      logBodyDiscovery(context, claimedWithColony, "planet_colonized", "high");
      logColonyFounded(context, claimedWithColony, colony);
    }
    updateSector(sectorId, (sectorCard) => ({
      ...sectorCard,
      systems: sectorCard.systems.map((systemCard) => (systemCard.system.id === systemId ? claimBodyInSystem(systemCard, bodyId, source, colony) : systemCard))
    }));
  }

  function renameSector(sectorId: string, displayName: string) {
    renameDiscoveryObject(sectorId, "sector", displayName);
    updateSector(sectorId, (card) => ({ ...card, sector: { ...card.sector, generatedName: card.sector.generatedName ?? card.sector.sector_name, displayName } }));
  }

  function renameSystem(sectorId: string, systemId: string, displayName: string) {
    renameDiscoveryObject(systemId, "star_system", displayName);
    updateSector(sectorId, (card) => ({
      ...card,
      systems: card.systems.map((system) => (system.system.id === systemId ? { ...system, system: { ...system.system, generatedName: system.system.generatedName ?? system.system.system_name, displayName } } : system))
    }));
  }

  function renameBody(sectorId: string, systemId: string, bodyId: string, source: "body" | "planet", displayName: string) {
    renameDiscoveryObject(bodyId, source === "planet" ? "planet" : "celestial_body", displayName);
    updateSector(sectorId, (card) => ({
      ...card,
      systems: card.systems.map((system) => (system.system.id === systemId ? renameBodyInSystem(system, bodyId, source, displayName) : system))
    }));
  }

  const visibleCards = cards.filter((card) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [card.sector.sector_name, card.sector.sector_type, card.sector.resource_signal, card.sector.modifier].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <GeneratorShell
      eyebrow="Universe Workflow"
      title="Sectors"
      description="Generate sector cards, drill into their star systems, and curate what belongs in the selected galaxy."
      actions={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_5rem_6rem_11rem_10rem_auto] xl:items-center">
          <HeaderTextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="Universe seed" />
          <HeaderTextInput label="Galaxy" value={galaxyIndex} onChange={(value) => setGalaxyIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <HeaderTextInput label="Sectors" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <HeaderSelectInput label="Sector Bias" value={sectorType} options={sectorTypes} onChange={setSectorType} />
          <HeaderSelectInput label="Rarity Bias" value={rarity} options={rarityOptions} onChange={setRarity} />
          <Button type="button" onClick={generateSectorCards} className="h-11 px-5">
            <Plus className="h-4 w-4" />
            Generate Sectors
          </Button>
        </div>
      }
    >

      <div className="flex flex-col gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 sm:flex-row sm:items-center">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          placeholder={`Search sectors in ${galaxy.name}`}
        />
      </div>

      <ProgressionGatePanel progression={progression} />

      {visibleCards.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleCards.map((card) => (
            <SectorCard
              key={card.sector.id}
              card={card}
              galaxy={galaxy}
              progression={progression}
              planetPool={planetPool.planets}
              assignedPlanetIds={assignedPlanetIds}
              planetPoolLoading={planetPool.loading}
              planetPoolError={planetPool.error}
              open={openSectorId === card.sector.id}
              onOpen={() => setOpenSectorId(openSectorId === card.sector.id ? null : card.sector.id)}
              onRenameSector={(displayName) => renameSector(card.sector.id, displayName)}
              onScanSector={() => scanSector(card.sector.id)}
              onDelete={() => {
                if (window.confirm(`Delete ${card.sector.sector_name} and all generated star systems inside it?`)) {
                  setCards((current) => current.filter((item) => item.sector.id !== card.sector.id));
                }
              }}
              onGenerateSystems={() => generateSystems(card.sector.id)}
              onAddSystem={() => generateSystems(card.sector.id, true)}
              onRenameSystem={(systemId, displayName) => renameSystem(card.sector.id, systemId, displayName)}
              onDeleteSystem={(systemId) => {
                const system = card.systems.find((item) => item.system.id === systemId);
                if (!system || !window.confirm(`Delete ${system.system.system_name} and all generated planets/bodies inside it?`)) return;
                updateSector(card.sector.id, (sectorCard) => ({ ...sectorCard, systems: sectorCard.systems.filter((item) => item.system.id !== systemId) }));
              }}
              onScanSystem={(systemId) => scanSystem(card.sector.id, systemId)}
              onGenerateBodies={(systemId) => generateBodies(card.sector.id, systemId)}
              onAddBody={(systemId, planetIds) => addPlanets(card.sector.id, systemId, planetIds)}
              onDeleteBody={(systemId, bodyId) =>
                updateSector(card.sector.id, (sectorCard) => ({
                  ...sectorCard,
                  systems: sectorCard.systems.map((system) => (system.system.id === systemId ? { ...system, bodies: system.bodies.filter((body) => body.id !== bodyId) } : system))
                }))
              }
              onUnassignPlanet={(systemId, planetId) => unassignPlanet(card.sector.id, systemId, planetId)}
              onScanBody={(systemId, bodyId, source) => scanBody(card.sector.id, systemId, bodyId, source)}
              onClaimBody={(systemId, bodyId, source) => claimBody(card.sector.id, systemId, bodyId, source)}
              onRenameBody={(systemId, bodyId, source, displayName) => renameBody(card.sector.id, systemId, bodyId, source, displayName)}
              openSystemId={openSystemId}
              setOpenSystemId={setOpenSystemId}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No sectors yet. Generate sectors to populate this galaxy.</EmptyState>
      )}
    </GeneratorShell>
  );
}

export function StarSystemGeneratorWorkflow() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [galaxyIndex, setGalaxyIndex] = useState(0);
  const [sectorIndex, setSectorIndex] = useState(0);
  const [count, setCount] = useState(8);
  const [rarity, setRarity] = useState("Any");
  const [starRule, setStarRule] = useState("Generated");
  const [cards, setCards] = useState<StarSystemCardState[]>(() => defaultSystemCards(DEFAULT_UNIVERSE_SEED, 0, 0));
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const progression = usePlayerProgression();
  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxy = useMemo(() => createExpansionGalaxy(universe.universe_seed, galaxyIndex), [galaxyIndex, universe.universe_seed]);
  const sector = useMemo(() => {
    return normalizeGalaxySector(galaxy, generateSector(galaxy, sectorIndex), sectorIndex);
  }, [galaxy, sectorIndex]);
  const planetPool = useGeneratedPlanetPool();
  const assignedPlanetIds = useMemo(() => assignedPlanetIdsInSystems(cards), [cards]);

  function generateSystemCards() {
    const next = Array.from({ length: Math.max(1, count) }, (_, index) => {
      const normalizedSystem = normalizeGalaxySystem(sector, generateStarSystem(sector, index), index);
      const biasedSystem = normalizedSystem.is_fixed ? normalizedSystem : applySystemBias(normalizedSystem, rarity, starRule);
      return toSystemState(biasedSystem, galaxy, sector);
    });
    setCards(next);
    setOpenSystemId(null);
  }

  function updateSystem(systemId: string, updater: (card: StarSystemCardState) => StarSystemCardState) {
    setCards((current) => current.map((card) => (card.system.id === systemId ? updater(card) : card)));
  }

  function generateBodies(systemId: string, append = false) {
    if (!progression.canScanSystem()) return;
    const current = cards.find((item) => item.system.id === systemId);
    const context = current ? { galaxy, sector, system: current.system } : null;
    const faction = context && current && !discoveryAtLeast(current.system.discoveryState, "scanned") ? factionForSystem(context, current.system) : null;
    if (current && !discoveryAtLeast(current.system.discoveryState, "scanned")) {
      progression.awardDiscovery("system", current.system.discoveryPoints);
      logSystemDiscovery(galaxy, sector, scanDiscovery(current.system));
      if (faction) logFactionDiscovery(faction);
    }
    updateSystem(systemId, (card) => {
      const context = { galaxy, sector, system: card.system };
      const bodies = generateCelestialBodies(card.system)
        .filter((body) => !["Star", "Planet"].includes(body.celestial_body_type))
        .map((body, index) => withAssignment(body, context, body.orbit_position ?? index + 1));
      return addFactionToSystem({ ...card, system: scanDiscovery(card.system), bodies: append ? [...card.bodies, ...bodies.slice(card.bodies.length, card.bodies.length + 1)] : bodies }, faction);
    });
  }

  function scanSystem(systemId: string) {
    if (!progression.canScanSystem()) return;
    const card = cards.find((item) => item.system.id === systemId);
    const context = card ? { galaxy, sector, system: card.system } : null;
    const faction = context && card && !discoveryAtLeast(card.system.discoveryState, "scanned") ? factionForSystem(context, card.system) : null;
    if (card && !discoveryAtLeast(card.system.discoveryState, "scanned")) {
      progression.awardDiscovery("system", card.system.discoveryPoints);
      logSystemDiscovery(galaxy, sector, scanDiscovery(card.system));
      if (faction) logFactionDiscovery(faction);
    }
    updateSystem(systemId, (card) => addFactionToSystem({ ...card, system: scanDiscovery(card.system) }, faction));
  }

  function addPlanets(systemId: string, planetIds: string[]) {
    updateSystem(systemId, (card) => addGeneratedPlanetsToSystem(card, { galaxy, sector, system: card.system }, planetPool.planets, planetIds));
  }

  function unassignPlanet(systemId: string, planetId: string) {
    updateSystem(systemId, (card) => removePlanetFromSystem(card, planetId));
  }

  function scanBody(systemId: string, bodyId: string, source: "body" | "planet") {
    if (!progression.canScanPlanet()) return;
    const card = cards.find((item) => item.system.id === systemId);
    const points = card ? bodyDiscoveryPoints(card, bodyId, source) : 0;
    const context = card ? { galaxy, sector, system: card.system } : null;
    const currentBody = source === "planet" ? card?.planets.find((planet) => planet.id === bodyId) : card?.bodies.find((body) => body.id === bodyId);
    const scannedBody = currentBody ? scanBodyState(source === "planet" ? planetToBodySnapshot(currentBody as AssignedPlanet) : (currentBody as BodyCardState)) : null;
    const faction = context && scannedBody && points ? factionForBody(context, scannedBody) : null;
    if (points && card) {
      progression.awardDiscovery("planet", points);
      if (scannedBody) logBodyDiscovery({ galaxy, sector, system: card.system }, scannedBody, "planet_scanned");
      if (faction) logFactionDiscovery(faction);
    }
    updateSystem(systemId, (card) => attachFactionToBody(scanBodyInSystem(card, bodyId, source), bodyId, source, faction));
  }

  function claimBody(systemId: string, bodyId: string, source: "body" | "planet") {
    if (!progression.canClaimPlanet() || !progression.canColonizePlanet()) return;
    progression.recordClaim();
    progression.recordColonization();
    const card = cards.find((item) => item.system.id === systemId);
    const currentBody = source === "planet" ? card?.planets.find((planet) => planet.id === bodyId) : card?.bodies.find((body) => body.id === bodyId);
    let colony: ColonyRecord | undefined;
    if (card && currentBody) {
      const context = { galaxy, sector, system: card.system };
      const claimed = claimDiscovery(source === "planet" ? planetToBodySnapshot(currentBody as AssignedPlanet) : (currentBody as BodyCardState));
      colony = createColonyForBody(context, claimed);
      const claimedWithColony = { ...claimed, colonizable_status: "Colonized", colonizationStatus: "colonized", colonyId: colony.id, colony };
      logBodyDiscovery(context, claimedWithColony, "planet_claimed", "high");
      logBodyDiscovery(context, claimedWithColony, "planet_colonized", "high");
      logColonyFounded(context, claimedWithColony, colony);
    }
    updateSystem(systemId, (card) => claimBodyInSystem(card, bodyId, source, colony));
  }

  function renameSystem(systemId: string, displayName: string) {
    renameDiscoveryObject(systemId, "star_system", displayName);
    updateSystem(systemId, (card) => ({ ...card, system: { ...card.system, generatedName: card.system.generatedName ?? card.system.system_name, displayName } }));
  }

  function renameBody(systemId: string, bodyId: string, source: "body" | "planet", displayName: string) {
    renameDiscoveryObject(bodyId, source === "planet" ? "planet" : "celestial_body", displayName);
    updateSystem(systemId, (card) => renameBodyInSystem(card, bodyId, source, displayName));
  }

  const visibleCards = cards.filter((card) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [card.system.system_name, card.system.catalog_designation, card.system.system_rarity, card.system.star_type, card.system.resource_bias].some((value) => value.toLowerCase().includes(query));
  });
  const selectedSystem = cards.find((card) => card.system.id === openSystemId);

  return (
    <GeneratorShell
      eyebrow="Universe Workflow"
      title="Star Systems"
      description="Generate collectible star-system cards, then open them to populate planets, moons, belts, and orbital worlds."
      actions={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_5rem_5rem_6rem_10rem_10rem_auto] xl:items-center">
          <HeaderTextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="Universe seed" />
          <HeaderTextInput label="Galaxy" value={galaxyIndex} onChange={(value) => setGalaxyIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <HeaderTextInput label="Sector" value={sectorIndex} onChange={(value) => setSectorIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <HeaderTextInput label="Systems" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <HeaderSelectInput label="Rarity Bias" value={rarity} options={rarityOptions} onChange={setRarity} />
          <HeaderSelectInput label="Star Rules" value={starRule} options={starCountRules} onChange={setStarRule} />
          <Button type="button" onClick={generateSystemCards} className="h-11 px-5">
            <Plus className="h-4 w-4" />
            Generate Star Systems
          </Button>
        </div>
      }
    >

      <div className="flex flex-col gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 sm:flex-row sm:items-center">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          placeholder={`Search star systems in ${sector.sector_name}`}
        />
      </div>

      <ProgressionGatePanel progression={progression} />

      {visibleCards.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleCards.map((card) => (
            <StarSystemCard
              key={card.system.id}
              card={card}
              onOpen={() => setOpenSystemId(card.system.id)}
              onDelete={() => {
                if (window.confirm(`Delete ${card.system.system_name} and all generated planets/bodies inside it?`)) {
                  setCards((current) => current.filter((item) => item.system.id !== card.system.id));
                  if (openSystemId === card.system.id) setOpenSystemId(null);
                }
              }}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No star systems yet. Generate star systems to populate this sector.</EmptyState>
      )}
      {selectedSystem ? (
        <StarSystemDetailOverlay
          card={selectedSystem}
          context={{ galaxy, sector, system: selectedSystem.system }}
          progression={progression}
          planetPool={planetPool.planets}
          assignedPlanetIds={assignedPlanetIds}
          planetPoolLoading={planetPool.loading}
          planetPoolError={planetPool.error}
          onClose={() => setOpenSystemId(null)}
          onDelete={() => {
            if (window.confirm(`Delete ${selectedSystem.system.system_name} and all generated planets/bodies inside it?`)) {
              setCards((current) => current.filter((item) => item.system.id !== selectedSystem.system.id));
              setOpenSystemId(null);
            }
          }}
          onRenameSystem={(displayName) => renameSystem(selectedSystem.system.id, displayName)}
          onScanSystem={() => scanSystem(selectedSystem.system.id)}
          onGenerateBodies={() => generateBodies(selectedSystem.system.id)}
          onAddBody={(planetIds) => addPlanets(selectedSystem.system.id, planetIds)}
          onDeleteBody={(bodyId) => updateSystem(selectedSystem.system.id, (systemCard) => ({ ...systemCard, bodies: systemCard.bodies.filter((body) => body.id !== bodyId) }))}
          onUnassignPlanet={(planetId) => unassignPlanet(selectedSystem.system.id, planetId)}
          onScanBody={(bodyId, source) => scanBody(selectedSystem.system.id, bodyId, source)}
          onClaimBody={(bodyId, source) => claimBody(selectedSystem.system.id, bodyId, source)}
          onRenameBody={(bodyId, source, displayName) => renameBody(selectedSystem.system.id, bodyId, source, displayName)}
        />
      ) : null}
    </GeneratorShell>
  );
}

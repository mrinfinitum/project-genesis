import type { ResearchBranch, ResearchNode, UnlockMatrixRow } from "@/types/schema";

export const SPACE_RESEARCH_BRANCH_PURPOSE =
  "Space Research governs humanity's expansion beyond Earth. It begins with astronomy and orbital flight, expands to local star system exploration in the Modern Era, unlocks full home-system colonization in Future Core, then progresses into interstellar, galactic, intergalactic, and Genesis-level travel.";

type SpaceResearchDefinition = {
  era: string;
  eraOrder: number;
  name: string;
  designPurpose: string;
  unlocks: string[];
  explorationScopeUnlocked: string | null;
  travelTier: string;
  spaceSystemUnlocked: string | null;
  unlockSummary: string;
  notes: string;
};

const scopeNotes = {
  industrial: "Industrial Space research is astronomy and preparation only. It does not unlock active space exploration.",
  modern: "Modern Space research is limited to the home star system only.",
  futureCore: "Future Core Space research develops and colonizes the full home system, but still does not unlock other star systems.",
  interstellar: "Interstellar Space research unlocks nearby star systems.",
  galactic: "Galactic Space research expands travel across the galaxy.",
  intergalactic: "Intergalactic Space research unlocks other galaxies.",
  genesis: "Genesis Space research unlocks hidden and ultimate regions."
};

export const SPACE_RESEARCH_PROGRESSION: SpaceResearchDefinition[] = [
  {
    era: "Industrial",
    eraOrder: 5,
    name: "Astronomy",
    designPurpose: "Begins formal observation of the sky and opens the early Space research path.",
    unlocks: ["Basic observatory data", "Sky map", "Early space research path"],
    explorationScopeUnlocked: null,
    travelTier: "None",
    spaceSystemUnlocked: "Sky Map",
    unlockSummary: "Unlocks observatory data, sky mapping, and the first Space research chain.",
    notes: scopeNotes.industrial
  },
  {
    era: "Industrial",
    eraOrder: 5,
    name: "Precision Optics",
    designPurpose: "Improves observation quality before practical spaceflight.",
    unlocks: ["Improved observatories", "Better planet detection", "Early star system awareness"],
    explorationScopeUnlocked: null,
    travelTier: "None",
    spaceSystemUnlocked: "Improved Observatories",
    unlockSummary: "Improves observatory output and early detection of planetary bodies.",
    notes: scopeNotes.industrial
  },
  {
    era: "Industrial",
    eraOrder: 5,
    name: "Advanced Materials",
    designPurpose: "Creates the material science base for space-grade construction.",
    unlocks: ["Rocket components", "Space-grade construction"],
    explorationScopeUnlocked: null,
    travelTier: "None",
    spaceSystemUnlocked: "Space-Grade Construction",
    unlockSummary: "Unlocks rocket components and construction standards for launch infrastructure.",
    notes: scopeNotes.industrial
  },
  {
    era: "Industrial",
    eraOrder: 5,
    name: "Chemical Propulsion",
    designPurpose: "Turns materials research into a practical rocketry path.",
    unlocks: ["Rocketry path", "Launch infrastructure"],
    explorationScopeUnlocked: null,
    travelTier: "None",
    spaceSystemUnlocked: "Launch Infrastructure",
    unlockSummary: "Unlocks the Rocketry prerequisite path and launch infrastructure planning.",
    notes: scopeNotes.industrial
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Rocketry",
    designPurpose: "Starts practical launch programs and first orbital missions.",
    unlocks: ["Launch Pad", "Rocket Program", "First orbital missions"],
    explorationScopeUnlocked: "Home Orbit",
    travelTier: "Orbital",
    spaceSystemUnlocked: "Rocket Program",
    unlockSummary: "Unlocks launch pads, the rocket program, and first orbital missions.",
    notes: scopeNotes.modern
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Orbital Flight",
    designPurpose: "Moves exploration from launch attempts to stable orbital operations.",
    unlocks: ["Orbit View", "Orbital missions", "Satellite deployment"],
    explorationScopeUnlocked: "Home Orbit",
    travelTier: "Orbital",
    spaceSystemUnlocked: "Orbit View",
    unlockSummary: "Unlocks orbit view, orbital missions, and satellite deployment.",
    notes: scopeNotes.modern
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Satellites",
    designPurpose: "Creates planet-scale sensing and communications infrastructure.",
    unlocks: ["Satellite Network", "Planet scanning", "Global communications"],
    explorationScopeUnlocked: "Home Orbit",
    travelTier: "Orbital",
    spaceSystemUnlocked: "Satellite Network",
    unlockSummary: "Unlocks satellite networks, planet scanning, and global communications.",
    notes: scopeNotes.modern
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Space Stations",
    designPurpose: "Establishes permanent orbital research and manufacturing footholds.",
    unlocks: ["Orbital Station", "Orbital research", "Orbital manufacturing foundation"],
    explorationScopeUnlocked: "Home Orbit",
    travelTier: "Orbital",
    spaceSystemUnlocked: "Orbital Station",
    unlockSummary: "Unlocks orbital stations, orbital research, and the foundation for orbital manufacturing.",
    notes: scopeNotes.modern
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Lunar Exploration",
    designPurpose: "Extends missions to the home moon and nearby natural satellites.",
    unlocks: ["Moon missions", "Helium-3 discovery", "Regolith mining"],
    explorationScopeUnlocked: "Home Moon",
    travelTier: "Planetary",
    spaceSystemUnlocked: "Moon Missions",
    unlockSummary: "Unlocks moon missions, Helium-3 discovery, and regolith mining.",
    notes: scopeNotes.modern
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Planetary Exploration",
    designPurpose: "Unlocks the home star system map and local planet discovery.",
    unlocks: ["Star System Map", "Local planet discovery", "Planet cards", "Planet scan data"],
    explorationScopeUnlocked: "Home Star System",
    travelTier: "System",
    spaceSystemUnlocked: "Star System Map",
    unlockSummary: "Unlocks the home star system map, local planet discovery, planet cards, and scan data.",
    notes: scopeNotes.modern
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Asteroid Mining",
    designPurpose: "Adds asteroid resource nodes to the home star system economy.",
    unlocks: ["Asteroid resource nodes", "Meteoric Iron", "Iridium", "Platinum", "Rare Earth Elements"],
    explorationScopeUnlocked: "Home Star System",
    travelTier: "System",
    spaceSystemUnlocked: "Asteroid Mining",
    unlockSummary: "Unlocks asteroid resource nodes and high-value space minerals.",
    notes: scopeNotes.modern
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Orbital Manufacturing",
    designPurpose: "Creates the first space economy foundation through orbital production.",
    unlocks: ["Orbital factory", "Advanced spacecraft parts", "Space economy foundation"],
    explorationScopeUnlocked: "Home Star System",
    travelTier: "System",
    spaceSystemUnlocked: "Orbital Manufacturing",
    unlockSummary: "Unlocks orbital factories, spacecraft parts, and the foundation of the space economy.",
    notes: scopeNotes.modern
  },
  {
    era: "Modern",
    eraOrder: 6,
    name: "Gas Giant Harvesting",
    designPurpose: "Makes gas giants valuable orbital resource worlds instead of landable planets.",
    unlocks: ["Orbital Harvester", "Atmospheric Collector", "Gas Refinery", "Helium-3", "Deuterium", "Metallic Hydrogen"],
    explorationScopeUnlocked: "Home Star System",
    travelTier: "System",
    spaceSystemUnlocked: "Gas Giant Harvesting",
    unlockSummary: "Unlocks orbital harvesters, atmospheric collectors, gas refineries, and fuel economy resources.",
    notes: scopeNotes.modern
  },
  {
    era: "Future Core",
    eraOrder: 7,
    name: "Fusion Propulsion",
    designPurpose: "Enables deep-space travel within the home system.",
    unlocks: ["Fusion engines", "Deep-space travel within home system", "Advanced colony missions"],
    explorationScopeUnlocked: "Home Star System",
    travelTier: "System",
    spaceSystemUnlocked: "Fusion Engines",
    unlockSummary: "Unlocks fusion engines, deep-space home-system travel, and advanced colony missions.",
    notes: scopeNotes.futureCore
  },
  {
    era: "Future Core",
    eraOrder: 7,
    name: "Orbital Habitats",
    designPurpose: "Moves population permanently off-world into orbital colony infrastructure.",
    unlocks: ["Orbital colonies", "Population off-world", "Long-term orbital presence"],
    explorationScopeUnlocked: "Home System Colonization",
    travelTier: "Home-System Colonization",
    spaceSystemUnlocked: "Orbital Habitats",
    unlockSummary: "Unlocks orbital colonies, off-world population, and long-term orbital presence.",
    notes: scopeNotes.futureCore
  },
  {
    era: "Future Core",
    eraOrder: 7,
    name: "Colony Ships",
    designPurpose: "Creates the system for deploying new colonies inside the home star system.",
    unlocks: ["Planet colonization", "Colony ship system", "New colony deployment"],
    explorationScopeUnlocked: "Home System Colonization",
    travelTier: "Home-System Colonization",
    spaceSystemUnlocked: "Colony Ships",
    unlockSummary: "Unlocks colony ships, new colony deployment, and the colonization workflow.",
    notes: scopeNotes.futureCore
  },
  {
    era: "Future Core",
    eraOrder: 7,
    name: "Planetary Colonization",
    designPurpose: "Allows landable planets in the home system to become managed colonies.",
    unlocks: ["Colonize landable planets", "Colony management", "Planetary buildings"],
    explorationScopeUnlocked: "Home System Colonization",
    travelTier: "Home-System Colonization",
    spaceSystemUnlocked: "Planetary Colonization",
    unlockSummary: "Unlocks colonization of landable planets, colony management, and planetary buildings.",
    notes: scopeNotes.futureCore
  },
  {
    era: "Future Core",
    eraOrder: 7,
    name: "Terraforming",
    designPurpose: "Adds long-term planetary transformation to colony development.",
    unlocks: ["Terraform level", "Atmosphere processing", "Water restoration", "Climate control"],
    explorationScopeUnlocked: "Home System Colonization",
    travelTier: "Home-System Colonization",
    spaceSystemUnlocked: "Terraforming",
    unlockSummary: "Unlocks terraform levels, atmosphere processing, water restoration, and climate control.",
    notes: scopeNotes.futureCore
  },
  {
    era: "Future Core",
    eraOrder: 7,
    name: "Deep Space Communications",
    designPurpose: "Connects remote home-system colonies through logistics and command networks.",
    unlocks: ["System-wide logistics", "Long-range sensors", "Remote colony management"],
    explorationScopeUnlocked: "Home System Colonization",
    travelTier: "Home-System Colonization",
    spaceSystemUnlocked: "System-Wide Logistics",
    unlockSummary: "Unlocks system-wide logistics, long-range sensors, and remote colony management.",
    notes: scopeNotes.futureCore
  },
  {
    era: "Future Core",
    eraOrder: 7,
    name: "Autonomous Exploration",
    designPurpose: "Automates surveys and remote scouting inside the home system.",
    unlocks: ["Automated surveys", "Probe discovery", "Remote scouting"],
    explorationScopeUnlocked: "Home System Colonization",
    travelTier: "Home-System Colonization",
    spaceSystemUnlocked: "Autonomous Surveys",
    unlockSummary: "Unlocks automated surveys, probe discovery, and remote scouting.",
    notes: scopeNotes.futureCore
  },
  {
    era: "Interstellar",
    eraOrder: 8,
    name: "Cryogenic Suspension",
    designPurpose: "Solves crew survival for missions that exceed normal biological timelines.",
    unlocks: ["Long-duration missions", "Interstellar crew survival"],
    explorationScopeUnlocked: "Nearby Star Systems",
    travelTier: "Interstellar",
    spaceSystemUnlocked: "Cryogenic Missions",
    unlockSummary: "Unlocks long-duration missions and interstellar crew survival.",
    notes: scopeNotes.interstellar
  },
  {
    era: "Interstellar",
    eraOrder: 8,
    name: "Generation Ships",
    designPurpose: "Enables slow, high-capacity interstellar colonization.",
    unlocks: ["Slow interstellar colonization", "High-capacity colony vessels"],
    explorationScopeUnlocked: "Nearby Star Systems",
    travelTier: "Interstellar",
    spaceSystemUnlocked: "Generation Ships",
    unlockSummary: "Unlocks slow interstellar colonization and high-capacity colony vessels.",
    notes: scopeNotes.interstellar
  },
  {
    era: "Interstellar",
    eraOrder: 8,
    name: "Relativistic Navigation",
    designPurpose: "Calculates viable paths to nearby star systems.",
    unlocks: ["Nearby star route calculation", "Relativistic travel planning"],
    explorationScopeUnlocked: "Nearby Star Systems",
    travelTier: "Interstellar",
    spaceSystemUnlocked: "Nearby Star Routes",
    unlockSummary: "Unlocks nearby star route calculation and relativistic travel planning.",
    notes: scopeNotes.interstellar
  },
  {
    era: "Interstellar",
    eraOrder: 8,
    name: "Antimatter Containment",
    designPurpose: "Supports high-energy propulsion without destabilizing ship systems.",
    unlocks: ["Antimatter engines", "High-energy propulsion"],
    explorationScopeUnlocked: "Nearby Star Systems",
    travelTier: "Interstellar",
    spaceSystemUnlocked: "Antimatter Engines",
    unlockSummary: "Unlocks antimatter engines and high-energy propulsion.",
    notes: scopeNotes.interstellar
  },
  {
    era: "Interstellar",
    eraOrder: 8,
    name: "Long-Range Sensors",
    designPurpose: "Detects nearby stars and prepares deep survey targets.",
    unlocks: ["Nearby star system discovery", "Deep scan", "Interstellar survey"],
    explorationScopeUnlocked: "Nearby Star Systems",
    travelTier: "Interstellar",
    spaceSystemUnlocked: "Deep Scan",
    unlockSummary: "Unlocks nearby star system discovery, deep scans, and interstellar surveys.",
    notes: scopeNotes.interstellar
  },
  {
    era: "Interstellar",
    eraOrder: 8,
    name: "Interstellar Navigation",
    designPurpose: "Unlocks the first non-home star systems and interstellar map.",
    unlocks: ["Nearby star systems", "Interstellar map", "First non-home star system discovery"],
    explorationScopeUnlocked: "Nearby Star Systems",
    travelTier: "Interstellar",
    spaceSystemUnlocked: "Interstellar Map",
    unlockSummary: "Unlocks nearby star systems, interstellar map, and first non-home star discovery.",
    notes: scopeNotes.interstellar
  },
  {
    era: "Interstellar",
    eraOrder: 8,
    name: "Interstellar Colonization",
    designPurpose: "Turns nearby star discovery into a multi-system civilization.",
    unlocks: ["Colonization of nearby star systems", "Interstellar trade routes", "Multi-system civilization"],
    explorationScopeUnlocked: "Nearby Star Systems",
    travelTier: "Interstellar",
    spaceSystemUnlocked: "Interstellar Colonization",
    unlockSummary: "Unlocks nearby star colonization, interstellar trade routes, and multi-system civilization.",
    notes: scopeNotes.interstellar
  },
  {
    era: "Galactic",
    eraOrder: 9,
    name: "Quantum Computing",
    designPurpose: "Adds the computation needed for galactic-scale planning.",
    unlocks: ["Advanced route computation", "Large-scale simulation", "Galactic planning"],
    explorationScopeUnlocked: "Galaxy-Wide Travel",
    travelTier: "Galactic",
    spaceSystemUnlocked: "Galactic Planning",
    unlockSummary: "Unlocks advanced route computation, large-scale simulation, and galactic planning.",
    notes: scopeNotes.galactic
  },
  {
    era: "Galactic",
    eraOrder: 9,
    name: "Space-Time Mapping",
    designPurpose: "Predicts safe routes and anomalies across large galactic distances.",
    unlocks: ["Galactic route prediction", "Anomaly detection"],
    explorationScopeUnlocked: "Galaxy-Wide Travel",
    travelTier: "Galactic",
    spaceSystemUnlocked: "Space-Time Map",
    unlockSummary: "Unlocks galactic route prediction and anomaly detection.",
    notes: scopeNotes.galactic
  },
  {
    era: "Galactic",
    eraOrder: 9,
    name: "Gravity Manipulation",
    designPurpose: "Enables advanced drive and orbital engineering systems.",
    unlocks: ["Gravity drives", "Mega-structure support", "Advanced orbital engineering"],
    explorationScopeUnlocked: "Galaxy-Wide Travel",
    travelTier: "Galactic",
    spaceSystemUnlocked: "Gravity Drives",
    unlockSummary: "Unlocks gravity drives, megastructure support, and advanced orbital engineering.",
    notes: scopeNotes.galactic
  },
  {
    era: "Galactic",
    eraOrder: 9,
    name: "Warp Field Theory",
    designPurpose: "Starts the warp research chain and experimental warp testing.",
    unlocks: ["Warp research chain", "Experimental warp tests"],
    explorationScopeUnlocked: "Galaxy-Wide Travel",
    travelTier: "Galactic",
    spaceSystemUnlocked: "Warp Research",
    unlockSummary: "Unlocks the warp research chain and experimental warp tests.",
    notes: scopeNotes.galactic
  },
  {
    era: "Galactic",
    eraOrder: 9,
    name: "Warp Engineering",
    designPurpose: "Builds prototype warp drives for longer-range galactic travel.",
    unlocks: ["Prototype warp drive", "Long-range galactic travel"],
    explorationScopeUnlocked: "Galaxy-Wide Travel",
    travelTier: "Galactic",
    spaceSystemUnlocked: "Prototype Warp Drive",
    unlockSummary: "Unlocks prototype warp drives and long-range galactic travel.",
    notes: scopeNotes.galactic
  },
  {
    era: "Galactic",
    eraOrder: 9,
    name: "Stable Warp Drives",
    designPurpose: "Turns warp from prototype into reliable galaxy-wide travel.",
    unlocks: ["Galaxy-wide exploration", "Fast interstellar travel", "Distant sector access"],
    explorationScopeUnlocked: "Galaxy-Wide Travel",
    travelTier: "Galactic",
    spaceSystemUnlocked: "Stable Warp Drives",
    unlockSummary: "Unlocks galaxy-wide exploration, fast interstellar travel, and distant sector access.",
    notes: scopeNotes.galactic
  },
  {
    era: "Galactic",
    eraOrder: 9,
    name: "Galactic Navigation",
    designPurpose: "Expands the Galaxy Map and opens rare galactic regions.",
    unlocks: ["Galaxy Map expansion", "Distant sectors", "Rare region discovery"],
    explorationScopeUnlocked: "Galaxy-Wide Travel",
    travelTier: "Galactic",
    spaceSystemUnlocked: "Galaxy Map",
    unlockSummary: "Unlocks Galaxy Map expansion, distant sectors, and rare region discovery.",
    notes: scopeNotes.galactic
  },
  {
    era: "Intergalactic",
    eraOrder: 10,
    name: "Dark Matter Research",
    designPurpose: "Begins intergalactic route theory through advanced cosmology.",
    unlocks: ["Dark matter systems", "Advanced cosmology", "Intergalactic route theory"],
    explorationScopeUnlocked: "Intergalactic Travel",
    travelTier: "Intergalactic",
    spaceSystemUnlocked: "Intergalactic Route Theory",
    unlockSummary: "Unlocks dark matter systems, advanced cosmology, and intergalactic route theory.",
    notes: scopeNotes.intergalactic
  },
  {
    era: "Intergalactic",
    eraOrder: 10,
    name: "Exotic Matter",
    designPurpose: "Creates material foundations for wormhole research.",
    unlocks: ["Wormhole research", "Advanced propulsion materials"],
    explorationScopeUnlocked: "Intergalactic Travel",
    travelTier: "Intergalactic",
    spaceSystemUnlocked: "Wormhole Research",
    unlockSummary: "Unlocks wormhole research and advanced propulsion materials.",
    notes: scopeNotes.intergalactic
  },
  {
    era: "Intergalactic",
    eraOrder: 10,
    name: "Quantum Foam",
    designPurpose: "Manipulates micro space-time for wormhole stability.",
    unlocks: ["Micro-space-time manipulation", "Wormhole stability research"],
    explorationScopeUnlocked: "Intergalactic Travel",
    travelTier: "Intergalactic",
    spaceSystemUnlocked: "Wormhole Stability",
    unlockSummary: "Unlocks micro-space-time manipulation and wormhole stability research.",
    notes: scopeNotes.intergalactic
  },
  {
    era: "Intergalactic",
    eraOrder: 10,
    name: "Micro Singularity Engineering",
    designPurpose: "Powers advanced gate and bridge systems.",
    unlocks: ["Singularity reactors", "Advanced gate systems"],
    explorationScopeUnlocked: "Intergalactic Travel",
    travelTier: "Intergalactic",
    spaceSystemUnlocked: "Singularity Reactors",
    unlockSummary: "Unlocks singularity reactors and advanced gate systems.",
    notes: scopeNotes.intergalactic
  },
  {
    era: "Intergalactic",
    eraOrder: 10,
    name: "Einstein-Rosen Bridges",
    designPurpose: "Defines safe wormhole bridge theory and pathing.",
    unlocks: ["Wormhole pathing", "Bridge theory"],
    explorationScopeUnlocked: "Intergalactic Travel",
    travelTier: "Intergalactic",
    spaceSystemUnlocked: "Einstein-Rosen Bridges",
    unlockSummary: "Unlocks wormhole pathing and bridge theory.",
    notes: scopeNotes.intergalactic
  },
  {
    era: "Intergalactic",
    eraOrder: 10,
    name: "Artificial Wormholes",
    designPurpose: "Enables galaxy-to-galaxy gate infrastructure.",
    unlocks: ["Intergalactic gates", "Galaxy-to-galaxy travel"],
    explorationScopeUnlocked: "Intergalactic Travel",
    travelTier: "Intergalactic",
    spaceSystemUnlocked: "Wormhole Gates",
    unlockSummary: "Unlocks intergalactic gates and galaxy-to-galaxy travel.",
    notes: scopeNotes.intergalactic
  },
  {
    era: "Intergalactic",
    eraOrder: 10,
    name: "Intergalactic Navigation",
    designPurpose: "Expands the map beyond the galaxy into cross-galaxy trade and deep universe exploration.",
    unlocks: ["New galaxies", "Intergalactic map", "Cross-galaxy trade", "Deep universe exploration"],
    explorationScopeUnlocked: "Intergalactic Travel",
    travelTier: "Intergalactic",
    spaceSystemUnlocked: "Intergalactic Map",
    unlockSummary: "Unlocks new galaxies, intergalactic map, cross-galaxy trade, and deep universe exploration.",
    notes: scopeNotes.intergalactic
  },
  {
    era: "Genesis",
    eraOrder: 11,
    name: "Universal Physics",
    designPurpose: "Begins universal-scale exploration and Genesis route detection.",
    unlocks: ["Universal-scale research", "Genesis route detection"],
    explorationScopeUnlocked: "Genesis Space",
    travelTier: "Genesis",
    spaceSystemUnlocked: "Genesis Route Detection",
    unlockSummary: "Unlocks universal-scale research and Genesis route detection.",
    notes: scopeNotes.genesis
  },
  {
    era: "Genesis",
    eraOrder: 11,
    name: "Genesis Core Theory",
    designPurpose: "Defines Genesis Core materials and the endgame technology chain.",
    unlocks: ["Genesis Core research", "Genesis materials", "Endgame technology chain"],
    explorationScopeUnlocked: "Genesis Space",
    travelTier: "Genesis",
    spaceSystemUnlocked: "Genesis Core Research",
    unlockSummary: "Unlocks Genesis Core research, Genesis materials, and the endgame technology chain.",
    notes: scopeNotes.genesis
  },
  {
    era: "Genesis",
    eraOrder: 11,
    name: "Reality Engineering",
    designPurpose: "Supports reality-scale construction and ultimate wonders.",
    unlocks: ["Reality-scale construction", "Ultimate wonders", "Genesis-level upgrades"],
    explorationScopeUnlocked: "Genesis Space",
    travelTier: "Genesis",
    spaceSystemUnlocked: "Reality Engineering",
    unlockSummary: "Unlocks reality-scale construction, ultimate wonders, and Genesis-level upgrades.",
    notes: scopeNotes.genesis
  },
  {
    era: "Genesis",
    eraOrder: 11,
    name: "Universal Navigation",
    designPurpose: "Reveals hidden galaxies, Genesis regions, and mythic exploration paths.",
    unlocks: ["Hidden galaxies", "Genesis regions", "Mythic exploration paths"],
    explorationScopeUnlocked: "Genesis Space",
    travelTier: "Genesis",
    spaceSystemUnlocked: "Universal Navigation",
    unlockSummary: "Unlocks hidden galaxies, Genesis regions, and mythic exploration paths.",
    notes: scopeNotes.genesis
  },
  {
    era: "Genesis",
    eraOrder: 11,
    name: "Genesis Gates",
    designPurpose: "Unlocks the final exploration tier and Harmony Ascendant progression.",
    unlocks: ["Genesis space", "Final exploration tier", "Harmony Ascendant progression"],
    explorationScopeUnlocked: "Genesis Space",
    travelTier: "Genesis",
    spaceSystemUnlocked: "Genesis Gates",
    unlockSummary: "Unlocks Genesis space, the final exploration tier, and Harmony Ascendant progression.",
    notes: scopeNotes.genesis
  }
];

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function spaceResearchId(name: string) {
  return `research-space-${slug(name)}`;
}

export function buildSpaceResearchNodes(): ResearchNode[] {
  return SPACE_RESEARCH_PROGRESSION.map((row, index) => {
    const id = spaceResearchId(row.name);
    const previous = index > 0 ? SPACE_RESEARCH_PROGRESSION[index - 1] : null;

    return {
      id,
      branch_id: "branch-space",
      era: row.era,
      era_order: row.eraOrder,
      node_order: index + 1,
      name: row.name,
      design_purpose: row.designPurpose,
      primary_unlock_type: row.spaceSystemUnlocked ? "Space System" : "Research Path",
      unlocks: row.unlocks,
      gameplay_effect: row.unlockSummary,
      prerequisite_id: previous ? spaceResearchId(previous.name) : null,
      cost_experimental: 180 + index * 85 + Math.max(0, row.eraOrder - 5) * 250,
      research_time: `${240 + index * 45 + Math.max(0, row.eraOrder - 5) * 120}s`,
      related_systems: ["Space", "Research", "Galaxy", "Planets", row.travelTier].filter(Boolean),
      icon_name: `icon_space_${slug(row.name).replaceAll("-", "_")}`,
      asset_id: null,
      status: "Ready",
      notes: row.notes,
      exploration_scope_unlocked: row.explorationScopeUnlocked,
      travel_tier: row.travelTier,
      space_system_unlocked: row.spaceSystemUnlocked,
      requires_previous_space_research: index > 0,
      unlock_summary: row.unlockSummary
    };
  });
}

export function mergeSpaceResearchBranches(branches: ResearchBranch[]) {
  const next = branches.map((branch) =>
    branch.id === "branch-space" || branch.name === "Space"
      ? { ...branch, id: "branch-space", name: "Space", purpose: SPACE_RESEARCH_BRANCH_PURPOSE }
      : branch
  );

  if (!next.some((branch) => branch.id === "branch-space")) {
    next.push({ id: "branch-space", name: "Space", purpose: SPACE_RESEARCH_BRANCH_PURPOSE });
  }

  return next;
}

export function mergeSpaceResearchNodes(nodes: ResearchNode[]) {
  const spaceIds = new Set(SPACE_RESEARCH_PROGRESSION.map((row) => spaceResearchId(row.name)));
  const spaceNames = new Set(SPACE_RESEARCH_PROGRESSION.map((row) => row.name.toLowerCase()));
  const retained = nodes.filter((node) => !spaceIds.has(node.id) && !(node.branch_id === "branch-space" && spaceNames.has(node.name.toLowerCase())));

  return [...retained, ...buildSpaceResearchNodes()].sort((a, b) => {
    if (a.branch_id !== b.branch_id) return a.branch_id.localeCompare(b.branch_id);
    if (a.era_order !== b.era_order) return a.era_order - b.era_order;
    return a.node_order - b.node_order;
  });
}

export function buildSpaceUnlockMatrixRows(nodes = buildSpaceResearchNodes()): UnlockMatrixRow[] {
  return nodes.flatMap((node) =>
    node.unlocks.map((unlock, index) => ({
      id: `unlock-space-${slug(node.name)}-${String(index + 1).padStart(2, "0")}`,
      source_type: "Research",
      source_id: node.id,
      source_name: node.name,
      source_branch: "Space",
      source_era: node.era,
      unlock_type: node.space_system_unlocked ? "Space System" : "Exploration Scope",
      unlock_name: unlock,
      unlock_id: null,
      implementation_status: "Ready",
      notes: node.unlock_summary
    }))
  );
}

export function mergeSpaceUnlockMatrixRows(rows: UnlockMatrixRow[], nodes = buildSpaceResearchNodes()) {
  const spaceUnlockIds = new Set(buildSpaceUnlockMatrixRows(nodes).map((row) => row.id));
  return [...rows.filter((row) => !spaceUnlockIds.has(row.id)), ...buildSpaceUnlockMatrixRows(nodes)];
}

import type {
  CivilizationAlignmentHistory,
  CivilizationAlignmentScore,
  CivilizationBonus,
  CivilizationIdentity,
  CivilizationMilestone,
  CivilizationTitle,
  CivilizationUnlockedMilestone
} from "@/types/schema";

const createdAt = "2026-07-07T00:00:00.000Z";
export const primaryCivilizationId = "civilization-humanity";

export const civilizationAges = [
  {
    name: "Survival Age",
    description: "Humanity begins with basic survival, fire, shelter, stone tools, and small groups."
  },
  {
    name: "Village Age",
    description: "Permanent settlements, agriculture, food storage, basic trade, and early community structure."
  },
  {
    name: "Town Age",
    description: "Roads, markets, writing, organized labor, early engineering, and larger civic growth."
  },
  {
    name: "Industrial Age",
    description: "Factories, electricity, mass production, railroads, machines, and population expansion."
  },
  {
    name: "Modern Age",
    description: "Computers, satellites, global systems, automation, and the beginning of home star system exploration."
  },
  {
    name: "Future Age",
    description: "Fusion, AI, orbital habitats, planetary colonies, terraforming, and full development of the home star system."
  },
  {
    name: "Interstellar Age",
    description: "Nearby star systems, generation ships, interstellar navigation, deep space research, and multi-system expansion."
  },
  {
    name: "Galactic Age",
    description: "Galaxy-wide exploration, warp infrastructure, mega projects, distant sectors, and galactic-scale civilization."
  },
  {
    name: "Genesis Age",
    description: "Reality engineering, Genesis Gates, hidden galaxies, universal navigation, and Harmony Ascendant progression."
  }
] as const;

export const civilizationIdentity: CivilizationIdentity[] = [
  {
    id: primaryCivilizationId,
    civilization_name: "Humanity",
    current_age: "Survival Age",
    civilization_title: "The Survivors",
    primary_alignment: "Technology",
    secondary_alignment: "Industry",
    emerging_alignment: "Exploration",
    future_prediction: "High Tech Singularity",
    population: 125,
    total_discovery_points: 150,
    total_colonized_worlds: 1,
    total_wonders_built: 0,
    total_milestones_unlocked: 3,
    created_at: createdAt,
    updated_at: createdAt,
    notes: "Persistent civilization identity layer for the incremental loop. No government, diplomacy, or military simulation in this module."
  }
];

export const civilizationAlignmentScores: CivilizationAlignmentScore[] = [
  ["Eco", 22, "Improves sustainability, energy efficiency, lower pollution/event risk, and terraforming outcomes."],
  ["Technology", 46, "Improves research generation, automation efficiency, and advanced unlock speed."],
  ["Industry", 38, "Improves building production, construction speed, and resource extraction."],
  ["Cyber", 18, "Improves auto-click power, AI systems, simulations, and advanced computing unlocks."],
  ["Nature", 24, "Improves population growth, food systems, living world compatibility, and ecological stability."],
  ["Exploration", 31, "Improves discovery points, probe speed, survey range, and rare planet detection."],
  ["Science", 34, "Improves research output, breakthrough chance, and experiment rewards."],
  ["Harmony", 16, "Improves cross-alignment synergy, stability, and special endgame path eligibility."],
  ["Commerce", 20, "Improves coin generation, trade value, and resource selling efficiency."]
].map(([alignmentName, score, bonusSummary]) => ({
  id: `alignment-${String(alignmentName).toLowerCase()}`,
  civilization_id: primaryCivilizationId,
  alignment_name: String(alignmentName),
  score: Number(score),
  bonus_summary: String(bonusSummary),
  last_changed_by: "Seed Baseline",
  updated_at: createdAt
}));

export const civilizationAlignmentHistory: CivilizationAlignmentHistory[] = [
  {
    id: "alignment-history-fire-technology",
    civilization_id: primaryCivilizationId,
    alignment_name: "Technology",
    previous_score: 35,
    new_score: 46,
    change_amount: 11,
    source_type: "Milestone",
    source_id: "milestone-discovered-fire",
    reason: "Harnessing fire begins humanity's technical identity.",
    created_at: createdAt
  },
  {
    id: "alignment-history-shelter-industry",
    civilization_id: primaryCivilizationId,
    alignment_name: "Industry",
    previous_score: 30,
    new_score: 38,
    change_amount: 8,
    source_type: "Milestone",
    source_id: "milestone-built-first-shelter",
    reason: "Shelter construction introduces organized labor and material use.",
    created_at: createdAt
  },
  {
    id: "alignment-history-survey-exploration",
    civilization_id: primaryCivilizationId,
    alignment_name: "Exploration",
    previous_score: 24,
    new_score: 31,
    change_amount: 7,
    source_type: "System",
    source_id: "system-sol",
    reason: "The Sol starting map creates the first exploration path.",
    created_at: createdAt
  }
];

const milestoneRows: Array<[string, string, string, string, string, string, string]> = [
  ["discovered-fire", "Discovered Fire", "Survival Age", "Humanity learns to preserve heat, cook food, and create safety around the first camps.", "Start", "Flame", "Critical"],
  ["built-first-shelter", "Built First Shelter", "Survival Age", "Basic structures protect early population and begin the building loop.", "Start", "Home", "Critical"],
  ["founded-first-camp", "Founded First Camp", "Survival Age", "Small groups organize labor, storage, and shared survival tasks.", "Start", "Tent", "High"],
  ["unlocked-agriculture", "Unlocked Agriculture", "Village Age", "Food production creates permanent settlement pressure and population stability.", "Agriculture Research", "Wheat", "Critical"],
  ["founded-first-village", "Founded First Village", "Village Age", "Permanent settlement becomes the first visible civilization identity marker.", "Agriculture + Shelter", "Houses", "Critical"],
  ["established-first-trade-route", "Established First Trade Route", "Town Age", "Local exchange begins Commerce alignment growth.", "Commerce Research", "Route", "High"],
  ["built-first-city", "Built First City", "Town Age", "Labor, districts, and civic systems support large-scale growth.", "District Unlocks", "City", "Critical"],
  ["invented-writing", "Invented Writing", "Town Age", "Knowledge storage unlocks deeper research and civilization memory.", "Civilization Research", "Scroll", "High"],
  ["entered-industrial-age", "Entered Industrial Age", "Industrial Age", "Factories and machines reshape output, labor, and expansion speed.", "Manufacturing Research", "Factory", "Critical"],
  ["unlocked-electricity", "Unlocked Electricity", "Industrial Age", "Power grids enable scalable production and modern systems.", "Energy Research", "Zap", "Critical"],
  ["launched-first-satellite", "Launched First Satellite", "Modern Age", "Orbit becomes part of the main progression loop.", "Space Research", "Satellite", "Critical"],
  ["reached-orbit", "Reached Orbit", "Modern Age", "The home planet is no longer the only playable horizon.", "Orbital Launch", "Orbit", "Critical"],
  ["landed-on-moon", "Landed on the Moon", "Modern Age", "First off-world surface milestone.", "Lunar Exploration", "Moon", "Critical"],
  ["colonized-mars", "Colonized Mars", "Future Age", "The first major planetary colony reshapes identity and resource logistics.", "Planetary Colonization", "Mars", "Critical"],
  ["built-first-orbital-habitat", "Built First Orbital Habitat", "Future Age", "Permanent orbital living begins.", "Orbital Habitat Research", "Habitat", "High"],
  ["harvested-first-gas-giant", "Harvested First Gas Giant", "Future Age", "Gas giants become orbital fuel engines for expansion.", "Gas Giant Harvesting", "Cloud", "High"],
  ["launched-first-colony-ship", "Launched First Colony Ship", "Interstellar Age", "Humanity prepares to leave the home star system.", "Colony Ship Research", "Rocket", "Critical"],
  ["discovered-first-interstellar-system", "Discovered First Interstellar System", "Interstellar Age", "Probe networks reveal nearby systems.", "Interstellar Navigation", "Radar", "Critical"],
  ["founded-first-interstellar-colony", "Founded First Interstellar Colony", "Interstellar Age", "Civilization becomes multi-system.", "Interstellar Colony", "Flag", "Critical"],
  ["mapped-first-galactic-sector", "Mapped First Galactic Sector", "Galactic Age", "Sector-scale mapping opens galactic strategy.", "Galaxy Mapping", "Map", "Critical"],
  ["built-first-megastructure", "Built First Megastructure", "Galactic Age", "Massive construction projects define civilization scale.", "Megastructure Research", "Landmark", "Critical"],
  ["discovered-first-genesis-world", "Discovered First Genesis World", "Genesis Age", "Reality-scale worlds become reachable.", "Genesis World Discovery", "Sparkles", "Critical"],
  ["opened-genesis-gate", "Opened Genesis Gate", "Genesis Age", "Universal navigation begins the Harmony Ascendant path.", "Genesis Gate", "Gate", "Critical"]
];

export const civilizationMilestones: CivilizationMilestone[] = milestoneRows.map(([id, title, age, description, unlockedBy, icon, importance], index) => ({
  id: `milestone-${id}`,
  title,
  age,
  description,
  unlocked_by: unlockedBy,
  icon,
  importance,
  sort_order: index + 1,
  created_at: createdAt,
  updated_at: createdAt
}));

export const civilizationUnlockedMilestones: CivilizationUnlockedMilestone[] = [
  ["discovered-fire", "Start", "Initial survival loop unlocked."],
  ["built-first-shelter", "Start", "First building identity marker."],
  ["founded-first-camp", "Start", "Baseline group identity established."]
].map(([milestoneId, sourceType, notes]) => ({
  id: `unlocked-${milestoneId}`,
  civilization_id: primaryCivilizationId,
  milestone_id: `milestone-${milestoneId}`,
  unlocked_at: createdAt,
  source_type: sourceType,
  source_id: `milestone-${milestoneId}`,
  notes
}));

export const civilizationTitles: CivilizationTitle[] = [
  ["The Survivors", "Early title for Survival Age.", "Survival Age", "", "", "Default title in Survival Age.", "Baseline survival stability.", 10],
  ["The Settlers", "Village and Town growth identity.", "Village Age", "", "", "Default title for early settlement growth.", "Improves early population and storage planning.", 20],
  ["The Builders", "High buildings and Industry identity.", "Town Age", "Industry", "", "Industry is dominant and building completion passes threshold.", "Construction and building production bonuses.", 40],
  ["The Engineers", "Technology plus Industry identity.", "Industrial Age", "Technology", "Industry", "Technology and Industry are top alignments.", "Engineering, construction, and automation synergy.", 50],
  ["The Scientists", "Science plus Technology identity.", "Modern Age", "Science", "Technology", "Science and Technology are top alignments.", "Research output and breakthrough chance.", 55],
  ["The Explorers", "Discovery-focused civilization identity.", "Modern Age", "Exploration", "", "Exploration is dominant and discovered systems pass threshold.", "Survey speed and discovery point bonuses.", 60],
  ["The Industrialists", "Manufacturing and production identity.", "Industrial Age", "Industry", "", "Industry and manufacturing systems dominate.", "Manufacturing and extraction bonuses.", 65],
  ["The Harmonists", "Balanced high-Harmony identity.", "Future Age", "Harmony", "", "Harmony is dominant and alignments remain balanced.", "Stability and cross-alignment synergy.", 70],
  ["The Preservationists", "Nature plus Eco identity.", "Town Age", "Nature", "Eco", "Nature and Eco are top alignments.", "Sustainability, food, and terraforming bonuses.", 45],
  ["The Synth Architects", "Cyber plus Technology identity.", "Future Age", "Cyber", "Technology", "Cyber and Technology are top alignments.", "AI, automation, and simulation bonuses.", 75],
  ["The Traders", "Commerce-dominant identity.", "Town Age", "Commerce", "", "Commerce is dominant and trade systems exist.", "Trade value and coin generation bonuses.", 50],
  ["The Starbound", "Interstellar Exploration identity.", "Interstellar Age", "Exploration", "", "Interstellar Age and Exploration is dominant.", "Probe, colony ship, and survey range bonuses.", 90],
  ["The Galactic Founders", "Galactic multi-system identity.", "Galactic Age", "Exploration", "Industry", "Galactic Age and colonized systems pass threshold.", "Galaxy infrastructure and sector expansion bonuses.", 95],
  ["The Ascendants", "Genesis Age Harmony/Science/Exploration identity.", "Genesis Age", "Harmony", "Science", "Genesis Age reached.", "Genesis Gate and endgame path bonuses.", 100]
].map(([title, description, requiredAge, primaryAlignment, secondaryAlignment, requirementSummary, bonusSummary, priority]) => ({
  id: `civilization-title-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
  title: String(title),
  description: String(description),
  required_age: String(requiredAge),
  primary_alignment: String(primaryAlignment),
  secondary_alignment: String(secondaryAlignment),
  requirement_summary: String(requirementSummary),
  bonus_summary: String(bonusSummary),
  priority: Number(priority),
  created_at: createdAt,
  updated_at: createdAt
}));

export const civilizationBonuses: CivilizationBonus[] = [
  {
    id: "civilization-bonus-survival-stability",
    civilization_id: primaryCivilizationId,
    bonus_name: "Survival Stability",
    bonus_type: "Population",
    bonus_value: "+5% early population stability",
    source_type: "Title",
    source_id: "civilization-title-the-survivors",
    description: "The Survivors title reduces early volatility and supports the first growth loop.",
    active: true,
    created_at: createdAt,
    updated_at: createdAt
  },
  {
    id: "civilization-bonus-fire-knowledge",
    civilization_id: primaryCivilizationId,
    bonus_name: "Fire Knowledge",
    bonus_type: "Technology",
    bonus_value: "+3% early research generation",
    source_type: "Milestone",
    source_id: "milestone-discovered-fire",
    description: "Fire creates repeatable knowledge and early technical confidence.",
    active: true,
    created_at: createdAt,
    updated_at: createdAt
  },
  {
    id: "civilization-bonus-shelter-labor",
    civilization_id: primaryCivilizationId,
    bonus_name: "Shelter Labor",
    bonus_type: "Industry",
    bonus_value: "+3% early construction speed",
    source_type: "Milestone",
    source_id: "milestone-built-first-shelter",
    description: "Basic shelter teaches material handling and work coordination.",
    active: true,
    created_at: createdAt,
    updated_at: createdAt
  }
];

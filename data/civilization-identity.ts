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
    name: "Ancient Age",
    description: "Permanent settlements, agriculture, writing, early trade, monuments, and foundational civic structure."
  },
  {
    name: "Medieval Age",
    description: "Road networks, markets, guilds, organized labor, engineering, navigation, and regional civilization growth."
  },
  {
    name: "Renaissance Age",
    description: "Humanism, navigation, banking, printing, art, science, and early global exchange accelerate civilization systems."
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
    name: "Space Age",
    description: "Orbital launch, satellites, lunar missions, Mars colonies, orbital habitats, and home-system expansion."
  },
  {
    name: "Interstellar Age",
    description: "Nearby star systems, generation ships, interstellar navigation, deep space research, and multi-system expansion."
  },
  {
    name: "Galactic Age",
    description: "Galaxy-wide exploration, warp infrastructure, megaprojects, distant sectors, Genesis Gates, and galactic-scale civilization."
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
    emerging_alignment: "Nature",
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
  ["Industry", 38, "Manufacturing, mining, infrastructure, extraction, production chains, and megaprojects."],
  ["Technology", 46, "Research, science, discovery, innovation, advanced unlock speed, and breakthrough systems."],
  ["Cyber", 18, "Automation, robotics, artificial intelligence, simulations, and machine integration."],
  ["Nature", 24, "Biology, terraforming, living ecosystems, environmental harmony, and population sustainability."],
  ["Corporate", 20, "Trade, economy, commerce, influence, logistics, markets, and resource selling efficiency."]
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
    id: "alignment-history-survey-technology",
    civilization_id: primaryCivilizationId,
    alignment_name: "Technology",
    previous_score: 24,
    new_score: 31,
    change_amount: 7,
    source_type: "System",
    source_id: "system-sol",
    reason: "The Sol starting map creates the first scientific discovery path.",
    created_at: createdAt
  }
];

const milestoneRows: Array<[string, string, string, string, string, string, string]> = [
  ["discovered-fire", "Discovered Fire", "Survival Age", "Humanity learns to preserve heat, cook food, and create safety around the first camps.", "Start", "Flame", "Critical"],
  ["built-first-shelter", "Built First Shelter", "Survival Age", "Basic structures protect early population and begin the building loop.", "Start", "Home", "Critical"],
  ["founded-first-camp", "Founded First Camp", "Survival Age", "Small groups organize labor, storage, and shared survival tasks.", "Start", "Tent", "High"],
  ["unlocked-agriculture", "Unlocked Agriculture", "Ancient Age", "Food production creates permanent settlement pressure and population stability.", "Agriculture Research", "Wheat", "Critical"],
  ["founded-first-village", "Founded First Village", "Ancient Age", "Permanent settlement becomes the first visible civilization identity marker.", "Agriculture + Shelter", "Houses", "Critical"],
  ["invented-writing", "Invented Writing", "Ancient Age", "Knowledge storage unlocks deeper research and civilization memory.", "Civilization Research", "Scroll", "High"],
  ["established-first-trade-route", "Established First Trade Route", "Medieval Age", "Regional exchange begins Corporate alignment growth.", "Trade Research", "Route", "High"],
  ["built-first-city", "Built First City", "Medieval Age", "Labor, districts, and civic systems support large-scale growth.", "District Unlocks", "City", "Critical"],
  ["formed-first-guild", "Formed First Guild", "Medieval Age", "Specialized labor and logistics begin the long production-chain loop.", "Guild Research", "Landmark", "High"],
  ["sparked-renaissance", "Sparked the Renaissance", "Renaissance Age", "Art, finance, navigation, and science begin reinforcing each other as connected systems.", "Printing + Banking + Navigation", "Sparkles", "Critical"],
  ["charted-ocean-routes", "Charted Ocean Routes", "Renaissance Age", "Long-range navigation expands trade, exploration, and resource exchange.", "Navigation Research", "Compass", "High"],
  ["entered-industrial-age", "Entered Industrial Age", "Industrial Age", "Factories and machines reshape output, labor, and expansion speed.", "Manufacturing Research", "Factory", "Critical"],
  ["unlocked-electricity", "Unlocked Electricity", "Industrial Age", "Power grids enable scalable production and modern systems.", "Energy Research", "Zap", "Critical"],
  ["launched-first-satellite", "Launched First Satellite", "Modern Age", "Orbit becomes part of the main progression loop.", "Space Research", "Satellite", "Critical"],
  ["reached-orbit", "Reached Orbit", "Modern Age", "The home planet is no longer the only playable horizon.", "Orbital Launch", "Orbit", "Critical"],
  ["landed-on-moon", "Landed on the Moon", "Modern Age", "First off-world surface milestone.", "Lunar Exploration", "Moon", "Critical"],
  ["colonized-mars", "Colonized Mars", "Space Age", "The first major planetary colony reshapes identity and resource logistics.", "Planetary Colonization", "Mars", "Critical"],
  ["built-first-orbital-habitat", "Built First Orbital Habitat", "Space Age", "Permanent orbital living begins.", "Orbital Habitat Research", "Habitat", "High"],
  ["harvested-first-gas-giant", "Harvested First Gas Giant", "Space Age", "Gas giants become orbital fuel engines for expansion.", "Gas Giant Harvesting", "Cloud", "High"],
  ["launched-first-colony-ship", "Launched First Colony Ship", "Interstellar Age", "Humanity prepares to leave the home star system.", "Colony Ship Research", "Rocket", "Critical"],
  ["discovered-first-interstellar-system", "Discovered First Interstellar System", "Interstellar Age", "Probe networks reveal nearby systems.", "Interstellar Navigation", "Radar", "Critical"],
  ["founded-first-interstellar-colony", "Founded First Interstellar Colony", "Interstellar Age", "Civilization becomes multi-system.", "Interstellar Colony", "Flag", "Critical"],
  ["mapped-first-galactic-sector", "Mapped First Galactic Sector", "Galactic Age", "Sector-scale mapping opens galactic strategy.", "Galaxy Mapping", "Map", "Critical"],
  ["built-first-megastructure", "Built First Megastructure", "Galactic Age", "Massive construction projects define civilization scale.", "Megastructure Research", "Landmark", "Critical"],
  ["discovered-first-genesis-world", "Discovered First Genesis World", "Galactic Age", "Reality-scale worlds become reachable without creating a separate era.", "Genesis World Discovery", "Sparkles", "Critical"],
  ["opened-genesis-gate", "Opened Genesis Gate", "Galactic Age", "Universal navigation becomes a late Galactic endgame milestone.", "Genesis Gate", "Gate", "Critical"]
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
  ["The Settlers", "Ancient settlement growth identity.", "Ancient Age", "", "", "Default title for early settlement growth.", "Improves early population and storage planning.", 20],
  ["The Builders", "High buildings and Industry identity.", "Medieval Age", "Industry", "", "Industry is dominant and building completion passes threshold.", "Construction and building production bonuses.", 40],
  ["The Patrons", "Renaissance civic and artistic identity.", "Renaissance Age", "Corporate", "Technology", "Renaissance reached with trade, art, and science systems active.", "Culture, banking, navigation, and research synergy.", 45],
  ["The Engineers", "Technology plus Industry identity.", "Industrial Age", "Technology", "Industry", "Technology and Industry are top alignments.", "Engineering, construction, and automation synergy.", 50],
  ["High-Tech Singularity", "Technology-dominant civilization identity.", "Modern Age", "Technology", "", "Technology is dominant and innovation systems pass threshold.", "Research output, scientific discovery, and breakthrough chance.", 75],
  ["The Industrialists", "Manufacturing and production identity.", "Industrial Age", "Industry", "", "Industry and manufacturing systems dominate.", "Manufacturing and extraction bonuses.", 65],
  ["Industrial Empire", "Industry-dominant civilization identity.", "Industrial Age", "Industry", "", "Industry is dominant across manufacturing, mining, infrastructure, and megaprojects.", "Production chains, construction speed, extraction, and megaproject bonuses.", 80],
  ["Gaia Civilization", "Nature-dominant civilization identity.", "Space Age", "Nature", "", "Nature is dominant and living ecosystems or terraforming systems pass threshold.", "Biology, terraforming, food, and ecological stability bonuses.", 80],
  ["AI Collective", "Cyber-dominant civilization identity.", "Space Age", "Cyber", "", "Cyber is dominant and automation or AI systems pass threshold.", "Automation, robotics, AI, and machine integration bonuses.", 82],
  ["Corporate Consortium", "Corporate-dominant civilization identity.", "Medieval Age", "Corporate", "", "Corporate is dominant and trade, logistics, or market systems exist.", "Trade value, logistics, influence, and market bonuses.", 72],
  ["Industrial Technocracy", "Industry plus Technology hybrid identity.", "Industrial Age", "Industry", "Technology", "Industry and Technology are top alignments.", "Engineering, automation, construction, and scientific production synergy.", 86],
  ["Machine Singularity", "Cyber plus Technology hybrid identity.", "Space Age", "Cyber", "Technology", "Cyber and Technology are top alignments.", "AI, automation, simulation, and advanced research bonuses.", 90],
  ["Innovation Syndicate", "Technology plus Corporate hybrid identity.", "Modern Age", "Technology", "Corporate", "Technology and Corporate are top alignments.", "Research commercialization, market influence, and logistics innovation bonuses.", 84],
  ["Interstellar Conglomerate", "Corporate-led interstellar expansion identity.", "Interstellar Age", "Corporate", "Industry", "Interstellar Age reached and Corporate plus Industry are top alignments.", "Trade routes, colony logistics, and multi-system infrastructure bonuses.", 92],
  ["Bioengineering Society", "Nature plus Technology hybrid identity.", "Space Age", "Nature", "Technology", "Nature and Technology are top alignments.", "Biology, terraforming, research, and living-world compatibility bonuses.", 86],
  ["Sustainable Industrial Alliance", "Industry plus Nature hybrid identity.", "Galactic Age", "Industry", "Nature", "Galactic Age reached with strong Industry and Nature scores.", "Megaproject production with ecological stability and terraforming synergy.", 94],
  ["The Galactic Founders", "Galactic multi-system identity.", "Galactic Age", "Technology", "Industry", "Galactic Age and colonized systems pass threshold.", "Galaxy infrastructure, sector expansion, and long-term civilization bonuses.", 96]
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

import type { Building } from "@/types/schema";

export type BuildingTaxonomyFamily = {
  id: string;
  displayName: string;
  displayOrder: number;
  description: string;
  subcategories: Array<{
    id: string;
    displayName: string;
    displayOrder: number;
    aliases?: string[];
  }>;
};

export type BuildingClassification = {
  id: string;
  buildingId: string;
  buildingName: string;
  primaryFamilyId: string;
  primaryFamilyName: string;
  subcategoryId: string;
  subcategoryName: string;
  legacyCategory: string;
  era: string;
  civilizationAvailability: string[];
  planetAvailability: string[];
  districtAvailability: string[];
  resourceProducerIds: string[];
  resourceConsumerIds: string[];
  populationEffects: {
    populationBonus: number;
    populationCapacity: number;
    populationGrowth: number;
  };
  researchEffects: {
    researchPerSecond: number;
    researchBonus: number;
  };
  workforceEffects: {
    laborRequirement: number;
    laborPerSecond: number;
  };
  unlockRequirements: {
    researchId: string | null;
    buildingId: string | null;
  };
  upgradePath: string;
  migrationConfidence: "legacy_category_map" | "subcategory_keyword" | "manual_review_required";
};

function sub(id: string, displayName: string, displayOrder: number, aliases: string[] = []) {
  return { id, displayName, displayOrder, aliases };
}

export const canonicalBuildingTaxonomyVersion = "building-taxonomy-v1";

export const canonicalBuildingTaxonomy: BuildingTaxonomyFamily[] = [
  {
    id: "population-housing",
    displayName: "Population & Housing",
    displayOrder: 1,
    description: "Population capacity, settlement housing, residential growth, and future orbital or colony habitation.",
    subcategories: [
      sub("shelters", "Shelters", 1), sub("housing", "Housing", 2), sub("habitats", "Habitats", 3), sub("arcologies", "Arcologies", 4), sub("residential-towers", "Residential Towers", 5), sub("colony-housing", "Colony Housing", 6), sub("orbital-habitats", "Orbital Habitats", 7), sub("population-capacity", "Population Capacity", 8), sub("population-growth", "Population Growth", 9)
    ]
  },
  {
    id: "agriculture-food",
    displayName: "Agriculture & Food",
    displayOrder: 2,
    description: "Food production, farming chains, livestock, hydroponics, and advanced biological food systems.",
    subcategories: [
      sub("farms", "Farms", 1), sub("ranches", "Ranches", 2), sub("orchards", "Orchards", 3), sub("hydroponics", "Hydroponics", 4), sub("vertical-farms", "Vertical Farms", 5), sub("food-processing", "Food Processing", 6), sub("greenhouses", "Greenhouses", 7), sub("fishing", "Fishing", 8), sub("algae", "Algae", 9), sub("livestock", "Livestock", 10)
    ]
  },
  {
    id: "resources-extraction",
    displayName: "Resources & Extraction",
    displayOrder: 3,
    description: "Material gathering, mining, planetary extraction, and future asteroid or rare-material collection.",
    subcategories: [
      sub("mining", "Mining", 1), sub("stone", "Stone", 2), sub("ore", "Ore", 3), sub("coal", "Coal", 4), sub("oil", "Oil", 5), sub("gas", "Gas", 6), sub("ice", "Ice", 7), sub("crystal-mining", "Crystal Mining", 8), sub("rare-materials", "Rare Materials", 9), sub("asteroid-mining", "Asteroid Mining", 10), sub("planetary-extraction", "Planetary Extraction", 11)
    ]
  },
  {
    id: "production",
    displayName: "Production",
    displayOrder: 4,
    description: "Workshops, crafting, refining, manufacturing, and future matter assembly production loops.",
    subcategories: [
      sub("workshops", "Workshops", 1), sub("crafting", "Crafting", 2), sub("refining", "Refining", 3), sub("manufacturing", "Manufacturing", 4), sub("factories", "Factories", 5), sub("assembly", "Assembly", 6), sub("nanofabrication", "Nanofabrication", 7), sub("matter-assembly", "Matter Assembly", 8)
    ]
  },
  {
    id: "industry",
    displayName: "Industry",
    displayOrder: 5,
    description: "Heavy industry, advanced industrial complexes, electronics, chemicals, vehicles, and ship construction.",
    subcategories: [
      sub("steel", "Steel", 1), sub("electronics", "Electronics", 2), sub("chemicals", "Chemicals", 3), sub("heavy-industry", "Heavy Industry", 4), sub("machine-shops", "Machine Shops", 5), sub("vehicle-plants", "Vehicle Plants", 6), sub("ship-construction", "Ship Construction", 7), sub("industrial-complexes", "Industrial Complexes", 8)
    ]
  },
  {
    id: "utilities-infrastructure",
    displayName: "Utilities & Infrastructure",
    displayOrder: 6,
    description: "Core infrastructure, utilities, roads, logistics, communications, and large transport systems.",
    subcategories: [
      sub("roads", "Roads", 1), sub("bridges", "Bridges", 2), sub("power", "Power", 3), sub("water", "Water", 4), sub("waste", "Waste", 5), sub("communications", "Communications", 6), sub("transportation", "Transportation", 7), sub("logistics", "Logistics", 8), sub("pipelines", "Pipelines", 9), sub("rail", "Rail", 10), sub("hyperloop", "Hyperloop", 11), sub("space-elevator", "Space Elevator", 12)
    ]
  },
  {
    id: "research-education",
    displayName: "Research & Education",
    displayOrder: 7,
    description: "Education, science, research campuses, observatories, AI labs, and quantum labs.",
    subcategories: [
      sub("schools", "Schools", 1), sub("libraries", "Libraries", 2), sub("laboratories", "Laboratories", 3), sub("universities", "Universities", 4), sub("observatories", "Observatories", 5), sub("research-institutes", "Research Institutes", 6), sub("ai-labs", "AI Labs", 7), sub("quantum-labs", "Quantum Labs", 8), sub("science-campuses", "Science Campuses", 9)
    ]
  },
  {
    id: "commerce-trade",
    displayName: "Commerce & Trade",
    displayOrder: 8,
    description: "Markets, banking, corporate and financial centers, and future galactic exchange infrastructure.",
    subcategories: [
      sub("markets", "Markets", 1), sub("stores", "Stores", 2), sub("banks", "Banks", 3), sub("stock-exchanges", "Stock Exchanges", 4), sub("trade-centers", "Trade Centers", 5), sub("corporate-offices", "Corporate Offices", 6), sub("financial-districts", "Financial Districts", 7), sub("galactic-exchange", "Galactic Exchange", 8)
    ]
  },
  {
    id: "government-administration",
    displayName: "Government & Administration",
    displayOrder: 9,
    description: "Administration, law, diplomacy, taxation, and local through galactic government structures.",
    subcategories: [
      sub("town-hall", "Town Hall", 1), sub("capitol", "Capitol", 2), sub("courthouse", "Courthouse", 3), sub("administration", "Administration", 4), sub("embassies", "Embassies", 5), sub("tax-office", "Tax Office", 6), sub("colonial-government", "Colonial Government", 7), sub("planetary-government", "Planetary Government", 8), sub("galactic-council", "Galactic Council", 9)
    ]
  },
  {
    id: "health-welfare",
    displayName: "Health & Welfare",
    displayOrder: 10,
    description: "Health, emergency services, wellness, biotech support, and population care facilities.",
    subcategories: [
      sub("clinic", "Clinic", 1), sub("hospital", "Hospital", 2), sub("medical-center", "Medical Center", 3), sub("biotech", "Biotech", 4), sub("wellness", "Wellness", 5), sub("emergency-services", "Emergency Services", 6), sub("care-facilities", "Care Facilities", 7)
    ]
  },
  {
    id: "culture-society",
    displayName: "Culture & Society",
    displayOrder: 11,
    description: "Culture, identity, tourism, public spaces, entertainment, sports, media, and arts.",
    subcategories: [
      sub("museum", "Museum", 1), sub("park", "Park", 2), sub("theater", "Theater", 3), sub("monument", "Monument", 4), sub("temple", "Temple", 5), sub("entertainment", "Entertainment", 6), sub("tourism", "Tourism", 7), sub("sports", "Sports", 8), sub("media", "Media", 9), sub("arts", "Arts", 10)
    ]
  },
  {
    id: "security-defense",
    displayName: "Security & Defense",
    displayOrder: 12,
    description: "Security, military, defense grids, shields, orbital defense, and early warning systems.",
    subcategories: [
      sub("police", "Police", 1), sub("security", "Security", 2), sub("defense-grid", "Defense Grid", 3), sub("watchtower", "Watchtower", 4), sub("military", "Military", 5), sub("orbital-defense", "Orbital Defense", 6), sub("shield-network", "Shield Network", 7), sub("early-warning", "Early Warning", 8)
    ]
  },
  {
    id: "space-exploration",
    displayName: "Space & Exploration",
    displayOrder: 13,
    description: "Launch pads, mission control, spaceports, docks, shipyards, probes, and scanning facilities.",
    subcategories: [
      sub("launch-pad", "Launch Pad", 1), sub("mission-control", "Mission Control", 2), sub("spaceport", "Spaceport", 3), sub("orbital-dock", "Orbital Dock", 4), sub("shipyard", "Shipyard", 5), sub("explorer-hq", "Explorer HQ", 6), sub("deep-space-scanner", "Deep Space Scanner", 7), sub("probe-facility", "Probe Facility", 8)
    ]
  },
  {
    id: "planetary-development",
    displayName: "Planetary Development",
    displayOrder: 14,
    description: "Terraforming, atmospheric control, planetary shields, ecology, ocean engineering, and geological stabilization.",
    subcategories: [
      sub("terraforming", "Terraforming", 1), sub("atmospheric-processing", "Atmospheric Processing", 2), sub("weather-control", "Weather Control", 3), sub("planetary-shield", "Planetary Shield", 4), sub("ecology", "Ecology", 5), sub("ocean-engineering", "Ocean Engineering", 6), sub("geological-stabilization", "Geological Stabilization", 7)
    ]
  },
  {
    id: "civilization-systems",
    displayName: "Civilization Systems",
    displayOrder: 15,
    description: "Faith, ideology, diplomacy, law, education systems, economic policy, civil services, and public works.",
    subcategories: [
      sub("faith", "Faith", 1), sub("ideology", "Ideology", 2), sub("diplomacy", "Diplomacy", 3), sub("law", "Law", 4), sub("education-systems", "Education Systems", 5), sub("economic-policy", "Economic Policy", 6), sub("civil-services", "Civil Services", 7), sub("public-works", "Public Works", 8)
    ]
  },
  {
    id: "wonders-megastructures",
    displayName: "Wonders & Megastructures",
    displayOrder: 16,
    description: "Wonders, megastructures, stellar engineering, gateways, habitats, and endgame construction.",
    subcategories: [
      sub("dyson-swarm", "Dyson Swarm", 1), sub("dyson-sphere", "Dyson Sphere", 2), sub("ringworld", "Ringworld", 3), sub("orbital-ring", "Orbital Ring", 4), sub("gateway", "Gateway", 5), sub("quantum-relay", "Quantum Relay", 6), sub("stellar-forge", "Stellar Forge", 7), sub("planet-cracker", "Planet Cracker", 8), sub("ark-habitat", "Ark Habitat", 9)
    ]
  },
  {
    id: "ancient-historical",
    displayName: "Ancient & Historical",
    displayOrder: 17,
    description: "Ruins, monuments, historic sites, archaeology, preservation, and historical museums.",
    subcategories: [
      sub("ruins", "Ruins", 1), sub("monuments", "Monuments", 2), sub("historic-sites", "Historic Sites", 3), sub("archaeology", "Archaeology", 4), sub("preservation", "Preservation", 5), sub("museums", "Museums", 6)
    ]
  },
  {
    id: "alien-exotic",
    displayName: "Alien & Exotic",
    displayOrder: 18,
    description: "Alien structures, ancient relics, precursor technology, xeno biology, artifacts, and exotic matter.",
    subcategories: [
      sub("alien-structures", "Alien Structures", 1), sub("ancient-relics", "Ancient Relics", 2), sub("precursor-technology", "Precursor Technology", 3), sub("xeno-biology", "Xeno Biology", 4), sub("artifacts", "Artifacts", 5), sub("exotic-matter", "Exotic Matter", 6)
    ]
  },
  {
    id: "environment-ecology",
    displayName: "Environment & Ecology",
    displayOrder: 19,
    description: "Forestry, nature preserves, wildlife, climate, pollution, restoration, and carbon capture.",
    subcategories: [
      sub("forestry", "Forestry", 1), sub("nature-preserve", "Nature Preserve", 2), sub("wildlife", "Wildlife", 3), sub("climate", "Climate", 4), sub("pollution", "Pollution", 5), sub("environmental-restoration", "Environmental Restoration", 6), sub("carbon-capture", "Carbon Capture", 7)
    ]
  },
  {
    id: "special",
    displayName: "Special",
    displayOrder: 20,
    description: "Quest, tutorial, seasonal, developer, temporary, and scenario-specific buildings.",
    subcategories: [
      sub("quest-buildings", "Quest Buildings", 1), sub("tutorial-buildings", "Tutorial Buildings", 2), sub("seasonal", "Seasonal", 3), sub("developer", "Developer", 4), sub("temporary", "Temporary", 5), sub("scenario-specific", "Scenario-specific", 6)
    ]
  }
];

export const legacyBuildingCategoryMapping: Record<string, { familyId: string; subcategoryId: string; notes: string }> = {
  residential: { familyId: "population-housing", subcategoryId: "housing", notes: "Legacy Residential maps to population capacity and housing." },
  production: { familyId: "production", subcategoryId: "workshops", notes: "Legacy Production maps to workshops/manufacturing production." },
  utility: { familyId: "utilities-infrastructure", subcategoryId: "logistics", notes: "Legacy Utility maps to infrastructure/logistics until refined." },
  research: { familyId: "research-education", subcategoryId: "laboratories", notes: "Legacy Research maps to research and education facilities." },
  commercial: { familyId: "commerce-trade", subcategoryId: "markets", notes: "Legacy Commercial maps to markets and commerce." },
  culture: { familyId: "culture-society", subcategoryId: "museum", notes: "Legacy Culture maps to culture and society." },
  government: { familyId: "government-administration", subcategoryId: "administration", notes: "Legacy Government maps to administration." },
  space: { familyId: "space-exploration", subcategoryId: "spaceport", notes: "Legacy Space maps to exploration and orbital development." },
  specialization: { familyId: "civilization-systems", subcategoryId: "public-works", notes: "Legacy Specialization maps to civilization systems until manually refined." }
};

const keywordSubcategoryRules: Array<{ pattern: RegExp; familyId: string; subcategoryId: string }> = [
  { pattern: /shelter|hut|tent|cabin/i, familyId: "population-housing", subcategoryId: "shelters" },
  { pattern: /house|home|apartment|residence|boarding/i, familyId: "population-housing", subcategoryId: "housing" },
  { pattern: /habitat|hab/i, familyId: "population-housing", subcategoryId: "habitats" },
  { pattern: /farm|field|crop/i, familyId: "agriculture-food", subcategoryId: "farms" },
  { pattern: /ranch|pen|livestock|animal/i, familyId: "agriculture-food", subcategoryId: "livestock" },
  { pattern: /greenhouse/i, familyId: "agriculture-food", subcategoryId: "greenhouses" },
  { pattern: /hydroponic/i, familyId: "agriculture-food", subcategoryId: "hydroponics" },
  { pattern: /mine|quarry|mining/i, familyId: "resources-extraction", subcategoryId: "mining" },
  { pattern: /oil/i, familyId: "resources-extraction", subcategoryId: "oil" },
  { pattern: /gas/i, familyId: "resources-extraction", subcategoryId: "gas" },
  { pattern: /workshop|forge|craft/i, familyId: "production", subcategoryId: "workshops" },
  { pattern: /factory|manufactur/i, familyId: "production", subcategoryId: "factories" },
  { pattern: /refin/i, familyId: "production", subcategoryId: "refining" },
  { pattern: /steel/i, familyId: "industry", subcategoryId: "steel" },
  { pattern: /electronic/i, familyId: "industry", subcategoryId: "electronics" },
  { pattern: /road/i, familyId: "utilities-infrastructure", subcategoryId: "roads" },
  { pattern: /bridge/i, familyId: "utilities-infrastructure", subcategoryId: "bridges" },
  { pattern: /power|generator|plant/i, familyId: "utilities-infrastructure", subcategoryId: "power" },
  { pattern: /school/i, familyId: "research-education", subcategoryId: "schools" },
  { pattern: /library/i, familyId: "research-education", subcategoryId: "libraries" },
  { pattern: /lab|laboratory/i, familyId: "research-education", subcategoryId: "laboratories" },
  { pattern: /university/i, familyId: "research-education", subcategoryId: "universities" },
  { pattern: /observatory/i, familyId: "research-education", subcategoryId: "observatories" },
  { pattern: /market|store|shop/i, familyId: "commerce-trade", subcategoryId: "markets" },
  { pattern: /bank/i, familyId: "commerce-trade", subcategoryId: "banks" },
  { pattern: /town hall|city hall/i, familyId: "government-administration", subcategoryId: "town-hall" },
  { pattern: /court/i, familyId: "government-administration", subcategoryId: "courthouse" },
  { pattern: /clinic/i, familyId: "health-welfare", subcategoryId: "clinic" },
  { pattern: /hospital|medical/i, familyId: "health-welfare", subcategoryId: "hospital" },
  { pattern: /park/i, familyId: "culture-society", subcategoryId: "park" },
  { pattern: /museum/i, familyId: "culture-society", subcategoryId: "museum" },
  { pattern: /police|security/i, familyId: "security-defense", subcategoryId: "security" },
  { pattern: /tower|watch/i, familyId: "security-defense", subcategoryId: "watchtower" },
  { pattern: /launch/i, familyId: "space-exploration", subcategoryId: "launch-pad" },
  { pattern: /spaceport/i, familyId: "space-exploration", subcategoryId: "spaceport" },
  { pattern: /terraform/i, familyId: "planetary-development", subcategoryId: "terraforming" },
  { pattern: /ruin|archae/i, familyId: "ancient-historical", subcategoryId: "archaeology" },
  { pattern: /alien|xeno/i, familyId: "alien-exotic", subcategoryId: "alien-structures" },
  { pattern: /forest|nature|wildlife|carbon|pollution/i, familyId: "environment-ecology", subcategoryId: "environmental-restoration" }
];

function fallbackFamily() {
  return canonicalBuildingTaxonomy.find((family) => family.id === "special") ?? canonicalBuildingTaxonomy[canonicalBuildingTaxonomy.length - 1];
}

export function buildingTaxonomyFamily(familyId: string) {
  return canonicalBuildingTaxonomy.find((family) => family.id === familyId) ?? fallbackFamily();
}

export function buildingTaxonomySubcategory(familyId: string, subcategoryId: string) {
  const family = buildingTaxonomyFamily(familyId);
  return family.subcategories.find((subcategory) => subcategory.id === subcategoryId) ?? family.subcategories[0];
}

function normalizedLegacyCategory(category: string) {
  return category.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function classifyBuilding(building: Building): BuildingClassification {
  const haystack = `${building.name} ${building.description} ${building.category} ${building.notes} ${building.icon_name} ${building.model_name}`.toLowerCase();
  const keywordRule = keywordSubcategoryRules.find((rule) => rule.pattern.test(haystack));
  const legacy = legacyBuildingCategoryMapping[normalizedLegacyCategory(building.category)];
  const familyId = keywordRule?.familyId ?? legacy?.familyId ?? "special";
  const subcategoryId = keywordRule?.subcategoryId ?? legacy?.subcategoryId ?? "scenario-specific";
  const family = buildingTaxonomyFamily(familyId);
  const subcategory = buildingTaxonomySubcategory(family.id, subcategoryId);
  const produces = [
    building.income_credits_sec > 0 ? "ECON-CREDITS" : null,
    building.income_labor_sec > 0 ? "ECON-LABOR" : null,
    building.income_experimental_sec > 0 ? "ECON-RESEARCH" : null
  ].filter((value): value is string => Boolean(value));
  const consumes = [
    building.cost_credits > 0 ? "ECON-CREDITS" : null,
    building.cost_labor > 0 ? "ECON-LABOR" : null,
    building.cost_experimental > 0 ? "ECON-RESEARCH" : null
  ].filter((value): value is string => Boolean(value));

  return {
    id: `building_classification_${building.id}`,
    buildingId: building.id,
    buildingName: building.name,
    primaryFamilyId: family.id,
    primaryFamilyName: family.displayName,
    subcategoryId: subcategory.id,
    subcategoryName: subcategory.displayName,
    legacyCategory: building.category,
    era: building.era,
    civilizationAvailability: building.civilization ? [building.civilization] : ["any"],
    planetAvailability: ["standard"],
    districtAvailability: building.district_id ? [building.district_id] : ["unassigned"],
    resourceProducerIds: produces,
    resourceConsumerIds: consumes,
    populationEffects: {
      populationBonus: building.population_bonus,
      populationCapacity: building.population_bonus,
      populationGrowth: 0
    },
    researchEffects: {
      researchPerSecond: building.income_experimental_sec,
      researchBonus: 0
    },
    workforceEffects: {
      laborRequirement: building.labor_requirement,
      laborPerSecond: building.income_labor_sec
    },
    unlockRequirements: {
      researchId: building.unlock_research_id,
      buildingId: building.unlock_building
    },
    upgradePath: building.upgrade_chain || "none",
    migrationConfidence: keywordRule ? "subcategory_keyword" : legacy ? "legacy_category_map" : "manual_review_required"
  };
}

export function buildBuildingClassifications(buildings: Building[]) {
  return buildings.map(classifyBuilding).sort((left, right) => {
    const leftFamily = buildingTaxonomyFamily(left.primaryFamilyId);
    const rightFamily = buildingTaxonomyFamily(right.primaryFamilyId);
    return leftFamily.displayOrder - rightFamily.displayOrder || left.subcategoryName.localeCompare(right.subcategoryName) || left.buildingName.localeCompare(right.buildingName);
  });
}

export function validateBuildingTaxonomy(buildings: Building[]) {
  const issues: Array<{ severity: "error" | "warning"; code: string; message: string; records: string[] }> = [];
  const familyIds = new Set(canonicalBuildingTaxonomy.map((family) => family.id));
  const orderValues = canonicalBuildingTaxonomy.map((family) => family.displayOrder);
  const classifications = buildBuildingClassifications(buildings);

  if (canonicalBuildingTaxonomy.length !== 20) {
    issues.push({ severity: "error", code: "building_taxonomy_family_count", message: "Canonical building taxonomy must define exactly 20 primary families.", records: [] });
  }
  if (new Set(orderValues).size !== orderValues.length) {
    issues.push({ severity: "error", code: "building_taxonomy_order_duplicate", message: "Building taxonomy family display orders must be unique.", records: [] });
  }
  for (const family of canonicalBuildingTaxonomy) {
    if (!family.subcategories.length) {
      issues.push({ severity: "error", code: "building_taxonomy_subcategory_missing", message: `${family.displayName} must include at least one subcategory.`, records: [family.id] });
    }
  }

  const duplicateAssignments = classifications.filter((classification) => !familyIds.has(classification.primaryFamilyId));
  if (duplicateAssignments.length) {
    issues.push({ severity: "error", code: "building_taxonomy_family_invalid", message: "Some buildings resolve to a taxonomy family that does not exist.", records: duplicateAssignments.map((classification) => classification.buildingId) });
  }

  const missingAssignments = buildings.filter((building) => classifications.filter((classification) => classification.buildingId === building.id).length !== 1);
  if (missingAssignments.length) {
    issues.push({ severity: "error", code: "building_taxonomy_assignment_missing", message: "Every building must resolve to exactly one primary family.", records: missingAssignments.map((building) => building.id) });
  }

  const manualReview = classifications.filter((classification) => classification.migrationConfidence === "manual_review_required");
  if (manualReview.length) {
    issues.push({ severity: "warning", code: "building_taxonomy_manual_review", message: "Some buildings need reviewed manual taxonomy assignment.", records: manualReview.map((classification) => classification.buildingId) });
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
    classifications
  };
}


import type {
  AssetRecord,
  Building,
  ChangelogEntry,
  District,
  GameData,
  ReleaseNote,
  ResearchBranch,
  ResearchNode,
  Status,
  UnlockMatrixRow,
  Wonder
} from "@/types/schema";

export const civilizations = [
  "Eco-Green Utopia",
  "High Tech Singularity",
  "Industrial Empire",
  "Cyberpunk Megacity",
  "Metropolis Prime",
  "Harmony Ascendant"
] as const;

const eras = [
  "Foundation",
  "Expansion",
  "Industrial",
  "Digital",
  "Orbital"
] as const;

const statuses: Status[] = ["Draft", "In Progress", "Ready", "Blocked"];

export const researchBranches: ResearchBranch[] = [
  { id: "branch-agriculture", name: "Agriculture", purpose: "Food loops, ecology, and population stability." },
  { id: "branch-engineering", name: "Engineering", purpose: "Construction capability, terrain work, and structural unlocks." },
  { id: "branch-manufacturing", name: "Manufacturing", purpose: "Production throughput, refined materials, and factory scaling." },
  { id: "branch-energy", name: "Energy", purpose: "Power generation, storage, and advanced energy economies." },
  { id: "branch-commerce", name: "Commerce", purpose: "Credits, trade, market rules, and player economy pacing." },
  { id: "branch-transportation", name: "Transportation", purpose: "Movement, logistics, roads, rail, flight, and orbital transit." },
  { id: "branch-computing", name: "Computing", purpose: "Automation, data, AI, simulation, and optimization systems." },
  { id: "branch-medicine", name: "Medicine", purpose: "Health, lifespan, happiness, and population resilience." },
  { id: "branch-space", name: "Space", purpose: "Planetary expansion, satellites, colonization, and stellar infrastructure." },
  { id: "branch-civilization", name: "Civilization", purpose: "Culture, governance, wonders, and civilization identity." }
];

const branchUnlocks: Record<string, string[]> = {
  Agriculture: ["Hydroponic Farm", "Bio Dome", "Soil Lab"],
  Engineering: ["Survey Yard", "Civil Works Depot", "Mega Scaffold"],
  Manufacturing: ["Assembler", "Foundry", "Nanoforge"],
  Energy: ["Solar Array", "Fusion Plant", "Grid Battery"],
  Commerce: ["Trade Hub", "Exchange", "Galactic Market"],
  Transportation: ["Transit Depot", "Maglev Station", "Orbital Gate"],
  Computing: ["Data Center", "AI Core", "Simulation Nexus"],
  Medicine: ["Clinic", "Gene Lab", "Longevity Institute"],
  Space: ["Launch Pad", "Satellite Uplink", "Colony Port"],
  Civilization: ["Civic Plaza", "Archive", "World Wonder"]
};

function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function generateResearchNodes(): ResearchNode[] {
  return researchBranches.flatMap((branch, branchIndex) =>
    Array.from({ length: 15 }, (_, index) => {
      const eraIndex = Math.floor(index / 3);
      const unlock = branchUnlocks[branch.name][index % branchUnlocks[branch.name].length];
      const id = `research-${slug(branch.name)}-${String(index + 1).padStart(2, "0")}`;
      return {
        id,
        branch_id: branch.id,
        era: eras[eraIndex],
        era_order: eraIndex + 1,
        node_order: index + 1,
        name: `${branch.name} ${eras[eraIndex]} ${index % 3 === 0 ? "Systems" : index % 3 === 1 ? "Optimization" : "Mastery"}`,
        design_purpose: `Defines ${branch.name.toLowerCase()} progression for ${eras[eraIndex].toLowerCase()}-era city growth.`,
        primary_unlock_type: index % 4 === 0 ? "Building" : index % 4 === 1 ? "Upgrade" : index % 4 === 2 ? "Policy" : "Wonder",
        unlocks: [unlock],
        gameplay_effect: `Improves ${branch.name.toLowerCase()} output and unlock pacing tier ${index + 1}.`,
        prerequisite_id: index === 0 ? null : `research-${slug(branch.name)}-${String(index).padStart(2, "0")}`,
        cost_experimental: 25 + branchIndex * 8 + index * 15,
        research_time: `${60 + index * 30 + eraIndex * 45}s`,
        related_systems: [branch.name, "Progression", eras[eraIndex]],
        icon_name: `icon-${slug(branch.name)}-${index + 1}`,
        status: statuses[(branchIndex + index) % statuses.length],
        notes: index % 5 === 0 ? "Needs balance pass after first economy simulation." : ""
      };
    })
  );
}

export const districts: District[] = [
  ["Central District", "Command and player onboarding.", ["Civic Plaza", "Archive"], "Cohesion", "Improves global build speed.", "Metropolis Prime"],
  ["Agricultural District", "Food and ecological systems.", ["Hydroponic Farm", "Bio Dome"], "Population", "Boosts population growth.", "Eco-Green Utopia"],
  ["Industrial District", "Material production backbone.", ["Foundry", "Assembler"], "Labor", "Boosts manufacturing output.", "Industrial Empire"],
  ["Energy District", "Power generation and storage.", ["Solar Array", "Fusion Plant"], "Energy", "Reduces energy shortages.", "High Tech Singularity"],
  ["Commerce District", "Credits and trade routes.", ["Trade Hub", "Exchange"], "Credits", "Increases market income.", "Cyberpunk Megacity"],
  ["Transit District", "Movement and logistics.", ["Transit Depot", "Maglev Station"], "Logistics", "Improves building adjacency effects.", "Metropolis Prime"],
  ["Medical District", "Health and resilience.", ["Clinic", "Gene Lab"], "Health", "Reduces disaster penalties.", "Harmony Ascendant"],
  ["Computing District", "Automation and data systems.", ["Data Center", "AI Core"], "Automation", "Improves advanced production.", "High Tech Singularity"],
  ["Orbital District", "Space infrastructure.", ["Launch Pad", "Satellite Uplink"], "Orbital", "Unlocks planet-scale expansion.", "Industrial Empire"],
  ["Cultural District", "Identity and wonder synergy.", ["Archive", "World Wonder"], "Culture", "Improves civilization bonuses.", "Harmony Ascendant"]
].map(([name, purpose, primary_buildings, primary_stat, bonus, civilization], index) => ({
  id: `district-${slug(String(name))}`,
  name: String(name),
  purpose: String(purpose),
  primary_buildings: primary_buildings as string[],
  primary_stat: String(primary_stat),
  bonus: String(bonus),
  unlock_research: index === 0 ? null : `research-${slug(researchBranches[index % researchBranches.length].name)}-03`,
  civilization: String(civilization),
  priority: index + 1
}));

export const wonders: Wonder[] = civilizations.map((civilization, index) => ({
  id: `wonder-${slug(civilization)}`,
  name: [
    "Gaia Crown",
    "Singularity Spire",
    "Iron Meridian",
    "Neon Citadel",
    "Prime Concourse",
    "Resonance Garden"
  ][index],
  civilization,
  unlock_research_id: `research-civilization-${String(index + 5).padStart(2, "0")}`,
  civilization_id: `civilization-${slug(civilization)}`,
  primary_bonus_type: ["Population", "Automation", "Production", "Credits", "Logistics", "Culture"][index],
  bonuses: [
    `Major ${["population", "automation", "production", "credit", "logistics", "culture"][index]} bonus`,
    "Adds one unique city-wide modifier"
  ],
  requirements: ["Civilization affinity unlocked", "Wonder construction slot available"],
  construction_cost: String(2500 + index * 750),
  construction_time: `${900 + index * 180}s`,
  icon_name: `icon-wonder-${slug(civilization)}`,
  model_name: `mdl_wonder_${slug(civilization).replaceAll("-", "_")}`,
  status: statuses[index % statuses.length],
  notes: "Phase 1 seed wonder."
}));

export const research = generateResearchNodes();

export const buildings: Building[] = districts.flatMap((district, districtIndex) =>
  district.primary_buildings.map((name, buildingIndex) => ({
    id: `building-${slug(district.name)}-${slug(name)}`,
    era: eras[Math.min(Math.floor(districtIndex / 2), eras.length - 1)],
    civilization: district.civilization,
    category: district.primary_stat,
    name,
    description: `${name} supports ${district.purpose.toLowerCase()}`,
    cost_credits: 120 + districtIndex * 65 + buildingIndex * 40,
    cost_labor: 25 + districtIndex * 10,
    cost_experimental: districtIndex % 3 === 0 ? 10 + districtIndex * 4 : 0,
    construction_time: `${45 + districtIndex * 18}s`,
    income_credits_sec: district.primary_stat === "Credits" ? 3 + districtIndex : 0,
    income_labor_sec: district.primary_stat === "Labor" ? 2 + districtIndex : 0,
    income_experimental_sec: district.primary_stat === "Automation" ? 1 + buildingIndex : 0,
    population_bonus: district.primary_stat === "Population" ? 25 : 0,
    labor_requirement: 1 + buildingIndex,
    building_size: buildingIndex === 0 ? "2x2" : "3x3",
    district_id: district.id,
    unlock_research_id: district.unlock_research,
    unlock_building: null,
    visual_evolution: `${name} supports era-based visual variants.`,
    upgrade_chain: `${district.name} Chain`,
    wonder: "No",
    icon_name: `icon-${slug(name)}`,
    model_name: `mdl_${slug(name).replaceAll("-", "_")}`,
    asset_id: null,
    notes: "Seed building for Phase 1 validation."
  }))
);

export const unlockMatrix: UnlockMatrixRow[] = research.slice(0, 36).map((node, index) => ({
  id: `unlock-${node.id}`,
  source_type: "Research",
  source_id: node.id,
  source_name: node.name,
  source_branch: researchBranches.find((branch) => branch.id === node.branch_id)?.name ?? "",
  source_era: node.era,
  unlock_type: node.primary_unlock_type,
  unlock_name: node.unlocks[0],
  unlock_id: buildings[index % buildings.length]?.id ?? null,
  implementation_status: node.status,
  notes: index % 4 === 0 ? "Confirm Roblox module naming before export." : ""
}));

export const assets: AssetRecord[] = [
  {
    id: "asset-command-console",
    name: "Command Console",
    type: "Model",
    category: "Building Prop",
    prompt: "Compact sci-fi city command console with cyan status glass and modular panels.",
    file_url: "",
    source_file_url: "",
    source_file_type: "",
    parent_asset_id: null,
    slice_name: "",
    roblox_asset_id: "",
    export_status: "Not Exported",
    status: "Draft",
    notes: "Waiting on blockout."
  },
  {
    id: "asset-solar-array",
    name: "Solar Array Kit",
    type: "Model",
    category: "Energy",
    prompt: "Clean futuristic solar array set for modular Roblox city construction.",
    file_url: "",
    source_file_url: "",
    source_file_type: "",
    parent_asset_id: null,
    slice_name: "",
    roblox_asset_id: "",
    export_status: "Not Exported",
    status: "In Progress",
    notes: ""
  }
];

export const releaseNotes: ReleaseNote[] = [
  {
    id: "release-0-1-0",
    version: "0.1.0",
    release_name: "Genesis Studio Phase 1",
    purpose: "Internal database foundation for research, buildings, and unlocks.",
    notes: "Initial admin workflow replacing spreadsheet tracking.",
    created_at: "2026-06-30T00:00:00.000Z"
  }
];

export const changelog: ChangelogEntry[] = [
  {
    id: "change-research-seed",
    version: "0.1.0",
    sheet_or_table: "research",
    change_type: "Seed",
    change_summary: "Generated 150 research nodes across 10 branches.",
    created_at: "2026-06-30T00:00:00.000Z"
  },
  {
    id: "change-unlock-matrix",
    version: "0.1.0",
    sheet_or_table: "unlock_matrix",
    change_type: "Mapping",
    change_summary: "Created initial research-to-unlock relationship rows.",
    created_at: "2026-06-30T00:00:00.000Z"
  }
];

export const seedData: GameData = {
  research_branches: researchBranches,
  research,
  buildings,
  unlock_matrix: unlockMatrix,
  districts,
  wonders,
  upgrades: [],
  building_relationships: [],
  building_chains: [],
  game_constants: [],
  feature_flags: [],
  assets,
  release_notes: releaseNotes,
  changelog
};

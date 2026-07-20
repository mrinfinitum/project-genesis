import type { CanonicalAiLibraryAgent } from "@/types/runtime";

export const AI_LIBRARY_VERSION = "1.0.0";
export const AI_LIBRARY_VOLUME_ID = "ai-volume-01-foundations";

export const aiLibraryRarities = [
  { id: "common", displayName: "Common", order: 1, volumeOneAllowed: true },
  { id: "uncommon", displayName: "Uncommon", order: 2, volumeOneAllowed: true },
  { id: "specialized", displayName: "Specialized", order: 3, volumeOneAllowed: true },
  { id: "rare", displayName: "Rare", order: 4, volumeOneAllowed: true },
  { id: "epic", displayName: "Epic", order: 5, volumeOneAllowed: true },
  { id: "legendary", displayName: "Legendary", order: 6, volumeOneAllowed: false },
  { id: "ancient", displayName: "Ancient", order: 7, volumeOneAllowed: false },
  { id: "genesis", displayName: "Genesis", order: 8, volumeOneAllowed: false },
  { id: "mythic", displayName: "Mythic", order: 9, volumeOneAllowed: false },
  { id: "singularity", displayName: "Singularity", order: 10, volumeOneAllowed: false }
] as const;

export const aiLibraryPersonalities = ["Analytical", "Curious", "Optimistic", "Protective", "Efficient", "Creative", "Empathetic", "Stoic", "Methodical", "Humorous", "Reserved", "Visionary", "Logical", "Patient", "Ambitious"] as const;
export const aiLibraryVoices = ["Professional", "Friendly", "Scientific", "Military", "Calm", "Energetic", "Formal", "Warm", "Dry Humor", "Mentor", "Companion"] as const;
export const aiLibraryAssignmentRoles = ["Buildings", "Colonies", "Research", "Exploration", "Logistics", "Population", "Construction", "Manufacturing", "Government", "Civilization"] as const;

export type CategoryProfile = {
  id: string;
  displayName: string;
  subcategory: string;
  purpose: string;
  primaryFunction: string;
  secondaryFunctions: string[];
  assignments: string[];
  bonuses: { labor: number; action: number; building: number; research: number; colony: number; automation: number };
  theme: string;
};

export const aiLibraryCategories: CategoryProfile[] = [
  { id: "general-intelligence", displayName: "General Intelligence", subcategory: "Civilization Coordination", purpose: "Coordinate broad civilization priorities.", primaryFunction: "Reduce idle Labor across active systems.", secondaryFunctions: ["planning", "priority analysis"], assignments: ["Civilization", "Government"], bonuses: { labor: 0.04, action: 0.03, building: 0.01, research: 0.01, colony: 0.02, automation: 0.03 }, theme: "balanced cyan intelligence core" },
  { id: "operations", displayName: "Operations", subcategory: "Operational Control", purpose: "Keep concurrent civilization work synchronized.", primaryFunction: "Improve Available Labor allocation efficiency.", secondaryFunctions: ["queue coordination", "incident response"], assignments: ["Civilization", "Colonies"], bonuses: { labor: 0.05, action: 0.04, building: 0.01, research: 0, colony: 0.02, automation: 0.04 }, theme: "teal command lattice" },
  { id: "construction", displayName: "Construction", subcategory: "Structural Assembly", purpose: "Coordinate construction Actions and crews.", primaryFunction: "Reduce Construction Labor requirements.", secondaryFunctions: ["project staging", "material sequencing"], assignments: ["Construction", "Buildings"], bonuses: { labor: 0.02, action: 0.05, building: 0.07, research: 0, colony: 0.02, automation: 0.02 }, theme: "amber structural holograms" },
  { id: "mining", displayName: "Mining", subcategory: "Extraction Operations", purpose: "Automate safe resource extraction.", primaryFunction: "Provide Automated Mining Labor.", secondaryFunctions: ["vein analysis", "hazard routing"], assignments: ["Buildings", "Colonies"], bonuses: { labor: 0.06, action: 0.03, building: 0.04, research: 0, colony: 0.01, automation: 0.05 }, theme: "ochre geological scanner" },
  { id: "manufacturing", displayName: "Manufacturing", subcategory: "Fabrication Systems", purpose: "Improve repeatable production work.", primaryFunction: "Increase Manufacturing Labor efficiency.", secondaryFunctions: ["quality control", "production scheduling"], assignments: ["Manufacturing", "Buildings"], bonuses: { labor: 0.05, action: 0.03, building: 0.05, research: 0, colony: 0.01, automation: 0.05 }, theme: "steel fabrication glyphs" },
  { id: "engineering", displayName: "Engineering", subcategory: "Systems Engineering", purpose: "Solve infrastructure and machinery problems.", primaryFunction: "Reduce technical Action duration.", secondaryFunctions: ["diagnostics", "systems optimization"], assignments: ["Buildings", "Construction"], bonuses: { labor: 0.03, action: 0.05, building: 0.05, research: 0.02, colony: 0.01, automation: 0.03 }, theme: "orange precision schematics" },
  { id: "research", displayName: "Research", subcategory: "Research Coordination", purpose: "Organize experiments and research teams.", primaryFunction: "Improve Research Labor efficiency.", secondaryFunctions: ["hypothesis ranking", "experiment scheduling"], assignments: ["Research", "Civilization"], bonuses: { labor: 0.02, action: 0.03, building: 0, research: 0.08, colony: 0, automation: 0.03 }, theme: "violet research matrices" },
  { id: "science", displayName: "Science", subcategory: "Scientific Analysis", purpose: "Interpret difficult scientific evidence.", primaryFunction: "Increase Research quality and discovery insight.", secondaryFunctions: ["data analysis", "model comparison"], assignments: ["Research", "Exploration"], bonuses: { labor: 0.01, action: 0.02, building: 0, research: 0.09, colony: 0, automation: 0.02 }, theme: "indigo spectral instruments" },
  { id: "exploration", displayName: "Exploration", subcategory: "Deep-Space Exploration", purpose: "Support expeditions beyond charted space.", primaryFunction: "Increase Exploration Action quality.", secondaryFunctions: ["route prediction", "anomaly triage"], assignments: ["Exploration", "Civilization"], bonuses: { labor: 0.02, action: 0.05, building: 0, research: 0.02, colony: 0, automation: 0.02 }, theme: "blue stellar navigation halo" },
  { id: "surveying", displayName: "Surveying", subcategory: "Planetary Survey", purpose: "Convert raw scans into reliable maps.", primaryFunction: "Reduce Survey Labor requirements.", secondaryFunctions: ["terrain classification", "registry mapping"], assignments: ["Exploration", "Research"], bonuses: { labor: 0.02, action: 0.06, building: 0, research: 0.02, colony: 0, automation: 0.02 }, theme: "cyan cartographic reticle" },
  { id: "logistics", displayName: "Logistics", subcategory: "Transport Networks", purpose: "Coordinate movement of people and materials.", primaryFunction: "Improve transport throughput.", secondaryFunctions: ["route balancing", "shipment recovery"], assignments: ["Logistics", "Colonies"], bonuses: { labor: 0.03, action: 0.03, building: 0.01, research: 0, colony: 0.03, automation: 0.05 }, theme: "blue route topology" },
  { id: "economy", displayName: "Economy", subcategory: "Economic Coordination", purpose: "Model production, demand, and trade.", primaryFunction: "Improve economic Action efficiency.", secondaryFunctions: ["market analysis", "allocation forecasts"], assignments: ["Government", "Civilization"], bonuses: { labor: 0.02, action: 0.03, building: 0.01, research: 0, colony: 0.03, automation: 0.02 }, theme: "green economic vectors" },
  { id: "government", displayName: "Government", subcategory: "Civic Administration", purpose: "Support policy and public administration.", primaryFunction: "Reduce Government Labor requirements.", secondaryFunctions: ["policy simulation", "public coordination"], assignments: ["Government", "Civilization"], bonuses: { labor: 0.03, action: 0.04, building: 0, research: 0, colony: 0.04, automation: 0.02 }, theme: "white civic geometry" },
  { id: "education", displayName: "Education", subcategory: "Workforce Education", purpose: "Improve knowledge transfer and workforce quality.", primaryFunction: "Increase Workforce Labor efficiency.", secondaryFunctions: ["curriculum planning", "specialist training"], assignments: ["Population", "Colonies"], bonuses: { labor: 0.06, action: 0.01, building: 0, research: 0.03, colony: 0.03, automation: 0.01 }, theme: "gold learning constellation" },
  { id: "medical", displayName: "Medical", subcategory: "Population Health", purpose: "Protect population health and continuity.", primaryFunction: "Improve healthy Workforce availability.", secondaryFunctions: ["diagnostic support", "care allocation"], assignments: ["Population", "Colonies"], bonuses: { labor: 0.05, action: 0.02, building: 0, research: 0.01, colony: 0.05, automation: 0.01 }, theme: "rose medical waveform" },
  { id: "agriculture", displayName: "Agriculture", subcategory: "Food Systems", purpose: "Coordinate cultivation and food security.", primaryFunction: "Improve agricultural Labor efficiency.", secondaryFunctions: ["crop planning", "biosphere monitoring"], assignments: ["Colonies", "Population"], bonuses: { labor: 0.05, action: 0.02, building: 0.03, research: 0, colony: 0.04, automation: 0.03 }, theme: "green botanical circuits" },
  { id: "infrastructure", displayName: "Infrastructure", subcategory: "Civil Systems", purpose: "Maintain shared civilization infrastructure.", primaryFunction: "Reduce infrastructure maintenance Labor.", secondaryFunctions: ["network diagnostics", "capacity planning"], assignments: ["Buildings", "Colonies"], bonuses: { labor: 0.04, action: 0.03, building: 0.05, research: 0, colony: 0.03, automation: 0.03 }, theme: "slate utility network" },
  { id: "power", displayName: "Power", subcategory: "Energy Systems", purpose: "Balance generation, storage, and distribution.", primaryFunction: "Improve powered Labor automation.", secondaryFunctions: ["grid balancing", "load prediction"], assignments: ["Buildings", "Civilization"], bonuses: { labor: 0.03, action: 0.02, building: 0.04, research: 0.01, colony: 0.02, automation: 0.06 }, theme: "electric gold energy core" },
  { id: "companion", displayName: "Companion", subcategory: "Personal Companion", purpose: "Accompany the player across civilization growth.", primaryFunction: "Provide flexible Labor assistance and guidance.", secondaryFunctions: ["dialogue", "memory recovery", "adaptive support"], assignments: ["Civilization"], bonuses: { labor: 0.03, action: 0.03, building: 0.01, research: 0.01, colony: 0.01, automation: 0.04 }, theme: "expressive luminous companion core" }
];

type AgentSeed = { name: string; category: string; specialization?: string };
const legacySeeds: AgentSeed[] = [
  { name: "Atlas", category: "exploration", specialization: "Scientific Survey" },
  { name: "Aurora-9", category: "medical", specialization: "Colony Healthcare" },
  { name: "Forge", category: "construction", specialization: "Infrastructure Assembly" },
  { name: "Mercury", category: "logistics", specialization: "Trade Networks" },
  { name: "Gaia", category: "agriculture", specialization: "Organic Production" },
  { name: "Helix", category: "research", specialization: "Breakthrough Analysis" },
  { name: "Aegis", category: "operations", specialization: "Emergency Response" },
  { name: "Chronos", category: "general-intelligence", specialization: "Historical Continuity" },
  { name: "Cartographer Prime", category: "surveying", specialization: "Deep Cartography" },
  { name: "Origin Seed", category: "general-intelligence", specialization: "Foundational Recovery" }
];

const newSeeds: AgentSeed[] = [
  ...["Axiom", "Praxis", "Meridian"].map((name) => ({ name, category: "general-intelligence" })),
  ...["Vector", "Cadence", "Relay"].map((name) => ({ name, category: "operations" })),
  ...["Mason", "Keystone", "Rivet"].map((name) => ({ name, category: "construction" })),
  ...["Delve", "Strata", "Quarry", "Borealis"].map((name) => ({ name, category: "mining" })),
  ...["Fabricator", "Loom", "Foundry", "Press"].map((name) => ({ name, category: "manufacturing" })),
  ...["Turing", "Caliper", "Torque", "Circuit"].map((name) => ({ name, category: "engineering" })),
  ...["Thesis", "Curie", "Lambda"].map((name) => ({ name, category: "research" })),
  ...["Prism", "Kepler", "Faraday"].map((name) => ({ name, category: "science" })),
  ...["Wayfinder", "Pioneer", "Horizon"].map((name) => ({ name, category: "exploration" })),
  ...["Beacon", "Parallax", "Datum"].map((name) => ({ name, category: "surveying" })),
  ...["Junction", "Convoy", "Lattice"].map((name) => ({ name, category: "logistics" })),
  ...["Ledger", "Accord", "Market", "Balance"].map((name) => ({ name, category: "economy" })),
  ...["Consul", "Charter", "Civitas", "Forum"].map((name) => ({ name, category: "government" })),
  ...["Mentor", "Lyceum", "Tutor", "Archive"].map((name) => ({ name, category: "education" })),
  ...["Salus", "Remedy", "Pulse"].map((name) => ({ name, category: "medical" })),
  ...["Verdant", "Harvest"].map((name) => ({ name, category: "agriculture" })),
  ...["Grid", "Pillar", "Conduit"].map((name) => ({ name, category: "infrastructure" })),
  ...["Solaris", "Dynamo", "Flux"].map((name) => ({ name, category: "power" })),
  ...["NOVA", "ATLAS Companion", "LYRA", "ARGUS", "HELIOS", "ECHO"].map((name) => ({ name, category: "companion", specialization: "Evolving Companion Intelligence" }))
];

const manufacturers = ["Noveris Systems", "Helix Foundry", "Civic Machine Works", "Frontier Logic", "Meridian Institute"];
const origins = ["Earth Archive", "Lunar Foundry", "Mars Research Network", "Orbital Habitat", "Recovered Colonial Core"];
const creators = ["Genesis Initiative", "Noveris Collective", "Civic Intelligence Lab", "Frontier Engineering Corps", "Independent Research Cooperative"];
const activations = ["Created", "Recovered", "Purchased", "Discovered", "Research Project", "Mission Reward", "Quest Reward", "Tutorial"];

function rarityFor(index: number) {
  if (index < 28) return "Common";
  if (index < 50) return "Uncommon";
  if (index < 65) return "Specialized";
  if (index < 72) return "Rare";
  return "Epic";
}

export const canonicalAiLibraryAgents: CanonicalAiLibraryAgent[] = [...legacySeeds, ...newSeeds].map((seed, index) => {
  const profile = aiLibraryCategories.find((category) => category.id === seed.category)!;
  const aiId = `AI-${String(index + 1).padStart(4, "0")}`;
  const localizationKey = `ai_agent.${aiId.toLowerCase().replaceAll("-", "_")}`;
  const personality = aiLibraryPersonalities[index % aiLibraryPersonalities.length];
  const voice = aiLibraryVoices[(index * 3) % aiLibraryVoices.length];
  const specialization = seed.specialization ?? profile.subcategory;
  return {
    ai_id: aiId,
    name: seed.name,
    codename: `FOUNDATION-${String(index + 1).padStart(3, "0")}-${seed.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
    volume_id: AI_LIBRARY_VOLUME_ID,
    volume_number: 1,
    collection: "Foundations",
    category: profile.displayName,
    category_id: profile.id,
    subcategory: specialization,
    rarity: rarityFor(index),
    generation: "Foundation Generation I",
    manufacturer: manufacturers[index % manufacturers.length],
    origin: origins[(index * 2) % origins.length],
    creator: creators[(index * 4) % creators.length],
    activation_method: activations[index % activations.length],
    description: `${seed.name} is a ${specialization.toLowerCase()} intelligence designed to ${profile.purpose.charAt(0).toLowerCase()}${profile.purpose.slice(1)}`,
    purpose: profile.purpose,
    primary_function: profile.primaryFunction,
    secondary_functions: profile.secondaryFunctions,
    labor_bonus: profile.bonuses.labor,
    action_bonus: profile.bonuses.action,
    building_bonus: profile.bonuses.building,
    research_bonus: profile.bonuses.research,
    colony_bonus: profile.bonuses.colony,
    automation_bonus: profile.bonuses.automation,
    unique_traits: [`${specialization} focus`, `${personality} adaptive model`, `Foundation memory signature ${String(index + 1).padStart(2, "0")}`],
    personality,
    voice_style: voice,
    dialogue_examples: [`${seed.name} online. ${profile.primaryFunction}`, `Assignment analyzed. ${profile.secondaryFunctions[index % profile.secondaryFunctions.length]} is ready.`],
    memory_fragments: [`Fragment ${String(index + 1).padStart(3, "0")}: ${seed.name} recalls its first activation at ${origins[(index * 2) % origins.length]}.`],
    relationships: [`category:${profile.id}`, `volume:${AI_LIBRARY_VOLUME_ID}`, index > 0 ? `peer:AI-${String(((index - 1) % 75) + 1).padStart(4, "0")}` : "peer:AI-0075"],
    assignment_roles: profile.assignments,
    upgrade_path: ["Core Restoration", `${specialization} Specialization`, "Efficiency Optimization", "Memory Recovery", "Personality Growth"],
    experience_curve: { id: "ai-foundation-standard-v1", formula: "xpForNextLevel = 100 * level^1.35" },
    max_level: 50,
    portrait_prompt: `NOVERIS AI portrait of ${seed.name}, ${specialization}, ${profile.theme}, ${personality.toLowerCase()} personality, ${voice.toLowerCase()} presence, centered intelligent machine face, transparent background, premium science-fiction game art, no text`,
    visual_theme: profile.theme,
    runtime_metadata: { schemaVersion: "ai-library-v1", runtimeEnabled: true, status: "canonical", localizationKey, portraitArtKey: `ai_agent_${aiId.toLowerCase().replaceAll("-", "_")}_portrait` }
  };
});

export const aiLibraryLocalizationPlaceholders = canonicalAiLibraryAgents.map((agent) => ({
  id: agent.runtime_metadata.localizationKey,
  name: agent.name,
  description: agent.description,
  purpose: agent.purpose,
  primaryFunction: agent.primary_function
}));

export function validateCanonicalAiLibrary(agents: CanonicalAiLibraryAgent[] = canonicalAiLibraryAgents) {
  const issues: string[] = [];
  const ids = agents.map((agent) => agent.ai_id);
  const names = agents.map((agent) => agent.name.toLowerCase());
  const codenames = agents.map((agent) => agent.codename);
  const categories = new Set(aiLibraryCategories.map((category) => category.id));
  const rarities = new Map<string, (typeof aiLibraryRarities)[number]>(aiLibraryRarities.map((rarity) => [rarity.displayName, rarity]));
  if (agents.length !== 75) issues.push(`Volume I must contain exactly 75 agents; received ${agents.length}.`);
  if (new Set(ids).size !== ids.length) issues.push("AI IDs must be unique.");
  if (new Set(names).size !== names.length) issues.push("AI names must be unique.");
  if (new Set(codenames).size !== codenames.length) issues.push("AI codenames must be unique.");
  for (const agent of agents) {
    if (!categories.has(agent.category_id)) issues.push(`${agent.ai_id} has invalid category ${agent.category_id}.`);
    if (!rarities.get(agent.rarity)?.volumeOneAllowed) issues.push(`${agent.ai_id} uses disallowed Volume I rarity ${agent.rarity}.`);
    if (!agent.portrait_prompt || !agent.assignment_roles.length || !agent.primary_function || !agent.description || !agent.personality || !agent.voice_style) issues.push(`${agent.ai_id} is missing required canonical fields.`);
    if (agent.max_level !== 50) issues.push(`${agent.ai_id} must have max level 50.`);
  }
  return { status: issues.length ? "Invalid" as const : "Ready" as const, issues };
}

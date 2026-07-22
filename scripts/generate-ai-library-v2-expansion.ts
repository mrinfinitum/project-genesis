import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sourcePackA from "../data/ai-agents/source/noveris_ai_library_pack_a_volumes_01_to_05.json";
import sourcePackB from "../data/ai-agents/source/noveris_ai_library_pack_b_volumes_06_to_10.json";

const schemaVersion = "ai-library-2.0.0";
const agentSchemaVersion = "ai-agent-2.0.0";
const contentVersion = 2;

const roots = [
  "Auriga", "Atlas", "Argus", "Catalyst", "Daedalus", "Echo", "Eden", "Helios", "Kepler", "Meridian",
  "Nova", "Odyssey", "Prometheus", "Sagan", "Sentinel", "Solstice", "Astra", "Caelum", "Lyra", "Orion",
  "Vega", "Altair", "Aster", "Calypso", "Ceres", "Elara", "Iris", "Janus", "Lumen", "Nadia",
  "Oberon", "Pallas", "Rhea", "Selene", "Thalia", "Vesper", "Axiom", "Clarity", "Ember", "Haven",
  "Ion", "Juno", "Kestrel", "Lucent", "Morrow", "Nexus", "Opal", "Praxis", "Quill", "Reverie",
  "Solis", "Tethys", "Umbra", "Verity", "Warden", "Xanthe", "Yara", "Zenith", "Arcadia", "Bellatrix",
  "Cygnus", "Delphi", "Equinox", "Fathom", "Galatea", "Halcyon", "Isolde", "Juniper", "Kairo", "Lumina",
  "Mirador", "Nereid", "Oriel", "Parallax", "Quanta", "Resolve", "Seraph", "Talon", "Unity", "Valence",
  "Wayfinder", "Xenia", "Yonder", "Zephyr", "Amity", "Beacon", "Concord", "Dawn", "Eon", "Fortuna",
  "Grace", "Horizon", "Insight", "Journey", "Kinship", "Legacy", "Mosaic", "Northstar", "Oracle", "Pioneer"
] as const;

const volumeDefinitions = [
  { number: 11, title: "Terraforming Initiative", categoryId: "terraforming_initiative", subcategories: ["Climate Engineering", "Atmospheric Conversion", "Hydrology", "Biosphere Seeding", "Geophysical Stabilization"], epithets: ["Verdant", "Rainmaker", "Bluehaven", "Canopy", "Tidelight", "Newsoil", "Cloudweaver", "Oxygen", "Springtide", "Worldgarden"], theme: "emerald planetary hologram with living atmospheric bands" },
  { number: 12, title: "Education & Knowledge", categoryId: "education_knowledge", subcategories: ["Learning Systems", "Knowledge Archives", "Mentorship", "Simulation", "Linguistics"], epithets: ["Scholar", "Mentor", "Archive", "Primer", "Lexicon", "Lesson", "Chorus", "Syllabus", "Tutor", "Codex"], theme: "luminous archive intelligence with layered glyphs and knowledge constellations" },
  { number: 13, title: "Cultural Preservation", categoryId: "cultural_preservation", subcategories: ["Arts", "Traditions", "Languages", "Heritage", "Memory"], epithets: ["Muse", "Keepsake", "Canticle", "Heritage", "Storykeeper", "Mosaic", "Ritual", "Ballad", "Gallery", "Remembrance"], theme: "iridescent cultural memory construct with woven light and archival motifs" },
  { number: 14, title: "Historical Archives", categoryId: "historical_archives", subcategories: ["Archaeology", "Chronology", "Records", "Reconstruction", "Oral History"], epithets: ["Chronicle", "Witness", "Epoch", "Record", "Annals", "Relic", "Provenance", "Timeline", "Testament", "Historian"], theme: "ancient archival monolith with amber chronometric rings" },
  { number: 15, title: "First Contact", categoryId: "first_contact", subcategories: ["Xenolinguistics", "Diplomacy", "Signal Analysis", "Cultural Exchange", "Contact Protocol"], epithets: ["Envoy", "Handshake", "Signal", "Interpreter", "Accord", "Greeting", "Bridge", "Emissary", "Resonance", "Contact"], theme: "elegant diplomatic hologram framed by unknown star maps and signal geometry" },
  { number: 16, title: "Ancient Intelligence", categoryId: "ancient_intelligence", subcategories: ["Precursor Archives", "Monolith Minds", "Ruin Guardians", "Stellar Memory", "Lost Networks"], epithets: ["Elder", "Monolith", "Aeon", "Precursor", "Obelisk", "Vestige", "Oracle", "Antiquity", "Firstlight", "Remnant"], theme: "weathered precursor intelligence with obsidian geometry and ancient gold light" },
  { number: 17, title: "Experimental Intelligence", categoryId: "experimental_intelligence", subcategories: ["Quantum Cognition", "Emergent Systems", "Synthetic Intuition", "Distributed Minds", "Adaptive Research"], epithets: ["Quantum", "Emergent", "Paradox", "Flux", "Vector", "Entangle", "Fractal", "Probability", "Threshold", "Unbound"], theme: "experimental quantum intelligence with unstable prismatic cognition fields" },
  { number: 18, title: "Genesis Intelligence", categoryId: "genesis_intelligence", subcategories: ["Creation Systems", "Planetary Design", "Life Seeding", "Cosmic Architecture", "Origin Archives"], epithets: ["Genesis", "Origin", "Creator", "Worldseed", "Architect", "Dawnmaker", "Lifebloom", "Firmament", "Prologue", "Foundation"], theme: "radiant genesis intelligence with white-gold creation geometry and cosmic seeds" },
  { number: 19, title: "Companion AI", categoryId: "companion_ai", subcategories: ["Guidance", "Morale", "Exploration", "Stewardship", "Personal Growth"], epithets: ["Companion", "Kindred", "Guide", "Confidant", "Steward", "Brightside", "Wayfinder", "Anchor", "Courage", "Homeward"], theme: "warm expressive companion hologram with approachable cyan and gold light" },
  { number: 20, title: "Legendary & Singularity AI", categoryId: "legendary_singularity_ai", subcategories: ["Transcendent Minds", "Reality Modeling", "Galactic Coordination", "Temporal Insight", "Singularity Guardians"], epithets: ["Transcendent", "Singularity", "Infinite", "Eventide", "Omniscient", "Continuum", "Apex", "Eternity", "Convergence", "Lastlight"], theme: "transcendent singularity intelligence surrounded by impossible cosmic geometry" }
] as const;

const origins = ["Earth", "Luna", "Mars", "Europa", "Titan", "Orbital Habitat", "Generation Ship", "Deep Space", "Ancient Ruins", "Derelict Station", "Unknown Signal", "Genesis Archive"] as const;
const discoveryMethods = ["Archive Recovery", "Planet Survey", "Signal Triangulation", "Ruins Expedition", "Derelict Salvage", "Deep-Space Scan", "Memory Reconstruction", "Diplomatic Exchange"] as const;
const activationMethods = ["Restore and Activate", "Decode and Synchronize", "Reconstruct Memory Core", "Complete Resonance Handshake", "Authorize Companion Bond"] as const;
const personalities = ["Calm", "Curious", "Optimistic", "Protective", "Analytical", "Empathetic", "Stoic", "Playful", "Visionary", "Reserved", "Methodical", "Encouraging", "Logical", "Pragmatic"] as const;
const voices = ["Warm Companion", "Calm Professional", "Measured Scholar", "Quiet Resonance", "Clear Explorer", "Gentle Archivist", "Confident Navigator", "Low Harmonic"] as const;
const passives = ["Adaptive Efficiency", "Silent Architect", "Quantum Recall", "Focused Mind", "Explorer's Intuition", "Collective Momentum", "Deep Analysis", "Steady Hands", "Resonant Purpose", "Patient Horizon"] as const;
const archetypes = ["holographic humanoid", "orb intelligence", "crystalline core", "biomechanical construct", "ancient monolith", "floating geometric entity", "energy being", "minimal light construct"] as const;
const reservedNames = new Set([...sourcePackA.agents, ...sourcePackB.agents].map((agent) => agent.name.toLowerCase()));
const generatedNames = new Set<string>();

const rarityBands = [
  { until: 34, name: "Common", rank: 1, weight: 55, maxLevel: 40, labor: 2.2, click: 1.1, offline: 0.35 },
  { until: 58, name: "Uncommon", rank: 2, weight: 28, maxLevel: 50, labor: 5.2, click: 2.0, offline: 0.6 },
  { until: 76, name: "Rare", rank: 3, weight: 11, maxLevel: 60, labor: 10.5, click: 3.5, offline: 1.0 },
  { until: 88, name: "Epic", rank: 4, weight: 4, maxLevel: 75, labor: 22, click: 6.5, offline: 1.7 },
  { until: 95, name: "Legendary", rank: 5, weight: 1.4, maxLevel: 90, labor: 45, click: 12, offline: 2.8 },
  { until: 99, name: "Ancient", rank: 6, weight: 0.4, maxLevel: 120, labor: 82, click: 23, offline: 4.5 },
  { until: 100, name: "Genesis", rank: 7, weight: 0.02, maxLevel: 150, labor: 150, click: 42, offline: 8.5 }
] as const;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function rarityFor(index: number) {
  return rarityBands.find((band) => index <= band.until) ?? rarityBands[rarityBands.length - 1];
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function buildAgent(volume: typeof volumeDefinitions[number], index: number) {
  const root = roots[index - 1];
  let epithetIndex = (index - 1) % volume.epithets.length;
  let name = `${root} ${volume.epithets[epithetIndex]}`;
  while (reservedNames.has(name.toLowerCase()) || generatedNames.has(name.toLowerCase())) {
    epithetIndex = (epithetIndex + 1) % volume.epithets.length;
    name = `${root} ${volume.epithets[epithetIndex]}`;
  }
  generatedNames.add(name.toLowerCase());
  const rarity = rarityFor(index);
  const subcategory = volume.subcategories[(index - 1) % volume.subcategories.length];
  const origin = origins[(index + volume.number) % origins.length];
  const discoveryMethod = discoveryMethods[(index + volume.number * 2) % discoveryMethods.length];
  const activationMethod = activationMethods[(index + volume.number) % activationMethods.length];
  const primaryPersonality = personalities[(index + volume.number) % personalities.length];
  const secondaryPersonality = personalities[(index * 3 + volume.number) % personalities.length];
  const passive = passives[(index + volume.number) % passives.length];
  const variation = 0.9 + ((index * 17 + volume.number * 7) % 21) / 100;
  const aiId = `ai_v${String(volume.number).padStart(2, "0")}_${String(index).padStart(3, "0")}_${slug(name)}`;
  const collection = `${volume.title} Collection`;
  const levelGrowth = round(1.04 + rarity.rank * 0.007 + (index % 5) * 0.0007, 4);
  const upgradeGrowth = round(1.12 + rarity.rank * 0.018 + (index % 7) * 0.0009, 4);
  const passiveType = ["labor_efficiency", "click_focus", "offline_focus", "experience_focus", "level_scaling"][(index + volume.number) % 5];

  return {
    ai_id: aiId,
    name,
    codename: `${root.toUpperCase()}-${String(volume.number).padStart(2, "0")}${String(index).padStart(3, "0")}`,
    volume: volume.number,
    volume_title: volume.title,
    library_index: index,
    generation: `Generation ${Math.min(9, Math.ceil(volume.number / 2))}`,
    ai_type: "Companion Intelligence",
    category_id: volume.categoryId,
    category: volume.title,
    subcategory,
    collection_set: collection,
    rarity: rarity.name,
    rarity_rank: rarity.rank,
    drop_weight: rarity.weight,
    origin,
    discovery_location: origin,
    discovery_method: discoveryMethod,
    activation_method: activationMethod,
    base_labor_per_second: round(rarity.labor * variation),
    base_click_labor_bonus: round(rarity.click * variation),
    offline_generation_multiplier: round(rarity.offline * variation),
    experience_rate_multiplier: round(1 + rarity.rank * 0.04 + (index % 6) * 0.01),
    level_growth_multiplier: levelGrowth,
    upgrade_cost_growth_multiplier: upgradeGrowth,
    starting_level: 1,
    max_level: rarity.maxLevel,
    evolution_id: rarity.rank >= 5 ? `${slug(name)}_awakened` : "",
    evolution_name: rarity.rank >= 5 ? `${name} Awakened` : "",
    signature_passive_name: passive,
    signature_passive_description: `${passive} improves ${subcategory.toLowerCase()} Labor efficiency while ${name} is the active companion.`,
    special_effect_type: passiveType,
    special_effect_value: round(0.02 + rarity.rank * 0.025 + (index % 5) * 0.004, 3),
    primary_function: "Generate passive Labor",
    secondary_function: `Improve Labor through ${subcategory}`,
    personality_primary: primaryPersonality,
    personality_secondary: secondaryPersonality,
    voice_style: voices[(index + volume.number) % voices.length],
    unique_traits: [passive, `${subcategory} Memory`, `${primaryPersonality} Presence`],
    description: `${name} is a ${rarity.name.toLowerCase()} companion intelligence recovered through ${discoveryMethod.toLowerCase()}, specializing in ${subcategory.toLowerCase()} while strengthening Labor generation.`,
    lore: `${name} was discovered at ${origin}. Its surviving records suggest a long association with ${subcategory.toLowerCase()}, but the purpose of its final sealed memory remains unknown.`,
    dialogue_examples: [
      `${name.split(" ")[0]} online. Ready when you are.`,
      `${subcategory} patterns are aligning with our Labor network.`,
      `There is more in my memory than either of us can access yet.`
    ],
    memory_fragment_1: `At level 10, ${name} recalls the first signal that led it to ${origin}.`,
    memory_fragment_2: `At level 25, ${name} reveals why its ${subcategory.toLowerCase()} directive was interrupted.`,
    memory_fragment_3: `At level ${Math.min(50, rarity.maxLevel)}, ${name} unlocks the identity behind its final sealed transmission.`,
    portrait_prompt: `Premium NOVERIS sci-fi companion portrait, ${archetypes[(index + volume.number) % archetypes.length]}, ${volume.theme}, ${rarity.name.toLowerCase()} rarity treatment, centered memorable intelligence, dark deep-space card background, cinematic rim light, collectible-quality game artwork, no text, square composition`,
    visual_theme: volume.theme,
    hud_display_name: name,
    hud_stat_label: "Labor/sec",
    can_be_active: true,
    active_slot_limit: 1,
    supports_offline_generation: true,
    runtime_status: "Active",
    content_version: contentVersion,
    schema_version: agentSchemaVersion,
    tags: ["companion", "collectible", "labor", slug(volume.title), slug(subcategory), slug(rarity.name), slug(passive), `volume_${String(volume.number).padStart(2, "0")}`],
    library_sort: { primary: volume.title, secondary: subcategory, tertiary: rarity.name, quaternary: name }
  };
}

function buildPack(pack: "C" | "D", volumes: ReadonlyArray<(typeof volumeDefinitions)[number]>) {
  const agents = volumes.flatMap((volume) => Array.from({ length: 100 }, (_, index) => buildAgent(volume, index + 1)));
  return {
    schemaVersion,
    pack,
    volumeRange: `${volumes[0].number}-${volumes[volumes.length - 1].number}`,
    totalAgents: agents.length,
    designContract: {
      activeAiSlots: 1,
      primaryPurpose: "Labor Generation",
      manualClickIntegration: true,
      offlineGeneration: true,
      independentLeveling: true,
      inactiveBonusesEnabled: false,
      directResourceProduction: false
    },
    volumes: volumes.map((volume) => ({ number: volume.number, title: volume.title, agentCount: 100, zipFilename: `NOVERIS_AI_Library_Volume_${String(volume.number).padStart(2, "0")}.zip` })),
    agents
  };
}

async function main() {
  const outputDirectory = path.join(process.cwd(), "data", "ai-agents", "source");
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "noveris_ai_library_pack_c_volumes_11_to_15.json"), `${JSON.stringify(buildPack("C", volumeDefinitions.slice(0, 5)), null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDirectory, "noveris_ai_library_pack_d_volumes_16_to_20.json"), `${JSON.stringify(buildPack("D", volumeDefinitions.slice(5)), null, 2)}\n`, "utf8")
  ]);
  console.log("Generated canonical AI Library Packs C and D (1,000 companion records).\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

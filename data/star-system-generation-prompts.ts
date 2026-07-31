export type StarSystemPromptTemplate = {
  systemClass: string;
  subclass: string;
  displayName: string;
  systemPrompt: string;
};

export const STAR_SYSTEM_MASTER_PROMPT = [
  "Design one handcrafted, scientifically plausible star system for the science-fiction game NOVERIS.",
  "",
  "Return a concise production specification, not prose fiction. Name the primary star or stars, state the stellar class, system age, orbital architecture, major planets, moons, belts, hazards, and why the system is strategically interesting.",
  "",
  "Keep the hierarchy explicit: star system, stars, planets, moons, dwarf planets, asteroid belts, and anomalies. Use canonical, stable IDs only when the result is actually approved for Studio ingestion; otherwise use readable working names.",
  "",
  "Balance scientific plausibility with a clear gameplay identity. A system should have one defining character rather than every possible feature. Include a readable habitable-zone assessment and reserve room for later discoveries, resources, and colonies.",
  "",
  "Do not include UI, camera instructions, graphics settings, duplicate bodies, fixed real-world locations other than an explicitly requested Sol reference, or uncontrolled lore. Do not create a full galaxy or sector. Create one coherent star system.",
  "",
  "Use this selected system profile:",
  "(INSERT STAR SYSTEM PROFILE)"
].join("\n");

export function buildStarSystemPrompt(template: StarSystemPromptTemplate) {
  return STAR_SYSTEM_MASTER_PROMPT.replace("(INSERT STAR SYSTEM PROFILE)", template.systemPrompt);
}

export const STAR_SYSTEM_PROMPT_LIBRARY: StarSystemPromptTemplate[] = [
  {
    systemClass: "Main Sequence",
    subclass: "Sol Analog",
    displayName: "Sol Analog",
    systemPrompt: "A mature G-type yellow main-sequence star with a stable terrestrial habitable zone, inner rocky worlds, an asteroid belt, outer gas giants, ice worlds, and a balanced spread of scientific and colony opportunities."
  },
  {
    systemClass: "Main Sequence",
    subclass: "Red Dwarf Compact",
    displayName: "Red Dwarf Compact",
    systemPrompt: "A quiet M-type red dwarf with tightly packed rocky planets, a close temperate world in the narrow habitable zone, strong tidal-locking considerations, and resource-rich inner orbits."
  },
  {
    systemClass: "Main Sequence",
    subclass: "Orange Dwarf Frontier",
    displayName: "Orange Dwarf Frontier",
    systemPrompt: "A long-lived K-type orange dwarf system with a broad stable habitable region, two contrasting terrestrial planets, modest outer giants, and unusually favorable long-term settlement conditions."
  },
  {
    systemClass: "Main Sequence",
    subclass: "White Star Expanse",
    displayName: "White Star Expanse",
    systemPrompt: "A luminous A-type white star with a young, bright system, wide orbital spacing, volatile-rich worlds, elevated radiation exposure, and short-lived but spectacular scientific opportunities."
  },
  {
    systemClass: "Multiple Star",
    subclass: "Wide Binary",
    displayName: "Wide Binary",
    systemPrompt: "Two widely separated stable main-sequence stars, each with an independent planetary family. The pair creates two navigable local systems connected by a shared outer cometary and debris region."
  },
  {
    systemClass: "Multiple Star",
    subclass: "Circumbinary",
    displayName: "Circumbinary",
    systemPrompt: "A close binary pair orbited by a stable circumbinary planetary family. Include a clearly defined stability boundary, one temperate circumbinary world, and an outer gas giant or debris belt."
  },
  {
    systemClass: "Multiple Star",
    subclass: "Hierarchical Trinary",
    displayName: "Hierarchical Trinary",
    systemPrompt: "A stable hierarchical trinary: a close inner pair with a distant companion. Keep orbits scientifically legible, place planets only in credible stable zones, and make navigation the system's central gameplay identity."
  },
  {
    systemClass: "Young Stellar",
    subclass: "Protoplanetary",
    displayName: "Protoplanetary",
    systemPrompt: "A young T Tauri-style system with an active protoplanetary disk, newly formed worlds, unstable debris regions, high scientific value, and limited early settlement potential."
  },
  {
    systemClass: "Stellar Remnant",
    subclass: "White Dwarf Legacy",
    displayName: "White Dwarf Legacy",
    systemPrompt: "An ancient white dwarf with surviving inner worlds, disrupted planetary remnants, dense mineral debris, and traces of a lost former civilization or naturally preserved planetary history."
  },
  {
    systemClass: "Stellar Remnant",
    subclass: "Pulsar Relay",
    displayName: "Pulsar Relay",
    systemPrompt: "A neutron star or pulsar system with extreme radiation, sparse hardened worlds, magnetic phenomena, precision navigation value, and rare high-risk research opportunities."
  },
  {
    systemClass: "Resource System",
    subclass: "Asteroid Belt Rich",
    displayName: "Asteroid Belt Rich",
    systemPrompt: "A stable star system centered on multiple differentiated asteroid belts, dwarf planets, and captured minor bodies. Keep major planets sparse; make mining, logistics, and orbital industry its defining opportunity."
  },
  {
    systemClass: "Resource System",
    subclass: "Gas Giant Dominion",
    displayName: "Gas Giant Dominion",
    systemPrompt: "A system dominated by one or two gas giants with extensive moon families, ring systems, trojan bodies, gas harvesting opportunities, and orbital research stations instead of terrestrial colonization."
  },
  {
    systemClass: "Water System",
    subclass: "Ocean Chain",
    displayName: "Ocean Chain",
    systemPrompt: "A temperate system with several water-rich worlds or moons across the habitable and outer zones. Differentiate open-ocean, ice-covered, and hydrothermal environments with strong life and research potential."
  },
  {
    systemClass: "Outer System",
    subclass: "Ice Frontier",
    displayName: "Ice Frontier",
    systemPrompt: "A cold outer system with distant ice giants, frozen moons, cryovolcanic bodies, comet reservoirs, and isolated refueling or research opportunities. Keep the inner system quiet and sparse."
  },
  {
    systemClass: "Habitable System",
    subclass: "Garden Cluster",
    displayName: "Garden Cluster",
    systemPrompt: "A rare but plausible mature system with two or three distinct potentially habitable bodies: a terrestrial planet, a large moon, and a warm ocean world. Balance their opportunities with believable orbital spacing and ecological differences."
  }
];

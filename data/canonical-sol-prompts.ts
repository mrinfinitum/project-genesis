export type CanonicalSolPrompt = {
  id: string;
  displayName: string;
  bodyType: string;
  planetOrder: number;
  planetDescription: string;
  artStyle: string;
  scientificReference: string;
  notes: string;
};

export const CANONICAL_SOL_MASTER_PROMPT = [
  "Create one high-resolution canonical Solar System body asset on a clean black background.",
  "",
  "The body must be fully visible, centered in the image, scientifically grounded, and immediately recognizable as the real Solar System object being rendered.",
  "",
  "Use accurate NASA-inspired coloration, physically believable lighting, realistic surface or atmospheric detail, and premium space exploration game asset quality.",
  "",
  "Create this canonical Solar System body:",
  "{{planet_description}}",
  "",
  "Composition: square 1:1 image, one centered body only, generous black negative space around it, clean black background, no stars, no UI, no text, no labels, no watermark.",
  "",
  "Lighting: single soft key light from upper left, realistic spherical shading, visible day side and subtle night side when appropriate, clean shadow falloff.",
  "",
  "Accuracy: prioritize real-world scientific identity over fantasy variation. Keep recognizable planetary colors, cloud structures, crater patterns, ice patterns, rings, or solar surface behavior where applicable.",
  "",
  "Avoid: stylized fantasy redesign, cartoon, anime, painterly brushwork, fictional terrain features, invented moons, extra planets, spacecraft, satellites, cities protruding from the surface, text, UI, watermark, signature, logo, cropped edges, distorted sphere, oval planet, excessive glow, excessive bloom, lens flare, nebula background, starfield, messy background."
].join("\n");

export const CANONICAL_SOL_PROMPTS: CanonicalSolPrompt[] = [
  {
    id: "sol",
    displayName: "Sol",
    bodyType: "Star",
    planetOrder: 0,
    planetDescription:
      "Render Sol using scientifically accurate NASA coloration. Show a realistic yellow-white G-type main-sequence star with subtle solar granulation, realistic prominences, and physically believable solar activity.",
    artStyle: "NASA accurate star render",
    scientificReference: "G-type main-sequence star",
    notes: "Canonical central star of the Sol system."
  },
  {
    id: "mercury",
    displayName: "Mercury",
    bodyType: "Terrestrial Planet",
    planetOrder: 1,
    planetDescription:
      "Render Mercury using scientifically accurate NASA coloration. Show a heavily cratered grey rocky surface with ancient lava plains, large impact basins, steep scarps, subtle mineral variation, and almost no atmosphere.",
    artStyle: "NASA accurate rocky planet render",
    scientificReference: "MESSENGER imagery and Mercury geological maps",
    notes: "Inner rocky planet with no meaningful atmosphere."
  },
  {
    id: "venus",
    displayName: "Venus",
    bodyType: "Terrestrial Planet",
    planetOrder: 2,
    planetDescription:
      "Render Venus using scientifically accurate NASA coloration. Show the dense yellow-orange sulfuric cloud layer completely surrounding the planet with realistic atmospheric texture and no visible surface.",
    artStyle: "NASA accurate atmospheric planet render",
    scientificReference: "Venus cloud deck and sulfuric acid atmosphere",
    notes: "Opaque atmosphere; surface should not be visible."
  },
  {
    id: "earth",
    displayName: "Earth",
    bodyType: "Terrestrial Planet",
    planetOrder: 3,
    planetDescription:
      "Render Earth using scientifically accurate NASA coloration. Show deep blue oceans, green and brown continents, bright white cloud systems, polar ice caps, and a natural blue atmosphere.",
    artStyle: "NASA blue marble render",
    scientificReference: "NASA Earth observation imagery",
    notes: "Canonical human homeworld."
  },
  {
    id: "moon",
    displayName: "Moon",
    bodyType: "Moon",
    planetOrder: 4,
    planetDescription:
      "Render Earth's Moon using scientifically accurate NASA coloration. Show grey highlands, dark basaltic maria, heavy impact craters, crater rays, and fine regolith with no atmosphere.",
    artStyle: "NASA accurate lunar render",
    scientificReference: "Lunar Reconnaissance Orbiter imagery",
    notes: "Earth's natural satellite."
  },
  {
    id: "mars",
    displayName: "Mars",
    bodyType: "Terrestrial Planet",
    planetOrder: 5,
    planetDescription:
      "Render Mars using scientifically accurate NASA coloration. Show a red iron-rich surface with Olympus Mons, Valles Marineris, polar ice caps, dusty plains, and a thin atmosphere.",
    artStyle: "NASA accurate Mars render",
    scientificReference: "Mars Reconnaissance Orbiter imagery",
    notes: "Primary early interplanetary expansion target."
  },
  {
    id: "jupiter",
    displayName: "Jupiter",
    bodyType: "Gas Giant",
    planetOrder: 6,
    planetDescription:
      "Render Jupiter using scientifically accurate NASA coloration. Show cream, tan, orange, and brown atmospheric bands with the Great Red Spot and realistic atmospheric turbulence.",
    artStyle: "NASA accurate gas giant render",
    scientificReference: "Juno and Voyager Jupiter imagery",
    notes: "Canonical gas giant with Great Red Spot."
  },
  {
    id: "europa",
    displayName: "Europa",
    bodyType: "Moon",
    planetOrder: 7,
    planetDescription:
      "Render Europa using scientifically accurate NASA coloration. Show a bright icy shell with blue fracture lines, chaotic terrain, smooth ice plains, and subtle mineral staining.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Galileo Europa imagery",
    notes: "Jovian icy moon with subsurface ocean potential."
  },
  {
    id: "ganymede",
    displayName: "Ganymede",
    bodyType: "Moon",
    planetOrder: 8,
    planetDescription:
      "Render Ganymede using scientifically accurate NASA coloration. Show bright and dark terrain, grooved ice regions, ancient craters, rocky patches, and subtle ice coloration.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Galileo Ganymede imagery",
    notes: "Largest moon in the Solar System."
  },
  {
    id: "saturn",
    displayName: "Saturn",
    bodyType: "Gas Giant",
    planetOrder: 9,
    planetDescription:
      "Render Saturn using scientifically accurate NASA coloration. Show pale cream and golden atmospheric bands with the complete realistic ring system.",
    artStyle: "NASA accurate ringed gas giant render",
    scientificReference: "Cassini Saturn imagery",
    notes: "Ring system is part of canonical identity and should be visible."
  },
  {
    id: "titan",
    displayName: "Titan",
    bodyType: "Moon",
    planetOrder: 10,
    planetDescription:
      "Render Titan using scientifically accurate NASA coloration. Show the dense orange nitrogen atmosphere completely surrounding the moon with realistic atmospheric haze.",
    artStyle: "NASA accurate atmospheric moon render",
    scientificReference: "Cassini-Huygens Titan imagery",
    notes: "Saturn moon with dense atmosphere."
  },
  {
    id: "enceladus",
    displayName: "Enceladus",
    bodyType: "Moon",
    planetOrder: 11,
    planetDescription:
      "Render Enceladus using scientifically accurate NASA coloration. Show a brilliant white icy surface with blue fractures, cryovolcanic fissures, and exceptional reflectivity.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Cassini Enceladus imagery",
    notes: "High-albedo icy moon with cryovolcanic features."
  },
  {
    id: "uranus",
    displayName: "Uranus",
    bodyType: "Ice Giant",
    planetOrder: 12,
    planetDescription:
      "Render Uranus using scientifically accurate NASA coloration. Show a smooth pale blue-green atmosphere with subtle methane haze and minimal cloud structure.",
    artStyle: "NASA accurate ice giant render",
    scientificReference: "Voyager Uranus imagery",
    notes: "Smooth methane-tinted ice giant."
  },
  {
    id: "neptune",
    displayName: "Neptune",
    bodyType: "Ice Giant",
    planetOrder: 13,
    planetDescription:
      "Render Neptune using scientifically accurate NASA coloration. Show a deep sapphire-blue atmosphere with bright methane clouds and realistic storm systems.",
    artStyle: "NASA accurate ice giant render",
    scientificReference: "Voyager Neptune imagery",
    notes: "Deep blue ice giant with storm activity."
  },
  {
    id: "pluto",
    displayName: "Pluto",
    bodyType: "Dwarf Planet",
    planetOrder: 14,
    planetDescription:
      "Render Pluto using scientifically accurate NASA coloration. Show Tombaugh Regio, nitrogen ice plains, reddish tholin deposits, rugged icy mountains, and subtle atmospheric haze.",
    artStyle: "NASA accurate dwarf planet render",
    scientificReference: "New Horizons Pluto imagery",
    notes: "Canonical outer dwarf planet."
  }
];

export function buildCanonicalSolPrompt(description: string) {
  return CANONICAL_SOL_MASTER_PROMPT.replace("{{planet_description}}", description.trim());
}

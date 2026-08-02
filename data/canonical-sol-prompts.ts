export type CanonicalSolPrompt = {
  id: string;
  displayName: string;
  bodyType: string;
  celestialBodyType: "Star" | "Planet" | "Moon" | "Dwarf Planet" | "Asteroid Belt";
  planetClass: string | null;
  planetSubclass: string | null;
  landable: boolean;
  usesOrbitalGameplay: boolean;
  isFixed: boolean;
  isProcedural: boolean;
  generationType: "Handcrafted";
  planetOrder: number;
  planetDescription: string;
  artStyle: string;
  scientificReference: string;
  notes: string;
};

export const CANONICAL_SOL_MASTER_PROMPT = [
  "Create a premium NOVERIS visual of one real Solar System body.",
  "{{planet_description}}",
  "Keep the real-world scientific identity recognizable through plausible coloration, surface or atmospheric detail, and controlled upper-left illumination.",
  "Show one fully visible centered body on pure black with generous negative space and a crisp contained silhouette. 3840 x 3840, 1:1.",
  "No text, labels, watermark, logo, interface, border, star field, spacecraft, invented moons, duplicate planets, fictional terrain, excessive glow, bloom, or lens flare."
].join("\n");

export const CANONICAL_SOL_SURFACE_LANDSCAPE_MASTER_PROMPT = [
  "Create a premium NOVERIS surface environment for a real Solar System body.",
  "{{body_name}}",
  "{{planet_description}}",
  "Use documentary planetary-science realism with physically plausible terrain, sky, atmosphere, lighting, geological scale, and materials appropriate to this body.",
  "Show a broad readable horizon with natural foreground-to-distance depth. 3840 x 2160, 16:9.",
  "No text, labels, watermark, logo, interface, border, astronauts, dominant spacecraft, invented cities, alien vegetation, impossible geology, fantasy glow, bloom, or lens flare."
].join("\n");

export const CANONICAL_SOL_PROMPTS: CanonicalSolPrompt[] = [
  {
    id: "sol",
    displayName: "Sol",
    bodyType: "Star",
    celestialBodyType: "Star",
    planetClass: null,
    planetSubclass: null,
    landable: false,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
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
    bodyType: "Planet",
    celestialBodyType: "Planet",
    planetClass: "Dead",
    planetSubclass: "Barren",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
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
    bodyType: "Planet",
    celestialBodyType: "Planet",
    planetClass: "Toxic",
    planetSubclass: "Green Atmosphere",
    landable: false,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
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
    bodyType: "Planet",
    celestialBodyType: "Planet",
    planetClass: "Terrestrial",
    planetSubclass: "Earthlike",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
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
    celestialBodyType: "Moon",
    planetClass: "Dead",
    planetSubclass: "Airless",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
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
    bodyType: "Planet",
    celestialBodyType: "Planet",
    planetClass: "Desert",
    planetSubclass: "Rock Desert",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 5,
    planetDescription:
      "Render Mars using scientifically accurate NASA coloration. Show a red iron-rich surface with Olympus Mons, Valles Marineris, polar ice caps, dusty plains, and a thin atmosphere.",
    artStyle: "NASA accurate Mars render",
    scientificReference: "Mars Reconnaissance Orbiter imagery",
    notes: "Primary early interplanetary expansion target."
  },
  {
    id: "phobos",
    displayName: "Phobos",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Dead",
    planetSubclass: "Captured Asteroid",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 6,
    planetDescription:
      "Render Phobos using scientifically accurate NASA coloration. Show a small irregular dark grey captured asteroid moon with grooves, regolith, impact craters, and very low-gravity roughness.",
    artStyle: "NASA accurate captured moon render",
    scientificReference: "Mars Express and Viking Phobos imagery",
    notes: "Inner Martian moon."
  },
  {
    id: "deimos",
    displayName: "Deimos",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Dead",
    planetSubclass: "Captured Asteroid",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 7,
    planetDescription:
      "Render Deimos using scientifically accurate NASA coloration. Show a small irregular dusty grey-brown captured asteroid moon with subdued craters, loose regolith, and rounded low-gravity forms.",
    artStyle: "NASA accurate captured moon render",
    scientificReference: "Viking and Mars Reconnaissance Orbiter Deimos imagery",
    notes: "Outer Martian moon."
  },
  {
    id: "asteroid-belt",
    displayName: "Asteroid Belt",
    bodyType: "Asteroid Belt",
    celestialBodyType: "Asteroid Belt",
    planetClass: null,
    planetSubclass: "Asteroid Megabelt",
    landable: false,
    usesOrbitalGameplay: true,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 8,
    planetDescription:
      "Render the main Asteroid Belt as a canonical Solar System resource field. Show sparse rocky and metallic asteroid bodies in realistic scale and spacing, with dark carbonaceous rocks and brighter nickel-iron fragments.",
    artStyle: "NASA accurate asteroid field render",
    scientificReference: "NASA asteroid mission imagery and main belt composition data",
    notes: "Canonical resource field between Mars and Jupiter."
  },
  {
    id: "jupiter",
    displayName: "Jupiter",
    bodyType: "Planet",
    celestialBodyType: "Planet",
    planetClass: "Gas Giant",
    planetSubclass: "Storm Giant",
    landable: false,
    usesOrbitalGameplay: true,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 9,
    planetDescription:
      "Render Jupiter using scientifically accurate NASA coloration. Show cream, tan, orange, and brown atmospheric bands with the Great Red Spot and realistic atmospheric turbulence.",
    artStyle: "NASA accurate gas giant render",
    scientificReference: "Juno and Voyager Jupiter imagery",
    notes: "Canonical gas giant with Great Red Spot."
  },
  {
    id: "io",
    displayName: "Io",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Lava",
    planetSubclass: "Volcanic",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 10,
    planetDescription:
      "Render Io using scientifically accurate NASA coloration. Show a sulfur-yellow volcanic moon with orange, white, black, and red sulfur deposits, active lava fields, volcanic calderas, and tidal-heating scars.",
    artStyle: "NASA accurate volcanic moon render",
    scientificReference: "Galileo and Voyager Io imagery",
    notes: "Jovian volcanic moon."
  },
  {
    id: "europa",
    displayName: "Europa",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Frozen Ocean",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 11,
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
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Glacial",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 12,
    planetDescription:
      "Render Ganymede using scientifically accurate NASA coloration. Show bright and dark terrain, grooved ice regions, ancient craters, rocky patches, and subtle ice coloration.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Galileo Ganymede imagery",
    notes: "Largest moon in the Solar System."
  },
  {
    id: "callisto",
    displayName: "Callisto",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Cratered Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 13,
    planetDescription:
      "Render Callisto using scientifically accurate NASA coloration. Show an ancient heavily cratered icy-rock surface with dark impact basins, bright crater rims, and mottled grey-brown ice terrain.",
    artStyle: "NASA accurate cratered icy moon render",
    scientificReference: "Galileo Callisto imagery",
    notes: "Outer Galilean moon."
  },
  {
    id: "saturn",
    displayName: "Saturn",
    bodyType: "Planet",
    celestialBodyType: "Planet",
    planetClass: "Gas Giant",
    planetSubclass: "Banded",
    landable: false,
    usesOrbitalGameplay: true,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 14,
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
    celestialBodyType: "Moon",
    planetClass: "Toxic",
    planetSubclass: "Chemical Seas",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 15,
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
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Cryovolcanic",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 16,
    planetDescription:
      "Render Enceladus using scientifically accurate NASA coloration. Show a brilliant white icy surface with blue fractures, cryovolcanic fissures, and exceptional reflectivity.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Cassini Enceladus imagery",
    notes: "High-albedo icy moon with cryovolcanic features."
  },
  {
    id: "mimas",
    displayName: "Mimas",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Cratered Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 17,
    planetDescription:
      "Render Mimas using scientifically accurate NASA coloration. Show a small pale icy moon dominated by the huge Herschel impact crater, with cratered ice plains and grey-white surface texture.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Cassini Mimas imagery",
    notes: "Small Saturnian icy moon."
  },
  {
    id: "tethys",
    displayName: "Tethys",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Fractured Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 18,
    planetDescription:
      "Render Tethys using scientifically accurate NASA coloration. Show a bright icy moon with long fracture systems, broad craters, pale water-ice terrain, and subtle grey-blue shading.",
    artStyle: "NASA accurate fractured icy moon render",
    scientificReference: "Cassini Tethys imagery",
    notes: "Saturnian icy moon."
  },
  {
    id: "dione",
    displayName: "Dione",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Glacial",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 19,
    planetDescription:
      "Render Dione using scientifically accurate NASA coloration. Show a grey-white icy moon with bright wispy cliff networks, cratered plains, ice scarps, and subtle contrast between leading and trailing hemispheres.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Cassini Dione imagery",
    notes: "Saturnian icy moon."
  },
  {
    id: "rhea",
    displayName: "Rhea",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Cratered Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 20,
    planetDescription:
      "Render Rhea using scientifically accurate NASA coloration. Show a large pale icy moon with dense crater fields, subtle tectonic fractures, grey-white ice, and ancient battered terrain.",
    artStyle: "NASA accurate cratered icy moon render",
    scientificReference: "Cassini Rhea imagery",
    notes: "Large Saturnian icy moon."
  },
  {
    id: "iapetus",
    displayName: "Iapetus",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Two-Tone Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 21,
    planetDescription:
      "Render Iapetus using scientifically accurate NASA coloration. Show a dramatic two-tone icy moon with one dark carbon-rich hemisphere, one bright ice hemisphere, and a pronounced equatorial ridge.",
    artStyle: "NASA accurate two-tone icy moon render",
    scientificReference: "Cassini Iapetus imagery",
    notes: "Two-toned Saturnian moon."
  },
  {
    id: "hyperion",
    displayName: "Hyperion",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Dead",
    planetSubclass: "Porous Rock",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 22,
    planetDescription:
      "Render Hyperion using scientifically accurate NASA coloration. Show an irregular sponge-like porous rocky-icy moon with deep dark craters, chaotic shape, and low-density battered texture.",
    artStyle: "NASA accurate irregular moon render",
    scientificReference: "Cassini Hyperion imagery",
    notes: "Irregular porous Saturnian moon."
  },
  {
    id: "phoebe",
    displayName: "Phoebe",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Dead",
    planetSubclass: "Captured Asteroid",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 23,
    planetDescription:
      "Render Phoebe using scientifically accurate NASA coloration. Show a dark irregular captured moon with primitive carbon-rich material, impact craters, exposed bright ice patches, and rugged asteroid-like form.",
    artStyle: "NASA accurate captured moon render",
    scientificReference: "Cassini Phoebe imagery",
    notes: "Captured outer Saturnian moon."
  },
  {
    id: "uranus",
    displayName: "Uranus",
    bodyType: "Planet",
    celestialBodyType: "Planet",
    planetClass: "Gas Giant",
    planetSubclass: "Ice Giant",
    landable: false,
    usesOrbitalGameplay: true,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 24,
    planetDescription:
      "Render Uranus using scientifically accurate NASA coloration. Show a smooth pale blue-green atmosphere with subtle methane haze and minimal cloud structure.",
    artStyle: "NASA accurate ice giant render",
    scientificReference: "Voyager Uranus imagery",
    notes: "Smooth methane-tinted ice giant."
  },
  {
    id: "miranda",
    displayName: "Miranda",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Fractured Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 25,
    planetDescription:
      "Render Miranda using scientifically accurate NASA coloration. Show a small icy Uranian moon with patchwork fractured terrain, huge cliffs, coronae, ridges, and chaotic resurfaced regions.",
    artStyle: "NASA accurate fractured icy moon render",
    scientificReference: "Voyager 2 Miranda imagery",
    notes: "Geologically chaotic Uranian moon."
  },
  {
    id: "ariel",
    displayName: "Ariel",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Canyon Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 26,
    planetDescription:
      "Render Ariel using scientifically accurate NASA coloration. Show a bright icy moon with canyon systems, rift valleys, lightly cratered plains, and pale grey water-ice coloration.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Voyager 2 Ariel imagery",
    notes: "Bright Uranian moon."
  },
  {
    id: "umbriel",
    displayName: "Umbriel",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Dark Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 27,
    planetDescription:
      "Render Umbriel using scientifically accurate NASA coloration. Show a dark ancient icy moon with subdued cratered terrain, low albedo grey-brown coloration, and a few bright impact features.",
    artStyle: "NASA accurate dark icy moon render",
    scientificReference: "Voyager 2 Umbriel imagery",
    notes: "Dark Uranian moon."
  },
  {
    id: "titania",
    displayName: "Titania",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Glacial",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 28,
    planetDescription:
      "Render Titania using scientifically accurate NASA coloration. Show a large icy moon with fault valleys, broad rifts, cratered plains, and grey-white glacial surface textures.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "Voyager 2 Titania imagery",
    notes: "Largest Uranian moon."
  },
  {
    id: "oberon",
    displayName: "Oberon",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Cratered Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 29,
    planetDescription:
      "Render Oberon using scientifically accurate NASA coloration. Show an ancient cratered icy moon with dark crater floors, grey ice, rugged highlands, and low-reflectivity outer-system terrain.",
    artStyle: "NASA accurate cratered icy moon render",
    scientificReference: "Voyager 2 Oberon imagery",
    notes: "Outer major moon of Uranus."
  },
  {
    id: "neptune",
    displayName: "Neptune",
    bodyType: "Planet",
    celestialBodyType: "Planet",
    planetClass: "Gas Giant",
    planetSubclass: "Cyclone Giant",
    landable: false,
    usesOrbitalGameplay: true,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 30,
    planetDescription:
      "Render Neptune using scientifically accurate NASA coloration. Show a deep sapphire-blue atmosphere with bright methane clouds and realistic storm systems.",
    artStyle: "NASA accurate ice giant render",
    scientificReference: "Voyager Neptune imagery",
    notes: "Deep blue ice giant with storm activity."
  },
  {
    id: "triton",
    displayName: "Triton",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Cryovolcanic",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 31,
    planetDescription:
      "Render Triton using scientifically accurate NASA coloration. Show a pale icy captured moon with nitrogen frost, cantaloupe terrain, dark cryovolcanic streaks, and subtle pinkish tholin deposits.",
    artStyle: "NASA accurate cryovolcanic icy moon render",
    scientificReference: "Voyager 2 Triton imagery",
    notes: "Captured Neptunian moon."
  },
  {
    id: "nereid",
    displayName: "Nereid",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Captured Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 32,
    planetDescription:
      "Render Nereid using scientifically accurate NASA-informed styling. Show a small distant irregular icy-rock moon with low-detail cratered terrain, dark outer-system coloration, and captured-body proportions.",
    artStyle: "NASA accurate irregular icy moon render",
    scientificReference: "Neptune moon photometry and Voyager-era observations",
    notes: "Distant irregular Neptunian moon."
  },
  {
    id: "proteus",
    displayName: "Proteus",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Dead",
    planetSubclass: "Irregular Rock",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 33,
    planetDescription:
      "Render Proteus using scientifically accurate NASA coloration. Show a large irregular dark grey rocky-icy moon with angular shape, heavy cratering, and a prominent large impact feature.",
    artStyle: "NASA accurate irregular moon render",
    scientificReference: "Voyager 2 Proteus imagery",
    notes: "Large irregular inner moon of Neptune."
  },
  {
    id: "pluto",
    displayName: "Pluto",
    bodyType: "Dwarf Planet",
    celestialBodyType: "Dwarf Planet",
    planetClass: "Ice",
    planetSubclass: "Polar",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 34,
    planetDescription:
      "Render Pluto using scientifically accurate NASA coloration. Show Tombaugh Regio, nitrogen ice plains, reddish tholin deposits, rugged icy mountains, and subtle atmospheric haze.",
    artStyle: "NASA accurate dwarf planet render",
    scientificReference: "New Horizons Pluto imagery",
    notes: "Canonical outer dwarf planet."
  },
  {
    id: "charon",
    displayName: "Charon",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Binary Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 35,
    planetDescription:
      "Render Charon using scientifically accurate NASA coloration. Show a large grey icy moon with a reddish polar cap, canyon systems, smooth plains, and rugged water-ice terrain.",
    artStyle: "NASA accurate icy moon render",
    scientificReference: "New Horizons Charon imagery",
    notes: "Pluto's largest moon and binary companion."
  },
  {
    id: "nix",
    displayName: "Nix",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Small Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 36,
    planetDescription:
      "Render Nix using scientifically accurate NASA-informed styling. Show a tiny elongated icy moon with bright water-ice surface, subtle reddish patches, and low-gravity irregular shape.",
    artStyle: "NASA accurate small icy moon render",
    scientificReference: "New Horizons Nix imagery",
    notes: "Small moon of Pluto."
  },
  {
    id: "hydra",
    displayName: "Hydra",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Small Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 37,
    planetDescription:
      "Render Hydra using scientifically accurate NASA-informed styling. Show a small irregular icy moon with bright water-ice texture, angular elongated form, and faint crater markings.",
    artStyle: "NASA accurate small icy moon render",
    scientificReference: "New Horizons Hydra imagery",
    notes: "Small outer moon of Pluto."
  },
  {
    id: "kerberos",
    displayName: "Kerberos",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Small Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 38,
    planetDescription:
      "Render Kerberos using scientifically accurate NASA-informed styling. Show a tiny dark icy moon with an irregular double-lobed shape, low-albedo patches, and primitive outer-system ice.",
    artStyle: "NASA accurate small icy moon render",
    scientificReference: "New Horizons Kerberos observations",
    notes: "Small dark moon of Pluto."
  },
  {
    id: "styx",
    displayName: "Styx",
    bodyType: "Moon",
    celestialBodyType: "Moon",
    planetClass: "Ice",
    planetSubclass: "Small Ice",
    landable: true,
    usesOrbitalGameplay: false,
    isFixed: true,
    isProcedural: false,
    generationType: "Handcrafted",
    planetOrder: 39,
    planetDescription:
      "Render Styx using scientifically accurate NASA-informed styling. Show a very small faint icy moon with elongated irregular shape, pale water-ice texture, and sparse crater detail.",
    artStyle: "NASA accurate small icy moon render",
    scientificReference: "New Horizons Styx observations",
    notes: "Small outer moon of Pluto."
  }
];

export const REQUIRED_CANONICAL_SOL_BODY_NAMES = CANONICAL_SOL_PROMPTS.map((row) => row.displayName);

export function buildCanonicalSolPrompt(description: string) {
  return CANONICAL_SOL_MASTER_PROMPT.replace("{{planet_description}}", description.trim());
}

export function buildCanonicalSolLandscapePrompt(row: CanonicalSolPrompt) {
  return CANONICAL_SOL_SURFACE_LANDSCAPE_MASTER_PROMPT
    .replace("{{body_name}}", row.displayName)
    .replace("{{scientific_reference}}", row.scientificReference)
    .replace("{{planet_description}}", row.planetDescription.trim());
}

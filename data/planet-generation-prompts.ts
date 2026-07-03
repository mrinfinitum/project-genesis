export type PlanetPromptTemplate = {
  planetClass: string;
  subclass: string;
  displayName: string;
  imagePrompt: string;
};

export const PLANET_MASTER_PROMPT = "Create one high-resolution sci-fi planet asset on a clean black background.\n\nThe planet must be a fully visible spherical world seen from orbit/space, centered in the image, with a smooth clean circular silhouette and crop-friendly edges. The entire planet must fit inside the frame with generous empty black space around it.\n\nImportant: no glow, no aura, no bloom, no atmospheric haze extending into the background, no rim glow, no lens flare. The edge of the planet should be crisp and easy to cut out from the black background. Any atmosphere should stay very subtle and contained tightly inside the planet silhouette.\n\nVisual style: cinematic realistic space-game planet render, premium strategy game / space exploration asset, highly detailed planetary surface textures, realistic clouds, continents, oceans, deserts, ice caps, lava flows, storm systems, crater fields, alien terrain patterns, and believable spherical shading.\n\nThe planet should look like a distant world viewed from space, not a miniature landscape or diorama. No terrain, trees, cities, buildings, ships, rocks, satellites, debris, or structures may protrude outside the planet silhouette. Moons may appear only when the planet type description explicitly requests them, and any moon must be a small distant spherical body separated from the planet edge. All detail must appear painted onto or beneath the planet atmosphere.\n\nCreate a unique planet type:\n(INSERT PLANET DESCRIPTION)\n\nLighting: single soft key light from upper left, realistic spherical shading, visible day side and subtle night side, clean shadow falloff, no external glow.\n\nComposition: square 1:1 image, one centered planet only, planet occupies about 65 percent of the canvas height, large black negative space around the planet, clean black background, no stars, no UI, no text, no labels, no watermark.\n\nQuality: ultra detailed, crisp, sharp, realistic, cinematic, high dynamic range, game asset, ready for background removal, cropping, and upscaling.  Avoid: glow, aura, bloom, atmospheric glow, rim glow, haze extending outside planet, lens flare, bright outline, stars, starfield, nebula, text, labels, captions, watermark, signature, logo, artist name, UI, interface, border, frame, blurry, low resolution, pixelated, flat icon, cartoon, anime, childish, simple vector art, cropped planet, partial planet, cut off edges, planet touching image edge, off-center planet, messy background, transparent background artifacts, spaceship, astronaut, satellite, characters, buildings, towers, cities protruding from surface, trees protruding from surface, forests sticking out, mountains sticking out, rocks floating outside planet, external debris, objects attached to planet edge, miniature landscape, diorama, terrain model, isometric world, floating islands, raised land, visible people, close-up landscape, excessive contrast, overexposed, distorted sphere, oval planet, deformed planet, bad perspective";

export const PLANET_PROMPT_LIBRARY: PlanetPromptTemplate[] = [
  {
    "planetClass": "Terrestrial",
    "subclass": "Earthlike",
    "displayName": "Earthlike",
    "imagePrompt": "A highly detailed earthlike terrestrial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Terrestrial",
    "subclass": "Continental",
    "displayName": "Continental",
    "imagePrompt": "A highly detailed continental terrestrial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Terrestrial",
    "subclass": "Highlands",
    "displayName": "Highlands",
    "imagePrompt": "A highly detailed highlands terrestrial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Terrestrial",
    "subclass": "Supercontinent",
    "displayName": "Supercontinent",
    "imagePrompt": "A highly detailed supercontinent terrestrial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Terrestrial",
    "subclass": "Riverlands",
    "displayName": "Riverlands",
    "imagePrompt": "A highly detailed riverlands terrestrial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Terrestrial",
    "subclass": "Badlands",
    "displayName": "Badlands",
    "imagePrompt": "A highly detailed badlands terrestrial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Terrestrial",
    "subclass": "Savanna",
    "displayName": "Savanna",
    "imagePrompt": "A highly detailed savanna terrestrial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Terrestrial",
    "subclass": "Alpine",
    "displayName": "Alpine",
    "imagePrompt": "A highly detailed alpine terrestrial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ocean",
    "subclass": "Deep Ocean",
    "displayName": "Deep Ocean",
    "imagePrompt": "A highly detailed deep ocean ocean featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ocean",
    "subclass": "Island World",
    "displayName": "Island World",
    "imagePrompt": "A highly detailed island world ocean featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ocean",
    "subclass": "Archipelago",
    "displayName": "Archipelago",
    "imagePrompt": "A highly detailed archipelago ocean featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ocean",
    "subclass": "Storm Ocean",
    "displayName": "Storm Ocean",
    "imagePrompt": "A highly detailed storm ocean ocean featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ocean",
    "subclass": "Coral World",
    "displayName": "Coral World",
    "imagePrompt": "A highly detailed coral world ocean featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ocean",
    "subclass": "Frozen Ocean",
    "displayName": "Frozen Ocean",
    "imagePrompt": "A highly detailed frozen ocean ocean featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ocean",
    "subclass": "Kelp Ocean",
    "displayName": "Kelp Ocean",
    "imagePrompt": "A highly detailed kelp ocean ocean featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ocean",
    "subclass": "Abyssal Ocean",
    "displayName": "Abyssal Ocean",
    "imagePrompt": "A highly detailed abyssal ocean ocean featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Desert",
    "subclass": "Dunes",
    "displayName": "Dunes",
    "imagePrompt": "A highly detailed dunes desert featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Desert",
    "subclass": "Canyon",
    "displayName": "Canyon",
    "imagePrompt": "A highly detailed canyon desert featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Desert",
    "subclass": "Salt Flats",
    "displayName": "Salt Flats",
    "imagePrompt": "A highly detailed salt flats desert featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Desert",
    "subclass": "Rock Desert",
    "displayName": "Rock Desert",
    "imagePrompt": "A highly detailed rock desert desert featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Desert",
    "subclass": "Mesa",
    "displayName": "Mesa",
    "imagePrompt": "A highly detailed mesa desert featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Desert",
    "subclass": "Dust Basin",
    "displayName": "Dust Basin",
    "imagePrompt": "A highly detailed dust basin desert featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Desert",
    "subclass": "Black Desert",
    "displayName": "Black Desert",
    "imagePrompt": "A highly detailed black desert desert featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Desert",
    "subclass": "Oasis",
    "displayName": "Oasis",
    "imagePrompt": "A highly detailed oasis desert featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ice",
    "subclass": "Glacial",
    "displayName": "Glacial",
    "imagePrompt": "A highly detailed glacial ice featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ice",
    "subclass": "Frozen Ocean",
    "displayName": "Frozen Ocean",
    "imagePrompt": "A highly detailed frozen ocean ice featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ice",
    "subclass": "Snow World",
    "displayName": "Snow World",
    "imagePrompt": "A highly detailed snow world ice featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ice",
    "subclass": "Cryovolcanic",
    "displayName": "Cryovolcanic",
    "imagePrompt": "A highly detailed cryovolcanic ice featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ice",
    "subclass": "Blue Ice",
    "displayName": "Blue Ice",
    "imagePrompt": "A highly detailed blue ice ice featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ice",
    "subclass": "Ice Canyons",
    "displayName": "Ice Canyons",
    "imagePrompt": "A highly detailed ice canyons ice featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ice",
    "subclass": "Polar",
    "displayName": "Polar",
    "imagePrompt": "A highly detailed polar ice featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ice",
    "subclass": "Fractured Ice",
    "displayName": "Fractured Ice",
    "imagePrompt": "A highly detailed fractured ice ice featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Lava",
    "subclass": "Volcanic",
    "displayName": "Volcanic",
    "imagePrompt": "A highly detailed volcanic lava featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Lava",
    "subclass": "Molten Core",
    "displayName": "Molten Core",
    "imagePrompt": "A highly detailed molten core lava featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Lava",
    "subclass": "Ash World",
    "displayName": "Ash World",
    "imagePrompt": "A highly detailed ash world lava featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Lava",
    "subclass": "Basalt World",
    "displayName": "Basalt World",
    "imagePrompt": "A highly detailed basalt world lava featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Lava",
    "subclass": "Obsidian",
    "displayName": "Obsidian",
    "imagePrompt": "A highly detailed obsidian lava featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Lava",
    "subclass": "Firestorm",
    "displayName": "Firestorm",
    "imagePrompt": "A highly detailed firestorm lava featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Lava",
    "subclass": "Sulfur Basin",
    "displayName": "Sulfur Basin",
    "imagePrompt": "A highly detailed sulfur basin lava featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Lava",
    "subclass": "Magma Ocean",
    "displayName": "Magma Ocean",
    "imagePrompt": "A highly detailed magma ocean lava featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Gas Giant",
    "subclass": "Banded",
    "displayName": "Banded",
    "imagePrompt": "A highly detailed banded gas giant featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Gas Giant",
    "subclass": "Storm Giant",
    "displayName": "Storm Giant",
    "imagePrompt": "A highly detailed storm giant gas giant featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Gas Giant",
    "subclass": "Ice Giant",
    "displayName": "Ice Giant",
    "imagePrompt": "A highly detailed ice giant gas giant featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Gas Giant",
    "subclass": "Metallic Giant",
    "displayName": "Metallic Giant",
    "imagePrompt": "A highly detailed metallic giant gas giant featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Gas Giant",
    "subclass": "Amber Giant",
    "displayName": "Amber Giant",
    "imagePrompt": "A highly detailed amber giant gas giant featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Gas Giant",
    "subclass": "Emerald Giant",
    "displayName": "Emerald Giant",
    "imagePrompt": "A highly detailed emerald giant gas giant featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Gas Giant",
    "subclass": "Striped Giant",
    "displayName": "Striped Giant",
    "imagePrompt": "A highly detailed striped giant gas giant featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Gas Giant",
    "subclass": "Cyclone Giant",
    "displayName": "Cyclone Giant",
    "imagePrompt": "A highly detailed cyclone giant gas giant featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Crystal",
    "subclass": "Crystal Forest",
    "displayName": "Crystal Forest",
    "imagePrompt": "A highly detailed crystal forest crystal featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Crystal",
    "subclass": "Crystal Desert",
    "displayName": "Crystal Desert",
    "imagePrompt": "A highly detailed crystal desert crystal featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Crystal",
    "subclass": "Crystal Caverns",
    "displayName": "Crystal Caverns",
    "imagePrompt": "A highly detailed crystal caverns crystal featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Crystal",
    "subclass": "Prismatic",
    "displayName": "Prismatic",
    "imagePrompt": "A highly detailed prismatic crystal featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Crystal",
    "subclass": "Quartz Peaks",
    "displayName": "Quartz Peaks",
    "imagePrompt": "A highly detailed quartz peaks crystal featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Crystal",
    "subclass": "Amethyst",
    "displayName": "Amethyst",
    "imagePrompt": "A highly detailed amethyst crystal featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Crystal",
    "subclass": "Emerald Crystal",
    "displayName": "Emerald Crystal",
    "imagePrompt": "A highly detailed emerald crystal crystal featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Crystal",
    "subclass": "Sapphire Crystal",
    "displayName": "Sapphire Crystal",
    "imagePrompt": "A highly detailed sapphire crystal crystal featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Toxic",
    "subclass": "Acid World",
    "displayName": "Acid World",
    "imagePrompt": "A highly detailed acid world toxic featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Toxic",
    "subclass": "Sulfur World",
    "displayName": "Sulfur World",
    "imagePrompt": "A highly detailed sulfur world toxic featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Toxic",
    "subclass": "Poison Swamp",
    "displayName": "Poison Swamp",
    "imagePrompt": "A highly detailed poison swamp toxic featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Toxic",
    "subclass": "Corrosive",
    "displayName": "Corrosive",
    "imagePrompt": "A highly detailed corrosive toxic featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Toxic",
    "subclass": "Green Atmosphere",
    "displayName": "Green Atmosphere",
    "imagePrompt": "A highly detailed green atmosphere toxic featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Toxic",
    "subclass": "Purple Atmosphere",
    "displayName": "Purple Atmosphere",
    "imagePrompt": "A highly detailed purple atmosphere toxic featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Toxic",
    "subclass": "Chemical Seas",
    "displayName": "Chemical Seas",
    "imagePrompt": "A highly detailed chemical seas toxic featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Toxic",
    "subclass": "Industrial Wasteland",
    "displayName": "Industrial Wasteland",
    "imagePrompt": "A highly detailed industrial wasteland toxic featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Artificial",
    "subclass": "Machine World",
    "displayName": "Machine World",
    "imagePrompt": "A highly detailed machine world artificial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Artificial",
    "subclass": "Cyber Planet",
    "displayName": "Cyber Planet",
    "imagePrompt": "A highly detailed cyber planet artificial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Artificial",
    "subclass": "Forge World",
    "displayName": "Forge World",
    "imagePrompt": "A highly detailed forge world artificial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Artificial",
    "subclass": "Arcology World",
    "displayName": "Arcology World",
    "imagePrompt": "A highly detailed arcology world artificial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Artificial",
    "subclass": "AI Core",
    "displayName": "AI Core",
    "imagePrompt": "A highly detailed ai core artificial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Artificial",
    "subclass": "Nanotech World",
    "displayName": "Nanotech World",
    "imagePrompt": "A highly detailed nanotech world artificial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Artificial",
    "subclass": "Data Sphere",
    "displayName": "Data Sphere",
    "imagePrompt": "A highly detailed data sphere artificial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Artificial",
    "subclass": "Defense World",
    "displayName": "Defense World",
    "imagePrompt": "A highly detailed defense world artificial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Void",
    "subclass": "Dark Void",
    "displayName": "Dark Void",
    "imagePrompt": "A highly detailed dark void void featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Void",
    "subclass": "Quantum Rift",
    "displayName": "Quantum Rift",
    "imagePrompt": "A highly detailed quantum rift void featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Void",
    "subclass": "Entropy World",
    "displayName": "Entropy World",
    "imagePrompt": "A highly detailed entropy world void featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Void",
    "subclass": "Singularity World",
    "displayName": "Singularity World",
    "imagePrompt": "A highly detailed singularity world void featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Void",
    "subclass": "Shadow World",
    "displayName": "Shadow World",
    "imagePrompt": "A highly detailed shadow world void featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Void",
    "subclass": "Event Horizon",
    "displayName": "Event Horizon",
    "imagePrompt": "A highly detailed event horizon void featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Void",
    "subclass": "Negative Space",
    "displayName": "Negative Space",
    "imagePrompt": "A highly detailed negative space void featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Void",
    "subclass": "Void Storms",
    "displayName": "Void Storms",
    "imagePrompt": "A highly detailed void storms void featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Living",
    "subclass": "Living Forest",
    "displayName": "Living Forest",
    "imagePrompt": "A highly detailed living forest living featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Living",
    "subclass": "Living Ocean",
    "displayName": "Living Ocean",
    "imagePrompt": "A highly detailed living ocean living featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Living",
    "subclass": "Organic World",
    "displayName": "Organic World",
    "imagePrompt": "A highly detailed organic world living featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Living",
    "subclass": "Symbiotic World",
    "displayName": "Symbiotic World",
    "imagePrompt": "A highly detailed symbiotic world living featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Living",
    "subclass": "World Tree",
    "displayName": "World Tree",
    "imagePrompt": "A highly detailed world tree living featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Living",
    "subclass": "Living Coral",
    "displayName": "Living Coral",
    "imagePrompt": "A highly detailed living coral living featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Living",
    "subclass": "Breathing World",
    "displayName": "Breathing World",
    "imagePrompt": "A highly detailed breathing world living featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Living",
    "subclass": "Root Network",
    "displayName": "Root Network",
    "imagePrompt": "A highly detailed root network living featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Bio",
    "subclass": "Mutated",
    "displayName": "Mutated",
    "imagePrompt": "A highly detailed mutated bio featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Bio",
    "subclass": "Bioluminescent",
    "displayName": "Bioluminescent",
    "imagePrompt": "A highly detailed bioluminescent bio featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Bio",
    "subclass": "Hive World",
    "displayName": "Hive World",
    "imagePrompt": "A highly detailed hive world bio featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Bio",
    "subclass": "Genetic World",
    "displayName": "Genetic World",
    "imagePrompt": "A highly detailed genetic world bio featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Bio",
    "subclass": "Spore World",
    "displayName": "Spore World",
    "imagePrompt": "A highly detailed spore world bio featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Bio",
    "subclass": "Fungal World",
    "displayName": "Fungal World",
    "imagePrompt": "A highly detailed fungal world bio featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Bio",
    "subclass": "Parasite World",
    "displayName": "Parasite World",
    "imagePrompt": "A highly detailed parasite world bio featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Bio",
    "subclass": "Cellular",
    "displayName": "Cellular",
    "imagePrompt": "A highly detailed cellular bio featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ancient",
    "subclass": "Temple World",
    "displayName": "Temple World",
    "imagePrompt": "A highly detailed temple world ancient featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ancient",
    "subclass": "Lost Civilization",
    "displayName": "Lost Civilization",
    "imagePrompt": "A highly detailed lost civilization ancient featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ancient",
    "subclass": "Ruined Empire",
    "displayName": "Ruined Empire",
    "imagePrompt": "A highly detailed ruined empire ancient featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ancient",
    "subclass": "Archaeological",
    "displayName": "Archaeological",
    "imagePrompt": "A highly detailed archaeological ancient featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ancient",
    "subclass": "Ancient Battlefield",
    "displayName": "Ancient Battlefield",
    "imagePrompt": "A highly detailed ancient battlefield ancient featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ancient",
    "subclass": "Collapsed Arcology",
    "displayName": "Collapsed Arcology",
    "imagePrompt": "A highly detailed collapsed arcology ancient featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ancient",
    "subclass": "Relic World",
    "displayName": "Relic World",
    "imagePrompt": "A highly detailed relic world ancient featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Ancient",
    "subclass": "Forgotten Capital",
    "displayName": "Forgotten Capital",
    "imagePrompt": "A highly detailed forgotten capital ancient featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Energy",
    "subclass": "Plasma World",
    "displayName": "Plasma World",
    "imagePrompt": "A highly detailed plasma world energy featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Energy",
    "subclass": "Electromagnetic",
    "displayName": "Electromagnetic",
    "imagePrompt": "A highly detailed electromagnetic energy featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Energy",
    "subclass": "Storm World",
    "displayName": "Storm World",
    "imagePrompt": "A highly detailed storm world energy featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Energy",
    "subclass": "Radiant",
    "displayName": "Radiant",
    "imagePrompt": "A highly detailed radiant energy featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Energy",
    "subclass": "Aurora",
    "displayName": "Aurora",
    "imagePrompt": "A highly detailed aurora energy featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Energy",
    "subclass": "Ion World",
    "displayName": "Ion World",
    "imagePrompt": "A highly detailed ion world energy featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Energy",
    "subclass": "Charged",
    "displayName": "Charged",
    "imagePrompt": "A highly detailed charged energy featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Energy",
    "subclass": "Quantum Storm",
    "displayName": "Quantum Storm",
    "imagePrompt": "A highly detailed quantum storm energy featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Primordial",
    "subclass": "Proto World",
    "displayName": "Proto World",
    "imagePrompt": "A highly detailed proto world primordial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Primordial",
    "subclass": "Young Planet",
    "displayName": "Young Planet",
    "imagePrompt": "A highly detailed young planet primordial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Primordial",
    "subclass": "Ancient Core",
    "displayName": "Ancient Core",
    "imagePrompt": "A highly detailed ancient core primordial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Primordial",
    "subclass": "Unformed",
    "displayName": "Unformed",
    "imagePrompt": "A highly detailed unformed primordial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Primordial",
    "subclass": "Cooling Crust",
    "displayName": "Cooling Crust",
    "imagePrompt": "A highly detailed cooling crust primordial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Primordial",
    "subclass": "Heavy Bombardment",
    "displayName": "Heavy Bombardment",
    "imagePrompt": "A highly detailed heavy bombardment primordial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Primordial",
    "subclass": "Proto Ocean",
    "displayName": "Proto Ocean",
    "imagePrompt": "A highly detailed proto ocean primordial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Primordial",
    "subclass": "Molten Crust",
    "displayName": "Molten Crust",
    "imagePrompt": "A highly detailed molten crust primordial featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Dead",
    "subclass": "Barren",
    "displayName": "Barren",
    "imagePrompt": "A highly detailed barren dead featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Dead",
    "subclass": "Dust Planet",
    "displayName": "Dust Planet",
    "imagePrompt": "A highly detailed dust planet dead featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Dead",
    "subclass": "Impact World",
    "displayName": "Impact World",
    "imagePrompt": "A highly detailed impact world dead featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Dead",
    "subclass": "Lifeless",
    "displayName": "Lifeless",
    "imagePrompt": "A highly detailed lifeless dead featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Dead",
    "subclass": "Airless",
    "displayName": "Airless",
    "imagePrompt": "A highly detailed airless dead featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Dead",
    "subclass": "Grey World",
    "displayName": "Grey World",
    "imagePrompt": "A highly detailed grey world dead featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Dead",
    "subclass": "Broken World",
    "displayName": "Broken World",
    "imagePrompt": "A highly detailed broken world dead featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  },
  {
    "planetClass": "Dead",
    "subclass": "Crater Fields",
    "displayName": "Crater Fields",
    "imagePrompt": "A highly detailed crater fields dead featuring realistic planetary surface textures, believable geological formations, cinematic lighting, and premium sci-fi strategy game quality viewed from orbit."
  }
];

export const PLANET_MOON_CHARACTERISTICS = [
  {
    label: "Base planet only",
    prompt: ""
  },
  {
    label: "One distant moon",
    prompt: "Moon characteristic: one small distant moon, fully visible, spherical, and separated from the planet edge."
  },
  {
    label: "Two tiny moons",
    prompt: "Moon characteristic: two tiny distant moons, fully visible, spherical, and separated from the planet edge."
  },
  {
    label: "Three small moons",
    prompt: "Moon characteristic: three small distant moons at varied distances, fully visible, spherical, and separated from the planet edge."
  },
  {
    label: "Large companion moon",
    prompt: "Moon characteristic: one larger companion moon far behind the planet, fully visible, spherical, and separated from the planet edge."
  },
  {
    label: "Crescent moon",
    prompt: "Moon characteristic: a subtle crescent moon in the far background, fully separated from the planet edge."
  }
];

export function buildPlanetPrompt(description: string, moonCharacteristic = "") {
  const fullDescription = [description.trim(), moonCharacteristic.trim()].filter(Boolean).join("\n\n");
  return PLANET_MASTER_PROMPT.replace("(INSERT PLANET DESCRIPTION)", fullDescription);
}

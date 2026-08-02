import { compilePlanetVisualPrompt } from "@/lib/visual-production/celestial-prompt-compiler";

export type PlanetPromptTemplate = {
  planetClass: string;
  subclass: string;
  displayName: string;
  imagePrompt: string;
};

export const PLANET_MASTER_PROMPT = [
  "Create a premium NOVERIS visual of one complete planet.",
  "Show one scientifically plausible spherical world from orbit, fully visible and centered on a pure black background with generous negative space.",
  "Preserve the selected planet class, subclass, surface materials, atmosphere, climate character, visible cloud systems, and any stated rings or moons.",
  "Use controlled upper-left illumination, realistic terminator shading, crisp contained silhouette edges, restrained color, and clean extraction-friendly separation.",
  "3840 x 3840, 1:1. No text, labels, watermark, logo, interface, border, external terrain, spacecraft, duplicate bodies, excessive glow, bloom, lens flare, or decorative background."
].join("\n");

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
    "subclass": "Swamp",
    "displayName": "Swamp",
    "imagePrompt": "A wet terrestrial world with vast marshlands, dark green wetland continents, shallow inland seas, branching river deltas, misty lowlands, and humid cloud systems."
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

const PLANET_CLASS_FEATURES: Record<string, string> = {
  Terrestrial: "Natural rocky surface with continents, elevation changes, coastlines, river systems, and moderate cloud cover.",
  Ocean: "Dominant water coverage with deep seas, island chains, reef patterns, oceanic storms, and blue-green color variation.",
  Desert: "Dry arid surface with dune fields, canyon systems, salt flats, exposed rock, and sparse cloud cover.",
  Ice: "Frozen surface with glaciers, polar caps, fractured ice sheets, pale blue-white terrain, and cold atmospheric tones.",
  Lava: "Dark volcanic crust with molten lava seams, basalt plates, ash clouds contained inside the sphere, and intense orange magma highlights.",
  "Gas Giant": "No solid surface; layered atmospheric bands, storm belts, turbulent cloud cells, and smooth gaseous color gradients contained inside the sphere.",
  Crystal: "Mineral-rich surface with crystalline color patterns, reflective deposits, geode-like regions, quartz fields, and prismatic terrain tones.",
  Toxic: "Hostile chemical atmosphere with acidic cloud swirls, sulfur or poison coloration, dark landmasses, and corrosive sea or haze patterns.",
  Artificial: "Planet-scale constructed surface with machine plating, grid-like city patterns, energy channels, artificial crust, and engineered symmetry.",
  Void: "Dark anomalous surface with shadowed terrain, negative-space regions, subtle cosmic distortion patterns, and deep black-violet coloration.",
  Living: "Organic planetary surface with biological textures, root-like patterns, living oceans or forests, and natural green or alien color palettes.",
  Bio: "Mutated biological terrain with cellular patterns, fungal or spore-like regions, bioluminescent clusters, and alien organic coloration.",
  Ancient: "Old planetary surface marked by buried ruins, weathered megastructure patterns, archaeological scars, and relic-like terrain markings.",
  Energy: "Charged planetary atmosphere with contained plasma, aurora-like color bands, lightning patterns, radiant storms, and electromagnetic surface effects.",
  Primordial: "Young unstable world with cooling crust, heavy bombardment marks, proto-oceans, molten fractures, and unfinished geological formation.",
  Dead: "Lifeless rocky surface with crater fields, dust plains, broken crust, grey-brown terrain, and little to no visible atmosphere."
};

const SUBCLASS_FEATURES: Record<string, string> = {
  "Earthlike": "Balanced blue oceans, green-brown continents, white cloud systems, and small polar ice caps.",
  "Continental": "Large connected landmasses, visible coastlines, inland seas, and varied green-brown terrain.",
  "Highlands": "Raised continental regions, mountain-like texture fields, plateaus, and rugged elevation patterns.",
  "Swamp": "Dark green wetland continents, shallow inland seas, branching river deltas, misty lowlands, and humid cloud systems.",
  "Riverlands": "Branching river networks, wet lowlands, inland deltas, and lush terrain corridors.",
  "Badlands": "Eroded rock, dry ridges, exposed sediment bands, and rusty canyon coloration.",
  "Savanna": "Warm golden grassland tones, scattered green belts, seasonal river marks, and dry cloud patterns.",
  "Alpine": "High snowy ranges, cold mountain belts, dark valleys, and crisp blue-white terrain contrast.",
  "Deep Ocean": "Nearly complete ocean coverage, darker abyssal blues, sparse island specks, and deep current patterns.",
  "Island World": "Many isolated islands across bright ocean, shallow coastal shelves, and tropical water coloration.",
  "Archipelago": "Dense island chains, broken coastlines, shallow seas, and scattered tropical cloud cells.",
  "Storm Ocean": "Large spiral storm systems over dark ocean, rough atmospheric bands, and turbulent cloud fields.",
  "Coral World": "Turquoise shallow seas, reef-like color webs, scattered islands, and bright aquatic gradients.",
  "Frozen Ocean": "Icy ocean plates, cracked sea ice, pale blue water gaps, and polar storm systems.",
  "Kelp Ocean": "Green-blue seas, darker organic blooms, broad marine vegetation tones, and soft cloud cover.",
  "Abyssal Ocean": "Very dark ocean surface, faint bioluminescent water patterns, minimal land, and deep blue-black tones.",
  "Dunes": "Sweeping dune seas, wind-carved sand bands, ochre-gold terrain, and sparse atmospheric dust.",
  "Canyon": "Deep canyon networks, exposed layered cliffs, red-orange rock, and dry fractured terrain.",
  "Salt Flats": "Pale salt basins, white mineral plains, shallow brine patches, and dry geometric cracking.",
  "Rock Desert": "Bare stone plains, rocky ridges, muted tan-grey surface, and almost no visible water.",
  "Mesa": "Flat-topped plateau textures, eroded red-brown terrain, dry basins, and sharp geological edges.",
  "Dust Basin": "Dusty lowlands, soft tan atmospheric tint, broad sediment bowls, and muted surface contrast.",
  "Black Desert": "Dark volcanic sand, charcoal plains, sparse rust highlights, and stark low-reflective terrain.",
  "Oasis": "Dry desert surface interrupted by blue-green oasis regions, river traces, and green belts.",
  "Glacial": "Massive glacier sheets, white-blue ice fields, dark exposed rock, and frosted cloud cover.",
  "Snow World": "Snow-covered terrain, soft white landmasses, icy plains, and subtle blue shadows.",
  "Cryovolcanic": "Frozen crust with icy volcanic scars, blue-white fracture lines, and cold plume-like markings.",
  "Blue Ice": "Deep blue translucent ice sheets, bright frozen ridges, and high-contrast crystalline ice texture.",
  "Ice Canyons": "Cracked ice ravines, frozen canyon networks, and blue shadow lines across pale terrain.",
  "Polar": "Huge polar ice caps, cold ocean gaps, white cloud bands, and restrained blue-grey coloration.",
  "Fractured Ice": "Broken ice plates, dark ocean cracks, jagged frost lines, and fractured surface geometry.",
  "Volcanic": "Black volcanic crust, glowing orange lava rivers, ash-darkened terrain, and active molten fissures.",
  "Molten Core": "Extreme lava exposure, bright magma lakes, thin dark crust plates, and intense internal heat patterns.",
  "Ash World": "Grey ash plains, soot clouds contained on the surface, dark volcanic scars, and muted lava glow.",
  "Basalt World": "Dark basalt plates, hard angular crust, red-orange cracks, and rugged volcanic terrain.",
  "Obsidian": "Glossy black volcanic surface, sharp dark plates, sparse orange fissures, and reflective rock tones.",
  "Firestorm": "Hot storm bands, ember-like cloud patterns, turbulent orange atmosphere, and scorched terrain.",
  "Sulfur Basin": "Yellow sulfur deposits, volcanic basins, toxic orange-yellow terrain, and smoky surface markings.",
  "Magma Ocean": "Wide molten seas, floating dark crust islands, bright lava fields, and extreme orange-black contrast.",
  "Banded": "Broad horizontal gas bands, cream and tan atmospheric layers, and soft storm cells.",
  "Storm Giant": "Huge rotating storm systems, turbulent cloud belts, darker atmospheric vortices, and dramatic color bands.",
  "Ice Giant": "Blue-cyan gaseous layers, smooth cold atmosphere, subtle white cloud streaks, and icy coloration.",
  "Metallic Giant": "Silver-grey gas layers, metallic blue highlights, dense banding, and reflective atmospheric tones.",
  "Amber Giant": "Warm amber and gold cloud bands, honey-colored storms, and smooth gaseous gradients.",
  "Emerald Giant": "Emerald green atmospheric bands, darker green storm systems, and luminous teal gas layers.",
  "Striped Giant": "High-contrast striped atmospheric belts, alternating warm and cool bands, and small storm cells.",
  "Cyclone Giant": "Dominant cyclone formations, spiral cloud systems, and turbulent banded atmosphere.",
  "Crystal Forest": "Dense crystal-like formations visible as reflective terrain patterns, with green or violet mineral fields.",
  "Crystal Desert": "Arid crystalline plains, sparkling mineral dunes, pale reflective basins, and sharp crystal coloration.",
  "Crystal Caverns": "Geode-like surface regions, exposed crystal pockets, dark mineral crust, and glowing cavern patterns.",
  "Prismatic": "Rainbow-like mineral refraction, colorful crystal deposits, and bright prismatic surface bands.",
  "Quartz Peaks": "White quartz ridges, pale mountain-like mineral structures, and reflective highland patterns.",
  "Amethyst": "Purple crystal fields, violet mineral crust, and deep amethyst terrain highlights.",
  "Emerald Crystal": "Green crystalline deposits, emerald mineral veins, and reflective green terrain zones.",
  "Sapphire Crystal": "Blue crystal deposits, sapphire terrain ridges, and cool reflective mineral fields.",
  "Acid World": "Acidic green-yellow atmosphere, corrosive seas, dark landmasses, and harsh chemical cloud swirls.",
  "Sulfur World": "Yellow sulfur clouds, scorched mineral plains, toxic basins, and orange-green chemical haze.",
  "Poison Swamp": "Murky green wetlands, toxic organic pools, dark swampy continents, and acidic cloud cover.",
  "Corrosive": "Eroded dark terrain, chemical staining, harsh green atmosphere, and dissolved coastline patterns.",
  "Green Atmosphere": "Dense green atmospheric tint, dark rocky continents, and acidic cloud spirals.",
  "Purple Atmosphere": "Purple toxic cloud layers, dark alien landmasses, and violet chemical haze.",
  "Chemical Seas": "Unnatural colored seas, toxic shoreline stains, and swirling chemical cloud systems.",
  "Industrial Wasteland": "Polluted terrain, grey-brown surface scarring, chemical clouds, and industrial waste coloration.",
  "Machine World": "Mechanical surface plating, repeating grid patterns, metallic continents, and artificial light channels.",
  "Cyber Planet": "Cybernetic city-grid patterns, neon-like circuit traces contained on the surface, and dark metal crust.",
  "Forge World": "Industrial furnace terrain, orange heat channels, dark metal plating, and smelter-like surface patterns.",
  "Arcology World": "Dense city-layer patterns, enclosed artificial regions, geometric urban crust, and metallic detail.",
  "AI Core": "Centralized machine patterns, glowing data channels, symmetrical artificial crust, and cold blue energy lines.",
  "Nanotech World": "Fine machine texture, self-assembling surface patterns, metallic dust fields, and smooth artificial gradients.",
  "Data Sphere": "Circuit-like planetary bands, blue-white information channels, and organized geometric surface markings.",
  "Defense World": "Armored crust plates, fortress-like surface geometry, dark metal regions, and defensive grid patterns.",
  "Dark Void": "Near-black terrain, subtle purple distortion, sparse shadowed surface detail, and deep cosmic darkness.",
  "Quantum Rift": "Fractured reality patterns, blue-violet rift marks contained inside the sphere, and unstable terrain coloration.",
  "Entropy World": "Decayed surface regions, dark grey erosion, faded color, and collapse-like terrain patterns.",
  "Singularity World": "Extreme dark center tones, warped surface gradients, and subtle gravitational distortion patterns.",
  "Shadow World": "Dark shadowed landmasses, muted blue-black surface, and faint violet atmospheric accents.",
  "Event Horizon": "Blackened planetary surface, curved dark gradients, and subtle orange or violet edge-contained effects.",
  "Negative Space": "Minimal dark surface detail, black void-like regions, and stark absence-based terrain patterns.",
  "Void Storms": "Dark storm systems, violet cloud spirals, and turbulent shadow atmosphere contained inside the sphere.",
  "Living Forest": "Planetwide forest textures, organic green continents, root-like networks, and living canopy patterns.",
  "Living Ocean": "Organic ocean surfaces, teal-green biological blooms, living reef structures, and fluid alien patterns.",
  "Organic World": "Biological surface textures, fleshy or plantlike terrain, natural vein patterns, and alien organic coloration.",
  "Symbiotic World": "Interwoven organic zones, balanced plantlike and oceanic patterns, and mutually connected terrain networks.",
  "World Tree": "Tree-root networks visible as planetwide organic lines, broad green canopy regions, and ancient living terrain.",
  "Living Coral": "Coral-like surface formations, pink-orange aquatic organic regions, and reef-patterned oceans.",
  "Breathing World": "Soft organic atmosphere, pulsing-looking cloud bands, living terrain folds, and biological surface rhythm.",
  "Root Network": "Visible root systems across continents, dark organic veins, and connected plantlike surface webbing.",
  "Mutated": "Distorted organic terrain, unnatural colors, irregular biological regions, and unstable surface mutations.",
  "Bioluminescent": "Glowing biological patches contained on the surface, dark terrain, and blue-green luminous regions.",
  "Hive World": "Honeycomb-like terrain patterns, dense organic structures, and colony-like surface geometry.",
  "Genetic World": "DNA-like banding, cellular terrain patterns, and engineered biological surface coloration.",
  "Spore World": "Fungal spore fields, dusty organic clouds, mushroom-like surface color patterns, and muted biological terrain.",
  "Fungal World": "Broad fungal mats, earth-toned organic continents, pale spore regions, and soft biological textures.",
  "Parasite World": "Invasive organic veins, diseased color patches, dark host terrain, and aggressive biological growth patterns.",
  "Cellular": "Cell-like surface structures, membrane patterns, and microscopic biological motifs scaled to planetary form.",
  "Temple World": "Ancient temple-like surface geometry, buried sacred patterns, weathered stone colors, and relic terrain.",
  "Lost Civilization": "Faint ruined grid patterns, old city traces, overgrown surface scars, and ancient settlement markings.",
  "Ruined Empire": "Large ruin fields, collapsed artificial regions, aged infrastructure patterns, and weathered imperial scars.",
  "Archaeological": "Excavation-like terrain marks, exposed buried structures, and layered historical surface patterns.",
  "Ancient Battlefield": "Scarred terrain, impact marks, ruined fortification patterns, and old conflict damage across the surface.",
  "Collapsed Arcology": "Fallen megacity regions, broken urban shells, and geometric ruins embedded in terrain.",
  "Relic World": "Prominent ancient relic patterns, mysterious surface symbols, and weathered artifact-like terrain.",
  "Forgotten Capital": "Dense ruined capital patterns, old city rings, decayed infrastructure, and ancient urban geometry.",
  "Plasma World": "Contained plasma-like surface regions, electric color gradients, and energetic atmospheric streaks.",
  "Electromagnetic": "Magnetic field-like bands, blue-white energy arcs contained on the sphere, and charged cloud lines.",
  "Storm World": "Planetwide storm systems, lightning-like internal patterns, and turbulent cloud formations.",
  "Radiant": "Bright radiant surface tones, contained luminous regions, and warm energy-rich atmospheric color.",
  "Aurora": "Aurora-like bands across the upper atmosphere, green-blue light curtains contained inside the silhouette.",
  "Ion World": "Ionized blue-purple atmosphere, charged cloud layers, and electric surface highlights.",
  "Charged": "Energetic cloud bands, blue-white electrical patterns, and high-energy atmospheric texture.",
  "Quantum Storm": "Unstable storm spirals, violet-blue quantum coloration, and strange energetic turbulence.",
  "Proto World": "Unfinished young terrain, active crust formation, early oceans or vapor, and unstable geology.",
  "Young Planet": "Newly formed surface, fresh impact marks, volcanic activity, and bright unstable crust.",
  "Ancient Core": "Exposed old core-like regions, deep metallic tones, cracked crust, and primordial heat marks.",
  "Unformed": "Partially differentiated surface, uneven crust, molten patches, and raw planetary formation patterns.",
  "Cooling Crust": "Dark crust plates cooling over glowing seams, early volcanic terrain, and shrinking molten regions.",
  "Heavy Bombardment": "Dense impact craters, fresh collision scars, dusty ejecta patterns, and battered young terrain.",
  "Proto Ocean": "Early shallow oceans, vaporous cloud patterns, raw continents, and newly forming coastlines.",
  "Molten Crust": "Widespread molten crust, unstable lava fractures, dark cooling plates, and bright orange seams.",
  "Barren": "Dry empty plains, muted rocky color, very sparse atmosphere, and lifeless surface texture.",
  "Dust Planet": "Dusty surface, soft tan-grey haze contained inside the sphere, and wind-smoothed plains.",
  "Impact World": "Massive crater fields, impact basins, fractured crust, and scattered ejecta marks.",
  "Lifeless": "Bare rocky continents, no visible vegetation, no ocean emphasis, and stark dead surface tones.",
  "Airless": "Sharp cratered terrain, black sky impression, no cloud cover, and harsh direct surface contrast.",
  "Grey World": "Grey monochrome terrain, crater plains, muted rock fields, and minimal atmospheric color.",
  "Broken World": "Fractured crust, large cracks, damaged terrain plates, and signs of planetary instability.",
  "Crater Fields": "Dense overlapping craters, pitted rock surface, ejecta rings, and battered dead-world terrain."
};

function fallbackSubclassFeatures(row: PlanetPromptTemplate) {
  return `${row.displayName} ${row.planetClass.toLowerCase()} world with surface colors, terrain patterns, atmosphere, and cloud forms that clearly communicate ${row.subclass.toLowerCase()}.`;
}

export function planetTypeFeaturePrompt(row: PlanetPromptTemplate) {
  const subclassFeatures = SUBCLASS_FEATURES[row.subclass] ?? fallbackSubclassFeatures(row);
  const classFeatures = PLANET_CLASS_FEATURES[row.planetClass];
  return [subclassFeatures, classFeatures].filter(Boolean).join(" ");
}

export function buildPlanetPrompt(description: string) {
  return compilePlanetVisualPrompt({
    planetClass: "planet",
    planetSubclass: "procedural",
    visualSummary: description.trim()
  }).visualPrompt;
}

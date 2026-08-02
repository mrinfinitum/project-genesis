export type CosmicGenerationPromptTemplate = {
  category: string;
  subclass: string;
  displayName: string;
  prompt: string;
};

export const GALAXY_MASTER_PROMPT = [
  "Create a premium NOVERIS galaxy visual with restrained astronomical realism, broad negative space, sparse tiny stars, and quiet structural depth.",
  "Use this selected galaxy character:",
  "(INSERT GALAXY PROFILE)",
  "No text, watermark, logo, interface, frame, diagram, decorative effects, or busy wallpaper composition."
].join("\n");

export const GALACTIC_REGION_MASTER_PROMPT = [
  "Create a premium NOVERIS galactic-region visual with a quiet open center, sparse tiny stars, and distant low-contrast interstellar texture.",
  "Use this selected region character:",
  "(INSERT GALACTIC REGION PROFILE)",
  "No text, watermark, logo, interface, frame, planets, suns, orbit paths, or decorative effects."
].join("\n");

export function buildCosmicGenerationPrompt(masterPrompt: string, template: CosmicGenerationPromptTemplate) {
  return masterPrompt.replace(/\(INSERT (GALAXY|GALACTIC REGION) PROFILE\)/, template.prompt);
}

export const GALAXY_PROMPT_LIBRARY: CosmicGenerationPromptTemplate[] = [
  {
    category: "Spiral Galaxy",
    subclass: "Grand Design Spiral",
    displayName: "Grand Design Spiral",
    prompt: "A mature grand-design spiral galaxy with two stable, well-defined arms, a calm luminous core, a broad temperate disk, and clear opportunities for region-by-region exploration."
  },
  {
    category: "Spiral Galaxy",
    subclass: "Barred Spiral",
    displayName: "Barred Spiral",
    prompt: "A barred spiral galaxy with a long central stellar bar, asymmetric dust lanes, active inner ring regions, and diverse arm environments that reward deliberate navigation."
  },
  {
    category: "Spiral Galaxy",
    subclass: "Flocculent Spiral",
    displayName: "Flocculent Spiral",
    prompt: "A flocculent spiral galaxy with fragmented, softly structured arms, numerous local stellar associations, irregular star-forming pockets, and a less predictable exploration rhythm."
  },
  {
    category: "Disk Galaxy",
    subclass: "Ring Galaxy",
    displayName: "Ring Galaxy",
    prompt: "A rare ring galaxy shaped by an ancient interaction, with a dense outer star-forming ring, a quieter central body, and strong contrasts between its interior and rim regions."
  },
  {
    category: "Elliptical Galaxy",
    subclass: "Giant Elliptical",
    displayName: "Giant Elliptical",
    prompt: "A massive old elliptical galaxy with a dense central population, low dust content, many globular clusters, ancient stellar systems, and sparse but high-value archaeology."
  },
  {
    category: "Elliptical Galaxy",
    subclass: "Dwarf Elliptical",
    displayName: "Dwarf Elliptical",
    prompt: "A compact dwarf elliptical galaxy with old stars, few active birth regions, limited gas, and a tightly concentrated set of durable, resource-conscious systems."
  },
  {
    category: "Disk Galaxy",
    subclass: "Lenticular",
    displayName: "Lenticular Galaxy",
    prompt: "A lenticular galaxy between spiral and elliptical forms: a quiet stellar disk, subdued arms, mature planetary systems, and infrastructure-friendly conditions without active starburst activity."
  },
  {
    category: "Irregular Galaxy",
    subclass: "Dwarf Irregular",
    displayName: "Dwarf Irregular",
    prompt: "A gas-rich dwarf irregular galaxy with scattered young associations, uneven stellar density, unusual local chemistry, and frontier exploration that favors scouts over fixed routes."
  },
  {
    category: "Interacting Galaxy",
    subclass: "Tidal Pair",
    displayName: "Tidal Pair",
    prompt: "A stable interacting galaxy pair connected by faint tidal material. Keep each parent galaxy distinct, define the shared encounter history, and make cross-galaxy travel a late-game strategic opportunity."
  },
  {
    category: "Interacting Galaxy",
    subclass: "Post-Merger",
    displayName: "Post-Merger Remnant",
    prompt: "A galaxy recently settled after a major merger, with a disturbed but coherent structure, mixed stellar populations, isolated starburst remnants, and complex historical evidence."
  },
  {
    category: "Low Activity Galaxy",
    subclass: "Low Surface Brightness",
    displayName: "Low Surface Brightness",
    prompt: "A diffuse low-surface-brightness galaxy with wide quiet spacing, dark-matter-dominated structure, sparse bright stars, and large regions of deliberate astronomical solitude."
  },
  {
    category: "Active Galaxy",
    subclass: "Starburst Core",
    displayName: "Starburst Core",
    prompt: "A galaxy with one contained starburst core region, elevated radiation and young clusters near the center, and calmer outer arms suitable for measured expansion."
  }
];

export const GALACTIC_REGION_PROMPT_LIBRARY: CosmicGenerationPromptTemplate[] = [
  {
    category: "Milky Way Region",
    subclass: "Galactic Core",
    displayName: "Galactic Core",
    prompt: "The dense inner core of the Milky Way: ancient stellar populations, strong gravitational complexity, heavy extinction, limited visibility, rare high-value discoveries, and severe navigation constraints."
  },
  {
    category: "Milky Way Region",
    subclass: "Galactic Bar",
    displayName: "Galactic Bar",
    prompt: "The Milky Way's central bar: elongated stellar structure, mixed-age populations, shifting orbital streams, dense traffic corridors, and elevated strategic value near the core."
  },
  {
    category: "Milky Way Region",
    subclass: "Orion Spur",
    displayName: "Orion Spur",
    prompt: "The Orion Spur: a comparatively calm local spur containing Sol, balanced stellar density, mature main-sequence systems, navigable distances, and a strong foundation for early exploration."
  },
  {
    category: "Milky Way Region",
    subclass: "Perseus Arm",
    displayName: "Perseus Arm",
    prompt: "The Perseus Arm: a major outer spiral arm with active star formation, young clusters, dust pockets, broad exploration lanes, and a mixture of frontier colonies and scientific targets."
  },
  {
    category: "Milky Way Region",
    subclass: "Sagittarius Arm",
    displayName: "Sagittarius Arm",
    prompt: "The Sagittarius Arm: a populous inner spiral arm with complex gas lanes, diverse stellar ages, dense trade potential, and intermittent visibility hazards."
  },
  {
    category: "Milky Way Region",
    subclass: "Scutum-Centaurus Arm",
    displayName: "Scutum-Centaurus Arm",
    prompt: "The Scutum-Centaurus Arm: a broad major arm with prolific star formation, rich molecular material, volatile young systems, and deep exploration opportunities."
  },
  {
    category: "Milky Way Region",
    subclass: "Norma Arm",
    displayName: "Norma Arm",
    prompt: "The Norma Arm: a dense inner arm with obscuring dust, high-energy stellar neighborhoods, difficult surveying conditions, and valuable but dangerous discoveries."
  },
  {
    category: "Milky Way Region",
    subclass: "Outer Rim",
    displayName: "Outer Rim",
    prompt: "The Outer Rim: a sparse low-density frontier with widely separated systems, older stars, cold outer worlds, long logistics routes, and large expanses of quiet space."
  },
  {
    category: "Milky Way Region",
    subclass: "Galactic Halo",
    displayName: "Galactic Halo",
    prompt: "The Galactic Halo: an extremely sparse high-latitude region of old stars, globular clusters, minimal gas, isolated relics, and expedition-scale distances."
  }
];

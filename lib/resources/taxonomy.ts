import type { ResourceCatalogItem } from "@/types/schema";

export const RESOURCE_TAXONOMY_VERSION = "resource-taxonomy-v3.1";
export const RESOURCE_PROFILE_GENERATION_VERSION = "planet-resource-taxonomy-v3";

export const RESOURCE_PRIMARY_CATEGORIES = [
  "Elements", "Isotopes", "Minerals", "Ores", "Crystals", "Rocks and Geological Materials",
  "Liquids", "Gases", "Ices and Frozen Volatiles", "Fuels", "Chemicals and Compounds",
  "Biological Materials", "Organic Materials", "Manufactured Components", "Alloys and Engineered Materials",
  "Synthetic and Nanotechnology Materials", "Energy Materials", "Ancient Materials", "Exotic Matter",
  "Primordial Matter", "Genesis Matter"
] as const;

export type ResourcePrimaryCategory = typeof RESOURCE_PRIMARY_CATEGORIES[number];
export type ResourceMigrationAction = "KEEP_RESOURCE" | "RECLASSIFY_RESOURCE" | "MERGE_DUPLICATE" | "MOVE_TO_DISCOVERY" | "DEPRECATE_WITH_REPLACEMENT";
export type ResourceMigrationRecord = {
  id: string;
  legacy_resource_id: string;
  migration_action: ResourceMigrationAction;
  canonical_resource_id?: string;
  canonical_discovery_id?: string;
  migration_version: string;
  preserve_inventory_quantity: boolean;
  conversion_rule?: string;
  notes: string;
};

const elementNameSegment1 = [
  "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon",
  "Sodium", "Magnesium", "Aluminum", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Argon", "Potassium", "Calcium",
  "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc",
  "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton", "Rubidium", "Strontium", "Yttrium", "Zirconium"
] as const;

const elementNameSegment2 = [
  "Niobium", "Molybdenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium", "Indium", "Tin",
  "Antimony", "Tellurium", "Iodine", "Xenon", "Cesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium",
  "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium",
  "Lutetium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum", "Gold", "Mercury"
] as const;

const elementNameSegment3 = [
  "Thallium", "Lead", "Bismuth", "Polonium", "Astatine", "Radon", "Francium", "Radium", "Actinium", "Thorium",
  "Protactinium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium", "Berkelium", "Californium", "Einsteinium", "Fermium"
] as const;

const elementNameSegment4 = [
  "Mendelevium", "Nobelium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Darmstadtium"
] as const;
const elementNameSegment5 = [
  "Roentgenium", "Copernicium", "Nihonium", "Flerovium", "Moscovium", "Livermorium", "Tennessine", "Oganesson"
] as const;
const elementNames = [...elementNameSegment1, ...elementNameSegment2, ...elementNameSegment3, ...elementNameSegment4, ...elementNameSegment5];

const elementSymbols = (
  "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca " +
  "Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr " +
  "Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd " +
  "Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg " +
  "Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm " +
  "Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
).split(" ");

const familyMembers: Record<string, string[]> = {
  "Reactive Nonmetal": ["Hydrogen", "Carbon", "Nitrogen", "Oxygen", "Phosphorus", "Sulfur", "Selenium"],
  "Noble Gas": ["Helium", "Neon", "Argon", "Krypton", "Xenon", "Radon", "Oganesson"],
  "Alkali Metal": ["Lithium", "Sodium", "Potassium", "Rubidium", "Cesium", "Francium"],
  "Alkaline Earth Metal": ["Beryllium", "Magnesium", "Calcium", "Strontium", "Barium", "Radium"],
  "Metalloid": ["Boron", "Silicon", "Germanium", "Arsenic", "Antimony", "Tellurium"],
  "Halogen": ["Fluorine", "Chlorine", "Bromine", "Iodine", "Astatine", "Tennessine"],
  "Post-Transition Metal": ["Aluminum", "Gallium", "Indium", "Tin", "Thallium", "Lead", "Bismuth", "Polonium", "Nihonium", "Flerovium", "Moscovium", "Livermorium"],
  "Lanthanide": elementNames.slice(56, 71),
  "Actinide": elementNames.slice(88, 103)
};

function elementFamily(name: string) {
  return Object.entries(familyMembers).find(([, members]) => members.includes(name))?.[0] ?? "Transition Metal";
}

function periodFor(atomicNumber: number) {
  if (atomicNumber <= 2) return 1;
  if (atomicNumber <= 10) return 2;
  if (atomicNumber <= 18) return 3;
  if (atomicNumber <= 36) return 4;
  if (atomicNumber <= 54) return 5;
  if (atomicNumber <= 86) return 6;
  return 7;
}

function groupFor(name: string, atomicNumber: number) {
  const fixed: Record<string, number> = {
    Hydrogen: 1, Helium: 18, Boron: 13, Carbon: 14, Nitrogen: 15, Oxygen: 16, Fluorine: 17, Neon: 18,
    Aluminum: 13, Silicon: 14, Phosphorus: 15, Sulfur: 16, Chlorine: 17, Argon: 18,
    Gallium: 13, Germanium: 14, Arsenic: 15, Selenium: 16, Bromine: 17, Krypton: 18,
    Indium: 13, Tin: 14, Antimony: 15, Tellurium: 16, Iodine: 17, Xenon: 18,
    Thallium: 13, Lead: 14, Bismuth: 15, Polonium: 16, Astatine: 17, Radon: 18,
    Nihonium: 13, Flerovium: 14, Moscovium: 15, Livermorium: 16, Tennessine: 17, Oganesson: 18
  };
  if (fixed[name]) return fixed[name];
  const family = elementFamily(name);
  if (family === "Alkali Metal") return 1;
  if (family === "Alkaline Earth Metal") return 2;
  if (family === "Lanthanide" || family === "Actinide") return undefined;
  const offsets = atomicNumber <= 36 ? 18 : atomicNumber <= 54 ? 36 : atomicNumber <= 86 ? 68 : 100;
  return Math.min(12, Math.max(3, atomicNumber - offsets));
}

export const PERIODIC_ELEMENTS = elementNames.map((name, index) => {
  const atomicNumber = index + 1;
  const radioactive = atomicNumber >= 84 || atomicNumber === 43 || atomicNumber === 61;
  const occurrence = atomicNumber >= 104 ? "Synthetic" : atomicNumber >= 95 ? "Primarily Synthetic" : [43, 61, 93, 94].includes(atomicNumber) ? "Trace Naturally Occurring" : "Naturally Occurring";
  const phase = [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86].includes(atomicNumber) ? "Gas" : [35, 80].includes(atomicNumber) ? "Liquid" : atomicNumber >= 104 ? "Unknown" : "Solid";
  return {
    atomic_number: atomicNumber,
    resource_name: name,
    chemical_symbol: elementSymbols[index],
    atomic_mass_display: atomicNumber >= 84 ? `[${atomicNumber}]` : "Standard atomic weight",
    element_family: elementFamily(name),
    period: periodFor(atomicNumber),
    group_number: groupFor(name, atomicNumber),
    standard_phase: phase as "Solid" | "Liquid" | "Gas" | "Unknown",
    occurrence: occurrence as "Naturally Occurring" | "Trace Naturally Occurring" | "Primarily Synthetic" | "Synthetic",
    radioactive,
    properties_status: (atomicNumber >= 104 ? "Predicted" : atomicNumber >= 95 ? "Partially Observed" : "Observed") as "Observed" | "Partially Observed" | "Predicted"
  };
});

export const PERIODIC_ELEMENT_BY_NAME = new Map(PERIODIC_ELEMENTS.map((item) => [item.resource_name.toLowerCase(), item]));

const movedResourceSpecs = [
  ["RES-0108", "Ancient Circuit", "RES-0100", "ancient-relics", "ancient-machines", "mechanical-calculators"],
  ["RES-0109", "Relic Fragments", "RES-0106", "ancient-relics", "cultural-objects", "sculptural-fragments"],
  ["RES-0110", "Temple Stone", "RES-0001", "ruins-and-structures", "temples", "forbidden-sanctums"],
  ["RES-0111", "Lost Archive", "RES-0192", "ancient-relics", "lost-knowledge", "historical-chronicles"],
  ["RES-0112", "Ancient Memory Crystal", "RES-0101", "ancient-relics", "scientific-artifacts", "data-recording-devices"],
  ["RES-0113", "Machine Relic", "RES-0099", "ancient-relics", "ancient-machines", "unknown-machines"],
  ["RES-0114", "Empire Seal", "RES-0106", "ancient-relics", "ceremonial-objects", "coronation-regalia"],
  ["RES-0115", "Harmony Tablet", "RES-0101", "ancient-relics", "religious-relics", "ritual-texts"],
  ["RES-0116", "Void Tablet", "RES-0080", "ancient-relics", "scientific-artifacts", "field-survey-tools"]
] as const;

const movedResourceSpecs2 = [
  ["RES-0117", "First Civilization Artifact", "RES-0106", "ancient-relics", "ceremonial-objects", "founding-relics"],
  ["RES-0118", "Ancient Reactor", "RES-0102", "ruins-and-structures", "industrial-complexes", "power-stations"],
  ["RES-0119", "Relic Core", "RES-0102", "ancient-relics", "ancient-machines", "energy-regulators"],
  ["RES-0120", "Lost Star Map", "RES-0193", "ancient-relics", "lost-knowledge", "star-maps"],
  ["RES-0121", "Arcology Blueprint", "RES-0092", "ancient-relics", "lost-knowledge", "engineering-schematics"],
  ["RES-0122", "City Core", "RES-0092", "ruins-and-structures", "cities", "machine-cities"],
  ["RES-0123", "War Core", "RES-0093", "ancient-relics", "military-relics", "fortification-components"],
  ["RES-0124", "Capital Core", "RES-0092", "ruins-and-structures", "cities", "planetary-capitals"],
  ["RES-0125", "Universal Knowledge Fragment", "RES-0101", "ancient-relics", "lost-knowledge", "encoded-tablets"]
] as const;

const movedResourceSpecs3 = [
  ["RES-PROFILE-ABYSSAL-RELIC", "Abyssal Relic", "RES-0107", "ancient-relics", "cultural-objects", "sculptural-fragments"],
  ["RES-PROFILE-ANCIENT-AI-FRAGMENT", "Ancient AI Fragment", "RES-0100", "alien-technology", "artificial-intelligence", "cognitive-cores"],
  ["RES-PROFILE-ANCIENT-BONE", "Ancient Bone", "RES-0060", "ancient-relics", "scientific-artifacts", "research-samples"],
  ["RES-PROFILE-ANCIENT-FOSSILS", "Ancient Fossils", "RES-0060", "fossils-and-preserved-life", "flora-fossils", "petrified-plants"],
  ["RES-PROFILE-BATTLE-RELICS", "Battle Relics", "RES-0106", "ancient-relics", "military-relics", "fortification-components"],
  ["RES-PROFILE-COLLECTIVE-MIND-FRAGMENT", "Collective Mind Fragment", "RES-0103", "alien-technology", "artificial-intelligence", "collective-minds"],
  ["RES-PROFILE-FOSSILS", "Fossils", "RES-0060", "fossils-and-preserved-life", "flora-fossils", "petrified-plants"],
  ["RES-PROFILE-HARMONY-FRAGMENT", "Harmony Fragment", "RES-0101", "ancient-relics", "religious-relics", "ritual-texts"],
  ["RES-0159", "Ancient Core", "RES-0106", "alien-technology", "computing-systems", "distributed-cores"],
  ["RES-PROFILE-UNIVERSAL-ANOMALY", "Universal Anomaly", "RES-0127", "anomalies", "spatial-anomalies", "rift-zones"],
  ["RES-0174", "Genesis Heart", "RES-0173", "unknown-objects", "unknown-materials", "energy-storing-materials"],
  ["RES-0176", "Genesis Memory", "RES-0173", "unknown-objects", "unknown-materials", "memory-materials"]
] as const;

export const MOVED_RESOURCE_SPECS = [...movedResourceSpecs, ...movedResourceSpecs2, ...movedResourceSpecs3];
export const MOVED_RESOURCE_IDS: ReadonlySet<string> = new Set(MOVED_RESOURCE_SPECS.map(([id]) => id));
export const RESOURCE_MIGRATIONS: ResourceMigrationRecord[] = MOVED_RESOURCE_SPECS.map(([legacyId, name, replacementId]) => ({
  id: `RESOURCE-MIGRATION-${legacyId}`,
  legacy_resource_id: legacyId,
  migration_action: "MOVE_TO_DISCOVERY",
  canonical_resource_id: replacementId,
  canonical_discovery_id: name === "Void Tablet" ? "REL-0149" : `DISC-MIGRATED-${legacyId.replace("RES-", "")}`,
  migration_version: RESOURCE_TAXONOMY_VERSION,
  preserve_inventory_quantity: true,
  conversion_rule: `Convert each legacy ${name} inventory unit to one unit of ${replacementId}; preserve the discovery unlock separately.`,
  notes: `${name} is a unique found object, not a repeatable economic material.`
}));
export const RESOURCE_MIGRATION_BY_LEGACY_ID = new Map(RESOURCE_MIGRATIONS.map((item) => [item.legacy_resource_id, item]));

const categoryType: Record<ResourcePrimaryCategory, string> = {
  Elements: "Element", Isotopes: "Isotope", Minerals: "Mineral", Ores: "Ore", Crystals: "Crystal",
  "Rocks and Geological Materials": "Rock", Liquids: "Liquid", Gases: "Gas", "Ices and Frozen Volatiles": "Ice",
  Fuels: "Fuel", "Chemicals and Compounds": "Compound", "Biological Materials": "Biological", "Organic Materials": "Organic",
  "Manufactured Components": "Manufactured Component", "Alloys and Engineered Materials": "Alloy",
  "Synthetic and Nanotechnology Materials": "Synthetic Material", "Energy Materials": "Energy Material",
  "Ancient Materials": "Ancient Material", "Exotic Matter": "Exotic Matter", "Primordial Matter": "Primordial Matter", "Genesis Matter": "Genesis Matter"
};

function categoryFor(resource: ResourceCatalogItem): ResourcePrimaryCategory {
  const name = resource.resource_name.toLowerCase();
  const category = resource.category.toLowerCase();
  if (PERIODIC_ELEMENT_BY_NAME.has(name)) return "Elements";
  if (/^(quartz|magnetite|calcite|corundum|hematite|graphite|deep core minerals)$/.test(name)) return "Minerals";
  if (/genesis/.test(name) || category.includes("genesis")) return "Genesis Matter";
  if (/proto matter|prime matter|planet seed|world seed/.test(name) || category.includes("primordial")) return "Primordial Matter";
  if (category.includes("isotope") || /helium-3 trace/.test(name)) return "Isotopes";
  if (/survey data|cartography|defense matrix|machine parts|circuitry|industrial scrap/.test(name)) return "Manufactured Components";
  if (/alloy|living metal|precursor metal/.test(name) || category.includes("metal") && category.includes("synthetic")) return "Alloys and Engineered Materials";
  if (/acidic compounds|aluminum oxide|chemical waste|toxic catalyst/.test(name)) return "Chemicals and Compounds";
  if (/living network/.test(name)) return "Biological Materials";
  if (/ancient|relic|fossil|battle relic|harmony fragment/.test(name) || category.includes("archaeology")) return "Ancient Materials";
  if (/negative matter|dark matter|exotic matter|quantum foam|gravitonium|void essence|void heart|reality fragment|temporal shard|singularity fragment|event horizon|black hole residue|stellar fragment|entropy shard|universal anomaly/.test(name)) return "Exotic Matter";
  if (/quantum core|singularity core|gravity core|chrono core|zero point core|shadow core|void core/.test(name)) return "Exotic Matter";
  if (/storm core|photon core|plasma core|electromagnetic core|lightning core|charge core|ion core|aurora core|infinite energy|solar energy|fusion catalyst|stellar plasma|storm plasma|^plasma$/.test(name)) return "Energy Materials";
  if (/cellular core|evolution core|glow core|hive core|living core|living reef core|mutation core|mycelium core|parasite core|root core|spore core|symbiosis core/.test(name)) return "Biological Materials";
  if (/rare earth elements|rare metals|iron nodules|manganese nodules|quantum ore/.test(name) || / ore$/.test(name)) return "Ores";
  if (name.includes("crystal") || category.includes("crystal")) return "Crystals";
  if (/pearl/.test(name)) return "Crystals";
  if (/stone|sand|clay|soil|limestone|granite|basalt|marble|obsidian|regolith|ash|molten rock|fresh crust|volcanic glass|dust/.test(name)) return "Rocks and Geological Materials";
  if (category.includes("liquid") || /water$|oil$|brine|solvent|fluid/.test(name)) return "Liquids";
  if (category.includes("ice") || / ice$|frozen|snow|water ice/.test(name)) return "Ices and Frozen Volatiles";
  if (category.includes("fuel") || /coal|natural gas|fusion fuel|hydrogen fuel|hydrate/.test(name)) return "Fuels";
  if (category.includes("gas")) return "Gases";
  if (category.includes("synthetic") && /part|circuit|core|storage|component/.test(name)) return "Manufactured Components";
  if (category.includes("synthetic")) return "Synthetic and Nanotechnology Materials";
  if (category.includes("biological") || category.includes("biochemical") || /tissue|genome|biomass|coral|enzyme/.test(name)) return "Biological Materials";
  if (category.includes("organic") || /wood|fungal|mycelium|chitin|spore|resin/.test(name)) return "Organic Materials";
  if (/energy|plasma|charge|solar/.test(category) || /energy|plasma|storm core|photon core|lightning core|charge core/.test(name)) return "Energy Materials";
  if (/cosmic|exotic/.test(category)) return "Exotic Matter";
  if (category.includes("chemical") || /salt|ammonia|methane|hydrocarbon|mutagen/.test(name)) return "Chemicals and Compounds";
  if (category.includes("mineral") || category.includes("carbon") || category.includes("radioactive") || category.includes("element group")) return "Minerals";
  return "Minerals";
}

function subcategoryFor(resource: ResourceCatalogItem, primaryCategory: ResourcePrimaryCategory, element = PERIODIC_ELEMENT_BY_NAME.get(resource.resource_name.toLowerCase())) {
  const name = resource.resource_name.toLowerCase();
  if (element) return element.element_family;

  const rules: Record<ResourcePrimaryCategory, Array<[RegExp, string]>> = {
    Elements: [],
    Isotopes: [[/helium|solar wind/, "Helium and Solar Isotopes"], [/deuterium|hydrogen/, "Hydrogen Isotopes"]],
    Minerals: [[/graphite|carbon/, "Carbon Minerals"], [/magnetite/, "Oxide Minerals"], [/iron/, "Metallic Minerals"], [/nodule/, "Seafloor Minerals"], [/.*/, "General Minerals"]],
    Ores: [[/rare earth|rare metal/, "Critical Metal Ores"], [/iron|manganese|metal/, "Metal Ores"], [/quantum/, "Exotic Ores"], [/.*/, "Mineral Ores"]],
    Crystals: [[/diamond|quartz/, "Industrial Crystals"], [/amethyst|emerald|sapphire|pearl/, "Gemstones"], [/energy|photon|lightstone|zero point/, "Energy Crystals"], [/data|gravity|chrono/, "Information and Field Crystals"], [/cryo|ice/, "Cryogenic Crystals"], [/magma|obsidian/, "Volcanic Crystals"], [/living/, "Living Crystals"], [/genesis/, "Genesis Crystals"], [/void|dark|prismatic|infinite/, "Exotic Crystals"], [/.*/, "General Crystals"]],
    "Rocks and Geological Materials": [[/sand|clay|soil|regolith|dust/, "Sediments and Soils"], [/obsidian|glass/, "Natural Glass"], [/molten rock/, "Molten Geological Materials"], [/ash|fresh crust/, "Volcanic Materials"], [/breathstone|charged stone|fractured stone/, "Exotic Geological Materials"], [/potash/, "Mineral Salts"], [/.*/, "Rock Types"]],
    Liquids: [[/fresh water|storm water/, "Fresh and Atmospheric Water"], [/salt water|brine/, "Saline Liquids"], [/heavy water|proto water/, "Specialized Water"], [/oil/, "Hydrocarbon Liquids"], [/solvent/, "Industrial Solvents"], [/corrosive|toxic/, "Hazardous Liquids"], [/.*/, "General Liquids"]],
    Gases: [[/bio gas|atmospheric organics/, "Biological Gases"], [/quantum|exotic|alien/, "Exotic Gases"], [/toxic/, "Toxic Gases"], [/ammonia|methane/, "Chemical Gases"], [/ion/, "Ionized Gases"], [/.*/, "General Gases"]],
    "Ices and Frozen Volatiles": [[/water ice|snow/, "Water Ice"], [/ammonia|methane|nitrogen/, "Frozen Volatiles"], [/exotic|blue|fractured/, "Exotic Ices"], [/.*/, "General Ices"]],
    Fuels: [[/coal|oil/, "Fossil Fuels"], [/natural gas|methane hydrate/, "Gaseous Fuels"], [/metallic hydrogen/, "High-Pressure Fuels"], [/fusion/, "Fusion Fuels"], [/.*/, "General Fuels"]],
    "Chemicals and Compounds": [[/salt|potash/, "Salts"], [/hydrocarbon/, "Hydrocarbons"], [/oxide/, "Oxides"], [/acid|corrosive/, "Reactive Compounds"], [/catalyst/, "Catalysts"], [/waste/, "Chemical Waste"], [/.*/, "General Compounds"]],
    "Biological Materials": [[/genome|genetic/, "Genetic Materials"], [/tissue/, "Biological Tissues"], [/biomass|bio gel/, "Biomass"], [/coral|reef/, "Coral Materials"], [/fiber|roots/, "Structural Biomaterials"], [/mutagen|enzyme/, "Biochemical Agents"], [/core|network/, "Living Cores and Networks"], [/.*/, "General Biological Materials"]],
    "Organic Materials": [[/wood|fiber/, "Plant Fibers"], [/chitin/, "Structural Organics"], [/resin|polymer/, "Biopolymers and Resins"], [/fungal|mycelium/, "Fungal Materials"], [/.*/, "Organic Compounds"]],
    "Manufactured Components": [[/survey|cartography/, "Data Products"], [/circuit/, "Electronics"], [/machine part/, "Mechanical Components"], [/defense matrix/, "Defense Systems"], [/scrap/, "Industrial Salvage"], [/.*/, "General Components"]],
    "Alloys and Engineered Materials": [[/steel|structural/, "Structural Alloys"], [/armor/, "Armor Alloys"], [/living metal/, "Living Metals"], [/ancient|precursor/, "Ancient Alloys"], [/genesis/, "Genesis Alloys"], [/.*/, "Advanced Alloys"]],
    "Synthetic and Nanotechnology Materials": [[/nano fiber/, "Nanomaterials"], [/nanite/, "Nanomachines"], [/neural|consciousness/, "Synthetic Intelligence Materials"], [/.*/, "Synthetic Matter"]],
    "Energy Materials": [[/plasma/, "Plasma Materials"], [/solar/, "Stellar Energy"], [/infinite/, "Infinite Energy"], [/catalyst/, "Energy Catalysts"], [/core/, "Condensed Energy Cores"], [/.*/, "General Energy Materials"]],
    "Ancient Materials": [[/fossil|bone/, "Fossils and Remains"], [/relic|battle/, "Relic Materials"], [/fragment/, "Ancient Fragments"], [/core/, "Ancient Cores"], [/.*/, "Archaeological Materials"]],
    "Exotic Matter": [[/dark matter|negative matter/, "Dark and Negative Matter"], [/quantum/, "Quantum Matter"], [/gravit/, "Gravitic Matter"], [/temporal|chrono/, "Temporal Matter"], [/singularity|event horizon|black hole/, "Singularity Matter"], [/void/, "Void Matter"], [/reality|entropy|anomaly/, "Reality-Bending Matter"], [/stellar/, "Stellar Remnants"], [/.*/, "General Exotic Matter"]],
    "Primordial Matter": [[/seed/, "World Seeds"], [/.*/, "Prime Matter"]],
    "Genesis Matter": [[/seed/, "Genesis Seeds"], [/matrix|memory/, "Genesis Matrices"], [/heart|core/, "Genesis Cores"], [/energy/, "Genesis Energy"], [/biomass|genome/, "Genesis Biological Matter"], [/crystal/, "Genesis Crystals"], [/alloy/, "Genesis Alloys"], [/.*/, "General Genesis Matter"]]
  };
  return rules[primaryCategory].find(([pattern]) => pattern.test(name))?.[1] ?? `General ${primaryCategory}`;
}

function secondaryCategoriesFor(resource: ResourceCatalogItem, primaryCategory: ResourcePrimaryCategory, subcategory: string) {
  const name = resource.resource_name.toLowerCase();
  const element = PERIODIC_ELEMENT_BY_NAME.get(resource.resource_name.toLowerCase());
  const placements = [...(resource.secondary_categories ?? [])];
  if (element?.standard_phase === "Gas") placements.push({ primary_category: "Gases", subcategory: "Elemental Gases" });
  if (element?.standard_phase === "Liquid") placements.push({ primary_category: "Liquids", subcategory: "Elemental Liquids" });
  if (name === "oil") placements.push({ primary_category: "Fuels", subcategory: "Fossil Fuels" });
  if (name === "natural gas") placements.push({ primary_category: "Gases", subcategory: "Chemical Gases" });
  if (/solvent|lithium brine/.test(name)) placements.push({ primary_category: "Chemicals and Compounds", subcategory: "General Compounds" });
  if (name === "proto water") placements.push({ primary_category: "Liquids", subcategory: "Specialized Water" });
  if (/ancient alloy|precursor metal|living metal/.test(name)) placements.push({ primary_category: "Ancient Materials", subcategory: "Engineered Ancient Materials" });
  return placements.filter((placement, index, values) =>
    !(placement.primary_category === primaryCategory && placement.subcategory === subcategory) &&
    values.findIndex((candidate) => candidate.primary_category === placement.primary_category && candidate.subcategory === placement.subcategory) === index
  );
}

export function resourceCategoryPlacement(resource: ResourceCatalogItem, category: string) {
  if ((resource.primary_category ?? resource.category) === category) return resource.subcategory ?? "General";
  return resource.secondary_categories?.find((placement) => placement.primary_category === category)?.subcategory;
}

export function normalizeResourceRecord(resource: ResourceCatalogItem): ResourceCatalogItem {
  const primaryCategory = categoryFor(resource);
  const element = PERIODIC_ELEMENT_BY_NAME.get(resource.resource_name.toLowerCase());
  const subcategory = subcategoryFor(resource, primaryCategory, element);
  return {
    ...resource,
    category: primaryCategory,
    primary_category: primaryCategory,
    resource_type: categoryType[primaryCategory],
    subcategory,
    secondary_categories: secondaryCategoriesFor(resource, primaryCategory, subcategory),
    tags: [...new Set([...(resource.tags ?? []), resource.category, resource.rarity, resource.discovery_tier, ...(element ? [element.element_family, element.chemical_symbol] : [])].filter(Boolean))],
    legacy_category: resource.category === primaryCategory ? resource.legacy_category : resource.category,
    migration_version: RESOURCE_TAXONOMY_VERSION,
    status: "active",
    radioactive: element?.radioactive ?? /uranium|radioactive/.test(resource.resource_name.toLowerCase()),
    synthetic: element ? ["Primarily Synthetic", "Synthetic"].includes(element.occurrence) : /synthetic|nano|engineered/.test(primaryCategory.toLowerCase()),
    natural_occurrence: element?.occurrence ?? "Canonical generation rules",
    typical_star_system_conditions: resource.typical_star_system_conditions ?? [],
    minimum_planet_rarity: resource.minimum_planet_rarity ?? resource.rarity,
    minimum_research_tier: resource.minimum_research_tier ?? resource.first_unlock_requirement,
    extraction_method: resource.extraction_method ?? (element?.occurrence === "Synthetic" ? "Particle accelerator synthesis" : "Extraction, recovery, or processing"),
    required_technology: resource.required_technology ?? [resource.first_unlock_requirement].filter(Boolean),
    resource_profile_eligible: resource.resource_profile_eligible ?? !(element?.occurrence === "Synthetic"),
    recipe_ids: resource.recipe_ids ?? [],
    produced_by_ids: resource.produced_by_ids ?? [],
    consumed_by_ids: resource.consumed_by_ids ?? [],
    harvested_from_discovery_ids: resource.harvested_from_discovery_ids ?? [],
    element: element ? { ...element, scientific_reference_notes: `${element.resource_name} is chemical element ${element.atomic_number} (${element.chemical_symbol}). Scientific metadata is descriptive unless referenced by a gameplay rule.` } : undefined
  };
}

export function buildMissingElementRecords(existing: ResourceCatalogItem[]) {
  const existingNames = new Set(existing.map((item) => item.resource_name.toLowerCase()));
  return PERIODIC_ELEMENTS.filter((element) => !existingNames.has(element.resource_name.toLowerCase())).map((element) => normalizeResourceRecord({
    id: `RES-ELEMENT-${String(element.atomic_number).padStart(3, "0")}`,
    resource_name: element.resource_name,
    category: "Elements",
    rarity: element.atomic_number > 94 ? "Legendary" : element.radioactive ? "Rare" : "Common",
    rarity_color: element.atomic_number > 94 ? "#F59E0B" : element.radioactive ? "#3498DB" : "#FFFFFF",
    discovery_tier: element.atomic_number > 94 ? "Interstellar" : element.radioactive ? "Planetary" : "Earth",
    earth_available: element.occurrence === "Naturally Occurring" ? "Yes" : "No",
    first_unlock_requirement: element.atomic_number > 94 ? "Particle Synthesis" : element.radioactive ? "Radiation Handling" : "Element Analysis",
    typical_planet_classes: element.occurrence === "Synthetic" ? ["Artificial"] : ["Terrestrial", "Dead", "Lava", "Gas Giant"],
    primary_uses: ["science", "industry", "research"],
    base_trade_value: element.atomic_number * (element.atomic_number > 94 ? 20 : element.radioactive ? 5 : 2),
    stack_size: 9999,
    description: `${element.resource_name} is the officially named chemical element with atomic number ${element.atomic_number} and symbol ${element.chemical_symbol}.`,
    science_lore_notes: "Canonical periodic-table record. Availability is governed separately from catalog presence.",
    codex_implementation_notes: "Added by Resource Taxonomy v3.0. Stable ID; do not rename or recycle.",
    created_at: "2026-07-20T00:00:00.000Z",
    updated_at: "2026-07-20T00:00:00.000Z"
  }));
}

export function validateResourceTaxonomy(catalog: ResourceCatalogItem[]) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const elements = catalog.filter((item) => item.primary_category === "Elements");
  const numbers = new Set<number>();
  const symbols = new Set<string>();
  const namesSeen = new Set<string>();
  for (const resource of catalog) {
    if (!resource.primary_category || !RESOURCE_PRIMARY_CATEGORIES.includes(resource.primary_category as ResourcePrimaryCategory)) errors.push(`${resource.id}: invalid primary category`);
    if (resource.primary_category?.includes("/")) errors.push(`${resource.id}: slash-separated primary category`);
    if (resource.primary_category === "Elements" && !resource.element) errors.push(`${resource.id}: element metadata missing`);
    if (resource.primary_category !== "Elements" && resource.element) errors.push(`${resource.id}: non-element has element metadata`);
    if (!resource.subcategory?.trim()) errors.push(`${resource.id}: missing canonical subcategory`);
    if (/^(ocean|cosmic|planetary|energy)$/i.test(resource.subcategory ?? "")) errors.push(`${resource.id}: invalid legacy subcategory ${resource.subcategory}`);
    const placementKeys = new Set<string>();
    for (const placement of resource.secondary_categories ?? []) {
      if (!RESOURCE_PRIMARY_CATEGORIES.includes(placement.primary_category as ResourcePrimaryCategory)) errors.push(`${resource.id}: invalid secondary category ${placement.primary_category}`);
      if (!placement.subcategory?.trim()) errors.push(`${resource.id}: missing secondary subcategory`);
      const key = `${placement.primary_category}/${placement.subcategory}`;
      if (placementKeys.has(key)) errors.push(`${resource.id}: duplicate secondary category placement ${key}`);
      placementKeys.add(key);
    }
    if (resource.element?.standard_phase === "Gas" && resourceCategoryPlacement(resource, "Gases") !== "Elemental Gases") errors.push(`${resource.id}: gaseous element missing Gases placement`);
  }
  for (const resource of elements) {
    const element = resource.element!;
    if (numbers.has(element.atomic_number)) errors.push(`duplicate atomic number ${element.atomic_number}`);
    if (symbols.has(element.chemical_symbol)) errors.push(`duplicate chemical symbol ${element.chemical_symbol}`);
    const normalizedName = resource.resource_name.toLowerCase();
    if (namesSeen.has(normalizedName)) errors.push(`duplicate element name ${resource.resource_name}`);
    numbers.add(element.atomic_number); symbols.add(element.chemical_symbol); namesSeen.add(normalizedName);
    if (element.occurrence === "Synthetic" && resource.resource_profile_eligible) warnings.push(`${resource.id}: synthetic element is enabled for ordinary resource profiles`);
  }
  for (let atomicNumber = 1; atomicNumber <= 118; atomicNumber += 1) if (!numbers.has(atomicNumber)) errors.push(`missing atomic number ${atomicNumber}`);
  return { status: errors.length ? "Invalid" : warnings.length ? "Ready With Warnings" : "Ready", errors, warnings, elementCount: elements.length };
}

import { handoffResourceCatalog } from "@/data/handoff";
import planetResourceProfilesRaw from "@/data/handoff/json/Planet_Resource_Profiles.json";
import {
  buildMissingElementRecords,
  MOVED_RESOURCE_IDS,
  normalizeResourceRecord,
  RESOURCE_MIGRATION_BY_LEGACY_ID,
  RESOURCE_MIGRATIONS,
  RESOURCE_PROFILE_GENERATION_VERSION,
  RESOURCE_TAXONOMY_VERSION,
  validateResourceTaxonomy
} from "@/lib/resources/taxonomy";
import type { ResourceCatalogItem } from "@/types/schema";

type ResourceLookup = {
  byId: Map<string, ResourceCatalogItem>;
  byName: Map<string, ResourceCatalogItem>;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function list(value: unknown) {
  return text(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildLookup(catalog: ResourceCatalogItem[]): ResourceLookup {
  return {
    byId: new Map(catalog.map((item) => [item.id, item])),
    byName: new Map(catalog.map((item) => [normalize(item.resource_name), item]))
  };
}

const supplementalResourceCatalog: ResourceCatalogItem[] = [
  ["RES-0177", "Hydrogen", "Gas", "Common", "Space", "Primary gas giant atmospheric fuel resource."],
  ["RES-0178", "Helium", "Gas", "Common", "Space", "Common gas giant atmospheric resource and fusion economy precursor."],
  ["RES-0179", "Ammonia", "Gas/Chemical", "Common", "Space", "Volatile compound harvested from gas giants, ice giants, and outer moons."],
  ["RES-0180", "Methane", "Gas/Chemical", "Common", "Space", "Hydrocarbon gas used for fuel, chemistry, and gas giant harvesting."],
  ["RES-0181", "Hydrocarbons", "Chemical", "Common", "Space", "Fuel-rich chemical resource from atmospheric and icy bodies."],
  ["RES-0182", "Chemical Salts", "Chemical", "Common", "Planetary", "Reactive mineral salts used in chemistry, terraforming, and toxic-world processing."],
  ["RES-0183", "Rare Metals", "Metal", "Rare", "Planetary", "High-value mixed metals used in advanced manufacturing and trade."],
  ["RES-0184", "Bio Gas Trace", "Gas/Organic", "Exotic", "Space", "Rare biological gas trace produced by unusual living or emerald gas giants."],
  ["RES-0185", "Storm Core", "Energy", "Exotic", "Space", "Condensed atmospheric storm energy from extreme gas giant weather systems."],
  ["RES-0186", "Exotic Ice", "Ice", "Exotic", "Deep Space", "Unusual cryogenic compound from ice giants and distant frozen worlds."],
  ["RES-0187", "Quantum Gas Trace", "Gas/Exotic", "Exotic", "Deep Space", "Trace quantum gas used in advanced research and exotic propulsion."],
  ["RES-0188", "Gravitonium Trace", "Exotic", "Exotic", "Deep Space", "Trace gravitonium signature found in extreme gravity environments."],
  ["RES-0189", "Solar Energy", "Energy", "Common", "Earth", "Stellar energy harvested by solar systems and orbital infrastructure."],
  ["RES-0190", "Organic Compounds", "Organic/Chemical", "Common", "Planetary", "Carbon-based compounds used in biology, medicine, and chemistry."],
  ["RES-0191", "Fusion Fuel", "Fuel", "Uncommon", "Space", "Refined fuel category produced from hydrogen isotopes and gas giant harvest loops."],
  ["RES-0192", "Survey Data", "Data", "Common", "Space", "Exploration data gathered through scans, probes, and orbital surveys."],
  ["RES-0193", "Galactic Cartography", "Data", "Rare", "Space", "Strategic mapping data for galaxy-scale navigation and exploration."],
  ["RES-0194", "Long Range Survey Data", "Data", "Uncommon", "Space", "Long-baseline scan data used to classify distant sectors and star systems."]
].map(([id, resource_name, category, rarity, discovery_tier, description]) => ({
  id,
  resource_name,
  category,
  rarity,
  rarity_color: rarity === "Common" ? "#FFFFFF" : rarity === "Rare" ? "#3498DB" : "#F39C12",
  discovery_tier,
  earth_available: discovery_tier === "Earth" ? "Yes" : "No",
  first_unlock_requirement: discovery_tier === "Earth" ? "Start" : "Space Survey",
  typical_planet_classes: ["Gas Giant", "Ice", "Toxic", "Lava", "Terrestrial", "Dead"],
  primary_uses: ["planet generation", "economy", "crafting", "research"],
  base_trade_value: rarity === "Common" ? 10 : rarity === "Rare" ? 75 : 250,
  stack_size: 9999,
  description,
  science_lore_notes: "Supplemental canonical resource added by ResourceService to keep generation rules catalog-backed.",
  codex_implementation_notes: "Stable generated ID. Do not rename or reuse.",
  created_at: "2026-07-09T00:00:00.000Z",
  updated_at: "2026-07-09T00:00:00.000Z"
}));

const knownSupplementalNames = new Set([...handoffResourceCatalog, ...supplementalResourceCatalog].map((resource) => normalize(resource.resource_name)));
const profileSupplementalResourceCatalog: ResourceCatalogItem[] = [
  ...new Set(
    (planetResourceProfilesRaw as Array<Record<string, unknown>>).flatMap((row) => [
      ...list(row["Guaranteed Resources"]),
      ...list(row["Common Resources"]),
      ...list(row["Rare Resources"]),
      ...list(row["Exotic Resources"])
    ])
  )
]
  .filter((resourceName) => !knownSupplementalNames.has(normalize(resourceName)))
  .sort((left, right) => left.localeCompare(right))
  .map((resourceName) => {
    const normalizedName = normalize(resourceName);
    const category = normalizedName.includes("gas")
      ? "Gas"
      : normalizedName.includes("water") || normalizedName.includes("ice") || normalizedName.includes("snow")
        ? "Volatile"
        : normalizedName.includes("core") || normalizedName.includes("energy") || normalizedName.includes("storm") || normalizedName.includes("ion")
          ? "Energy"
          : normalizedName.includes("relic") || normalizedName.includes("fragment") || normalizedName.includes("fossil")
            ? "Archaeology"
            : normalizedName.includes("bio") || normalizedName.includes("organics") || normalizedName.includes("tissue") || normalizedName.includes("spore")
              ? "Organic"
              : normalizedName.includes("crystal")
                ? "Crystal"
                : "Planetary";
    const rarity = normalizedName.includes("trace") || normalizedName.includes("exotic") || normalizedName.includes("genesis") || normalizedName.includes("infinite") ? "Exotic" : "Uncommon";

    return {
      id: `RES-PROFILE-${slug(resourceName).toUpperCase()}`,
      resource_name: resourceName,
      category,
      rarity,
      rarity_color: rarity === "Exotic" ? "#F39C12" : "#2ECC71",
      discovery_tier: "Planetary",
      earth_available: "No",
      first_unlock_requirement: "Planetary Survey",
      typical_planet_classes: ["Terrestrial", "Ocean", "Desert", "Ice", "Lava", "Gas Giant", "Crystal", "Toxic", "Artificial", "Void", "Living", "Bio", "Ancient", "Energy", "Primordial", "Dead"],
      primary_uses: ["planet generation", "resource profiles", "exploration"],
      base_trade_value: rarity === "Exotic" ? 250 : 45,
      stack_size: 9999,
      description: `${resourceName} is a profile-normalized canonical resource used by deterministic planet generation.`,
      science_lore_notes: "Supplemental canonical resource inferred from Planet Resource Profiles v2.0 normalization.",
      codex_implementation_notes: "Stable generated ID. Keep for save compatibility unless migrated through an explicit ID remap.",
      created_at: "2026-07-09T00:00:00.000Z",
      updated_at: "2026-07-09T00:00:00.000Z"
    };
  });

const classificationSupplementalResourceCatalog: ResourceCatalogItem[] = [
  ["RES-ISOTOPE-TRITIUM", "Tritium", "Isotopes", "Rare", "Space", "Radioactive hydrogen isotope used in fusion systems and scientific research."],
  ["RES-ISOTOPE-CARBON-14", "Carbon-14", "Isotopes", "Uncommon", "Planetary", "Radioactive carbon isotope used in dating, tracing, and research."],
  ["RES-ISOTOPE-URANIUM-235", "Uranium-235", "Isotopes", "Rare", "Planetary", "Fissile uranium isotope used in advanced energy and research systems."],
  ["RES-ISOTOPE-URANIUM-238", "Uranium-238", "Isotopes", "Uncommon", "Planetary", "Long-lived uranium isotope used in fuel cycles, shielding, and research."],
  ["RES-MINERAL-CALCITE", "Calcite", "Minerals", "Common", "Earth", "Carbonate mineral used in construction, chemistry, and geological analysis."],
  ["RES-MINERAL-CORUNDUM", "Corundum", "Minerals", "Uncommon", "Earth", "Hard aluminum oxide mineral used for abrasives and engineered materials."],
  ["RES-MINERAL-HEMATITE", "Hematite", "Minerals", "Common", "Earth", "Iron oxide mineral and a principal repeatable source of iron."],
  ["RES-ORE-IRON", "Iron Ore", "Ores", "Common", "Earth", "Mineable ore-grade material processed into canonical iron resources."],
  ["RES-ORE-COPPER", "Copper Ore", "Ores", "Common", "Earth", "Mineable ore-grade material processed into canonical copper resources."],
  ["RES-ORE-TITANIUM", "Titanium Ore", "Ores", "Uncommon", "Planetary", "Mineable titanium-bearing material used by advanced industry."],
  ["RES-ORE-URANIUM", "Uranium Ore", "Ores", "Rare", "Planetary", "Mineable uranium-bearing material requiring radiation-safe extraction."],
].map(([id, resource_name, category, rarity, discovery_tier, description]) => ({
  id,
  resource_name,
  category,
  rarity,
  rarity_color: rarity === "Common" ? "#FFFFFF" : rarity === "Uncommon" ? "#2ECC71" : "#3498DB",
  discovery_tier,
  earth_available: discovery_tier === "Earth" ? "Yes" : "No",
  first_unlock_requirement: discovery_tier === "Earth" ? "Material Analysis" : "Planetary Survey",
  typical_planet_classes: ["Terrestrial", "Dead", "Desert", "Ice", "Lava"],
  primary_uses: ["extraction", "processing", "industry", "research"],
  base_trade_value: rarity === "Common" ? 12 : rarity === "Uncommon" ? 35 : 90,
  stack_size: 9999,
  description,
  science_lore_notes: "Canonical classification baseline added by Resource and Discovery Reclassification v1.0.",
  codex_implementation_notes: "Stable canonical ID. Do not rename or recycle.",
  created_at: "2026-07-20T00:00:00.000Z",
  updated_at: "2026-07-20T00:00:00.000Z"
}));

const sourceResourceCatalog = [...handoffResourceCatalog, ...supplementalResourceCatalog, ...profileSupplementalResourceCatalog, ...classificationSupplementalResourceCatalog];
const deprecatedResourceCatalog = sourceResourceCatalog
  .filter((resource) => MOVED_RESOURCE_IDS.has(resource.id))
  .map((resource) => ({ ...normalizeResourceRecord(resource), status: "deprecated" as const }));
const normalizedSourceCatalog = sourceResourceCatalog
  .filter((resource) => !MOVED_RESOURCE_IDS.has(resource.id))
  .map(normalizeResourceRecord);
const resourceCatalog = [...normalizedSourceCatalog, ...buildMissingElementRecords(normalizedSourceCatalog)];
const lookup = buildLookup(resourceCatalog);
const legacyLookup = buildLookup(deprecatedResourceCatalog);

const resourceAliases = new Map<string, string>([
  ["all earth resources", "RES-EARTH-ALL"],
  ["ammonia", "RES-0179"],
  ["bio gas trace", "RES-0184"],
  ["carbon compounds", "RES-0190"],
  ["carbonaceous rock", "RES-0021"],
  ["chemical salts", "RES-0182"],
  ["cryovolcanic compounds", "RES-0047"],
  ["exotic ice", "RES-0186"],
  ["gravitonium trace", "RES-0188"],
  ["helium", "RES-0178"],
  ["hydrocarbons", "RES-0181"],
  ["hydrogen", "RES-0177"],
  ["methane", "RES-0180"],
  ["organic compounds", "RES-0190"],
  ["quantum gas trace", "RES-0187"],
  ["rare metals", "RES-0183"],
  ["silicates", "RES-0027"],
  ["solar energy", "RES-0189"],
  ["storm core", "RES-0185"],
  ["survey data", "RES-0192"],
  ["trace metals", "RES-0051"],
  ["volcanic minerals", "RES-0163"]
]);

export const ResourceService = {
  catalog: resourceCatalog,
  deprecatedCatalog: deprecatedResourceCatalog,
  migrations: RESOURCE_MIGRATIONS,
  taxonomyVersion: RESOURCE_TAXONOMY_VERSION,
  profileGenerationVersion: RESOURCE_PROFILE_GENERATION_VERSION,

  getById(id: string) {
    return lookup.byId.get(id) ?? legacyLookup.byId.get(id) ?? null;
  },

  getByName(name: string) {
    return lookup.byName.get(normalize(name)) ?? null;
  },

  resolveId(resourceNameOrId: string) {
    if (!resourceNameOrId) {
      return null;
    }

    if (lookup.byId.has(resourceNameOrId)) {
      return resourceNameOrId;
    }

    const migration = RESOURCE_MIGRATION_BY_LEGACY_ID.get(resourceNameOrId);
    if (migration?.canonical_resource_id) return migration.canonical_resource_id;

    const normalized = normalize(resourceNameOrId);
    const legacy = legacyLookup.byName.get(normalized);
    const legacyMigration = legacy ? RESOURCE_MIGRATION_BY_LEGACY_ID.get(legacy.id) : null;
    return lookup.byName.get(normalized)?.id ?? legacyMigration?.canonical_resource_id ?? resourceAliases.get(normalized) ?? null;
  },

  nameForId(id: string) {
    if (id === "RES-EARTH-ALL") {
      return "All Earth Resources";
    }

    return lookup.byId.get(id)?.resource_name ?? legacyLookup.byId.get(id)?.resource_name ?? id;
  },

  namesForIds(ids: string[]) {
    return ids.map((id) => this.nameForId(id));
  },

  normalizeNames(resources: string[]) {
    const ids = resources
      .map((resource) => this.resolveId(resource))
      .filter((id): id is string => Boolean(id));

    return [...new Set(ids)].map((id) => this.nameForId(id));
  },

  earthResourceNames() {
    return resourceCatalog
      .filter((resource) => resource.earth_available.toLowerCase() === "yes")
      .map((resource) => resource.resource_name);
  },

  resourceNamesForPlanetClass(planetClass: string) {
    const normalizedClass = normalize(planetClass);
    return resourceCatalog
      .filter((resource) => resource.typical_planet_classes.some((candidate) => normalize(candidate) === normalizedClass))
      .map((resource) => resource.resource_name);
  },

  resolveLegacyId(id: string) {
    return RESOURCE_MIGRATION_BY_LEGACY_ID.get(id)?.canonical_resource_id ?? id;
  },

  validate() {
    return validateResourceTaxonomy(resourceCatalog);
  }
};

export function resourceNames(ids: string[]) {
  return ResourceService.namesForIds(ids);
}

export function normalizeResourceNames(resources: string[]) {
  return ResourceService.normalizeNames(resources);
}

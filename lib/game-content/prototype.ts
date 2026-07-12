import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { civilizationAges, civilizationAlignmentScores } from "@/data/civilization-identity";
import { getGameData } from "@/lib/data";
import { buildGameEngineExport } from "@/lib/export/game-engine";
import { ResourceService } from "@/lib/resources/service";
import type { ResourceCatalogItem } from "@/types/schema";

export const prototypeSchemaVersion = "prototype-content-v1";
const staticSnapshotFilename = "project-genesis-prototype-content.json";

type PrototypeValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  records: string[];
};

type PrototypeResource = {
  id: string;
  name: string;
  resourceClass: string;
  category: string;
  rarity: string;
  symbol: string | null;
  chemicalFormula: string | null;
  description: string;
  iconKey: string;
  artKey: string;
  baseValue: number;
  discoveredEra: string;
  usableEra: string;
  tradable: boolean;
  tags: string[];
  relatedElementIds: string[];
  relatedCompoundIds: string[];
};

type PrototypeProductionChain = {
  id: string;
  name: string;
  inputResourceIds: string[];
  outputResourceIds: string[];
  notes: string;
};

export type PrototypeSnapshot = {
  contentVersion: number;
  schemaVersion: string;
  generatedAt: string;
  contentHash: string;
  resources: PrototypeResource[];
  eras: Array<{ id: string; order: number; name: string; description: string }>;
  alignments: Array<{ id: string; name: string; scoreRange: [number, number]; additive: true; summary: string }>;
  research: Awaited<ReturnType<typeof getGameData>>["research"];
  unlockMatrix: Awaited<ReturnType<typeof getGameData>>["unlock_matrix"];
  productionChains: PrototypeProductionChain[];
  planets: Awaited<ReturnType<typeof buildGameEngineExport>>["canonical"]["planets"];
  solarSystem: {
    starSystem: Awaited<ReturnType<typeof buildGameEngineExport>>["canonical"]["star_systems"][number] | null;
    bodies: Awaited<ReturnType<typeof buildGameEngineExport>>["canonical"]["celestial_bodies"];
  };
  validation: {
    valid: boolean;
    status: "Ready" | "Blocked";
    errorCount: number;
    warningCount: number;
    checkedAt: string;
    issues: PrototypeValidationIssue[];
  };
};

type PrototypeStore = {
  snapshots: PrototypeSnapshot[];
};

const storePath = process.env.PROJECT_GENESIS_PROTOTYPE_SNAPSHOT_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_PROTOTYPE_SNAPSHOT_STORE)
  : path.join(process.cwd(), "data", "prototype-content-snapshots.local.json");

const staticSnapshotPath = process.env.PROJECT_GENESIS_PROTOTYPE_STATIC_PATH
  ? path.resolve(process.env.PROJECT_GENESIS_PROTOTYPE_STATIC_PATH)
  : path.join(process.cwd(), "public", staticSnapshotFilename);

const formulaByName = new Map<string, string>([
  ["Water", "H2O"],
  ["Carbon Dioxide", "CO2"],
  ["Methane", "CH4"],
  ["Ammonia", "NH3"],
  ["Hydrogen", "H"],
  ["Helium", "He"],
  ["Iron", "Fe"],
  ["Copper", "Cu"],
  ["Titanium", "Ti"],
  ["Gold", "Au"],
  ["Silicon", "Si"],
  ["Uranium", "U"],
  ["Oxygen", "O"],
  ["Nitrogen", "N"],
  ["Carbon", "C"],
  ["Aluminum", "Al"],
  ["Lithium", "Li"],
  ["Nickel", "Ni"],
  ["Cobalt", "Co"],
  ["Sulfur", "S"],
  ["Phosphorus", "P"]
]);

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function eraId(name: string) {
  return `era-${slug(name)}`;
}

function eraForDiscoveryTier(tier: string) {
  const normalized = tier.toLowerCase();
  if (normalized.includes("earth")) return eraId("Survival Age");
  if (normalized.includes("ancient")) return eraId("Ancient Age");
  if (normalized.includes("planet")) return eraId("Modern Age");
  if (normalized.includes("deep") || normalized.includes("interstellar")) return eraId("Interstellar Age");
  if (normalized.includes("galactic") || normalized.includes("genesis")) return eraId("Galactic Age");
  if (normalized.includes("space")) return eraId("Space Age");
  return eraId("Survival Age");
}

function resourceClass(resource: ResourceCatalogItem) {
  const category = resource.category.toLowerCase();
  const name = resource.resource_name.toLowerCase();
  if (formulaByName.has(resource.resource_name)) return "Element";
  if (/water|methane|ammonia|dioxide|compound|chemical|salt|hydrocarbon/.test(name) || /chemical|compound|gas/.test(category)) return "Compound";
  if (/alloy|component|circuit|fuel|industrial|manufactured/.test(name) || /alloy|manufactured|industrial/.test(category)) return "Manufactured";
  if (/bio|organic|living|plant|fossil|bone|spore|tissue/.test(name) || /bio|organic/.test(category)) return "Biological";
  if (/quantum|genesis|void|singularity|gravitonium|exotic/.test(name) || /exotic|energy|ancient/.test(category)) return "Speculative";
  return "Material";
}

function symbolFor(resource: ResourceCatalogItem) {
  const formula = formulaByName.get(resource.resource_name);
  if (formula && /^[A-Z][a-z]?$/.test(formula)) return formula;
  const words = resource.resource_name.split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return words.length === 1
    ? words[0].slice(0, 3).replace(/[^a-z0-9]/gi, "").toUpperCase()
    : words.slice(0, 3).map((word) => word[0]?.toUpperCase()).join("");
}

function tagsFor(resource: ResourceCatalogItem) {
  return [
    resource.category,
    resource.rarity,
    resource.discovery_tier,
    resource.earth_available.toLowerCase() === "yes" ? "Earth Available" : "Offworld",
    ...resource.primary_uses,
    ...resource.typical_planet_classes
  ].filter(Boolean);
}

function normalizeResource(resource: ResourceCatalogItem): PrototypeResource {
  const discoveredEra = eraForDiscoveryTier(resource.discovery_tier);
  return {
    id: resource.id,
    name: resource.resource_name,
    resourceClass: resourceClass(resource),
    category: resource.category,
    rarity: resource.rarity,
    symbol: symbolFor(resource),
    chemicalFormula: formulaByName.get(resource.resource_name) ?? null,
    description: resource.description,
    iconKey: `resource-${slug(resource.resource_name)}`,
    artKey: `resource-${slug(resource.resource_name)}`,
    baseValue: resource.base_trade_value,
    discoveredEra,
    usableEra: discoveredEra,
    tradable: resource.base_trade_value > 0,
    tags: [...new Set(tagsFor(resource))],
    relatedElementIds: [],
    relatedCompoundIds: []
  };
}

function contentHash(snapshot: Omit<PrototypeSnapshot, "contentHash" | "validation">) {
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

async function readStore(): Promise<PrototypeStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<PrototypeStore>;
    return { snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : [] };
  } catch {
    return { snapshots: [] };
  }
}

async function writeStore(store: PrototypeStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

async function writeStaticSnapshot(snapshot: PrototypeSnapshot) {
  await mkdir(path.dirname(staticSnapshotPath), { recursive: true });
  await writeFile(staticSnapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

function latestSnapshot(snapshots: PrototypeSnapshot[]) {
  return [...snapshots].sort((a, b) => b.contentVersion - a.contentVersion)[0] ?? null;
}

function validateSnapshot(snapshot: Omit<PrototypeSnapshot, "contentHash" | "validation">) {
  const issues: PrototypeValidationIssue[] = [];
  const resourceIds = new Set<string>();
  const eraIds = new Set(snapshot.eras.map((era) => era.id));
  const formulaPattern = /^[A-Z][a-z]?(?:\d+)?(?:[A-Z][a-z]?\d?)*$/;

  for (const resource of snapshot.resources) {
    if (resourceIds.has(resource.id)) {
      issues.push({ severity: "error", code: "duplicate_resource_id", message: "Resource IDs must be unique.", records: [resource.id] });
    }
    resourceIds.add(resource.id);

    const requiredFields: Array<keyof PrototypeResource> = [
      "id",
      "name",
      "resourceClass",
      "category",
      "rarity",
      "description",
      "iconKey",
      "artKey",
      "baseValue",
      "discoveredEra",
      "usableEra",
      "tradable",
      "tags",
      "relatedElementIds",
      "relatedCompoundIds"
    ];
    const missing = requiredFields.filter((field) => resource[field] === undefined || resource[field] === null || resource[field] === "");
    if (missing.length) {
      issues.push({ severity: "error", code: "missing_resource_field", message: `Resource ${resource.id} is missing required fields: ${missing.join(", ")}.`, records: [resource.id] });
    }
    if (!resource.name.trim()) {
      issues.push({ severity: "error", code: "empty_resource_name", message: "Resource names cannot be empty.", records: [resource.id] });
    }
    if (resource.chemicalFormula && !formulaPattern.test(resource.chemicalFormula)) {
      issues.push({ severity: "error", code: "invalid_formula", message: "Resource chemicalFormula is invalid.", records: [resource.id] });
    }
    if (!eraIds.has(resource.discoveredEra) || !eraIds.has(resource.usableEra)) {
      issues.push({ severity: "error", code: "invalid_resource_era", message: "Resource discoveredEra and usableEra must resolve.", records: [resource.id] });
    }
    for (const relatedId of [...resource.relatedElementIds, ...resource.relatedCompoundIds]) {
      if (!resourceIds.has(relatedId)) {
        issues.push({ severity: "error", code: "invalid_related_resource", message: "Related resource IDs must resolve.", records: [resource.id, relatedId] });
      }
    }
  }

  for (const chain of snapshot.productionChains) {
    for (const resourceId of [...chain.inputResourceIds, ...chain.outputResourceIds]) {
      if (!resourceIds.has(resourceId)) {
        issues.push({ severity: "error", code: "invalid_production_chain_resource", message: "Production-chain inputs and outputs must resolve.", records: [chain.id, resourceId] });
      }
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    valid: errorCount === 0,
    status: errorCount ? "Blocked" as const : "Ready" as const,
    errorCount,
    warningCount,
    checkedAt: new Date().toISOString(),
    issues
  };
}

async function buildPrototypeSnapshot(contentVersion: number): Promise<PrototypeSnapshot> {
  const [data, genericExport] = await Promise.all([getGameData(), buildGameEngineExport("generic")]);
  const base = {
    contentVersion,
    schemaVersion: prototypeSchemaVersion,
    generatedAt: new Date().toISOString(),
    resources: ResourceService.catalog.map(normalizeResource),
    eras: civilizationAges.map((era, index) => ({ id: eraId(era.name), order: index + 1, ...era })),
    alignments: civilizationAlignmentScores.map((alignment) => ({
      id: alignment.id,
      name: alignment.alignment_name,
      scoreRange: [0, 100] as [number, number],
      additive: true as const,
      summary: alignment.bonus_summary
    })),
    research: data.research,
    unlockMatrix: data.unlock_matrix,
    productionChains: [] as PrototypeProductionChain[],
    planets: genericExport.canonical.planets,
    solarSystem: {
      starSystem: genericExport.canonical.star_systems.find((system) => system.id === "system-sol") ?? null,
      bodies: genericExport.canonical.celestial_bodies.filter((body) => body.system_id === "system-sol")
    }
  };
  const validation = validateSnapshot(base);
  return {
    ...base,
    contentHash: contentHash(base),
    validation
  };
}

async function generatedInitialSnapshot() {
  return buildPrototypeSnapshot(1);
}

export async function getPrototypeSnapshotState() {
  const store = await readStore();
  const latest = latestSnapshot(store.snapshots) ?? await generatedInitialSnapshot();
  const draft = await buildPrototypeSnapshot(latest.contentVersion);
  return {
    latest,
    draftValidation: draft.validation,
    endpoint: "/api/game-content/prototype-snapshot",
    downloadPath: `/${staticSnapshotFilename}`
  };
}

export async function getLatestPrototypeSnapshot() {
  const store = await readStore();
  return latestSnapshot(store.snapshots) ?? await generatedInitialSnapshot();
}

export async function generatePrototypeSnapshot() {
  const store = await readStore();
  const current = latestSnapshot(store.snapshots) ?? await generatedInitialSnapshot();
  const next = await buildPrototypeSnapshot(current.contentVersion + 1);

  if (!next.validation.valid) {
    return { ok: false as const, status: 409, message: "Prototype snapshot validation failed.", validation: next.validation };
  }

  await writeStore({ snapshots: [...store.snapshots, next].sort((a, b) => a.contentVersion - b.contentVersion) });
  await writeStaticSnapshot(next);
  return { ok: true as const, snapshot: next };
}

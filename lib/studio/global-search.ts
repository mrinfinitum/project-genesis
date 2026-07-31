import { handoffBuildings, handoffResearch } from "@/data/handoff";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { ResourceService } from "@/lib/resources/service";
import { getUniverseLibraryData } from "@/lib/universe/library";

export type StudioSearchResultType =
  | "Asset"
  | "Galaxy"
  | "Sector"
  | "Star System"
  | "Star"
  | "Planet"
  | "Discovery"
  | "Civilization"
  | "Building"
  | "Research"
  | "Resource"
  | "Workspace";

export type StudioSearchResult = {
  id: string;
  type: StudioSearchResultType;
  title: string;
  subtitle: string;
  href: string;
  status?: string;
  aliases: string[];
  searchText: string;
};

export type StudioSearchIndex = {
  generatedAt: string;
  staleAfterMs: number;
  recordCount: number;
  results: StudioSearchResult[];
  diagnostics: {
    bounded: boolean;
    indexedFields: string[];
    sourceCollections: string[];
  };
};

const workspaceResults: StudioSearchResult[] = [
  workspace("dashboard", "Dashboard", "/", "Command Center"),
  workspace("asset-library", "Asset Library", "/asset-library", "Content Libraries"),
  workspace("galaxy-library", "Galaxy Library", "/galaxy", "Generated galaxy records"),
  workspace("generate-galaxy", "Generate Galaxy", "/galaxy?action=generate", "Galaxy Library action"),
  workspace("planet-library", "Planet Library", "/planets", "Generated celestial records"),
  workspace("generate-planet", "Generate Planet", "/planets?action=generate", "Planet Library action"),
  workspace("building-library", "Building Library", "/buildings", "Building records and taxonomy"),
  workspace("create-building", "Create Building", "/buildings?action=create", "Building Library action"),
  workspace("research-library", "Research Library", "/research", "Research records and unlocks"),
  workspace("create-research", "Create Research", "/research?action=create", "Research Library action"),
  workspace("resource-library", "Resource Library", "/resource-catalog", "Canonical resource records"),
  workspace("create-resource", "Create Resource", "/resource-catalog?action=create", "Resource Library action"),
  workspace("ai-agents", "AI Agent Libraries", "/ai-agents", "Agents, terminals, personalities, memory, and dialogue"),
  workspace("encyclopedia", "Encyclopedia", "/encyclopedia", "Canonical knowledge browser"),
  workspace("environment-layers", "Environment Asset Library", "/environment-composer/layers", "Reusable authored environment paintings"),
  workspace("universe-layer-generator", "Universe Generator", "/universe-layer-generator", "Canonical universe environment painting inputs"),
  workspace("galaxy-layer-generator", "Galaxy Generator", "/galaxy-layer-generator", "Handcrafted prompts for canonical galaxy specifications"),
  workspace("sector-layer-generator", "Galactic Region Generator", "/sector-layer-generator", "Handcrafted prompts for canonical Milky Way regions"),
  workspace("star-system-layer-generator", "Star System Generator", "/star-system-layer-generator", "Handcrafted star-system prompt library"),
  workspace("environment-scenes", "Environment Scene Composer", "/environment-composer/scenes", "Layered environment compositions"),
  workspace("environment-themes", "Environment Themes", "/environment-composer/themes", "Palette, lighting, fog, and effects intent"),
  workspace("environment-export", "Environment Runtime Export", "/environment-composer/export", "Sanitized renderer-neutral contract"),
  workspace("production-health", "Production Health", "/asset-library?section=all-assets", "Studio health and asset readiness"),
  workspace("architecture", "Architecture", "/architecture", "Architecture Workspace"),
  workspace("upload-asset", "Upload Asset", "/assets?upload=asset", "Asset pipeline"),
  workspace("regenerate-derivatives", "Regenerate Derivatives", "/asset-library?status=needs_review", "Asset pipeline")
];

function workspace(id: string, title: string, href: string, subtitle: string): StudioSearchResult {
  return {
    id: `workspace:${id}`,
    type: "Workspace",
    title,
    subtitle,
    href,
    aliases: [id, title, subtitle],
    searchText: normalize([id, title, subtitle].join(" "))
  };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function result(input: Omit<StudioSearchResult, "searchText">): StudioSearchResult {
  return {
    ...input,
    searchText: normalize([input.id, input.type, input.title, input.subtitle, input.status, ...input.aliases].filter(Boolean).join(" "))
  };
}

export async function buildStudioSearchIndex(): Promise<StudioSearchIndex> {
  const [assetState] = await Promise.all([getAssetProductionState()]);
  const universe = getUniverseLibraryData();

  const assetResults = assetState.assetLibraryInventory.items.map((item) => result({
    id: item.id,
    type: "Asset",
    title: item.displayName,
    subtitle: `${item.role} / ${item.categoryPath}`,
    href: item.sourceAssetId ? `/assets/${encodeURIComponent(item.sourceAssetId)}` : `/assets?upload=asset&assetKey=${encodeURIComponent(item.semanticAssetKey)}`,
    status: item.status,
    aliases: [item.semanticAssetKey, item.sourceType, item.requiredDimensions, item.currentDimensions]
  }));

  const universeResults = [
    ...universe.galaxies.map((record) => universeResult("Galaxy" as const, record)),
    ...universe.sectors.map((record) => universeResult("Sector" as const, record)),
    ...universe.starSystems.map((record) => universeResult("Star System" as const, record)),
    ...universe.stars.map((record) => universeResult("Star" as const, record)),
    ...universe.planets.map((record) => universeResult("Planet" as const, record)),
    ...universe.discoveries.map((record) => universeResult("Discovery" as const, record)),
    ...universe.civilizations.map((record) => universeResult("Civilization" as const, record))
  ];

  const buildingResults = handoffBuildings.map((building) => result({
    id: building.id,
    type: "Building",
    title: building.name,
    subtitle: `${building.era} / ${building.category}`,
    href: `/buildings?record=${encodeURIComponent(building.id)}`,
    aliases: [building.civilization, building.description, building.visual_evolution, building.notes]
  }));

  const researchResults = handoffResearch.map((research) => result({
    id: research.id,
    type: "Research",
    title: research.name,
    subtitle: `${research.era} / ${research.primary_unlock_type}`,
    href: `/research?record=${encodeURIComponent(research.id)}`,
    status: research.status,
    aliases: [research.branch_id, research.design_purpose, research.gameplay_effect, research.unlock_summary, ...research.unlocks]
  }));

  const resourceResults = ResourceService.catalog.map((resource) => result({
    id: resource.id,
    type: "Resource",
    title: resource.resource_name,
    subtitle: `${resource.category} / ${resource.rarity}`,
    href: `/resource-catalog?record=${encodeURIComponent(resource.id)}`,
    aliases: [resource.discovery_tier, resource.description, resource.science_lore_notes, ...resource.primary_uses, ...resource.typical_planet_classes]
  }));

  const results = [...workspaceResults, ...assetResults, ...universeResults, ...buildingResults, ...researchResults, ...resourceResults];

  return {
    generatedAt: new Date().toISOString(),
    staleAfterMs: 5 * 60 * 1000,
    recordCount: results.length,
    results,
    diagnostics: {
      bounded: true,
      indexedFields: ["name", "tags", "semantic roles", "categories", "canonical IDs", "aliases", "descriptions", "parent relationships", "statuses"],
      sourceCollections: ["assets", "universe libraries", "buildings", "research", "resources", "workspaces"]
    }
  };
}

function universeResult(type: Exclude<StudioSearchResultType, "Asset" | "Building" | "Research" | "Resource" | "Workspace">, record: { id: string; name: string; type: string; subtype?: string; parentLabel?: string; status: string; readiness: string; href: string }) {
  return result({
    id: record.id,
    type,
    title: record.name,
    subtitle: [record.type, record.subtype, record.parentLabel].filter(Boolean).join(" / "),
    href: record.href,
    status: record.readiness,
    aliases: [record.status, record.type, record.subtype ?? "", record.parentLabel ?? ""]
  });
}

export async function searchStudio(query: string, limit = 24) {
  const index = await buildStudioSearchIndex();
  const needle = normalize(query);
  const terms = needle.split(" ").filter(Boolean);
  const results = !terms.length
    ? index.results.slice(0, limit)
    : index.results
      .map((row) => ({ row, score: score(row, terms, needle) }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score || left.row.title.localeCompare(right.row.title))
      .slice(0, limit)
      .map((entry) => entry.row);

  return {
    query,
    generatedAt: index.generatedAt,
    stale: Date.now() - Date.parse(index.generatedAt) > index.staleAfterMs,
    totalIndexed: index.recordCount,
    returned: results.length,
    diagnostics: index.diagnostics,
    results
  };
}

function score(row: StudioSearchResult, terms: string[], phrase: string) {
  const normalizedTitle = normalize(row.title);
  const phraseScore = phrase && row.searchText.includes(phrase) ? 30 : 0;
  return phraseScore + terms.reduce((total, term) => {
    if (normalizedTitle.startsWith(term)) return total + 8;
    if (normalizedTitle.includes(term)) return total + 5;
    if (row.id.toLowerCase().includes(term)) return total + 4;
    if (row.searchText.includes(term)) return total + 2;
    return total;
  }, 0);
}

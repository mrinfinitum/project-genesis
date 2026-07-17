import { handoffBuildings, handoffResearch } from "@/data/handoff";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getExperienceDesignState } from "@/lib/experience-design";
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
  | "Experience Design"
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
  workspace("production-health", "Production Health", "/asset-library?section=all-assets", "Studio health and asset readiness"),
  workspace("runtime", "Runtime", "/runtime", "Canonical runtime"),
  workspace("exports", "Game Engine Exports", "/game-engine-exports", "Engine export targets"),
  workspace("architecture", "Architecture", "/architecture", "Architecture Workspace"),
  workspace("experience-design", "Experience Design", "/experience-design", "Creative direction authoring"),
  workspace("experience-bible", "Experience Bible", "/experience-design/bible", "Creative canon framework"),
  workspace("mood-boards", "Mood Boards", "/experience-design/mood-boards", "Visual reference boards"),
  workspace("screen-library", "Screen Library", "/experience-design/screens", "Canonical screen intent"),
  workspace("upload-asset", "Upload Asset", "/assets?upload=asset", "Asset pipeline"),
  workspace("regenerate-derivatives", "Regenerate Derivatives", "/asset-library?status=needs_review", "Asset pipeline"),
  workspace("run-verification", "Run Verification", "/validation-engine", "Studio verification")
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
  const experienceDesign = getExperienceDesignState();

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
    href: "/buildings",
    aliases: [building.civilization, building.description, building.visual_evolution, building.notes]
  }));

  const researchResults = handoffResearch.map((research) => result({
    id: research.id,
    type: "Research",
    title: research.name,
    subtitle: `${research.era} / ${research.primary_unlock_type}`,
    href: "/research",
    status: research.status,
    aliases: [research.branch_id, research.design_purpose, research.gameplay_effect, research.unlock_summary, ...research.unlocks]
  }));

  const resourceResults = ResourceService.catalog.map((resource) => result({
    id: resource.id,
    type: "Resource",
    title: resource.resource_name,
    subtitle: `${resource.category} / ${resource.rarity}`,
    href: "/resource-catalog",
    aliases: [resource.discovery_tier, resource.description, resource.science_lore_notes, ...resource.primary_uses, ...resource.typical_planet_classes]
  }));

  const experienceResults = [
    ...experienceDesign.sections.filter((section) => section.id !== "dashboard").map((section) => result({
      id: `experience-section:${section.id}`,
      type: "Experience Design" as const,
      title: section.label,
      subtitle: section.description,
      href: section.route,
      aliases: [section.id, section.kinds.join(" ")]
    })),
    ...experienceDesign.records.map((record) => {
      const section = experienceDesign.sections.find((item) => item.kinds.includes(record.kind));
      return result({
        id: record.id,
        type: "Experience Design" as const,
        title: record.name,
        subtitle: `${record.kind.replaceAll("_", " ")} / ${section?.label ?? "Experience Design"}`,
        href: section?.route ?? "/experience-design",
        status: record.status,
        aliases: [record.description, record.author, record.tags.join(" "), record.notes.join(" "), JSON.stringify(record.fields)]
      });
    }),
    ...experienceDesign.experienceBible.parts.map((part) => result({
      id: `experience-bible-part:${part.id}`,
      type: "Experience Design" as const,
      title: `Experience Bible / Part ${part.roman}: ${part.title}`,
      subtitle: part.summary,
      href: `/experience-design/bible/part/${part.id}`,
      status: experienceDesign.experienceBible.status,
      aliases: [part.id, part.title, part.summary, "DV-02", "Experience Bible"]
    })),
    result({
      id: `experience-bible-signature:${experienceDesign.experienceBible.signature.id}`,
      type: "Experience Design" as const,
      title: experienceDesign.experienceBible.signature.title,
      subtitle: `Experience Bible / ${experienceDesign.experienceBible.signature.id} / ${experienceDesign.experienceBible.signature.status}`,
      href: "/experience-design/bible#dv-02c-noveris-signature",
      status: experienceDesign.experienceBible.signature.status,
      aliases: [
        experienceDesign.experienceBible.signature.id,
        experienceDesign.experienceBible.signature.purpose,
        experienceDesign.experienceBible.signature.signatureStatement,
        experienceDesign.experienceBible.signature.expands.join(" "),
        experienceDesign.experienceBible.signature.boundaries.join(" "),
        experienceDesign.experienceBible.signature.tags.join(" "),
        experienceDesign.experienceBible.signature.keywords.join(" "),
        experienceDesign.experienceBible.signature.sections.map((section) => `${section.title} ${section.summary} ${section.content}`).join(" "),
        experienceDesign.experienceBible.signature.futureRelationships.map((relationship) => `${relationship.id} ${relationship.label} ${relationship.notes}`).join(" ")
      ]
    }),
    result({
      id: `experience-bible-visual-dna:${experienceDesign.experienceBible.visualDna.id}`,
      type: "Experience Design" as const,
      title: experienceDesign.experienceBible.visualDna.title,
      subtitle: `Experience Bible / ${experienceDesign.experienceBible.visualDna.id} / ${experienceDesign.experienceBible.visualDna.status}`,
      href: "/experience-design/bible#dv-03-visual-dna",
      status: experienceDesign.experienceBible.visualDna.status,
      aliases: [
        experienceDesign.experienceBible.visualDna.id,
        experienceDesign.experienceBible.visualDna.purpose,
        experienceDesign.experienceBible.visualDna.visualDnaStatement,
        experienceDesign.experienceBible.visualDna.expands.join(" "),
        experienceDesign.experienceBible.visualDna.inheritedBy.join(" "),
        experienceDesign.experienceBible.visualDna.boundaries.join(" "),
        experienceDesign.experienceBible.visualDna.tags.join(" "),
        experienceDesign.experienceBible.visualDna.keywords.join(" "),
        experienceDesign.experienceBible.visualDna.sections.map((section) => `${section.title} ${section.summary} ${section.content}`).join(" "),
        experienceDesign.experienceBible.visualDna.futureRelationships.map((relationship) => `${relationship.id} ${relationship.label} ${relationship.notes}`).join(" ")
      ]
    }),
    ...experienceDesign.experienceBible.chapters.map((chapter) => {
      const part = experienceDesign.experienceBible.parts.find((item) => item.id === chapter.partId);
      return result({
        id: chapter.id,
        type: "Experience Design" as const,
        title: chapter.title,
        subtitle: `Experience Bible / Part ${part?.roman ?? "?"} / Chapter ${chapter.chapterNumber} / ${chapter.reviewStatus}`,
        href: `/experience-design/bible/chapter/${chapter.slug}`,
        status: chapter.reviewStatus,
        aliases: [
          chapter.subtitle,
          chapter.summary,
          chapter.purpose,
          chapter.tags.join(" "),
          chapter.keywords.join(" "),
          chapter.bodySections.map((section) => `${section.title} ${section.summary} ${section.content}`).join(" "),
          chapter.designPrinciples.join(" "),
          chapter.mustAlways.join(" "),
          chapter.mustNever.join(" "),
          chapter.references.map((reference) => `${reference.label} ${reference.notes}`).join(" "),
          chapter.openQuestions.join(" ")
        ]
      });
    })
  ];

  const results = [...workspaceResults, ...assetResults, ...universeResults, ...buildingResults, ...researchResults, ...resourceResults, ...experienceResults];

  return {
    generatedAt: new Date().toISOString(),
    staleAfterMs: 5 * 60 * 1000,
    recordCount: results.length,
    results,
    diagnostics: {
      bounded: true,
      indexedFields: ["name", "tags", "semantic roles", "categories", "canonical IDs", "aliases", "descriptions", "parent relationships", "statuses"],
      sourceCollections: ["assets", "universe libraries", "buildings", "research", "resources", "experience design", "workspaces"]
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

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
  workspace("inspiration-boards", "Inspiration Boards", "/experience-design/inspiration-boards", "Canonical visual memory and reference boards"),
  workspace("design-tokens", "Design Tokens", "/experience-design/tokens", "DS-02 canonical semantic token libraries"),
  workspace("material-library", "Material Library", "/experience-design/materials", "DS-03 canonical semantic material library"),
  workspace("motion-library", "Motion Library", "/experience-design/motion", "DS-04 canonical semantic motion system"),
  workspace("component-library", "Component Library", "/experience-design/components", "DS-05 canonical semantic component library"),
  workspace("interaction-patterns", "Interaction Patterns", "/experience-design/patterns", "DS-05A canonical semantic interaction pattern library"),
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
    ...experienceDesign.inspirationBoards.boards.map((board) => result({
      id: board.id,
      type: "Experience Design" as const,
      title: board.title,
      subtitle: `Inspiration Board / ${board.status} / ${board.subtitle}`,
      href: `${experienceDesign.inspirationBoards.workspaceRoute}#${board.id}`,
      status: board.status,
      aliases: [
        board.purpose,
        board.creativeGoal,
        board.tags.join(" "),
        board.keywords.join(" "),
        board.notes.join(" "),
        board.experienceBibleReferences.join(" "),
        board.visualDnaReferences.join(" "),
        board.annotationCategories.join(" "),
        board.signatureReinforcement.join(" "),
        Object.entries(board.inspirationScores).map(([key, value]) => `${key} ${value}`).join(" ")
      ]
    })),
    ...experienceDesign.designTokens.libraries.map((library) => result({
      id: library.id,
      type: "Experience Design" as const,
      title: library.name,
      subtitle: `Design Token Library / ${experienceDesign.designTokens.id} / ${library.status}`,
      href: experienceDesign.designTokens.workspaceRoute,
      status: library.status,
      aliases: [library.purpose, library.tokenIds.join(" "), library.reviewStatus, "semantic tokens"]
    })),
    ...experienceDesign.designTokens.tokens.map((token) => result({
      id: token.id,
      type: "Experience Design" as const,
      title: token.semanticPath,
      subtitle: `${token.category} / ${token.status}`,
      href: `${experienceDesign.designTokens.workspaceRoute}#${token.id}`,
      status: token.status,
      aliases: [
        token.name,
        token.purpose,
        token.description,
        token.tags.join(" "),
        token.experienceBibleReferences.join(" "),
        token.visualDnaReferences.join(" "),
        token.relatedMaterials.join(" "),
        token.relatedComponents.join(" "),
        token.relatedScreens.join(" ")
      ]
    })),
    ...experienceDesign.materials.categories.map((category) => result({
      id: category.id,
      type: "Experience Design" as const,
      title: `${category.name} Materials`,
      subtitle: `Material Category / ${experienceDesign.materials.id} / ${category.status}`,
      href: experienceDesign.materials.workspaceRoute,
      status: category.status,
      aliases: [category.purpose, category.materialIds.join(" "), category.reviewStatus, "semantic materials"]
    })),
    ...experienceDesign.materials.materials.map((material) => result({
      id: material.id,
      type: "Experience Design" as const,
      title: material.name,
      subtitle: `${material.category} Material / ${material.status}`,
      href: `${experienceDesign.materials.workspaceRoute}#${material.id}`,
      status: material.status,
      aliases: [
        material.purpose,
        material.description,
        material.emotionalIntent,
        material.lightingNotes,
        material.transparencyNotes,
        material.reflectionNotes,
        material.depthNotes,
        material.motionNotes,
        material.accessibilityNotes,
        material.relatedTokens.join(" "),
        material.relatedComponents.join(" "),
        material.relatedScreens.join(" "),
        material.relatedInspirationBoards.join(" "),
        material.experienceBibleReferences.join(" "),
        material.visualDnaReferences.join(" "),
        material.previewSupport.join(" "),
        material.tags.join(" ")
      ]
    })),
    ...experienceDesign.motion.categories.map((category) => result({
      id: category.id,
      type: "Experience Design" as const,
      title: `${category.name} Motions`,
      subtitle: `Motion Category / ${experienceDesign.motion.id} / ${category.status}`,
      href: experienceDesign.motion.workspaceRoute,
      status: category.status,
      aliases: [category.purpose, category.motionIds.join(" "), category.reviewStatus, "semantic motion"]
    })),
    ...experienceDesign.motion.motions.map((motion) => result({
      id: motion.id,
      type: "Experience Design" as const,
      title: motion.id,
      subtitle: `${motion.category} Motion / ${motion.status}`,
      href: `${experienceDesign.motion.workspaceRoute}#${motion.id}`,
      status: motion.status,
      aliases: [
        motion.name,
        motion.purpose,
        motion.description,
        motion.emotionalIntent,
        motion.trigger,
        motion.completionCondition,
        motion.expectedDuration,
        motion.intensity,
        motion.playerAttentionLevel,
        motion.accessibilityNotes.join(" "),
        motion.relatedTokens.join(" "),
        motion.relatedMaterials.join(" "),
        motion.relatedComponents.join(" "),
        motion.relatedScreens.join(" "),
        motion.relatedInspirationBoards.join(" "),
        motion.experienceBibleReferences.join(" "),
        motion.visualDnaReferences.join(" "),
        motion.previewSupport.join(" "),
        motion.tags.join(" ")
      ]
    })),
    ...experienceDesign.componentLibrary.categories.map((category) => result({
      id: category.id,
      type: "Experience Design" as const,
      title: `${category.name} Components`,
      subtitle: `Component Category / ${experienceDesign.componentLibrary.id} / ${category.status}`,
      href: experienceDesign.componentLibrary.workspaceRoute,
      status: category.status,
      aliases: [category.purpose, category.componentIds.join(" "), category.reviewStatus, "semantic component"]
    })),
    ...experienceDesign.componentLibrary.components.map((component) => result({
      id: component.id,
      type: "Experience Design" as const,
      title: component.name,
      subtitle: `${component.category} Component / ${component.status}`,
      href: `${experienceDesign.componentLibrary.workspaceRoute}#${component.id}`,
      status: component.status,
      aliases: [
        component.id,
        component.purpose,
        component.description,
        component.playerIntent,
        component.studioIntent,
        component.states.join(" "),
        component.sizes.join(" "),
        component.accessibilityNotes.join(" "),
        component.responsiveNotes.join(" "),
        component.interactionNotes.join(" "),
        component.relatedTokens.join(" "),
        component.relatedMaterials.join(" "),
        component.relatedMotion.join(" "),
        component.relatedComponents.join(" "),
        component.relatedScreens.join(" "),
        component.relatedInspirationBoards.join(" "),
        component.experienceBibleReferences.join(" "),
        component.visualDnaReferences.join(" "),
        component.previewSupport.join(" "),
        component.tags.join(" ")
      ]
    })),
    ...experienceDesign.interactionPatterns.categories.map((category) => result({
      id: category.id,
      type: "Experience Design" as const,
      title: `${category.name} Patterns`,
      subtitle: `Pattern Category / ${experienceDesign.interactionPatterns.id} / ${category.status}`,
      href: experienceDesign.interactionPatterns.workspaceRoute,
      status: category.status,
      aliases: [category.purpose, category.patternIds.join(" "), category.reviewStatus, "semantic interaction pattern"]
    })),
    result({
      id: experienceDesign.interactionPatterns.designContracts.id,
      type: "Experience Design" as const,
      title: "DS-05A Design Contracts",
      subtitle: `Interaction Pattern Contracts / ${experienceDesign.interactionPatterns.designContracts.status}`,
      href: experienceDesign.interactionPatterns.workspaceRoute,
      status: experienceDesign.interactionPatterns.designContracts.status,
      aliases: [
        "verify design contracts",
        "Missing Tokens",
        "Missing Materials",
        "Missing Motion",
        "Missing Components",
        "Missing Patterns",
        "Missing Inspiration Boards",
        "Missing Experience Bible references",
        "Duplicate IDs",
        "Orphaned records",
        "Circular references",
        "Invalid semantic IDs",
        "Broken relationships",
        ...experienceDesign.interactionPatterns.designContracts.checks.map((check) => `${check.label} ${check.status} ${check.notes}`)
      ]
    }),
    ...experienceDesign.interactionPatterns.patterns.map((pattern) => result({
      id: pattern.id,
      type: "Experience Design" as const,
      title: pattern.name,
      subtitle: `${pattern.category} Pattern / ${pattern.status}`,
      href: `${experienceDesign.interactionPatterns.workspaceRoute}#${pattern.id}`,
      status: pattern.status,
      aliases: [
        pattern.id,
        pattern.purpose,
        pattern.problemSolved,
        pattern.description,
        pattern.primaryUserIntent,
        pattern.studioIntent,
        pattern.gameplayIntent,
        Object.values(pattern.interactionFlow).flat().join(" "),
        pattern.accessibilityNotes.join(" "),
        pattern.responsiveNotes.join(" "),
        pattern.relatedTokens.join(" "),
        pattern.relatedMaterials.join(" "),
        pattern.relatedMotion.join(" "),
        pattern.relatedComponents.join(" "),
        pattern.relatedScreens.join(" "),
        pattern.relatedInspirationBoards.join(" "),
        pattern.experienceBibleReferences.join(" "),
        pattern.visualDnaReferences.join(" "),
        pattern.previewSupport.join(" "),
        pattern.tags.join(" ")
      ]
    })),
    ...experienceDesign.screenLibrary.categories.map((category) => result({
      id: category.id,
      type: "Experience Design" as const,
      title: `${category.name} Screens`,
      subtitle: `Screen Category / ${experienceDesign.screenLibrary.id} / ${category.status}`,
      href: experienceDesign.screenLibrary.workspaceRoute,
      status: category.status,
      aliases: [category.purpose, category.screenIds.join(" "), category.reviewStatus, "semantic screen library"]
    })),
    result({
      id: experienceDesign.screenLibrary.designContracts.id,
      type: "Experience Design" as const,
      title: "DS-06 Screen Design Contracts",
      subtitle: `Screen Contracts / ${experienceDesign.screenLibrary.designContracts.status}`,
      href: experienceDesign.screenLibrary.workspaceRoute,
      status: experienceDesign.screenLibrary.designContracts.status,
      aliases: [
        "verify screen library",
        "screen composition",
        "screen relationships",
        "screen accessibility",
        "screen versioning",
        "Missing Patterns",
        "Missing Components",
        "Missing Materials",
        "Missing Motion",
        "Missing Tokens",
        "Missing Experience Bible references",
        "Missing Visual DNA references",
        "Missing Inspiration Boards",
        "Orphaned Screens",
        "Circular Screen References",
        "Broken Screen Graphs",
        ...experienceDesign.screenLibrary.designContracts.checks.map((check) => `${check.label} ${check.status} ${check.notes}`)
      ]
    }),
    ...experienceDesign.screenLibrary.screens.map((screen) => result({
      id: screen.id,
      type: "Experience Design" as const,
      title: screen.name,
      subtitle: `${screen.category} Screen / ${screen.status}`,
      href: `${experienceDesign.screenLibrary.workspaceRoute}#${screen.id}`,
      status: screen.status,
      aliases: [
        screen.id,
        screen.purpose,
        screen.playerGoal,
        screen.studioGoal,
        screen.emotionalGoal,
        screen.summary,
        screen.primaryInteractionPattern,
        screen.supportingPatterns.join(" "),
        screen.componentComposition.join(" "),
        screen.materialComposition.join(" "),
        screen.motionComposition.join(" "),
        screen.tokenReferences.join(" "),
        screen.interactionZones.join(" "),
        screen.layoutRegions.join(" "),
        screen.platformVariants.join(" "),
        screen.experienceBibleReferences.join(" "),
        screen.visualDnaReferences.join(" "),
        screen.relatedInspirationBoards.join(" "),
        screen.tags.join(" ")
      ]
    })),
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

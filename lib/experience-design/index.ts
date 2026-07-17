import { getExperienceBibleState, experienceBibleChapters, experienceBibleParts } from "@/lib/experience-design/bible";
export * from "@/lib/experience-design/bible";

export type ExperienceDesignStatus = "Draft" | "In Review" | "Approved" | "Deprecated" | "Archived";

export type ExperienceDesignKind =
  | "experience_bible"
  | "mood_board"
  | "concept"
  | "screen_definition"
  | "design_token_collection"
  | "material_definition"
  | "motion_definition"
  | "component_definition"
  | "theme"
  | "brand_guideline"
  | "experience_moment"
  | "review";

export type ExperienceAttachmentType = "image" | "video" | "pdf" | "note" | "external_reference" | "asset_relationship";

export type ExperienceAttachment = {
  id: string;
  type: ExperienceAttachmentType;
  label: string;
  reference: string;
  status: ExperienceDesignStatus;
};

export type ExperienceRelationship = {
  id: string;
  targetType: string;
  targetId: string;
  label: string;
};

export type ExperienceHistoryEntry = {
  id: string;
  action: "created" | "updated" | "submitted" | "approved" | "deprecated" | "archived" | "restored" | "commented";
  author: string;
  timestamp: string;
  notes: string;
};

export type ExperienceDesignRecord = {
  id: string;
  kind: ExperienceDesignKind;
  name: string;
  description: string;
  status: ExperienceDesignStatus;
  created: string;
  modified: string;
  version: string;
  author: string;
  tags: string[];
  notes: string[];
  attachments: ExperienceAttachment[];
  relationships: ExperienceRelationship[];
  approvalStatus: ExperienceDesignStatus;
  history: ExperienceHistoryEntry[];
  category?: string;
  fields: Record<string, string | string[] | number | boolean>;
};

export type ExperienceInspirationAnnotationCategory =
  | "Lighting"
  | "Color"
  | "Composition"
  | "Geometry"
  | "Atmosphere"
  | "Scale"
  | "Materials"
  | "Motion ideas"
  | "Typography"
  | "Negative space"
  | "Visual rhythm"
  | "Interaction inspiration";

export type ExperienceInspirationBoardCategory = {
  id: string;
  title: string;
  purpose: string;
  tags: string[];
};

export type ExperienceInspirationBoard = {
  id: string;
  title: string;
  subtitle: string;
  purpose: string;
  creativeGoal: string;
  categoryId: string;
  collectionId: string;
  subboardIds: string[];
  experienceBibleReferences: string[];
  visualDnaReferences: string[];
  status: ExperienceDesignStatus;
  owner: string;
  reviewers: string[];
  version: string;
  created: string;
  modified: string;
  tags: string[];
  keywords: string[];
  notes: string[];
  attachments: ExperienceAttachment[];
  relationships: ExperienceRelationship[];
  approvalStatus: ExperienceDesignStatus;
  history: ExperienceHistoryEntry[];
  referenceCount: number;
  annotationCategories: ExperienceInspirationAnnotationCategory[];
  signatureReinforcement: string[];
  inspirationScores: Record<string, number>;
  favorite: boolean;
};

export type ExperienceInspirationBoardLibrary = {
  id: "DV-04";
  title: "Inspiration Board Library";
  version: "0.1";
  status: "Draft";
  purpose: string;
  workspaceRoute: string;
  categories: ExperienceInspirationBoardCategory[];
  boards: ExperienceInspirationBoard[];
  referenceModelFields: string[];
  annotationCategories: ExperienceInspirationAnnotationCategory[];
  relationshipTargets: string[];
  searchFields: string[];
  filters: string[];
  viewModes: string[];
  presentationMode: {
    enabled: true;
    purpose: string[];
  };
  reviewWorkflow: ExperienceDesignStatus[];
  scoreDimensions: string[];
  favorites: {
    pinnedBoardIds: string[];
    recentlyViewedBoardIds: string[];
    recentlyUpdatedBoardIds: string[];
    favoriteReferenceIds: string[];
  };
  signatureTags: string[];
  importSources: string[];
  performanceRequirements: string[];
  accessibilityRequirements: string[];
};

export type ExperienceDesignTokenCategory =
  | "Color Tokens"
  | "Typography Tokens"
  | "Spacing Tokens"
  | "Radius Tokens"
  | "Elevation Tokens"
  | "Shadow Tokens"
  | "Blur Tokens"
  | "Opacity Tokens"
  | "Motion Tokens"
  | "Timing Tokens"
  | "Breakpoint Tokens"
  | "Z-Layer Tokens"
  | "Icon Tokens"
  | "Grid Tokens"
  | "Stroke Tokens"
  | "Glow Tokens"
  | "Atmosphere Tokens"
  | "Glass Tokens"
  | "Background Tokens"
  | "Transition Tokens";

export type ExperienceDesignToken = {
  id: string;
  name: string;
  semanticPath: string;
  category: ExperienceDesignTokenCategory;
  purpose: string;
  description: string;
  experienceBibleReferences: string[];
  visualDnaReferences: string[];
  relatedMaterials: string[];
  relatedComponents: string[];
  relatedScreens: string[];
  status: ExperienceDesignStatus;
  version: "0.1";
  history: ExperienceHistoryEntry[];
  tags: string[];
  owner: string;
  reviewStatus: ExperienceDesignStatus;
};

export type ExperienceDesignTokenLibrary = {
  id: string;
  name: ExperienceDesignTokenCategory;
  purpose: string;
  tokenIds: string[];
  status: ExperienceDesignStatus;
  version: "0.1";
  reviewStatus: ExperienceDesignStatus;
};

export type ExperienceDesignTokenSystem = {
  id: "DS-02";
  title: "Canonical Design Tokens";
  version: "0.1";
  status: "Draft";
  purpose: string;
  workspaceRoute: string;
  consumers: string[];
  boundaries: string[];
  philosophy: string[];
  namingRules: string[];
  searchFields: string[];
  reviewWorkflow: ExperienceDesignStatus[];
  libraries: ExperienceDesignTokenLibrary[];
  tokens: ExperienceDesignToken[];
  implementationValuesPublished: false;
  runtimePublication: "future_design_runtime_milestone";
};

export type ExperienceMaterialCategory =
  | "Glass"
  | "Projection"
  | "Energy"
  | "Atmosphere"
  | "Planetary"
  | "Architecture"
  | "Natural"
  | "Industrial"
  | "Ancient"
  | "Organic"
  | "Liquid"
  | "Surface"
  | "Structural"
  | "Lighting"
  | "Special";

export type ExperienceMaterialPreviewSupport =
  | "Static Preview"
  | "Animated Preview"
  | "Reference Image"
  | "Material Study"
  | "Lighting Study"
  | "Comparison";

export type ExperienceMaterialDefinition = {
  id: string;
  name: string;
  category: ExperienceMaterialCategory;
  purpose: string;
  description: string;
  emotionalIntent: string;
  visualDnaReferences: string[];
  experienceBibleReferences: string[];
  relatedTokens: string[];
  relatedComponents: string[];
  relatedScreens: string[];
  relatedInspirationBoards: string[];
  lightingNotes: string;
  transparencyNotes: string;
  reflectionNotes: string;
  depthNotes: string;
  motionNotes: string;
  accessibilityNotes: string;
  futureRuntimeMapping: "future_design_runtime_milestone";
  previewSupport: ExperienceMaterialPreviewSupport[];
  owner: string;
  reviewStatus: ExperienceDesignStatus;
  status: ExperienceDesignStatus;
  version: "0.1";
  history: ExperienceHistoryEntry[];
  tags: string[];
};

export type ExperienceMaterialCategoryDefinition = {
  id: string;
  name: ExperienceMaterialCategory;
  purpose: string;
  materialIds: string[];
  status: ExperienceDesignStatus;
  version: "0.1";
  reviewStatus: ExperienceDesignStatus;
};

export type ExperienceMaterialLibrary = {
  id: "DS-03";
  title: "Canonical Material Library";
  version: "0.1";
  status: "Draft";
  purpose: string;
  workspaceRoute: string;
  philosophy: string[];
  boundaries: string[];
  searchFields: string[];
  relationshipTargets: string[];
  previewSupport: ExperienceMaterialPreviewSupport[];
  reviewWorkflow: ExperienceDesignStatus[];
  categories: ExperienceMaterialCategoryDefinition[];
  materials: ExperienceMaterialDefinition[];
  runtimePublication: "future_design_runtime_milestone";
};

export type ExperienceContentModel = {
  kind: ExperienceDesignKind;
  displayName: string;
  description: string;
  requiredFields: string[];
  supportedCapabilities: string[];
  route: string;
};

export type ExperienceDesignSection = {
  id: string;
  label: string;
  description: string;
  route: string;
  kinds: ExperienceDesignKind[];
};

export type ExperienceDesignState = {
  frameworkId: "ED-01";
  version: "1.0";
  owner: "Project Genesis Studio";
  creativeDirectionOwner: "Studio";
  runtimePublishing: "not_published";
  implementationBoundary: string[];
  sections: ExperienceDesignSection[];
  contentModels: ExperienceContentModel[];
  records: ExperienceDesignRecord[];
  reviewWorkflow: ExperienceDesignStatus[];
  searchScopes: string[];
  dashboard: {
    recentActivity: ExperienceHistoryEntry[];
    draftReviews: ExperienceDesignRecord[];
    approvedChanges: ExperienceDesignRecord[];
    countsByKind: Record<ExperienceDesignKind, number>;
  };
  experienceBible: ReturnType<typeof getExperienceBibleState>;
  inspirationBoards: ExperienceInspirationBoardLibrary;
  designTokens: ExperienceDesignTokenSystem;
  materials: ExperienceMaterialLibrary;
};

export const EXPERIENCE_DESIGN_ROUTE = "/experience-design";

export const experienceReviewWorkflow: ExperienceDesignStatus[] = ["Draft", "In Review", "Approved", "Deprecated", "Archived"];

export const experienceDesignSections: ExperienceDesignSection[] = [
  { id: "dashboard", label: "Dashboard", description: "Creative direction command center for ED-01.", route: EXPERIENCE_DESIGN_ROUTE, kinds: [] },
  { id: "bible", label: "Experience Bible", description: "Canonical chapters, references, annotations, and creative principles.", route: `${EXPERIENCE_DESIGN_ROUTE}/bible`, kinds: ["experience_bible"] },
  { id: "inspiration-boards", label: "Inspiration Boards", description: "Canonical visual memory, reference boards, annotations, relationships, presentation mode, and creative review.", route: `${EXPERIENCE_DESIGN_ROUTE}/inspiration-boards`, kinds: ["mood_board"] },
  { id: "concepts", label: "Concept Library", description: "Versioned concept art, illustration, interface, material, and motion references.", route: `${EXPERIENCE_DESIGN_ROUTE}/concepts`, kinds: ["concept"] },
  { id: "screens", label: "Screen Library", description: "Canonical experience intent for screens without client implementation ownership.", route: `${EXPERIENCE_DESIGN_ROUTE}/screens`, kinds: ["screen_definition"] },
  { id: "tokens", label: "Design Tokens", description: "DS-02 canonical semantic token libraries for NOVERIS meaning, relationships, review, search, and future renderer consumption.", route: `${EXPERIENCE_DESIGN_ROUTE}/tokens`, kinds: ["design_token_collection"] },
  { id: "materials", label: "Material Library", description: "DS-03 semantic material library for glass, projection, energy, atmosphere, planetary, architectural, natural, industrial, ancient, organic, liquid, surface, structural, lighting, and special materials.", route: `${EXPERIENCE_DESIGN_ROUTE}/materials`, kinds: ["material_definition"] },
  { id: "motion", label: "Motion Library", description: "Canonical motion purposes, accessibility notes, references, and intent.", route: `${EXPERIENCE_DESIGN_ROUTE}/motion`, kinds: ["motion_definition"] },
  { id: "components", label: "Component Library", description: "Design definitions for components, separate from React, Roblox, or CSS implementation.", route: `${EXPERIENCE_DESIGN_ROUTE}/components`, kinds: ["component_definition"] },
  { id: "themes", label: "Theme Library", description: "Future theme framework for default, accessibility, minimal, presentation, and prototype themes.", route: `${EXPERIENCE_DESIGN_ROUTE}/themes`, kinds: ["theme"] },
  { id: "brand", label: "Brand System", description: "Brand guidelines, tone, usage, and creative constraints for NOVERIS.", route: `${EXPERIENCE_DESIGN_ROUTE}/brand`, kinds: ["brand_guideline"] },
  { id: "accessibility", label: "Accessibility", description: "Experience accessibility notes, constraints, and review hooks.", route: `${EXPERIENCE_DESIGN_ROUTE}/accessibility`, kinds: ["brand_guideline", "motion_definition", "theme"] },
  { id: "journey", label: "Experience Journey", description: "Player moments and emotional, visual, audio, interaction, and narrative goals.", route: `${EXPERIENCE_DESIGN_ROUTE}/journey`, kinds: ["experience_moment"] },
  { id: "reviews", label: "Reviews", description: "Creative review workflow, history, comments, approvals, and archival status.", route: `${EXPERIENCE_DESIGN_ROUTE}/reviews`, kinds: ["review"] }
];

export const experienceContentModels: ExperienceContentModel[] = [
  model("experience_bible", "Experience Bible", "Long-form creative canon with chapters, subchapters, annotations, cross references, linked concepts, search, and history.", ["chapters", "subchapters", "annotations", "crossReferences", "linkedConcepts"], ["embedded images", "version history", "search", "future expansion"], "bible"),
  model("mood_board", "Inspiration Board", "Canonical inspiration board with references, annotations, creative goals, Bible links, Visual DNA links, approval, history, favorites, and presentation mode.", ["title", "subtitle", "purpose", "creativeGoal", "experienceBibleReferences", "visualDnaReferences", "references", "annotations", "lightingNotes", "colorNotes", "compositionNotes"], ["categories", "collections", "boards", "subboards", "references", "annotations", "relationships", "versions", "approval", "history", "search", "favorites", "presentation mode"], "inspiration-boards"),
  model("concept", "Concept", "Versioned concept record for art, interface, environment, lighting, typography, material, or animation reference.", ["preview", "sourceAsset", "notes", "tags", "relationships"], ["approval workflow", "source asset links"], "concepts"),
  model("screen_definition", "Screen Definition", "Canonical screen intent, player goals, emotional goals, layout notes, interaction zones, accessibility, references, and approved concepts.", ["purpose", "playerGoals", "emotionalGoals", "narrativePurpose", "layoutNotes", "interactionZones"], ["attachments", "related components", "version history"], "screens"),
  model("design_token_collection", "Canonical Design Tokens", "DS-02 semantic design token records for meaning, purpose, references, relationships, review, versioning, and search without implementation values.", ["tokenLibraries", "semanticPath", "purpose", "experienceBibleReferences", "visualDnaReferences", "relatedMaterials", "relatedComponents", "relatedScreens", "owner", "reviewStatus"], ["color", "typography", "spacing", "radius", "elevation", "shadow", "blur", "opacity", "motion", "timing", "breakpoints", "z-layer", "icons", "grid", "stroke", "glow", "atmosphere", "glass", "background", "transition", "search", "relationships", "versioning"], "tokens"),
  model("material_definition", "Canonical Material Library", "DS-03 semantic material definitions for purpose, emotion, light behavior, relationships, preview support, review, versioning, and future renderer interpretation without implementation code.", ["category", "purpose", "emotionalIntent", "visualDnaReferences", "experienceBibleReferences", "relatedTokens", "relatedComponents", "relatedScreens", "relatedInspirationBoards", "lightingNotes", "transparencyNotes", "reflectionNotes", "depthNotes", "motionNotes", "accessibilityNotes", "futureRuntimeMapping", "owner", "reviewStatus"], ["glass", "projection", "energy", "atmosphere", "planetary", "architecture", "natural", "industrial", "ancient", "organic", "liquid", "surface", "structural", "lighting", "special", "preview metadata", "relationships", "search", "versioning"], "materials"),
  model("motion_definition", "Motion Definition", "Canonical motion intent such as Fade, Expand, Orbit, Travel, Discovery, Projection, Notification, and Research.", ["purpose", "duration", "curve", "accessibilityNotes", "references"], ["reduced motion", "review workflow"], "motion"),
  model("component_definition", "Component Definition", "Design description for Button, Panel, Card, HUD, Sidebar, Dialog, Tree, List, Table, Tooltip, and Notification.", ["purpose", "states", "variants", "accessibility", "references"], ["component relationships", "approval workflow"], "components"),
  model("theme", "Theme", "Future theme framework for Default, Accessibility, Minimal, Presentation, and Prototype.", ["themeIntent", "status", "approval"], ["token relationships", "accessibility notes"], "themes"),
  model("brand_guideline", "Brand Guideline", "Brand system guidance for NOVERIS tone, naming, marks, usage, and creative boundaries.", ["principle", "usage", "constraints"], ["cross references", "history"], "brand"),
  model("experience_moment", "Experience Moment", "Journey record describing player emotion, visual goal, audio goal, interaction goal, narrative goal, and references.", ["playerEmotion", "visualGoal", "audioGoal", "interactionGoal", "narrativeGoal"], ["journey sequencing", "related screens"], "journey"),
  model("review", "Review", "Creative review workflow record with Draft, In Review, Approved, Deprecated, and Archived states.", ["subjectId", "reviewState", "comments", "decision"], ["diff", "restore", "comments", "author", "timestamp"], "reviews")
];

const tokenLibrarySeeds: Array<{ name: ExperienceDesignTokenCategory; purpose: string; tokens: string[] }> = [
  {
    name: "Color Tokens",
    purpose: "Semantic color identities that describe NOVERIS meaning without hexadecimal values or implementation palettes.",
    tokens: [
      "accent.civilization.gold",
      "accent.projection.cyan",
      "accent.discovery.violet",
      "surface.space.primary",
      "surface.space.secondary",
      "surface.command.glass",
      "surface.reading.paper",
      "surface.reference.glass",
      "text.primary",
      "text.secondary",
      "text.muted",
      "status.success",
      "status.warning",
      "status.danger",
      "status.info",
      "status.discovery",
      "status.locked",
      "status.active",
      "status.inactive"
    ]
  },
  {
    name: "Typography Tokens",
    purpose: "Semantic text roles that describe hierarchy, reading mode, command surfaces, metrics, and code references.",
    tokens: ["display.hero", "display.section", "heading.primary", "heading.secondary", "body.primary", "body.secondary", "caption", "label", "metric", "navigation", "code", "quote"]
  },
  {
    name: "Spacing Tokens",
    purpose: "Semantic spatial rhythm for dense tools, readable creative records, cinematic presentation, and monumental moments.",
    tokens: ["spacing.tight", "spacing.compact", "spacing.standard", "spacing.relaxed", "spacing.cinematic", "spacing.monumental"]
  },
  {
    name: "Radius Tokens",
    purpose: "Semantic corner language for command controls, panels, cards, and modal surfaces.",
    tokens: ["radius.none", "radius.soft", "radius.command", "radius.panel", "radius.card", "radius.modal"]
  },
  {
    name: "Elevation Tokens",
    purpose: "Semantic depth order for background, surfaces, overlays, modals, and focused objects.",
    tokens: ["elevation.background", "elevation.surface", "elevation.panel", "elevation.overlay", "elevation.modal", "elevation.focus"]
  },
  {
    name: "Shadow Tokens",
    purpose: "Semantic shadow intent for quiet depth, floating command surfaces, reading surfaces, and modal separation.",
    tokens: ["shadow.surface.soft", "shadow.panel.command", "shadow.modal.focus", "shadow.reading.depth"]
  },
  {
    name: "Blur Tokens",
    purpose: "Semantic blur intent for glass, distant atmosphere, modal separation, and non-dominant backgrounds.",
    tokens: ["blur.glass.subtle", "blur.glass.command", "blur.atmosphere.distant", "blur.overlay.focus"]
  },
  {
    name: "Opacity Tokens",
    purpose: "Semantic transparency intent for disabled states, supporting surfaces, reference overlays, and atmospheric layers.",
    tokens: ["opacity.disabled", "opacity.supporting", "opacity.reference", "opacity.atmosphere"]
  },
  {
    name: "Motion Tokens",
    purpose: "Semantic motion language for reveal, focus, travel, orbit, research, and notification behavior.",
    tokens: ["motion.fade.standard", "motion.expand.standard", "motion.discovery", "motion.travel", "motion.orbit", "motion.research", "motion.notification", "motion.focus", "motion.selection"]
  },
  {
    name: "Timing Tokens",
    purpose: "Semantic pacing for fast confirmation, standard UI response, deliberate review, and cinematic emphasis.",
    tokens: ["timing.fast", "timing.standard", "timing.deliberate", "timing.cinematic"]
  },
  {
    name: "Breakpoint Tokens",
    purpose: "Semantic adaptation points for compact phones, tablets, desktop tools, widescreen workstations, and presentation contexts.",
    tokens: ["breakpoint.compact", "breakpoint.tablet", "breakpoint.desktop", "breakpoint.wide", "breakpoint.presentation"]
  },
  {
    name: "Z-Layer Tokens",
    purpose: "Semantic stacking intent for background, content, docked tools, overlays, and modal focus.",
    tokens: ["z.background", "z.content", "z.docked", "z.overlay", "z.modal"]
  },
  {
    name: "Icon Tokens",
    purpose: "Semantic icon roles and relative importance for navigation, resources, metrics, inline copy, and hero presentation.",
    tokens: ["icon.navigation", "icon.resource", "icon.metric", "icon.inline", "icon.hero"]
  },
  {
    name: "Grid Tokens",
    purpose: "Semantic layout structures for dashboards, workspaces, reading, galleries, canvases, and screen specifications.",
    tokens: ["grid.dashboard", "grid.workspace", "grid.reading", "grid.gallery", "grid.canvas", "grid.screen"]
  },
  {
    name: "Stroke Tokens",
    purpose: "Semantic line weight and boundary intent for panels, dividers, focus rings, and celestial geometry.",
    tokens: ["stroke.panel", "stroke.divider", "stroke.focus", "stroke.celestial"]
  },
  {
    name: "Glow Tokens",
    purpose: "Semantic light emission for civilization progress, projection intelligence, discovery, warnings, and focus.",
    tokens: ["glow.civilization", "glow.projection", "glow.discovery", "glow.warning", "glow.focus"]
  },
  {
    name: "Atmosphere Tokens",
    purpose: "Semantic environmental identity for space, nebulae, planets, colonies, research, and runtime contexts.",
    tokens: ["atmosphere.deep-space", "atmosphere.nebula", "atmosphere.planet", "atmosphere.colony", "atmosphere.research", "atmosphere.runtime"]
  },
  {
    name: "Glass Tokens",
    purpose: "Semantic material identities for command, projection, reading, navigation, reference, and observation glass.",
    tokens: ["glass.command", "glass.projection", "glass.reading", "glass.navigation", "glass.reference", "glass.observation"]
  },
  {
    name: "Background Tokens",
    purpose: "Semantic background identities for universe, civilization, discovery, research, runtime, and Studio surfaces.",
    tokens: ["background.universe", "background.civilization", "background.discovery", "background.research", "background.runtime", "background.studio"]
  },
  {
    name: "Transition Tokens",
    purpose: "Semantic transitions for standard view changes, workspace movement, discovery reveals, and cinematic travel.",
    tokens: ["transition.standard", "transition.workspace", "transition.discovery", "transition.cinematic"]
  }
];

function tokenDisplayName(semanticPath: string) {
  return semanticPath.split(".").map((part) => part[0].toUpperCase() + part.slice(1).replaceAll("-", " ")).join(" / ");
}

function tokenPurpose(category: ExperienceDesignTokenCategory, semanticPath: string) {
  const library = tokenLibrarySeeds.find((item) => item.name === category);
  return `${tokenDisplayName(semanticPath)} expresses ${semanticPath.replaceAll(".", " ")} as a NOVERIS ${category.replace(" Tokens", "").toLowerCase()} decision. ${library?.purpose ?? "It is semantic design guidance."}`;
}

function tokenReferences(semanticPath: string) {
  const text = semanticPath.toLowerCase();
  const bibleReferences = ["core-creative-philosophy", "what-noveris-is", "dv-02c-section-01-the-noveris-signature"];
  const visualReferences = ["dv-03-section-01-visual-dna"];
  if (text.includes("civilization") || text.includes("gold") || text.includes("monumental")) {
    bibleReferences.push("dv-02c-section-05-light-as-civilization");
    visualReferences.push("dv-03-section-02-color-philosophy", "dv-03-section-03-light-philosophy");
  }
  if (text.includes("projection") || text.includes("command") || text.includes("glass")) {
    bibleReferences.push("dv02-chapter-17-the-interface-is-part-of-the-world");
    visualReferences.push("dv-03-section-09-material-language");
  }
  if (text.includes("discovery")) {
    bibleReferences.push("dv02-chapter-26-first-discovery");
    visualReferences.push("dv-03-section-12-motion");
  }
  return { bibleReferences, visualReferences };
}

export const experienceDesignTokens: ExperienceDesignToken[] = tokenLibrarySeeds.flatMap((library) => library.tokens.map((semanticPath) => {
  const references = tokenReferences(semanticPath);
  return {
    id: semanticPath,
    name: tokenDisplayName(semanticPath),
    semanticPath,
    category: library.name,
    purpose: tokenPurpose(library.name, semanticPath),
    description: "Canonical meaning record only. Do not attach CSS variables, Tailwind classes, pixels, hexadecimal values, shader settings, or renderer-specific implementation values.",
    experienceBibleReferences: references.bibleReferences,
    visualDnaReferences: references.visualReferences,
    relatedMaterials: semanticPath.includes("glass") || semanticPath.includes("surface") ? ["material-space-glass"] : semanticPath.includes("atmosphere") ? ["material-atmosphere"] : [],
    relatedComponents: semanticPath.includes("navigation") ? ["component-navigation"] : semanticPath.includes("panel") || semanticPath.includes("command") ? ["component-design-panel"] : [],
    relatedScreens: semanticPath.includes("dashboard") ? ["screen-dashboard"] : semanticPath.includes("discovery") ? ["screen-discovery"] : semanticPath.includes("runtime") ? ["screen-runtime"] : [],
    status: "Draft",
    version: "0.1",
    history: [
      {
        id: `${semanticPath}-ds-02-created`,
        action: "created",
        author: "Design Systems",
        timestamp: "2026-07-17T00:00:00.000Z",
        notes: "Created semantic token definition for DS-02."
      }
    ],
    tags: ["ds-02", "design-token", slugify(library.name), ...semanticPath.split(".")],
    owner: "Design Systems",
    reviewStatus: "Draft"
  };
}));

export const experienceDesignTokenLibraries: ExperienceDesignTokenLibrary[] = tokenLibrarySeeds.map((library) => ({
  id: `token-library-${slugify(library.name)}`,
  name: library.name,
  purpose: library.purpose,
  tokenIds: library.tokens,
  status: "Draft",
  version: "0.1",
  reviewStatus: "Draft"
}));

export const experienceDesignTokenSystem: ExperienceDesignTokenSystem = {
  id: "DS-02",
  title: "Canonical Design Tokens",
  version: "0.1",
  status: "Draft",
  purpose: "Create the canonical semantic design token source of truth for Project Genesis Studio, NOVERIS Game, noveris.life, Steam, Marketing, and future platforms.",
  workspaceRoute: `${EXPERIENCE_DESIGN_ROUTE}/tokens`,
  consumers: ["Project Genesis Studio", "NOVERIS Game", "noveris.life", "Steam", "Marketing", "Future platforms"],
  boundaries: [
    "Design Tokens are canonical authoring records.",
    "Design Tokens are not CSS variables.",
    "Design Tokens are not Tailwind classes.",
    "Design Tokens are not implementation code.",
    "Do not publish token values until a future Design Runtime milestone.",
    "Do not modify gameplay, runtime gameplay contracts, engine exports, runtimeVersion, or contentVersion."
  ],
  philosophy: [
    "Tokens represent meaning.",
    "Tokens describe purpose, not appearance.",
    "Token names must remain semantic, stable, and renderer-agnostic.",
    "Implementation values belong to future platform adapters, not DS-02."
  ],
  namingRules: [
    "Use semantic paths such as accent.civilization.gold, surface.command.glass, text.primary, and motion.fade.standard.",
    "Reject appearance-only names such as gold500, blue100, radius12, and blur24.",
    "Keep canonical IDs stable after approval.",
    "Every token must include purpose, references, relationships, status, version, history, owner, and review status."
  ],
  searchFields: ["purpose", "emotion", "category", "relationships", "Experience Bible chapter", "Visual DNA section"],
  reviewWorkflow: experienceReviewWorkflow,
  libraries: experienceDesignTokenLibraries,
  tokens: experienceDesignTokens,
  implementationValuesPublished: false,
  runtimePublication: "future_design_runtime_milestone"
};

const materialCategorySeeds: Array<{ name: ExperienceMaterialCategory; purpose: string; materials: string[] }> = [
  {
    name: "Glass",
    purpose: "Semantic translucent materials for command, projection, reading, observation, navigation, reference, civilization, research, and review surfaces.",
    materials: ["Command Glass", "Projection Glass", "Reading Glass", "Observation Glass", "Navigation Glass", "Reference Glass", "Civilization Glass", "Research Glass", "Review Glass"]
  },
  {
    name: "Projection",
    purpose: "Semantic projected-light materials for analysis, navigation, discovery, missions, warnings, focus, selection, and holographic information.",
    materials: ["Projection Standard", "Projection Analysis", "Projection Navigation", "Projection Discovery", "Projection Mission", "Projection Warning", "Projection Focus", "Projection Selection", "Projection Hologram"]
  },
  {
    name: "Energy",
    purpose: "Semantic energy materials that describe what progress, research, discovery, ancient systems, fusion, quantum behavior, and rare phenomena should feel like.",
    materials: ["Civilization Energy", "Research Energy", "Discovery Energy", "Ancient Energy", "Quantum Energy", "Fusion Energy", "Rare Energy"]
  },
  {
    name: "Atmosphere",
    purpose: "Semantic environmental materials for space, nebulae, planets, clouds, dust, mist, research spaces, and colonies.",
    materials: ["Deep Space", "Nebula", "Planet Atmosphere", "Cloud Layer", "Dust", "Volumetric Mist", "Research Atmosphere", "Colony Atmosphere"]
  },
  {
    name: "Planetary",
    purpose: "Semantic planetary surface materials used to describe worlds without becoming renderer textures.",
    materials: ["Ice", "Rock", "Crystal", "Forest", "Ocean", "Desert", "Lava", "Gas Giant", "Artificial Surface", "Terraforming Surface"]
  },
  {
    name: "Architecture",
    purpose: "Semantic built-environment materials that make civilization feel engineered, durable, intentional, and worth building.",
    materials: ["Civilization Stone", "Civilization Alloy", "Advanced Ceramic", "Structural Composite", "Living Architecture", "Ancient Monument", "Future Concrete", "Engineering Steel"]
  },
  {
    name: "Natural",
    purpose: "Semantic natural-world materials for life, terrain, water, snow, sand, vegetation, coral, and roots.",
    materials: ["Water", "Snow", "Sand", "Vegetation", "Natural Ice", "Organic Growth", "Coral", "Roots"]
  },
  {
    name: "Industrial",
    purpose: "Semantic industrial materials for production, manufacturing, engineering, infrastructure, and resource processing.",
    materials: ["Factory Alloy", "Refinery Surface", "Industrial Concrete", "Machine Housing", "Logistics Rail", "Storage Composite"]
  },
  {
    name: "Ancient",
    purpose: "Semantic ancient materials that feel mysterious and advanced without becoming fantasy.",
    materials: ["Ancient Alloy", "Ancient Crystal", "Ancient Stone", "Ancient Energy", "Ruined Architecture", "Lost Civilization Material"]
  },
  {
    name: "Organic",
    purpose: "Semantic organic materials for living systems, cultivated environments, biomes, and bio-engineered forms.",
    materials: ["Living Tissue", "Biofilm", "Cultivated Bark", "Bioluminescent Growth", "Seed Matrix"]
  },
  {
    name: "Liquid",
    purpose: "Semantic liquid materials for water, coolant, fuel, oceans, research fluids, and hazardous flows.",
    materials: ["Clean Water", "Research Fluid", "Coolant Flow", "Fuel Gel", "Toxic Liquid"]
  },
  {
    name: "Surface",
    purpose: "Semantic readable surface materials for panels, cards, workspaces, maps, logs, and reference pages.",
    materials: ["Command Surface", "Reading Surface", "Reference Surface", "Map Surface", "Archive Surface"]
  },
  {
    name: "Structural",
    purpose: "Semantic support materials for frames, beams, foundations, pressure hulls, and orbital structures.",
    materials: ["Frame Structure", "Orbital Truss", "Foundation Plate", "Pressure Hull", "Megastructure Spine"]
  },
  {
    name: "Lighting",
    purpose: "Semantic light-bearing materials for civilization warmth, projection guidance, discovery reveals, danger, and focus.",
    materials: ["Civilization Light", "Projection Light", "Discovery Light", "Warning Light", "Focus Light"]
  },
  {
    name: "Special",
    purpose: "Semantic interaction-support materials for selection, focus, highlight, danger, locked, unavailable, construction, and scanning states.",
    materials: ["Selection", "Focus", "Highlight", "Danger", "Locked", "Unavailable", "Construction", "Scanning"]
  }
];

const materialPreviewSupport: ExperienceMaterialPreviewSupport[] = ["Static Preview", "Animated Preview", "Reference Image", "Material Study", "Lighting Study", "Comparison"];

function materialId(category: ExperienceMaterialCategory, name: string) {
  return `material-${slugify(category)}-${slugify(name)}`;
}

function materialTokens(category: ExperienceMaterialCategory, name: string) {
  const text = `${category} ${name}`.toLowerCase();
  const tokens = new Set<string>();
  if (text.includes("glass")) tokens.add("glass.command").add("surface.command.glass");
  if (text.includes("projection")) tokens.add("accent.projection.cyan").add("glass.projection");
  if (text.includes("civilization") || text.includes("gold")) tokens.add("accent.civilization.gold").add("glow.civilization");
  if (text.includes("discovery")) tokens.add("accent.discovery.violet").add("status.discovery");
  if (text.includes("danger") || text.includes("warning")) tokens.add("status.danger").add("glow.warning");
  if (text.includes("locked") || text.includes("unavailable")) tokens.add("status.locked").add("opacity.disabled");
  if (text.includes("atmosphere") || text.includes("space") || text.includes("nebula")) tokens.add("atmosphere.deep-space").add("background.universe");
  if (text.includes("research")) tokens.add("motion.research").add("background.research");
  if (text.includes("focus") || text.includes("selection")) tokens.add("motion.focus").add("glow.focus");
  if (text.includes("reading") || text.includes("reference")) tokens.add("surface.reading.paper").add("surface.reference.glass");
  if (tokens.size === 0) tokens.add("surface.space.primary");
  return Array.from(tokens);
}

function materialReferences(category: ExperienceMaterialCategory, name: string) {
  const text = `${category} ${name}`.toLowerCase();
  const bibleReferences = ["core-creative-philosophy", "dv-02c-section-01-the-noveris-signature"];
  const visualDnaReferences = ["dv-03-section-09-material-language", "dv-03-section-03-light-philosophy"];
  if (text.includes("civilization") || text.includes("architecture")) bibleReferences.push("dv-02c-section-02-monumental-civilization");
  if (text.includes("space") || text.includes("atmosphere") || text.includes("nebula")) visualDnaReferences.push("dv-03-section-04-atmosphere", "dv-03-section-05-space");
  if (text.includes("ancient")) bibleReferences.push("dv02-chapter-26-first-discovery");
  if (text.includes("warning") || text.includes("danger") || text.includes("locked")) visualDnaReferences.push("dv-03-section-13-visual-contrast");
  return { bibleReferences, visualDnaReferences };
}

function materialEmotion(category: ExperienceMaterialCategory, name: string) {
  const text = `${category} ${name}`.toLowerCase();
  if (text.includes("civilization")) return "Warmth, achievement, durability, and human progress.";
  if (text.includes("research") || text.includes("analysis")) return "Calm intelligence, clarity, and useful discovery.";
  if (text.includes("ancient")) return "Mystery, age, restraint, and non-fantasy wonder.";
  if (text.includes("danger") || text.includes("warning")) return "Urgency without panic; clear risk communication.";
  if (text.includes("locked") || text.includes("unavailable")) return "Unavailable but understandable; constraint without hostility.";
  if (text.includes("space") || text.includes("nebula")) return "Scale, quiet, depth, and breathable wonder.";
  return "Purposeful, legible, and emotionally aligned with the NOVERIS Visual DNA.";
}

export const experienceMaterials: ExperienceMaterialDefinition[] = materialCategorySeeds.flatMap((category) => category.materials.map((name) => {
  const references = materialReferences(category.name, name);
  const id = materialId(category.name, name);
  return {
    id,
    name,
    category: category.name,
    purpose: `${name} defines the semantic material intent for ${category.name.toLowerCase()} contexts in NOVERIS.`,
    description: "Canonical material definition only. Renderers may interpret this later, but DS-03 does not define CSS, shaders, textures, engine materials, or renderer code.",
    emotionalIntent: materialEmotion(category.name, name),
    visualDnaReferences: references.visualDnaReferences,
    experienceBibleReferences: references.bibleReferences,
    relatedTokens: materialTokens(category.name, name),
    relatedComponents: name.includes("Navigation") ? ["component-navigation"] : name.includes("Reading") || name.includes("Reference") || name.includes("Command") ? ["component-design-panel"] : [],
    relatedScreens: category.name === "Planetary" ? ["screen-planet"] : category.name === "Atmosphere" ? ["screen-galaxy"] : category.name === "Special" ? ["screen-runtime"] : [],
    relatedInspirationBoards: [`inspiration-board-${slugify(category.name)}`, name.includes("Glass") || name.includes("Projection") ? "inspiration-board-interface" : "inspiration-board-materials"],
    lightingNotes: `${name} should communicate its role through light behavior, not raw decoration.`,
    transparencyNotes: category.name === "Glass" || category.name === "Projection" ? "Transparency supports legibility and world integration; it must not obscure primary information." : "Transparency is optional and should not be assumed.",
    reflectionNotes: category.name === "Glass" || category.name === "Energy" ? "Reflection should suggest depth and material presence without becoming noisy." : "Reflection should remain subordinate to clarity.",
    depthNotes: "Depth should support hierarchy, scale, and readable focus.",
    motionNotes: category.name === "Projection" || category.name === "Energy" || category.name === "Special" ? "Motion may communicate state change, scanning, focus, or discovery while supporting reduced-motion alternatives." : "Motion is optional and should remain deliberate.",
    accessibilityNotes: "Must preserve contrast, legibility, non-color state cues, and reduced-motion alternatives where motion is used.",
    futureRuntimeMapping: "future_design_runtime_milestone",
    previewSupport: materialPreviewSupport,
    owner: "Material Design",
    reviewStatus: "Draft",
    status: "Draft",
    version: "0.1",
    history: [
      {
        id: `${id}-ds-03-created`,
        action: "created",
        author: "Material Design",
        timestamp: "2026-07-17T00:00:00.000Z",
        notes: "Created semantic material definition for DS-03."
      }
    ],
    tags: ["ds-03", "material", slugify(category.name), slugify(name), ...materialTokens(category.name, name)]
  };
}));

export const experienceMaterialCategories: ExperienceMaterialCategoryDefinition[] = materialCategorySeeds.map((category) => ({
  id: `material-category-${slugify(category.name)}`,
  name: category.name,
  purpose: category.purpose,
  materialIds: category.materials.map((name) => materialId(category.name, name)),
  status: "Draft",
  version: "0.1",
  reviewStatus: "Draft"
}));

export const experienceMaterialLibrary: ExperienceMaterialLibrary = {
  id: "DS-03",
  title: "Canonical Material Library",
  version: "0.1",
  status: "Draft",
  purpose: "Create the canonical semantic material source of truth for NOVERIS so every renderer can interpret material meaning without Studio defining renderer implementation.",
  workspaceRoute: `${EXPERIENCE_DESIGN_ROUTE}/materials`,
  philosophy: [
    "Materials communicate meaning.",
    "Players should understand civilization by how materials behave.",
    "A material is part of storytelling, not decoration.",
    "Every renderer interprets these semantic definitions later."
  ],
  boundaries: [
    "Materials are not CSS.",
    "Materials are not shaders.",
    "Materials are not textures.",
    "Materials are not rendering code.",
    "Materials are not Unreal materials.",
    "Materials are not Unity materials.",
    "Materials are not Three.js materials.",
    "Materials are not Roblox implementation."
  ],
  searchFields: ["Purpose", "Emotion", "Material Type", "Lighting", "Transparency", "Reflection", "Related Token", "Related Screen", "Experience Bible Chapter", "Visual DNA Section"],
  relationshipTargets: ["Design Tokens", "Visual DNA", "Experience Bible", "Inspiration Boards", "Components", "Screen Templates", "Themes", "Brand"],
  previewSupport: materialPreviewSupport,
  reviewWorkflow: experienceReviewWorkflow,
  categories: experienceMaterialCategories,
  materials: experienceMaterials,
  runtimePublication: "future_design_runtime_milestone"
};

export const experienceDesignRecords: ExperienceDesignRecord[] = [
  record("experience-bible-framework", "experience_bible", "Experience Bible Framework", "Framework for NOVERIS creative canon chapters, annotations, cross references, and linked concepts.", "Draft", "Creative Direction", ["bible", "canon", "dv-02"], ["DV-02A seeds the complete 65-chapter framework; do not populate the full Bible yet."], {
    parts: experienceBibleParts.map((partItem) => partItem.id),
    chapters: experienceBibleChapters.map((chapter) => chapter.id),
    releaseVersion: "DV-02 v0.1",
    subchapters: ["Supported"],
    annotations: ["Supported"],
    crossReferences: ["Supported"],
    linkedConcepts: ["Supported"],
    tableOfContents: "Part -> Chapter hierarchy"
  }),
  record("mood-board-galaxy", "mood_board", "Galaxy Inspiration Board", "Reference board for galaxy-scale wonder, navigation distance, light, scale, and discovery tone.", "Draft", "Art Direction", ["galaxy", "lighting", "composition"], ["Framework board; images can be attached later."], {
    category: "Galaxy",
    lightingNotes: "Cosmic scale, legible focus, restrained glow.",
    colorNotes: "Use approved design tokens when token values are authored.",
    compositionNotes: "Hero imagery supports game direction without becoming implementation."
  }),
  record("mood-board-hud", "mood_board", "HUD Inspiration Board", "Reference board for quiet, readable, canonical HUD experience intent.", "Draft", "UX Direction", ["hud", "interface", "accessibility"], ["Screen implementation remains game-owned."], {
    category: "HUD",
    lightingNotes: "Readable over bright and dark game scenes.",
    colorNotes: "State color must remain accessible.",
    compositionNotes: "Support gameplay without visually dominating the hero."
  }),
  record("concept-interface-projection", "concept", "Projection Glass Interface Study", "Concept placeholder for future interface material and projection studies.", "Draft", "Concept Art", ["interface", "material", "projection"], ["No final art attached yet."], {
    conceptType: "Interface Concepts",
    preview: "Pending",
    sourceAsset: "Pending"
  }),
  record("screen-definition-first-launch", "screen_definition", "First Launch Experience", "Canonical intent for the first launch moment, not a React or CSS layout.", "Draft", "Experience Design", ["first-launch", "screen", "journey"], ["Actual screen implementation belongs to the Game repository."], {
    purpose: "Introduce the promise of NOVERIS.",
    playerGoals: ["Understand the first action", "Feel oriented"],
    emotionalGoals: ["Curious", "Capable", "Invited"],
    narrativePurpose: "Begin civilization authorship without overload.",
    layoutNotes: "Reference screenshots and annotations only.",
    interactionZones: ["Primary start action", "Status context", "Optional settings"]
  }),
  record("design-token-framework", "design_token_collection", "Canonical Design Tokens", "DS-02 semantic token library for NOVERIS meaning, purpose, relationships, review, search, and future renderer consumption.", "Draft", "Design Systems", ["tokens", "framework", "ds-02", "semantic"], ["Do not define token values yet.", "Do not attach CSS variables, Tailwind classes, hexadecimal values, pixel values, or implementation code."], {
    canonicalSystem: experienceDesignTokenSystem.id,
    tokenLibraries: experienceDesignTokenLibraries.map((library) => library.name),
    tokenCount: experienceDesignTokens.length,
    tokenValuesDefined: false,
    implementationValuesPublished: false,
    consumers: experienceDesignTokenSystem.consumers,
    runtimePublication: experienceDesignTokenSystem.runtimePublication
  }),
  record("material-space-glass", "material_definition", "Canonical Material Library", "DS-03 semantic material library for NOVERIS material meaning, light behavior, emotion, relationships, preview metadata, and future renderer interpretation.", "Draft", "Material Design", ["material", "ds-03", "semantic"], ["Do not define shader code, CSS, GLSL, Three.js, Unity, Unreal, Roblox, texture, or renderer implementation."], {
    canonicalSystem: experienceMaterialLibrary.id,
    materialCategories: experienceMaterialCategories.map((category) => category.name),
    materialCount: experienceMaterials.length,
    previewSupport: experienceMaterialLibrary.previewSupport,
    runtimePublication: experienceMaterialLibrary.runtimePublication,
    implementationValuesPublished: false
  }),
  record("motion-discovery", "motion_definition", "Discovery Motion", "Motion intent for discovery reveal moments and reduced-motion alternatives.", "Draft", "Motion Design", ["motion", "discovery", "accessibility"], ["No implementation curves are final."], {
    purpose: "Signal a meaningful reveal without blocking interaction.",
    duration: "Framework pending",
    curve: "Framework pending",
    accessibilityNotes: "Must support reduced motion and non-motion affordances."
  }),
  record("component-design-panel", "component_definition", "Panel Design Definition", "Design definition for panels across NOVERIS without React, Roblox, or CSS implementation details.", "Draft", "Component Design", ["component", "panel"], ["Implementation remains client-owned."], {
    purpose: "Readable grouping surface.",
    states: ["default", "focused", "loading", "error", "disabled"],
    variants: ["standard", "dense", "modal"]
  }),
  record("theme-default-framework", "theme", "Default Theme Framework", "Future theme definition shell for default NOVERIS presentation.", "Draft", "Design Systems", ["theme", "default"], ["No theme values yet."], {
    themeIntent: "Canonical default presentation intent.",
    tokenRelationships: ["design-token-framework"]
  }),
  record("brand-novel-optimism", "brand_guideline", "Optimistic Civilization Tone", "Brand guidance for hopeful science, exploration, and civilization building.", "Approved", "Creative Direction", ["brand", "tone", "noveris"], ["Canonical creative guidance; not runtime gameplay."], {
    principle: "NOVERIS is about the future we build.",
    usage: "Use for copy, art direction, and review.",
    constraints: "Avoid conquest-first or horror-first framing."
  }),
  record("moment-first-discovery", "experience_moment", "First Discovery", "Experience journey moment for the first meaningful discovery.", "Draft", "Experience Design", ["journey", "discovery"], ["Links to Discovery Library when authored."], {
    playerEmotion: "Wonder and agency.",
    visualGoal: "Make discovery feel consequential but not noisy.",
    audioGoal: "Future audio reference support.",
    interactionGoal: "Clear next action.",
    narrativeGoal: "The universe is knowable through careful exploration."
  }),
  record("review-ed-01-framework", "review", "ED-01 Framework Review", "Creative review record for the first Experience Design framework implementation.", "In Review", "Studio", ["review", "ed-01"], ["Review the framework before populating complete content."], {
    subjectId: "ED-01",
    reviewState: "In Review",
    comments: ["Framework established; content population comes later."],
    decision: "Pending"
  })
];

const inspirationBoardCategoryNames = [
  "Universe",
  "Galaxy",
  "Sector",
  "Star System",
  "Planet",
  "Moon",
  "Colony",
  "Civilization",
  "Architecture",
  "Megastructures",
  "Discovery",
  "Research",
  "Population",
  "Economy",
  "Logistics",
  "AI",
  "Interface",
  "HUD",
  "Navigation",
  "Loading",
  "Main Menu",
  "Settings",
  "Studio",
  "Typography",
  "Lighting",
  "Color",
  "Materials",
  "Motion",
  "Brand",
  "Marketing",
  "Website",
  "Steam",
  "Trailers",
  "Photography",
  "NASA",
  "Engineering",
  "Natural Phenomena"
];

export const inspirationBoardAnnotationCategories: ExperienceInspirationAnnotationCategory[] = [
  "Lighting",
  "Color",
  "Composition",
  "Geometry",
  "Atmosphere",
  "Scale",
  "Materials",
  "Motion ideas",
  "Typography",
  "Negative space",
  "Visual rhythm",
  "Interaction inspiration"
];

export const inspirationBoardCategories: ExperienceInspirationBoardCategory[] = inspirationBoardCategoryNames.map((title) => ({
  id: `inspiration-${slugify(title)}`,
  title,
  purpose: `${title} inspiration board category for approved NOVERIS visual memory, references, annotations, and creative relationships.`,
  tags: ["inspiration-board", slugify(title)]
}));

const signatureTags = [
  "Monumental Civilization",
  "Universe First",
  "Celestial Geometry",
  "Light Represents Progress",
  "Calm Intelligence",
  "Civilization Gold",
  "Hopeful Futurism"
];

export const inspirationBoards: ExperienceInspirationBoard[] = inspirationBoardCategories.map((category, index) => {
  const primaryReferences = category.title === "Website"
    ? ["noveris-life-translation", "dv-02c-section-12-future-relationships"]
    : ["core-creative-philosophy", "what-noveris-is", "dv-02c-section-01-the-noveris-signature"];
  const visualReferences = category.title === "Lighting"
    ? ["dv-03-section-03-light-philosophy", "dv-03-section-13-visual-contrast"]
    : ["dv-03-section-01-visual-dna", "dv-03-section-06-composition", "dv-03-section-08-geometry"];

  return {
    id: `inspiration-board-${slugify(category.title)}`,
    title: `${category.title} Inspiration Board`,
    subtitle: `${category.title} visual memory and review surface`,
    purpose: "Answer what we are trying to create, why it matters, which Experience Bible principles support it, which Visual DNA language it reinforces, and which future screens inherit from it.",
    creativeGoal: `Collect approved ${category.title.toLowerCase()} references that strengthen NOVERIS visual direction without duplicating Asset Library binaries.`,
    categoryId: category.id,
    collectionId: "noveris-inspiration-library",
    subboardIds: [],
    experienceBibleReferences: primaryReferences,
    visualDnaReferences: visualReferences,
    status: category.title === "Website" ? "In Review" : "Draft",
    owner: category.title === "Website" ? "Brand Direction" : "Art Direction",
    reviewers: ["Creative Direction", "Experience Design"],
    version: "0.1",
    created: "2026-07-17T00:00:00.000Z",
    modified: "2026-07-17T00:00:00.000Z",
    tags: ["dv-04", "inspiration-board", category.title.toLowerCase(), ...category.tags],
    keywords: [category.title, "emotion", "lighting", "color", "composition", "geometry", "glass", "projection", "orbit", "discovery", "legacy", "civilization", "calm"],
    notes: ["Reference approved assets only.", "Do not duplicate existing Asset Library binaries.", "Route approved boards through Experience Design review."],
    attachments: [],
    relationships: [
      { id: `${category.id}-relationship-bible`, targetType: "experience_bible", targetId: "DV-02", label: "Experience Bible" },
      { id: `${category.id}-relationship-visual-dna`, targetType: "visual_dna", targetId: "DV-03", label: "Visual DNA" }
    ],
    approvalStatus: category.title === "Website" ? "In Review" : "Draft",
    history: [
      {
        id: `inspiration-board-${slugify(category.title)}-created`,
        action: "created",
        author: "Experience Design",
        timestamp: "2026-07-17T00:00:00.000Z",
        notes: `Created ${category.title} Inspiration Board for DV-04.`
      }
    ],
    referenceCount: 0,
    annotationCategories: inspirationBoardAnnotationCategories,
    signatureReinforcement: signatureTags.filter((_, tagIndex) => (tagIndex + index) % 2 === 0).slice(0, 4),
    inspirationScores: {
      Hope: 70 + (index % 4) * 5,
      Wonder: 72 + (index % 5) * 4,
      Scale: 68 + (index % 6) * 3,
      Civilization: 70 + (index % 3) * 6,
      Discovery: 66 + (index % 5) * 5,
      Architecture: 62 + (index % 4) * 6,
      Atmosphere: 70 + (index % 5) * 4,
      Light: 74 + (index % 4) * 4,
      Calm: 72 + (index % 3) * 5,
      Engineering: 65 + (index % 5) * 4
    },
    favorite: ["Universe", "Galaxy", "Civilization", "Website"].includes(category.title)
  };
});

export const inspirationBoardLibrary: ExperienceInspirationBoardLibrary = {
  id: "DV-04",
  title: "Inspiration Board Library",
  version: "0.1",
  status: "Draft",
  purpose: "The canonical visual memory of NOVERIS. Every approved image, concept, photograph, render, illustration, architectural study, lighting reference, typography example, cinematic frame, interface reference, and composition study should ultimately live here.",
  workspaceRoute: `${EXPERIENCE_DESIGN_ROUTE}/inspiration-boards`,
  categories: inspirationBoardCategories,
  boards: inspirationBoards,
  referenceModelFields: [
    "title",
    "description",
    "source",
    "creator",
    "licenseNotes",
    "category",
    "tags",
    "keywords",
    "lightingNotes",
    "colorNotes",
    "compositionNotes",
    "architectureNotes",
    "materialNotes",
    "emotion",
    "visualPrinciples",
    "experienceBibleLinks",
    "visualDnaLinks",
    "screenRelationships",
    "componentRelationships",
    "status",
    "version",
    "approval",
    "history"
  ],
  annotationCategories: inspirationBoardAnnotationCategories,
  relationshipTargets: ["Experience Bible Chapters", "Visual DNA Sections", "Screen Definitions", "Design Tokens", "Materials", "Motion Definitions", "Components", "Themes", "Brand Guidance", "Concept Art", "Future Tasks"],
  searchFields: ["emotion", "lighting", "color", "composition", "planet", "architecture", "NASA", "hope", "civilization", "monumentality", "calm", "geometry", "glass", "projection", "environment", "planetary", "orbit", "discovery", "legacy", "annotations"],
  filters: ["Status", "Approved", "Draft", "Category", "Lighting", "Emotion", "Material", "Theme", "Architecture", "Platform", "Relationship", "Tags", "Color Family"],
  viewModes: ["Grid", "Masonry", "Canvas", "Presentation Mode"],
  presentationMode: {
    enabled: true,
    purpose: ["creative reviews", "art direction", "team discussions", "design workshops"]
  },
  reviewWorkflow: experienceReviewWorkflow,
  scoreDimensions: ["Hope", "Wonder", "Scale", "Civilization", "Discovery", "Architecture", "Atmosphere", "Light", "Calm", "Engineering"],
  favorites: {
    pinnedBoardIds: ["inspiration-board-universe", "inspiration-board-galaxy", "inspiration-board-website"],
    recentlyViewedBoardIds: ["inspiration-board-universe", "inspiration-board-hud", "inspiration-board-website"],
    recentlyUpdatedBoardIds: ["inspiration-board-website", "inspiration-board-lighting", "inspiration-board-civilization"],
    favoriteReferenceIds: []
  },
  signatureTags,
  importSources: ["Asset Library", "Dropbox", "Local Upload", "Generated Concepts", "Approved Marketing Assets"],
  performanceRequirements: ["lazy images", "virtualized grids", "responsive previews", "deferred loading", "fast search"],
  accessibilityRequirements: ["keyboard navigation", "screen readers", "zoom", "reduced motion", "high contrast"]
};

function model(
  kind: ExperienceDesignKind,
  displayName: string,
  description: string,
  requiredFields: string[],
  supportedCapabilities: string[],
  route: string
): ExperienceContentModel {
  return {
    kind,
    displayName,
    description,
    requiredFields: ["id", "name", "description", "status", "created", "modified", "version", "author", "tags", "notes", "attachments", "relationships", "approvalStatus", "history", ...requiredFields],
    supportedCapabilities,
    route: `${EXPERIENCE_DESIGN_ROUTE}/${route}`
  };
}

function record(
  id: string,
  kind: ExperienceDesignKind,
  name: string,
  description: string,
  status: ExperienceDesignStatus,
  author: string,
  tags: string[],
  notes: string[],
  fields: Record<string, string | string[] | number | boolean>
): ExperienceDesignRecord {
  const timestamp = "2026-07-16T00:00:00.000Z";
  return {
    id,
    kind,
    name,
    description,
    status,
    created: timestamp,
    modified: timestamp,
    version: "1.0.0",
    author,
    tags,
    notes,
    attachments: [],
    relationships: [],
    approvalStatus: status,
    history: [
      {
        id: `${id}-created`,
        action: "created",
        author,
        timestamp,
        notes: "Created ED-01 framework record."
      }
    ],
    category: typeof fields.category === "string" ? fields.category : undefined,
    fields
  };
}

export function getExperienceDesignState(): ExperienceDesignState {
  const experienceBible = getExperienceBibleState();
  const countsByKind = experienceContentModels.reduce((accumulator, item) => {
    accumulator[item.kind] = experienceDesignRecords.filter((recordItem) => recordItem.kind === item.kind).length;
    return accumulator;
  }, {} as Record<ExperienceDesignKind, number>);

  const history = experienceDesignRecords
    .flatMap((item) => item.history)
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, 8);

  return {
    frameworkId: "ED-01",
    version: "1.0",
    owner: "Project Genesis Studio",
    creativeDirectionOwner: "Studio",
    runtimePublishing: "not_published",
    implementationBoundary: [
      "Experience Design is canonical creative direction.",
      "Experience Design is not gameplay.",
      "Experience Design is not rendering.",
      "Experience Design is not React implementation.",
      "Experience Design is not CSS.",
      "Experience Design is not Three.js.",
      "Game clients consume approved design definitions in a future contract; ED-01 is not published to runtime yet."
    ],
    sections: experienceDesignSections,
    contentModels: experienceContentModels,
    records: experienceDesignRecords,
    reviewWorkflow: experienceReviewWorkflow,
    searchScopes: ["Bible", "Inspiration Boards", "Concepts", "Screens", "Tokens", "Materials", "Motion", "Components", "Themes", "Journey"],
    dashboard: {
      recentActivity: history,
      draftReviews: experienceDesignRecords.filter((item) => item.status === "Draft" || item.status === "In Review"),
      approvedChanges: experienceDesignRecords.filter((item) => item.status === "Approved"),
      countsByKind
    },
    experienceBible,
    inspirationBoards: inspirationBoardLibrary,
    designTokens: experienceDesignTokenSystem,
    materials: experienceMaterialLibrary
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

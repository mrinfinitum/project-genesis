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

export type ExperienceMotionCategory =
  | "Arrival"
  | "Departure"
  | "Focus"
  | "Selection"
  | "Confirmation"
  | "Discovery"
  | "Navigation"
  | "Transition"
  | "Camera"
  | "Progress"
  | "Research"
  | "Construction"
  | "Civilization"
  | "Mission"
  | "Timeline"
  | "Galaxy"
  | "Planet"
  | "Colony"
  | "Notification"
  | "Celebration"
  | "Ambient";

export type ExperienceMotionAttentionLevel = "Background" | "Peripheral" | "Primary" | "Critical";

export type ExperienceMotionIntensity = "Still" | "Subtle" | "Standard" | "Emphasized" | "Celebratory" | "Emergency";

export type ExperienceMotionPreviewSupport =
  | "Animated Preview"
  | "Storyboard"
  | "Motion Timeline"
  | "Interaction Sequence"
  | "Camera Path";

export type ExperienceMotionDefinition = {
  id: string;
  name: string;
  category: ExperienceMotionCategory;
  purpose: string;
  description: string;
  emotionalIntent: string;
  trigger: string;
  completionCondition: string;
  expectedDuration: string;
  intensity: ExperienceMotionIntensity;
  playerAttentionLevel: ExperienceMotionAttentionLevel;
  accessibilityNotes: string[];
  visualDnaReferences: string[];
  experienceBibleReferences: string[];
  relatedTokens: string[];
  relatedMaterials: string[];
  relatedComponents: string[];
  relatedScreens: string[];
  relatedInspirationBoards: string[];
  futureRuntimeMapping: "future_design_runtime_milestone";
  previewSupport: ExperienceMotionPreviewSupport[];
  owner: string;
  reviewStatus: ExperienceDesignStatus;
  status: ExperienceDesignStatus;
  version: "0.1";
  history: ExperienceHistoryEntry[];
  tags: string[];
};

export type ExperienceMotionCategoryDefinition = {
  id: string;
  name: ExperienceMotionCategory;
  purpose: string;
  motionIds: string[];
  status: ExperienceDesignStatus;
  version: "0.1";
  reviewStatus: ExperienceDesignStatus;
};

export type ExperienceMotionSystem = {
  id: "DS-04";
  title: "Canonical Motion System";
  version: "0.1";
  status: "Draft";
  purpose: string;
  workspaceRoute: string;
  philosophy: string[];
  rules: {
    always: string[];
    never: string[];
  };
  attentionLevels: ExperienceMotionAttentionLevel[];
  intensityLevels: ExperienceMotionIntensity[];
  accessibilitySupport: string[];
  searchFields: string[];
  relationshipTargets: string[];
  previewSupport: ExperienceMotionPreviewSupport[];
  reviewWorkflow: ExperienceDesignStatus[];
  categories: ExperienceMotionCategoryDefinition[];
  motions: ExperienceMotionDefinition[];
  cameraLanguage: Array<{
    id: string;
    from: string;
    to: string;
    purpose: string;
    emotionalIntent: string;
    expectedDuration: string;
    playerContext: string;
    accessibilityNotes: string[];
    visualDnaReferences: string[];
  }>;
  runtimePublication: "future_design_runtime_milestone";
};

export type ExperienceComponentCategory =
  | "Navigation"
  | "Command"
  | "Layout"
  | "Information"
  | "Data Display"
  | "Interaction"
  | "Visualization"
  | "Media"
  | "Feedback"
  | "Input"
  | "Documentation"
  | "Creative"
  | "Runtime";

export type ExperienceComponentState =
  | "Default"
  | "Hover"
  | "Focus"
  | "Active"
  | "Selected"
  | "Pressed"
  | "Disabled"
  | "Loading"
  | "Success"
  | "Warning"
  | "Danger"
  | "Locked"
  | "Unavailable";

export type ExperienceComponentSize = "Compact" | "Standard" | "Comfortable" | "Hero";

export type ExperienceComponentPreviewSupport =
  | "Static Preview"
  | "Interactive Preview"
  | "State Preview"
  | "Accessibility Preview"
  | "Comparison Preview";

export type ExperienceComponentDefinition = {
  id: string;
  name: string;
  category: ExperienceComponentCategory;
  purpose: string;
  description: string;
  playerIntent: string;
  studioIntent: string;
  experienceBibleReferences: string[];
  visualDnaReferences: string[];
  relatedTokens: string[];
  relatedMaterials: string[];
  relatedMotion: string[];
  relatedComponents: string[];
  relatedScreens: string[];
  relatedInspirationBoards: string[];
  accessibilityNotes: string[];
  responsiveNotes: string[];
  interactionNotes: string[];
  states: ExperienceComponentState[];
  sizes: ExperienceComponentSize[];
  previewSupport: ExperienceComponentPreviewSupport[];
  futureRuntimeMapping: "future_design_runtime_milestone";
  owner: string;
  reviewStatus: ExperienceDesignStatus;
  status: ExperienceDesignStatus;
  version: "0.1";
  history: ExperienceHistoryEntry[];
  tags: string[];
};

export type ExperienceComponentCategoryDefinition = {
  id: string;
  name: ExperienceComponentCategory;
  purpose: string;
  componentIds: string[];
  status: ExperienceDesignStatus;
  version: "0.1";
  reviewStatus: ExperienceDesignStatus;
};

export type ExperienceComponentLibrary = {
  id: "DS-05";
  title: "Canonical Component Library";
  version: "0.1";
  status: "Draft";
  purpose: string;
  workspaceRoute: string;
  philosophy: string[];
  boundaries: string[];
  states: ExperienceComponentState[];
  sizes: ExperienceComponentSize[];
  accessibilitySupport: string[];
  responsiveTargets: string[];
  searchFields: string[];
  relationshipTargets: string[];
  previewSupport: ExperienceComponentPreviewSupport[];
  reviewWorkflow: ExperienceDesignStatus[];
  categories: ExperienceComponentCategoryDefinition[];
  components: ExperienceComponentDefinition[];
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
  motion: ExperienceMotionSystem;
  componentLibrary: ExperienceComponentLibrary;
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
  { id: "motion", label: "Motion Library", description: "DS-04 canonical semantic motion system for arrival, departure, focus, selection, confirmation, discovery, navigation, transition, camera, progress, research, construction, civilization, mission, timeline, galaxy, planet, colony, notification, celebration, and ambient motion.", route: `${EXPERIENCE_DESIGN_ROUTE}/motion`, kinds: ["motion_definition"] },
  { id: "components", label: "Component Library", description: "DS-05 canonical semantic component library for navigation, command, layout, information, data display, interaction, visualization, media, feedback, input, documentation, creative, and runtime component intent.", route: `${EXPERIENCE_DESIGN_ROUTE}/components`, kinds: ["component_definition"] },
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
  model("motion_definition", "Canonical Motion System", "DS-04 semantic motion definitions for purpose, confidence, intelligence, discovery, civilization, scale, mastery, accessibility, relationships, preview metadata, and future renderer interpretation without animation implementation.", ["category", "purpose", "emotionalIntent", "trigger", "completionCondition", "expectedDuration", "intensity", "playerAttentionLevel", "accessibilityNotes", "visualDnaReferences", "experienceBibleReferences", "relatedTokens", "relatedMaterials", "relatedComponents", "relatedScreens", "relatedInspirationBoards", "futureRuntimeMapping", "reviewStatus"], ["arrival", "departure", "focus", "selection", "confirmation", "discovery", "navigation", "transition", "camera", "progress", "research", "construction", "civilization", "mission", "timeline", "galaxy", "planet", "colony", "notification", "celebration", "ambient", "microinteractions", "camera language", "accessibility", "preview metadata", "relationships", "search", "versioning"], "motion"),
  model("component_definition", "Canonical Component Library", "DS-05 semantic component definitions for purpose, player intent, Studio intent, states, sizes, accessibility, responsiveness, relationships, review, versioning, and future renderer interpretation without implementation code.", ["category", "purpose", "playerIntent", "studioIntent", "experienceBibleReferences", "visualDnaReferences", "relatedTokens", "relatedMaterials", "relatedMotion", "relatedComponents", "relatedScreens", "relatedInspirationBoards", "accessibilityNotes", "responsiveNotes", "interactionNotes", "states", "sizes", "futureRuntimeMapping", "owner", "reviewStatus"], ["navigation", "command", "layout", "information", "data display", "interaction", "visualization", "media", "feedback", "input", "documentation", "creative", "runtime", "semantic states", "semantic sizes", "accessibility", "responsive intent", "preview metadata", "relationships", "search", "versioning"], "components"),
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

const motionCategorySeeds: Array<{ name: ExperienceMotionCategory; purpose: string; motions: string[] }> = [
  { name: "Arrival", purpose: "Introduce information without demanding attention.", motions: ["motion.arrival.standard", "motion.arrival.panel", "motion.arrival.dialog", "motion.arrival.workspace"] },
  { name: "Departure", purpose: "Remove information while preserving orientation and confidence.", motions: ["motion.departure.standard", "motion.departure.panel", "motion.departure.dialog", "motion.departure.workspace"] },
  { name: "Focus", purpose: "Direct attention naturally and never aggressively.", motions: ["motion.focus.inspect", "motion.focus.selection", "motion.focus.highlight", "motion.focus.reference"] },
  { name: "Selection", purpose: "Confirm choice and spatial focus without decoration.", motions: ["motion.selection.hover", "motion.selection.active", "motion.selection.multi", "motion.selection.clear"] },
  { name: "Confirmation", purpose: "Make approval, completion, saving, and publication feel reliable.", motions: ["motion.confirmation.save", "motion.confirmation.approve", "motion.confirmation.publish", "motion.confirmation.complete"] },
  { name: "Discovery", purpose: "Make discovery rewarding without becoming explosive.", motions: ["motion.discovery.reveal", "motion.discovery.scan", "motion.discovery.signal", "motion.discovery.unlock"] },
  { name: "Navigation", purpose: "Move through the product with orientation and calm context.", motions: ["motion.navigation.section", "motion.navigation.drilldown", "motion.navigation.backtrack", "motion.navigation.breadcrumb"] },
  { name: "Transition", purpose: "Connect related states so the player understands continuity.", motions: ["motion.transition.standard", "motion.transition.workspace", "motion.transition.reference", "motion.transition.reading"] },
  { name: "Camera", purpose: "Describe camera movement intent while leaving renderer implementation to clients.", motions: ["motion.camera.zoom", "motion.camera.pan", "motion.camera.orbit", "motion.camera.settle"] },
  { name: "Progress", purpose: "Show advancement, waiting, and completion without impatience.", motions: ["motion.progress.fill", "motion.progress.step", "motion.progress.resolve", "motion.progress.paused"] },
  { name: "Research", purpose: "Make research feel intelligent, careful, and unfolding.", motions: ["motion.research.begin", "motion.research.analyze", "motion.research.breakthrough", "motion.research.archive"] },
  { name: "Construction", purpose: "Show building and production as deliberate civilization work.", motions: ["motion.construction.begin", "motion.construction.assemble", "motion.construction.complete", "motion.construction.upgrade"] },
  { name: "Civilization", purpose: "Make growth feel deliberate, never rushed.", motions: ["motion.civilization.expand", "motion.civilization.complete", "motion.civilization.activate", "motion.civilization.advance"] },
  { name: "Mission", purpose: "Communicate mission start, status, outcome, and handoff without interrupting play.", motions: ["motion.mission.begin", "motion.mission.route", "motion.mission.update", "motion.mission.complete"] },
  { name: "Timeline", purpose: "Make history and change feel sequential, readable, and meaningful.", motions: ["motion.timeline.advance", "motion.timeline.branch", "motion.timeline.reveal", "motion.timeline.focus"] },
  { name: "Galaxy", purpose: "Make the player feel they are traveling through space, not switching pages.", motions: ["motion.galaxy.travel", "motion.galaxy.zoom", "motion.galaxy.arrival", "motion.galaxy.orbit"] },
  { name: "Planet", purpose: "Connect celestial scale to specific planet inspection and action.", motions: ["motion.planet.descend", "motion.planet.inspect", "motion.planet.scan", "motion.planet.colonize"] },
  { name: "Colony", purpose: "Make settlement changes feel inhabited, stable, and consequential.", motions: ["motion.colony.found", "motion.colony.grow", "motion.colony.alert", "motion.colony.stabilize"] },
  { name: "Notification", purpose: "Communicate without interrupting.", motions: ["motion.notification.success", "motion.notification.warning", "motion.notification.discovery", "motion.notification.research", "motion.notification.mission"] },
  { name: "Celebration", purpose: "Acknowledge major achievement without breaking calm mastery.", motions: ["motion.celebration.milestone", "motion.celebration.discovery", "motion.celebration.research", "motion.celebration.civilization"] },
  { name: "Ambient", purpose: "Keep environments alive with subtle, meaningful movement.", motions: ["motion.ambient.orbital-drift", "motion.ambient.atmospheric-movement", "motion.ambient.background-parallax", "motion.ambient.civilization-light-pulse", "motion.ambient.nebula-movement", "motion.ambient.research-energy"] }
];

const motionPreviewSupport: ExperienceMotionPreviewSupport[] = ["Animated Preview", "Storyboard", "Motion Timeline", "Interaction Sequence", "Camera Path"];
const motionAttentionLevels: ExperienceMotionAttentionLevel[] = ["Background", "Peripheral", "Primary", "Critical"];
const motionIntensityLevels: ExperienceMotionIntensity[] = ["Still", "Subtle", "Standard", "Emphasized", "Celebratory", "Emergency"];
const motionAccessibilitySupport = ["Reduced Motion", "No Motion", "Alternative Feedback", "Timing Adjustments"];

function motionName(semanticPath: string) {
  return semanticPath.replace(/^motion\./, "").split(".").map((part) => part.split("-").map((piece) => piece[0].toUpperCase() + piece.slice(1)).join(" ")).join(" / ");
}

function motionIntensity(category: ExperienceMotionCategory, semanticPath: string): ExperienceMotionIntensity {
  if (semanticPath.includes("warning") || semanticPath.includes("alert")) return "Emphasized";
  if (semanticPath.includes("celebration") || semanticPath.includes("milestone")) return "Celebratory";
  if (category === "Ambient") return "Subtle";
  if (category === "Focus" || category === "Selection" || category === "Progress") return "Standard";
  if (category === "Notification") return semanticPath.includes("warning") ? "Emphasized" : "Standard";
  return "Standard";
}

function motionAttention(category: ExperienceMotionCategory, semanticPath: string): ExperienceMotionAttentionLevel {
  if (category === "Ambient") return "Background";
  if (category === "Notification") return semanticPath.includes("warning") ? "Critical" : "Peripheral";
  if (category === "Discovery" || category === "Celebration" || category === "Galaxy" || category === "Planet") return "Primary";
  if (category === "Focus" || category === "Selection" || category === "Progress") return "Peripheral";
  return "Primary";
}

function motionDuration(category: ExperienceMotionCategory, semanticPath: string) {
  if (category === "Ambient") return "continuous and subtle";
  if (category === "Galaxy" || category === "Camera" || semanticPath.includes("cinematic")) return "deliberate spatial travel";
  if (category === "Notification") return "brief and non-blocking";
  return "standard interaction timing";
}

function motionTokens(semanticPath: string) {
  const tokens = new Set<string>(["motion.fade.standard"]);
  if (semanticPath.includes("focus")) tokens.add("motion.focus").add("glow.focus");
  if (semanticPath.includes("selection")) tokens.add("motion.selection").add("status.active");
  if (semanticPath.includes("discovery")) tokens.add("motion.discovery").add("accent.discovery.violet");
  if (semanticPath.includes("travel") || semanticPath.includes("orbit") || semanticPath.includes("galaxy")) tokens.add("motion.travel").add("motion.orbit");
  if (semanticPath.includes("research")) tokens.add("motion.research").add("background.research");
  if (semanticPath.includes("notification")) tokens.add("motion.notification");
  if (semanticPath.includes("civilization") || semanticPath.includes("construction")) tokens.add("accent.civilization.gold").add("glow.civilization");
  return Array.from(tokens);
}

function motionMaterials(semanticPath: string) {
  const materials = new Set<string>();
  if (semanticPath.includes("discovery")) materials.add("material-projection-projection-discovery").add("material-energy-discovery-energy");
  if (semanticPath.includes("research")) materials.add("material-energy-research-energy").add("material-glass-research-glass");
  if (semanticPath.includes("galaxy") || semanticPath.includes("ambient")) materials.add("material-atmosphere-deep-space");
  if (semanticPath.includes("civilization") || semanticPath.includes("construction")) materials.add("material-energy-civilization-energy");
  if (semanticPath.includes("notification") || semanticPath.includes("warning")) materials.add("material-special-highlight");
  if (materials.size === 0) materials.add("material-glass-command-glass");
  return Array.from(materials);
}

function motionReferences(category: ExperienceMotionCategory, semanticPath: string) {
  const bibleReferences = ["core-creative-philosophy", "dv02-chapter-21-motion-and-transition"];
  const visualDnaReferences = ["dv-03-section-12-motion"];
  if (category === "Galaxy" || category === "Planet" || category === "Camera") visualDnaReferences.push("dv-03-section-06-composition", "dv-03-section-07-scale");
  if (category === "Discovery") bibleReferences.push("dv02-chapter-26-first-discovery");
  if (category === "Civilization" || category === "Construction") bibleReferences.push("dv-02c-section-02-monumental-civilization");
  return { bibleReferences, visualDnaReferences };
}

export const experienceMotions: ExperienceMotionDefinition[] = motionCategorySeeds.flatMap((category) => category.motions.map((semanticPath) => {
  const references = motionReferences(category.name, semanticPath);
  return {
    id: semanticPath,
    name: motionName(semanticPath),
    category: category.name,
    purpose: `${motionName(semanticPath)} communicates ${category.name.toLowerCase()} intent while improving understanding.`,
    description: "Canonical motion definition only. Renderers may interpret this later, but DS-04 does not define CSS animation, easing curves, React transitions, camera code, engine clips, or timelines.",
    emotionalIntent: category.name === "Discovery"
      ? "Rewarding, legible, and never explosive."
      : category.name === "Galaxy"
      ? "Spatial, vast, calm, and continuous."
      : category.name === "Ambient"
      ? "Subtle life and atmosphere without visual competition."
      : "Calm, confident, purposeful, and clear.",
    trigger: `${category.name} context requests ${semanticPath}.`,
    completionCondition: "The user understands what changed and can continue interacting without delay.",
    expectedDuration: motionDuration(category.name, semanticPath),
    intensity: motionIntensity(category.name, semanticPath),
    playerAttentionLevel: motionAttention(category.name, semanticPath),
    accessibilityNotes: motionAccessibilitySupport,
    visualDnaReferences: references.visualDnaReferences,
    experienceBibleReferences: references.bibleReferences,
    relatedTokens: motionTokens(semanticPath),
    relatedMaterials: motionMaterials(semanticPath),
    relatedComponents: semanticPath.includes("panel") || semanticPath.includes("dialog") ? ["component-design-panel"] : semanticPath.includes("navigation") ? ["component-navigation"] : [],
    relatedScreens: semanticPath.includes("galaxy") ? ["screen-galaxy"] : semanticPath.includes("planet") ? ["screen-planet"] : semanticPath.includes("research") ? ["screen-research"] : semanticPath.includes("colony") ? ["screen-colony"] : [],
    relatedInspirationBoards: [`inspiration-board-${slugify(category.name)}`, "inspiration-board-motion"],
    futureRuntimeMapping: "future_design_runtime_milestone",
    previewSupport: motionPreviewSupport,
    owner: "Motion Design",
    reviewStatus: "Draft",
    status: "Draft",
    version: "0.1",
    history: [
      {
        id: `${semanticPath}-ds-04-created`,
        action: "created",
        author: "Motion Design",
        timestamp: "2026-07-17T00:00:00.000Z",
        notes: "Created semantic motion definition for DS-04."
      }
    ],
    tags: ["ds-04", "motion", slugify(category.name), ...semanticPath.split(".")]
  };
}));

export const experienceMotionCategories: ExperienceMotionCategoryDefinition[] = motionCategorySeeds.map((category) => ({
  id: `motion-category-${slugify(category.name)}`,
  name: category.name,
  purpose: category.purpose,
  motionIds: category.motions,
  status: "Draft",
  version: "0.1",
  reviewStatus: "Draft"
}));

export const experienceMotionCameraLanguage: ExperienceMotionSystem["cameraLanguage"] = [
  ["Galaxy", "Sector"],
  ["Sector", "Star System"],
  ["Star System", "Planet"],
  ["Planet", "Colony"],
  ["Colony", "Building"]
].map(([from, to]) => ({
  id: `camera-${slugify(from)}-to-${slugify(to)}`,
  from,
  to,
  purpose: `Move from ${from} context to ${to} context while preserving spatial understanding.`,
  emotionalIntent: "Scale, continuity, confidence, and calm orientation.",
  expectedDuration: "deliberate spatial travel",
  playerContext: `The player is moving from ${from} level authorship into ${to} level detail.`,
  accessibilityNotes: motionAccessibilitySupport,
  visualDnaReferences: ["dv-03-section-06-composition", "dv-03-section-07-scale", "dv-03-section-12-motion"]
}));

export const experienceMotionSystem: ExperienceMotionSystem = {
  id: "DS-04",
  title: "Canonical Motion System",
  version: "0.1",
  status: "Draft",
  purpose: "Create the canonical semantic motion language for NOVERIS so renderers implement movement from shared intent instead of local animation guesses.",
  workspaceRoute: `${EXPERIENCE_DESIGN_ROUTE}/motion`,
  philosophy: [
    "Motion exists to improve understanding.",
    "Never animate for decoration.",
    "Every movement must answer why it moved.",
    "Motion should reinforce calm, confidence, purpose, and clarity."
  ],
  rules: {
    always: ["reinforce understanding", "respect hierarchy", "support readability", "maintain calm"],
    never: ["bounce without meaning", "spin for decoration", "flash unnecessarily", "compete with gameplay", "delay interaction"]
  },
  attentionLevels: motionAttentionLevels,
  intensityLevels: motionIntensityLevels,
  accessibilitySupport: motionAccessibilitySupport,
  searchFields: ["Purpose", "Emotion", "Category", "Trigger", "Attention Level", "Intensity", "Related Screen", "Related Component", "Visual DNA", "Experience Bible"],
  relationshipTargets: ["Design Tokens", "Materials", "Visual DNA", "Experience Bible", "Inspiration Boards", "Components", "Screen Templates", "Themes", "Brand"],
  previewSupport: motionPreviewSupport,
  reviewWorkflow: experienceReviewWorkflow,
  categories: experienceMotionCategories,
  motions: experienceMotions,
  cameraLanguage: experienceMotionCameraLanguage,
  runtimePublication: "future_design_runtime_milestone"
};

const componentCategorySeeds: Array<{ name: ExperienceComponentCategory; purpose: string; components: string[] }> = [
  {
    name: "Navigation",
    purpose: "Help users move through NOVERIS and Studio with orientation, continuity, and calm confidence.",
    components: ["Navigation Rail", "Navigation Group", "Navigation Item", "Navigation Section", "Navigation Breadcrumb", "Navigation Tabs", "Navigation Drawer", "Navigation Overlay", "Navigation Search", "Navigation Header", "Navigation Footer"]
  },
  {
    name: "Command",
    purpose: "Express available actions without letting controls become the emotional focus.",
    components: ["Primary Command Button", "Secondary Command Button", "Inline Action", "Icon Button", "Toolbar", "Action Group", "Floating Command", "Split Button", "Command Palette"]
  },
  {
    name: "Layout",
    purpose: "Organize workspaces, content regions, context panels, and durable information surfaces.",
    components: ["Workspace", "Workspace Header", "Workspace Section", "Workspace Sidebar", "Workspace Footer", "Hero Region", "Content Region", "Context Panel", "Inspector", "Property Group", "Panel", "Card", "Stack", "Divider", "Grid", "Canvas"]
  },
  {
    name: "Information",
    purpose: "Communicate status, meaning, measurements, properties, and emphasis with minimal noise.",
    components: ["Status Chip", "Badge", "Tag", "Label", "Metric", "Metric Tile", "Summary Tile", "Progress", "Timeline", "Key Value", "Statistic", "Property", "Callout"]
  },
  {
    name: "Data Display",
    purpose: "Make dense canonical content readable, comparable, searchable, and trustworthy.",
    components: ["Table", "Tree", "List", "Gallery", "Masonry", "Reading View", "Article", "Code Block", "Relationship Graph", "Comparison Table", "Hierarchy View"]
  },
  {
    name: "Interaction",
    purpose: "Support direct manipulation, choice, selection, and configuration without implementation assumptions.",
    components: ["Checkbox", "Switch", "Radio", "Slider", "Stepper", "Dropdown", "Autocomplete", "Date Picker", "Search Field", "Command Search"]
  },
  {
    name: "Visualization",
    purpose: "Explain progress, relationships, or spatial context while keeping the universe and content primary.",
    components: ["Chart", "Timeline Visualization", "Orbit Diagram", "Galaxy Map", "Relationship Diagram", "Progress Ring", "Activity Graph"]
  },
  {
    name: "Media",
    purpose: "Present approved visual references, artwork, thumbnails, previews, and media without becoming a renderer.",
    components: ["Image", "Hero Image", "Media Gallery", "Video", "Preview", "Asset Card", "Thumbnail", "Concept Card"]
  },
  {
    name: "Feedback",
    purpose: "Tell users what happened, what changed, and what needs attention without interruption.",
    components: ["Notification", "Toast", "Alert", "Banner", "Confirmation", "Dialog", "Modal", "Tooltip", "Popover", "Status Overlay"]
  },
  {
    name: "Input",
    purpose: "Capture user intent with accessible, semantic, and platform-adaptable input patterns.",
    components: ["Text Field", "Text Area", "Number Field", "Select Field", "File Upload", "Color Swatch", "Toggle Group", "Segmented Control", "Filter Input", "Range Input"]
  },
  {
    name: "Documentation",
    purpose: "Support canonical reading, reference, annotation, glossary, and implementation handoff without owning code.",
    components: ["Reading Panel", "Chapter View", "Reference Block", "Quote", "Code Sample", "Illustration", "Annotation", "Glossary Entry"]
  },
  {
    name: "Creative",
    purpose: "Represent creative authoring objects such as boards, patterns, materials, motion, tokens, and screens.",
    components: ["Mood Board Card", "Inspiration Card", "Creative Concept Card", "Material Card", "Motion Card", "Token Card", "Pattern Card", "Screen Card"]
  },
  {
    name: "Runtime",
    purpose: "Describe runtime-facing component intent for future mapping without publishing runtime data yet.",
    components: ["Runtime Status", "Validation Summary", "Export Reference", "Contract Badge", "Schema Note", "Compatibility Notice", "Runtime Preview", "Diagnostics Row"]
  }
];

const componentStates: ExperienceComponentState[] = ["Default", "Hover", "Focus", "Active", "Selected", "Pressed", "Disabled", "Loading", "Success", "Warning", "Danger", "Locked", "Unavailable"];
const componentSizes: ExperienceComponentSize[] = ["Compact", "Standard", "Comfortable", "Hero"];
const componentAccessibilitySupport = ["Keyboard", "Touch", "Controller", "Reduced Motion", "High Contrast", "Screen Reader", "Localization"];
const componentResponsiveTargets = ["Desktop", "Laptop", "Tablet", "Phone", "Ultrawide"];
const componentPreviewSupport: ExperienceComponentPreviewSupport[] = ["Static Preview", "Interactive Preview", "State Preview", "Accessibility Preview", "Comparison Preview"];

function componentId(category: ExperienceComponentCategory, name: string) {
  return `component.${slugify(category)}.${slugify(name)}`;
}

function componentTokens(category: ExperienceComponentCategory, name: string) {
  const text = `${category} ${name}`.toLowerCase();
  const tokens = new Set<string>(["text.primary", "body.primary", "spacing.compact"]);
  if (category === "Navigation" || text.includes("breadcrumb") || text.includes("tabs")) tokens.add("icon.navigation").add("glass.navigation").add("transition.workspace");
  if (category === "Command" || text.includes("button") || text.includes("action")) tokens.add("surface.command.glass").add("motion.selection").add("glow.focus");
  if (category === "Layout" || text.includes("panel") || text.includes("card")) tokens.add("surface.command.glass").add("radius.panel").add("grid.workspace");
  if (category === "Information" || text.includes("status") || text.includes("metric")) tokens.add("metric").add("status.info").add("icon.metric");
  if (category === "Data Display" || text.includes("table") || text.includes("list")) tokens.add("grid.workspace").add("surface.reference.glass").add("caption");
  if (category === "Feedback" || text.includes("alert") || text.includes("warning")) tokens.add("status.warning").add("motion.notification").add("glow.warning");
  if (category === "Visualization" || text.includes("galaxy") || text.includes("orbit")) tokens.add("stroke.celestial").add("background.universe").add("motion.orbit");
  if (category === "Media" || category === "Creative") tokens.add("grid.gallery").add("background.studio");
  if (category === "Documentation") tokens.add("surface.reading.paper").add("quote");
  if (category === "Runtime") tokens.add("background.runtime").add("status.success");
  return Array.from(tokens);
}

function componentMaterials(category: ExperienceComponentCategory, name: string) {
  const text = `${category} ${name}`.toLowerCase();
  const materials = new Set<string>(["material-glass-command-glass"]);
  if (category === "Navigation") materials.add("material-glass-navigation-glass");
  if (category === "Information" || category === "Feedback" || category === "Runtime") materials.add("material-special-highlight");
  if (category === "Visualization" || text.includes("galaxy") || text.includes("orbit")) materials.add("material-atmosphere-deep-space");
  if (category === "Documentation") materials.add("material-glass-reading-glass").add("material-surface-reading-surface");
  if (category === "Creative" || category === "Media") materials.add("material-glass-reference-glass");
  return Array.from(materials);
}

function componentMotion(category: ExperienceComponentCategory, name: string) {
  const text = `${category} ${name}`.toLowerCase();
  const motions = new Set<string>(["motion.arrival.standard", "motion.selection.hover", "motion.focus.inspect"]);
  if (category === "Navigation") motions.add("motion.navigation.section");
  if (category === "Command" || text.includes("button")) motions.add("motion.confirmation.save");
  if (category === "Feedback") motions.add("motion.notification.success");
  if (category === "Visualization" || text.includes("galaxy") || text.includes("orbit")) motions.add("motion.ambient.orbital-drift").add("motion.galaxy.travel");
  if (category === "Documentation") motions.add("motion.transition.reading");
  if (category === "Runtime") motions.add("motion.progress.resolve");
  return Array.from(motions);
}

function componentReferences(category: ExperienceComponentCategory, name: string) {
  const text = `${category} ${name}`.toLowerCase();
  const bibleReferences = ["core-creative-philosophy", "dv02-chapter-17-the-interface-is-part-of-the-world"];
  const visualDnaReferences = ["dv-03-section-01-visual-dna", "dv-03-section-06-composition"];
  if (category === "Navigation") bibleReferences.push("dv02-chapter-18-navigation-and-orientation");
  if (category === "Feedback") bibleReferences.push("dv02-chapter-22-feedback-and-state");
  if (text.includes("galaxy") || text.includes("orbit")) visualDnaReferences.push("dv-03-section-07-scale", "dv-03-section-08-geometry");
  if (category === "Documentation") bibleReferences.push("dv02-chapter-37-codex-and-encyclopedia");
  return { bibleReferences, visualDnaReferences };
}

function componentRelatedScreens(category: ExperienceComponentCategory, name: string) {
  const text = `${category} ${name}`.toLowerCase();
  if (category === "Navigation") return ["screen-dashboard", "screen-galaxy"];
  if (text.includes("galaxy")) return ["screen-galaxy"];
  if (text.includes("runtime") || text.includes("export")) return ["screen-runtime"];
  if (category === "Documentation") return ["screen-encyclopedia"];
  if (category === "Creative" || category === "Media") return ["screen-asset-library"];
  return ["screen-dashboard"];
}

export const experienceComponentDefinitions: ExperienceComponentDefinition[] = componentCategorySeeds.flatMap((category) => category.components.map((name) => {
  const id = componentId(category.name, name);
  const references = componentReferences(category.name, name);
  return {
    id,
    name,
    category: category.name,
    purpose: `${name} communicates ${category.name.toLowerCase()} intent with clarity while preserving the emotional identity of NOVERIS.`,
    description: "Canonical component definition only. Studio owns meaning, relationships, states, accessibility, and review; renderers own implementation.",
    playerIntent: "Understand what this element means, what can be done with it, and how it relates to the civilization experience.",
    studioIntent: "Provide a reusable semantic contract that can be reviewed, searched, linked, and later mapped by platform renderers.",
    experienceBibleReferences: references.bibleReferences,
    visualDnaReferences: references.visualDnaReferences,
    relatedTokens: componentTokens(category.name, name),
    relatedMaterials: componentMaterials(category.name, name),
    relatedMotion: componentMotion(category.name, name),
    relatedComponents: [],
    relatedScreens: componentRelatedScreens(category.name, name),
    relatedInspirationBoards: [`inspiration-board-${slugify(category.name)}`, "inspiration-board-interface"],
    accessibilityNotes: componentAccessibilitySupport,
    responsiveNotes: componentResponsiveTargets.map((target) => `${target} presentation should preserve meaning and hierarchy without fixed implementation rules.`),
    interactionNotes: ["States are semantic.", "Controls must support keyboard, touch, and controller intent where relevant.", "Locked or unavailable states must explain requirements without disappearing."],
    states: componentStates,
    sizes: componentSizes,
    previewSupport: componentPreviewSupport,
    futureRuntimeMapping: "future_design_runtime_milestone",
    owner: "Component Design",
    reviewStatus: "Draft",
    status: "Draft",
    version: "0.1",
    history: [
      {
        id: `${id}-ds-05-created`,
        action: "created",
        author: "Component Design",
        timestamp: "2026-07-17T00:00:00.000Z",
        notes: "Created semantic component definition for DS-05."
      }
    ],
    tags: ["ds-05", "component", slugify(category.name), slugify(name), ...componentTokens(category.name, name)]
  };
}));

export const experienceComponentCategories: ExperienceComponentCategoryDefinition[] = componentCategorySeeds.map((category) => ({
  id: `component-category-${slugify(category.name)}`,
  name: category.name,
  purpose: category.purpose,
  componentIds: category.components.map((name) => componentId(category.name, name)),
  status: "Draft",
  version: "0.1",
  reviewStatus: "Draft"
}));

export const experienceComponentLibrary: ExperienceComponentLibrary = {
  id: "DS-05",
  title: "Canonical Component Library",
  version: "0.1",
  status: "Draft",
  purpose: "Create the canonical semantic component library for NOVERIS across Studio, Game, Website, Steam, Marketing, and future platforms while keeping rendering implementation client-owned.",
  workspaceRoute: `${EXPERIENCE_DESIGN_ROUTE}/components`,
  philosophy: [
    "Components communicate information with clarity.",
    "Components should disappear into the experience.",
    "The player notices the civilization, not the controls.",
    "Every renderer implements from shared meaning instead of local guesses."
  ],
  boundaries: [
    "Components are semantic definitions.",
    "Components are not React components.",
    "Components are not Vue components.",
    "Components are not HTML.",
    "Components are not CSS.",
    "Components are not Tailwind.",
    "Components are not UIKit.",
    "Components are not Material UI.",
    "Components are not implementation code."
  ],
  states: componentStates,
  sizes: componentSizes,
  accessibilitySupport: componentAccessibilitySupport,
  responsiveTargets: componentResponsiveTargets,
  searchFields: ["Purpose", "Category", "State", "Related Screen", "Related Token", "Related Material", "Related Motion", "Experience Bible", "Visual DNA"],
  relationshipTargets: ["Design Tokens", "Materials", "Motion", "Visual DNA", "Experience Bible", "Inspiration Boards", "Screen Templates", "Themes", "Brand"],
  previewSupport: componentPreviewSupport,
  reviewWorkflow: experienceReviewWorkflow,
  categories: experienceComponentCategories,
  components: experienceComponentDefinitions,
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
  record("motion-discovery", "motion_definition", "Canonical Motion System", "DS-04 semantic motion system for NOVERIS purpose, confidence, intelligence, discovery, civilization, scale, mastery, accessibility, relationships, preview metadata, and future renderer interpretation.", "Draft", "Motion Design", ["motion", "discovery", "accessibility", "ds-04"], ["Do not define CSS animation, easing curves, React transitions, Three.js camera code, Unity animation clips, Unreal timelines, or renderer implementation."], {
    canonicalSystem: experienceMotionSystem.id,
    motionCategories: experienceMotionCategories.map((category) => category.name),
    motionCount: experienceMotions.length,
    previewSupport: experienceMotionSystem.previewSupport,
    attentionLevels: experienceMotionSystem.attentionLevels,
    intensityLevels: experienceMotionSystem.intensityLevels,
    accessibilitySupport: experienceMotionSystem.accessibilitySupport,
    runtimePublication: experienceMotionSystem.runtimePublication,
    implementationValuesPublished: false
  }),
  record("component-design-panel", "component_definition", "Canonical Component Library", "DS-05 semantic component library for NOVERIS component purpose, states, sizes, accessibility, responsiveness, relationships, review, and future renderer mapping.", "Draft", "Component Design", ["component", "ds-05", "semantic"], ["Do not define React, Vue, HTML, CSS, Tailwind, UIKit, Material UI, or implementation code."], {
    canonicalSystem: experienceComponentLibrary.id,
    componentCategories: experienceComponentCategories.map((category) => category.name),
    componentCount: experienceComponentDefinitions.length,
    states: experienceComponentLibrary.states,
    sizes: experienceComponentLibrary.sizes,
    accessibilitySupport: experienceComponentLibrary.accessibilitySupport,
    responsiveTargets: experienceComponentLibrary.responsiveTargets,
    previewSupport: experienceComponentLibrary.previewSupport,
    runtimePublication: experienceComponentLibrary.runtimePublication,
    implementationValuesPublished: false
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
    materials: experienceMaterialLibrary,
    motion: experienceMotionSystem,
    componentLibrary: experienceComponentLibrary
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

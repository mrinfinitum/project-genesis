import {
  COMPONENT_LIBRARY_ID,
  COMPONENT_LIBRARY_VERSION,
  noverisComponentLibrary,
  type ComponentLibraryContract
} from "@/lib/component-library";
import {
  DESIGN_LANGUAGE_ID,
  DESIGN_LANGUAGE_VERSION,
  noverisDesignLanguage,
  type DesignLanguageValidationIssue
} from "@/lib/design-language";

export const SCREEN_TEMPLATE_LIBRARY_ID = "noveris-screen-template-library";
export const SCREEN_TEMPLATE_LIBRARY_VERSION = "1.0.0";
export const UNKNOWN_SCREEN_TEMPLATE_COMPONENT = "UNKNOWN_SCREEN_TEMPLATE_COMPONENT";
export const UNKNOWN_SCREEN_TEMPLATE_ASSET_ROLE = "UNKNOWN_SCREEN_TEMPLATE_ASSET_ROLE";

export const screenTemplateCategories = ["gameplay", "universe", "civilization", "creative-production", "reference"] as const;
export const screenLayoutModes = ["desktop", "tablet", "compact", "inspector-hidden", "presentation"] as const;

export type ScreenTemplateCategory = (typeof screenTemplateCategories)[number];
export type ScreenLayoutMode = (typeof screenLayoutModes)[number];

export type ScreenTemplateRegion = {
  id: string;
  displayName: string;
  description: string;
  required: boolean;
  visibility: "required" | "optional" | "hidden-by-default";
  componentIds: string[];
};

export type ScreenTemplateAssetSlot = {
  id: string;
  roleId: string;
  displayName: string;
  description: string;
  required: boolean;
};

export type ScreenTemplateRuntimeContract = {
  id: "screen-hierarchy" | "semantic-regions" | "component-references" | "asset-slots" | "token-references";
  description: string;
  required: true;
};

export type ScreenTemplateDefinition = {
  id: string;
  version: typeof SCREEN_TEMPLATE_LIBRARY_VERSION;
  status: "published";
  displayName: string;
  description: string;
  category: ScreenTemplateCategory;
  inheritsFrom: "layout.unity-screen-standard" | "layout.library-browser";
  requiredComponents: string[];
  optionalComponents: string[];
  layoutRegions: ScreenTemplateRegion[];
  assetSlots: ScreenTemplateAssetSlot[];
  runtimeContracts: ScreenTemplateRuntimeContract[];
  tokenReferences: string[];
  layoutModes: ScreenLayoutMode[];
  validation: { required: string[]; status: "Ready" };
  unityExport: {
    format: "json";
    implementationOwner: "unity";
    omits: ["coordinates", "anchors", "screen-positions", "animation", "interactions", "player-state"];
  };
  createdAt: string;
  updatedAt: string;
};

export type SemanticAssetRole = {
  id: string;
  displayName: string;
  description: string;
  usedByTemplateIds: string[];
};

export type ScreenTemplateUsage = {
  screenTemplateId: string;
  unityScreenId: string;
  implementationStatus: "contract-ready";
  validationStatus: "Ready";
  componentCoverage: "declared";
  assetCompleteness: "declared";
};

export type ScreenTemplateLibraryContract = {
  id: typeof SCREEN_TEMPLATE_LIBRARY_ID;
  version: typeof SCREEN_TEMPLATE_LIBRARY_VERSION;
  status: "published";
  displayName: "NOVERIS Screen Template Library";
  description: string;
  category: "screen-template-library";
  inheritsFrom: {
    designLanguage: { id: typeof DESIGN_LANGUAGE_ID; version: typeof DESIGN_LANGUAGE_VERSION };
    componentLibrary: { id: typeof COMPONENT_LIBRARY_ID; version: typeof COMPONENT_LIBRARY_VERSION };
  };
  categories: Array<{ id: ScreenTemplateCategory; displayName: string; description: string }>;
  layoutModes: Array<{ id: ScreenLayoutMode; displayName: string; description: string }>;
  assetRoles: SemanticAssetRole[];
  templates: ScreenTemplateDefinition[];
  screenUsage: ScreenTemplateUsage[];
  unityExport: {
    format: "json";
    endpoint: "/api/export/screen-template-library.json";
    implementationOwner: "unity";
    unknownComponentCode: typeof UNKNOWN_SCREEN_TEMPLATE_COMPONENT;
    unknownAssetRoleCode: typeof UNKNOWN_SCREEN_TEMPLATE_ASSET_ROLE;
  };
  createdAt: string;
  updatedAt: string;
};

export type ScreenTemplateValidationIssue = DesignLanguageValidationIssue;

type TemplateSeed = {
  id: string;
  displayName: string;
  category: ScreenTemplateCategory;
  description: string;
  requiredComponents: string[];
  optionalComponents?: string[];
  assetSlots: Array<[string, string, boolean, string]>;
  layout?: "standard" | "library" | "modal" | "inspector";
};

const createdAt = "2026-08-02T00:00:00.000Z";
const tokenReferences = ["type.title", "type.body", "space.16", "space.24", "border.standard", "radius.standard", "glass.content", "motion.150"];
const runtimeContracts: ScreenTemplateRuntimeContract[] = [
  { id: "screen-hierarchy", description: "The ordered semantic region hierarchy provided to Unity.", required: true },
  { id: "semantic-regions", description: "Named screen regions and their required or optional visibility.", required: true },
  { id: "component-references", description: "Canonical Component Library identifiers only.", required: true },
  { id: "asset-slots", description: "Semantic artwork roles resolved by the consuming client.", required: true },
  { id: "token-references", description: "Design Language token references with no local visual values.", required: true }
];

const categoryDefinitions: ScreenTemplateLibraryContract["categories"] = [
  { id: "gameplay", displayName: "Gameplay", description: "Player-facing game progression, information, and decision surfaces." },
  { id: "universe", displayName: "Universe", description: "Galaxy, region, system, and planet exploration surfaces." },
  { id: "civilization", displayName: "Civilization", description: "Civilization advancement, economy, research, and settlement surfaces." },
  { id: "creative-production", displayName: "Creative Production", description: "Studio-side authoring and production contract surfaces." },
  { id: "reference", displayName: "Reference", description: "Reusable modal, inspector, browser, and validation templates." }
];

const layoutModeDefinitions: ScreenTemplateLibraryContract["layoutModes"] = [
  { id: "desktop", displayName: "Desktop", description: "The full workspace composition for wide displays." },
  { id: "tablet", displayName: "Tablet", description: "A condensed workspace composition selected by Unity." },
  { id: "compact", displayName: "Compact", description: "A narrow, information-prioritized composition selected by Unity." },
  { id: "inspector-hidden", displayName: "Inspector Hidden", description: "A mode that removes the optional inspector while retaining its contract." },
  { id: "presentation", displayName: "Presentation", description: "A reduced chrome mode for guided review or display." }
];

function region(id: string, displayName: string, componentIds: string[], required: boolean, description: string, visibility: ScreenTemplateRegion["visibility"] = required ? "required" : "optional"): ScreenTemplateRegion {
  return { id, displayName, componentIds, required, description, visibility };
}

function standardRegions(): ScreenTemplateRegion[] {
  return [
    region("top-navigation", "Top Navigation", ["component.navigation.top"], true, "Global product and screen navigation."),
    region("page-header", "Page Header", ["component.panel.information"], true, "Screen title, context, and primary commands."),
    region("primary-workspace", "Primary Workspace", ["component.layout-helper.workspace"], true, "The semantic workspace where the screen's primary content is assembled."),
    region("left-sidebar", "Left Sidebar", ["component.navigation.sidebar"], false, "Optional secondary navigation or hierarchy."),
    region("right-inspector", "Right Inspector", ["component.panel.inspector", "component.inspector.standard"], false, "Optional selected-record details and dependencies."),
    region("search-region", "Search Region", ["component.input.search"], false, "Optional screen-level search and filtering."),
    region("notification-region", "Notification Region", ["component.badge.alert"], false, "Non-blocking system and validation messages."),
    region("bottom-footer", "Bottom Footer", ["component.navigation.footer"], false, "Optional secondary navigation and metadata.")
  ];
}

function libraryRegions(): ScreenTemplateRegion[] {
  return [
    region("top-navigation", "Top Navigation", ["component.navigation.top"], true, "Global product and screen navigation."),
    region("page-header", "Page Header", ["component.panel.information"], true, "Library title, context, and primary commands."),
    region("content-tree", "Content Tree", ["component.navigation.sidebar", "component.list.navigation"], true, "Canonical category and hierarchy browsing."),
    region("primary-workspace", "Primary Workspace", ["component.layout-helper.workspace", "component.card.standard"], true, "Search results, cards, or records selected from the content tree."),
    region("search-region", "Search Region", ["component.input.search-bar", "component.input.filter-chip"], true, "Library search and canonical filters."),
    region("right-inspector", "Right Inspector", ["component.panel.inspector", "component.inspector.standard"], false, "Optional read-only record detail."),
    region("notification-region", "Notification Region", ["component.badge.alert"], false, "Non-blocking library state and validation messages.")
  ];
}

function modalRegions(): ScreenTemplateRegion[] {
  return [
    region("modal-surface", "Modal Surface", ["component.dialog.fullscreen", "component.panel.modal"], true, "Focused decision or confirmation surface."),
    region("modal-header", "Modal Header", ["component.panel.information"], true, "Modal title, context, and close affordance."),
    region("modal-content", "Modal Content", ["component.layout-helper.stack"], true, "Semantic modal content."),
    region("modal-actions", "Modal Actions", ["component.button.primary", "component.button.secondary"], true, "Explicit confirm, cancel, or close actions."),
    region("notification-region", "Notification Region", ["component.badge.alert"], false, "Non-blocking modal validation messages.")
  ];
}

function inspectorRegions(): ScreenTemplateRegion[] {
  return [
    region("inspector-header", "Inspector Header", ["component.panel.information"], true, "Selected record identity and quick actions."),
    region("inspector-content", "Inspector Content", ["component.inspector.standard", "component.list.property"], true, "Read-only canonical fields and dependencies."),
    region("inspector-actions", "Inspector Actions", ["component.button.secondary", "component.button.ghost"], false, "Optional contextual actions."),
    region("notification-region", "Notification Region", ["component.badge.alert"], false, "Non-blocking inspector validation messages.")
  ];
}

const templateSeeds: TemplateSeed[] = [
  { id: "dashboard", displayName: "Dashboard", category: "gameplay", description: "High-level civilization status, progression summaries, and available player actions.", requiredComponents: ["component.card.hero", "component.card.stat", "component.progress.circular"], optionalComponents: ["component.navigation.tabs", "component.technology-ring.core"], assetSlots: [["dashboard-background", "background", true, "Quiet full-screen environment or thematic shell artwork."], ["civilization-crest", "civilization-crest", false, "Current civilization identity mark."], ["era-artwork", "era-artwork", false, "Current era visual reference."]] },
  { id: "civilization-command", displayName: "Civilization Command", category: "civilization", description: "Civilization identity, stage, strategic status, and canonical system access.", requiredComponents: ["component.technology-ring.core", "component.card.stat", "component.list.property"], optionalComponents: ["component.navigation.tabs", "component.progress.bar"], assetSlots: [["civilization-background", "background", true, "Quiet civilization command environment."], ["civilization-crest", "civilization-crest", true, "Civilization identity mark."], ["leader-portrait", "leader-portrait", false, "Optional leader or AI representative portrait."]] },
  { id: "galaxy", displayName: "Galaxy", category: "universe", description: "Galaxy identity, generated regions, discovery state, and galaxy-level navigation.", requiredComponents: ["component.card.standard", "component.navigation.breadcrumbs", "component.list.discovery"], optionalComponents: ["component.technology-ring.planet", "component.navigation.tabs"], assetSlots: [["galaxy-background", "background", true, "Galaxy environment painting."], ["galaxy-render", "galaxy-render", true, "Canonical rendered galaxy view."], ["region-overlay", "region-overlay", false, "Optional region identity overlay."]] },
  { id: "galactic-region", displayName: "Galactic Region", category: "universe", description: "Galactic region identity, contained star systems, and procedural navigation contract.", requiredComponents: ["component.card.standard", "component.navigation.breadcrumbs", "component.input.search"], optionalComponents: ["component.navigation.tabs", "component.list.discovery"], assetSlots: [["region-background", "background", true, "Galactic region environment painting."], ["region-render", "region-render", true, "Canonical generated region view."], ["star-system-thumbnail", "star-system-thumbnail", false, "Reusable star system thumbnail role."]] },
  { id: "star-system", displayName: "Star System", category: "universe", description: "Star system body hierarchy, primary star, planets, and astronomical discovery context.", requiredComponents: ["component.card.planet", "component.technology-ring.planet", "component.navigation.breadcrumbs"], optionalComponents: ["component.navigation.tabs", "component.tooltip.planet"], assetSlots: [["system-background", "background", true, "Star system environment painting."], ["star-render", "star-render", true, "Primary star render."], ["planet-thumbnail", "planet-thumbnail", false, "Planet card thumbnail role."], ["orbit-style", "orbit-style", false, "Optional orbit visualization asset role."]] },
  { id: "planet-detail", displayName: "Planet Detail", category: "universe", description: "Planet identity, planetary data, biome, weather, resources, life, and deep-data access.", requiredComponents: ["component.card.planet", "component.table.property-grid", "component.navigation.tabs", "component.technology-ring.planet"], optionalComponents: ["component.tooltip.planet", "component.progress.bar", "component.list.discovery"], assetSlots: [["planet-background", "background", true, "Planet detail environmental background."], ["planet-hero", "planet-hero", true, "Primary planet render."], ["planet-thumbnail", "planet-thumbnail", true, "Compact planet preview."], ["planet-biome-panel", "planet-biome-panel", true, "Biome and environment panel artwork."], ["planet-weather-panel", "planet-weather-panel", true, "Weather and climate panel artwork."], ["planet-creature-panel", "planet-creature-panel", true, "Creature and life panel artwork."], ["planet-resource-panel", "planet-resource-panel", true, "Resource panel artwork."], ["planet-flora-panel", "planet-flora-panel", false, "Flora panel artwork."], ["planet-atmosphere-panel", "planet-atmosphere-panel", false, "Atmospheric composition panel artwork."]] },
  { id: "settlement", displayName: "Settlement", category: "civilization", description: "Settlement overview, population, buildings, needs, and development state.", requiredComponents: ["component.card.standard", "component.progress.construction", "component.list.property"], optionalComponents: ["component.navigation.tabs", "component.table.data-grid"], assetSlots: [["settlement-background", "background", true, "Settlement environment painting."], ["settlement-hero", "settlement-hero", true, "Primary settlement artwork."], ["building-thumbnail", "building-thumbnail", false, "Building record artwork."]] },
  { id: "research", displayName: "Research", category: "civilization", description: "Research records, progress, requirements, and available technology decisions.", requiredComponents: ["component.card.research", "component.progress.research", "component.list.research"], optionalComponents: ["component.navigation.tabs", "component.tooltip.rich"], assetSlots: [["research-background", "background", true, "Research workspace environment."], ["research-icon", "research-icon", true, "Research node or record icon."], ["research-illustration", "research-illustration", false, "Optional research detail illustration."]] },
  { id: "skill-tree", displayName: "Skill Tree", category: "civilization", description: "Technology-tree navigation using canonical technology rings and connection semantics.", requiredComponents: ["component.technology-ring.small", "component.technology-ring.medium", "component.technology-ring.research", "component.scrollbar.horizontal"], optionalComponents: ["component.panel.inspector", "component.input.search"], assetSlots: [["skill-tree-background", "background", true, "Technology tree background."], ["technology-ring", "technology-ring", true, "Technology ring visual role."], ["connector-style", "connector-style", true, "Technology relationship connector role."], ["divider-style", "divider-style", true, "Technology workspace divider role."], ["header-background", "header-background", false, "Optional header material artwork."], ["inspector-background", "inspector-background", false, "Optional inspector material artwork."]] },
  { id: "economy", displayName: "Economy", category: "civilization", description: "Canonical economy balances, production rates, transaction reasons, and resource flows.", requiredComponents: ["component.card.stat", "component.table.data-grid", "component.progress.bar"], optionalComponents: ["component.input.dropdown", "component.tooltip.rich"], assetSlots: [["economy-background", "background", true, "Economy workspace background."], ["economy-icon", "economy-icon", true, "Economy metric icon."], ["resource-icon", "resource-icon", false, "Resource row icon."]] },
  { id: "trade", displayName: "Trade", category: "civilization", description: "Markets, routes, listings, and trade opportunity contracts.", requiredComponents: ["component.table.data-grid", "component.card.standard", "component.progress.bar"], optionalComponents: ["component.input.search", "component.input.filter-chip"], assetSlots: [["trade-background", "background", true, "Trade workspace background."], ["route-icon", "route-icon", true, "Trade route identity icon."], ["market-icon", "market-icon", false, "Market identity icon."]] },
  { id: "mission", displayName: "Mission", category: "gameplay", description: "Mission and expedition availability, objectives, rewards, and active progress.", requiredComponents: ["component.card.mission", "component.progress.bar", "component.badge.status"], optionalComponents: ["component.navigation.tabs", "component.tooltip.rich"], assetSlots: [["mission-background", "background", true, "Mission workspace background."], ["mission-icon", "mission-icon", true, "Mission identity icon."], ["mission-illustration", "mission-illustration", false, "Mission detail illustration."]] },
  { id: "discovery", displayName: "Discovery", category: "gameplay", description: "Discovery records, rarity, knowledge state, and catalog navigation.", requiredComponents: ["component.card.discovery", "component.list.discovery", "component.input.search-bar"], optionalComponents: ["component.input.filter-chip", "component.tooltip.rich"], assetSlots: [["discovery-background", "background", true, "Discovery library background."], ["discovery-thumbnail", "discovery-thumbnail", true, "Discovery record thumbnail."], ["rarity-icon", "rarity-icon", false, "Rarity status icon."]] },
  { id: "encyclopedia", displayName: "Encyclopedia", category: "reference", description: "Canonical knowledge records, taxonomies, and linked reference material.", requiredComponents: ["component.list.navigation", "component.input.search-bar", "component.card.standard"], optionalComponents: ["component.panel.inspector", "component.input.filter-chip"], assetSlots: [["encyclopedia-background", "background", true, "Reference workspace background."], ["entry-thumbnail", "entry-thumbnail", false, "Encyclopedia record thumbnail."], ["category-icon", "category-icon", false, "Knowledge category icon."]], layout: "library" },
  { id: "collections", displayName: "Collections", category: "reference", description: "Curated record collections with consistent filtering, browsing, and detail contracts.", requiredComponents: ["component.list.navigation", "component.card.standard", "component.input.search-bar"], optionalComponents: ["component.input.filter-chip", "component.panel.inspector"], assetSlots: [["collection-background", "background", true, "Collection workspace background."], ["collection-hero", "collection-hero", false, "Collection identity art."], ["collection-thumbnail", "collection-thumbnail", false, "Collection record thumbnail."]], layout: "library" },
  { id: "settings", displayName: "Settings", category: "reference", description: "Player or editor preference groups with declarative controls and safe confirmation states.", requiredComponents: ["component.list.navigation", "component.input.toggle", "component.input.dropdown"], optionalComponents: ["component.dialog.confirmation", "component.tooltip.standard"], assetSlots: [["settings-background", "background", false, "Optional settings workspace background."], ["settings-icon", "settings-icon", false, "Settings category icon."]] },
  { id: "modal", displayName: "Modal", category: "reference", description: "A canonical focused decision surface with no independent screen coordinates.", requiredComponents: ["component.dialog.fullscreen", "component.panel.modal", "component.button.primary", "component.button.secondary"], optionalComponents: ["component.dialog.alert", "component.tooltip.standard"], assetSlots: [["modal-background", "modal-background", false, "Optional modal-specific decorative artwork."], ["modal-illustration", "modal-illustration", false, "Optional supporting illustration."]], layout: "modal" },
  { id: "inspector", displayName: "Inspector", category: "reference", description: "A reusable selected-record detail panel for canonical properties and dependencies.", requiredComponents: ["component.inspector.standard", "component.list.property", "component.panel.inspector"], optionalComponents: ["component.button.secondary", "component.badge.status"], assetSlots: [["inspector-background", "inspector-background", false, "Optional inspector material artwork."], ["record-thumbnail", "record-thumbnail", false, "Selected record thumbnail."]], layout: "inspector" },
  { id: "asset-browser", displayName: "Asset Browser", category: "creative-production", description: "A browsable canonical asset collection with tree navigation, search, preview, and read-only inspection.", requiredComponents: ["component.list.navigation", "component.input.search-bar", "component.card.standard"], optionalComponents: ["component.panel.inspector", "component.input.filter-chip", "component.badge.status"], assetSlots: [["asset-browser-background", "background", true, "Asset browser background."], ["asset-thumbnail", "asset-thumbnail", true, "Asset grid thumbnail role."], ["asset-placeholder", "asset-placeholder", false, "Missing-art placeholder icon."]], layout: "library" },
  { id: "creative-production", displayName: "Creative Production", category: "creative-production", description: "A production contract workspace for source assets, derivatives, status, and implementation handoff.", requiredComponents: ["component.card.standard", "component.badge.status", "component.progress.bar"], optionalComponents: ["component.input.search", "component.panel.inspector"], assetSlots: [["production-background", "background", true, "Creative production workspace background."], ["asset-preview", "asset-preview", true, "Approved derivative preview role."], ["status-icon", "status-icon", false, "Production state icon."]] },
  { id: "prompt-generator", displayName: "Prompt Generator", category: "creative-production", description: "A prompt-contract workspace that composes canonical generator inputs without a visual editor.", requiredComponents: ["component.input.text", "component.input.dropdown", "component.panel.information"], optionalComponents: ["component.button.primary", "component.tooltip.rich"], assetSlots: [["prompt-generator-background", "background", false, "Optional prompt workspace background."], ["prompt-reference", "prompt-reference", false, "Optional approved visual reference."]] },
  { id: "production-queue", displayName: "Production Queue", category: "creative-production", description: "A canonical review queue for asset, content, and dependency work without client-layout ownership.", requiredComponents: ["component.table.data-grid", "component.badge.status", "component.progress.bar"], optionalComponents: ["component.input.search", "component.input.filter-chip"], assetSlots: [["queue-background", "background", false, "Optional production queue background."], ["queue-status-icon", "status-icon", false, "Queue state icon."]] },
  { id: "validation", displayName: "Validation", category: "reference", description: "A clear validation summary for canonical contracts, dependencies, and export readiness.", requiredComponents: ["component.table.inspector", "component.badge.alert", "component.progress.bar"], optionalComponents: ["component.input.filter-chip", "component.button.secondary"], assetSlots: [["validation-background", "background", false, "Optional validation workspace background."], ["validation-status-icon", "status-icon", false, "Validation outcome icon."]] }
];

function displayNameFromId(id: string) {
  return id.split("-").map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`).join(" ");
}

function regionsFor(layout: TemplateSeed["layout"]) {
  if (layout === "library") return libraryRegions();
  if (layout === "modal") return modalRegions();
  if (layout === "inspector") return inspectorRegions();
  return standardRegions();
}

function inheritsFromFor(layout: TemplateSeed["layout"]): ScreenTemplateDefinition["inheritsFrom"] {
  return layout === "library" ? "layout.library-browser" : "layout.unity-screen-standard";
}

function templateFromSeed(seed: TemplateSeed): ScreenTemplateDefinition {
  const regions = regionsFor(seed.layout);
  const requiredComponents = [...new Set([...seed.requiredComponents, ...regions.filter((item) => item.required).flatMap((item) => item.componentIds)])];
  const optionalComponents = [...new Set([...(seed.optionalComponents ?? []), ...regions.filter((item) => !item.required).flatMap((item) => item.componentIds)])].filter((id) => !requiredComponents.includes(id));

  return {
    id: `screen.${seed.id}`,
    version: SCREEN_TEMPLATE_LIBRARY_VERSION,
    status: "published",
    displayName: seed.displayName,
    description: seed.description,
    category: seed.category,
    inheritsFrom: inheritsFromFor(seed.layout),
    requiredComponents,
    optionalComponents,
    layoutRegions: regions,
    assetSlots: seed.assetSlots.map(([id, roleId, required, description]) => ({ id, roleId, required, description, displayName: displayNameFromId(id) })),
    runtimeContracts: runtimeContracts.map((contract) => ({ ...contract })),
    tokenReferences: [...tokenReferences],
    layoutModes: [...screenLayoutModes],
    validation: { required: ["semantic regions", "component references", "asset slots", "runtime contract", "Unity export"], status: "Ready" },
    unityExport: { format: "json", implementationOwner: "unity", omits: ["coordinates", "anchors", "screen-positions", "animation", "interactions", "player-state"] },
    createdAt,
    updatedAt: createdAt
  };
}

const templates = templateSeeds.map(templateFromSeed);

const assetRoles: SemanticAssetRole[] = [...new Map(
  templates.flatMap((template) => template.assetSlots.map((slot) => [slot.roleId, {
    id: slot.roleId,
    displayName: displayNameFromId(slot.roleId),
    description: slot.description,
    usedByTemplateIds: templates.filter((candidate) => candidate.assetSlots.some((candidateSlot) => candidateSlot.roleId === slot.roleId)).map((candidate) => candidate.id)
  }]))
).values()].sort((left, right) => left.id.localeCompare(right.id));

export const noverisScreenTemplateLibrary: ScreenTemplateLibraryContract = {
  id: SCREEN_TEMPLATE_LIBRARY_ID,
  version: SCREEN_TEMPLATE_LIBRARY_VERSION,
  status: "published",
  displayName: "NOVERIS Screen Template Library",
  description: "Canonical Unity screen contracts describing semantic regions, hierarchy, components, assets, and layout modes. Studio owns contracts; Unity owns all layout, rendering, animation, interaction, and player state.",
  category: "screen-template-library",
  inheritsFrom: {
    designLanguage: { id: DESIGN_LANGUAGE_ID, version: DESIGN_LANGUAGE_VERSION },
    componentLibrary: { id: COMPONENT_LIBRARY_ID, version: COMPONENT_LIBRARY_VERSION }
  },
  categories: categoryDefinitions,
  layoutModes: layoutModeDefinitions,
  assetRoles,
  templates,
  screenUsage: templates.map((template) => ({
    screenTemplateId: template.id,
    unityScreenId: `Noveris.${template.displayName.replace(/[^A-Za-z0-9]+/g, "")}Screen`,
    implementationStatus: "contract-ready",
    validationStatus: "Ready",
    componentCoverage: "declared",
    assetCompleteness: "declared"
  })),
  unityExport: {
    format: "json",
    endpoint: "/api/export/screen-template-library.json",
    implementationOwner: "unity",
    unknownComponentCode: UNKNOWN_SCREEN_TEMPLATE_COMPONENT,
    unknownAssetRoleCode: UNKNOWN_SCREEN_TEMPLATE_ASSET_ROLE
  },
  createdAt,
  updatedAt: createdAt
};

function issue(issues: ScreenTemplateValidationIssue[], code: string, message: string, records: string[]) {
  issues.push({ severity: "error", code, message, records });
}

export function validateScreenTemplateLibrary(
  library: ScreenTemplateLibraryContract = noverisScreenTemplateLibrary,
  componentLibrary: ComponentLibraryContract = noverisComponentLibrary
) {
  const issues: ScreenTemplateValidationIssue[] = [];
  const templateIds = new Set<string>();
  const componentIds = new Set(componentLibrary.components.map((component) => component.id));
  const assetRoleIds = new Set(library.assetRoles.map((assetRole) => assetRole.id));
  const validLayoutIds = new Set(noverisDesignLanguage.layouts.map((layout) => layout.id));
  const requiredRuntimeContractIds = new Set(runtimeContracts.map((contract) => contract.id));

  if (library.id !== SCREEN_TEMPLATE_LIBRARY_ID || library.version !== SCREEN_TEMPLATE_LIBRARY_VERSION || library.status !== "published") {
    issue(issues, "library_identity_invalid", "Screen Template Library identity, version, and published status must remain canonical.", [library.id, library.version]);
  }
  if (library.inheritsFrom.designLanguage.id !== DESIGN_LANGUAGE_ID || library.inheritsFrom.designLanguage.version !== DESIGN_LANGUAGE_VERSION) {
    issue(issues, "design_language_inheritance_invalid", "Screen Template Library must inherit from the canonical Design Language.", [library.id]);
  }
  if (library.inheritsFrom.componentLibrary.id !== COMPONENT_LIBRARY_ID || library.inheritsFrom.componentLibrary.version !== COMPONENT_LIBRARY_VERSION) {
    issue(issues, "component_library_inheritance_invalid", "Screen Template Library must inherit from the canonical Component Library.", [library.id]);
  }
  if (library.templates.length !== 23) {
    issue(issues, "template_count_invalid", "Screen Template Library must publish all 23 canonical screen templates.", [String(library.templates.length)]);
  }
  if (library.layoutModes.length !== screenLayoutModes.length || new Set(library.layoutModes.map((mode) => mode.id)).size !== screenLayoutModes.length) {
    issue(issues, "layout_modes_invalid", "Screen Template Library must publish each canonical layout mode exactly once.", [library.id]);
  }

  for (const template of library.templates) {
    if (templateIds.has(template.id)) issue(issues, "duplicate_template", "Screen template IDs must be unique.", [template.id]);
    templateIds.add(template.id);
    if (!validLayoutIds.has(template.inheritsFrom)) issue(issues, "unknown_layout_inheritance", "Screen templates must inherit from a canonical Design Language layout.", [template.id, template.inheritsFrom]);
    if (!template.description || !template.requiredComponents.length || !template.layoutRegions.length || !template.assetSlots.length) {
      issue(issues, "template_structure_missing", "Screen templates require description, components, regions, and asset slots.", [template.id]);
    }
    if (new Set(template.requiredComponents).size !== template.requiredComponents.length || new Set(template.optionalComponents).size !== template.optionalComponents.length) {
      issue(issues, "duplicate_component_reference", "Screen template component references must be unique in each required or optional collection.", [template.id]);
    }
    for (const componentId of [...template.requiredComponents, ...template.optionalComponents]) {
      if (!componentIds.has(componentId)) issue(issues, "unknown_component", `Unknown canonical component: ${componentId}.`, [template.id, componentId]);
    }
    const regionIds = new Set<string>();
    for (const layoutRegion of template.layoutRegions) {
      if (regionIds.has(layoutRegion.id)) issue(issues, "duplicate_region", "Screen template regions must be unique.", [template.id, layoutRegion.id]);
      regionIds.add(layoutRegion.id);
      if (!layoutRegion.componentIds.length) issue(issues, "region_component_missing", "Each semantic region must reference at least one canonical component.", [template.id, layoutRegion.id]);
      for (const componentId of layoutRegion.componentIds) {
        if (!componentIds.has(componentId)) issue(issues, "unknown_component", `Unknown canonical component: ${componentId}.`, [template.id, layoutRegion.id, componentId]);
      }
    }
    const slotIds = new Set<string>();
    for (const slot of template.assetSlots) {
      if (slotIds.has(slot.id)) issue(issues, "duplicate_asset_slot", "Screen template asset slots must be unique.", [template.id, slot.id]);
      slotIds.add(slot.id);
      if (!assetRoleIds.has(slot.roleId)) issue(issues, "unknown_asset_role", `Unknown semantic asset role: ${slot.roleId}.`, [template.id, slot.id, slot.roleId]);
    }
    const contractIds = new Set(template.runtimeContracts.map((contract) => contract.id));
    if (contractIds.size !== requiredRuntimeContractIds.size || [...requiredRuntimeContractIds].some((id) => !contractIds.has(id))) {
      issue(issues, "runtime_contract_missing", "Screen templates must publish every required runtime contract.", [template.id]);
    }
    if (new Set(template.layoutModes).size !== screenLayoutModes.length || screenLayoutModes.some((mode) => !template.layoutModes.includes(mode))) {
      issue(issues, "layout_mode_missing", "Screen templates must declare every canonical layout mode.", [template.id]);
    }
    const serialized = JSON.stringify(template);
    if (/"(?:coordinates|anchors|screenPositions|layoutPositions)"\s*:/i.test(serialized)) {
      issue(issues, "layout_ownership_violation", "Screen templates must not publish coordinates, anchors, or screen positions.", [template.id]);
    }
  }

  for (const assetRole of library.assetRoles) {
    if (!assetRole.usedByTemplateIds.length || assetRole.usedByTemplateIds.some((templateId) => !templateIds.has(templateId))) {
      issue(issues, "asset_role_usage_invalid", "Semantic asset roles must resolve to at least one screen template.", [assetRole.id, ...assetRole.usedByTemplateIds]);
    }
  }
  for (const usage of library.screenUsage) {
    if (!templateIds.has(usage.screenTemplateId) || usage.validationStatus !== "Ready" || usage.implementationStatus !== "contract-ready") {
      issue(issues, "screen_usage_invalid", "Screen usage must reference a valid template and contract-ready Unity binding.", [usage.screenTemplateId, usage.unityScreenId]);
    }
  }

  return { valid: !issues.length, status: issues.length ? "Blocked" as const : "Ready" as const, issues };
}

export function validateUnityScreenTemplateUsage(input: { screenTemplateId: string; componentIds?: string[]; assetRoleIds?: string[]; layoutModeId?: string }) {
  const issues: Array<{ code: string; message: string; records: string[] }> = [];
  const template = noverisScreenTemplateLibrary.templates.find((item) => item.id === input.screenTemplateId);
  if (!template) return [{ code: "UNKNOWN_SCREEN_TEMPLATE", message: "Unity must reference a published Screen Template Library ID.", records: [input.screenTemplateId] }];
  const allowedComponents = new Set([...template.requiredComponents, ...template.optionalComponents]);
  for (const componentId of input.componentIds ?? []) {
    if (!allowedComponents.has(componentId)) issues.push({ code: UNKNOWN_SCREEN_TEMPLATE_COMPONENT, message: "Unity component is not declared by this screen template.", records: [template.id, componentId] });
  }
  const allowedAssetRoles = new Set(template.assetSlots.map((slot) => slot.roleId));
  for (const assetRoleId of input.assetRoleIds ?? []) {
    if (!allowedAssetRoles.has(assetRoleId)) issues.push({ code: UNKNOWN_SCREEN_TEMPLATE_ASSET_ROLE, message: "Unity asset role is not declared by this screen template.", records: [template.id, assetRoleId] });
  }
  if (input.layoutModeId && !template.layoutModes.includes(input.layoutModeId as ScreenLayoutMode)) {
    issues.push({ code: "UNKNOWN_SCREEN_LAYOUT_MODE", message: "Unity layout mode is not declared by this screen template.", records: [template.id, input.layoutModeId] });
  }
  return issues;
}

export function buildUnityScreenTemplateExport(library: ScreenTemplateLibraryContract = noverisScreenTemplateLibrary) {
  return {
    screenTemplateLibrary: {
      id: library.id,
      version: library.version,
      status: library.status,
      designLanguage: library.inheritsFrom.designLanguage,
      componentLibrary: library.inheritsFrom.componentLibrary,
      layoutModes: library.layoutModes.map((mode) => ({ id: mode.id, displayName: mode.displayName })),
      assetRoles: library.assetRoles.map((role) => ({ id: role.id, displayName: role.displayName, usedByTemplateIds: [...role.usedByTemplateIds] })),
      templates: library.templates.map((template) => ({
        id: template.id,
        version: template.version,
        displayName: template.displayName,
        category: template.category,
        inheritsFrom: template.inheritsFrom,
        requiredComponents: [...template.requiredComponents],
        optionalComponents: [...template.optionalComponents],
        layoutRegions: template.layoutRegions.map((region) => ({ id: region.id, displayName: region.displayName, required: region.required, visibility: region.visibility, componentIds: [...region.componentIds] })),
        assetSlots: template.assetSlots.map((slot) => ({ id: slot.id, roleId: slot.roleId, displayName: slot.displayName, required: slot.required })),
        runtimeContracts: template.runtimeContracts.map((contract) => ({ id: contract.id, required: contract.required })),
        tokenReferences: [...template.tokenReferences],
        layoutModes: [...template.layoutModes]
      })),
      screenUsage: library.screenUsage.map((usage) => ({ ...usage }))
    }
  };
}

export function screenTemplateCategoryDefinitions() {
  return noverisScreenTemplateLibrary.categories.map((category) => ({
    ...category,
    count: noverisScreenTemplateLibrary.templates.filter((template) => template.category === category.id).length
  }));
}

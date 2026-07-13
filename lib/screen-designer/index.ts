import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";

export type ScreenDesignStatus = "Not Started" | "Draft" | "In Design" | "Ready for Review" | "Approved" | "Implemented" | "Needs Revision";
export type ScreenApprovalStatus = "Unreviewed" | "Changes Requested" | "Approved";
export type ScreenImplementationTarget = "Vite Web" | "Roblox" | "Unity" | "Unreal" | "Godot";
export type ScreenImplementationStatus = "Not Started" | "In Progress" | "Implemented" | "Needs Parity Review" | "Approved";
export type ScreenParityStatus = "Not Started" | "Behind Design" | "Needs Parity Review" | "In Parity" | "Blocked";
export type ScreenDataClassification = "Canonical Studio Definition" | "Player Runtime State" | "Service/Backend State" | "Presentation Hint" | "Prototype Fixture" | "Missing Definition";

export type ScreenLayoutSpec = {
  designWidth: number;
  designHeight: number;
  coordinateSystem: "absolute" | "responsive_grid" | "hud_overlay" | "modal_overlay";
  layoutMode: "full_screen_page" | "hud_overlay" | "modal" | "drawer" | "hybrid";
  panelBounds: Array<{ id: string; label: string; x: number; y: number; width: number; height: number; zIndex: number }>;
  columns: string;
  rows: string;
  spacing: string;
  alignment: string;
  safeAreas: string[];
  overflowBehavior: string;
  backgroundLayers: string[];
  overlayLayers: string[];
};

export type ScreenComponentSpec = {
  id: string;
  componentLibraryId?: string;
  variant?: string;
  state?: string;
  layoutOverride?: string;
  assetOverride?: string;
  dataBindings?: string[];
  screenSpecificNotes?: string;
  displayName: string;
  purpose: string;
  dimensions: string;
  positioning: string;
  typography: string;
  colors: string;
  assetKeys: string[];
  dataInputs: string[];
  states: string[];
  interactions: string[];
  responsiveBehavior: string;
  implementationNotes: string;
};

export type ScreenAssetRequirement = {
  id: string;
  label: string;
  artKey?: string;
  iconKey?: string;
  category: "background" | "icon" | "panel" | "button_state" | "animation" | "audio" | "video";
  required: boolean;
  status: "Ready" | "Missing" | "Placeholder" | "Needs Web Mapping" | "Needs Roblox Mapping" | "Needs Approval";
  linkedAssetId?: string;
  notes: string;
};

export type ScreenDataRequirement = {
  id: string;
  label: string;
  classification: ScreenDataClassification;
  source: string;
  required: boolean;
  status: "Mapped" | "Missing" | "Partial" | "Fixture";
  notes: string;
};

export type ScreenInteractionSpec = {
  id: string;
  trigger: string;
  resultingState: string;
  dataAction: string;
  animation: string;
  failureBehavior: string;
  accessibilityBehavior: string;
};

export type ScreenStateSpec = {
  id: string;
  label: string;
  required: boolean;
  designed: boolean;
  notes: string;
};

export type ScreenResponsiveRule = {
  viewport: string;
  behavior: string;
  status: "Ready" | "Needs Review" | "Missing";
};

export type ScreenReviewEntry = {
  id: string;
  reviewer: string;
  status: ScreenApprovalStatus;
  comments: string;
  requiredChanges: string[];
  date: string;
  approvedVersion?: number;
  implementationTarget?: ScreenImplementationTarget;
};

export type ScreenReference = {
  id: string;
  type: "Roblox screenshot" | "Vite screenshot" | "concept art" | "wireframe" | "annotated mockup" | "reference UI";
  viewport: string;
  source: string;
  date: string;
  notes: string;
  approvalStatus: ScreenApprovalStatus;
};

export type ScreenDesignChecklist = {
  layoutDefined: boolean;
  componentsDefined: boolean;
  canonicalDataMapped: boolean;
  playerStateMapped: boolean;
  missingSystemsIdentified: boolean;
  assetRequirementsCreated: boolean;
  allStatesDesigned: boolean;
  interactionsDocumented: boolean;
  responsiveRulesDefined: boolean;
  motionDefined: boolean;
  accessibilityReviewed: boolean;
  referencesAttached: boolean;
  reviewComplete: boolean;
  approved: boolean;
};

export type ScreenDesignRecord = {
  id: string;
  screenId: string;
  displayName: string;
  description: string;
  status: ScreenDesignStatus;
  approvalStatus: ScreenApprovalStatus;
  assignedTo: string;
  version: number;
  approvedVersion?: number;
  createdAt: string;
  updatedAt: string;
  referenceViewport: string;
  supportedViewports: string[];
  layoutSpec: ScreenLayoutSpec;
  componentSpecs: ScreenComponentSpec[];
  assetRequirements: ScreenAssetRequirement[];
  dataRequirements: ScreenDataRequirement[];
  interactionSpecs: ScreenInteractionSpec[];
  stateSpecs: ScreenStateSpec[];
  responsiveRules: ScreenResponsiveRule[];
  animationSpecs: string[];
  accessibilityRequirements: string[];
  notes: string[];
  implementationTargets: Array<{ target: ScreenImplementationTarget; status: ScreenImplementationStatus; notes: string }>;
  parityStatus: { vite: ScreenParityStatus; roblox: ScreenParityStatus };
  reviewHistory: ScreenReviewEntry[];
  references: ScreenReference[];
  checklist: ScreenDesignChecklist;
  frozenApprovedVersion?: ScreenDesignRecord;
};

export type ScreenDesignSummary = Pick<ScreenDesignRecord, "id" | "screenId" | "displayName" | "description" | "status" | "approvalStatus" | "assignedTo" | "version" | "updatedAt" | "referenceViewport" | "supportedViewports" | "implementationTargets" | "parityStatus"> & {
  missingAssets: number;
  unresolvedDataRequirements: number;
  responsivePreviewReady: boolean;
  checklistComplete: number;
  checklistTotal: number;
};

export type ScreenDesignerState = {
  screens: ScreenDesignSummary[];
  records: ScreenDesignRecord[];
  stats: {
    total: number;
    notStarted: number;
    inDesign: number;
    readyForReview: number;
    approved: number;
    implemented: number;
    blockedByMissingAssets: number;
    blockedByMissingData: number;
    blockedByMissingInteractionSpecs: number;
  };
  generatedAt: string;
};

const storePath = process.env.PROJECT_GENESIS_SCREEN_DESIGNER_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_SCREEN_DESIGNER_STORE)
  : path.join(process.cwd(), "data", "screen-designer.local.json");

const supportedViewports = ["1366x768", "1440x900", "1920x1080", "2560x1440", "3440x1440", "3840x2160", "compact/tablet"];
const requiredStates = ["Default", "Hover", "Pressed", "Selected", "Active", "Locked", "Disabled", "Affordable", "Unaffordable", "Empty", "Loading", "Error", "Missing Data", "Maxed", "Completed", "Preview", "Reduced Motion"];

function checklist(values: Partial<ScreenDesignChecklist>): ScreenDesignChecklist {
  return {
    layoutDefined: false,
    componentsDefined: false,
    canonicalDataMapped: false,
    playerStateMapped: false,
    missingSystemsIdentified: false,
    assetRequirementsCreated: false,
    allStatesDesigned: false,
    interactionsDocumented: false,
    responsiveRulesDefined: false,
    motionDefined: false,
    accessibilityReviewed: false,
    referencesAttached: false,
    reviewComplete: false,
    approved: false,
    ...values
  };
}

function layout(label: string, mode: ScreenLayoutSpec["layoutMode"] = "full_screen_page"): ScreenLayoutSpec {
  return {
    designWidth: 1920,
    designHeight: 1080,
    coordinateSystem: mode === "hud_overlay" ? "hud_overlay" : "responsive_grid",
    layoutMode: mode,
    panelBounds: [
      { id: "screen-root", label: `${label} root`, x: 0, y: 0, width: 1920, height: 1080, zIndex: 0 },
      { id: "primary-content", label: "Primary content", x: 48, y: 112, width: 1280, height: 872, zIndex: 10 },
      { id: "context-panel", label: "Context panel", x: 1360, y: 112, width: 512, height: 872, zIndex: 20 }
    ],
    columns: "12-column responsive grid with fixed HUD gutters where needed",
    rows: "header / primary workspace / contextual footer",
    spacing: "Use Studio spacing tokens; default 16px gaps and 24px panel padding.",
    alignment: "Left-aligned scanning surfaces, right contextual detail panels.",
    safeAreas: ["top HUD 88px", "bottom action rail 72px", "ultrawide side gutters"],
    overflowBehavior: "Primary workspace scrolls internally; HUD and action rails stay pinned.",
    backgroundLayers: ["screen background art", "dark readability wash", "subtle grid overlay"],
    overlayLayers: ["tooltips", "drawers", "confirmation dialogs", "comparison overlay"]
  };
}

function implementationTargets(web: ScreenImplementationStatus, roblox: ScreenImplementationStatus = "Not Started") {
  return [
    { target: "Vite Web" as const, status: web, notes: "Tracked against the prototype web client." },
    { target: "Roblox" as const, status: roblox, notes: "Tracked against Roblox UI parity." },
    { target: "Unity" as const, status: "Not Started" as const, notes: "Future export consumer." },
    { target: "Unreal" as const, status: "Not Started" as const, notes: "Future export consumer." },
    { target: "Godot" as const, status: "Not Started" as const, notes: "Future export consumer." }
  ];
}

function states(designed: string[]) {
  const set = new Set(designed);
  return requiredStates.map((label) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    required: true,
    designed: set.has(label),
    notes: set.has(label) ? "State documented in the starter specification." : "Needs explicit design treatment before approval."
  }));
}

function data(id: string, label: string, classification: ScreenDataClassification, source: string, status: ScreenDataRequirement["status"], notes = ""): ScreenDataRequirement {
  return { id, label, classification, source, required: true, status, notes };
}

function asset(id: string, label: string, key: string, category: ScreenAssetRequirement["category"], status: ScreenAssetRequirement["status"], notes = ""): ScreenAssetRequirement {
  const isIcon = category === "icon" || category === "button_state";
  return { id, label, artKey: isIcon ? undefined : key, iconKey: isIcon ? key : undefined, category, required: true, status, notes };
}

function interaction(id: string, trigger: string, resultingState: string, dataAction: string): ScreenInteractionSpec {
  return {
    id,
    trigger,
    resultingState,
    dataAction,
    animation: "Use shared motion tokens; respect reduced motion.",
    failureBehavior: "Show inline error state without losing focus.",
    accessibilityBehavior: "Keyboard focus returns to the initiating control after overlays close."
  };
}

function responsiveRules(status: ScreenResponsiveRule["status"] = "Needs Review"): ScreenResponsiveRule[] {
  return supportedViewports.map((viewport) => ({
    viewport,
    behavior: viewport === "compact/tablet" ? "Collapse context panels into drawers; preserve readable labels." : "Scale grid tracks while preserving HUD safe areas.",
    status
  }));
}

function baseRecord(input: {
  screenId: string;
  displayName: string;
  description: string;
  status: ScreenDesignStatus;
  approvalStatus?: ScreenApprovalStatus;
  assignedTo?: string;
  layoutMode?: ScreenLayoutSpec["layoutMode"];
  web?: ScreenImplementationStatus;
  roblox?: ScreenImplementationStatus;
  checklist?: Partial<ScreenDesignChecklist>;
  dataRequirements?: ScreenDataRequirement[];
  assetRequirements?: ScreenAssetRequirement[];
  componentSpecs?: ScreenComponentSpec[];
  interactionSpecs?: ScreenInteractionSpec[];
  stateSpecs?: ScreenStateSpec[];
  responsiveStatus?: ScreenResponsiveRule["status"];
  notes?: string[];
}): ScreenDesignRecord {
  const now = "2026-07-13T00:00:00.000Z";
  return {
    id: `screen-design-${input.screenId}`,
    screenId: input.screenId,
    displayName: input.displayName,
    description: input.description,
    status: input.status,
    approvalStatus: input.approvalStatus ?? "Unreviewed",
    assignedTo: input.assignedTo ?? "Studio Team",
    version: 1,
    approvedVersion: input.approvalStatus === "Approved" ? 1 : undefined,
    createdAt: now,
    updatedAt: now,
    referenceViewport: "1920x1080",
    supportedViewports,
    layoutSpec: layout(input.displayName, input.layoutMode),
    componentSpecs: input.componentSpecs ?? [],
    assetRequirements: input.assetRequirements ?? [],
    dataRequirements: input.dataRequirements ?? [],
    interactionSpecs: input.interactionSpecs ?? [],
    stateSpecs: input.stateSpecs ?? states(["Default", "Loading", "Error"]),
    responsiveRules: responsiveRules(input.responsiveStatus),
    animationSpecs: ["Use shared duration/easing tokens.", "Document any screen-level override in review notes.", "Reduced motion must remove large parallax or zoom effects."],
    accessibilityRequirements: ["Keyboard navigation order documented.", "Visible focus state required.", "Color contrast reviewed.", "Controller equivalents documented where applicable."],
    notes: input.notes ?? ["Starter record created by Screen Designer v1.0."],
    implementationTargets: implementationTargets(input.web ?? "Not Started", input.roblox ?? "Not Started"),
    parityStatus: {
      vite: input.web === "Implemented" ? "Needs Parity Review" : input.web === "In Progress" ? "Behind Design" : "Not Started",
      roblox: input.roblox === "Implemented" ? "Needs Parity Review" : input.roblox === "In Progress" ? "Behind Design" : "Not Started"
    },
    reviewHistory: input.approvalStatus === "Approved" ? [{
      id: `review-${input.screenId}-initial`,
      reviewer: "Studio Lead",
      status: "Approved",
      comments: "Initial implemented screen captured as approved baseline for parity review.",
      requiredChanges: [],
      date: now,
      approvedVersion: 1,
      implementationTarget: "Vite Web"
    }] : [],
    references: [],
    checklist: checklist(input.checklist ?? {})
  };
}

const researchComponents: ScreenComponentSpec[] = [
  ["research-header", "ResearchHeader", "Screen title, era status, and research currency summary."],
  ["era-selector", "ResearchEraSelector", "Era filter that preserves canonical era IDs."],
  ["category-tabs", "ResearchCategoryTabs", "Research category navigation."],
  ["research-tree", "ResearchTreeCanvas", "Scrollable/pannable dependency graph surface."],
  ["search-filter", "ResearchSearchFilter", "Search and filter controls."],
  ["research-node", "ResearchNode", "Individual research record with cost, state, and icon."],
  ["dependency-connectors", "DependencyConnector", "Dependency lines between research nodes."],
  ["detail-panel", "ResearchDetailPanel", "Selected research summary and unlock details."],
  ["unlock-requirements", "UnlockRequirementList", "Required prerequisites and feature unlocks."],
  ["cost-panel", "CostDisplay", "Research cost and affordability."],
  ["art-preview", "ResearchArtPreview", "Icon/card art preview and missing-art state."],
  ["empty-state", "ResearchEmptyState", "No results and no data state."],
  ["locked-state", "ResearchLockedState", "Locked research treatment."],
  ["loading-state", "ResearchLoadingState", "Skeleton/loading treatment."]
].map(([id, displayName, purpose]) => ({
  id,
  componentLibraryId: ({
    "research-header": "BeveledGamePanel",
    "era-selector": "EraProgressRail",
    "category-tabs": "NavigationItem",
    "research-tree": "BeveledGamePanel",
    "search-filter": "UtilityIconButton",
    "research-node": "ResearchCard",
    "dependency-connectors": "EraProgressRail",
    "detail-panel": "UpgradePanel",
    "unlock-requirements": "UnlockRequirementList",
    "cost-panel": "CostDisplay",
    "art-preview": "ArtRequirementCard",
    "empty-state": "EmptyState",
    "locked-state": "LockedState",
    "loading-state": "LoadingSkeleton"
  } as Record<string, string>)[id],
  variant: id === "research-node" ? "default" : id === "detail-panel" ? "standard" : "default",
  state: "Default",
  layoutOverride: "Screen-specific placement is defined by the Research layout spec.",
  assetOverride: "",
  dataBindings: ["research", "unlock_matrix", "player research progress"],
  screenSpecificNotes: "Use the shared Component Library record for anatomy, states, tokens, and interaction baseline.",
  displayName,
  purpose,
  dimensions: id === "research-tree" ? "Fills primary workspace; min 960x640 at 1920 reference." : "Responsive to parent panel.",
  positioning: id === "detail-panel" ? "Right context panel, drawer on compact layouts." : "Grid slot in research workspace.",
  typography: "Use shared heading/body/metadata tokens.",
  colors: "Use shared dark HUD palette with rarity/status accents.",
  assetKeys: id === "research-node" || id === "art-preview" ? ["research icons", "era node frames"] : [],
  dataInputs: ["research", "unlock_matrix", "eras", "resources", "player research progress"],
  states: ["Default", "Hover", "Locked", "Affordable", "Unaffordable", "Completed", "Selected", "Loading", "Error"],
  interactions: ["Click/tap select", "Keyboard focus", "Controller navigation", "Tooltip", "Filter/search"],
  responsiveBehavior: "Collapse supporting panels into drawers below 1440px; keep node labels readable.",
  implementationNotes: "Do not invent player research state; use fixture or service-state classification until the game client supplies progress."
}));

const initialScreenDesignRecords: ScreenDesignRecord[] = [
  baseRecord({
    screenId: "dashboard",
    displayName: "Dashboard",
    description: "Primary game command screen and progression hub.",
    status: "Implemented",
    approvalStatus: "Approved",
    assignedTo: "Studio Lead",
    web: "Implemented",
    roblox: "Needs Parity Review",
    layoutMode: "hud_overlay",
    checklist: {
      layoutDefined: true,
      componentsDefined: true,
      canonicalDataMapped: true,
      playerStateMapped: true,
      missingSystemsIdentified: true,
      assetRequirementsCreated: true,
      allStatesDesigned: true,
      interactionsDocumented: true,
      responsiveRulesDefined: true,
      motionDefined: true,
      accessibilityReviewed: true,
      referencesAttached: true,
      reviewComplete: true,
      approved: true
    },
    dataRequirements: [
      data("dashboard-runtime", "Runtime era/economy/upgrade definitions", "Canonical Studio Definition", "game-runtime-data", "Mapped"),
      data("dashboard-player-progress", "Player progression and era completion", "Player Runtime State", "game client", "Partial")
    ],
    assetRequirements: [
      asset("dashboard-hero", "Dashboard hero artwork", "dashboard_hero", "background", "Needs Approval"),
      asset("dashboard-era-icons", "Era progression icons", "era_navigation_icons", "icon", "Needs Web Mapping")
    ],
    componentSpecs: [
      {
        id: "dashboard-hero",
        componentLibraryId: "HeroPanel",
        variant: "default",
        state: "Default",
        layoutOverride: "Hero artwork remains dominant; compact progression occupies bottom 15-20%.",
        assetOverride: "dashboard_hero",
        dataBindings: ["eras", "clientProfiles.default.eraNavigation", "player era progress"],
        screenSpecificNotes: "Dashboard-specific usage of the shared HeroPanel with compact EraNode children.",
        displayName: "DashboardHero",
        purpose: "Dominant first-screen hero artwork with compact era progression HUD.",
        dimensions: "Full hero stage with progression occupying bottom 15-20%.",
        positioning: "Top command surface.",
        typography: "Minimal HUD labels only.",
        colors: "Shared dark HUD palette with era accent glow.",
        assetKeys: ["dashboard_hero", "era_navigation_icons"],
        dataInputs: ["eras", "clientProfiles.default.eraNavigation", "player era progress"],
        states: ["Default", "Hover", "Locked", "Active", "Completed", "Loading", "Error"],
        interactions: ["Open full timeline", "Hover/click current era node"],
        responsiveBehavior: "Preserve hero dominance; collapse secondary nodes as viewport narrows.",
        implementationNotes: "Hero remains the visual anchor; progression is a compact overlay, not a carousel."
      }
    ],
    interactionSpecs: [
      interaction("open-full-timeline", "Click View Full Timeline", "Civilization timeline opens", "Navigate to full era timeline."),
      interaction("current-era-info", "Hover/click current era node", "Temporary info panel expands", "Read current era progress and next unlock.")
    ],
    stateSpecs: states(requiredStates),
    responsiveStatus: "Ready",
    notes: ["Existing dashboard is implemented but needs formal Vite/Roblox parity review against the compact hero HUD direction."]
  }),
  baseRecord({
    screenId: "production",
    displayName: "Production",
    description: "Production chain, output, and work management screen.",
    status: "Not Started",
    dataRequirements: [data("production-chains", "Production chain definitions", "Canonical Studio Definition", "building_chains", "Mapped"), data("production-player-state", "Owned buildings and production rates", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("production-icons", "Production icons", "production_icons", "icon", "Missing")]
  }),
  baseRecord({
    screenId: "research",
    displayName: "Research",
    description: "Research tree and unlock matrix screen design starter specification.",
    status: "Draft",
    assignedTo: "UX Design",
    web: "Not Started",
    roblox: "Not Started",
    componentSpecs: researchComponents,
    dataRequirements: [
      data("research-definitions", "Research definitions", "Canonical Studio Definition", "research", "Mapped"),
      data("research-dependencies", "Research dependencies", "Canonical Studio Definition", "research.dependencies", "Mapped"),
      data("unlock-rules", "Unlock rules", "Canonical Studio Definition", "unlock_matrix", "Mapped"),
      data("research-costs", "Costs and resource references", "Canonical Studio Definition", "research.costs", "Partial", "Cost economy schema exists in runtime, but per-node display treatment needs confirmation."),
      data("era-relationships", "Era relationships", "Canonical Studio Definition", "eras", "Mapped"),
      data("research-art", "Research artwork", "Canonical Studio Definition", "asset registry", "Partial"),
      data("player-research-progress", "Completed/unlocked/affordable research", "Player Runtime State", "game client", "Missing", "Must come from player save/service, not Studio definitions.")
    ],
    assetRequirements: [
      asset("research-node-frame", "Research node frame states", "research_node_frame", "button_state", "Missing"),
      asset("research-category-icons", "Research category icons", "research_category_icons", "icon", "Needs Approval"),
      asset("research-empty-art", "Research empty-state art", "research_empty_state", "background", "Missing")
    ],
    interactionSpecs: [
      interaction("select-node", "Click/tap a research node", "Selected research detail panel opens", "Read selected canonical research definition and player progress."),
      interaction("filter-era", "Change era selector", "Tree filters to selected era", "Filter canonical research definitions by era ID."),
      interaction("start-research", "Start research action", "Pending/active research state", "Player runtime action; not owned by Studio."),
      interaction("keyboard-tree", "Arrow-key navigation in research tree", "Focus moves between reachable nodes", "No data mutation.")
    ],
    stateSpecs: states(["Default", "Hover", "Pressed", "Selected", "Locked", "Disabled", "Affordable", "Unaffordable", "Empty", "Loading", "Error", "Missing Data", "Completed", "Preview", "Reduced Motion"]),
    checklist: {
      layoutDefined: true,
      componentsDefined: true,
      canonicalDataMapped: true,
      playerStateMapped: false,
      missingSystemsIdentified: true,
      assetRequirementsCreated: true,
      allStatesDesigned: false,
      interactionsDocumented: true,
      responsiveRulesDefined: true,
      motionDefined: true,
      accessibilityReviewed: false,
      referencesAttached: false
    },
    notes: ["Starter spec only. Do not implement the Vite or Roblox Research screen in this task.", "Player research progress is intentionally classified as Player Runtime State."]
  }),
  baseRecord({
    screenId: "buildings",
    displayName: "Buildings",
    description: "Building catalogue, construction, upgrade, and production detail screen.",
    status: "Not Started",
    dataRequirements: [data("building-definitions", "Building definitions", "Canonical Studio Definition", "buildings", "Mapped"), data("building-player-state", "Owned buildings/workers", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("building-card-art", "Building card art", "building_cards", "background", "Needs Approval")]
  }),
  baseRecord({
    screenId: "resources",
    displayName: "Resources",
    description: "Resource inventory, sources, usage, and storage screen.",
    status: "In Design",
    web: "In Progress",
    dataRequirements: [data("resource-catalog", "Resource catalog", "Canonical Studio Definition", "resource_catalog", "Mapped"), data("resource-inventory", "Current inventory", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("resource-icons", "Resource icons", "resource_icons", "icon", "Needs Web Mapping")]
  }),
  baseRecord({
    screenId: "upgrades",
    displayName: "Upgrades",
    description: "Upgrade tab and upgrade chain screen.",
    status: "Not Started",
    dataRequirements: [data("upgrade-definitions", "Upgrade definitions", "Canonical Studio Definition", "upgrades", "Mapped"), data("upgrade-player-state", "Purchased upgrade state", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("upgrade-icons", "Upgrade icons", "upgrade_icons", "icon", "Needs Approval")]
  }),
  baseRecord({
    screenId: "civilization",
    displayName: "Civilization",
    description: "Era progression, civilization identity, alignment, and mastery screen.",
    status: "In Design",
    web: "In Progress",
    dataRequirements: [data("eras", "Era definitions", "Canonical Studio Definition", "eras", "Mapped"), data("alignment-definitions", "Alignment definitions", "Canonical Studio Definition", "alignment_definitions", "Mapped")],
    assetRequirements: [asset("era-hero-art", "Era hero artwork", "era_hero_art", "background", "Needs Approval")]
  }),
  baseRecord({
    screenId: "events",
    displayName: "Events",
    description: "Timed event, milestone, and timeline event screen.",
    status: "Not Started",
    dataRequirements: [data("timeline-events", "Timeline event schema", "Canonical Studio Definition", "timeline_events", "Partial"), data("event-content", "Production event definitions", "Missing Definition", "future event table", "Missing")],
    assetRequirements: [asset("event-art", "Event art", "event_art", "background", "Missing")]
  }),
  baseRecord({
    screenId: "galaxy",
    displayName: "Galaxy",
    description: "Galaxy map and exploration screen.",
    status: "In Design",
    web: "In Progress",
    dataRequirements: [data("galaxies", "Galaxy definitions", "Canonical Studio Definition", "galaxies", "Mapped"), data("discovery-state", "Discovery state", "Player Runtime State", "game client", "Partial")],
    assetRequirements: [asset("galaxy-map-art", "Galaxy map art", "galaxy_map_art", "background", "Needs Approval")]
  }),
  baseRecord({
    screenId: "spaceport",
    displayName: "Spaceport",
    description: "Launch, ship, travel, and mission access screen.",
    status: "Not Started",
    dataRequirements: [data("ship-definitions", "Ship/travel definitions", "Missing Definition", "future travel table", "Missing"), data("missions", "Mission definitions", "Canonical Studio Definition", "missions", "Partial")],
    assetRequirements: [asset("spaceport-hero", "Spaceport hero", "spaceport_hero", "background", "Missing")]
  }),
  baseRecord({
    screenId: "earth",
    displayName: "Earth",
    description: "Home planet and early civilization screen.",
    status: "Not Started",
    dataRequirements: [data("earth-planet", "Earth planet definition", "Canonical Studio Definition", "planets", "Partial"), data("earth-player-state", "Earth settlement state", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("earth-background", "Earth background", "earth_background", "background", "Missing")]
  }),
  baseRecord({
    screenId: "solar-system",
    displayName: "Solar System",
    description: "Sol system map with planets, moons, and bodies.",
    status: "In Design",
    web: "In Progress",
    dataRequirements: [data("solar-system", "Sol system records", "Canonical Studio Definition", "star_systems + celestial_bodies", "Mapped"), data("scan-state", "Scan/discovery state", "Player Runtime State", "game client", "Partial")],
    assetRequirements: [asset("sol-body-art", "Sol celestial body art", "sol_body_art", "background", "Needs Approval")]
  }),
  baseRecord({
    screenId: "discovery",
    displayName: "Discovery",
    description: "Discovery journal, exploration findings, and timeline review screen.",
    status: "In Design",
    web: "In Progress",
    dataRequirements: [data("discovery-journal", "Discovery journal schema", "Canonical Studio Definition", "discovery_journal", "Mapped"), data("player-discoveries", "Player discovery entries", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("discovery-icons", "Discovery type icons", "discovery_icons", "icon", "Needs Approval")]
  }),
  baseRecord({
    screenId: "settings",
    displayName: "Settings",
    description: "Client preferences, accessibility, account, and audio/video options.",
    status: "Not Started",
    dataRequirements: [data("settings-schema", "Client settings schema", "Service/Backend State", "game client", "Missing"), data("accessibility-options", "Accessibility options", "Presentation Hint", "design tokens", "Partial")],
    assetRequirements: [asset("settings-icons", "Settings icons", "settings_icons", "icon", "Needs Approval")]
  })
];

type ScreenDesignerStore = {
  records: ScreenDesignRecord[];
  updatedAt: string;
};

async function readStore(): Promise<ScreenDesignerStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ScreenDesignerStore>;
    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return { records: [], updatedAt: new Date().toISOString() };
  }
}

async function writeStore(store: ScreenDesignerStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function mergeRecords(stored: ScreenDesignRecord[]) {
  const byScreen = new Map(initialScreenDesignRecords.map((record) => [record.screenId, record]));
  for (const record of stored) {
    if (record?.screenId) byScreen.set(record.screenId, normalizeRecord(record));
  }
  return [...byScreen.values()].sort((left, right) => screenOrder(left.screenId) - screenOrder(right.screenId));
}

function screenOrder(screenId: string) {
  const order = ["dashboard", "production", "research", "buildings", "resources", "upgrades", "civilization", "events", "galaxy", "spaceport", "earth", "solar-system", "discovery", "settings"];
  const index = order.indexOf(screenId);
  return index === -1 ? order.length : index;
}

function normalizeRecord(record: ScreenDesignRecord): ScreenDesignRecord {
  return {
    ...record,
    supportedViewports: record.supportedViewports?.length ? record.supportedViewports : supportedViewports,
    componentSpecs: record.componentSpecs ?? [],
    assetRequirements: record.assetRequirements ?? [],
    dataRequirements: record.dataRequirements ?? [],
    interactionSpecs: record.interactionSpecs ?? [],
    stateSpecs: record.stateSpecs?.length ? record.stateSpecs : states(["Default", "Loading", "Error"]),
    responsiveRules: record.responsiveRules?.length ? record.responsiveRules : responsiveRules(),
    animationSpecs: record.animationSpecs ?? [],
    accessibilityRequirements: record.accessibilityRequirements ?? [],
    notes: record.notes ?? [],
    implementationTargets: record.implementationTargets ?? implementationTargets("Not Started"),
    parityStatus: record.parityStatus ?? { vite: "Not Started", roblox: "Not Started" },
    reviewHistory: record.reviewHistory ?? [],
    references: record.references ?? [],
    checklist: checklist(record.checklist ?? {})
  };
}

function checklistScore(record: ScreenDesignRecord) {
  const values = Object.values(record.checklist);
  return { complete: values.filter(Boolean).length, total: values.length };
}

function assetByKey(assets: ProductionAsset[]) {
  const map = new Map<string, ProductionAsset>();
  for (const asset of assets) {
    for (const key of [asset.id, asset.artKey, asset.iconKey].filter(Boolean)) {
      map.set(String(key), asset);
    }
  }
  return map;
}

function enrichAssetRequirements(record: ScreenDesignRecord, assetState?: AssetProductionState): ScreenDesignRecord {
  if (!assetState) return record;
  const assets = assetByKey(assetState.assets);
  return {
    ...record,
    assetRequirements: record.assetRequirements.map((requirement) => {
      const key = requirement.artKey ?? requirement.iconKey ?? requirement.id;
      const match = assets.get(key) ?? [...assets.values()].find((item) => item.artKey?.includes(key) || item.iconKey?.includes(key) || item.id.includes(key));
      if (!match) return requirement;
      const hasWeb = Boolean(match.platformMappings.web);
      const hasRoblox = Boolean(match.platformMappings.roblox);
      const status: ScreenAssetRequirement["status"] = match.approvalStatus !== "approved"
        ? "Needs Approval"
        : !hasWeb
          ? "Needs Web Mapping"
          : !hasRoblox
            ? "Needs Roblox Mapping"
            : "Ready";
      return { ...requirement, linkedAssetId: match.id, status };
    })
  };
}

export async function getScreenDesignerState(assetState?: AssetProductionState): Promise<ScreenDesignerState> {
  const store = await readStore();
  const records = mergeRecords(store.records).map((record) => enrichAssetRequirements(record, assetState));
  const screens = records.map(toSummary);
  return {
    screens,
    records,
    stats: buildStats(screens),
    generatedAt: new Date().toISOString()
  };
}

export async function getScreenDesignRecord(screenId: string, assetState?: AssetProductionState): Promise<ScreenDesignRecord | null> {
  const state = await getScreenDesignerState(assetState);
  return state.records.find((record) => record.screenId === screenId) ?? null;
}

function toSummary(record: ScreenDesignRecord): ScreenDesignSummary {
  const score = checklistScore(record);
  return {
    id: record.id,
    screenId: record.screenId,
    displayName: record.displayName,
    description: record.description,
    status: record.status,
    approvalStatus: record.approvalStatus,
    assignedTo: record.assignedTo,
    version: record.version,
    updatedAt: record.updatedAt,
    referenceViewport: record.referenceViewport,
    supportedViewports: record.supportedViewports,
    implementationTargets: record.implementationTargets,
    parityStatus: record.parityStatus,
    missingAssets: record.assetRequirements.filter((item) => item.required && item.status !== "Ready").length,
    unresolvedDataRequirements: record.dataRequirements.filter((item) => item.required && item.status !== "Mapped").length,
    responsivePreviewReady: record.responsiveRules.length > 0 && record.responsiveRules.every((rule) => rule.status !== "Missing"),
    checklistComplete: score.complete,
    checklistTotal: score.total
  };
}

function buildStats(screens: ScreenDesignSummary[]): ScreenDesignerState["stats"] {
  return {
    total: screens.length,
    notStarted: screens.filter((screen) => screen.status === "Not Started").length,
    inDesign: screens.filter((screen) => ["Draft", "In Design", "Needs Revision"].includes(screen.status)).length,
    readyForReview: screens.filter((screen) => screen.status === "Ready for Review").length,
    approved: screens.filter((screen) => screen.approvalStatus === "Approved").length,
    implemented: screens.filter((screen) => screen.status === "Implemented").length,
    blockedByMissingAssets: screens.filter((screen) => screen.missingAssets > 0).length,
    blockedByMissingData: screens.filter((screen) => screen.unresolvedDataRequirements > 0).length,
    blockedByMissingInteractionSpecs: screens.filter((screen) => screen.checklistComplete < screen.checklistTotal).length
  };
}

export function validateScreenDesign(record: ScreenDesignRecord) {
  const issues: string[] = [];
  const score = checklistScore(record);
  if (record.approvalStatus === "Approved" && score.complete < score.total) {
    issues.push("Approved screens must have every checklist item complete.");
  }
  if (!record.layoutSpec) issues.push("Layout specification is missing.");
  if (!record.componentSpecs.length) issues.push("Component specifications are missing.");
  if (!record.dataRequirements.some((item) => item.classification === "Canonical Studio Definition")) issues.push("At least one canonical Studio data requirement must be mapped.");
  if (record.dataRequirements.some((item) => item.required && item.status === "Missing" && item.classification !== "Missing Definition")) issues.push("Required mapped data contains missing entries.");
  if (!record.interactionSpecs.length && record.status !== "Not Started") issues.push("Interaction specifications are missing.");
  if (!record.responsiveRules.length) issues.push("Responsive rules are missing.");
  if (record.stateSpecs.filter((state) => state.required && !state.designed).length && record.status === "Approved") issues.push("Approved screens cannot omit required states.");
  return { valid: issues.length === 0, issues, checklist: score };
}

export function screenHandoffText(record: ScreenDesignRecord, target: "Game Codex" | "Roblox Codex" = "Game Codex") {
  const blockers = [
    ...record.assetRequirements.filter((item) => item.required && item.status !== "Ready").map((item) => `Asset: ${item.label} (${item.status})`),
    ...record.dataRequirements.filter((item) => item.required && item.status !== "Mapped").map((item) => `Data: ${item.label} (${item.classification}, ${item.status})`),
    ...record.stateSpecs.filter((item) => item.required && !item.designed).map((item) => `State: ${item.label} not designed`)
  ];
  return [
    `PROJECT GENESIS SCREEN IMPLEMENTATION HANDOFF — ${record.displayName}`,
    "",
    `Target: ${target}`,
    `Canonical screen ID: ${record.screenId}`,
    `Design version: ${record.version}`,
    `Status: ${record.status}`,
    `Approval: ${record.approvalStatus}`,
    `Reference viewport: ${record.referenceViewport}`,
    `Supported viewports: ${record.supportedViewports.join(", ")}`,
    "",
    "Layout:",
    `- ${record.layoutSpec.designWidth}x${record.layoutSpec.designHeight}`,
    `- Mode: ${record.layoutSpec.layoutMode}`,
    `- Coordinate system: ${record.layoutSpec.coordinateSystem}`,
    `- Safe areas: ${record.layoutSpec.safeAreas.join("; ")}`,
    "",
    "Components:",
    ...record.componentSpecs.map((component) => `- ${component.id}: ${component.displayName} — ${component.purpose}`),
    "",
    "Canonical data requirements:",
    ...record.dataRequirements.map((item) => `- ${item.id}: ${item.label} [${item.classification}] via ${item.source} (${item.status})`),
    "",
    "Asset keys:",
    ...record.assetRequirements.map((item) => `- ${item.id}: ${item.artKey ?? item.iconKey ?? "no-key"} (${item.status})`),
    "",
    "States:",
    ...record.stateSpecs.map((item) => `- ${item.label}: ${item.designed ? "designed" : "missing"}`),
    "",
    "Interactions:",
    ...record.interactionSpecs.map((item) => `- ${item.trigger} -> ${item.resultingState}; data action: ${item.dataAction}`),
    "",
    "Responsive rules:",
    ...record.responsiveRules.map((item) => `- ${item.viewport}: ${item.behavior} (${item.status})`),
    "",
    "Accessibility:",
    ...record.accessibilityRequirements.map((item) => `- ${item}`),
    "",
    "Unresolved blockers:",
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "Implementation checklist:",
    ...Object.entries(record.checklist).map(([key, done]) => `- ${done ? "[x]" : "[ ]"} ${key}`)
  ].join("\n");
}

export async function updateScreenDesignWorkflow(input: { screenId: string; action: "ready_for_review" | "request_changes" | "approve"; reviewer?: string; comments?: string }) {
  const store = await readStore();
  const records = mergeRecords(store.records);
  const index = records.findIndex((record) => record.screenId === input.screenId);
  if (index === -1) throw new Error(`Screen design not found: ${input.screenId}`);
  const current = records[index];
  const now = new Date().toISOString();
  const reviewer = input.reviewer?.trim() || "Studio Reviewer";
  const comments = input.comments?.trim() || "";
  let next: ScreenDesignRecord = { ...current, updatedAt: now };

  if (input.action === "ready_for_review") {
    next = { ...next, status: "Ready for Review", approvalStatus: "Unreviewed" };
  }

  if (input.action === "request_changes") {
    next = {
      ...next,
      status: "Needs Revision",
      approvalStatus: "Changes Requested",
      version: next.version + 1,
      reviewHistory: [
        { id: `review-${next.screenId}-${Date.now()}`, reviewer, status: "Changes Requested", comments: comments || "Changes requested.", requiredChanges: ["Address incomplete checklist and unresolved blockers."], date: now },
        ...next.reviewHistory
      ]
    };
  }

  if (input.action === "approve") {
    const approvalChecklist = { ...next.checklist, reviewComplete: true, approved: true };
    const validation = validateScreenDesign({ ...next, status: "Approved", approvalStatus: "Approved", checklist: approvalChecklist });
    if (!validation.valid) {
      throw new Error(`Cannot approve screen design: ${validation.issues.join(" ")}`);
    }
    next = {
      ...next,
      status: "Approved",
      approvalStatus: "Approved",
      approvedVersion: next.version,
      checklist: approvalChecklist,
      reviewHistory: [
        { id: `review-${next.screenId}-${Date.now()}`, reviewer, status: "Approved", comments: comments || "Design approved.", requiredChanges: [], date: now, approvedVersion: next.version, implementationTarget: "Vite Web" },
        ...next.reviewHistory
      ]
    };
    next.frozenApprovedVersion = { ...next, frozenApprovedVersion: undefined };
  }

  records[index] = next;
  await writeStore({ records, updatedAt: now });
  return next;
}

export const screenDesignerInitialRecords = initialScreenDesignRecords;

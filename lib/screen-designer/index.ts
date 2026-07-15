import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { appShellBounds, appShellDisplayName, appShellId, appShellLayerTree, appShellVersion, blankInnerWorkspaceTemplate, createShellBinding, derivedShellProfiles, mainWorkspaceSlotId, navigationMetadataForScreen, topHudChildren, visualBuilderModes, type AppShellBuilderMode, type AppShellScreenType, type ScreenNavigationMetadata, type ScreenShellBinding } from "@/lib/app-shell";
import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";
import { findAssetForPreviewKeys, resolveScreenPreview, type VisualPreview } from "@/lib/assets/visual-previews";
import { categoryPresentationFor, upgradePanelSharedFallbackArtKey } from "@/lib/upgrades/category-presentation";

export type ScreenDesignStatus = "Not Started" | "Draft" | "In Design" | "Ready for Review" | "Approved" | "Implemented" | "Needs Revision";
export type ScreenApprovalStatus = "Unreviewed" | "Changes Requested" | "Approved";
export type ScreenImplementationTarget = "Vite Web" | "Roblox" | "Unity" | "Unreal" | "Godot" | "iOS" | "Android";
export type ScreenImplementationStatus = "Not Started" | "In Progress" | "Implemented" | "Needs Parity Review" | "Approved";
export type ScreenParityStatus = "Not Started" | "Behind Design" | "Needs Parity Review" | "In Parity" | "Blocked";
export type ScreenDataClassification = "Canonical Studio Definition" | "Player Runtime State" | "Service/Backend State" | "Presentation Hint" | "Prototype Fixture" | "Missing Definition";

export type ScreenLayoutSpec = {
  designWidth: number;
  designHeight: number;
  coordinateSystem: "absolute" | "responsive_grid" | "hud_overlay" | "hud_overlay_4k" | "modal_overlay";
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
  status: "Ready" | "Missing" | "Placeholder" | "Pending Upload" | "Needs Web Mapping" | "Needs Roblox Mapping" | "Needs Approval";
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
  viewModes?: Array<"Full Reference" | "Workspace Only" | "Shell Context" | "Full Composition Preview">;
  workspaceCrop?: { x: number; y: number; width: number; height: number };
  excludedFromRuntime?: boolean;
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

export type ScreenMobileReadiness = {
  mobileDesignStatus: "Not Started" | "Draft" | "In Design" | "Ready for Review" | "Approved";
  safeAreaReadiness: "Missing" | "Needs Review" | "Ready";
  touchReadiness: "Missing" | "Needs Review" | "Ready";
  mobileAssetReadiness: "Missing" | "Needs Review" | "Ready";
  iosImplementationStatus: ScreenImplementationStatus;
  androidImplementationStatus: ScreenImplementationStatus;
  viewportPreviews: Array<{ platform: "ios" | "android"; viewport: string; status: "Missing" | "Needs Review" | "Ready"; notes: string }>;
  notes: string[];
};

export type ScreenDesignRecord = {
  id: string;
  screenId: string;
  screenType: AppShellScreenType;
  shellBinding: ScreenShellBinding;
  navigationMetadata?: ScreenNavigationMetadata;
  previewModes: AppShellBuilderMode[];
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
  mobileReadiness: ScreenMobileReadiness;
  frozenApprovedVersion?: ScreenDesignRecord;
};

export type ScreenDesignSummary = Pick<ScreenDesignRecord, "id" | "screenId" | "displayName" | "description" | "status" | "approvalStatus" | "assignedTo" | "version" | "updatedAt" | "referenceViewport" | "supportedViewports" | "implementationTargets" | "parityStatus"> & {
  missingAssets: number;
  unresolvedDataRequirements: number;
  responsivePreviewReady: boolean;
  checklistComplete: number;
  checklistTotal: number;
  visualPreview: VisualPreview;
  parityScore: number;
  mobileReadiness: ScreenMobileReadiness;
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
    mobileReadyScreens: number;
    safeAreaBlockers: number;
    touchBlockers: number;
    mobileAssetBlockers: number;
    iosBlockers: number;
    androidBlockers: number;
    accountDeletionReadiness: number;
  };
  generatedAt: string;
};

const storePath = process.env.PROJECT_GENESIS_SCREEN_DESIGNER_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_SCREEN_DESIGNER_STORE)
  : path.join(process.cwd(), "data", "screen-designer.local.json");

const supportedViewports = ["1366x768", "1440x900", "1920x1080", "2560x1440", "3440x1440", "3840x2160", "compact/tablet", "ios-phone-landscape", "android-phone-landscape", "ios-tablet-landscape", "android-tablet-landscape"];
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

const appShellLayoutSpec: ScreenLayoutSpec = {
  designWidth: appShellBounds.masterCanvas.width,
  designHeight: appShellBounds.masterCanvas.height,
  coordinateSystem: "hud_overlay_4k",
  layoutMode: "hud_overlay",
  panelBounds: [
    appShellBounds.globalBackground,
    appShellBounds.topHud,
    appShellBounds.leftNavigation,
    appShellBounds.mainWorkspaceSlot,
    appShellBounds.globalOverlayRoot,
    appShellBounds.globalModalRoot,
    appShellBounds.notificationLayer,
    appShellBounds.debugCalibrationLayer
  ],
  columns: "4K shell: fixed top HUD, fixed left navigation rail, and one Main Workspace Slot for route content.",
  rows: "Top Civilization HUD remains mounted. Route selections replace only the Main Workspace Slot.",
  spacing: "4K absolute shell coordinates. Workspace-local screens use Main Workspace Slot top-left as origin.",
  alignment: "Global HUD and navigation are shell-owned; route screens cannot move them.",
  safeAreas: ["Top HUD bounds", "Left Navigation Rail bounds", "Main Workspace Slot safe bounds", "Global modal safe bounds"],
  overflowBehavior: "Shell roots remain mounted. Workspaces handle internal scrolling, panning, or local drawers.",
  backgroundLayers: ["Global Background"],
  overlayLayers: ["Global Overlay Root", "Global Modal Root", "Notification Layer", "Debug/Calibration Layer"]
};

function workspaceLayout(label: string): ScreenLayoutSpec {
  const slot = appShellBounds.mainWorkspaceSlot;
  return {
    designWidth: slot.width,
    designHeight: slot.height,
    coordinateSystem: "hud_overlay_4k",
    layoutMode: "hud_overlay",
    panelBounds: [
      { id: "workspace-root", label: `${label} workspace root`, x: 0, y: 0, width: slot.width, height: slot.height, zIndex: 0 },
      { id: "workspace-background", label: "Workspace background placeholder", x: 0, y: 0, width: slot.width, height: slot.height, zIndex: 0 },
      { id: "local-content-root", label: "Local content root", x: 0, y: 0, width: slot.width, height: slot.height, zIndex: 10 },
      { id: "local-overlay-root", label: "Local overlay root", x: 0, y: 0, width: slot.width, height: slot.height, zIndex: 800 },
      { id: "local-modal-drawer-root", label: "Optional local modal/drawer root", x: 0, y: 0, width: slot.width, height: slot.height, zIndex: 850 }
    ],
    columns: "Workspace-local coordinate system inside Main Workspace Slot.",
    rows: "Local screen content only; persistent HUD and navigation are inherited from the shell.",
    spacing: "Use workspace-local spacing and component tokens. Do not reserve duplicate global HUD geometry.",
    alignment: "Local content aligns to the workspace slot, not the browser viewport.",
    safeAreas: ["Main Workspace Slot", "local overlay root", "local modal/drawer root"],
    overflowBehavior: "Workspace content scrolls, pans, or drawers locally without remounting the global shell.",
    backgroundLayers: ["workspace-background"],
    overlayLayers: ["local-overlay-root", "local-modal-drawer-root"]
  };
}

function implementationTargets(web: ScreenImplementationStatus, roblox: ScreenImplementationStatus = "Not Started") {
  return [
    { target: "Vite Web" as const, status: web, notes: "Tracked against the prototype web client." },
    { target: "Roblox" as const, status: roblox, notes: "Tracked against Roblox UI parity." },
    { target: "Unity" as const, status: "Not Started" as const, notes: "Future export consumer." },
    { target: "Unreal" as const, status: "Not Started" as const, notes: "Future export consumer." },
    { target: "Godot" as const, status: "Not Started" as const, notes: "Future export consumer." },
    { target: "iOS" as const, status: "Not Started" as const, notes: "Future Capacitor shell around Vite build; Studio tracks presentation readiness only." },
    { target: "Android" as const, status: "Not Started" as const, notes: "Future Capacitor shell around Vite build; Studio tracks presentation readiness only." }
  ];
}

function ensureImplementationTargets(targets: ScreenDesignRecord["implementationTargets"] | undefined) {
  const existing = targets?.length ? targets : implementationTargets("Not Started");
  const byTarget = new Map(existing.map((target) => [target.target, target]));
  for (const target of implementationTargets("Not Started")) {
    if (!byTarget.has(target.target)) byTarget.set(target.target, target);
  }
  return [...byTarget.values()];
}

function mobileReadiness(screenId: string, overrides: Partial<ScreenMobileReadiness> = {}): ScreenMobileReadiness {
  const accountScreens = new Set(["welcome", "login", "signup", "account", "cloud-saves", "save-conflict", "settings"]);
  const isAccountScreen = accountScreens.has(screenId);
  return {
    mobileDesignStatus: isAccountScreen ? "Draft" : "Not Started",
    safeAreaReadiness: "Needs Review",
    touchReadiness: "Needs Review",
    mobileAssetReadiness: "Missing",
    iosImplementationStatus: "Not Started",
    androidImplementationStatus: "Not Started",
    viewportPreviews: [
      { platform: "ios", viewport: "ios-phone-landscape", status: "Missing", notes: "Needs safe-area screenshot/specimen." },
      { platform: "android", viewport: "android-phone-landscape", status: "Missing", notes: "Needs display-cutout screenshot/specimen." },
      { platform: "ios", viewport: "ios-tablet-landscape", status: "Missing", notes: "Needs tablet landscape preview." },
      { platform: "android", viewport: "android-tablet-landscape", status: "Missing", notes: "Needs tablet landscape preview." }
    ],
    notes: [
      "Mobile gameplay screens are landscape-first.",
      "Portrait is reserved for explicitly approved account, login, or legal screens later.",
      "No private design source paths are stored in this record."
    ],
    ...overrides
  };
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

function designedStates(labels: string[], required = true): ScreenStateSpec[] {
  return labels.map((label) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    required,
    designed: true,
    notes: "Historical layout reference is preserved in the Screen Specification archive."
  }));
}

function baseRecord(input: {
  screenId: string;
  displayName: string;
  description: string;
  status: ScreenDesignStatus;
  screenType?: AppShellScreenType;
  shellBinding?: Partial<ScreenShellBinding>;
  navigationMetadata?: ScreenNavigationMetadata;
  previewModes?: AppShellBuilderMode[];
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
  mobileReadiness?: Partial<ScreenMobileReadiness>;
  notes?: string[];
}): ScreenDesignRecord {
  const now = "2026-07-13T00:00:00.000Z";
  const screenType = input.screenType ?? "workspace";
  return {
    id: `screen-design-${input.screenId}`,
    screenId: input.screenId,
    screenType,
    shellBinding: createShellBinding(input.screenId, input.shellBinding),
    navigationMetadata: input.navigationMetadata ?? navigationMetadataForScreen(input.screenId),
    previewModes: input.previewModes ?? (screenType === "full_screen_takeover" ? ["Full Composition Preview"] : visualBuilderModes),
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
    layoutSpec: screenType === "workspace" ? workspaceLayout(input.displayName) : layout(input.displayName, input.layoutMode),
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
    checklist: checklist(input.checklist ?? {}),
    mobileReadiness: mobileReadiness(input.screenId, input.mobileReadiness)
  };
}

const researchMasterLayout: ScreenLayoutSpec = {
  designWidth: 3244,
  designHeight: 1804,
  coordinateSystem: "hud_overlay_4k",
  layoutMode: "hud_overlay",
  panelBounds: [
    { id: "workspace-root", label: "Research Workspace / Main Workspace Slot local canvas", x: 0, y: 0, width: 3244, height: 1804, zIndex: 0 },
    { id: "reference", label: "Reference group", x: 0, y: 0, width: 3840, height: 2160, zIndex: 1 },
    { id: "research-master-reference", label: "Research Master Reference / locked 50% overlay", x: 0, y: 0, width: 3840, height: 2160, zIndex: 2 },
    { id: "workspace-background", label: "Research Workspace Background image placeholder", x: 0, y: 0, width: 3244, height: 1804, zIndex: 0 },
    { id: "local-content-root", label: "Research local content root", x: 0, y: 0, width: 3244, height: 1804, zIndex: 10 },
    { id: "research-header", label: "Research Header group", x: 0, y: 0, width: 900, height: 220, zIndex: 130 },
    { id: "research-branch-sidebar", label: "Research Branch Sidebar group", x: 0, y: 260, width: 600, height: 1308, zIndex: 130 },
    { id: "research-progress-summary", label: "Total Research summary", x: 40, y: 1448, width: 520, height: 96, zIndex: 140 },
    { id: "research-tree-workspace", label: "Research Tree Workspace group", x: 652, y: 260, width: 1716, height: 1308, zIndex: 130 },
    { id: "selected-branch-header", label: "Selected Branch Header", x: 700, y: 300, width: 1620, height: 220, zIndex: 140 },
    { id: "research-connection-layer", label: "Research connection layer", x: 700, y: 560, width: 1620, height: 860, zIndex: 141 },
    { id: "research-node-layout", label: "Research node placeholder grid", x: 752, y: 580, width: 1516, height: 780, zIndex: 150 },
    { id: "research-detail-panel", label: "Research Detail Panel group", x: 2420, y: 260, width: 824, height: 1308, zIndex: 130 },
    { id: "era-timeline", label: "Era Timeline group", x: 652, y: 1616, width: 2592, height: 188, zIndex: 130 },
    { id: "local-modal-drawer-root", label: "Local Modal/Drawer Root", x: 0, y: 0, width: 3244, height: 1804, zIndex: 900 },
    { id: "local-overlay-root", label: "Local Overlay Root", x: 0, y: 0, width: 3244, height: 1804, zIndex: 1000 }
  ],
  columns: "Workspace-local coordinates inside Main Workspace Slot: 600px branch sidebar, 52px internal gap, 1716px research tree, 52px gap, 824px detail panel.",
  rows: "Workspace content top 0px, primary workspace starts at 260px, bottom era timeline y1616 h188, local modal/overlay layers above.",
  spacing: "Authored in Main Workspace Slot-local 4K coordinates. Desktop_1080 composition uses the shell profile plus 0.5 scale. Default panel gutter is 40-52px; internal panel padding is 32-48px.",
  alignment: "Match the supplied reference within shell context: branch list left, tree canvas center, detail panel right, timeline bottom. Top HUD and navigation are shell-owned.",
  safeAreas: ["Main Workspace Slot x464 y260 w3244 h1804", "bottom timeline y1616 h188", "local modal/drawer root", "local overlay root"],
  overflowBehavior: "Global shell is fixed and persistent. Branch sidebar and detail panel scroll internally; research tree pans/zooms internally; no browser page scroll.",
  backgroundLayers: ["workspace-background", "research-master-reference locked at 50% opacity, builder-only, excluded from runtime export"],
  overlayLayers: ["local-modal-drawer-root", "local-overlay-root", "tooltips", "selection preview", "difference/overlay review controls"]
};

function researchComponent(input: {
  id: string;
  componentLibraryId: string;
  displayName: string;
  purpose: string;
  dimensions: string;
  positioning: string;
  assetKeys?: string[];
  dataInputs?: string[];
  states?: string[];
  interactions?: string[];
  notes?: string;
}): ScreenComponentSpec {
  const commonData = ["research", "unlock_matrix", "eras", "resources", "clientProfiles.default.primaryHudSlots", "player research progress"];
  const commonStates = ["Default", "Hover", "Focused", "Selected", "Locked", "Disabled", "Available", "Completed", "Researching", "Loading", "Error", "Mobile Compact", "Tablet"];
  return {
    id: input.id,
    componentLibraryId: input.componentLibraryId,
    variant: "master-placeholder",
    state: "Default",
    layoutOverride: "Historical 4K reference metadata is preserved. Client implementations own exact layout geometry.",
    assetOverride: "Pending Upload",
    dataBindings: input.dataInputs ?? commonData,
    screenSpecificNotes: input.notes ?? "Placeholder geometry only. Final art is replaceable without changing authored bounds, bindings, states, or interactions.",
    displayName: input.displayName,
    purpose: input.purpose,
    dimensions: input.dimensions,
    positioning: input.positioning,
    typography: "Editable text only; no baked labels. Use shared NOVERIS HUD heading, body, metadata, and value tokens.",
    colors: "Shared dark beveled HUD palette with cyan borders, green action emphasis, muted locked states, and canonical branch/status accents.",
    assetKeys: input.assetKeys ?? [],
    dataInputs: input.dataInputs ?? commonData,
    states: input.states ?? commonStates,
    interactions: input.interactions ?? ["Pointer/touch selection", "Keyboard focus", "Controller activation later", "Tooltip on hover/focus"],
    responsiveBehavior: "Desktop keeps the full composition. Tablet preserves tree as primary. Phone landscape collapses branch sidebar into a drawer and detail into modal/drawer.",
    implementationNotes: "Do not store player values or final research definitions in the screen record; consume canonical research graph and player runtime state."
  };
}

const researchComponents: ScreenComponentSpec[] = [
  researchComponent({
    id: "route-workspace-root",
    componentLibraryId: "RouteWorkspaceRoot",
    displayName: "Research Route Workspace Root",
    purpose: "Screen-local root mounted inside the App Shell Main Workspace Slot.",
    dimensions: "workspace x0 y0 w3244 h1804 / shell x464 y260 w3244 h1804.",
    positioning: "Mounted by NOVERIS App Shell in main-workspace-slot.",
    assetKeys: [],
    interactions: ["Show Workspace Only", "Preview in Shell Context", "Preview Full Composition"]
  }),
  researchComponent({
    id: "workspace-background",
    componentLibraryId: "WorkspaceBackground",
    displayName: "Research Workspace Background",
    purpose: "Workspace-local Research background placeholder.",
    dimensions: "x0 y0 w3244 h1804 / z0.",
    positioning: "Inside RouteWorkspaceRoot behind local Research content.",
    assetKeys: ["research_screen_background"],
    states: ["Placeholder", "Missing Art", "Ready"]
  }),
  researchComponent({
    id: "local-overlay-root",
    componentLibraryId: "LocalOverlayRoot",
    displayName: "Research Local Overlay Root",
    purpose: "Screen-local overlays, tooltips, selection previews, and review controls inside the workspace.",
    dimensions: "x0 y0 w3244 h1804 / z1000.",
    positioning: "Above Research content but below global shell overlays.",
    assetKeys: [],
    states: ["Default", "Tooltip", "Selection Preview", "Difference Overlay", "Hidden"]
  }),
  researchComponent({
    id: "research-header",
    componentLibraryId: "ResearchHeader",
    displayName: "Research Header",
    purpose: "Screen heading region with editable Research icon, title, and subtitle.",
    dimensions: "x464 y260 w900 h220.",
    positioning: "Above the branch sidebar and aligned to the main content start.",
    assetKeys: ["research_header_icon"],
    dataInputs: ["screen title copy", "screen subtitle copy"],
    notes: "Default editable text: RESEARCH / Unlock the future of your civilization."
  }),
  researchComponent({
    id: "research-branch-sidebar",
    componentLibraryId: "ResearchBranchSidebar",
    displayName: "Research Branches",
    purpose: "Scrollable branch/category list with progress rows and selected/locked state support.",
    dimensions: "x464 y520 w600 h1308.",
    positioning: "Left management column beside the research tree.",
    assetKeys: ["research_branch_row_backgrounds", "research_branch_icons"],
    dataInputs: ["research branches", "branch progress", "selectedResearchBranchId"],
    states: ["Default", "Hover", "Focused", "Selected", "Locked", "Disabled", "Loading", "Empty"],
    interactions: ["Select research branch", "Scroll branch list", "Keyboard branch navigation"]
  }),
  researchComponent({
    id: "research-branch-row",
    componentLibraryId: "ResearchBranchRow",
    displayName: "ResearchBranchRow",
    purpose: "Repeated branch row for Agriculture, Engineering, Manufacturing, Energy, Commerce, Transportation, Computing, Medicine, Space, and Civilization placeholders.",
    dimensions: "Repeated row placeholder inside x464 y520 w600 h1308.",
    positioning: "Vertical list layout with progress count and icon affordance.",
    assetKeys: ["research_branch_icons", "research_branch_row_backgrounds"],
    dataInputs: ["branchName", "branchIcon", "completedResearchCount", "totalResearchCount", "selectedResearchBranchId"]
  }),
  researchComponent({
    id: "research-progress-summary",
    componentLibraryId: "ResearchProgressSummary",
    displayName: "ResearchProgressSummary",
    purpose: "Total research progress summary at the bottom of the branch sidebar.",
    dimensions: "x504 y1708 w520 h96.",
    positioning: "Anchored to the bottom of the branch sidebar.",
    assetKeys: ["research_total_progress_icon"],
    dataInputs: ["total research progress", "completedResearchCount", "totalResearchCount"]
  }),
  researchComponent({
    id: "research-tree-workspace",
    componentLibraryId: "ResearchTreeCanvas",
    displayName: "Research Tree",
    purpose: "Main node-based research progression map with pan, zoom, filters, connectors, and selectable nodes.",
    dimensions: "x1116 y520 w1716 h1308.",
    positioning: "Largest central region between branch sidebar and detail panel.",
    assetKeys: ["research_tree_background"],
    dataInputs: ["research graph", "branch filter", "node states", "prerequisites", "active research"],
    interactions: ["Pan tree", "Zoom tree", "Select research node", "Show node tooltip", "Open requirement source"]
  }),
  researchComponent({
    id: "selected-branch-header",
    componentLibraryId: "ResearchBranchHeader",
    displayName: "Selected Branch Header",
    purpose: "Data-driven selected branch title, description, hero/background placeholder, progress label, percentage, and progress bar.",
    dimensions: "x1164 y560 w1620 h220.",
    positioning: "Inside the top of the Research Tree Workspace.",
    assetKeys: ["research_branch_header_background"],
    dataInputs: ["selected branch title", "selected branch description", "branch progress percent"]
  }),
  researchComponent({
    id: "research-node",
    componentLibraryId: "ResearchNode",
    displayName: "ResearchNode",
    purpose: "Reusable research node with icon, title, level, selected/completed/available/locked/researching states, requirements, and connection anchors.",
    dimensions: "Reusable node placeholder, approx 260x220 in 4K master; sample grid spans x1216 y840 w1516 h780.",
    positioning: "Placeholder instances follow the supplied reference rows for Food Gathering through Hydroponics.",
    assetKeys: ["research_node_circles", "research_node_frame_selected", "research_node_frame_completed", "research_node_frame_locked", "research_node_icons"],
    dataInputs: ["research node definition", "current level", "max level", "node unlock state", "node affordability"],
    states: ["Default", "Hover", "Focused", "Selected", "Completed", "Available", "Locked", "Researching", "Unavailable", "Requirement Missing"]
  }),
  researchComponent({
    id: "research-connection",
    componentLibraryId: "ResearchConnection",
    displayName: "ResearchConnection",
    purpose: "Editable connection layer behind nodes for prerequisite, unlock, branch path, and optional dependency lines.",
    dimensions: "x1164 y820 w1620 h860.",
    positioning: "Behind ResearchNode placeholders and above tree background.",
    assetKeys: ["research_connection_lines"],
    dataInputs: ["research graph edges", "selected path", "node completion state"],
    states: ["Inactive", "Available", "Completed", "Selected Path", "Locked"]
  }),
  researchComponent({
    id: "research-detail-panel",
    componentLibraryId: "ResearchDetailPanel",
    displayName: "Selected Research Detail",
    purpose: "Right-side panel for selected node title, level/status, icon, description, benefits, unlocks, requirements, cost, duration, and primary action.",
    dimensions: "x2884 y520 w824 h1308.",
    positioning: "Right context panel with internal vertical scroll when content exceeds bounds.",
    assetKeys: ["research_detail_panel_frame", "research_detail_hero_icon"],
    dataInputs: ["selected research node", "benefits", "unlocks", "requirements", "research costs", "duration", "active research"],
    interactions: ["Start research", "Open requirement source", "Open unlocked building", "Open unlocked upgrade"]
  }),
  researchComponent({
    id: "research-benefit-row",
    componentLibraryId: "ResearchBenefitRow",
    displayName: "ResearchBenefitRow",
    purpose: "Reusable benefit row with icon, label, value, positive/negative formatting, percent, flat, and multiplier support.",
    dimensions: "Repeated row inside ResearchDetailPanel.",
    positioning: "Detail panel Benefits section.",
    assetKeys: ["research_benefit_icons"],
    dataInputs: ["benefit icon", "benefit label", "benefit value", "benefit formatting"]
  }),
  researchComponent({
    id: "research-unlock-row",
    componentLibraryId: "ResearchUnlockRow",
    displayName: "ResearchUnlockRow",
    purpose: "Reusable unlock row for buildings, upgrades, and feature unlock references.",
    dimensions: "Repeated row inside ResearchDetailPanel.",
    positioning: "Detail panel Unlocks section.",
    assetKeys: ["research_unlock_icons"],
    dataInputs: ["canonical unlock ID", "unlock type", "unlock label", "unlock status"]
  }),
  researchComponent({
    id: "research-requirement-row",
    componentLibraryId: "ResearchRequirementRow",
    displayName: "ResearchRequirementRow",
    purpose: "Reusable prerequisite/requirement row with icon, label, level, completion state, progress, and pass/fail indicator.",
    dimensions: "Repeated row inside ResearchDetailPanel.",
    positioning: "Detail panel Requirements section.",
    assetKeys: ["research_requirement_icons"],
    dataInputs: ["requirement icon", "requirement label", "level", "completion state", "progress"]
  }),
  researchComponent({
    id: "research-cost-display",
    componentLibraryId: "ResearchCostDisplay",
    displayName: "ResearchCostDisplay",
    purpose: "Multiple-cost display that consumes canonical cost definitions and affordability state.",
    dimensions: "Inline section inside ResearchDetailPanel.",
    positioning: "Detail panel Cost section above the primary action.",
    assetKeys: ["research_cost_icons", "economy_research"],
    dataInputs: ["research cost definitions", "economy definitions", "player balances", "affordability"]
  }),
  researchComponent({
    id: "research-duration-display",
    componentLibraryId: "ResearchDurationDisplay",
    displayName: "ResearchDurationDisplay",
    purpose: "Duration display with instant and reduced-duration modifier support.",
    dimensions: "Inline section inside ResearchDetailPanel.",
    positioning: "Detail panel Duration section beside or near cost.",
    assetKeys: ["research_duration_icon"],
    dataInputs: ["duration", "instant state", "duration modifiers"]
  }),
  researchComponent({
    id: "research-action-button",
    componentLibraryId: "ResearchActionButton",
    displayName: "ResearchActionButton",
    purpose: "Primary image-backed action button for Start Research and related research action states.",
    dimensions: "Approx w620 h108 in 4K master; final bounds remain editable.",
    positioning: "Bottom action area of ResearchDetailPanel.",
    assetKeys: ["research_start_button"],
    dataInputs: ["selected research node", "requirements state", "affordability", "research queue state"],
    states: ["Start Research", "Researching", "Complete", "Locked", "Requirements Missing", "Insufficient Resources", "Queue Full", "Already Completed"],
    interactions: ["Start research", "Complete or claim research if canonical rules require it"]
  }),
  researchComponent({
    id: "era-research-timeline",
    componentLibraryId: "EraResearchTimeline",
    displayName: "EraResearchTimeline",
    purpose: "Bottom era research progression availability timeline bound to canonical era definitions.",
    dimensions: "x1116 y1876 w2592 h188.",
    positioning: "Bottom timeline beneath the central tree and detail areas.",
    assetKeys: ["research_era_timeline_background", "research_current_era_node", "research_locked_era_node"],
    dataInputs: ["eras", "era research availability", "era completion", "current era"],
    states: ["Default", "Current", "Completed", "Available", "Locked", "Preview"]
  })
];

const universalDiscoveryRegistryScreens: ScreenDesignRecord[] = [
  baseRecord({
    screenId: "universal-catalog",
    displayName: "Universal Catalog",
    description: "Public catalog browser for verified Universal Discovery Registry records combined with Studio-authored canonical object content.",
    status: "Draft",
    dataRequirements: [
      data("universal-discovery-registry-contract", "Universal Discovery Registry contract", "Canonical Studio Definition", "runtime.universalDiscoveryRegistry", "Mapped"),
      data("public-catalog-query", "Public catalog query", "Service/Backend State", "Game catalog API", "Missing"),
      data("canonical-object-content", "Canonical object content", "Canonical Studio Definition", "Studio runtime + Galactopedia", "Mapped")
    ],
    componentSpecs: [
      researchComponent({ id: "catalog-search", componentLibraryId: "UniversalCatalogSearch", displayName: "Universal Catalog Search", purpose: "Search and filter public discovery records.", dimensions: "Responsive toolbar.", positioning: "Top of catalog workspace." }),
      researchComponent({ id: "discovered-object-card", componentLibraryId: "DiscoveredObjectCard", displayName: "Discovered Object Card", purpose: "Grid/list record display.", dimensions: "Responsive card/list row.", positioning: "Catalog result list." })
    ],
    stateSpecs: designedStates(["Default", "Searching", "No Results", "Filtered", "Error"])
  }),
  baseRecord({
    screenId: "object-discovery-detail",
    displayName: "Object Discovery Detail",
    description: "Detailed object record combining canonical fallback identity, approved public name, attribution, milestones, and history summary.",
    status: "Draft",
    dataRequirements: [
      data("registry-record", "Registry record", "Service/Backend State", "Game catalog API", "Missing"),
      data("canonical-object-content", "Canonical fallback content", "Canonical Studio Definition", "Studio runtime", "Mapped")
    ],
    componentSpecs: [
      researchComponent({ id: "discovery-attribution", componentLibraryId: "DiscoveryAttribution", displayName: "Discovery Attribution", purpose: "Privacy-safe Discovered By presentation.", dimensions: "Detail header row.", positioning: "Object header." }),
      researchComponent({ id: "milestone-badge", componentLibraryId: "DiscoveryMilestoneBadge", displayName: "Discovery Milestone Badge", purpose: "Show first detected/scanned/landed/colonized milestones.", dimensions: "Badge row.", positioning: "Detail body." }),
      researchComponent({ id: "history-timeline", componentLibraryId: "DiscoveryHistoryTimeline", displayName: "Discovery History Timeline", purpose: "Append-only public history.", dimensions: "Timeline panel.", positioning: "Detail lower panel." })
    ],
    stateSpecs: designedStates(["Default", "Hidden Attribution", "Named", "Pending Verification", "Error"])
  }),
  baseRecord({
    screenId: "first-discovery-confirmation",
    displayName: "First Discovery Confirmation",
    description: "Server-returned first-discovery result screen showing accepted, lost-race, retry, and already-discovered outcomes.",
    status: "Draft",
    dataRequirements: [data("claim-result", "Claim result", "Service/Backend State", "submit_discovery_claim", "Missing")],
    componentSpecs: [
      researchComponent({ id: "first-discovery-badge", componentLibraryId: "FirstDiscoveryBadge", displayName: "First Discovery Badge", purpose: "Verified first-discovery result.", dimensions: "Hero badge.", positioning: "Confirmation header." }),
      researchComponent({ id: "pending-claim", componentLibraryId: "PendingDiscoveryClaim", displayName: "Pending Discovery Claim", purpose: "Retry/offline/lost-race state.", dimensions: "Status panel.", positioning: "Confirmation body." })
    ],
    stateSpecs: designedStates(["Accepted", "Already Claimed", "Lost Race", "Pending Verification", "Rejected", "Retryable Error"])
  }),
  baseRecord({
    screenId: "naming-proposal",
    displayName: "Naming Proposal",
    description: "Eligible-object naming proposal surface with canonical fallback preview and moderation disclosure.",
    status: "Draft",
    dataRequirements: [data("naming-policy", "Naming policy", "Canonical Studio Definition", "runtime.universalDiscoveryRegistry.namingPolicy", "Mapped"), data("proposal-endpoint", "Naming proposal endpoint", "Service/Backend State", "Game catalog API", "Missing")],
    componentSpecs: [researchComponent({ id: "naming-proposal-form", componentLibraryId: "NamingProposalForm", displayName: "Naming Proposal Form", purpose: "Submit proposed public name.", dimensions: "Modal or inline form.", positioning: "Primary content." })],
    stateSpecs: designedStates(["Eligible", "Ineligible", "Editing", "Submitting", "Pending Review", "Rejected", "Approved", "Error"])
  }),
  baseRecord({
    screenId: "naming-pending-review",
    displayName: "Naming Pending Review",
    description: "Name review status screen that never exposes internal moderation notes.",
    status: "Draft",
    dataRequirements: [data("naming-status", "Naming status", "Service/Backend State", "Game catalog API", "Missing")],
    componentSpecs: [researchComponent({ id: "moderation-status", componentLibraryId: "NamingModerationStatus", displayName: "Naming Moderation Status", purpose: "Public moderation status.", dimensions: "Status panel.", positioning: "Primary content." })],
    stateSpecs: designedStates(["Pending Review", "Approved", "Rejected", "Auto Blocked", "Reverted", "Error"])
  }),
  baseRecord({
    screenId: "discovery-history",
    displayName: "Discovery History",
    description: "Public immutable event history for an object, explorer, or civilization, excluding private moderation/security events.",
    status: "Draft",
    dataRequirements: [data("history", "Public history entries", "Service/Backend State", "Game catalog API", "Missing")],
    componentSpecs: [researchComponent({ id: "history-timeline", componentLibraryId: "DiscoveryHistoryTimeline", displayName: "Discovery History Timeline", purpose: "Display append-only public history.", dimensions: "Timeline list.", positioning: "Primary content." })],
    stateSpecs: designedStates(["Empty", "Populated", "Filtered", "Loading", "Error"])
  }),
  baseRecord({
    screenId: "explorer-discoveries",
    displayName: "Explorer Discoveries",
    description: "Public explorer discovery listing using public profile IDs and attribution privacy controls.",
    status: "Draft",
    dataRequirements: [data("public-profile", "Public explorer profile", "Service/Backend State", "Game catalog API", "Missing"), data("discoveries-by-player", "Discoveries by player", "Service/Backend State", "Game catalog API", "Missing")],
    componentSpecs: [researchComponent({ id: "explorer-profile-link", componentLibraryId: "ExplorerProfileLink", displayName: "Explorer Profile Link", purpose: "Privacy-safe public explorer reference.", dimensions: "Header/link.", positioning: "Page header." }), researchComponent({ id: "discovered-object-card", componentLibraryId: "DiscoveredObjectCard", displayName: "Discovered Object Card", purpose: "Explorer discovery rows.", dimensions: "Grid/list.", positioning: "Primary list." })],
    stateSpecs: designedStates(["Default", "Anonymous", "Hidden", "No Results", "Error"])
  }),
  baseRecord({
    screenId: "civilization-discoveries",
    displayName: "Civilization Discoveries",
    description: "Civilization-scoped discovery credit, score, first charted/colonized records, and historical snapshots.",
    status: "Draft",
    dataRequirements: [data("civilization-credit", "Civilization discovery credit", "Service/Backend State", "Game catalog API", "Missing")],
    componentSpecs: [researchComponent({ id: "civilization-credit", componentLibraryId: "CivilizationDiscoveryCredit", displayName: "Civilization Discovery Credit", purpose: "Historical civilization attribution.", dimensions: "Credit row/card.", positioning: "Header and list rows." })],
    stateSpecs: designedStates(["Default", "Changed Since Discovery", "Hidden", "No Results", "Error"])
  }),
  baseRecord({
    screenId: "offline-claim-pending",
    displayName: "Offline Claim Pending",
    description: "Private pending-claim surface for offline discoveries awaiting server verification.",
    status: "Draft",
    dataRequirements: [data("pending-claims", "Pending discovery claims", "Player Runtime State", "save.pendingDiscoveryClaims", "Mapped")],
    componentSpecs: [researchComponent({ id: "pending-claim", componentLibraryId: "PendingDiscoveryClaim", displayName: "Pending Discovery Claim", purpose: "Offline queue and reconnect result.", dimensions: "Status list.", positioning: "Primary content." })],
    stateSpecs: designedStates(["Queued Offline", "Submitting", "Accepted", "Lost Race", "Rejected", "Retryable Error"])
  }),
  baseRecord({
    screenId: "name-report",
    displayName: "Name Report",
    description: "Public report-name workflow for approved player-assigned names, routed to protected moderation services.",
    status: "Draft",
    dataRequirements: [data("report-name", "Name report endpoint", "Service/Backend State", "Game catalog API", "Missing")],
    componentSpecs: [researchComponent({ id: "moderation-status", componentLibraryId: "NamingModerationStatus", displayName: "Naming Moderation Status", purpose: "Current report/moderation status.", dimensions: "Status panel.", positioning: "Primary content." })],
    stateSpecs: designedStates(["Default", "Submitting", "Submitted", "Error"])
  })
];

const initialScreenDesignRecords: ScreenDesignRecord[] = [
  ...universalDiscoveryRegistryScreens,
  {
    ...baseRecord({
      screenId: appShellId,
      displayName: appShellDisplayName,
      description: "Persistent global civilization shell for NOVERIS. Top HUD, left navigation, global overlays, modals, notifications, and the Main Workspace Slot remain mounted while route workspaces swap inside the slot.",
      status: "Draft",
      screenType: "shell",
      shellBinding: createShellBinding(appShellId),
      assignedTo: "UX Architecture",
      layoutMode: "hud_overlay",
      componentSpecs: [
        researchComponent({
          id: "global-background",
          componentLibraryId: "NoverisAppShell",
          displayName: "Global Background",
          purpose: "Shell-owned background layer behind all workspace routes.",
          dimensions: "x0 y0 w3840 h2160 / z0.",
          positioning: "Global shell root.",
          assetKeys: ["dashboard_hero", "global_background"]
        }),
        researchComponent({
          id: "top-civilization-hud",
          componentLibraryId: "TopHudBar",
          displayName: "Top Civilization HUD",
          purpose: "Persistent civilization-wide HUD with fixed economy slots and global actions.",
          dimensions: "x0 y0 w3840 h220 / z100.",
          positioning: "Pinned top of App Shell.",
          assetKeys: ["economy_labor", "economy_credits", "economy_population", "economy_research", "economy_premium_crystals"],
          dataInputs: ["clientProfiles.default.primaryHudSlots", "eraEconomyProfile", "economyDefinitions", "player economy balances/rates"],
          notes: `Shell-only. Children: ${topHudChildren.join(", ")}.`
        }),
        researchComponent({
          id: "left-navigation-rail",
          componentLibraryId: "SideNavigationRail",
          displayName: "Left Navigation Rail",
          purpose: "Persistent route navigation that replaces only the Main Workspace Slot.",
          dimensions: "x54 y276 w360 h1668 / z120.",
          positioning: "Pinned left of App Shell.",
          assetKeys: ["side_navigation_rail", "navigation_icons"],
          dataInputs: ["navigationContract", "currentRoute"]
        }),
        researchComponent({
          id: mainWorkspaceSlotId,
          componentLibraryId: "MainWorkspaceSlot",
          displayName: "Main Workspace Slot",
          purpose: "Only mount point for normal route-specific content.",
          dimensions: "x464 y260 w3244 h1804 / z130.",
          positioning: "Between the persistent navigation and shell overlays.",
          dataInputs: ["routeMetadata", "activeScreenId", "workspaceSlotId"]
        }),
        researchComponent({
          id: "global-overlay-root",
          componentLibraryId: "GlobalOverlayRoot",
          displayName: "Global Overlay Root",
          purpose: "Global tooltips, status overlays, non-route overlays, and shell-owned notifications.",
          dimensions: "x0 y0 w3840 h2160 / z900.",
          positioning: "Above shell and workspace content."
        }),
        researchComponent({
          id: "global-modal-root",
          componentLibraryId: "GlobalOverlayRoot",
          displayName: "Global Modal Root",
          purpose: "Shell-owned settings, calendar, achievements, account, and blocking global modal host.",
          dimensions: "x464 y260 w3244 h1804 / z910.",
          positioning: "Global modal safe bounds above the workspace slot."
        }),
        researchComponent({
          id: "notification-layer",
          componentLibraryId: "GlobalOverlayRoot",
          displayName: "Notification Layer",
          purpose: "Persistent notification/status surface that does not remount on route change.",
          dimensions: "x464 y240 w3244 h360 / z920.",
          positioning: "Top of the workspace safe region."
        }),
        researchComponent({
          id: "debug-calibration-layer",
          componentLibraryId: "GlobalOverlayRoot",
          displayName: "Debug/Calibration Layer",
          purpose: "Studio-only calibration layer for shell/workspace bounds and parity inspection.",
          dimensions: "x0 y0 w3840 h2160 / z1000.",
          positioning: "Topmost builder-only layer."
        })
      ],
      dataRequirements: [
        data("shell-navigation-contract", "Route navigation contract", "Presentation Hint", "navigationContract", "Mapped"),
        data("shell-hud-slots", "Fixed HUD slots", "Canonical Studio Definition", "clientProfiles.default.primaryHudSlots", "Mapped"),
        data("shell-derived-profiles", "Shell profile geometry", "Presentation Hint", "derivedShellProfiles", "Mapped")
      ],
      assetRequirements: [
        asset("shell-background", "Global shell background", "global_background", "background", "Needs Approval"),
        asset("shell-navigation", "Left navigation rail artwork", "side_navigation_rail", "background", "Needs Web Mapping")
      ],
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
        accessibilityReviewed: false,
        referencesAttached: false
      },
      notes: [
        `Layer tree: ${appShellLayerTree.join(" > ")}.`,
        `Main Workspace Slot bounds: x${appShellBounds.mainWorkspaceSlot.x} y${appShellBounds.mainWorkspaceSlot.y} w${appShellBounds.mainWorkspaceSlot.width} h${appShellBounds.mainWorkspaceSlot.height}.`,
        `Derived profiles: ${derivedShellProfiles.map((profile) => profile.id).join(", ")}.`,
        "Shell editing is allowed only in this App Shell record. Inner route screens must create an Architecture/Design conflict request for shell changes.",
        "Draft builder state, shell guides, reference overlays, and internal comments are not public runtime exports."
      ]
    }),
    layoutSpec: appShellLayoutSpec,
    referenceViewport: "3840x2160",
    previewModes: visualBuilderModes
  },
  {
    ...baseRecord({
      screenId: "civilization-command",
      displayName: "Civilization Command",
      description: "Primary route workspace for civilization overview content mounted inside the persistent NOVERIS App Shell.",
      status: "Draft",
      assignedTo: "UX Design",
      layoutMode: "hud_overlay",
      dataRequirements: [
        data("command-runtime", "Runtime era/economy/upgrade definitions", "Canonical Studio Definition", "game-runtime-data", "Mapped"),
        data("command-player-progress", "Player progression and current era state", "Player Runtime State", "game client", "Partial")
      ],
      componentSpecs: [
        researchComponent({
          id: "route-workspace-root",
          componentLibraryId: "RouteWorkspaceRoot",
          displayName: "Civilization Command Workspace Root",
          purpose: "Local workspace root mounted in main-workspace-slot.",
          dimensions: "x0 y0 w3244 h1804.",
          positioning: "Inside NOVERIS App Shell Main Workspace Slot."
        }),
        researchComponent({
          id: "workspace-background",
          componentLibraryId: "WorkspaceBackground",
          displayName: "Civilization Command Background",
          purpose: "Local background placeholder without duplicating global shell elements.",
          dimensions: "x0 y0 w3244 h1804.",
          positioning: "Behind Civilization Command local content."
        })
      ],
      notes: [
        `Generated from ${blankInnerWorkspaceTemplate.displayName}.`,
        "Route metadata maps Overview navigation to civilization-command and replaces only main-workspace-slot."
      ]
    }),
    layoutSpec: workspaceLayout("Civilization Command")
  },
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
      data("dashboard-fixed-hud", "Fixed five-slot HUD order", "Canonical Studio Definition", "clientProfiles.default.primaryHudSlots", "Mapped"),
      data("dashboard-economy-contracts", "Economy behavior, producer, offline, rounding, and rate-breakdown contracts", "Canonical Studio Definition", "economyBehaviorContracts + resourceProducerDefinitions + economyRateBreakdownDefinitions", "Mapped"),
      data("dashboard-economy-designer", "Economy Designer inspector and graph handoff", "Canonical Studio Definition", "/economy-designer", "Mapped"),
      data("dashboard-ai-agent", "AI Agent definitions and automation presentation aliases", "Canonical Studio Definition", "aiAgents + automationPresentation", "Mapped"),
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
      ,
      {
        id: "dashboard-ai-agent-panel",
        componentLibraryId: "AiAgentPanel",
        variant: "dashboard",
        state: "Idle",
        layoutOverride: "Compact assistant panel adjacent to automation/Labor Assistance controls.",
        assetOverride: "auto_robot_circle",
        dataBindings: ["selectedAiAgentId", "selectedAiAgentVariantId", "aiAgents", "aiAgentVariants", "automationPresentation", "automation power/rate"],
        screenSpecificNotes: "Player-facing copy uses AI Agent, Labor Assistance, Agent Online, and Agent Offline. Tap/click opens AI Agent Profile.",
        displayName: "DashboardAIAgentPanel",
        purpose: "Shows selected AI Agent companion, automation status, Labor Assistance, and profile entry.",
        dimensions: "Compact HUD panel with 96px portrait target on desktop and mobile profile hints.",
        positioning: "Dashboard automation/control cluster.",
        typography: "Use AI Agent title and concise status labels.",
        colors: "Resolve color theme from selected AI Agent.",
        assetKeys: ["auto_robot_circle", "auto_robot_icon", "auto_robot_blink_icon"],
        dataInputs: ["selectedAiAgentId", "selectedAiAgentVariantId", "aiAgents", "aiAgentVariants", "automationPresentation", "player automation state"],
        states: ["Idle", "Blink", "Working", "Thinking", "Offline", "Warning", "Missing Art"],
        interactions: ["Open AI Agent Profile", "Toggle Agent Online/Offline"],
        responsiveBehavior: "Keep touch target >=48px; profile modal respects mobile safe areas.",
        implementationNotes: "Do not rename automation IDs in client state. Use presentation aliases from runtime."
      }
    ],
    interactionSpecs: [
      interaction("open-full-timeline", "Click View Full Timeline", "Civilization timeline opens", "Navigate to full era timeline."),
      interaction("current-era-info", "Hover/click current era node", "Temporary info panel expands", "Read current era progress and next unlock."),
      interaction("open-ai-agent-profile", "Tap/click AI Agent panel", "AI Agent Profile opens", "Read selectedAiAgentId and canonical AI Agent definitions."),
      interaction("toggle-agent-online", "Tap Agent Online/Offline control", "Automation presentation state updates", "Call existing automation toggle; do not change automation balance.")
    ],
    stateSpecs: states(requiredStates),
    responsiveStatus: "Ready",
    notes: [
      "Existing dashboard is implemented but needs formal Vite/Roblox parity review against the compact hero HUD direction.",
      "Top HUD uses fixed canonical order: ECON-LABOR, ECON-CREDITS, ECON-POPULATION, ECON-RESEARCH, ECON-PREMIUM-CRYSTALS. Credits remain visible from Survival with zero starting amount/rate.",
      "EconomyCounter should open EconomyRateBreakdown using canonical producer contributions so display totals match applied totals.",
      "Population must distinguish current population, capacity, available workforce, assigned workforce, and growth where surfaced.",
      "Labor label comes from era display overrides; economy identity and icon semantics come from economy ID, never slot position.",
      "Auto Click player-facing copy is replaced by AI Agent, Labor Assistance, Agent Online, and Agent Offline. Stable automation IDs remain."
    ]
  }),
  baseRecord({
    screenId: "ai-agent-profile",
    displayName: "AI Agent Profile",
    description: "AI Agent customization, artwork, expression, blink preview, personality, unlock, and review workspace for the player-facing companion.",
    status: "Draft",
    layoutMode: "full_screen_page",
    dataRequirements: [
      data("ai-agent-definitions", "AI Agent definitions", "Canonical Studio Definition", "aiAgents", "Mapped"),
      data("ai-agent-variants", "AI Agent visual variant definitions", "Canonical Studio Definition", "aiAgentVariants", "Mapped"),
      data("ai-agent-personalities", "AI Agent personality definitions", "Canonical Studio Definition", "aiAgentPersonalities", "Mapped"),
      data("ai-agent-animation", "AI Agent blink animation profiles", "Canonical Studio Definition", "aiAgentAnimationProfiles", "Mapped"),
      data("ai-agent-save-selection", "Selected AI Agent player preference", "Player Runtime State", "selectedAiAgentId", "Partial"),
      data("ai-agent-variant-selection", "Selected AI Agent variant preference", "Player Runtime State", "selectedAiAgentVariantId", "Partial"),
      data("ai-agent-unlocks", "Unlocked AI Agent and variant IDs", "Player Runtime State", "unlockedAiAgentIds/unlockedAiAgentVariantIds", "Partial")
    ],
    assetRequirements: [
      asset("ai-agent-head", "Default AI Agent head PNG", "auto_robot_circle", "icon", "Ready", "Imported Roblox art can be used as safe public preview."),
      asset("ai-agent-open-eyes", "Default AI Agent open-eye PNG", "auto_robot_icon", "icon", "Ready", "Transparent 512 minimum, 1024 preferred."),
      asset("ai-agent-blink", "Default AI Agent blink/closed-eye PNG", "auto_robot_blink_icon", "icon", "Ready", "Transparent blink frame required for v1.")
    ],
    componentSpecs: [
      {
        id: "ai-agent-selector",
        componentLibraryId: "AiAgentSelector",
        variant: "grid",
        state: "Default",
        layoutOverride: "Visual-first selectable agent grid.",
        assetOverride: "auto_robot_circle",
        dataBindings: ["aiAgents", "aiAgentVariants", "selectedAiAgentId", "selectedAiAgentVariantId", "unlockedAiAgentIds", "unlockedAiAgentVariantIds"],
        screenSpecificNotes: "Cosmetic selection only; no gameplay modifiers in v1.",
        displayName: "AiAgentSelector",
        purpose: "Select the active AI Agent companion.",
        dimensions: "Responsive card grid.",
        positioning: "Primary profile content.",
        typography: "Agent name, rarity, personality, unlock status.",
        colors: "Use agent colorTheme accents.",
        assetKeys: ["auto_robot_circle", "auto_robot_icon", "auto_robot_blink_icon"],
        dataInputs: ["aiAgents", "aiAgentVariants", "selectedAiAgentId", "selectedAiAgentVariantId"],
        states: ["Default", "Selected", "Locked", "Unavailable", "Missing Art"],
        interactions: ["Select agent", "Open detail"],
        responsiveBehavior: "Cards wrap; touch target >=48px.",
        implementationNotes: "Unknown selectedAiAgentId falls back visually to default while preserving unresolved diagnostic state."
      },
      {
        id: "ai-agent-variant-card",
        componentLibraryId: "AiAgentVariantCard",
        variant: "grid",
        state: "Selected",
        layoutOverride: "Variant card grid inside the profile customization tab.",
        assetOverride: "auto_robot_icon",
        dataBindings: ["aiAgentVariants", "selectedAiAgentVariantId", "unlockedAiAgentVariantIds"],
        screenSpecificNotes: "Variant selection is cosmetic only and must not change automation strength.",
        displayName: "AiAgentVariantCard",
        purpose: "Select the active AI Agent visual variant.",
        dimensions: "Responsive compact card grid.",
        positioning: "Customization/Variants tab.",
        typography: "Variant name, unlock text, readiness.",
        colors: "Use variant/agent color theme accents.",
        assetKeys: ["auto_robot_circle", "auto_robot_icon", "auto_robot_blink_icon"],
        dataInputs: ["aiAgentVariant", "selectedAiAgentVariantId", "unlockState"],
        states: ["Default", "Selected", "Unlocked", "Locked", "Missing Art", "Online", "Offline", "Blinking", "Working"],
        interactions: ["Select variant", "Open variant detail"],
        responsiveBehavior: "Cards wrap; touch target >=48px.",
        implementationNotes: "Use aiAgentSaveSchema selectedAiAgentVariantIdDefault when save state is missing."
      },
      {
        id: "ai-agent-blink-preview",
        componentLibraryId: "AiAgentBlinkPreview",
        variant: "profile",
        state: "Blink",
        layoutOverride: "Preview specimen with play/pause, reduced motion, light/dark background, circular HUD crop, panel crop, and density previews.",
        assetOverride: "auto_robot_blink_icon",
        dataBindings: ["aiAgentAnimationProfiles", "selectedAiAgentId"],
        screenSpecificNotes: "Timing is Studio-configurable; no random animation logic in asset records.",
        displayName: "AiAgentBlinkPreview",
        purpose: "Validate blink behavior and state derivatives.",
        dimensions: "Preview matrix.",
        positioning: "Artwork/Animation tab.",
        typography: "Small labels only.",
        colors: "Light/dark preview backgrounds.",
        assetKeys: ["auto_robot_icon", "auto_robot_blink_icon"],
        dataInputs: ["aiAgentAnimationProfiles", "aiAgents", "aiAgentVariants"],
        states: ["Idle", "Blink", "Paused", "Reduced Motion", "Missing Art"],
        interactions: ["Play/pause", "Toggle reduced motion"],
        responsiveBehavior: "Preserve crop preview sizes; wrap density samples.",
        implementationNotes: "Use reducedMotionBehavior=static_open when reduced motion is active."
      }
    ],
    interactionSpecs: [
      interaction("select-ai-agent", "Select an agent card", "Selected state updates", "Update player selectedAiAgentId."),
      interaction("select-ai-agent-variant", "Select a variant card", "Selected variant state updates", "Update player selectedAiAgentVariantId without changing automation strength."),
      interaction("preview-blink", "Play/pause blink preview", "Preview animation toggles", "Use AI-ANIM-BLINK-DEFAULT timing metadata."),
      interaction("toggle-reduced-motion", "Toggle reduced motion", "Static open-eye preview is shown", "Use reducedMotionBehavior from animation profile.")
    ],
    stateSpecs: states(["Default", "Selected", "Locked", "Disabled", "Loading", "Error", "Missing Data", "Preview", "Reduced Motion"]),
    responsiveStatus: "Needs Review",
    mobileReadiness: { mobileDesignStatus: "Draft", safeAreaReadiness: "Needs Review", touchReadiness: "Needs Review", mobileAssetReadiness: "Missing" },
    notes: [
      "Detail view covers Overview, Artwork, Expressions, Animation, Personality, Unlocks, Dialogue, future Voice, Platform mappings, Review, Handoff, and History.",
      "No player-owned progress is stored in Studio; this screen consumes definitions plus selectedAiAgentId/selectedAiAgentVariantId from the game save."
    ]
  }),
  baseRecord({
    screenId: "welcome",
    displayName: "Welcome",
    description: "Mobile-first welcome entry screen for NOVERIS.",
    status: "Draft",
    screenType: "full_screen_takeover",
    shellBinding: { presentationMode: "full_screen_takeover", fullScreenTakeoverReason: "Welcome/Login" },
    layoutMode: "modal",
    dataRequirements: [data("welcome-profile", "Client presentation profile", "Presentation Hint", "clientProfiles.ios/android", "Mapped")],
    assetRequirements: [asset("noveris-wordmark", "NOVERIS wordmark", "mobile_noveris_wordmark", "background", "Missing")],
    interactionSpecs: [interaction("continue-guest", "Tap Continue", "Guest profile starts", "Client auth action; Studio tracks presentation only.")],
    responsiveStatus: "Needs Review",
    mobileReadiness: { mobileDesignStatus: "Draft" }
  }),
  baseRecord({
    screenId: "login",
    displayName: "Login",
    description: "Account login screen with email, magic link, Google, and Sign in with Apple presentation requirements.",
    status: "Draft",
    screenType: "full_screen_takeover",
    shellBinding: { presentationMode: "full_screen_takeover", fullScreenTakeoverReason: "Welcome/Login" },
    layoutMode: "modal",
    dataRequirements: [data("auth-profile", "Auth capability metadata", "Presentation Hint", "clientProfiles.ios/android.authenticationProfile", "Mapped")],
    assetRequirements: [asset("login-background", "Login background", "mobile_login_background", "background", "Missing")],
    interactionSpecs: [interaction("sign-in-apple", "Tap Sign in with Apple", "Auth callback starts", "Client auth action; no secrets in Studio.")],
    responsiveStatus: "Needs Review",
    mobileReadiness: { mobileDesignStatus: "Draft" }
  }),
  baseRecord({
    screenId: "signup",
    displayName: "Signup",
    description: "Account creation and guest conversion screen.",
    status: "Draft",
    screenType: "full_screen_takeover",
    shellBinding: { presentationMode: "full_screen_takeover", fullScreenTakeoverReason: "Welcome/Login" },
    layoutMode: "modal",
    dataRequirements: [data("account-conversion", "Account conversion capabilities", "Presentation Hint", "clientProfiles.ios/android.authenticationProfile", "Mapped")],
    interactionSpecs: [interaction("create-account", "Tap Create Account", "Signup flow starts", "Client auth action.")],
    responsiveStatus: "Needs Review",
    mobileReadiness: { mobileDesignStatus: "Draft" }
  }),
  baseRecord({
    screenId: "loading",
    displayName: "Loading",
    description: "Mobile loading and launch transition screen.",
    status: "Draft",
    screenType: "full_screen_takeover",
    shellBinding: { presentationMode: "full_screen_takeover", fullScreenTakeoverReason: "Loading" },
    layoutMode: "full_screen_page",
    dataRequirements: [data("lifecycle-profile", "Mobile lifecycle presentation hints", "Presentation Hint", "clientProfiles.ios/android.lifecycleProfile", "Mapped")],
    assetRequirements: [asset("mobile-loading", "Mobile loading screen", "mobile_loading_screen", "background", "Missing"), asset("mobile-launch-background", "Launch background", "mobile_launch_background", "background", "Missing")],
    interactionSpecs: [interaction("retry-load", "Tap Retry", "Loading retry state", "Client network retry action.")],
    responsiveStatus: "Needs Review",
    mobileReadiness: { mobileDesignStatus: "Draft" }
  }),
  baseRecord({
    screenId: "account",
    displayName: "Account",
    description: "Account management, conversion, password reset, and account deletion screen.",
    status: "Draft",
    layoutMode: "modal",
    dataRequirements: [data("account-deletion", "Account deletion capability", "Presentation Hint", "clientProfiles.ios/android.authenticationProfile.accountDeletionTracked", "Mapped")],
    interactionSpecs: [interaction("delete-account", "Tap Delete Account", "Confirmation and deletion flow opens", "Client account action; requires confirmation.")],
    responsiveStatus: "Needs Review",
    mobileReadiness: { mobileDesignStatus: "Draft" }
  }),
  baseRecord({
    screenId: "cloud-saves",
    displayName: "Cloud Saves",
    description: "Cloud save sync, restore, and mobile lifecycle recovery screen.",
    status: "Draft",
    layoutMode: "modal",
    dataRequirements: [data("cloud-sync", "Cloud sync lifecycle hints", "Presentation Hint", "clientProfiles.ios/android.lifecycleProfile", "Mapped")],
    interactionSpecs: [interaction("restore-cloud-save", "Tap Restore", "Restore confirmation opens", "Client save-service action.")],
    responsiveStatus: "Needs Review",
    mobileReadiness: { mobileDesignStatus: "Draft" }
  }),
  baseRecord({
    screenId: "save-conflict",
    displayName: "Save Conflict",
    description: "Cloud save conflict resolution screen.",
    status: "Draft",
    screenType: "full_screen_takeover",
    shellBinding: { presentationMode: "full_screen_takeover", fullScreenTakeoverReason: "Save Conflict Blocking" },
    layoutMode: "modal",
    dataRequirements: [data("save-conflict", "Save conflict notification/deep-link hints", "Presentation Hint", "clientProfiles.ios/android.notificationProfile", "Mapped")],
    interactionSpecs: [interaction("resolve-conflict", "Tap Keep Local or Cloud", "Conflict resolution confirmation opens", "Client save-service action.")],
    responsiveStatus: "Needs Review",
    mobileReadiness: { mobileDesignStatus: "Draft" }
  }),
  baseRecord({
    screenId: "production",
    displayName: "Production",
    description: "Production chain, output, and work management screen.",
    status: "Not Started",
    dataRequirements: [data("production-chains", "Production chain definitions", "Canonical Studio Definition", "building_chains", "Mapped"), data("production-player-state", "Owned buildings and production rates", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("production-icons", "Production icons", "production_icons", "icon", "Missing")]
  }),
  {
    ...baseRecord({
      screenId: "research",
      displayName: "Research",
      description: "Research management screen specification. Preserves reference context and structured implementation requirements for the branch list, research tree, selected-node detail panel, and era timeline.",
      status: "Draft",
      assignedTo: "UX Design",
      layoutMode: "hud_overlay",
      web: "Not Started",
      roblox: "Not Started",
      componentSpecs: researchComponents,
      dataRequirements: [
        data("research-current-era", "Current era", "Canonical Studio Definition", "eras + player currentEraId", "Partial", "Era definitions are canonical; active player era comes from runtime state."),
        data("research-selected-branch", "Selected branch", "Player Runtime State", "selectedResearchBranchId", "Missing", "Selection is a client/runtime interaction state and is not stored in Studio definitions."),
        data("research-branches", "Research branches", "Canonical Studio Definition", "research branches/categories", "Mapped"),
        data("research-branch-progress", "Branch progress", "Player Runtime State", "player research progress", "Missing", "Progress is derived from completed/unlocked player research state."),
        data("research-graph", "Research graph", "Canonical Studio Definition", "research", "Mapped"),
        data("research-node-states", "Node states", "Player Runtime State", "game client", "Missing", "Completed, available, locked, researching, and selected states come from runtime."),
        data("research-prerequisites", "Prerequisites", "Canonical Studio Definition", "research.dependencies", "Mapped"),
        data("research-costs", "Research costs", "Canonical Studio Definition", "research.costs", "Partial", "Cost display must support multiple canonical economy/resource costs."),
        data("research-duration", "Research duration", "Canonical Studio Definition", "research.duration", "Partial", "Duration and modifiers are canonical where published; missing nodes remain unresolved."),
        data("research-benefits", "Research benefits", "Canonical Studio Definition", "research.effects", "Partial"),
        data("research-unlocks", "Unlocks", "Canonical Studio Definition", "unlock_matrix", "Mapped"),
        data("research-requirements", "Requirements", "Canonical Studio Definition", "research requirements + unlock_matrix", "Mapped"),
        data("research-active", "Active research", "Player Runtime State", "activeResearch", "Missing"),
        data("research-queue", "Research queue", "Player Runtime State", "researchQueue", "Missing"),
        data("research-total-progress", "Total research progress", "Player Runtime State", "game client", "Missing")
      ],
      assetRequirements: [
        asset("research-screen-background", "Research screen background", "research_screen_background", "background", "Pending Upload"),
        asset("research-header-icon", "Research header icon", "research_header_icon", "icon", "Pending Upload"),
        asset("research-branch-row-backgrounds", "Research branch row backgrounds", "research_branch_row_backgrounds", "panel", "Pending Upload"),
        asset("research-branch-icons", "Research branch icons", "research_branch_icons", "icon", "Pending Upload"),
        asset("research-tree-background", "Research tree background", "research_tree_background", "background", "Pending Upload"),
        asset("research-branch-header-background", "Branch hero/header background", "research_branch_header_background", "background", "Pending Upload"),
        asset("research-node-circles", "Research node circles", "research_node_circles", "button_state", "Pending Upload"),
        asset("research-node-frame-selected", "Selected node frame", "research_node_frame_selected", "button_state", "Pending Upload"),
        asset("research-node-frame-completed", "Completed node frame", "research_node_frame_completed", "button_state", "Pending Upload"),
        asset("research-node-frame-locked", "Locked node frame", "research_node_frame_locked", "button_state", "Pending Upload"),
        asset("research-connection-lines", "Research connection lines", "research_connection_lines", "button_state", "Pending Upload"),
        asset("research-detail-panel-frame", "Research detail panel frame", "research_detail_panel_frame", "panel", "Pending Upload"),
        asset("research-benefit-icons", "Benefit icons", "research_benefit_icons", "icon", "Pending Upload"),
        asset("research-unlock-icons", "Unlock icons", "research_unlock_icons", "icon", "Pending Upload"),
        asset("research-requirement-icons", "Requirement icons", "research_requirement_icons", "icon", "Pending Upload"),
        asset("research-cost-icons", "Cost icons", "research_cost_icons", "icon", "Pending Upload"),
        asset("research-start-button", "Start Research button", "research_start_button", "button_state", "Pending Upload"),
        asset("research-era-timeline-background", "Era timeline background", "research_era_timeline_background", "background", "Pending Upload"),
        asset("research-current-era-node", "Current-era node", "research_current_era_node", "button_state", "Pending Upload"),
        asset("research-locked-era-node", "Locked-era node", "research_locked_era_node", "button_state", "Pending Upload")
      ],
      interactionSpecs: [
        interaction("select-research-branch", "Click/tap/keyboard activate a research branch", "Branch selected state updates and tree filters", "Update local selectedResearchBranchId; read canonical research graph."),
        interaction("select-research-node", "Click/tap/keyboard activate a research node", "Node selected state updates and detail panel populates", "Read selected canonical research definition plus player progress."),
        interaction("pan-tree", "Drag/touch pan the research tree", "Tree viewport pans", "Local viewport state only."),
        interaction("zoom-tree", "Mouse wheel/pinch/zoom controls", "Tree zoom level changes", "Local viewport state only."),
        interaction("show-node-tooltip", "Hover/focus a research node", "Tooltip shows era, name, and unlock requirements", "Read canonical requirement data."),
        interaction("start-research", "Activate Start Research", "Researching or failure state", "Player runtime start-research action; Studio only defines contract."),
        interaction("cancel-research", "Activate Cancel where canonical rules allow it", "Pending/active research is cancelled", "Player runtime action if allowed."),
        interaction("complete-research", "Activate Complete/Claim where canonical rules require it", "Research completed state", "Player runtime claim action if required."),
        interaction("switch-era", "Select an era in the bottom timeline", "Era preview/filter state changes", "Read canonical era and research availability."),
        interaction("open-requirement-source", "Activate requirement row", "Requirement source opens", "Navigate to referenced canonical research/building/upgrade source."),
        interaction("open-unlocked-building", "Activate building unlock row", "Building source opens", "Navigate to canonical building."),
        interaction("open-unlocked-upgrade", "Activate upgrade unlock row", "Upgrade source opens", "Navigate to canonical upgrade."),
        interaction("return-prior-screen", "Activate Back/Close from modal or overlay", "Return to prior screen", "Client router/back-stack action.")
      ],
      stateSpecs: designedStates([
        "default",
        "no branch selected",
        "branch selected",
        "node selected",
        "node available",
        "node locked",
        "node completed",
        "researching",
        "research completed",
        "insufficient resources",
        "requirements missing",
        "loading",
        "empty branch",
        "error",
        "offline",
        "mobile compact",
        "tablet"
      ]),
      checklist: {
        layoutDefined: true,
        componentsDefined: true,
        canonicalDataMapped: true,
        playerStateMapped: false,
        missingSystemsIdentified: true,
        assetRequirementsCreated: true,
        allStatesDesigned: true,
        interactionsDocumented: true,
        responsiveRulesDefined: true,
        motionDefined: true,
        accessibilityReviewed: false,
        referencesAttached: true
      },
      responsiveStatus: "Needs Review",
      mobileReadiness: { mobileDesignStatus: "Draft", safeAreaReadiness: "Needs Review", touchReadiness: "Needs Review", mobileAssetReadiness: "Missing" },
      notes: [
        "Screen type: management. Status: draft. Target clients: Web, Roblox, iOS, Android, Tablet.",
        "Research is an inner workspace mounted inside the persistent NOVERIS App Shell Main Workspace Slot.",
        "Use the supplied full reference only as shell context. It is excluded from runtime export and production asset manifests.",
        "Reference controls required: show/hide, opacity, lock/unlock, reference only, builder only, 50% overlay, and difference mode if supported.",
        "The layer tree is Route Workspace Root > Reference > Research Master Reference, Workspace Background, Research Header, Research Branch Sidebar, Research Tree Workspace, Research Detail Panel, Era Timeline, Local Modal/Drawer Root, Local Overlay Root.",
        "All route geometry is authored in Main Workspace Slot-local 4K coordinates. Full composition previews resolve shell x464 y260 w3244 h1804 around the local workspace.",
        "Placeholders are structured and replaceable: preserve geometry, z-index, data bindings, interactions, states, and derived 1080 coordinates when final art is uploaded.",
        "Reference branch/node names such as Agriculture, Food Storage, and Hydroponics are placeholders only. Actual definitions come from canonical research data.",
        "TopHudBar and SideNavigationRail belong to the App Shell and must not be duplicated in this Research screen record.",
        "Do not implement Vite/Roblox gameplay or export this draft placeholder layout into public runtime in this task."
      ]
    }),
    referenceViewport: "3840x2160",
    layoutSpec: researchMasterLayout,
    references: [{
      id: "research-master-reference",
      type: "reference UI",
      viewport: "16:9 source scaled to 3840x2160",
      source: "/mnt/data/CF773185-E780-4A10-AB7D-421CD15F7D62.jpeg",
      date: "2026-07-14",
      notes: "Research Master Reference. Studio-only reference layer: locked true, visible true, opacity 50%, fit contain, centered, preserve aspect ratio, noninteractive, excluded from runtime export and production asset manifests.",
      approvalStatus: "Unreviewed",
      viewModes: ["Full Reference", "Workspace Only", "Shell Context", "Full Composition Preview"],
      workspaceCrop: { x: 464, y: 260, width: 3244, height: 1804 },
      excludedFromRuntime: true
    }],
    responsiveRules: [
      { viewport: "3840x2160", behavior: "Authoritative 4K master canvas; all element coordinates are stored here.", status: "Needs Review" },
      { viewport: "1920x1080", behavior: "Generate desktop_1080 manifest at 0.5 scale; verify no rounding drift greater than approved tolerance.", status: "Needs Review" },
      { viewport: "1440x900", behavior: "Scale the HUD shell, preserve tree readability, and keep branch/detail panels within text-safe regions.", status: "Needs Review" },
      { viewport: "compact/tablet", behavior: "Tablet landscape keeps the tree primary and may collapse detail into a drawer.", status: "Needs Review" },
      { viewport: "ios-phone-landscape", behavior: "Phone landscape collapses branch sidebar into a drawer, detail panel into modal/drawer, and preserves touch targets.", status: "Needs Review" },
      { viewport: "android-phone-landscape", behavior: "Phone landscape follows safe-area and display-cutout constraints with tree as primary.", status: "Needs Review" },
      { viewport: "ios-tablet-landscape", behavior: "Tablet preview required before mobile composition is finalized.", status: "Needs Review" },
      { viewport: "android-tablet-landscape", behavior: "Tablet preview required before mobile composition is finalized.", status: "Needs Review" }
    ],
    animationSpecs: [
      "Research connection states support inactive, available, completed, selected-path, and locked visual treatments.",
      "Pan/zoom motion uses shared motion tokens and respects reduced motion.",
      "Research action button states use image-backed placeholders until final button art is uploaded."
    ],
    accessibilityRequirements: [
      "Keyboard navigation order covers branch rows, tree nodes, detail-panel actions, and timeline nodes.",
      "Visible focus state is required for every node, row, and action.",
      "Tooltips must be accessible from hover and focus.",
      "Controller activation is reserved in the component contract.",
      "Text is editable and must not be baked into placeholder art."
    ]
  },
  baseRecord({
    screenId: "buildings",
    displayName: "Buildings",
    description: "Building catalogue, construction, upgrade, and production detail screen.",
    status: "Not Started",
    dataRequirements: [data("building-definitions", "Building definitions", "Canonical Studio Definition", "buildings", "Mapped"), data("building-resource-effects", "Structured building resource effects", "Canonical Studio Definition", "buildingResourceEffects + resourceProducerDefinitions", "Mapped"), data("building-economy-designer", "Economy Designer building effect inspector", "Canonical Studio Definition", "/economy-designer#building-effects", "Mapped"), data("building-player-state", "Owned buildings/workers", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [
      asset("buildings-workspace-background", "Buildings workspace background", "buildings_workspace_background", "background", "Pending Upload"),
      asset("buildings-header", "Buildings header", "buildings_header", "background", "Pending Upload"),
      asset("building-category-tabs", "Building category tabs", "building_category_tabs", "button_state", "Pending Upload"),
      asset("building-card-art", "Building card frames", "building_cards", "background", "Needs Approval"),
      asset("building-icon-placeholders", "Building icon placeholders", "building_icon_placeholders", "icon", "Pending Upload"),
      asset("building-detail-panel", "Building detail panel", "building_detail_panel", "panel", "Pending Upload"),
      asset("building-cost-rows", "Building cost rows", "building_cost_rows", "panel", "Pending Upload"),
      asset("building-requirement-rows", "Building requirement rows", "building_requirement_rows", "panel", "Pending Upload"),
      asset("building-build-upgrade-buttons", "Build/upgrade buttons", "building_build_upgrade_buttons", "button_state", "Pending Upload"),
      asset("building-empty-state", "Building empty state", "building_empty_state", "background", "Pending Upload"),
      asset("building-locked-state", "Building locked state", "building_locked_state", "background", "Pending Upload"),
      asset("building-construction-state", "Building construction state", "building_construction_state", "background", "Pending Upload")
    ]
  }),
  baseRecord({
    screenId: "resources",
    displayName: "Resources",
    description: "Resource inventory, sources, usage, and storage screen.",
    status: "In Design",
    web: "In Progress",
    dataRequirements: [data("resource-catalog", "Resource catalog", "Canonical Studio Definition", "resource_catalog", "Mapped"), data("resource-economy-contracts", "HUD economy behavior and transaction contracts", "Canonical Studio Definition", "economyBehaviorContracts + economyTransactionReasons + offlineProgressionPolicies", "Mapped"), data("resource-economy-designer", "Economy Designer resource inspector nodes", "Canonical Studio Definition", "/economy-designer#resource-inspector", "Mapped"), data("resource-inventory", "Current inventory", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("resource-icons", "Resource icons", "resource_icons", "icon", "Needs Web Mapping")]
  }),
  baseRecord({
    screenId: "economy-designer",
    displayName: "Economy Designer",
    description: "Studio-only economy authoring workspace for resource inspectors, producer graph, building effects, focused audits, sandbox projections, validation, and handoffs.",
    status: "In Design",
    web: "Implemented",
    dataRequirements: [
      data("economy-designer-runtime", "Canonical runtime economy contracts", "Canonical Studio Definition", "economyBehaviorContracts + resourceProducerDefinitions + buildingResourceEffects", "Mapped"),
      data("economy-designer-graph", "Derived Studio-only graph nodes and edges", "Canonical Studio Definition", "lib/economy-designer", "Mapped"),
      data("economy-designer-sandbox", "Local sandbox scenario inputs", "Presentation Hint", "component state", "Mapped")
    ],
    assetRequirements: [asset("economy-designer-icons", "Economy Designer icons/previews", "economy_designer_icons", "icon", "Needs Approval")],
    notes: ["Studio-only workspace. Sandbox scenarios, graph layout positions, and review notes are not exported to public runtime."]
  }),
  baseRecord({
    screenId: "economy-breakdown",
    displayName: "Economy Breakdown",
    description: "Player-facing economy detail screen that explains rates, source breakdowns, scopes, and offline eligibility.",
    status: "Not Started",
    dataRequirements: [data("economy-designer-rate-breakdown", "Canonical rate breakdowns and multiplier order", "Canonical Studio Definition", "/economy-designer#rate-breakdown", "Mapped"), data("economy-runtime-balances", "Current balances and active producer state", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("economy-icons", "Economy HUD icons", "economy_icons", "icon", "Needs Approval")]
  }),
  baseRecord({
    screenId: "premium-currency",
    displayName: "Premium Currency",
    description: "Premium Crystal purchase, reward, refund, and restore-purchase screen.",
    status: "Not Started",
    dataRequirements: [data("premium-safety-contract", "Premium Crystal source safety and transaction reason codes", "Canonical Studio Definition", "/economy-designer#premium-safety", "Mapped"), data("premium-store-state", "Verified purchases and entitlements", "Service/Backend State", "commerce service", "Missing")],
    assetRequirements: [asset("premium-crystal-art", "Premium crystal icon and store art", "premium_crystal_art", "icon", "Needs Approval")]
  }),
  baseRecord({
    screenId: "population-management",
    displayName: "Population Management",
    description: "Population capacity, available workforce, assigned workforce, growth, and local rollup screen.",
    status: "Not Started",
    dataRequirements: [data("population-model-contract", "Population model and capacity/growth separation", "Canonical Studio Definition", "/economy-designer#population-model", "Mapped"), data("population-player-state", "Current citizens, assignment, and settlement state", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("population-icons", "Population and workforce icons", "population_icons", "icon", "Needs Approval")]
  }),
  baseRecord({
    screenId: "trade",
    displayName: "Trade",
    description: "Trade route, market, commerce source, and Credits income screen.",
    status: "In Design",
    dataRequirements: [data("credits-model-contract", "Credits producer model, commerce sources, and presentation timeline", "Canonical Studio Definition", "/economy-designer#credits-model", "Mapped"), data("trade-runtime-state", "Trade route and market state", "Player Runtime State", "game client", "Missing")],
    assetRequirements: [asset("trade-icons", "Trade and currency icons", "trade_icons", "icon", "Needs Approval")]
  }),
  baseRecord({
    screenId: "upgrades",
    displayName: "Upgrades",
    description: "Upgrade tab and upgrade chain screen.",
    status: "Not Started",
    dataRequirements: [
      data("upgrade-definitions", "Upgrade definitions", "Canonical Studio Definition", "upgrades", "Mapped"),
      data("upgrade-category-presentation", "Upgrade category presentation backgrounds", "Canonical Studio Definition", "upgradeCategories[].presentation.backgroundArtKey", "Mapped", "selectedUpgradeCategoryId resolves to canonical category definition, then to presentation.backgroundArtKey."),
      data("upgrade-player-state", "Purchased upgrade state", "Player Runtime State", "game client", "Missing")
    ],
    assetRequirements: [
      asset("upgrade-workforce-background", "Workforce background", categoryPresentationFor("workforce").backgroundArtKey, "background", "Pending Upload", "UI > Dashboard > Upgrade Categories > Workforce."),
      asset("upgrade-industry-background", "Industry background", categoryPresentationFor("industry").backgroundArtKey, "background", "Pending Upload", "UI > Dashboard > Upgrade Categories > Industry."),
      asset("upgrade-science-background", "Science background", categoryPresentationFor("science").backgroundArtKey, "background", "Pending Upload", "UI > Dashboard > Upgrade Categories > Science."),
      asset("upgrade-technology-background", "Technology background", categoryPresentationFor("technology").backgroundArtKey, "background", "Pending Upload", "UI > Dashboard > Upgrade Categories > Technology."),
      asset("upgrade-shared-fallback-background", "Shared fallback upgrade background", upgradePanelSharedFallbackArtKey, "background", "Needs Approval", "Used when category-specific background is missing or unpublished."),
      asset("upgrade-icons", "Upgrade icons", "upgrade_icons", "icon", "Needs Approval")
    ],
    componentSpecs: [
      researchComponent({
        id: "upgrade-workspace-background",
        componentLibraryId: "UpgradeWorkspaceBackground",
        displayName: "Upgrade Workspace Background",
        purpose: "Category-specific local workspace background selected from canonical upgrade category presentation metadata.",
        dimensions: "x0 y0 w3244 h1804.",
        positioning: "WorkspaceBackground layer inside RouteWorkspaceRoot.",
        assetKeys: [
          categoryPresentationFor("workforce").backgroundArtKey,
          categoryPresentationFor("industry").backgroundArtKey,
          categoryPresentationFor("science").backgroundArtKey,
          categoryPresentationFor("technology").backgroundArtKey,
          upgradePanelSharedFallbackArtKey
        ],
        dataInputs: ["selectedUpgradeCategoryId", "upgradeCategories", "selectedUpgradeCategory.presentation.backgroundArtKey"],
        states: ["workforce", "industry", "science", "technology", "fallback", "missing art", "loading", "selected"]
      }),
      researchComponent({
        id: "upgrade-category-tabs",
        componentLibraryId: "UpgradeCategoryTabs",
        displayName: "Upgrade Category Tabs",
        purpose: "Switches selectedUpgradeCategoryId without duplicating screen layouts.",
        dimensions: "Local tab strip inside Upgrades workspace.",
        positioning: "Top tab region within the Main Workspace Slot.",
        dataInputs: ["upgradeCategories", "selectedUpgradeCategoryId", "player category unlock state"],
        states: ["workforce", "industry", "science", "technology", "fallback", "loading", "selected"]
      }),
      researchComponent({
        id: "upgrade-category-view",
        componentLibraryId: "UpgradeCategoryView",
        displayName: "Upgrade Category View",
        purpose: "Single category-state view that swaps heading, background, selected tab, and sample rows from selectedUpgradeCategoryId.",
        dimensions: "Primary Upgrades workspace content.",
        positioning: "Inside local content root.",
        dataInputs: ["selectedUpgradeCategory", "upgradesByCategory", "category presentation metadata"],
        states: ["workforce", "industry", "science", "technology", "fallback", "missing art", "loading", "selected"]
      }),
      researchComponent({
        id: "upgrade-list",
        componentLibraryId: "UpgradeList",
        displayName: "Upgrade List",
        purpose: "Category-specific upgrade row list using one layout and selected category state overrides.",
        dimensions: "Scrollable row region inside the Upgrades workspace.",
        positioning: "Below tab and heading region.",
        dataInputs: ["selectedUpgradeCategoryId", "upgrades", "player purchased upgrades"],
        states: ["workforce", "industry", "science", "technology", "loading", "selected"]
      })
    ],
    notes: [
      "Background binding: selectedUpgradeCategoryId -> canonical upgrade category definition -> presentation.backgroundArtKey.",
      "Preview modes: Workforce, Industry, Science, Technology. Use category-state overrides, not four duplicated screen layouts.",
      "Category-specific artwork comes from Asset Production UI > Dashboard > Upgrade Categories and must be approved/published before runtime asset rows expose mappings."
    ]
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
    dataRequirements: [data("settings-schema", "Client settings schema", "Service/Backend State", "game client", "Missing"), data("accessibility-options", "Accessibility options", "Presentation Hint", "design tokens", "Partial"), data("premium-transaction-contract", "Premium purchase, grant, refund, and restore-purchase reason codes", "Canonical Studio Definition", "economyTransactionReasons.ECON-PREMIUM-CRYSTALS + /economy-designer#premium-safety", "Mapped")],
    assetRequirements: [asset("settings-icons", "Settings icons", "settings_icons", "icon", "Needs Approval")]
  }),
  baseRecord({
    screenId: "validation-engine",
    displayName: "Validation Center",
    description: "Studio validation dashboard for runtime, exports, architecture, economy, assets, screens, and component readiness.",
    status: "In Design",
    dataRequirements: [data("validation-runtime", "Runtime and export validation results", "Canonical Studio Definition", "validation-engine", "Mapped"), data("economy-validation", "Economy Designer validation issues", "Canonical Studio Definition", "/economy-designer#validation", "Mapped")],
    assetRequirements: [asset("validation-icons", "Validation status icons", "validation_icons", "icon", "Needs Approval")]
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
  const order = [appShellId, "civilization-command", "dashboard", "ai-agent-profile", "welcome", "login", "signup", "loading", "account", "cloud-saves", "save-conflict", "production", "research", "buildings", "resources", "upgrades", "civilization", "events", "galaxy", "spaceport", "earth", "solar-system", "discovery", "settings"];
  const index = order.indexOf(screenId);
  return index === -1 ? order.length : index;
}

function normalizeRecord(record: ScreenDesignRecord): ScreenDesignRecord {
  const screenType = record.screenType ?? (record.screenId === appShellId ? "shell" : record.shellBinding?.presentationMode === "full_screen_takeover" ? "full_screen_takeover" : "workspace");
  return {
    ...record,
    screenType,
    shellBinding: record.shellBinding ?? createShellBinding(record.screenId),
    navigationMetadata: record.navigationMetadata ?? navigationMetadataForScreen(record.screenId),
    previewModes: record.previewModes?.length ? record.previewModes : (screenType === "full_screen_takeover" ? ["Full Composition Preview"] : visualBuilderModes),
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
    implementationTargets: ensureImplementationTargets(record.implementationTargets),
    parityStatus: record.parityStatus ?? { vite: "Not Started", roblox: "Not Started" },
    reviewHistory: record.reviewHistory ?? [],
    references: record.references ?? [],
    checklist: checklist(record.checklist ?? {}),
    mobileReadiness: record.mobileReadiness ?? mobileReadiness(record.screenId)
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
  return {
    ...record,
    assetRequirements: record.assetRequirements.map((requirement) => {
      const key = requirement.artKey ?? requirement.iconKey ?? requirement.id;
      const match = findAssetForPreviewKeys(assetState.assets, [requirement.linkedAssetId, requirement.artKey, requirement.iconKey, requirement.id, requirement.label, key]);
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
  const screens = records.map((record) => toSummary(record, assetState?.assets));
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

function toSummary(record: ScreenDesignRecord, assets?: ProductionAsset[]): ScreenDesignSummary {
  const score = checklistScore(record);
  const implementedTargets = record.implementationTargets.filter((target) => target.status === "Implemented" || target.status === "Approved").length;
  const parityScore = Math.round((implementedTargets / Math.max(1, record.implementationTargets.length)) * 100);
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
    checklistTotal: score.total,
    visualPreview: resolveScreenPreview(record, assets),
    parityScore,
    mobileReadiness: record.mobileReadiness
  };
}

function buildStats(screens: ScreenDesignSummary[]): ScreenDesignerState["stats"] {
  const accountScreens = new Set(["account", "cloud-saves", "save-conflict", "settings"]);
  return {
    total: screens.length,
    notStarted: screens.filter((screen) => screen.status === "Not Started").length,
    inDesign: screens.filter((screen) => ["Draft", "In Design", "Needs Revision"].includes(screen.status)).length,
    readyForReview: screens.filter((screen) => screen.status === "Ready for Review").length,
    approved: screens.filter((screen) => screen.approvalStatus === "Approved").length,
    implemented: screens.filter((screen) => screen.status === "Implemented").length,
    blockedByMissingAssets: screens.filter((screen) => screen.missingAssets > 0).length,
    blockedByMissingData: screens.filter((screen) => screen.unresolvedDataRequirements > 0).length,
    blockedByMissingInteractionSpecs: screens.filter((screen) => screen.checklistComplete < screen.checklistTotal).length,
    mobileReadyScreens: screens.filter((screen) => screen.mobileReadiness.mobileDesignStatus === "Approved" && screen.mobileReadiness.safeAreaReadiness === "Ready" && screen.mobileReadiness.touchReadiness === "Ready").length,
    safeAreaBlockers: screens.filter((screen) => screen.mobileReadiness.safeAreaReadiness !== "Ready").length,
    touchBlockers: screens.filter((screen) => screen.mobileReadiness.touchReadiness !== "Ready").length,
    mobileAssetBlockers: screens.filter((screen) => screen.mobileReadiness.mobileAssetReadiness !== "Ready").length,
    iosBlockers: screens.filter((screen) => screen.mobileReadiness.iosImplementationStatus !== "Implemented" && screen.mobileReadiness.iosImplementationStatus !== "Approved").length,
    androidBlockers: screens.filter((screen) => screen.mobileReadiness.androidImplementationStatus !== "Implemented" && screen.mobileReadiness.androidImplementationStatus !== "Approved").length,
    accountDeletionReadiness: screens.filter((screen) => accountScreens.has(screen.screenId) && screen.mobileReadiness.mobileDesignStatus !== "Not Started").length
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
    "Studio ownership: canonical data requirements, asset keys, component contracts, states, interactions, accessibility, and acceptance criteria.",
    "Client ownership: exact coordinates, CSS/layout, responsive composition, rendering, and animation placement.",
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

export async function addScreenReference(input: {
  screenId: string;
  source: string;
  type?: ScreenReference["type"];
  viewport?: string;
  notes?: string;
  approvalStatus?: ScreenApprovalStatus;
}) {
  const store = await readStore();
  const records = mergeRecords(store.records);
  const index = records.findIndex((record) => record.screenId === input.screenId);
  if (index === -1) throw new Error(`Screen design not found: ${input.screenId}`);
  const now = new Date().toISOString();
  const source = input.source.trim();
  if (!source) throw new Error("Reference source URL is required.");
  const next: ScreenDesignRecord = {
    ...records[index],
    updatedAt: now,
    references: [{
      id: `screen-reference-${records[index].screenId}-${Date.now()}`,
      type: input.type ?? "reference UI",
      viewport: input.viewport?.trim() || records[index].referenceViewport,
      source,
      date: now,
      notes: input.notes?.trim() || "Reference screenshot added from Visual Preview workflow.",
      approvalStatus: input.approvalStatus ?? "Unreviewed"
    }, ...records[index].references],
    checklist: {
      ...records[index].checklist,
      referencesAttached: true
    }
  };
  records[index] = next;
  await writeStore({ records, updatedAt: now });
  return next;
}

export const screenDesignerInitialRecords = initialScreenDesignRecords;

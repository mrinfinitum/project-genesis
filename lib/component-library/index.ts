import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { appShellId, mainWorkspaceSlotId } from "@/lib/app-shell";
import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";
import { findAssetForPreviewKeys, resolveComponentPreview, type VisualPreview } from "@/lib/assets/visual-previews";
import { generatedComponentPreviewReferences, generatedComponentPreviewStats } from "@/lib/component-preview-generation";
import type { ScreenDesignRecord } from "@/lib/screen-designer";

export type ComponentCategory = "Navigation" | "HUD" | "Panels" | "Buttons" | "Cards" | "Lists" | "Progress" | "Forms" | "Overlays" | "Feedback" | "Data Display" | "Game-Specific" | "Accessibility" | "Utility";
export type ComponentDesignStatus = "Not Started" | "Draft" | "In Design" | "Ready for Review" | "Approved" | "Implemented" | "Needs Revision" | "Deprecated";
export type ComponentApprovalStatus = "Unreviewed" | "Changes Requested" | "Approved";
export type ComponentImplementationTarget = "Vite Web" | "Roblox" | "Unity" | "Unreal" | "Godot" | "iOS" | "Android";
export type ComponentImplementationStatus = "Not Started" | "In Progress" | "Implemented" | "Needs Parity Review" | "Approved" | "Deprecated";
export type ComponentParityStatus = "Not Reviewed" | "Needs Work" | "Close" | "Approved";
export type ComponentDataClassification = "Canonical Studio Definition" | "Player Runtime State" | "Service State" | "Presentation Hint" | "Local Interaction State";
export type ComponentChangeType = "Patch" | "Minor" | "Major";

export const componentCategories: ComponentCategory[] = ["Navigation", "HUD", "Panels", "Buttons", "Cards", "Lists", "Progress", "Forms", "Overlays", "Feedback", "Data Display", "Game-Specific", "Accessibility", "Utility"];

export type ComponentAnatomyPart = {
  id: string;
  label: string;
  source: "source art" | "CSS/layout" | "runtime data" | "interaction state";
  required: boolean;
  notes: string;
};

export type ComponentTokenReference = {
  group: "typography" | "colors" | "spacing" | "sizing" | "borders" | "radii" | "shadows" | "glow" | "motion" | "z-index" | "opacity" | "icon scale";
  tokenId: string;
  usage: string;
  override?: string;
};

export type ComponentAssetReference = {
  id: string;
  label: string;
  assetKey: string;
  required: boolean;
  status: "Ready" | "Missing" | "Placeholder" | "Pending Art" | "Needs Approval" | "Needs Web Mapping" | "Needs Roblox Mapping" | "Needs Engine Mapping";
  linkedAssetId?: string;
  notes: string;
};

export type ComponentVariant = {
  id: string;
  displayName: string;
  visualDifferences: string;
  tokenOverrides: string[];
  assetOverrides: string[];
  behaviorDifferences: string;
  allowedStates: string[];
  usageGuidance: string;
};

export type ComponentStateSpec = {
  id: string;
  label: string;
  required: boolean;
  designed: boolean;
  notes: string;
};

export type ComponentDataInput = {
  id: string;
  label: string;
  type: string;
  classification: ComponentDataClassification;
  required: boolean;
  notes: string;
};

export type ComponentInteraction = {
  id: string;
  trigger: string;
  action: string;
  stateTransition: string;
  runtimeAction: string;
  animation: string;
  errorBehavior: string;
  focusBehavior: string;
  keyboardControllerBehavior: string;
};

export type ComponentResponsiveRule = {
  viewport: string;
  sizing: string;
  scalingBehavior: string;
  minMaxDimensions: string;
  collapseBehavior: string;
  textHandling: string;
  touchTarget: string;
};

export type ComponentImplementationRecord = {
  target: ComponentImplementationTarget;
  status: ComponentImplementationStatus;
  implementationPath: string;
  moduleName: string;
  lastVerifiedVersion?: number;
  parityScore: number;
  parityStatus: ComponentParityStatus;
  notes: string;
  knownDeviations: string[];
};

export type ComponentScreenUsage = {
  screenId: string;
  screenName: string;
  variant: string;
  state: string;
  notes: string;
};

export type ComponentReferenceAttachment = {
  id: string;
  type: "Roblox screenshot" | "Vite screenshot" | "source PNG" | "PSD preview" | "wireframe" | "annotated reference" | "design notes" | "Studio specimen";
  source: string;
  viewport: string;
  version: number;
  crop: string;
  notes: string;
  approvalStatus: ComponentApprovalStatus;
  captureSource?: "captured Vite Storybook state" | "captured Roblox reference screenshot" | "Studio-rendered component specimen" | "manually uploaded screenshot";
  previewStatus?: "Pending Generation" | "Generated" | "Needs Review" | "Approved" | "Published" | "Blocked";
  width?: number;
  height?: number;
  format?: "WebP" | "PNG" | "JPG" | "SVG";
  checksum?: string;
  outputRole?: "primary" | "card_thumbnail_256" | "grid_preview_512" | "state_matrix" | "large_1024";
  storybook?: {
    storyId: string;
    state: string;
    variant: string;
    theme: string;
    reducedMotion: boolean;
    captureCrop: string;
    expectedOutputDimensions: string;
  };
  outputs?: Array<{
    role: "primary" | "card_thumbnail_256" | "grid_preview_512" | "state_matrix" | "large_1024";
    source: string;
    width: number;
    height: number;
    format: "WebP" | "PNG" | "JPG" | "SVG";
    checksum: string;
  }>;
  captureBlockers?: string[];
};

export type ComponentReviewEntry = {
  id: string;
  reviewer: string;
  status: ComponentApprovalStatus;
  comments: string;
  requiredChanges: string[];
  date: string;
  approvedVersion?: number;
  implementationTarget?: ComponentImplementationTarget;
};

export type ComponentBreakingChange = {
  id: string;
  type: ComponentChangeType;
  title: string;
  description: string;
  createdAt: string;
  affectedScreenIds: string[];
  migrationNotes: string[];
  resolved: boolean;
};

export type ComponentDesignChecklist = {
  anatomyComplete: boolean;
  tokenReferencesComplete: boolean;
  assetsMapped: boolean;
  requiredStatesComplete: boolean;
  interactionContractComplete: boolean;
  responsiveBehaviorComplete: boolean;
  accessibilityReviewed: boolean;
  implementationTargetsTracked: boolean;
  reviewComplete: boolean;
  approved: boolean;
};

export type ComponentMobileReadiness = {
  touchVariantStatus: "Missing" | "Draft" | "Ready";
  compactVariantStatus: "Missing" | "Draft" | "Ready";
  safeAreaBehavior: "Not Applicable" | "Missing" | "Needs Review" | "Ready";
  accessibilityStatus: "Missing" | "Needs Review" | "Ready";
  iosImplementationStatus: ComponentImplementationStatus;
  androidImplementationStatus: ComponentImplementationStatus;
  minimumTouchTarget: number;
  notes: string[];
};

export type ComponentDesignRecord = {
  id: string;
  componentId: string;
  displayName: string;
  description: string;
  category: ComponentCategory;
  status: ComponentDesignStatus;
  approvalStatus: ComponentApprovalStatus;
  version: number;
  approvedVersion?: number;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  designTokens: ComponentTokenReference[];
  dimensions: string;
  layoutRules: string[];
  anatomy: ComponentAnatomyPart[];
  assetKeys: ComponentAssetReference[];
  dataInputs: ComponentDataInput[];
  states: ComponentStateSpec[];
  variants: ComponentVariant[];
  interactions: ComponentInteraction[];
  responsiveRules: ComponentResponsiveRule[];
  motionRules: string[];
  accessibilityRequirements: string[];
  implementationTargets: ComponentImplementationRecord[];
  screenUsages: ComponentScreenUsage[];
  references: ComponentReferenceAttachment[];
  reviewHistory: ComponentReviewEntry[];
  breakingChanges: ComponentBreakingChange[];
  notes: string[];
  mobileReadiness: ComponentMobileReadiness;
  frozenApprovedVersion?: ComponentDesignRecord;
};

export type ComponentDesignSummary = Pick<ComponentDesignRecord, "id" | "componentId" | "displayName" | "description" | "category" | "status" | "approvalStatus" | "version" | "assignedTo" | "updatedAt" | "implementationTargets" | "screenUsages" | "variants" | "breakingChanges"> & {
  missingAssets: number;
  missingStates: number;
  stateCount: number;
  parityStatus: ComponentParityStatus;
  checklistComplete: number;
  checklistTotal: number;
  visualPreview: VisualPreview;
  mobileReadiness: ComponentMobileReadiness;
};

export type ComponentLibraryState = {
  components: ComponentDesignSummary[];
  records: ComponentDesignRecord[];
  stats: {
    total: number;
    notStarted: number;
    inDesign: number;
    approved: number;
    implemented: number;
    parityApproved: number;
    missingAssets: number;
    missingStates: number;
    breakingChanges: number;
    screensAffectedByPendingChanges: number;
    componentPreviewsPending: number;
    componentPreviewsGenerated: number;
    componentPreviewsNeedsReview: number;
    componentPreviewsApproved: number;
    componentPreviewsBlockedByMissingImplementation: number;
    componentPreviewsBlockedByMissingBrowserCapture: number;
    componentPreviewsBlockedByMissingArt: number;
    mobileReadyComponents: number;
    touchBlockers: number;
    safeAreaBlockers: number;
    iosBlockers: number;
    androidBlockers: number;
  };
  generatedAt: string;
};

const storePath = process.env.PROJECT_GENESIS_COMPONENT_LIBRARY_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_COMPONENT_LIBRARY_STORE)
  : path.join(process.cwd(), "data", "component-library.local.json");

const viewports = ["1366x768", "1440x900", "1920x1080", "2560x1440", "3440x1440", "3840x2160", "ios-phone-landscape", "android-phone-landscape", "ios-tablet-landscape", "android-tablet-landscape"];
const commonStates = ["Default", "Hover", "Pressed", "Focused", "Selected", "Active", "Disabled", "Locked", "Loading", "Empty", "Error", "Success", "Affordable", "Unaffordable", "Maxed", "Missing Data", "Reduced Motion", "Touch", "Compact"];

function slug(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function checklist(input: Partial<ComponentDesignChecklist>): ComponentDesignChecklist {
  return {
    anatomyComplete: false,
    tokenReferencesComplete: false,
    assetsMapped: false,
    requiredStatesComplete: false,
    interactionContractComplete: false,
    responsiveBehaviorComplete: false,
    accessibilityReviewed: false,
    implementationTargetsTracked: false,
    reviewComplete: false,
    approved: false,
    ...input
  };
}

function token(group: ComponentTokenReference["group"], tokenId: string, usage: string): ComponentTokenReference {
  return { group, tokenId, usage };
}

function anatomyPart(id: string, label: string, source: ComponentAnatomyPart["source"], notes = ""): ComponentAnatomyPart {
  return { id, label, source, required: true, notes };
}

function assetRef(label: string, assetKey: string, status: ComponentAssetReference["status"] = "Missing"): ComponentAssetReference {
  return { id: `asset-${assetKey}`, label, assetKey, required: true, status, notes: "Semantic asset key only; private source paths stay in Asset Production." };
}

function dataInput(id: string, label: string, type: string, classification: ComponentDataClassification, notes = ""): ComponentDataInput {
  return { id, label, type, classification, required: true, notes };
}

function states(required: string[], designed: string[] = required) {
  const designedSet = new Set(designed);
  return required.map((label) => ({
    id: slug(label),
    label,
    required: true,
    designed: designedSet.has(label),
    notes: designedSet.has(label) ? "State is included in the component spec." : "Required state still needs design treatment."
  }));
}

function variant(id: string, displayName: string, allowedStates: string[], guidance = "Use where the screen-specific context matches this variant."): ComponentVariant {
  return {
    id,
    displayName,
    visualDifferences: `${displayName} treatment uses documented token and asset overrides.`,
    tokenOverrides: [],
    assetOverrides: [],
    behaviorDifferences: "No gameplay rule changes; only presentation and interaction treatment differ.",
    allowedStates,
    usageGuidance: guidance
  };
}

function interaction(id: string, trigger: string, action: string, runtimeAction = "Calls provided action callback."): ComponentInteraction {
  return {
    id,
    trigger,
    action,
    stateTransition: "Default -> Focused/Hover -> Pressed/Active -> Default or Disabled.",
    runtimeAction,
    animation: "Use shared motion tokens and reduced-motion fallback.",
    errorBehavior: "Do not drop focus; expose inline or toast feedback.",
    focusBehavior: "Visible focus ring and deterministic focus return.",
    keyboardControllerBehavior: "Support Tab/Shift+Tab plus Enter/Space where actionable; map controller confirm/cancel where relevant."
  };
}

function responsiveRules(componentId: string): ComponentResponsiveRule[] {
  return viewports.map((viewport) => ({
    viewport,
    sizing: "Uses component min/max sizing and screen layout slot constraints.",
    scalingBehavior: viewport === "3440x1440" || viewport === "3840x2160" ? "Preserve readable density; do not stretch text beyond max content width." : "Scale within layout slot while preserving minimum touch targets.",
    minMaxDimensions: componentId.includes("Button") ? "min 44x44 touch target; width driven by variant" : "Documented by consuming screen layout.",
    collapseBehavior: "Use compact variant where available; otherwise preserve semantics and truncate secondary text.",
    textHandling: "No viewport-width font scaling; truncate optional metadata only.",
    touchTarget: "Minimum 44px interactive target for pointer/touch."
  }));
}

function implementationTargets(componentId: string, viteStatus: ComponentImplementationStatus = "Not Started", robloxStatus: ComponentImplementationStatus = "Not Started"): ComponentImplementationRecord[] {
  return [
    { target: "Vite Web", status: viteStatus, implementationPath: viteStatus === "Not Started" ? "" : `components/game-ui/${componentId}.tsx`, moduleName: componentId, lastVerifiedVersion: viteStatus === "Approved" ? 1 : undefined, parityScore: viteStatus === "Approved" ? 100 : viteStatus === "Implemented" ? 80 : 0, parityStatus: viteStatus === "Approved" ? "Approved" : viteStatus === "Implemented" ? "Close" : "Not Reviewed", notes: "Tracked against the Vite prototype/client implementation.", knownDeviations: [] },
    { target: "Roblox", status: robloxStatus, implementationPath: robloxStatus === "Not Started" ? "" : `ReplicatedStorage/UI/${componentId}`, moduleName: componentId, lastVerifiedVersion: robloxStatus === "Approved" ? 1 : undefined, parityScore: robloxStatus === "Approved" ? 100 : robloxStatus === "Implemented" ? 75 : 0, parityStatus: robloxStatus === "Approved" ? "Approved" : robloxStatus === "Implemented" ? "Close" : "Not Reviewed", notes: "Tracked against Roblox UI parity.", knownDeviations: [] },
    { target: "Unity", status: "Not Started", implementationPath: "", moduleName: componentId, parityScore: 0, parityStatus: "Not Reviewed", notes: "Future client target.", knownDeviations: [] },
    { target: "Unreal", status: "Not Started", implementationPath: "", moduleName: componentId, parityScore: 0, parityStatus: "Not Reviewed", notes: "Future client target.", knownDeviations: [] },
    { target: "Godot", status: "Not Started", implementationPath: "", moduleName: componentId, parityScore: 0, parityStatus: "Not Reviewed", notes: "Future client target.", knownDeviations: [] },
    { target: "iOS", status: "Not Started", implementationPath: "", moduleName: componentId, parityScore: 0, parityStatus: "Not Reviewed", notes: "Future Capacitor mobile target; presentation parity tracked by Studio.", knownDeviations: [] },
    { target: "Android", status: "Not Started", implementationPath: "", moduleName: componentId, parityScore: 0, parityStatus: "Not Reviewed", notes: "Future Capacitor mobile target; presentation parity tracked by Studio.", knownDeviations: [] }
  ];
}

function ensureImplementationTargets(componentId: string, targets: ComponentImplementationRecord[] | undefined) {
  const existing = targets?.length ? targets : implementationTargets(componentId);
  const byTarget = new Map(existing.map((target) => [target.target, target]));
  for (const target of implementationTargets(componentId)) {
    if (!byTarget.has(target.target)) byTarget.set(target.target, target);
  }
  return [...byTarget.values()];
}

function mobileReadiness(componentId: string, overrides: Partial<ComponentMobileReadiness> = {}): ComponentMobileReadiness {
  const safeAreaComponents = new Set(["TopHudBar", "SideNavigationRail", "BottomDrawer", "Modal", "SettingsNavigation"]);
  const touchReadyByDefault = /Button|Control|Counter|Navigation|Drawer|Modal|Card/.test(componentId);
  return {
    touchVariantStatus: touchReadyByDefault ? "Draft" : "Missing",
    compactVariantStatus: "Draft",
    safeAreaBehavior: safeAreaComponents.has(componentId) ? "Needs Review" : "Not Applicable",
    accessibilityStatus: "Needs Review",
    iosImplementationStatus: "Not Started",
    androidImplementationStatus: "Not Started",
    minimumTouchTarget: 48,
    notes: [
      "Mobile presentation variant must not require hover for essential actions.",
      "Use compact/touch variants for iOS and Android shells around the Vite client.",
      "No private implementation paths or store credentials are tracked here."
    ],
    ...overrides
  };
}

function baseRecord(input: {
  componentId: string;
  displayName?: string;
  description: string;
  category: ComponentCategory;
  status?: ComponentDesignStatus;
  approvalStatus?: ComponentApprovalStatus;
  assignedTo?: string;
  dimensions?: string;
  anatomy?: ComponentAnatomyPart[];
  assetKeys?: ComponentAssetReference[];
  dataInputs?: ComponentDataInput[];
  states?: ComponentStateSpec[];
  variants?: ComponentVariant[];
  interactions?: ComponentInteraction[];
  screenUsages?: ComponentScreenUsage[];
  viteStatus?: ComponentImplementationStatus;
  robloxStatus?: ComponentImplementationStatus;
  checklist?: Partial<ComponentDesignChecklist>;
  mobileReadiness?: Partial<ComponentMobileReadiness>;
  notes?: string[];
}): ComponentDesignRecord {
  const now = "2026-07-13T00:00:00.000Z";
  const status = input.status ?? "Draft";
  const approvalStatus = input.approvalStatus ?? "Unreviewed";
  const displayName = input.displayName ?? input.componentId;
  return {
    id: `component-design-${slug(input.componentId)}`,
    componentId: input.componentId,
    displayName,
    description: input.description,
    category: input.category,
    status,
    approvalStatus,
    version: 1,
    approvedVersion: approvalStatus === "Approved" ? 1 : undefined,
    assignedTo: input.assignedTo ?? "Design Systems",
    createdAt: now,
    updatedAt: now,
    designTokens: [
      token("typography", "game-ui.body", "Readable component copy"),
      token("colors", "game-ui.surface", "Base surface and foreground pairing"),
      token("spacing", "game-ui.gap-md", "Internal spacing"),
      token("radii", "game-ui.radius-md", "Default component radius"),
      token("motion", "game-ui.motion-fast", "Interactive state transitions")
    ],
    dimensions: input.dimensions ?? "Responsive to parent layout slot with documented min/max dimensions.",
    layoutRules: ["Use semantic layout slots from Screen Designer.", "Do not hardcode player data in component records.", "Preserve minimum touch target and focus affordances."],
    anatomy: input.anatomy ?? [
      anatomyPart("container", "Container", "CSS/layout"),
      anatomyPart("content", "Content layer", "runtime data"),
      anatomyPart("state-layer", "Interactive state layer", "interaction state")
    ],
    assetKeys: input.assetKeys ?? [],
    dataInputs: input.dataInputs ?? [dataInput("presentationState", "Presentation state", "ComponentState", "Local Interaction State")],
    states: input.states ?? states(["Default", "Hover", "Focused", "Disabled", "Loading", "Error"], ["Default", "Hover", "Focused"]),
    variants: input.variants ?? [variant("default", "Default", ["Default", "Hover", "Focused", "Disabled"])],
    interactions: input.interactions ?? [interaction("activate", "Pointer/touch/Enter/Space", "Invoke provided component action")],
    responsiveRules: responsiveRules(input.componentId),
    motionRules: ["Use shared motion duration/easing tokens.", "Reduced motion removes nonessential transforms.", "Do not encode pixel-specific animation into canonical game data."],
    accessibilityRequirements: ["Visible focus state.", "Keyboard reachable when interactive.", "Controller behavior documented where applicable.", "Accessible label or text alternative required for icon-only controls."],
    implementationTargets: implementationTargets(input.componentId, input.viteStatus, input.robloxStatus),
    screenUsages: input.screenUsages ?? [],
    references: [],
    reviewHistory: approvalStatus === "Approved" ? [{ id: `review-${slug(input.componentId)}-initial`, reviewer: "Design Systems", status: "Approved", comments: "Seeded approved baseline from existing Studio implementation.", requiredChanges: [], date: now, approvedVersion: 1, implementationTarget: "Vite Web" }] : [],
    breakingChanges: [],
    notes: input.notes ?? ["Starter component record created by Component Library v1.0."],
    mobileReadiness: mobileReadiness(input.componentId, input.mobileReadiness),
    frozenApprovedVersion: undefined,
    ...(approvalStatus === "Approved" ? { frozenApprovedVersion: undefined } : {}),
  };
}

function usage(screenId: string, screenName: string, variantId = "default", state = "Default", notes = "Referenced by seeded Screen Designer starter records."): ComponentScreenUsage {
  return { screenId, screenName, variant: variantId, state, notes };
}

const buttonStates = ["Default", "Hover", "Pressed", "Focused", "Disabled", "Loading", "Error", "Reduced Motion"];
const drawerStates = ["Closed", "Opening", "Open", "Closing", "Empty", "Populated", "Reduced Motion"];

function namedComponent(componentId: string, category: ComponentCategory, description: string, screenUsages: ComponentScreenUsage[] = []) {
  return baseRecord({ componentId, category, description, screenUsages });
}

const appShellComponentRecords: ComponentDesignRecord[] = [
  baseRecord({
    componentId: "NoverisAppShell",
    category: "Panels",
    description: "Persistent global civilization app shell that owns TopHudBar, SideNavigationRail, MainWorkspaceSlot, global overlays, modals, notifications, and calibration layers.",
    dimensions: "3840x2160 master shell with derived desktop/mobile profiles.",
    dataInputs: [dataInput("shellId", "Shell ID", "string", "Presentation Hint"), dataInput("shellVersion", "Shell version", "number", "Presentation Hint"), dataInput("activeScreenId", "Active workspace screen ID", "string", "Local Interaction State")],
    states: states(["Default", "Loading", "Error", "Reduced Motion"], ["Default", "Loading", "Error"]),
    variants: [variant("desktop-4k", "Desktop 4K", ["Default", "Loading"]), variant("desktop-1080", "Desktop 1080", ["Default", "Loading"]), variant("mobile-landscape", "Mobile Landscape", ["Default", "Loading"])],
    screenUsages: [usage(appShellId, "NOVERIS App Shell")],
    notes: ["Global-only. Route screens must not duplicate this component; they target MainWorkspaceSlot."]
  }),
  baseRecord({
    componentId: "MainWorkspaceSlot",
    category: "Utility",
    description: "Stable shell-owned mount point for normal route workspaces. Navigation changes replace this slot only.",
    dimensions: "Shell x464 y260 w3244 h1804 at 4K.",
    dataInputs: [dataInput("workspaceSlotId", "Workspace slot ID", "string", "Presentation Hint"), dataInput("routeMetadata", "Route metadata", "ScreenNavigationMetadata", "Presentation Hint")],
    states: states(["Empty", "Populated", "Loading", "Error"], ["Empty", "Populated", "Loading"]),
    variants: [variant("desktop", "Desktop", ["Empty", "Populated"]), variant("mobile-drawer-nav", "Mobile Drawer Nav", ["Empty", "Populated"])],
    screenUsages: [usage(appShellId, "NOVERIS App Shell")],
    notes: ["Global-only mount point. It may contain RouteWorkspaceRoot children, but not TopHudBar or SideNavigationRail children."]
  }),
  baseRecord({
    componentId: "GlobalOverlayRoot",
    category: "Overlays",
    description: "Shell-owned global overlay host for notifications, global status surfaces, settings/global modals, and blocking overlays that must survive route changes.",
    dimensions: "Full shell 3840x2160, with modal-safe child bounds.",
    dataInputs: [dataInput("globalOverlayState", "Global overlay state", "GlobalOverlayState", "Local Interaction State")],
    states: states(["Default", "Notification", "Modal Open", "Blocking", "Hidden"], ["Default", "Notification", "Modal Open", "Blocking"]),
    variants: [variant("overlay", "Overlay", ["Default", "Notification"]), variant("modal-root", "Modal Root", ["Modal Open", "Blocking"]), variant("notification", "Notification", ["Notification"])],
    screenUsages: [usage(appShellId, "NOVERIS App Shell")],
    notes: ["Global-only. Local route overlays use LocalOverlayRoot."]
  }),
  baseRecord({
    componentId: "RouteWorkspaceRoot",
    category: "Utility",
    description: "Workspace-only root component for a route screen mounted inside MainWorkspaceSlot.",
    dimensions: "Workspace-local x0 y0 w3244 h1804.",
    dataInputs: [dataInput("screenId", "Route screen ID", "string", "Presentation Hint"), dataInput("shellId", "Parent shell ID", "string", "Presentation Hint")],
    states: states(["Default", "Loading", "Error", "Empty"], ["Default", "Loading", "Error"]),
    variants: [variant("workspace-only", "Workspace Only", ["Default", "Loading"]), variant("shell-context", "Shell Context", ["Default", "Loading"]), variant("full-composition", "Full Composition Preview", ["Default", "Loading"])],
    screenUsages: [usage("civilization-command", "Civilization Command"), usage("research", "Research"), usage("buildings", "Buildings"), usage("upgrades", "Upgrades"), usage("civilization", "Civilization"), usage("events", "Events"), usage("galaxy", "Galaxy"), usage("spaceport", "Spaceport")],
    notes: ["Workspace-only. It must not include persistent HUD or navigation children."]
  }),
  baseRecord({
    componentId: "WorkspaceBackground",
    category: "Utility",
    description: "Workspace-local background placeholder or art layer for route-specific screens.",
    dimensions: "Fills the MainWorkspaceSlot local canvas.",
    assetKeys: [assetRef("Workspace background", "workspace_background", "Pending Art")],
    dataInputs: [dataInput("workspaceBackgroundAsset", "Workspace background asset", "AssetReference", "Presentation Hint")],
    states: states(["Placeholder", "Ready", "Missing Art", "Loading"], ["Placeholder", "Ready", "Missing Art"]),
    screenUsages: [usage("civilization-command", "Civilization Command"), usage("research", "Research")],
    notes: ["Workspace-only. Global shell background remains in NoverisAppShell."]
  }),
  baseRecord({
    componentId: "LocalOverlayRoot",
    category: "Overlays",
    description: "Workspace-owned overlay host for local tooltips, selection previews, local drawers, and local non-global modals.",
    dimensions: "Workspace-local x0 y0 w3244 h1804.",
    dataInputs: [dataInput("localOverlayState", "Local overlay state", "LocalOverlayState", "Local Interaction State")],
    states: states(["Default", "Tooltip", "Drawer Open", "Modal Open", "Hidden"], ["Default", "Tooltip", "Drawer Open", "Modal Open"]),
    screenUsages: [usage("research", "Research"), usage("buildings", "Buildings"), usage("galaxy", "Galaxy")],
    notes: ["Workspace-only. Use GlobalOverlayRoot for settings, notifications, and global blockers."]
  }),
  baseRecord({
    componentId: "FullScreenTakeover",
    category: "Overlays",
    description: "Explicit full-screen shell bypass for loading, welcome/login, password reset, blocking save conflict, cinematics, major era transitions, mandatory tutorial takeovers, and critical maintenance/error states.",
    dimensions: "Full viewport/shell canvas with safe-area variants.",
    dataInputs: [dataInput("takeoverType", "Takeover type", "FullScreenTakeoverType", "Presentation Hint")],
    states: states(["Default", "Loading", "Blocking", "Error", "Reduced Motion"], ["Default", "Loading", "Blocking", "Error"]),
    variants: [variant("loading", "Loading", ["Loading"]), variant("welcome-login", "Welcome/Login", ["Default"]), variant("save-conflict", "Save Conflict", ["Blocking"]), variant("cinematic", "Cinematic", ["Default", "Reduced Motion"])],
    screenUsages: [usage("welcome", "Welcome"), usage("login", "Login"), usage("loading", "Loading"), usage("save-conflict", "Save Conflict")],
    notes: ["Only explicitly marked full-screen takeover screens may use this component."]
  })
];

const researchMasterComponentRecords: ComponentDesignRecord[] = [
  baseRecord({
    componentId: "ImagePlaceholder",
    category: "Utility",
    description: "Builder-only replaceable image placeholder that displays label, component type, bounds, linked asset, and placeholder status without baking text into final art.",
    assetKeys: [assetRef("Pending image asset", "placeholder_image", "Pending Art")],
    dataInputs: [dataInput("assetRequirement", "Asset requirement", "ScreenAssetRequirement", "Presentation Hint")],
    states: states(["Placeholder", "Missing Art", "Ready", "Selected", "Locked"], ["Placeholder", "Missing Art", "Selected", "Locked"]),
    variants: [variant("full-screen", "Full Screen", ["Placeholder", "Ready"]), variant("panel", "Panel", ["Placeholder", "Ready"]), variant("icon", "Icon", ["Placeholder", "Ready"])],
    screenUsages: [usage("research", "Research", "full-screen", "Placeholder")]
  }),
  baseRecord({
    componentId: "ResearchHeader",
    category: "HUD",
    description: "Research screen title/header region with editable icon, title, subtitle, and optional status metadata.",
    assetKeys: [assetRef("Research header icon", "research_header_icon", "Pending Art")],
    dataInputs: [dataInput("title", "Screen title", "string", "Presentation Hint"), dataInput("subtitle", "Screen subtitle", "string", "Presentation Hint")],
    states: states(["Default", "Loading", "Error"], ["Default"]),
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "ResearchBranchHeader",
    category: "Panels",
    description: "Selected branch header with branch title, description, hero/background placeholder, progress label, percentage, and progress bar.",
    assetKeys: [assetRef("Branch header background", "research_branch_header_background", "Pending Art")],
    dataInputs: [dataInput("branch", "Selected branch", "ResearchBranch", "Canonical Studio Definition"), dataInput("branchProgress", "Branch progress", "BranchProgress", "Player Runtime State")],
    states: states(["Default", "Loading", "Empty", "Error"], ["Default", "Loading"]),
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "ResearchScreenShell",
    category: "Panels",
    description: "4K Visual Screen Builder shell for the Research management screen with reference, background, HUD, navigation, workspace, timeline, modal, and overlay layers.",
    dimensions: "3840x2160 master canvas with desktop_1080 derived at 0.5 scale.",
    assetKeys: [assetRef("Research background", "research_screen_background", "Pending Art")],
    dataInputs: [dataInput("screenLayout", "4K screen layout", "ScreenLayoutSpec", "Presentation Hint"), dataInput("canonicalHudSlots", "HUD slot order", "HudResourceSlot[]", "Presentation Hint")],
    states: states(["Default", "Loading", "Error", "Offline", "Mobile Compact", "Tablet"], ["Default", "Loading", "Error", "Mobile Compact", "Tablet"]),
    variants: [variant("desktop-4k", "Desktop 4K", ["Default", "Loading"]), variant("desktop-1080", "Desktop 1080", ["Default", "Loading"]), variant("tablet", "Tablet", ["Tablet"]), variant("phone-landscape", "Phone Landscape", ["Mobile Compact"])],
    interactions: [interaction("toggle-reference-overlay", "Builder reference controls", "Show/hide or adjust locked reference overlay", "Studio-only authoring state.")],
    screenUsages: [usage("research", "Research", "master-placeholder", "Default")],
    notes: ["Studio-only draft shell; not exported to public runtime."]
  }),
  baseRecord({
    componentId: "ResearchBranchSidebar",
    category: "Lists",
    description: "Scrollable research discipline list with selected, hover, locked, disabled, and progress states.",
    assetKeys: [assetRef("Branch row backgrounds", "research_branch_row_backgrounds", "Pending Art"), assetRef("Branch icons", "research_branch_icons", "Pending Art")],
    dataInputs: [dataInput("branches", "Research branches", "ResearchBranch[]", "Canonical Studio Definition"), dataInput("branchProgress", "Branch progress", "BranchProgress[]", "Player Runtime State"), dataInput("selectedResearchBranchId", "Selected branch", "string", "Local Interaction State")],
    states: states(["Default", "Hover", "Focused", "Selected", "Locked", "Disabled", "Loading", "Empty"], ["Default", "Hover", "Focused", "Selected", "Locked", "Disabled"]),
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "ResearchBranchRow",
    category: "Lists",
    description: "Single research branch row with icon, branch label, completed/total counts, selected state, hover state, locked state, and disabled state.",
    assetKeys: [assetRef("Branch icon", "research_branch_icons", "Pending Art"), assetRef("Branch row frame", "research_branch_row_backgrounds", "Pending Art")],
    dataInputs: [dataInput("branchName", "Branch name", "string", "Canonical Studio Definition"), dataInput("completedResearchCount", "Completed count", "number", "Player Runtime State"), dataInput("totalResearchCount", "Total count", "number", "Canonical Studio Definition")],
    states: states(["Default", "Hover", "Focused", "Selected", "Locked", "Disabled"], ["Default", "Hover", "Focused", "Selected", "Locked", "Disabled"]),
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "ResearchProgressSummary",
    category: "Progress",
    description: "Total Research summary block with icon, label, completed count, total count, and optional progress bar.",
    assetKeys: [assetRef("Total research icon", "research_total_progress_icon", "Pending Art")],
    dataInputs: [dataInput("totalResearchProgress", "Total progress", "ResearchProgressSummary", "Player Runtime State")],
    states: states(["Default", "Loading", "Empty", "Error"], ["Default", "Loading"]),
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "ResearchTreeCanvas",
    category: "Game-Specific",
    description: "Pan/zoom node canvas for canonical research progression, branch filtering, connectors, lock/completed/available/researching states, and touch interaction.",
    assetKeys: [assetRef("Research tree background", "research_tree_background", "Pending Art")],
    dataInputs: [dataInput("researchGraph", "Research graph", "ResearchGraph", "Canonical Studio Definition"), dataInput("nodeStates", "Node states", "ResearchNodeState[]", "Player Runtime State")],
    states: states(["Default", "Panning", "Zooming", "Node Selected", "Loading", "Empty", "Error"], ["Default", "Panning", "Zooming", "Node Selected"]),
    interactions: [interaction("pan-tree", "Pointer drag/touch pan", "Pan research graph viewport", "Local viewport state."), interaction("zoom-tree", "Wheel/pinch/zoom controls", "Zoom research graph viewport", "Local viewport state."), interaction("select-node", "Node activation", "Select node and update detail panel", "Reads canonical node plus runtime state.")],
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "ResearchNode",
    category: "Game-Specific",
    description: "Research graph node with icon, title, level, max level, requirement indicator, connection anchors, and selected/completed/available/locked/researching states.",
    assetKeys: [assetRef("Research node circles", "research_node_circles", "Pending Art"), assetRef("Research node selected frame", "research_node_frame_selected", "Pending Art"), assetRef("Research node locked frame", "research_node_frame_locked", "Pending Art")],
    dataInputs: [dataInput("researchNode", "Research node", "ResearchDefinition", "Canonical Studio Definition"), dataInput("nodeState", "Node state", "ResearchNodeRuntimeState", "Player Runtime State")],
    states: states(["Default", "Hover", "Focused", "Selected", "Completed", "Available", "Locked", "Researching", "Unavailable", "Requirement Missing"], ["Default", "Hover", "Focused", "Selected", "Completed", "Available", "Locked"]),
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "ResearchConnection",
    category: "Progress",
    description: "Editable research graph connection line for prerequisite, unlock, branch path, and optional dependency relationships.",
    assetKeys: [assetRef("Research connection lines", "research_connection_lines", "Pending Art")],
    dataInputs: [dataInput("connection", "Research connection", "ResearchConnectionDefinition", "Canonical Studio Definition"), dataInput("connectionState", "Connection state", "ResearchConnectionState", "Player Runtime State")],
    states: states(["Inactive", "Available", "Completed", "Selected Path", "Locked"], ["Inactive", "Available", "Completed", "Selected Path", "Locked"]),
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "ResearchDetailPanel",
    category: "Panels",
    description: "Right-side selected research detail panel for title, level/status, icon, description, benefits, unlocks, requirements, cost, duration, and primary action.",
    assetKeys: [assetRef("Research detail panel frame", "research_detail_panel_frame", "Pending Art")],
    dataInputs: [dataInput("selectedResearch", "Selected research", "ResearchDefinition", "Canonical Studio Definition"), dataInput("selectedResearchState", "Selected node state", "ResearchNodeRuntimeState", "Player Runtime State")],
    states: states(["Default", "Node Selected", "Locked", "Completed", "Researching", "Loading", "Error"], ["Default", "Node Selected", "Locked", "Completed", "Researching"]),
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({ componentId: "ResearchBenefitRow", category: "Data Display", description: "Benefit row with icon, label, value, positive/negative formatting, percentage, flat value, and multiplier support.", assetKeys: [assetRef("Benefit icons", "research_benefit_icons", "Pending Art")], dataInputs: [dataInput("benefit", "Research benefit", "ResearchBenefit", "Canonical Studio Definition")], screenUsages: [usage("research", "Research")] }),
  baseRecord({ componentId: "ResearchUnlockRow", category: "Data Display", description: "Unlock row for canonical building, upgrade, feature, or resource unlock references.", assetKeys: [assetRef("Unlock icons", "research_unlock_icons", "Pending Art")], dataInputs: [dataInput("unlock", "Research unlock", "ResearchUnlock", "Canonical Studio Definition")], screenUsages: [usage("research", "Research")] }),
  baseRecord({ componentId: "ResearchRequirementRow", category: "Data Display", description: "Requirement row with icon, label, level, completion state, progress, and pass/fail indicator.", assetKeys: [assetRef("Requirement icons", "research_requirement_icons", "Pending Art")], dataInputs: [dataInput("requirement", "Research requirement", "ResearchRequirement", "Canonical Studio Definition"), dataInput("playerProgress", "Requirement progress", "RequirementProgress", "Player Runtime State")], screenUsages: [usage("research", "Research")] }),
  baseRecord({ componentId: "ResearchCostDisplay", category: "Game-Specific", description: "Cost display that supports multiple canonical costs, economy icons, sufficient/insufficient state, and non-Research currencies.", assetKeys: [assetRef("Cost icons", "research_cost_icons", "Pending Art")], dataInputs: [dataInput("costs", "Research costs", "CostRow[]", "Canonical Studio Definition"), dataInput("balances", "Player balances", "EconomyBalance[]", "Player Runtime State")], states: states(["Sufficient", "Insufficient", "Multiple Costs", "Loading", "Error"], ["Sufficient", "Insufficient", "Multiple Costs"]), screenUsages: [usage("research", "Research")] }),
  baseRecord({ componentId: "ResearchDurationDisplay", category: "Data Display", description: "Duration display with instant state and reduced-duration modifiers.", assetKeys: [assetRef("Duration icon", "research_duration_icon", "Pending Art")], dataInputs: [dataInput("duration", "Research duration", "DurationDefinition", "Canonical Studio Definition"), dataInput("modifiers", "Duration modifiers", "ResearchDurationModifier[]", "Player Runtime State")], states: states(["Default", "Instant", "Reduced", "Loading"], ["Default", "Instant", "Reduced"]), screenUsages: [usage("research", "Research")] }),
  baseRecord({
    componentId: "ResearchActionButton",
    category: "Buttons",
    description: "Image-backed research primary action supporting Start Research, Researching, Complete, Locked, Requirements Missing, Insufficient Resources, Queue Full, and Already Completed.",
    assetKeys: [assetRef("Start Research button", "research_start_button", "Pending Art")],
    dataInputs: [dataInput("actionState", "Research action state", "ResearchActionState", "Player Runtime State")],
    states: states(["Start Research", "Researching", "Complete", "Locked", "Requirements Missing", "Insufficient Resources", "Queue Full", "Already Completed"], ["Start Research", "Researching", "Complete", "Locked", "Requirements Missing", "Insufficient Resources", "Queue Full", "Already Completed"]),
    variants: [variant("image-backed", "Image-backed", ["Start Research", "Researching", "Locked", "Insufficient Resources"])],
    screenUsages: [usage("research", "Research")]
  }),
  baseRecord({
    componentId: "EraResearchTimeline",
    category: "Progress",
    description: "Bottom research-era availability timeline bound to canonical era definitions with current, completed, available, locked, preview, and progress connection states.",
    assetKeys: [assetRef("Era timeline background", "research_era_timeline_background", "Pending Art"), assetRef("Current era node", "research_current_era_node", "Pending Art"), assetRef("Locked era node", "research_locked_era_node", "Pending Art")],
    dataInputs: [dataInput("eras", "Era definitions", "EraDefinition[]", "Canonical Studio Definition"), dataInput("eraResearchProgress", "Era research progress", "EraResearchProgress[]", "Player Runtime State")],
    states: states(["Default", "Current", "Completed", "Available", "Locked", "Preview"], ["Default", "Current", "Completed", "Available", "Locked", "Preview"]),
    screenUsages: [usage("research", "Research")]
  })
];

const dashboardComponentRecords: ComponentDesignRecord[] = [
  baseRecord({
    componentId: "SideNavigationRail",
    description: "Persistent Studio/game navigation rail with active/inactive, locked, and notification states.",
    category: "Navigation",
    status: "Implemented",
    approvalStatus: "Unreviewed",
    viteStatus: "Implemented",
    robloxStatus: "Needs Parity Review",
    anatomy: [anatomyPart("rail-background", "Rail background", "CSS/layout"), anatomyPart("nav-section", "Navigation section", "runtime data"), anatomyPart("active-indicator", "Active item indicator", "interaction state"), anatomyPart("collapse-control", "Collapse control", "interaction state")],
    assetKeys: [assetRef("Navigation background", "dashboard_nav_background", "Needs Web Mapping")],
    states: states(["Default", "Hover", "Focused", "Selected", "Active", "Disabled", "Locked", "Missing Data", "Reduced Motion"], ["Default", "Hover", "Focused", "Selected", "Active", "Disabled"]),
    variants: [variant("expanded", "Expanded", ["Default", "Active", "Locked"]), variant("compact", "Compact", ["Default", "Active", "Locked"]), variant("notification", "Notification", ["Default", "Active"])],
    interactions: [interaction("select-nav-item", "Click/tap/Enter a navigation item", "Navigate to selected screen", "Client router navigation."), interaction("collapse-rail", "Click collapse control", "Toggle compact rail", "Local preference update.")],
    screenUsages: [usage("dashboard", "Dashboard"), usage("settings", "Settings")]
  }),
  baseRecord({
    componentId: "TopHudBar",
    description: "Top HUD strip for the fixed five-slot economy order and utility controls. Slot order is canonical and does not change by era.",
    category: "HUD",
    status: "In Design",
    viteStatus: "In Progress",
    robloxStatus: "In Progress",
    anatomy: [anatomyPart("hud-surface", "HUD surface", "CSS/layout"), anatomyPart("economy-slots", "Economy slots", "runtime data"), anatomyPart("utility-controls", "Utility controls", "interaction state")],
    assetKeys: [
      assetRef("Top HUD background", "top_hud_background", "Pending Art"),
      assetRef("Civilization identity frame", "civilization_identity_frame", "Pending Art"),
      assetRef("Labor icon", "economy_labor", "Pending Art"),
      assetRef("Credits icon", "economy_credits", "Pending Art"),
      assetRef("Population icon", "economy_population", "Pending Art"),
      assetRef("Research icon", "economy_research", "Pending Art"),
      assetRef("Premium Crystal icon", "economy_premium_crystals", "Pending Art")
    ],
    dataInputs: [dataInput("primaryHudResources", "Fixed HUD resource IDs", "string[]", "Presentation Hint"), dataInput("primaryHudSlots", "Fixed HUD slot metadata", "HudResourceSlot[]", "Presentation Hint"), dataInput("eraEconomyProfile", "Era economy behavior and display overrides", "EraEconomyProfile", "Canonical Studio Definition"), dataInput("economyBalances", "Economy balances and rates", "EconomyState[]", "Player Runtime State")],
    notes: [
      "Fixed order: ECON-LABOR, ECON-CREDITS, ECON-POPULATION, ECON-RESEARCH, ECON-PREMIUM-CRYSTALS.",
      "Era profiles may change labels and primary/click behavior, but must not reorder these five slots.",
      "First slot is Labor in Survival; Credits remains visible in slot 2 at zero and is not the click target."
    ],
    screenUsages: [usage("dashboard", "Dashboard"), usage("resources", "Resources")]
  }),
  baseRecord({
    componentId: "HudEconomySlot",
    description: "Compact HUD resource/economy slot with icon, balance, rate, and premium state. Economy identity comes from economyId and never from slot position.",
    category: "HUD",
    status: "In Design",
    viteStatus: "In Progress",
    robloxStatus: "In Progress",
    assetKeys: [assetRef("Economy icon", "economy_counter_icon", "Needs Approval"), assetRef("Labor icon", "economy_labor", "Pending Art")],
    dataInputs: [dataInput("definitionId", "Economy definition ID", "GenesisId", "Canonical Studio Definition"), dataInput("displayNameOverride", "Era display label override", "string | null", "Canonical Studio Definition"), dataInput("iconKey", "Economy icon key", "string", "Presentation Hint"), dataInput("balance", "Current balance", "number", "Player Runtime State"), dataInput("rate", "Current rate", "number", "Player Runtime State"), dataInput("premium", "Premium flag", "boolean", "Canonical Studio Definition")],
    states: states(["Default", "Hover", "Focused", "Loading", "Error", "Success", "Missing Data", "Reduced Motion"], ["Default", "Hover", "Focused", "Loading", "Missing Data"]),
    notes: [
      "Resolve icon by economy definition iconKey. ECON-LABOR uses economy_labor and must not borrow the Credits coin icon.",
      "Apply era display override for the label only; balances/rates come from Player Runtime."
    ],
    screenUsages: [usage("dashboard", "Dashboard"), usage("resources", "Resources")]
  }),
  baseRecord({
    componentId: "UtilityIconButton",
    description: "Icon-only utility action button with tooltip, focus label, and disabled prevention.",
    category: "Navigation",
    status: "Implemented",
    viteStatus: "Implemented",
    robloxStatus: "Needs Parity Review",
    assetKeys: [
      assetRef("Add Crystals button", "top_hud_add_crystals_button", "Pending Art"),
      assetRef("Calendar button", "top_hud_calendar_button", "Pending Art"),
      assetRef("Trophy button", "top_hud_trophy_button", "Pending Art"),
      assetRef("Settings button", "top_hud_settings_button", "Pending Art")
    ],
    states: states(buttonStates, ["Default", "Hover", "Pressed", "Focused", "Disabled"]),
    variants: [variant("default", "Default", buttonStates), variant("danger", "Danger", buttonStates), variant("subtle", "Subtle", buttonStates)],
    interactions: [interaction("activate", "Pointer/touch/Enter/Space", "Invoke utility action"), interaction("show-tooltip", "Hover/focus", "Show tooltip without stealing focus", "Local interaction state only.")],
    screenUsages: [usage("dashboard", "Dashboard"), usage("settings", "Settings")]
  }),
  baseRecord({
    componentId: "ClickPowerControl",
    description: "Primary click-power control with ring, icon/hand artwork, press feedback, cooldown, and gain state.",
    category: "Game-Specific",
    status: "In Design",
    viteStatus: "In Progress",
    robloxStatus: "In Progress",
    anatomy: [anatomyPart("click-ring", "Click ring", "source art"), anatomyPart("button-plate", "Button plate", "source art"), anatomyPart("hit-area", "Interactive hit area", "CSS/layout"), anatomyPart("gain-feedback", "Gain feedback", "interaction state"), anatomyPart("cooldown-state", "Cooldown layer", "runtime data")],
    assetKeys: [assetRef("Click ring", "dashboard_click_ring", "Needs Approval"), assetRef("Click button", "dashboard_click_button", "Needs Web Mapping")],
    dataInputs: [dataInput("clickPower", "Current click power", "number", "Player Runtime State"), dataInput("cooldown", "Cooldown state", "number", "Local Interaction State"), dataInput("gainState", "Gain feedback state", "GainState", "Local Interaction State")],
    states: states(["Default", "Hover", "Pressed", "Focused", "Active", "Disabled", "Loading", "Error", "Success", "Reduced Motion"], ["Default", "Hover", "Pressed", "Focused", "Active"]),
    variants: [variant("default", "Default", buttonStates), variant("boosted", "Boosted", ["Default", "Hover", "Pressed", "Active"]), variant("locked", "Locked", ["Locked", "Disabled"])],
    interactions: [interaction("click-power", "Pointer/touch/Enter/Space", "Trigger click gain feedback", "Player runtime click action supplied by game client.")],
    screenUsages: [usage("dashboard", "Dashboard")]
  }),
  baseRecord({
    componentId: "AutoClickControl",
    description: "Automation toggle with on/off state, AI agent reference, ring assets, and disabled/locked treatment.",
    category: "Game-Specific",
    status: "In Design",
    viteStatus: "In Progress",
    robloxStatus: "In Progress",
    assetKeys: [assetRef("Automation ring", "dashboard_auto_ring", "Needs Approval"), assetRef("Automation on button", "dashboard_auto_button_on", "Needs Web Mapping"), assetRef("Automation off button", "dashboard_auto_button_off", "Needs Web Mapping")],
    dataInputs: [dataInput("aiAgentId", "AI Agent ID", "AiAgentId", "Canonical Studio Definition", "Resolve assistant artwork through the AI Agent Library; do not bind this component to a static image asset."), dataInput("automationUnlocked", "Automation unlock state", "boolean", "Player Runtime State"), dataInput("automationActive", "Automation active state", "boolean", "Player Runtime State")],
    states: states(["Default", "Hover", "Pressed", "Focused", "Active", "Disabled", "Locked", "Loading", "Error", "Reduced Motion"], ["Default", "Hover", "Pressed", "Focused", "Active", "Locked"]),
    variants: [variant("off", "Off", ["Default", "Hover", "Pressed"]), variant("on", "On", ["Active", "Hover", "Pressed"]), variant("locked", "Locked", ["Locked", "Disabled"])],
    interactions: [interaction("toggle-auto-click", "Pointer/touch/Enter/Space", "Toggle automation state", "Player runtime automation toggle callback.")],
    screenUsages: [usage("dashboard", "Dashboard")]
  }),
  baseRecord({
    componentId: "BottomDrawer",
    description: "Bottom anchored drawer used for boosts, inventory, notifications, and compact contextual content.",
    category: "Overlays",
    status: "Draft",
    anatomy: [anatomyPart("scrim", "Optional scrim", "CSS/layout"), anatomyPart("drawer-surface", "Drawer surface", "CSS/layout"), anatomyPart("drag-handle", "Drag handle", "interaction state"), anatomyPart("content-slot", "Content slot", "runtime data")],
    states: states(drawerStates, ["Closed", "Opening", "Open", "Closing", "Reduced Motion"]),
    variants: [variant("compact", "Compact", drawerStates), variant("full", "Full", drawerStates), variant("boosts", "Boosts", drawerStates), variant("inventory", "Inventory", drawerStates)],
    interactions: [interaction("open-drawer", "Launcher click/tap", "Closed -> Opening -> Open", "Local presentation state."), interaction("close-drawer", "Escape/outside click/cancel", "Open -> Closing -> Closed", "Local presentation state.")],
    screenUsages: [usage("dashboard", "Dashboard"), usage("resources", "Resources")]
  }),
  baseRecord({
    componentId: "EraNode",
    description: "Era progression node with frame, number/icon, lock state, glow, label, progress accent, and connector anchor.",
    category: "Game-Specific",
    status: "In Design",
    viteStatus: "In Progress",
    robloxStatus: "Needs Parity Review",
    anatomy: [anatomyPart("outer-frame", "Outer frame", "source art"), anatomyPart("inner-plate", "Inner plate", "source art"), anatomyPart("number-icon", "Number or icon", "runtime data"), anatomyPart("lock-state", "Lock state", "interaction state"), anatomyPart("current-glow", "Current-state glow", "CSS/layout"), anatomyPart("label", "Label", "runtime data"), anatomyPart("progress-accent", "Progress accent", "runtime data"), anatomyPart("connector-anchor", "Connector anchor", "CSS/layout")],
    assetKeys: [assetRef("Era node frame", "dashboard_era_node_frame", "Needs Approval"), assetRef("Era lock icon", "dashboard_era_lock_icon", "Needs Web Mapping")],
    dataInputs: [dataInput("eraId", "Era ID", "GenesisId", "Canonical Studio Definition"), dataInput("completion", "Era completion", "number", "Player Runtime State"), dataInput("unlockState", "Unlock state", "EraUnlockState", "Player Runtime State")],
    states: states(["Default", "Hover", "Focused", "Selected", "Active", "Locked", "Loading", "Missing Data", "Reduced Motion"], ["Default", "Hover", "Focused", "Selected", "Active", "Locked", "Reduced Motion"]),
    variants: [variant("completed", "Completed", ["Default", "Hover", "Focused"]), variant("current", "Current", ["Active", "Hover", "Focused"]), variant("next", "Next", ["Default", "Locked"]), variant("locked", "Locked", ["Locked", "Disabled"]), variant("mystery", "Mystery", ["Locked", "Missing Data"]), variant("preview", "Preview", ["Default", "Hover"])],
    screenUsages: [usage("dashboard", "Dashboard", "current", "Active"), usage("civilization", "Civilization", "default", "Default")]
  })
];

const initialComponentRecords: ComponentDesignRecord[] = [
  ...dashboardComponentRecords,
  ...appShellComponentRecords,
  namedComponent("NavigationItem", "Navigation", "Reusable navigation item with icon, label, active state, locked state, and notification treatment.", [usage("dashboard", "Dashboard"), usage("settings", "Settings")]),
  namedComponent("BeveledGamePanel", "Panels", "Shared beveled game surface for dense HUD and management panels.", [usage("dashboard", "Dashboard"), usage("research", "Research")]),
  namedComponent("HeroPanel", "Panels", "Large visual panel anchored by hero artwork and minimal overlay controls.", [usage("dashboard", "Dashboard"), usage("civilization", "Civilization")]),
  namedComponent("ObjectivePanel", "Panels", "Objective/task panel with status list and action affordances.", [usage("events", "Events")]),
  namedComponent("StatsPanel", "Panels", "Compact metric group panel for resource, colony, or screen readiness stats.", [usage("dashboard", "Dashboard"), usage("resources", "Resources")]),
  namedComponent("EventPanel", "Panels", "Event content panel with image, time, rewards, and status treatment.", [usage("events", "Events")]),
  namedComponent("AlignmentPanel", "Panels", "Civilization alignment panel for current path and effects.", [usage("civilization", "Civilization")]),
  namedComponent("LeaderboardPanel", "Panels", "Leaderboard surface for ranked rows and empty/error states."),
  baseRecord({
    componentId: "UpgradeCategoryTabs",
    category: "Navigation",
    description: "Canonical upgrade category tab strip that sets selectedUpgradeCategoryId and resolves selected-tab presentation through upgradeCategories[].presentation.",
    dataInputs: [dataInput("upgradeCategories", "Upgrade categories", "UpgradeCategory[]", "Canonical Studio Definition"), dataInput("selectedUpgradeCategoryId", "Selected category", "string", "Local Interaction State")],
    states: states(["workforce", "industry", "science", "technology", "fallback", "missing art", "loading", "selected"], ["workforce", "industry", "science", "technology", "selected"]),
    variants: [variant("default", "Default", ["workforce", "industry", "science", "technology"]), variant("compact", "Compact", ["workforce", "industry", "science", "technology"])],
    screenUsages: [usage("upgrades", "Upgrades")]
  }),
  baseRecord({
    componentId: "UpgradeWorkspaceBackground",
    category: "Panels",
    description: "Category-aware Upgrades workspace background that binds to selectedUpgradeCategory.presentation.backgroundArtKey and falls back to the shared upgrade panel background.",
    assetKeys: [assetRef("Workforce category background", "upgrade_panel_workforce_background", "Pending Art"), assetRef("Industry category background", "upgrade_panel_industry_background", "Pending Art"), assetRef("Science category background", "upgrade_panel_science_background", "Pending Art"), assetRef("Technology category background", "upgrade_panel_technology_background", "Pending Art"), assetRef("Shared fallback background", "upgrade_panel_shared_background", "Needs Approval")],
    dataInputs: [dataInput("selectedUpgradeCategory", "Selected upgrade category", "UpgradeCategory", "Canonical Studio Definition"), dataInput("backgroundArtKey", "Resolved background art key", "string", "Presentation Hint")],
    states: states(["workforce", "industry", "science", "technology", "fallback", "missing art", "loading", "selected"], ["workforce", "industry", "science", "technology", "fallback"]),
    variants: [variant("workspace", "Workspace", ["workforce", "industry", "science", "technology", "fallback"]), variant("shell-context", "Shell Context", ["workforce", "industry", "science", "technology"])],
    screenUsages: [usage("upgrades", "Upgrades")]
  }),
  baseRecord({
    componentId: "UpgradeCategoryView",
    category: "Game-Specific",
    description: "Single Upgrades category workspace view that swaps heading, background, selected tab, and sample upgrade rows from selectedUpgradeCategoryId.",
    dataInputs: [dataInput("selectedUpgradeCategory", "Selected upgrade category", "UpgradeCategory", "Canonical Studio Definition"), dataInput("upgradesByCategory", "Upgrades by category", "Record<string, UpgradeDefinition[]>", "Canonical Studio Definition"), dataInput("categoryBackgroundArtKey", "Category background art key", "string", "Presentation Hint")],
    states: states(["workforce", "industry", "science", "technology", "fallback", "missing art", "loading", "selected"], ["workforce", "industry", "science", "technology", "selected"]),
    variants: [variant("default", "Default", ["workforce", "industry", "science", "technology"]), variant("empty", "Empty", ["fallback", "missing art"])],
    screenUsages: [usage("upgrades", "Upgrades")]
  }),
  baseRecord({
    componentId: "UpgradeList",
    category: "Lists",
    description: "Scrollable upgrade row list filtered by selectedUpgradeCategoryId with category-state visuals and no duplicated category layouts.",
    dataInputs: [dataInput("selectedUpgradeCategoryId", "Selected category ID", "string", "Local Interaction State"), dataInput("upgrades", "Upgrades", "UpgradeDefinition[]", "Canonical Studio Definition"), dataInput("purchasedUpgrades", "Purchased upgrade state", "Record<string, number>", "Player Runtime State")],
    states: states(["workforce", "industry", "science", "technology", "fallback", "missing art", "loading", "selected"], ["workforce", "industry", "science", "technology"]),
    variants: [variant("dense", "Dense", ["workforce", "industry", "science", "technology"]), variant("touch", "Touch", ["workforce", "industry", "science", "technology"])],
    screenUsages: [usage("upgrades", "Upgrades")]
  }),
  namedComponent("UpgradePanel", "Panels", "Upgrade detail panel with cost, requirements, and action state.", [usage("upgrades", "Upgrades")]),
  baseRecord({ componentId: "PrimaryActionButton", category: "Buttons", description: "Primary game action button with required focus, disabled, hover, and pressed states.", states: states(buttonStates, ["Default", "Hover", "Pressed", "Focused", "Disabled"]), variants: [variant("default", "Default", buttonStates), variant("compact", "Compact", buttonStates), variant("large", "Large", buttonStates), variant("destructive", "Destructive", buttonStates), variant("premium", "Premium", buttonStates), variant("image-backed", "Image-backed", buttonStates)], screenUsages: [usage("dashboard", "Dashboard"), usage("research", "Research"), usage("buildings", "Buildings"), usage("resources", "Resources"), usage("events", "Events"), usage("settings", "Settings")] }),
  baseRecord({ componentId: "SecondaryActionButton", category: "Buttons", description: "Secondary action button for supporting commands.", states: states(buttonStates, ["Default", "Hover", "Pressed", "Focused", "Disabled"]), screenUsages: [usage("research", "Research"), usage("settings", "Settings")] }),
  baseRecord({ componentId: "ImageBackedActionButton", category: "Buttons", description: "Image-backed action button with frame, optional text overlay, state layers, and focus indicator.", anatomy: [anatomyPart("base-image", "Base image", "source art"), anatomyPart("text-overlay", "Optional text overlay", "runtime data"), anatomyPart("hit-area", "Interactive hit area", "CSS/layout"), anatomyPart("hover-layer", "Hover layer", "interaction state"), anatomyPart("pressed-layer", "Pressed layer", "interaction state"), anatomyPart("disabled-layer", "Disabled layer", "interaction state"), anatomyPart("focus-indicator", "Focus indicator", "CSS/layout"), anatomyPart("optional-icon", "Optional icon", "runtime data")], assetKeys: [assetRef("Button primary frame", "button_primary_frame", "Needs Approval")], states: states(buttonStates, ["Default", "Hover", "Pressed", "Focused", "Disabled"]), screenUsages: [usage("dashboard", "Dashboard")] }),
  namedComponent("ToggleButton", "Buttons", "Binary or segmented toggle button with selected and disabled states."),
  namedComponent("IconButton", "Buttons", "Icon button with accessible label and tooltip requirement.", [usage("settings", "Settings")]),
  namedComponent("CloseButton", "Buttons", "Standard close/dismiss button for overlays and drawers."),
  namedComponent("BoostLauncherButton", "Buttons", "Boost launcher with availability, cooldown, and premium states.", [usage("dashboard", "Dashboard")]),
  namedComponent("ResourceCard", "Cards", "Resource card with icon, rarity, rate, source, storage, and usage affordances.", [usage("resources", "Resources")]),
  namedComponent("BuildingCard", "Cards", "Building card with art, unlock state, cost, production, and owned count.", [usage("buildings", "Buildings")]),
  namedComponent("ResearchCard", "Cards", "Research card/node with cost, affordability, progress, icon, and unlock state.", [usage("research", "Research")]),
  ...researchMasterComponentRecords,
  namedComponent("UpgradeRow", "Cards", "Upgrade row in tabbed upgrade lists with status and cost.", [usage("upgrades", "Upgrades")]),
  namedComponent("MissionCard", "Cards", "Mission card with objectives, rewards, state, and tracking action.", [usage("events", "Events")]),
  namedComponent("EventCard", "Cards", "Event card with art, timer, reward preview, and status.", [usage("events", "Events")]),
  namedComponent("EraCard", "Cards", "Full civilization timeline era card with art, requirements, and progress.", [usage("civilization", "Civilization")]),
  namedComponent("ArtRequirementCard", "Cards", "Production asset requirement card with source, derivative, approval, and mapping state.", [usage("dashboard", "Dashboard")]),
  namedComponent("ProgressBar", "Progress", "Linear progress bar with label, status, and reduced-motion treatment.", [usage("dashboard", "Dashboard")]),
  namedComponent("EraProgressRail", "Progress", "Compact era progression rail for current journey and full timeline.", [usage("dashboard", "Dashboard"), usage("civilization", "Civilization")]),
  namedComponent("CircularProgress", "Progress", "Circular/ring progress indicator for compact HUD surfaces.", [usage("dashboard", "Dashboard")]),
  namedComponent("SegmentedProgress", "Progress", "Segmented progress meter for milestones or multi-step requirements."),
  namedComponent("ResourceRateIndicator", "Progress", "Resource rate and trend indicator with gain/loss state.", [usage("resources", "Resources")]),
  namedComponent("Modal", "Overlays", "Centered modal with focus trap, confirmation flows, and accessible dismissal.", [usage("settings", "Settings")]),
  namedComponent("Tooltip", "Overlays", "Tooltip with keyboard/focus trigger and screen-reader safe behavior."),
  namedComponent("ContextMenu", "Overlays", "Context menu with roving focus and command list behavior."),
  namedComponent("Popover", "Overlays", "Small anchored contextual popover."),
  namedComponent("ReviewDrawer", "Overlays", "Review and approval drawer used by Studio production workflows."),
  namedComponent("Toast", "Overlays", "Non-blocking feedback message surface."),
  baseRecord({ componentId: "SettingsNavigation", category: "Navigation", description: "Mobile-safe Settings navigation for account, cloud saves, graphics, audio, gameplay, controls, and about panels.", screenUsages: [usage("settings", "Settings"), usage("account", "Account"), usage("cloud-saves", "Cloud Saves")], states: states(["Default", "Touch", "Focused", "Selected", "Disabled", "Compact", "Reduced Motion"], ["Default", "Touch", "Focused", "Compact"]), mobileReadiness: { touchVariantStatus: "Draft", compactVariantStatus: "Draft", safeAreaBehavior: "Needs Review" } }),
  baseRecord({ componentId: "PlayerProfileCard", category: "Cards", description: "Account/profile summary card with guest, signed-in, cloud-sync, and account-deletion affordances.", screenUsages: [usage("account", "Account"), usage("settings", "Settings")], dataInputs: [dataInput("authState", "Authentication state", "AuthState", "Service State"), dataInput("cloudSyncState", "Cloud sync state", "CloudSyncState", "Service State")], states: states(["Default", "Touch", "Focused", "Loading", "Error", "Compact", "Missing Data"], ["Default", "Touch", "Focused", "Compact"]), mobileReadiness: { touchVariantStatus: "Draft", compactVariantStatus: "Draft", safeAreaBehavior: "Not Applicable" } }),
  baseRecord({ componentId: "SaveConflictCard", category: "Cards", description: "Cloud save conflict resolution card with local/cloud comparison and safe destructive actions.", screenUsages: [usage("save-conflict", "Save Conflict"), usage("cloud-saves", "Cloud Saves")], dataInputs: [dataInput("localSave", "Local save summary", "SaveSummary", "Service State"), dataInput("cloudSave", "Cloud save summary", "SaveSummary", "Service State")], states: states(["Default", "Touch", "Focused", "Selected", "Loading", "Error", "Compact"], ["Default", "Touch", "Focused", "Compact"]), mobileReadiness: { touchVariantStatus: "Draft", compactVariantStatus: "Draft", safeAreaBehavior: "Not Applicable" } }),
  namedComponent("LoadingSkeleton", "Feedback", "Skeleton loading pattern with reduced-motion treatment."),
  namedComponent("EmptyState", "Feedback", "Empty content state with optional action and illustration.", [usage("research", "Research")]),
  namedComponent("ErrorState", "Feedback", "Recoverable error state with clear action and accessibility copy."),
  namedComponent("LockedState", "Feedback", "Locked content state with requirement explanation.", [usage("research", "Research")]),
  namedComponent("MissingDataState", "Feedback", "Design-safe missing data state for unresolved runtime/service inputs.", [usage("research", "Research")]),
  namedComponent("SuccessState", "Feedback", "Success confirmation state."),
  namedComponent("CriticalStatsDisplay", "Game-Specific", "Critical stats panel for high-importance production/game metrics.", [usage("dashboard", "Dashboard")]),
  namedComponent("BoostSlot", "Game-Specific", "Boost slot with availability, cooldown, rarity, and timer.", [usage("dashboard", "Dashboard")]),
  baseRecord({
    componentId: "AiAgentPortrait",
    category: "Game-Specific",
    description: "AI assistant portrait renderer that resolves head artwork, eyes, expressions, idle animation, blink animation, and color theme from a canonical AI Agent record.",
    anatomy: [anatomyPart("head-layer", "Head artwork layer", "source art"), anatomyPart("eye-layer", "Eye artwork layer", "source art"), anatomyPart("expression-layer", "Expression layer", "source art"), anatomyPart("state-animation", "Idle/blink animation layer", "interaction state"), anatomyPart("theme-frame", "Color theme frame", "runtime data")],
    dataInputs: [dataInput("aiAgentId", "AI Agent ID", "AiAgentId", "Canonical Studio Definition"), dataInput("agentState", "Agent state", "AiAgentState", "Local Interaction State"), dataInput("expressionVariantId", "Expression variant ID", "string", "Presentation Hint"), dataInput("colorTheme", "Color theme", "AiAgentColorTheme", "Canonical Studio Definition")],
    states: states(["Idle", "Blink", "Thinking", "Working", "Research", "Offline", "Warning", "Celebration"], ["Idle", "Blink", "Thinking", "Offline", "Warning"]),
    variants: [variant("compact", "Compact", ["Idle", "Blink", "Thinking"]), variant("hud", "HUD", ["Idle", "Working", "Warning"]), variant("dialogue", "Dialogue", ["Idle", "Thinking", "Research", "Celebration"]), variant("offline", "Offline", ["Offline"])],
    screenUsages: [usage("dashboard", "Dashboard"), usage("research", "Research"), usage("settings", "Settings")],
    notes: ["Resolve artwork through AI Agents workspace by aiAgentId. Hardcoded assistant image references are not allowed."]
  }),
  baseRecord({
    componentId: "AiAgentStatus",
    category: "Game-Specific",
    description: "Compact status badge for AI agent state, rarity, unlock status, and future voice availability.",
    dataInputs: [dataInput("aiAgentId", "AI Agent ID", "AiAgentId", "Canonical Studio Definition"), dataInput("agentState", "Agent state", "AiAgentState", "Local Interaction State"), dataInput("rarity", "Agent rarity", "AiAgentRarity", "Canonical Studio Definition"), dataInput("voiceProfileStatus", "Voice profile status", "VoiceProfileStatus", "Canonical Studio Definition")],
    states: states(["Idle", "Thinking", "Working", "Research", "Offline", "Warning", "Celebration", "Locked"], ["Idle", "Thinking", "Offline", "Warning"]),
    variants: [variant("chip", "Chip", ["Idle", "Warning", "Offline"]), variant("hud", "HUD", ["Idle", "Thinking", "Working"]), variant("detail", "Detail", ["Idle", "Research", "Celebration"])],
    screenUsages: [usage("dashboard", "Dashboard"), usage("research", "Research")]
  }),
  baseRecord({
    componentId: "AiAgentPanel",
    category: "Game-Specific",
    description: "Dashboard AI Agent panel showing portrait, Labor Assistance, online/offline state, blink behavior, and profile entry action.",
    dataInputs: [dataInput("aiAgentId", "AI Agent ID", "AiAgentId", "Canonical Studio Definition"), dataInput("automationPresentation", "Automation presentation aliases", "AutomationPresentationDefinition", "Canonical Studio Definition"), dataInput("automationPower", "Labor Assistance value", "number", "Player Runtime State"), dataInput("agentOnline", "Agent online/offline state", "boolean", "Player Runtime State")],
    states: states(["Idle", "Blink", "Working", "Thinking", "Offline", "Warning", "Locked", "Missing Art"], ["Idle", "Blink", "Offline", "Warning"]),
    variants: [variant("dashboard", "Dashboard", ["Idle", "Working", "Offline", "Warning"]), variant("compact", "Compact", ["Idle", "Offline"]), variant("profile-entry", "Profile Entry", ["Idle", "Thinking"])],
    screenUsages: [usage("dashboard", "Dashboard")]
  }),
  baseRecord({
    componentId: "AiAgentSelector",
    category: "Game-Specific",
    description: "Selectable AI Agent cosmetic list for default, locked, selected, unavailable, and missing-art states.",
    dataInputs: [dataInput("aiAgents", "AI Agent definitions", "AiAgentDefinition[]", "Canonical Studio Definition"), dataInput("aiAgentVariants", "AI Agent variant definitions", "AiAgentVariantDefinition[]", "Canonical Studio Definition"), dataInput("selectedAiAgentId", "Selected AI Agent ID", "AiAgentId", "Player Runtime State"), dataInput("selectedAiAgentVariantId", "Selected AI Agent variant ID", "AiAgentVariantId", "Player Runtime State")],
    states: states(["Default", "Selected", "Locked", "Unavailable", "Missing Art", "Focused", "Disabled"], ["Default", "Selected", "Locked", "Focused"]),
    variants: [variant("grid", "Grid", ["Default", "Selected", "Locked"]), variant("compact", "Compact", ["Default", "Selected"])],
    screenUsages: [usage("ai-agent-profile", "AI Agent Profile")]
  }),
  baseRecord({
    componentId: "AiAgentCard",
    category: "Cards",
    description: "AI Agent card for rarity, personality, unlock requirements, visual readiness, and platform readiness.",
    dataInputs: [dataInput("aiAgentId", "AI Agent ID", "AiAgentId", "Canonical Studio Definition"), dataInput("aiAgent", "AI Agent definition", "AiAgentDefinition", "Canonical Studio Definition"), dataInput("unlockState", "Unlock state", "AgentUnlockState", "Player Runtime State")],
    states: states(["Default", "Selected", "Locked", "Unavailable", "Missing Art", "Focused"], ["Default", "Selected", "Locked"]),
    screenUsages: [usage("ai-agent-profile", "AI Agent Profile")]
  }),
  baseRecord({
    componentId: "AiAgentVariantCard",
    category: "Cards",
    description: "Selectable AI Agent visual variant card for cosmetic skins, era-level appearance, unlock state, safe fallback art, and platform readiness.",
    dataInputs: [dataInput("aiAgentVariantId", "AI Agent variant ID", "AiAgentVariantId", "Canonical Studio Definition"), dataInput("aiAgentVariant", "AI Agent variant definition", "AiAgentVariantDefinition", "Canonical Studio Definition"), dataInput("selectedAiAgentVariantId", "Selected variant ID", "AiAgentVariantId", "Player Runtime State"), dataInput("unlockState", "Variant unlock state", "VariantUnlockState", "Player Runtime State")],
    states: states(["Default", "Selected", "Unlocked", "Locked", "Missing Art", "Online", "Offline", "Blinking", "Working", "Focused", "Disabled"], ["Default", "Selected", "Unlocked", "Locked", "Missing Art"]),
    variants: [variant("grid", "Grid", ["Default", "Selected", "Locked"]), variant("compact", "Compact", ["Default", "Selected", "Missing Art"]), variant("profile", "Profile", ["Unlocked", "Online", "Offline", "Blinking", "Working"])],
    screenUsages: [usage("ai-agent-profile", "AI Agent Profile")],
    notes: ["Variant card is cosmetic. Labor Assistance strength continues to come from automation upgrade levels."]
  }),
  baseRecord({
    componentId: "AiAgentExpressionPreview",
    category: "Game-Specific",
    description: "Expression/state preview matrix for idle, blinking, working, offline, warning, celebration, and missing-art states.",
    dataInputs: [dataInput("aiAgentId", "AI Agent ID", "AiAgentId", "Canonical Studio Definition"), dataInput("expressionAssets", "Expression asset map", "Record<AiAgentVisualState,string>", "Canonical Studio Definition")],
    states: states(["Idle", "Blink", "Working", "Thinking", "Research", "Offline", "Warning", "Celebration", "Missing Art"], ["Idle", "Blink", "Offline", "Warning"]),
    screenUsages: [usage("ai-agent-profile", "AI Agent Profile")]
  }),
  baseRecord({
    componentId: "AiAgentBlinkPreview",
    category: "Game-Specific",
    description: "Blink animation specimen with play/pause, reduced motion, light/dark background, circular HUD crop, panel crop, and density previews.",
    dataInputs: [dataInput("animationProfile", "AI Agent animation profile", "AiAgentAnimationProfileDefinition", "Canonical Studio Definition"), dataInput("reducedMotion", "Reduced motion setting", "boolean", "Local Interaction State")],
    states: states(["Idle", "Blink", "Paused", "Reduced Motion", "Missing Art"], ["Idle", "Blink", "Paused", "Reduced Motion"]),
    screenUsages: [usage("ai-agent-profile", "AI Agent Profile")]
  }),
  baseRecord({ componentId: "EconomyCounter", category: "Game-Specific", description: "Economy/resource counter with icon, balance, rate, formatting, premium flag, and gain state. Economy identity comes from definitionId; slot position is presentation only.", assetKeys: [assetRef("Labor icon", "economy_labor", "Pending Art")], dataInputs: [dataInput("definitionId", "Definition ID", "GenesisId", "Canonical Studio Definition"), dataInput("displayName", "Display name or era override", "string", "Canonical Studio Definition"), dataInput("iconKey", "Icon key", "string", "Presentation Hint"), dataInput("balance", "Balance", "number", "Player Runtime State"), dataInput("rate", "Rate", "number", "Player Runtime State"), dataInput("formatting", "Formatting", "EconomyFormat", "Presentation Hint"), dataInput("premium", "Premium", "boolean", "Canonical Studio Definition"), dataInput("gainState", "Gain state", "GainState", "Local Interaction State")], notes: ["Use ECON-LABOR + economy_labor for Labor/Workforce labels, ECON-CREDITS + economy_credits for Credits. Never infer economy identity from first slot or coin artwork."], screenUsages: [usage("dashboard", "Dashboard"), usage("resources", "Resources")] }),
  baseRecord({ componentId: "EconomyRateBreakdown", category: "Game-Specific", description: "Explains applied economy rates using canonical rate-breakdown metadata so HUD/help panels match simulation totals.", dataInputs: [dataInput("economyId", "Economy ID", "GenesisId", "Canonical Studio Definition"), dataInput("rateBreakdown", "Rate breakdown definition", "EconomyRateBreakdownDefinition", "Canonical Studio Definition"), dataInput("producerContributions", "Producer contributions", "ProducerContribution[]", "Player Runtime State")], states: states(["Producing", "Paused", "Capped", "Insufficient Input", "Offline", "Boosted", "Missing Definition"], ["Producing", "Paused", "Boosted"]), screenUsages: [usage("dashboard", "Dashboard"), usage("resources", "Resources")] }),
  baseRecord({ componentId: "ResourceProducerRow", category: "Game-Specific", description: "Single producer row for base systems, manual click, AI Agent, buildings, missions, events, and discoveries.", dataInputs: [dataInput("producer", "Producer definition", "ResourceProducerDefinition", "Canonical Studio Definition"), dataInput("runtimeState", "Producer active/paused state", "ProducerRuntimeState", "Player Runtime State")], states: states(["Producing", "Paused", "Capped", "Insufficient Input", "Offline", "Boosted", "Local", "Civilization Total", "Missing Definition"], ["Producing", "Paused", "Offline"]), screenUsages: [usage("dashboard", "Dashboard"), usage("buildings", "Buildings"), usage("resources", "Resources")] }),
  baseRecord({ componentId: "PopulationCapacityDisplay", category: "Game-Specific", description: "Displays current population, population capacity, available workforce, and assigned workforce as distinct concepts.", dataInputs: [dataInput("populationContract", "Population behavior contract", "EconomyBehaviorContract", "Canonical Studio Definition"), dataInput("populationState", "Population state", "PopulationState", "Player Runtime State")], states: states(["Default", "Capped", "Local", "Civilization Total", "Missing Definition"], ["Default", "Capped"]), screenUsages: [usage("dashboard", "Dashboard"), usage("resources", "Resources"), usage("buildings", "Buildings")] }),
  baseRecord({ componentId: "PopulationGrowthDisplay", category: "Game-Specific", description: "Shows population growth rate, growth blockers, housing/capacity constraints, and offline eligibility.", dataInputs: [dataInput("offlinePolicy", "Offline population policy", "OfflineProgressionPolicy", "Canonical Studio Definition"), dataInput("growthRate", "Population growth rate", "number", "Player Runtime State")], states: states(["Producing", "Paused", "Capped", "Insufficient Input", "Offline", "Missing Definition"], ["Producing", "Paused", "Capped"]), screenUsages: [usage("dashboard", "Dashboard"), usage("resources", "Resources"), usage("buildings", "Buildings")] }),
  baseRecord({ componentId: "PremiumCurrencyBalance", category: "Game-Specific", description: "Premium Crystal balance with verified-purchase, grant, refund, and restore-purchase states.", dataInputs: [dataInput("premiumContract", "Premium behavior contract", "EconomyBehaviorContract", "Canonical Studio Definition"), dataInput("transactionReason", "Premium transaction reason", "EconomyTransactionReason", "Canonical Studio Definition"), dataInput("balance", "Premium balance", "number", "Player Runtime State")], states: states(["Default", "Producing", "Paused", "Offline", "Missing Definition", "Error"], ["Default", "Error"]), screenUsages: [usage("dashboard", "Dashboard"), usage("settings", "Settings")] }),
  baseRecord({ componentId: "ResourceTransactionFeedback", category: "Game-Specific", description: "Short feedback for grants, production, spends, refunds, transfers, adjustments, purchases, and discoveries.", dataInputs: [dataInput("reasonCode", "Transaction reason code", "EconomyTransactionReason", "Canonical Studio Definition"), dataInput("transaction", "Transaction event", "EconomyTransactionEvent", "Player Runtime State")], states: states(["Default", "Producing", "Boosted", "Offline", "Missing Definition"], ["Default", "Boosted"]), screenUsages: [usage("dashboard", "Dashboard"), usage("resources", "Resources")] }),
  baseRecord({ componentId: "BuildingResourceEffect", category: "Game-Specific", description: "Structured building output/capacity/staffing effect row that references canonical economy IDs.", dataInputs: [dataInput("buildingEffect", "Building resource effect", "BuildingResourceEffect", "Canonical Studio Definition"), dataInput("producer", "Matching producer definition", "ResourceProducerDefinition", "Canonical Studio Definition")], states: states(["Producing", "Paused", "Capped", "Insufficient Input", "Offline", "Boosted", "Local", "Civilization Total", "Missing Definition"], ["Producing", "Paused", "Missing Definition"]), screenUsages: [usage("buildings", "Buildings"), usage("resources", "Resources")] }),
  baseRecord({ componentId: "EconomyInspectorCard", category: "Game-Specific", description: "Studio-only inspector card for canonical economy behavior contracts, save behavior, HUD slot, and era presentation overrides.", dataInputs: [dataInput("economyInspector", "Economy inspector", "EconomyInspector", "Canonical Studio Definition"), dataInput("validationIssues", "Validation issues", "EconomyValidationIssue[]", "Canonical Studio Definition")], states: states(["Ready", "Needs Review", "Critical", "Focused", "Filtered"], ["Ready", "Focused"]), screenUsages: [usage("economy-designer", "Economy Designer")] }),
  baseRecord({ componentId: "EconomyFlowNode", category: "Game-Specific", description: "Visual economy graph node for economy, building, producer, consumer, scope, and capacity records.", dataInputs: [dataInput("node", "Graph node", "EconomyGraphNode", "Canonical Studio Definition")], states: states(["Ready", "Needs Review", "Critical", "Focused", "Filtered", "Missing Preview"], ["Ready", "Focused"]), screenUsages: [usage("economy-designer", "Economy Designer")] }),
  baseRecord({ componentId: "EconomyFlowEdge", category: "Game-Specific", description: "Directional economy graph edge for produces, consumes, unlocks, multiplies, converts, requires, caps, rolls up, and transfers relationships.", dataInputs: [dataInput("edge", "Graph edge", "EconomyGraphEdge", "Canonical Studio Definition")], states: states(["Ready", "Needs Review", "Invalid", "Highlighted", "Filtered"], ["Ready", "Highlighted"]), screenUsages: [usage("economy-designer", "Economy Designer")] }),
  baseRecord({ componentId: "ResourceConsumerList", category: "Game-Specific", description: "Categorized consumer list for building costs, upgrades, research, trade, conversion, capacity reservation, premium spend, and event spend.", dataInputs: [dataInput("consumers", "Consumer references", "EconomyConsumerReference[]", "Canonical Studio Definition")], states: states(["Default", "Filtered", "Empty", "Needs Review", "Critical"], ["Default", "Filtered"]), screenUsages: [usage("economy-designer", "Economy Designer"), usage("resources", "Resources")] }),
  baseRecord({ componentId: "RateBreakdownPanel", category: "Game-Specific", description: "Canonical rate breakdown visualization using published multiplier order and producer contributions.", dataInputs: [dataInput("rateBreakdown", "Rate breakdown", "EconomyRateBreakdownDefinition", "Canonical Studio Definition"), dataInput("scenarioResult", "Sandbox result", "EconomyScenarioResult", "Local Interaction State")], states: states(["Default", "Projected", "Offline", "Capped", "Missing Definition"], ["Default", "Projected"]), screenUsages: [usage("economy-designer", "Economy Designer"), usage("dashboard", "Dashboard")] }),
  baseRecord({ componentId: "PopulationBreakdown", category: "Game-Specific", description: "Population model panel that separates current population, capacity, available workforce, assigned workforce, and growth rate.", dataInputs: [dataInput("populationModel", "Population focused model", "EconomyFocusedModel", "Canonical Studio Definition")], states: states(["Ready", "Capped", "Growth Blocked", "Local", "Civilization Total", "Needs Review"], ["Ready", "Capped"]), screenUsages: [usage("economy-designer", "Economy Designer"), usage("buildings", "Buildings")] }),
  baseRecord({ componentId: "ScopeRollupDiagram", category: "Game-Specific", description: "Scope hierarchy diagram for Civilization, Galaxy, Sector, Star System, Planet, and Settlement rollups with double-count prevention notes.", dataInputs: [dataInput("scopeRollups", "Scope rollup rules", "ScopeRollupRule[]", "Canonical Studio Definition")], states: states(["Ready", "Local Only", "Rolls Up", "Double Count Warning", "Filtered"], ["Ready", "Rolls Up"]), screenUsages: [usage("economy-designer", "Economy Designer")] }),
  baseRecord({ componentId: "EraEconomyTimeline", category: "Game-Specific", description: "Timeline showing stable economy IDs, era display labels, icon overrides, click targets, and producer availability.", dataInputs: [dataInput("eraTimeline", "Era economy timeline", "EraEconomyTimelineItem[]", "Canonical Studio Definition")], states: states(["Default", "Active Era", "Locked Era", "Filtered", "Missing Override"], ["Default", "Active Era"]), screenUsages: [usage("economy-designer", "Economy Designer"), usage("civilization", "Civilization")] }),
  baseRecord({ componentId: "BalanceSandboxPanel", category: "Game-Specific", description: "Studio-only deterministic economy projection panel that never writes player state or public runtime metadata.", dataInputs: [dataInput("scenario", "Economy scenario", "EconomyScenario", "Local Interaction State"), dataInput("calculationRules", "Economy calculation rules", "EconomyCalculationRules", "Canonical Studio Definition")], states: states(["Default", "Projected", "Offline", "Capped", "Invalid Input"], ["Default", "Projected"]), screenUsages: [usage("economy-designer", "Economy Designer")] }),
  baseRecord({ componentId: "EconomyValidationBadge", category: "Feedback", description: "Validation severity badge for circular dependency, disconnected node, unsafe premium source, fallback production, and rollup warnings.", dataInputs: [dataInput("issue", "Economy validation issue", "EconomyValidationIssue", "Canonical Studio Definition")], states: states(["Ready", "Warning", "Critical", "Focused", "Resolved"], ["Ready", "Warning", "Critical"]), screenUsages: [usage("economy-designer", "Economy Designer"), usage("validation-engine", "Validation Center")] }),
  namedComponent("AlignmentBar", "Game-Specific", "Alignment progress bar for civilization path and effects.", [usage("civilization", "Civilization")]),
  baseRecord({ componentId: "CostDisplay", category: "Game-Specific", description: "Cost display for research, building, upgrades, and actions.", dataInputs: [dataInput("cost", "Cost rows", "CostRow[]", "Canonical Studio Definition"), dataInput("affordability", "Affordability", "boolean", "Player Runtime State")], screenUsages: [usage("research", "Research"), usage("buildings", "Buildings"), usage("upgrades", "Upgrades")] }),
  baseRecord({ componentId: "UnlockRequirementList", category: "Game-Specific", description: "Unlock requirement list with met/unmet treatment and linked canonical IDs.", dataInputs: [dataInput("requirements", "Requirements", "UnlockRequirement[]", "Canonical Studio Definition"), dataInput("playerProgress", "Player progress", "PlayerUnlockState", "Player Runtime State")], screenUsages: [usage("research", "Research"), usage("buildings", "Buildings"), usage("upgrades", "Upgrades")] })
];

type ComponentLibraryStore = {
  records: ComponentDesignRecord[];
  updatedAt: string;
};

async function readStore(): Promise<ComponentLibraryStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ComponentLibraryStore>;
    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return { records: [], updatedAt: new Date().toISOString() };
  }
}

async function writeStore(store: ComponentLibraryStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function normalize(record: ComponentDesignRecord): ComponentDesignRecord {
  const references = record.references ?? [];
  return {
    ...record,
    designTokens: record.designTokens ?? [],
    layoutRules: record.layoutRules ?? [],
    anatomy: record.anatomy ?? [],
    assetKeys: record.assetKeys ?? [],
    dataInputs: record.dataInputs ?? [],
    states: record.states ?? [],
    variants: record.variants ?? [],
    interactions: record.interactions ?? [],
    responsiveRules: record.responsiveRules ?? responsiveRules(record.componentId),
    motionRules: record.motionRules ?? [],
    accessibilityRequirements: record.accessibilityRequirements ?? [],
    implementationTargets: ensureImplementationTargets(record.componentId, record.implementationTargets),
    screenUsages: record.screenUsages ?? [],
    references: [...references, ...generatedComponentPreviewReferences(record).filter((reference) => !references.some((item) => item.id === reference.id || item.source === reference.source))],
    reviewHistory: record.reviewHistory ?? [],
    breakingChanges: record.breakingChanges ?? [],
    notes: record.notes ?? [],
    mobileReadiness: record.mobileReadiness ?? mobileReadiness(record.componentId)
  };
}

function mergeRecords(stored: ComponentDesignRecord[]) {
  const map = new Map(initialComponentRecords.map((record) => [record.componentId, normalize(record)]));
  for (const record of stored) {
    if (record?.componentId) map.set(record.componentId, normalize(record));
  }
  return [...map.values()].sort((left, right) => left.category.localeCompare(right.category) || left.displayName.localeCompare(right.displayName));
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

function enrichAssets(record: ComponentDesignRecord, assetState?: AssetProductionState): ComponentDesignRecord {
  if (!assetState) return record;
  return {
    ...record,
    assetKeys: record.assetKeys.map((reference) => {
      const match = findAssetForPreviewKeys(assetState.assets, [reference.linkedAssetId, reference.assetKey, reference.label]);
      if (!match) return reference;
      const hasWeb = Boolean(match.platformMappings.web);
      const hasRoblox = Boolean(match.platformMappings.roblox);
      const status: ComponentAssetReference["status"] = match.approvalStatus !== "approved"
        ? "Needs Approval"
        : !hasWeb
          ? "Needs Web Mapping"
          : !hasRoblox
            ? "Needs Roblox Mapping"
            : "Ready";
      return { ...reference, linkedAssetId: match.id, status };
    })
  };
}

function checklistScore(record: ComponentDesignRecord) {
  const checks: ComponentDesignChecklist = {
    anatomyComplete: record.anatomy.length > 0 && record.anatomy.every((part) => part.label && part.source),
    tokenReferencesComplete: record.designTokens.length > 0 && record.designTokens.every((item) => item.tokenId && item.group),
    assetsMapped: record.assetKeys.every((item) => !item.required || item.status === "Ready"),
    requiredStatesComplete: record.states.length > 0 && record.states.every((item) => !item.required || item.designed),
    interactionContractComplete: record.interactions.length > 0,
    responsiveBehaviorComplete: record.responsiveRules.length >= viewports.length,
    accessibilityReviewed: record.accessibilityRequirements.length > 0,
    implementationTargetsTracked: record.implementationTargets.length >= 5,
    reviewComplete: record.reviewHistory.some((entry) => entry.status === "Approved") || record.status !== "Approved",
    approved: record.approvalStatus === "Approved" ? Boolean(record.approvedVersion) : true
  };
  const values = Object.values(checks);
  return { checks, complete: values.filter(Boolean).length, total: values.length };
}

function summary(record: ComponentDesignRecord, assets?: ProductionAsset[]): ComponentDesignSummary {
  const score = checklistScore(record);
  const parityStatuses = record.implementationTargets.map((item) => item.parityStatus);
  const parityStatus: ComponentParityStatus = parityStatuses.includes("Needs Work")
    ? "Needs Work"
    : parityStatuses.includes("Close")
      ? "Close"
      : parityStatuses.every((status) => status === "Approved")
        ? "Approved"
        : "Not Reviewed";
  return {
    id: record.id,
    componentId: record.componentId,
    displayName: record.displayName,
    description: record.description,
    category: record.category,
    status: record.status,
    approvalStatus: record.approvalStatus,
    version: record.version,
    assignedTo: record.assignedTo,
    updatedAt: record.updatedAt,
    implementationTargets: record.implementationTargets,
    screenUsages: record.screenUsages,
    variants: record.variants,
    breakingChanges: record.breakingChanges,
    missingAssets: record.assetKeys.filter((item) => item.required && item.status !== "Ready").length,
    missingStates: record.states.filter((item) => item.required && !item.designed).length,
    stateCount: record.states.length,
    parityStatus,
    checklistComplete: score.complete,
    checklistTotal: score.total,
    visualPreview: resolveComponentPreview(record, assets),
    mobileReadiness: record.mobileReadiness
  };
}

function buildStats(components: ComponentDesignSummary[], records: ComponentDesignRecord[]): ComponentLibraryState["stats"] {
  const pendingMajor = components.flatMap((component) => component.breakingChanges.filter((change) => change.type === "Major" && !change.resolved));
  const previewStats = generatedComponentPreviewStats(records);
  return {
    total: components.length,
    notStarted: components.filter((component) => component.status === "Not Started").length,
    inDesign: components.filter((component) => ["Draft", "In Design", "Ready for Review", "Needs Revision"].includes(component.status)).length,
    approved: components.filter((component) => component.approvalStatus === "Approved").length,
    implemented: components.filter((component) => component.status === "Implemented").length,
    parityApproved: components.filter((component) => component.parityStatus === "Approved").length,
    missingAssets: components.filter((component) => component.missingAssets > 0).length,
    missingStates: components.filter((component) => component.missingStates > 0).length,
    breakingChanges: pendingMajor.length,
    screensAffectedByPendingChanges: new Set(pendingMajor.flatMap((change) => change.affectedScreenIds)).size,
    mobileReadyComponents: components.filter((component) => component.mobileReadiness.touchVariantStatus === "Ready" && component.mobileReadiness.compactVariantStatus === "Ready").length,
    touchBlockers: components.filter((component) => component.mobileReadiness.touchVariantStatus !== "Ready").length,
    safeAreaBlockers: components.filter((component) => component.mobileReadiness.safeAreaBehavior === "Missing" || component.mobileReadiness.safeAreaBehavior === "Needs Review").length,
    iosBlockers: components.filter((component) => component.mobileReadiness.iosImplementationStatus !== "Implemented" && component.mobileReadiness.iosImplementationStatus !== "Approved").length,
    androidBlockers: components.filter((component) => component.mobileReadiness.androidImplementationStatus !== "Implemented" && component.mobileReadiness.androidImplementationStatus !== "Approved").length,
    ...previewStats
  };
}

export async function getComponentLibraryState(assetState?: AssetProductionState): Promise<ComponentLibraryState> {
  const store = await readStore();
  const records = mergeRecords(store.records).map((record) => enrichAssets(record, assetState));
  const components = records.map((record) => summary(record, assetState?.assets));
  return { components, records, stats: buildStats(components, records), generatedAt: new Date().toISOString() };
}

export async function getComponentDesignRecord(componentId: string, assetState?: AssetProductionState) {
  const state = await getComponentLibraryState(assetState);
  return state.records.find((record) => record.componentId === componentId) ?? null;
}

export function validateComponentDesign(record: ComponentDesignRecord) {
  const issues: string[] = [];
  const score = checklistScore(record);
  if (!componentCategories.includes(record.category)) issues.push(`Invalid component category: ${record.category}.`);
  if (!record.componentId || record.componentId !== record.componentId.trim()) issues.push("Component ID is missing or invalid.");
  if (!record.anatomy.length) issues.push("Component anatomy is missing.");
  if (!record.designTokens.length) issues.push("Design token references are missing.");
  if (!record.states.length || record.states.some((state) => state.required && !state.designed && record.approvalStatus === "Approved")) issues.push("Approved components cannot omit required states.");
  if (!record.interactions.length) issues.push("Interaction contract is missing.");
  if (record.responsiveRules.length < viewports.length) issues.push("Responsive rules are incomplete.");
  if (!record.accessibilityRequirements.length) issues.push("Accessibility requirements are missing.");
  if (record.implementationTargets.length < 5) issues.push("Implementation targets are incomplete.");
  if (record.approvalStatus === "Approved" && score.complete < score.total) issues.push("Approved components must pass every checklist guardrail.");
  if (JSON.stringify(record).includes("/Users/") || JSON.stringify(record).includes("studio-private://")) issues.push("Private source path leaked into component record.");
  return { valid: issues.length === 0, issues, checklist: { complete: score.complete, total: score.total, checks: score.checks } };
}

export function componentHandoffText(record: ComponentDesignRecord, target: "Game Codex" | "Roblox Codex" = "Game Codex") {
  return [
    `PROJECT GENESIS COMPONENT IMPLEMENTATION HANDOFF — ${record.displayName}`,
    "",
    `Target: ${target}`,
    `Canonical component ID: ${record.componentId}`,
    `Category: ${record.category}`,
    `Version: ${record.version}`,
    `Approved version: ${record.approvedVersion ?? "not approved"}`,
    `Status: ${record.status}`,
    `Approval: ${record.approvalStatus}`,
    "",
    "Anatomy:",
    ...record.anatomy.map((part) => `- ${part.id}: ${part.label} [${part.source}]`),
    "",
    "Dimensions:",
    `- ${record.dimensions}`,
    "",
    "Token references:",
    ...record.designTokens.map((item) => `- ${item.group}:${item.tokenId} — ${item.usage}${item.override ? ` (override: ${item.override})` : ""}`),
    "",
    "Semantic asset keys:",
    ...record.assetKeys.map((item) => `- ${item.assetKey}: ${item.status}`),
    "",
    "Variants:",
    ...record.variants.map((item) => `- ${item.id}: ${item.displayName}; states: ${item.allowedStates.join(", ")}`),
    "",
    "State matrix:",
    ...record.states.map((item) => `- ${item.label}: ${item.designed ? "designed" : "missing"}`),
    "",
    "Data contract:",
    ...record.dataInputs.map((item) => `- ${item.id}: ${item.type} [${item.classification}]`),
    "",
    "Interaction rules:",
    ...record.interactions.map((item) => `- ${item.trigger} -> ${item.action}; runtime: ${item.runtimeAction}`),
    "",
    "Responsive rules:",
    ...record.responsiveRules.map((item) => `- ${item.viewport}: ${item.scalingBehavior}; ${item.textHandling}`),
    "",
    "Accessibility requirements:",
    ...record.accessibilityRequirements.map((item) => `- ${item}`),
    "",
    "Implementation checklist:",
    ...Object.entries(checklistScore(record).checks).map(([key, done]) => `- ${done ? "[x]" : "[ ]"} ${key}`),
    "",
    "Screen usage:",
    ...record.screenUsages.map((usage) => `- ${usage.screenName} (${usage.screenId}) variant=${usage.variant} state=${usage.state}`)
  ].join("\n");
}

export function affectedScreenIdsForMajorChange(record: ComponentDesignRecord) {
  return [...new Set(record.screenUsages.map((usage) => usage.screenId))];
}

export function screenNeedsReviewForComponentChange(screen: ScreenDesignRecord, componentId: string, changeType: ComponentChangeType) {
  const usesComponent = screen.componentSpecs.some((component) => component.componentLibraryId === componentId);
  return usesComponent && changeType === "Major" && screen.approvalStatus === "Approved";
}

export async function updateComponentWorkflow(input: { componentId: string; action: "ready_for_review" | "request_changes" | "approve" | "record_major_change"; reviewer?: string; comments?: string; changeTitle?: string }) {
  const store = await readStore();
  const records = mergeRecords(store.records);
  const index = records.findIndex((record) => record.componentId === input.componentId);
  if (index === -1) throw new Error(`Component not found: ${input.componentId}`);
  const now = new Date().toISOString();
  const reviewer = input.reviewer?.trim() || "Design Systems";
  const comments = input.comments?.trim() || "";
  let next = { ...records[index], updatedAt: now };

  if (input.action === "ready_for_review") {
    next = { ...next, status: "Ready for Review", approvalStatus: "Unreviewed" };
  }
  if (input.action === "request_changes") {
    next = {
      ...next,
      status: "Needs Revision",
      approvalStatus: "Changes Requested",
      version: next.version + 1,
      reviewHistory: [{ id: `review-${slug(next.componentId)}-${Date.now()}`, reviewer, status: "Changes Requested", comments: comments || "Changes requested.", requiredChanges: ["Resolve incomplete guardrails before approval."], date: now }, ...next.reviewHistory]
    };
  }
  if (input.action === "approve") {
    const validation = validateComponentDesign({ ...next, status: "Approved", approvalStatus: "Approved", approvedVersion: next.version });
    if (!validation.valid) throw new Error(`Cannot approve component: ${validation.issues.join(" ")}`);
    next = {
      ...next,
      status: "Approved",
      approvalStatus: "Approved",
      approvedVersion: next.version,
      reviewHistory: [{ id: `review-${slug(next.componentId)}-${Date.now()}`, reviewer, status: "Approved", comments: comments || "Component approved.", requiredChanges: [], date: now, approvedVersion: next.version, implementationTarget: "Vite Web" }, ...next.reviewHistory]
    };
    next.frozenApprovedVersion = { ...next, frozenApprovedVersion: undefined };
  }
  if (input.action === "record_major_change") {
    const affected = affectedScreenIdsForMajorChange(next);
    next = {
      ...next,
      version: next.version + 1,
      status: "Needs Revision",
      approvalStatus: "Changes Requested",
      breakingChanges: [{
        id: `change-${slug(next.componentId)}-${Date.now()}`,
        type: "Major",
        title: input.changeTitle || "Major component change",
        description: comments || "Major anatomy, input, interaction, or layout change requires dependent screen review.",
        createdAt: now,
        affectedScreenIds: affected,
        migrationNotes: ["Review affected approved screen designs before implementation.", "Preserve old approved component version for existing clients."],
        resolved: false
      }, ...next.breakingChanges]
    };
  }

  records[index] = next;
  await writeStore({ records, updatedAt: now });
  return next;
}

export async function addComponentReference(input: {
  componentId: string;
  source: string;
  type?: ComponentReferenceAttachment["type"];
  viewport?: string;
  version?: number;
  notes?: string;
  approvalStatus?: ComponentApprovalStatus;
}) {
  const store = await readStore();
  const records = mergeRecords(store.records);
  const index = records.findIndex((record) => record.componentId === input.componentId);
  if (index === -1) throw new Error(`Component not found: ${input.componentId}`);
  const now = new Date().toISOString();
  const source = input.source.trim();
  if (!source) throw new Error("Reference source URL is required.");
  const next: ComponentDesignRecord = {
    ...records[index],
    updatedAt: now,
    references: [{
      id: `component-reference-${slug(records[index].componentId)}-${Date.now()}`,
      type: input.type ?? "annotated reference",
      source,
      viewport: input.viewport?.trim() || "1920x1080",
      version: input.version ?? records[index].version,
      crop: "full-frame",
      notes: input.notes?.trim() || "Reference preview added from Visual Preview workflow.",
      approvalStatus: input.approvalStatus ?? "Unreviewed"
    }, ...records[index].references]
  };
  records[index] = next;
  await writeStore({ records, updatedAt: now });
  return next;
}

export const componentLibraryInitialRecords = initialComponentRecords;

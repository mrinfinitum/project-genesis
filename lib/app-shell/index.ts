export const appShellId = "noveris-app-shell";
export const appShellDisplayName = "NOVERIS App Shell";
export const appShellVersion = 1;
export const mainWorkspaceSlotId = "main-workspace-slot";

export type AppShellBuilderMode = "Workspace Only" | "Shell Context" | "Full Composition Preview";
export type AppShellScreenType = "shell" | "workspace" | "full_screen_takeover";
export type AppShellPresentationMode = "shell_workspace" | "full_screen_takeover";
export type AppShellCoordinateOrigin = "shell" | "workspace";

export type ShellBounds = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

export type DerivedShellProfile = {
  id: string;
  displayName: string;
  viewport: string;
  scale: number;
  navigationMode: "left_rail" | "drawer" | "bottom_nav";
  workspaceBounds: ShellBounds;
  notes: string;
};

export type ScreenShellBinding = {
  shellId: string | null;
  shellVersion: number | null;
  workspaceSlotId: string | null;
  presentationMode: AppShellPresentationMode;
  coordinateOrigin: AppShellCoordinateOrigin;
  defaultBuilderMode: AppShellBuilderMode;
  lockedShellContext: boolean;
  allowedBuilderModes: AppShellBuilderMode[];
  fullScreenTakeoverReason?: string;
};

export type ScreenNavigationMetadata = {
  navigationId: string;
  screenId: string;
  workspaceTarget: typeof mainWorkspaceSlotId;
  presentationMode: AppShellPresentationMode;
};

export const visualBuilderModes: AppShellBuilderMode[] = ["Workspace Only", "Shell Context", "Full Composition Preview"];

export const appShellBounds = {
  masterCanvas: { width: 3840, height: 2160 },
  globalBackground: { id: "global-background", label: "Global Background", x: 0, y: 0, width: 3840, height: 2160, zIndex: 0 },
  topHud: { id: "top-civilization-hud", label: "Top Civilization HUD", x: 0, y: 0, width: 3840, height: 220, zIndex: 100 },
  leftNavigation: { id: "left-navigation-rail", label: "Left Navigation Rail", x: 54, y: 276, width: 360, height: 1668, zIndex: 120 },
  mainWorkspaceSlot: { id: mainWorkspaceSlotId, label: "Main Workspace Slot", x: 464, y: 260, width: 3244, height: 1804, zIndex: 130 },
  globalOverlayRoot: { id: "global-overlay-root", label: "Global Overlay Root", x: 0, y: 0, width: 3840, height: 2160, zIndex: 900 },
  globalModalRoot: { id: "global-modal-root", label: "Global Modal Root", x: 464, y: 260, width: 3244, height: 1804, zIndex: 910 },
  notificationLayer: { id: "notification-layer", label: "Notification Layer", x: 464, y: 240, width: 3244, height: 360, zIndex: 920 },
  debugCalibrationLayer: { id: "debug-calibration-layer", label: "Debug/Calibration Layer", x: 0, y: 0, width: 3840, height: 2160, zIndex: 1000 }
} satisfies Record<string, ShellBounds | { width: number; height: number }>;

function scaleBounds(bounds: ShellBounds, scale: number): ShellBounds {
  return {
    ...bounds,
    x: Math.round(bounds.x * scale),
    y: Math.round(bounds.y * scale),
    width: Math.round(bounds.width * scale),
    height: Math.round(bounds.height * scale)
  };
}

export const derivedShellProfiles: DerivedShellProfile[] = [
  { id: "desktop_4k", displayName: "Desktop 4K", viewport: "3840x2160", scale: 1, navigationMode: "left_rail", workspaceBounds: scaleBounds(appShellBounds.mainWorkspaceSlot, 1), notes: "Authoritative shell geometry." },
  { id: "desktop_1440", displayName: "Desktop 1440", viewport: "2560x1440", scale: 2 / 3, navigationMode: "left_rail", workspaceBounds: scaleBounds(appShellBounds.mainWorkspaceSlot, 2 / 3), notes: "Scaled from 4K shell coordinates." },
  { id: "desktop_1080", displayName: "Desktop 1080", viewport: "1920x1080", scale: 0.5, navigationMode: "left_rail", workspaceBounds: scaleBounds(appShellBounds.mainWorkspaceSlot, 0.5), notes: "Reference parity profile for web/Roblox captures." },
  { id: "desktop_720", displayName: "Desktop 720", viewport: "1280x720", scale: 1 / 3, navigationMode: "left_rail", workspaceBounds: scaleBounds(appShellBounds.mainWorkspaceSlot, 1 / 3), notes: "Compact desktop profile; text density needs review." },
  { id: "ios_landscape", displayName: "iOS Landscape", viewport: "932x430", scale: 0.24, navigationMode: "drawer", workspaceBounds: scaleBounds(appShellBounds.mainWorkspaceSlot, 0.24), notes: "Same shell/workspace contract; navigation may become a drawer." },
  { id: "android_landscape", displayName: "Android Landscape", viewport: "915x412", scale: 0.235, navigationMode: "drawer", workspaceBounds: scaleBounds(appShellBounds.mainWorkspaceSlot, 0.235), notes: "Same shell/workspace contract; respect display cutouts." },
  { id: "tablet_landscape", displayName: "Tablet Landscape", viewport: "1366x1024", scale: 0.355, navigationMode: "left_rail", workspaceBounds: scaleBounds(appShellBounds.mainWorkspaceSlot, 0.355), notes: "Tablet keeps shell semantics with a denser workspace." }
];

export const appShellLayerTree = [
  "Global Background",
  "Top Civilization HUD",
  "Left Navigation Rail",
  "Main Workspace Slot",
  "Global Overlay Root",
  "Global Modal Root",
  "Notification Layer",
  "Debug/Calibration Layer"
];

export const topHudChildren = [
  "Civilization Identity",
  "Labor",
  "Credits",
  "Population",
  "Research",
  "Premium Crystals",
  "Add Crystals",
  "Calendar",
  "Achievements",
  "Settings"
];

export const navigationContract: ScreenNavigationMetadata[] = [
  { navigationId: "overview", screenId: "civilization-command", workspaceTarget: mainWorkspaceSlotId, presentationMode: "shell_workspace" },
  { navigationId: "buildings", screenId: "buildings", workspaceTarget: mainWorkspaceSlotId, presentationMode: "shell_workspace" },
  { navigationId: "research", screenId: "research", workspaceTarget: mainWorkspaceSlotId, presentationMode: "shell_workspace" },
  { navigationId: "upgrades", screenId: "upgrades", workspaceTarget: mainWorkspaceSlotId, presentationMode: "shell_workspace" },
  { navigationId: "civilization", screenId: "civilization", workspaceTarget: mainWorkspaceSlotId, presentationMode: "shell_workspace" },
  { navigationId: "events", screenId: "events", workspaceTarget: mainWorkspaceSlotId, presentationMode: "shell_workspace" },
  { navigationId: "galaxy", screenId: "galaxy", workspaceTarget: mainWorkspaceSlotId, presentationMode: "shell_workspace" },
  { navigationId: "spaceport", screenId: "spaceport", workspaceTarget: mainWorkspaceSlotId, presentationMode: "shell_workspace" }
];

export const normalWorkspaceScreenIds = navigationContract.map((item) => item.screenId);

export const fullScreenTakeoverTypes = [
  "Loading",
  "Welcome/Login",
  "Password Reset",
  "Save Conflict Blocking",
  "Cinematic",
  "Major Era Transition",
  "Mandatory Tutorial Takeover",
  "Critical Maintenance/Error State"
];

export const blankInnerWorkspaceTemplate = {
  id: "blank-inner-workspace",
  displayName: "Blank Inner Workspace",
  shellId: appShellId,
  workspaceSlotId: mainWorkspaceSlotId,
  coordinateOrigin: "workspace" as const,
  layers: [
    "transparent workspace canvas",
    "workspace background placeholder",
    "local content root",
    "local overlay root",
    "optional local modal/drawer root",
    "shell-boundary guides"
  ],
  forbiddenChildren: [
    "Top HUD",
    "Left Navigation",
    "Settings",
    "Calendar",
    "Achievements",
    "economy counters"
  ],
  notes: "Inner workspaces author local screen content only. Full shell context is preview composition, not duplicated source-of-truth."
};

export function createShellBinding(screenId: string, overrides: Partial<ScreenShellBinding> = {}): ScreenShellBinding {
  const isTakeover = overrides.presentationMode === "full_screen_takeover" || overrides.coordinateOrigin === "shell";
  const isShell = screenId === appShellId;
  if (isShell) {
    return {
      shellId: null,
      shellVersion: null,
      workspaceSlotId: mainWorkspaceSlotId,
      presentationMode: "shell_workspace",
      coordinateOrigin: "shell",
      defaultBuilderMode: "Shell Context",
      lockedShellContext: false,
      allowedBuilderModes: visualBuilderModes,
      ...overrides
    };
  }
  return {
    shellId: isTakeover ? null : appShellId,
    shellVersion: isTakeover ? null : appShellVersion,
    workspaceSlotId: isTakeover ? null : mainWorkspaceSlotId,
    presentationMode: isTakeover ? "full_screen_takeover" : "shell_workspace",
    coordinateOrigin: isTakeover ? "shell" : "workspace",
    defaultBuilderMode: isTakeover ? "Full Composition Preview" : "Workspace Only",
    lockedShellContext: !isTakeover,
    allowedBuilderModes: isTakeover ? ["Full Composition Preview"] : visualBuilderModes,
    ...overrides
  };
}

export function navigationMetadataForScreen(screenId: string): ScreenNavigationMetadata | undefined {
  return navigationContract.find((item) => item.screenId === screenId);
}

export function isNormalWorkspaceScreen(screenId: string) {
  return normalWorkspaceScreenIds.includes(screenId);
}


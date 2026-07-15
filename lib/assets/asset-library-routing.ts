export type AssetLibraryCategoryId =
  | "top-hud"
  | "left-navigation"
  | "upgrade-categories"
  | "research-ui"
  | "buildings-ui"
  | "galaxy-ui"
  | "planet-ui"
  | "settings-ui"
  | "login-ui"
  | "loading-ui"
  | "encyclopedia"
  | "ai-agents"
  | "icons"
  | "backgrounds"
  | "illustrations"
  | "animations"
  | "audio"
  | "video"
  | "unmapped";

export type AssetLibraryCategoryViewType =
  | "upgrade_category_workflow"
  | "generic_inventory"
  | "ai_agent_workflow"
  | "audio_workflow"
  | "video_workflow"
  | "legacy_import_internal"
  | "empty_state";

export const assetLibraryCategoryIds: AssetLibraryCategoryId[] = [
  "top-hud",
  "left-navigation",
  "upgrade-categories",
  "research-ui",
  "buildings-ui",
  "galaxy-ui",
  "planet-ui",
  "settings-ui",
  "login-ui",
  "loading-ui",
  "encyclopedia",
  "ai-agents",
  "icons",
  "backgrounds",
  "illustrations",
  "animations",
  "audio",
  "video",
  "unmapped"
];

export const assetLibraryCategoryLabels: Record<AssetLibraryCategoryId, string> = {
  "top-hud": "Top HUD",
  "left-navigation": "Left Navigation",
  "upgrade-categories": "Upgrades",
  "research-ui": "Research UI",
  "buildings-ui": "Buildings UI",
  "galaxy-ui": "Galaxy UI",
  "planet-ui": "Planet UI",
  "settings-ui": "Settings UI",
  "login-ui": "Login UI",
  "loading-ui": "Loading UI",
  encyclopedia: "Encyclopedia",
  "ai-agents": "AI Agents",
  icons: "Icons",
  backgrounds: "Backgrounds",
  illustrations: "Illustrations",
  animations: "Animations",
  audio: "Audio",
  video: "Video",
  unmapped: "Unmapped"
};

const categoryAliases: Record<string, AssetLibraryCategoryId> = {
  "ui/top-hud": "top-hud",
  "ui/left-navigation": "left-navigation",
  "ui/upgrade-categories": "upgrade-categories",
  "ui/upgrades": "upgrade-categories",
  "ui/research": "research-ui",
  "ui/research-ui": "research-ui",
  "ui/buildings": "buildings-ui",
  "ui/buildings-ui": "buildings-ui",
  "ui/galaxy": "galaxy-ui",
  "ui/planet": "planet-ui",
  "ui/settings": "settings-ui",
  "ui/login": "login-ui",
  "ui/loading": "loading-ui",
  "upgrade categories": "upgrade-categories",
  "upgrade_categories": "upgrade-categories",
  upgrade: "upgrade-categories",
  upgrades: "upgrade-categories",
  research: "research-ui",
  buildings: "buildings-ui",
  galaxy: "galaxy-ui",
  planet: "planet-ui",
  settings: "settings-ui",
  login: "login-ui",
  loading: "loading-ui",
  encyclopedia: "encyclopedia",
  galactopedia: "encyclopedia",
  "civilization encyclopedia": "encyclopedia"
};

export function normalizeAssetLibraryCategoryId(value: unknown): AssetLibraryCategoryId | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/_/g, "-");
  if (!normalized) return null;
  if ((assetLibraryCategoryIds as string[]).includes(normalized)) return normalized as AssetLibraryCategoryId;
  return categoryAliases[normalized] ?? null;
}

export function isAssetLibraryCategoryId(value: unknown): value is AssetLibraryCategoryId {
  return normalizeAssetLibraryCategoryId(value) !== null;
}

export function resolveAssetLibraryCategoryView(categoryId: unknown): {
  categoryId: AssetLibraryCategoryId | null;
  viewType: AssetLibraryCategoryViewType;
  reason: string;
} {
  const normalized = normalizeAssetLibraryCategoryId(categoryId);
  if (!normalized) {
    return { categoryId: null, viewType: "empty_state", reason: "No valid Asset Library category is selected." };
  }
  if (normalized === "upgrade-categories") {
    return {
      categoryId: normalized,
      viewType: "generic_inventory",
      reason: "Upgrades resolves to the merged upgrade inventory. Dedicated category background production lives in the Backgrounds bucket."
    };
  }
  if (normalized === "backgrounds") {
    return {
      categoryId: normalized,
      viewType: "upgrade_category_workflow",
      reason: "Backgrounds owns the dedicated Upgrade Category background workflow and shared background production."
    };
  }
  if (normalized === "ai-agents") {
    return {
      categoryId: normalized,
      viewType: "ai_agent_workflow",
      reason: "AI Agents can use a dedicated workflow when expanded; current cards remain category-owned."
    };
  }
  if (normalized === "audio") {
    return {
      categoryId: normalized,
      viewType: "audio_workflow",
      reason: "Audio can use a dedicated workflow when expanded; current cards remain category-owned."
    };
  }
  if (normalized === "video") {
    return {
      categoryId: normalized,
      viewType: "video_workflow",
      reason: "Video can use a dedicated workflow when expanded; current cards remain category-owned."
    };
  }
  return {
    categoryId: normalized,
    viewType: "generic_inventory",
    reason: "Standard Asset Library category resolves to merged inventory cards."
  };
}

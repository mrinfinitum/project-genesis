import {
  DESIGN_LANGUAGE_ID,
  DESIGN_LANGUAGE_VERSION,
  noverisDesignLanguage,
  validateDesignLanguageOverride,
  type DesignLanguageContract,
  type DesignLanguageOverrideAttempt,
  type DesignLanguageValidationIssue
} from "@/lib/design-language";

export const COMPONENT_LIBRARY_ID = "noveris-component-library";
export const COMPONENT_LIBRARY_VERSION = "1.0.0";
export const UNKNOWN_COMPONENT = "UNKNOWN_COMPONENT";

export const componentStates = ["default", "hover", "focused", "pressed", "selected", "disabled", "loading", "success", "warning", "error", "hidden", "active", "inactive"] as const;
export const componentPreviewModes = ["light-grid", "dark-grid", "transparent", "16:10"] as const;

export type ComponentState = (typeof componentStates)[number];
export type ComponentPreviewMode = (typeof componentPreviewModes)[number];
export type ComponentCategory =
  | "buttons"
  | "panels"
  | "cards"
  | "technology-rings"
  | "navigation"
  | "inputs"
  | "tables"
  | "tooltips"
  | "progress"
  | "badges"
  | "scrollbars"
  | "windows"
  | "dialogs"
  | "lists"
  | "inspector"
  | "layout-helpers";

export type ComponentTokenReferences = {
  colors: string[];
  typography: string[];
  spacing: string[];
  motion: string[];
  glassMaterials: string[];
  glow: string[];
  borders: string[];
  radii: string[];
  shadows: string[];
};

export type ComponentVariantDefinition = {
  id: string;
  displayName: string;
  description: string;
  tokenOverrides: string[];
};

export type ComponentSlotDefinition = {
  id: string;
  displayName: string;
  required: boolean;
  accepts: string[];
};

export type ComponentPreviewDefinition = {
  status: "ready";
  supportedModes: ComponentPreviewMode[];
  supportedStates: ComponentState[];
  aspectRatio: "16:10";
  interactive: true;
};

export type CanonicalComponentDefinition = {
  id: string;
  version: string;
  status: "published";
  displayName: string;
  description: string;
  category: ComponentCategory;
  inheritsFrom: { id: typeof DESIGN_LANGUAGE_ID; version: typeof DESIGN_LANGUAGE_VERSION };
  extendsComponentId: string | null;
  designTokens: ComponentTokenReferences;
  states: ComponentState[];
  variants: ComponentVariantDefinition[];
  slots: ComponentSlotDefinition[];
  animations: string[];
  unityPrefabId: string;
  unityExport: { format: "json"; tokenResolution: "required"; implementationOwner: "unity" };
  validation: { required: string[]; status: "Ready" };
  preview: ComponentPreviewDefinition;
  usedBy: string[];
  tags: string[];
  versionHistory: {
    createdAt: string;
    modifiedAt: string;
    deprecated: boolean;
    replacedBy: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type ComponentLibraryContract = {
  id: typeof COMPONENT_LIBRARY_ID;
  version: typeof COMPONENT_LIBRARY_VERSION;
  status: "published";
  displayName: "NOVERIS Component Library";
  description: string;
  category: "component-library";
  inheritsFrom: { id: typeof DESIGN_LANGUAGE_ID; version: typeof DESIGN_LANGUAGE_VERSION };
  components: CanonicalComponentDefinition[];
  hierarchy: Array<{ id: string; displayName: string; componentIds: string[] }>;
  previewModes: ComponentPreviewMode[];
  screenUsage: Array<{ screenId: string; displayName: string; componentIds: string[] }>;
  unityExport: { format: "json"; endpoint: string; implementationOwner: "unity"; unknownComponentCode: typeof UNKNOWN_COMPONENT };
  createdAt: string;
  updatedAt: string;
};

export type ComponentLibraryValidationIssue = DesignLanguageValidationIssue;

type ComponentSeed = {
  id: string;
  displayName: string;
  category: ComponentCategory;
  description: string;
  variants: string[];
  slots: Array<[string, boolean, string[]]>;
  extendsComponentId?: string;
  usedBy?: string[];
  tags?: string[];
  accent?: "primary" | "danger" | "secondary";
};

const createdAt = "2026-08-02T00:00:00.000Z";
const defaultUsedBy = ["Component Preview", "Canonical Screen Assembly"];

const categoryDefinitions: Array<[ComponentCategory, string, string]> = [
  ["buttons", "Buttons", "Actions with consistent intent, feedback, and accessible targets."],
  ["panels", "Panels", "Reusable aerospace-glass containers for structured information."],
  ["cards", "Cards", "Compact content surfaces that communicate a record, action, or state."],
  ["technology-rings", "Technology Rings", "Canonical radial progress and technology state indicators."],
  ["navigation", "Navigation", "Global and local navigation contracts."],
  ["inputs", "Inputs", "Structured data entry, searching, and filtering controls."],
  ["tables", "Tables", "Dense structured-data presentation without bespoke screen styling."],
  ["tooltips", "Tooltips", "Contextual explanations that preserve workspace focus."],
  ["progress", "Progress", "Quiet progress indicators for deterministic state."],
  ["badges", "Badges", "Compact state, count, and notification markers."],
  ["scrollbars", "Scrollbars", "Directional scroll affordances for dense workspaces."],
  ["windows", "Windows", "Movable or framed workspace surfaces."],
  ["dialogs", "Dialogs", "Intentional modal decision surfaces."],
  ["lists", "Lists", "Accessible rows for navigation and canonical records."],
  ["inspector", "Inspector", "Property and dependency review for selected records."],
  ["layout-helpers", "Layout Helpers", "Reusable composition structures for Unity screen assembly."]
];

const buttonSlots: Array<[string, boolean, string[]]> = [
  ["leading-icon", false, ["icon"]],
  ["text", true, ["text"]],
  ["trailing-icon", false, ["icon"]],
  ["badge", false, ["badge"]],
  ["spinner", false, ["loading-indicator"]]
];

const panelSlots: Array<[string, boolean, string[]]> = [
  ["header", false, ["text", "icon", "actions"]],
  ["body", true, ["content"]],
  ["footer", false, ["actions", "metadata"]]
];

const cardSlots: Array<[string, boolean, string[]]> = [
  ["header", false, ["text", "image", "icon"]],
  ["body", true, ["content", "metadata"]],
  ["status", false, ["badge", "progress"]],
  ["actions", false, ["button", "menu"]]
];

const ringSlots: Array<[string, boolean, string[]]> = [
  ["center-icon", false, ["icon"]],
  ["glow-ring", true, ["ring"]],
  ["progress-ring", true, ["ring"]],
  ["badge", false, ["badge"]],
  ["label", false, ["text"]]
];

const componentSeeds: ComponentSeed[] = [
  { id: "button.primary", displayName: "Primary Button", category: "buttons", description: "The primary affirmative action for a screen or focused workspace.", variants: ["small", "medium", "large", "icon-left", "icon-right", "loading", "disabled"], slots: buttonSlots, usedBy: ["Planet Detail", "Research", "Upgrade Library", "Component Preview"] },
  { id: "button.secondary", displayName: "Secondary Button", category: "buttons", description: "A supporting action that remains visually subordinate to the primary action.", variants: ["small", "medium", "large", "icon-left", "icon-right", "loading", "disabled"], slots: buttonSlots },
  { id: "button.ghost", displayName: "Ghost Button", category: "buttons", description: "A low-emphasis action for calm secondary workflows.", variants: ["small", "medium", "large", "icon-left", "icon-right", "disabled"], slots: buttonSlots },
  { id: "button.danger", displayName: "Danger Button", category: "buttons", description: "A destructive action that uses the canonical danger token only when confirmation is meaningful.", variants: ["small", "medium", "large", "confirmation", "disabled"], slots: buttonSlots, accent: "danger" },
  { id: "button.icon", displayName: "Icon Button", category: "buttons", description: "A compact action with an accessible label and canonical icon treatment.", variants: ["small", "medium", "large", "quiet", "disabled"], slots: [["icon", true, ["icon"]], ["badge", false, ["badge"]]], usedBy: ["Top Navigation", "Planet Detail", "Research", "Component Preview"] },

  { id: "panel.information", displayName: "Information Panel", category: "panels", description: "A standard contextual information surface.", variants: ["standard", "compact", "emphasized"], slots: panelSlots },
  { id: "panel.navigation", displayName: "Navigation Panel", category: "panels", description: "A persistent navigation surface using Navigation Glass.", variants: ["sidebar", "drawer", "section"], slots: panelSlots, usedBy: ["Top Navigation", "Galaxy", "Research", "Component Preview"] },
  { id: "panel.inspector", displayName: "Inspector Panel", category: "panels", description: "A detail surface for selected records, dependencies, and canonical properties.", variants: ["right", "bottom", "compact"], slots: panelSlots, usedBy: ["Planet Detail", "Research", "Technology", "Component Preview"] },
  { id: "panel.modal", displayName: "Modal Panel", category: "panels", description: "A focused glass surface for a modal workflow.", variants: ["small", "medium", "large", "fullscreen"], slots: panelSlots },
  { id: "panel.overlay", displayName: "Overlay Panel", category: "panels", description: "A transparent contextual panel layered over a workspace without competing with its focus.", variants: ["top", "bottom", "floating"], slots: panelSlots },
  { id: "panel.transparent", displayName: "Transparent Panel", category: "panels", description: "A minimally framed content surface for visual environments.", variants: ["standard", "subtle", "read-only"], slots: panelSlots },

  { id: "card.standard", displayName: "Standard Card", category: "cards", description: "The default canonical record card.", variants: ["small", "medium", "large", "selected"], slots: cardSlots },
  { id: "card.hero", displayName: "Hero Card", category: "cards", description: "A prominent content summary used sparingly at the top of a workspace.", variants: ["standard", "with-art", "with-actions"], slots: cardSlots },
  { id: "card.stat", displayName: "Stat Card", category: "cards", description: "A compact numerical summary with optional trend or status.", variants: ["standard", "success", "warning", "danger"], slots: [["label", true, ["text"]], ["value", true, ["text"]], ["trend", false, ["icon", "text"]], ["status", false, ["badge"]]] },
  { id: "card.planet", displayName: "Planet Card", category: "cards", description: "A canonical planet record summary that inherits Standard Card behavior.", variants: ["library", "selected", "discovered"], slots: cardSlots, extendsComponentId: "card.standard", usedBy: ["Planet Library", "Galaxy", "Planet Detail", "Component Preview"] },
  { id: "card.research", displayName: "Research Card", category: "cards", description: "A canonical research record summary that inherits Standard Card behavior.", variants: ["available", "locked", "completed"], slots: cardSlots, extendsComponentId: "card.standard", usedBy: ["Research", "Skill Tree", "Component Preview"] },
  { id: "card.upgrade", displayName: "Upgrade Card", category: "cards", description: "A canonical upgrade summary with requirement and action slots.", variants: ["available", "locked", "purchased"], slots: cardSlots, extendsComponentId: "card.standard", usedBy: ["Upgrade Library", "Technology", "Component Preview"] },
  { id: "card.mission", displayName: "Mission Card", category: "cards", description: "A canonical mission summary with status and objective slots.", variants: ["available", "active", "complete"], slots: cardSlots, extendsComponentId: "card.standard", usedBy: ["Missions", "Component Preview"] },
  { id: "card.discovery", displayName: "Discovery Card", category: "cards", description: "A canonical discovery summary with rarity and progress.", variants: ["unknown", "detected", "cataloged"], slots: cardSlots, extendsComponentId: "card.standard", usedBy: ["Discovery Library", "Planet Detail", "Component Preview"] },

  { id: "technology-ring.small", displayName: "Small Technology Ring", category: "technology-rings", description: "A 32px technology state indicator.", variants: ["locked", "unlocked", "available", "selected"], slots: ringSlots, usedBy: ["Skill Tree", "Research", "Component Preview"] },
  { id: "technology-ring.medium", displayName: "Medium Technology Ring", category: "technology-rings", description: "A 48px technology state indicator.", variants: ["locked", "unlocked", "available", "selected"], slots: ringSlots, usedBy: ["Skill Tree", "Research", "Component Preview"] },
  { id: "technology-ring.large", displayName: "Large Technology Ring", category: "technology-rings", description: "A 72px technology state indicator.", variants: ["locked", "unlocked", "available", "selected"], slots: ringSlots, usedBy: ["Skill Tree", "Research", "Component Preview"] },
  { id: "technology-ring.core", displayName: "Civilization Core Ring", category: "technology-rings", description: "The canonical Civilization Core indicator with the only core-specific restrained glow.", variants: ["hidden", "locked", "unlocked", "selected"], slots: ringSlots, usedBy: ["Civilization", "Technology", "Component Preview"], accent: "secondary" },
  { id: "technology-ring.planet", displayName: "Planet Ring", category: "technology-rings", description: "A radial planet state or orbital progress indicator.", variants: ["hidden", "locked", "unlocked", "selected"], slots: ringSlots, usedBy: ["Planet Detail", "Galaxy", "Component Preview"] },
  { id: "technology-ring.research", displayName: "Research Ring", category: "technology-rings", description: "A research-state indicator with approved research-ring glow.", variants: ["locked", "available", "researching", "complete"], slots: ringSlots, usedBy: ["Research", "Skill Tree", "Component Preview"] },
  { id: "technology-ring.upgrade", displayName: "Upgrade Ring", category: "technology-rings", description: "An upgrade-state indicator with approved technology-ring glow.", variants: ["locked", "available", "purchased", "selected"], slots: ringSlots, usedBy: ["Upgrade Library", "Technology", "Component Preview"] },

  { id: "navigation.top", displayName: "Top Navigation", category: "navigation", description: "Global navigation for high-level client context.", variants: ["desktop", "tablet", "mobile"], slots: [["brand", true, ["logo", "text"]], ["navigation", true, ["navigation-item"]], ["utilities", false, ["button", "status"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "navigation.sidebar", displayName: "Sidebar", category: "navigation", description: "Section and workspace navigation using Navigation Glass.", variants: ["expanded", "collapsed", "mobile-drawer"], slots: [["header", false, ["text", "icon"]], ["navigation", true, ["navigation-item"]], ["footer", false, ["status", "button"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "navigation.footer", displayName: "Footer", category: "navigation", description: "A restrained footer for secondary information and utility links.", variants: ["standard", "compact"], slots: [["content", true, ["text", "link"]], ["actions", false, ["button"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "navigation.tabs", displayName: "Tabs", category: "navigation", description: "An accessible local view switcher.", variants: ["horizontal", "compact", "scrolling"], slots: [["tab", true, ["tab-item"]], ["trailing-action", false, ["button"]]], usedBy: ["Planet Detail", "Research", "Technology", "Component Preview"] },
  { id: "navigation.breadcrumbs", displayName: "Breadcrumbs", category: "navigation", description: "A concise path for hierarchical content.", variants: ["standard", "truncated"], slots: [["items", true, ["breadcrumb-item"]], ["actions", false, ["button"]]], usedBy: ["Planet Detail", "Galaxy", "Component Preview"] },
  { id: "input.search", displayName: "Search", category: "inputs", description: "A compact query control with an accessible search label.", variants: ["standard", "compact", "with-filter"], slots: [["leading-icon", true, ["icon"]], ["input", true, ["text-input"]], ["trailing-action", false, ["button"]]], usedBy: ["Discovery Library", "Research", "Component Preview"] },
  { id: "input.search-bar", displayName: "Search Bar", category: "inputs", description: "A prominent query surface used at library scale.", variants: ["standard", "with-filters", "loading"], slots: [["input", true, ["text-input"]], ["filters", false, ["filter-chip"]], ["results", false, ["search-result"]]], extendsComponentId: "input.search", usedBy: ["Discovery Library", "Asset Library", "Component Preview"] },
  { id: "input.search-results", displayName: "Search Results", category: "inputs", description: "A canonical result list displayed below a search query.", variants: ["empty", "loading", "populated"], slots: [["result", true, ["search-result"]], ["empty", false, ["empty-state"]]], usedBy: ["Discovery Library", "Asset Library", "Component Preview"] },
  { id: "input.filter-chip", displayName: "Filter Chip", category: "inputs", description: "A compact active filter control.", variants: ["inactive", "active", "dismissible"], slots: [["label", true, ["text"]], ["dismiss", false, ["icon-button"]]], usedBy: ["Discovery Library", "Research", "Component Preview"] },
  { id: "input.dropdown", displayName: "Dropdown", category: "inputs", description: "A token-driven select control.", variants: ["standard", "compact", "disabled"], slots: [["value", true, ["text"]], ["menu", true, ["option"]]], usedBy: ["Research", "Technology", "Component Preview"] },
  { id: "input.text", displayName: "Text Input", category: "inputs", description: "A single-line editable text field.", variants: ["standard", "with-label", "error"], slots: [["label", false, ["text"]], ["input", true, ["text-input"]], ["helper", false, ["text"]]], usedBy: ["Inspector", "Component Preview"] },
  { id: "input.number", displayName: "Number Input", category: "inputs", description: "A canonical numerical entry control.", variants: ["standard", "stepper", "error"], slots: [["label", false, ["text"]], ["input", true, ["number-input"]], ["controls", false, ["icon-button"]]], usedBy: ["Inspector", "Component Preview"] },
  { id: "input.slider", displayName: "Slider", category: "inputs", description: "A continuous value control using canonical focus and track states.", variants: ["single", "range", "disabled"], slots: [["label", false, ["text"]], ["track", true, ["slider-track"]], ["value", false, ["text"]]], usedBy: ["Inspector", "Component Preview"] },
  { id: "input.checkbox", displayName: "Checkbox", category: "inputs", description: "A binary check control with visible selected and focus states.", variants: ["unchecked", "checked", "indeterminate"], slots: [["control", true, ["checkbox"]], ["label", true, ["text"]]], usedBy: ["Inspector", "Component Preview"] },
  { id: "input.radio", displayName: "Radio", category: "inputs", description: "A mutually exclusive selection control.", variants: ["unchecked", "checked", "disabled"], slots: [["control", true, ["radio"]], ["label", true, ["text"]]], usedBy: ["Inspector", "Component Preview"] },
  { id: "input.toggle", displayName: "Toggle", category: "inputs", description: "A two-state switch with a readable state label.", variants: ["off", "on", "disabled"], slots: [["control", true, ["toggle"]], ["label", true, ["text"]]], usedBy: ["Settings", "Inspector", "Component Preview"] },

  { id: "table.standard", displayName: "Standard Table", category: "tables", description: "A readable row-and-column data surface.", variants: ["compact", "comfortable", "empty"], slots: [["header", true, ["table-header"]], ["rows", true, ["table-row"]], ["footer", false, ["pagination"]]], usedBy: ["Resource Library", "Component Preview"] },
  { id: "table.data-grid", displayName: "Data Grid", category: "tables", description: "A dense structured data surface with controlled selection.", variants: ["standard", "selected-row", "loading"], slots: [["columns", true, ["grid-column"]], ["rows", true, ["grid-row"]], ["toolbar", false, ["search", "filter-chip"]]], extendsComponentId: "table.standard", usedBy: ["Resource Library", "Research", "Component Preview"] },
  { id: "table.property-grid", displayName: "Property Grid", category: "tables", description: "A label-value data surface for canonical record detail.", variants: ["standard", "compact", "read-only"], slots: [["properties", true, ["property-row"]], ["actions", false, ["button"]]], usedBy: ["Planet Detail", "Inspector", "Component Preview"] },
  { id: "table.inspector", displayName: "Inspector Table", category: "tables", description: "A detailed property table optimized for an inspector panel.", variants: ["standard", "grouped", "validation"], slots: [["groups", true, ["property-group"]], ["rows", true, ["property-row"]]], extendsComponentId: "table.property-grid", usedBy: ["Inspector", "Component Preview"] },

  { id: "tooltip.standard", displayName: "Standard Tooltip", category: "tooltips", description: "A short contextual explanation for a focused target.", variants: ["top", "right", "bottom", "left"], slots: [["content", true, ["text"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "tooltip.rich", displayName: "Rich Tooltip", category: "tooltips", description: "A contextual explanation with title, content, and optional actions.", variants: ["standard", "with-image", "with-actions"], slots: panelSlots, extendsComponentId: "tooltip.standard", usedBy: ["Research", "Planet Detail", "Component Preview"] },
  { id: "tooltip.upgrade", displayName: "Upgrade Tooltip", category: "tooltips", description: "An upgrade-specific contextual surface.", variants: ["available", "locked", "purchased"], slots: panelSlots, extendsComponentId: "tooltip.rich", usedBy: ["Upgrade Library", "Technology", "Component Preview"] },
  { id: "tooltip.planet", displayName: "Planet Tooltip", category: "tooltips", description: "A planet-specific contextual surface.", variants: ["summary", "unknown", "detailed"], slots: panelSlots, extendsComponentId: "tooltip.rich", usedBy: ["Planet Detail", "Galaxy", "Component Preview"] },

  { id: "progress.bar", displayName: "Progress Bar", category: "progress", description: "A horizontal progress indicator for determinate work.", variants: ["default", "success", "warning", "error"], slots: [["track", true, ["progress-track"]], ["label", false, ["text"]], ["value", false, ["text"]]], usedBy: ["Research", "Construction", "Component Preview"] },
  { id: "progress.circular", displayName: "Circular Progress", category: "progress", description: "A compact radial progress indicator.", variants: ["small", "medium", "large"], slots: ringSlots, usedBy: ["Research", "Component Preview"] },
  { id: "progress.research", displayName: "Research Progress", category: "progress", description: "Research progress with canonical category context.", variants: ["available", "active", "complete"], slots: [["progress", true, ["progress-bar"]], ["status", false, ["badge"]]], extendsComponentId: "progress.bar", usedBy: ["Research", "Skill Tree", "Component Preview"] },
  { id: "progress.construction", displayName: "Construction Progress", category: "progress", description: "Construction progress with an explicit active state.", variants: ["planned", "active", "complete"], slots: [["progress", true, ["progress-bar"]], ["status", false, ["badge"]]], extendsComponentId: "progress.bar", usedBy: ["Buildings", "Component Preview"] },
  { id: "progress.upgrade", displayName: "Upgrade Progress", category: "progress", description: "Upgrade progression with requirement context.", variants: ["locked", "available", "complete"], slots: [["progress", true, ["progress-bar"]], ["status", false, ["badge"]]], extendsComponentId: "progress.bar", usedBy: ["Upgrade Library", "Component Preview"] },

  { id: "badge.status", displayName: "Status Badge", category: "badges", description: "A compact semantic status marker.", variants: ["default", "success", "warning", "error"], slots: [["label", true, ["text"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "badge.notification", displayName: "Notification Badge", category: "badges", description: "A compact notification state marker.", variants: ["default", "new", "urgent"], slots: [["count", false, ["text"]], ["icon", false, ["icon"]]], usedBy: ["Top Navigation", "Component Preview"] },
  { id: "badge.count", displayName: "Count Badge", category: "badges", description: "A stable count indicator for collections and lists.", variants: ["default", "compact", "overflow"], slots: [["count", true, ["text"]]], usedBy: ["Discovery Library", "Resource Library", "Component Preview"] },
  { id: "badge.alert", displayName: "Alert Badge", category: "badges", description: "An attention marker reserved for warning or error states.", variants: ["warning", "error", "success"], slots: [["icon", false, ["icon"]], ["label", true, ["text"]]], usedBy: ["All Unity Screens", "Component Preview"] },

  { id: "scrollbar.horizontal", displayName: "Horizontal Scrollbar", category: "scrollbars", description: "A controlled horizontal scroll affordance.", variants: ["standard", "compact", "hidden"], slots: [["track", true, ["scroll-track"]], ["thumb", true, ["scroll-thumb"]]], usedBy: ["Tables", "Component Preview"] },
  { id: "scrollbar.vertical", displayName: "Vertical Scrollbar", category: "scrollbars", description: "A controlled vertical scroll affordance.", variants: ["standard", "compact", "hidden"], slots: [["track", true, ["scroll-track"]], ["thumb", true, ["scroll-thumb"]]], usedBy: ["Tables", "Inspector", "Component Preview"] },

  { id: "window.standard", displayName: "Standard Window", category: "windows", description: "A movable or fixed workspace frame with canonical chrome.", variants: ["docked", "floating", "maximized"], slots: panelSlots, usedBy: ["Civilization", "Component Preview"] },
  { id: "dialog.confirmation", displayName: "Confirmation Dialog", category: "dialogs", description: "A deliberate confirmation surface for irreversible actions.", variants: ["standard", "danger", "loading"], slots: [["title", true, ["text"]], ["body", true, ["text"]], ["actions", true, ["button"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "dialog.alert", displayName: "Alert Dialog", category: "dialogs", description: "A clear, recoverable alert surface.", variants: ["info", "warning", "error"], slots: [["title", true, ["text"]], ["body", true, ["text"]], ["actions", true, ["button"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "dialog.inspector", displayName: "Inspector Dialog", category: "dialogs", description: "A full detail dialog for a canonical record.", variants: ["standard", "with-tabs", "fullscreen"], slots: panelSlots, extendsComponentId: "panel.inspector", usedBy: ["Planet Detail", "Research", "Component Preview"] },
  { id: "dialog.fullscreen", displayName: "Fullscreen Dialog", category: "dialogs", description: "A focused full-screen workflow surface.", variants: ["standard", "with-navigation"], slots: panelSlots, extendsComponentId: "panel.modal", usedBy: ["Planet Detail", "Component Preview"] },

  { id: "list.navigation", displayName: "Navigation List", category: "lists", description: "A directional list used for local navigation.", variants: ["standard", "selected", "compact"], slots: [["items", true, ["navigation-item"]], ["empty", false, ["empty-state"]]], usedBy: ["Sidebar", "Planet Detail", "Component Preview"] },
  { id: "list.property", displayName: "Property List", category: "lists", description: "A compact key-value list.", variants: ["standard", "grouped", "compact"], slots: [["items", true, ["property-row"]]], usedBy: ["Inspector", "Planet Detail", "Component Preview"] },
  { id: "list.discovery", displayName: "Discovery List", category: "lists", description: "A list of discoveries with rarity and state.", variants: ["standard", "unknown", "cataloged"], slots: [["items", true, ["discovery-row"]], ["empty", false, ["empty-state"]]], extendsComponentId: "list.navigation", usedBy: ["Discovery Library", "Planet Detail", "Component Preview"] },
  { id: "list.research", displayName: "Research List", category: "lists", description: "A list of research records with availability state.", variants: ["available", "locked", "complete"], slots: [["items", true, ["research-row"]], ["empty", false, ["empty-state"]]], extendsComponentId: "list.navigation", usedBy: ["Research", "Skill Tree", "Component Preview"] },

  { id: "inspector.standard", displayName: "Standard Inspector", category: "inspector", description: "A canonical record inspector with tokens, dependencies, validation, and Unity export.", variants: ["right", "bottom", "fullscreen"], slots: [["summary", true, ["text", "badge"]], ["properties", true, ["property-grid"]], ["dependencies", false, ["list"]], ["actions", false, ["button"]]], extendsComponentId: "panel.inspector", usedBy: ["Component Library", "Planet Detail", "Research", "Component Preview"] },
  { id: "layout-helper.stack", displayName: "Stack Layout Helper", category: "layout-helpers", description: "A canonical vertical composition helper using spacing tokens.", variants: ["tight", "standard", "relaxed"], slots: [["children", true, ["component"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "layout-helper.grid", displayName: "Grid Layout Helper", category: "layout-helpers", description: "A canonical responsive grid composition helper.", variants: ["desktop-16", "tablet-12", "mobile-8"], slots: [["children", true, ["component"]]], usedBy: ["All Unity Screens", "Component Preview"] },
  { id: "layout-helper.workspace", displayName: "Workspace Layout Helper", category: "layout-helpers", description: "The standard top navigation, header, workspace, inspector, and footer frame.", variants: ["standard", "library", "inspector-open"], slots: [["top-navigation", true, ["navigation"]], ["header", true, ["header"]], ["workspace", true, ["content"]], ["inspector", false, ["inspector"]], ["footer", false, ["footer"]]], usedBy: ["All Unity Screens", "Component Preview"] }
];

function variant(id: string): ComponentVariantDefinition {
  return {
    id,
    displayName: id.split("-").map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`).join(" "),
    description: `Canonical ${id.replaceAll("-", " ")} variant.`,
    tokenOverrides: []
  };
}

function tokensFor(seed: ComponentSeed): ComponentTokenReferences {
  const color = seed.accent === "danger"
    ? "color.danger"
    : seed.accent === "secondary"
      ? "color.secondary.soft-violet"
      : "color.primary.electric-blue";
  const glass = seed.category === "navigation" ? "glass.navigation" : seed.category === "inspector" ? "glass.inspector" : seed.category === "dialogs" ? "glass.modal" : "glass.primary";
  const glow = seed.category === "technology-rings"
    ? seed.id.includes("research") ? "glow.research-ring" : seed.id.includes("core") ? "glow.civilization-core" : "glow.technology-ring"
    : "glow.hover";
  return {
    colors: ["color.panel.dark-navy", "color.text.primary", "color.border.default", color],
    typography: ["type.body", "type.label"],
    spacing: ["space.8", "space.16", "space.24"],
    motion: ["motion.150", "easing.ease-out-cubic"],
    glassMaterials: [glass],
    glow: [glow, "glow.selected", "glow.focused"],
    borders: ["border.standard"],
    radii: ["radius.standard"],
    shadows: [seed.category === "dialogs" ? "shadow.large" : "shadow.small"]
  };
}

function prefabId(displayName: string) {
  return `Noveris${displayName.replace(/[^A-Za-z0-9]+/g, "")}Prefab`;
}

function componentFromSeed(seed: ComponentSeed): CanonicalComponentDefinition {
  return {
    id: `component.${seed.id}`,
    version: COMPONENT_LIBRARY_VERSION,
    status: "published",
    displayName: seed.displayName,
    description: seed.description,
    category: seed.category,
    inheritsFrom: { id: DESIGN_LANGUAGE_ID, version: DESIGN_LANGUAGE_VERSION },
    extendsComponentId: seed.extendsComponentId ? `component.${seed.extendsComponentId}` : null,
    designTokens: tokensFor(seed),
    states: [...componentStates],
    variants: seed.variants.map(variant),
    slots: seed.slots.map(([id, required, accepts]) => ({ id, displayName: id.split("-").map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`).join(" "), required, accepts })),
    animations: ["motion.150", "easing.ease-out-cubic"],
    unityPrefabId: prefabId(seed.displayName),
    unityExport: { format: "json", tokenResolution: "required", implementationOwner: "unity" },
    validation: { required: ["design tokens", "states", "variants", "slots", "animations", "Unity prefab", "preview"], status: "Ready" },
    preview: { status: "ready", supportedModes: [...componentPreviewModes], supportedStates: [...componentStates], aspectRatio: "16:10", interactive: true },
    usedBy: seed.usedBy ?? defaultUsedBy,
    tags: [seed.category, ...(seed.tags ?? [])],
    versionHistory: { createdAt, modifiedAt: createdAt, deprecated: false, replacedBy: null },
    createdAt,
    updatedAt: createdAt
  };
}

const components = componentSeeds.map(componentFromSeed);

export const noverisComponentLibrary: ComponentLibraryContract = {
  id: COMPONENT_LIBRARY_ID,
  version: COMPONENT_LIBRARY_VERSION,
  status: "published",
  displayName: "NOVERIS Component Library",
  description: "Canonical Unity component definitions that inherit every visual value from the NOVERIS Design Language. Unity implements components; Studio owns the contracts.",
  category: "component-library",
  inheritsFrom: { id: DESIGN_LANGUAGE_ID, version: DESIGN_LANGUAGE_VERSION },
  components,
  hierarchy: [
    { id: "hierarchy.panels", displayName: "Panel", componentIds: ["component.panel.information", "component.panel.modal", "component.panel.inspector"] },
    { id: "hierarchy.hero-panels", displayName: "Hero Panels", componentIds: ["component.card.hero", "component.card.planet", "component.card.research"] },
    { id: "hierarchy.buttons", displayName: "Buttons", componentIds: ["component.button.primary", "component.button.secondary", "component.button.ghost", "component.button.danger", "component.button.icon"] },
    { id: "hierarchy.primary", displayName: "Primary", componentIds: ["component.button.primary"] },
    { id: "hierarchy.large-primary", displayName: "Large Primary", componentIds: ["component.button.primary"] },
    { id: "hierarchy.loading-primary", displayName: "Loading Primary", componentIds: ["component.button.primary"] }
  ],
  previewModes: [...componentPreviewModes],
  screenUsage: [
    { screenId: "screen.skill-tree", displayName: "Skill Tree", componentIds: ["component.technology-ring.small", "component.technology-ring.medium", "component.technology-ring.research", "component.card.research"] },
    { screenId: "screen.research", displayName: "Research", componentIds: ["component.card.research", "component.technology-ring.research", "component.progress.research", "component.tooltip.rich", "component.list.research"] },
    { screenId: "screen.planet-detail", displayName: "Planet Detail", componentIds: ["component.card.planet", "component.technology-ring.planet", "component.tooltip.planet", "component.table.property-grid", "component.navigation.tabs"] },
    { screenId: "screen.civilization", displayName: "Civilization", componentIds: ["component.technology-ring.core", "component.window.standard", "component.layout-helper.workspace"] },
    { screenId: "screen.galaxy", displayName: "Galaxy", componentIds: ["component.card.planet", "component.technology-ring.planet", "component.tooltip.planet", "component.navigation.breadcrumbs"] },
    { screenId: "screen.upgrade-library", displayName: "Upgrade Library", componentIds: ["component.card.upgrade", "component.technology-ring.upgrade", "component.tooltip.upgrade", "component.progress.upgrade"] },
    { screenId: "screen.discovery-library", displayName: "Discovery Library", componentIds: ["component.card.discovery", "component.list.discovery", "component.input.search-bar", "component.badge.count"] }
  ],
  unityExport: { format: "json", endpoint: "/api/export/component-library.json", implementationOwner: "unity", unknownComponentCode: UNKNOWN_COMPONENT },
  createdAt,
  updatedAt: createdAt
};

function tokenIds(contract: DesignLanguageContract) {
  return new Set([
    ...Object.values(contract.tokens.colors).map((token) => token.id),
    ...Object.values(contract.tokens.typography).map((token) => token.id),
    ...contract.tokens.spacing.tokenIds,
    ...contract.tokens.borders.tokenIds,
    ...Object.values(contract.tokens.shadows).map((token) => token.id),
    ...contract.tokens.glassMaterials.map((token) => token.id),
    ...contract.tokens.glow.map((token) => token.id),
    ...contract.motion.durations.map((token) => token.id),
    ...contract.motion.easing.map((token) => token.id)
  ]);
}

export function validateComponentLibrary(
  library: ComponentLibraryContract = noverisComponentLibrary,
  designLanguage: DesignLanguageContract = noverisDesignLanguage
) {
  const issues: ComponentLibraryValidationIssue[] = [];
  const issue = (code: string, message: string, records: string[]) => issues.push({ severity: "error", code, message, records });
  const availableTokens = tokenIds(designLanguage);
  const componentIds = new Set<string>();
  const prefabIds = new Set<string>();

  if (library.inheritsFrom.id !== designLanguage.id || library.inheritsFrom.version !== designLanguage.version) {
    issue("broken_inheritance", "Component Library must inherit the current canonical Design Language.", [library.id, library.inheritsFrom.id, library.inheritsFrom.version]);
  }

  for (const component of library.components) {
    if (componentIds.has(component.id)) issue("duplicate_component", "Component IDs must be unique.", [component.id]);
    componentIds.add(component.id);
    if (prefabIds.has(component.unityPrefabId)) issue("duplicate_unity_prefab", "Unity prefab identifiers must be unique.", [component.id, component.unityPrefabId]);
    prefabIds.add(component.unityPrefabId);
    if (component.inheritsFrom.id !== designLanguage.id || component.inheritsFrom.version !== designLanguage.version) {
      issue("broken_inheritance", "Components must inherit the current canonical Design Language.", [component.id]);
    }
    if (component.states.length !== componentStates.length || componentStates.some((state) => !component.states.includes(state))) {
      issue("missing_states", "Every component must implement every canonical component state.", [component.id]);
    }
    if (!component.variants.length || new Set(component.variants.map((variantDefinition) => variantDefinition.id)).size !== component.variants.length) {
      issue("duplicate_or_missing_variants", "Every component needs unique canonical variants.", [component.id]);
    }
    if (!component.slots.length || new Set(component.slots.map((slot) => slot.id)).size !== component.slots.length) {
      issue("duplicate_or_missing_slots", "Every component needs unique declared slots.", [component.id]);
    }
    if (!component.animations.length || component.animations.some((animation) => !availableTokens.has(animation))) {
      issue("missing_animations", "Components must reference canonical motion tokens.", [component.id]);
    }
    const references = Object.values(component.designTokens).flat();
    if (!references.length || references.some((reference) => !availableTokens.has(reference))) {
      issue("missing_tokens", "Components may reference only canonical Design Language tokens.", [component.id, ...references.filter((reference) => !availableTokens.has(reference))]);
    }
    if (!component.unityPrefabId) issue("missing_unity_prefab", "Every component requires a Unity prefab identifier.", [component.id]);
    if (component.preview.status !== "ready" || component.preview.supportedModes.length !== componentPreviewModes.length || component.preview.supportedStates.length !== componentStates.length) {
      issue("missing_preview", "Every component requires a complete canonical preview contract.", [component.id]);
    }
    if (!component.usedBy.length) issue("unused_component", "Components must declare at least one canonical usage.", [component.id]);
    if (component.extendsComponentId && !component.extendsComponentId.startsWith("component.")) {
      issue("broken_inheritance", "Extended component references must use canonical component IDs.", [component.id, component.extendsComponentId]);
    }
  }

  for (const component of library.components) {
    if (component.extendsComponentId && !componentIds.has(component.extendsComponentId)) {
      issue("broken_inheritance", "Extended component does not exist in the canonical library.", [component.id, component.extendsComponentId]);
    }
  }

  return { valid: issues.length === 0, status: issues.length ? "Blocked" as const : "Ready" as const, issues };
}

export type UnityComponentUsageAttempt = {
  componentId: string;
  visualOverrides?: DesignLanguageOverrideAttempt;
};

export function validateUnityComponentUsage(attempt: UnityComponentUsageAttempt, library: ComponentLibraryContract = noverisComponentLibrary) {
  const issues: ComponentLibraryValidationIssue[] = [];
  if (!library.components.some((component) => component.id === attempt.componentId)) {
    issues.push({ severity: "error", code: UNKNOWN_COMPONENT, message: "Unity screens may only use components published by the canonical NOVERIS Component Library.", records: [attempt.componentId] });
  }
  for (const issue of validateDesignLanguageOverride(attempt.visualOverrides ?? {})) issues.push(issue);
  return issues;
}

export function buildUnityComponentLibraryExport(library: ComponentLibraryContract = noverisComponentLibrary) {
  return {
    componentLibrary: {
      id: library.id,
      version: library.version,
      status: library.status,
      inheritsFrom: library.inheritsFrom,
      components: library.components.map((component) => ({
        id: component.id,
        version: component.version,
        status: component.status,
        displayName: component.displayName,
        description: component.description,
        category: component.category,
        inheritsFrom: component.inheritsFrom,
        extendsComponentId: component.extendsComponentId,
        designTokens: component.designTokens,
        states: component.states,
        variants: component.variants,
        slots: component.slots,
        animations: component.animations,
        unityPrefabId: component.unityPrefabId,
        unityExport: component.unityExport,
        validation: component.validation
      })),
      hierarchy: library.hierarchy,
      screenUsage: library.screenUsage,
      unityExport: library.unityExport
    },
    export: {
      contractId: library.id,
      version: library.version,
      format: "json" as const,
      implementationOwner: "unity" as const,
      unknownComponentCode: UNKNOWN_COMPONENT,
      designLanguageViolationCode: "DESIGN_LANGUAGE_VIOLATION"
    }
  };
}

export function componentCategoryDefinitions() {
  return categoryDefinitions.map(([id, displayName, description]) => ({ id, displayName, description, count: components.filter((component) => component.category === id).length }));
}

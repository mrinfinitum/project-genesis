export const DESIGN_LANGUAGE_ID = "design-language";
export const DESIGN_LANGUAGE_VERSION = "1.0.0";
export const DESIGN_LANGUAGE_VIOLATION = "DESIGN_LANGUAGE_VIOLATION";

export type DesignLanguageValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  records: string[];
};

export type DesignTokenReference = {
  colors: string[];
  typography: string[];
  spacing: string[];
  radii: string[];
  borders: string[];
  shadows: string[];
  motion: string[];
};

export type DesignComponentDefinition = {
  id: string;
  version: string;
  displayName: string;
  category: "navigation" | "action" | "input" | "feedback" | "surface" | "structure";
  visualTokens: DesignTokenReference;
  padding: string;
  spacing: string;
  radius: string;
  border: string;
  shadow: string;
  hover: string;
  focus: string;
  pressed: string;
  disabled: string;
  animation: string;
  unityPrefabId: string;
};

export type TechnologyRingDefinition = {
  id: string;
  displayName: string;
  diameter: number;
  stroke: number;
  glow: "none" | "restrained" | "selected" | "core";
  rotation: "none" | "slow" | "orbit";
  animation: string;
  supportedStates: Array<"selected" | "hidden" | "locked" | "unlocked" | "available">;
};

export type DesignLanguageContract = {
  id: typeof DESIGN_LANGUAGE_ID;
  version: typeof DESIGN_LANGUAGE_VERSION;
  schemaVersion: "design-language-v1";
  status: "published";
  displayName: "NOVERIS Design Language";
  description: string;
  category: "design-system";
  tokens: {
    colors: Record<string, { id: string; displayName: string; value: string; usage: string }>;
    typography: Record<string, { id: string; fontFamily: string[]; weight: number; size: number; lineHeight: number; letterSpacing: number; opacity: number }>;
    spacing: { baseUnit: number; values: number[]; tokenIds: string[] };
    grid: Array<{ id: string; columns: number; gutter: number; margin: number; minWidth: number }>;
    borders: { standardRadius: number; largeRadius: number; width: number; tokenIds: string[] };
    shadows: Record<string, { id: string; value: string; usage: string }>;
    glassMaterials: Array<{ id: string; displayName: string; background: string; opacity: number; blur: number; border: string; shadow: string; highlight: string }>;
    glow: Array<{ id: string; displayName: string; appliesTo: string[]; color: string; intensity: string }>;
    iconography: { sizes: number[]; strokeWidth: number; defaultColor: string; rules: string[] };
    technologyRings: TechnologyRingDefinition[];
  };
  components: DesignComponentDefinition[];
  layouts: Array<{ id: string; displayName: string; sequence: string[]; appliesTo: string[]; inheritance: "required" }>;
  motion: {
    durations: Array<{ id: string; milliseconds: number }>;
    easing: Array<{ id: string; value: string; usage: string }>;
    transitions: Array<{ state: string; duration: string; easing: string; effects: string[] }>;
    prohibited: string[];
  };
  interaction: {
    states: string[];
    stateRules: Array<{ state: string; visualChange: string; allowedGlow: boolean; requiredFeedback: string }>;
  };
  accessibility: {
    minimumFontSize: number;
    minimumContrast: string;
    focusOutline: string;
    minimumHoverTargetSize: number;
    minimumTargetSize: number;
    controllerNavigation: string;
    keyboardNavigation: string;
  };
  promptProfile: { id: string; title: string; prompt: string; consumers: string[] };
  unityExport: { format: "json"; endpoint: string; rootKey: string; implementationOwner: "unity"; validationCode: typeof DESIGN_LANGUAGE_VIOLATION };
  createdAt: string;
  updatedAt: string;
};

const colorTokens: DesignLanguageContract["tokens"]["colors"] = {
  background: { id: "color.background.near-black", displayName: "Near Black", value: "#05080F", usage: "Application canvas and deep workspace surfaces." },
  panel: { id: "color.panel.dark-navy", displayName: "Dark Navy", value: "#0B1324", usage: "Primary content panels and cards." },
  primary: { id: "color.primary.electric-blue", displayName: "Electric Blue", value: "#49A8FF", usage: "Primary actions, focused controls, and selected state." },
  secondary: { id: "color.secondary.soft-violet", displayName: "Soft Violet", value: "#A878FF", usage: "Secondary emphasis and restrained supporting state." },
  success: { id: "color.success", displayName: "Success", value: "#53D67D", usage: "Confirmed and healthy state." },
  warning: { id: "color.warning", displayName: "Warning", value: "#F2C14E", usage: "Attention required without an error." },
  danger: { id: "color.danger", displayName: "Danger", value: "#FF5C5C", usage: "Errors and destructive actions." },
  textPrimary: { id: "color.text.primary", displayName: "White", value: "#FFFFFF", usage: "Primary readable text." },
  textSecondary: { id: "color.text.secondary", displayName: "70% White", value: "rgba(255,255,255,0.70)", usage: "Supporting text and metadata." },
  border: { id: "color.border.default", displayName: "Aerospace Border", value: "rgba(120,180,255,0.18)", usage: "One pixel surface boundaries." },
  panelOpacity: { id: "opacity.panel", displayName: "Panel Opacity", value: "0.90", usage: "Default panel material opacity." }
};

const typography: DesignLanguageContract["tokens"]["typography"] = {
  display: { id: "type.display", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 700, size: 40, lineHeight: 1.1, letterSpacing: 0, opacity: 1 },
  title: { id: "type.title", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 700, size: 28, lineHeight: 1.2, letterSpacing: 0, opacity: 1 },
  heading: { id: "type.heading", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 650, size: 20, lineHeight: 1.3, letterSpacing: 0, opacity: 1 },
  subheading: { id: "type.subheading", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 600, size: 16, lineHeight: 1.35, letterSpacing: 0, opacity: 1 },
  body: { id: "type.body", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 400, size: 14, lineHeight: 1.5, letterSpacing: 0, opacity: 1 },
  caption: { id: "type.caption", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 400, size: 12, lineHeight: 1.4, letterSpacing: 0, opacity: 0.7 },
  metadata: { id: "type.metadata", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 600, size: 11, lineHeight: 1.3, letterSpacing: 0.08, opacity: 0.7 },
  button: { id: "type.button", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 600, size: 14, lineHeight: 1.2, letterSpacing: 0, opacity: 1 },
  label: { id: "type.label", fontFamily: ["Inter", "IBM Plex Sans", "sans-serif"], weight: 650, size: 12, lineHeight: 1.2, letterSpacing: 0.06, opacity: 0.85 }
};

const spacingTokenIds = ["space.4", "space.8", "space.16", "space.24", "space.32", "space.48", "space.64", "space.96", "space.128"];
const componentNames: Array<[string, string, DesignComponentDefinition["category"]]> = [
  ["navigation", "Navigation", "navigation"], ["sidebar", "Sidebar", "navigation"], ["header", "Header", "structure"], ["footer", "Footer", "structure"],
  ["primary-button", "Primary Button", "action"], ["secondary-button", "Secondary Button", "action"], ["ghost-button", "Ghost Button", "action"],
  ["search", "Search", "input"], ["input", "Input", "input"], ["dropdown", "Dropdown", "input"], ["tab", "Tab", "input"], ["badge", "Badge", "feedback"], ["tooltip", "Tooltip", "feedback"], ["progress-bar", "Progress Bar", "feedback"],
  ["technology-ring", "Technology Ring", "feedback"], ["card", "Card", "surface"], ["inspector-panel", "Inspector Panel", "surface"], ["content-panel", "Content Panel", "surface"], ["hero-card", "Hero Card", "surface"], ["divider", "Divider", "structure"], ["scrollbar", "Scrollbar", "structure"], ["modal", "Modal", "surface"], ["notification", "Notification", "feedback"], ["empty-state", "Empty State", "feedback"], ["loading-state", "Loading State", "feedback"]
];

const componentDefinitions: DesignComponentDefinition[] = componentNames.map(([id, displayName, category]) => ({
  id: `component.${id}`,
  version: DESIGN_LANGUAGE_VERSION,
  displayName,
  category,
  visualTokens: {
    colors: [colorTokens.panel.id, colorTokens.textPrimary.id, colorTokens.border.id, colorTokens.primary.id],
    typography: category === "action" ? [typography.button.id] : [typography.body.id, typography.label.id],
    spacing: ["space.8", "space.16"],
    radii: ["radius.standard"],
    borders: ["border.standard"],
    shadows: ["shadow.small"],
    motion: ["motion.150", "easing.ease-out-cubic"]
  },
  padding: "space.16",
  spacing: "space.8",
  radius: "radius.standard",
  border: "border.standard",
  shadow: "shadow.small",
  hover: "interaction.hover",
  focus: "interaction.focused",
  pressed: "interaction.pressed",
  disabled: "interaction.disabled",
  animation: "motion.150",
  unityPrefabId: `Noveris${displayName.replace(/[^A-Za-z0-9]+/g, "")}Prefab`
}));

const technologyRings: TechnologyRingDefinition[] = [
  ["small", "Small", 32, 2, "none", "none"], ["medium", "Medium", 48, 2, "restrained", "slow"], ["large", "Large", 72, 3, "restrained", "slow"],
  ["core", "Core", 112, 3, "core", "orbit"], ["planet", "Planet", 64, 2, "restrained", "orbit"], ["research", "Research", 56, 2, "selected", "slow"], ["upgrade", "Upgrade", 56, 2, "selected", "slow"]
].map(([id, displayName, diameter, stroke, glow, rotation]) => ({
  id: `technology-ring.${id}`,
  displayName: String(displayName),
  diameter: Number(diameter),
  stroke: Number(stroke),
  glow: glow as TechnologyRingDefinition["glow"],
  rotation: rotation as TechnologyRingDefinition["rotation"],
  animation: "motion.200",
  supportedStates: ["selected", "hidden", "locked", "unlocked", "available"]
}));

export const noverisDesignLanguage: DesignLanguageContract = {
  id: DESIGN_LANGUAGE_ID,
  version: DESIGN_LANGUAGE_VERSION,
  schemaVersion: "design-language-v1",
  status: "published",
  displayName: "NOVERIS Design Language",
  description: "Canonical visual, interaction, spacing, typography, motion, and component rules for NOVERIS clients. Unity consumes definitions; Unity owns implementation.",
  category: "design-system",
  tokens: {
    colors: colorTokens,
    typography,
    spacing: { baseUnit: 8, values: [4, 8, 16, 24, 32, 48, 64, 96, 128], tokenIds: spacingTokenIds },
    grid: [
      { id: "grid.desktop", columns: 16, gutter: 24, margin: 48, minWidth: 1280 },
      { id: "grid.tablet", columns: 12, gutter: 20, margin: 32, minWidth: 768 },
      { id: "grid.mobile", columns: 8, gutter: 16, margin: 16, minWidth: 0 }
    ],
    borders: { standardRadius: 8, largeRadius: 12, width: 1, tokenIds: ["radius.standard", "radius.large", "border.standard"] },
    shadows: {
      none: { id: "shadow.none", value: "none", usage: "Flat surfaces." },
      small: { id: "shadow.small", value: "0 4px 14px rgba(0,0,0,0.18)", usage: "Quiet elevation." },
      medium: { id: "shadow.medium", value: "0 10px 24px rgba(0,0,0,0.22)", usage: "Raised workspace panels." },
      large: { id: "shadow.large", value: "0 18px 42px rgba(0,0,0,0.28)", usage: "Modal or focused panel." },
      extraLarge: { id: "shadow.xlarge", value: "0 28px 64px rgba(0,0,0,0.34)", usage: "Only for a top-level modal." }
    },
    glassMaterials: [
      { id: "glass.primary", displayName: "Primary Glass", background: "#0B1324", opacity: 0.9, blur: 16, border: "color.border.default", shadow: "shadow.small", highlight: "color.primary.electric-blue" },
      { id: "glass.secondary", displayName: "Secondary Glass", background: "#05080F", opacity: 0.86, blur: 12, border: "color.border.default", shadow: "shadow.none", highlight: "none" },
      { id: "glass.inspector", displayName: "Inspector Glass", background: "#0B1324", opacity: 0.94, blur: 20, border: "color.border.default", shadow: "shadow.medium", highlight: "color.secondary.soft-violet" },
      { id: "glass.navigation", displayName: "Navigation Glass", background: "#05080F", opacity: 0.92, blur: 14, border: "color.border.default", shadow: "shadow.none", highlight: "color.primary.electric-blue" },
      { id: "glass.modal", displayName: "Modal Glass", background: "#0B1324", opacity: 0.96, blur: 24, border: "color.border.default", shadow: "shadow.large", highlight: "color.primary.electric-blue" }
    ],
    glow: [
      { id: "glow.hover", displayName: "Hover", appliesTo: ["hover"], color: "color.primary.electric-blue", intensity: "restrained" },
      { id: "glow.selected", displayName: "Selected", appliesTo: ["selected", "active"], color: "color.primary.electric-blue", intensity: "restrained" },
      { id: "glow.focused", displayName: "Focused", appliesTo: ["focused"], color: "color.primary.electric-blue", intensity: "restrained" },
      { id: "glow.civilization-core", displayName: "Civilization Core", appliesTo: ["Civilization Core"], color: "color.secondary.soft-violet", intensity: "restrained" },
      { id: "glow.research-ring", displayName: "Research Ring", appliesTo: ["Research Ring"], color: "color.primary.electric-blue", intensity: "restrained" },
      { id: "glow.technology-ring", displayName: "Technology Ring", appliesTo: ["Technology Ring"], color: "color.primary.electric-blue", intensity: "restrained" }
    ],
    iconography: { sizes: [16, 20, 24, 32, 48, 64], strokeWidth: 1.75, defaultColor: "color.text.primary", rules: ["Use a white stroke by default.", "Use a consistent stroke width.", "Use minimal fills.", "Use accent color only for state.", "Never use multicolor icons by default."] },
    technologyRings
  },
  components: componentDefinitions,
  layouts: [
    { id: "layout.unity-screen-standard", displayName: "Unity Screen Standard", sequence: ["top-navigation", "page-header", "primary-workspace", "inspector-panel", "footer"], appliesTo: ["all future Unity UI screens"], inheritance: "required" },
    { id: "layout.library-browser", displayName: "Library Browser", sequence: ["top-navigation", "page-header", "content-tree", "primary-workspace", "inspector-panel"], appliesTo: ["libraries and catalogs"], inheritance: "required" }
  ],
  motion: {
    durations: [120, 150, 200, 250, 400].map((milliseconds) => ({ id: `motion.${milliseconds}`, milliseconds })),
    easing: [
      { id: "easing.ease-out-cubic", value: "cubic-bezier(0.22, 1, 0.36, 1)", usage: "Entry and hover response." },
      { id: "easing.ease-in-out", value: "cubic-bezier(0.65, 0, 0.35, 1)", usage: "State transition." },
      { id: "easing.fade", value: "opacity", usage: "Content transition." },
      { id: "easing.scale", value: "transform: scale", usage: "Focused surface." },
      { id: "easing.slide", value: "transform: translate", usage: "Panel entry." },
      { id: "easing.glow-pulse", value: "opacity and box-shadow", usage: "Only approved ring states." }
    ],
    transitions: ["hover", "selected", "focused", "pressed", "disabled", "loading", "error", "success", "warning"].map((state) => ({ state, duration: state === "loading" ? "motion.400" : "motion.150", easing: "easing.ease-out-cubic", effects: state === "disabled" ? ["opacity"] : ["color", "border", "opacity"] })),
    prohibited: ["linear easing", "global glow", "continuous non-semantic animation"]
  },
  interaction: {
    states: ["hover", "selected", "focused", "pressed", "disabled", "loading", "error", "success", "warning"],
    stateRules: [
      { state: "hover", visualChange: "Raise contrast and apply restrained hover glow.", allowedGlow: true, requiredFeedback: "pointer response" },
      { state: "selected", visualChange: "Use primary border and selected treatment.", allowedGlow: true, requiredFeedback: "persistent selection" },
      { state: "focused", visualChange: "Show accessible primary focus outline.", allowedGlow: true, requiredFeedback: "keyboard target" },
      { state: "pressed", visualChange: "Reduce elevation without layout shift.", allowedGlow: false, requiredFeedback: "press acknowledgement" },
      { state: "disabled", visualChange: "Reduce opacity while retaining readable text.", allowedGlow: false, requiredFeedback: "unavailable explanation" },
      { state: "loading", visualChange: "Use quiet progress motion.", allowedGlow: false, requiredFeedback: "in-progress status" },
      { state: "error", visualChange: "Use danger color sparingly.", allowedGlow: false, requiredFeedback: "clear recovery action" },
      { state: "success", visualChange: "Use success color sparingly.", allowedGlow: false, requiredFeedback: "completion confirmation" },
      { state: "warning", visualChange: "Use warning color sparingly.", allowedGlow: false, requiredFeedback: "attention required" }
    ]
  },
  accessibility: {
    minimumFontSize: 12,
    minimumContrast: "WCAG AA 4.5:1 for standard text; 3:1 for large text.",
    focusOutline: "2px solid color.primary.electric-blue with 2px offset",
    minimumHoverTargetSize: 32,
    minimumTargetSize: 44,
    controllerNavigation: "Every interactive control requires deterministic directional navigation and visible focused state.",
    keyboardNavigation: "Every interactive control must be reachable with keyboard navigation and expose an accessible name."
  },
  promptProfile: {
    id: "prompt-profile.noveris-design-language",
    title: "NOVERIS Design Language",
    prompt: "Premium AAA science-fiction interface. Dark navy-black translucent aerospace glass. Minimal retro-space aesthetics inspired by NASA mission control. Thin cyan illuminated borders. Subtle violet secondary accents. Elegant geometric construction. Clean typography. Restrained glow. Purposeful spacing. Premium engineering quality. Scientific. Calm. Sophisticated. Readable. Orthographic presentation.",
    consumers: ["HUD Generator", "Background Generator", "Card Generator", "Icon Generator", "Research Generator", "Planet Detail Generator", "Skill Tree Generator"]
  },
  unityExport: { format: "json", endpoint: "/api/export/design-language.json", rootKey: "designLanguage", implementationOwner: "unity", validationCode: DESIGN_LANGUAGE_VIOLATION },
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z"
};

function allTokenIds(contract: DesignLanguageContract) {
  return new Set([
    ...Object.values(contract.tokens.colors).map((token) => token.id),
    ...Object.values(contract.tokens.typography).map((token) => token.id),
    ...contract.tokens.spacing.tokenIds,
    ...contract.tokens.borders.tokenIds,
    ...Object.values(contract.tokens.shadows).map((token) => token.id),
    ...contract.tokens.glassMaterials.map((material) => material.id),
    ...contract.tokens.glow.map((glow) => glow.id),
    ...contract.tokens.technologyRings.map((ring) => ring.id),
    ...contract.motion.durations.map((duration) => duration.id),
    ...contract.motion.easing.map((easing) => easing.id),
    ...contract.interaction.states.map((state) => `interaction.${state}`)
  ]);
}

export function validateDesignLanguage(contract: DesignLanguageContract = noverisDesignLanguage) {
  const issues: DesignLanguageValidationIssue[] = [];
  const issue = (code: string, message: string, records: string[]) => issues.push({ severity: "error", code, message, records });
  const tokenIds = allTokenIds(contract);
  const componentIds = new Set<string>();

  if (contract.id !== DESIGN_LANGUAGE_ID || !/^\d+\.\d+\.\d+$/.test(contract.version)) {
    issue("invalid_contract_identity", "Design Language must use the canonical id and semantic version.", [contract.id, contract.version]);
  }
  if (contract.tokens.colors.background.value !== "#05080F" || contract.tokens.colors.panel.value !== "#0B1324") {
    issue("missing_required_colors", "Near Black and Dark Navy must use canonical NOVERIS values.", ["color.background.near-black", "color.panel.dark-navy"]);
  }
  const colorValues = Object.values(contract.tokens.colors).map((token) => token.value);
  const duplicateColors = colorValues.filter((value, index) => colorValues.indexOf(value) !== index);
  if (duplicateColors.length) issue("duplicate_colors", "Color tokens may not duplicate values.", [...new Set(duplicateColors)]);
  if (contract.tokens.spacing.baseUnit !== 8 || contract.tokens.spacing.values.join(",") !== "4,8,16,24,32,48,64,96,128") {
    issue("invalid_spacing_scale", "Spacing must use the canonical 8px-based scale.", contract.tokens.spacing.values.map(String));
  }
  if (!contract.motion.durations.map((duration) => duration.milliseconds).every((duration) => [120, 150, 200, 250, 400].includes(duration))) {
    issue("invalid_motion_duration", "Motion durations must use the canonical duration set.", contract.motion.durations.map((duration) => duration.id));
  }
  if (contract.motion.prohibited.every((rule) => rule !== "linear easing")) {
    issue("linear_easing_not_prohibited", "The Design Language must explicitly prohibit linear easing.", ["motion.prohibited"]);
  }

  for (const component of contract.components) {
    if (componentIds.has(component.id)) issue("duplicate_component", "Components must have unique IDs.", [component.id]);
    componentIds.add(component.id);
    if (!component.unityPrefabId || !component.version) {
      issue("component_style_incomplete", "Components must provide a versioned implementation and visual contract.", [component.id]);
    }
    const references = Object.values(component.visualTokens).flat();
    for (const reference of references) {
      if (!tokenIds.has(reference)) issue("component_unknown_token", "Component references a token outside the Design Language.", [component.id, reference]);
    }
    for (const reference of [component.padding, component.spacing, component.radius, component.border, component.shadow, component.animation, component.hover, component.focus, component.pressed, component.disabled]) {
      if (!tokenIds.has(reference)) issue("component_missing_token", "Component field must reference a canonical token.", [component.id, reference]);
    }
  }
  if (!contract.layouts.every((layout) => layout.inheritance === "required" && layout.sequence.includes("primary-workspace"))) {
    issue("layout_violation", "All layout templates must require Design Language inheritance and a primary workspace.", contract.layouts.map((layout) => layout.id));
  }
  if (!contract.interaction.states.every((state) => contract.interaction.stateRules.some((rule) => rule.state === state))) {
    issue("interaction_violation", "Every interaction state requires a canonical rule.", contract.interaction.states);
  }
  if (contract.unityExport.format !== "json" || contract.unityExport.validationCode !== DESIGN_LANGUAGE_VIOLATION) {
    issue("unity_export_invalid", "Unity design exports must be JSON and publish the design violation contract.", ["unityExport"]);
  }
  return { valid: issues.length === 0, status: issues.length ? "Blocked" as const : "Ready" as const, issues };
}

export type DesignLanguageOverrideAttempt = Partial<{
  colors: string[];
  spacing: number[];
  typography: string[];
  radii: number[];
  borders: string[];
  animations: string[];
}>;

export function validateDesignLanguageOverride(attempt: DesignLanguageOverrideAttempt, contract: DesignLanguageContract = noverisDesignLanguage) {
  const allowedColors = new Set(Object.values(contract.tokens.colors).map((token) => token.value));
  const allowedSpacing = new Set(contract.tokens.spacing.values);
  const allowedTypography = new Set(Object.values(contract.tokens.typography).map((token) => token.id));
  const allowedRadii = new Set([contract.tokens.borders.standardRadius, contract.tokens.borders.largeRadius]);
  const allowedBorders = new Set(["border.standard", contract.tokens.colors.border.value]);
  const allowedAnimations = new Set([...contract.motion.durations.map((item) => item.id), ...contract.motion.easing.map((item) => item.id)]);
  const records = [
    ...(attempt.colors ?? []).filter((value) => !allowedColors.has(value)),
    ...(attempt.spacing ?? []).filter((value) => !allowedSpacing.has(value)).map(String),
    ...(attempt.typography ?? []).filter((value) => !allowedTypography.has(value)),
    ...(attempt.radii ?? []).filter((value) => !allowedRadii.has(value)).map(String),
    ...(attempt.borders ?? []).filter((value) => !allowedBorders.has(value)),
    ...(attempt.animations ?? []).filter((value) => !allowedAnimations.has(value))
  ];
  return records.length
    ? [{ severity: "error" as const, code: DESIGN_LANGUAGE_VIOLATION, message: "A visual value was not defined by the canonical NOVERIS Design Language.", records }]
    : [];
}

export function buildUnityDesignLanguageExport(contract: DesignLanguageContract = noverisDesignLanguage) {
  return {
    designLanguage: contract,
    export: {
      contractId: contract.id,
      version: contract.version,
      schemaVersion: contract.schemaVersion,
      format: "json" as const,
      implementationOwner: "unity" as const,
      validationCode: DESIGN_LANGUAGE_VIOLATION
    }
  };
}

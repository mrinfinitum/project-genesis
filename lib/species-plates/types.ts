export type SpeciesPlateDomain = "creature" | "plant" | "fungi" | "microorganism" | "exotic-life" | "comparative" | "ecosystem";
export type SpeciesPlatePanelRole = "hero" | "orthographic" | "anatomy" | "lifecycle" | "variant" | "detail" | "scale" | "environment";
export type SpeciesPlateProductionStatus = "not_started" | "awaiting_prompt" | "prompt_ready" | "generating" | "generated" | "awaiting_review" | "approved" | "rejected" | "revision_required" | "extraction_pending" | "extracted" | "published" | "stale" | "blocked";
export type SpeciesPlateValidationSeverity = "Canon Conflict" | "Structural Error" | "Production Error" | "Visual Consistency Warning" | "Missing Optional Data" | "Runtime Export Error";

export type PlateBounds = { x: number; y: number; width: number; height: number };

export type SpeciesPlatePanel = {
  id: string;
  title: string;
  domain: SpeciesPlateDomain[];
  required: boolean;
  enabled: boolean;
  order: number;
  role: SpeciesPlatePanelRole;
  outputType: string;
  sourcePromptId: string | null;
  sourceAssetId: string | null;
  generatedAssetId: string | null;
  aspectRatio: string;
  targetBounds: PlateBounds;
  safeBounds: PlateBounds;
  cameraProfileId: string;
  lightingProfileId: string;
  backgroundProfileId: string;
  extractionMode: "isolated" | "study" | "context";
  transparentCompatible: boolean;
  preserveScale: boolean;
  preserveAnatomy: boolean;
  preserveColor: boolean;
  preserveMaterials: boolean;
  allowVariant: boolean;
  validationStatus: "valid" | "warning" | "blocked";
  productionStatus: SpeciesPlateProductionStatus;
  notes: string;
};

export type SpeciesPlateGroup = {
  id: string;
  title: string;
  required: boolean;
  order: number;
  layoutMode: "hero" | "grid" | "strip" | "stack";
  gridColumns: number;
  gap: number;
  padding: number;
  minPanels: number;
  maxPanels: number;
  panels: SpeciesPlatePanel[];
};

export type SpeciesPlateTemplate = {
  id: "SPECIES_PLATE_MASTER_V1";
  type: "species_plate_template";
  version: "1.0.0";
  canonical: true;
  resolution: [4000, 4000];
  aspectRatio: "1:1";
  background: "pure-black";
  modelProfileId: "nano-banana-2";
  styleProfileId: "STYLE_NOVERIS_SCIENTIFIC_REALISM";
  cameraProfileId: "CAM_SPECIES_PLATE";
  lightingProfileId: "LIGHT_MUSEUM_SPECIMEN";
  defaultVersionCount: 4;
  psdFriendly: true;
  anatomyChangesAllowed: false;
  materialChangesAllowed: false;
  backgroundChangesAllowed: false;
  naturalVariationAllowed: true;
  groups: SpeciesPlateGroup[];
};

export type SpeciesPlatePreset = {
  id: string;
  displayName: string;
  domain: SpeciesPlateDomain;
  enabledGroupIds: string[];
  enabledPanelIds: string[];
  notes: string;
};

export type SpeciesPlateVariationProfile = {
  id: string;
  displayName: string;
  strength: "strict" | "conservative" | "standard" | "variant";
  allowedChanges: string[];
  lockedFields: string[];
};

export type SpeciesPlateRecord = {
  id: string;
  canonicalRecordId: string;
  domain: SpeciesPlateDomain;
  templateId: string;
  templateVersion: string;
  presetId: string;
  generationSeed: string;
  sourcePromptId: string | null;
  promptHash: string | null;
  productionStatus: SpeciesPlateProductionStatus;
  panels: SpeciesPlatePanel[];
  createdAt: string;
  updatedAt: string;
};

export type SpeciesPlateValidationIssue = {
  severity: SpeciesPlateValidationSeverity;
  code: string;
  message: string;
  panelId?: string;
};

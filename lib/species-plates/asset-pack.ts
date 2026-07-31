import { createHash } from "node:crypto";
import { SPECIES_PLATE_MASTER_V1 } from "@/lib/species-plates/master-template";
import type { SpeciesPlatePanel } from "@/lib/species-plates/types";

export const SPECIES_PLATE_ASSET_PACK_VERSION = "1.0.0";

export type SpeciesPlateSlice = {
  id: string;
  displayName: string;
  panelId: string;
  psdLayerGroup: string;
  exportFilename: string;
  runtimePath: string;
  spriteType: "simple" | "sliced";
  nineSlice: { enabled: boolean; border: [number, number, number, number] };
  pivot: [number, number];
  defaultScale: number;
  bounds: SpeciesPlatePanel["targetBounds"];
  transparentCompatible: boolean;
};

export type SpeciesPlateAssetPackContract = {
  id: "SpeciesPlateMaster";
  filename: "SpeciesPlateMaster.artpack";
  version: string;
  canvas: { width: 4000; height: 4000; aspectRatio: "1:1"; background: "pure-black" };
  master: { id: "SPECIES_PLATE_MASTER_V1"; version: "1.0.0"; modelProfile: "nano-banana-2"; styleProfile: string; cameraProfile: string; lightingProfile: string };
  manifest: {
    assetPack: "species-plate";
    version: string;
    templateId: "SPECIES_PLATE_MASTER_V1";
    templateVersion: "1.0.0";
    canvas: [4000, 4000];
    slices: Record<string, string>;
  };
  slices: SpeciesPlateSlice[];
  validationStatus: "Ready";
  hash: string;
};

function titleFromPanel(panel: SpeciesPlatePanel) {
  return panel.title.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const allPanels = SPECIES_PLATE_MASTER_V1.groups.flatMap((group) => group.panels);

export const speciesPlateSlices: SpeciesPlateSlice[] = allPanels.map((panel) => ({
  id: `species_plate_${panel.id}`,
  displayName: titleFromPanel(panel),
  panelId: panel.id,
  psdLayerGroup: `${SPECIES_PLATE_MASTER_V1.id}/${panel.id}`,
  exportFilename: `${panel.id}.png`,
  runtimePath: `sprites/${panel.id}.png`,
  spriteType: panel.role === "environment" ? "sliced" : "simple",
  nineSlice: { enabled: panel.role === "environment", border: panel.role === "environment" ? [24, 24, 24, 24] : [0, 0, 0, 0] },
  pivot: [0.5, 0.5],
  defaultScale: 1,
  bounds: panel.targetBounds,
  transparentCompatible: panel.transparentCompatible
}));

const manifest = {
  assetPack: "species-plate" as const,
  version: SPECIES_PLATE_ASSET_PACK_VERSION,
  templateId: SPECIES_PLATE_MASTER_V1.id,
  templateVersion: SPECIES_PLATE_MASTER_V1.version,
  canvas: SPECIES_PLATE_MASTER_V1.resolution,
  slices: Object.fromEntries(speciesPlateSlices.map((slice) => [slice.panelId, slice.runtimePath]))
};

const contractWithoutHash = {
  id: "SpeciesPlateMaster" as const,
  filename: "SpeciesPlateMaster.artpack" as const,
  version: SPECIES_PLATE_ASSET_PACK_VERSION,
  canvas: { width: 4000 as const, height: 4000 as const, aspectRatio: "1:1" as const, background: "pure-black" as const },
  master: { id: SPECIES_PLATE_MASTER_V1.id, version: SPECIES_PLATE_MASTER_V1.version, modelProfile: SPECIES_PLATE_MASTER_V1.modelProfile, styleProfile: SPECIES_PLATE_MASTER_V1.styleProfileId, cameraProfile: SPECIES_PLATE_MASTER_V1.cameraProfileId, lightingProfile: SPECIES_PLATE_MASTER_V1.lightingProfileId },
  manifest,
  slices: speciesPlateSlices,
  validationStatus: "Ready" as const
};

export const speciesPlateAssetPackContract: SpeciesPlateAssetPackContract = {
  ...contractWithoutHash,
  hash: createHash("sha256").update(JSON.stringify(contractWithoutHash)).digest("hex")
};

export const speciesPlateLayoutManifest = {
  templateId: SPECIES_PLATE_MASTER_V1.id,
  templateVersion: SPECIES_PLATE_MASTER_V1.version,
  canvas: { width: 4000, height: 4000, aspectRatio: "1:1" },
  groups: SPECIES_PLATE_MASTER_V1.groups.map(({ id, title, order, layoutMode, gridColumns, gap, padding, minPanels, maxPanels }) => ({ id, title, order, layoutMode, gridColumns, gap, padding, minPanels, maxPanels }))
};

export const speciesPlatePanelManifest = {
  templateId: SPECIES_PLATE_MASTER_V1.id,
  templateVersion: SPECIES_PLATE_MASTER_V1.version,
  panels: speciesPlateSlices.map(({ id, panelId, displayName, spriteType, nineSlice, pivot, defaultScale, bounds, transparentCompatible }) => ({ id, panelId, displayName, spriteType, nineSlice, pivot, defaultScale, bounds, transparentCompatible }))
};

export const speciesPlateSliceManifest = {
  assetPack: speciesPlateAssetPackContract.id,
  version: speciesPlateAssetPackContract.version,
  slices: speciesPlateAssetPackContract.slices.map(({ id, panelId, runtimePath, exportFilename, spriteType, nineSlice, pivot, defaultScale }) => ({ id, panelId, runtimePath, exportFilename, spriteType, nineSlice, pivot, defaultScale }))
};

export function validateSpeciesPlateAssetPack(contract: SpeciesPlateAssetPackContract = speciesPlateAssetPackContract) {
  const issues: string[] = [];
  const ids = new Set<string>();
  const panelIds = new Set<string>();
  if (contract.canvas.width !== 4000 || contract.canvas.height !== 4000) issues.push("Species plate asset pack must preserve the canonical 4000 x 4000 canvas.");
  if (contract.slices.length !== allPanels.length) issues.push(`Expected ${allPanels.length} species plate slices, received ${contract.slices.length}.`);
  for (const slice of contract.slices) {
    if (ids.has(slice.id)) issues.push(`Duplicate species plate slice ID: ${slice.id}.`);
    if (panelIds.has(slice.panelId)) issues.push(`Duplicate panel slice mapping: ${slice.panelId}.`);
    ids.add(slice.id);
    panelIds.add(slice.panelId);
    const { x, y, width, height } = slice.bounds;
    if (x < 0 || y < 0 || x + width > contract.canvas.width || y + height > contract.canvas.height) issues.push(`Slice bounds are outside the canonical canvas: ${slice.panelId}.`);
    if (!slice.runtimePath.startsWith("sprites/") || !slice.runtimePath.endsWith(".png")) issues.push(`Invalid package slice path: ${slice.panelId}.`);
  }
  const serialized = JSON.stringify(contract);
  for (const forbidden of ["/Users/", "source-masters/", ".psd", "positivePrompt", "negativePrompt", "rejected"]) {
    if (serialized.includes(forbidden)) issues.push(`Species plate export leaks private authoring data: ${forbidden}.`);
  }
  const { hash: _hash, ...withoutHash } = contract;
  const expectedHash = createHash("sha256").update(JSON.stringify(withoutHash)).digest("hex");
  if (contract.hash !== expectedHash) issues.push("Species plate asset pack hash does not match the sanitized contract.");
  return issues;
}

export function buildSpeciesPlateArtpackDescriptor() {
  return {
    format: "noveris-artpack-v1",
    package: { id: speciesPlateAssetPackContract.id, filename: speciesPlateAssetPackContract.filename, version: speciesPlateAssetPackContract.version, hash: speciesPlateAssetPackContract.hash },
    files: {
      "SpeciesPlateMaster/SpeciesPlateMaster.manifest.json": speciesPlateAssetPackContract.manifest,
      "SpeciesPlateMaster/metadata.json": { canvas: speciesPlateAssetPackContract.canvas, master: speciesPlateAssetPackContract.master, validationStatus: speciesPlateAssetPackContract.validationStatus },
      "SpeciesPlateMaster/sprites/index.json": speciesPlateAssetPackContract.slices.map(({ id, panelId, runtimePath, spriteType, nineSlice, pivot, defaultScale, bounds, transparentCompatible }) => ({ id, panelId, path: runtimePath, spriteType, nineSlice, pivot, defaultScale, bounds, transparentCompatible }))
    }
  };
}

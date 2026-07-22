import type { ImportIssue, StarSystemBackgroundValidationCapabilities } from "@/types/runtime";

export type StarSystemPsdInspection = {
  width?: number;
  height?: number;
  colorMode?: string;
  bitDepth?: number;
  layerNames: string[];
  groupNames: string[];
  capabilities: StarSystemBackgroundValidationCapabilities;
  issues: ImportIssue[];
};

const requiredLayerGroups = [
  "00_GUIDES_DO_NOT_EXPORT",
  "01_BACKGROUND_BASE",
  "02_NEBULA",
  "03_DUST_AND_STARS",
  "04_ATLAS_DECORATION_OPTIONAL",
  "05_FOG_MASKS_OPTIONAL",
  "99_NOTES_DO_NOT_EXPORT"
];

type PsdNode = {
  name?: string;
  children?: PsdNode[];
  width?: number;
  height?: number;
  colorMode?: string | number;
  bitsPerChannel?: number;
};

function collectLayerNames(node: PsdNode | undefined, names: string[] = [], groups: string[] = []) {
  if (!node) return { names, groups };
  if (node.name) {
    names.push(node.name);
    if (node.children?.length) groups.push(node.name);
  }
  for (const child of node.children ?? []) collectLayerNames(child, names, groups);
  return { names, groups };
}

export async function inspectStarSystemPsd(buffer: Buffer, recordId = "uploaded-psd"): Promise<StarSystemPsdInspection> {
  const issues: ImportIssue[] = [];
  try {
    const { readPsd } = await import("ag-psd");
    const psd = readPsd(buffer, { skipCompositeImageData: true, skipLayerImageData: true }) as PsdNode;
    const collected = collectLayerNames(psd);
    const groupSet = new Set(collected.groups);
    const missingGroups = requiredLayerGroups.filter((group) => !groupSet.has(group));

    if ((psd.width ?? 0) < 3840 || (psd.height ?? 0) < 2160) {
      issues.push({ severity: "error", code: "psd_canvas_below_minimum", message: "PSD canvas must be at least 3840x2160 for desktop runtime derivatives.", records: [recordId] });
    }
    if (psd.width && psd.height && Math.abs(psd.width / psd.height - 16 / 9) > 0.02) {
      issues.push({ severity: "warning", code: "psd_aspect_ratio_nonstandard", message: "PSD is not close to 16:9; a desktop crop must be configured before publication.", records: [recordId] });
    }
    if (missingGroups.length) {
      issues.push({ severity: "warning", code: "psd_required_groups_missing", message: "PSD is missing one or more recommended NOVERIS template layer groups.", records: [recordId, ...missingGroups] });
    }

    return {
      width: psd.width,
      height: psd.height,
      colorMode: psd.colorMode === undefined ? undefined : String(psd.colorMode),
      bitDepth: psd.bitsPerChannel,
      layerNames: collected.names,
      groupNames: collected.groups,
      capabilities: {
        canvasMetadata: true,
        colorMode: psd.colorMode !== undefined,
        bitDepth: psd.bitsPerChannel !== undefined,
        layerGroups: true,
        flattenedPreview: false,
        luminanceAnalysis: false
      },
      issues
    };
  } catch (error) {
    return {
      layerNames: [],
      groupNames: [],
      capabilities: {
        canvasMetadata: false,
        colorMode: false,
        bitDepth: false,
        layerGroups: false,
        flattenedPreview: false,
        luminanceAnalysis: false
      },
      issues: [
        {
          severity: "warning",
          code: "psd_parse_failed",
          message: error instanceof Error ? error.message : "PSD parser could not inspect this source file.",
          records: [recordId]
        }
      ]
    };
  }
}

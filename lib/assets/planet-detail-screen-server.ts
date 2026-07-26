import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { readPsd } from "ag-psd";
import {
  planetDetailScreenRuntimeContract,
  type PlanetDetailScreenSlice
} from "@/lib/assets/planet-detail-screen";

const SOURCE_ROOT = path.join(process.cwd(), "source-masters", "ui", "screens", "planet-detail");

const sourceDocuments = [
  { id: "biome-environment", filename: "biome-enviroment.psd", displayName: "Biome Environment" },
  { id: "creatures-life", filename: "creatures-life.psd", displayName: "Creatures & Life" },
  { id: "resources", filename: "resources.psd", displayName: "Resources" },
  { id: "weather-climate", filename: "weather-climate.psd", displayName: "Weather & Climate" }
] as const;

function collectLayerNames(children: ReturnType<typeof readPsd>["children"] = [], names: string[] = []) {
  for (const child of children ?? []) {
    if (child.name) names.push(child.name);
    collectLayerNames(child.children, names);
  }
  return names;
}

export type PlanetDetailSourceAudit = {
  id: string;
  displayName: string;
  filename: string;
  exists: boolean;
  width: number | null;
  height: number | null;
  bytes: number | null;
  checksum: string | null;
  layerNames: string[];
};

export type PlanetDetailSliceAudit = PlanetDetailScreenSlice & {
  sourceFilename: string | null;
  sourceExists: boolean;
  layerMapped: boolean;
  sourceStatus: "Mapped" | "Layer Group Missing" | "Source Assignment Required" | "Source Missing";
};

export async function auditPlanetDetailScreenSources() {
  const sources: PlanetDetailSourceAudit[] = await Promise.all(
    sourceDocuments.map(async (source) => {
      const sourcePath = path.join(SOURCE_ROOT, source.filename);
      try {
        const [buffer, fileStat] = await Promise.all([readFile(sourcePath), stat(sourcePath)]);
        const psd = readPsd(buffer, { skipLayerImageData: true, skipCompositeImageData: true });
        return {
          id: source.id,
          displayName: source.displayName,
          filename: source.filename,
          exists: true,
          width: psd.width,
          height: psd.height,
          bytes: fileStat.size,
          checksum: createHash("sha256").update(buffer).digest("hex"),
          layerNames: collectLayerNames(psd.children)
        };
      } catch {
        return {
          id: source.id,
          displayName: source.displayName,
          filename: source.filename,
          exists: false,
          width: null,
          height: null,
          bytes: null,
          checksum: null,
          layerNames: []
        };
      }
    })
  );

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const slices: PlanetDetailSliceAudit[] = planetDetailScreenRuntimeContract.slices.map((slice) => {
    const source = slice.sourceDocumentId ? sourceById.get(slice.sourceDocumentId) : null;
    const layerMapped = Boolean(source?.layerNames.includes(slice.psdLayerGroup));
    let sourceStatus: PlanetDetailSliceAudit["sourceStatus"];
    if (!slice.sourceDocumentId) sourceStatus = "Source Assignment Required";
    else if (!source?.exists) sourceStatus = "Source Missing";
    else if (!layerMapped) sourceStatus = "Layer Group Missing";
    else sourceStatus = "Mapped";
    return {
      ...slice,
      sourceFilename: source?.filename ?? null,
      sourceExists: Boolean(source?.exists),
      layerMapped,
      sourceStatus
    };
  });

  return {
    sourceRootLabel: "source-masters/ui/screens/planet-detail/",
    sources,
    slices,
    summary: {
      sourceCount: sources.length,
      sourceFilesPresent: sources.filter((source) => source.exists).length,
      sliceCount: slices.length,
      mappedSlices: slices.filter((slice) => slice.layerMapped).length,
      pendingSlices: slices.filter((slice) => !slice.layerMapped).length
    }
  };
}

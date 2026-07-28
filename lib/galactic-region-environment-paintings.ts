import derivativeData from "@/data/galactic-region-environment-painting-derivatives.json";

type DerivativeRecord = (typeof derivativeData.records)[number];

export type GalacticRegionEnvironmentPainting = {
  assetId: string;
  galacticRegionId: string;
  displayName: string;
  desktopPng: string;
  preview: string;
  thumbnail: string;
  checksum: string;
  focalPoint: { x: number; y: number };
};

function derivative(record: DerivativeRecord, id: string) {
  return record.derivatives.find((item) => item.id === id);
}

export const galacticRegionEnvironmentPaintings: GalacticRegionEnvironmentPainting[] = derivativeData.records
  .filter((record) => record.status === "published" && Boolean(record.galacticRegionId))
  .map((record) => {
    const gamePng = derivative(record, "game_png");
    const preview = derivative(record, "web_preview");
    const thumbnail = derivative(record, "library_thumbnail");
    if (!record.galacticRegionId || !gamePng || !preview || !thumbnail) {
      throw new Error(`${record.displayName} has an incomplete Galactic Region derivative set.`);
    }
    return {
      assetId: `galactic-region-environment-painting-${record.id}`,
      galacticRegionId: record.galacticRegionId,
      displayName: record.displayName,
      desktopPng: gamePng.path,
      preview: preview.path,
      thumbnail: thumbnail.path,
      checksum: gamePng.checksum,
      focalPoint: { x: 0.5, y: 0.5 }
    };
  });

export function resolveGalacticRegionEnvironmentPainting(galacticRegionId: string) {
  return galacticRegionEnvironmentPaintings.find((painting) => painting.galacticRegionId === galacticRegionId) ?? null;
}

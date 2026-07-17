import { existsSync } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { CANONICAL_LIBRARY_ARTWORK_CATALOG } from "@/lib/artwork/canonical-record-artwork";

const outputDir = path.join(process.cwd(), "public", "assets", "library-thumbnails");

function publicPath(url: string) {
  return path.join(process.cwd(), "public", url.replace(/^\//, ""));
}

async function generateDerivative(sourceUrl: string, targetUrl: string, width: 480 | 960) {
  const source = publicPath(sourceUrl);
  const target = publicPath(targetUrl);
  await sharp(source, { animated: false, failOn: "none" })
    .resize(width, Math.round(width * 9 / 16), {
      fit: "cover",
      position: "center",
      withoutEnlargement: false
    })
    .webp({ quality: 76, effort: 6 })
    .toFile(target);
  const stats = await stat(target);
  return stats.size;
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const uniqueEntries = [...new Map(CANONICAL_LIBRARY_ARTWORK_CATALOG.map((entry) => [entry.sourceUrl, entry])).values()];
  const generated: Array<{ sourceUrl: string; thumbnailUrl: string; retinaThumbnailUrl: string; thumbnailBytes: number; retinaBytes: number }> = [];
  const missingSources: string[] = [];

  for (const entry of uniqueEntries) {
    if (!existsSync(publicPath(entry.sourceUrl))) {
      missingSources.push(entry.sourceUrl);
      continue;
    }
    const thumbnailBytes = await generateDerivative(entry.sourceUrl, entry.thumbnailUrl, 480);
    const retinaBytes = await generateDerivative(entry.sourceUrl, entry.retinaThumbnailUrl, 960);
    generated.push({
      sourceUrl: entry.sourceUrl,
      thumbnailUrl: entry.thumbnailUrl,
      retinaThumbnailUrl: entry.retinaThumbnailUrl,
      thumbnailBytes,
      retinaBytes
    });
  }

  const averageThumbnailBytes = Math.round(generated.reduce((sum, row) => sum + row.thumbnailBytes, 0) / Math.max(1, generated.length));
  console.log(JSON.stringify({
    status: missingSources.length === 0 ? "ok" : "warning",
    derivativeProfile: {
      thumbnail: "library_thumbnail",
      thumbnailSize: "480x270",
      retina: "library_thumbnail_retina",
      retinaSize: "960x540",
      format: "WebP"
    },
    generatedCount: generated.length,
    missingSources,
    averageThumbnailBytes,
    largestThumbnailBytes: Math.max(0, ...generated.map((row) => row.thumbnailBytes)),
    outputs: generated
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

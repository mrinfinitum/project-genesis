import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { generatePsdGameDerivatives } from "@/lib/assets/psd-game-derivatives";

type JsonRecord = Record<string, any>;

const sourceRoot = path.join(process.cwd(), "source-masters", "ui", "navigation");
const publicRoot = path.join(process.cwd(), "public", "assets", "game-art");
const metadataPath = path.join(process.cwd(), "data", "navigation-icon-derivatives.json");
const importStorePath = path.join(process.cwd(), "data", "game-art-imports.local.json");
const productionStorePath = path.join(process.cwd(), "data", "asset-production.local.json");

function digest(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function title(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function readJson(filePath: string) {
  return JSON.parse(await readFile(filePath, "utf8")) as JsonRecord;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const filenames = (await readdir(sourceRoot))
    .filter((filename) =>
      /^ui-panel-side-menu-[a-z0-9-]+\.psd$/i.test(filename)
    )
    .sort();
  if (!filenames.length) {
    throw new Error(`No navigation icon PSD masters found in ${sourceRoot}.`);
  }

  const importStore = await readJson(importStorePath);
  const productionStore = await readJson(productionStorePath);
  const metadataRecords: JsonRecord[] = [];

  for (const filename of filenames) {
    const slug = filename
      .replace(/^ui-panel-side-menu-/i, "")
      .replace(/\.psd$/i, "");
    const assetId = `asset_${slug.replace(/-/g, "_")}_icon`;
    const artKey = `${slug.replace(/-/g, "_")}_icon`;
    const displayName = `${title(slug)} Icon`;
    const sourcePath = path.join(sourceRoot, filename);
    const sourceBuffer = await readFile(sourcePath);
    const sourceStat = await stat(sourcePath);
    const generated = await generatePsdGameDerivatives(sourceBuffer, {
      basename: assetId,
      gameOutput: { width: 512, height: 512, fit: "inside" },
      previewOutput: { width: 512, height: 512, fit: "inside" },
      thumbnailOutput: { width: 256, height: 256, fit: "contain" },
      alphaPolicy: "preserve",
      requireTransparentPixels: true
    });
    const outputDir = path.join(publicRoot, assetId);
    await mkdir(outputDir, { recursive: true });

    const generatedAt = sourceStat.mtime.toISOString();
    const sourceChecksum = generated.source.checksum;
    const sourceId = `source_${assetId}_psd_${sourceChecksum.slice(0, 12)}`;
    const publicBase = `/assets/game-art/${assetId}`;
    const derivatives = generated.derivatives.map((item) => {
      const filenameForRole = item.id === "game_png"
        ? `${assetId}.png`
        : item.id === "web_preview"
          ? `${assetId}-preview.webp`
          : `${assetId}-thumbnail.webp`;
      return {
        ...item,
        filename: filenameForRole,
        publicPath: `${publicBase}/${filenameForRole}`
      };
    });

    for (const item of derivatives) {
      await writeFile(path.join(outputDir, item.filename), item.buffer);
    }

    const gamePng = derivatives.find((item) => item.id === "game_png")!;
    const preview = derivatives.find((item) => item.id === "web_preview")!;
    const thumbnail = derivatives.find(
      (item) => item.id === "library_thumbnail"
    )!;
    const imported = (importStore.assets as JsonRecord[]).find(
      (asset) => asset.id === assetId
    );
    const importRecord = imported ?? {
      id: assetId,
      name: displayName,
      type: "image",
      category: "navigation_icon",
      artKey,
      usageReferences: [
        {
          type: "UI",
          id: `navigation.${slug}`,
          name: `navigation.${slug}`
        }
      ],
      aliases: [artKey, displayName],
      tags: ["navigation_icon", "studio_source_master"],
      importedFrom: "NOVERIS Studio source master",
      importedAt: generatedAt
    };
    Object.assign(importRecord, {
      name: displayName,
      mimeType: "image/png",
      width: gamePng.width,
      height: gamePng.height,
      aspectRatio: `${gamePng.width}:${gamePng.height}`,
      fileSizeBytes: gamePng.bytes,
      status: "mapped",
      notes: "Canonical transparent navigation icon generated from the current Studio PSD master.",
      previewUrl: gamePng.publicPath,
      storagePath: gamePng.publicPath,
      platformMappings: {
        ...(importRecord.platformMappings ?? {}),
        web: {
          path: gamePng.publicPath,
          status: "published",
          publishedAt: generatedAt
        }
      },
      updatedAt: generatedAt
    });
    if (!imported) {
      (importStore.assets as JsonRecord[]).push(importRecord);
    }

    const override = productionStore.assets[assetId] ?? {};
    const sourceFiles = (override.sourceFiles ?? []).map((source: JsonRecord) => ({
      ...source,
      isCurrent: source.id === sourceId,
      archived: false
    }));
    if (!sourceFiles.some((source: JsonRecord) => source.id === sourceId)) {
      sourceFiles.push({
        id: sourceId,
        assetId,
        filename,
        extension: ".psd",
        mimeType: "image/vnd.adobe.photoshop",
        storagePath: `source-masters/ui/navigation/${filename}`,
        fileSizeBytes: sourceBuffer.byteLength,
        checksum: sourceChecksum,
        version: Math.max(0, ...sourceFiles.map((source: JsonRecord) =>
          Number(source.version) || 0
        )) + 1,
        versionLabel: `v${Math.max(0, ...sourceFiles.map(
          (source: JsonRecord) => Number(source.version) || 0
        )) + 1}`,
        uploadedAt: generatedAt,
        uploadedBy: "studio-source-master",
        isCurrent: true,
        archived: false,
        previewUrl: preview.publicPath,
        previewStatus: "ready",
        width: generated.source.width,
        height: generated.source.height,
        sourceRole: "master",
        masterFormat: "PSD",
        notes: "Private canonical PSD master. Public clients receive generated derivatives only."
      });
    }

    const nonWebDerivatives = (override.derivatives ?? []).filter(
      (item: JsonRecord) =>
        item.platformMappings?.web == null &&
        !["web_preview", "library_thumbnail"].includes(item.derivativeType)
    );
    const publishedDerivatives = [
      {
        id: `derivative_${assetId}_web_${gamePng.checksum.slice(0, 12)}`,
        assetId,
        sourceFileId: sourceId,
        presetId: "icon_512",
        derivativeType: "icon",
        format: "PNG",
        width: gamePng.width,
        height: gamePng.height,
        aspectRatio: "1:1",
        quality: 100,
        storagePath: `public${gamePng.publicPath}`,
        publicUrl: gamePng.publicPath,
        checksum: gamePng.checksum,
        generatedAt,
        generationMethod: "psd_game_derivative",
        status: "approved",
        approvalStatus: "approved",
        publishStatus: "published",
        platformMappings: { web: { path: gamePng.publicPath } },
        archived: false,
        alphaRequired: true,
        derivativeStatus: "published"
      },
      {
        id: `derivative_${assetId}_preview_${preview.checksum.slice(0, 12)}`,
        assetId,
        sourceFileId: sourceId,
        derivativeType: "web_preview",
        format: "WebP",
        width: preview.width,
        height: preview.height,
        aspectRatio: "1:1",
        quality: 84,
        storagePath: `public${preview.publicPath}`,
        publicUrl: preview.publicPath,
        checksum: preview.checksum,
        generatedAt,
        generationMethod: "psd_game_derivative",
        status: "approved",
        approvalStatus: "approved",
        publishStatus: "published",
        archived: false,
        alphaRequired: true,
        derivativeStatus: "published"
      },
      {
        id: `derivative_${assetId}_thumbnail_${thumbnail.checksum.slice(0, 12)}`,
        assetId,
        sourceFileId: sourceId,
        presetId: "icon_256",
        derivativeType: "library_thumbnail",
        format: "WebP",
        width: thumbnail.width,
        height: thumbnail.height,
        aspectRatio: "1:1",
        quality: 80,
        storagePath: `public${thumbnail.publicPath}`,
        publicUrl: thumbnail.publicPath,
        checksum: thumbnail.checksum,
        generatedAt,
        generationMethod: "psd_game_derivative",
        status: "approved",
        approvalStatus: "approved",
        publishStatus: "published",
        archived: false,
        alphaRequired: true,
        derivativeStatus: "published"
      }
    ];

    productionStore.assets[assetId] = {
      ...override,
      sourceFiles,
      derivatives: [...nonWebDerivatives, ...publishedDerivatives],
      platformMappings: {
        ...(override.platformMappings ?? {}),
        web: {
          path: gamePng.publicPath,
          status: "published",
          publishedAt: generatedAt
        }
      },
      productionStatus: "published",
      status: "web_published",
      approvalStatus: "approved",
      publishedAt: generatedAt,
      notes: "Canonical navigation icon published from the current private Studio PSD master.",
      historyEvents: [
        {
          id: `history_${assetId}_psd_${sourceChecksum.slice(0, 12)}`,
          assetId,
          eventType: "psd_master_published",
          title: "Published navigation icon from PSD master",
          timestamp: generatedAt,
          notes: gamePng.publicPath
        },
        ...(override.historyEvents ?? []).filter(
          (event: JsonRecord) =>
            event.id !== `history_${assetId}_psd_${sourceChecksum.slice(0, 12)}`
        )
      ]
    };

    metadataRecords.push({
      assetId,
      artKey,
      displayName,
      status: "published",
      source: {
        width: generated.source.width,
        height: generated.source.height,
        checksum: sourceChecksum
      },
      derivatives: derivatives.map((item) => ({
        id: item.id,
        path: item.publicPath,
        format: item.format,
        mimeType: item.mimeType,
        width: item.width,
        height: item.height,
        bytes: item.bytes,
        checksum: item.checksum,
        alpha: item.alpha
      }))
    });
    console.log(`${assetId}: ${generated.source.width}x${generated.source.height} -> ${gamePng.width}x${gamePng.height}`);
  }

  (importStore.assets as JsonRecord[]).sort((left, right) =>
    String(left.id).localeCompare(String(right.id))
  );
  await writeJson(importStorePath, importStore);
  await writeJson(productionStorePath, productionStore);
  await writeJson(metadataPath, {
    schemaVersion: "navigation-icon-derivatives-v1",
    generatedFrom: "canonical-art-pipeline",
    records: metadataRecords
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalDiscoveries, curiosityCategories, curiositySlug, type CuriosityArtworkMetadata } from "@/lib/discovery";

type FileTree = {
  root: string;
  files: string[];
};

type MetadataJson = {
  curiosityId?: string;
  slug?: string;
  prompt?: string;
  negativePrompt?: string;
  aiModel?: string;
  generationNotes?: string;
  artworkVersion?: number;
};

type SyncReport = {
  matched: number;
  unmatchedFolders: string[];
  missingCuriosityRecords: string[];
  missingSourcePsd: string[];
  missingPreviewDerivatives: string[];
  duplicateMatches: string[];
  invalidClassificationPaths: string[];
};

const supportedPreviewExtensions = new Set([".png", ".webp", ".jpg", ".jpeg"]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function walk(root: string): Promise<FileTree[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  const childTrees: FileTree[] = [];

  for (const entry of entries) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      childTrees.push(...await walk(absolute));
    } else if (entry.isFile()) {
      files.push(absolute);
    }
  }

  return [{ root, files: [...files, ...childTrees.flatMap((tree) => tree.files)] }, ...childTrees];
}

function isCuriosityFolder(tree: FileTree) {
  if (["source", "exports", "references"].includes(path.basename(tree.root).toLowerCase())) return false;
  return tree.files.some((file) => path.basename(file).toLowerCase() === "metadata.json")
    || tree.files.some((file) => path.dirname(file).endsWith(`${path.sep}source`) && path.extname(file).toLowerCase() === ".psd")
    || tree.files.some((file) => path.dirname(file).endsWith(`${path.sep}exports`) && supportedPreviewExtensions.has(path.extname(file).toLowerCase()));
}

async function readMetadata(tree: FileTree): Promise<MetadataJson> {
  const metadataFile = tree.files.find((file) => path.basename(file).toLowerCase() === "metadata.json");
  if (!metadataFile) return {};
  try {
    const parsed = JSON.parse(await readFile(metadataFile, "utf8")) as unknown;
    return parsed && typeof parsed === "object" ? parsed as MetadataJson : {};
  } catch {
    return {};
  }
}

function findPreview(tree: FileTree, slug: string, kind: "thumb" | "webp" | "png") {
  const exportFiles = tree.files.filter((file) => path.dirname(file).endsWith(`${path.sep}exports`));
  if (kind === "thumb") {
    return exportFiles.find((file) => /thumb/i.test(path.basename(file)) && supportedPreviewExtensions.has(path.extname(file).toLowerCase())) ?? null;
  }
  if (kind === "webp") {
    return exportFiles.find((file) => path.extname(file).toLowerCase() === ".webp" && !/thumb/i.test(path.basename(file))) ?? null;
  }
  return exportFiles.find((file) => [".png", ".jpg", ".jpeg"].includes(path.extname(file).toLowerCase()) && !/thumb/i.test(path.basename(file)) && slugify(path.basename(file, path.extname(file))) === slug)
    ?? exportFiles.find((file) => [".png", ".jpg", ".jpeg"].includes(path.extname(file).toLowerCase()) && !/thumb/i.test(path.basename(file)))
    ?? null;
}

async function copyPreview(sourceFile: string | null, curiosityId: string, label: string) {
  if (!sourceFile) return null;
  const extension = path.extname(sourceFile).toLowerCase() || ".png";
  const publicDir = path.join(process.cwd(), "public", "assets", "game-art", "curiosities", curiosityId);
  await mkdir(publicDir, { recursive: true });
  const filename = `${label}${extension === ".jpeg" ? ".jpg" : extension}`;
  await copyFile(sourceFile, path.join(publicDir, filename));
  return `/assets/game-art/curiosities/${curiosityId}/${filename}`;
}

function validClassification(parts: string[]) {
  const [categoryId, classId, subclassId] = parts;
  const category = curiosityCategories.find((item) => item.id === categoryId);
  const classRecord = category?.classes.find((item) => item.id === classId);
  const subclassRecord = classRecord?.subclasses.find((item) => item.id === subclassId);
  return Boolean(category && classRecord && subclassRecord);
}

async function main() {
  const sourceRootArg = process.argv[2];
  if (!sourceRootArg) {
    throw new Error("Usage: npm run sync:curiosity-artwork -- ../curiosity-artwork");
  }

  const sourceRoot = path.resolve(process.cwd(), sourceRootArg);
  const sourceStats = await stat(sourceRoot).catch(() => null);
  if (!sourceStats?.isDirectory()) {
    throw new Error(`Curiosity artwork source folder not found: ${sourceRoot}`);
  }

  const slugToDiscovery = new Map(canonicalDiscoveries.flatMap((record) => [[curiositySlug(record), record], [record.id.toLowerCase(), record]]));
  const trees = (await walk(sourceRoot)).filter((tree) => {
    const depth = path.relative(sourceRoot, tree.root).split(path.sep).filter(Boolean).length;
    return depth >= 4 && isCuriosityFolder(tree);
  });
  const records: CuriosityArtworkMetadata[] = [];
  const matchedIds = new Set<string>();
  const report: SyncReport = {
    matched: 0,
    unmatchedFolders: [],
    missingCuriosityRecords: [],
    missingSourcePsd: [],
    missingPreviewDerivatives: [],
    duplicateMatches: [],
    invalidClassificationPaths: []
  };

  for (const tree of trees) {
    const relativeFolder = path.relative(sourceRoot, tree.root);
    const parts = relativeFolder.split(path.sep).map(slugify).filter(Boolean);
    const metadata = await readMetadata(tree);
    const folderSlug = parts.at(-1) ?? "";
    const matchKey = metadata.curiosityId?.toLowerCase() ?? metadata.slug ?? folderSlug;
    const discovery = slugToDiscovery.get(slugify(matchKey)) ?? null;

    if (!discovery) {
      report.unmatchedFolders.push(relativeFolder || ".");
      report.missingCuriosityRecords.push(matchKey || relativeFolder || ".");
      continue;
    }

    if (matchedIds.has(discovery.id)) {
      report.duplicateMatches.push(discovery.id);
      continue;
    }
    matchedIds.add(discovery.id);

    if (parts.length >= 4 && !validClassification(parts.slice(0, 3))) {
      report.invalidClassificationPaths.push(relativeFolder);
    }

    const slug = curiositySlug(discovery);
    const sourcePsd = tree.files.find((file) => path.dirname(file).endsWith(`${path.sep}source`) && path.extname(file).toLowerCase() === ".psd") ?? null;
    const thumbnail = findPreview(tree, slug, "thumb");
    const webp = findPreview(tree, slug, "webp");
    const png = findPreview(tree, slug, "png");

    if (!sourcePsd) report.missingSourcePsd.push(discovery.id);
    if (!thumbnail && !webp && !png) report.missingPreviewDerivatives.push(discovery.id);

    const thumbnailPath = await copyPreview(thumbnail, discovery.id, "thumbnail");
    const webpPath = await copyPreview(webp, discovery.id, "preview");
    const pngPath = await copyPreview(png, discovery.id, "preview");
    const references = tree.files
      .filter((file) => path.dirname(file).endsWith(`${path.sep}references`))
      .map((file) => path.basename(file))
      .sort();
    const metadataFile = tree.files.find((file) => path.basename(file).toLowerCase() === "metadata.json") ?? null;
    const hasPreview = Boolean(thumbnailPath || webpPath || pngPath);

    records.push({
      curiosityId: discovery.id,
      slug,
      categoryId: discovery.categoryId,
      classId: discovery.classId,
      subclassId: discovery.subclassId,
      relativeArtworkFolder: relativeFolder,
      sourcePsdFilename: sourcePsd ? path.basename(sourcePsd) : null,
      pngPath,
      webpPath,
      thumbnailPath,
      referenceFilenames: references,
      metadataPath: metadataFile ? path.join(relativeFolder, path.basename(metadataFile)) : null,
      prompt: metadata.prompt ?? null,
      negativePrompt: metadata.negativePrompt ?? null,
      aiModel: metadata.aiModel ?? null,
      generationNotes: metadata.generationNotes ?? null,
      artworkVersion: metadata.artworkVersion ?? 1,
      lastSyncedAt: new Date().toISOString(),
      status: sourcePsd && hasPreview ? "artwork_ready" : sourcePsd ? "source_only" : hasPreview ? "preview_ready" : "missing"
    });
  }

  report.matched = records.length;
  const manifest = {
    schemaVersion: "curiosity-artwork-manifest-v1",
    generatedAt: new Date().toISOString(),
    sourceRoot: path.basename(sourceRoot),
    records: records.sort((left, right) => left.curiosityId.localeCompare(right.curiosityId)),
    reports: report
  };

  await writeFile(path.join(process.cwd(), "data", "curiosity-artwork-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    ok: true,
    matched: report.matched,
    unmatchedFolders: report.unmatchedFolders.length,
    missingSourcePsd: report.missingSourcePsd.length,
    missingPreviewDerivatives: report.missingPreviewDerivatives.length,
    duplicateMatches: report.duplicateMatches.length,
    invalidClassificationPaths: report.invalidClassificationPaths.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

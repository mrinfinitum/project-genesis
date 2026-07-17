import crypto from "node:crypto";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Sharp } from "sharp";

export const INSPIRATION_WALL_ROUTE = "/experience-design/inspiration-wall";
export const INSPIRATION_WALL_IMAGE_ROOT = "public/images";
export const INSPIRATION_WALL_PUBLIC_PREFIX = "/images/";
export const INSPIRATION_WALL_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const supportedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const ignoredFilePatterns = [/^~/, /\.tmp$/i, /\.temp$/i, /\.ds_store$/i];

export type InspirationWallOrientation = "landscape" | "portrait" | "square" | "panoramic";

export type InspirationWallImage = {
  id: string;
  filename: string;
  relativePath: string;
  publicUrl: string;
  extension: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: InspirationWallOrientation;
  fileSize: number;
  modifiedAt: string;
  title: string;
  folder: string;
  palette: string[];
  warmth: "warm" | "cool" | "neutral";
  luminance: "dark" | "balanced" | "bright";
  loadingStatus: "ready";
  errorStatus: null;
};

export type InspirationWallManifest = {
  generatedAt: string;
  source: "public/images";
  route: typeof INSPIRATION_WALL_ROUTE;
  publicPrefix: typeof INSPIRATION_WALL_PUBLIC_PREFIX;
  supportedExtensions: string[];
  upload: {
    localDevelopmentOnly: true;
    maxBytes: number;
    persistence: "local-public-images";
    productionLimitation: string;
  };
  images: InspirationWallImage[];
};

export function supportedInspirationWallExtensions() {
  return [...supportedExtensions].sort();
}

export function isSupportedInspirationImageExtension(extension: string) {
  return supportedExtensions.has(extension.toLowerCase());
}

export function isSupportedInspirationImageMime(type: string) {
  return supportedMimeTypes.has(type.toLowerCase());
}

export function sanitizeInspirationWallFilename(filename: string) {
  const originalName = path.basename(filename);
  const originalExtension = path.extname(originalName);
  const extension = originalExtension.toLowerCase();
  const basename = originalName.slice(0, Math.max(0, originalName.length - originalExtension.length))
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return `${basename || "inspiration-image"}${extension}`;
}

export function publicUrlForRelativeImage(relativePath: string) {
  return `${INSPIRATION_WALL_PUBLIC_PREFIX}${relativePath.split(path.sep).join("/")}`;
}

export function stableInspirationWallImageId(relativePath: string) {
  const normalized = relativePath.split(path.sep).join("/").toLowerCase();
  const digest = crypto.createHash("sha1").update(normalized).digest("hex").slice(0, 10);
  const slug = normalized.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56);
  return `inspiration-wall-${slug}-${digest}`;
}

export function inferInspirationImageTitle(filename: string) {
  return path.basename(filename, path.extname(filename))
    .replace(/^[0-9]+[-_\s]+/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Inspiration Image";
}

export function classifyOrientation(width: number, height: number): InspirationWallOrientation {
  if (!width || !height) return "landscape";
  const ratio = width / height;
  if (ratio >= 2.2) return "panoramic";
  if (ratio > 1.08) return "landscape";
  if (ratio < 0.92) return "portrait";
  return "square";
}

function isHiddenOrUnsafeSegment(segment: string) {
  return !segment || segment.startsWith(".") || segment.includes("..") || ignoredFilePatterns.some((pattern) => pattern.test(segment));
}

async function collectImagePaths(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
  const paths: string[] = [];

  for (const entry of entries) {
    if (isHiddenOrUnsafeSegment(entry.name)) continue;
    const absolutePath = path.join(current, entry.name);
    if (!absolutePath.startsWith(root)) continue;

    if (entry.isDirectory()) {
      paths.push(...await collectImagePaths(root, absolutePath));
      continue;
    }

    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (!isSupportedInspirationImageExtension(extension)) continue;
    paths.push(absolutePath);
  }

  return paths.sort((left, right) => left.localeCompare(right));
}

async function readImageMetadata(absolutePath: string) {
  const sharp = (await import("sharp")).default;
  const image = sharp(absolutePath, { animated: false, failOn: "none" });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) return null;
  const palette = await extractPalette(image);
  return { width: metadata.width, height: metadata.height, palette };
}

async function extractPalette(image: Sharp) {
  const { data, info } = await image.clone().resize(32, 32, { fit: "inside", withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (let index = 0; index < data.length; index += info.channels) {
    const r = data[index] ?? 0;
    const g = data[index + 1] ?? 0;
    const b = data[index + 2] ?? 0;
    const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
    const current = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    current.count += 1;
    current.r += r;
    current.g += g;
    current.b += b;
    buckets.set(key, current);
  }

  return [...buckets.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 6)
    .map((bucket) => {
      const r = Math.round(bucket.r / bucket.count);
      const g = Math.round(bucket.g / bucket.count);
      const b = Math.round(bucket.b / bucket.count);
      return rgbToHex(r, g, b);
    });
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function classifyPaletteWarmth(palette: string[]) {
  if (!palette.length) return "neutral" as const;
  let warm = 0;
  let cool = 0;
  for (const color of palette) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    if (r + g * 0.55 > b * 1.35) warm += 1;
    if (b + g * 0.45 > r * 1.25) cool += 1;
  }
  if (warm > cool) return "warm" as const;
  if (cool > warm) return "cool" as const;
  return "neutral" as const;
}

function classifyPaletteLuminance(palette: string[]) {
  if (!palette.length) return "balanced" as const;
  const average = palette.reduce((sum, color) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return sum + (0.2126 * r + 0.7152 * g + 0.0722 * b);
  }, 0) / palette.length;
  if (average < 84) return "dark" as const;
  if (average > 172) return "bright" as const;
  return "balanced" as const;
}

export async function getInspirationWallManifest(): Promise<InspirationWallManifest> {
  const root = path.join(process.cwd(), "public", "images");
  const absolutePaths = await collectImagePaths(root);
  const images: InspirationWallImage[] = [];
  const seen = new Set<string>();

  for (const absolutePath of absolutePaths) {
    const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
    if (!relativePath || relativePath.startsWith("..") || seen.has(relativePath)) continue;
    seen.add(relativePath);

    const fileStat = await stat(absolutePath).catch(() => null);
    if (!fileStat?.isFile()) continue;

    const metadata = await readImageMetadata(absolutePath).catch(() => null);
    if (!metadata) continue;

    const filename = path.basename(relativePath);
    const folder = path.dirname(relativePath) === "." ? "Root" : path.dirname(relativePath).split(path.sep).join("/");
    const aspectRatio = Number((metadata.width / metadata.height).toFixed(4));
    const palette = metadata.palette;

    images.push({
      id: stableInspirationWallImageId(relativePath),
      filename,
      relativePath,
      publicUrl: publicUrlForRelativeImage(relativePath),
      extension: path.extname(filename).toLowerCase().replace(".", ""),
      width: metadata.width,
      height: metadata.height,
      aspectRatio,
      orientation: classifyOrientation(metadata.width, metadata.height),
      fileSize: fileStat.size,
      modifiedAt: fileStat.mtime.toISOString(),
      title: inferInspirationImageTitle(filename),
      folder,
      palette,
      warmth: classifyPaletteWarmth(palette),
      luminance: classifyPaletteLuminance(palette),
      loadingStatus: "ready",
      errorStatus: null
    });
  }

  images.sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  return {
    generatedAt: new Date().toISOString(),
    source: "public/images",
    route: INSPIRATION_WALL_ROUTE,
    publicPrefix: INSPIRATION_WALL_PUBLIC_PREFIX,
    supportedExtensions: supportedInspirationWallExtensions(),
    upload: {
      localDevelopmentOnly: true,
      maxBytes: INSPIRATION_WALL_MAX_UPLOAD_BYTES,
      persistence: "local-public-images",
      productionLimitation: "Vercel and other immutable production deployments cannot persist writes to public/images; use local development upload mode or future durable storage."
    },
    images
  };
}

export async function writeInspirationWallUpload(file: File) {
  if (!isSupportedInspirationImageMime(file.type)) {
    throw new Error("Unsupported image MIME type.");
  }
  const safeName = sanitizeInspirationWallFilename(file.name);
  const extension = path.extname(safeName).toLowerCase();
  if (!isSupportedInspirationImageExtension(extension)) {
    throw new Error("Unsupported image extension.");
  }
  if (file.size > INSPIRATION_WALL_MAX_UPLOAD_BYTES) {
    throw new Error("Image exceeds the 20MB Inspiration Wall upload limit.");
  }

  const root = path.join(process.cwd(), "public", "images");
  const datedFolder = new Date().toISOString().slice(0, 10);
  const base = path.basename(safeName, extension);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const relativePath = `${datedFolder}/${base}-${stamp}${extension}`;
  const destination = path.join(root, relativePath);
  if (!destination.startsWith(root)) {
    throw new Error("Unsafe upload path rejected.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, buffer, { flag: "wx" });
  return {
    relativePath: relativePath.split(path.sep).join("/"),
    publicUrl: publicUrlForRelativeImage(relativePath)
  };
}

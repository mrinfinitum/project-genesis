import crypto from "node:crypto";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const INSPIRATION_WALL_ROUTE = "/inspiration-board";
export const INSPIRATION_WALL_IMAGE_ROOT = "public/images";
export const INSPIRATION_WALL_PUBLIC_PREFIX = "/images/";
export const INSPIRATION_WALL_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const supportedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

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
  const basename = originalName.slice(0, -originalExtension.length || undefined)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return `${basename || "inspiration-image"}${extension}`;
}

function publicUrlForRelativeImage(relativePath: string) {
  return `${INSPIRATION_WALL_PUBLIC_PREFIX}${relativePath.split(path.sep).join("/")}`;
}

function imageId(relativePath: string) {
  const normalized = relativePath.toLowerCase();
  return `inspiration-${crypto.createHash("sha1").update(normalized).digest("hex").slice(0, 12)}`;
}

function imageTitle(filename: string) {
  return path.basename(filename, path.extname(filename))
    .replace(/^[0-9]+[-_\s]+/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Inspiration Image";
}

function orientation(width: number, height: number): InspirationWallOrientation {
  const ratio = width / height;
  if (ratio >= 2.2) return "panoramic";
  if (ratio > 1.08) return "landscape";
  if (ratio < 0.92) return "portrait";
  return "square";
}

async function collectImages(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
  const results: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.includes("..")) continue;
    const absolutePath = path.join(current, entry.name);
    if (!absolutePath.startsWith(root)) continue;
    if (entry.isDirectory()) results.push(...await collectImages(root, absolutePath));
    if (entry.isFile() && isSupportedInspirationImageExtension(path.extname(entry.name))) results.push(absolutePath);
  }
  return results.sort((left, right) => left.localeCompare(right));
}

export async function getInspirationWallManifest(): Promise<InspirationWallManifest> {
  const root = path.join(process.cwd(), "public", "images");
  const sharp = (await import("sharp")).default;
  const images: InspirationWallImage[] = [];

  for (const absolutePath of await collectImages(root)) {
    const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
    const [fileStat, metadata] = await Promise.all([
      stat(absolutePath).catch(() => null),
      sharp(absolutePath, { animated: false, failOn: "none" }).metadata().catch(() => null)
    ]);
    if (!fileStat?.isFile() || !metadata?.width || !metadata.height) continue;
    const filename = path.basename(relativePath);
    const folderPath = path.dirname(relativePath);
    images.push({
      id: imageId(relativePath),
      filename,
      relativePath,
      publicUrl: publicUrlForRelativeImage(relativePath),
      extension: path.extname(filename).slice(1).toLowerCase(),
      width: metadata.width,
      height: metadata.height,
      aspectRatio: Number((metadata.width / metadata.height).toFixed(4)),
      orientation: orientation(metadata.width, metadata.height),
      fileSize: fileStat.size,
      modifiedAt: fileStat.mtime.toISOString(),
      title: imageTitle(filename),
      folder: folderPath === "." ? "Root" : folderPath
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    source: "public/images",
    route: INSPIRATION_WALL_ROUTE,
    publicPrefix: INSPIRATION_WALL_PUBLIC_PREFIX,
    supportedExtensions: [...supportedExtensions].sort(),
    upload: {
      localDevelopmentOnly: true,
      maxBytes: INSPIRATION_WALL_MAX_UPLOAD_BYTES,
      persistence: "local-public-images",
      productionLimitation: "Immutable production deployments cannot persist uploads to public/images."
    },
    images
  };
}

export async function writeInspirationWallUpload(file: File) {
  if (!isSupportedInspirationImageMime(file.type)) throw new Error("Unsupported image MIME type.");
  const safeName = sanitizeInspirationWallFilename(file.name);
  const extension = path.extname(safeName).toLowerCase();
  if (!isSupportedInspirationImageExtension(extension)) throw new Error("Unsupported image extension.");
  if (file.size > INSPIRATION_WALL_MAX_UPLOAD_BYTES) throw new Error("Image exceeds the 20MB upload limit.");

  const root = path.join(process.cwd(), "public", "images");
  const datedFolder = new Date().toISOString().slice(0, 10);
  const base = path.basename(safeName, extension);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const relativePath = `${datedFolder}/${base}-${stamp}${extension}`;
  const destination = path.join(root, relativePath);
  if (!destination.startsWith(root)) throw new Error("Unsafe upload path rejected.");
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return { relativePath, publicUrl: publicUrlForRelativeImage(relativePath) };
}

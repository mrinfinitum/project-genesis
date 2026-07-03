import { mkdir, writeFile } from "fs/promises";
import nodePath from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getRows, upsertRow } from "@/lib/data";
import { renderProceduralPlanetPng } from "@/lib/planets/procedural-renderer";
import { hasLockedPlanetRender } from "@/lib/planets/render-lock";
import { createSupabaseAdminClient, getAssetBucketName, hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { GeneratedPlanet } from "@/types/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

type Params = {
  params: Promise<{ id: string }>;
};

type PlanetVariant = {
  size: number;
  width: number;
  height: number;
  url: string;
  path: string;
  filename: string;
};

function variantSizes() {
  const configuredSizes = String(process.env.PROCEDURAL_PLANET_VARIANT_SIZES ?? "")
    .split(",")
    .map((size) => Number(size.trim()))
    .filter((size) => Number.isFinite(size) && size >= 128 && size <= 4096);

  if (configuredSizes.length) {
    return [...new Set(configuredSizes.map((size) => Math.round(size)))].sort((left, right) => left - right);
  }

  return process.env.VERCEL ? [256, 512, 1024] : [256, 512, 1024, 2048, 4096];
}

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "planet";
}

function sourceSize() {
  const fallbackSize = process.env.VERCEL ? 1024 : 4096;
  const configuredSize = Number(process.env.PROCEDURAL_PLANET_SOURCE_SIZE ?? fallbackSize);
  return Number.isFinite(configuredSize) ? Math.max(256, Math.min(4096, Math.round(configuredSize))) : fallbackSize;
}

function storagePathFor(planetId: string, renderId: string, size: number) {
  return `generated-planets/${planetId}/procedural/${renderId}/${size}x${size}.png`;
}

async function variantPng(source: Buffer, size: number) {
  return sharp(source)
    .resize({
      width: size,
      height: size,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: "lanczos3"
    })
    .png()
    .toBuffer();
}

async function writeVariant(planet: GeneratedPlanet, renderId: string, png: Buffer, size: number): Promise<PlanetVariant> {
  const bucket = getAssetBucketName();
  const storagePath = storagePathFor(planet.id, renderId, size);
  const filename = `${safeFilename(planet.name)}-procedural-${size}x${size}.png`;

  if (!hasSupabaseServerConfig()) {
    const localRoot = nodePath.join(process.cwd(), "public", "uploads", bucket);
    const localPath = nodePath.join(localRoot, storagePath);
    await mkdir(nodePath.dirname(localPath), { recursive: true });
    await writeFile(localPath, png);
    return { size, width: size, height: size, url: `/uploads/${bucket}/${storagePath}`, path: storagePath, filename };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, png, {
    contentType: "image/png",
    upsert: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return { size, width: size, height: size, url: supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl, path: storagePath, filename };
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Planet ID is required." }, { status: 400 });
  }

  try {
    const rows = (await getRows("generated_planets")) as unknown as GeneratedPlanet[];
    const planet = rows.find((row) => row.id === id);

    if (!planet) {
      return NextResponse.json({ error: "Planet not found." }, { status: 404 });
    }

    if (hasLockedPlanetRender(planet)) {
      return NextResponse.json({ row: planet, variants: planet.image_variants ?? [], preserved: true });
    }

    const sourcePng = await renderProceduralPlanetPng(planet, sourceSize());
    const renderId = `v2-${Date.now().toString(36)}`;
    const variants: PlanetVariant[] = [];
    const sizes = variantSizes();

    for (const size of sizes) {
      variants.push(await writeVariant(planet, renderId, await variantPng(sourcePng, size), size));
    }

    const fullSize = variants[variants.length - 1];
    const row = await upsertRow("generated_planets", {
      ...planet,
      image_url: fullSize.url,
      image_prompt: `Procedural renderer seed: ${planet.seed}. Generated from planet rules, biome, atmosphere, resources, hazards, traits, weather, ruins, moons, and visual theme.`,
      image_status: "Procedural Rendered",
      image_variants: variants,
      notes: `${planet.notes ? `${planet.notes}\n` : ""}Rendered procedural transparent planet image variants ${renderId}: ${sizes.map((size) => `${size}x${size}`).join(", ")}.`
    });

    return NextResponse.json({ row, variants });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not render procedural planet image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

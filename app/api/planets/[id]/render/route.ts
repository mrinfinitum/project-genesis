import { mkdir, writeFile } from "fs/promises";
import nodePath from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getRows, upsertRow } from "@/lib/data";
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

const variantSizes = [256, 512, 1024, 2048, 4096];

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "planet";
}

function asList(value: unknown) {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
}

function statText(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  return Object.entries(value)
    .map(([key, stat]) => `${key}: ${String(stat)}`)
    .join(", ");
}

function promptForPlanet(planet: GeneratedPlanet) {
  const resources = asList(planet.resources).join(", ");
  const hazards = asList(planet.hazards).join(", ");
  const traits = asList(planet.traits).join(", ");
  const weather = asList(planet.weather).join(", ");
  const visualTheme = statText(planet.visual_theme);

  return [
    "Create a premium sci-fi game asset: one isolated spherical planet, centered, transparent background.",
    "Uniform Project Genesis card art style: cinematic but readable, high-detail surface, clean silhouette, no text, no logo, no UI, no stars, no space background, no frame, no drop shadow.",
    "Keep the full planet visible with a small transparent margin. Orthographic three-quarter lighting, crisp rim light, Roblox-friendly stylized realism.",
    `Planet name: ${planet.name}.`,
    `Planet class: ${planet.planet_class}. Primary biome: ${planet.primary_biome}. Climate: ${planet.climate}. Atmosphere: ${planet.atmosphere}. Temperature: ${planet.temperature}. Gravity: ${planet.gravity}. Water coverage: ${planet.water_coverage}.`,
    resources ? `Surface/resource cues: ${resources}.` : "",
    hazards ? `Hazard cues: ${hazards}.` : "",
    traits ? `Planet traits: ${traits}.` : "",
    weather ? `Weather cues: ${weather}.` : "",
    visualTheme ? `Visual theme: ${visualTheme}.` : "",
    planet.story ? `Narrative mood: ${planet.story}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

async function readOpenAiImage(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Add it in Vercel and .env.local to render planet art.");
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "high",
      background: "transparent",
      output_format: "png"
    })
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: Array<{ b64_json?: string; url?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenAI image generation failed (${response.status}).`);
  }

  const image = payload.data?.[0];

  if (image?.b64_json) {
    return Buffer.from(image.b64_json, "base64");
  }

  if (image?.url) {
    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) {
      throw new Error(`Could not download generated image (${imageResponse.status}).`);
    }
    return Buffer.from(await imageResponse.arrayBuffer());
  }

  throw new Error("OpenAI did not return image data.");
}

async function trimTransparentPng(png: Buffer) {
  const decoded = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = decoded.info;
  const data = decoded.data;
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 4) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < left || bottom < top) {
    return { data, width, height };
  }

  const nextWidth = right - left + 1;
  const nextHeight = bottom - top + 1;
  const nextData = Buffer.alloc(nextWidth * nextHeight * 4);

  for (let y = 0; y < nextHeight; y += 1) {
    const sourceStart = ((top + y) * width + left) * 4;
    const sourceEnd = sourceStart + nextWidth * 4;
    data.copy(nextData, y * nextWidth * 4, sourceStart, sourceEnd);
  }

  return { data: nextData, width: nextWidth, height: nextHeight };
}

async function variantPng(input: Awaited<ReturnType<typeof trimTransparentPng>>, size: number) {
  const innerSize = Math.round(size * 0.9);
  const planet = await sharp(input.data, {
    raw: {
      width: input.width,
      height: input.height,
      channels: 4
    }
  })
    .resize({
      width: innerSize,
      height: innerSize,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: "lanczos3"
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: planet, gravity: "center" }])
    .png()
    .toBuffer();
}

function storagePathFor(planetId: string, size: number) {
  return `generated-planets/${planetId}/renders/${size}x${size}.png`;
}

function publicUrlForPath(storagePath: string) {
  const bucket = getAssetBucketName();

  if (!hasSupabaseServerConfig()) {
    return `/uploads/${bucket}/${storagePath}`;
  }

  return createSupabaseAdminClient().storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

async function writeVariant(planet: GeneratedPlanet, png: Buffer, size: number): Promise<PlanetVariant> {
  const bucket = getAssetBucketName();
  const storagePath = storagePathFor(planet.id, size);
  const filename = `${safeFilename(planet.name)}-${size}x${size}.png`;

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

    const prompt = promptForPlanet(planet);
    const sourcePng = await readOpenAiImage(prompt);
    const trimmed = await trimTransparentPng(sourcePng);
    const variants: PlanetVariant[] = [];

    for (const size of variantSizes) {
      variants.push(await writeVariant(planet, await variantPng(trimmed, size), size));
    }

    const fullSize = variants.find((variant) => variant.size === 4096) ?? variants[variants.length - 1];
    const row = await upsertRow("generated_planets", {
      ...planet,
      image_url: fullSize.url,
      image_prompt: prompt,
      image_status: "Rendered",
      image_variants: variants,
      notes: `${planet.notes ? `${planet.notes}\n` : ""}Rendered transparent planet image variants: ${variantSizes.map((size) => `${size}x${size}`).join(", ")}.`
    });

    return NextResponse.json({ row, variants });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not render planet image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

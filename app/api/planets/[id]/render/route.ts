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
const magnificBaseUrl = "https://api.magnific.com/v1/ai/text-to-image/nano-banana-pro";

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
    "Create a premium sci-fi game asset: one isolated spherical planet, centered on a perfectly flat pure chroma green (#00FF00) background for later transparency removal.",
    "Uniform Project Genesis card art style: cinematic but readable, high-detail surface, clean silhouette, no text, no logo, no UI, no stars, no space background, no frame, no drop shadow.",
    "Keep the full planet visible with a clean margin. Orthographic three-quarter lighting, crisp rim light, Roblox-friendly stylized realism. Do not use green on the planet surface unless the planet data explicitly requires it.",
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function magnificApiKey() {
  return process.env.MAGNIFIC_API_KEY || process.env.NANO_BANANA_API_KEY || "";
}

function magnificResolution() {
  const value = process.env.MAGNIFIC_NANO_BANANA_RESOLUTION || "4K";
  return ["1K", "2K", "4K", "low", "medium", "high"].includes(value) ? value : "4K";
}

async function readMagnificPayload(response: Response) {
  return (await response.json().catch(() => ({}))) as {
    data?: {
      generated?: string[];
      task_id?: string;
      status?: string;
    };
    error?: string | { message?: string };
    message?: string;
  };
}

function magnificError(payload: Awaited<ReturnType<typeof readMagnificPayload>>, fallback: string) {
  if (typeof payload.error === "string") {
    return payload.error;
  }

  return payload.error?.message ?? payload.message ?? fallback;
}

async function createMagnificTask(prompt: string) {
  const apiKey = magnificApiKey();

  if (!apiKey) {
    throw new Error("MAGNIFIC_API_KEY is not configured. Add it in Vercel and .env.local to render planet art.");
  }

  const response = await fetch(magnificBaseUrl, {
    method: "POST",
    headers: {
      "x-magnific-api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt.slice(0, 3000),
      aspect_ratio: "1:1",
      resolution: magnificResolution()
    })
  });

  const payload = await readMagnificPayload(response);

  if (!response.ok) {
    throw new Error(magnificError(payload, `Magnific image generation failed (${response.status}).`));
  }

  const taskId = payload.data?.task_id;

  if (!taskId) {
    throw new Error("Magnific did not return a task ID.");
  }

  return {
    taskId,
    generated: payload.data?.generated ?? [],
    status: payload.data?.status ?? "CREATED"
  };
}

async function pollMagnificTask(taskId: string) {
  const apiKey = magnificApiKey();
  const attempts = Number(process.env.MAGNIFIC_POLL_ATTEMPTS ?? 24);
  const intervalMs = Number(process.env.MAGNIFIC_POLL_INTERVAL_MS ?? 2000);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(`${magnificBaseUrl}/${encodeURIComponent(taskId)}`, {
      headers: {
        "x-magnific-api-key": apiKey
      }
    });
    const payload = await readMagnificPayload(response);

    if (!response.ok) {
      throw new Error(magnificError(payload, `Magnific task status failed (${response.status}).`));
    }

    const status = String(payload.data?.status ?? "");
    const generated = payload.data?.generated ?? [];

    if (generated.length) {
      return generated[0];
    }

    if (["FAILED", "ERROR", "CANCELED", "CANCELLED"].includes(status.toUpperCase())) {
      throw new Error(`Magnific task ${taskId} ended with status ${status}.`);
    }

    await sleep(intervalMs);
  }

  throw new Error("Magnific render is still processing. Try the render action again in a moment.");
}

async function readMagnificImage(prompt: string) {
  const task = await createMagnificTask(prompt);
  const imageUrl = task.generated[0] ?? (await pollMagnificTask(task.taskId));
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(`Could not download Magnific image (${imageResponse.status}).`);
  }

  return Buffer.from(await imageResponse.arrayBuffer());
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

async function removeKeyedBackground(image: Buffer) {
  const decoded = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = decoded.info;
  const data = Buffer.from(decoded.data);
  const samples = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1]
  ];
  const color = samples.reduce(
    (total, [x, y]) => {
      const index = (y * width + x) * 4;
      total.r += data[index];
      total.g += data[index + 1];
      total.b += data[index + 2];
      return total;
    },
    { r: 0, g: 0, b: 0 }
  );
  const background = {
    r: Math.round(color.r / samples.length),
    g: Math.round(color.g / samples.length),
    b: Math.round(color.b / samples.length)
  };

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const distance = Math.sqrt((r - background.r) ** 2 + (g - background.g) ** 2 + (b - background.b) ** 2);
    const greenScreenDistance = Math.sqrt((r - 0) ** 2 + (g - 255) ** 2 + (b - 0) ** 2);
    const isKeyedBackground = distance < 62 || greenScreenDistance < 92 || (g > 150 && g > r * 1.35 && g > b * 1.35);

    if (isKeyedBackground) {
      data[index + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png()
    .toBuffer();
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
    const sourcePng = await removeKeyedBackground(await readMagnificImage(prompt));
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
      notes: `${planet.notes ? `${planet.notes}\n` : ""}Rendered Nano Banana Pro transparent planet image variants: ${variantSizes.map((size) => `${size}x${size}`).join(", ")}.`
    });

    return NextResponse.json({ row, variants });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not render planet image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

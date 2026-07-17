import { NextResponse } from "next/server";
import {
  getInspirationWallManifest,
  isSupportedInspirationImageExtension,
  isSupportedInspirationImageMime,
  writeInspirationWallUpload
} from "@/lib/experience-design/inspiration-wall";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isFileLike(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === "object" && "arrayBuffer" in value && "name" in value && "type" in value && "size" in value);
}

function safeError(error: unknown) {
  return error instanceof Error ? error.message : "Inspiration Wall upload failed.";
}

export async function POST(request: Request) {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return NextResponse.json({
      error: "Local Inspiration Wall uploads write to public/images and are disabled in immutable production deployments.",
      persistence: "local-development-only"
    }, { status: 409 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!isFileLike(file)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  const extension = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? "";
  if (!isSupportedInspirationImageExtension(extension) || !isSupportedInspirationImageMime(file.type)) {
    return NextResponse.json({ error: "Only jpg, jpeg, png, webp, avif, or gif images are supported." }, { status: 400 });
  }

  if (file.name.includes("/") || file.name.includes("\\") || file.name.includes("..")) {
    return NextResponse.json({ error: "Unsafe filename rejected." }, { status: 400 });
  }

  try {
    const upload = await writeInspirationWallUpload(file);
    const manifest = await getInspirationWallManifest();
    return NextResponse.json({
      ok: true,
      storage: "public/images",
      persistence: "local-development-only",
      ...upload,
      image: manifest.images.find((item) => item.relativePath === upload.relativePath) ?? null,
      count: manifest.images.length
    });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 400 });
  }
}

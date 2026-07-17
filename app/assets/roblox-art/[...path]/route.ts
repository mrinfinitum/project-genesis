import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const gameArtRoot = path.join(process.cwd(), "public", "assets", "game-art");

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  const safeSegments = (params.path ?? []).filter((segment) => segment && !segment.includes("..") && !segment.includes("/") && !segment.includes("\\"));
  if (!safeSegments.length || safeSegments.length !== params.path.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(gameArtRoot, ...safeSegments);
  const relative = path.relative(gameArtRoot, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        "content-type": contentTypeFor(filePath),
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

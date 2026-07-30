import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const metadata = JSON.parse(
    await readFile(
      path.join(process.cwd(), "data", "navigation-background-derivative.json"),
      "utf8"
    )
  );
  const serialized = JSON.stringify(metadata);
  assert(
    !/\/Users\/|source-masters|studio-private:\/\/|\.psd/i.test(serialized),
    "Navigation background metadata leaks private source information."
  );
  assert(metadata.status === "published", "Navigation background is not published.");
  assert(
    metadata.source.width === 640 && metadata.source.height === 3160,
    "Navigation PSD source dimensions must remain 640x3160."
  );

  const gamePng = metadata.derivatives.find(
    (candidate: { id: string }) => candidate.id === "game_png"
  );
  assert(gamePng, "Navigation background game PNG is missing.");
  assert(
    gamePng.width === 640 && gamePng.height === 3160,
    "Navigation background PNG must remain 640x3160."
  );

  const publicFile = path.join(process.cwd(), "public", gamePng.path);
  await access(publicFile);
  const image = await sharp(publicFile).metadata();
  assert(image.format === "png", "Navigation background game asset is not PNG.");
  assert(image.width === 640 && image.height === 3160, "Published PNG dimensions are invalid.");

  const css = await readFile(path.join(process.cwd(), "app", "globals.css"), "utf8");
  assert(
    css.includes(gamePng.path),
    "Studio navigation CSS does not reference the published PSD derivative."
  );

  console.log("Navigation background verification passed: PSD-backed 640x3160 PNG is active.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

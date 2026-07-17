import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  INSPIRATION_WALL_MAX_UPLOAD_BYTES,
  INSPIRATION_WALL_PUBLIC_PREFIX,
  INSPIRATION_WALL_ROUTE,
  classifyOrientation,
  getInspirationWallManifest,
  isSupportedInspirationImageExtension,
  isSupportedInspirationImageMime,
  sanitizeInspirationWallFilename
} from "@/lib/experience-design/inspiration-wall";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function exists(relativePath: string) {
  return existsSync(path.join(process.cwd(), relativePath));
}

function assertNoPrivatePath(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!text.includes(process.cwd()), `${label} leaked process.cwd().`);
  assert(!/\/Users\//.test(text), `${label} leaked a /Users path.`);
  assert(!/studio-private:\/\//.test(text), `${label} leaked studio-private URI.`);
}

function assertUnique(values: string[], label: string) {
  const seen = new Set(values);
  assert(seen.size === values.length, `${label} must be unique.`);
}

async function main() {
  const manifest = await getInspirationWallManifest();
  const component = read("components/experience-design-workspace.tsx");
  const homeRoute = read("app/experience-design/page.tsx");
  const dynamicRoute = read("app/experience-design/[section]/page.tsx");
  const manifestRoute = read("app/api/experience-design/inspiration-wall/route.ts");
  const uploadRoute = read("app/api/experience-design/inspiration-wall/upload/route.ts");
  const experienceIndex = read("lib/experience-design/index.ts");
  const appShell = read("components/app-shell.tsx");
  const commandPalette = read("components/studio-command-palette.tsx");
  const globalSearch = read("lib/studio/global-search.ts");
  const docs = exists("docs/inspiration-wall.md") ? read("docs/inspiration-wall.md") : "";

  assert(manifest.route === INSPIRATION_WALL_ROUTE, "Manifest route must be /experience-design/inspiration-wall.");
  assert(manifest.source === "public/images", "Manifest source must be public/images.");
  assert(manifest.publicPrefix === INSPIRATION_WALL_PUBLIC_PREFIX, "Manifest public prefix must be /images/.");
  assert(manifest.upload.localDevelopmentOnly === true, "Upload contract must be local-development-only.");
  assert(manifest.upload.maxBytes === INSPIRATION_WALL_MAX_UPLOAD_BYTES, "Upload max bytes must match the canonical constant.");
  assert(manifest.upload.productionLimitation.toLowerCase().includes("production"), "Upload contract must describe production persistence limits.");
  assert(manifest.supportedExtensions.includes(".png") && manifest.supportedExtensions.includes(".jpg") && manifest.supportedExtensions.includes(".webp"), "Manifest must support common image formats.");
  assert(manifest.images.length > 0, "Inspiration Wall must discover at least one local image.");

  assertUnique(manifest.images.map((image) => image.id), "Inspiration Wall image IDs");
  assertUnique(manifest.images.map((image) => image.relativePath), "Inspiration Wall relative paths");
  const sortedRelativePaths = [...manifest.images.map((image) => image.relativePath)].sort((left, right) => left.localeCompare(right));
  assert(manifest.images.map((image) => image.relativePath).join("|") === sortedRelativePaths.join("|"), "Manifest images must be deterministically sorted.");

  for (const image of manifest.images) {
    assert(image.publicUrl.startsWith("/images/"), `Image ${image.id} must use a public /images URL.`);
    assert(!image.publicUrl.includes(".."), `Image ${image.id} public URL must not include traversal.`);
    assert(!image.relativePath.startsWith("/") && !image.relativePath.includes(".."), `Image ${image.id} relative path must be sanitized.`);
    assert(image.width > 0 && image.height > 0, `Image ${image.id} must include dimensions.`);
    assert(image.aspectRatio === Number((image.width / image.height).toFixed(4)), `Image ${image.id} aspect ratio must be deterministic.`);
    assert(classifyOrientation(image.width, image.height) === image.orientation, `Image ${image.id} orientation must match dimensions.`);
    assert(image.fileSize > 0, `Image ${image.id} must include file size.`);
    assert(image.modifiedAt.includes("T"), `Image ${image.id} must include ISO modified time.`);
    assert(image.title.length > 0, `Image ${image.id} must include a display title.`);
    assert(image.folder.length > 0, `Image ${image.id} must include a folder.`);
    assert(image.palette.length > 0, `Image ${image.id} must include a palette.`);
    for (const color of image.palette) {
      assert(/^#[0-9A-F]{6}$/.test(color), `Image ${image.id} palette color ${color} must be uppercase hex.`);
    }
    assert(image.loadingStatus === "ready", `Image ${image.id} must be ready.`);
    assert(image.errorStatus === null, `Image ${image.id} must not carry an error.`);
  }

  assertNoPrivatePath("Inspiration Wall manifest", manifest);

  assert(isSupportedInspirationImageExtension(".png"), "PNG extension must be supported.");
  assert(isSupportedInspirationImageExtension(".jpeg"), "JPEG extension must be supported.");
  assert(!isSupportedInspirationImageExtension(".psd"), "PSD files must not be treated as gallery images.");
  assert(!isSupportedInspirationImageExtension(".exe"), "Executables must not be treated as gallery images.");
  assert(isSupportedInspirationImageMime("image/png"), "PNG MIME must be supported.");
  assert(!isSupportedInspirationImageMime("text/html"), "HTML upload MIME must be rejected.");
  const sanitized = sanitizeInspirationWallFilename("../NOVERIS Hero <script>.PNG");
  assert(sanitized === "noveris-hero-script.png", "Filename sanitizer must lowercase, strip unsafe characters, and preserve extension.");

  assert(exists("app/api/experience-design/inspiration-wall/route.ts"), "Inspiration Wall manifest route is missing.");
  assert(exists("app/api/experience-design/inspiration-wall/upload/route.ts"), "Inspiration Wall upload route is missing.");
  assert(manifestRoute.includes("getInspirationWallManifest"), "Manifest route must call the canonical manifest builder.");
  assert(uploadRoute.includes("NODE_ENV") && uploadRoute.includes("production"), "Upload route must block immutable production deployments.");
  assert(uploadRoute.includes("includes(\"..\")"), "Upload route must reject traversal in filenames.");
  assert(uploadRoute.includes("writeInspirationWallUpload"), "Upload route must use the canonical upload helper.");

  assert(dynamicRoute.includes('section === "mood-boards"'), "Mood-board route alias must remain redirected.");
  assert(dynamicRoute.includes('section === "inspiration-boards"'), "Old inspiration-boards route alias must remain redirected.");
  assert(dynamicRoute.includes('section === "canvas"'), "Old canvas route alias must remain redirected.");
  assert(dynamicRoute.includes('redirect("/experience-design/inspiration-wall")'), "Old routes must redirect to Inspiration Wall.");
  assert(dynamicRoute.includes("getInspirationWallManifest"), "Section route must load the server-side image manifest.");
  assert(dynamicRoute.includes('section === "inspiration-wall"'), "Section route must recognize inspiration-wall.");
  assert(homeRoute.includes("getInspirationWallManifest") && homeRoute.includes("inspirationWall={inspirationWall}"), "Experience Design home must pass the Inspiration Wall manifest for tab-based browsing.");

  assert(experienceIndex.includes('id: "inspiration-wall"'), "Experience Design sections must expose inspiration-wall.");
  assert(experienceIndex.toLowerCase().includes("local image") && experienceIndex.includes("public/images"), "Experience Design section copy must describe local image source.");
  assert(experienceIndex.includes('workspaceRoute: `${EXPERIENCE_DESIGN_ROUTE}/inspiration-wall`'), "DV-04 workspace route must point to Inspiration Wall.");
  assert(appShell.includes('href: "/experience-design/inspiration-wall"') && appShell.includes("Inspiration Wall"), "Sidebar must link to Inspiration Wall.");
  assert(commandPalette.includes("Open Inspiration Wall") && commandPalette.includes("/experience-design/inspiration-wall"), "Command palette must expose Inspiration Wall.");
  assert(globalSearch.includes('workspace("inspiration-wall"') && globalSearch.includes("/experience-design/inspiration-wall"), "Global search must index Inspiration Wall.");

  assert(component.includes("Inspiration Wall"), "Workspace must render Inspiration Wall title.");
  assert(component.includes("public/images"), "Workspace must disclose public/images source.");
  assert(component.includes("resolvedWall") && component.includes("setResolvedWall"), "Workspace must keep a resolved client-side Inspiration Wall manifest.");
  assert(component.includes('fetch("/api/experience-design/inspiration-wall"'), "Workspace must fetch the Inspiration Wall manifest when server props are empty.");
  assert(component.includes('cache: "no-store"'), "Client-side Inspiration Wall manifest fetch must avoid stale empty results.");
  assert(component.includes("Loading local images"), "Workspace must distinguish manifest loading from an empty image folder.");
  assert(component.includes('loading="lazy"'), "Image tiles must lazy-load.");
  assert(component.includes('decoding="async"'), "Image tiles must async decode.");
  assert(component.includes("break-inside-avoid"), "Image tiles must opt out of masonry breaks.");
  assert(component.includes("columns-1 gap-3"), "Gallery must use responsive masonry columns.");
  assert(component.includes('role="dialog"'), "Viewer must expose dialog role.");
  assert(component.includes("ArrowRight") && component.includes("ArrowLeft") && component.includes("Escape"), "Viewer must support keyboard navigation.");
  assert(component.includes("setPresentation"), "Presentation mode must be supported.");
  assert(component.includes("Metadata"), "Metadata drawer must be available on demand.");
  assert(component.includes("/api/experience-design/inspiration-wall/upload"), "Upload control must call local upload endpoint.");
  assert(!component.includes("Typography Card"), "Gallery must not include typography demo cards.");
  assert(!component.includes("Civilization Gold"), "Gallery must not include token color demo cards.");
  assert(!component.includes('WorkspacePanel title="Board Categories"'), "Gallery must not include old dashboard summary panels.");
  assert(!component.includes('WorkspaceMiniStat label="References"'), "Gallery must not show record metadata blocks by default.");

  assert(docs.includes("public/images"), "Docs must describe the public/images source.");
  assert(docs.includes("/experience-design/inspiration-wall"), "Docs must document the canonical route.");
  assert(docs.toLowerCase().includes("production"), "Docs must explain production upload limitations.");
  assert(docs.toLowerCase().includes("no absolute"), "Docs must document the private-path boundary.");
  assert(docs.toLowerCase().includes("runtime"), "Docs must document runtime/export boundary.");

  const largestImage = manifest.images.reduce((max, image) => Math.max(max, image.fileSize), 0);
  const averageAspectRatio = manifest.images.reduce((sum, image) => sum + image.aspectRatio, 0) / manifest.images.length;
  const output = {
    status: "Ready",
    route: INSPIRATION_WALL_ROUTE,
    imageCount: manifest.images.length,
    folders: [...new Set(manifest.images.map((image) => image.folder))].sort(),
    supportedExtensions: manifest.supportedExtensions,
    largestImageBytes: largestImage,
    averageAspectRatio: Number(averageAspectRatio.toFixed(4)),
    upload: manifest.upload,
    checks: {
      manifest: "pass",
      masonryGallery: "pass",
      uploadSafety: "pass",
      palette: "pass",
      privatePathBoundary: "pass",
      routeAliases: "pass"
    }
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

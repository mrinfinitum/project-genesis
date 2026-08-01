import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAssetProductionAssets } from "@/lib/assets/asset-production";
import { planetDetailScreenRuntimeContract } from "@/lib/assets/planet-detail-screen";
import { environmentComposerRuntimeContract } from "@/lib/environment-composer";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { SPECIES_PLATE_MASTER_V1, speciesPlatePresets } from "@/lib/species-plates/master-template";

const root = process.cwd();
const outputRoot = path.join(root, "migration-audit");
const sourceMasterRoot = path.join(root, "source-masters");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md"]);

type FileRecord = {
  path: string;
  size: number;
  extension: string;
};

function relative(filePath: string) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

async function walk(directory: string): Promise<FileRecord[]> {
  const records: FileRecord[] = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return records;
  }
  for (const entry of entries) {
    if ([".git", ".next", "node_modules", "studio-audit", "migration-audit", "migration-report"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) records.push(...await walk(absolute));
    else if (entry.isFile()) {
      const details = await stat(absolute);
      records.push({ path: relative(absolute), size: details.size, extension: path.extname(entry.name).toLowerCase() });
    }
  }
  return records;
}

async function sourceFiles() {
  const roots = ["app", "components", "lib", "scripts", "types"];
  return (await Promise.all(roots.map((item) => walk(path.join(root, item))))).flat();
}

async function references(files: FileRecord[], expressions: RegExp[]) {
  const matches: Array<{ path: string; imports: string[]; matches: string[] }> = [];
  for (const file of files.filter((item) => sourceExtensions.has(item.extension))) {
    const text = await readFile(path.join(root, file.path), "utf8");
    const found = expressions.flatMap((expression) => [...text.matchAll(expression)].map((match) => match[0]));
    if (!found.length) continue;
    const imports = [...text.matchAll(/(?:from\s+|import\s*\()?["'](@\/[^"']+|\.\.?\/[^"']+)["']/g)].map((match) => match[1]);
    matches.push({ path: file.path, imports: [...new Set(imports)].sort(), matches: [...new Set(found)].sort() });
  }
  return matches.sort((left, right) => left.path.localeCompare(right.path));
}

function routeRecords(files: FileRecord[]) {
  return files
    .filter((file) => file.path.startsWith("app/") && /\/(?:page|route)\.(?:ts|tsx)$/.test(file.path))
    .map((file) => ({
      path: file.path,
      kind: file.path.endsWith("page.tsx") ? "page" : "api",
      route: `/${file.path.replace(/^app\//, "").replace(/\/(?:page|route)\.(?:ts|tsx)$/, "").replace(/\/index$/, "")}`.replace(/\/$/, "") || "/"
    }));
}

async function writeJson(filename: string, value: unknown) {
  await writeFile(path.join(outputRoot, filename), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  await mkdir(outputRoot, { recursive: true });
  const files = await sourceFiles();
  const allFiles = await walk(root);
  const routes = routeRecords(files);
  const assets = await getAssetProductionAssets();
  const runtime = await buildCanonicalRuntimeExportPayload();
  const sourceMasters = await walk(sourceMasterRoot);
  const promptFiles = allFiles.filter((file) => /prompt|nano-banana|visual-production/i.test(file.path));

  await writeJson("environment-builder-dependencies.json", {
    generatedAt: new Date().toISOString(),
    contractVersion: environmentComposerRuntimeContract().version,
    routes: routes.filter((record) => /environment|layer-generator/.test(record.route)),
    dependencies: await references(files, [/environmentComposer/g, /EnvironmentComposer/g, /environment-layer/g, /EnvironmentLayer/g]),
    contractCounts: {
      environmentTypes: environmentComposerRuntimeContract().environmentTypes.length,
      assets: environmentComposerRuntimeContract().layerAssets.length,
      themes: environmentComposerRuntimeContract().themes.length,
      profiles: environmentComposerRuntimeContract().profiles.length
    }
  });
  await writeJson("screen-designer-dependencies.json", {
    generatedAt: new Date().toISOString(),
    routes: routes.filter((record) => /screen|component-library|visual-builder/.test(record.route)),
    dependencies: await references(files, [/ScreenDesigner/g, /screen designer/gi, /layoutManifest/g, /targetBounds/g, /safeBounds/g, /referenceResolution/g])
  });
  await writeJson("planet-detail-slice-dependencies.json", {
    generatedAt: new Date().toISOString(),
    contract: planetDetailScreenRuntimeContract,
    dependencies: await references(files, [/planetDetailScreen/g, /PlanetDetailScreen/g, /planet-detail-screen/g])
  });
  await writeJson("species-plate-dependencies.json", {
    generatedAt: new Date().toISOString(),
    template: SPECIES_PLATE_MASTER_V1,
    presets: speciesPlatePresets,
    dependencies: await references(files, [/speciesPlate/g, /SpeciesPlate/g, /species-plate/g])
  });
  await writeJson("asset-registry-before.json", {
    generatedAt: new Date().toISOString(),
    count: assets.length,
    records: assets
  });
  await writeJson("prompt-library-before.json", {
    generatedAt: new Date().toISOString(),
    count: promptFiles.length,
    files: promptFiles,
    dependencies: await references(files, [/visual-prompt/g, /nano-banana/g, /prompt-library/g])
  });
  await writeJson("source-master-paths-before.json", {
    generatedAt: new Date().toISOString(),
    root: "source-masters",
    count: sourceMasters.length,
    files: sourceMasters
  });
  await writeJson("runtime-contracts-before.json", {
    generatedAt: new Date().toISOString(),
    metadata: runtime.metadata,
    topLevelKeys: Object.keys(runtime).sort(),
    routes: routes.filter((record) => record.route.startsWith("/api/export")),
    moduleCounts: Object.fromEntries(Object.entries(runtime).map(([key, value]) => [key, Array.isArray(value) ? value.length : typeof value]))
  });

  console.log(`Migration safety inventory written to ${relative(outputRoot)}.`);
  console.log(`Assets: ${assets.length}; source masters: ${sourceMasters.length}; routes: ${routes.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

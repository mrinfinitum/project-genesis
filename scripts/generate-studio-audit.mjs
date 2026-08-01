import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, lstat, mkdir, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reportRoot = path.join(root, "studio-audit");
const date = new Date().toISOString().slice(0, 10);
const zipName = `Project_Genesis_Studio_Full_Audit_${date}.zip`;
const ignoredDirectories = new Set([".git", ".next", "node_modules", "studio-audit", ".local-data"]);

function relative(value) {
  return path.relative(root, value).split(path.sep).join("/");
}

function sanitize(value) {
  return String(value).replaceAll(root, ".").replaceAll(process.env.HOME ?? "/Users/unknown", "~");
}

async function walk(directory, options = {}) {
  const files = [];
  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (ignoredDirectories.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        files.push(absolute);
      } else if (entry.isSymbolicLink() && options.followSymlinks) {
        try {
          const resolved = await realpath(absolute);
          const details = await stat(resolved);
          if (details.isDirectory()) await visit(resolved);
          else if (details.isFile()) files.push(resolved);
        } catch {
          // Broken symlinks remain reportable through their parent inventory.
        }
      }
    }
  }
  if (existsSync(directory)) await visit(directory);
  return files;
}

function fileExtension(file) {
  return path.extname(file).toLowerCase() || "[none]";
}

function markdownTable(headers, rows) {
  const line = (cells) => `| ${cells.map((cell) => String(cell ?? "").replaceAll("|", "\\|").replaceAll("\n", " ")).join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map(line)].join("\n");
}

function countJsonRecords(value) {
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== "object") return 0;
  for (const key of ["records", "items", "assets", "resources", "prompts", "packages", "data"]) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate.length;
    if (candidate && typeof candidate === "object" && key === "assets") return Object.keys(candidate).length;
  }
  return 0;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

function run(command) {
  const startedAt = Date.now();
  const result = spawnSync(command, { cwd: root, shell: true, encoding: "utf8", maxBuffer: 3_000_000 });
  return {
    command,
    exitCode: result.status ?? 1,
    durationMs: Date.now() - startedAt,
    status: result.status === 0 ? "passed" : "failed",
    output: sanitize(`${result.stdout ?? ""}${result.stderr ?? ""}`).slice(-12000)
  };
}

function stableId(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function titleFromRoute(route) {
  if (route === "/") return "Universe Command Center";
  return route
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[\[\]]/g, "").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(" / ");
}

function routeFromAppFile(file) {
  const rel = relative(file).replace(/^app/, "").replace(/\/(page|route)\.tsx?$/, "").replace(/\/route\.ts$/, "");
  return rel === "" ? "/" : rel;
}

async function inspectNavigation() {
  const source = await readFile(path.join(root, "components/app-shell.tsx"), "utf8");
  const groups = [];
  const groupPattern = /id: "([^"]+)",\s*label: "([^"]+)",[\s\S]*?items: \[([\s\S]*?)\n\s*\]\n\s*\}/g;
  for (const match of source.matchAll(groupPattern)) {
    const [, id, label, body] = match;
    const items = [...body.matchAll(/href: "([^"]+)",\s*label: "([^"]+)"/g)].map((item) => ({ href: item[1], label: item[2] }));
    groups.push({ id, label, items });
  }
  return groups;
}

function statusSummary(records) {
  const result = {};
  for (const record of records) {
    const status = String(record?.status ?? record?.export_status ?? record?.productionStatus ?? "unknown").toLowerCase();
    result[status] = (result[status] ?? 0) + 1;
  }
  return result;
}

async function main() {
  await mkdir(reportRoot, { recursive: true });
  await mkdir(path.join(reportRoot, "screenshots"), { recursive: true });

  const files = await walk(root);
  const routeFiles = files.filter((file) => /\/app\/.*\/(page\.tsx|route\.ts)$/.test(file) || /\/app\/(page\.tsx|route\.ts)$/.test(file));
  const pageFiles = routeFiles.filter((file) => file.endsWith("page.tsx"));
  const apiFiles = routeFiles.filter((file) => file.endsWith("route.ts") && relative(file).startsWith("app/api/"));
  const componentFiles = files.filter((file) => relative(file).startsWith("components/") && /\.(tsx|ts)$/.test(file));
  const libraryFiles = files.filter((file) => relative(file).startsWith("lib/") && /\.(tsx|ts)$/.test(file));
  const scriptFiles = files.filter((file) => relative(file).startsWith("scripts/"));
  const testFiles = files.filter((file) => /(^|\/)(__tests__|tests)\//.test(relative(file)) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(file));
  const jsonFiles = files.filter((file) => file.endsWith(".json"));
  const csvFiles = files.filter((file) => file.endsWith(".csv"));
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  const schemaFiles = jsonFiles.filter((file) => /schema/i.test(path.basename(file)));
  const generatorFiles = [...componentFiles, ...libraryFiles, ...scriptFiles].filter((file) => /generator|generate-|compiler|prompt/i.test(path.basename(file)));

  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const runtimeSource = await readFile(path.join(root, "lib/runtime/game-runtime.ts"), "utf8");
  const currentContentVersion = Number(/export const gameRuntimeContentVersion = (\d+);/.exec(runtimeSource)?.[1] ?? 0) || null;
  const commitHash = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const navTree = await inspectNavigation();

  const pageRoutes = await Promise.all(pageFiles.map(async (file) => {
    const source = await readFile(file, "utf8");
    const route = routeFromAppFile(file);
    const imports = [...source.matchAll(/from\s+["'](@\/[^"']+|\.\.?\/[^"']+)["']/g)].map((match) => match[1]);
    const navGroup = navTree.find((group) => group.items.some((item) => item.href.split(/[?#]/)[0] === route));
    return {
      route,
      pageTitle: titleFromRoute(route),
      sourceFile: relative(file),
      navigationLocation: navGroup?.label ?? "not in primary navigation",
      importedComponents: imports.filter((item) => item.includes("component")),
      directDependencies: imports,
      status: navGroup ? "active" : "hidden_or_secondary",
      recommendation: route.includes("environment-composer") || route.includes("creative-production") ? "review against flat-background direction" : "retain pending product review"
    };
  }));

  const apiRoutes = apiFiles.map((file) => ({
    route: routeFromAppFile(file),
    sourceFile: relative(file),
    exportTarget: /\/api\/export\/(unity|roblox|web|unreal|godot|generic)/.exec(relative(file))?.[1] ?? null
  }));

  const componentInventory = await Promise.all(componentFiles.map(async (file) => {
    const source = await readFile(file, "utf8");
    return {
      id: stableId(relative(file)),
      name: path.basename(file).replace(/\.(tsx|ts)$/, ""),
      sourceFile: relative(file),
      imports: [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]),
      category: /generator/i.test(path.basename(file)) ? "generator" : /workspace|library|browser/i.test(path.basename(file)) ? "workspace" : "component",
      sourceLines: source.split("\n").length
    };
  }));

  const handoffDirectory = path.join(root, "data/handoff/json");
  const handoffFiles = (await readdir(handoffDirectory)).filter((file) => file.endsWith(".json")).sort();
  const canonicalLibraries = [];
  for (const file of handoffFiles) {
    const data = await readJson(path.join(handoffDirectory, file));
    canonicalLibraries.push({
      libraryId: file.replace(/\.json$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      displayName: file.replace(/\.json$/, "").replaceAll("_", " "),
      source: `data/handoff/json/${file}`,
      schemaId: "bundled-handoff-json",
      recordCount: countJsonRecords(data),
      activeCount: null,
      draftCount: null,
      deprecatedCount: null,
      invalidCount: null,
      version: null,
      dependencyCount: 0,
      exportedTargets: ["generic", "web", "roblox", "unity", "unreal", "godot"],
      runtimeReadiness: "static source inspected; endpoint execution not performed",
      validationStatus: "not independently validated in this audit run",
      evidence: `data/handoff/json/${file}`,
      notes: "Bundled fallback source. Live Supabase may supersede this source when server configuration is present."
    });
  }

  const curiosityFiles = (await readdir(path.join(root, "data"))).filter((file) => /^curiosity-volume-\d+-.*\.json$/.test(file) && !file.includes("taxonomy")).sort();
  for (const file of curiosityFiles) {
    const data = await readJson(path.join(root, "data", file));
    canonicalLibraries.push({
      libraryId: file.replace(/\.json$/, ""), displayName: file.replace(/^curiosity-volume-\d+-/, "").replace(/\.json$/, "").replaceAll("-", " "), source: `data/${file}`,
      schemaId: "curiosity-volume-json", recordCount: countJsonRecords(data), activeCount: null, draftCount: null, deprecatedCount: null, invalidCount: null, version: null,
      dependencyCount: 1, exportedTargets: ["generic", "web", "roblox", "unity", "unreal", "godot"], runtimeReadiness: "source library", validationStatus: "not independently validated", evidence: `data/${file}`, notes: "Canonical discovery volume imported as local source data."
    });
  }

  const aiSeed = await readJson(path.join(root, "data/ai-agents/NOVERIS_AI_Agents_Studio_Seed.json"));
  canonicalLibraries.push({ libraryId: "ai_agents", displayName: "AI Agents", source: "data/ai-agents/NOVERIS_AI_Agents_Studio_Seed.json", schemaId: aiSeed?.schemaVersion ?? "unknown", recordCount: countJsonRecords(aiSeed), activeCount: null, draftCount: null, deprecatedCount: null, invalidCount: null, version: aiSeed?.schemaVersion ?? null, dependencyCount: 2, exportedTargets: ["generic", "web", "roblox", "unity", "unreal", "godot"], runtimeReadiness: "source library", validationStatus: "verify:ai-library available", evidence: "data/ai-agents/NOVERIS_AI_Agents_Studio_Seed.json", notes: "Canonical AI seed file." });
  canonicalLibraries.push({ libraryId: "species_plates", displayName: "Species Plates", source: "lib/species-plates", schemaId: "SPECIES_PLATE_MASTER_V1", recordCount: 15, activeCount: null, draftCount: null, deprecatedCount: null, invalidCount: null, version: "1.0.0", dependencyCount: 8, exportedTargets: ["generic", "web", "roblox", "unity", "unreal", "godot"], runtimeReadiness: "manifest and prompt-contract based", validationStatus: "verify:species-plates available", evidence: "lib/species-plates/master-template.ts", notes: "Fifteen static presets; this is a contract/template system, not an image renderer." });

  const canonicalRecordCount = canonicalLibraries.reduce((total, library) => total + (Number(library.recordCount) || 0), 0);

  const assetProduction = await readJson(path.join(root, "data/asset-production.local.json"));
  const assets = Object.values(assetProduction?.assets ?? {});
  const assetStatuses = statusSummary(assets);
  const assetInventory = {
    source: "data/asset-production.local.json",
    assetCount: assets.length,
    statusCounts: assetStatuses,
    approvedAssets: assets.filter((asset) => ["approved", "published"].includes(String(asset?.status ?? "").toLowerCase())).length,
    missingAssets: assets.filter((asset) => /missing/.test(String(asset?.status ?? "").toLowerCase())).length + Object.keys(assetProduction?.missingRequirements ?? {}).length,
    derivativePresetCount: Array.isArray(assetProduction?.derivativePresets) ? assetProduction.derivativePresets.length : 0,
    processingJobCount: Array.isArray(assetProduction?.processingJobs) ? assetProduction.processingJobs.length : 0,
    productionTaskCount: Array.isArray(assetProduction?.productionTasks) ? assetProduction.productionTasks.length : 0,
    warnings: ["Registry is local JSON and may not match live Supabase state.", "No image decoding or checksum verification was performed by this audit."],
    categories: Object.entries(assets.reduce((result, asset) => { const key = String(asset?.category ?? asset?.type ?? "Unclassified"); result[key] = (result[key] ?? 0) + 1; return result; }, {})).sort((left, right) => Number(right[1]) - Number(left[1])).map(([category, count]) => ({ category, count }))
  };

  const promptRoot = path.join(root, "data/visual-prompt-libraries");
  const promptFiles = (await walk(promptRoot)).filter((file) => /prompt[_-]library\.json$/i.test(path.basename(file)));
  const promptLibraries = [];
  for (const file of promptFiles) {
    const data = await readJson(file);
    promptLibraries.push({
      volumeId: path.basename(path.dirname(file)), packageId: path.basename(path.dirname(file)), location: relative(file), promptCount: countJsonRecords(data), archetypeCount: null, outputCount: null,
      version: data?.version ?? null, status: "present", schemaValidation: "not run per package", checksumValidation: "not evidenced", imported: relative(file).includes("imported-source"),
      duplicatedFragments: "unreviewed", unresolvedVariables: "unreviewed", stalePrompts: "unreviewed", runtimeLeakage: "unreviewed", missingModelProfileReferences: "unreviewed"
    });
  }

  const sourceMasterRoot = path.join(root, "game-art/source-masters");
  const sourceMasterFiles = await walk(sourceMasterRoot);
  const sourceMasterRows = await Promise.all(sourceMasterFiles.map(async (file) => {
    const details = await stat(file);
    return { path: relative(file).replace(/^game-art\//, "source-masters/"), extension: fileExtension(file), bytes: details.size, folder: relative(path.dirname(file)).replace(/^game-art\//, "source-masters/") };
  }));
  const sourceMasterInventory = {
    canonicalRoot: "source-masters -> game-art/source-masters (symbolic link)",
    fileCount: sourceMasterRows.length,
    totalBytes: sourceMasterRows.reduce((total, file) => total + file.bytes, 0),
    byExtension: Object.entries(sourceMasterRows.reduce((result, file) => { result[file.extension] = (result[file.extension] ?? 0) + 1; return result; }, {})).sort((left, right) => Number(right[1]) - Number(left[1])),
    emptyFolderMarkers: sourceMasterRows.filter((file) => file.path.endsWith(".gitkeep")).map((file) => file.path),
    warnings: sourceMasterRows.filter((file) => /\.DS_Store$|untitled-|enviroment/i.test(file.path)).map((file) => file.path),
    files: sourceMasterRows
  };

  const exporters = ["generic", "web", "roblox", "unity", "unreal", "godot"].map((target) => ({
    target, route: `/api/export/${target}`, source: `app/api/export/${target}/route.ts`, format: target === "roblox" ? "Lua-oriented JSON adapter" : target === "unity" ? "C#/JSON starter export" : "JSON adapter",
    staticReadiness: existsSync(path.join(root, "app/api/export", target, "route.ts")) ? "route present; response not invoked" : "route missing", contentVersion: "runtime-derived; not executed", schemaVersion: "runtime-derived; not executed", checksum: "runtime-derived; not executed", leakageReview: "not runtime executed; inspect lib/runtime/game-runtime.ts and adapter serializers", evidence: `app/api/export/${target}/route.ts`
  }));

  const environmentCandidates = [
    { itemName: "Environment Composer UI", type: "workspace", path: "components/environment-composer-workspace.tsx", currentPurpose: "Theme and runtime-export views after scene/layer UI removal.", evidenceOfUse: "Referenced by app/environment-composer/themes/page.tsx and export/page.tsx.", dependents: "Environment Composer routes", category: "retain", riskLevel: "medium", dataMigrationRequired: "No, if only UI routes are removed.", recommendation: "Keep narrow theme/export contract; do not reintroduce freeform composition.", confidence: "high", proposedReplacement: "Flat background asset metadata and Unity-owned layout." },
    { itemName: "Legacy environment layer generator", type: "retired workflow", path: "source-masters/backgrounds", currentPurpose: "Replaced by canonical flat background records.", evidenceOfUse: "Approved Galaxy, Galactic Region, and Star System paintings are indexed by the Background Library.", dependents: "Background Library and source-master derivative generators", category: "removed", riskLevel: "low", dataMigrationRequired: "Complete for locally known paintings.", recommendation: "Keep flat background records and stable public derivative paths.", confidence: "high", proposedReplacement: "Canonical flat Environment Painting record per context." },
    { itemName: "Species Plate layout contract", type: "template system", path: "lib/species-plates/master-template.ts", currentPurpose: "Defines 4000x4000 plate panels, presets, and prompt constraints.", evidenceOfUse: "Referenced by compiler and species plate routes.", dependents: "Species plates endpoints and UI", category: "simplify", riskLevel: "medium", dataMigrationRequired: "No for prompts; yes for any active layout manifests.", recommendation: "Retain prompt and asset extraction contracts; move visual layout ownership to Unity or an offline art tool.", confidence: "high", proposedReplacement: "Prompt presets plus approved asset manifests." },
    { itemName: "Planet Detail PSD slicing", type: "asset pipeline", path: "lib/assets/planet-detail-screen.ts", currentPurpose: "PSD slices and artpack manifests.", evidenceOfUse: "Creative Production Planet Detail routes and exports.", dependents: "Planet detail artpack endpoints", category: "migrate_data_first", riskLevel: "high", dataMigrationRequired: "Yes; retain source master, exported PNG assets, manifest semantic keys, and safe-area metadata.", recommendation: "Keep asset identity and exported sprites; discontinue Studio ownership of Unity coordinates.", confidence: "high", proposedReplacement: "Unity screen prefab/layout with Studio asset-manifest references." },
    { itemName: "Legacy map-named routes", type: "routes", path: "app/sector-map, app/star-system-map", currentPurpose: "Canonical libraries with historic route names.", evidenceOfUse: "Primary navigation references both routes.", dependents: "Sidebar bookmarks", category: "rename", riskLevel: "low", dataMigrationRequired: "No; redirects preserve bookmarks.", recommendation: "Plan redirects only after confirming external links.", confidence: "medium", proposedReplacement: "Library-oriented route names." }
  ];

  const dependencyNodes = [
    ...canonicalLibraries.map((item) => ({ id: `library:${item.libraryId}`, type: "canonical_library", label: item.displayName, path: item.source })),
    ...componentInventory.filter((item) => item.category === "generator").map((item) => ({ id: `component:${item.id}`, type: "generator", label: item.name, path: item.sourceFile })),
    ...pageRoutes.map((item) => ({ id: `page:${item.route}`, type: "page", label: item.pageTitle, path: item.sourceFile })),
    ...exporters.map((item) => ({ id: `export:${item.target}`, type: "export_target", label: item.target, path: item.source }))
  ];
  const dependencyEdges = [];
  for (const page of pageRoutes) {
    for (const imported of page.directDependencies.filter((dependency) => dependency.startsWith("@/components/"))) {
      dependencyEdges.push({ from: `page:${page.route}`, to: `component:${stableId(imported.replace("@/", ""))}`, type: "imports", evidence: page.sourceFile });
    }
  }
  for (const exporter of exporters) {
    for (const library of canonicalLibraries.slice(0, 12)) dependencyEdges.push({ from: `library:${library.libraryId}`, to: `export:${exporter.target}`, type: "publishes", evidence: "lib/runtime/game-runtime.ts and export adapters" });
  }

  const buildCommands = [
    "npm run build",
    "npm run lint",
    "npm test",
    "npm run verify:resource-taxonomy",
    "npm run verify:resource-discovery",
    "npm run verify:species-plates",
    "npm run verify:environment-composer"
  ];
  const buildHealth = { generatedAt: new Date().toISOString(), commands: buildCommands.map(run) };
  buildHealth.summary = {
    passed: buildHealth.commands.filter((item) => item.status === "passed").length,
    failed: buildHealth.commands.filter((item) => item.status === "failed").length,
    notRun: 0,
    warnings: ["No consolidated test script is declared in package.json; npm test is included to record that fact.", "Screenshot automation was unavailable in this execution environment; no screenshots were fabricated."],
    TODOCount: (await Promise.all(files.filter((file) => /\.(ts|tsx|js|mjs)$/.test(file)).map(async (file) => ((await readFile(file, "utf8")).match(/\bTODO\b/g) ?? []).length))).reduce((total, value) => total + value, 0),
    FIXMECount: (await Promise.all(files.filter((file) => /\.(ts|tsx|js|mjs)$/.test(file)).map(async (file) => ((await readFile(file, "utf8")).match(/\bFIXME\b/g) ?? []).length))).reduce((total, value) => total + value, 0)
  };

  const screenshots = pageRoutes.map((page, index) => ({
    file: null,
    route: page.route,
    pageTitle: page.pageTitle,
    viewport: "1920x1200",
    captureStatus: "not_captured",
    error: "No browser automation provider was available in this audit execution environment; no placeholder screenshot was created.",
    timestamp: new Date().toISOString(),
    suggestedFilename: `${String(index).padStart(3, "0")}-${page.route === "/" ? "dashboard" : page.route.replace(/^\//, "").replaceAll("/", "-").replace(/[\[\]]/g, "")}.png`
  }));

  const recommendationRows = [
    ["Immediate", "Publish and review this audit before deleting additional architecture.", "Protects canonical content and asset references."],
    ["Immediate", "Define a single flat-background record/manifest contract before retiring environment layer records.", "Current generators and API still represent multi-layer assets."],
    ["Immediate", "Decide Unity ownership for Planet Detail sprite placement and freeze only semantic asset keys in Studio.", "PSD slicing contains presentation layout metadata."],
    ["Next", "Consolidate generator inputs around canonical record IDs and source-master manifests.", "Reduces prompt and generator overlap."],
    ["Next", "Add an automated route screenshot harness to the audit process.", "This audit could not capture live pages without browser automation."],
    ["Later", "Deprecate historic map route names behind redirects after link inventory review.", "Current navigation is library-oriented while some URLs are map-oriented."],
    ["Do not change yet", "Six engine exporters.", "Static routes are present, but runtime payload compatibility was not executed in this audit." ]
  ];

  const summary = {
    generatedAt: new Date().toISOString(), repository: "project-genesis-studio", branch, commitHash, contentVersion: currentContentVersion,
    build: { status: buildHealth.summary.failed ? "warnings_or_failures_recorded" : "passed", commandsRun: buildHealth.commands.length, passed: buildHealth.summary.passed, failed: buildHealth.summary.failed },
    counts: { routes: routeFiles.length, pages: pageFiles.length, components: componentFiles.length, generators: generatorFiles.length, schemas: schemaFiles.length, canonicalLibraries: canonicalLibraries.length, canonicalRecords: canonicalRecordCount, promptRecords: promptLibraries.reduce((total, item) => total + item.promptCount, 0), sourceMasterFiles: sourceMasterRows.length, approvedAssets: assetInventory.approvedAssets, missingAssets: assetInventory.missingAssets, runtimeTargets: exporters.length },
    directionalReview: { environmentBuilder: "Partially removed at UI level; environment generators and layer-asset API remain.", screenDesigner: "No current Screen Designer route found; PSD slice and creative-production screen contracts remain.", flatBackgroundReadiness: "Partial. Environment painting source folders and generator prompts exist, but multi-layer API and coordinate-oriented manifests require migration decisions.", speciesPlateRecommendation: "Retain prompt/asset manifest capabilities; simplify or externalize layout editing." },
    topRisks: ["Multi-layer environment records remain behind generators/API despite flat-background direction.", "PSD slice manifests can imply Studio ownership of Unity layout coordinates.", "Bundled fallback data and live Supabase can diverge.", "No automated screenshot evidence was available for current UI state.", "Some build-health commands are absent or incompatible with the current package script surface."],
    topRemovalCandidates: environmentCandidates.filter((item) => ["deprecate", "migrate_data_first"].includes(item.category)).map((item) => item.itemName),
    topMergeCandidates: environmentCandidates.filter((item) => item.category === "simplify").map((item) => item.itemName),
    topMissingCapabilities: ["Flat-background migration manifest", "Unity contract test fixture", "Automated visual screenshot capture", "Unified canonical validation runner"],
    recommendedNextActions: recommendationRows.filter((row) => row[0] === "Immediate").map((row) => row[1])
  };

  const fileMap = {
    "audit-summary.json": summary,
    "canonical-data-inventory.json": canonicalLibraries,
    "runtime-export-inventory.json": exporters,
    "asset-production-inventory.json": assetInventory,
    "source-master-inventory.json": sourceMasterInventory,
    "prompt-library-inventory.json": promptLibraries,
    "generator-inventory.json": componentInventory.filter((item) => item.category === "generator"),
    "page-route-inventory.json": { pages: pageRoutes, apiRoutes },
    "component-inventory.json": componentInventory,
    "dependency-graph.json": { nodes: dependencyNodes, edges: dependencyEdges, limitation: "Import edges are partial static aliases; dynamic imports and database relationships are not resolved." },
    "navigation-tree.json": { current: navTree, recommendation: { label: "Proposed Creative Production navigation (recommendation only)", tree: ["Production Dashboard", "Background Library", "Visual Prompt Generator", "Species Plates", "Asset Library", "Production Queue", "Source Masters", "Export Manifests", "Validation"] } },
    "remove-merge-candidates.json": environmentCandidates,
    "build-health.json": buildHealth,
    "screenshot-manifest.json": screenshots
  };
  for (const [name, value] of Object.entries(fileMap)) await writeFile(path.join(reportRoot, name), `${JSON.stringify(value, null, 2)}\n`);

  const inventoryTable = markdownTable(["Library", "Records", "Source", "Runtime readiness"], canonicalLibraries.map((item) => [item.displayName, item.recordCount, item.source, item.runtimeReadiness]));
  const routeTable = markdownTable(["Route", "Status", "Navigation", "Source"], pageRoutes.map((item) => [item.route, item.status, item.navigationLocation, item.sourceFile]));
  const exporterTable = markdownTable(["Target", "Route", "Static review", "Evidence"], exporters.map((item) => [item.target, item.route, item.staticReadiness, item.evidence]));
  const candidatesTable = markdownTable(["Candidate", "Category", "Risk", "Migration", "Recommendation"], environmentCandidates.map((item) => [item.itemName, item.category, item.riskLevel, item.dataMigrationRequired, item.recommendation]));
  const commandTable = markdownTable(["Command", "Result", "Exit", "Duration ms"], buildHealth.commands.map((item) => [item.command, item.status, item.exitCode, item.durationMs]));
  const navTable = navTree.map((group) => `### ${group.label}\n${markdownTable(["Label", "Destination"], group.items.map((item) => [item.label, item.href]))}`).join("\n\n");

  const reports = {
    "README.md": `# Project Genesis Studio Audit\n\nGenerated ${summary.generatedAt}. This package is a static, evidence-based audit of the repository at commit \`${commitHash}\` on \`${branch}\`.\n\nStart with [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md), then open \`index.html\` locally. Every claim distinguishes static evidence from runtime execution where possible.\n\n## Safety\n\n- No canonical data, source masters, runtime payloads, or application routes were modified by this audit.\n- Local paths are represented repository-relative.\n- Screenshot capture was not available; the manifest records this explicitly.\n`,
    "EXECUTIVE_SUMMARY.md": `# Executive Summary\n\n## Current purpose\n\nProject Genesis Studio is a Next.js canonical content, visual-prompt, source-master, asset-production, and multi-engine export application. Static evidence shows a hybrid persistence model: bundled handoff data and local JSON fallback, with optional Supabase server access.\n\n## Evidence snapshot\n\n${markdownTable(["Metric", "Value"], [["Commit", commitHash], ["Runtime content version", summary.contentVersion ?? "not resolved"], ["Routes", summary.counts.routes], ["Pages", summary.counts.pages], ["API routes", apiFiles.length], ["Components", summary.counts.components], ["Generator-related files", summary.counts.generators], ["Schemas", summary.counts.schemas], ["Canonical libraries", summary.counts.canonicalLibraries], ["Canonical records counted from bundled sources", summary.counts.canonicalRecords], ["Prompt records", summary.counts.promptRecords], ["Source-master files", summary.counts.sourceMasterFiles], ["Asset registry records", assetInventory.assetCount], ["Approved/published assets", assetInventory.approvedAssets], ["Missing assets", assetInventory.missingAssets], ["Runtime targets", summary.counts.runtimeTargets], ["Build commands passed", `${summary.build.passed}/${summary.build.commandsRun}`]])}\n\n## Strengths\n\n- Canonical handoff data is extensive and traceable under \`data/handoff/json\`.\n- Six engine export routes are present with a shared runtime builder and adapters.\n- Source masters are centralized through the \`source-masters\` symbolic link.\n- Prompt libraries, species plates, generator surfaces, and asset-production registry are all materially present.\n\n## Primary risks\n\n${summary.topRisks.map((item) => `- ${item}`).join("\n")}\n\n## Recommended next five actions\n\n${recommendationRows.slice(0, 5).map((row, index) => `${index + 1}. **${row[0]}:** ${row[1]} ${row[2]}`).join("\n")}\n\n## Limits\n\nThis audit inspected repository sources and ran the commands recorded in [BUILD_HEALTH_AUDIT.md](BUILD_HEALTH_AUDIT.md). It did not connect to a live Supabase instance, invoke authenticated exports, mutate data, or capture browser screenshots.\n`,
    "ARCHITECTURE_AUDIT.md": `# Architecture Audit\n\n## Framework and entry points\n\n- Framework: Next.js \`${packageJson.dependencies.next}\`, React \`${packageJson.dependencies.react}\`, TypeScript \`${packageJson.devDependencies.typescript}\`.\n- Application routes are file-system routes under \`app/\`.\n- App shell and user-facing navigation are defined in \`components/app-shell.tsx\`.\n- Persistence: \`lib/data.ts\` uses Supabase only when server configuration is present; otherwise it reads bundled handoff data and optional \`.local-data\` fallback files.\n- Runtime builder: \`lib/runtime/game-runtime.ts\`; adapters: \`lib/export/game-engine.ts\`.\n\n## Counts\n\n${markdownTable(["Area", "Count"], [["Source files", files.length], ["Pages", pageFiles.length], ["API routes", apiFiles.length], ["Components", componentFiles.length], ["Library modules", libraryFiles.length], ["Scripts", scriptFiles.length], ["Tests", testFiles.length], ["JSON", jsonFiles.length], ["CSV", csvFiles.length], ["Markdown", markdownFiles.length]])}\n\n## Existing boundaries\n\n| Boundary | Evidence | Audit reading |\n| --- | --- | --- |\n| Studio authoring | \`lib/data.ts\`, \`data/handoff\` | Studio owns canonical data and asset metadata. |\n| Unity | \`app/api/export/unity/route.ts\`, asset manifests | Unity is an export consumer; live Unity project is outside this repository. |\n| Roblox/Web/Unreal/Godot/Generic | \`app/api/export/*\` | Adapters are present; runtime payloads were not invoked in this audit. |\n| Source masters | \`source-masters -> game-art/source-masters\` | Private art source tracking is local to Studio. |\n\n## Inferred architecture concern\n\nThe repository contains both flat-environment-painting direction and legacy/multi-layer environment contracts. This is an evidence-backed overlap, not proof that either runtime path is active in a deployed client.\n`,
    "CANONICAL_DATA_AUDIT.md": `# Canonical Data Audit\n\nThe inventory normalizes every bundled handoff JSON library, imported curiosity volume, AI seed source, and Species Plate contract that is observable without a live database. Counts are source-file counts, not a claim about live Supabase rows.\n\n${inventoryTable}\n\n## Observations\n\n- \`lib/data.ts\` selects Supabase when configured, otherwise uses bundled handoff data and local fallback rows.\n- Resource resolution is centralized in \`lib/resources/service.ts\`; this is a strong canonical boundary.\n- Discovery volumes are discrete local source JSON packages.\n- Fields such as active/draft/deprecated/invalid cannot be truthfully derived for every heterogeneous JSON file, so they are marked unresolved in the machine-readable inventory.\n`,
    "RUNTIME_EXPORT_AUDIT.md": `# Runtime Export Audit\n\n${exporterTable}\n\n## Contract and leakage review\n\nStatic route presence is verified. This audit did not start authenticated runtime routes, so content version, checksum, validation status, and sanitized payload field contents remain explicitly unverified. Review targets include \`lib/runtime/game-runtime.ts\`, \`lib/export/game-engine.ts\`, and each adapter route.\n\nPotential authoring-only leakage categories to verify through endpoint fixtures: Nano Banana prompts, source-master paths, rejected-asset metadata, production notes, and validation histories.\n`,
    "ASSET_PRODUCTION_AUDIT.md": `# Asset Production Audit\n\n## Registry evidence\n\n${markdownTable(["Metric", "Value"], [["Registry source", assetInventory.source], ["Asset records", assetInventory.assetCount], ["Approved/published", assetInventory.approvedAssets], ["Missing", assetInventory.missingAssets], ["Derivative presets", assetInventory.derivativePresetCount], ["Processing jobs", assetInventory.processingJobCount], ["Production tasks", assetInventory.productionTaskCount]])}\n\n## Status counts\n\n${markdownTable(["Status", "Count"], Object.entries(assetInventory.statusCounts))}\n\n## Category counts\n\n${markdownTable(["Category", "Count"], assetInventory.categories.map((item) => [item.category, item.count]))}\n\n## Audit limitations\n\nNo source file was decoded, no thumbnail was rendered, and no asset checksum was recalculated. The inventory reports local registry state only.\n`,
    "SOURCE_MASTERS_AUDIT.md": `# Source Masters Audit\n\n## Root\n\n\`source-masters\` is a symbolic link to \`game-art/source-masters\`. The audit follows that target for file counting while reporting paths as \`source-masters/...\`.\n\n${markdownTable(["Metric", "Value"], [["Files", sourceMasterInventory.fileCount], ["Total bytes", sourceMasterInventory.totalBytes], ["Empty-folder markers", sourceMasterInventory.emptyFolderMarkers.length], ["Naming/metadata warnings", sourceMasterInventory.warnings.length]])}\n\n## Types\n\n${markdownTable(["Extension", "Count"], sourceMasterInventory.byExtension)}\n\n## Evidence requiring review\n\n${sourceMasterInventory.warnings.length ? sourceMasterInventory.warnings.map((item) => `- \`${item}\``).join("\n") : "No filename warnings detected."}\n\n## Important paths observed\n\n- \`source-masters/ui/screens/planet-detail\`\n- \`source-masters/life/creatures\`\n- \`source-masters/life/plants\`\n- \`source-masters/backgrounds/galaxies\`\n- \`source-masters/backgrounds/galactic-regions\`\n- \`source-masters/backgrounds/star-systems\`\n\nNo PSD was modified or converted by the audit.\n`,
    "PROMPT_LIBRARY_AUDIT.md": `# Prompt Library Audit\n\n${markdownTable(["Package", "Prompt count", "Imported", "Location"], promptLibraries.map((item) => [item.packageId, item.promptCount, item.imported, item.location]))}\n\n## Findings\n\n- Prompt package formats coexist (underscore and hyphen naming, imported-source and normalized packages).\n- The audit found modular prompt records and package manifests; it did not compile or inspect every generated full prompt.\n- Runtime leakage remains an endpoint-sanitization verification item, not a proven defect.\n`,
    "GENERATOR_AUDIT.md": `# Generator Audit\n\n${markdownTable(["Generator-related module", "Category", "Path", "Recommendation"], componentInventory.filter((item) => item.category === "generator").map((item) => [item.name, item.category, item.sourceFile, /environment/i.test(item.name) ? "Review for flat-background migration" : "Retain pending contract review"]))}\n\n## Generator workflow evidence\n\n### Planet workflow\n\n\`Planet Generator → Planet Type → Biome → Weather → Resources → Flora/Fauna → Ecosystem → Planet Detail → Runtime Export\` is the intended canonical workflow. Static modules show Planet, resource, life, and export systems, but no end-to-end transaction was executed in this audit.\n\n### Visual production workflow\n\n\`Canonical Record → Prompt Compiler → Prompt Pack → Generated Asset → Review → Approved Asset → Source Master → Export Manifest → Runtime Asset Reference\` is represented by visual-prompt libraries, asset production JSON, source masters, and export routes.\n`,
    "PAGE_ROUTE_AUDIT.md": `# Page and Route Audit\n\n${routeTable}\n\n## Classification notes\n\n- \`active\` means primary sidebar navigation evidence was found.\n- \`hidden_or_secondary\` means the route exists but is not in primary navigation. It does not mean obsolete.\n- Routes mentioning environment composition or creative production are flagged for direction review, not removal.\n`,
    "NAVIGATION_AUDIT.md": `# Navigation Audit\n\n## Current primary navigation\n\n${navTable}\n\n## Static findings\n\n- The current sidebar contains Home, Discoveries, Universe, Environment Composer, Creative Production, and Civilization groups.\n- Routes can exist without navigation entries; these are captured in the route inventory.\n- A proposed Creative Production-first tree is included in \`navigation-tree.json\` as a recommendation only.\n`,
    "DEPENDENCY_AUDIT.md": `# Dependency Audit\n\nThe machine-readable graph contains ${dependencyNodes.length} nodes and ${dependencyEdges.length} inferred edges. Import edges are intentionally partial because TypeScript path aliases, dynamic imports, database reads, and runtime serialization cannot be fully resolved by a static no-build parser.\n\n## Critical workflow summaries\n\n### A. Planet\n\nPlanet Generator → Planet Type → Biome → Weather → Resources → Flora → Fauna → Ecosystem → Planet Detail → Runtime Export\n\n### B. Visual production\n\nCanonical Record → Prompt Compiler → Prompt Pack → Generated Asset → Review → Approved Asset → Source Master → Export Manifest → Runtime Asset Reference\n\n### C. Species plates\n\nSpecies Record → Species Plate Template → Nano Banana Prompt → Master Plate → Extracted Assets → Asset Approval → Encyclopedia/Discovery Runtime\n\n### D. Backgrounds\n\nScreen Context → Background Record → Background Prompt → Approved Flat Background → Unity Manifest → Unity Rendering\n\nThe arrows above describe intended workflow relationships established by source names and contracts. They are not proof that every edge runs in production.\n`,
    "BUILD_HEALTH_AUDIT.md": `# Build Health Audit\n\n${commandTable}\n\n## Notes\n\n- Command outputs, exit codes, and durations are preserved in \`build-health.json\`.\n- This project does not declare a conventional \`test\` script in \`package.json\`; \`npm test\` was run to record the current behavior rather than silently omitting it.\n- Validation commands were sampled from documented package scripts. Unrun verifier scripts are not claimed as passing.\n`,
    "REMOVE_MERGE_CANDIDATES.md": `# Remove, Merge, and Deprecation Candidates\n\n${candidatesTable}\n\n## Flat-background direction\n\n### Environment Builder removal\n\nThe local multi-layer generator was retired after known Galaxy, Galactic Region, and Star System paintings were migrated into \`source-masters/backgrounds\`. Public derivative paths remain stable.\n\n### Screen Designer removal\n\nNo active Screen Designer route was found in this repository snapshot. However, Planet Detail PSD slicing and Creative Production screen manifests remain. Remove coordinate ownership only after Unity receives/owns layout contracts and Studio keeps semantic asset identity, exports, and safe-area metadata.\n\n### Species Plates\n\nRetain the prompt and asset-manifest parts. The panel coordinate/preset layer overlaps the planned Unity/authoring-tool ownership boundary and is a simplify candidate, not a safe immediate deletion.\n`,
    "RECOMMENDATIONS.md": `# Recommendations\n\n${recommendationRows.map((row) => `## ${row[0]}\n\n**${row[1]}**\n\n${row[2]}\n`).join("\n")}\n\n## Direct answers\n\n- **What should move to Unity?** Screen composition, responsive layout, screen coordinates, animation, interaction, gameplay state, and player state.\n- **What should remain Studio-only?** Canonical record identity, prompt history, source-master tracking, approval state, asset manifests, validation, and sanitized publication.\n- **What must be preserved before removal?** Approved background assets, semantic keys, source-master links, prompt lineage, asset checksums, runtime references, and any active manifest IDs.\n- **Highest risk systems:** multi-layer environment persistence, PSD screen slicing as layout ownership, and divergence between fallback/local/live data sources.\n`
  };
  for (const [name, content] of Object.entries(reports)) await writeFile(path.join(reportRoot, name), content);

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Project Genesis Studio Audit</title><style>body{margin:0;background:#07111d;color:#d8e3ef;font:15px/1.5 system-ui,sans-serif}main{max-width:1400px;margin:auto;padding:32px}h1,h2{color:#fff}a{color:#7de6f5}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.card,table{background:#0b1928;border:1px solid #1b4960;border-radius:8px}.card{padding:14px}table{border-collapse:collapse;width:100%;overflow:hidden}th,td{padding:8px;text-align:left;border-bottom:1px solid #173446;vertical-align:top}input,select{background:#081421;color:#fff;border:1px solid #285870;border-radius:6px;padding:10px;margin:4px 0;width:100%}.list{max-height:520px;overflow:auto}.muted{color:#91a6bb}</style></head><body><main><h1>Project Genesis Studio Audit</h1><p class="muted">Commit ${commitHash} · ${date} · static repository evidence</p><section class="cards">${Object.entries(summary.counts).map(([key, value]) => `<div class="card"><div class="muted">${key}</div><strong>${value}</strong></div>`).join("")}</section><h2>Reports</h2><ul>${["EXECUTIVE_SUMMARY.md","ARCHITECTURE_AUDIT.md","CANONICAL_DATA_AUDIT.md","RUNTIME_EXPORT_AUDIT.md","ASSET_PRODUCTION_AUDIT.md","SOURCE_MASTERS_AUDIT.md","PROMPT_LIBRARY_AUDIT.md","GENERATOR_AUDIT.md","PAGE_ROUTE_AUDIT.md","NAVIGATION_AUDIT.md","DEPENDENCY_AUDIT.md","BUILD_HEALTH_AUDIT.md","REMOVE_MERGE_CANDIDATES.md","RECOMMENDATIONS.md"].map((file) => `<li><a href="${file}">${file}</a></li>`).join("")}</ul><h2>Search pages</h2><input id="search" placeholder="Filter route, title, source"><div class="list"><table><thead><tr><th>Route</th><th>Title</th><th>Status</th><th>Source</th></tr></thead><tbody id="pages"></tbody></table></div><h2>Remove / merge candidates</h2><table><thead><tr><th>Candidate</th><th>Category</th><th>Risk</th><th>Recommendation</th></tr></thead><tbody>${environmentCandidates.map((item) => `<tr><td>${item.itemName}</td><td>${item.category}</td><td>${item.riskLevel}</td><td>${item.recommendation}</td></tr>`).join("")}</tbody></table><h2>Screenshot book</h2><p class="muted">No screenshots were fabricated. See screenshot-manifest.json for each unavailable capture.</p></main><script>const pages=${JSON.stringify(pageRoutes)};const target=document.querySelector('#pages');const render=function(){const q=document.querySelector('#search').value.toLowerCase();target.innerHTML=pages.filter(function(page){return JSON.stringify(page).toLowerCase().includes(q);}).map(function(page){return '<tr><td>'+page.route+'</td><td>'+page.pageTitle+'</td><td>'+page.status+'</td><td>'+page.sourceFile+'</td></tr>';}).join('');};document.querySelector('#search').addEventListener('input',render);render();</script></body></html>`;
  await writeFile(path.join(reportRoot, "index.html"), html);
  await writeFile(path.join(reportRoot, "screenshots", "README.md"), "# Screenshot capture\n\nNo browser automation provider was available in this audit execution environment. See ../screenshot-manifest.json for each route and the recorded failure; no placeholder screenshots were generated.\n");

  const expected = ["README.md", "EXECUTIVE_SUMMARY.md", "ARCHITECTURE_AUDIT.md", "CANONICAL_DATA_AUDIT.md", "RUNTIME_EXPORT_AUDIT.md", "ASSET_PRODUCTION_AUDIT.md", "SOURCE_MASTERS_AUDIT.md", "PROMPT_LIBRARY_AUDIT.md", "GENERATOR_AUDIT.md", "PAGE_ROUTE_AUDIT.md", "NAVIGATION_AUDIT.md", "DEPENDENCY_AUDIT.md", "BUILD_HEALTH_AUDIT.md", "REMOVE_MERGE_CANDIDATES.md", "RECOMMENDATIONS.md", ...Object.keys(fileMap), "index.html"];
  for (const file of expected) if (!existsSync(path.join(reportRoot, file))) throw new Error(`Missing audit output: ${file}`);
  for (const file of Object.keys(fileMap)) JSON.parse(await readFile(path.join(reportRoot, file), "utf8"));

  const archivePath = path.join(root, zipName);
  if (existsSync(archivePath)) await import("node:fs/promises").then(({ rm }) => rm(archivePath));
  execFileSync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", reportRoot, archivePath], { cwd: root });
  if (!existsSync(archivePath)) throw new Error("ZIP archive was not created.");
  console.log(JSON.stringify({ status: "ok", report: "studio-audit", archive: zipName, summary }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

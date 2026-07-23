import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const destinationRoot = path.join(projectRoot, "game-art", "source-masters");
const apply = process.argv.includes("--apply");
const canonicalDirectories = [
  "icons", "ui", "legacy", "testing",
  "planets/terrestrial", "planets/gas-giants", "planets/ice", "planets/lava", "planets/ocean", "planets/desert", "planets/toxic", "planets/barren", "planets/atmospheres", "planets/clouds", "planets/rings", "planets/moons",
  "stars/yellow", "stars/blue", "stars/red", "stars/white", "stars/neutron", "stars/giant", "stars/binary", "stars/coronas", "stars/glows", "stars/surface-noise",
  "environments/universe/backgrounds", "environments/universe/galaxies", "environments/universe/cosmic-web", "environments/universe/haze", "environments/universe/dust", "environments/universe/light-rays",
  "environments/galaxy/backgrounds", "environments/galaxy/spiral-arms", "environments/galaxy/core-glow", "environments/galaxy/dust-lanes", "environments/galaxy/nebulas", "environments/galaxy/star-clouds", "environments/galaxy/particles",
  "environments/sector/backgrounds", "environments/sector/deep-stars", "environments/sector/clusters", "environments/sector/nebulas", "environments/sector/dust", "environments/sector/haze", "environments/sector/particles",
  ...["01_far-stars", "02_mid-stars", "03_rear-nebulas", "04_front-nebulas", "05_haze", "06_dust", "07_light-rays", "08_foreground-dust", "09_particles", "10_vignettes", "11_fog", "12_masks"].map((folder) => `environments/star-system/${folder}`),
  "environments/planet-surface/skies", "environments/planet-surface/mountains", "environments/planet-surface/terrain", "environments/planet-surface/vegetation", "environments/planet-surface/clouds", "environments/planet-surface/weather", "environments/planet-surface/fog", "environments/planet-surface/particles",
  "environments/settlements/backgrounds", "environments/settlements/skyline", "environments/settlements/atmosphere", "environments/settlements/lighting", "environments/settlements/particles",
  "effects/selection", "effects/discovery", "effects/ping", "effects/glows", "effects/flares", "effects/fog", "effects/orbit-lines", "effects/ui-overlays",
  "exports/unity", "exports/roblox", "exports/web", "exports/thumbnails"
];

const sourceGroups = [
  { root: path.join(projectRoot, "planet-renders"), kind: "planets" },
  { root: "/Users/geofftracy/Projects/neo-city-tycoon/Icons/Science", kind: "research-icons" },
  { root: "/Users/geofftracy/Projects/neo-city-tycoon/Icons/Technology", kind: "technology-icons" },
  { root: "/Users/geofftracy/Projects/neo-city-tycoon/Raw Art Files", kind: "raw-ui" },
  { root: "/Users/geofftracy/Projects/neo-city-tycoon/Roblox/assets", kind: "roblox-legacy" },
  { root: "/Users/geofftracy/Projects/neo-city-tycoon/UI", kind: "ui" },
  { root: path.join(projectRoot, "public", "uploads", "project-genesis-assets"), kind: "testing" },
];

const rawUiDestinations = new Map([
  ["click.psd", "ui/components/click-control/click.psd"],
  ["event background.psd", "ui/screens/events/event-background.psd"],
  ["event layer 2 background.psd", "ui/screens/events/event-layer-02-background.psd"],
  ["folder tabs.psd", "ui/components/upgrades/folder-tabs.psd"],
  ["leaderboard main.psd", "ui/screens/leaderboard/leaderboard-main.psd"],
  ["menu template.psd", "ui/screens/templates/menu-template.psd"],
  ["objective overlay.psd", "ui/components/objectives/objective-overlay.psd"],
  ["objective overlay 2.psd", "ui/components/objectives/objective-overlay-02.psd"],
  ["research screen.psd", "ui/screens/research/research-screen.psd"],
  ["screen main template 1920x1080.psd", "ui/screens/templates/screen-main-1920x1080.psd"],
  ["screen main template 1920x1280.psd", "ui/screens/templates/screen-main-1920x1280.psd"],
  ["upgrade button.psd", "ui/components/upgrades/upgrade-button.psd"],
  ["alignment background.psd", "ui/screens/alignment/alignment-background.psd"],
]);

function normalizeName(value) {
  return value
    .replace(/crysal/gi, "crystal")
    .replace(/saphire/gi, "sapphire")
    .replace(/industral/gi, "industrial")
    .replace(/civilzation/gi, "civilization")
    .replace(/iInfrastructure/g, "infrastructure")
    .replace(/aI(?=\.)/g, "ai")
    .replace(/_/g, "-")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function legacyStage(filename) {
  return filename.match(/icon-([a-z]+)-/i)?.[1]?.toLowerCase() ?? "shared";
}

function destinationFor(group, sourcePath) {
  const relative = path.relative(group.root, sourcePath);
  const filename = path.basename(sourcePath);

  if (group.kind === "planets") {
    const segments = relative.split(path.sep).map(normalizeName);
    return path.join("planets", ...segments);
  }
  if (group.kind === "research-icons") {
    return path.join("icons", "research", legacyStage(normalizeName(filename)), normalizeName(filename));
  }
  if (group.kind === "technology-icons") {
    if (/master sheet/i.test(filename)) return path.join("icons", "technology", "master-sheets", normalizeName(filename));
    return path.join("icons", "technology", legacyStage(normalizeName(filename)), normalizeName(filename));
  }
  if (group.kind === "raw-ui") {
    return rawUiDestinations.get(filename.toLowerCase()) ?? path.join("ui", "unclassified", normalizeName(filename));
  }
  if (group.kind === "ui") {
    return path.join("ui", "navigation", normalizeName(filename));
  }
  if (group.kind === "testing") {
    return path.join("testing", normalizeName(path.basename(path.dirname(path.dirname(sourcePath)))), normalizeName(filename));
  }

  if (filename.toLowerCase() === "event button.psd") {
    return path.join("ui", "components", "events", "event-button-legacy.psd");
  }
  return path.join("legacy", "unclassified", "roblox", normalizeName(filename));
}

async function collectPsdFiles(root) {
  if (!existsSync(root)) return [];
  const results = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (/\.(psd|psb)$/i.test(entry.name)) results.push(absolute);
    }
  }
  await walk(root);
  return results;
}

async function checksum(filePath) {
  const { createReadStream } = await import("node:fs");
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(filePath).on("data", (chunk) => hash.update(chunk)).on("error", reject).on("end", () => resolve(hash.digest("hex")));
  });
}

const planned = [];
for (const group of sourceGroups) {
  for (const sourcePath of await collectPsdFiles(group.root)) {
    if (sourcePath.startsWith(destinationRoot)) continue;
    const relativeDestination = destinationFor(group, sourcePath);
    planned.push({ group: group.kind, sourcePath, relativeDestination, destinationPath: path.join(destinationRoot, relativeDestination) });
  }
}

planned.sort((a, b) => a.relativeDestination.localeCompare(b.relativeDestination));
const duplicateDestinations = planned.filter((record, index) => planned.findIndex((candidate) => candidate.destinationPath === record.destinationPath) !== index);
if (duplicateDestinations.length > 0) {
  throw new Error(`Duplicate destinations:\n${duplicateDestinations.map((record) => record.relativeDestination).join("\n")}`);
}

if (!apply) {
  console.log(JSON.stringify({ mode: "preview", count: planned.length, destinationRoot, files: planned.map(({ group, sourcePath, relativeDestination }) => ({ group, sourcePath, relativeDestination })) }, null, 2));
  process.exit(0);
}

await mkdir(destinationRoot, { recursive: true });
await Promise.all(canonicalDirectories.map((directory) => mkdir(path.join(destinationRoot, directory), { recursive: true })));
const manifest = [];
for (const record of planned) {
  const details = await stat(record.sourcePath);
  const sha256 = await checksum(record.sourcePath);
  let migrationMode = "verified-copy";
  if (existsSync(record.destinationPath)) {
    const destinationChecksum = await checksum(record.destinationPath);
    if (destinationChecksum !== sha256) throw new Error(`Destination conflict: ${record.destinationPath}`);
    migrationMode = "already-centralized";
  } else {
    await mkdir(path.dirname(record.destinationPath), { recursive: true });
    await copyFile(record.sourcePath, record.destinationPath);
  }
  manifest.push({
    group: record.group,
    originalPath: record.sourcePath,
    canonicalPath: path.relative(projectRoot, record.destinationPath),
    filename: path.basename(record.destinationPath),
    bytes: details.size,
    sha256,
    migrationMode,
    migratedAt: new Date().toISOString(),
  });
  console.log(`${migrationMode === "verified-copy" ? "Copied" : "Verified"} ${record.sourcePath} -> ${record.destinationPath}`);
}

await writeFile(path.join(destinationRoot, "manifest.local.json"), `${JSON.stringify({ schemaVersion: "2.0.0", sourceMasterRoot: "game-art/source-masters", generatedAt: new Date().toISOString(), count: manifest.length, files: manifest }, null, 2)}\n`);
console.log(`Organized ${manifest.length} verified source-master copies in ${destinationRoot}`);

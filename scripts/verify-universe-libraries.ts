import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getUniverseLibraryData, getUniverseLibrarySource, isGeneratedGameRecord } from "@/lib/universe/library";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

const libraryRoutes = [
  "app/galaxy/page.tsx",
  "app/sector-map/page.tsx",
  "app/star-system-map/page.tsx",
  "app/celestial-bodies/page.tsx",
  "app/planets/page.tsx",
  "app/discovery-journal/page.tsx",
  "app/civilizations/page.tsx"
];

const forbiddenLibraryUi = [
  "Progression Gates",
  "Research Unlock Matrix",
  "Discovery Points",
  "Scanned Systems",
  "Complete Research",
  "Technology unlocks",
  "Research requirements",
  "Sector Scanning",
  "Planet Scanning",
  "Star System Scanning",
  "Planet Claim",
  "Colony Claim",
  "Colonization",
  "Intergalactic Travel",
  "InteractiveGalaxyMap",
  "ReferenceScreenWorkflow",
  "ProgressionGatePanel"
];

function assertNoForbiddenUi(relativePath: string) {
  const content = read(relativePath);
  for (const term of forbiddenLibraryUi) {
    assert(!content.includes(term), `${relativePath} still contains non-library UI term: ${term}`);
  }
}

function main() {
  const component = read("components/generated-universe-library.tsx");
  const packageJson = JSON.parse(read("package.json")) as { scripts?: Record<string, string>; dependencies?: Record<string, string> };
  const source = getUniverseLibrarySource();
  const data = getUniverseLibraryData();

  for (const route of libraryRoutes) {
    assert(existsSync(path.join(process.cwd(), route)), `Library route is missing: ${route}`);
    assertNoForbiddenUi(route);
    assert(read(route).includes("GeneratedUniverseLibrary"), `${route} must render the shared generated-record library.`);
  }

  assertNoForbiddenUi("components/generated-universe-library.tsx");
  assert(component.includes("GeneratedLibraryCard"), "Shared library cards must use the GeneratedLibraryCard component.");
  assert(component.includes("records.length"), "Shared library must report record counts from canonical sources.");
  assert(!existsSync(path.join(process.cwd(), "components/interactive-galaxy-map.tsx")), "Interactive Galaxy map must not exist in Studio libraries.");
  assert(!packageJson.scripts?.["verify:galaxy-map"], "Old Galaxy map verifier script must be removed.");
  assert(packageJson.scripts?.["verify:universe-libraries"], "Universe library verifier script must be registered.");
  for (const dependency of ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing", "postprocessing"]) {
    assert(!packageJson.dependencies?.[dependency], `${dependency} must not be required for Studio library pages.`);
  }

  assert(data.galaxies.length === 1, `Galaxy Library should expose only current generated galaxies; received ${data.galaxies.length}.`);
  assert(data.galaxies[0]?.name === "Milky Way", "Galaxy Library must expose Milky Way as the current generated galaxy.");
  assert(data.sectors.length === 1, `Sector Library should expose only the generated Local Bubble sector; received ${data.sectors.length}.`);
  assert(data.starSystems.length > 0, "Star System Library must expose generated star-system records.");
  assert(data.stars.length > 0, "Star Library must expose generated star records.");
  assert(data.planets.length > 0, "Planet Library must expose eligible celestial body records.");
  assert(data.discoveries.length > 0, "Discovery Library must expose canonical discovery records.");
  assert(data.civilizations.length > 0, "Civilization Library must expose generated civilization/faction records.");

  const records = [
    ...data.galaxies,
    ...data.sectors,
    ...data.starSystems,
    ...data.stars,
    ...data.planets,
    ...data.discoveries,
    ...data.civilizations
  ];
  const ids = new Set<string>();
  for (const record of records) {
    assert(record.id.trim().length > 0, `${record.name} is missing a stable canonical ID.`);
    assert(record.href.includes(encodeURIComponent(record.id)), `${record.id} card does not link to its canonical record.`);
    assert(!ids.has(record.id), `Duplicate library record ID: ${record.id}`);
    ids.add(record.id);
  }

  for (const sector of source.sectors) {
    assert(isGeneratedGameRecord(sector as unknown as Record<string, unknown>, "sectors", source), `Sector parent relationship is unresolved: ${sector.id}`);
  }
  for (const system of source.starSystems) {
    assert(isGeneratedGameRecord(system as unknown as Record<string, unknown>, "star-systems", source), `Star system parent relationship is unresolved: ${system.id}`);
  }
  for (const star of source.stars) {
    assert(isGeneratedGameRecord(star as unknown as Record<string, unknown>, "stars", source), `Star parent relationship is unresolved: ${star.id}`);
  }

  const planetNames = data.planets.map((record) => `${record.name} ${record.id}`.toLowerCase());
  for (const forbidden of ["planetary power grid", "rare earth elements", "planet seed"]) {
    assert(!planetNames.some((value) => value.includes(forbidden)), `Planet Library still includes non-celestial record: ${forbidden}`);
  }

  console.log(JSON.stringify({
    status: "ok",
    counts: {
      galaxies: data.galaxies.length,
      sectors: data.sectors.length,
      starSystems: data.starSystems.length,
      stars: data.stars.length,
      planets: data.planets.length,
      discoveries: data.discoveries.length,
      civilizations: data.civilizations.length
    }
  }, null, 2));
}

main();

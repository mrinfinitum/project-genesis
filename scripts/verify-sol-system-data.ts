import { strict as assert } from "node:assert";
import { canonicalPlanetTypeProfiles, ensurePlanetDeepData, validatePlanetDeepData } from "../lib/planets/deep-data";
import { fixedSolGeneratedPlanets } from "../lib/planets/fixed-sol-planets";
import { requiredCanonicalSolBodyNames, solBodyFactsByName, SOL_SYSTEM_DATA_VERSION } from "../lib/planets/sol-system-data";
import { ResourceService } from "../lib/resources/service";
import { getLocalBubbleSystems } from "../lib/universe/fallback-data";
import { generateCelestialBodies } from "../lib/universe/generator";

const solSystem = getLocalBubbleSystems(1).systems[0];
assert(solSystem, "Sol System must exist.");
assert.equal(getLocalBubbleSystems(1).sector.sector_name, "Orion Spur", "Sol must belong to the Orion Spur Galactic Region.");

const bodies = generateCelestialBodies(solSystem);
const bodyByName = new Map(bodies.map((body) => [body.name, body]));
const bodyIds = new Set(bodies.map((body) => body.id));
assert.equal(bodyIds.size, bodies.length, "Sol body IDs must be unique.");

for (const name of requiredCanonicalSolBodyNames) {
  assert(bodyByName.has(name), `Canonical Sol body ${name} is missing.`);
  assert(solBodyFactsByName(name), `Canonical Sol body ${name} has no authoritative facts profile.`);
}

for (const body of bodies) {
  if (body.parent_body_id) assert(bodyIds.has(body.parent_body_id), `${body.name} references missing parent ${body.parent_body_id}.`);
  for (const resourceName of body.resources) {
    assert(ResourceService.resolveId(resourceName), `${body.name} references missing canonical resource ${resourceName}.`);
  }
}

const primaryPlanets = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
assert(primaryPlanets.every((name) => bodyByName.get(name)?.parent_body_id === "body-sol"), "Every primary planet must orbit Sol.");
assert.equal(bodies.filter((body) => body.celestial_body_type === "Dwarf Planet").length, 5, "Sol must expose the five IAU-recognized dwarf planets.");
assert.equal(bodyByName.get("Moon")?.parent_body_id, "body-earth", "Moon must orbit Earth.");
assert.equal(bodyByName.get("Charon")?.parent_body_id, "body-pluto", "Charon must orbit Pluto.");

const planets = fixedSolGeneratedPlanets();
const planetTypeIds = new Set(canonicalPlanetTypeProfiles.map((profile) => profile.canonicalId));
let canonicalResourceOccurrences = 0;
for (const planet of planets) {
  const deep = ensurePlanetDeepData(planet);
  assert(planetTypeIds.has(deep.planetTypeId), `${planet.name} does not resolve an existing Planet Type.`);
  assert(deep.scientificSources.length > 0, `${planet.name} must publish source metadata.`);
  assert(deep.knowledgeModes.canonicalHumanKnowledgeEnabled, `${planet.name} must support canonical human knowledge mode.`);
  assert(deep.knowledgeModes.gameplayDiscoveryEnabled, `${planet.name} must support gameplay discovery mode.`);
  assert(deep.dataCompleteness.overallPercentage >= 0 && deep.dataCompleteness.overallPercentage <= 100, `${planet.name} completeness is invalid.`);
  if (solBodyFactsByName(planet.name)) {
    assert.equal(deep.simulationRules.profileVersion, SOL_SYSTEM_DATA_VERSION, `${planet.name} must use the canonical Sol override version.`);
    assert(deep.overrides.lockedSections.includes("orbital"), `${planet.name} authoritative orbital facts must be locked.`);
  }
  const errors = validatePlanetDeepData(deep).filter((issue) => issue.severity === "error");
  assert.equal(errors.length, 0, `${planet.name} deep data failed validation: ${errors.map((issue) => issue.code).join(", ")}`);
  canonicalResourceOccurrences += deep.resourceOccurrences.length;
  for (const occurrence of deep.resourceOccurrences) {
    assert(ResourceService.getById(occurrence.resourceId), `${planet.name} occurrence references missing resource ${occurrence.resourceId}.`);
    assert.equal(occurrence.reserveUnit, "not quantified", `${planet.name} must not fabricate reserve quantities.`);
  }
}

const earth = ensurePlanetDeepData(planets.find((planet) => planet.name === "Earth")!);
assert.equal(earth.identity.scientificDesignation, "Sol III", "Earth must publish Sol III.");
assert(earth.life.estimatedSpeciesCount > 0, "Earth must remain the confirmed inhabited reference world.");
assert(earth.scientificSources.some((source) => source.sourceId === "noaa_earth_climate"), "Earth must include NOAA climate sourcing.");

for (const name of ["Mercury", "Moon", "Phobos", "Deimos"]) {
  const planet = planets.find((candidate) => candidate.name === name);
  assert(planet, `${name} must be exported as a fixed Sol planet/body record.`);
  const deep = ensurePlanetDeepData(planet);
  assert.equal(deep.activeEnvironmentRules.conventionalWeather, false, `${name} must not use conventional atmospheric weather.`);
}

for (const name of ["Jupiter", "Saturn", "Uranus", "Neptune"]) {
  const body = bodyByName.get(name);
  assert.equal(body?.landable, false, `${name} must not be represented as a walkable solid-surface planet.`);
  assert.equal(body?.uses_orbital_gameplay, true, `${name} must use orbital gameplay.`);
}

console.log(JSON.stringify({
  status: "Ready",
  systemId: solSystem.id,
  bodyCount: bodies.length,
  planetRecords: planets.length,
  primaryPlanets: primaryPlanets.length,
  dwarfPlanets: bodies.filter((body) => body.celestial_body_type === "Dwarf Planet").length,
  majorMoons: requiredCanonicalSolBodyNames.filter((name) => bodyByName.get(name)?.celestial_body_type === "Moon").length,
  referenceRegions: bodies.filter((body) => body.celestial_body_type === "Small Body Region").length,
  canonicalResourceOccurrences,
  scientificSources: earth.scientificSources.length,
  solDataVersion: SOL_SYSTEM_DATA_VERSION
}, null, 2));

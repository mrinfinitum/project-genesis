import { strict as assert } from "node:assert";
import { PLANET_CLASS_MODEL } from "../lib/planets/class-model";
import {
  buildPlanetDeepDataFramework,
  canonicalPlanetTypeProfiles,
  generatePlanetDeepData,
  planetDataScreenContract,
  validatePlanetDeepData
} from "../lib/planets/deep-data";
import { fixedSolGeneratedPlanets } from "../lib/planets/fixed-sol-planets";
import { ResourceService } from "../lib/resources/service";

function stable(value: unknown) {
  return JSON.stringify(value);
}

const framework = buildPlanetDeepDataFramework();
const samplePlanet = fixedSolGeneratedPlanets().find((planet) => planet.name === "Earth") ?? fixedSolGeneratedPlanets()[0];

assert(samplePlanet, "A canonical Sol planet is required for Planet deep-data verification.");
assert.equal(
  canonicalPlanetTypeProfiles.length,
  PLANET_CLASS_MODEL.length,
  "Every existing canonical Planet Type must have exactly one deep-data extension."
);
assert.equal(
  new Set(canonicalPlanetTypeProfiles.map((profile) => profile.canonicalId)).size,
  canonicalPlanetTypeProfiles.length,
  "Planet Type profile IDs must be unique."
);

for (const definition of PLANET_CLASS_MODEL) {
  const matches = canonicalPlanetTypeProfiles.filter((profile) => profile.displayName === definition.name);
  assert.equal(matches.length, 1, `Planet Type ${definition.name} must resolve exactly one deep-data profile.`);
}

const distributionProfileIds = new Set(framework.resourceDistributionProfiles.map((profile) => profile.profileId));
for (const profile of canonicalPlanetTypeProfiles) {
  assert(profile.defaultResourceDistributionProfileIds.length > 0, `Planet Type ${profile.canonicalId} must resolve at least one Resource Distribution Profile.`);
  for (const distributionProfileId of profile.defaultResourceDistributionProfileIds) {
    assert(distributionProfileIds.has(distributionProfileId), `Planet Type ${profile.canonicalId} references missing Resource Distribution Profile ${distributionProfileId}.`);
  }
}

for (const profile of framework.resourceDistributionProfiles) {
  for (const rule of profile.resourceRules) {
    assert(ResourceService.getById(rule.resourceId), `Resource distribution ${profile.profileId} references missing resource ${rule.resourceId}.`);
  }
}

const first = generatePlanetDeepData(samplePlanet);
const second = generatePlanetDeepData(samplePlanet);
assert.equal(stable(first), stable(second), "The same planet seed must generate identical deep planet data.");

const locked = structuredClone(first);
locked.overrides.lockedSections = ["climate"];
locked.climate.averageGlobalTemperature.value = 999;
locked.climate.averageGlobalTemperature.displayValue = "999 K";
const regenerated = generatePlanetDeepData(samplePlanet, undefined, locked);
assert.equal(regenerated.climate.averageGlobalTemperature.value, 999, "Locked sections must survive deterministic regeneration.");
assert.equal(regenerated.climate.averageGlobalTemperature.displayValue, "999 K", "Locked display values must survive regeneration.");

const invalid = structuredClone(first);
invalid.resourceOccurrences[0] = {
  ...invalid.resourceOccurrences[0],
  resourceId: "resource_missing_contract_test"
};
assert(
  validatePlanetDeepData(invalid).some((issue) => issue.code === "invalid_resource_id" && issue.severity === "error"),
  "Invalid Resource Catalog references must fail Planet validation."
);

const atmosphereTotal = first.atmosphere.composition.reduce((sum, entry) => sum + entry.percentage, 0);
if (first.atmosphere.atmospherePresent) {
  assert(Math.abs(atmosphereTotal - 100) <= 0.01, "Generated atmosphere composition must total 100 percent.");
}
assert.equal(
  validatePlanetDeepData(first).filter((issue) => issue.severity === "error").length,
  0,
  "Generated canonical Planet deep data must be export ready."
);

const invalidUnit = structuredClone(first);
invalidUnit.orbital.eccentricity.unit = "";
assert(
  validatePlanetDeepData(invalidUnit).some((issue) => issue.code === "invalid_scientific_unit" && issue.severity === "error"),
  "Every scientific value must publish a canonical unit, including dimensionless ratios."
);

assert.equal(planetDataScreenContract.layoutOwner, "game-client", "The Game must own Planet Data Screen layout.");
assert.equal(planetDataScreenContract.contentOwner, "studio", "Studio must own Planet Data Screen content contracts.");
assert.equal(planetDataScreenContract.sections.length, 10, "The Planet Data Screen contract must publish ten canonical sections.");
assert(
  !/(pixel|width|height|xPosition|yPosition|gridTemplate)/i.test(stable(planetDataScreenContract)),
  "Planet Data Screen contracts must not publish client layout coordinates."
);

console.log(
  JSON.stringify(
    {
      status: "Ready",
      schemaVersion: framework.schemaVersion,
      generationVersion: framework.generationVersion,
      planetTypeProfiles: framework.planetTypeProfiles.length,
      resourceDistributionProfiles: framework.resourceDistributionProfiles.length,
      atmosphereProfiles: framework.atmosphereProfiles.length,
      climateProfiles: framework.climateProfiles.length,
      weatherProfiles: framework.weatherProfiles.length,
      seasonProfiles: framework.seasonProfiles.length,
      biomeProfiles: framework.biomeProfiles.length,
      geologyProfiles: framework.geologyProfiles.length,
      hydrosphereProfiles: framework.hydrosphereProfiles.length,
      hazardProfiles: framework.hazardProfiles.length,
      samplePlanet: samplePlanet.id,
      sampleResourceOccurrences: first.resourceOccurrences.length,
      planetDataScreenSections: planetDataScreenContract.sections.length
    },
    null,
    2
  )
);

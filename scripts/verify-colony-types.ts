import { validateColonizationFramework } from "@/lib/colonization/framework";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import type { ColonyTypeId } from "@/types/runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const framework = runtime.colonizationFramework;
  const issues = validateColonizationFramework(framework);
  const errors = issues.filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `Colonization framework validation errors: ${errors.map((issue) => issue.code).join(", ")}`);

  const types = new Map(framework.colonyTypeDefinitions.map((type) => [type.id, type]));
  const requiredTypes = ["primary_colony", "secondary_colony", "frontier_colony", "mining_colony", "research_colony", "agricultural_colony", "industrial_colony", "trade_colony", "logistics_hub", "orbital_colony", "floating_colony", "subsurface_colony", "fuel_depot", "archaeological_outpost", "preservation_station", "terraforming_base", "automated_outpost"] as const satisfies readonly ColonyTypeId[];
  for (const id of requiredTypes) assert(types.has(id), `Missing colony type ${id}.`);

  const noSolidSurface = new Set(["Gas Giant", "Ice Giant", "Asteroid Belt"]);
  const surfaceTypes = [...types.values()].filter((type) => !["orbital_colony", "floating_colony", "fuel_depot", "preservation_station", "automated_outpost"].includes(type.id));
  for (const type of surfaceTypes) {
    assert(type.supportedBodyClasses.every((bodyClass) => !noSolidSurface.has(bodyClass)), `${type.id} must not support no-solid-surface body class.`);
    assert(type.prohibitedBodyClasses.some((bodyClass) => noSolidSurface.has(bodyClass)), `${type.id} must explicitly prohibit no-solid-surface body classes.`);
  }

  for (const id of ["orbital_colony", "floating_colony", "automated_outpost", "fuel_depot"] as const satisfies readonly ColonyTypeId[]) {
    const type = types.get(id);
    if (!type) throw new Error(`${id} missing.`);
    assert(type.supportedBodyClasses.some((bodyClass) => noSolidSurface.has(bodyClass)), `${id} must support at least one no-solid-surface body class.`);
  }

  for (const type of types.values()) {
    assert(type.allowedActionIds.includes("prepare_colony"), `${type.id} must reference prepare_colony.`);
    assert(type.allowedActionIds.includes("establish_colony"), `${type.id} must reference establish_colony.`);
    assert(type.requiredResources.length > 0, `${type.id} must reference Resource Catalog IDs.`);
    assert(type.defaultDevelopmentFocus, `${type.id} must have a default focus.`);
    assert(type.civilizationIdentityInfluence.alignmentIds.length > 0, `${type.id} must have identity influence.`);
    assert(type.progressionRequirements.length > 0, `${type.id} must have progression requirements.`);
  }

  const futureMilestones = framework.missingCanonicalDefinitions.filter((item) => item.type === "progression_milestone").map((item) => item.id);
  for (const id of ["first_specialized_colony", "first_planetary_capital", "first_self_sustaining_colony", "first_multi_planet_civilization", "first_interstellar_colony"]) {
    assert(futureMilestones.includes(id), `${id} must be reported as a missing/future progression milestone instead of duplicated.`);
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    colonyTypeIds: requiredTypes,
    noSolidSurfaceOptions: ["orbital_colony", "floating_colony", "automated_outpost", "fuel_depot"],
    missingProgressionMilestones: futureMilestones
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

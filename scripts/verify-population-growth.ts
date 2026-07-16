import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, getGameRuntimeData } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertGrowth(framework: Awaited<ReturnType<typeof getGameRuntimeData>>["populationSimulationFramework"], label: string) {
  const requiredGrowthIds = ["biological_base_growth", "capacity_pressure", "synthetic_growth_policy", "migration_pressure_growth"];
  const growthById = new Map(framework.populationGrowthDefinitions.map((definition) => [definition.id, definition]));
  for (const id of requiredGrowthIds) {
    const definition = growthById.get(id);
    assert(definition, `${label} missing growth definition ${id}.`);
    assert(definition.deterministic === true, `${label} growth definition ${id} must be deterministic.`);
    assert(definition.calculationVersion === framework.calculationVersion, `${label} growth definition ${id} must use framework calculationVersion.`);
    assert(definition.inputs.length > 0, `${label} growth definition ${id} must publish inputs.`);
    assert(definition.outputs.length > 0, `${label} growth definition ${id} must publish outputs.`);
    assert(definition.formula.length > 0, `${label} growth definition ${id} must publish formula.`);
    assert(definition.clamps.minGrowthRate <= definition.clamps.maxGrowthRate, `${label} growth definition ${id} clamps are invalid.`);
  }

  const capacityTypes = new Set(framework.populationCapacityDefinitions.map((definition) => definition.capacityType));
  for (const required of ["surface_habitation", "orbital_habitation", "subsurface_habitation", "floating_habitation", "temporary_habitation", "robotic_capacity", "visitor_capacity"]) {
    assert(capacityTypes.has(required as never), `${label} missing capacity type ${required}.`);
  }

  const wellbeingBands = framework.populationWellbeingBands;
  assert(wellbeingBands.length === 6, `${label} must publish six wellbeing bands.`);
  assert(wellbeingBands.some((band) => band.id === "critical" && band.min === 0), `${label} must publish critical wellbeing floor.`);
  assert(wellbeingBands.some((band) => band.id === "exceptional" && band.max === 100), `${label} must publish exceptional wellbeing ceiling.`);

  const needs = new Set(framework.populationNeedDefinitions.map((definition) => definition.id));
  for (const need of ["food", "water", "housing", "energy", "healthcare", "education", "safety", "employment", "environment", "recreation", "social_stability", "transportation", "communication", "purpose", "autonomy"]) {
    assert(needs.has(need), `${label} missing population need ${need}.`);
  }
}

async function main() {
  const runtime = await getGameRuntimeData();
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(runtime);

  assertGrowth(runtime.populationSimulationFramework, "Internal runtime");
  assertGrowth(canonical.populationSimulationFramework, "Canonical public runtime");
  assertGrowth(roblox.populationSimulationFramework, "Roblox runtime");

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    calculationVersion: canonical.populationSimulationFramework.calculationVersion,
    growthDefinitions: canonical.populationSimulationFramework.populationGrowthDefinitions.map((definition) => definition.id),
    capacityDefinitions: canonical.populationSimulationFramework.populationCapacityDefinitions.length,
    needs: canonical.populationSimulationFramework.populationNeedDefinitions.length,
    wellbeingBands: canonical.populationSimulationFramework.populationWellbeingBands.map((band) => band.id)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

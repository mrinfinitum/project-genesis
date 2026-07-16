import { validateResourceEconomyLogisticsFramework } from "@/lib/economy/logistics-framework";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const framework = runtime.resourceEconomyLogisticsFramework;
  const errors = validateResourceEconomyLogisticsFramework(framework).filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `Production chain validation errors: ${errors.map((issue) => issue.code).join(", ")}`);

  const resourceIds = new Set(runtime.resources.map((resource) => resource.id));
  const recipeIds = new Set([...framework.processingRecipeDefinitions, ...framework.manufacturingRecipeDefinitions].map((recipe) => recipe.id));
  const nodeIds = new Set(framework.economyNodeTypeDefinitions.map((node) => node.id));
  const storageIds = new Set(framework.resourceStorageDefinitions.map((storage) => storage.id));
  const transportIds = new Set(framework.transportModeDefinitions.map((transport) => transport.id));
  const conditionIds = new Set(framework.economyConditionStateDefinitions.map((condition) => condition.id));

  assert(framework.productionChainDefinitions.length >= 4, "Expected curated starter production chains.");
  for (const chain of framework.productionChainDefinitions) {
    assert(chain.stages.length > 0, `${chain.id} must publish at least one stage.`);
    for (const stage of chain.stages) {
      assert(recipeIds.has(stage.recipeId), `${chain.id} stage recipe ${stage.recipeId} does not resolve.`);
      for (const id of [...stage.inputResourceIds, ...stage.outputResourceIds]) assert(resourceIds.has(id), `${chain.id} resource ${id} does not resolve.`);
      for (const id of stage.nodeTypeIds) assert(nodeIds.has(id), `${chain.id} node ${id} does not resolve.`);
    }
    for (const id of chain.storageRequirementIds) assert(storageIds.has(id), `${chain.id} storage ${id} does not resolve.`);
    for (const id of chain.transportRequirementIds) assert(transportIds.has(id), `${chain.id} transport ${id} does not resolve.`);
    for (const id of chain.bottleneckDefinitionIds) assert(conditionIds.has(id), `${chain.id} bottleneck ${id} does not resolve.`);
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    chainIds: framework.productionChainDefinitions.map((chain) => chain.id),
    processingRecipes: framework.processingRecipeDefinitions.map((recipe) => recipe.id),
    manufacturingRecipes: framework.manufacturingRecipeDefinitions.map((recipe) => recipe.id),
    provisionalBalanceValues: framework.provisionalBalanceValues
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

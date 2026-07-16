import { validateResourceEconomyLogisticsFramework } from "@/lib/economy/logistics-framework";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const framework = runtime.resourceEconomyLogisticsFramework;
  const errors = validateResourceEconomyLogisticsFramework(framework).filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `Resource flow validation errors: ${errors.map((issue) => issue.code).join(", ")}`);

  const resourceIds = new Set(runtime.resources.map((resource) => resource.id));
  const flowResourceIds = new Set(framework.resourceFlowDefinitions.map((flow) => flow.resourceId));
  assert(flowResourceIds.size === resourceIds.size, `Expected one flow per resource. resources=${resourceIds.size} flows=${flowResourceIds.size}`);
  for (const id of resourceIds) assert(flowResourceIds.has(id), `Missing flow for resource ${id}.`);

  const nodeIds = new Set(framework.economyNodeTypeDefinitions.map((node) => node.id));
  const storageIds = new Set(framework.resourceStorageDefinitions.map((storage) => storage.id));
  const transportIds = new Set(framework.transportModeDefinitions.map((transport) => transport.id));
  const policyIds = new Set(framework.lossAndWastePolicies.map((policy) => policy.id));
  for (const flow of framework.resourceFlowDefinitions) {
    assert(flow.sourceNodeTypes.length > 0, `${flow.id} must have source nodes.`);
    assert(flow.destinationNodeTypes.length > 0, `${flow.id} must have destination nodes.`);
    assert(flow.storageDefinitionIds.length > 0, `${flow.id} must have storage definitions.`);
    assert(flow.transportModeIds.length > 0, `${flow.id} must have transport modes.`);
    for (const id of [...flow.sourceNodeTypes, ...flow.destinationNodeTypes]) assert(nodeIds.has(id), `${flow.id} node ${id} does not resolve.`);
    for (const id of flow.storageDefinitionIds) assert(storageIds.has(id), `${flow.id} storage ${id} does not resolve.`);
    for (const id of flow.transportModeIds) assert(transportIds.has(id), `${flow.id} transport ${id} does not resolve.`);
    assert(policyIds.has(flow.lossPolicyId), `${flow.id} loss policy ${flow.lossPolicyId} does not resolve.`);
    assert(policyIds.has(flow.wastePolicyId), `${flow.id} waste policy ${flow.wastePolicyId} does not resolve.`);
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    resourceCount: resourceIds.size,
    flowCount: framework.resourceFlowDefinitions.length,
    classCounts: framework.resourceFlowDefinitions.reduce<Record<string, number>>((counts, flow) => {
      counts[flow.resourceClass] = (counts[flow.resourceClass] ?? 0) + 1;
      return counts;
    }, {})
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

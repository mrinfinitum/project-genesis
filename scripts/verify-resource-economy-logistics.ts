import { validateResourceEconomyLogisticsFramework } from "@/lib/economy/logistics-framework";
import { buildGameEngineExport, getEngineTargets } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion, getGameRuntimeData } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertFramework(framework: Awaited<ReturnType<typeof getGameRuntimeData>>["resourceEconomyLogisticsFramework"], label: string) {
  const errors = validateResourceEconomyLogisticsFramework(framework).filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `${label} Resource Economy & Logistics errors: ${errors.map((issue) => `${issue.code}:${issue.records.join(",")}`).join("; ")}`);
  assert(framework.id === "resource_economy_logistics_framework_v1", `${label} framework ID mismatch.`);
  assert(framework.architectureDecisionId === "ARCH-DECISION-RESOURCE-ECONOMY-LOGISTICS-NETWORK", `${label} architecture decision mismatch.`);
  assert(framework.activePlayerStatePolicy.exportsPlayerInventories === false, `${label} must not export player inventories.`);
  assert(framework.activePlayerStatePolicy.exportsActiveShipments === false, `${label} must not export active shipments.`);
  assert(framework.resourceFlowDefinitions.length > 250, `${label} must publish a flow for every Resource Catalog item.`);
  assert(framework.economyNodeTypeDefinitions.length === 28, `${label} must publish 28 node types.`);
  assert(framework.resourceExtractionDefinitions.length === 14, `${label} must publish 14 extraction definitions.`);
  assert(framework.resourceStorageDefinitions.length === 16, `${label} must publish 16 storage definitions.`);
  assert(framework.transportModeDefinitions.length === 16, `${label} must publish 16 transport modes.`);
  assert(framework.logisticsRouteDefinitions.length === 13, `${label} must publish 13 route definitions.`);
  assert(framework.shipmentStateDefinitions.length === 14, `${label} must publish 14 shipment states.`);
  assert(framework.throughputDefinitions.every((definition) => definition.bounded === true), `${label} throughput definitions must be bounded.`);
  assert(framework.marketTradeIntegration.every((market) => market.gameOwnsOrders === true), `${label} market orders must remain Game-owned.`);
  assert(framework.colonizationIntegration.requiredRouteDefinitionIds.includes("colonization_supply_route"), `${label} colonization supply route missing.`);
  assert(framework.aiAutomationRules.every((rule) => !/bypass capacity|create resources|spend Premium Crystals automatically/i.test(rule) || /may not|cannot|never/.test(rule)), `${label} AI automation safety rule missing.`);
  assert(!/"(?:playerInventories|activeShipments|marketOrders|liveStockpiles|routeInstances|transportAssignments)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} leaked player state or private paths.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 29, `Runtime contentVersion must be at least 29; received ${gameRuntimeContentVersion}.`);
  const runtime = await getGameRuntimeData();
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(runtime);

  assertFramework(runtime.resourceEconomyLogisticsFramework, "Internal runtime");
  assertFramework(canonical.resourceEconomyLogisticsFramework, "Canonical public runtime");
  assertFramework(roblox.resourceEconomyLogisticsFramework, "Roblox runtime");
  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must remain Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must remain Ready; received ${roblox.metadata.validationStatus}.`);

  const engineSummaries = [];
  for (const target of getEngineTargets()) {
    const exportPayload = await buildGameEngineExport(target.id);
    const framework = exportPayload.canonical.resource_economy_logistics_framework as typeof runtime.resourceEconomyLogisticsFramework;
    assertFramework(framework, `${target.label} export`);
    assert(exportPayload.validation.status === "Ready", `${target.label} export must remain Ready; received ${exportPayload.validation.status}.`);
    engineSummaries.push({ target: target.id, status: exportPayload.validation.status, resourceFlows: framework.resourceFlowDefinitions.length, routes: framework.logisticsRouteDefinitions.length });
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    frameworkId: canonical.resourceEconomyLogisticsFramework.id,
    resourceFlows: canonical.resourceEconomyLogisticsFramework.resourceFlowDefinitions.length,
    nodeTypes: canonical.resourceEconomyLogisticsFramework.economyNodeTypeDefinitions.length,
    extractionDefinitions: canonical.resourceEconomyLogisticsFramework.resourceExtractionDefinitions.length,
    storageDefinitions: canonical.resourceEconomyLogisticsFramework.resourceStorageDefinitions.length,
    transportModes: canonical.resourceEconomyLogisticsFramework.transportModeDefinitions.length,
    routes: canonical.resourceEconomyLogisticsFramework.logisticsRouteDefinitions.length,
    shipmentStates: canonical.resourceEconomyLogisticsFramework.shipmentStateDefinitions.length,
    provisionalBalanceValues: canonical.resourceEconomyLogisticsFramework.provisionalBalanceValues.length,
    missingDefinitions: canonical.resourceEconomyLogisticsFramework.missingCanonicalDefinitions,
    engineSummaries
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { validateResourceEconomyLogisticsFramework } from "@/lib/economy/logistics-framework";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const framework = runtime.resourceEconomyLogisticsFramework;
  const errors = validateResourceEconomyLogisticsFramework(framework).filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `Logistics route validation errors: ${errors.map((issue) => issue.code).join(", ")}`);

  const routeIds = framework.logisticsRouteDefinitions.map((route) => route.id);
  const requiredRoutes = ["local_supply_route", "colony_internal_route", "surface_to_orbit", "orbital_to_surface", "interplanetary_route", "interstellar_route", "trade_route", "fuel_route", "research_sample_route", "artifact_secure_route", "colonization_supply_route", "terraforming_supply_route", "emergency_route"];
  for (const id of requiredRoutes) assert(routeIds.includes(id as typeof routeIds[number]), `Missing logistics route ${id}.`);
  const transportIds = new Set(framework.transportModeDefinitions.map((transport) => transport.id));
  const nodeIds = new Set(framework.economyNodeTypeDefinitions.map((node) => node.id));
  const actionIds = new Set(runtime.actionSystem.actionDefinitions.map((action) => action.id));

  for (const route of framework.logisticsRouteDefinitions) {
    assert(route.deterministic === true, `${route.id} must be deterministic.`);
    assert(route.throughput > 0 && route.capacity > 0, `${route.id} must have bounded positive throughput and capacity.`);
    assert(route.queuePolicyId === "queue_logistics", `${route.id} must use the canonical logistics queue.`);
    assert(route.routeActionIds.includes("create_shipment"), `${route.id} must reference create_shipment.`);
    assert(route.routeActionIds.includes("transfer_resources"), `${route.id} must reference transfer_resources.`);
    for (const id of route.validTransportModeIds) assert(transportIds.has(id), `${route.id} transport ${id} does not resolve.`);
    for (const id of [...route.sourceNodeRequirements, ...route.destinationNodeRequirements]) assert(nodeIds.has(id), `${route.id} node ${id} does not resolve.`);
    for (const id of route.routeActionIds) assert(actionIds.has(id), `${route.id} action ${id} does not resolve.`);
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    routeIds,
    transportModes: framework.transportModeDefinitions.map((transport) => transport.id),
    shipmentStates: framework.shipmentStateDefinitions.map((state) => state.id)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

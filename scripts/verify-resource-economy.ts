import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, validateGameRuntimeData } from "@/lib/runtime/game-runtime";
import { getGameData } from "@/lib/data";
import { buildBuildingResourceEffects, buildEconomyBehaviorContracts, buildOfflineProgressionPolicies, buildResourceProducerDefinitions, primaryHudEconomyIds } from "@/lib/economy/definitions";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function impliedProduction(building: { name: string; category: string; description: string }) {
  return /lab|library|market|trade|workshop|shelter|house|habitat|farm|factory|mine|generator|plant|academy|university|observatory/i.test(`${building.name} ${building.category} ${building.description}`);
}

async function main() {
  const [data, canonical] = await Promise.all([getGameData(), buildCanonicalRuntimeExportPayload()]);
  const validation = validateGameRuntimeData(canonical);
  const roblox = buildRobloxRuntimePayload(canonical);
  const contracts = buildEconomyBehaviorContracts();
  const producers = buildResourceProducerDefinitions(data);
  const effects = buildBuildingResourceEffects(data);
  const policies = buildOfflineProgressionPolicies();
  const economyIds = new Set(canonical.economyDefinitions.map((definition) => definition.id));
  const contractByEconomy = new Map(contracts.map((contract) => [contract.economyId, contract]));
  const producersByEconomy = Object.fromEntries([...economyIds].map((economyId) => [economyId, producers.filter((producer) => producer.economyId === economyId).length]));
  const effectBuildingIds = new Set(effects.map((effect) => effect.buildingId));
  const missingEffects = data.buildings.filter((building) => impliedProduction(building) && !effectBuildingIds.has(building.id));
  const conflictingProductionPaths = [
    ...producers.filter((producer) => producer.economyId === "ECON-CREDITS" && producer.sourceType === "base_system").map((producer) => producer.id),
    ...producers.filter((producer) => producer.economyId === "ECON-PREMIUM-CRYSTALS" && (producer.sourceType === "building" || producer.offlineEligible)).map((producer) => producer.id)
  ];
  const scopeCoverage = [...new Set(producers.map((producer) => producer.scope))];

  assert(canonical.metadata.contentVersion >= 14, "Runtime contentVersion must be at least 14 for resource economy contracts.");
  assert(canonical.metadata.architectureVersion === "1.0.0", "Architecture version must remain 1.0.0.");
  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must be Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must be Ready; received ${roblox.metadata.validationStatus}.`);
  assert(validation.valid, `Runtime validation failed: ${validation.issues.map((issue) => `${issue.code}:${issue.records.join(",")}`).join("; ")}`);
  assert(contracts.length === primaryHudEconomyIds.length, "Exactly five economy behavior contracts are required.");

  for (const economyId of primaryHudEconomyIds) {
    assert(contractByEconomy.has(economyId), `Missing behavior contract for ${economyId}.`);
    assert(policies.some((policy) => policy.economyId === economyId), `Missing offline policy for ${economyId}.`);
  }

  const labor = contractByEconomy.get("ECON-LABOR");
  assert(labor?.manualProduction.target === true, "Labor must be the manual click target.");
  assert(labor?.basePassiveRate === 1, "Labor base passive rate must be +1/sec.");
  assert(labor?.automatedProduction.aiAgentTarget === true, "Labor must be the AI Agent automation target.");
  assert(labor?.canGoNegative === false, "Labor cannot go negative.");

  const credits = contractByEconomy.get("ECON-CREDITS");
  assert(credits?.basePassiveRate === 0, "Credits must not have default passive production.");
  assert(credits?.manualProduction.enabled === false, "Credits must not be manually clicked.");
  assert(credits?.displayProfile.stableId === "ECON-CREDITS", "Credits stable ID must remain ECON-CREDITS.");

  const population = contractByEconomy.get("ECON-POPULATION");
  assert(population?.startingAmount === 5, "Population must start at 5.");
  assert(population?.integerOnly === true, "Population must be integer-only.");
  assert(population?.spendable === false, "Population must be non-spendable by default.");
  assert(effects.filter((effect) => effect.economyId === "ECON-POPULATION").every((effect) => ["capacity_increase", "instant_grant", "growth_rate"].includes(effect.effectKind)), "Population effects must distinguish capacity/grant/growth.");

  const research = contractByEconomy.get("ECON-RESEARCH");
  assert(research?.startingAmount === 0 && research.basePassiveRate === 0, "Research must start at 0 with no default production.");

  const premium = contractByEconomy.get("ECON-PREMIUM-CRYSTALS");
  assert(premium?.startingAmount === 0 && premium.basePassiveRate === 0, "Premium Crystals must start at 0 with no default production.");
  assert(premium?.offlineProgressEligible === false, "Premium Crystals must not be offline-progress eligible.");
  assert(premium?.purchaseProduction.serverAuthoritativeRequired === true, "Premium purchases must be server-authoritative.");
  assert(conflictingProductionPaths.length === 0, `Conflicting production paths: ${conflictingProductionPaths.join(", ")}`);

  for (const effect of effects) {
    assert(economyIds.has(effect.economyId), `${effect.id} references unknown economy ${effect.economyId}.`);
    assert(producers.some((producer) => producer.id === `producer_${effect.id}`), `${effect.id} is missing a producer.`);
  }

  for (const profile of canonical.eraEconomyProfiles) {
    assert(profile.fixedHudSlots.join("|") === primaryHudEconomyIds.join("|"), `${profile.id} does not preserve fixed HUD order.`);
    assert(profile.displayOverrides["ECON-CREDITS"]?.displayName, `${profile.id} is missing Credits display override.`);
    assert(profile.displayOverrides["ECON-CREDITS"]?.iconKey, `${profile.id} is missing Credits icon override.`);
    assert(profile.permittedProducerSystems.length > 0, `${profile.id} has no permitted producer systems.`);
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    validationStatus: canonical.metadata.validationStatus,
    definitionsAudited: primaryHudEconomyIds.length,
    contracts: contracts.map((contract) => ({ economyId: contract.economyId, behaviorType: contract.behaviorType, startingAmount: contract.startingAmount, basePassiveRate: contract.basePassiveRate, offline: contract.offlineProgressEligible })),
    producerCountsByEconomy: producersByEconomy,
    buildingsWithStructuredEffects: new Set(effects.map((effect) => effect.buildingId)).size,
    buildingEffects: effects.length,
    missingEffectCount: missingEffects.length,
    missingEffects: missingEffects.slice(0, 20).map((building) => ({ id: building.id, name: building.name, category: building.category })),
    conflictingProductionPaths,
    offlineEligibility: Object.fromEntries(policies.map((policy) => [policy.economyId, policy.eligible])),
    scopeCoverage,
    validationErrors: validation.errorCount,
    validationWarnings: validation.warningCount,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

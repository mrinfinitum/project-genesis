import { canonicalActionSystem } from "@/lib/actions/action-system";
import { canonicalBuildingLibrary, canonicalBuildingTaxonomy } from "@/lib/buildings/taxonomy";
import { civilizationProgressionFramework } from "@/lib/civilization/progression-framework";
import { colonizationFramework } from "@/lib/colonization/framework";
import { buildEconomyTransactionReasons } from "@/lib/economy/definitions";
import { planetDevelopmentFramework } from "@/lib/planets/development-framework";
import { ResourceService } from "@/lib/resources/service";
import type {
  CapacityConstraintDefinition,
  EconomyConditionStateDefinition,
  EconomyLogisticsIdentityInfluenceProfile,
  EconomyLogisticsPresentationContract,
  EconomyLogisticsPriorityId,
  EconomyLogisticsResourceClass,
  EconomyLossPolicyId,
  EconomyNodeTypeId,
  EconomyLossWastePolicy,
  EconomyNodeTypeDefinition,
  EconomyRecipeDefinition,
  ImportIssue,
  LogisticsRouteDefinition,
  LogisticsRouteDefinitionId,
  MarketTradeIntegrationDefinition,
  MarketTradeScopeId,
  ProductionChainDefinition,
  RecyclingPolicyDefinition,
  ResourceEconomyLogisticsFrameworkContract,
  ResourceExtractionDefinition,
  ResourceExtractionDefinitionId,
  ResourceFlowDefinition,
  ResourceLocationScopeDefinition,
  ResourceStorageDefinition,
  ResourceStorageDefinitionId,
  ShipmentStateDefinition,
  SupplyDemandDefinition,
  ThroughputDefinition,
  TransportModeDefinition,
  TransportModeDefinitionId
} from "@/types/runtime";
import type { ResourceCatalogItem } from "@/types/schema";

const calculationVersion = "resource-economy-logistics-v1";

function resource(name: string) {
  const id = ResourceService.resolveId(name);
  if (!id) throw new Error(`Missing canonical resource for ${name}.`);
  return id;
}

const resources = {
  iron: resource("Iron"),
  copper: resource("Copper"),
  titanium: resource("Titanium"),
  silicon: resource("Silicon"),
  water: resource("Fresh Water"),
  ice: resource("Water Ice"),
  organics: resource("Organic Compounds"),
  hydrogen: resource("Hydrogen"),
  helium: resource("Helium"),
  helium3: resource("Helium-3"),
  fusionFuel: resource("Fusion Fuel"),
  solarEnergy: resource("Solar Energy"),
  surveyData: resource("Survey Data"),
  rareMetals: resource("Rare Metals"),
  carbon: resource("Carbon"),
  chemicalSalts: resource("Chemical Salts")
};

function titleFromId(id: string) {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function issue(severity: ImportIssue["severity"], code: string, message: string, records: string[] = []): ImportIssue {
  return { severity, code, message, records };
}

function findBuilding(...needles: string[]) {
  const match = canonicalBuildingLibrary.find((building) => {
    const text = `${building.id} ${building.displayName} ${building.familyId} ${building.subcategoryId} ${building.tags.join(" ")}`.toLowerCase();
    return needles.some((needle) => text.includes(needle));
  });
  return match?.id ?? null;
}

function compactBuildingIds(ids: Array<string | null>) {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))].sort();
}

const buildingByRole = {
  mine: findBuilding("mine", "quarry", "extraction"),
  refinery: findBuilding("refinery", "smelter", "processing"),
  factory: findBuilding("factory", "workshop", "manufacturing"),
  storage: findBuilding("storage", "warehouse", "depot"),
  market: findBuilding("market", "trade", "commerce"),
  logistics: findBuilding("logistics", "depot", "supply"),
  farm: findBuilding("farm", "hydroponics", "agriculture"),
  research: findBuilding("laboratory", "research", "academy"),
  spaceport: findBuilding("spaceport", "dock", "orbital"),
  power: findBuilding("power", "solar", "generator"),
  recycling: findBuilding("recycling", "waste"),
  archaeology: findBuilding("archaeology", "ruin", "museum")
} as const;

function classifyResource(resourceItem: ResourceCatalogItem): EconomyLogisticsResourceClass {
  const text = `${resourceItem.resource_name} ${resourceItem.category} ${resourceItem.primary_uses.join(" ")} ${resourceItem.description}`.toLowerCase();
  if (/survey|data|cartography|knowledge/.test(text)) return "data";
  if (/artifact|relic|ruin|archaeology|ancient/.test(text)) return "artifact";
  if (/water/.test(text)) return "water";
  if (/food|grain|nutrient/.test(text)) return "food";
  if (/gas|hydrogen|helium|methane|ammonia/.test(text)) return "gas";
  if (/ice|volatile/.test(text)) return "volatile";
  if (/energy|solar|storm|fusion|fuel/.test(text)) return /fuel/.test(text) ? "fuel" : "energy";
  if (/organic|bio|biological|spore|flora|fauna/.test(text)) return "organic";
  if (/chemical|salt|acid|compound|hydrocarbon/.test(text)) return "chemical";
  if (/metal|iron|copper|titanium|ore|alloy/.test(text)) return "metal";
  if (/crystal|quantum|gravitonium|exotic|rare matter/.test(text)) return "exotic";
  if (/mineral|silicate|stone|carbon|rock/.test(text)) return "mineral";
  return "general";
}

function storageForClass(resourceClass: EconomyLogisticsResourceClass): ResourceStorageDefinitionId[] {
  const map: Record<EconomyLogisticsResourceClass, ResourceStorageDefinitionId[]> = {
    metal: ["raw_material_storage", "bulk_storage", "orbital_storage"],
    mineral: ["raw_material_storage", "bulk_storage", "orbital_storage"],
    volatile: ["cryogenic_storage", "hazardous_storage", "orbital_storage"],
    gas: ["gas_storage", "cryogenic_storage", "orbital_storage"],
    liquid: ["liquid_storage", "hazardous_storage"],
    energy: ["energy_storage", "secure_vault"],
    organic: ["biological_storage", "food_storage"],
    biological: ["biological_storage", "scientific_sample_storage"],
    chemical: ["hazardous_storage", "liquid_storage"],
    manufactured: ["bulk_storage", "mobile_storage", "orbital_storage"],
    data: ["scientific_sample_storage", "secure_vault"],
    artifact: ["artifact_storage", "secure_vault"],
    fuel: ["cryogenic_storage", "gas_storage", "fleet_cargo"],
    food: ["food_storage", "biological_storage"],
    water: ["water_storage", "liquid_storage"],
    waste: ["hazardous_storage", "waste_site" as ResourceStorageDefinitionId],
    exotic: ["secure_vault", "scientific_sample_storage", "hazardous_storage"],
    general: ["bulk_storage", "mobile_storage"]
  };
  return map[resourceClass].filter((id) => resourceStorageDefinitions.some((definition) => definition.id === id));
}

function extractionForClass(resourceClass: EconomyLogisticsResourceClass): ResourceExtractionDefinitionId | null {
  if (resourceClass === "metal" || resourceClass === "mineral") return "surface_mining";
  if (resourceClass === "gas" || resourceClass === "fuel") return "atmospheric_harvesting";
  if (resourceClass === "water" || resourceClass === "liquid") return "ocean_harvesting";
  if (resourceClass === "volatile") return "ice_extraction";
  if (resourceClass === "organic" || resourceClass === "biological" || resourceClass === "food") return "biological_harvesting";
  if (resourceClass === "energy") return "stellar_energy_collection";
  if (resourceClass === "artifact") return "artifact_recovery";
  if (resourceClass === "data") return "archaeological_recovery";
  if (resourceClass === "exotic") return "rare_matter_extraction";
  return null;
}

function transportForClass(resourceClass: EconomyLogisticsResourceClass): TransportModeDefinitionId[] {
  if (resourceClass === "gas" || resourceClass === "fuel" || resourceClass === "water" || resourceClass === "volatile") return ["pipeline", "tanker", "cargo_shuttle", "interplanetary_freighter", "interstellar_freighter"];
  if (resourceClass === "artifact" || resourceClass === "data" || resourceClass === "exotic") return ["automated_drone", "cargo_shuttle", "expedition_transport"];
  return ["surface_transport", "cargo_shuttle", "freighter", "interplanetary_freighter", "interstellar_freighter"];
}

function marketEligibilityFor(resourceClass: EconomyLogisticsResourceClass): MarketTradeScopeId[] {
  if (resourceClass === "artifact") return ["restricted", "protected", "unique"];
  if (resourceClass === "data") return ["civilization_traded", "restricted"];
  if (resourceClass === "exotic") return ["interplanetary_traded", "interstellar_traded", "restricted"];
  if (resourceClass === "waste") return ["non_tradable"];
  return ["locally_exchanged", "civilization_traded", "interplanetary_traded"];
}

function influence(alignmentIds: EconomyLogisticsIdentityInfluenceProfile["alignmentIds"], influenceTrigger: EconomyLogisticsIdentityInfluenceProfile["influenceTrigger"], influenceAmount: number, notes: string): EconomyLogisticsIdentityInfluenceProfile {
  return { alignmentIds, influenceTrigger, influenceAmount, notes };
}

function node(id: EconomyNodeTypeDefinition["id"], supportedResourceClasses: EconomyLogisticsResourceClass[], routeCompatibility: LogisticsRouteDefinitionId[], buildingReferences: Array<string | null>, throughput: number, storageCapacity: number, automationSupport: EconomyNodeTypeDefinition["automationSupport"] = "assisted"): EconomyNodeTypeDefinition {
  return {
    id,
    displayName: titleFromId(id),
    supportedResourceClasses,
    inputCapacity: Math.max(10, Math.round(throughput * 1.2)),
    outputCapacity: throughput,
    storageCapacity,
    throughput,
    workforceRequirement: Math.max(0, Math.round(throughput / 20)),
    energyRequirement: Math.max(0, Math.round(throughput / 10)),
    buildingReferences: compactBuildingIds(buildingReferences),
    automationSupport,
    hazardConstraints: supportedResourceClasses.some((item) => ["chemical", "exotic", "volatile", "waste"].includes(item)) ? ["hazard_certification_required"] : ["standard_operating_limits"],
    routeCompatibility,
    presentationToken: `economy_node_${id}`,
    status: "approved"
  };
}

const allClasses: EconomyLogisticsResourceClass[] = ["metal", "mineral", "volatile", "gas", "liquid", "energy", "organic", "biological", "chemical", "manufactured", "data", "artifact", "fuel", "food", "water", "waste", "exotic", "general"];
const rawClasses: EconomyLogisticsResourceClass[] = ["metal", "mineral", "volatile", "gas", "liquid", "organic", "biological", "chemical", "fuel", "water", "exotic", "general"];
const manufacturedClasses: EconomyLogisticsResourceClass[] = ["manufactured", "energy", "fuel", "chemical", "food", "data", "general"];

export const economyNodeTypeDefinitions: EconomyNodeTypeDefinition[] = [
  node("extraction_site", rawClasses, ["local_supply_route", "surface_to_orbit"], [buildingByRole.mine], 60, 120),
  node("mining_outpost", ["metal", "mineral", "exotic"], ["local_supply_route", "surface_to_orbit", "colonization_supply_route"], [buildingByRole.mine, buildingByRole.storage], 80, 180),
  node("gas_harvest_platform", ["gas", "fuel", "volatile"], ["surface_to_orbit", "fuel_route"], [buildingByRole.spaceport, buildingByRole.power], 70, 140),
  node("ocean_harvest_platform", ["water", "organic", "chemical", "food"], ["local_supply_route", "surface_to_orbit"], [buildingByRole.farm, buildingByRole.storage], 55, 160),
  node("agricultural_site", ["food", "water", "organic", "biological"], ["local_supply_route", "colony_internal_route"], [buildingByRole.farm], 45, 150),
  node("research_site", ["data", "artifact", "exotic", "biological"], ["research_sample_route", "artifact_secure_route"], [buildingByRole.research], 25, 60),
  node("archaeological_site", ["artifact", "data", "mineral"], ["artifact_secure_route", "research_sample_route"], [buildingByRole.archaeology], 18, 45),
  node("storage_depot", allClasses, ["local_supply_route", "colony_internal_route", "surface_to_orbit"], [buildingByRole.storage], 120, 600),
  node("warehouse", ["manufactured", "food", "water", "general", "metal", "mineral"], ["local_supply_route", "colony_internal_route", "trade_route"], [buildingByRole.storage], 140, 800),
  node("orbital_storage", allClasses, ["surface_to_orbit", "orbital_to_surface", "interplanetary_route"], [buildingByRole.storage, buildingByRole.spaceport], 160, 1000),
  node("refinery", ["metal", "mineral", "gas", "fuel", "chemical", "volatile"], ["local_supply_route", "surface_to_orbit", "fuel_route"], [buildingByRole.refinery], 75, 220),
  node("processing_plant", manufacturedClasses, ["local_supply_route", "colony_internal_route"], [buildingByRole.refinery, buildingByRole.factory], 70, 220),
  node("factory", ["manufactured", "metal", "chemical", "general"], ["local_supply_route", "trade_route"], [buildingByRole.factory], 85, 260),
  node("manufacturing_complex", manufacturedClasses, ["local_supply_route", "trade_route", "interplanetary_route"], [buildingByRole.factory, buildingByRole.logistics], 120, 500),
  node("colony", allClasses, ["colony_internal_route", "local_supply_route", "colonization_supply_route"], [buildingByRole.storage, buildingByRole.logistics], 100, 800),
  node("city", allClasses, ["colony_internal_route", "local_supply_route", "trade_route"], [buildingByRole.market, buildingByRole.logistics], 180, 1200),
  node("trade_hub", allClasses, ["trade_route", "interplanetary_route", "interstellar_route"], [buildingByRole.market, buildingByRole.logistics], 180, 900),
  node("logistics_hub", allClasses, ["local_supply_route", "surface_to_orbit", "interplanetary_route", "interstellar_route", "emergency_route"], [buildingByRole.logistics], 200, 900, "full"),
  node("refueling_station", ["fuel", "gas", "energy"], ["fuel_route", "interplanetary_route", "interstellar_route"], [buildingByRole.power, buildingByRole.storage], 90, 400),
  node("spaceport", allClasses, ["surface_to_orbit", "orbital_to_surface", "interplanetary_route", "colonization_supply_route"], [buildingByRole.spaceport], 160, 700),
  node("orbital_port", allClasses, ["surface_to_orbit", "orbital_to_surface", "interplanetary_route", "interstellar_route"], [buildingByRole.spaceport], 190, 900),
  node("fleet", ["fuel", "food", "water", "manufactured", "artifact", "data"], ["interplanetary_route", "interstellar_route", "emergency_route"], [], 60, 220),
  node("expedition", ["food", "water", "fuel", "artifact", "data"], ["research_sample_route", "artifact_secure_route", "emergency_route"], [], 25, 80),
  node("terraforming_project", ["water", "gas", "chemical", "energy", "volatile", "manufactured"], ["terraforming_supply_route", "local_supply_route"], [buildingByRole.power], 100, 500),
  node("recycling_center", ["waste", "metal", "mineral", "chemical", "manufactured"], ["local_supply_route", "colony_internal_route"], [buildingByRole.recycling, buildingByRole.factory], 70, 240),
  node("waste_site", ["waste", "chemical"], ["local_supply_route", "emergency_route"], [buildingByRole.recycling], 45, 500),
  node("market", allClasses, ["trade_route", "local_supply_route"], [buildingByRole.market], 120, 500),
  node("distribution_center", allClasses, ["local_supply_route", "colony_internal_route", "trade_route"], [buildingByRole.logistics, buildingByRole.storage], 170, 750)
];

export const resourceLocationScopes: ResourceLocationScopeDefinition[] = (["celestial_body", "colony", "settlement", "building", "storage_node", "fleet", "route", "sector", "star_system", "civilization", "market", "project"] as const).map((id) => ({
  id,
  displayName: titleFromId(id),
  resourceStateSchema: {
    locationId: "game-owned-location-id",
    resourceId: "canonical-resource-id",
    availableQuantity: 0,
    reservedQuantity: 0,
    inTransitQuantity: 0,
    damagedQuantity: 0,
    wasteQuantity: 0,
    capacity: 0,
    lastUpdatedAt: "game-owned-timestamp"
  },
  gameOwnsValues: true,
  studioPublishesSchemaOnly: true,
  notes: "Studio publishes the location-aware resource state shape. The Game owns player quantities, timestamps, inventory state, and persistence."
}));

function extraction(id: ResourceExtractionDefinitionId, actionId: string, classes: EconomyLogisticsResourceClass[], buildings: Array<string | null>, identity: EconomyLogisticsIdentityInfluenceProfile, baseOutput: number, status: ResourceExtractionDefinition["status"] = "approved"): ResourceExtractionDefinition {
  return {
    id,
    displayName: titleFromId(id),
    actionId,
    eligibleBodyClasses: ["Earth-like", "Ocean", "Forest", "Desert", "Frozen", "Volcanic", "Rocky", "Gas Giant", "Ice Giant", "Asteroid Belt", "Artificial", "Exotic", "Barren", "Dead", "Crystal", "Toxic", "Radioactive"],
    eligibleResourceClasses: classes,
    buildingRequirementIds: compactBuildingIds(buildings),
    technologyRequirementIds: [`tech_${id}`],
    workforceRequirement: Math.max(5, Math.round(baseOutput / 8)),
    equipmentRequirementIds: [`equipment_${id}`],
    energyRequirement: Math.max(1, Math.round(baseOutput / 12)),
    baseOutput,
    durationDefinitionId: "duration_standard",
    depletionPolicyId: id.includes("stellar") ? "renewable_flux" : id.includes("artifact") || id.includes("archaeological") ? "unique_site_depletion" : "finite_deposit_depletion",
    hazardModifierIds: ["environmental_hazard_modifier", "resource_class_hazard_modifier"],
    byproductResourceIds: id.includes("mining") ? [resources.carbon] : id.includes("harvesting") ? [resources.chemicalSalts] : [],
    wastePolicyId: id.includes("biological") ? "spoilage" : id.includes("artifact") ? "hazard_damage" : "manufacturing_waste",
    identityInfluence: identity,
    status
  };
}

export const resourceExtractionDefinitions: ResourceExtractionDefinition[] = [
  extraction("surface_mining", "build_mining_outpost", ["metal", "mineral"], [buildingByRole.mine], influence(["Industry"], "action_completion", 2, "Mining strengthens industrial identity."), 48),
  extraction("deep_core_mining", "build_mining_outpost", ["metal", "mineral", "exotic"], [buildingByRole.mine], influence(["Industry", "Technology"], "action_completion", 3, "Deep extraction rewards industrial and technology play."), 60, "provisional"),
  extraction("automated_mining", "deploy_automated_extraction", ["metal", "mineral", "exotic"], [buildingByRole.mine, buildingByRole.logistics], influence(["Automation", "Technology"], "action_completion", 3, "Autonomous extraction contributes to automation identity."), 72),
  extraction("asteroid_mining", "build_mining_outpost", ["metal", "mineral", "exotic"], [buildingByRole.spaceport, buildingByRole.mine], influence(["Industry", "Scientific"], "action_completion", 3, "Asteroid extraction supports industrial exploration."), 56, "provisional"),
  extraction("atmospheric_harvesting", "build_gas_harvest_platform", ["gas", "fuel", "volatile"], [buildingByRole.spaceport, buildingByRole.power], influence(["Technology"], "action_completion", 2, "Atmospheric harvesting rewards advanced infrastructure."), 52),
  extraction("ocean_harvesting", "build_ocean_harvest_platform", ["water", "organic", "chemical", "food"], [buildingByRole.farm, buildingByRole.storage], influence(["Eco", "Industry"], "action_completion", 2, "Ocean harvesting can be sustainable or industrial depending on policy."), 44),
  extraction("ice_extraction", "build_mining_outpost", ["water", "volatile"], [buildingByRole.mine, buildingByRole.storage], influence(["Industry"], "action_completion", 1, "Ice extraction supports frontier logistics."), 38),
  extraction("geothermal_extraction", "build_mining_outpost", ["energy", "chemical"], [buildingByRole.power], influence(["Technology", "Industry"], "action_completion", 2, "Geothermal work supports energy infrastructure."), 36, "provisional"),
  extraction("biological_harvesting", "build_ocean_harvest_platform", ["organic", "biological", "food"], [buildingByRole.farm, buildingByRole.research], influence(["Eco", "Scientific"], "action_completion", 2, "Biological harvesting emphasizes science and stewardship."), 34),
  extraction("rare_matter_extraction", "deploy_automated_extraction", ["exotic"], [buildingByRole.research, buildingByRole.power], influence(["Scientific", "Technology"], "action_completion", 4, "Rare matter stabilizes advanced research identity."), 18, "provisional"),
  extraction("artifact_recovery", "excavate_ruin", ["artifact"], [buildingByRole.archaeology, buildingByRole.research], influence(["Scientific", "Nature"], "action_completion", 3, "Artifact recovery contributes knowledge and preservation tension."), 8),
  extraction("archaeological_recovery", "excavate_ruin", ["data", "artifact"], [buildingByRole.archaeology], influence(["Scientific"], "action_completion", 3, "Archaeology produces research samples and story evidence."), 10),
  extraction("stellar_energy_collection", "build_orbital_refinery", ["energy"], [buildingByRole.power, buildingByRole.spaceport], influence(["Technology"], "action_completion", 3, "Stellar energy collection supports high-technology development."), 80, "provisional"),
  extraction("salvage", "process_resource", ["manufactured", "metal", "mineral"], [buildingByRole.recycling, buildingByRole.factory], influence(["Industry", "Eco"], "waste_recycled", 2, "Salvage rewards circular economy planning."), 24)
];

function storage(id: ResourceStorageDefinitionId, classes: EconomyLogisticsResourceClass[], capacityUnits: number, buildings: Array<string | null>, lossPolicyId: EconomyLossPolicyId, automationSupport: ResourceStorageDefinition["automationSupport"] = "assisted"): ResourceStorageDefinition {
  return {
    id,
    displayName: titleFromId(id),
    supportedResourceClasses: classes,
    capacityUnits,
    hazardRequirements: classes.some((item) => ["hazardous", "chemical", "radioactive", "exotic"].includes(item)) ? ["containment_required"] : ["standard"],
    environmentalRequirements: classes.some((item) => ["biological", "organic", "food", "water"].includes(item)) ? ["temperature_control"] : ["dry_secure_storage"],
    lossPolicyId,
    buildingReferenceIds: compactBuildingIds(buildings),
    upgradeReferenceIds: [`upgrade_${id}_capacity`],
    automationSupport,
    status: "approved"
  };
}

export const resourceStorageDefinitions: ResourceStorageDefinition[] = [
  storage("raw_material_storage", ["metal", "mineral", "general"], 1000, [buildingByRole.storage], "storage_degradation"),
  storage("bulk_storage", ["metal", "mineral", "manufactured", "general"], 1500, [buildingByRole.storage], "storage_degradation"),
  storage("liquid_storage", ["liquid", "water", "chemical"], 900, [buildingByRole.storage], "evaporation"),
  storage("gas_storage", ["gas", "fuel"], 700, [buildingByRole.storage], "evaporation"),
  storage("cryogenic_storage", ["gas", "fuel", "volatile"], 600, [buildingByRole.power, buildingByRole.storage], "storage_degradation"),
  storage("hazardous_storage", ["chemical", "exotic", "volatile", "waste"], 400, [buildingByRole.storage], "contamination"),
  storage("biological_storage", ["biological", "organic", "food"], 500, [buildingByRole.farm, buildingByRole.research], "spoilage"),
  storage("artifact_storage", ["artifact"], 80, [buildingByRole.research, buildingByRole.archaeology], "hazard_damage"),
  storage("scientific_sample_storage", ["data", "biological", "exotic"], 120, [buildingByRole.research], "contamination"),
  storage("energy_storage", ["energy"], 1000, [buildingByRole.power], "storage_degradation"),
  storage("food_storage", ["food", "organic", "biological"], 650, [buildingByRole.farm, buildingByRole.storage], "spoilage"),
  storage("water_storage", ["water", "liquid"], 1000, [buildingByRole.storage], "evaporation"),
  storage("orbital_storage", allClasses, 2000, [buildingByRole.spaceport, buildingByRole.storage], "storage_degradation", "full"),
  storage("mobile_storage", ["food", "water", "fuel", "manufactured", "artifact", "data"], 250, [], "transport_loss"),
  storage("fleet_cargo", ["food", "water", "fuel", "manufactured", "artifact", "data"], 500, [], "transport_loss"),
  storage("secure_vault", ["artifact", "data", "exotic", "energy"], 100, [buildingByRole.research, buildingByRole.storage], "theft_security_loss")
];

function transport(id: TransportModeDefinitionId, supportedRouteScopes: LogisticsRouteDefinitionId[], cargoClasses: EconomyLogisticsResourceClass[], capacity: number, speedClass: TransportModeDefinition["speedClass"], fuelRequirementIds: string[], buildingPortRequirementIds: Array<string | null>, lossPolicyId: EconomyLossPolicyId, actionIds = ["create_shipment", "load_shipment", "transfer_resources", "unload_shipment"]): TransportModeDefinition {
  return {
    id,
    displayName: titleFromId(id),
    supportedRouteScopes,
    cargoClasses,
    capacity,
    speedClass,
    fuelRequirementIds,
    technologyRequirementIds: [`tech_${id}`],
    buildingPortRequirementIds: compactBuildingIds(buildingPortRequirementIds),
    workforceOrAutomationRequirement: id.includes("automated") ? "automation_capable_ai_agent" : "logistics_staff_or_automation",
    hazardTolerance: id.includes("emergency") ? ["high"] : id.includes("interstellar") ? ["deep_space"] : ["standard"],
    lossPolicyId,
    maintenanceHooks: [`maintenance_${id}`, "route_condition_check"],
    actionIds,
    presentationToken: `transport_${id}`,
    status: "approved"
  };
}

export const transportModeDefinitions: TransportModeDefinition[] = [
  transport("surface_transport", ["local_supply_route", "colony_internal_route", "emergency_route"], allClasses, 120, "standard", [resources.fusionFuel], [buildingByRole.logistics], "transport_loss"),
  transport("pipeline", ["local_supply_route", "colony_internal_route", "fuel_route"], ["water", "liquid", "gas", "fuel", "chemical"], 220, "standard", [resources.solarEnergy], [buildingByRole.storage], "evaporation"),
  transport("conveyor", ["local_supply_route", "colony_internal_route"], ["metal", "mineral", "manufactured", "general"], 260, "slow", [resources.solarEnergy], [buildingByRole.factory], "accident_loss"),
  transport("orbital_lift", ["surface_to_orbit", "orbital_to_surface"], allClasses, 400, "standard", [resources.solarEnergy], [buildingByRole.spaceport], "transport_loss"),
  transport("cargo_shuttle", ["surface_to_orbit", "orbital_to_surface", "interplanetary_route", "emergency_route"], allClasses, 180, "fast", [resources.fusionFuel], [buildingByRole.spaceport], "hazard_damage"),
  transport("cargo_ship", ["interplanetary_route", "trade_route", "colonization_supply_route"], allClasses, 600, "standard", [resources.fusionFuel], [buildingByRole.spaceport], "transport_loss"),
  transport("colony_ship", ["colonization_supply_route", "interplanetary_route", "interstellar_route"], ["food", "water", "manufactured", "fuel", "general"], 700, "slow", [resources.fusionFuel], [buildingByRole.spaceport], "hazard_damage"),
  transport("tanker", ["fuel_route", "interplanetary_route", "trade_route"], ["water", "liquid", "gas", "fuel", "chemical"], 500, "standard", [resources.fusionFuel], [buildingByRole.spaceport], "evaporation"),
  transport("freighter", ["trade_route", "interplanetary_route"], allClasses, 850, "standard", [resources.fusionFuel], [buildingByRole.market, buildingByRole.spaceport], "transport_loss"),
  transport("automated_drone", ["local_supply_route", "research_sample_route", "artifact_secure_route", "emergency_route"], ["data", "artifact", "exotic", "biological", "manufactured"], 60, "fast", [resources.solarEnergy], [buildingByRole.logistics], "hazard_damage"),
  transport("interplanetary_freighter", ["interplanetary_route", "trade_route", "fuel_route"], allClasses, 1400, "standard", [resources.fusionFuel], [buildingByRole.spaceport], "transport_loss"),
  transport("interstellar_freighter", ["interstellar_route", "trade_route", "colonization_supply_route"], allClasses, 2400, "slow", [resources.fusionFuel, resources.helium3], [buildingByRole.spaceport], "hazard_damage"),
  transport("gateway_transfer", ["interstellar_route", "trade_route"], allClasses, 3000, "instant_gate", [resources.solarEnergy], [buildingByRole.power, buildingByRole.spaceport], "accident_loss", ["create_shipment", "load_shipment", "transfer_resources", "unload_shipment"]),
  transport("trade_convoy", ["trade_route", "interplanetary_route", "interstellar_route"], allClasses, 1000, "standard", [resources.fusionFuel], [buildingByRole.market], "theft_security_loss"),
  transport("expedition_transport", ["research_sample_route", "artifact_secure_route", "emergency_route"], ["food", "water", "fuel", "data", "artifact", "manufactured"], 220, "standard", [resources.fusionFuel], [buildingByRole.research], "hazard_damage"),
  transport("emergency_transport", ["emergency_route", "local_supply_route", "surface_to_orbit"], ["food", "water", "fuel", "biological", "manufactured"], 120, "fast", [resources.fusionFuel], [buildingByRole.spaceport, buildingByRole.logistics], "accident_loss")
];

function route(id: LogisticsRouteDefinitionId, sourceNodeRequirements: EconomyNodeTypeDefinition["id"][], destinationNodeRequirements: EconomyNodeTypeDefinition["id"][], validTransportModeIds: TransportModeDefinitionId[], priority: EconomyLogisticsPriorityId, throughput: number, capacity: number): LogisticsRouteDefinition {
  return {
    id,
    displayName: titleFromId(id),
    sourceNodeRequirements,
    destinationNodeRequirements,
    validTransportModeIds,
    maximumDistancePolicy: id.includes("interstellar") ? "requires_interstellar_range_gate" : id.includes("interplanetary") ? "within_star_system_or_neighboring_orbit" : "local_or_orbital_distance",
    travelTimePolicy: "uses_time_action_contract_and_transport_speed_class",
    throughput,
    capacity,
    priority,
    hazardModifierIds: ["route_distance_modifier", "environmental_hazard_modifier", "security_modifier"],
    escortSecurityHooks: id.includes("artifact") || id.includes("trade") ? ["security_escort_optional", "piracy_risk_check"] : ["standard_route_monitoring"],
    fuelCostPolicy: "fuel = distanceBand * transportModeFuelFactor * cargoMassFactor",
    routeActionIds: ["create_shipment", "load_shipment", "transfer_resources", "unload_shipment", "reroute_shipment"],
    failureRetryPolicy: "failed shipments preserve history and may be retried through reroute_shipment when cargo is recoverable",
    queuePolicyId: "queue_logistics",
    deterministic: true
  };
}

export const logisticsRouteDefinitions: LogisticsRouteDefinition[] = [
  route("local_supply_route", ["extraction_site", "storage_depot", "warehouse", "colony"], ["storage_depot", "warehouse", "processing_plant", "colony"], ["surface_transport", "pipeline", "conveyor", "automated_drone"], "operational", 180, 600),
  route("colony_internal_route", ["colony", "warehouse", "storage_depot"], ["distribution_center", "city", "warehouse"], ["surface_transport", "pipeline", "conveyor", "automated_drone"], "essential", 200, 700),
  route("surface_to_orbit", ["spaceport", "extraction_site", "colony"], ["orbital_storage", "orbital_port", "fleet"], ["orbital_lift", "cargo_shuttle"], "strategic", 120, 500),
  route("orbital_to_surface", ["orbital_storage", "orbital_port", "fleet"], ["spaceport", "colony", "distribution_center"], ["orbital_lift", "cargo_shuttle"], "strategic", 120, 500),
  route("interplanetary_route", ["orbital_port", "spaceport", "trade_hub"], ["orbital_port", "spaceport", "colony", "fleet"], ["cargo_ship", "freighter", "interplanetary_freighter", "cargo_shuttle"], "strategic", 150, 1000),
  route("interstellar_route", ["orbital_port", "trade_hub", "fleet"], ["orbital_port", "trade_hub", "fleet"], ["interstellar_freighter", "gateway_transfer"], "strategic", 100, 1500),
  route("trade_route", ["market", "trade_hub", "city"], ["market", "trade_hub", "city"], ["freighter", "trade_convoy", "interplanetary_freighter", "interstellar_freighter"], "growth", 160, 1200),
  route("fuel_route", ["gas_harvest_platform", "refinery", "refueling_station"], ["refueling_station", "fleet", "spaceport"], ["pipeline", "tanker", "interplanetary_freighter"], "critical", 140, 900),
  route("research_sample_route", ["research_site", "archaeological_site", "expedition"], ["research_site", "colony", "orbital_storage"], ["automated_drone", "cargo_shuttle", "expedition_transport"], "essential", 40, 120),
  route("artifact_secure_route", ["archaeological_site", "research_site", "expedition"], ["research_site", "storage_depot", "colony"], ["automated_drone", "expedition_transport"], "critical", 20, 80),
  route("colonization_supply_route", ["spaceport", "orbital_storage", "colony"], ["colony", "orbital_port", "terraforming_project"], ["colony_ship", "cargo_ship", "interplanetary_freighter", "interstellar_freighter"], "critical", 120, 1000),
  route("terraforming_supply_route", ["refinery", "processing_plant", "orbital_storage"], ["terraforming_project", "colony"], ["cargo_ship", "tanker", "interplanetary_freighter"], "strategic", 90, 700),
  route("emergency_route", ["distribution_center", "spaceport", "fleet"], ["colony", "fleet", "research_site"], ["emergency_transport", "cargo_shuttle", "automated_drone"], "critical", 60, 250)
];

export const shipmentStateDefinitions: ShipmentStateDefinition[] = [
  ["planned", false, "source", ["reserving", "cancelled"]],
  ["reserving", false, "source", ["loading", "cancelled"]],
  ["loading", false, "source", ["queued", "cancelled"]],
  ["queued", false, "transport", ["departing", "delayed", "cancelled"]],
  ["departing", false, "transport", ["in_transit", "delayed"]],
  ["in_transit", false, "transport", ["arrived", "delayed", "rerouted", "lost", "damaged"]],
  ["delayed", false, "transport", ["in_transit", "rerouted", "cancelled"]],
  ["rerouted", false, "transport", ["in_transit", "delayed", "lost"]],
  ["arrived", false, "destination", ["unloading"]],
  ["unloading", false, "destination", ["completed", "damaged"]],
  ["completed", true, "destination", []],
  ["lost", true, "lost", []],
  ["damaged", true, "destination", []],
  ["cancelled", true, "cancelled", []]
].map(([id, terminal, cargoLocation, allowedTransitions]) => ({
  id: id as ShipmentStateDefinition["id"],
  displayName: titleFromId(id as string),
  terminal: terminal as boolean,
  cargoLocation: cargoLocation as ShipmentStateDefinition["cargoLocation"],
  allowedTransitions: allowedTransitions as ShipmentStateDefinition["allowedTransitions"],
  presentationToken: `shipment_${id}`
}));

export const throughputDefinitions: ThroughputDefinition[] = (["extraction", "storage", "loading", "unloading", "transport", "processing", "manufacturing", "distribution", "consumption", "recycling"] as const).map((id) => ({
  id,
  displayName: titleFromId(id),
  supportedModes: ["per-minute", "per-hour", "per-cycle", "per-Action", "batch", "continuous"],
  defaultMode: id === "transport" ? "per-Action" : id === "storage" ? "continuous" : "per-hour",
  capacityConstraintIds: id === "storage" ? ["storage_capacity", "node_capacity"] : id === "transport" ? ["transport_capacity", "route_capacity", "port_capacity"] : ["node_capacity", "workforce_capacity", "energy_capacity", "queue_capacity"],
  formula: `${id}Throughput = min(baseThroughput, activeCapacityConstraints) * canonicalModifiers`,
  bounded: true
}));

export const capacityConstraintDefinitions: CapacityConstraintDefinition[] = (["node_capacity", "route_capacity", "transport_capacity", "port_capacity", "workforce_capacity", "energy_capacity", "storage_capacity", "queue_capacity"] as const).map((id) => ({
  id,
  displayName: titleFromId(id),
  appliesTo: ["resource flows", "actions", "routes", "shipments", "nodes"],
  hardLimit: true,
  notes: "The Game evaluates player values. Studio publishes the canonical capacity concept and validates references."
}));

export const lossAndWastePolicies: EconomyLossWastePolicy[] = (["transport_loss", "hazard_damage", "spoilage", "evaporation", "contamination", "theft_security_loss", "accident_loss", "storage_degradation", "manufacturing_waste", "recycling_recovery", "disposal"] as const).map((id) => ({
  id,
  displayName: titleFromId(id),
  appliesToResourceClasses: id === "spoilage" ? ["food", "organic", "biological"] : id === "evaporation" ? ["water", "liquid", "gas", "fuel"] : id === "theft_security_loss" ? ["artifact", "exotic", "data"] : allClasses,
  deterministicFormula: `${id} = floor(quantity * policyRate * hazardModifier)`,
  producesWaste: !["recycling_recovery"].includes(id),
  recoveryPolicyId: id === "recycling_recovery" ? null : "standard_recycling_recovery",
  version: "loss-waste-policy-v1"
}));

export const recyclingPolicies: RecyclingPolicyDefinition[] = [
  { id: "standard_recycling_recovery", displayName: "Standard Recycling Recovery", inputResourceClasses: ["metal", "mineral", "manufactured", "chemical"], recoveredResourceClass: "manufactured", recoveryRate: 0.35, actionId: "recycle_resource", wastePolicyId: "recycling_recovery" },
  { id: "biological_compost_recovery", displayName: "Biological Compost Recovery", inputResourceClasses: ["food", "organic", "biological"], recoveredResourceClass: "organic", recoveryRate: 0.45, actionId: "recycle_resource", wastePolicyId: "recycling_recovery" },
  { id: "secure_artifact_recovery", displayName: "Secure Artifact Recovery", inputResourceClasses: ["artifact", "data", "exotic"], recoveredResourceClass: "data", recoveryRate: 0.2, actionId: "recycle_resource", wastePolicyId: "recycling_recovery" }
];

function recipe(id: string, displayName: string, categoryId: EconomyRecipeDefinition["categoryId"], inputItems: EconomyRecipeDefinition["inputItems"], outputItems: EconomyRecipeDefinition["outputItems"], requiredBuildingIds: Array<string | null>, actionId: string, provisionalBalance = true): EconomyRecipeDefinition {
  return {
    id,
    displayName,
    categoryId,
    inputItems,
    outputItems,
    byproducts: [],
    wasteOutputs: [{ resourceId: resources.carbon, quantity: 1, policyId: "manufacturing_waste" }],
    requiredBuildingIds: compactBuildingIds(requiredBuildingIds),
    requiredResearchIds: [`research_${categoryId}`],
    requiredWorkforceRoles: ["operator", "logistics"],
    energyRequirement: 10,
    durationDefinitionId: "duration_standard",
    actionId,
    batchSize: 1,
    automationPolicyId: "automation_advanced_ai",
    qualityPolicyId: "standard_quality_policy",
    status: provisionalBalance ? "provisional" : "approved",
    provisionalBalance
  };
}

export const processingRecipeDefinitions: EconomyRecipeDefinition[] = [
  recipe("recipe_ore_to_refined_metal", "Ore to Refined Metal", "smelting", [{ resourceId: resources.iron, quantity: 5 }], [{ resourceId: resources.rareMetals, quantity: 2 }], [buildingByRole.refinery], "process_resource"),
  recipe("recipe_gas_to_fusion_fuel", "Atmospheric Gas to Fusion Fuel", "energy_products", [{ resourceId: resources.hydrogen, quantity: 6 }, { resourceId: resources.helium3, quantity: 1 }], [{ resourceId: resources.fusionFuel, quantity: 2 }], [buildingByRole.refinery, buildingByRole.power], "process_resource"),
  recipe("recipe_ice_to_water", "Ice to Water", "chemical_processing", [{ resourceId: resources.ice, quantity: 4 }], [{ resourceId: resources.water, quantity: 3 }], [buildingByRole.refinery], "process_resource"),
  recipe("recipe_biomass_to_nutrients", "Organic Compounds to Nutrients", "biological_processing", [{ resourceId: resources.organics, quantity: 3 }, { resourceId: resources.water, quantity: 1 }], [{ resourceId: resources.organics, quantity: 4 }], [buildingByRole.farm], "process_resource"),
  recipe("recipe_survey_samples_to_data", "Survey Samples to Data", "scientific_equipment", [{ resourceId: resources.surveyData, quantity: 1 }], [{ resourceId: resources.surveyData, quantity: 2 }], [buildingByRole.research], "process_resource"),
  recipe("recipe_salvage_recovery", "Salvage Recovery", "recycling", [{ resourceId: resources.titanium, quantity: 2 }, { resourceId: resources.copper, quantity: 2 }], [{ resourceId: resources.iron, quantity: 2 }, { resourceId: resources.silicon, quantity: 1 }], [buildingByRole.recycling, buildingByRole.factory], "recycle_resource")
];

export const manufacturingRecipeDefinitions: EconomyRecipeDefinition[] = [
  recipe("recipe_refined_metal_to_components", "Refined Metal to Structural Components", "construction_materials", [{ resourceId: resources.iron, quantity: 4 }, { resourceId: resources.titanium, quantity: 1 }], [{ resourceId: resources.titanium, quantity: 2 }], [buildingByRole.factory], "manufacture_item"),
  recipe("recipe_silicon_to_electronics", "Silicon to Electronics", "electronics", [{ resourceId: resources.silicon, quantity: 4 }, { resourceId: resources.copper, quantity: 2 }], [{ resourceId: resources.silicon, quantity: 2 }], [buildingByRole.factory, buildingByRole.research], "manufacture_item"),
  recipe("recipe_fuel_cell", "Fusion Fuel Cell", "ship_components", [{ resourceId: resources.fusionFuel, quantity: 2 }, { resourceId: resources.titanium, quantity: 1 }], [{ resourceId: resources.fusionFuel, quantity: 1 }], [buildingByRole.factory, buildingByRole.power], "manufacture_item"),
  recipe("recipe_science_package", "Scientific Equipment Package", "scientific_equipment", [{ resourceId: resources.surveyData, quantity: 2 }, { resourceId: resources.silicon, quantity: 2 }], [{ resourceId: resources.surveyData, quantity: 3 }], [buildingByRole.research, buildingByRole.factory], "manufacture_item"),
  recipe("recipe_terraforming_mix", "Terraforming Material Mix", "terraforming_materials", [{ resourceId: resources.water, quantity: 4 }, { resourceId: resources.chemicalSalts, quantity: 2 }, { resourceId: resources.carbon, quantity: 1 }], [{ resourceId: resources.chemicalSalts, quantity: 3 }], [buildingByRole.refinery], "manufacture_item"),
  recipe("recipe_consumer_goods", "Consumer Goods", "consumer_goods", [{ resourceId: resources.organics, quantity: 2 }, { resourceId: resources.copper, quantity: 1 }], [{ resourceId: resources.organics, quantity: 2 }], [buildingByRole.factory], "manufacture_item")
];

export const productionChainDefinitions: ProductionChainDefinition[] = [
  {
    id: "chain_ore_to_structural_components",
    displayName: "Ore to Structural Components",
    stages: [
      { order: 1, inputResourceIds: [resources.iron], outputResourceIds: [resources.rareMetals], recipeId: "recipe_ore_to_refined_metal", nodeTypeIds: ["mining_outpost", "refinery"] },
      { order: 2, inputResourceIds: [resources.iron, resources.titanium], outputResourceIds: [resources.titanium], recipeId: "recipe_refined_metal_to_components", nodeTypeIds: ["factory", "manufacturing_complex"] }
    ],
    storageRequirementIds: ["raw_material_storage", "bulk_storage"],
    transportRequirementIds: ["surface_transport", "cargo_shuttle"],
    bottleneckDefinitionIds: ["processing_bottleneck", "transport_bottleneck"],
    completionOutputResourceIds: [resources.titanium],
    presentationSummary: "Ore becomes refined metal and then structural components for buildings and ships.",
    status: "approved"
  },
  {
    id: "chain_atmospheric_gas_to_fleet_fuel",
    displayName: "Atmospheric Gas to Fleet Fuel",
    stages: [{ order: 1, inputResourceIds: [resources.hydrogen, resources.helium3], outputResourceIds: [resources.fusionFuel], recipeId: "recipe_gas_to_fusion_fuel", nodeTypeIds: ["gas_harvest_platform", "refinery", "refueling_station"] }],
    storageRequirementIds: ["gas_storage", "cryogenic_storage", "fleet_cargo"],
    transportRequirementIds: ["tanker", "interplanetary_freighter"],
    bottleneckDefinitionIds: ["energy_bottleneck", "transport_bottleneck"],
    completionOutputResourceIds: [resources.fusionFuel],
    presentationSummary: "Gas harvesting and refining produce fuel for fleets, colonies, and logistics.",
    status: "approved"
  },
  {
    id: "chain_biomass_to_population_supply",
    displayName: "Biomass to Population Supply",
    stages: [{ order: 1, inputResourceIds: [resources.organics, resources.water], outputResourceIds: [resources.organics], recipeId: "recipe_biomass_to_nutrients", nodeTypeIds: ["agricultural_site", "processing_plant", "colony"] }],
    storageRequirementIds: ["biological_storage", "food_storage", "water_storage"],
    transportRequirementIds: ["surface_transport", "emergency_transport"],
    bottleneckDefinitionIds: ["workforce_bottleneck", "blocked_storage"],
    completionOutputResourceIds: [resources.organics],
    presentationSummary: "Organic supply chains feed population growth and colony stability.",
    status: "approved"
  },
  {
    id: "chain_rare_matter_to_research_component",
    displayName: "Rare Matter to Research Component",
    stages: [{ order: 1, inputResourceIds: [resources.rareMetals, resources.surveyData], outputResourceIds: [resources.surveyData], recipeId: "recipe_science_package", nodeTypeIds: ["research_site", "manufacturing_complex"] }],
    storageRequirementIds: ["secure_vault", "scientific_sample_storage"],
    transportRequirementIds: ["automated_drone", "expedition_transport"],
    bottleneckDefinitionIds: ["processing_bottleneck", "route_disruption"],
    completionOutputResourceIds: [resources.surveyData],
    presentationSummary: "Rare and survey-derived material stabilizes advanced research outputs.",
    status: "provisional"
  }
];

export const economyPriorityDefinitions = (["critical", "essential", "operational", "growth", "strategic", "optional", "luxury"] as const).map((id, index) => ({
  id,
  displayName: titleFromId(id),
  order: index + 1,
  canBlockActions: ["critical", "essential", "operational", "strategic"].includes(id),
  notes: "Priority class informs shortage presentation and server-side action gating."
}));

export const economyConditionStateDefinitions: EconomyConditionStateDefinition[] = (["severe_shortage", "shortage", "constrained", "balanced", "surplus", "oversupply", "blocked_storage", "transport_bottleneck", "processing_bottleneck", "workforce_bottleneck", "energy_bottleneck", "route_disruption"] as const).map((id) => ({
  id,
  displayName: titleFromId(id),
  severity: id === "balanced" || id === "surplus" ? "positive" : id === "oversupply" ? "warning" : id.includes("shortage") || id.includes("bottleneck") || id.includes("blocked") || id.includes("disruption") ? "critical" : "neutral",
  reasonCode: `economy_${id}`,
  blocksActionStart: ["severe_shortage", "blocked_storage", "transport_bottleneck", "processing_bottleneck", "workforce_bottleneck", "energy_bottleneck", "route_disruption"].includes(id),
  presentationToken: `economy_state_${id}`
}));

export const supplyDemandDefinitions: SupplyDemandDefinition[] = ([
  { id: "demand_population_food_water", displayName: "Population Food and Water", type: "demand", sourceType: "population", resourceClassIds: ["food", "water"], priorityId: "critical", affectedActionIds: ["establish_colony"], notes: "Population supply hooks only. The Game owns live consumption." },
  { id: "demand_building_materials", displayName: "Building Materials", type: "demand", sourceType: "construction_projects", resourceClassIds: ["metal", "mineral", "manufactured"], priorityId: "essential", affectedActionIds: ["construct_building", "upgrade_building"] },
  { id: "demand_research_samples", displayName: "Research Samples", type: "demand", sourceType: "research", resourceClassIds: ["data", "artifact", "biological", "exotic"], priorityId: "strategic", affectedActionIds: ["conduct_research", "process_resource"] },
  { id: "demand_fleet_fuel", displayName: "Fleet Fuel", type: "demand", sourceType: "fleets", resourceClassIds: ["fuel", "gas", "energy"], priorityId: "critical", affectedActionIds: ["travel_to_destination", "transfer_resources"] },
  { id: "demand_colony_package", displayName: "Colony Package", type: "demand", sourceType: "colonies", resourceClassIds: ["food", "water", "manufactured", "fuel", "energy"], priorityId: "critical", affectedActionIds: ["prepare_colony", "establish_colony"] },
  { id: "demand_terraforming_materials", displayName: "Terraforming Materials", type: "demand", sourceType: "terraforming", resourceClassIds: ["water", "gas", "chemical", "energy"], priorityId: "strategic", affectedActionIds: ["terraform_planet_stage"] },
  { id: "supply_extraction", displayName: "Extraction Supply", type: "supply", sourceType: "extraction", resourceClassIds: rawClasses, priorityId: "operational", affectedActionIds: ["build_mining_outpost", "deploy_automated_extraction"] },
  { id: "supply_production", displayName: "Production Supply", type: "supply", sourceType: "production", resourceClassIds: manufacturedClasses, priorityId: "operational", affectedActionIds: ["manufacture_item", "process_resource"] },
  { id: "supply_trade", displayName: "Trade Supply", type: "supply", sourceType: "trade", resourceClassIds: allClasses, priorityId: "growth", affectedActionIds: ["establish_trade_route", "transfer_resources"] },
  { id: "supply_recycling", displayName: "Recycling Supply", type: "supply", sourceType: "recycling", resourceClassIds: ["metal", "mineral", "manufactured", "organic", "chemical"], priorityId: "optional", affectedActionIds: ["recycle_resource"] },
  { id: "supply_salvage", displayName: "Salvage Supply", type: "supply", sourceType: "salvage", resourceClassIds: ["metal", "manufactured", "artifact", "data"], priorityId: "optional", affectedActionIds: ["process_resource"] }
] as Array<Omit<SupplyDemandDefinition, "notes"> & { notes?: string }>).map((definition) => ({
  ...definition,
  notes: definition.notes ?? "Canonical supply/demand hook only. The Game owns live quantities, consumption, and fulfillment state."
}));

export const marketTradeIntegration: MarketTradeIntegrationDefinition[] = [
  {
    id: "market_trade_integration_v1",
    nodeTypeId: "market",
    locationScopeIds: ["colony", "settlement", "star_system", "sector", "civilization", "market"],
    acceptedResourceClasses: allClasses.filter((item) => item !== "waste"),
    storageDefinitionIds: ["warehouse", "secure_vault", "orbital_storage"].filter((id) => resourceStorageDefinitions.some((definition) => definition.id === id)) as ResourceStorageDefinitionId[],
    routeAccessIds: ["local_supply_route", "trade_route", "interplanetary_route", "interstellar_route"],
    pricePolicyId: "canonical_market_price_policy_v1",
    transactionReasonCodeIds: buildEconomyTransactionReasons().filter((reason) => reason.operation === "transfer" || reason.operation === "spend").map((reason) => reason.id),
    tradeActionIds: ["establish_trade_route", "transfer_resources", "create_shipment"],
    listingSchema: {
      listingId: "game-owned",
      resourceId: "canonical resource ID",
      quantityAvailable: "game-owned value",
      pricePolicyId: "Studio canonical policy",
      routeAccessId: "canonical route definition"
    },
    gameOwnsOrders: true
  }
];

export const economyLogisticsPresentationContract: EconomyLogisticsPresentationContract[] = (["EconomyOverview", "ResourceFlowGraph", "SupplyDemandSummary", "StorageCapacityPanel", "ShipmentCard", "ShipmentTimeline", "RouteSummary", "LogisticsNetworkView", "ProductionChainView", "RecipeCard", "BottleneckAlert", "ShortageAlert", "SurplusIndicator", "MarketSummary", "RecyclingSummary", "ColonySupplyReadiness", "ProjectSupplyChecklist"] as const).map((id) => ({
  id,
  displayName: id.replace(/([A-Z])/g, " $1").trim(),
  rendererIndependent: true,
  semanticFields: ["resourceId", "nodeTypeId", "routeDefinitionId", "state", "capacity", "throughput", "requirements", "actions", "status"],
  notes: "Studio publishes semantic presentation intent only. The Game owns UI layout, rendering, and notifications."
}));

export function buildResourceFlowDefinitions(): ResourceFlowDefinition[] {
  const recipes = [...processingRecipeDefinitions, ...manufacturingRecipeDefinitions];
  return ResourceService.catalog.map((item) => {
    const resourceClass = classifyResource(item);
    const marketEligibility = marketEligibilityFor(resourceClass);
    const sourceNodeTypes: EconomyNodeTypeId[] = resourceClass === "artifact"
      ? ["archaeological_site", "research_site"]
      : resourceClass === "gas" || resourceClass === "fuel"
        ? ["gas_harvest_platform", "refinery"]
        : resourceClass === "data"
          ? ["research_site", "archaeological_site"]
          : ["extraction_site", "storage_depot"];
    const destinationNodeTypes: EconomyNodeTypeId[] = ["storage_depot", "warehouse", "colony", "market", "distribution_center"];
    const flow: ResourceFlowDefinition = {
      id: `resource_flow_${item.id.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      resourceId: item.id,
      resourceClass,
      sourceNodeTypes,
      destinationNodeTypes,
      extractionDefinitionId: extractionForClass(resourceClass),
      storageDefinitionIds: storageForClass(resourceClass),
      transportModeIds: transportForClass(resourceClass),
      processingRecipeIds: recipes.filter((recipeItem) => recipeItem.inputItems.some((input) => input.resourceId === item.id) || recipeItem.outputItems.some((output) => output.resourceId === item.id)).filter((recipeItem) => recipeItem.actionId === "process_resource" || recipeItem.actionId === "recycle_resource").map((recipeItem) => recipeItem.id),
      manufacturingRecipeIds: recipes.filter((recipeItem) => recipeItem.inputItems.some((input) => input.resourceId === item.id) || recipeItem.outputItems.some((output) => output.resourceId === item.id)).filter((recipeItem) => recipeItem.actionId === "manufacture_item").map((recipeItem) => recipeItem.id),
      consumptionProfileIds: [`consume_${resourceClass}`],
      lossPolicyId: resourceClass === "food" || resourceClass === "organic" || resourceClass === "biological" ? "spoilage" : resourceClass === "gas" || resourceClass === "water" ? "evaporation" : resourceClass === "artifact" || resourceClass === "data" ? "theft_security_loss" : "storage_degradation",
      wastePolicyId: resourceClass === "chemical" || resourceClass === "exotic" ? "contamination" : "manufacturing_waste",
      recyclingPolicyId: recyclingPolicies.find((policy) => policy.inputResourceClasses.includes(resourceClass))?.id ?? null,
      marketEligibility,
      tradeEligibility: marketEligibility,
      hazardProfileId: `hazard_${resourceClass}`,
      presentationProfileId: `resource_flow_${resourceClass}`,
      status: item.id.startsWith("RES-PROFILE-") ? "provisional" : "approved"
    };
    return flow;
  }).sort((left, right) => left.resourceId.localeCompare(right.resourceId));
}

export const resourceEconomyLogisticsFramework: ResourceEconomyLogisticsFrameworkContract = {
  id: "resource_economy_logistics_framework_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-RESOURCE-ECONOMY-LOGISTICS-NETWORK",
  actionSystemId: canonicalActionSystem.id,
  planetDevelopmentFrameworkId: planetDevelopmentFramework.id,
  civilizationProgressionFrameworkId: civilizationProgressionFramework.id,
  colonizationFrameworkId: colonizationFramework.id,
  civilizationIdentitySource: "civilization_identity",
  calculationVersion,
  ownership: {
    studioOwns: [
      "Resource flow definitions",
      "node types",
      "storage and transport definitions",
      "route and shipment schemas",
      "throughput and capacity contracts",
      "recipe and production-chain contracts",
      "shortage and waste policies",
      "market integration contracts",
      "presentation contracts"
    ],
    gameOwns: [
      "Player inventories",
      "live stockpiles",
      "active shipments",
      "route instances",
      "market orders",
      "timestamps",
      "queue instances",
      "transport assignments",
      "save/cloud persistence",
      "UI and notifications"
    ]
  },
  activePlayerStatePolicy: {
    exportsPlayerInventories: false,
    exportsLiveStockpiles: false,
    exportsActiveShipments: false,
    exportsRouteInstances: false,
    exportsMarketOrders: false,
    exportsTimestamps: false,
    exportsQueueInstances: false,
    exportsTransportAssignments: false
  },
  auditSummary: [
    { id: "resource_catalog", source: "ResourceService.catalog", status: "integrated", notes: "Every Resource Catalog entry receives a Resource Flow definition." },
    { id: "economy_definitions", source: "lib/economy/definitions", status: "referenced", notes: "Existing economy values, producer contracts, transactions, and behavior contracts remain the source for global economy values." },
    { id: "economy_trade", source: "lib/economy/trade", status: "referenced", notes: "Existing market records remain runtime/generated data; this framework publishes safe market schema and route integration only." },
    { id: "building_taxonomy", source: "canonicalBuildingLibrary/canonicalBuildingTaxonomy", status: "integrated", notes: "Node types and recipes reference canonical Building IDs when a matching building exists." },
    { id: "colonization_framework", source: "colonizationFramework", status: "integrated", notes: "Colony resource packages and phases are wired to colonization supply routes." }
  ],
  resourceFlowDefinitions: buildResourceFlowDefinitions(),
  economyNodeTypeDefinitions,
  resourceLocationScopes,
  resourceExtractionDefinitions,
  resourceStorageDefinitions,
  transportModeDefinitions,
  logisticsRouteDefinitions,
  shipmentInstanceSchema: {
    shipmentId: "game-owned-shipment-id",
    routeDefinitionId: "local_supply_route",
    sourceNodeId: "game-owned-source-node-id",
    destinationNodeId: "game-owned-destination-node-id",
    transportModeId: "surface_transport",
    cargo: [{ resourceId: resources.iron, quantity: 0, reservedQuantity: 0 }],
    reservedAt: "game-owned-timestamp",
    departedAt: null,
    estimatedArrivalAt: null,
    arrivedAt: null,
    state: "planned",
    capacityUsed: 0,
    fuelCost: [{ resourceId: resources.fusionFuel, quantity: 0 }],
    hazardSnapshot: {},
    idempotencyKey: "game-owned-idempotency-key",
    createdFromContentVersion: 0
  },
  shipmentStateDefinitions,
  throughputDefinitions,
  capacityConstraintDefinitions,
  processingRecipeDefinitions,
  manufacturingRecipeDefinitions,
  productionChainDefinitions,
  supplyDemandDefinitions,
  economyPriorityDefinitions,
  economyConditionStateDefinitions,
  economyShortageReasonCodes: economyConditionStateDefinitions.map((state) => ({
    id: state.reasonCode,
    stateId: state.id,
    displayName: state.displayName,
    blocksActionStart: state.blocksActionStart,
    recommendedResolution: state.blocksActionStart ? "Deliver required resources, expand capacity, resolve route disruption, or reduce demand priority." : "Monitor the condition and rebalance supply if needed."
  })),
  lossAndWastePolicies,
  recyclingPolicies,
  marketTradeIntegration,
  colonizationIntegration: {
    colonyResourcePackageIds: colonizationFramework.colonyResourcePackageDefinitions.map((item) => item.id),
    requiredRouteDefinitionIds: ["colonization_supply_route", "surface_to_orbit", "interplanetary_route"],
    requiredTransportModeIds: ["colony_ship", "cargo_ship", "interplanetary_freighter"],
    requiredPhaseIds: ["resource_allocation", "transport_preparation", "transit", "landing_or_orbital_insertion", "site_preparation"],
    rule: "Colonization project phases cannot advance until required package shipments have arrived and unloaded into the destination project or colony node."
  },
  populationIntegrationHooks: [
    { id: "population_consumption_hook", consumesResourceClasses: ["food", "water", "energy", "manufactured"], provides: ["Labor", "specialists", "administration", "demand", "trade_activity"], notes: "Population Simulation owns live consumption and workforce assignment." },
    { id: "population_services_hook", consumesResourceClasses: ["manufactured", "data"], provides: ["healthcare", "education", "communications", "consumer_demand"], notes: "Prepared interface only; no population simulation is implemented in Studio." }
  ],
  buildingIntegrationHooks: canonicalBuildingTaxonomy.slice(0, 40).map((family) => ({
    id: `building_integration_${family.id}`,
    buildingFamilyId: family.id,
    nodeTypeIds: family.id.includes("resource") ? ["extraction_site", "mining_outpost"] : family.id.includes("commerce") || family.id.includes("trade") ? ["market", "trade_hub"] : family.id.includes("transport") || family.id.includes("logistics") ? ["logistics_hub", "distribution_center"] : family.id.includes("manufacturing") || family.id.includes("industry") ? ["factory", "manufacturing_complex"] : family.id.includes("research") ? ["research_site"] : ["colony"],
    providedCapabilities: ["capacity", "throughput", "route_support"],
    missingCoverage: canonicalBuildingLibrary.every((building) => building.familyId !== family.id)
  })),
  actionIntegrationHooks: ["create_shipment", "load_shipment", "unload_shipment", "process_resource", "recycle_resource", "reroute_shipment", "transfer_resources", "establish_trade_route", "manufacture_item", "construct_building", "build_mining_outpost", "deploy_automated_extraction", "build_gas_harvest_platform", "build_ocean_harvest_platform", "build_orbital_refinery", "travel_to_destination"].map((actionId) => ({ id: `action_integration_${actionId}`, actionId, purpose: "Resource Economy & Logistics Framework action reference", required: true })),
  identityIntegrationHooks: [
    influence(["Industry"], "production_chain_completion", 2, "Industry improves extraction, manufacturing throughput, and storage scale."),
    influence(["Eco"], "waste_recycled", 2, "Eco improves recycling and waste reduction."),
    influence(["Scientific"], "action_completion", 2, "Scientific improves advanced processing and sample quality."),
    influence(["Trade"], "route_completion", 2, "Trade improves route capacity and market access."),
    influence(["Automation"], "shortage_resolved", 2, "Automation improves rebalancing and route management.")
  ],
  progressionIntegrationHooks: ["first_operational_mine", "first_refinery", "first_manufacturing_chain", "first_trade_route", "first_interplanetary_shipment", "first_interstellar_shipment", "first_self_sufficient_colony", "first_automated_logistics_network", "first_circular_economy", "first_galactic_trade_network"].map((milestoneId) => ({
    id: `progression_hook_${milestoneId}`,
    milestoneId,
    status: civilizationProgressionFramework.civilizationMilestones.some((milestone) => milestone.id === milestoneId) ? "resolved" : "missing_canonical_definition",
    notes: "Progression hook is published for future milestone authoring. Missing milestones are reported, not fabricated."
  })),
  aiAutomationRules: [
    "AI Agents may manage routes, rebalance stockpiles, prioritize shipments, prevent shortages, manage warehouses, optimize production queues, recommend bottleneck fixes, and automate eligible shipments.",
    "AI Agents may not create resources, bypass capacity, bypass travel time, bypass technology, spend Premium Crystals automatically, or expose hidden resource information.",
    "Automation uses canonical Action System policies and never creates a parallel timer engine."
  ],
  economyLogisticsPresentationContract,
  creativeProductionRequirements: [
    "resource class icons",
    "extraction state icons",
    "storage type icons",
    "transport mode icons",
    "route type icons",
    "shipment states",
    "production-chain stages",
    "shortage/surplus states",
    "bottleneck states",
    "market states",
    "recycling/waste states",
    "supply-readiness states"
  ].map((label) => ({ id: `creative_economy_logistics_${label.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`, displayName: titleFromId(label.replace(/[^a-z0-9]+/g, "_")), category: "Economy & Logistics", status: "required", notes: "Creative Production should track asset needs without fabricating final game screens." })),
  assetLibraryCategories: [{ id: "economy_logistics", displayName: "Economy & Logistics", groups: ["Resources", "Extraction", "Storage", "Transport", "Routes", "Shipments", "Processing", "Manufacturing", "Production Chains", "Supply and Demand", "Markets", "Waste and Recycling", "Alerts"], notes: "Do not mix canonical universe object cards into this category." }],
  missingCanonicalDefinitions: [
    ...["first_operational_mine", "first_refinery", "first_manufacturing_chain", "first_interplanetary_shipment", "first_interstellar_shipment", "first_self_sufficient_colony", "first_automated_logistics_network", "first_circular_economy", "first_galactic_trade_network"]
      .filter((milestoneId) => !civilizationProgressionFramework.civilizationMilestones.some((milestone) => milestone.id === milestoneId))
      .map((milestoneId) => ({ id: milestoneId, type: "progression_milestone" as const, displayName: titleFromId(milestoneId), referencedBy: ["progressionIntegrationHooks"], severity: "info" as const, recommendedOwner: "Civilization Progression" as const, notes: "Reported as a future progression milestone. This task does not fabricate progression records." })),
    ...Object.entries(buildingByRole)
      .filter(([, id]) => !id)
      .map(([role]) => ({ id: `building_role_${role}`, type: "building" as const, displayName: titleFromId(role), referencedBy: ["economyNodeTypeDefinitions", "recipeDefinitions"], severity: "warning" as const, recommendedOwner: "Building Library" as const, notes: "No strong canonical building match was found for this logistics role." }))
  ],
  provisionalBalanceValues: [
    ...resourceExtractionDefinitions.filter((definition) => definition.status === "provisional").map((definition) => ({ id: definition.id, field: "baseOutput", value: definition.baseOutput, reason: "Starter balance value for logistics contract validation; needs tuning with gameplay telemetry." })),
    ...[...processingRecipeDefinitions, ...manufacturingRecipeDefinitions].filter((definition) => definition.provisionalBalance).map((definition) => ({ id: definition.id, field: "input/output quantities", value: "starter recipe ratios", reason: "Curated starter recipe value for contract coverage, not final economy balance." }))
  ],
  validationRules: [
    "Every Resource Catalog item must resolve to a Resource Flow definition.",
    "Every extraction, recipe, route, transport, and market reference must resolve to canonical IDs or be reported as a missing definition.",
    "Storage, throughput, route, transport, and capacity must be bounded.",
    "Shipment instance schema is Game-owned and Studio must not export active shipments.",
    "Player inventories, stockpiles, route instances, market orders, timestamps, queues, and transport assignments must not be exported.",
    "All six engine exports must publish the same canonical framework contract."
  ]
};

export function validateResourceEconomyLogisticsFramework(
  framework: ResourceEconomyLogisticsFrameworkContract = resourceEconomyLogisticsFramework,
  context: {
    resourceIds?: Set<string>;
    actionIds?: Set<string>;
    actionPhaseIds?: Set<string>;
    actionDurationIds?: Set<string>;
    buildingIds?: Set<string>;
    colonizationPackageIds?: Set<string>;
    colonizationPhaseIds?: Set<string>;
    planetDevelopmentFrameworkId?: string;
    civilizationProgressionFrameworkId?: string;
    colonizationFrameworkId?: string;
  } = {}
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const resourceIds = context.resourceIds ?? new Set(ResourceService.catalog.map((item) => item.id));
  const actionIds = context.actionIds ?? new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id));
  const durationIds = context.actionDurationIds ?? new Set(canonicalActionSystem.actionDurationDefinitions.map((duration) => duration.id));
  const buildingIds = context.buildingIds ?? new Set(canonicalBuildingLibrary.map((building) => building.id));
  const packageIds = context.colonizationPackageIds ?? new Set(colonizationFramework.colonyResourcePackageDefinitions.map((item) => item.id));
  const colonyPhaseIds = context.colonizationPhaseIds ?? new Set(colonizationFramework.colonyProjectPhaseDefinitions.map((item) => item.id));
  const nodeIds = new Set(framework.economyNodeTypeDefinitions.map((item) => item.id));
  const storageIds = new Set(framework.resourceStorageDefinitions.map((item) => item.id));
  const transportIds = new Set(framework.transportModeDefinitions.map((item) => item.id));
  const routeIds = new Set(framework.logisticsRouteDefinitions.map((item) => item.id));
  const conditionIds = new Set(framework.economyConditionStateDefinitions.map((item) => item.id));
  const policyIds = new Set(framework.lossAndWastePolicies.map((item) => item.id));
  const recyclingIds = new Set(framework.recyclingPolicies.map((item) => item.id));
  const recipeIds = new Set([...framework.processingRecipeDefinitions, ...framework.manufacturingRecipeDefinitions].map((item) => item.id));
  const priorityIds = new Set(framework.economyPriorityDefinitions.map((item) => item.id));
  const shipmentStateIds = new Set(framework.shipmentStateDefinitions.map((item) => item.id));

  if (framework.id !== "resource_economy_logistics_framework_v1") issues.push(issue("error", "invalid_resource_logistics_id", "Resource Economy & Logistics Framework ID is invalid."));
  if (framework.actionSystemId !== canonicalActionSystem.id) issues.push(issue("error", "invalid_action_system_ref", "Framework must reference Canonical Action System."));
  if (framework.planetDevelopmentFrameworkId !== (context.planetDevelopmentFrameworkId ?? planetDevelopmentFramework.id)) issues.push(issue("error", "invalid_planet_development_ref", "Framework must reference Planet Development Framework."));
  if (framework.civilizationProgressionFrameworkId !== (context.civilizationProgressionFrameworkId ?? civilizationProgressionFramework.id)) issues.push(issue("error", "invalid_civilization_progression_ref", "Framework must reference Civilization Progression Framework."));
  if (framework.colonizationFrameworkId !== (context.colonizationFrameworkId ?? colonizationFramework.id)) issues.push(issue("error", "invalid_colonization_ref", "Framework must reference Colonization Framework."));
  if (Object.values(framework.activePlayerStatePolicy).some((value) => value !== false)) issues.push(issue("error", "exports_player_state", "Framework must not export player inventories, shipments, orders, timestamps, queues, or assignments."));
  if (framework.resourceFlowDefinitions.length !== resourceIds.size) issues.push(issue("error", "resource_flow_count_mismatch", "Every Resource Catalog item must have exactly one flow definition."));

  for (const flow of framework.resourceFlowDefinitions) {
    if (!resourceIds.has(flow.resourceId)) issues.push(issue("error", "invalid_flow_resource", `${flow.id} references unknown resource ${flow.resourceId}.`, [flow.id, flow.resourceId]));
    if (flow.sourceNodeTypes.some((id) => !nodeIds.has(id))) issues.push(issue("error", "invalid_flow_source_node", `${flow.id} references unknown source node.`, [flow.id]));
    if (flow.destinationNodeTypes.some((id) => !nodeIds.has(id))) issues.push(issue("error", "invalid_flow_destination_node", `${flow.id} references unknown destination node.`, [flow.id]));
    if (flow.extractionDefinitionId && !framework.resourceExtractionDefinitions.some((item) => item.id === flow.extractionDefinitionId)) issues.push(issue("error", "invalid_flow_extraction", `${flow.id} extraction definition does not resolve.`, [flow.id]));
    for (const id of flow.storageDefinitionIds) if (!storageIds.has(id)) issues.push(issue("error", "invalid_flow_storage", `${flow.id} storage ${id} does not resolve.`, [flow.id, id]));
    for (const id of flow.transportModeIds) if (!transportIds.has(id)) issues.push(issue("error", "invalid_flow_transport", `${flow.id} transport ${id} does not resolve.`, [flow.id, id]));
    for (const id of [...flow.processingRecipeIds, ...flow.manufacturingRecipeIds]) if (!recipeIds.has(id)) issues.push(issue("error", "invalid_flow_recipe", `${flow.id} recipe ${id} does not resolve.`, [flow.id, id]));
    if (!policyIds.has(flow.lossPolicyId) || !policyIds.has(flow.wastePolicyId)) issues.push(issue("error", "invalid_flow_policy", `${flow.id} loss/waste policy does not resolve.`, [flow.id]));
    if (flow.recyclingPolicyId && !recyclingIds.has(flow.recyclingPolicyId)) issues.push(issue("error", "invalid_flow_recycling", `${flow.id} recycling policy does not resolve.`, [flow.id]));
  }

  for (const extractionDefinition of framework.resourceExtractionDefinitions) {
    if (!actionIds.has(extractionDefinition.actionId)) issues.push(issue("error", "invalid_extraction_action", `${extractionDefinition.id} action does not resolve.`, [extractionDefinition.id, extractionDefinition.actionId]));
    if (!durationIds.has(extractionDefinition.durationDefinitionId)) issues.push(issue("error", "invalid_extraction_duration", `${extractionDefinition.id} duration does not resolve.`, [extractionDefinition.id]));
    for (const id of extractionDefinition.buildingRequirementIds) if (!buildingIds.has(id)) issues.push(issue("error", "invalid_extraction_building", `${extractionDefinition.id} building ${id} does not resolve.`, [extractionDefinition.id, id]));
    for (const id of extractionDefinition.byproductResourceIds) if (!resourceIds.has(id)) issues.push(issue("error", "invalid_extraction_byproduct", `${extractionDefinition.id} byproduct ${id} does not resolve.`, [extractionDefinition.id, id]));
    if (!policyIds.has(extractionDefinition.wastePolicyId)) issues.push(issue("error", "invalid_extraction_waste_policy", `${extractionDefinition.id} waste policy does not resolve.`, [extractionDefinition.id]));
  }
  for (const storageDefinition of framework.resourceStorageDefinitions) {
    if (!policyIds.has(storageDefinition.lossPolicyId)) issues.push(issue("error", "invalid_storage_policy", `${storageDefinition.id} loss policy does not resolve.`, [storageDefinition.id]));
    for (const id of storageDefinition.buildingReferenceIds) if (!buildingIds.has(id)) issues.push(issue("error", "invalid_storage_building", `${storageDefinition.id} building ${id} does not resolve.`, [storageDefinition.id, id]));
  }
  for (const transportDefinition of framework.transportModeDefinitions) {
    for (const id of transportDefinition.supportedRouteScopes) if (!routeIds.has(id)) issues.push(issue("error", "invalid_transport_route", `${transportDefinition.id} route ${id} does not resolve.`, [transportDefinition.id, id]));
    for (const id of transportDefinition.fuelRequirementIds) if (!resourceIds.has(id)) issues.push(issue("error", "invalid_transport_fuel", `${transportDefinition.id} fuel ${id} does not resolve.`, [transportDefinition.id, id]));
    for (const id of transportDefinition.actionIds) if (!actionIds.has(id)) issues.push(issue("error", "invalid_transport_action", `${transportDefinition.id} action ${id} does not resolve.`, [transportDefinition.id, id]));
    if (!policyIds.has(transportDefinition.lossPolicyId)) issues.push(issue("error", "invalid_transport_loss_policy", `${transportDefinition.id} loss policy does not resolve.`, [transportDefinition.id]));
  }
  for (const routeDefinition of framework.logisticsRouteDefinitions) {
    for (const id of [...routeDefinition.sourceNodeRequirements, ...routeDefinition.destinationNodeRequirements]) if (!nodeIds.has(id)) issues.push(issue("error", "invalid_route_node", `${routeDefinition.id} node ${id} does not resolve.`, [routeDefinition.id, id]));
    for (const id of routeDefinition.validTransportModeIds) if (!transportIds.has(id)) issues.push(issue("error", "invalid_route_transport", `${routeDefinition.id} transport ${id} does not resolve.`, [routeDefinition.id, id]));
    for (const id of routeDefinition.routeActionIds) if (!actionIds.has(id)) issues.push(issue("error", "invalid_route_action", `${routeDefinition.id} action ${id} does not resolve.`, [routeDefinition.id, id]));
    if (!priorityIds.has(routeDefinition.priority)) issues.push(issue("error", "invalid_route_priority", `${routeDefinition.id} priority does not resolve.`, [routeDefinition.id]));
  }
  for (const state of framework.shipmentStateDefinitions) {
    for (const transition of state.allowedTransitions) if (!shipmentStateIds.has(transition)) issues.push(issue("error", "invalid_shipment_transition", `${state.id} transition ${transition} does not resolve.`, [state.id, transition]));
  }
  for (const recipeDefinition of [...framework.processingRecipeDefinitions, ...framework.manufacturingRecipeDefinitions]) {
    for (const input of recipeDefinition.inputItems) if (!resourceIds.has(input.resourceId)) issues.push(issue("error", "invalid_recipe_input", `${recipeDefinition.id} input ${input.resourceId} does not resolve.`, [recipeDefinition.id, input.resourceId]));
    for (const output of [...recipeDefinition.outputItems, ...recipeDefinition.byproducts, ...recipeDefinition.wasteOutputs]) if (!resourceIds.has(output.resourceId)) issues.push(issue("error", "invalid_recipe_output", `${recipeDefinition.id} output ${output.resourceId} does not resolve.`, [recipeDefinition.id, output.resourceId]));
    for (const id of recipeDefinition.requiredBuildingIds) if (!buildingIds.has(id)) issues.push(issue("error", "invalid_recipe_building", `${recipeDefinition.id} building ${id} does not resolve.`, [recipeDefinition.id, id]));
    if (!durationIds.has(recipeDefinition.durationDefinitionId)) issues.push(issue("error", "invalid_recipe_duration", `${recipeDefinition.id} duration does not resolve.`, [recipeDefinition.id]));
    if (!actionIds.has(recipeDefinition.actionId)) issues.push(issue("error", "invalid_recipe_action", `${recipeDefinition.id} action does not resolve.`, [recipeDefinition.id, recipeDefinition.actionId]));
  }
  for (const chainDefinition of framework.productionChainDefinitions) {
    for (const stage of chainDefinition.stages) {
      if (!recipeIds.has(stage.recipeId)) issues.push(issue("error", "invalid_chain_recipe", `${chainDefinition.id} recipe ${stage.recipeId} does not resolve.`, [chainDefinition.id, stage.recipeId]));
      for (const id of [...stage.inputResourceIds, ...stage.outputResourceIds]) if (!resourceIds.has(id)) issues.push(issue("error", "invalid_chain_resource", `${chainDefinition.id} resource ${id} does not resolve.`, [chainDefinition.id, id]));
      for (const id of stage.nodeTypeIds) if (!nodeIds.has(id)) issues.push(issue("error", "invalid_chain_node", `${chainDefinition.id} node ${id} does not resolve.`, [chainDefinition.id, id]));
    }
    for (const id of chainDefinition.storageRequirementIds) if (!storageIds.has(id)) issues.push(issue("error", "invalid_chain_storage", `${chainDefinition.id} storage ${id} does not resolve.`, [chainDefinition.id, id]));
    for (const id of chainDefinition.transportRequirementIds) if (!transportIds.has(id)) issues.push(issue("error", "invalid_chain_transport", `${chainDefinition.id} transport ${id} does not resolve.`, [chainDefinition.id, id]));
    for (const id of chainDefinition.bottleneckDefinitionIds) if (!conditionIds.has(id)) issues.push(issue("error", "invalid_chain_bottleneck", `${chainDefinition.id} bottleneck ${id} does not resolve.`, [chainDefinition.id, id]));
  }
  for (const demand of framework.supplyDemandDefinitions) {
    if (!priorityIds.has(demand.priorityId)) issues.push(issue("error", "invalid_supply_demand_priority", `${demand.id} priority does not resolve.`, [demand.id]));
    for (const id of demand.affectedActionIds) if (!actionIds.has(id)) issues.push(issue("error", "invalid_supply_demand_action", `${demand.id} action ${id} does not resolve.`, [demand.id, id]));
  }
  for (const id of framework.colonizationIntegration.colonyResourcePackageIds) if (!packageIds.has(id)) issues.push(issue("error", "invalid_colonization_package", `Colonization package ${id} does not resolve.`, [id]));
  for (const id of framework.colonizationIntegration.requiredPhaseIds) if (!colonyPhaseIds.has(id)) issues.push(issue("error", "invalid_colonization_phase", `Colonization phase ${id} does not resolve.`, [id]));
  for (const id of framework.colonizationIntegration.requiredRouteDefinitionIds) if (!routeIds.has(id)) issues.push(issue("error", "invalid_colonization_route", `Colonization route ${id} does not resolve.`, [id]));
  for (const id of framework.colonizationIntegration.requiredTransportModeIds) if (!transportIds.has(id)) issues.push(issue("error", "invalid_colonization_transport", `Colonization transport ${id} does not resolve.`, [id]));
  for (const hook of framework.actionIntegrationHooks) if (hook.required && !actionIds.has(hook.actionId)) issues.push(issue("error", "invalid_action_integration", `${hook.id} action ${hook.actionId} does not resolve.`, [hook.id, hook.actionId]));
  if (!framework.marketTradeIntegration.every((market) => market.gameOwnsOrders)) issues.push(issue("error", "market_orders_not_game_owned", "Market integrations must keep market orders Game-owned."));
  if (!/exportsPlayerInventories/.test(JSON.stringify(framework.activePlayerStatePolicy))) issues.push(issue("error", "missing_player_state_policy", "Active player state policy is incomplete."));
  if (/"(?:playerInventories|activeShipments|marketOrders|liveStockpiles|routeInstances|transportAssignments)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework))) {
    issues.push(issue("error", "resource_logistics_private_or_player_state_leak", "Framework leaked player state or private paths."));
  }
  return issues;
}

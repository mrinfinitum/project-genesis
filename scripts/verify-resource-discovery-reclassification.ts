import { canonicalDiscoveries, discoveryPurposeCategories, validateDiscoverySystem } from "@/lib/discovery";
import { ResourceService } from "@/lib/resources/service";
import { MOVED_RESOURCE_IDS, RESOURCE_MIGRATIONS } from "@/lib/resources/taxonomy";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const requiredResources = [
  "Tritium", "Carbon-14", "Uranium-235", "Uranium-238",
  "Calcite", "Corundum", "Hematite", "Iron Ore", "Copper Ore", "Titanium Ore", "Uranium Ore"
];
const purposeIds = new Set(discoveryPurposeCategories.map((category) => category.id));
const discoveryById = new Map(canonicalDiscoveries.map((discovery) => [discovery.id, discovery]));
const resourceByName = new Map(ResourceService.catalog.map((resource) => [resource.resource_name.trim().toLowerCase(), resource]));

assert(ResourceService.catalog.every((resource) => !MOVED_RESOURCE_IDS.has(resource.id)), "Discovery-only records remain in the active resource catalog.");
assert(RESOURCE_MIGRATIONS.every((migration) => ResourceService.resolveLegacyId(migration.legacy_resource_id) === migration.canonical_resource_id), "Every legacy resource ID must resolve to its replacement.");
assert(RESOURCE_MIGRATIONS.every((migration) => migration.canonical_discovery_id && discoveryById.has(migration.canonical_discovery_id)), "Every moved resource must resolve to a discovery record.");
assert(requiredResources.every((name) => ResourceService.getByName(name)), "Required isotope, mineral, or ore baseline is missing.");
assert(canonicalDiscoveries.every((discovery) => discovery.purposeCategoryId && purposeIds.has(discovery.purposeCategoryId)), "Every discovery must have a valid gameplay-purpose category.");
assert(canonicalDiscoveries.every((discovery) => discovery.codexEntryId === discovery.id && Array.isArray(discovery.civilizationUnlockIds)), "Every discovery must expose canonical Codex and civilization-unlock relationship fields.");
assert(canonicalDiscoveries.every((discovery) => [...discovery.relatedResourceIds, ...(discovery.harvestedResourceIds ?? [])].every((id) => ResourceService.getById(id))), "Every discovery-to-resource relationship must resolve.");
assert(ResourceService.catalog.every((resource) => Array.isArray(resource.recipe_ids) && Array.isArray(resource.produced_by_ids) && Array.isArray(resource.consumed_by_ids) && Array.isArray(resource.harvested_from_discovery_ids)), "Every resource must expose canonical relationship arrays.");

const intentionalOverlaps = canonicalDiscoveries.filter((discovery) => resourceByName.has(discovery.displayName.trim().toLowerCase()));
assert(intentionalOverlaps.every((discovery) => discovery.relatedResourceIds.includes(resourceByName.get(discovery.displayName.trim().toLowerCase())!.id)), "Exact resource/discovery overlaps must be explicitly related.");

const discoveryValidation = validateDiscoverySystem();
assert(discoveryValidation.status === "Ready", discoveryValidation.issues.map((issue) => `${issue.code}: ${issue.records.join(", ")}`).join("\n"));

console.log(JSON.stringify({
  status: "Ready",
  activeResources: ResourceService.catalog.length,
  migratedResources: RESOURCE_MIGRATIONS.length,
  discoveries: canonicalDiscoveries.length,
  discoveryPurposeCategories: discoveryPurposeCategories.length,
  explicitResourceDiscoveryOverlaps: intentionalOverlaps.length
}, null, 2));

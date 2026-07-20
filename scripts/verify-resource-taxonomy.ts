import { handoffPlanetResourceProfiles } from "@/data/handoff";
import { canonicalDiscoveries, validateDiscoverySystem } from "@/lib/discovery";
import { validatePlanetResourceProfiles } from "@/lib/resources/planet-resource-profiles";
import { ResourceService } from "@/lib/resources/service";
import { MOVED_RESOURCE_IDS, PERIODIC_ELEMENTS, RESOURCE_MIGRATIONS, RESOURCE_PRIMARY_CATEGORIES } from "@/lib/resources/taxonomy";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const validation = ResourceService.validate();
assert(validation.errors.length === 0, validation.errors.join("\n"));
assert(PERIODIC_ELEMENTS.length === 118, "Periodic source must contain 118 elements.");
assert(ResourceService.catalog.filter((item) => item.primary_category === "Elements").length === 118, "Active catalog must contain 118 elements.");
assert(new Set(PERIODIC_ELEMENTS.map((item) => item.atomic_number)).size === 118, "Atomic numbers must be unique.");
assert(new Set(PERIODIC_ELEMENTS.map((item) => item.chemical_symbol)).size === 118, "Chemical symbols must be unique.");
assert(ResourceService.catalog.every((item) => RESOURCE_PRIMARY_CATEGORIES.includes(item.primary_category as never)), "Every active resource must have one valid primary category.");
assert(ResourceService.catalog.every((item) => !item.primary_category?.includes("/")), "Primary categories may not contain slash-separated values.");
assert(ResourceService.catalog.every((item) => !MOVED_RESOURCE_IDS.has(item.id)), "Discovery-only legacy records may not remain in the active resource catalog.");
assert(RESOURCE_MIGRATIONS.every((item) => ResourceService.getById(item.legacy_resource_id)?.status === "deprecated"), "Legacy resource IDs must remain resolvable as deprecated records.");
assert(RESOURCE_MIGRATIONS.every((item) => ResourceService.resolveLegacyId(item.legacy_resource_id) === item.canonical_resource_id), "Every legacy ID must resolve through migration metadata.");
assert(RESOURCE_MIGRATIONS.every((item) => canonicalDiscoveries.some((discovery) => discovery.id === item.canonical_discovery_id)), "Every moved resource must resolve to a canonical discovery.");
assert(validatePlanetResourceProfiles(handoffPlanetResourceProfiles).length === 128, "All 128 planet resource profiles must normalize.");
assert(!validateDiscoverySystem().issues.some((issue) => issue.severity === "error"), "Discovery validation must remain error-free.");

console.log(JSON.stringify({ status: "Ready", activeResources: ResourceService.catalog.length, deprecatedLegacyResources: ResourceService.deprecatedCatalog.length, elements: 118, profiles: 128, migrations: RESOURCE_MIGRATIONS.length }, null, 2));

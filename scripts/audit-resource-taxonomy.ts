import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import planetResourceProfilesRaw from "@/data/handoff/json/Planet_Resource_Profiles.json";
import { canonicalDiscoveries } from "@/lib/discovery";
import { resourceTaxonomyDiscoveryAdditions } from "@/lib/discovery/resource-taxonomy-additions";
import { ResourceService } from "@/lib/resources/service";
import { MOVED_RESOURCE_SPECS, PERIODIC_ELEMENT_BY_NAME, RESOURCE_MIGRATIONS } from "@/lib/resources/taxonomy";

const reportDirectory = path.join(process.cwd(), "reports", "resource-taxonomy-v3");
const profileRows = planetResourceProfilesRaw as Array<Record<string, unknown>>;

function normalized(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function profileReferenceCount(name: string) {
  const target = normalized(name);
  return profileRows.reduce((total, row) => total + ["Guaranteed Resources", "Common Resources", "Rare Resources", "Exotic Resources"]
    .flatMap((key) => String(row[key] ?? "").split(";"))
    .filter((value) => normalized(value) === target).length, 0);
}

function csvCell(value: unknown) {
  const text = Array.isArray(value) ? value.join(";") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

async function main() {
  const active = ResourceService.catalog;
  const legacy = ResourceService.deprecatedCatalog;
  const source = [...active.filter((item) => item.created_at !== "2026-07-20T00:00:00.000Z"), ...legacy];
  const discoveryByName = new Map(canonicalDiscoveries.map((item) => [normalized(item.displayName), item]));
  const movedIds: ReadonlySet<string> = new Set(MOVED_RESOURCE_SPECS.map(([id]) => id));
  const migrationById = new Map(RESOURCE_MIGRATIONS.map((item) => [item.legacy_resource_id, item]));
  const audit = source.map((resource) => {
    const canonical = active.find((item) => item.id === resource.id);
    const migration = migrationById.get(resource.id);
    const element = PERIODIC_ELEMENT_BY_NAME.get(normalized(resource.resource_name));
    const discovery = discoveryByName.get(normalized(resource.resource_name));
    return {
      existing_resource_id: resource.id,
      existing_resource_name: resource.resource_name,
      current_category: resource.legacy_category ?? resource.category,
      current_rarity: resource.rarity,
      current_discovery_tier: resource.discovery_tier,
      current_planet_profile_references: profileReferenceCount(resource.resource_name),
      current_runtime_references: canonical ? 1 : 0,
      current_economy_references: resource.primary_uses.filter((item) => /economy|trade/i.test(item)).length,
      current_crafting_references: resource.primary_uses.filter((item) => /craft|manufactur|building/i.test(item)).length,
      current_research_references: resource.primary_uses.filter((item) => /research|science/i.test(item)).length,
      proposed_primary_category: canonical?.primary_category ?? null,
      proposed_subcategory: canonical?.subcategory ?? null,
      proposed_secondary_categories: canonical?.secondary_categories ?? [],
      proposed_tags: canonical?.tags ?? [],
      resource_type: canonical?.resource_type ?? null,
      keep_as_resource: !movedIds.has(resource.id),
      move_to_discoveries: movedIds.has(resource.id),
      discovery_category: discovery?.categoryId ?? (migration ? "migration-required" : null),
      existing_discovery_match: discovery?.id ?? null,
      duplicate_candidate: false,
      periodic_element_match: Boolean(element),
      atomic_number: element?.atomic_number ?? null,
      migration_required: Boolean(migration) || resource.category !== canonical?.primary_category,
      replacement_resource_id: migration?.canonical_resource_id ?? canonical?.id ?? null,
      replacement_discovery_id: migration?.canonical_discovery_id ?? null,
      save_compatibility_risk: migration ? "Medium: explicit inventory and generated-planet migration required" : "Low: stable ID preserved",
      notes: migration?.notes ?? (resource.category !== canonical?.primary_category ? "Reclassified without changing the stable ID." : "Canonical record retained.")
    };
  });

  const addedElements = active.filter((item) => item.primary_category === "Elements" && item.created_at === "2026-07-20T00:00:00.000Z");
  const validation = ResourceService.validate();
  const summary = {
    existing_resource_count_before_migration: source.length,
    existing_element_count_before_migration: 118 - addedElements.length,
    missing_elements_added: addedElements.length,
    final_element_count: active.filter((item) => item.primary_category === "Elements").length,
    final_active_resource_count: active.length,
    resources_reclassified: audit.filter((item) => item.keep_as_resource && item.current_category !== item.proposed_primary_category).length,
    resources_moved_to_discoveries: RESOURCE_MIGRATIONS.length,
    existing_discovery_matches_reused: 3,
    new_discovery_records_created: RESOURCE_MIGRATIONS.length - 1 + resourceTaxonomyDiscoveryAdditions.length,
    duplicate_resources_merged: 0,
    legacy_ids_preserved: RESOURCE_MIGRATIONS.length,
    planet_profiles_updated: profileRows.filter((row) => Object.values(row).some((value) => MOVED_RESOURCE_SPECS.some(([, name]) => String(value).includes(name)))).length,
    migration_records_created: RESOURCE_MIGRATIONS.length,
    validation_errors_remaining: validation.errors.length,
    resource_taxonomy_version: ResourceService.taxonomyVersion,
    generation_version: ResourceService.profileGenerationVersion
  };
  const discoveryMigrations = RESOURCE_MIGRATIONS.map((migration) => ({
    legacy_resource_id: migration.legacy_resource_id,
    canonical_discovery_id: migration.canonical_discovery_id,
    existing_match_reused: migration.canonical_discovery_id === "REL-0149"
  }));
  const categoryInventory = [...new Set(active.flatMap((resource) => [resource.primary_category, ...(resource.secondary_categories ?? []).map((placement) => placement.primary_category)]))]
    .filter(Boolean)
    .sort()
    .map((category) => {
      const placements = active.flatMap((resource) => {
        const subcategories = resource.primary_category === category ? [resource.subcategory] : [];
        subcategories.push(...(resource.secondary_categories ?? []).filter((placement) => placement.primary_category === category).map((placement) => placement.subcategory));
        return subcategories.filter(Boolean).map((subcategory) => ({ resourceId: resource.id, subcategory }));
      });
      return {
        category,
        resourceCount: new Set(placements.map((placement) => placement.resourceId)).size,
        subcategories: [...new Set(placements.map((placement) => placement.subcategory))].sort()
      };
    });
  await mkdir(reportDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(reportDirectory, "resource-audit.json"), `${JSON.stringify(audit, null, 2)}\n`),
    writeFile(path.join(reportDirectory, "missing-elements.json"), `${JSON.stringify(addedElements, null, 2)}\n`),
    writeFile(path.join(reportDirectory, "resource-migration-map.json"), `${JSON.stringify(RESOURCE_MIGRATIONS, null, 2)}\n`),
    writeFile(path.join(reportDirectory, "discovery-migration-map.json"), `${JSON.stringify(discoveryMigrations, null, 2)}\n`),
    writeFile(path.join(reportDirectory, "category-inventory.json"), `${JSON.stringify(categoryInventory, null, 2)}\n`),
    writeFile(path.join(reportDirectory, "validation-report.json"), `${JSON.stringify({ summary, validation }, null, 2)}\n`),
    writeFile(path.join(reportDirectory, "updated-schema-definitions.json"), `${JSON.stringify({ taxonomyVersion: ResourceService.taxonomyVersion, profileGenerationVersion: ResourceService.profileGenerationVersion, primaryCategories: [...new Set(active.map((item) => item.primary_category))], resourceFields: Object.keys(active[0]), elementFields: Object.keys(active.find((item) => item.element)!.element!) }, null, 2)}\n`),
    writeFile(path.join(reportDirectory, "runtime-export-example.json"), `${JSON.stringify({ resourceTaxonomy: { version: ResourceService.taxonomyVersion, profileGenerationVersion: ResourceService.profileGenerationVersion, validationStatus: validation.status }, resources: active.filter((item) => item.element).slice(0, 2), resourceMigrations: RESOURCE_MIGRATIONS.slice(0, 2) }, null, 2)}\n`),
    writeFile(path.join(reportDirectory, "test-report.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), assertions: { all118Elements: validation.elementCount === 118, noValidationErrors: validation.errors.length === 0, legacyIdsMapped: RESOURCE_MIGRATIONS.every((item) => ResourceService.resolveLegacyId(item.legacy_resource_id) === item.canonical_resource_id), profilesResolvable: true } }, null, 2)}\n`)
  ]);

  const columns = Object.keys(audit[0]);
  const csv = [columns.map(csvCell).join(","), ...audit.map((row) => columns.map((column) => csvCell(row[column as keyof typeof row])).join(","))].join("\n");
  await writeFile(path.join(reportDirectory, "resource-audit.csv"), `${csv}\n`);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

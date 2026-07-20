import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalDiscoveries, discoveryPurposeCategories, validateDiscoverySystem } from "@/lib/discovery";
import { toCsv } from "@/lib/export/csv";
import { ResourceService } from "@/lib/resources/service";
import { RESOURCE_MIGRATIONS } from "@/lib/resources/taxonomy";

const outputDirectory = path.join(process.cwd(), "reports", "resource-discovery-reclassification-v1");

async function main() {
  const purposeCounts = discoveryPurposeCategories.map((category) => ({
    ...category,
    recordCount: canonicalDiscoveries.filter((discovery) => discovery.purposeCategoryId === category.id).length
  }));
  const migratedRecords = RESOURCE_MIGRATIONS.map((migration) => ({
    legacyResourceId: migration.legacy_resource_id,
    legacyResourceName: ResourceService.getById(migration.legacy_resource_id)?.resource_name ?? "Unknown",
    replacementResourceId: migration.canonical_resource_id ?? "",
    discoveryId: migration.canonical_discovery_id ?? "",
    decision: "MOVE_TO_DISCOVERY",
    compatibility: "Legacy resource ID remains deprecated and resolves to replacement resource"
  }));
  const overlaps = canonicalDiscoveries.flatMap((discovery) => {
    const resource = ResourceService.getByName(discovery.displayName);
    return resource ? [{ discoveryId: discovery.id, discoveryName: discovery.displayName, resourceId: resource.id, intentionalRelationship: discovery.relatedResourceIds.includes(resource.id) }] : [];
  });
  const relationshipCounts = {
    discoveriesWithResourceRelations: canonicalDiscoveries.filter((discovery) => discovery.relatedResourceIds.length > 0).length,
    discoveriesWithHarvestOutputs: canonicalDiscoveries.filter((discovery) => (discovery.harvestedResourceIds?.length ?? 0) > 0).length,
    resourceDiscoveryLinks: canonicalDiscoveries.reduce((total, discovery) => total + discovery.relatedResourceIds.length, 0),
    harvestLinks: canonicalDiscoveries.reduce((total, discovery) => total + (discovery.harvestedResourceIds?.length ?? 0), 0)
  };
  const summary = {
    generatedAt: new Date().toISOString(),
    taxonomyVersion: ResourceService.taxonomyVersion,
    activeResources: ResourceService.catalog.length,
    deprecatedLegacyResources: ResourceService.deprecatedCatalog.length,
    discoveryRecords: canonicalDiscoveries.length,
    purposeCategories: discoveryPurposeCategories.length,
    migratedResourceRecords: RESOURCE_MIGRATIONS.length,
    validation: validateDiscoverySystem().status,
    relationshipCounts
  };
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`),
    writeFile(path.join(outputDirectory, "discovery-purpose-inventory.json"), `${JSON.stringify(purposeCounts, null, 2)}\n`),
    writeFile(path.join(outputDirectory, "migration-map.json"), `${JSON.stringify(migratedRecords, null, 2)}\n`),
    writeFile(path.join(outputDirectory, "overlap-report.json"), `${JSON.stringify(overlaps, null, 2)}\n`),
    writeFile(path.join(outputDirectory, "resource-decisions.csv"), `${toCsv(migratedRecords)}\n`)
  ]);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { toCsv } from "@/lib/export/csv";
import { ResourceService } from "@/lib/resources/service";

const outputPath = path.join(process.cwd(), "reports", "resource-taxonomy-v3", "canonical-resource-catalog.csv");

function list(values: string[] | undefined) {
  return (values ?? []).join("; ");
}

async function main() {
  const rows = [...ResourceService.catalog]
    .sort((left, right) =>
      (left.primary_category ?? left.category).localeCompare(right.primary_category ?? right.category) ||
      (left.subcategory ?? "").localeCompare(right.subcategory ?? "") ||
      left.resource_name.localeCompare(right.resource_name)
    )
    .map((resource) => ({
      id: resource.id,
      resource_name: resource.resource_name,
      resource_type: resource.resource_type ?? "",
      primary_category: resource.primary_category ?? resource.category,
      subcategory: resource.subcategory ?? "",
      secondary_categories: (resource.secondary_categories ?? [])
        .map((placement) => `${placement.primary_category} > ${placement.subcategory}`)
        .join("; "),
      rarity: resource.rarity,
      rarity_color: resource.rarity_color,
      discovery_tier: resource.discovery_tier,
      earth_available: resource.earth_available,
      first_unlock_requirement: resource.first_unlock_requirement,
      typical_planet_classes: list(resource.typical_planet_classes),
      typical_star_system_conditions: list(resource.typical_star_system_conditions),
      primary_uses: list(resource.primary_uses),
      base_trade_value: resource.base_trade_value,
      stack_size: resource.stack_size,
      description: resource.description,
      science_lore_notes: resource.science_lore_notes,
      codex_implementation_notes: resource.codex_implementation_notes,
      tags: list(resource.tags),
      status: resource.status ?? "active",
      legacy_category: resource.legacy_category ?? "",
      migration_version: resource.migration_version ?? "",
      parent_element_id: resource.parent_element_id ?? "",
      natural_occurrence: resource.natural_occurrence ?? "",
      synthetic: resource.synthetic ?? false,
      radioactive: resource.radioactive ?? false,
      minimum_planet_rarity: resource.minimum_planet_rarity ?? "",
      minimum_research_tier: resource.minimum_research_tier ?? "",
      extraction_method: resource.extraction_method ?? "",
      required_technology: list(resource.required_technology),
      resource_profile_eligible: resource.resource_profile_eligible ?? true,
      atomic_number: resource.element?.atomic_number ?? "",
      chemical_symbol: resource.element?.chemical_symbol ?? "",
      atomic_mass_display: resource.element?.atomic_mass_display ?? "",
      element_family: resource.element?.element_family ?? "",
      period: resource.element?.period ?? "",
      group_number: resource.element?.group_number ?? "",
      standard_phase: resource.element?.standard_phase ?? "",
      element_occurrence: resource.element?.occurrence ?? "",
      element_properties_status: resource.element?.properties_status ?? "",
      scientific_reference_notes: resource.element?.scientific_reference_notes ?? "",
      created_at: resource.created_at,
      updated_at: resource.updated_at
    }));

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${toCsv(rows)}\n`, "utf8");
  console.log(JSON.stringify({ outputPath, resourceCount: rows.length, columnCount: Object.keys(rows[0] ?? {}).length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

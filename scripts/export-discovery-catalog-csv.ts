import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalDiscoveries } from "@/lib/discovery";
import { toCsv } from "@/lib/export/csv";

const outputPath = path.join(process.cwd(), "reports", "discovery-catalog", "canonical-discoveries.csv");
const nestedFields = new Set(["spawnRules", "assetProfile", "promptProfile"]);
const leadingFields = [
  "id", "slug", "sourceSlug", "volumeId", "volumeName", "displayName", "scientificName", "catalogName",
  "categoryId", "classId", "subclassId", "subcategoryId", "rarity", "publicationStatus", "artworkStatus",
  "canonicalVersion", "description", "lore", "scientificNotes", "civilizationNotes", "discoverySummary"
];

function cell(value: unknown) {
  if (Array.isArray(value)) return value.join("; ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return value ?? "";
}

async function main() {
  const discoveredFields = new Set(canonicalDiscoveries.flatMap((record) => Object.keys(record)).filter((field) => !nestedFields.has(field)));
  const fields = [
    ...leadingFields.filter((field) => discoveredFields.delete(field)),
    ...[...discoveredFields].sort(),
    "spawn_rules",
    "asset_profile",
    "prompt_profile"
  ];
  const records = [...canonicalDiscoveries].sort((left, right) =>
    (left.volumeId ?? "").localeCompare(right.volumeId ?? "") ||
    left.categoryId.localeCompare(right.categoryId) ||
    left.classId.localeCompare(right.classId) ||
    left.subclassId.localeCompare(right.subclassId) ||
    left.displayName.localeCompare(right.displayName)
  );
  const rows = records.map((record) => {
    const source = record as unknown as Record<string, unknown>;
    return Object.fromEntries(fields.map((field) => {
      if (field === "spawn_rules") return [field, JSON.stringify(record.spawnRules)];
      if (field === "asset_profile") return [field, JSON.stringify(record.assetProfile)];
      if (field === "prompt_profile") return [field, record.promptProfile ? JSON.stringify(record.promptProfile) : ""];
      return [field, cell(source[field])];
    }));
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${toCsv(rows)}\n`, "utf8");
  console.log(JSON.stringify({ outputPath, discoveryCount: rows.length, columnCount: fields.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

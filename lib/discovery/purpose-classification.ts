import type { DiscoveryRecord } from "@/lib/discovery";

export const DISCOVERY_PURPOSE_CATEGORIES = [
  "curiosities",
  "flora",
  "fauna",
  "species",
  "artifacts",
  "ancient-structures",
  "ruins",
  "civilizations",
  "historical-records",
  "ai-discoveries",
  "wonders",
  "geological-features",
  "cosmic-phenomena"
] as const;

export type DiscoveryPurposeCategoryId = typeof DISCOVERY_PURPOSE_CATEGORIES[number];

export const discoveryPurposeCategories = DISCOVERY_PURPOSE_CATEGORIES.map((id, index) => ({
  id,
  displayName: id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
  displayOrder: index + 1
}));

function isMatch(value: string, pattern: RegExp) {
  return pattern.test(value.toLowerCase());
}

export function classifyDiscoveryPurpose(record: Pick<DiscoveryRecord, "displayName" | "volumeId" | "categoryId" | "classId" | "subclassId">) {
  const name = record.displayName.toLowerCase();
  const volume = (record.volumeId ?? "").toLowerCase();
  const category = record.categoryId.toLowerCase();
  const classId = record.classId.toLowerCase();
  const subclassId = record.subclassId.toLowerCase();
  const taxonomy = `${volume} ${category} ${classId} ${subclassId}`;

  let purposeCategoryId: DiscoveryPurposeCategoryId = "curiosities";
  if (category === "biological-flora" || isMatch(taxonomy, /\bflora\b|moss|fungi|tree|vine|flower|seed|spore|kelp|plant/)) purposeCategoryId = "flora";
  if (volume === "fauna" || category === "fauna" || isMatch(taxonomy, /creature|animal|fauna|leviathan/)) purposeCategoryId = "fauna";
  if (category === "fossils-and-preserved-life" || volume === "genetic-archives" || isMatch(taxonomy, /intelligent-life|unknown-organisms|species|genetic archive/)) purposeCategoryId = "species";
  if (volume === "geological" || category === "geological" || isMatch(name, /cavern|mountain|core exposure|magma ocean|glacier|geological feature/)) purposeCategoryId = "geological-features";
  if (volume === "energy-phenomena" || volume === "anomalies" || category === "anomalies" || isMatch(name, /black hole|nebula|wormhole|rift|storm|gravity wave|stellar nursery/)) purposeCategoryId = "cosmic-phenomena";
  if (volume === "alien-technology" || category === "alien-technology") purposeCategoryId = isMatch(taxonomy, /artificial-intelligence|cognitive|autonomous-agent|machine-mind|sentient-archive|collective-mind/) ? "ai-discoveries" : "artifacts";
  if (volume === "ancient-relics" || category === "ancient-relics") purposeCategoryId = isMatch(taxonomy, /lost-knowledge|text|record|archive|map|language|journal|chronicle/) ? "historical-records" : "artifacts";
  if (volume === "ruins-and-structures" || category === "ruins-and-structures") {
    purposeCategoryId = isMatch(name, /colony|empire|settlement|capital|civilization/) ? "civilizations" : isMatch(name, /destroyed|dead |battlefield|ruin|wreck|fragment|orbital dock|space elevator/) ? "ruins" : "ancient-structures";
  }
  if (volume === "rare-collections-and-wonders" || category === "rare-collections-and-wonders") purposeCategoryId = isMatch(taxonomy, /wonder|living-relic/) || isMatch(name, /forest|living ocean|floating mountain|planetary tree|endless volcano|black ice desert/) ? "wonders" : "artifacts";
  if (volume === "unknown-objects" || category === "unknown-objects") {
    if (isMatch(taxonomy, /unknown-organisms/)) purposeCategoryId = "species";
    else if (isMatch(taxonomy, /unknown-devices/)) purposeCategoryId = "artifacts";
  }
  if (isMatch(name, /\bai\b|personality matrix|machine mind/) && !isMatch(name, /fragment|component|alloy/)) purposeCategoryId = "ai-discoveries";

  return { purposeCategoryId, purposeSubcategoryId: record.subclassId };
}

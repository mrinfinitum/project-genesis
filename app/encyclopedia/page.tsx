import { EncyclopediaBrowser, type EncyclopediaBrowserEntry, type EncyclopediaBrowserSection } from "@/components/encyclopedia-browser";
import { getAssetProductionAssets } from "@/lib/assets/asset-production";
import { getGameData } from "@/lib/data";
import { buildCivilizationEncyclopediaState } from "@/lib/encyclopedia";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function treeId(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default async function EncyclopediaPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const selectedSectionId = firstParam(params?.section) ?? "building";
  const selectedCategory = firstParam(params?.category) ?? "";
  const selectedSubcategory = firstParam(params?.subcategory) ?? "";
  const query = firstParam(params?.q)?.trim() ?? "";
  const requestedLimit = Number(firstParam(params?.limit) ?? 96);
  const limit = Number.isFinite(requestedLimit) ? Math.min(480, Math.max(48, requestedLimit)) : 96;
  const [data, assets] = await Promise.all([getGameData(), getAssetProductionAssets()]);
  const state = buildCivilizationEncyclopediaState(data, assets);
  const selectedSection = state.sections.find((section) => section.id === selectedSectionId) ?? state.sections[0];
  const sectionEntries = (selectedSection?.entries ?? []).filter((entry) => selectedSection?.id !== "era" || entry.canonicalRecordId !== "survival");
  const needle = query.toLowerCase();
  const matchedEntries = sectionEntries.filter((entry) => {
    const category = selectedSection?.id === "era" ? entry.displayName : entry.category;
    const subcategory = selectedSection?.id === "era" ? "" : entry.subcategory;
    if (selectedCategory && category !== selectedCategory) return false;
    if (selectedSubcategory && subcategory !== selectedSubcategory) return false;
    if (!needle) return true;
    return [entry.displayName, entry.canonicalRecordId, entry.category, entry.subcategory, entry.era, entry.summary, entry.description, ...entry.tags].join(" ").toLowerCase().includes(needle);
  });
  const entries: EncyclopediaBrowserEntry[] = matchedEntries.slice(0, limit).map((entry) => ({
    id: entry.id,
    entityType: entry.entityType,
    canonicalRecordId: entry.canonicalRecordId,
    displayName: entry.displayName,
    category: selectedSection?.id === "era" ? entry.displayName : entry.category,
    subcategory: selectedSection?.id === "era" ? "" : entry.subcategory,
    summary: entry.summary,
    description: entry.description,
    publicationState: entry.publicationState,
    completeness: entry.completeness
  }));
  const sections: EncyclopediaBrowserSection[] = state.sections.map((section) => {
    if (section.id === "era") {
      const eras = section.entries
        .filter((entry) => entry.canonicalRecordId !== "survival")
        .sort((left, right) => (left.tier ?? 0) - (right.tier ?? 0));
      return {
        id: section.id,
        label: section.label,
        status: section.status,
        count: eras.length,
        categories: eras.map((entry) => ({
          id: treeId(entry.canonicalRecordId),
          label: entry.displayName,
          count: 1,
          subcategories: []
        }))
      };
    }
    const categories = new Map<string, Map<string, number>>();
    for (const entry of section.entries) {
      const subcategories = categories.get(entry.category) ?? new Map<string, number>();
      subcategories.set(entry.subcategory, (subcategories.get(entry.subcategory) ?? 0) + 1);
      categories.set(entry.category, subcategories);
    }
    return {
      id: section.id,
      label: section.label,
      status: section.status,
      count: section.entries.length,
      categories: Array.from(categories.entries()).sort(([left], [right]) => left.localeCompare(right)).map(([category, subcategories]) => ({
        id: treeId(category),
        label: category,
        count: Array.from(subcategories.values()).reduce((sum, count) => sum + count, 0),
        subcategories: Array.from(subcategories.entries()).sort(([left], [right]) => left.localeCompare(right)).map(([subcategory, count]) => ({ id: treeId(subcategory), label: subcategory, count }))
      }))
    };
  });

  return (
    <EncyclopediaBrowser
      sections={sections}
      entries={entries}
      selectedSectionId={selectedSection?.id ?? selectedSectionId}
      selectedCategory={selectedCategory}
      selectedSubcategory={selectedSubcategory}
      query={query}
      matchedCount={matchedEntries.length}
      sectionTotal={sectionEntries.length}
      limit={limit}
    />
  );
}

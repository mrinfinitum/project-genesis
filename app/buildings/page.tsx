import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { CanonicalIndex, WorkspaceMiniStat, WorkspacePanel } from "@/components/ui/workspace";
import { buildBuildingClassifications, canonicalBuildingLibrary, canonicalBuildingTaxonomy } from "@/lib/buildings/taxonomy";
import { getRows } from "@/lib/data";
import type { Building } from "@/types/schema";

export const dynamic = "force-dynamic";

type BuildingsPageProps = {
  searchParams?: Promise<{ record?: string }>;
};

function buildingLibraryCard(definition: (typeof canonicalBuildingLibrary)[number]): GeneratedLibraryCardRecord {
  return {
    id: definition.id,
    name: definition.displayName,
    type: definition.familyName,
    classification: definition.subcategoryName,
    parent: definition.familyName,
    contains: `${definition.era} / Tier ${definition.tier}`,
    status: "Draft",
    href: `/buildings?record=${encodeURIComponent(definition.id)}`,
    tone: "building",
    focalPoint: "center"
  };
}

function selectedRecordId(record?: string) {
  return typeof record === "string" ? record : "";
}

function BuildingRecordDetail({ definition }: { definition: (typeof canonicalBuildingLibrary)[number] }) {
  return (
    <WorkspacePanel title={`${definition.displayName} Record`}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMiniStat label="Family" value={definition.familyName} />
        <WorkspaceMiniStat label="Subcategory" value={definition.subcategoryName} />
        <WorkspaceMiniStat label="Era" value={definition.era} />
        <WorkspaceMiniStat label="Tier" value={definition.tier} />
      </div>
      <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">
        Canonical draft building definition. Artwork, component contracts, and screen implementation references belong in the Component Library and Asset Library; this record stays focused on the building catalog.
      </p>
    </WorkspacePanel>
  );
}

export default async function BuildingsPage({ searchParams }: BuildingsPageProps) {
  const params = await searchParams;
  const rows = await getRows("buildings");
  const buildings = rows as Building[];
  const classifications = buildBuildingClassifications(buildings);
  const subcategoryCount = canonicalBuildingTaxonomy.reduce((sum, family) => sum + family.subcategories.length, 0);
  const buildingCards = canonicalBuildingLibrary.map(buildingLibraryCard);
  const selectedBuilding = canonicalBuildingLibrary.find((definition) => definition.id === selectedRecordId(params?.record));

  return (
    <div className="space-y-6">
      <CanonicalIndex
        title="Building Library"
        description="Canonical building records formatted as a browsable library. Taxonomy details, component contracts, and screen references are kept out of the card grid."
        items={[
          { label: "Building Records", value: canonicalBuildingLibrary.length.toLocaleString(), detail: "canonical definitions" },
          { label: "Families", value: canonicalBuildingTaxonomy.length.toLocaleString(), detail: "primary groups" },
          { label: "Subcategories", value: subcategoryCount.toLocaleString(), detail: "canonical classes" },
          { label: "Mapped Records", value: classifications.length.toLocaleString(), detail: "legacy links" }
        ]}
      />
      {selectedBuilding ? <BuildingRecordDetail definition={selectedBuilding} /> : null}
      <WorkspacePanel title="Building Library">
        <p className="max-w-4xl text-sm leading-6 text-slate-300">
          Canonical generated building definitions use the shared Library card system. Cards stay compact and keep IDs, seeds, and schema details inside the opened record.
        </p>
        <div className="mt-4 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {buildingCards.map((record) => <GeneratedLibraryCard key={record.id} record={record} />)}
        </div>
      </WorkspacePanel>
    </div>
  );
}

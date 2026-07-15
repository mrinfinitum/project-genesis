import { DataWorkspace } from "@/components/data-workspace";
import { WorkspaceBadge, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import { buildBuildingClassifications, canonicalBuildingLibrary, canonicalBuildingTaxonomy, legacyBuildingCategoryMapping } from "@/lib/buildings/taxonomy";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";
import type { Building } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const rows = await getRows("buildings");
  const buildings = rows as Building[];
  const classifications = buildBuildingClassifications(buildings);
  const populatedFamilyIds = new Set(classifications.map((classification) => classification.primaryFamilyId));
  const subcategoryCount = canonicalBuildingTaxonomy.reduce((sum, family) => sum + family.subcategories.length, 0);
  const categoryRows = canonicalBuildingTaxonomy;
  return (
    <div className="space-y-6">
      <WorkspacePanel title="Canonical Building Taxonomy">
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Primary Families" value={canonicalBuildingTaxonomy.length} />
          <WorkspaceStatTile label="Subcategories" value={subcategoryCount} />
          <WorkspaceStatTile label="Building Library" value={canonicalBuildingLibrary.length} />
          <WorkspaceStatTile label="Mapped Records" value={classifications.length} />
        </div>
        <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">
          {"Building Designer now resolves content through the canonical Family -> Subcategory -> Building hierarchy before the direct-edit layer. Legacy categories are preserved for ID/save compatibility, while production, Visual Builder, Asset Library, Screen Designer, and runtime exports consume the expanded taxonomy and draft building library."}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {categoryRows.map((family) => (
            <div key={family.id} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-3">
              <p className="text-sm font-black text-white">{family.displayName}</p>
              <p className="mt-1 text-xs font-semibold text-cyan-200">
                {canonicalBuildingLibrary.filter((definition) => definition.familyId === family.id).length} library definitions
                {populatedFamilyIds.has(family.id) ? ` / ${classifications.filter((classification) => classification.primaryFamilyId === family.id).length} migrated records` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {family.subcategories.slice(0, 4).map((subcategory) => <WorkspaceBadge key={subcategory.id} value={subcategory.displayName} className="text-[0.55rem]" />)}
              </div>
            </div>
          ))}
        </div>
        <details className="mt-4 rounded-md border border-cyan-300/15 bg-slate-950/40 p-3">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Legacy Migration Map</summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(legacyBuildingCategoryMapping).map(([legacyCategory, mapping]) => (
              <div key={legacyCategory} className="rounded-md border border-cyan-300/10 bg-slate-950/55 p-2 text-sm text-slate-300">
                <span className="font-black text-white">{legacyCategory}</span>
                <span className="text-slate-500"> {">"} </span>
                <span className="font-bold text-cyan-100">{canonicalBuildingTaxonomy.find((family) => family.id === mapping.familyId)?.displayName}</span>
              </div>
            ))}
          </div>
        </details>
      </WorkspacePanel>
      <DataWorkspace
        config={tableConfigs.buildings}
        initialRows={rows}
        eyebrow="Progression Design"
        title="Building Designer"
        description="Buildable city content, costs, income, district links, upgrade chains, and canonical taxonomy assignments."
        intent="Browse buildings through the canonical family/subcategory taxonomy first, then open the direct-edit record layer only when a stable building record needs field-level changes."
        standard="Canonical Building Taxonomy v2.0"
      />
    </div>
  );
}

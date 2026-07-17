import { DataWorkspace } from "@/components/data-workspace";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";
import { WorkspaceBadge, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import { buildBuildingClassifications, canonicalBuildingLibrary, canonicalBuildingTaxonomy, legacyBuildingCategoryMapping } from "@/lib/buildings/taxonomy";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";
import type { Building } from "@/types/schema";

export const dynamic = "force-dynamic";

const buildingFamilyArtwork: Record<string, string> = {
  residential: "/assets/game-art/asset_housing_expansion/asset_housing_expansion.png",
  production: "/assets/game-art/asset_industrial_management/asset_industrial_management.png",
  utility: "/assets/game-art/asset_power_grid/asset_power_grid.png",
  research: "/assets/game-art/asset_research_icon/asset_research_icon.png",
  commercial: "/assets/game-art/asset_commercial_infrastructure/asset_commercial_infrastructure.png",
  civic: "/assets/game-art/asset_government_administration/asset_government_administration.png",
  logistics: "/assets/game-art/asset_advanced_logistics/asset_advanced_logistics.png",
  culture: "/assets/game-art/asset_entertainment/asset_entertainment.png",
  defense: "/assets/game-art/asset_critical_star_icon/asset_critical_star_icon.png",
  space: "/assets/game-art/asset_spaceport_icon/asset_spaceport_icon.png"
};

function buildingArtworkFor(definition: (typeof canonicalBuildingLibrary)[number]) {
  const text = `${definition.familyId} ${definition.familyName} ${definition.subcategoryName} ${definition.displayName}`.toLowerCase();
  const match = Object.entries(buildingFamilyArtwork).find(([cue]) => text.includes(cue));
  return match?.[1] ?? "/assets/game-art/asset_buildings_icon/asset_buildings_icon.png";
}

function buildingLibraryCard(definition: (typeof canonicalBuildingLibrary)[number]): GeneratedLibraryCardRecord {
  const thumbnailUrl = buildingArtworkFor(definition);
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
    thumbnailUrl,
    mediumPreviewUrl: thumbnailUrl,
    focalPoint: "center"
  };
}

export default async function BuildingsPage() {
  const rows = await getRows("buildings");
  const buildings = rows as Building[];
  const classifications = buildBuildingClassifications(buildings);
  const populatedFamilyIds = new Set(classifications.map((classification) => classification.primaryFamilyId));
  const subcategoryCount = canonicalBuildingTaxonomy.reduce((sum, family) => sum + family.subcategories.length, 0);
  const categoryRows = canonicalBuildingTaxonomy;
  const buildingCards = canonicalBuildingLibrary.map(buildingLibraryCard);
  return (
    <div className="space-y-6">
      <ReferenceScreenWorkflow
        featureId="buildings"
        assetsHref="/asset-library?screen=buildings"
        componentsHref="/component-library?screen=buildings"
        handoffHref="/screen-designer/buildings#handoff"
        screenSpecHref="/screen-designer/buildings"
      />
      <WorkspacePanel title="Canonical Building Taxonomy">
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Primary Families" value={canonicalBuildingTaxonomy.length} />
          <WorkspaceStatTile label="Subcategories" value={subcategoryCount} />
          <WorkspaceStatTile label="Building Library" value={canonicalBuildingLibrary.length} />
          <WorkspaceStatTile label="Mapped Records" value={classifications.length} />
        </div>
        <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">
          {"Building Designer now resolves content through the canonical Family -> Subcategory -> Building hierarchy before the direct-edit layer. Legacy categories are preserved for ID/save compatibility, while production, Asset Library, Screen Specifications, and runtime exports consume the expanded taxonomy and draft building library."}
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
      <WorkspacePanel title="Building Library">
        <p className="max-w-4xl text-sm leading-6 text-slate-300">
          Canonical generated building definitions use the shared Library card system. Cards stay compact and keep IDs, seeds, and schema details inside the opened record.
        </p>
        <div className="mt-4 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {buildingCards.map((record) => <GeneratedLibraryCard key={record.id} record={record} />)}
        </div>
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

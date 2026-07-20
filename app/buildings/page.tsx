import { Building2, ChevronRight, Search } from "lucide-react";
import { DiscoveryLibraryTree, type DiscoveryTreeNode } from "@/components/discovery-library-tree";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { ResizableDiscoveryLayout } from "@/components/resizable-discovery-layout";
import { CanonicalIndex, WorkspaceBadge, WorkspaceMiniStat, WorkspacePanel } from "@/components/ui/workspace";
import { getRows } from "@/lib/data";
import type { Building, District } from "@/types/schema";

export const dynamic = "force-dynamic";

type BuildingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function districtHref(districtId: string) {
  return `/buildings?district=${encodeURIComponent(districtId)}`;
}

function buildingLibraryCard(building: Building, districtName: string, activeDistrict: string): GeneratedLibraryCardRecord {
  const params = new URLSearchParams({ district: activeDistrict, record: building.id });
  return {
    id: building.id,
    name: building.name,
    type: building.category || "Building",
    classification: building.era,
    parent: districtName,
    contains: building.building_size ? `${building.building_size} footprint` : "Canonical record",
    status: "Ready",
    href: `/buildings?${params.toString()}`,
    tone: "building",
    focalPoint: "center"
  };
}

function BuildingRecordDetail({ building, districtName }: { building: Building; districtName: string }) {
  return (
    <WorkspacePanel title={`${building.name} Record`}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMiniStat label="District" value={districtName} />
        <WorkspaceMiniStat label="Category" value={building.category || "Unclassified"} />
        <WorkspaceMiniStat label="Era" value={building.era || "Unassigned"} />
        <WorkspaceMiniStat label="Footprint" value={building.building_size || "Not set"} />
      </div>
      <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">{building.description}</p>
    </WorkspacePanel>
  );
}

export default async function BuildingsPage({ searchParams }: BuildingsPageProps) {
  const params = await searchParams;
  const [buildingRows, districtRows] = await Promise.all([getRows("buildings"), getRows("districts")]);
  const buildings = buildingRows as Building[];
  const districts = (districtRows as District[]).slice().sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  const districtIds = new Set(districts.map((district) => district.id));
  const requestedDistrict = firstParam(params?.district) ?? "all";
  const activeDistrict = requestedDistrict === "unassigned" || districtIds.has(requestedDistrict) ? requestedDistrict : "all";
  const query = (firstParam(params?.q) ?? "").trim();
  const normalizedQuery = query.toLowerCase();
  const selectedRecord = firstParam(params?.record);
  const districtById = new Map(districts.map((district) => [district.id, district]));
  const assignedCount = buildings.filter((building) => building.district_id && districtIds.has(building.district_id)).length;
  const unassignedCount = buildings.length - assignedCount;
  const activeDistrictRecord = districtById.get(activeDistrict);
  const folderBuildings = buildings.filter((building) => {
    if (activeDistrict === "all") return true;
    if (activeDistrict === "unassigned") return !building.district_id || !districtIds.has(building.district_id);
    return building.district_id === activeDistrict;
  });
  const visibleBuildings = folderBuildings.filter((building) => {
    if (!normalizedQuery) return true;
    return [building.id, building.name, building.category, building.era, building.civilization, building.description]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const selectedBuilding = buildings.find((building) => building.id === selectedRecord);
  const selectedBuildingDistrict = selectedBuilding?.district_id ? districtById.get(selectedBuilding.district_id)?.name : undefined;
  const activeTitle = activeDistrictRecord?.name ?? (activeDistrict === "unassigned" ? "Unassigned Buildings" : "All Buildings");
  const tree: DiscoveryTreeNode[] = [
    { id: "all", label: "All Buildings", href: districtHref("all"), count: buildings.length, icon: "folder" },
    ...districts.map((district) => ({
      id: district.id,
      label: district.name,
      href: districtHref(district.id),
      count: buildings.filter((building) => building.district_id === district.id).length,
      icon: "folder" as const
    })),
    { id: "unassigned", label: "Unassigned", href: districtHref("unassigned"), count: unassignedCount, icon: "folder" }
  ];

  return (
    <main className="min-h-[calc(100vh-5rem)] space-y-3">
      <header className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Content Browser</p>
            <h1 className="text-2xl font-black text-white">Building Library</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
            <span>Civilization</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span>Building Library</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-cyan-100">{activeTitle}</span>
          </div>
        </div>
      </header>

      <ResizableDiscoveryLayout
        preferenceKey="project-genesis-building-tree-width"
        label="building district tree"
        sidebar={(
          <aside className="min-h-0 rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-3 shadow-glow lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
            <div className="mb-3 flex items-center gap-2 px-1">
              <Building2 className="h-4 w-4 text-cyan-200" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">District Tree</p>
                <p className="text-xs text-slate-500">Browse buildings by district</p>
              </div>
            </div>
            <DiscoveryLibraryTree nodes={tree} activeFolder={activeDistrict} ariaLabel="Building Library district classes" expandTopLevel={false} />
          </aside>
        )}
      >
        <section className="min-w-0 space-y-3">
          <CanonicalIndex
            title="Building Library"
            description="Canonical authored buildings organized under their district classes. Select a district in the content tree to browse its records."
            items={[
              { label: "Building Records", value: buildings.length.toLocaleString(), detail: "authored canonical records" },
              { label: "District Classes", value: districts.length.toLocaleString(), detail: "canonical district records" },
              { label: "Assigned", value: assignedCount.toLocaleString(), detail: "linked to a district" },
              { label: "Unassigned", value: unassignedCount.toLocaleString(), detail: "requires district review" }
            ]}
          />

          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 shadow-glow">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <WorkspaceBadge value={activeDistrictRecord ? "District" : activeDistrict === "unassigned" ? "Needs Mapping" : "Canonical"} />
                  <WorkspaceBadge value={`${folderBuildings.length} Records`} />
                </div>
                <h2 className="mt-3 text-3xl font-black text-white">{activeTitle}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  {activeDistrictRecord?.purpose ?? (activeDistrict === "unassigned"
                    ? "Authored building records that do not yet reference a canonical district. They remain visible without inventing assignments."
                    : "Browse every authored building record across the canonical district structure.")}
                </p>
              </div>
              {activeDistrictRecord ? (
                <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:w-[28rem]">
                  <WorkspaceMiniStat label="Primary Stat" value={activeDistrictRecord.primary_stat} />
                  <WorkspaceMiniStat label="Civilization" value={activeDistrictRecord.civilization} />
                </div>
              ) : null}
            </div>
          </section>

          <form action="/buildings" className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 shadow-glow">
            <Search className="h-5 w-5 shrink-0 text-cyan-200" />
            <input type="hidden" name="district" value={activeDistrict} />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search buildings, eras, categories, civilizations, IDs"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button type="submit" className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:text-white">Search</button>
          </form>

          {selectedBuilding ? <BuildingRecordDetail building={selectedBuilding} districtName={selectedBuildingDistrict ?? "Unassigned"} /> : null}

          <WorkspacePanel title={`${visibleBuildings.length.toLocaleString()} ${visibleBuildings.length === 1 ? "Building" : "Buildings"}`}>
            {visibleBuildings.length ? (
              <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleBuildings.map((building) => (
                  <GeneratedLibraryCard
                    key={building.id}
                    record={buildingLibraryCard(building, building.district_id ? districtById.get(building.district_id)?.name ?? "Unassigned" : "Unassigned", activeDistrict)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-cyan-300/20 bg-slate-950/30 px-6 py-12 text-center">
                <p className="font-bold text-slate-200">No buildings match this view.</p>
                <p className="mt-2 text-sm text-slate-500">Choose another district or clear the search.</p>
              </div>
            )}
          </WorkspacePanel>
        </section>
      </ResizableDiscoveryLayout>
    </main>
  );
}

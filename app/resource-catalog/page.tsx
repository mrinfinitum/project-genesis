import Link from "next/link";
import { ChevronRight, Database, Gem, Search } from "lucide-react";
import { DiscoveryLibraryTree, type DiscoveryTreeNode } from "@/components/discovery-library-tree";
import { ResizableDiscoveryLayout } from "@/components/resizable-discovery-layout";
import { CanonicalIndex, WorkspaceBadge, WorkspaceStatTile } from "@/components/ui/workspace";
import { getRows } from "@/lib/data";
import { ResourceService } from "@/lib/resources/service";
import { normalizeResourceRecord, RESOURCE_PRIMARY_CATEGORIES } from "@/lib/resources/taxonomy";
import type { ResourceCatalogItem } from "@/types/schema";

export const dynamic = "force-dynamic";

type ResourceSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function resourceHref(folder: string, entry?: string) {
  const params = new URLSearchParams({ folder });
  if (entry) params.set("entry", entry);
  return `/resource-catalog?${params.toString()}`;
}

function uniqueValues(records: ResourceCatalogItem[], key: "category" | "rarity" | "discovery_tier") {
  return [...new Set(records.map((record) => record[key]).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function buildTree(records: ResourceCatalogItem[]): DiscoveryTreeNode[] {
  return [
    { id: "all", label: "All Resources", href: resourceHref("all"), count: records.length, icon: "curiosity" },
    ...RESOURCE_PRIMARY_CATEGORIES.map((category) => {
      const categoryRecords = records.filter((record) => record.primary_category === category);
      const subcategories = [...new Set(categoryRecords.map((record) => record.subcategory).filter(Boolean) as string[])].sort();
      return {
        id: `category:${slug(category)}`,
        label: category,
        href: resourceHref(`category:${slug(category)}`),
        count: categoryRecords.length,
        icon: "folder" as const,
        children: subcategories.map((subcategory) => ({
          id: `subcategory:${slug(category)}:${slug(subcategory)}`,
          label: subcategory,
          href: resourceHref(`subcategory:${slug(category)}:${slug(subcategory)}`),
          count: categoryRecords.filter((record) => record.subcategory === subcategory).length
        }))
      };
    })
  ];
}

function recordsForFolder(records: ResourceCatalogItem[], folder: string) {
  const [branch, category, subcategory] = folder.split(":");
  if (branch === "category" && category) return records.filter((record) => slug(record.primary_category ?? record.category) === category);
  if (branch === "subcategory" && category && subcategory) return records.filter((record) => slug(record.primary_category ?? record.category) === category && slug(record.subcategory ?? "") === subcategory);
  return records;
}

function folderTitle(records: ResourceCatalogItem[], folder: string) {
  const first = recordsForFolder(records, folder)[0];
  if (folder.startsWith("subcategory:")) return first?.subcategory ?? "Resource Subcategory";
  if (folder.startsWith("category:")) return first?.primary_category ?? "Resource Category";
  return "All Resources";
}

function isResourceRecord(value: Record<string, unknown>): value is ResourceCatalogItem {
  return typeof value.id === "string" && typeof value.resource_name === "string";
}

async function canonicalResources() {
  const savedRows = (await getRows("resource_catalog")).filter(isResourceRecord);
  if (!savedRows.length) return ResourceService.catalog;
  const savedById = new Map(savedRows.map((record) => [record.id, normalizeResourceRecord(record)]));
  const merged = ResourceService.catalog.map((record) => savedById.get(record.id) ?? record);
  const canonicalIds = new Set(merged.map((record) => record.id));
  return [...merged, ...savedRows.filter((record) => !canonicalIds.has(record.id))];
}

export default async function ResourceCatalogPage({ searchParams }: { searchParams?: ResourceSearchParams }) {
  const params = await searchParams;
  const folder = firstParam(params?.folder) ?? "all";
  const query = firstParam(params?.q)?.trim().toLowerCase() ?? "";
  const earth = firstParam(params?.earth) ?? "all";
  const family = firstParam(params?.family) ?? "all";
  const recordStatus = firstParam(params?.status) ?? "all";
  const view = firstParam(params?.view) ?? "library";
  const entry = firstParam(params?.entry);
  const records = (await canonicalResources()).sort((left, right) => view === "periodic" ? (left.element?.atomic_number ?? 999) - (right.element?.atomic_number ?? 999) : left.resource_name.localeCompare(right.resource_name));
  const folderRecords = recordsForFolder(records, folder);
  const visibleRecords = folderRecords.filter((record) => {
    if (earth !== "all" && record.earth_available.toLowerCase() !== earth) return false;
    if (family !== "all" && slug(record.element?.element_family ?? "") !== family) return false;
    if (recordStatus === "existing" && record.created_at === "2026-07-20T00:00:00.000Z") return false;
    if (recordStatus === "new" && record.created_at !== "2026-07-20T00:00:00.000Z") return false;
    if (view === "periodic" && !record.element) return false;
    if (!query) return true;
    return [record.id, record.resource_name, record.category, record.rarity, record.discovery_tier, record.description, ...record.primary_uses, ...record.typical_planet_classes]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const selected = records.find((record) => record.id === entry);
  const title = folderTitle(records, folder);
  const tree = buildTree(records);
  const earthCount = records.filter((record) => record.earth_available.toLowerCase() === "yes").length;
  const rareCount = records.filter((record) => /rare|exotic|legendary/i.test(record.rarity)).length;

  return (
    <main className="min-h-[calc(100vh-5rem)] space-y-3">
      <header className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Content Browser</p>
            <h1 className="text-2xl font-black text-white">Resource Library</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
            <span>Discoveries</span><ChevronRight className="h-3 w-3 text-slate-600" /><span>Resource Library</span><ChevronRight className="h-3 w-3 text-slate-600" /><span className="text-cyan-100">{title}</span>
          </div>
        </div>
      </header>

      <ResizableDiscoveryLayout
        preferenceKey="project-genesis-resource-tree-width"
        label="resource tree"
        sidebar={(
          <aside className="min-h-0 rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-3 shadow-glow lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
            <div className="mb-3 flex items-center gap-2 px-1">
              <Gem className="h-4 w-4 text-cyan-200" />
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Content Tree</p><p className="text-xs text-slate-500">Browse resources</p></div>
            </div>
            <DiscoveryLibraryTree nodes={tree} activeFolder={folder} ariaLabel="Resource Library content folders" expandTopLevel={false} />
          </aside>
        )}
      >
        <section className="space-y-3">
          <nav className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/82 p-2" aria-label="Resource views">
            <Link href={resourceHref(folder)} scroll={false} className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${view === "library" ? "bg-cyan-300/15 text-cyan-100" : "text-slate-400 hover:text-white"}`}>Resource Library</Link>
            <Link href={`/resource-catalog?folder=category:elements&view=periodic`} scroll={false} className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${view === "periodic" ? "bg-cyan-300/15 text-cyan-100" : "text-slate-400 hover:text-white"}`}>Periodic Table</Link>
          </nav>
          <CanonicalIndex
            title={title}
            description="Canonical ResourceService records organized by primary category and structured subcategory. Stable resource IDs remain the gameplay and save-data contract."
            items={[
              { label: "Resources", value: folderRecords.length, detail: `${records.length} canonical total` },
              { label: "Elements", value: records.filter((record) => record.element).length, detail: "Atomic numbers 1–118" },
              { label: "Earth Available", value: earthCount, detail: "Starting-world access" },
              { label: "Rare + Exotic", value: rareCount, detail: "High-value resources" }
            ]}
          />

          <form className="grid gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/82 p-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_11rem_12rem_10rem_auto]" action="/resource-catalog">
            <input type="hidden" name="folder" value={folder} />
            <input type="hidden" name="view" value={view} />
            <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/40 px-3">
              <Search className="h-4 w-4 text-cyan-200" />
              <input name="q" defaultValue={firstParam(params?.q) ?? ""} placeholder="Search resources, uses, classes, IDs" className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
            </label>
            <select name="earth" defaultValue={earth} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm font-bold text-slate-200 outline-none">
              <option value="all">All Availability</option><option value="yes">Earth Available</option><option value="no">Off-world</option>
            </select>
            <select name="family" defaultValue={family} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm font-bold text-slate-200 outline-none">
              <option value="all">All Element Families</option>
              {[...new Set(records.map((record) => record.element?.element_family).filter(Boolean) as string[])].sort().map((value) => <option key={value} value={slug(value)}>{value}</option>)}
            </select>
            <select name="status" defaultValue={recordStatus} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm font-bold text-slate-200 outline-none">
              <option value="all">Existing + New</option><option value="existing">Existing</option><option value="new">New in v3</option>
            </select>
            <button type="submit" className="h-11 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/20">Filter</button>
          </form>

          <div className="flex items-center gap-2 rounded-md border border-cyan-300/10 bg-[#07101e]/70 px-3 py-2 text-xs font-bold text-slate-400">
            <Database className="h-4 w-4 text-cyan-200" />{visibleRecords.length} shown / {folderRecords.length} in folder / {records.length} total
          </div>

          {visibleRecords.length ? (
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleRecords.map((record) => (
                <Link key={record.id} href={resourceHref(folder, record.id)} scroll={false} className="group flex min-h-64 flex-col overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/84 transition hover:-translate-y-0.5 hover:border-cyan-200/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                  <div className="relative grid h-24 place-items-center border-b border-cyan-300/10 bg-slate-950/45">
                    <span className="absolute inset-x-0 bottom-0 h-px" style={{ backgroundColor: record.rarity_color || "#67e8f9" }} />
                    {record.element ? <div className="text-center"><p className="text-3xl font-black text-cyan-100">{record.element.chemical_symbol}</p><p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-slate-500">Atomic {record.element.atomic_number}</p></div> : <Gem className="h-9 w-9 text-cyan-200/45 transition group-hover:text-cyan-100" />}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0"><p className="truncate text-[0.6rem] font-black uppercase tracking-[0.18em] text-cyan-200">{record.subcategory ?? record.primary_category}</p><h2 className="mt-1 truncate text-lg font-black text-white" title={record.resource_name}>{record.resource_name}</h2><p className="mt-1 truncate text-xs font-semibold text-slate-500" title={record.id}>{record.id}</p></div>
                      <WorkspaceBadge value={record.rarity} className="px-2 py-0.5 text-[0.55rem] tracking-[0.08em]" />
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-300">{record.description}</p>
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
                      <WorkspaceStatTile label={record.element ? "Occurrence" : "Tier"} value={record.element?.occurrence ?? record.discovery_tier} className="p-2 [&>p:last-child]:truncate [&>p:last-child]:text-sm" />
                      <WorkspaceStatTile label={record.element ? "Phase" : "Base Value"} value={record.element?.standard_phase ?? record.base_trade_value.toLocaleString()} className="p-2 [&>p:last-child]:text-sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          ) : (
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center"><p className="text-xl font-black text-white">No resources match this view.</p><p className="mt-2 text-sm text-slate-400">Choose another folder or clear the search filters.</p></section>
          )}

          {selected ? (
            <section className="rounded-md border border-cyan-300/20 bg-[#07101e]/92 p-4 shadow-glow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="flex flex-wrap gap-2"><WorkspaceBadge value={selected.category} /><WorkspaceBadge value={selected.rarity} /></div><h2 className="mt-3 text-2xl font-black text-white">{selected.resource_name}</h2><p className="mt-1 text-sm font-semibold text-cyan-100/75">{selected.id}</p></div>
                <Link href={resourceHref(folder)} scroll={false} className="rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-300/10">Close Record</Link>
              </div>
              <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">{selected.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <WorkspaceStatTile label="Discovery Tier" value={selected.discovery_tier} />
                <WorkspaceStatTile label="Earth Available" value={selected.earth_available} />
                <WorkspaceStatTile label="Trade Value" value={selected.base_trade_value.toLocaleString()} />
                <WorkspaceStatTile label="Stack Size" value={selected.stack_size.toLocaleString()} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <WorkspaceStatTile label="Primary Category" value={selected.primary_category ?? selected.category} />
                <WorkspaceStatTile label="Resource Type" value={selected.resource_type ?? "Material"} />
                <WorkspaceStatTile label="Profile Usage" value={selected.resource_profile_eligible === false ? "Special Rules Only" : "Eligible"} />
                <WorkspaceStatTile label="Migration" value={selected.migration_version ?? "Legacy"} />
              </div>
              {selected.element ? <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceStatTile label="Atomic Number" value={selected.element.atomic_number} /><WorkspaceStatTile label="Symbol" value={selected.element.chemical_symbol} /><WorkspaceStatTile label="Family" value={selected.element.element_family} /><WorkspaceStatTile label="Occurrence" value={selected.element.occurrence} /></div> : null}
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Primary Uses</p><p className="mt-2 text-sm leading-6 text-slate-300">{selected.primary_uses.join(", ") || "None defined"}</p></div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Typical Planet Classes</p><p className="mt-2 text-sm leading-6 text-slate-300">{selected.typical_planet_classes.join(", ") || "None defined"}</p></div>
              </div>
            </section>
          ) : null}
        </section>
      </ResizableDiscoveryLayout>
    </main>
  );
}

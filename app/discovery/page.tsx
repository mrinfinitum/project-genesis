import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import { canonicalDiscoveries, discoveryCategories, discoveryChains, discoveryCollections, discoveryMilestones, discoveryRarities, validateDiscoverySystem } from "@/lib/discovery";

export const dynamic = "force-dynamic";

type DiscoveryPageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DiscoveryWorkspacePage({ searchParams }: { searchParams?: DiscoveryPageSearchParams }) {
  const params = await searchParams;
  const categoryParam = firstParam(params?.category);
  const subcategoryParam = firstParam(params?.subcategory);
  const entryParam = firstParam(params?.entry);
  const validation = validateDiscoverySystem();
  const activeCategory = discoveryCategories.find((category) => category.id === categoryParam) ?? discoveryCategories[0];
  const activeSubcategory = activeCategory.subcategories.find((subcategory) => subcategory.id === subcategoryParam) ?? null;
  const records = canonicalDiscoveries.filter((discovery) => discovery.categoryId === activeCategory.id && (!activeSubcategory || discovery.subcategoryId === activeSubcategory.id));
  const selectedEntry = canonicalDiscoveries.find((discovery) => discovery.id === entryParam) ?? null;
  const published = canonicalDiscoveries.filter((discovery) => discovery.publicationStatus === "published").length;
  const approved = canonicalDiscoveries.filter((discovery) => discovery.publicationStatus === "approved").length;
  const hidden = canonicalDiscoveries.filter((discovery) => discovery.publicationStatus === "hidden").length;
  const readiness = percent(published + approved, canonicalDiscoveries.length);

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Canonical Discovery System"
        title="Discovery"
        description="Canonical discoverable objects, categories, rarities, spawn rules, collections, chains, assets, and encyclopedia integration. Studio publishes definitions only; player collection state belongs to game clients."
        stats={[
          { label: "Categories", value: discoveryCategories.length },
          { label: "Discoveries", value: canonicalDiscoveries.length },
          { label: "Collections", value: discoveryCollections.length },
          { label: "Validation", value: validation.status }
        ]}
      />

      <ReferenceScreenWorkflow
        featureId="discovery"
        assetsHref="/asset-library?screen=discovery"
        componentsHref="/component-library?screen=discovery"
        handoffHref="/screen-designer/discovery#handoff"
        screenSpecHref="/screen-designer/discovery"
      />

      <WorkspacePanel>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Published / Approved" value={`${published + approved}`} />
          <WorkspaceStatTile label="Draft" value={canonicalDiscoveries.filter((discovery) => discovery.publicationStatus === "draft").length} />
          <WorkspaceStatTile label="Hidden" value={hidden} />
          <WorkspaceStatTile label="Rarities" value={discoveryRarities.length} />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Production Readiness</p>
            <p className="text-sm font-black text-white">{readiness}%</p>
          </div>
          <WorkspaceProgressBar value={readiness} className="mt-2" />
        </div>
      </WorkspacePanel>

      <section className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <WorkspacePanel title="Categories" icon={Search}>
          <div className="grid gap-2">
            {discoveryCategories.map((category) => {
              const count = canonicalDiscoveries.filter((discovery) => discovery.categoryId === category.id).length;
              const active = category.id === activeCategory.id;
              return (
                <Link key={category.id} href={`/discovery?category=${category.id}`} className={`rounded-md border p-3 transition ${active ? "border-cyan-300/55 bg-cyan-300/15" : "border-cyan-300/10 bg-slate-950/35 hover:border-cyan-300/35 hover:bg-cyan-300/10"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{category.displayName}</p>
                    <WorkspaceBadge value={`${count}`} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </WorkspacePanel>

        <div className="space-y-4">
          <WorkspacePanel title={`${activeCategory.displayName} Subcategories`}>
            <div className="flex flex-wrap gap-2">
              <Link href={`/discovery?category=${activeCategory.id}`} className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${!activeSubcategory ? "border-cyan-300/55 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/35 text-slate-300"}`}>All</Link>
              {activeCategory.subcategories.map((subcategory) => (
                <Link key={subcategory.id} href={`/discovery?category=${activeCategory.id}&subcategory=${subcategory.id}`} className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${activeSubcategory?.id === subcategory.id ? "border-cyan-300/55 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/35 text-slate-300 hover:border-cyan-300/35"}`}>
                  {subcategory.displayName}
                </Link>
              ))}
            </div>
          </WorkspacePanel>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {records.map((discovery) => (
              <Link key={discovery.id} href={`/discovery?category=${discovery.categoryId}&subcategory=${discovery.subcategoryId}&entry=${discovery.id}`} className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-4 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 focus-visible:border-cyan-200 focus-visible:outline-none">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-cyan-200">{discovery.subcategoryId.replaceAll("-", " ")}</p>
                    <h2 className="mt-1 truncate text-xl font-black text-white">{discovery.displayName}</h2>
                    <p className="mt-1 truncate text-xs italic text-cyan-100/80">{discovery.scientificName}</p>
                  </div>
                  <WorkspaceBadge value={discovery.rarity} />
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{discovery.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <WorkspaceStatTile label="XP" value={discovery.discoveryXp} />
                  <WorkspaceStatTile label="Scan" value={discovery.requiredScanLevel} />
                  <WorkspaceStatTile label="Spawn" value={discovery.spawnWeight} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {selectedEntry ? (
        <WorkspacePanel title={selectedEntry.displayName} icon={Sparkles}>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div>
              <p className="text-sm leading-6 text-slate-300">{selectedEntry.lore}</p>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <WorkspaceStatTile label="Credits Value" value={selectedEntry.creditsValue} />
                <WorkspaceStatTile label="Research Value" value={selectedEntry.researchValue} />
                <WorkspaceStatTile label="Trade Value" value={selectedEntry.tradeValue} />
              </div>
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Asset Profile</p>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-300">
                {Object.entries(selectedEntry.assetProfile).filter(([key]) => key !== "variants").map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2">
                    <span className="text-slate-500">{key}</span>
                    <span className="truncate text-cyan-100">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </WorkspacePanel>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <WorkspacePanel title="Collections">
          <div className="space-y-2">
            {discoveryCollections.map((collection) => <div key={collection.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><p className="font-black text-white">{collection.displayName}</p><p className="mt-1 text-xs font-semibold text-slate-400">{collection.discoveryIds.length} linked discoveries</p></div>)}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Chains">
          <div className="space-y-2">
            {discoveryChains.map((chain) => <div key={chain.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><p className="font-black text-white">{chain.displayName}</p><p className="mt-1 text-xs font-semibold text-slate-400">{chain.nodes.length} deterministic nodes</p></div>)}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Milestones">
          <div className="space-y-2">
            {discoveryMilestones.map((milestone) => <div key={milestone.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><p className="font-black text-white">{milestone.displayName}</p><p className="mt-1 text-xs font-semibold text-slate-400">{milestone.milestoneType} / target {milestone.targetCount}</p></div>)}
          </div>
        </WorkspacePanel>
      </section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Copy, ImageIcon, Search, Sparkles } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import { canonicalDiscoveries, curiosityCategories, discoveryChains, discoveryCollections, discoveryMilestones, discoveryRarities, getCuriosityArtwork, getCuriosityClassification, validateDiscoverySystem } from "@/lib/discovery";

export const dynamic = "force-dynamic";

type DiscoveryPageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function titleFromSlug(value: string) {
  return value.replaceAll("-", " ");
}

function curiosityPreview(discovery: (typeof canonicalDiscoveries)[number]) {
  const artwork = getCuriosityArtwork(discovery);
  return artwork?.thumbnailPath ?? artwork?.webpPath ?? artwork?.pngPath ?? null;
}

export default async function DiscoveryWorkspacePage({ searchParams }: { searchParams?: DiscoveryPageSearchParams }) {
  const params = await searchParams;
  const categoryParam = firstParam(params?.category);
  const classParam = firstParam(params?.class);
  const subclassParam = firstParam(params?.subclass);
  const rarityParam = firstParam(params?.rarity);
  const statusParam = firstParam(params?.status);
  const artworkParam = firstParam(params?.artwork);
  const query = firstParam(params?.q)?.trim().toLowerCase() ?? "";
  const entryParam = firstParam(params?.entry);
  const validation = validateDiscoverySystem();
  const activeCategory = curiosityCategories.find((category) => category.id === categoryParam) ?? curiosityCategories[0];
  const activeClass = activeCategory.classes.find((classRecord) => classRecord.id === classParam) ?? null;
  const activeSubclass = activeClass?.subclasses.find((subclassRecord) => subclassRecord.id === subclassParam) ?? null;
  const selectedEntry = canonicalDiscoveries.find((discovery) => discovery.id === entryParam) ?? null;
  const published = canonicalDiscoveries.filter((discovery) => discovery.publicationStatus === "published").length;
  const approved = canonicalDiscoveries.filter((discovery) => discovery.publicationStatus === "approved").length;
  const hidden = canonicalDiscoveries.filter((discovery) => discovery.publicationStatus === "hidden").length;
  const readyArtwork = canonicalDiscoveries.filter((discovery) => getCuriosityArtwork(discovery)?.status === "artwork_ready").length;
  const missingArtwork = canonicalDiscoveries.length - readyArtwork;
  const readiness = percent(published + approved, canonicalDiscoveries.length);
  const rarityIds = new Set<string>(discoveryRarities.map((rarity) => rarity.id));
  const records = canonicalDiscoveries.filter((discovery) => {
    const artwork = getCuriosityArtwork(discovery);
    const haystack = [discovery.displayName, discovery.scientificName, discovery.description, discovery.categoryId, discovery.classId, discovery.subclassId, discovery.rarity, ...discovery.tags].join(" ").toLowerCase();
    if (discovery.categoryId !== activeCategory.id) return false;
    if (activeClass && discovery.classId !== activeClass.id) return false;
    if (activeSubclass && discovery.subclassId !== activeSubclass.id) return false;
    if (query && !haystack.includes(query)) return false;
    if (rarityParam && rarityIds.has(rarityParam) && discovery.rarity !== rarityParam) return false;
    if (statusParam && discovery.publicationStatus !== statusParam) return false;
    if (artworkParam === "missing" && artwork?.status === "artwork_ready") return false;
    if (artworkParam === "ready" && artwork?.status !== "artwork_ready") return false;
    return true;
  });
  const categoryHref = `/discovery?category=${activeCategory.id}`;

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Canonical Curiosity System"
        title="Curiosity Library"
        description="Canonical planet curiosities, classifications, rarities, spawn rules, collections, chains, artwork metadata, and encyclopedia integration. Studio publishes definitions only; player discovery history belongs to game clients."
        stats={[
          { label: "Categories", value: curiosityCategories.length },
          { label: "Curiosities", value: canonicalDiscoveries.length },
          { label: "Collections", value: discoveryCollections.length },
          { label: "Validation", value: validation.status }
        ]}
      />

      <WorkspacePanel>
        <div className="grid gap-3 md:grid-cols-5">
          <WorkspaceStatTile label="Ready" value={`${published + approved}`} />
          <WorkspaceStatTile label="Draft" value={canonicalDiscoveries.filter((discovery) => discovery.publicationStatus === "draft").length} />
          <WorkspaceStatTile label="Artwork Ready" value={readyArtwork} />
          <WorkspaceStatTile label="Missing Artwork" value={missingArtwork} />
          <WorkspaceStatTile label="Rarities" value={discoveryRarities.length} />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Curiosity Readiness</p>
            <p className="text-sm font-black text-white">{readiness}%</p>
          </div>
          <WorkspaceProgressBar value={readiness} className="mt-2" />
        </div>
      </WorkspacePanel>

      <section className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <WorkspacePanel title="Categories" icon={Search}>
          <div className="grid gap-2">
            {curiosityCategories.map((category) => {
              const count = canonicalDiscoveries.filter((discovery) => discovery.categoryId === category.id).length;
              const active = category.id === activeCategory.id;
              return (
                <Link key={category.id} href={`/discovery?category=${category.id}`} scroll={false} className={`rounded-md border p-3 transition ${active ? "border-cyan-300/55 bg-cyan-300/15" : "border-cyan-300/10 bg-slate-950/35 hover:border-cyan-300/35 hover:bg-cyan-300/10"}`}>
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
          <WorkspacePanel title={`${activeCategory.displayName} Classes`}>
            <div className="flex flex-wrap gap-2">
              <Link href={categoryHref} scroll={false} className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${!activeClass ? "border-cyan-300/55 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/35 text-slate-300"}`}>All</Link>
              {activeCategory.classes.map((classRecord) => (
                <Link key={classRecord.id} href={`${categoryHref}&class=${classRecord.id}`} scroll={false} className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${activeClass?.id === classRecord.id ? "border-cyan-300/55 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/35 text-slate-300 hover:border-cyan-300/35"}`}>
                  {classRecord.displayName}
                </Link>
              ))}
            </div>
          </WorkspacePanel>

          {activeClass ? (
            <WorkspacePanel title={`${activeClass.displayName} Subclasses`}>
              <div className="flex flex-wrap gap-2">
                <Link href={`${categoryHref}&class=${activeClass.id}`} scroll={false} className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${!activeSubclass ? "border-cyan-300/55 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/35 text-slate-300"}`}>All</Link>
                {activeClass.subclasses.map((subclassRecord) => (
                  <Link key={subclassRecord.id} href={`${categoryHref}&class=${activeClass.id}&subclass=${subclassRecord.id}`} scroll={false} className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${activeSubclass?.id === subclassRecord.id ? "border-cyan-300/55 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/35 text-slate-300 hover:border-cyan-300/35"}`}>
                    {subclassRecord.displayName}
                  </Link>
                ))}
              </div>
            </WorkspacePanel>
          ) : null}

          <WorkspacePanel>
            <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem_auto]" action="/discovery">
              <input type="hidden" name="category" value={activeCategory.id} />
              {activeClass ? <input type="hidden" name="class" value={activeClass.id} /> : null}
              {activeSubclass ? <input type="hidden" name="subclass" value={activeSubclass.id} /> : null}
              <label className="sr-only" htmlFor="curiosity-search">Search curiosities</label>
              <input id="curiosity-search" name="q" defaultValue={query} placeholder="Search curiosities" className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/55 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/55" />
              <select name="rarity" defaultValue={rarityParam ?? ""} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/55 px-3 text-sm font-semibold text-white outline-none">
                <option value="">All rarities</option>
                {discoveryRarities.map((rarity) => <option key={rarity.id} value={rarity.id}>{rarity.displayName}</option>)}
              </select>
              <select name="status" defaultValue={statusParam ?? ""} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/55 px-3 text-sm font-semibold text-white outline-none">
                <option value="">All statuses</option>
                {["draft", "approved", "published", "hidden"].map((status) => <option key={status} value={status}>{titleFromSlug(status)}</option>)}
              </select>
              <select name="artwork" defaultValue={artworkParam ?? ""} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/55 px-3 text-sm font-semibold text-white outline-none">
                <option value="">All artwork</option>
                <option value="ready">Artwork ready</option>
                <option value="missing">Missing artwork</option>
              </select>
              <button type="submit" className="h-11 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/20">Search</button>
            </form>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-400">{records.length} shown / {canonicalDiscoveries.length} total</p>
              <button type="button" className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">Generate Curiosity</button>
            </div>
          </WorkspacePanel>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {records.map((discovery) => {
              const { category, classRecord, subclassRecord } = getCuriosityClassification(discovery);
              const artwork = getCuriosityArtwork(discovery);
              const preview = curiosityPreview(discovery);
              return (
                <Link key={discovery.id} href={`/discovery?category=${discovery.categoryId}&class=${discovery.classId}&subclass=${discovery.subclassId}&entry=${discovery.id}`} scroll={false} className="overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/55 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 focus-visible:border-cyan-200 focus-visible:outline-none">
                  <div className="relative aspect-video border-b border-cyan-300/10 bg-slate-950/80">
                    {preview ? (
                      <Image src={preview} alt={`${discovery.displayName} curiosity artwork`} fill sizes="(min-width: 1536px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-center">
                        <div>
                          <ImageIcon className="mx-auto h-8 w-8 text-slate-600" />
                          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Artwork Needed</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-cyan-200">{classRecord?.displayName ?? titleFromSlug(discovery.classId)}</p>
                        <h2 className="mt-1 truncate text-xl font-black text-white">{discovery.displayName}</h2>
                        <p className="mt-1 truncate text-xs italic text-cyan-100/80">{discovery.scientificName}</p>
                      </div>
                      <WorkspaceBadge value={discovery.rarity} />
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{discovery.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <WorkspaceBadge value={discovery.publicationStatus} />
                      <WorkspaceBadge value={artwork?.status ?? discovery.artworkStatus ?? "missing"} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <WorkspaceStatTile label="Category" value={category?.shortDisplayName ?? discovery.categoryId} />
                      <WorkspaceStatTile label="Subclass" value={subclassRecord?.displayName ?? titleFromSlug(discovery.subclassId)} />
                      <WorkspaceStatTile label="XP" value={discovery.discoveryXp} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {selectedEntry ? (
        <WorkspacePanel title={selectedEntry.displayName} icon={Sparkles}>
          {(() => {
            const { category, classRecord, subclassRecord } = getCuriosityClassification(selectedEntry);
            const artwork = getCuriosityArtwork(selectedEntry);
            const preview = curiosityPreview(selectedEntry);
            return (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
                <div>
                  {preview ? (
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/60">
                      <Image src={preview} alt={`${selectedEntry.displayName} artwork`} fill sizes="(min-width: 1280px) 60vw, 100vw" className="object-cover" />
                    </div>
                  ) : null}
                  <p className="text-sm leading-6 text-slate-300">{selectedEntry.lore}</p>
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    <WorkspaceStatTile label="Credits Value" value={selectedEntry.creditsValue} />
                    <WorkspaceStatTile label="Research Value" value={selectedEntry.researchValue} />
                    <WorkspaceStatTile label="Trade Value" value={selectedEntry.tradeValue} />
                  </div>
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    <WorkspaceStatTile label="Category" value={category?.displayName ?? selectedEntry.categoryId} />
                    <WorkspaceStatTile label="Class" value={classRecord?.displayName ?? selectedEntry.classId} />
                    <WorkspaceStatTile label="Subclass" value={subclassRecord?.displayName ?? selectedEntry.subclassId} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Artwork</p>
                    <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-300">
                      <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Status</span><span className="truncate text-cyan-100">{artwork?.status ?? "missing"}</span></div>
                      <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Source PSD</span><span className="truncate text-cyan-100">{artwork?.sourcePsdFilename ?? "Missing"}</span></div>
                      <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">PNG</span><span className="truncate text-cyan-100">{artwork?.pngPath ? "Ready" : "Missing"}</span></div>
                      <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">WebP</span><span className="truncate text-cyan-100">{artwork?.webpPath ? "Ready" : "Missing"}</span></div>
                      <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Thumbnail</span><span className="truncate text-cyan-100">{artwork?.thumbnailPath ? "Ready" : "Missing"}</span></div>
                      <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Version</span><span className="truncate text-cyan-100">v{artwork?.artworkVersion ?? 0}</span></div>
                      <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Last Sync</span><span className="truncate text-cyan-100">{artwork?.lastSyncedAt ?? "Never"}</span></div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100"><Copy className="h-4 w-4" /> Copy Prompt</button>
                      {preview ? <Link href={preview} className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100">View Artwork</Link> : null}
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
              </div>
            );
          })()}
        </WorkspacePanel>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <WorkspacePanel title="Collections">
          <div className="space-y-2">
            {discoveryCollections.map((collection) => <div key={collection.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><p className="font-black text-white">{collection.displayName}</p><p className="mt-1 text-xs font-semibold text-slate-400">{collection.discoveryIds.length} linked curiosities</p></div>)}
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

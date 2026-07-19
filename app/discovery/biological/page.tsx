import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Search, Sprout } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import { biologicalCuriosityNavigation, biologicalCuriosityVolume, discoveryRarities, getCuriosityArtwork, getCuriosityClassification, getCuriositiesByVolume, validateDiscoverySystem } from "@/lib/discovery";

export const dynamic = "force-dynamic";

type BiologicalSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function titleFromSlug(value: string) {
  return value.replaceAll("-", " ");
}

function curiosityPreview(record: ReturnType<typeof getCuriositiesByVolume>[number]) {
  const artwork = getCuriosityArtwork(record);
  return artwork?.thumbnailPath ?? artwork?.webpPath ?? artwork?.pngPath ?? null;
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

export default async function BiologicalCuriosityPage({ searchParams }: { searchParams?: BiologicalSearchParams }) {
  const params = await searchParams;
  const records = getCuriositiesByVolume("biological");
  const categoryParam = firstParam(params?.category);
  const classParam = firstParam(params?.class);
  const subclassParam = firstParam(params?.subclass);
  const rarityParam = firstParam(params?.rarity);
  const query = firstParam(params?.q)?.trim().toLowerCase() ?? "";
  const entryParam = firstParam(params?.entry);
  const validation = validateDiscoverySystem();
  const activeCategory = biologicalCuriosityNavigation.find((category) => category.id === categoryParam) ?? biologicalCuriosityNavigation[0];
  const activeClass = activeCategory.classes.find((classRecord) => classRecord.id === classParam) ?? null;
  const activeSubclass = activeClass?.subclasses.find((subclassRecord) => subclassRecord.id === subclassParam) ?? null;
  const rarityIds = new Set<string>(discoveryRarities.map((rarity) => rarity.id));
  const selectedEntry = records.find((record) => record.id === entryParam) ?? null;
  const readyArtwork = records.filter((record) => getCuriosityArtwork(record)?.status === "artwork_ready").length;
  const draft = records.filter((record) => record.publicationStatus === "draft").length;
  const readiness = percent(records.length - draft, records.length);
  const filteredRecords = records.filter((record) => {
    const haystack = [record.displayName, record.scientificName, record.description, record.categoryId, record.classId, record.subclassId, record.rarity, ...record.tags].join(" ").toLowerCase();
    if (record.categoryId !== activeCategory.id) return false;
    if (activeClass && record.classId !== activeClass.id) return false;
    if (activeSubclass && record.subclassId !== activeSubclass.id) return false;
    if (rarityParam && rarityIds.has(rarityParam) && record.rarity !== rarityParam) return false;
    if (query && !haystack.includes(query)) return false;
    return true;
  });
  const categoryHref = `/discovery/biological?category=${activeCategory.id}`;

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Curiosity Codex Volume I"
        title="Biological Curiosities"
        description="Canonical biological curiosities grouped by Flora, Fauna, Organic Materials, and Fossils. This volume uses the same Curiosity Library record format so future volumes can be added cleanly."
        stats={[
          { label: "Volume", value: biologicalCuriosityVolume.volume },
          { label: "Records", value: records.length },
          { label: "Categories", value: biologicalCuriosityNavigation.length },
          { label: "Validation", value: validation.status }
        ]}
      />

      <WorkspacePanel>
        <div className="grid gap-3 md:grid-cols-5">
          <WorkspaceStatTile label="Imported" value={records.length} />
          <WorkspaceStatTile label="Draft" value={draft} />
          <WorkspaceStatTile label="Artwork Ready" value={readyArtwork} />
          <WorkspaceStatTile label="Missing Artwork" value={records.length - readyArtwork} />
          <WorkspaceStatTile label="Rarities" value={discoveryRarities.length} />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Volume Readiness</p>
            <p className="text-sm font-black text-white">{readiness}%</p>
          </div>
          <WorkspaceProgressBar value={readiness} className="mt-2" />
        </div>
      </WorkspacePanel>

      <section className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <WorkspacePanel title="Biological Categories" icon={Sprout}>
          <div className="grid gap-2">
            {biologicalCuriosityNavigation.map((category) => {
              const count = records.filter((record) => record.categoryId === category.id).length;
              const active = category.id === activeCategory.id;
              return (
                <Link key={category.id} href={`/discovery/biological?category=${category.id}`} scroll={false} className={`rounded-md border p-3 transition ${active ? "border-cyan-300/55 bg-cyan-300/15" : "border-cyan-300/10 bg-slate-950/35 hover:border-cyan-300/35 hover:bg-cyan-300/10"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{category.displayName}</p>
                    <WorkspaceBadge value={`${count}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </WorkspacePanel>

        <div className="space-y-4">
          <WorkspacePanel title={`${activeCategory.displayName} Subcategories`}>
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
            <WorkspacePanel title={`${activeClass.displayName} Types`}>
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
            <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_auto]" action="/discovery/biological">
              <input type="hidden" name="category" value={activeCategory.id} />
              {activeClass ? <input type="hidden" name="class" value={activeClass.id} /> : null}
              {activeSubclass ? <input type="hidden" name="subclass" value={activeSubclass.id} /> : null}
              <label className="sr-only" htmlFor="biological-search">Search biological curiosities</label>
              <input id="biological-search" name="q" defaultValue={query} placeholder="Search biological curiosities" className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/55 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/55" />
              <select name="rarity" defaultValue={rarityParam ?? ""} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/55 px-3 text-sm font-semibold text-white outline-none">
                <option value="">All rarities</option>
                {discoveryRarities.map((rarity) => <option key={rarity.id} value={rarity.id}>{rarity.displayName}</option>)}
              </select>
              <button type="submit" className="h-11 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/20">Search</button>
            </form>
            <p className="mt-3 text-sm font-bold text-slate-400">{filteredRecords.length} shown / {records.length} biological curiosities</p>
          </WorkspacePanel>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {filteredRecords.map((record) => {
              const preview = curiosityPreview(record);
              const { classRecord, subclassRecord } = getCuriosityClassification(record);
              return (
                <Link key={record.id} href={`/discovery/biological?category=${record.categoryId}&class=${record.classId}&subclass=${record.subclassId}&entry=${record.id}`} scroll={false} className="overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/55 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 focus-visible:border-cyan-200 focus-visible:outline-none">
                  <div className="relative aspect-video border-b border-cyan-300/10 bg-slate-950/80">
                    {preview ? (
                      <Image src={preview} alt={`${record.displayName} artwork`} fill sizes="(min-width: 1536px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
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
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-cyan-200">{classRecord?.displayName ?? titleFromSlug(record.classId)}</p>
                        <h2 className="mt-1 truncate text-xl font-black text-white">{record.displayName}</h2>
                        <p className="mt-1 truncate text-xs italic text-cyan-100/80">{record.scientificName}</p>
                      </div>
                      <WorkspaceBadge value={record.rarity} />
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{record.description}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <WorkspaceStatTile label="Subclass" value={subclassRecord?.displayName ?? titleFromSlug(record.subclassId)} />
                      <WorkspaceStatTile label="Status" value={record.publicationStatus} />
                      <WorkspaceStatTile label="XP" value={record.discoveryXp} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {selectedEntry ? (
        <WorkspacePanel title={selectedEntry.displayName} icon={Search}>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div>
              <p className="text-sm leading-6 text-slate-300">{selectedEntry.lore}</p>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <WorkspaceStatTile label="Category" value={activeCategory.displayName} />
                <WorkspaceStatTile label="Class" value={getCuriosityClassification(selectedEntry).classRecord?.displayName ?? titleFromSlug(selectedEntry.classId)} />
                <WorkspaceStatTile label="Subclass" value={getCuriosityClassification(selectedEntry).subclassRecord?.displayName ?? titleFromSlug(selectedEntry.subclassId)} />
              </div>
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Artwork Workflow</p>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-300">
                <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Status</span><span className="truncate text-cyan-100">{selectedEntry.artworkStatus ?? "missing"}</span></div>
                <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">PSD</span><span className="truncate text-cyan-100">Pending</span></div>
                <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Prompt</span><span className="truncate text-cyan-100">{selectedEntry.promptProfile?.prompt ? "Ready" : "Missing"}</span></div>
              </div>
            </div>
          </div>
        </WorkspacePanel>
      ) : null}
    </main>
  );
}

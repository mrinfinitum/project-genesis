import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronRight, Compass, FileText, Folder, FolderOpen, ImageIcon, Search } from "lucide-react";
import { WorkspaceBadge, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import {
  biologicalCuriosityNavigation,
  biologicalCuriosityVolume,
  ancientRelicsCuriosityNavigation,
  ancientRelicsCuriosityVolume,
  canonicalDiscoveries,
  discoveryRarities,
  faunaCuriosityNavigation,
  faunaCuriosityVolume,
  geologicalCuriosityNavigation,
  geologicalCuriosityVolume,
  getCuriositiesByFolder,
  getCuriosityArtwork,
  getCuriosityById,
  getCuriosityClassification,
  getCuriosityFolderCount,
  validateDiscoverySystem,
  type DiscoveryRecord
} from "@/lib/discovery";

type DiscoverySearchParams = Promise<Record<string, string | string[] | undefined>>;

type DiscoveryTreeNode = {
  id: string;
  label: string;
  href: string;
  count: number;
  icon?: "folder" | "curiosity" | "journal";
  children?: DiscoveryTreeNode[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function titleFromSlug(value: string) {
  return value.replaceAll("-", " ");
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

const discoveryGridRenderLimit = 240;

function volumeNumber(volume: { volume?: number; volumeId?: string }) {
  if (typeof volume.volume === "number") return volume.volume;
  const match = volume.volumeId?.match(/volume-(\d+)/);
  return match ? Number(match[1]) : 0;
}

function previewFor(record: DiscoveryRecord) {
  const artwork = getCuriosityArtwork(record);
  return artwork?.thumbnailPath ?? artwork?.webpPath ?? artwork?.pngPath ?? null;
}

function folderHref(folder: string) {
  return `/discovery?folder=${encodeURIComponent(folder)}`;
}

function volumeFolderId(volumeId: string, ...parts: string[]) {
  return [volumeId, ...parts].join(":");
}

function isActiveAncestor(node: DiscoveryTreeNode, activeFolder: string): boolean {
  return node.id === activeFolder || Boolean(node.children?.some((child) => isActiveAncestor(child, activeFolder)));
}

function TreeIcon({ node, expanded }: { node: DiscoveryTreeNode; expanded: boolean }) {
  if (node.icon === "journal") return <BookOpen className="h-4 w-4 shrink-0 text-cyan-200/70" />;
  if (node.icon === "curiosity") return <Compass className="h-4 w-4 shrink-0 text-cyan-200/70" />;
  return expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-cyan-200/80" /> : <Folder className="h-4 w-4 shrink-0 text-cyan-200/60" />;
}

function DiscoveryTreeItem({ node, activeFolder, depth = 0 }: { node: DiscoveryTreeNode; activeFolder: string; depth?: number }) {
  const hasChildren = Boolean(node.children?.length);
  const expanded = isActiveAncestor(node, activeFolder) || depth < 1;
  const active = node.id === activeFolder;

  return (
    <div>
      <Link
        href={node.href}
        scroll={false}
        className={`group flex items-center gap-1 rounded-md text-sm transition ${active ? "bg-cyan-300/14 text-white" : "text-slate-400 hover:bg-cyan-300/8 hover:text-slate-100"}`}
        style={{ paddingLeft: `${0.35 + depth * 0.85}rem` }}
      >
        <span className="grid h-7 w-6 shrink-0 place-items-center rounded text-slate-500 transition group-hover:bg-cyan-300/10 group-hover:text-cyan-100">
          {hasChildren ? <ChevronRight className={`h-3.5 w-3.5 transition ${expanded ? "rotate-90" : ""}`} /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />}
        </span>
        <TreeIcon node={node} expanded={expanded} />
        <span className="min-w-0 flex-1 truncate py-1.5 font-semibold">{node.label}</span>
        <span className="rounded border border-cyan-300/10 bg-slate-950/45 px-1.5 py-0.5 text-[0.62rem] font-bold text-slate-500">{node.count}</span>
      </Link>
      {hasChildren && expanded ? (
        <div className="mt-0.5">
          {node.children?.map((child) => <DiscoveryTreeItem key={child.id} node={child} activeFolder={activeFolder} depth={depth + 1} />)}
        </div>
      ) : null}
    </div>
  );
}

function buildDiscoveryTree(): DiscoveryTreeNode[] {
  const childrenForVolume = (volumeId: string, navigation: typeof biologicalCuriosityNavigation) => navigation.map((category) => {
    const categoryFolder = volumeFolderId(volumeId, category.id);
    return {
      id: categoryFolder,
      label: category.displayName,
      href: folderHref(categoryFolder),
      count: getCuriosityFolderCount(categoryFolder),
      children: category.classes.map((classRecord) => {
        const classFolder = volumeFolderId(volumeId, category.id, classRecord.id);
        return {
          id: classFolder,
          label: classRecord.displayName,
          href: folderHref(classFolder),
          count: getCuriosityFolderCount(classFolder),
          children: classRecord.subclasses.map((subclassRecord) => ({
            id: volumeFolderId(volumeId, category.id, classRecord.id, subclassRecord.id),
            label: subclassRecord.displayName,
            href: folderHref(volumeFolderId(volumeId, category.id, classRecord.id, subclassRecord.id)),
            count: getCuriosityFolderCount(volumeFolderId(volumeId, category.id, classRecord.id, subclassRecord.id))
          }))
        };
      })
    };
  });

  return [
    { id: "all", label: "All Discoveries", href: folderHref("all"), count: canonicalDiscoveries.length, icon: "curiosity" },
    { id: "biological", label: "Biological", href: folderHref("biological"), count: getCuriosityFolderCount("biological"), icon: "folder", children: childrenForVolume("biological", biologicalCuriosityNavigation) },
    { id: "fauna", label: "Fauna", href: folderHref("fauna"), count: getCuriosityFolderCount("fauna"), icon: "folder", children: childrenForVolume("fauna", faunaCuriosityNavigation) },
    { id: "geological", label: "Geological", href: folderHref("geological"), count: getCuriosityFolderCount("geological"), icon: "folder", children: childrenForVolume("geological", geologicalCuriosityNavigation) },
    { id: "ancient-relics", label: "Ancient Relics", href: folderHref("ancient-relics"), count: getCuriosityFolderCount("ancient-relics"), icon: "folder", children: childrenForVolume("ancient-relics", ancientRelicsCuriosityNavigation) },
    { id: "journal", label: "Discovery Journal", href: "/discovery-journal", count: 0, icon: "journal" }
  ];
}

function resolveRecords(folder: string) {
  return getCuriositiesByFolder(folder);
}

function folderTitle(folder: string, folderRecords: DiscoveryRecord[]) {
  if (folder === "biological") return "Biological";
  if (folder === "fauna") return "Fauna";
  if (folder === "geological") return "Geological";
  if (folder === "ancient-relics") return "Ancient Relics";
  if (folder.startsWith("biological:") || folder.startsWith("fauna:") || folder.startsWith("geological:") || folder.startsWith("ancient-relics:")) {
    const first = folderRecords[0];
    if (!first) return folder.startsWith("fauna:") ? "Fauna" : folder.startsWith("geological:") ? "Geological" : folder.startsWith("ancient-relics:") ? "Ancient Relics" : "Biological";
    const { category, classRecord, subclassRecord } = getCuriosityClassification(first);
    return subclassRecord?.displayName ?? classRecord?.displayName ?? category?.shortDisplayName ?? (folder.startsWith("fauna:") ? "Fauna" : folder.startsWith("geological:") ? "Geological" : folder.startsWith("ancient-relics:") ? "Ancient Relics" : "Biological");
  }
  return "All Discoveries";
}

export default async function DiscoveryLibraryPage({ searchParams }: { searchParams?: DiscoverySearchParams }) {
  const params = await searchParams;
  const folder = firstParam(params?.folder) ?? "all";
  const query = firstParam(params?.q)?.trim().toLowerCase() ?? "";
  const rarityParam = firstParam(params?.rarity);
  const artworkParam = firstParam(params?.artwork);
  const classParam = firstParam(params?.class);
  const subclassParam = firstParam(params?.subclass);
  const hazardParam = firstParam(params?.hazard);
  const conditionParam = firstParam(params?.condition);
  const scanParam = firstParam(params?.scan);
  const planetParam = firstParam(params?.planet);
  const entryParam = firstParam(params?.entry);
  const rarityIds = new Set<string>(discoveryRarities.map((rarity) => rarity.id));
  const validation = validateDiscoverySystem();
  const tree = buildDiscoveryTree();
  const folderRecords = resolveRecords(folder);
  const classOptions = Array.from(new Map(folderRecords.map((record) => [record.classId, getCuriosityClassification(record).classRecord?.displayName ?? titleFromSlug(record.classId)])).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const subclassOptions = Array.from(new Map(folderRecords.filter((record) => !classParam || record.classId === classParam).map((record) => [record.subclassId, getCuriosityClassification(record).subclassRecord?.displayName ?? titleFromSlug(record.subclassId)])).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const hazardOptions = Array.from(new Set(folderRecords.map((record) => record.hazardLevel).filter((value): value is string => Boolean(value)))).sort();
  const conditionOptions = Array.from(new Set(folderRecords.map((record) => record.condition).filter((value): value is string => Boolean(value)))).sort();
  const scanOptions = Array.from(new Set(folderRecords.map((record) => record.requiredScanLevel))).sort((a, b) => a - b);
  const planetOptions = Array.from(new Map(folderRecords.flatMap((record) => (record.compatiblePlanetClasses ?? []).map((planetClass) => [planetClass, titleFromSlug(planetClass)] as const))).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const selectedEntry = getCuriosityById(entryParam);
  const visibleRecords = folderRecords.filter((record) => {
    const artwork = getCuriosityArtwork(record);
    const haystack = [record.id, record.displayName, record.scientificName, record.description, record.categoryId, record.classId, record.subclassId, record.rarity, record.volumeName, ...record.tags].join(" ").toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (rarityParam && rarityIds.has(rarityParam) && record.rarity !== rarityParam) return false;
    if (classParam && record.classId !== classParam) return false;
    if (subclassParam && record.subclassId !== subclassParam) return false;
    if (hazardParam && record.hazardLevel !== hazardParam) return false;
    if (conditionParam && record.condition !== conditionParam) return false;
    if (scanParam && record.requiredScanLevel !== Number(scanParam)) return false;
    if (planetParam && !record.compatiblePlanetClasses?.includes(planetParam)) return false;
    if (artworkParam === "missing" && artwork?.status === "artwork_ready") return false;
    if (artworkParam === "ready" && artwork?.status !== "artwork_ready") return false;
    return true;
  });
  const readyArtwork = folderRecords.filter((record) => getCuriosityArtwork(record)?.status === "artwork_ready").length;
  const published = folderRecords.filter((record) => record.publicationStatus === "published" || record.publicationStatus === "approved").length;
  const readiness = percent(published, folderRecords.length);
  const activeTitle = folderTitle(folder, folderRecords);
  const renderedRecords = visibleRecords.slice(0, discoveryGridRenderLimit);

  return (
    <main className="min-h-[calc(100vh-5rem)] space-y-3">
      <header className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Content Browser</p>
            <h1 className="text-2xl font-black text-white">Discovery Library</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-400">
            <span>Home</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span>Discovery Library</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-cyan-100">{activeTitle}</span>
          </div>
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="min-h-0 rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-3 shadow-glow lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
          <div className="mb-3 flex items-center gap-2 px-1">
            <Compass className="h-4 w-4 text-cyan-200" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Content Tree</p>
              <p className="text-xs text-slate-500">Browse discoveries</p>
            </div>
          </div>
          <div role="tree" aria-label="Discovery Library content folders" className="space-y-0.5">
            {tree.map((node) => <DiscoveryTreeItem key={node.id} node={node} activeFolder={folder} />)}
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 shadow-glow">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <WorkspaceBadge value={folder === "biological" || folder.startsWith("biological:") ? `Volume ${volumeNumber(biologicalCuriosityVolume)}` : folder === "fauna" || folder.startsWith("fauna:") ? `Volume ${volumeNumber(faunaCuriosityVolume)}` : folder === "geological" || folder.startsWith("geological:") ? `Volume ${volumeNumber(geologicalCuriosityVolume)}` : folder === "ancient-relics" || folder.startsWith("ancient-relics:") ? `Volume ${volumeNumber(ancientRelicsCuriosityVolume)}` : "Canonical"} />
                  <WorkspaceBadge value={validation.status} />
                  {folder === "biological" ? <Link href="/discovery/biological" className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-cyan-100">Open Biological Page</Link> : null}
                </div>
                <h2 className="mt-3 text-3xl font-black text-white">{activeTitle}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  {folder === "biological" || folder.startsWith("biological:")
                    ? "Volume I biological records organized by category, class, and subclass. Artwork stays PSD-first and syncs into records when previews are available."
                    : folder === "fauna" || folder.startsWith("fauna:")
                      ? "Volume II fauna records organized by category, class, and subclass. Artwork is intentionally pending until PSDs and preview derivatives are synced."
                      : folder === "geological" || folder.startsWith("geological:")
                        ? "Volume III geological records organized by category, class, and subclass. Artwork is intentionally pending until PSDs and preview derivatives are synced."
                      : folder === "ancient-relics" || folder.startsWith("ancient-relics:")
                        ? "Volume IV ancient relic records organized by artifact class and subclass. Recovery, condition, age, translation, integrity, and value metadata remain attached to each canonical record."
                    : "Discovery records, biological volume content, taxonomy, artwork status, and journal access gathered into an Asset Library-style browser."}
                </p>
              </div>
              <div className="grid min-w-[18rem] gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Readiness</p>
                  <p className="text-sm font-black text-white">{readiness}%</p>
                </div>
                <WorkspaceProgressBar value={readiness} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <WorkspaceStatTile label="Records" value={folderRecords.length} />
              <WorkspaceStatTile label="Ready" value={published} />
              <WorkspaceStatTile label="Artwork Ready" value={readyArtwork} />
              <WorkspaceStatTile label="Missing Artwork" value={folderRecords.length - readyArtwork} />
            </div>
          </section>

          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 shadow-glow">
            <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" action="/discovery">
              <input type="hidden" name="folder" value={folder} />
              <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2 sm:col-span-2">
                <Search className="h-4 w-4 text-cyan-200" />
                <input name="q" defaultValue={query} placeholder="Search discoveries, names, taxonomy, tags, IDs" className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" />
              </label>
              <select name="rarity" defaultValue={rarityParam ?? ""} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                <option value="">All Rarities</option>
                {discoveryRarities.map((rarity) => <option key={rarity.id} value={rarity.id}>{rarity.displayName}</option>)}
              </select>
              <select name="artwork" defaultValue={artworkParam ?? ""} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                <option value="">All Artwork</option>
                <option value="ready">Artwork Ready</option>
                <option value="missing">Missing Artwork</option>
              </select>
              <select name="class" defaultValue={classParam ?? ""} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                <option value="">All Classes</option>
                {classOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <select name="subclass" defaultValue={subclassParam ?? ""} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                <option value="">All Subclasses</option>
                {subclassOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              {hazardOptions.length ? <select name="hazard" defaultValue={hazardParam ?? ""} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                <option value="">All Hazards</option>
                {hazardOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select> : null}
              {conditionOptions.length ? <select name="condition" defaultValue={conditionParam ?? ""} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                <option value="">All Conditions</option>
                {conditionOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select> : null}
              <select name="scan" defaultValue={scanParam ?? ""} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                <option value="">All Scan Levels</option>
                {scanOptions.map((value) => <option key={value} value={value}>Scan Level {value}</option>)}
              </select>
              <select name="planet" defaultValue={planetParam ?? ""} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                <option value="">All Planet Classes</option>
                {planetOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <button type="submit" className="h-12 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/20">Search</button>
            </form>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300">
              <FileText className="h-4 w-4 text-cyan-200" />
              {renderedRecords.length.toLocaleString()} shown / {visibleRecords.length.toLocaleString()} matched / {folderRecords.length.toLocaleString()} in folder / {canonicalDiscoveries.length.toLocaleString()} total
            </div>
          </section>

          {renderedRecords.length ? (
            <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {renderedRecords.map((record) => {
                const preview = previewFor(record);
                const { category, classRecord, subclassRecord } = getCuriosityClassification(record);
                const href = `/discovery?folder=${encodeURIComponent(folder)}&entry=${encodeURIComponent(record.id)}`;
                return (
                  <Link key={record.id} href={href} scroll={false} className="overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/88 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 focus-visible:border-cyan-200 focus-visible:outline-none">
                    <div className="relative aspect-video border-b border-cyan-300/10 bg-slate-950/80">
                      {preview ? (
                        <Image src={preview} alt={`${record.displayName} artwork`} fill sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-center">
                          <div>
                            <ImageIcon className="mx-auto h-7 w-7 text-slate-600" />
                            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Artwork Needed</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-cyan-200">{classRecord?.displayName ?? titleFromSlug(record.classId)}</p>
                          <h3 className="mt-1 truncate text-lg font-black text-white" title={record.displayName}>{record.displayName}</h3>
                          <p className="mt-1 truncate text-xs italic text-cyan-100/80">{record.scientificName}</p>
                        </div>
                        <WorkspaceBadge value={record.rarity} />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{record.description}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <WorkspaceStatTile label="Category" value={category?.shortDisplayName ?? record.categoryId} />
                        <WorkspaceStatTile label="Subclass" value={subclassRecord?.displayName ?? titleFromSlug(record.subclassId)} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          ) : (
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center">
              <p className="text-xl font-black text-white">No discoveries match this folder.</p>
              <p className="mt-2 text-sm text-slate-400">Try a broader taxonomy folder or clear the search filters.</p>
            </section>
          )}

          {selectedEntry ? (
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 shadow-glow">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <WorkspaceBadge value={selectedEntry.id} />
                    <WorkspaceBadge value={selectedEntry.volumeName ?? "Core Discovery"} />
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-white">{selectedEntry.displayName}</h2>
                  <p className="mt-1 text-sm italic text-cyan-100/80">{selectedEntry.scientificName}</p>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{selectedEntry.lore}</p>
                </div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Record</p>
                  <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-300">
                    <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Category</span><span className="truncate text-cyan-100">{getCuriosityClassification(selectedEntry).category?.displayName ?? selectedEntry.categoryId}</span></div>
                    <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Class</span><span className="truncate text-cyan-100">{getCuriosityClassification(selectedEntry).classRecord?.displayName ?? selectedEntry.classId}</span></div>
                    <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Subclass</span><span className="truncate text-cyan-100">{getCuriosityClassification(selectedEntry).subclassRecord?.displayName ?? selectedEntry.subclassId}</span></div>
                    {selectedEntry.condition ? <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Condition</span><span className="truncate text-cyan-100">{selectedEntry.condition}</span></div> : null}
                    {selectedEntry.hazardLevel ? <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Hazard</span><span className="truncate text-cyan-100">{selectedEntry.hazardLevel}</span></div> : null}
                    {selectedEntry.recoveryMethod ? <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Recovery</span><span className="truncate text-cyan-100" title={selectedEntry.recoveryMethod}>{selectedEntry.recoveryMethod}</span></div> : null}
                    {typeof selectedEntry.estimatedAgeYears === "number" ? <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Estimated Age</span><span className="truncate text-cyan-100">{selectedEntry.estimatedAgeYears.toLocaleString()} years</span></div> : null}
                    {typeof selectedEntry.integrityPercent === "number" ? <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Integrity</span><span className="truncate text-cyan-100">{selectedEntry.integrityPercent}%</span></div> : null}
                    {typeof selectedEntry.translationProgressPercent === "number" ? <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Translation</span><span className="truncate text-cyan-100">{selectedEntry.translationProgressPercent}%</span></div> : null}
                    <div className="flex justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2"><span className="text-slate-500">Prompt</span><span className="truncate text-cyan-100">{selectedEntry.promptProfile?.prompt ? "Ready" : "Missing"}</span></div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}

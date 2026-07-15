"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Grid2X2, ImageIcon, Layers3, List, Search, SlidersHorizontal } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { UpgradeArtReport, UpgradeArtResolution } from "@/lib/upgrades/art-previews";
import type { Upgrade } from "@/types/schema";
import { cn } from "@/lib/utils";

type LayoutMode = "visual" | "compact" | "list";
type FilterId =
  | "all"
  | "has_preview"
  | "missing_preview"
  | "linked_asset"
  | "unlinked"
  | "needs_review"
  | "approved"
  | "published"
  | "roblox_ready"
  | "web_ready"
  | "low_resolution"
  | "placeholder_only";

type UpgradeArtCard = UpgradeArtResolution & { upgrade: Upgrade };

const layoutStorageKey = "project-genesis-upgrade-art-layout";
const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "has_preview", label: "Has Preview" },
  { id: "missing_preview", label: "Missing Preview" },
  { id: "linked_asset", label: "Linked Asset" },
  { id: "unlinked", label: "Unlinked" },
  { id: "needs_review", label: "Needs Review" },
  { id: "approved", label: "Approved" },
  { id: "published", label: "Published" },
  { id: "roblox_ready", label: "Roblox Ready" },
  { id: "web_ready", label: "Web Ready" },
  { id: "low_resolution", label: "Low Resolution" },
  { id: "placeholder_only", label: "Placeholder Only" }
];

function valueMatchesFilter(item: UpgradeArtCard, filter: FilterId) {
  if (filter === "all") return true;
  if (filter === "has_preview") return Boolean(item.resolvedPreviewUrl);
  if (filter === "missing_preview") return !item.resolvedPreviewUrl || item.previewStatus === "Missing";
  if (filter === "linked_asset") return Boolean(item.linkedAssetId);
  if (filter === "unlinked") return !item.linkedAssetId;
  if (filter === "needs_review") return item.previewStatus === "Needs Review" || item.matchStatus === "ambiguous";
  if (filter === "approved") return /approved/i.test(item.preview.approvalStatus);
  if (filter === "published") return item.previewStatus === "Published" || /published/i.test(item.preview.publishStatus);
  if (filter === "roblox_ready") return item.hasRobloxMapping;
  if (filter === "web_ready") return item.hasWebMapping;
  if (filter === "low_resolution") return Boolean(item.preview.width && item.preview.height && (item.preview.width < 128 || item.preview.height < 128));
  if (filter === "placeholder_only") return item.preview.source === "placeholder" || item.preview.source === "missing";
  return true;
}

function statusTone(item: UpgradeArtCard) {
  if (item.matchStatus === "ambiguous" || item.previewStatus === "Needs Review") return "Needs Review";
  if (item.resolvedPreviewUrl) return item.previewStatus;
  return "Missing";
}

function DetailPanel({ item }: { item: UpgradeArtCard }) {
  return (
    <WorkspacePanel title="Upgrade Art Detail" icon={ImageIcon} className="lg:sticky lg:top-6">
      <AssetPreview preview={{ ...item.preview, size: "large" }} className="min-h-72" />
      <div className="mt-4 flex flex-wrap gap-2">
        <WorkspaceBadge value={statusTone(item)} />
        <WorkspaceBadge value={item.resolutionSource} />
        <WorkspaceBadge value={item.upgrade.era} />
      </div>
      <h2 className="mt-4 text-2xl font-black text-white">{item.displayName}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{item.upgrade.description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <WorkspaceMiniStat label="Upgrade ID" value={item.upgradeId} />
        <WorkspaceMiniStat label="Icon Key" value={item.iconKey || "Missing"} />
        <WorkspaceMiniStat label="Linked Asset" value={item.linkedAssetId ?? "Unlinked"} />
        <WorkspaceMiniStat label="Preview Source" value={item.preview.source.replaceAll("_", " ")} />
        <WorkspaceMiniStat label="Dimensions" value={item.preview.dimensionsLabel} />
        <WorkspaceMiniStat label="Usage Count" value={item.asset?.usageCount ?? 0} />
      </div>
      {item.asset ? (
        <div className="mt-4 grid gap-3 rounded-md border border-cyan-300/15 bg-slate-950/40 p-3 sm:grid-cols-2">
          <WorkspaceMiniStat label="Asset" value={item.asset.name} />
          <WorkspaceMiniStat label="Category" value={item.asset.category} />
          <WorkspaceMiniStat label="Sources" value={item.asset.sourceFileCount} />
          <WorkspaceMiniStat label="Derivatives" value={item.asset.derivativeCount} />
          <WorkspaceMiniStat label="Source Version" value={item.asset.currentSourceVersion} />
          <WorkspaceMiniStat label="Latest Derivative" value={item.asset.latestDerivative} />
          <WorkspaceMiniStat label="Web Mapping" value={item.asset.webMappingStatus} />
          <WorkspaceMiniStat label="Roblox Mapping" value={item.asset.robloxMappingStatus} />
        </div>
      ) : null}
      {item.candidates.length > 1 ? (
        <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-400/10 p-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">Candidate Review</p>
          <div className="mt-3 grid gap-2">
            {item.candidates.slice(0, 5).map((candidate) => (
              <div key={candidate.assetId} className="rounded-md border border-amber-200/10 bg-slate-950/40 p-2 text-sm text-slate-200">
                <span className="font-bold text-white">{candidate.name}</span>
                <span className="text-slate-500"> / {candidate.reason}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {item.missingRequirement ? (
        <div className="mt-4 rounded-md border border-rose-300/20 bg-rose-400/10 p-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-100">Missing Action</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{item.missingReason || "Create or link a real upgrade icon asset, then publish a preview derivative."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/asset-library?section=missing" className="rounded-md border border-rose-200/30 bg-rose-300/10 px-3 py-2 text-sm font-bold text-rose-50">Open Missing Assets</a>
            <a href="/asset-library?upload=asset" className="rounded-md border border-cyan-200/30 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-50">Upload Asset</a>
          </div>
        </div>
      ) : null}
    </WorkspacePanel>
  );
}

function UpgradeCard({ item, layout, selected, onSelect }: { item: UpgradeArtCard; layout: LayoutMode; selected: boolean; onSelect: () => void }) {
  const common = "text-left transition hover:border-cyan-200/45 focus:outline-none focus:ring-2 focus:ring-cyan-300/40";
  if (layout === "list") {
    return (
      <button type="button" onClick={onSelect} className={cn(common, "grid w-full gap-3 rounded-md border bg-[#07101e]/85 p-3 md:grid-cols-[5rem_1fr_auto]", selected ? "border-cyan-200/55" : "border-cyan-300/15")}>
        <AssetPreview preview={{ ...item.preview, size: "small" }} allowFullscreen={false} compact className="h-20" />
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge value={statusTone(item)} />
            <WorkspaceBadge value={item.upgrade.era} />
          </div>
          <h3 className="mt-2 truncate text-lg font-black text-white">{item.displayName}</h3>
          <p className="mt-1 truncate text-sm text-slate-400">{item.iconKey || "No icon key"} / {item.linkedAssetId ?? "Unlinked"}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:w-56">
          <WorkspaceMiniStat label="Web" value={item.hasWebMapping ? "Ready" : "Missing"} />
          <WorkspaceMiniStat label="Roblox" value={item.hasRobloxMapping ? "Ready" : "Missing"} />
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={onSelect} className={cn(common, "overflow-hidden rounded-md border bg-[#07101e]/85", selected ? "border-cyan-200/55 shadow-glow" : "border-cyan-300/15")}>
      <AssetPreview preview={{ ...item.preview, size: layout === "compact" ? "small" : "card" }} allowFullscreen={false} compact={layout === "compact"} />
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          <WorkspaceBadge value={statusTone(item)} />
          <WorkspaceBadge value={item.upgrade.tier} />
        </div>
        <h3 className="mt-3 line-clamp-2 text-xl font-black text-white">{item.displayName}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{item.upgrade.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <WorkspaceMiniStat label="Asset" value={item.linkedAssetId ? "Linked" : "Unlinked"} />
          <WorkspaceMiniStat label="Web" value={item.hasWebMapping ? "Ready" : "Missing"} />
        </div>
      </div>
    </button>
  );
}

export function UpgradeArtWorkspace({ upgrades, report }: { upgrades: Upgrade[]; report: UpgradeArtReport }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [layout, setLayout] = useState<LayoutMode>("visual");
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedId, setSelectedId] = useState(report.items[0]?.upgradeId ?? "");

  useEffect(() => {
    const saved = window.localStorage.getItem(layoutStorageKey) as LayoutMode | null;
    if (saved === "visual" || saved === "compact" || saved === "list") setLayout(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(layoutStorageKey, layout);
  }, [layout]);

  const cards = useMemo(() => {
    const upgradesById = new Map(upgrades.map((upgrade) => [upgrade.id, upgrade]));
    return report.items.flatMap((item) => {
      const upgrade = upgradesById.get(item.upgradeId);
      return upgrade ? [{ ...item, upgrade }] : [];
    });
  }, [report.items, upgrades]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cards.filter((item) => {
      const matchesSearch = !needle || [item.displayName, item.upgradeId, item.iconKey, item.artKey, item.linkedAssetId, item.upgrade.era, item.upgrade.type].filter(Boolean).join(" ").toLowerCase().includes(needle);
      return matchesSearch && valueMatchesFilter(item, filter);
    });
  }, [cards, filter, query]);

  const selected = cards.find((item) => item.upgradeId === selectedId) ?? filtered[0] ?? cards[0];
  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(24);
  }, [filter, query, layout]);

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Progression Design"
        title="Upgrade Designer"
        description="Audit upgrade art, reconcile imported Roblox icons, and keep upgrade cards tied to real Studio asset previews."
        stats={[
          { label: "Upgrades", value: report.stats.total },
          { label: "Preview Ready", value: report.stats.previewReady },
          { label: "Missing", value: report.stats.missing },
          { label: "Needs Review", value: report.stats.ambiguous }
        ]}
      />

      <div className="grid gap-3 md:grid-cols-4">
        <WorkspaceStatTile label="Approved" value={report.stats.approved} />
        <WorkspaceStatTile label="Published" value={report.stats.published} />
        <WorkspaceStatTile label="Web Ready" value={report.stats.webReady} />
        <WorkspaceStatTile label="Roblox Ready" value={report.stats.robloxReady} />
      </div>

      <WorkspacePanel>
        <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search upgrades, icon keys, assets, eras" />
          <div className="flex flex-wrap gap-2">
            {([
              ["visual", Grid2X2, "Visual Grid"],
              ["compact", Layers3, "Compact Grid"],
              ["list", List, "List"]
            ] as const).map(([id, Icon, label]) => (
              <button key={id} type="button" onClick={() => setLayout(id)} className={cn("inline-flex h-12 items-center gap-2 rounded-md border px-3 text-sm font-bold", layout === id ? "border-cyan-200/45 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/45 text-slate-300 hover:text-white")}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-300"><SlidersHorizontal className="h-4 w-4" /> Filters</span>
          {filters.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={cn("rounded-md border px-3 py-2 text-sm font-bold transition", filter === item.id ? "border-cyan-200/45 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/45 text-slate-400 hover:text-white")}>
              {item.label}
            </button>
          ))}
        </div>
      </WorkspacePanel>

      <div className="grid gap-6 xl:grid-cols-[1fr_28rem]">
        <section className={cn(layout === "list" ? "grid gap-3" : layout === "compact" ? "grid gap-4 sm:grid-cols-2 2xl:grid-cols-4" : "grid gap-5 md:grid-cols-2 2xl:grid-cols-3")}>
          {visible.map((item) => (
            <UpgradeCard key={item.upgradeId} item={item} layout={layout} selected={selected?.upgradeId === item.upgradeId} onSelect={() => setSelectedId(item.upgradeId)} />
          ))}
          {!visible.length ? (
            <WorkspacePanel>
              <div className="flex items-center gap-3 text-slate-300">
                <CircleAlert className="h-5 w-5 text-amber-200" />
                No upgrades match the current search and filters.
              </div>
            </WorkspacePanel>
          ) : null}
          {visibleCount < filtered.length ? (
            <button type="button" onClick={() => setVisibleCount((count) => count + 24)} className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-100">
              Load More ({filtered.length - visibleCount} remaining)
            </button>
          ) : filtered.length ? (
            <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-300/15 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Showing {filtered.length} resolved upgrade records
            </div>
          ) : null}
        </section>
        {selected ? <DetailPanel item={selected} /> : null}
      </div>
    </main>
  );
}

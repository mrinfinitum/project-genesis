"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Filter, Search } from "lucide-react";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { CanonicalIndex } from "@/components/ui/workspace";
import type { UpgradeArtResolution } from "@/lib/upgrades/art-previews";
import type { Upgrade } from "@/types/schema";

type UpgradeLibraryProps = {
  upgrades: Upgrade[];
  art: Array<Pick<UpgradeArtResolution, "upgradeId" | "matchStatus" | "previewStatus" | "resolvedPreviewUrl" | "hasApprovedPreview" | "hasThumbnail" | "hasPreview" | "hasWebMapping" | "hasRobloxMapping">>;
};

type UpgradeCardArt = UpgradeLibraryProps["art"][number];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusForUpgrade(upgrade: Upgrade, art?: UpgradeCardArt) {
  if (art?.matchStatus === "matched" && /approved|published|generated|needs review/i.test(art.previewStatus)) return "Ready";
  if (upgrade.asset_id) return "Needs Review";
  return "Missing Art";
}

function previewForUpgrade(art?: UpgradeCardArt) {
  if (!art) return undefined;
  const hasUsablePreview = art.matchStatus === "matched" && (art.hasApprovedPreview || art.hasThumbnail || art.hasPreview || art.hasWebMapping || art.hasRobloxMapping);
  if (!hasUsablePreview) return undefined;
  if (!art.resolvedPreviewUrl || /^missing$/i.test(art.previewStatus)) return undefined;
  return art.resolvedPreviewUrl;
}

function toCardRecord(upgrade: Upgrade, art?: UpgradeCardArt): GeneratedLibraryCardRecord {
  const displayName = upgrade.name || titleCase(upgrade.id);
  const classificationParts = [upgrade.type, upgrade.tier].filter(Boolean).map(titleCase);
  const costLabel = upgrade.base_cost && upgrade.cost_resource ? `${upgrade.base_cost.toLocaleString()} ${titleCase(upgrade.cost_resource)}` : undefined;

  return {
    id: upgrade.id,
    name: displayName,
    type: "Upgrade",
    classification: classificationParts.join(" / "),
    parent: upgrade.era ? titleCase(upgrade.era) : upgrade.civilization ? titleCase(upgrade.civilization) : undefined,
    contains: costLabel,
    status: statusForUpgrade(upgrade, art),
    href: `/upgrades?upgrade=${encodeURIComponent(upgrade.id)}`,
    tone: "research",
    thumbnailUrl: previewForUpgrade(art),
    mediumPreviewUrl: previewForUpgrade(art)
  };
}

const INITIAL_CARD_LIMIT = 96;

export function UpgradeLibrary({ upgrades, art }: UpgradeLibraryProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [cardLimit, setCardLimit] = useState(INITIAL_CARD_LIMIT);
  const storageKey = "project-genesis-hidden-library-records:upgrades";

  useEffect(() => {
    try {
      setHiddenIds(JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as string[]);
    } catch {
      setHiddenIds([]);
    }
  }, []);

  const artByUpgradeId = useMemo(() => new Map(art.map((item) => [item.upgradeId, item])), [art]);

  const visibleUpgrades = useMemo(() => upgrades.filter((upgrade) => !hiddenIds.includes(upgrade.id)), [hiddenIds, upgrades]);

  const typeOptions = useMemo(() => {
    return [...new Set(visibleUpgrades.map((upgrade) => upgrade.type).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  }, [visibleUpgrades]);

  const indexItems = useMemo(() => {
    const eraCount = new Set(visibleUpgrades.map((upgrade) => upgrade.era).filter(Boolean)).size;
    const typeCount = new Set(visibleUpgrades.map((upgrade) => upgrade.type).filter(Boolean)).size;
    const linkedArt = visibleUpgrades.filter((upgrade) => artByUpgradeId.get(upgrade.id)?.matchStatus === "matched").length;
    const maxLevelTotal = visibleUpgrades.reduce((total, upgrade) => total + (Number.isFinite(upgrade.max_level) ? upgrade.max_level : 0), 0);

    return [
      { label: "Records", value: visibleUpgrades.length.toLocaleString(), detail: "canonical upgrades" },
      { label: "Classes", value: typeCount.toLocaleString(), detail: "upgrade categories" },
      { label: "Eras", value: eraCount.toLocaleString(), detail: "linked progression" },
      { label: "Levels", value: maxLevelTotal.toLocaleString(), detail: "total upgrade depth" },
      { label: "Artwork", value: linkedArt.toLocaleString(), detail: "matched assets" }
    ];
  }, [artByUpgradeId, visibleUpgrades]);

  const filteredUpgrades = useMemo(() => {
    const needle = normalize(query);
    return visibleUpgrades.filter((upgrade) => {
      const matchesType = type === "all" || upgrade.type === type;
      const matchesQuery = !needle || [
        upgrade.id,
        upgrade.name,
        upgrade.type,
        upgrade.tier,
        upgrade.era,
        upgrade.civilization,
        upgrade.cost_resource,
        upgrade.bonus_type,
        upgrade.description
      ].some((value) => normalize(String(value ?? "")).includes(needle));
      return matchesType && matchesQuery;
    });
  }, [query, type, visibleUpgrades]);

  useEffect(() => {
    setCardLimit(INITIAL_CARD_LIMIT);
  }, [query, type]);

  const renderedUpgrades = filteredUpgrades.slice(0, cardLimit);

  const hideRecord = (record: GeneratedLibraryCardRecord) => {
    setHiddenIds((current) => {
      const next = current.includes(record.id) ? current : [...current, record.id];
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className="space-y-6">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Civilization Library</p>
        <h1 className="mt-2 text-4xl font-black text-white">Upgrade Library</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Browse canonical upgrade records as a compact library. Screen composition, category artwork production, and implementation notes live in their dedicated component and asset workspaces.
        </p>
      </section>

      <CanonicalIndex
        title="Upgrade Library"
        description="Canonical upgrade records only. No reference screenshots, duplicate category selectors, or production-board workflow blocks are shown in this library view."
        items={indexItems}
      />

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_16rem]">
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search upgrade records"
              className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
          </label>
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
            <Filter className="h-4 w-4 text-cyan-200" />
            <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none">
              <option value="all" className="bg-slate-950">All Classes</option>
              {typeOptions.map((option) => (
                <option key={option} value={option} className="bg-slate-950">{titleCase(option)}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300">
          <Database className="h-4 w-4 text-cyan-200" />
          {filteredUpgrades.length.toLocaleString()} shown / {visibleUpgrades.length.toLocaleString()} total
        </div>
      </section>

      {filteredUpgrades.length ? (
        <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {renderedUpgrades.map((upgrade) => (
            <GeneratedLibraryCard key={upgrade.id} record={toCardRecord(upgrade, artByUpgradeId.get(upgrade.id))} onDelete={hideRecord} />
          ))}
        </section>
      ) : (
        <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center">
          <p className="text-xl font-black text-white">No upgrade records match this view.</p>
          <p className="mt-2 text-sm text-slate-400">Clear search or class filters to return to the full canonical library.</p>
        </section>
      )}
      {renderedUpgrades.length < filteredUpgrades.length ? (
        <div className="flex justify-center">
          <button type="button" onClick={() => setCardLimit((current) => current + INITIAL_CARD_LIMIT)} className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
            Show more upgrades ({filteredUpgrades.length - renderedUpgrades.length} remaining)
          </button>
        </div>
      ) : null}
    </main>
  );
}

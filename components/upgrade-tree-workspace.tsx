"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronRight, CircleHelp, Filter, Focus, List, Lock, Search, Unlock, ZoomIn, ZoomOut } from "lucide-react";
import { UpgradeLibrary } from "@/components/upgrade-library";
import { Button } from "@/components/ui/button";
import type { UpgradeArtResolution } from "@/lib/upgrades/art-previews";
import type { Upgrade } from "@/types/schema";
import type { UpgradeTreeContract, UpgradeTreeNode } from "@/types/runtime";

type UpgradeTreeWorkspaceProps = {
  upgrades: Upgrade[];
  tree: UpgradeTreeContract;
  art: Array<Pick<UpgradeArtResolution, "upgradeId" | "matchStatus" | "previewStatus" | "resolvedPreviewUrl" | "hasApprovedPreview" | "hasThumbnail" | "hasPreview" | "hasWebMapping" | "hasRobloxMapping">>;
};

type PreviewPreset =
  | "new"
  | "mid-survival"
  | "survival-complete"
  | "village"
  | "industrial"
  | "science"
  | "technology"
  | "workforce"
  | "mixed"
  | "eco"
  | "high-tech"
  | "industrial-trajectory"
  | "cyberpunk"
  | "future";

const previewPresets: Array<{ id: PreviewPreset; label: string }> = [
  { id: "new", label: "New Survival player" },
  { id: "mid-survival", label: "Mid-Survival" },
  { id: "survival-complete", label: "Survival complete" },
  { id: "village", label: "Village unlocked" },
  { id: "industrial", label: "Industrial specialist" },
  { id: "science", label: "Science-focused" },
  { id: "technology", label: "Technology-focused" },
  { id: "workforce", label: "Workforce-focused" },
  { id: "mixed", label: "Mixed progression" },
  { id: "eco", label: "Eco-Green trajectory" },
  { id: "high-tech", label: "High-Tech trajectory" },
  { id: "industrial-trajectory", label: "Industrial trajectory" },
  { id: "cyberpunk", label: "Cyberpunk trajectory" },
  { id: "future", label: "Future Era reached" }
];

const branchTone: Record<string, string> = {
  workforce: "border-emerald-300/35 bg-emerald-400/10 text-emerald-50",
  science: "border-sky-300/35 bg-sky-400/10 text-sky-50",
  technology: "border-violet-300/35 bg-violet-400/10 text-violet-50",
  industry: "border-amber-300/35 bg-amber-400/10 text-amber-50"
};

function previewCompletion(tree: UpgradeTreeContract, preset: PreviewPreset) {
  const nodes = [...tree.nodes].sort((left, right) => left.treePositionX - right.treePositionX);
  const complete = new Set<string>();
  const add = (predicate: (node: UpgradeTreeNode) => boolean, limit = Number.POSITIVE_INFINITY) => {
    for (const node of nodes.filter(predicate).slice(0, limit)) complete.add(node.id);
  };
  if (preset === "mid-survival") add((node) => node.treeEraId === "survival", 18);
  if (preset === "survival-complete") add((node) => node.treeEraId === "survival");
  if (preset === "village") {
    add((node) => node.treeEraId === "survival");
    add((node) => node.sourceEra === "Village", 12);
  }
  if (preset === "industrial") add((node) => node.treeBranchId === "industry" && node.treePositionX < 6500, 48);
  if (preset === "science") add((node) => node.treeBranchId === "science", 40);
  if (preset === "technology") add((node) => node.treeBranchId === "technology", 40);
  if (preset === "workforce") add((node) => node.treeBranchId === "workforce", 40);
  if (preset === "mixed") add(() => true, 92);
  if (preset === "eco") add((node) => node.alignmentInfluences.some((item) => item.id === "alignment-nature"), 52);
  if (preset === "high-tech") add((node) => node.alignmentInfluences.some((item) => item.id === "alignment-technology"), 52);
  if (preset === "industrial-trajectory") add((node) => node.alignmentInfluences.some((item) => item.id === "alignment-industry"), 52);
  if (preset === "cyberpunk") add((node) => node.alignmentInfluences.some((item) => item.id === "alignment-cyber" || item.id === "alignment-corporate"), 52);
  if (preset === "future") add((node) => node.treePositionX < 9000);
  return complete;
}

function visibleState(node: UpgradeTreeNode, completed: Set<string>) {
  if (completed.has(node.id)) return "completed" as const;
  if (!node.prerequisiteNodeIds.length || node.prerequisiteNodeIds.every((id) => completed.has(id))) return "next" as const;
  return "mystery" as const;
}

function trajectoryFor(tree: UpgradeTreeContract, completed: Set<string>) {
  const scores = new Map<string, number>();
  for (const node of tree.nodes) {
    if (!completed.has(node.id)) continue;
    for (const influence of node.alignmentInfluences) {
      scores.set(influence.id, (scores.get(influence.id) ?? 0) + influence.weight);
    }
  }
  return [...scores.entries()].sort((left, right) => right[1] - left[1]).slice(0, 3);
}

export function UpgradeTreeWorkspace({ upgrades, tree, art }: UpgradeTreeWorkspaceProps) {
  const [mode, setMode] = useState<"tree" | "list">("tree");
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("all");
  const [preset, setPreset] = useState<PreviewPreset>("mid-survival");
  const [zoom, setZoom] = useState(0.72);
  const [selectedId, setSelectedId] = useState<string | null>(tree.nodes[0]?.id ?? null);
  const [positionOverrides, setPositionOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const dragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(null);

  const upgradesById = useMemo(() => new Map(upgrades.map((upgrade) => [upgrade.id, upgrade])), [upgrades]);
  const completed = useMemo(() => previewCompletion(tree, preset), [preset, tree]);
  const selected = tree.nodes.find((node) => node.id === selectedId) ?? null;
  const selectedUpgrade = selected ? upgradesById.get(selected.upgradeId) : undefined;
  const trajectory = useMemo(() => trajectoryFor(tree, completed), [completed, tree]);
  const canvasWidth = Math.max(...tree.eraBands.map((band) => band.positionX + band.width), 14500);
  const canvasHeight = 1050;
  const matchingNodeIds = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return new Set<string>();
    return new Set(tree.nodes.filter((node) => {
      const upgrade = upgradesById.get(node.upgradeId);
      return [upgrade?.name, upgrade?.description, node.sourceEra, node.treeBranchId, node.upgradeId]
        .some((value) => String(value ?? "").toLowerCase().includes(needle));
    }).map((node) => node.id));
  }, [query, tree.nodes, upgradesById]);

  if (mode === "list") {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" onClick={() => setMode("tree")}><Focus className="mr-2 h-4 w-4" /> Connected Tree</Button>
        </div>
        <UpgradeLibrary upgrades={upgrades} art={art} />
      </div>
    );
  }

  return (
    <main className="space-y-5">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Progression</p>
            <h1 className="mt-2 text-4xl font-black text-white">Upgrade Tree</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              One connected civilization progression from Survival through Future. Workforce, Science, Technology, and Industry remain canonical branches within the same authored tree.
            </p>
          </div>
          <Button type="button" onClick={() => setMode("list")}><List className="mr-2 h-4 w-4" /> Administrative List</Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Upgrades", tree.nodes.length],
            ["Branches", tree.branches.length],
            ["Era Bands", tree.eraBands.length],
            ["Dependencies", tree.edges.length],
            ["Validation", tree.validation.status]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/35 px-4 py-3">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_14rem_16rem_auto]">
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3">
            <Search className="h-4 w-4 text-cyan-200" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an upgrade node" className="h-11 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" />
          </label>
          <label className="flex items-center gap-2 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3">
            <Filter className="h-4 w-4 text-cyan-200" />
            <select value={branch} onChange={(event) => setBranch(event.target.value)} className="h-11 min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none">
              <option value="all" className="bg-slate-950">All branches</option>
              {tree.branches.map((item) => <option key={item.id} value={item.id} className="bg-slate-950">{item.displayName}</option>)}
            </select>
          </label>
          <select value={preset} onChange={(event) => setPreset(event.target.value as PreviewPreset)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 text-sm font-bold text-white outline-none">
            {previewPresets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <Button type="button" aria-label="Zoom out" title="Zoom out" className="h-11 w-11 px-0" onClick={() => setZoom((value) => Math.max(0.42, value - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="w-14 text-center text-xs font-black text-cyan-100">{Math.round(zoom * 100)}%</span>
            <Button type="button" aria-label="Zoom in" title="Zoom in" className="h-11 w-11 px-0" onClick={() => setZoom((value) => Math.min(1.2, value + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0 overflow-hidden rounded-md border border-cyan-300/15 bg-[#030916]/94">
          <div className="border-b border-cyan-300/10 px-4 py-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
              <span><Check className="mr-1 inline h-3.5 w-3.5 text-emerald-300" /> Completed</span>
              <span><ChevronRight className="mr-1 inline h-3.5 w-3.5 text-cyan-200" /> Current / Next</span>
              <span><CircleHelp className="mr-1 inline h-3.5 w-3.5" /> Future mystery</span>
              <span className="ml-auto">Drag unlocked nodes. Scroll to move across eras.</span>
            </div>
          </div>
          <div className="max-h-[70vh] overflow-auto scroll-smooth">
            <div className="relative" style={{ width: canvasWidth * zoom, height: canvasHeight * zoom }}>
              {tree.eraBands.map((band) => (
                <div
                  key={band.id}
                  className="absolute top-0 h-full border-x border-cyan-200/10 bg-cyan-300/[0.018]"
                  style={{ left: band.positionX * zoom, width: band.width * zoom }}
                >
                  <p className="sticky left-0 top-0 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">{band.order}. {band.displayName}</p>
                </div>
              ))}
              <svg className="pointer-events-none absolute inset-0" width={canvasWidth * zoom} height={canvasHeight * zoom} aria-hidden="true">
                {tree.edges.map((edge) => {
                  const source = tree.nodes.find((node) => node.id === edge.sourceNodeId);
                  const target = tree.nodes.find((node) => node.id === edge.targetNodeId);
                  if (!source || !target) return null;
                  const sourcePosition = positionOverrides[source.id] ?? { x: source.treePositionX, y: source.treePositionY };
                  const targetPosition = positionOverrides[target.id] ?? { x: target.treePositionX, y: target.treePositionY };
                  const x1 = (sourcePosition.x + source.treeWidth) * zoom;
                  const y1 = (sourcePosition.y + source.treeHeight / 2) * zoom;
                  const x2 = targetPosition.x * zoom;
                  const y2 = (targetPosition.y + target.treeHeight / 2) * zoom;
                  const curve = Math.max(35, (x2 - x1) * 0.42);
                  const targetState = visibleState(target, completed);
                  return <path key={edge.id} d={`M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`} fill="none" stroke={targetState === "mystery" ? "rgba(100,116,139,.2)" : "rgba(103,232,249,.4)"} strokeWidth={Math.max(1, 2 * zoom)} strokeDasharray={targetState === "mystery" ? "5 7" : undefined} />;
                })}
              </svg>
              {tree.nodes.map((node) => {
                const upgrade = upgradesById.get(node.upgradeId);
                const state = visibleState(node, completed);
                const position = positionOverrides[node.id] ?? { x: node.treePositionX, y: node.treePositionY };
                const focused = branch === "all" || node.treeBranchId === branch;
                const matched = !query || matchingNodeIds.has(node.id);
                const unlocked = unlockedIds.includes(node.id);
                const mystery = state === "mystery";
                return (
                  <button
                    key={node.id}
                    type="button"
                    aria-label={mystery ? "Unknown upgrade" : `${upgrade?.name ?? "Upgrade"}: ${state}`}
                    title={mystery ? "Unknown upgrade" : upgrade?.name}
                    onClick={() => setSelectedId(node.id)}
                    onPointerDown={(event) => {
                      if (!unlocked) return;
                      event.currentTarget.setPointerCapture(event.pointerId);
                      dragRef.current = { id: node.id, startX: event.clientX, startY: event.clientY, originX: position.x, originY: position.y };
                    }}
                    onPointerMove={(event) => {
                      const drag = dragRef.current;
                      if (!drag || drag.id !== node.id) return;
                      setPositionOverrides((current) => ({
                        ...current,
                        [node.id]: {
                          x: Math.max(0, drag.originX + (event.clientX - drag.startX) / zoom),
                          y: Math.max(42, drag.originY + (event.clientY - drag.startY) / zoom)
                        }
                      }));
                    }}
                    onPointerUp={() => { dragRef.current = null; }}
                    className={`absolute overflow-hidden rounded-md border p-2 text-left shadow-lg transition ${branchTone[node.treeBranchId] ?? branchTone.technology} ${selectedId === node.id ? "ring-2 ring-cyan-200" : ""} ${focused && matched ? "opacity-100" : "opacity-15"} ${state === "completed" ? "shadow-emerald-950/50" : state === "next" ? "grayscale-[.35] ring-1 ring-cyan-200/30" : "border-slate-600/25 bg-slate-900/65 text-slate-500 grayscale"}`}
                    style={{ left: position.x * zoom, top: position.y * zoom, width: node.treeWidth * zoom, height: node.treeHeight * zoom, fontSize: Math.max(8, 11 * zoom) }}
                  >
                    {mystery ? (
                      <span className="grid h-full place-items-center"><CircleHelp className="h-6 w-6" /><span className="sr-only">Unknown upgrade</span></span>
                    ) : (
                      <>
                        <span className="block truncate font-black">{upgrade?.name}</span>
                        <span className="mt-1 block truncate opacity-70">{state === "completed" ? `Level ${upgrade?.max_level ?? 1}` : upgrade?.cost_resource ? `${upgrade.base_cost.toLocaleString()} ${upgrade.cost_resource}` : "Requirements available"}</span>
                        <span className="mt-1 block truncate opacity-65">{upgrade?.bonus_type}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-300">Node Inspector</p>
            <h2 className="mt-2 text-xl font-black text-white">{selectedUpgrade?.name ?? "Select a node"}</h2>
            {selected ? <p className="mt-1 text-xs text-slate-500">{selected.upgradeId}</p> : null}
          </div>
          {selected && selectedUpgrade ? (
            <>
              <Button
                type="button"
                onClick={() => setUnlockedIds((current) => current.includes(selected.id) ? current.filter((id) => id !== selected.id) : [...current, selected.id])}
                className="w-full"
              >
                {unlockedIds.includes(selected.id) ? <Lock className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
                {unlockedIds.includes(selected.id) ? "Lock Position" : "Unlock Position"}
              </Button>
              {[
                ["Branch", selected.treeBranchId],
                ["Era", selected.sourceEra],
                ["Node Type", selected.treeNodeType.replaceAll("_", " ")],
                ["Preview State", visibleState(selected, completed)],
                ["Reveal Rule", selected.visibility.revealRule],
                ["Prerequisites", selected.prerequisiteNodeIds.length],
                ["Effect", `${selectedUpgrade.bonus_type}: ${selectedUpgrade.bonus_value}`],
                ["Cost", `${selectedUpgrade.base_cost.toLocaleString()} ${selectedUpgrade.cost_resource}`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-2">
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.15em] text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-bold capitalize text-slate-200">{value}</p>
                </div>
              ))}
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.15em] text-slate-500">Consequence Preview</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selected.consequenceSummary}</p>
              </div>
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.15em] text-slate-500">Influences</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.alignmentInfluences.length ? selected.alignmentInfluences.map((item) => <span key={item.id} className="rounded border border-cyan-300/20 px-2 py-1 text-xs font-bold text-cyan-100">{item.id.replace("alignment-", "")} +{item.weight}</span>) : <span className="text-sm text-slate-500">No direct alignment shift</span>}
                </div>
              </div>
            </>
          ) : null}
          <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.15em] text-slate-500">Civilization Trajectory</p>
            <div className="mt-2 space-y-2">
              {trajectory.length ? trajectory.map(([id, score]) => (
                <div key={id} className="flex items-center justify-between text-sm"><span className="capitalize text-slate-300">{id.replace("alignment-", "")}</span><span className="font-black text-cyan-100">{score}</span></div>
              )) : <p className="text-sm text-slate-500">Undetermined</p>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

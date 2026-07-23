"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Blend,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Download,
  Eye,
  EyeOff,
  FileImage,
  Folder,
  FolderOpen,
  GripVertical,
  Heart,
  ImageIcon,
  Layers3,
  Lock,
  Maximize2,
  Move,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Unlock,
  Upload
} from "lucide-react";
import {
  environmentComposerContract,
  environmentComposerRuntimeContract,
  environmentLayerAssets,
  environmentProfiles,
  environmentThemes,
  type EnvironmentAssetVisualFamily,
  type EnvironmentLayerAsset,
  type EnvironmentLayerTemplate,
  type EnvironmentProfile,
  type EnvironmentTheme,
  type EnvironmentTreeNode,
  type EnvironmentTypeId
} from "@/lib/environment-composer";
import { cn } from "@/lib/utils";

export type EnvironmentComposerView = "layers" | "scenes" | "themes" | "export";

type WorkspaceState = {
  profiles: EnvironmentProfile[];
  favoriteAssetIds: string[];
  recentAssetIds: string[];
};

const storageKey = "project-genesis-environment-composer-v1";

const viewCopy: Record<EnvironmentComposerView, { eyebrow: string; title: string; description: string }> = {
  layers: {
    eyebrow: "Environment Composer",
    title: "Layer Library",
    description: "Browse reusable environment layers using an artist-first hierarchy. PSD masters stay private; compositions reference exported layers."
  },
  scenes: {
    eyebrow: "Environment Composer",
    title: "Scene Composer",
    description: "Arrange layered HD-2D compositions with familiar visibility, ordering, blend, depth, parallax, and transform controls."
  },
  themes: {
    eyebrow: "Environment Composer",
    title: "Themes",
    description: "Define compatible asset palettes, lighting, fog, particles, depth of field, and bloom across environment compositions."
  },
  export: {
    eyebrow: "Environment Composer",
    title: "Runtime Export",
    description: "Review the sanitized environment contract published to clients. Runtime exports references and artistic intent, never textures or PSD source paths."
  }
};

function cloneProfiles() {
  return structuredClone(environmentProfiles);
}

function parseWorkspaceState(value: string | null): WorkspaceState {
  if (!value) return { profiles: cloneProfiles(), favoriteAssetIds: [], recentAssetIds: [] };
  try {
    const parsed = JSON.parse(value) as Partial<WorkspaceState>;
    return {
      profiles: Array.isArray(parsed.profiles) && parsed.profiles.length === environmentProfiles.length ? parsed.profiles : cloneProfiles(),
      favoriteAssetIds: Array.isArray(parsed.favoriteAssetIds) ? parsed.favoriteAssetIds : [],
      recentAssetIds: Array.isArray(parsed.recentAssetIds) ? parsed.recentAssetIds : []
    };
  } catch {
    return { profiles: cloneProfiles(), favoriteAssetIds: [], recentAssetIds: [] };
  }
}

function flattenTree(nodes: EnvironmentTreeNode[]): EnvironmentTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

function assetCountForNode(node: EnvironmentTreeNode) {
  const nodeIds = new Set(flattenTree([node]).map((item) => item.id));
  return environmentLayerAssets.filter((asset) => nodeIds.has(asset.folderId)).length;
}

function EnvironmentThumbnail({ family, compact = false }: { family: EnvironmentAssetVisualFamily; compact?: boolean }) {
  const common = "absolute rounded-full";
  return (
    <div className={cn("relative isolate overflow-hidden bg-[#020611]", compact ? "h-full min-h-16" : "aspect-video")}>
      <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_24%,rgba(255,255,255,.9)_0_1px,transparent_1.5px),radial-gradient(circle_at_72%_36%,rgba(165,243,252,.8)_0_1px,transparent_1.5px),radial-gradient(circle_at_42%_78%,rgba(255,255,255,.7)_0_1px,transparent_1.5px)] [background-size:57px_51px,83px_73px,101px_91px]" />
      {family === "nebula" ? <div className="absolute inset-[15%] rounded-[45%] bg-cyan-500/20 blur-2xl shadow-[0_0_50px_rgba(34,211,238,.35)]" /> : null}
      {family === "dust" ? <div className="absolute inset-x-[-10%] top-1/2 h-8 -rotate-6 bg-amber-100/10 blur-xl" /> : null}
      {family === "haze" || family === "fog" ? <div className="absolute inset-x-0 bottom-0 h-2/3 bg-cyan-100/10 blur-xl" /> : null}
      {family === "light" ? <div className="absolute -top-16 left-1/3 h-72 w-12 rotate-12 bg-amber-100/25 blur-xl" /> : null}
      {family === "planet" ? (
        <div className={cn(common, "left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 bg-cyan-950 shadow-[inset_-18px_-8px_25px_rgba(0,0,0,.8),0_0_24px_rgba(103,232,249,.25)]")}>
          <div className="absolute left-3 top-5 h-3 w-12 rounded-full bg-cyan-200/15 blur-sm" />
        </div>
      ) : null}
      {family === "orbit" ? (
        <>
          <div className="absolute left-1/2 top-1/2 h-16 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-cyan-200/35" />
          <div className="absolute left-1/2 top-1/2 h-8 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-cyan-200/20" />
        </>
      ) : null}
      {family === "terrain" ? <div className="absolute inset-x-0 bottom-0 h-2/3 [clip-path:polygon(0_80%,18%_42%,32%_68%,52%_18%,72%_65%,88%_34%,100%_70%,100%_100%,0_100%)] bg-slate-700/70" /> : null}
      {family === "ui" ? (
        <>
          <div className="absolute inset-[22%] rounded-full border border-cyan-200/65 shadow-[0_0_18px_rgba(103,232,249,.35)]" />
          <div className="absolute inset-[34%] rounded-full border border-cyan-200/30" />
        </>
      ) : null}
      {family === "stars" ? <div className="absolute left-[62%] top-[42%] h-2 w-2 rounded-full bg-white shadow-[0_0_18px_5px_rgba(165,243,252,.75)]" /> : null}
    </div>
  );
}

function AssetCard({
  asset,
  favorite,
  selected,
  onFavorite,
  onSelect
}: {
  asset: EnvironmentLayerAsset;
  favorite: boolean;
  selected: boolean;
  onFavorite: () => void;
  onSelect: () => void;
}) {
  return (
    <article
      draggable
      onDragStart={(event) => event.dataTransfer.setData("application/x-noveris-environment-asset", asset.id)}
      onClick={onSelect}
      className={cn(
        "group min-w-0 cursor-pointer overflow-hidden rounded-md border bg-[#07101e]/88 transition focus-within:border-cyan-200/70 hover:-translate-y-0.5 hover:border-cyan-200/50",
        selected ? "border-cyan-200/80 shadow-[0_0_28px_rgba(34,211,238,.15)]" : "border-cyan-300/15"
      )}
    >
      <EnvironmentThumbnail family={asset.visualFamily} />
      <div className="space-y-3 p-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-white" title={asset.displayName}>{asset.displayName}</p>
            <p className="mt-1 truncate text-[0.65rem] font-black uppercase tracking-[0.14em] text-cyan-200">{asset.layerRoleId.replaceAll("-", " ")}</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onFavorite();
            }}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md border", favorite ? "border-amber-300/35 bg-amber-300/10 text-amber-200" : "border-slate-700 text-slate-500 hover:text-white")}
          >
            <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-400">
          <span>{asset.resolution.width}×{asset.resolution.height}</span>
          <span>{asset.usageCount} uses</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {asset.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded border border-cyan-300/10 px-1.5 py-0.5 text-[0.6rem] font-bold text-slate-400">{tag}</span>)}
        </div>
      </div>
    </article>
  );
}

function TreeRows({
  nodes,
  expanded,
  selectedFolderId,
  onToggle,
  onSelect,
  depth = 0
}: {
  nodes: EnvironmentTreeNode[];
  expanded: string[];
  selectedFolderId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  return (
    <>
      {nodes.map((node) => {
        const isExpanded = expanded.includes(node.id);
        const hasChildren = node.children.length > 0;
        return (
          <div key={node.id}>
            <div
              className={cn(
                "flex min-w-0 items-center gap-1 rounded-md border border-transparent py-1.5 pr-2 text-sm font-bold text-slate-400 transition hover:bg-cyan-300/8 hover:text-white",
                selectedFolderId === node.id && "border-cyan-300/20 bg-cyan-300/10 text-cyan-50"
              )}
              style={{ paddingLeft: `${depth * 14 + 4}px` }}
            >
              {hasChildren ? (
                <button type="button" onClick={() => onToggle(node.id)} className="grid h-6 w-6 shrink-0 place-items-center rounded hover:bg-cyan-300/10" aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}>
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ) : <span className="h-6 w-6 shrink-0" />}
              <button type="button" onClick={() => onSelect(node.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                {hasChildren && isExpanded ? <FolderOpen className="h-4 w-4 shrink-0 text-cyan-200" /> : <Folder className="h-4 w-4 shrink-0 text-cyan-200/70" />}
                <span className="truncate">{node.label}</span>
                <span className="ml-auto rounded border border-cyan-300/10 bg-slate-950/30 px-1.5 py-0.5 text-[0.62rem] text-slate-500">{assetCountForNode(node)}</span>
              </button>
            </div>
            {hasChildren && isExpanded ? <TreeRows nodes={node.children} expanded={expanded} selectedFolderId={selectedFolderId} onToggle={onToggle} onSelect={onSelect} depth={depth + 1} /> : null}
          </div>
        );
      })}
    </>
  );
}

function LayerRow({
  layer,
  active,
  onSelect,
  onChange
}: {
  layer: EnvironmentLayerTemplate;
  active: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<EnvironmentLayerTemplate>) => void;
}) {
  return (
    <div
      draggable
      onClick={onSelect}
      className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-2 py-2 transition", active ? "border-cyan-200/55 bg-cyan-300/12" : "border-cyan-300/10 bg-slate-950/25 hover:border-cyan-300/25")}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-slate-600" />
      <button type="button" onClick={(event) => { event.stopPropagation(); onChange({ visible: !layer.visible }); }} className="text-slate-400 hover:text-white" aria-label={layer.visible ? "Hide layer" : "Show layer"}>
        {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <div className="h-8 w-12 shrink-0 overflow-hidden rounded border border-cyan-300/10">
        <EnvironmentThumbnail family={environmentLayerAssets.find((asset) => asset.id === layer.assetId)?.visualFamily ?? "haze"} compact />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-white">{layer.name}</p>
        <p className="truncate text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-500">{layer.blendMode.replace("_", " ")} · {Math.round(layer.opacity * 100)}%</p>
      </div>
      <button type="button" onClick={(event) => { event.stopPropagation(); onChange({ locked: !layer.locked }); }} className="text-slate-500 hover:text-white" aria-label={layer.locked ? "Unlock layer" : "Lock layer"}>
        {layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function ScenePreview({ profile, theme, safeOverlay }: { profile: EnvironmentProfile; theme: EnvironmentTheme; safeOverlay: boolean }) {
  const visibleLayers = profile.layers.filter((layer) => layer.visible);
  return (
    <div className="relative aspect-video min-h-[24rem] overflow-hidden rounded-md border border-cyan-300/20 bg-[#01030a] shadow-[inset_0_0_90px_rgba(0,0,0,.72)]">
      <div className="absolute inset-0 opacity-75 [background-image:radial-gradient(circle_at_14%_21%,white_0_1px,transparent_1.5px),radial-gradient(circle_at_78%_31%,rgba(165,243,252,.9)_0_1px,transparent_1.5px),radial-gradient(circle_at_40%_75%,rgba(255,255,255,.7)_0_1px,transparent_1.5px)] [background-size:79px_71px,111px_97px,137px_119px]" />
      {visibleLayers.map((layer) => {
        const asset = environmentLayerAssets.find((candidate) => candidate.id === layer.assetId);
        const color = layer.tint === "#ffffff" ? theme.colorPalette[2] : layer.tint;
        const transform = `translate(${layer.offset.x}px, ${layer.offset.y}px) rotate(${layer.rotation}deg) scale(${layer.scale})`;
        if (asset?.visualFamily === "planet") return <div key={layer.id} className="absolute left-[62%] top-[42%] h-28 w-28 rounded-full" style={{ opacity: layer.opacity, transform, backgroundColor: `${color}33`, boxShadow: `inset -24px -8px 32px rgba(0,0,0,.82), 0 0 28px ${color}44`, mixBlendMode: layer.blendMode === "add" ? "screen" : layer.blendMode.replace("_", "-") as React.CSSProperties["mixBlendMode"] }} />;
        if (asset?.visualFamily === "orbit") return <div key={layer.id} className="absolute left-1/2 top-1/2 h-52 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border" style={{ opacity: layer.opacity, borderColor: `${color}55` }} />;
        if (asset?.visualFamily === "light") return <div key={layer.id} className="absolute -top-1/3 left-[42%] h-[150%] w-24 rotate-12 blur-2xl" style={{ opacity: layer.opacity * 0.55, backgroundColor: `${color}44`, transform }} />;
        if (asset?.visualFamily === "nebula") return <div key={layer.id} className="absolute left-[8%] top-[10%] h-2/3 w-2/3 rounded-[48%] blur-[54px]" style={{ opacity: layer.opacity * 0.48, backgroundColor: `${color}55`, transform, mixBlendMode: "screen" }} />;
        if (asset?.visualFamily === "fog" || asset?.visualFamily === "haze" || asset?.visualFamily === "dust") return <div key={layer.id} className="absolute inset-x-[-10%] bottom-[5%] h-1/3 rotate-[-4deg] blur-3xl" style={{ opacity: layer.opacity * 0.35, backgroundColor: `${color}33`, transform }} />;
        if (asset?.visualFamily === "ui") return <div key={layer.id} className="absolute left-[62%] top-[42%] h-36 w-36 rounded-full border" style={{ opacity: layer.opacity, borderColor: `${color}aa`, boxShadow: `0 0 22px ${color}44`, transform }} />;
        return null;
      })}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,.9)]" />
      {safeOverlay ? (
        <>
          <div className="absolute left-1/2 top-1/2 h-[34%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded border border-amber-200/45 bg-amber-200/5" />
          <div className="absolute bottom-5 left-5 rounded border border-amber-200/30 bg-slate-950/70 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-amber-100">UI safe zone</div>
        </>
      ) : null}
      <div className="absolute left-4 top-4 flex gap-2">
        <span className="rounded border border-cyan-200/25 bg-slate-950/70 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-cyan-100">{profile.environmentTypeId.replace("_", " ")}</span>
        <span className="rounded border border-cyan-200/15 bg-slate-950/70 px-2 py-1 text-[0.62rem] font-bold text-slate-300">{profile.seed}</span>
      </div>
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-500"><span>{label}</span><span className="text-cyan-100">{value}</span></span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full accent-cyan-300" />
    </label>
  );
}

export function EnvironmentComposerWorkspace({ initialView }: { initialView: EnvironmentComposerView }) {
  const [workspace, setWorkspace] = useState<WorkspaceState>({ profiles: cloneProfiles(), favoriteAssetIds: [], recentAssetIds: [] });
  const [hydrated, setHydrated] = useState(false);
  const [environmentTypeId, setEnvironmentTypeId] = useState<EnvironmentTypeId>("star_system");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(environmentLayerAssets[0]?.id ?? null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(environmentProfiles.find((profile) => profile.environmentTypeId === "star_system")?.layers[0]?.id ?? null);
  const [expanded, setExpanded] = useState<string[]>(environmentComposerContract.layerTrees.star_system.filter((node) => node.children.length).map((node) => node.id));
  const [query, setQuery] = useState("");
  const [themeId, setThemeId] = useState("midnight-sapphire");
  const [safeOverlay, setSafeOverlay] = useState(true);
  const [treeVisible, setTreeVisible] = useState(true);

  useEffect(() => {
    setWorkspace(parseWorkspaceState(window.localStorage.getItem(storageKey)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(workspace));
  }, [hydrated, workspace]);

  const profile = workspace.profiles.find((item) => item.environmentTypeId === environmentTypeId) ?? workspace.profiles[0];
  const theme = environmentThemes.find((item) => item.id === themeId) ?? environmentThemes[0];
  const selectedLayer = profile.layers.find((layer) => layer.id === selectedLayerId) ?? profile.layers[0];
  const tree = environmentComposerContract.layerTrees[environmentTypeId];
  const selectedNodeIds = selectedFolderId ? new Set(flattenTree(tree).filter((node) => node.id === selectedFolderId || flattenTree([node]).some((child) => child.id === selectedFolderId)).flatMap((node) => flattenTree([node]).map((child) => child.id))) : null;
  const filteredAssets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return environmentLayerAssets.filter((asset) => {
      if (!asset.environmentTypeIds.includes(environmentTypeId)) return false;
      if (selectedNodeIds && !selectedNodeIds.has(asset.folderId)) return false;
      if (themeId && !asset.themeIds.includes(themeId)) return false;
      return !needle || [asset.displayName, asset.semanticKey, asset.layerRoleId, ...asset.tags].some((value) => value.toLowerCase().includes(needle));
    });
  }, [environmentTypeId, query, selectedNodeIds, themeId]);

  const updateProfile = (updater: (current: EnvironmentProfile) => EnvironmentProfile) => {
    setWorkspace((current) => ({
      ...current,
      profiles: current.profiles.map((item) => item.id === profile.id ? updater(item) : item)
    }));
  };

  const updateLayer = (layerId: string, patch: Partial<EnvironmentLayerTemplate>) => {
    updateProfile((current) => ({ ...current, layers: current.layers.map((layer) => layer.id === layerId ? { ...layer, ...patch } : layer) }));
  };

  const selectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setWorkspace((current) => ({ ...current, recentAssetIds: [assetId, ...current.recentAssetIds.filter((id) => id !== assetId)].slice(0, 24) }));
  };

  const addAssetToScene = (assetId: string) => {
    const asset = environmentLayerAssets.find((item) => item.id === assetId);
    if (!asset) return;
    const newLayer: EnvironmentLayerTemplate = {
      id: `${profile.environmentTypeId}-layer-${Date.now()}`,
      name: asset.displayName,
      order: profile.layers.length + 1,
      folderId: asset.folderId,
      assetId: asset.id,
      visible: true,
      locked: false,
      opacity: 1,
      depth: profile.layers.length * 10,
      blendMode: ["nebula", "light", "stars"].includes(asset.visualFamily) ? "screen" : "normal",
      rotation: 0,
      scale: 1,
      offset: { x: 0, y: 0 },
      tint: "#ffffff",
      parallax: 0.3,
      visibilityRules: [],
      seedVariationRules: { enabled: false, assetPoolIds: [], opacityVariance: 0, rotationVariance: 0 },
      animation: { enabled: false, type: "none", speed: 0, reducedMotionFallback: "static" }
    };
    updateProfile((current) => ({ ...current, layers: [...current.layers, newLayer] }));
    setSelectedLayerId(newLayer.id);
  };

  const copy = viewCopy[initialView];

  return (
    <main className="space-y-5">
      <section className="studio-material-command rounded-md p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{copy.eyebrow}</p>
            <h1 className="mt-2 text-4xl font-black text-white">{copy.title}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{copy.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/assets?upload=asset" className="inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-50 hover:border-cyan-200/55">
              <Upload className="h-4 w-4" />
              Import Layer Export
            </a>
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-slate-600/40 bg-slate-950/35 px-3 py-2 text-sm font-black text-slate-200">
              <FileImage className="h-4 w-4" />
              PSD Workflow
            </button>
          </div>
        </div>
      </section>

      <section className="studio-material-projection flex flex-wrap items-center gap-3 rounded-md p-3">
        <label className="flex min-w-48 items-center gap-2">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Environment</span>
          <select
            value={environmentTypeId}
            onChange={(event) => {
              const id = event.target.value as EnvironmentTypeId;
              setEnvironmentTypeId(id);
              setSelectedFolderId(null);
              setExpanded(environmentComposerContract.layerTrees[id].filter((node) => node.children.length).map((node) => node.id));
              setSelectedLayerId(workspace.profiles.find((item) => item.environmentTypeId === id)?.layers[0]?.id ?? null);
            }}
            className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm font-bold text-white outline-none"
          >
            {environmentComposerContract.environmentTypes.map((environment) => <option key={environment.id} value={environment.id}>{environment.displayName}</option>)}
          </select>
        </label>
        <label className="flex min-w-48 items-center gap-2">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Theme</span>
          <select value={themeId} onChange={(event) => setThemeId(event.target.value)} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm font-bold text-white outline-none">
            {environmentThemes.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}
          </select>
        </label>
        <div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className="rounded border border-cyan-300/15 px-2 py-1">{profile.layers.length} layers</span>
          <span className="rounded border border-cyan-300/15 px-2 py-1">{filteredAssets.length} compatible assets</span>
          <span className="rounded border border-emerald-300/20 bg-emerald-300/8 px-2 py-1 text-emerald-100">Draft saved locally</span>
        </div>
      </section>

      {initialView === "layers" ? (
        <section className={cn("grid min-h-[44rem] gap-3", treeVisible ? "xl:grid-cols-[18rem_minmax(0,1fr)_19rem]" : "xl:grid-cols-[minmax(0,1fr)_19rem]")}>
          {treeVisible ? (
            <aside className="studio-material-command min-w-0 rounded-md p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-300">Layer Tree</p>
                  <p className="mt-1 text-xs text-slate-500">{environmentComposerContract.environmentTypes.find((item) => item.id === environmentTypeId)?.displayName}</p>
                </div>
                <button type="button" onClick={() => setTreeVisible(false)} className="grid h-8 w-8 place-items-center rounded border border-cyan-300/15 text-slate-400 hover:text-white" aria-label="Hide layer tree"><PanelLeftClose className="h-4 w-4" /></button>
              </div>
              <button type="button" onClick={() => setSelectedFolderId(null)} className={cn("mt-4 flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-sm font-black", selectedFolderId === null ? "border-cyan-300/30 bg-cyan-300/10 text-white" : "border-transparent text-slate-400")}>
                <Layers3 className="h-4 w-4 text-cyan-200" />
                All {environmentComposerContract.environmentTypes.find((item) => item.id === environmentTypeId)?.displayName} Layers
              </button>
              <div className="mt-2">
                <TreeRows nodes={tree} expanded={expanded} selectedFolderId={selectedFolderId} onToggle={(id) => setExpanded((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onSelect={setSelectedFolderId} />
              </div>
            </aside>
          ) : null}

          <div className="min-w-0 space-y-3">
            <div className="studio-material-command rounded-md p-3">
              <div className="flex gap-2">
                {!treeVisible ? <button type="button" onClick={() => setTreeVisible(true)} className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/20 text-cyan-100" aria-label="Show layer tree"><PanelLeftOpen className="h-4 w-4" /></button> : null}
                <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-cyan-300/15 bg-slate-950/45 px-3">
                  <Search className="h-4 w-4 text-cyan-200" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blue, nebula, stars, dust, atmosphere..." className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" />
                </label>
              </div>
            </div>
            {filteredAssets.length ? (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    favorite={workspace.favoriteAssetIds.includes(asset.id)}
                    selected={selectedAssetId === asset.id}
                    onSelect={() => selectAsset(asset.id)}
                    onFavorite={() => setWorkspace((current) => ({ ...current, favoriteAssetIds: current.favoriteAssetIds.includes(asset.id) ? current.favoriteAssetIds.filter((id) => id !== asset.id) : [...current.favoriteAssetIds, asset.id] }))}
                  />
                ))}
              </div>
            ) : (
              <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-cyan-300/20 bg-slate-950/20 p-8 text-center">
                <div>
                  <ImageIcon className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-3 text-lg font-black text-white">No compatible layers</p>
                  <p className="mt-1 text-sm text-slate-500">Change the folder, theme, or search. No artwork is fabricated when a layer export is missing.</p>
                </div>
              </div>
            )}
          </div>

          <aside className="studio-material-command rounded-md p-3">
            {selectedAssetId ? (() => {
              const asset = environmentLayerAssets.find((item) => item.id === selectedAssetId);
              if (!asset) return null;
              return (
                <div>
                  <EnvironmentThumbnail family={asset.visualFamily} />
                  <h2 className="mt-4 text-lg font-black text-white">{asset.displayName}</h2>
                  <p className="mt-1 text-xs font-bold text-cyan-200">{asset.semanticKey}</p>
                  <dl className="mt-4 grid gap-2 text-xs">
                    {[
                      ["Resolution", `${asset.resolution.width}×${asset.resolution.height}`],
                      ["Master", asset.sourceMaster.toUpperCase()],
                      ["Export", asset.exportedFormat.toUpperCase()],
                      ["Transparency", asset.hasTransparency ? "Required" : "Opaque"],
                      ["Status", asset.status],
                      ["Usage", `${asset.usageCount} scenes`]
                    ].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-cyan-300/10 py-2"><dt className="text-slate-500">{label}</dt><dd className="text-right font-bold text-slate-200">{value}</dd></div>)}
                  </dl>
                  <button type="button" onClick={() => addAssetToScene(asset.id)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-50 hover:border-cyan-200/60">
                    <Layers3 className="h-4 w-4" />
                    Add To Scene
                  </button>
                  <a href="/environment-composer/scenes" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-600/40 px-3 py-2 text-sm font-black text-slate-300 hover:text-white">
                    <Maximize2 className="h-4 w-4" />
                    Open Scene Composer
                  </a>
                </div>
              );
            })() : (
              <div className="grid min-h-64 place-items-center text-center text-sm text-slate-500">Select an asset to inspect it.</div>
            )}
          </aside>
        </section>
      ) : null}

      {initialView === "scenes" ? (
        <section className="grid gap-3 2xl:grid-cols-[17rem_minmax(0,1fr)_20rem]">
          <aside className="studio-material-command rounded-md p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-300">Layers</p>
                <p className="mt-1 text-xs text-slate-500">Top renders last</p>
              </div>
              <Layers3 className="h-4 w-4 text-cyan-200" />
            </div>
            <div
              className="mt-3 space-y-2"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                addAssetToScene(event.dataTransfer.getData("application/x-noveris-environment-asset"));
              }}
            >
              {[...profile.layers].reverse().map((layer) => <LayerRow key={layer.id} layer={layer} active={selectedLayer?.id === layer.id} onSelect={() => setSelectedLayerId(layer.id)} onChange={(patch) => updateLayer(layer.id, patch)} />)}
            </div>
          </aside>

          <div className="min-w-0 space-y-3">
            <div className="studio-material-command rounded-md p-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setSafeOverlay((current) => !current)} className={cn("inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black", safeOverlay ? "border-amber-300/35 bg-amber-300/10 text-amber-100" : "border-slate-600/40 text-slate-400")}>
                  <Maximize2 className="h-4 w-4" />
                  Safe UI Overlay
                </button>
                <button type="button" onClick={() => updateProfile((current) => ({ ...current, layers: cloneProfiles().find((item) => item.id === current.id)?.layers ?? current.layers }))} className="inline-flex items-center gap-2 rounded-md border border-slate-600/40 px-3 py-2 text-xs font-black text-slate-300">
                  <RotateCcw className="h-4 w-4" />
                  Reset Layers
                </button>
                <label className="ml-auto flex items-center gap-2 text-xs font-black text-slate-500">
                  Seed
                  <input value={profile.seed} onChange={(event) => updateProfile((current) => ({ ...current, seed: event.target.value }))} className="h-9 w-52 rounded-md border border-cyan-300/15 bg-slate-950/50 px-2 text-xs font-bold text-white outline-none" />
                </label>
              </div>
              <ScenePreview profile={profile} theme={theme} safeOverlay={safeOverlay} />
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="studio-material-projection rounded-md p-3"><p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Center Safe Zone</p><p className="mt-2 text-lg font-black text-white">{Math.round(profile.constraints.centerSafeZone.width * 100)}% × {Math.round(profile.constraints.centerSafeZone.height * 100)}%</p></div>
              <div className="studio-material-projection rounded-md p-3"><p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Maximum Brightness</p><p className="mt-2 text-lg font-black text-white">{Math.round(profile.constraints.maximumBrightness * 100)}%</p></div>
              <div className="studio-material-projection rounded-md p-3"><p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Nebula Limit</p><p className="mt-2 text-lg font-black text-white">{profile.constraints.maximumNebulas}</p></div>
            </div>
          </div>

          <aside className="studio-material-command rounded-md p-4">
            {selectedLayer ? (
              <div className="space-y-5">
                <div>
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-300">Layer Inspector</p>
                  <h2 className="mt-1 text-lg font-black text-white">{selectedLayer.name}</h2>
                </div>
                <SliderField label="Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.01} onChange={(value) => updateLayer(selectedLayer.id, { opacity: value })} />
                <SliderField label="Depth" value={selectedLayer.depth} min={-100} max={200} step={1} onChange={(value) => updateLayer(selectedLayer.id, { depth: value })} />
                <SliderField label="Parallax" value={selectedLayer.parallax} min={0} max={1} step={0.01} onChange={(value) => updateLayer(selectedLayer.id, { parallax: value })} />
                <SliderField label="Rotation" value={selectedLayer.rotation} min={-180} max={180} step={1} onChange={(value) => updateLayer(selectedLayer.id, { rotation: value })} />
                <SliderField label="Scale" value={selectedLayer.scale} min={0.25} max={3} step={0.05} onChange={(value) => updateLayer(selectedLayer.id, { scale: value })} />
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-500">Offset X<input type="number" value={selectedLayer.offset.x} onChange={(event) => updateLayer(selectedLayer.id, { offset: { ...selectedLayer.offset, x: Number(event.target.value) } })} className="mt-2 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/50 px-2 text-sm text-white" /></label>
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-500">Offset Y<input type="number" value={selectedLayer.offset.y} onChange={(event) => updateLayer(selectedLayer.id, { offset: { ...selectedLayer.offset, y: Number(event.target.value) } })} className="mt-2 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/50 px-2 text-sm text-white" /></label>
                </div>
                <label className="block text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-500">Blend Mode<select value={selectedLayer.blendMode} onChange={(event) => updateLayer(selectedLayer.id, { blendMode: event.target.value as EnvironmentLayerTemplate["blendMode"] })} className="mt-2 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-2 text-sm font-bold text-white"><option value="normal">Normal</option><option value="screen">Screen</option><option value="add">Add</option><option value="multiply">Multiply</option><option value="soft_light">Soft Light</option></select></label>
                <label className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Tint<input type="color" value={selectedLayer.tint} onChange={(event) => updateLayer(selectedLayer.id, { tint: event.target.value })} className="h-9 w-14 rounded border border-cyan-300/15 bg-transparent" /></label>
              </div>
            ) : <p className="text-sm text-slate-500">Select a scene layer to edit its composition settings.</p>}
          </aside>
        </section>
      ) : null}

      {initialView === "themes" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {environmentThemes.map((item) => (
            <button key={item.id} type="button" onClick={() => setThemeId(item.id)} className={cn("overflow-hidden rounded-md border bg-[#07101e]/88 text-left transition hover:-translate-y-0.5", themeId === item.id ? "border-cyan-200/70 shadow-[0_0_30px_rgba(34,211,238,.14)]" : "border-cyan-300/15")}>
              <div className="flex h-24">
                {item.colorPalette.map((color) => <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />)}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-lg font-black text-white">{item.displayName}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p></div>
                  <Palette className="h-5 w-5 shrink-0 text-cyan-200" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded border border-cyan-300/10 p-2"><p className="text-[0.58rem] uppercase text-slate-500">Assets</p><p className="mt-1 font-black text-white">{item.allowedAssetIds.length}</p></div>
                  <div className="rounded border border-cyan-300/10 p-2"><p className="text-[0.58rem] uppercase text-slate-500">Particles</p><p className="mt-1 font-black text-white">{Math.round(item.particleDensity * 100)}%</p></div>
                  <div className="rounded border border-cyan-300/10 p-2"><p className="text-[0.58rem] uppercase text-slate-500">Bloom</p><p className="mt-1 font-black text-white">{Math.round(item.bloom * 100)}%</p></div>
                </div>
              </div>
            </button>
          ))}
        </section>
      ) : null}

      {initialView === "export" ? (
        <section className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <aside className="studio-material-command rounded-md p-4">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-300">Contract Summary</p>
            <dl className="mt-4 space-y-3">
              {[
                ["Version", environmentComposerContract.version],
                ["Environment Types", environmentComposerContract.environmentTypes.length],
                ["Profiles", environmentComposerContract.profiles.length],
                ["Themes", environmentComposerContract.themes.length],
                ["Asset References", environmentComposerContract.layerAssets.length],
                ["Textures Embedded", "No"],
                ["Rendering Owner", "Client / Unity"]
              ].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 border-b border-cyan-300/10 pb-3"><dt className="text-xs font-bold text-slate-500">{label}</dt><dd className="text-right text-sm font-black text-white">{value}</dd></div>)}
            </dl>
            <a href="/api/export/environment-composer.json" download className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-50">
              <Download className="h-4 w-4" />
              Download Contract
            </a>
            <div className="mt-4 flex gap-2 rounded-md border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/80">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
              PSD source masters and private paths are intentionally excluded. Only stable references and public derivative paths can publish.
            </div>
          </aside>
          <div className="studio-material-command min-w-0 rounded-md p-4">
            <div className="flex items-center gap-2">
              <Blend className="h-4 w-4 text-cyan-200" />
              <h2 className="text-sm font-black text-white">Sanitized Runtime Preview</h2>
            </div>
            <pre className="mt-3 max-h-[42rem] overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/65 p-4 text-xs leading-6 text-cyan-50/85">{JSON.stringify(environmentComposerRuntimeContract(), null, 2)}</pre>
          </div>
        </section>
      ) : null}

      <section className="studio-material-command grid gap-3 rounded-md p-4 md:grid-cols-3">
        <div className="flex items-start gap-3"><FileImage className="mt-0.5 h-5 w-5 text-cyan-200" /><div><p className="text-sm font-black text-white">PSD stays the master</p><p className="mt-1 text-xs leading-5 text-slate-500">Photoshop files remain private source artwork. Studio references exported PNG or WebP layers.</p></div></div>
        <div className="flex items-start gap-3"><Move className="mt-0.5 h-5 w-5 text-cyan-200" /><div><p className="text-sm font-black text-white">Photoshop-style composition</p><p className="mt-1 text-xs leading-5 text-slate-500">Layer order, visibility, transforms, depth, blend, and parallax remain reusable authoring data.</p></div></div>
        <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-cyan-200" /><div><p className="text-sm font-black text-white">Client-owned rendering</p><p className="mt-1 text-xs leading-5 text-slate-500">Studio publishes artistic intent. Unity or another client loads references and renders the final scene.</p></div></div>
      </section>
    </main>
  );
}

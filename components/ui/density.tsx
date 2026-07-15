"use client";

import { useEffect, useState } from "react";
import { Columns3, Eye, Filter, Group, LayoutGrid, Search, SlidersHorizontal } from "lucide-react";
import { WorkspaceSearchBar } from "@/components/ui/workspace";
import { cn } from "@/lib/utils";

export type DensityMode = "large" | "medium" | "compact" | "list";
export type PreviewSize = "small" | "medium" | "large" | "hide";
export type ColumnMode = "auto" | "2" | "3" | "4" | "5" | "6";

export type DensitySettings = {
  density: DensityMode;
  previewSize: PreviewSize;
  columns: ColumnMode;
  sort: string;
  filter: string;
  groupBy: string;
};

const defaultDensitySettings: DensitySettings = {
  density: "compact",
  previewSize: "small",
  columns: "auto",
  sort: "updated",
  filter: "all",
  groupBy: "none"
};

export function useWorkspaceDensitySettings(storageKey: string, defaults: Partial<DensitySettings> = {}) {
  const [settings, setSettings] = useState<DensitySettings>(() => ({ ...defaultDensitySettings, ...defaults }));

  useEffect(() => {
    const fallback = { ...defaultDensitySettings, ...defaults };
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setSettings({ ...fallback, ...JSON.parse(raw) });
      else setSettings(fallback);
    } catch {
      setSettings(fallback);
    }
  }, [storageKey]);

  function updateSettings(patch: Partial<DensitySettings>) {
    setSettings((current) => {
      const next = { ...current, ...patch };
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  return [settings, updateSettings] as const;
}

type ToolbarOption = { value: string; label: string };

function ToolbarSelect({
  label,
  value,
  options,
  onChange,
  icon: Icon
}: {
  label: string;
  value: string;
  options: ToolbarOption[];
  onChange: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="grid gap-1">
      <span className="flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-cyan-300/15 bg-slate-950/80 px-2 text-xs font-bold text-white outline-none"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function CompactWorkspaceToolbar({
  query,
  onQueryChange,
  settings,
  onSettingsChange,
  resultCount,
  totalCount,
  sortOptions = [{ value: "updated", label: "Modified" }, { value: "name", label: "Name" }, { value: "status", label: "Status" }, { value: "type", label: "Type" }],
  filterOptions = [{ value: "all", label: "All" }],
  groupOptions = [{ value: "none", label: "None" }, { value: "category", label: "Category" }, { value: "status", label: "Status" }, { value: "type", label: "Type" }, { value: "published", label: "Published" }, { value: "missing", label: "Missing" }],
  placeholder = "Search workspace"
}: {
  query: string;
  onQueryChange: (value: string) => void;
  settings: DensitySettings;
  onSettingsChange: (patch: Partial<DensitySettings>) => void;
  resultCount: number;
  totalCount: number;
  sortOptions?: ToolbarOption[];
  filterOptions?: ToolbarOption[];
  groupOptions?: ToolbarOption[];
  placeholder?: string;
}) {
  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 shadow-glow">
      <div className="grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_repeat(6,minmax(7.5rem,9rem))]">
        <WorkspaceSearchBar value={query} onChange={onQueryChange} placeholder={placeholder} className="p-2" />
        <ToolbarSelect label="View" value={settings.density} icon={LayoutGrid} onChange={(density) => onSettingsChange({ density: density as DensityMode })} options={[
          { value: "large", label: "Large" },
          { value: "medium", label: "Medium" },
          { value: "compact", label: "Compact" },
          { value: "list", label: "List" }
        ]} />
        <ToolbarSelect label="Preview" value={settings.previewSize} icon={Eye} onChange={(previewSize) => onSettingsChange({ previewSize: previewSize as PreviewSize })} options={[
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "hide", label: "Hide" }
        ]} />
        <ToolbarSelect label="Columns" value={settings.columns} icon={Columns3} onChange={(columns) => onSettingsChange({ columns: columns as ColumnMode })} options={[
          { value: "auto", label: "Auto" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" }
        ]} />
        <ToolbarSelect label="Sort" value={settings.sort} icon={SlidersHorizontal} onChange={(sort) => onSettingsChange({ sort })} options={sortOptions} />
        <ToolbarSelect label="Filter" value={settings.filter} icon={Filter} onChange={(filter) => onSettingsChange({ filter })} options={filterOptions} />
        <ToolbarSelect label="Group" value={settings.groupBy} icon={Group} onChange={(groupBy) => onSettingsChange({ groupBy })} options={groupOptions} />
      </div>
      <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-xs font-semibold text-slate-400">
        <Search className="h-4 w-4" />
        {resultCount} shown / {totalCount} total
      </div>
    </section>
  );
}

export function collectionGridClass(settings: DensitySettings) {
  if (settings.density === "list") return "grid gap-2";
  const columns = settings.columns;
  if (columns === "2") return "grid gap-3 md:grid-cols-2";
  if (columns === "3") return "grid gap-3 md:grid-cols-2 xl:grid-cols-3";
  if (columns === "4") return "grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";
  if (columns === "5") return "grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5";
  if (columns === "6") return "grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6";
  if (settings.density === "large") return "grid gap-4 md:grid-cols-2 2xl:grid-cols-3";
  if (settings.density === "medium") return "grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";
  return "grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5";
}

export function previewBoxClass(settings: DensitySettings) {
  if (settings.previewSize === "hide") return "hidden";
  if (settings.density === "list") return "h-12 w-16 shrink-0";
  if (settings.previewSize === "large") return "h-40";
  if (settings.previewSize === "medium") return "h-28";
  return settings.density === "compact" ? "h-16" : "h-20";
}

export function cardShellClass(settings: DensitySettings, selected = false) {
  const base = "group rounded-md border bg-[#07101e]/85 text-left shadow-glow transition hover:border-cyan-300/45 hover:bg-[#0a1728] focus:outline-none focus:ring-2 focus:ring-cyan-300/40";
  const selectedClass = selected ? "border-cyan-300/55 ring-1 ring-cyan-300/30" : "border-cyan-300/15";
  if (settings.density === "list") return cn(base, selectedClass, "grid min-h-[4.75rem] w-full grid-cols-[auto_minmax(0,1fr)_8rem_8rem_7rem_7rem] items-center gap-3 p-2");
  if (settings.density === "large") return cn(base, selectedClass, "min-h-[21rem] p-4");
  if (settings.density === "medium") return cn(base, selectedClass, "min-h-[15rem] p-3");
  return cn(base, selectedClass, "min-h-[8.5rem] p-3");
}

export function DensityInspector({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="sticky top-24 rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-4 shadow-glow">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Inspector</p>
      <h2 className="mt-2 text-xl font-black text-white">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </aside>
  );
}

export function QuickPreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-20 hidden w-72 rounded-md border border-cyan-300/25 bg-slate-950/95 p-2 shadow-2xl group-hover:block">
      {children}
    </div>
  );
}

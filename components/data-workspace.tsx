"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Box,
  Building2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Database,
  FileCode2,
  Flag,
  FlaskConical,
  Gem,
  GitBranch,
  ImageIcon,
  Layers3,
  Network,
  Orbit,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminTable } from "@/components/admin-table";
import { Button } from "@/components/ui/button";
import {
  WorkspaceBadge,
  WorkspaceHeader,
  WorkspaceMiniStat,
  WorkspacePanel,
  WorkspaceSearchBar,
  WorkspaceStatTile,
  workspaceBadgeClass
} from "@/components/ui/workspace";
import type { TableConfig } from "@/lib/tables";
import { cn, titleCase } from "@/lib/utils";

type Row = Record<string, unknown>;

type DataWorkspaceProps = {
  config: TableConfig;
  initialRows: Row[];
  eyebrow?: string;
  title?: string;
  description?: string;
  intent?: string;
  standard?: string;
  rawEditorEnabled?: boolean;
};

const tableIcons: Partial<Record<string, LucideIcon>> = {
  assets: ImageIcon,
  buildings: Building2,
  building_chains: Layers3,
  building_relationships: Network,
  celestial_bodies: CircleDot,
  codex_readiness_items: Archive,
  districts: Box,
  feature_flags: Flag,
  game_constants: Settings,
  planet_resource_profiles: Orbit,
  planets: Orbit,
  project_systems: Database,
  research: FlaskConical,
  resource_catalog: Gem,
  star_systems: Star,
  unlock_matrix: GitBranch,
  upgrades: WandSparkles,
  wonders: Sparkles
};

const accentClasses: Partial<Record<string, string>> = {
  assets: "from-pink-300/20 via-cyan-300/10 to-transparent text-pink-100 border-pink-300/30",
  buildings: "from-teal-300/20 via-cyan-300/10 to-transparent text-teal-100 border-teal-300/30",
  building_chains: "from-teal-300/20 via-emerald-300/10 to-transparent text-teal-100 border-teal-300/30",
  building_relationships: "from-indigo-300/20 via-cyan-300/10 to-transparent text-indigo-100 border-indigo-300/30",
  celestial_bodies: "from-amber-300/20 via-cyan-300/10 to-transparent text-amber-100 border-amber-300/30",
  districts: "from-sky-300/20 via-cyan-300/10 to-transparent text-sky-100 border-sky-300/30",
  feature_flags: "from-orange-300/20 via-cyan-300/10 to-transparent text-orange-100 border-orange-300/30",
  game_constants: "from-slate-300/20 via-cyan-300/10 to-transparent text-slate-100 border-slate-300/30",
  planet_resource_profiles: "from-green-300/20 via-cyan-300/10 to-transparent text-green-100 border-green-300/30",
  planets: "from-green-300/20 via-cyan-300/10 to-transparent text-green-100 border-green-300/30",
  project_systems: "from-cyan-300/20 via-emerald-300/10 to-transparent text-cyan-100 border-cyan-300/30",
  research: "from-cyan-300/20 via-blue-300/10 to-transparent text-cyan-100 border-cyan-300/30",
  resource_catalog: "from-emerald-300/20 via-cyan-300/10 to-transparent text-emerald-100 border-emerald-300/30",
  star_systems: "from-amber-300/20 via-cyan-300/10 to-transparent text-amber-100 border-amber-300/30",
  unlock_matrix: "from-indigo-300/20 via-cyan-300/10 to-transparent text-indigo-100 border-indigo-300/30",
  upgrades: "from-violet-300/20 via-cyan-300/10 to-transparent text-violet-100 border-violet-300/30",
  wonders: "from-amber-300/20 via-orange-300/10 to-transparent text-amber-100 border-amber-300/30"
};

function stringifyValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function pickFirst(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = stringifyValue(row[key]).trim();
    if (value) return value;
  }

  return "";
}

function titleForRow(row: Row, config: TableConfig) {
  const title = pickFirst(row, [
    "name",
    "resource_name",
    "title",
    "system_name",
    "chain",
    "building",
    "constant",
    "feature",
    "source_name",
    "metric_name",
    "issue",
    "value",
    ...config.searchKeys,
    "id"
  ]);

  return title || "Untitled Record";
}

function descriptionForRow(row: Row) {
  return pickFirst(row, [
    "description",
    "design_purpose",
    "gameplay_effect",
    "unlock_summary",
    "notes",
    "scientific_notes",
    "science_lore_notes",
    "codex_implementation_notes",
    "purpose",
    "bonus",
    "generation_rule",
    "next_action"
  ]);
}

function subtitleForRow(row: Row, config: TableConfig) {
  return pickFirst(row, [
    config.typeKey ?? "",
    config.eraKey ?? "",
    "category",
    "rarity",
    "planet_class",
    "system_type",
    "group_name",
    "civilization",
    "source_branch",
    "launch_phase"
  ]);
}

function statusForRow(row: Row, config: TableConfig) {
  return pickFirst(row, [config.statusKey ?? "", "status", "implementation_status", "enabled", "rarity", "priority"]) || "cataloged";
}

function statKeysFor(config: TableConfig) {
  return config.columns.filter((key) => !["id", "name", "resource_name", "title"].includes(key)).slice(0, 3);
}

function uniqueValues(rows: Row[], key?: string) {
  if (!key) return [];
  return Array.from(new Set(rows.map((row) => stringifyValue(row[key]).trim()).filter(Boolean))).slice(0, 12);
}

function rowMatches(row: Row, config: TableConfig, query: string, typeFilter: string, statusFilter: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = !normalizedQuery || config.searchKeys.some((key) => stringifyValue(row[key]).toLowerCase().includes(normalizedQuery));
  const matchesType = typeFilter === "all" || stringifyValue(row[config.typeKey ?? ""]) === typeFilter || stringifyValue(row[config.eraKey ?? ""]) === typeFilter;
  const statusKey = config.statusKey ?? "status";
  const matchesStatus = statusFilter === "all" || stringifyValue(row[statusKey]) === statusFilter || statusForRow(row, config) === statusFilter;

  return matchesQuery && matchesType && matchesStatus;
}

function DataCard({
  row,
  config,
  selected,
  onSelect
}: {
  row: Row;
  config: TableConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = tableIcons[config.table] ?? Database;
  const title = titleForRow(row, config);
  const subtitle = subtitleForRow(row, config);
  const description = descriptionForRow(row);
  const status = statusForRow(row, config);
  const statKeys = statKeysFor(config);
  const accent = accentClasses[config.table] ?? "from-cyan-300/20 via-blue-300/10 to-transparent text-cyan-100 border-cyan-300/30";
  const previewUrl = config.table === "assets" ? pickFirst(row, ["preview_url", "file_url"]) : "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex min-h-[17rem] flex-col rounded-md border bg-[#07101e]/85 p-4 text-left shadow-glow transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-[#0a1728]",
        selected ? "border-cyan-300/55 ring-1 ring-cyan-300/30" : "border-cyan-300/15"
      )}
    >
      <div className={cn("flex h-16 items-center justify-between overflow-hidden rounded-md border bg-gradient-to-br p-3", accent)}>
        {previewUrl ? (
          <img src={previewUrl} alt="" className="h-12 w-16 rounded-md border border-current/25 bg-slate-950/45 object-cover" />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-md border border-current/25 bg-slate-950/45">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <span className={cn("rounded-md border px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em]", workspaceBadgeClass(status))}>
          {status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-4 min-w-0">
        {subtitle ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{subtitle}</p> : null}
        <h3 className="mt-2 line-clamp-2 text-xl font-black text-white">{title}</h3>
      </div>

      <p className="mt-3 line-clamp-2 min-h-11 text-sm leading-6 text-slate-400">
        {description || config.description}
      </p>

      <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
        {statKeys.map((key) => (
          <WorkspaceMiniStat key={key} label={titleCase(key)} value={stringifyValue(row[key]) || "None"} />
        ))}
      </div>
    </button>
  );
}

function DetailPanel({ row, config }: { row: Row; config: TableConfig }) {
  const Icon = tableIcons[config.table] ?? Database;
  const title = titleForRow(row, config);
  const status = statusForRow(row, config);
  const subtitle = subtitleForRow(row, config);
  const description = descriptionForRow(row);
  const accent = accentClasses[config.table] ?? "from-cyan-300/20 via-blue-300/10 to-transparent text-cyan-100 border-cyan-300/30";
  const primaryFields = config.fields.filter((field) => stringifyValue(row[field.key])).slice(0, 10);
  const advancedFields = config.fields.filter((field) => stringifyValue(row[field.key])).slice(10);

  return (
    <WorkspacePanel className="sticky top-24">
      <div className={cn("rounded-md border bg-gradient-to-br p-5", accent)}>
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-md border border-current/25 bg-slate-950/45">
            <Icon className="h-6 w-6" />
          </span>
          <WorkspaceBadge value={status} />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-current/80">{subtitle || config.title}</p>
        <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
        <p className="mt-4 text-sm leading-6 text-slate-200">{description || config.description}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {primaryFields.slice(0, 6).map((field) => (
          <WorkspaceMiniStat key={field.key} label={field.label} value={stringifyValue(row[field.key])} />
        ))}
      </div>

      {advancedFields.length ? (
        <details className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
          <summary className="cursor-pointer text-sm font-bold text-cyan-100">Advanced fields</summary>
          <div className="mt-4 grid gap-3">
            {advancedFields.map((field) => (
              <div key={field.key} className="rounded-md border border-cyan-300/10 bg-[#07101e]/65 p-3">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">{field.label}</p>
                <p className="mt-1 break-words text-sm text-slate-200">{stringifyValue(row[field.key])}</p>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </WorkspacePanel>
  );
}

export function DataWorkspace({
  config,
  initialRows,
  eyebrow = "Studio Data Workspace",
  title = config.title,
  description = config.description,
  intent = "Card-first authoring workspace with raw data tools preserved for advanced edits.",
  standard = "Planet workspace visual standard",
  rawEditorEnabled = true
}: DataWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(() => stringifyValue(initialRows[0]?.id));
  const [rawEditorOpen, setRawEditorOpen] = useState(false);
  const filterKey = config.typeKey ?? config.eraKey;
  const typeOptions = useMemo(() => uniqueValues(initialRows, filterKey), [initialRows, filterKey]);
  const statusOptions = useMemo(() => uniqueValues(initialRows, config.statusKey ?? "status"), [initialRows, config.statusKey]);
  const filteredRows = useMemo(
    () => initialRows.filter((row) => rowMatches(row, config, query, typeFilter, statusFilter)),
    [config, initialRows, query, statusFilter, typeFilter]
  );
  const selected = filteredRows.find((row) => stringifyValue(row.id) === selectedId) ?? filteredRows[0] ?? initialRows[0];
  const readyCount = initialRows.filter((row) => /ready|complete|completed|active|true/i.test(statusForRow(row, config))).length;
  const families = new Set(initialRows.map((row) => subtitleForRow(row, config)).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        stats={[
          { label: "Records", value: initialRows.length },
          { label: "Families", value: families || "Mixed" },
          { label: "Ready", value: readyCount },
          { label: "Fields", value: config.fields.length }
        ]}
      />

      <WorkspacePanel>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{standard}</p>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{intent}</p>
          </div>
          {rawEditorEnabled ? (
            <Button type="button" onClick={() => setRawEditorOpen((value) => !value)} className="h-11 shrink-0">
              <Table2 className="h-4 w-4" />
              {rawEditorOpen ? "Hide Raw Editor" : "Advanced Data Editor"}
              {rawEditorOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          ) : null}
        </div>
      </WorkspacePanel>

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <WorkspaceSearchBar value={query} onChange={setQuery} placeholder={`Search ${title.toLowerCase()}`} className="xl:col-span-1" />
        <div className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 text-sm text-slate-400">
          <Search className="h-4 w-4 text-slate-500" />
          <span>{filteredRows.length} visible</span>
          <span className="text-slate-600">/</span>
          <span>{initialRows.length} total</span>
        </div>
      </div>

      {(typeOptions.length || statusOptions.length) ? (
        <div className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3">
          {typeOptions.length ? (
            <>
              <button type="button" onClick={() => setTypeFilter("all")} className={cn("rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition", typeFilter === "all" ? "border-cyan-300/40 bg-cyan-300/15 text-white" : "border-cyan-300/10 text-slate-400 hover:text-white")}>
                All {filterKey ? titleCase(filterKey) : "Types"}
              </button>
              {typeOptions.map((option) => (
                <button key={option} type="button" onClick={() => setTypeFilter(option)} className={cn("rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition", typeFilter === option ? "border-cyan-300/40 bg-cyan-300/15 text-white" : "border-cyan-300/10 text-slate-400 hover:text-white")}>
                  {option}
                </button>
              ))}
            </>
          ) : null}
          {statusOptions.length ? (
            <>
              <button type="button" onClick={() => setStatusFilter("all")} className={cn("rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition", statusFilter === "all" ? "border-cyan-300/40 bg-cyan-300/15 text-white" : "border-cyan-300/10 text-slate-400 hover:text-white")}>
                All Status
              </button>
              {statusOptions.map((option) => (
                <button key={option} type="button" onClick={() => setStatusFilter(option)} className={cn("rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition", statusFilter === option ? "border-cyan-300/40 bg-cyan-300/15 text-white" : "border-cyan-300/10 text-slate-400 hover:text-white")}>
                  {option}
                </button>
              ))}
            </>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredRows.map((row) => {
            const id = stringifyValue(row.id);
            return (
              <DataCard
                key={id || titleForRow(row, config)}
                row={row}
                config={config}
                selected={Boolean(id) && stringifyValue(selected?.id) === id}
                onSelect={() => setSelectedId(id)}
              />
            );
          })}
        </div>

        {selected ? (
          <DetailPanel row={selected} config={config} />
        ) : (
          <WorkspacePanel className="grid min-h-80 place-items-center text-center">
            <div>
              <ShieldCheck className="mx-auto h-10 w-10 text-cyan-200" />
              <h2 className="mt-4 text-xl font-black text-white">No records match</h2>
              <p className="mt-2 text-sm text-slate-400">Clear filters or search another term.</p>
            </div>
          </WorkspacePanel>
        )}
      </div>

      {rawEditorOpen ? (
        <div className="rounded-md border border-cyan-300/20 bg-slate-950/35 p-2">
          <AdminTable config={config} initialRows={initialRows} />
        </div>
      ) : null}
    </div>
  );
}

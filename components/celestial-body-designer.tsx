import { AlertTriangle, CheckCircle2, CircleDot, Database, GitBranch, Image, Moon, Orbit, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CelestialBodyRecord } from "@/types/schema";

type Body = CelestialBodyRecord;

const bodyIcons = {
  Star,
  Planet: CircleDot,
  Moon,
  "Dwarf Planet": Orbit,
  "Asteroid Belt": GitBranch,
  "Orbital Platform": Database
} as const;

function bodyTypeGroups(rows: Body[]) {
  return Array.from(
    rows.reduce((groups, row) => {
      const current = groups.get(row.celestial_body_type) ?? [];
      groups.set(row.celestial_body_type, [...current, row]);
      return groups;
    }, new Map<string, Body[]>())
  ).sort(([a], [b]) => a.localeCompare(b));
}

function statusTone(value: string) {
  if (value === "Ready" || value === "Complete" || value === "Prompt Ready") return "border-emerald-300/35 bg-emerald-300/10 text-emerald-100";
  if (value === "Needs Art" || value === "Needs Prompt") return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  if (value === "Blocked") return "border-red-300/35 bg-red-300/10 text-red-100";
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

function StatusPill({ value }: { value: string }) {
  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", statusTone(value))}>{value}</span>;
}

function childBodies(row: Body, byParent: Map<string, Body[]>) {
  return byParent.get(row.id) ?? [];
}

function validationItems(rows: Body[]) {
  const ids = new Set<string>();
  const duplicates = new Set<string>();
  for (const row of rows) {
    if (ids.has(row.id)) duplicates.add(row.id);
    ids.add(row.id);
  }

  const brokenParents = rows.filter((row) => row.parent_body_id && !ids.has(row.parent_body_id));
  const missingClass = rows.filter((row) => ["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type) && !row.planet_class);
  const gasGiantSurfaceErrors = rows.filter((row) => row.planet_class === "Gas Giant" && (row.landable || row.colonizable || !row.uses_orbital_gameplay));
  const missingPrompts = rows.filter((row) => ["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type) && !row.planet_subclass);

  return [
    { label: "Broken parent links", count: brokenParents.length, severity: brokenParents.length ? "Critical" : "Ready" },
    { label: "Duplicate body IDs", count: duplicates.size, severity: duplicates.size ? "Critical" : "Ready" },
    { label: "Missing planet class", count: missingClass.length, severity: missingClass.length ? "High" : "Ready" },
    { label: "Gas giant rule errors", count: gasGiantSurfaceErrors.length, severity: gasGiantSurfaceErrors.length ? "High" : "Ready" },
    { label: "Missing prompt subclass", count: missingPrompts.length, severity: missingPrompts.length ? "Medium" : "Ready" }
  ];
}

function BodyCard({ row, children }: { row: Body; children: Body[] }) {
  const Icon = bodyIcons[row.celestial_body_type as keyof typeof bodyIcons] ?? CircleDot;
  const artworkStatus = ["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type) ? "Needs Art" : "Not Required";
  const promptStatus = row.planet_class && row.planet_subclass ? "Prompt Ready" : ["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type) ? "Needs Prompt" : "Not Required";

  return (
    <article className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
            <Icon className="h-5 w-5 text-cyan-100" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-300">{row.celestial_body_type}</p>
            <h3 className="mt-1 truncate text-xl font-bold text-white">{row.name}</h3>
            <p className="mt-1 truncate font-mono text-xs text-slate-500">{row.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {row.is_fixed ? <StatusPill value="Sol Fixed" /> : null}
          {row.uses_orbital_gameplay ? <StatusPill value="Orbital World" /> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded border border-cyan-400/10 bg-slate-950/45 p-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Class</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{row.planet_class ?? "System Feature"}</p>
        </div>
        <div className="rounded border border-cyan-400/10 bg-slate-950/45 p-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Subclass</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{row.planet_subclass ?? "None"}</p>
        </div>
        <div className="rounded border border-cyan-400/10 bg-slate-950/45 p-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Artwork</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{artworkStatus}</p>
        </div>
        <div className="rounded border border-cyan-400/10 bg-slate-950/45 p-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Prompt</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{promptStatus}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill value={row.colonizable_status} />
        <StatusPill value={row.landable ? "Landable" : "Not Landable"} />
        <StatusPill value={row.colonizable ? "Colonizable" : "Not Colonizable"} />
      </div>

      {children.length ? (
        <div className="mt-4 rounded-md border border-cyan-400/10 bg-slate-950/45 p-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-300">Nested Bodies</p>
          <div className="mt-3 grid gap-2">
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between gap-3 rounded border border-slate-700/60 bg-slate-950/60 px-3 py-2">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-100">{child.name}</span>
                <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-slate-500">{child.celestial_body_type}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function CelestialBodyDesigner({ rows }: { rows: Body[] }) {
  const groups = bodyTypeGroups(rows);
  const byParent = rows.reduce((map, row) => {
    if (!row.parent_body_id) return map;
    map.set(row.parent_body_id, [...(map.get(row.parent_body_id) ?? []), row]);
    return map;
  }, new Map<string, Body[]>());
  const rootBodies = rows.filter((row) => !row.parent_body_id);
  const fixedBodies = rows.filter((row) => row.is_fixed).length;
  const orbitalWorlds = rows.filter((row) => row.uses_orbital_gameplay).length;
  const moonCount = rows.filter((row) => row.celestial_body_type === "Moon").length;
  const validation = validationItems(rows);
  const blockers = validation.filter((item) => item.count > 0).length;
  const metrics = [
    { label: "Bodies", value: rows.length, icon: CircleDot },
    { label: "Fixed Sol Bodies", value: fixedBodies, icon: Star },
    { label: "Moons Nested", value: moonCount, icon: Moon },
    { label: "Orbital Worlds", value: orbitalWorlds, icon: Orbit },
    { label: "Export Blockers", value: blockers, icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Universe Workflow</p>
          <h1 className="mt-3 text-5xl font-bold text-white">Celestial Body Designer</h1>
          <p className="mt-3 max-w-4xl text-lg leading-8 text-slate-300">
            Design stars, planets, moons, dwarf planets, orbital worlds, belts, and fixed Sol bodies as a nested system hierarchy.
          </p>
        </div>
        <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Validation Engine</p>
          <div className="mt-4 space-y-2">
            {validation.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded border border-cyan-400/10 bg-slate-950/45 px-3 py-2">
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  {item.count ? <AlertTriangle className="h-4 w-4 text-amber-200" /> : <CheckCircle2 className="h-4 w-4 text-emerald-200" />}
                  {item.label}
                </span>
                <span className="font-mono text-sm text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
            <Icon className="h-5 w-5 text-cyan-200" />
            <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Body Type Cards</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {groups.map(([type, items]) => {
            const Icon = bodyIcons[type as keyof typeof bodyIcons] ?? CircleDot;
            return (
              <div key={type} className="rounded-md border border-cyan-400/10 bg-slate-950/45 p-4">
                <Icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-lg font-bold text-white">{type}</p>
                <p className="mt-1 text-sm text-slate-400">{items.length} records</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {rootBodies.map((row) => (
          <BodyCard key={row.id} row={row} children={childBodies(row, byParent)} />
        ))}
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, CircleDot, Clipboard, Database, GitBranch, Moon, Orbit, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildCanonicalSolLandscapePrompt, buildCanonicalSolPrompt, CANONICAL_SOL_PROMPTS, REQUIRED_CANONICAL_SOL_BODY_NAMES } from "@/data/canonical-sol-prompts";
import { buildPlanetPrompt, PLANET_PROMPT_LIBRARY, planetTypeFeaturePrompt } from "@/data/planet-generation-prompts";
import { buildPlanetLandscapePromptForTemplate } from "@/lib/planets/artwork-prompts";
import { cn } from "@/lib/utils";
import type { CelestialBodyRecord } from "@/types/schema";

type Body = CelestialBodyRecord;
type PromptKind = "orbit" | "landscape";

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

function normalized(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function canonicalSolPromptMatch(row: Body) {
  return row.is_fixed ? CANONICAL_SOL_PROMPTS.find((prompt) => normalized(prompt.displayName) === normalized(row.name)) ?? null : null;
}

function planetTemplateMatch(row: Body) {
  const planetClass = normalized(row.planet_class);
  const subclass = normalized(row.planet_subclass);

  return (
    PLANET_PROMPT_LIBRARY.find((template) => normalized(template.planetClass) === planetClass && normalized(template.subclass) === subclass) ??
    PLANET_PROMPT_LIBRARY.find((template) => normalized(template.planetClass) === planetClass) ??
    null
  );
}

function supportsPromptActions(row: Body) {
  return ["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type) || Boolean(row.planet_class);
}

function supportsLandscapePrompt(row: Body) {
  return supportsPromptActions(row) && row.landable && row.planet_class !== "Gas Giant" && !row.uses_orbital_gameplay;
}

function bodyFeatureDescription(row: Body) {
  const template = planetTemplateMatch(row);
  if (template) return planetTypeFeaturePrompt(template);

  return [
    `${row.planet_subclass ?? row.biome ?? "Unique"} ${row.planet_class ?? row.celestial_body_type}.`,
    row.atmosphere ? `${row.atmosphere} atmosphere.` : "",
    row.gravity ? `${row.gravity} gravity.` : "",
    row.resources?.length ? `Known resources: ${row.resources.join(", ")}.` : "",
    row.notes ?? ""
  ]
    .filter(Boolean)
    .join(" ");
}

function buildBodyOrbitPrompt(row: Body) {
  if (row.orbit_view_prompt) return row.orbit_view_prompt;

  const canonical = canonicalSolPromptMatch(row);
  if (canonical) return buildCanonicalSolPrompt(canonical.planetDescription);

  return buildPlanetPrompt(bodyFeatureDescription(row));
}

function buildBodyLandscapePrompt(row: Body) {
  if (!supportsLandscapePrompt(row)) return "";
  if (row.surface_landscape_prompt) return row.surface_landscape_prompt;

  const canonical = canonicalSolPromptMatch(row);
  if (canonical) return buildCanonicalSolLandscapePrompt(canonical);

  const template = planetTemplateMatch(row);
  if (template) {
    return buildPlanetLandscapePromptForTemplate(template, {
      referenceImageUrl: row.orbit_view_image_url ?? "",
      useOrbitReference: Boolean(row.orbit_view_image_url)
    });
  }

  return buildPlanetPrompt(bodyFeatureDescription(row));
}

function validationItems(rows: Body[]) {
  const ids = new Set<string>();
  const duplicates = new Set<string>();
  const names = new Map<string, number>();
  for (const row of rows) {
    if (ids.has(row.id)) duplicates.add(row.id);
    ids.add(row.id);
    if (row.is_fixed) {
      const key = normalized(row.name);
      names.set(key, (names.get(key) ?? 0) + 1);
    }
  }

  const canonicalNames = new Set(REQUIRED_CANONICAL_SOL_BODY_NAMES.map((name) => normalized(name)));
  const missingCanonicalBodies = REQUIRED_CANONICAL_SOL_BODY_NAMES.filter((name) => !names.has(normalized(name)));
  const duplicateCanonicalBodies = Array.from(names.entries()).filter(([name, count]) => canonicalNames.has(name) && count > 1);
  const brokenParents = rows.filter((row) => row.parent_body_id && !ids.has(row.parent_body_id));
  const moonParentErrors = rows.filter((row) => row.celestial_body_type === "Moon" && !row.parent_body_id);
  const missingClass = rows.filter((row) => ["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type) && !row.planet_class);
  const gasGiantSurfaceErrors = rows.filter((row) => row.planet_class === "Gas Giant" && row.surface_landscape_prompt);
  const landableGasGiantErrors = rows.filter((row) => row.planet_class === "Gas Giant" && (row.landable || row.colonizable || !row.uses_orbital_gameplay));
  const missingPrompts = rows.filter((row) => ["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type) && !row.planet_subclass);
  const misclassifiedCanonicalBodies = rows.filter((row) => {
    const canonical = canonicalSolPromptMatch(row);
    if (!canonical) return false;

    return (
      row.celestial_body_type !== canonical.celestialBodyType ||
      (canonical.planetClass !== null && row.planet_class !== canonical.planetClass) ||
      (canonical.planetSubclass !== null && row.planet_subclass !== canonical.planetSubclass)
    );
  });
  const proceduralFixedNames = rows.filter((row) => row.is_fixed && !canonicalNames.has(normalized(row.name)) && /(?:prime|reach|veil|fall|thia|ara|ion|mere|os|dor)-\d/i.test(row.name));

  return [
    { label: "Missing canonical Sol bodies", count: missingCanonicalBodies.length, severity: missingCanonicalBodies.length ? "Critical" : "Ready" },
    { label: "Misclassified Sol bodies", count: misclassifiedCanonicalBodies.length, severity: misclassifiedCanonicalBodies.length ? "High" : "Ready" },
    { label: "Broken parent links", count: brokenParents.length, severity: brokenParents.length ? "Critical" : "Ready" },
    { label: "Missing moon parents", count: moonParentErrors.length, severity: moonParentErrors.length ? "Critical" : "Ready" },
    { label: "Duplicate body IDs", count: duplicates.size, severity: duplicates.size ? "Critical" : "Ready" },
    { label: "Duplicate canonical bodies", count: duplicateCanonicalBodies.length, severity: duplicateCanonicalBodies.length ? "Critical" : "Ready" },
    { label: "Missing planet class", count: missingClass.length, severity: missingClass.length ? "High" : "Ready" },
    { label: "Gas giant landscape prompts", count: gasGiantSurfaceErrors.length, severity: gasGiantSurfaceErrors.length ? "High" : "Ready" },
    { label: "Landable gas giants", count: landableGasGiantErrors.length, severity: landableGasGiantErrors.length ? "Critical" : "Ready" },
    { label: "Procedural fixed names", count: proceduralFixedNames.length, severity: proceduralFixedNames.length ? "Medium" : "Ready" },
    { label: "Missing prompt subclass", count: missingPrompts.length, severity: missingPrompts.length ? "Medium" : "Ready" }
  ];
}

function artworkStatusFor(row: Body) {
  if (!["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type)) return "Not Required";
  if (row.orbit_view_image_url || row.surface_landscape_image_url) return "Rendered";
  if (row.is_fixed) return "Placeholder";
  return "Missing";
}

function fixedBodyRelation(row: Body) {
  if (!row.is_fixed) return "";
  if (row.orbit_parent) return `${row.celestial_body_type} of ${row.orbit_parent}`;
  return row.celestial_body_type;
}

function BodyCard({
  row,
  children,
  copied,
  onCopy
}: {
  row: Body;
  children: Body[];
  copied: { id: string; kind: PromptKind } | null;
  onCopy: (row: Body, kind: PromptKind) => void;
}) {
  const Icon = bodyIcons[row.celestial_body_type as keyof typeof bodyIcons] ?? CircleDot;
  const artworkStatus = artworkStatusFor(row);
  const promptStatus = row.planet_class && row.planet_subclass ? "Prompt Ready" : ["Planet", "Dwarf Planet", "Moon"].includes(row.celestial_body_type) ? "Needs Prompt" : "Not Required";
  const canCopyPrompts = supportsPromptActions(row);
  const canCopyLandscape = supportsLandscapePrompt(row);

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
            {row.is_fixed ? <p className="mt-1 text-xs font-semibold text-amber-100">{fixedBodyRelation(row)}</p> : null}
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

      {canCopyPrompts ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="h-9 border-cyan-400/25 bg-cyan-300/10 px-3 text-cyan-100 hover:bg-cyan-300/20"
            title="Copy full orbit-view planet prompt"
            onClick={() => onCopy(row, "orbit")}
          >
            {copied?.id === row.id && copied.kind === "orbit" ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            Full Planet Prompt
          </Button>
          {canCopyLandscape ? (
            <Button
              type="button"
              className="h-9 border-blue-400/25 bg-blue-300/10 px-3 text-blue-100 hover:bg-blue-300/20"
              title="Copy surface landscape prompt"
              onClick={() => onCopy(row, "landscape")}
            >
              {copied?.id === row.id && copied.kind === "landscape" ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              Landscape Prompt
            </Button>
          ) : null}
        </div>
      ) : null}

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
  const [copied, setCopied] = useState<{ id: string; kind: PromptKind } | null>(null);
  const groups = bodyTypeGroups(rows);
  const byParent = rows.reduce((map, row) => {
    if (!row.parent_body_id) return map;
    map.set(row.parent_body_id, [...(map.get(row.parent_body_id) ?? []), row]);
    return map;
  }, new Map<string, Body[]>());
  const displayBodies = [...rows].sort((left, right) => {
    if (left.system_id !== right.system_id) return left.system_id.localeCompare(right.system_id);
    if (left.parent_body_id && !right.parent_body_id) return 1;
    if (!left.parent_body_id && right.parent_body_id) return -1;
    return (left.orbit_position ?? 999) - (right.orbit_position ?? 999) || left.name.localeCompare(right.name);
  });
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

  async function copyPrompt(row: Body, kind: PromptKind) {
    const prompt = kind === "landscape" ? buildBodyLandscapePrompt(row) : buildBodyOrbitPrompt(row);
    if (!prompt) return;

    await navigator.clipboard.writeText(prompt);
    setCopied({ id: row.id, kind });
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Universe Workflow</p>
          <h1 className="mt-3 text-5xl font-bold text-white">Celestial Bodies</h1>
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
        {displayBodies.map((row) => (
          <BodyCard key={row.id} row={row} children={childBodies(row, byParent)} copied={copied} onCopy={copyPrompt} />
        ))}
      </section>
    </div>
  );
}

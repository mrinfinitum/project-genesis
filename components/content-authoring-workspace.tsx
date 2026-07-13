"use client";

import { useMemo, useState } from "react";
import { Boxes, CheckCircle2, Copy, FilePlus2, GitBranch, Layers3, ListChecks, WandSparkles } from "lucide-react";
import {
  WorkspaceBadge,
  WorkspaceHeader,
  WorkspaceMiniStat,
  WorkspacePanel,
  WorkspaceProgressBar,
  WorkspaceSearchBar,
  WorkspaceStatTile,
  WorkspaceTabs
} from "@/components/ui/workspace";
import type { ContentAuthoringState, EraScaffold, TemplateKind } from "@/lib/content-authoring/templates";
import { canonicalEraOptions, productionTasksForScaffold } from "@/lib/content-authoring/templates";
import { cn } from "@/lib/utils";

type Tab = "templates" | "wizards" | "scaffolds" | "validation";

const tabs: Tab[] = ["templates", "wizards", "scaffolds", "validation"];
const tabLabels: Record<Tab, string> = {
  templates: "Templates",
  wizards: "Wizards",
  scaffolds: "Era Starter Kits",
  validation: "Validation"
};

const templateOrder: TemplateKind[] = ["Era", "Resource", "Building", "Research", "Production Chain", "Upgrade Chain", "Mission", "Event", "Collectible"];

function itemTypeLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TemplateCard({ template }: { template: ContentAuthoringState["templates"][number] }) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <WorkspaceBadge value={template.kind} />
          <h3 className="mt-3 text-xl font-black text-white">{template.title}</h3>
        </div>
        <WorkspaceBadge value={template.status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{template.description}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="Profiles" value={template.requirementProfiles.length} />
        <WorkspaceMiniStat label="Assets" value={template.assetRequirements.length} />
        <WorkspaceMiniStat label="Checks" value={template.validationDefaults.length} />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {template.relationships.map((relationship) => (
          <span key={relationship} className="rounded border border-cyan-300/10 bg-cyan-300/5 px-2 py-1 text-xs font-bold text-cyan-100">{relationship}</span>
        ))}
      </div>
    </div>
  );
}

function WizardCard({ wizard }: { wizard: ContentAuthoringState["wizards"][number] }) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <WorkspaceBadge value={wizard.kind} />
          <h3 className="mt-3 text-xl font-black text-white">{wizard.title}</h3>
        </div>
        <WorkspaceBadge value={`${wizard.steps.length} steps`} />
      </div>
      <div className="mt-4 grid gap-3">
        {wizard.steps.map((step, index) => (
          <div key={step.id} className="grid gap-3 rounded-md border border-cyan-300/10 bg-[#07101e]/80 p-3 md:grid-cols-[2rem_10rem_1fr] md:items-start">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-100">{index + 1}</span>
            <div>
              <p className="font-black text-white">{step.title}</p>
              <p className="mt-1 text-xs text-slate-500">{step.output}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {step.choices.map((choice) => (
                <span key={choice} className="rounded border border-cyan-300/10 bg-slate-950/50 px-2 py-1 text-xs font-semibold text-slate-300">{choice}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScaffoldCard({ scaffold, selected, onSelect }: { scaffold: EraScaffold; selected: boolean; onSelect: () => void }) {
  const counts = scaffold.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <button type="button" onClick={onSelect} className={cn("rounded-md border bg-[#07101e]/85 p-4 text-left shadow-glow transition hover:border-cyan-300/55", selected ? "border-cyan-300/65" : "border-cyan-300/15")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge value={scaffold.status} />
            <WorkspaceBadge value={scaffold.mode} />
          </div>
          <h3 className="mt-3 text-2xl font-black text-white">{scaffold.eraName} Draft</h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{scaffold.id}</p>
        </div>
        <Layers3 className="h-6 w-6 text-cyan-200" />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{scaffold.notes}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <WorkspaceMiniStat label="Items" value={scaffold.items.length} />
        <WorkspaceMiniStat label="Hours" value={scaffold.estimates.hours} />
        <WorkspaceMiniStat label="Assets" value={scaffold.estimates.assets} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.entries(counts).slice(0, 6).map(([type, count]) => (
          <span key={type} className="rounded border border-cyan-300/10 bg-cyan-300/5 px-2 py-1 text-xs font-bold text-cyan-100">{itemTypeLabel(type)} {count}</span>
        ))}
      </div>
    </button>
  );
}

function ScaffoldDetail({ scaffold }: { scaffold: EraScaffold }) {
  const tasks = productionTasksForScaffold(scaffold);
  const grouped = scaffold.items.reduce<Record<string, typeof scaffold.items>>((acc, item) => {
    acc[item.type] = [...(acc[item.type] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <WorkspacePanel title={`${scaffold.eraName} Starter Kit`} icon={Boxes}>
        <div className="flex flex-wrap gap-2">
          <WorkspaceBadge value={scaffold.status} />
          <WorkspaceBadge value={scaffold.validation.status} />
          {scaffold.sourceEraName ? <WorkspaceBadge value={`from ${scaffold.sourceEraName}`} /> : null}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">{scaffold.notes}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <WorkspaceStatTile label="Estimated Hours" value={scaffold.estimates.hours} />
          <WorkspaceStatTile label="Draft Items" value={scaffold.items.length} />
          <WorkspaceStatTile label="Asset Requirements" value={scaffold.estimates.assets} />
          <WorkspaceStatTile label="Completion" value={`${scaffold.estimates.overallCompletion}%`} />
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Generated Content" icon={FilePlus2}>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(grouped).map(([type, rows]) => (
            <div key={type} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black text-white">{itemTypeLabel(type)}</h3>
                <WorkspaceBadge value={`${rows.length} draft`} />
              </div>
              <div className="mt-3 grid gap-2">
                {rows.slice(0, 6).map((row) => (
                  <div key={row.id} className="rounded border border-cyan-300/10 bg-[#07101e]/80 p-2">
                    <p className="font-bold text-slate-100">{row.name}</p>
                    <p className="mt-1 truncate font-mono text-[0.65rem] text-slate-500">{row.id}</p>
                  </div>
                ))}
                {rows.length > 6 ? <p className="text-xs font-semibold text-slate-500">+{rows.length - 6} more draft records</p> : null}
              </div>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <section className="grid gap-4 xl:grid-cols-2">
        <WorkspacePanel title="Validation Defaults" icon={CheckCircle2}>
          <div className="grid gap-2">
            {scaffold.validation.checks.map((check) => (
              <div key={check.label} className="flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <span className={cn("grid h-5 w-5 place-items-center rounded border text-xs", check.passed ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100" : "border-amber-300/35 bg-amber-300/10 text-amber-100")}>{check.passed ? "✓" : "!"}</span>
                <span className="font-semibold text-slate-200">{check.label}</span>
              </div>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Production Tasks" icon={ListChecks}>
          <div className="grid gap-2">
            {tasks.slice(0, 8).map((task) => (
              <div key={task.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">{task.title}</p>
                  <WorkspaceBadge value={task.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{itemTypeLabel(task.type)} / {task.assetRequirementIds.length} asset requirements</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </section>
    </div>
  );
}

export function ContentAuthoringWorkspace({ initialState }: { initialState: ContentAuthoringState }) {
  const [state, setState] = useState(initialState);
  const [tab, setTab] = useState<Tab>("scaffolds");
  const [query, setQuery] = useState("");
  const [selectedEraId, setSelectedEraId] = useState(initialState.nextSuggestedEra.id);
  const [selectedScaffoldId, setSelectedScaffoldId] = useState<string | null>(initialState.scaffolds[0]?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const eraOptions = canonicalEraOptions().filter((era) => era.id !== "survival");

  const filteredTemplates = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...state.templates]
      .sort((left, right) => templateOrder.indexOf(left.kind) - templateOrder.indexOf(right.kind))
      .filter((template) => !needle || [template.title, template.kind, template.description, template.relationships.join(" ")].join(" ").toLowerCase().includes(needle));
  }, [query, state.templates]);

  const selectedScaffold = state.scaffolds.find((scaffold) => scaffold.id === selectedScaffoldId) ?? state.scaffolds[0] ?? null;

  async function createScaffold(mode: "starter_kit" | "duplicate_survival") {
    setBusy(mode);
    setError("");
    try {
      const response = await fetch("/api/content-authoring/scaffold", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eraId: selectedEraId, mode })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Scaffold generation failed.");
      setState(payload.state);
      setSelectedScaffoldId(payload.state.scaffolds[0]?.id ?? null);
      setTab("scaffolds");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scaffold generation failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Authoring IDE"
        title="Content Templates"
        description="Reusable templates, guided wizards, era cloning, procedural starter kits, validation defaults, and production estimates for generating future eras without touching runtime exports."
        stats={[
          { label: "Templates", value: state.stats.templateCount },
          { label: "Wizards", value: state.stats.wizardCount },
          { label: "Draft Scaffolds", value: state.stats.scaffoldCount },
          { label: "Draft Items", value: state.stats.draftItemCount }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_30rem]">
        <WorkspacePanel title="Era Starter Kit" icon={WandSparkles}>
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Target Era</span>
              <select value={selectedEraId} onChange={(event) => setSelectedEraId(event.target.value)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {eraOptions.map((era) => (
                  <option key={era.id} value={era.id}>{era.name}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => createScaffold("starter_kit")} disabled={Boolean(busy)} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-emerald-300/35 bg-emerald-400/10 px-4 text-sm font-bold text-emerald-100 disabled:opacity-50">
              <FilePlus2 className="h-4 w-4" />
              Create New Era
            </button>
            <button type="button" onClick={() => createScaffold("duplicate_survival")} disabled={Boolean(busy)} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-400/10 px-4 text-sm font-bold text-cyan-100 disabled:opacity-50">
              <Copy className="h-4 w-4" />
              Duplicate Survival
            </button>
          </div>
          {error ? <div className="mt-4 rounded-md border border-rose-300/30 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">{error}</div> : null}
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Generated records remain Draft and Studio-only. They create requirement profiles, asset requirements, production tasks, validation checks, and relationship suggestions, but they are not published or exported.
          </p>
        </WorkspacePanel>

        <WorkspacePanel title="Production Estimate" icon={GitBranch}>
          <div className="grid gap-3 sm:grid-cols-2">
            <WorkspaceMiniStat label="Estimated Hours" value={state.stats.estimatedHours} />
            <WorkspaceMiniStat label="Generated Drafts" value={state.stats.draftItemCount} />
            <WorkspaceMiniStat label="Next Suggested" value={state.nextSuggestedEra.name} />
            <WorkspaceMiniStat label="Dashboard Impact" value="Draft work queue" />
          </div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>Authoring Throughput</span>
              <span>{Math.min(100, state.stats.scaffoldCount * 20)}%</span>
            </div>
            <WorkspaceProgressBar value={Math.min(100, state.stats.scaffoldCount * 20)} />
          </div>
        </WorkspacePanel>
      </section>

      <WorkspaceTabs tabs={tabs} active={tab} onChange={setTab} labels={tabLabels} />

      {tab === "templates" ? (
        <section className="space-y-4">
          <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search templates, requirements, relationships" />
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredTemplates.map((template) => <TemplateCard key={template.id} template={template} />)}
          </div>
        </section>
      ) : null}

      {tab === "wizards" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.wizards.map((wizard) => <WizardCard key={wizard.id} wizard={wizard} />)}
        </div>
      ) : null}

      {tab === "scaffolds" ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(20rem,0.7fr)_minmax(0,1.3fr)]">
          <div className="grid content-start gap-4">
            {state.scaffolds.map((scaffold) => (
              <ScaffoldCard key={scaffold.id} scaffold={scaffold} selected={selectedScaffold?.id === scaffold.id} onSelect={() => setSelectedScaffoldId(scaffold.id)} />
            ))}
            {!state.scaffolds.length ? (
              <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-semibold text-amber-100">
                No era scaffolds yet. Use Create New Era or Duplicate Survival to generate a draft starter kit.
              </div>
            ) : null}
          </div>
          {selectedScaffold ? <ScaffoldDetail scaffold={selectedScaffold} /> : null}
        </section>
      ) : null}

      {tab === "validation" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.scaffolds.map((scaffold) => (
            <WorkspacePanel key={scaffold.id} title={`${scaffold.eraName} Validation`} icon={CheckCircle2}>
              <div className="flex flex-wrap gap-2">
                <WorkspaceBadge value={scaffold.validation.status} />
                <WorkspaceBadge value={`${scaffold.validation.duplicateIds.length} duplicates`} />
                <WorkspaceBadge value={`${scaffold.validation.missingLinks.length} missing links`} />
              </div>
              <div className="mt-4 grid gap-2">
                {scaffold.validation.checks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <span className={cn("grid h-5 w-5 place-items-center rounded border text-xs", check.passed ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100" : "border-amber-300/35 bg-amber-300/10 text-amber-100")}>{check.passed ? "✓" : "!"}</span>
                    <span className="font-semibold text-slate-200">{check.label}</span>
                  </div>
                ))}
              </div>
            </WorkspacePanel>
          ))}
        </div>
      ) : null}
    </main>
  );
}

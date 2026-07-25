"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Database, GitCompareArrows, Lock, RefreshCw, Search, Sparkles, Unlock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  canonicalAtmosphereProfiles,
  canonicalBiomeProfiles,
  canonicalClimateProfiles,
  canonicalGeologyProfiles,
  canonicalHazardProfiles,
  canonicalHydrosphereProfiles,
  canonicalPlanetTypeProfiles,
  canonicalSeasonProfiles,
  canonicalWeatherProfiles,
  createPlanetResourceOccurrence,
  ensurePlanetDeepData,
  generatePlanetDeepData,
  validatePlanetDeepData
} from "@/lib/planets/deep-data";
import { ResourceService } from "@/lib/resources/service";
import type { PlanetDeepData, PlanetResourceOccurrence, PlanetValidationIssue } from "@/types/planet-deep-data";
import type { GeneratedPlanet } from "@/types/schema";

export const planetDetailTabs = [
  ["overview", "Overview"],
  ["planet-type", "Planet Type"],
  ["orbit", "Orbit"],
  ["physical", "Physical"],
  ["atmosphere", "Atmosphere"],
  ["climate", "Climate"],
  ["weather", "Weather"],
  ["seasons", "Seasons"],
  ["hydrosphere", "Hydrosphere"],
  ["biomes", "Biomes"],
  ["resources", "Resources"],
  ["life", "Life"],
  ["geology", "Geology"],
  ["hazards", "Hazards"],
  ["habitability", "Habitability"],
  ["civilization", "Civilization"],
  ["exploration", "Exploration"],
  ["history", "History"],
  ["presentation", "Presentation"],
  ["validation", "Validation"],
  ["runtime", "Runtime Preview"]
] as const;

export type PlanetDetailTabId = (typeof planetDetailTabs)[number][0];

type Props = {
  planet: GeneratedPlanet;
  activeTab: PlanetDetailTabId;
  onTabChange: (tab: PlanetDetailTabId) => void;
  onSave: (deepData: PlanetDeepData) => Promise<void>;
};

function titleFromKey(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "object" && "displayValue" in value) return String((value as { displayValue: unknown }).displayValue);
  return String(value);
}

function MetricGrid({ values }: { values: Record<string, unknown> }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Object.entries(values).map(([key, value]) => (
        <div key={key} className="min-w-0 rounded border border-cyan-300/10 bg-slate-950/45 p-3">
          <dt className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500" title={titleFromKey(key)}>
            {titleFromKey(key)}
          </dt>
          <dd className="mt-1 break-words text-sm font-semibold text-slate-100" title={displayValue(value)}>
            {displayValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{title}</p>
      <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function ProfileList({ rows }: { rows: Array<{ id: string; displayName: string; detail?: string }> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <div key={row.id} className="rounded border border-cyan-300/10 bg-slate-950/45 p-3">
          <p className="font-semibold text-slate-100">{row.displayName}</p>
          <p className="mt-1 font-mono text-[0.65rem] text-cyan-200/70">{row.id}</p>
          {row.detail ? <p className="mt-2 text-xs leading-5 text-slate-400">{row.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

function issueTone(issue: PlanetValidationIssue) {
  if (issue.severity === "error") return "border-rose-400/30 bg-rose-400/10 text-rose-100";
  if (issue.severity === "warning" || issue.severity === "scientific_plausibility") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function ResourceOccurrenceEditor({
  occurrence,
  onChange,
  onRemove
}: {
  occurrence: PlanetResourceOccurrence;
  onChange: (next: PlanetResourceOccurrence) => void;
  onRemove: () => void;
}) {
  const resource = ResourceService.getById(occurrence.resourceId);
  const numericFields: Array<keyof Pick<PlanetResourceOccurrence, "abundance" | "richness" | "purity" | "estimatedReserves" | "minimumDepth" | "maximumDepth" | "accessibility" | "extractionDifficulty" | "environmentalRisk" | "hazardLevel">> = [
    "abundance",
    "richness",
    "purity",
    "estimatedReserves",
    "minimumDepth",
    "maximumDepth",
    "accessibility",
    "extractionDifficulty",
    "environmentalRisk",
    "hazardLevel"
  ];

  return (
    <article className="rounded border border-cyan-300/15 bg-slate-950/55 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{resource?.resource_name ?? occurrence.resourceId}</p>
          <p className="mt-1 truncate font-mono text-[0.65rem] text-cyan-200/70">{occurrence.resourceId}</p>
        </div>
        <Button className="h-8 w-8 shrink-0 px-0" type="button" onClick={onRemove} title="Remove occurrence">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Source
          <select
            className="mt-1 h-9 w-full rounded border border-cyan-300/15 bg-[#07101e] px-2 text-xs normal-case tracking-normal text-slate-100"
            value={occurrence.sourceCategory}
            onChange={(event) => onChange({ ...occurrence, sourceCategory: event.target.value as PlanetResourceOccurrence["sourceCategory"] })}
          >
            {["surface", "subsurface", "atmospheric", "oceanic", "biological", "geothermal", "crystalline", "radioactive", "exotic", "artificial", "salvage", "renewable"].map((source) => (
              <option key={source} value={source}>{titleFromKey(source)}</option>
            ))}
          </select>
        </label>
        <label className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Pattern
          <input
            className="mt-1 h-9 w-full rounded border border-cyan-300/15 bg-[#07101e] px-2 text-xs normal-case tracking-normal text-slate-100"
            value={occurrence.distributionPattern}
            onChange={(event) => onChange({ ...occurrence, distributionPattern: event.target.value })}
          />
        </label>
        <label className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Discovery
          <select
            className="mt-1 h-9 w-full rounded border border-cyan-300/15 bg-[#07101e] px-2 text-xs normal-case tracking-normal text-slate-100"
            value={occurrence.discoveryState}
            onChange={(event) => onChange({ ...occurrence, discoveryState: event.target.value as PlanetResourceOccurrence["discoveryState"] })}
          >
            {["unknown", "detected", "probed", "scanned", "surveyed", "explored", "catalogued", "colonized"].map((state) => (
              <option key={state} value={state}>{titleFromKey(state)}</option>
            ))}
          </select>
        </label>
        {numericFields.map((field) => (
          <label key={field} className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {titleFromKey(field)}
            <input
              type="number"
              step={field === "purity" ? "0.01" : "1"}
              className="mt-1 h-9 w-full rounded border border-cyan-300/15 bg-[#07101e] px-2 text-xs normal-case tracking-normal text-slate-100"
              value={occurrence[field]}
              onChange={(event) => onChange({ ...occurrence, [field]: Number(event.target.value) })}
            />
          </label>
        ))}
      </div>
    </article>
  );
}

export function PlanetDeepDataEditor({ planet, activeTab, onTabChange, onSave }: Props) {
  const resolved = useMemo(() => ensurePlanetDeepData(planet), [planet]);
  const [draft, setDraft] = useState<PlanetDeepData>(resolved);
  const [generatedPreview, setGeneratedPreview] = useState<PlanetDeepData | null>(null);
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourceCategory, setResourceCategory] = useState("");
  const [fieldLockPath, setFieldLockPath] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setDraft(resolved);
    setGeneratedPreview(null);
    setShowComparison(false);
    setFeedback("");
  }, [resolved]);

  const validationIssues = useMemo(() => validatePlanetDeepData(draft), [draft]);
  const selectedType = canonicalPlanetTypeProfiles.find((profile) => profile.canonicalId === draft.planetTypeId);
  const resourceCategories = useMemo(() => [...new Set(ResourceService.catalog.map((resource) => resource.category).filter(Boolean))].sort(), []);
  const resourceResults = useMemo(() => {
    const query = resourceQuery.trim().toLowerCase();
    const existing = new Set(draft.resourceOccurrences.map((occurrence) => occurrence.resourceId));
    return ResourceService.catalog
      .filter((resource) => !existing.has(resource.id))
      .filter((resource) => !resourceCategory || resource.category === resourceCategory)
      .filter((resource) => !query || `${resource.resource_name} ${resource.id} ${resource.category} ${resource.rarity}`.toLowerCase().includes(query))
      .slice(0, 24);
  }, [draft.resourceOccurrences, resourceCategory, resourceQuery]);

  async function save(next: PlanetDeepData, message: string) {
    setSaving(true);
    setFeedback("");
    try {
      await onSave(next);
      setDraft(next);
      setGeneratedPreview(null);
      setFeedback(message);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not save planet data.");
    } finally {
      setSaving(false);
    }
  }

  function updateOccurrence(nextOccurrence: PlanetResourceOccurrence) {
    setDraft((current) => ({
      ...current,
      resourceOccurrences: current.resourceOccurrences.map((occurrence) => occurrence.occurrenceId === nextOccurrence.occurrenceId ? nextOccurrence : occurrence)
    }));
  }

  function addResource(resourceId: string) {
    const occurrence = createPlanetResourceOccurrence(
      planet.id,
      planet.planet_class,
      resourceId,
      planet.seed,
      draft.resourceOccurrences.length,
      draft.biomes.map((biome) => biome.occurrenceId)
    );
    setDraft((current) => ({ ...current, resourceOccurrences: [...current.resourceOccurrences, occurrence] }));
  }

  const sectionLocked = draft.overrides.lockedSections.includes(activeTab);
  const changedSections = useMemo(() => {
    if (!generatedPreview) return [];
    return Object.keys(draft)
      .filter((key) => key !== "overrides")
      .filter((key) => JSON.stringify((draft as unknown as Record<string, unknown>)[key]) !== JSON.stringify((generatedPreview as unknown as Record<string, unknown>)[key]));
  }, [draft, generatedPreview]);

  function toggleFieldLock() {
    const path = fieldLockPath.trim();
    if (!path) return;
    setDraft((current) => {
      const locked = current.overrides.lockedFields.includes(path);
      return {
        ...current,
        overrides: {
          ...current.overrides,
          lockedFields: locked
            ? current.overrides.lockedFields.filter((candidate) => candidate !== path)
            : [...current.overrides.lockedFields, path]
        }
      };
    });
  }

  return (
    <>
      <div className="border-b border-cyan-300/15 bg-[#081525] px-5 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {planetDetailTabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={[
                "shrink-0 rounded border px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] transition",
                activeTab === id
                  ? "border-cyan-200/50 bg-cyan-300/15 text-cyan-100"
                  : "border-cyan-300/10 bg-slate-950/30 text-slate-400 hover:border-cyan-300/30 hover:text-slate-100"
              ].join(" ")}
              onClick={() => onTabChange(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? null : (
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-cyan-300/10 bg-slate-950/45 p-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  setGeneratedPreview(generatePlanetDeepData(planet, undefined, draft));
                  setShowComparison(false);
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Preview Generation
              </Button>
              <Button type="button" disabled={saving} onClick={() => save(generatePlanetDeepData(planet, undefined, draft), "Regenerated unlocked fields.")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Unlocked
              </Button>
              {generatedPreview ? (
                <>
                  <Button type="button" onClick={() => setShowComparison((visible) => !visible)}>
                    <GitCompareArrows className="mr-2 h-4 w-4" />
                    Compare Current
                  </Button>
                  <Button type="button" disabled={saving} onClick={() => save(generatedPreview, "Applied generated data.")}>
                    <Check className="mr-2 h-4 w-4" />
                    Apply Generated Data
                  </Button>
                </>
              ) : null}
              <Button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    overrides: {
                      ...current.overrides,
                      lockedSections: sectionLocked
                        ? current.overrides.lockedSections.filter((section) => section !== activeTab)
                        : [...current.overrides.lockedSections, activeTab]
                    }
                  }))
                }
              >
                {sectionLocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                {sectionLocked ? "Unlock Section" : "Lock Section"}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Database className="h-4 w-4 text-cyan-300" />
              {draft.schemaVersion} / generation {draft.generationVersion}
            </div>
          </div>

          {feedback ? <p className="rounded border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">{feedback}</p> : null}
          {generatedPreview ? (
            <p className="rounded border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
              Generated preview is staged. Existing locked sections and fields were preserved; use Apply Generated Data to save it.
            </p>
          ) : null}
          <div className="grid gap-2 rounded border border-cyan-300/10 bg-slate-950/40 p-3 lg:grid-cols-[1fr_auto]">
            <label className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Field Lock Path
              <input
                className="mt-1 h-9 w-full rounded border border-cyan-300/15 bg-[#07101e] px-3 font-mono text-xs normal-case tracking-normal text-slate-100"
                placeholder="climate.averageGlobalTemperature"
                value={fieldLockPath}
                onChange={(event) => setFieldLockPath(event.target.value)}
              />
            </label>
            <Button className="self-end" type="button" disabled={!fieldLockPath.trim()} onClick={toggleFieldLock}>
              <Lock className="mr-2 h-4 w-4" />
              {draft.overrides.lockedFields.includes(fieldLockPath.trim()) ? "Unlock Field" : "Lock Field"}
            </Button>
          </div>
          {showComparison && generatedPreview ? (
            <div className="rounded border border-cyan-300/15 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Generated vs Current</p>
                <p className="text-xs text-slate-500">{changedSections.length} changed sections</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {changedSections.length ? changedSections.map((section) => (
                  <button
                    key={section}
                    type="button"
                    className="rounded border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-xs text-cyan-100"
                    onClick={() => {
                      const matchingTab = planetDetailTabs.find(([id]) => id === section);
                      if (matchingTab) onTabChange(matchingTab[0]);
                    }}
                  >
                    {titleFromKey(section)}
                  </button>
                )) : <p className="text-sm text-slate-400">No unlocked values would change.</p>}
              </div>
            </div>
          ) : null}

          {activeTab === "planet-type" ? (
            <>
              <SectionHeader title="Existing Planet Type" description="This is a resolved extension of the existing canonical Planet Class Model, not a second Planet Type library." />
              {selectedType ? (
                <>
                  <MetricGrid values={{ canonicalId: selectedType.canonicalId, displayName: selectedType.displayName, family: selectedType.family, rarity: selectedType.rarity, defaultPresentationProfileId: selectedType.defaultPresentationProfileId, planetMaterialProfileId: selectedType.planetMaterialProfileId }} />
                  <MetricGrid values={{ gravityRange: selectedType.defaultGravityRange, temperatureRange: selectedType.defaultTemperatureRange, pressureRange: selectedType.defaultPressureRange, habitabilityRange: selectedType.defaultHabitabilityRange, lifeComplexityRange: selectedType.allowedLifeComplexityRange }} />
                </>
              ) : null}
            </>
          ) : null}

          {activeTab === "orbit" ? (
            <>
              <SectionHeader title="Orbital Science" description="Raw numeric values, canonical units, formatted display values, and survey confidence are published together." />
              <MetricGrid values={draft.orbital as unknown as Record<string, unknown>} />
            </>
          ) : null}

          {activeTab === "physical" ? (
            <>
              <SectionHeader title="Physical Science" description="Planet-specific physical facts reference the existing type material profile and canonical resources." />
              <MetricGrid values={draft.physical as unknown as Record<string, unknown>} />
            </>
          ) : null}

          {activeTab === "atmosphere" ? (
            <>
              <SectionHeader title="Resolved Atmosphere" description="Composition entries point to canonical Resource Catalog IDs. Active weather remains game-owned state." />
              <MetricGrid values={Object.fromEntries(Object.entries(draft.atmosphere).filter(([key]) => key !== "composition"))} />
              <ProfileList rows={draft.atmosphere.composition.map((entry) => ({ id: entry.resourceId, displayName: ResourceService.nameForId(entry.resourceId), detail: `${entry.percentage.toFixed(3)}% / ${Math.round(entry.confidence * 100)}% confidence` }))} />
              <p className="text-xs text-slate-500">{canonicalAtmosphereProfiles.length} reusable atmosphere profiles are available.</p>
            </>
          ) : null}

          {activeTab === "climate" ? (
            <>
              <SectionHeader title="Resolved Climate" description="Canonical temperatures are stored in Kelvin with client-ready formatted display values." />
              <MetricGrid values={draft.climate as unknown as Record<string, unknown>} />
              <p className="text-xs text-slate-500">{canonicalClimateProfiles.length} reusable climate profiles are available.</p>
            </>
          ) : null}

          {activeTab === "weather" ? (
            <>
              <SectionHeader title="Eligible Weather" description="These profiles define possible conditions. They do not store the planet's live current weather." />
              <ProfileList rows={draft.weatherProfileIds.map((id) => {
                const profile = canonicalWeatherProfiles.find((candidate) => candidate.id === id);
                return { id, displayName: profile?.displayName ?? id, detail: profile ? `${profile.family}; intensity ${profile.intensityRange.join("-")}` : "Missing profile" };
              })} />
            </>
          ) : null}

          {activeTab === "seasons" ? (
            <>
              <SectionHeader title="Season Cycle" description="Season definitions form one normalized canonical cycle and support non-Earth patterns." />
              <MetricGrid values={{ profileId: draft.seasonCycle.profileId, seasonCount: draft.seasonCycle.seasons.length, cycleTotal: draft.seasonCycle.seasons.reduce((sum, season) => sum + season.length, 0) }} />
              <ProfileList rows={draft.seasonCycle.seasons.map((season) => ({ id: season.seasonId, displayName: season.displayName, detail: `${Math.round(season.length * 100)}% of cycle; ${season.averageTemperature} K` }))} />
              <p className="text-xs text-slate-500">{canonicalSeasonProfiles.length} reusable cycle profiles are available.</p>
            </>
          ) : null}

          {activeTab === "hydrosphere" ? (
            <>
              <SectionHeader title="Hydrosphere" description="Liquids and dissolved materials resolve through canonical resource IDs." />
              <MetricGrid values={draft.hydrosphere as unknown as Record<string, unknown>} />
              <p className="text-xs text-slate-500">{canonicalHydrosphereProfiles.length} reusable hydrosphere profiles are available.</p>
            </>
          ) : null}

          {activeTab === "biomes" ? (
            <>
              <SectionHeader title="Biome Occurrences" description="Planet records store coverage and local modifiers while complete biome definitions remain reusable profiles." />
              {draft.biomes.map((biome) => (
                <div key={biome.occurrenceId} className="space-y-3 rounded border border-cyan-300/15 bg-slate-950/45 p-4">
                  <p className="font-semibold text-white">{canonicalBiomeProfiles.find((profile) => profile.id === biome.biomeProfileId)?.displayName ?? biome.biomeProfileId}</p>
                  <MetricGrid values={biome as unknown as Record<string, unknown>} />
                </div>
              ))}
            </>
          ) : null}

          {activeTab === "resources" ? (
            <>
              <SectionHeader title="Planet Resource Occurrences" description="Search the existing Resource Catalog and add only planet-specific abundance, reserves, distribution, depth, risk, and requirement data." />
              <div className="grid gap-3 rounded border border-cyan-300/10 bg-slate-950/40 p-3 lg:grid-cols-[1fr_18rem]">
                <label className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    className="h-10 w-full rounded border border-cyan-300/15 bg-[#07101e] pl-10 pr-3 text-sm text-slate-100"
                    placeholder="Search canonical resources by name, ID, category, or rarity"
                    value={resourceQuery}
                    onChange={(event) => setResourceQuery(event.target.value)}
                  />
                </label>
                <select className="h-10 rounded border border-cyan-300/15 bg-[#07101e] px-3 text-sm text-slate-100" value={resourceCategory} onChange={(event) => setResourceCategory(event.target.value)}>
                  <option value="">All resource categories</option>
                  {resourceCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              {resourceQuery || resourceCategory ? (
                <div className="grid max-h-72 gap-2 overflow-y-auto rounded border border-cyan-300/10 bg-slate-950/50 p-2 sm:grid-cols-2 xl:grid-cols-3">
                  {resourceResults.map((resource) => (
                    <button key={resource.id} type="button" className="rounded border border-cyan-300/10 p-3 text-left hover:border-cyan-300/40 hover:bg-cyan-300/5" onClick={() => addResource(resource.id)}>
                      <p className="truncate text-sm font-semibold text-white">{resource.resource_name}</p>
                      <p className="mt-1 truncate font-mono text-[0.62rem] text-cyan-200/70">{resource.id}</p>
                      <p className="mt-1 text-xs text-slate-500">{resource.category} / {resource.rarity}</p>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="grid gap-3 xl:grid-cols-2">
                {draft.resourceOccurrences.map((occurrence) => (
                  <ResourceOccurrenceEditor
                    key={occurrence.occurrenceId}
                    occurrence={occurrence}
                    onChange={updateOccurrence}
                    onRemove={() => setDraft((current) => ({ ...current, resourceOccurrences: current.resourceOccurrences.filter((candidate) => candidate.occurrenceId !== occurrence.occurrenceId) }))}
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="button" disabled={saving || validationIssues.some((issue) => issue.severity === "error")} onClick={() => save(draft, "Saved canonical resource occurrences.")}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Resources
                </Button>
              </div>
            </>
          ) : null}

          {activeTab === "life" ? (
            <>
              <SectionHeader title="Life Summary" description="Planet-specific occurrence links remain separate from canonical species definitions." />
              <MetricGrid values={draft.life as unknown as Record<string, unknown>} />
              <MetricGrid values={{ speciesOccurrences: draft.speciesOccurrences.length, linkedBiomeOccurrences: draft.biomes.length }} />
            </>
          ) : null}

          {activeTab === "geology" ? (
            <>
              <SectionHeader title="Resolved Geology" description="Geological facts reference reusable profiles and canonical composition resources." />
              <MetricGrid values={draft.geology as unknown as Record<string, unknown>} />
              <p className="text-xs text-slate-500">{canonicalGeologyProfiles.length} reusable geology profiles are available.</p>
            </>
          ) : null}

          {activeTab === "hazards" ? (
            <>
              <SectionHeader title="Hazard Occurrences" description="Reusable hazard definitions are resolved into planet-specific severity and distribution." />
              <ProfileList rows={draft.hazards.map((hazard) => {
                const profile = canonicalHazardProfiles.find((candidate) => candidate.id === hazard.hazardProfileId);
                return { id: hazard.hazardProfileId, displayName: profile?.displayName ?? hazard.hazardProfileId, detail: `${Math.round(hazard.severity)} severity; ${hazard.distribution}; ${Math.round(hazard.confidence * 100)}% confidence` };
              })} />
            </>
          ) : null}

          {activeTab === "habitability" ? (
            <>
              <SectionHeader title="Habitability Breakdown" description="The overall score is explained by its canonical inputs instead of stored as an opaque percentage." />
              <MetricGrid values={Object.fromEntries(Object.entries(draft.habitability).filter(([key]) => !["scoringInputs", "explanation"].includes(key)))} />
              <div className="rounded border border-cyan-300/10 bg-slate-950/45 p-4">
                {draft.habitability.explanation.map((line) => <p key={line} className="text-sm leading-6 text-slate-300">{line}</p>)}
              </div>
            </>
          ) : null}

          {activeTab === "civilization" ? (
            <>
              <SectionHeader title="Civilization Summary" description="These are relationship summaries only; colonies, factions, missions, events, and player state retain their existing owners." />
              <MetricGrid values={draft.civilizationSummary as unknown as Record<string, unknown>} />
            </>
          ) : null}

          {activeTab === "exploration" ? (
            <>
              <SectionHeader title="Exploration and Visibility" description="Deep facts unlock progressively through the existing discovery progression." />
              <MetricGrid values={{ ...draft.exploration, ...draft.discoveries }} />
              <ProfileList rows={draft.discoveryVisibility.map((rule) => ({ id: rule.sectionId, displayName: titleFromKey(rule.sectionId), detail: `Visible at ${titleFromKey(rule.requiredDiscoveryState)}; ${Math.round(rule.confidence * 100)}% confidence` }))} />
            </>
          ) : null}

          {activeTab === "history" ? (
            <>
              <SectionHeader title="History Links" description="Historical records remain owned by existing event, discovery, colony, and timeline systems." />
              <p className="rounded border border-cyan-300/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-200">{draft.history.summary}</p>
              <MetricGrid values={draft.history as unknown as Record<string, unknown>} />
            </>
          ) : null}

          {activeTab === "presentation" ? (
            <>
              <SectionHeader title="Presentation Intent" description="Studio publishes content, ordering, units, formatting, confidence, and warnings. Clients own responsive layout and rendering." />
              <MetricGrid values={draft.presentation as unknown as Record<string, unknown>} />
            </>
          ) : null}

          {activeTab === "validation" ? (
            <>
              <SectionHeader title="Planet Validation" description="Errors block save and export. Scientific plausibility and gameplay balance warnings remain explicit." />
              {validationIssues.length ? (
                <div className="space-y-2">
                  {validationIssues.map((issue, index) => (
                    <div key={`${issue.code}-${issue.path}-${index}`} className={`rounded border p-3 ${issueTone(issue)}`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.14em]">{titleFromKey(issue.severity)}</p>
                        <p className="font-mono text-[0.62rem] opacity-70">{issue.code}</p>
                      </div>
                      <p className="mt-2 text-sm">{issue.message}</p>
                      <p className="mt-1 font-mono text-[0.62rem] opacity-70">{issue.path}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded border border-emerald-300/25 bg-emerald-300/10 p-4 text-emerald-100">
                  <Check className="h-5 w-5" />
                  <p className="font-semibold">Deep planet data is valid and export ready.</p>
                </div>
              )}
            </>
          ) : null}

          {activeTab === "runtime" ? (
            <>
              <SectionHeader title="Engine-Agnostic Runtime Preview" description="Normalized references are shown exactly as clients consume them. No Unity layout coordinates or live player state are included." />
              <pre className="max-h-[62vh] overflow-auto rounded border border-cyan-300/10 bg-black/55 p-4 text-xs leading-5 text-cyan-50">{JSON.stringify(draft, null, 2)}</pre>
            </>
          ) : null}

          {activeTab !== "resources" ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-cyan-300/10 pt-4">
              <Button type="button" disabled={saving} onClick={() => save({ ...draft, overrides: { ...draft.overrides } }, "Saved authoring changes.")}>
                <Check className="mr-2 h-4 w-4" />
                Save Planet Data
              </Button>
              <Button type="button" disabled={saving} onClick={() => save(generatePlanetDeepData(planet), "Restored canonical generated defaults.")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore Canonical Defaults
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Archive, Copy, Edit3, FileJson, GitBranch, Layers3, Plus, Search } from "lucide-react";
import { ProductionCopyButton } from "@/components/production/copy-button";
import {
  allRenderProfilesJson,
  renderProfileCategories,
  renderProfileChecklist,
  renderProfileEngines,
  renderProfileExactValuesText,
  renderProfileJson,
  renderProfilesLibrary,
  renderProfileSpecification,
  renderProfileStatuses,
  renderProfileStudioContractText,
  type RenderProfile,
  type RenderProfileCategory,
  type RenderProfileEngine,
  type RenderProfileStatus,
  validateRenderProfiles
} from "@/lib/production/render-library";

type SortMode = "name" | "category" | "version" | "status" | "updated";

function matchesFilter(value: string, filter: string) {
  return filter === "All" || value === filter;
}

function ProfileCard({
  profile,
  onDuplicate,
  onArchive
}: {
  profile: RenderProfile;
  onDuplicate: (profile: RenderProfile) => void;
  onArchive: (profile: RenderProfile) => void;
}) {
  return (
    <article className="flex min-h-[18rem] flex-col rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 transition hover:border-cyan-300/45">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-cyan-200">{profile.category}</p>
          <h2 className="mt-2 text-xl font-black text-white">{profile.name}</h2>
          <p className="mt-1 text-sm font-bold text-cyan-100">{profile.materialName}</p>
        </div>
        <span className="rounded-md border border-cyan-300/20 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-cyan-100">{profile.status}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{profile.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-500">Version</p>
          <p className="mt-1 font-black text-white">{profile.version}</p>
        </div>
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-500">Engine</p>
          <p className="mt-1 font-black text-white">{profile.engine}</p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Link href={`/production/render-library/${profile.slug}`} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60">
          <Edit3 className="h-4 w-4" />
          Edit
        </Link>
        <button type="button" onClick={() => onDuplicate(profile)} className="inline-flex items-center gap-2 rounded-md border border-slate-500/35 bg-slate-950/45 px-3 py-2 text-sm font-black text-slate-200 transition hover:border-cyan-200/45 hover:text-white">
          <Copy className="h-4 w-4" />
          Duplicate
        </button>
        <button type="button" onClick={() => onArchive(profile)} className="inline-flex items-center gap-2 rounded-md border border-slate-500/35 bg-slate-950/45 px-3 py-2 text-sm font-black text-slate-200 transition hover:border-cyan-200/45 hover:text-white">
          <Archive className="h-4 w-4" />
          Archive
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ProductionCopyButton label="Copy Spec" text={renderProfileSpecification(profile)} className="w-full justify-center px-2 text-xs" />
        <ProductionCopyButton label="Copy JSON" text={renderProfileJson(profile)} className="w-full justify-center px-2 text-xs" />
        <ProductionCopyButton label="Copy Blender" text={renderProfileChecklist(profile)} className="w-full justify-center px-2 text-xs" />
        <ProductionCopyButton label="Copy Contract" text={renderProfileStudioContractText(profile)} className="w-full justify-center px-2 text-xs" />
      </div>
    </article>
  );
}

export function RenderLibraryWorkspace() {
  const [profiles, setProfiles] = useState(renderProfilesLibrary);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<RenderProfileCategory | "All">("All");
  const [status, setStatus] = useState<RenderProfileStatus | "All">("All");
  const [version, setVersion] = useState("All");
  const [engine, setEngine] = useState<RenderProfileEngine | "All">("All");
  const [sort, setSort] = useState<SortMode>("category");

  const validation = useMemo(() => validateRenderProfiles(profiles), [profiles]);
  const versions = useMemo(() => ["All", ...Array.from(new Set(profiles.map((profile) => profile.version))).sort()], [profiles]);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return profiles
      .filter((profile) => !normalizedQuery || [profile.name, profile.slug, profile.materialName, profile.description, profile.tags.join(" ")].join(" ").toLowerCase().includes(normalizedQuery))
      .filter((profile) => matchesFilter(profile.category, category))
      .filter((profile) => matchesFilter(profile.status, status))
      .filter((profile) => matchesFilter(profile.version, version))
      .filter((profile) => matchesFilter(profile.engine, engine))
      .sort((a, b) => {
        if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
        return String(a[sort]).localeCompare(String(b[sort]));
      });
  }, [category, engine, profiles, query, sort, status, version]);

  function duplicateProfile(profile: RenderProfile) {
    const now = new Date().toISOString();
    setProfiles((current) => [
      ...current,
      {
        ...profile,
        id: `${profile.id}-copy-${current.length + 1}`,
        slug: `${profile.slug}-copy-${current.length + 1}`,
        name: `${profile.name} Copy`,
        status: "Draft",
        createdAt: now,
        updatedAt: now
      }
    ]);
  }

  function archiveProfile(profile: RenderProfile) {
    setProfiles((current) => current.map((item) => item.id === profile.id ? { ...item, status: "Archived", updatedAt: new Date().toISOString() } : item));
  }

  function createProfile() {
    const now = new Date().toISOString();
    setProfiles((current) => [
      ...current,
      {
        ...renderProfilesLibrary[0],
        id: `render-profile-draft-${current.length + 1}`,
        slug: `draft-render-profile-${current.length + 1}`,
        name: `Draft Render Profile ${current.length + 1}`,
        status: "Draft",
        category: "Surface",
        materialName: `Draft_Render_Profile_${current.length + 1}`,
        createdAt: now,
        updatedAt: now
      }
    ]);
  }

  return (
    <main className="space-y-5">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Production / Render Library</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Render Library</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">Author and maintain exact Blender render profiles for NOVERIS production. These profiles are documentation and Studio authoring contracts only; they do not publish gameplay runtime data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={createProfile} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60">
              <Plus className="h-4 w-4" />
              Create Profile
            </button>
            <ProductionCopyButton label="Copy All JSON" text={allRenderProfilesJson(profiles)} />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_repeat(5,minmax(8rem,12rem))]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search profiles, materials, tags" className="h-11 w-full rounded-md border border-cyan-300/15 bg-slate-950/70 pl-9 pr-3 text-sm font-bold text-white outline-none transition focus:border-cyan-200/60" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value as RenderProfileCategory | "All")} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 text-sm font-black text-white outline-none">
            <option>All</option>
            {renderProfileCategories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value as RenderProfileStatus | "All")} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 text-sm font-black text-white outline-none">
            <option>All</option>
            {renderProfileStatuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={version} onChange={(event) => setVersion(event.target.value)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 text-sm font-black text-white outline-none">
            {versions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={engine} onChange={(event) => setEngine(event.target.value as RenderProfileEngine | "All")} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 text-sm font-black text-white outline-none">
            <option>All</option>
            {renderProfileEngines.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 text-sm font-black text-white outline-none">
            <option value="category">Sort: Category</option>
            <option value="name">Sort: Name</option>
            <option value="version">Sort: Version</option>
            <option value="status">Sort: Status</option>
            <option value="updated">Sort: Updated</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          <span>{visible.length} shown / {profiles.length} total</span>
          <span className={validation.valid ? "text-emerald-200" : "text-amber-200"}>{validation.valid ? "Validation Ready" : `${validation.issues.length} validation issues`}</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((profile) => <ProfileCard key={profile.id} profile={profile} onDuplicate={duplicateProfile} onArchive={archiveProfile} />)}
      </section>
    </main>
  );
}

export function RenderProfileDetail({ profile }: { profile: RenderProfile }) {
  return (
    <main className="space-y-5">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <Link href="/production/render-library" className="text-sm font-black text-cyan-200 hover:text-white">Back to Render Library</Link>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">{profile.category} / {profile.version}</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">{profile.name}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{profile.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProductionCopyButton label="Copy Specification" text={renderProfileSpecification(profile)} />
            <ProductionCopyButton label="Copy JSON" text={renderProfileJson(profile)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ["Status", profile.status],
          ["Renderer", profile.renderer],
          ["Object", profile.objectName],
          ["Material", profile.materialName]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-black text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-white">Exact Values</h2>
          <ProductionCopyButton label="Copy Exact Values" text={renderProfileExactValuesText(profile)} />
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {Object.entries(profile.values).map(([group, values]) => (
            <article key={group} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <h3 className="text-lg font-black text-cyan-100">{group}</h3>
              <div className="mt-3 space-y-2">
                {values.map((value) => (
                  <div key={`${group}-${value.parameter}`} className="rounded-md border border-cyan-300/10 bg-[#07101e]/70 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-black text-white">{value.parameter}</p>
                      <ProductionCopyButton label="Copy" text={value.blenderTarget} className="px-2 py-1 text-xs" />
                    </div>
                    {value.type === "number" ? <p className="mt-1 text-sm text-slate-300">Value {value.value} {value.unit} / min {value.min} / max {value.max} / step {value.step} / precision {value.precision}</p> : null}
                    {value.type === "string" ? <p className="mt-1 text-sm text-slate-300">Value {String(value.value)}</p> : null}
                    {value.type === "vector3" ? <p className="mt-1 text-sm text-slate-300">Value {value.value.join(", ")} / step {value.step} / precision {value.precision}</p> : null}
                    {value.type === "color" ? (
                      <div className="mt-2 flex items-center gap-3 text-sm text-slate-300">
                        <span className="h-8 w-8 rounded-md border border-white/20" style={{ backgroundColor: value.hex }} />
                        <span>{value.hex} / rgb({value.rgb.join(", ")})</span>
                        <ProductionCopyButton label="Copy HEX" text={value.hex} className="px-2 py-1 text-xs" />
                      </div>
                    ) : null}
                    {value.type === "colorRamp" ? (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Interpolation {value.interpolation}</p>
                        {value.stops.map((stop) => (
                          <div key={stop.name} className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                            <span className="h-7 w-7 rounded-md border border-white/20" style={{ backgroundColor: stop.hex }} />
                            <span>{stop.name} / {stop.position} / {stop.hex} / rgb({stop.rgb.join(", ")})</span>
                            <ProductionCopyButton label="Copy HEX" text={stop.hex} className="px-2 py-1 text-xs" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-2 text-xs font-semibold text-slate-500">{value.description} Target: {value.blenderTarget}. Studio exposed: {String(value.studioExposed)}.</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-2xl font-black text-white"><GitBranch className="h-5 w-5 text-cyan-200" /> Node Graph</h2>
          </div>
          <div className="mt-4 space-y-3">
            {profile.nodeGraph.nodes.map((node) => (
              <div key={node.nodeId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="font-black text-white">{node.displayName}</p>
                <p className="text-sm text-cyan-100">{node.nodeType}</p>
                <p className="mt-1 text-sm text-slate-400">{node.notes}</p>
              </div>
            ))}
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="font-black text-white">Connections</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {profile.nodeGraph.connections.map((connection) => <li key={`${connection.fromNode}-${connection.toNode}-${connection.toSocket}`}>{connection.fromNode}.{connection.fromSocket} → {connection.toNode}.{connection.toSocket}</li>)}
              </ul>
            </div>
          </div>
        </article>

        <article className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-2xl font-black text-white"><Layers3 className="h-5 w-5 text-cyan-200" /> Studio Contract</h2>
            <ProductionCopyButton label="Copy Contract" text={renderProfileStudioContractText(profile)} />
          </div>
          <div className="mt-4 space-y-3">
            {profile.studioContract.map((entry) => (
              <div key={entry.key} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="font-black text-white">{entry.label}</p>
                <p className="text-sm text-slate-300">{entry.key} / {entry.type} / default {Array.isArray(entry.defaultValue) ? entry.defaultValue.join(", ") : String(entry.defaultValue)}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Required {String(entry.required)} / editable {String(entry.studioEditable)} / runtimePublished {String(entry.runtimePublished)} / {entry.blenderTarget}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-white">Blender Implementation</h2>
            <ProductionCopyButton label="Copy Checklist" text={renderProfileChecklist(profile)} />
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {profile.implementationNotes.map((note) => <li key={note}>- {note}</li>)}
          </ul>
        </article>
        <article className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <h2 className="text-xl font-black text-white">Validation</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {profile.validationNotes.map((note) => <li key={note}>- {note}</li>)}
          </ul>
        </article>
        <article className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <h2 className="text-xl font-black text-white">Version History</h2>
          <p className="mt-4 text-sm text-slate-300">{profile.version} seeded on {profile.createdAt.slice(0, 10)}. Updated {profile.updatedAt.slice(0, 10)}.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ProductionCopyButton label="Copy JSON" text={renderProfileJson(profile)} />
            <ProductionCopyButton label="Copy Values" text={renderProfileExactValuesText(profile)} />
          </div>
        </article>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-black text-white"><FileJson className="h-5 w-5 text-cyan-200" /> JSON Export</h2>
          <ProductionCopyButton label="Copy Profile JSON" text={renderProfileJson(profile)} />
        </div>
        <pre className="mt-4 max-h-[28rem] overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/70 p-4 text-xs leading-5 text-slate-200">{renderProfileJson(profile)}</pre>
      </section>
    </main>
  );
}

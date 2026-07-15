"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarClock, Filter, History, Sparkles, Trophy } from "lucide-react";
import {
  DISCOVERY_LOG_UPDATED_EVENT,
  readDiscoveryJournal,
  readTimelineEvents,
  sampleDiscoveryJournal,
  sampleTimelineEvents,
  type DiscoveryJournalEntry,
  type DiscoveryObjectType,
  type TimelineEvent,
  type TimelineEventType
} from "@/lib/explorer/discovery-log";
import { WorkspaceHeader, WorkspaceSearchBar, WorkspaceStatTile as StatTile } from "@/components/ui/workspace";

type ExplorerLogMode = "journal" | "timeline";

function typeLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateLabel(value: string) {
  if (value === "derived") return "Derived";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function badgeClass(value: string) {
  if (value === "legendary" || value === "colonized") return "border-amber-300/45 text-amber-100";
  if (value === "high" || value === "explored" || value === "charted") return "border-cyan-300/45 text-cyan-100";
  if (value === "medium" || value === "scanned") return "border-emerald-300/45 text-emerald-100";
  return "border-slate-500/45 text-slate-300";
}

function EmptyLogState({ mode }: { mode: ExplorerLogMode }) {
  return (
    <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-5 text-sm font-semibold leading-6 text-amber-100">
      {mode === "journal"
        ? "No live discoveries have been logged in this browser yet. Scan sectors, star systems, or planets from the explorer pages to populate the journal."
        : "No live timeline events have been logged in this browser yet. Major discovery actions will appear here as they happen."}
    </div>
  );
}

export function DiscoveryJournalWorkspace({ mode = "journal" }: { mode?: ExplorerLogMode }) {
  const [journal, setJournal] = useState<DiscoveryJournalEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<DiscoveryJournalEntry | null>(null);

  useEffect(() => {
    function refresh() {
      setJournal(readDiscoveryJournal());
      setTimeline(readTimelineEvents());
    }

    refresh();
    window.addEventListener(DISCOVERY_LOG_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DISCOVERY_LOG_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const visibleJournal = journal.length ? journal : sampleDiscoveryJournal;
  const visibleTimeline = timeline.length ? timeline : sampleTimelineEvents;
  const activeRows = mode === "journal" ? visibleJournal : visibleTimeline;
  const hasLiveRows = mode === "journal" ? journal.length > 0 : timeline.length > 0;
  const typeOptions = useMemo(() => {
    const values = activeRows.map((row) => (mode === "journal" ? (row as DiscoveryJournalEntry).objectType : (row as TimelineEvent).eventType));
    return ["all", ...Array.from(new Set(values))];
  }, [activeRows, mode]);
  const filteredJournal = visibleJournal.filter((entry) => {
    const matchesType = typeFilter === "all" || entry.objectType === typeFilter;
    const matchesQuery = !query.trim() || [entry.objectName, entry.generatedName, entry.displayName, entry.rarity, entry.tags.join(" ")].some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase()));
    return matchesType && matchesQuery;
  });
  const filteredTimeline = visibleTimeline.filter((event) => {
    const matchesType = typeFilter === "all" || event.eventType === typeFilter;
    const matchesQuery = !query.trim() || [event.title, event.description, event.relatedObjectType, event.importance].some((value) => String(value).toLowerCase().includes(query.toLowerCase()));
    return matchesType && matchesQuery;
  });
  const countsByType = visibleJournal.reduce<Record<string, number>>((counts, entry) => ({ ...counts, [entry.objectType]: (counts[entry.objectType] ?? 0) + 1 }), {});
  const totalScore = visibleJournal.reduce((sum, entry) => sum + entry.discoveryPoints, 0);

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Explorer Update v0.5"
        title={mode === "journal" ? "Discovery Library" : "Universe Timeline"}
        description={
          mode === "journal"
            ? "Track named discoveries, discovery states, score, parent links, rarity, tags, and notes as the exploration loop resolves the universe."
            : "Review major exploration milestones from scans, claims, colonization, research completion, and intergalactic unlocks."
        }
        stats={[
          { label: "Discovery Score", value: totalScore.toLocaleString() },
          { label: "Journal Entries", value: visibleJournal.length },
          { label: "Timeline Events", value: visibleTimeline.length },
          { label: "Live Browser Log", value: hasLiveRows ? "Active" : "Sample" }
        ]}
      />

      <section className="grid gap-3 md:grid-cols-[1fr_16rem]">
        <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search discoveries" />
        <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3">
          <Filter className="h-4 w-4 text-cyan-200" />
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none">
            {typeOptions.map((value) => (
              <option key={value} value={value} className="bg-slate-950">
                {value === "all" ? "All Types" : typeLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </section>

      {!hasLiveRows ? <EmptyLogState mode={mode} /> : null}

      {mode === "journal" ? (
        <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
          <div className="grid gap-3">
            {filteredJournal.map((entry) => (
              <button key={entry.id} type="button" onClick={() => setSelectedEntry(entry)} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 text-left transition hover:border-cyan-300/55">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md border border-cyan-300/30 px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">{typeLabel(entry.objectType)}</span>
                      <span className={`rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${badgeClass(entry.discoveryState)}`}>{entry.discoveryState}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-white">{entry.displayName || entry.objectName}</h2>
                    <p className="mt-1 font-mono text-xs text-slate-500">{entry.objectId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-cyan-100">{entry.discoveryPoints.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-slate-500">points</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{entry.notes || "Discovery entry recorded from the exploration loop."}</p>
              </button>
            ))}
          </div>
          <aside className="space-y-4">
            <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-cyan-200" />
                <h3 className="text-lg font-black text-white">Counts By Type</h3>
              </div>
              <div className="mt-3 grid gap-2">
                {Object.entries(countsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-300">{typeLabel(type)}</span>
                    <span className="text-sm font-black text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-200" />
                <h3 className="text-lg font-black text-white">Selected Entry</h3>
              </div>
              {selectedEntry ? (
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-500">Name:</span> {selectedEntry.displayName || selectedEntry.objectName}</p>
                  <p><span className="text-slate-500">Generated:</span> {selectedEntry.generatedName ?? selectedEntry.objectName}</p>
                  <p><span className="text-slate-500">Discovered:</span> {dateLabel(selectedEntry.discoveredAt)}</p>
                  <p><span className="text-slate-500">By:</span> {selectedEntry.discoveredBy}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-400">Click a journal row to inspect its parent links and naming history.</p>
              )}
            </div>
          </aside>
        </section>
      ) : (
        <section className="space-y-3">
          {filteredTimeline.map((event) => (
            <article key={event.id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${badgeClass(event.importance)}`}>{event.importance}</span>
                    <span className="rounded-md border border-cyan-300/30 px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">{typeLabel(event.eventType)}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-white">{event.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{event.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                  <CalendarClock className="h-4 w-4 text-cyan-200" />
                  {dateLabel(event.timestamp)}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

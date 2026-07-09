"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, ExternalLink, Search } from "lucide-react";
import type { CodexTask } from "@/types/schema";

function taskPrompt(task: CodexTask) {
  const relatedTables = task.related_tables?.length ? task.related_tables.join(", ") : "None listed";
  const exportPath = task.export_path || "None listed";
  const notes = task.notes || "No additional notes.";

  return `PROJECT GENESIS STUDIO - CHATGPT TASK

Title:
${task.title}

System:
${task.system || "Unassigned"}

Priority:
${task.priority || "Normal"}

Status:
${task.status || "Open"}

Source:
${task.source_type || "Manual"}${task.source_id ? ` / ${task.source_id}` : ""}

Description:
${task.description || "No description provided."}

Related Tables:
${relatedTables}

Export / Reference Path:
${exportPath}

Notes:
${notes}

Instructions:
Review this Project Genesis Studio task and turn it into a clear implementation or design plan. Preserve the game-design intent, identify missing assumptions, and produce copy-ready requirements I can hand back to Codex or use as a studio spec.`;
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value.includes("done") || value.includes("complete")) return "border-emerald-300/35 text-emerald-100";
  if (value.includes("progress")) return "border-blue-300/35 text-blue-100";
  if (value.includes("review")) return "border-amber-300/35 text-amber-100";
  return "border-slate-300/35 text-slate-100";
}

export function ChatGptTasksWorkspace({ tasks }: { tasks: CodexTask[] }) {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tasks;

    return tasks.filter((task) =>
      [task.title, task.system, task.priority, task.status, task.description, task.notes, task.related_tables?.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [query, tasks]);

  async function copyTask(task: CodexTask) {
    await navigator.clipboard.writeText(taskPrompt(task));
    setCopiedId(task.id);
    window.setTimeout(() => setCopiedId((current) => (current === task.id ? null : current)), 1800);
  }

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Studio Library</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">ChatGPT Tasks</h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-slate-300">
            Copy-ready task handoffs for ChatGPT review, planning, and requirement cleanup before the work goes back into the studio.
          </p>
        </div>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#081120]/90">
        <div className="flex items-center gap-3 border-b border-cyan-300/10 p-4">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ChatGPT tasks"
            className="h-12 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-600"
          />
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-2">
          {filteredTasks.map((task) => (
            <article key={task.id} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] ${statusClass(task.status)}`}>{task.status}</span>
                    <span className="rounded-md border border-cyan-300/20 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">{task.priority}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black text-white">{task.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{task.system || "Unassigned system"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyTask(task)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
                >
                  {copiedId === task.id ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copiedId === task.id ? "Copied" : "Copy Handoff"}
                </button>
              </div>

              <p className="mt-4 text-base leading-7 text-slate-300">{task.description}</p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/55 p-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">Related Tables</p>
                  <p className="mt-2 text-sm font-semibold text-cyan-100">{task.related_tables?.join(", ") || "None listed"}</p>
                </div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/55 p-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">Source Type</p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">{task.source_type || "Manual"}</p>
                </div>
              </div>

              {task.notes ? <p className="mt-4 rounded-md border border-slate-700/60 bg-slate-950/45 p-3 text-sm leading-6 text-slate-400">{task.notes}</p> : null}

              <div className="mt-5 flex flex-wrap gap-3">
                {task.export_path ? (
                  <a href={task.export_path} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-3 text-sm font-bold text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100">
                    <ExternalLink className="h-4 w-4" />
                    Open Reference
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => copyTask(task)}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
                >
                  <Clipboard className="h-4 w-4" />
                  Copy for ChatGPT
                </button>
              </div>
            </article>
          ))}
          {!filteredTasks.length ? <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-8 text-center text-slate-400">No ChatGPT tasks match that search.</div> : null}
        </div>
      </section>
    </main>
  );
}

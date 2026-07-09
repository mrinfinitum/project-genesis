"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Clipboard, ExternalLink, RotateCcw, Search } from "lucide-react";
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

function isTaskComplete(task: CodexTask) {
  const status = task.status.toLowerCase();
  return status.includes("complete") || status.includes("done");
}

function formattedTaskDate(value?: string) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function ChatGptTasksWorkspace({ tasks }: { tasks: CodexTask[] }) {
  const [rows, setRows] = useState(tasks);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");
  const [expandedArchiveIds, setExpandedArchiveIds] = useState<Set<string>>(() => new Set());

  const taskCounts = useMemo(() => {
    const complete = rows.filter(isTaskComplete).length;
    return {
      complete,
      open: rows.length - complete,
      total: rows.length
    };
  }, [rows]);

  const filteredTasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;

    return rows.filter((task) =>
      [task.title, task.system, task.priority, task.status, task.description, task.notes, task.related_tables?.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [query, rows]);

  const hasSearch = query.trim().length > 0;
  const openTasks = useMemo(() => filteredTasks.filter((task) => !isTaskComplete(task)), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(isTaskComplete), [filteredTasks]);

  function toggleArchiveTask(taskId: string) {
    setExpandedArchiveIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(taskId)) {
        nextIds.delete(taskId);
      } else {
        nextIds.add(taskId);
      }
      return nextIds;
    });
  }

  async function copyTask(task: CodexTask) {
    await navigator.clipboard.writeText(taskPrompt(task));
    setCopiedId(task.id);
    window.setTimeout(() => setCopiedId((current) => (current === task.id ? null : current)), 1800);
  }

  async function updateTaskStatus(task: CodexTask, status: "Open" | "Complete") {
    setUpdatingTaskId(task.id);
    setStatusMessage("");
    setStatusError("");

    const updatedTask = {
      ...task,
      status,
      updated_at: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/data/codex_tasks", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(updatedTask)
      });
      const payload = (await response.json().catch(() => ({}))) as { row?: CodexTask; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update task status.");
      }

      const savedTask = payload.row ?? updatedTask;
      setRows((currentRows) => currentRows.map((current) => (current.id === task.id ? savedTask : current)));
      setStatusMessage(`${savedTask.title} marked ${savedTask.status}.`);
    } catch (caughtError) {
      setStatusError(caughtError instanceof Error ? caughtError.message : "Could not update task status.");
    } finally {
      setUpdatingTaskId(null);
    }
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
        <div className="grid min-w-72 grid-cols-3 gap-3">
          <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-3 text-center">
            <p className="text-2xl font-black text-white">{taskCounts.total}</p>
            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">Tracked</p>
          </div>
          <div className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-center">
            <p className="text-2xl font-black text-amber-100">{taskCounts.open}</p>
            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-amber-200/70">Open</p>
          </div>
          <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3 text-center">
            <p className="text-2xl font-black text-emerald-100">{taskCounts.complete}</p>
            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-emerald-200/70">Complete</p>
          </div>
        </div>
      </section>

      {statusMessage || statusError ? (
        <p className={`rounded-md border px-4 py-3 text-sm font-semibold ${statusError ? "border-red-300/35 bg-red-400/10 text-red-100" : "border-emerald-300/35 bg-emerald-400/10 text-emerald-100"}`}>
          {statusError || statusMessage}
        </p>
      ) : null}

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

        <div className="space-y-6 p-4">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">Open Work</h2>
              <span className="rounded-md border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-100">{openTasks.length} Open</span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {openTasks.map((task) => (
                <article key={task.id} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] ${statusClass(task.status)}`}>{task.status}</span>
                        <span className="rounded-md border border-cyan-300/20 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">{task.priority}</span>
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-white">{task.title}</h3>
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
                    <button
                      type="button"
                      onClick={() => updateTaskStatus(task, "Complete")}
                      disabled={updatingTaskId === task.id}
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-400/10 px-3 text-sm font-bold text-emerald-100 transition hover:border-emerald-200/60 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Mark Complete
                    </button>
                  </div>
                </article>
              ))}
              {!filteredTasks.length ? <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-8 text-center text-slate-400">{hasSearch ? "No ChatGPT tasks match that search." : "No ChatGPT tasks are tracked yet."}</div> : null}
              {filteredTasks.length && !openTasks.length ? <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-8 text-center text-slate-400">{hasSearch ? "No open ChatGPT tasks match that search." : "No open ChatGPT tasks are active."}</div> : null}
            </div>
          </div>

          {completedTasks.length ? (
            <div className="border-t border-cyan-300/10 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">Completed Archive</h2>
                <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">{completedTasks.length} Complete</span>
              </div>
              <div className="space-y-2">
                {completedTasks.map((task) => {
                  const isExpanded = expandedArchiveIds.has(task.id);
                  return (
                    <article key={task.id} className="overflow-hidden rounded-md border border-emerald-300/15 bg-slate-950/35">
                      <button
                        type="button"
                        onClick={() => toggleArchiveTask(task.id)}
                        aria-expanded={isExpanded}
                        className="grid w-full gap-3 px-4 py-3 text-left transition hover:bg-emerald-300/5 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                      >
                        <span className={`inline-flex h-7 items-center justify-center rounded-md border px-2.5 text-xs font-black uppercase tracking-[0.16em] ${statusClass(task.status)}`}>{task.status}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black text-white">{task.title}</span>
                          <span className="mt-1 block truncate text-xs font-semibold text-slate-500">{task.system || "Unassigned system"}</span>
                        </span>
                        <span className="flex items-center gap-3 text-xs font-bold text-slate-500">
                          <span className="rounded-md border border-cyan-300/15 px-2 py-1 uppercase tracking-[0.14em] text-cyan-100">{task.priority}</span>
                          <span className="hidden sm:inline">{formattedTaskDate(task.updated_at)}</span>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-emerald-100" /> : <ChevronRight className="h-4 w-4 text-emerald-100" />}
                        </span>
                      </button>

                      {isExpanded ? (
                        <div className="border-t border-emerald-300/10 px-4 py-4">
                          <p className="text-sm leading-6 text-slate-300">{task.description}</p>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                          <div className="mt-4 flex flex-wrap gap-3">
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
                              {copiedId === task.id ? "Copied" : "Copy for ChatGPT"}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTaskStatus(task, "Open")}
                              disabled={updatingTaskId === task.id}
                              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-3 text-sm font-bold text-slate-100 transition hover:border-amber-300/45 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Reopen
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

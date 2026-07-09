import { ChatGptTasksWorkspace } from "@/components/chatgpt-tasks-workspace";
import { handoffData } from "@/data/handoff";
import { getRows } from "@/lib/data";
import type { CodexTask } from "@/types/schema";

export const dynamic = "force-dynamic";

function isComplete(status: string) {
  return status.toLowerCase().includes("complete") || status.toLowerCase().includes("done");
}

function mergeCompletedTaskState(rows: CodexTask[]) {
  const completedTasks = handoffData.codex_tasks.filter((task) => isComplete(task.status));
  const completedById = new Map(completedTasks.map((task) => [task.id, task]));
  const completedBySourceId = new Map(completedTasks.map((task) => [task.source_id, task]));
  const seenTaskIds = new Set<string>();
  const seenSourceIds = new Set<string>();

  const mergedRows = rows.map((row) => {
    const completedTask = completedById.get(row.id) ?? completedBySourceId.get(row.source_id);
    seenTaskIds.add(row.id);
    if (row.source_id) seenSourceIds.add(row.source_id);

    if (!completedTask) {
      return row;
    }

    return {
      ...row,
      title: completedTask.title,
      source_type: completedTask.source_type,
      source_id: completedTask.source_id,
      system: completedTask.system,
      priority: completedTask.priority,
      status: completedTask.status,
      description: completedTask.description,
      related_tables: completedTask.related_tables,
      export_path: completedTask.export_path,
      updated_at: completedTask.updated_at,
      notes: completedTask.notes
    };
  });

  const missingCompletedTasks = completedTasks.filter((task) => !seenTaskIds.has(task.id) && !seenSourceIds.has(task.source_id));
  return [...mergedRows, ...missingCompletedTasks];
}

export default async function TasksPage() {
  const rows = await getRows("codex_tasks");
  return <ChatGptTasksWorkspace tasks={mergeCompletedTaskState(rows as CodexTask[])} />;
}

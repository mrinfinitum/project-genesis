import { ChatGptTasksWorkspace } from "@/components/chatgpt-tasks-workspace";
import { getRows } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const rows = await getRows("codex_tasks");
  return <ChatGptTasksWorkspace tasks={rows} />;
}

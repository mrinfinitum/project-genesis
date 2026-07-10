import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function CodexHandoffsPage() {
  const rows = await getRows("codex_readiness_items");
  return (
    <DataWorkspace
      config={tableConfigs.codex_readiness_items}
      initialRows={rows}
      eyebrow="Developer Handoff"
      title="ChatGPT Readiness Items"
      description="Handoff-ready exports and specs prepared for ChatGPT planning, requirement cleanup, and review work."
      intent="Track handoff items as compact cards with status, priority, related tables, and export references visible on selection."
    />
  );
}

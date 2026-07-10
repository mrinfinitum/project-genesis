import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const rows = await getRows("project_systems");
  return (
    <DataWorkspace
      config={tableConfigs.project_systems}
      initialRows={rows}
      eyebrow="Developer"
      title="Database"
      description="Command-center system progress, completion counts, priorities, blocked records, and next actions."
      intent="Use cards for project-system health inspection. The advanced editor remains the direct maintenance layer for system metrics."
    />
  );
}

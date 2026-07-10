import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const rows = await getRows("buildings");
  return (
    <DataWorkspace
      config={tableConfigs.buildings}
      initialRows={rows}
      eyebrow="Progression Design"
      title="Building Designer"
      description="Buildable city content, costs, income, district links, upgrade chains, and asset references."
      intent="Use building cards to compare era, category, costs, and gameplay role before opening the full direct-edit record layer."
    />
  );
}

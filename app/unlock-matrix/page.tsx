import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function UnlockMatrixPage() {
  const rows = await getRows("unlock_matrix");
  return (
    <DataWorkspace
      config={tableConfigs.unlock_matrix}
      initialRows={rows}
      eyebrow="Progression Design"
      title="Unlock Matrix"
      description="Canonical relationship map from research sources to content unlocks across exploration, colonies, economy, missions, and engine exports."
      intent="Inspect unlock links as dependency cards first. Keep source IDs, unlock IDs, implementation status, and notes available in the detail panel and raw editor."
    />
  );
}

import { DataWorkspace } from "@/components/data-workspace";
import { handoffData } from "@/data/handoff";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function ResourceCatalogPage() {
  const rows = await getRows("resource_catalog");
  return (
    <div className="space-y-6">
      <DataWorkspace
        config={tableConfigs.resource_catalog}
        initialRows={rows.length ? rows : handoffData.resource_catalog}
        eyebrow="Canonical Resource System"
        title="Resource Library"
        description="Master resource definitions, rarity, value, discovery tier, stack rules, and lore notes. This remains the source of truth for every gameplay and export system."
        intent="Browse resources as authored game objects first. Use the advanced editor only when IDs, trade values, or schema-level fields need direct maintenance. The canonical resource_catalog remains the underlying source of truth."
      />
    </div>
  );
}

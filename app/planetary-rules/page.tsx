import { AdminTable } from "@/components/admin-table";
import { handoffData } from "@/data/handoff";
import { getRows } from "@/lib/data";
import { planetaryRulesDisplayRows } from "@/lib/planets/rule-rows";
import { tableConfigs } from "@/lib/tables";
import type { PlanetVariable } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function PlanetaryRulesPage() {
  const rows = await getRows("planets");
  return (
    <AdminTable
      config={tableConfigs.planets}
      initialRows={planetaryRulesDisplayRows(rows as PlanetVariable[], handoffData.planets)}
    />
  );
}

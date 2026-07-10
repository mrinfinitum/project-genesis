import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function DistrictsPage() {
  const rows = await getRows("districts");
  return (
    <DataWorkspace
      config={tableConfigs.districts}
      initialRows={rows}
      eyebrow="Progression Design"
      title="District Designer"
      description="City layout zones, primary stat identities, bonuses, civilization hooks, and building group intent."
      intent="Review districts as identity cards first, then open the record detail for unlocks, bonuses, and raw schema fields."
    />
  );
}

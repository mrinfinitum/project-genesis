import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function UpgradesPage() {
  const rows = await getRows("upgrades");
  return (
    <DataWorkspace
      config={tableConfigs.upgrades}
      initialRows={rows}
      eyebrow="Progression Design"
      title="Upgrade Designer"
      description="Repeatable and level-based progression improvements across workforce, industry, science, and technology."
      intent="Compare upgrades as progression cards with tier, unlock, cost, bonus, and asset metadata available on selection."
    />
  );
}

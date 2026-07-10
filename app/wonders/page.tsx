import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function WondersPage() {
  const rows = await getRows("wonders");
  return (
    <DataWorkspace
      config={tableConfigs.wonders}
      initialRows={rows}
      eyebrow="Progression Design"
      title="Wonder Designer"
      description="Civilization-defining prestige structures, requirements, construction costs, global modifiers, and status."
      intent="Treat wonders as high-impact progression objects with quick comparison cards and deeper requirement fields on selection."
    />
  );
}

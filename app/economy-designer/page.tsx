import { EconomyDesignerWorkspace } from "@/components/economy-designer-workspace";
import { getEconomyDesignerState } from "@/lib/economy-designer";

export const dynamic = "force-dynamic";

export default async function EconomyDesignerPage() {
  const view = await getEconomyDesignerState();
  return <EconomyDesignerWorkspace view={view} />;
}

import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const rows = await getRows("assets");
  return (
    <DataWorkspace
      config={tableConfigs.assets}
      initialRows={rows}
      eyebrow="Creative Asset System"
      title="Asset Library"
      description="Art prompts, generated references, Roblox asset IDs, file URLs, export status, and production notes."
      intent="Browse assets visually as production objects. Upload, generate, and raw asset maintenance remain available in the advanced editor."
    />
  );
}

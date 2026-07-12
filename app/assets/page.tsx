import { DataWorkspace } from "@/components/data-workspace";
import { getMergedAssetLibraryRows } from "@/lib/assets/game-art-import";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const { rows } = await getMergedAssetLibraryRows();
  return (
    <DataWorkspace
      config={tableConfigs.assets}
      initialRows={rows}
      eyebrow="Creative Asset System"
      title="Asset Library"
      description="Art prompts, generated references, Roblox asset IDs, file URLs, export status, and production notes."
      intent="Browse imported and legacy assets as production objects with previews, art keys, platform mappings, source status, and usage counts."
      rawEditorEnabled={false}
    />
  );
}

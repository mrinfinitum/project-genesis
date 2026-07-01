const appUrl = process.env.PROJECT_GENESIS_APP_URL ?? "http://127.0.0.1:3000";
const upgradeIconSizes = [64, 96, 128, 160, 192, 256];
const largeAssetSizes = [1024];

type AssetRow = {
  id: string;
  name?: string | null;
  source_file_url?: string | null;
  source_file_type?: string | null;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? `${response.status} ${response.statusText}`);
  }

  return payload as T;
}

async function main() {
  const assetsPayload = await fetchJson<{ rows: AssetRow[] }>(`${appUrl}/api/data/assets`);
  const sourceAssets = assetsPayload.rows.filter((asset) => asset.source_file_url && asset.source_file_type === "PSD");

  console.log(`Found ${sourceAssets.length} source PSD assets.`);

  let generated = 0;
  let failed = 0;

  for (const asset of sourceAssets) {
    try {
      const isBuildingAsset = asset.id.startsWith("asset-buildings-");
      const isResearchAsset = asset.id.startsWith("asset-research-");
      const sourceTable = isBuildingAsset ? "buildings" : isResearchAsset ? "research" : "assets";
      const sourceId = isBuildingAsset ? asset.id.replace(/^asset-buildings-/, "") : isResearchAsset ? asset.id.replace(/^asset-research-/, "") : asset.id;
      const sizes = isBuildingAsset || isResearchAsset ? largeAssetSizes : upgradeIconSizes;
      const payload = await fetchJson<{ variants: { size: number; url: string }[] }>(`${appUrl}/api/assets/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source_table: sourceTable,
          source_id: sourceId,
          asset_id: asset.id,
          sizes
        })
      });

      generated += 1;
      console.log(`Generated ${payload.variants.length} variants for ${asset.id} (${asset.name ?? "unnamed"}).`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed ${asset.id} (${asset.name ?? "unnamed"}): ${message}`);
    }
  }

  console.log(`Done. Generated: ${generated}. Failed: ${failed}.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

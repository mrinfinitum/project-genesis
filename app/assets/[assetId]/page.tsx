import { notFound } from "next/navigation";
import { AssetDetailWorkspace } from "@/components/asset-detail-workspace";
import { getAssetProductionState, getProductionAsset } from "@/lib/assets/asset-production";

type Props = {
  params: Promise<{ assetId: string }>;
  searchParams: Promise<{ tab?: string; returnTo?: string; eraId?: string; group?: string; filter?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({ params, searchParams }: Props) {
  const { assetId } = await params;
  const query = await searchParams;
  const asset = await getProductionAsset(decodeURIComponent(assetId));
  if (!asset) notFound();
  const state = await getAssetProductionState();
  const processingJobs = state.processingJobs.filter((job) => job.assetId === asset.id);
  return <AssetDetailWorkspace asset={asset} processingJobs={processingJobs} initialTab={query.tab} returnTo={query.returnTo} returnEraId={query.eraId} />;
}

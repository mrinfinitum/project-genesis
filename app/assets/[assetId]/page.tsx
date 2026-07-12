import { notFound } from "next/navigation";
import { AssetDetailWorkspace } from "@/components/asset-detail-workspace";
import { getProductionAsset } from "@/lib/assets/asset-production";

type Props = {
  params: Promise<{ assetId: string }>;
};

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({ params }: Props) {
  const { assetId } = await params;
  const asset = await getProductionAsset(decodeURIComponent(assetId));
  if (!asset) notFound();
  return <AssetDetailWorkspace asset={asset} />;
}

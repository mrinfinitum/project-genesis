import { notFound } from "next/navigation";
import { AssetSpecificationDetail } from "@/components/production/asset-specification-detail";
import { assetSpecifications } from "@/lib/production";

export function generateStaticParams() {
  return assetSpecifications.map((spec) => ({ assetType: spec.id }));
}

export default async function AssetSpecificationDetailPage({ params }: { params: Promise<{ assetType: string }> }) {
  const { assetType } = await params;
  const spec = assetSpecifications.find((item) => item.id === assetType);
  if (!spec) notFound();
  return <AssetSpecificationDetail spec={spec} />;
}

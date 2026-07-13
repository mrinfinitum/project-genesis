import { notFound } from "next/navigation";
import { ComponentDesignDetail } from "@/components/component-design-detail";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { resolveComponentPreview } from "@/lib/assets/visual-previews";
import { componentHandoffText, componentLibraryInitialRecords, getComponentDesignRecord, validateComponentDesign } from "@/lib/component-library";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return componentLibraryInitialRecords.map((record) => ({ componentId: record.componentId }));
}

export default async function ComponentDesignDetailPage({ params }: { params: Promise<{ componentId: string }> }) {
  const { componentId } = await params;
  const assetState = await getAssetProductionState();
  const record = await getComponentDesignRecord(componentId, assetState);
  if (!record) notFound();
  return (
    <ComponentDesignDetail
      record={record}
      preview={resolveComponentPreview(record, assetState.assets)}
      validation={validateComponentDesign(record)}
      handoffs={{
        "Game Codex": componentHandoffText(record, "Game Codex"),
        "Roblox Codex": componentHandoffText(record, "Roblox Codex")
      }}
    />
  );
}

import { notFound } from "next/navigation";
import { ScreenDesignDetail } from "@/components/screen-design-detail";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getScreenDesignRecord, screenDesignerInitialRecords, screenHandoffText, validateScreenDesign } from "@/lib/screen-designer";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return screenDesignerInitialRecords.map((record) => ({ screenId: record.screenId }));
}

export default async function ScreenDesignDetailPage({ params }: { params: Promise<{ screenId: string }> }) {
  const { screenId } = await params;
  const assetState = await getAssetProductionState();
  const record = await getScreenDesignRecord(screenId, assetState);
  if (!record) notFound();
  return (
    <ScreenDesignDetail
      record={record}
      validation={validateScreenDesign(record)}
      handoffs={{
        "Game Codex": screenHandoffText(record, "Game Codex"),
        "Roblox Codex": screenHandoffText(record, "Roblox Codex")
      }}
    />
  );
}

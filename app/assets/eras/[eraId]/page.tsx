import { notFound } from "next/navigation";
import { EraArtInventoryWorkspace } from "@/components/era-art-inventory-workspace";
import { getEraArtInventory } from "@/lib/assets/era-art-inventory";

type Props = {
  params: Promise<{ eraId: string }>;
};

export const dynamic = "force-dynamic";

export default async function EraArtInventoryPage({ params }: Props) {
  const { eraId } = await params;
  const inventory = await getEraArtInventory(decodeURIComponent(eraId));
  if (!inventory) notFound();
  return <EraArtInventoryWorkspace inventory={inventory} />;
}

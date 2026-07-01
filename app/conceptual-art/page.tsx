import { ConceptualArtGallery } from "@/components/conceptual-art-gallery";
import { getRows } from "@/lib/data";
import type { ConceptualArtRecord } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function ConceptualArtPage() {
  const rows = (await getRows("conceptual_art")) as ConceptualArtRecord[];

  return <ConceptualArtGallery initialRows={rows} />;
}

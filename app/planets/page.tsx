import { GeneratedPlanetsGallery } from "@/components/generated-planets-gallery";
import { getRows } from "@/lib/data";
import type { GeneratedPlanet } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function PlanetsPage() {
  const rows = (await getRows("generated_planets")) as GeneratedPlanet[];
  return <GeneratedPlanetsGallery initialRows={rows} />;
}

import { GeneratedPlanetsGallery } from "@/components/generated-planets-gallery";
import { getRows } from "@/lib/data";
import { withFixedSolGeneratedPlanets } from "@/lib/planets/fixed-sol-planets";
import type { GeneratedPlanet, PlanetRenderLibraryRecord } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function PlanetsPage() {
  const [rows, renderLibrary] = await Promise.all([
    getRows("generated_planets") as Promise<GeneratedPlanet[]>,
    getRows("planet_render_library").catch(() => []) as Promise<PlanetRenderLibraryRecord[]>
  ]);

  return <GeneratedPlanetsGallery initialRows={withFixedSolGeneratedPlanets(rows, renderLibrary)} />;
}

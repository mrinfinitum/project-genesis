import { CelestialBodyDesigner } from "@/components/celestial-body-designer";
import { getRows } from "@/lib/data";
import { generatedCelestialBodyRows } from "@/lib/universe/fallback-data";
import type { CelestialBodyRecord } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function CelestialBodiesPage() {
  const rows = (await getRows("celestial_bodies")) as CelestialBodyRecord[];
  const fallbackRows = generatedCelestialBodyRows(5) as CelestialBodyRecord[];

  return <CelestialBodyDesigner rows={rows.length ? rows : fallbackRows} />;
}

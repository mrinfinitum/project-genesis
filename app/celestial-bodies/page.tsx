import { CelestialBodyDesigner } from "@/components/celestial-body-designer";
import { getRows } from "@/lib/data";
import { generatedCelestialBodyRows } from "@/lib/universe/fallback-data";
import type { CelestialBodyRecord } from "@/types/schema";

export const dynamic = "force-dynamic";

function withFixedSolBodies(rows: CelestialBodyRecord[], fallbackRows: CelestialBodyRecord[]) {
  const fixedSolRows = fallbackRows.filter((row) => row.system_id === "system-sol" && row.is_fixed);
  const existingIds = new Set(rows.map((row) => row.id));
  const missingFixedRows = fixedSolRows.filter((row) => !existingIds.has(row.id));

  return [...rows, ...missingFixedRows];
}

export default async function CelestialBodiesPage() {
  const rows = (await getRows("celestial_bodies")) as CelestialBodyRecord[];
  const fallbackRows = generatedCelestialBodyRows(5) as CelestialBodyRecord[];

  return <CelestialBodyDesigner rows={rows.length ? withFixedSolBodies(rows, fallbackRows) : fallbackRows} />;
}

import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { generatedCelestialBodyRows } from "@/lib/universe/fallback-data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function CelestialBodiesPage() {
  const rows = await getRows("celestial_bodies");

  return (
    <AdminTable
      config={tableConfigs.celestial_bodies}
      initialRows={rows.length ? rows : generatedCelestialBodyRows(5)}
    />
  );
}

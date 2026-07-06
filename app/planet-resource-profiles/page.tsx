import { AdminTable } from "@/components/admin-table";
import { handoffData } from "@/data/handoff";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function PlanetResourceProfilesPage() {
  const rows = await getRows("planet_resource_profiles");
  return <AdminTable config={tableConfigs.planet_resource_profiles} initialRows={rows.length ? rows : handoffData.planet_resource_profiles} />;
}

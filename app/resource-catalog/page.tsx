import { AdminTable } from "@/components/admin-table";
import { handoffData } from "@/data/handoff";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function ResourceCatalogPage() {
  const rows = await getRows("resource_catalog");
  return <AdminTable config={tableConfigs.resource_catalog} initialRows={rows.length ? rows : handoffData.resource_catalog} />;
}

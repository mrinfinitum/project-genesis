import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function FeatureFlagsPage() {
  const rows = await getRows("feature_flags");
  return <AdminTable config={tableConfigs.feature_flags} initialRows={rows} />;
}

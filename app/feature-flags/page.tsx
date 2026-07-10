import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function FeatureFlagsPage() {
  const rows = await getRows("feature_flags");
  return (
    <DataWorkspace
      config={tableConfigs.feature_flags}
      initialRows={rows}
      eyebrow="Studio Controls"
      title="Feature Flags"
      description="Launch-phase controls for enabling, disabling, and sequencing major game systems."
      intent="Scan feature state and launch phase as cards; use the raw editor for direct flag maintenance."
    />
  );
}

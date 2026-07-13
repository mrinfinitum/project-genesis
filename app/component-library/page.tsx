import { ComponentLibraryWorkspace } from "@/components/component-library-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getComponentLibraryState } from "@/lib/component-library";

export const dynamic = "force-dynamic";

export default async function ComponentLibraryPage() {
  const assetState = await getAssetProductionState();
  const state = await getComponentLibraryState(assetState);
  return <ComponentLibraryWorkspace state={state} />;
}

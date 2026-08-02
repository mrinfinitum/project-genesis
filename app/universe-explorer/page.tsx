import { UniverseExplorerWorkspace } from "@/components/universe-explorer-workspace";
import { buildBaseGameRuntimeData } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export default async function UniverseExplorerPage() {
  const runtime = await buildBaseGameRuntimeData();
  if (!runtime.identityRelationshipGraph) {
    throw new Error("Canonical identity and relationship graph is unavailable.");
  }

  return <UniverseExplorerWorkspace graph={runtime.identityRelationshipGraph} />;
}

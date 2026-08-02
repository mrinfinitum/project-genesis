import { IdentityRelationshipWorkspace } from "@/components/identity-relationship-workspace";
import { buildBaseGameRuntimeData } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export default async function IdentityRelationshipsPage() {
  const runtime = await buildBaseGameRuntimeData();
  if (!runtime.identityRelationshipGraph) {
    throw new Error("Canonical identity and relationship graph is unavailable.");
  }

  return <IdentityRelationshipWorkspace graph={runtime.identityRelationshipGraph} />;
}

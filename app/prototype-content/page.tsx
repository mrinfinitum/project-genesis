import { PrototypeContentWorkspace } from "@/components/prototype-content-workspace";
import { getPrototypeSnapshotState } from "@/lib/game-content/prototype";

export const dynamic = "force-dynamic";

export default async function PrototypeContentPage() {
  const state = await getPrototypeSnapshotState();
  return <PrototypeContentWorkspace initialState={state} />;
}

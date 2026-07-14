import { ArchitectureWorkspace } from "@/components/architecture-workspace";
import { getArchitectureState } from "@/lib/architecture";

export const dynamic = "force-dynamic";

export default async function ArchitecturePage() {
  const state = await getArchitectureState();
  return <ArchitectureWorkspace state={state} />;
}

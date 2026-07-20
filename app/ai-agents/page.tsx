import { AiAgentsLibrary } from "@/components/ai-agents-library";
import { getAiAgentLibraryState } from "@/lib/ai-agents";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

type AiAgentSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AiAgentsPage({ searchParams }: { searchParams?: AiAgentSearchParams }) {
  const params = await searchParams;
  const assetState = await getAssetProductionState();
  const state = await getAiAgentLibraryState(assetState);
  return <AiAgentsLibrary state={state} activeSection={firstParam(params?.section) ?? "library"} activeEntry={firstParam(params?.entry)} />;
}

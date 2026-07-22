import { AiAgentsLibrary } from "@/components/ai-agents-library";
import { getAiAgentBrowserState } from "@/lib/ai-agents/browser";

type AiAgentSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AiAgentsPage({ searchParams }: { searchParams?: AiAgentSearchParams }) {
  const params = await searchParams;
  const activeEntry = firstParam(params?.entry);
  const state = getAiAgentBrowserState(activeEntry);
  return <AiAgentsLibrary state={state} activeSection={firstParam(params?.section) ?? "library"} activeEntry={activeEntry} />;
}

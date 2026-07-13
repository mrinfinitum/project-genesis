import { ContentAuthoringWorkspace } from "@/components/content-authoring-workspace";
import { getContentAuthoringState } from "@/lib/content-authoring/store";

export const dynamic = "force-dynamic";

export default async function ContentAuthoringPage() {
  const state = await getContentAuthoringState();
  return <ContentAuthoringWorkspace initialState={state} />;
}

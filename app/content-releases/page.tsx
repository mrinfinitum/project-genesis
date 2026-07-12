import { ContentReleasesWorkspace } from "@/components/content-releases-workspace";
import { listContentReleases } from "@/lib/game-content/publishing";

export const dynamic = "force-dynamic";

export default async function ContentReleasesPage() {
  const state = await listContentReleases();
  return <ContentReleasesWorkspace initialState={state} />;
}

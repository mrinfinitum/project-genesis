import { ExperienceBibleWorkspace } from "@/components/experience-bible-workspace";
import { getExperienceBibleState } from "@/lib/experience-design";

export const dynamic = "force-dynamic";

export default function ExperienceBibleVersionsPage() {
  return <ExperienceBibleWorkspace state={getExperienceBibleState()} mode="versions" />;
}

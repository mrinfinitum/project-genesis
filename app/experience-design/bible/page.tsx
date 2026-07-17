import { ExperienceBibleWorkspace } from "@/components/experience-bible-workspace";
import { getExperienceBibleState } from "@/lib/experience-design";

export const dynamic = "force-dynamic";

export default function ExperienceBiblePage() {
  return <ExperienceBibleWorkspace state={getExperienceBibleState()} />;
}

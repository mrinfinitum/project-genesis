import { ExperienceDesignWorkspace } from "@/components/experience-design-workspace";
import { getExperienceDesignState } from "@/lib/experience-design";

export const dynamic = "force-dynamic";

export default function ExperienceDesignPage() {
  return <ExperienceDesignWorkspace state={getExperienceDesignState()} />;
}

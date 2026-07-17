import { ExperienceDesignWorkspace } from "@/components/experience-design-workspace";
import { getExperienceDesignState } from "@/lib/experience-design";
import { getInspirationWallManifest } from "@/lib/experience-design/inspiration-wall";

export const dynamic = "force-dynamic";

export default async function ExperienceDesignPage() {
  const inspirationWall = await getInspirationWallManifest();
  return <ExperienceDesignWorkspace state={getExperienceDesignState()} inspirationWall={inspirationWall} />;
}

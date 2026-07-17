import { notFound, redirect } from "next/navigation";
import { ExperienceDesignWorkspace } from "@/components/experience-design-workspace";
import { getExperienceDesignState } from "@/lib/experience-design";
import { getInspirationWallManifest } from "@/lib/experience-design/inspiration-wall";

export const dynamic = "force-dynamic";

export default async function ExperienceDesignSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const state = getExperienceDesignState();

  if (section === "mood-boards" || section === "inspiration-boards" || section === "canvas") {
    redirect("/experience-design/inspiration-wall");
  }

  if (!state.sections.some((item) => item.id === section)) {
    notFound();
  }

  const inspirationWall = section === "inspiration-wall" ? await getInspirationWallManifest() : undefined;

  return <ExperienceDesignWorkspace state={state} initialSection={section} inspirationWall={inspirationWall} />;
}

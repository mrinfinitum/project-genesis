import { notFound } from "next/navigation";
import { ExperienceDesignWorkspace } from "@/components/experience-design-workspace";
import { getExperienceDesignState } from "@/lib/experience-design";

export const dynamic = "force-dynamic";

export default async function ExperienceDesignSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const state = getExperienceDesignState();

  if (!state.sections.some((item) => item.id === section)) {
    notFound();
  }

  return <ExperienceDesignWorkspace state={state} initialSection={section} />;
}

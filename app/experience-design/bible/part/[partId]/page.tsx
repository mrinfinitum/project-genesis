import { notFound } from "next/navigation";
import { ExperienceBibleWorkspace } from "@/components/experience-bible-workspace";
import { getExperienceBiblePart, getExperienceBibleState } from "@/lib/experience-design";

export const dynamic = "force-dynamic";

export default async function ExperienceBiblePartPage({ params }: { params: Promise<{ partId: string }> }) {
  const { partId } = await params;
  const state = getExperienceBibleState();

  if (!getExperienceBiblePart(partId)) {
    notFound();
  }

  return <ExperienceBibleWorkspace state={state} mode="part" partId={partId} />;
}

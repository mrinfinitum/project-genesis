import { notFound } from "next/navigation";
import { ExperienceBibleWorkspace } from "@/components/experience-bible-workspace";
import { getExperienceBibleChapter, getExperienceBibleState } from "@/lib/experience-design";

export const dynamic = "force-dynamic";

export default async function ExperienceBibleChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const state = getExperienceBibleState();
  const chapter = getExperienceBibleChapter(chapterId);

  if (!chapter) {
    notFound();
  }

  return <ExperienceBibleWorkspace state={state} mode="chapter" chapter={chapter} />;
}

import { notFound } from "next/navigation";
import { RenderProfileDetail } from "@/components/production/render-library-workspace";
import { getRenderProfileBySlug, renderProfilesLibrary } from "@/lib/production/render-library";

export function generateStaticParams() {
  return renderProfilesLibrary.map((profile) => ({ profileId: profile.slug }));
}

export default async function RenderProfilePage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params;
  const profile = getRenderProfileBySlug(profileId);
  if (!profile) notFound();
  return <RenderProfileDetail profile={profile} />;
}

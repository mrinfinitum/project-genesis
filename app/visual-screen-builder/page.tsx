import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DeprecatedVisualScreenBuilderRedirect({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const screenId = firstParam(params?.screenId) ?? firstParam(params?.screen) ?? firstParam(params?.id);
  const area = firstParam(params?.area);
  const category = firstParam(params?.category);
  const next = new URLSearchParams({ deprecated: "visual-builder" });

  if (category) next.set("category", category);

  if (screenId) {
    redirect(`/screen-designer/${encodeURIComponent(screenId)}?${next.toString()}`);
  }

  if (area) {
    next.set("area", area);
    redirect(`/creative-production?${next.toString()}`);
  }

  redirect("/creative-production?deprecated=visual-builder");
}

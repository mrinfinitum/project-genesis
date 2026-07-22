import { AssetContentBrowser } from "@/components/asset-content-browser";
import { getAssetLibraryBrowserState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function AssetLibraryPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const folder = Array.isArray(params?.folder) ? params?.folder[0] : params?.folder;
  const category = Array.isArray(params?.category) ? params?.category[0] : params?.category;
  const section = Array.isArray(params?.section) ? params?.section[0] : params?.section;
  const state = await getAssetLibraryBrowserState();
  return <AssetContentBrowser state={state} initialNode={folder ?? category ?? section ?? null} />;
}

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const areaToCategory: Record<string, string> = {
  "top-hud": "top-hud",
  "left-navigation": "left-navigation",
  research: "research-ui",
  buildings: "buildings-ui",
  upgrades: "upgrade-categories",
  "ai-agents": "ai-agents",
  discovery: "discovery",
  encyclopedia: "encyclopedia",
  civilizations: "encyclopedia",
  galaxies: "galaxy-ui",
  galaxy: "galaxy-ui",
  sectors: "galaxy-ui",
  "star-systems": "galaxy-ui",
  stars: "galaxy-ui",
  planets: "planet-ui",
  planet: "planet-ui",
  settings: "settings-ui",
  "login-account": "login-ui",
  login: "login-ui",
  loading: "loading-ui",
  icons: "icons",
  backgrounds: "backgrounds",
  illustrations: "illustrations",
  animations: "animations",
  audio: "audio",
  video: "video"
};

function redirectTarget(params: Record<string, string | string[] | undefined>) {
  const area = firstParam(params.area);
  const category = firstParam(params.category) ?? (area ? areaToCategory[area] : null);
  const next = new URLSearchParams();
  next.set("deprecated", "creative-production");
  if (category) next.set("category", category);
  const classId = firstParam(params.class);
  if (classId) next.set("class", classId);
  return `/assets?${next.toString()}`;
}

export default async function CreativeProductionRedirect({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  redirect(redirectTarget((await searchParams) ?? {}));
}

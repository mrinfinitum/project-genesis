import { AIWorkshop } from "@/components/ai-workshop";
import { getGameData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AIWorkshopPage() {
  const data = await getGameData();

  const sourceRows = {
    generated_planets: data.generated_planets,
    resource_catalog: data.resource_catalog,
    research: data.research,
    buildings: data.buildings,
    upgrades: data.upgrades,
    wonders: data.wonders,
    assets: data.assets,
    conceptual_art: data.conceptual_art,
    planet_render_library: data.planet_render_library
  };

  return <AIWorkshop initialItems={data.ai_inbox} initialTemplates={data.prompt_templates} sourceRows={sourceRows} />;
}

import { PlanetGenerationLibrary } from "@/components/planet-generation-library";
import { PLANET_PROMPT_LIBRARY } from "@/data/planet-generation-prompts";

export default function PlanetGenerationPage() {
  return <PlanetGenerationLibrary rows={PLANET_PROMPT_LIBRARY} />;
}

import { PlanetGenerationLibrary } from "@/components/planet-generation-library";
import { CANONICAL_SOL_PROMPTS } from "@/data/canonical-sol-prompts";
import { PLANET_PROMPT_LIBRARY } from "@/data/planet-generation-prompts";

export default function PromptLibraryPage() {
  return <PlanetGenerationLibrary rows={PLANET_PROMPT_LIBRARY} canonicalSolRows={CANONICAL_SOL_PROMPTS} focus="prompt-library" />;
}

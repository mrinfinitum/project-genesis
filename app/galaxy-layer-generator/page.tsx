import { CosmicGenerationPromptLibrary } from "@/components/cosmic-generation-prompt-library";
import { GALAXY_PROMPT_LIBRARY } from "@/data/cosmic-generation-prompts";

export default function GalaxyLayerGeneratorPage() {
  return (
    <CosmicGenerationPromptLibrary
      title="Handcrafted Galaxy Prompts"
      rows={GALAXY_PROMPT_LIBRARY}
      description="Select a galaxy profile and resolve a concise visual direction for Nano Banana 2. The generated image direction stays separate from the canonical galaxy record."
      searchPlaceholder="Search galaxy prompts"
      allTypesLabel="All galaxy types"
      kind="galaxy"
    />
  );
}

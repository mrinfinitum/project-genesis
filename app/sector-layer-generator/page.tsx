import { CosmicGenerationPromptLibrary } from "@/components/cosmic-generation-prompt-library";
import { GALACTIC_REGION_PROMPT_LIBRARY } from "@/data/cosmic-generation-prompts";

export default function SectorLayerGeneratorPage() {
  return (
    <CosmicGenerationPromptLibrary
      title="Handcrafted Galactic Region Prompts"
      rows={GALACTIC_REGION_PROMPT_LIBRARY}
      description="Select a galactic-region profile and resolve a concise visual direction for Nano Banana 2. The generated image direction stays separate from the canonical region record."
      searchPlaceholder="Search galactic region prompts"
      allTypesLabel="All galactic regions"
      kind="galactic-region"
    />
  );
}

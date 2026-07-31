import { CosmicGenerationPromptLibrary } from "@/components/cosmic-generation-prompt-library";
import { GALACTIC_REGION_MASTER_PROMPT, GALACTIC_REGION_PROMPT_LIBRARY } from "@/data/cosmic-generation-prompts";

export default function SectorLayerGeneratorPage() {
  return (
    <CosmicGenerationPromptLibrary
      title="Handcrafted Galactic Region Prompts"
      masterPrompt={GALACTIC_REGION_MASTER_PROMPT}
      rows={GALACTIC_REGION_PROMPT_LIBRARY}
      description="Handcraft canonical Milky Way region specifications before they enter the generator. Each prompt maps to one of the nine named regions without changing procedural rules."
      authoringRule="A handcrafted galactic region begins as a specification. Galactic Region generation remains authoritative for canonical IDs, seeds, star-system links, and persistence after approval."
      searchPlaceholder="Search galactic region prompts"
      allTypesLabel="All galactic regions"
    />
  );
}

import { CosmicGenerationPromptLibrary } from "@/components/cosmic-generation-prompt-library";
import { GALAXY_MASTER_PROMPT, GALAXY_PROMPT_LIBRARY } from "@/data/cosmic-generation-prompts";

export default function GalaxyLayerGeneratorPage() {
  return (
    <CosmicGenerationPromptLibrary
      title="Handcrafted Galaxy Prompts"
      masterPrompt={GALAXY_MASTER_PROMPT}
      rows={GALAXY_PROMPT_LIBRARY}
      description="Handcraft canonical galaxy concepts before they enter the generator. Each preset establishes one coherent galactic identity without changing procedural rules."
      authoringRule="A handcrafted galaxy begins as a specification. Galaxy generation remains authoritative for canonical IDs, seeds, galactic regions, child links, and persistence after approval."
      searchPlaceholder="Search galaxy prompts"
      allTypesLabel="All galaxy types"
    />
  );
}

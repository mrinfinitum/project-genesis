import { StarSystemGenerationLibrary } from "@/components/star-system-generation-library";
import { STAR_SYSTEM_PROMPT_LIBRARY } from "@/data/star-system-generation-prompts";

export default function StarSystemLayerGeneratorPage() {
  return <StarSystemGenerationLibrary rows={STAR_SYSTEM_PROMPT_LIBRARY} />;
}

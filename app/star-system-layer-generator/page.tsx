import { EnvironmentPaintingGenerator } from "@/components/environment-layer-generator";
import { getEnvironmentGeneratorDefinition } from "@/lib/environment-layer-generators";

export default function StarSystemLayerGeneratorPage() {
  return <EnvironmentPaintingGenerator definition={getEnvironmentGeneratorDefinition("starSystem")} />;
}

import { EnvironmentPaintingGenerator } from "@/components/environment-layer-generator";
import { getEnvironmentGeneratorDefinition } from "@/lib/environment-layer-generators";

export default function GalaxyLayerGeneratorPage() {
  return <EnvironmentPaintingGenerator definition={getEnvironmentGeneratorDefinition("galaxy")} />;
}

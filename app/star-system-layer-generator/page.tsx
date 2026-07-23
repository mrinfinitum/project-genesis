import { EnvironmentLayerGenerator } from "@/components/environment-layer-generator";
import { getEnvironmentGeneratorDefinition } from "@/lib/environment-layer-generators";

export default function StarSystemLayerGeneratorPage() {
  return <EnvironmentLayerGenerator definition={getEnvironmentGeneratorDefinition("starSystem")} />;
}

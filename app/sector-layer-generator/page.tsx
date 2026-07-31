import { EnvironmentPaintingGenerator } from "@/components/environment-layer-generator";
import { getEnvironmentGeneratorDefinition } from "@/lib/environment-layer-generators";

export default function SectorLayerGeneratorPage() {
  return <EnvironmentPaintingGenerator definition={getEnvironmentGeneratorDefinition("sector")} />;
}

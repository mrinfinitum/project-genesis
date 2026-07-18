import { RendererContractEditor } from "@/components/render/renderer-contract-editor";
import { planetRendererContract } from "@/lib/render";

export default function PlanetRendererContractPage() {
  return <RendererContractEditor initialContract={planetRendererContract} />;
}

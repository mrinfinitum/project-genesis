import { InteractiveGalaxyMap } from "@/components/interactive-galaxy-map";
import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";

export default function GalaxyPage() {
  return (
    <div className="space-y-6">
      <ReferenceScreenWorkflow
        featureId="galaxy"
        assetsHref="/asset-library?screen=galaxy"
        componentsHref="/component-library?screen=galaxy"
        handoffHref="/screen-designer/galaxy#handoff"
        screenSpecHref="/screen-designer/galaxy"
      />
      <InteractiveGalaxyMap />
    </div>
  );
}

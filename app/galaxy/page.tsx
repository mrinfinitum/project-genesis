import { GalaxyLibrary } from "@/components/galaxy-command-center";
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
      <GalaxyLibrary />
    </div>
  );
}

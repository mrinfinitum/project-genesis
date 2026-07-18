import { ProductionHeader, ProductionSection } from "@/components/production/production-components";
import { WorkspaceMiniStat } from "@/components/ui/workspace";
import { globalRendererSettings } from "@/lib/render";

export default function RendererSettingsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Render" title="Global Renderer Settings" description="Placeholder settings for future render engine configuration. No paths are executed or validated." />
      <ProductionSection title="Settings">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {globalRendererSettings.map((setting) => <WorkspaceMiniStat key={setting.label} label={setting.label} value={setting.value} />)}
        </div>
      </ProductionSection>
    </main>
  );
}

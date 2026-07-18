import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { exportProfiles } from "@/lib/production";

export default function ExportProfilesPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader title="Export Profiles" description="Reference output profiles for authoring tools, public derivatives, and future engine targets." />
      <ProductionCardGrid>
        {exportProfiles.map((profile) => (
          <ProductionReferenceCard
            key={profile.id}
            title={profile.title}
            description={profile.description}
            badge={profile.output}
            copyText={`${profile.title}\n${profile.description}\nOutput: ${profile.output}\nNotes: ${profile.notes}`}
          />
        ))}
      </ProductionCardGrid>
    </main>
  );
}

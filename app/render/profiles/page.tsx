import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { formatRenderProfile, renderProfiles } from "@/lib/render";

export default function RenderProfilesPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Render" title="Render Profiles" description="Recommended render targets for external render engines. Profiles are documentation only." />
      <ProductionCardGrid>
        {renderProfiles.map((profile) => (
          <ProductionReferenceCard key={profile.id} title={profile.title} description={`Resolution ${profile.resolution}; LOD ${profile.lod}.`} badge={profile.format} copyText={formatRenderProfile(profile)}>
            <p className="text-xs font-bold text-cyan-100">{profile.maps.join(", ")}</p>
          </ProductionReferenceCard>
        ))}
      </ProductionCardGrid>
    </main>
  );
}

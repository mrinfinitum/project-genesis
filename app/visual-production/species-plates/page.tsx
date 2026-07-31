import { SpeciesPlateWorkspace } from "@/components/species-plate-workspace";
import { speciesPlateSourceFromCreature } from "@/lib/species-plates/adapters";
import type { SpeciesPlateDomain } from "@/lib/species-plates/types";
import { canonicalSpecies } from "@/lib/life/creature-system";

const validDomains = new Set<SpeciesPlateDomain>(["creature", "plant", "fungi", "microorganism", "exotic-life", "comparative", "ecosystem"]);
export default async function SpeciesPlatesPage({ searchParams }: { searchParams: Promise<{ domain?: string; source?: string }> }) {
  const { domain, source } = await searchParams;
  const canonicalSource = source ? canonicalSpecies.find((item) => item.id === source) : undefined;
  const initialSource = canonicalSource ? speciesPlateSourceFromCreature(canonicalSource) : undefined;
  return <SpeciesPlateWorkspace initialDomain={initialSource?.domain ?? (domain && validDomains.has(domain as SpeciesPlateDomain) ? domain as SpeciesPlateDomain : "creature")} initialSource={initialSource} />;
}

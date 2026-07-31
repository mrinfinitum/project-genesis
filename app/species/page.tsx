import { SpeciesLibrary } from "@/components/species-library";
import { canonicalSpecies } from "@/lib/life/creature-system";

export default function SpeciesPage() { return <SpeciesLibrary species={canonicalSpecies} />; }

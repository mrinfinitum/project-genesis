import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function DiscoveryLibraryPage() {
  return (
    <GeneratedUniverseLibrary
      kind="discoveries"
      title="Discovery Journal"
      description="Browse discovery journal records and exploration history references that can be linked back to canonical curiosity definitions."
      generateLabel="Generate Journal Entry"
      records={getUniverseLibraryRecords("discoveries")}
      emptyMessage="No discovery journal records yet."
    />
  );
}

import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function DiscoveryLibraryPage() {
  return (
    <GeneratedUniverseLibrary
      kind="discoveries"
      title="Discovery Library"
      description="Manage canonical discovery definitions that can be referenced by Game runtime and encyclopedia systems."
      generateLabel="Generate Discovery"
      records={getUniverseLibraryRecords("discoveries")}
      emptyMessage="No canonical discoveries yet."
    />
  );
}

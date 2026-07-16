import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function SectorLibraryPage() {
  return (
    <GeneratedUniverseLibrary
      kind="sectors"
      title="Sector Library"
      description="Manage canonical generated sectors with resolved parent galaxies and export-ready IDs."
      generateLabel="Generate Sector"
      records={getUniverseLibraryRecords("sectors")}
      emptyMessage="No generated sectors yet."
    />
  );
}

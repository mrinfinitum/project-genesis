import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export function SectorLibrary() {
  return (
    <GeneratedUniverseLibrary
      kind="sectors"
      title="Galactic Region Library"
      description="Manage the nine canonical Milky Way Galactic Regions and their generated star systems."
      generateLabel="Generate Galactic Region"
      records={getUniverseLibraryRecords("sectors")}
      emptyMessage="No Galactic Regions have been generated yet."
    />
  );
}

export const SectorMap = SectorLibrary;

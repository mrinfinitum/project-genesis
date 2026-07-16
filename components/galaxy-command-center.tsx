import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export function GalaxyLibrary() {
  return (
    <GeneratedUniverseLibrary
      kind="galaxies"
      title="Galaxy Library"
      description="Manage canonical generated galaxy records that can be exported and consumed by the Game."
      generateLabel="Generate Galaxy"
      records={getUniverseLibraryRecords("galaxies")}
      emptyMessage="No generated galaxies yet."
    />
  );
}

export const GalaxyCommandCenter = GalaxyLibrary;

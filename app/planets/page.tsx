import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function PlanetLibraryPage() {
  return (
    <GeneratedUniverseLibrary
      kind="planets"
      title="Planet Library"
      description="Manage canonical generated planets, moons, and major celestial bodies that belong in the Game."
      generateLabel="Generate Planet"
      records={getUniverseLibraryRecords("planets")}
      emptyMessage="No generated planets or celestial bodies yet."
    />
  );
}

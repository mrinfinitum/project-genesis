import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function StarLibraryPage() {
  return (
    <GeneratedUniverseLibrary
      kind="stars"
      title="Star Library"
      description="Browse generated canonical star records only. Planets, moons, belts, and other celestial bodies live in the Planet Library."
      generateLabel="Generate Star"
      records={getUniverseLibraryRecords("stars")}
      emptyMessage="No generated stars yet."
    />
  );
}

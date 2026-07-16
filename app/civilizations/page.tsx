import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function CivilizationLibraryPage() {
  return (
    <GeneratedUniverseLibrary
      kind="civilizations"
      title="Civilization Library"
      description="Manage canonical generated civilization and faction records with resolved universe parent links."
      generateLabel="Generate Civilization"
      records={getUniverseLibraryRecords("civilizations")}
      emptyMessage="No generated civilizations yet."
    />
  );
}

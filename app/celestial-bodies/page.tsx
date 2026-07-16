import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function StarLibraryPage() {
  return (
    <GeneratedUniverseLibrary
      kind="stars"
      title="Star Library"
      description="Manage canonical generated stars with resolved parent star-system records."
      generateLabel="Generate Star"
      records={getUniverseLibraryRecords("stars")}
      emptyMessage="No generated stars yet."
    />
  );
}

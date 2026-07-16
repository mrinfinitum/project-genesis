import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function StarSystemLibraryPage() {
  return (
    <GeneratedUniverseLibrary
      kind="star-systems"
      title="Star System Library"
      description="Manage canonical generated star systems with resolved sector links and runtime-ready body counts."
      generateLabel="Generate Star System"
      records={getUniverseLibraryRecords("star-systems")}
      emptyMessage="No generated star systems yet."
    />
  );
}

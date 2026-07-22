import { StarSystemBackgroundsWorkspace } from "@/components/star-system-backgrounds-workspace";
import { canonicalStarSystemBackgrounds, starSystemBackgroundTemplateSpec, validateStarSystemBackgroundRecords } from "@/lib/star-system-backgrounds";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export default function StarSystemBackgroundsPage() {
  const systems = getUniverseLibraryRecords("star-systems").map((system) => ({
    id: system.id,
    name: system.name,
    type: system.type,
    readiness: system.readiness
  }));

  return (
    <StarSystemBackgroundsWorkspace
      records={canonicalStarSystemBackgrounds}
      templateSpec={starSystemBackgroundTemplateSpec}
      validationIssues={validateStarSystemBackgroundRecords()}
      systems={systems}
    />
  );
}

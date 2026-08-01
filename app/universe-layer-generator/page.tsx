import { BackgroundLibraryWorkspace } from "@/components/background-library-workspace";
import { backgroundLibraryRecords } from "@/lib/production/backgrounds";

export default function UniverseLayerGeneratorPage() {
  return (
    <BackgroundLibraryWorkspace
      records={backgroundLibraryRecords.filter((record) => record.contextType === "universe")}
      title="Universe Background Generator"
      description="Create one flat, decorative universe painting. Interactive celestial objects and final composition remain owned by Unity."
      initialContext="universe"
      lockedContext
    />
  );
}

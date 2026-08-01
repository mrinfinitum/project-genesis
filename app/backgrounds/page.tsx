import { BackgroundLibraryWorkspace } from "@/components/background-library-workspace";
import { backgroundLibraryRecords } from "@/lib/production/backgrounds";

export default function BackgroundLibraryPage() {
  return <BackgroundLibraryWorkspace records={backgroundLibraryRecords} />;
}

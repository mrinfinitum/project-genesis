import { redirect } from "next/navigation";

export default function RemovedCivilizationLibraryPage() {
  redirect("/encyclopedia?section=civilization");
}

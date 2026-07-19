import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DiscoveryWorkspacePage() {
  redirect("/discovery/biological");
}

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CreativeProductionCatchAllRedirect() {
  redirect("/assets?deprecated=creative-production");
}

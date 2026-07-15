import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DeprecatedGameArtImportPage() {
  redirect("/asset-library?deprecated=game-art-import&section=dashboard");
}

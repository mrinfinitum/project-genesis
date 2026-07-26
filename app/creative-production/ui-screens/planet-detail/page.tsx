import { PlanetDetailScreenWorkspace } from "@/components/planet-detail-screen-workspace";
import { planetDetailScreenRuntimeContract } from "@/lib/assets/planet-detail-screen";
import { auditPlanetDetailScreenSources } from "@/lib/assets/planet-detail-screen-server";

export const dynamic = "force-dynamic";

export default async function PlanetDetailScreenPage() {
  const audit = await auditPlanetDetailScreenSources();
  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6">
      <PlanetDetailScreenWorkspace contract={planetDetailScreenRuntimeContract} audit={audit} />
    </main>
  );
}

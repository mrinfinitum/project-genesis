import Link from "next/link";
import { Database } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export default async function RuntimePage() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const metadata = runtime.metadata;
  const accessLevel = "accessLevel" in metadata && typeof metadata.accessLevel === "string" ? metadata.accessLevel : "studio";

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Runtime & Verification"
        title="Runtime"
        description="Inspect the published canonical runtime contract consumed by game clients and engine exports."
        stats={[
          { label: "Content Version", value: metadata.contentVersion },
          { label: "Schema Version", value: metadata.schemaVersion },
          { label: "Architecture", value: metadata.architectureVersion },
          { label: "Validation", value: metadata.validationStatus }
        ]}
      />

      <WorkspacePanel title="Published Runtime" icon={Database}>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Eras" value={runtime.eras.length} />
          <WorkspaceStatTile label="Resources" value={runtime.resources.length} />
          <WorkspaceStatTile label="Upgrades" value={runtime.upgrades.length} />
          <WorkspaceStatTile label="Assets" value={runtime.assets.length} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <WorkspaceBadge value={metadata.validationStatus} />
          <WorkspaceBadge value={metadata.architectureVersion} />
          <WorkspaceBadge value={accessLevel} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/api/export/game-runtime-data.json" className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">Canonical Runtime JSON</Link>
          <Link href="/api/export/roblox-game-data.json" className="rounded-md border border-slate-600 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-200">Roblox Runtime JSON</Link>
          <Link href="/content-releases" className="rounded-md border border-slate-600 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-200">Content Releases</Link>
        </div>
      </WorkspacePanel>
    </main>
  );
}

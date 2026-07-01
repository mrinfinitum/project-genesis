import Link from "next/link";
import { ArrowRight, Boxes, Building2, Gem, GitBranch, Palette, Sparkles, Wand2 } from "lucide-react";
import { getGameData } from "@/lib/data";
import { StatusBadge } from "@/components/ui/status-badge";

export const dynamic = "force-dynamic";

const dashboardPreviewTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp"]);

function isDashboardPreviewImage(row: { file_type: string; file_url: string }) {
  return Boolean(row.file_url && dashboardPreviewTypes.has(row.file_type));
}

export default async function DashboardPage() {
  const data = await getGameData();
  const readyResearch = data.research.filter((node) => node.status === "Ready").length;
  const readyUnlocks = data.unlock_matrix.filter((row) => ["Ready", "Mapped"].includes(row.implementation_status)).length;
  const enabledFeatureFlags = data.feature_flags.filter((flag) => flag.enabled).length;
  const mappedRelationships = data.building_relationships.filter((row) => row.implementation_status === "Mapped").length;

  const metrics = [
    { label: "Research Nodes", value: data.research.length, icon: Sparkles, href: "/research" },
    { label: "Buildings", value: data.buildings.length, icon: Building2, href: "/buildings" },
    { label: "Upgrades", value: data.upgrades.length, icon: Wand2, href: "/upgrades" },
    { label: "Wonders", value: data.wonders.length, icon: Boxes, href: "/wonders" },
    { label: "Collectibles", value: 0, icon: Gem, href: "/collectibles" },
    { label: "Building Relationships", value: data.building_relationships.length, icon: GitBranch, href: "/building-relationships" },
    { label: "Current Version", value: data.release_notes[0]?.version ?? "0.1.0", icon: Sparkles, href: "/releases" },
    { label: "Feature Flags Enabled", value: `${enabledFeatureFlags}/${data.feature_flags.length}`, icon: ArrowRight, href: "/feature-flags" }
  ];

  const recentChanges = data.changelog.slice(0, 5);
  const newestConceptImages = data.conceptual_art
    .filter(isDashboardPreviewImage)
    .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))
    .slice(0, 6);
  const completion = [
    { label: "Research Ready", value: Math.round((readyResearch / data.research.length) * 100) },
    { label: "Unlocks Implemented", value: Math.round((readyUnlocks / data.unlock_matrix.length) * 100) },
    { label: "Wonder Definitions", value: 100 },
    { label: "Relationship Mapping", value: Math.round((mappedRelationships / data.building_relationships.length) * 100) }
  ];
  const tasks = [
    "Review Sprint 2 relationship blanks and edge cases",
    "Import civilization and planet sheet exports",
    "Map unlock IDs to Roblox module names",
    "Run economy balance pass on v2.2 upgrade costs"
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Genesis Command Layer</p>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-white">Studio Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Internal source of truth for Project Genesis content, progression, assets, and release metadata.
            </p>
          </div>
          <Link
            href="/api/export/all"
            className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-sm text-cyan-100 hover:bg-cyan-300/20"
          >
            Export All JSON
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4 shadow-glow transition hover:border-cyan-300/35"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-300">{metric.label}</span>
                <Icon className="h-4 w-4 text-cyan-200" />
              </div>
              <div className="mt-4 text-3xl font-semibold text-white">{metric.value}</div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-5 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-cyan-200" />
              <h3 className="text-base font-semibold text-white">Newest Concept Art</h3>
            </div>
            <p className="mt-1 text-sm text-slate-400">Latest uploaded visual references and production explorations.</p>
          </div>
          <Link href="/conceptual-art" className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-sm text-cyan-100 hover:bg-cyan-300/20">
            Open Gallery
          </Link>
        </div>

        {newestConceptImages.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {newestConceptImages.map((art) => (
              <Link
                key={art.id}
                href="/conceptual-art"
                className="group overflow-hidden rounded-md border border-cyan-300/10 bg-slate-950/45 transition hover:border-cyan-300/45"
              >
                <div className="aspect-square bg-slate-950/70">
                  <img className="h-full w-full object-cover transition group-hover:scale-[1.03]" src={art.file_url} alt={art.name} />
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-slate-100">{art.name}</p>
                  <p className="mt-1 truncate text-[0.68rem] uppercase tracking-[0.12em] text-slate-500">{art.category || "Concept"}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-slate-700/70 bg-slate-950/35 p-4 text-sm text-slate-400">
            No previewable concept images uploaded yet.
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-5">
          <h3 className="text-base font-semibold text-white">Recent Changes</h3>
          <div className="mt-4 space-y-3">
            {recentChanges.map((change) => (
              <div key={change.id} className="rounded-md border border-slate-700/70 bg-slate-950/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-cyan-100">{change.sheet_or_table}</span>
                  <span className="text-xs text-slate-400">{change.version}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{change.change_summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-5">
          <h3 className="text-base font-semibold text-white">Content Completion</h3>
          <div className="mt-4 space-y-4">
            {completion.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-cyan-100">{item.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-5">
          <h3 className="text-base font-semibold text-white">Next Sprint Tasks</h3>
          <div className="mt-4 space-y-3">
            {tasks.map((task, index) => (
              <div key={task} className="flex items-center gap-3 rounded-md border border-slate-700/70 bg-slate-950/35 p-3">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-cyan-300/20 text-xs text-cyan-200">{index + 1}</span>
                <span className="text-sm text-slate-300">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Phase 1 Content Pulse</h3>
          <StatusBadge value="In Progress" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link href="/api/export/research.json" className="rounded-md border border-slate-700/70 bg-slate-950/35 p-3 text-sm text-cyan-100">
            research.json
          </Link>
          <Link href="/api/export/buildings.json" className="rounded-md border border-slate-700/70 bg-slate-950/35 p-3 text-sm text-cyan-100">
            buildings.json
          </Link>
          <Link href="/api/export/unlock_matrix.json" className="rounded-md border border-slate-700/70 bg-slate-950/35 p-3 text-sm text-cyan-100">
            unlock_matrix.json
          </Link>
          <Link href="/api/export/wonders.json" className="rounded-md border border-slate-700/70 bg-slate-950/35 p-3 text-sm text-cyan-100">
            wonders.json
          </Link>
          <Link href="/api/export/upgrades.json" className="rounded-md border border-slate-700/70 bg-slate-950/35 p-3 text-sm text-cyan-100">
            upgrades.json
          </Link>
          <Link href="/api/export/building_relationships.json" className="rounded-md border border-slate-700/70 bg-slate-950/35 p-3 text-sm text-cyan-100">
            building_relationships.json
          </Link>
        </div>
      </section>
    </div>
  );
}

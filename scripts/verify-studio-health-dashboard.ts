import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { GET } from "@/app/api/studio-health/route";

type HealthMetric = {
  id: "content" | "art" | "exports" | "verification";
  label: string;
  percent: number;
  href: string;
  numerator: number;
  denominator: number;
  tooltip: string;
  details: string[];
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  assert(existsSync(path.join(process.cwd(), "app/api/studio-health/route.ts")), "Studio health API route is missing.");

  const appShell = read("components/app-shell.tsx");
  const healthRoute = read("app/api/studio-health/route.ts");
  const packageJson = JSON.parse(read("package.json")) as { scripts?: Record<string, string> };

  assert(packageJson.scripts?.["verify:studio-health-dashboard"], "verify:studio-health-dashboard script must be registered.");
  assert(appShell.includes('fetch("/api/studio-health")'), "Sidebar must load health metrics from /api/studio-health.");
  assert(appShell.includes("<StudioHealthPanel metrics={healthMetrics} />"), "Sidebar must render the Studio health panel.");
  assert(appShell.includes('href={metric.href}'), "Health metrics must be clickable links.");
  assert(appShell.includes("title={`${metric.tooltip}"), "Health metrics must expose calculation tooltips.");
  assert(appShell.includes("percent >= 100") && appShell.includes("percent >= 75") && appShell.includes("percent >= 50") && appShell.includes("percent >= 25"), "Health color thresholds must match the health-state contract.");
  assert(appShell.includes("STORAGE_SECTIONS_KEY"), "Navigation collapse behavior must remain persisted.");
  assert(appShell.includes("window.localStorage.setItem(STORAGE_SECTIONS_KEY"), "Navigation collapse state must be remembered.");

  for (const stale of ["/api/data/project_systems", "ProjectSystemProgress", "progressForGroup", "fallbackProgress", "systemIds", "completion_percent"]) {
    assert(!appShell.includes(stale), `Sidebar must not use stale arbitrary progress source: ${stale}.`);
  }

  for (const requiredSource of ["getAssetProductionState", "buildGameEngineExport", "buildCanonicalRuntimeExportPayload", "getArchitectureState"]) {
    assert(healthRoute.includes(requiredSource), `Studio health route must derive metrics from real data source: ${requiredSource}.`);
  }

  for (const staleLabel of ["Advanced Systems", "Universe Libraries", "World & Operations", "Creative Production"]) {
    assert(!appShell.includes(staleLabel), `Old arbitrary sidebar group label remains: ${staleLabel}.`);
  }

  const response = await GET();
  assert(response.status === 200, `Studio health route returned HTTP ${response.status}.`);
  const payload = (await response.json()) as { metrics?: HealthMetric[] };
  const metrics = payload.metrics ?? [];
  const expected = [
    { id: "content", label: "Content Readiness", href: "/encyclopedia" },
    { id: "art", label: "Art Production", href: "/asset-library" },
    { id: "exports", label: "Engine Exports", href: "/runtime" },
    { id: "verification", label: "Verification", href: "/validation-engine" }
  ] as const;

  assert(metrics.length === expected.length, `Expected ${expected.length} health metrics; received ${metrics.length}.`);
  for (const requirement of expected) {
    const metric = metrics.find((item) => item.id === requirement.id);
    assert(metric, `Missing health metric ${requirement.id}.`);
    assert(metric.label === requirement.label, `${requirement.id} label mismatch.`);
    assert(metric.href === requirement.href, `${requirement.id} href mismatch.`);
    assert(Number.isInteger(metric.percent) && metric.percent >= 0 && metric.percent <= 100, `${requirement.id} percent must be an integer from 0 to 100.`);
    assert(metric.denominator > 0, `${requirement.id} must have a real denominator.`);
    assert(metric.numerator >= 0 && metric.numerator <= metric.denominator, `${requirement.id} numerator must be within denominator.`);
    assert(metric.tooltip.length > 20, `${requirement.id} tooltip must explain the calculation.`);
    assert(metric.details.length > 0, `${requirement.id} must include metric details.`);
  }

  console.log(JSON.stringify({
    ok: true,
    metrics: Object.fromEntries(metrics.map((metric) => [metric.label, {
      percent: metric.percent,
      numerator: metric.numerator,
      denominator: metric.denominator,
      href: metric.href
    }])),
    oldSidebarProgressRemoved: true,
    collapseState: "preserved"
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

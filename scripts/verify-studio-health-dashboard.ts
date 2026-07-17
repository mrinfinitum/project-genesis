import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { GET } from "@/app/api/studio-health/route";

type HealthMetric = {
  id: "content" | "art";
  label: string;
  percent: number;
  href: string;
  numerator: number;
  denominator: number;
  tooltip: string;
  details: string[];
};

type HealthCheck = {
  id: "exports" | "verification" | "build" | "runtime";
  label: string;
  ok: boolean;
  href: string;
  tooltip: string;
  details: string[];
};

type StudioStatus = {
  studioOnline: boolean;
  contentVersion: number | string;
  architectureVersion: string;
  runtimeReady: boolean;
  gitClean: boolean;
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
  assert(packageJson.scripts?.["verify:sidebar-health"], "verify:sidebar-health script must be registered.");
  assert(packageJson.scripts?.["verify:production-health"], "verify:production-health script must be registered.");
  assert(appShell.includes('fetch("/api/studio-health")'), "Sidebar must load health metrics from /api/studio-health.");
  assert(appShell.includes("<StudioHealthPanel metrics={healthMetrics} checks={healthChecks} status={studioStatus} />"), "Sidebar must render the Studio health panel with status checks.");
  assert(appShell.includes('href={metric.href}'), "Health metrics must be clickable links.");
  assert(appShell.includes('href={check.href}'), "Health status checks must be clickable links.");
  assert(appShell.includes("title={`${metric.tooltip}"), "Health metrics must expose calculation tooltips.");
  assert(appShell.includes("aria-label={`${check.label}:"), "Status checks must have accessible labels.");
  assert(appShell.includes("percent >= 100") && appShell.includes("percent >= 75") && appShell.includes("percent >= 50") && appShell.includes("percent >= 25"), "Health color thresholds must match the health-state contract.");
  assert(appShell.includes("Studio Online"), "Top status must include Studio Online.");
  assert(appShell.includes("Runtime Ready"), "Top status must include Runtime Ready.");
  assert(appShell.includes("Git Clean"), "Top status must include Git Clean.");
  assert(appShell.includes("h-0.5"), "Health indicators must use 2px-style thin progress lines.");
  assert(!appShell.includes("h-2 overflow-hidden rounded-full"), "Large health progress bars must be removed.");
  assert(!appShell.includes("metricValue"), "Exports and Verification must not be converted into percentage-style metric values.");
  assert(!appShell.includes("shadow-glow\">\n      <p className=\"text-xs font-black uppercase tracking-[0.22em]"), "Health panel must not render as a heavy dashboard card.");
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
  const rawPayload = (await response.json()) as { status?: StudioStatus; metrics?: Array<HealthMetric | { id?: string }>; checks?: HealthCheck[] };
  const payload = rawPayload as { status?: StudioStatus; metrics?: HealthMetric[]; checks?: HealthCheck[] };
  assert(payload.status?.studioOnline === true, "Studio Online status must be true when the health endpoint responds.");
  assert(payload.status?.contentVersion !== undefined, "contentVersion status chip source is missing.");
  assert(/^\d+\.\d+\.\d+$/.test(String(payload.status?.architectureVersion)), "architectureVersion status chip must be a semantic version.");
  assert(typeof payload.status?.runtimeReady === "boolean", "Runtime Ready status must be boolean.");
  assert(typeof payload.status?.gitClean === "boolean", "Git Clean status must be boolean.");
  const metrics = payload.metrics ?? [];
  const expected = [
    { id: "content", label: "Content Readiness", href: "/encyclopedia" },
    { id: "art", label: "Art Production", href: "/asset-library" }
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
  assert(!rawPayload.metrics?.some((metric) => metric.id === "exports" || metric.id === "verification"), "Exports and Verification must not be percentage metrics.");

  const checks = payload.checks ?? [];
  const expectedChecks = [
    { id: "exports", href: "/runtime" },
    { id: "verification", href: "/validation-engine" },
    { id: "build", href: "/validation-engine" },
    { id: "runtime", href: "/runtime" }
  ] as const;
  assert(checks.length === expectedChecks.length, `Expected ${expectedChecks.length} status checks; received ${checks.length}.`);
  for (const requirement of expectedChecks) {
    const check = checks.find((item) => item.id === requirement.id);
    assert(check, `Missing health check ${requirement.id}.`);
    assert(check.href === requirement.href, `${requirement.id} href mismatch.`);
    assert(typeof check.ok === "boolean", `${requirement.id} ok must be boolean.`);
    assert(!Object.prototype.hasOwnProperty.call(check, "percent"), `${requirement.id} must not expose a percentage.`);
    assert(check.tooltip.length > 20, `${requirement.id} tooltip must explain the status source.`);
    assert(check.details.length > 0, `${requirement.id} must include status details.`);
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

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getArchitectureState } from "@/lib/architecture";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

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

function percent(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function values(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isMissingDefinition(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return /missing|gap|placeholder|planned|todo|draft/i.test(String(row.status ?? row.publicationStatus ?? row.severity ?? row.type ?? row.id ?? ""));
}

function isGitClean() {
  try {
    return execFileSync("git", ["status", "--short", "--untracked-files=no"], { cwd: process.cwd(), encoding: "utf8" }).trim().length === 0;
  } catch {
    return false;
  }
}

function contentReadiness(canonical: Record<string, unknown>): HealthMetric {
  const moduleKeys = [
    "resources",
    "research",
    "unlock_matrix",
    "building_library",
    "discoveries",
    "civilizations",
    "missions",
    "mission_objectives",
    "factions",
    "galaxies",
    "sectors",
    "star_systems",
    "planets",
    "celestial_bodies"
  ];
  const frameworkKeys = [
    "action_system",
    "population_simulation_framework",
    "dynamic_event_framework",
    "mission_expedition_framework",
    "resource_economy_logistics_framework",
    "colonization_framework",
    "civilization_progression_framework"
  ];
  const published = moduleKeys.reduce((sum, key) => sum + values(canonical[key]).length, 0);
  const frameworkPublished = frameworkKeys.filter((key) => Boolean(canonical[key])).length;
  const missing = Object.values(canonical).reduce<number>((sum, value) => {
    if (Array.isArray(value)) return sum + value.filter(isMissingDefinition).length;
    if (value && typeof value === "object") {
      return sum + Object.values(value as Record<string, unknown>).reduce<number>((innerSum, nested) => innerSum + (Array.isArray(nested) ? nested.filter(isMissingDefinition).length : 0), 0);
    }
    return sum;
  }, 0);
  const numerator = published + frameworkPublished;
  const denominator = numerator + missing;

  return {
    id: "content",
    label: "Content Readiness",
    percent: percent(numerator, denominator),
    href: "/encyclopedia",
    numerator,
    denominator,
    tooltip: "Published canonical records divided by published plus missing/planned canonical definitions.",
    details: [`${published} published records`, `${frameworkPublished} framework contracts`, `${missing} missing or planned definitions`]
  };
}

async function artProduction(): Promise<HealthMetric> {
  const state = await getAssetProductionState();
  const items = state.assetLibraryInventory.items;
  const required = items.filter((item) => item.status !== "unmapped" && item.status !== "deprecated");
  const ready = required.filter((item) => item.status === "published" || item.status === "approved").length;
  const previewCoverage = state.dashboard.previewReady;
  const previewTotal = state.dashboard.previewReady + state.dashboard.previewMissing + state.dashboard.previewStale;
  const derivativeCoverage = state.dashboard.derivativesComplete;
  const derivativeTotal = state.derivativeProfiles.reduce((sum, profile) => sum + profile.presetIds.length, 0) * Math.max(1, state.dashboard.totalAssets);
  const numerator = ready + previewCoverage + derivativeCoverage;
  const denominator = required.length + previewTotal + derivativeTotal;

  return {
    id: "art",
    label: "Art Production",
    percent: percent(numerator, denominator),
    href: "/asset-library",
    numerator,
    denominator,
    tooltip: "Approved or published assets plus preview and derivative coverage divided by required production assets and derivative work.",
    details: [
      `${state.dashboard.published} published assets`,
      `${state.dashboard.approved} approved assets`,
      `${state.dashboard.missingAssets} missing requirements`,
      `${state.dashboard.previewReady}/${previewTotal} previews ready`,
      `${state.dashboard.derivativesComplete}/${derivativeTotal} derivatives complete`
    ]
  };
}

async function engineExportCheck(): Promise<HealthCheck> {
  const targets: EngineTarget[] = ["generic", "web", "roblox", "unity", "unreal", "godot"];
  const [runtime, ...exports] = await Promise.all([
    buildCanonicalRuntimeExportPayload(),
    ...targets.map((target) => buildGameEngineExport(target))
  ]);
  const readyExports = exports.filter((engineExport) => engineExport.validation.status === "Ready").length;
  const runtimeReady = runtime.metadata.validationStatus === "Ready";
  const ok = readyExports === targets.length && runtimeReady;

  return {
    id: "exports",
    label: ok ? "All Engine Exports Ready" : "Export Warning",
    ok,
    href: "/runtime",
    tooltip: "All six engine exports and the canonical runtime must validate as Ready.",
    details: [`${readyExports}/${targets.length} engine exports Ready`, `Runtime ${runtime.metadata.validationStatus}`, `Content v${runtime.metadata.contentVersion}`]
  };
}

async function verificationCheck(): Promise<HealthCheck> {
  const [runtime, architecture, assets, generic, web, roblox, unity, unreal, godot] = await Promise.all([
    buildCanonicalRuntimeExportPayload(),
    getArchitectureState(),
    getAssetProductionState(),
    buildGameEngineExport("generic"),
    buildGameEngineExport("web"),
    buildGameEngineExport("roblox"),
    buildGameEngineExport("unity"),
    buildGameEngineExport("unreal"),
    buildGameEngineExport("godot")
  ]);
  const checks = [
    { label: "Runtime Ready", ok: runtime.metadata.validationStatus === "Ready" },
    { label: "Architecture Contract", ok: /^\d+\.\d+\.\d+$/.test(architecture.architectureVersion.current) },
    { label: "Asset Library", ok: assets.assetLibraryInventory.duplicateSemanticKeys.length === 0 },
    { label: "Creative Production Routing", ok: existsSync(path.join(process.cwd(), "app", "creative-production", "page.tsx")) },
    { label: "Dependencies", ok: assets.assetLibraryInventory.items.length > 0 && runtime.resources.length > 0 },
    { label: "Exports", ok: [generic, web, roblox, unity, unreal, godot].every((engineExport) => engineExport.validation.status === "Ready") }
  ];
  const ok = checks.every((check) => check.ok);

  return {
    id: "verification",
    label: ok ? "Verification Passing" : "Verification Failing",
    ok,
    href: "/validation-engine",
    tooltip: "Registered Studio validation signals must all pass.",
    details: checks.map((check) => `${check.ok ? "Ready" : "Needs work"}: ${check.label}`)
  };
}

async function runtimeCheck(): Promise<HealthCheck> {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const ok = runtime.metadata.validationStatus === "Ready";
  return {
    id: "runtime",
    label: ok ? "Runtime Ready" : "Runtime Failing",
    ok,
    href: "/runtime",
    tooltip: "Canonical runtime metadata validation status.",
    details: [`Runtime ${runtime.metadata.validationStatus}`, `Content v${runtime.metadata.contentVersion}`, `Schema ${runtime.metadata.schemaVersion}`]
  };
}

function buildCheck(): HealthCheck {
  const ok = existsSync(path.join(process.cwd(), ".next", "BUILD_ID"));
  return {
    id: "build",
    label: ok ? "Build Passing" : "Build Not Verified",
    ok,
    href: "/validation-engine",
    tooltip: "A recent Next.js production build artifact must exist.",
    details: [ok ? "Build artifact found" : "Run npm run build to refresh verification"]
  };
}

async function studioStatus(): Promise<StudioStatus> {
  const [runtime, architecture] = await Promise.all([
    buildCanonicalRuntimeExportPayload(),
    getArchitectureState()
  ]);

  return {
    studioOnline: true,
    contentVersion: runtime.metadata.contentVersion,
    architectureVersion: architecture.architectureVersion.current,
    runtimeReady: runtime.metadata.validationStatus === "Ready",
    gitClean: isGitClean()
  };
}

export async function GET() {
  const [contentExport, art, exportsStatus, verificationStatus, runtimeStatus, status] = await Promise.all([
    buildGameEngineExport("generic"),
    artProduction(),
    engineExportCheck(),
    verificationCheck(),
    runtimeCheck(),
    studioStatus()
  ]);
  const content = contentReadiness(contentExport.canonical as Record<string, unknown>);
  const buildStatus = buildCheck();
  const generatedAt = new Date().toISOString();
  const metrics = [content, art];
  const checks = [exportsStatus, verificationStatus, buildStatus, runtimeStatus];

  return NextResponse.json({ generatedAt, status, metrics, checks });
}

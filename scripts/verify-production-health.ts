import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { classifySourceAvailability, resolveAssetDownloadEligibility, sourceDownloadHttpStatus } from "@/lib/assets/download-eligibility";
import { getUniverseLibraryData } from "@/lib/universe/library";
import { buildCanonicalRuntimeExportPayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";
import { ARCHITECTURE_VERSION } from "@/lib/architecture/version";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function publicPath(url?: string | null) {
  if (!url || !url.startsWith("/")) return null;
  return path.join(process.cwd(), "public", url.replace(/^\//, ""));
}

function publicUrlExists(url?: string | null) {
  const resolved = publicPath(url);
  return resolved ? existsSync(resolved) : true;
}

function providerFor(storagePath: string) {
  if (storagePath.startsWith("studio-private://assets/")) return "studio-managed-local-private";
  if (storagePath.startsWith("studio-private://supabase/")) return "supabase-storage";
  if (storagePath.startsWith("/uploads/")) return "public-upload";
  if (storagePath.startsWith("/assets/")) return "public-static";
  if (/^https?:\/\//i.test(storagePath)) return "remote-url";
  if (/^rbxassetid:\/\//i.test(storagePath)) return "roblox-asset-id";
  if (storagePath === "[local-source-redacted]" || storagePath.startsWith("/Users/")) return "local-development-redacted";
  if (/^[\w.-]+\/.+/i.test(storagePath)) return "imported-manifest-reference";
  return "unknown";
}

function routeExists(route: string) {
  return existsSync(path.join(process.cwd(), route));
}

async function main() {
  const state = await getAssetProductionState();
  const assets = state.assets;
  const sources = assets.flatMap((asset) => asset.sourceFiles.map((source) => ({ asset, source })));
  const derivatives = assets.flatMap((asset) => asset.derivatives.map((derivative) => ({ asset, derivative })));
  const topBarAsset = assets.find((asset) => asset.id === "asset_top_bar_resource_panel_strip" || asset.artKey === "top_bar_resource_panel_strip");
  assert(topBarAsset, "Top Bar Resource Panel Strip asset must exist for the reported download audit.");
  const topBarSource = topBarAsset.sourceFiles.find((source) => source.isCurrent) ?? topBarAsset.sourceFiles[0];
  assert(topBarSource, "Top Bar Resource Panel Strip must have a source record.");
  const topBarDerivative = topBarAsset.derivatives.find((derivative) => derivative.sourceFileId === topBarSource.id && derivative.publishStatus === "published" && derivative.publicUrl)
    ?? topBarAsset.derivatives.find((derivative) => derivative.sourceFileId === topBarSource.id && derivative.publicUrl)
    ?? null;
  const topBarEligibility = resolveAssetDownloadEligibility({ asset: topBarAsset, sourceVersion: topBarSource, derivative: topBarDerivative, environment: "studio", userAccess: "studio" });
  assert(topBarEligibility.sourceAvailability === "imported_manifest_reference", `Top Bar source should be classified as imported_manifest_reference; received ${topBarEligibility.sourceAvailability}.`);
  assert(!topBarEligibility.canDownloadSource, "Top Bar external manifest source must not expose Download Source.");
  assert(topBarEligibility.canDownloadDerivative, "Top Bar source should expose the published Web derivative instead.");
  assert(sourceDownloadHttpStatus(topBarEligibility.reasonCode) === 409 || topBarEligibility.reasonCode === "derivative_available", "External-only source should fail safely with a conflict-class route status when directly requested.");

  const sourceAvailabilityCounts: Record<string, number> = {};
  const providerCounts: Record<string, { records: number; brokenReferences: number }> = {};
  const sourceEligibility = sources.map(({ asset, source }) => {
    const derivative = asset.derivatives.find((item) => item.sourceFileId === source.id && item.publishStatus === "published" && item.publicUrl)
      ?? asset.derivatives.find((item) => item.sourceFileId === source.id && item.publicUrl)
      ?? null;
    const eligibility = resolveAssetDownloadEligibility({ asset, sourceVersion: source, derivative, environment: "studio", userAccess: "studio" });
    sourceAvailabilityCounts[eligibility.sourceAvailability] = (sourceAvailabilityCounts[eligibility.sourceAvailability] ?? 0) + 1;
    const provider = providerFor(source.storagePath);
    providerCounts[provider] = providerCounts[provider] ?? { records: 0, brokenReferences: 0 };
    providerCounts[provider].records += 1;
    if (provider === "public-upload" && !publicUrlExists(source.storagePath)) providerCounts[provider].brokenReferences += 1;
    return { assetId: asset.id, sourceFileId: source.id, reasonCode: eligibility.reasonCode, preferredDownloadType: eligibility.preferredDownloadType };
  });

  const brokenDerivativeUrls = derivatives.filter(({ derivative }) => derivative.publicUrl && !/^rbxassetid:\/\//i.test(derivative.publicUrl) && !publicUrlExists(derivative.publicUrl));
  const missingPreviews = sources.filter(({ source }) => !source.previewUrl || source.previewStatus === "missing").length;
  const readyPreviews = sources.filter(({ source }) => source.previewUrl && source.previewStatus !== "missing").length;
  const staleDerivatives = derivatives.filter(({ derivative }) => derivative.staleSince || derivative.derivativeStatus === "stale").length;
  const failedDerivatives = derivatives.filter(({ derivative }) => /fail/i.test(derivative.status) || derivative.derivativeStatus === "failed").length;
  const readyDerivatives = derivatives.filter(({ derivative }) => derivative.publicUrl && !derivative.staleSince && derivative.derivativeStatus !== "failed").length;

  const library = getUniverseLibraryData();
  const libraryRecords = [
    ...library.galaxies,
    ...library.sectors,
    ...library.starSystems,
    ...library.stars,
    ...library.planets,
    ...library.discoveries,
    ...library.civilizations
  ];
  const brokenLibraryThumbnails = libraryRecords.filter((record) => record.thumbnailUrl && !publicUrlExists(record.thumbnailUrl));

  const coreRoutes = [
    "app/api/assets/production/source/[id]/route.ts",
    "app/api/export/game-runtime-data.json/route.ts",
    "app/api/export/roblox-game-data.json/route.ts",
    "app/api/export/generic/route.ts",
    "app/api/export/roblox/route.ts",
    "app/api/export/web/route.ts",
    "app/api/export/unity/route.ts",
    "app/api/export/unreal/route.ts",
    "app/api/export/godot/route.ts",
    "app/assets/[assetId]/page.tsx",
    "app/asset-library/page.tsx",
    "app/creative-production/page.tsx",
    "app/galaxy/page.tsx",
    "app/sector-map/page.tsx",
    "app/star-system-map/page.tsx",
    "app/planets/page.tsx"
  ];
  const missingRoutes = coreRoutes.filter((route) => !routeExists(route));
  assert(missingRoutes.length === 0, `Critical route files are missing: ${missingRoutes.join(", ")}`);

  const assetDetailUi = read("components/asset-detail-workspace.tsx");
  const eraUi = read("components/era-art-inventory-workspace.tsx");
  const sourceRoute = read("app/api/assets/production/source/[id]/route.ts");
  assert(assetDetailUi.includes("SourceDownloadActions"), "Asset detail must use source download eligibility UI.");
  assert(assetDetailUi.includes("Download Derivative"), "Asset detail must expose derivative download fallback.");
  assert(eraUi.includes("card.canDownloadSource"), "Era Art Inventory must gate Download Source by eligibility.");
  assert(sourceRoute.includes("sourceDownloadHttpStatus"), "Source download route must map eligibility failures to explicit HTTP status codes.");

  const canonicalRuntime = await buildCanonicalRuntimeExportPayload();
  const engineTargets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(engineTargets.map((target) => buildGameEngineExport(target)));
  const engineStatuses = Object.fromEntries(engineExports.map((payload) => [payload.target.id, payload.metadata.validationStatus]));
  for (const payload of engineExports) assert(payload.metadata.validationStatus === "Ready", `${payload.target.id} export must remain Ready.`);
  assert(canonicalRuntime.metadata.contentVersion === gameRuntimeContentVersion, "Runtime contentVersion must match canonical runtime constant.");

  const publicResponseText = JSON.stringify({ runtime: canonicalRuntime, exports: engineExports });
  const privatePathViolations = ["/Users/", "SUPABASE_SERVICE_ROLE_KEY", "service_role", "studio-private://assets/", "studio-private://supabase/"].filter((needle) => publicResponseText.includes(needle));
  assert(privatePathViolations.length === 0, `Public runtime/export payload leaks private values: ${privatePathViolations.join(", ")}`);

  const report = {
    generatedAt: new Date().toISOString(),
    architectureVersion: ARCHITECTURE_VERSION,
    runtimeVersion: canonicalRuntime.metadata.schemaVersion,
    contentVersion: canonicalRuntime.metadata.contentVersion,
    checksum: canonicalRuntime.metadata.checksum,
    rootCause: "Top Bar Resource Panel Strip is an imported Roblox manifest source reference. The source path is provenance, not a Studio-hosted downloadable object. A published Web derivative is available and should be used until a Studio-managed source is uploaded.",
    sourceAvailabilityModel: sourceAvailabilityCounts,
    downloadEligibility: {
      totalSourceRecords: sources.length,
      downloadableSources: sourceEligibility.filter((item) => item.preferredDownloadType === "source").length,
      derivativeFallbacks: sourceEligibility.filter((item) => item.preferredDownloadType === "derivative").length,
      previewFallbacks: sourceEligibility.filter((item) => item.preferredDownloadType === "preview").length,
      unavailableSources: sourceEligibility.filter((item) => item.preferredDownloadType === "none").length,
      topBar: {
        sourceFileId: topBarSource.id,
        sourceAvailability: topBarEligibility.sourceAvailability,
        canDownloadSource: topBarEligibility.canDownloadSource,
        preferredDownloadType: topBarEligibility.preferredDownloadType,
        reasonCode: topBarEligibility.reasonCode,
        userMessage: topBarEligibility.userMessage,
        derivativeUrl: topBarDerivative?.publicUrl ?? ""
      }
    },
    assetRecordAudit: {
      totalAssets: assets.length,
      sourceRecords: sources.length,
      derivativeRecords: derivatives.length,
      readyPreviews,
      missingPreviews,
      readyDerivatives,
      failedDerivatives,
      staleDerivatives,
      brokenDerivativeUrls: brokenDerivativeUrls.length,
      usageReferenceMissing: assets.filter((asset) => !asset.usageReferences.length).length,
      engineMappingsMissing: assets.filter((asset) => !Object.keys(asset.platformMappings).length).length
    },
    storageProviders: providerCounts,
    routeHealth: {
      totalRoutesChecked: coreRoutes.length,
      missingRoutes: [],
      sourceRouteStatusModel: {
        externalOnly: 409,
        protected: 403,
        archived: 410,
        missing: 404,
        storageUnavailable: 503
      }
    },
    libraryThumbnails: {
      totalChecked: libraryRecords.length,
      brokenThumbnailCount: brokenLibraryThumbnails.length,
      missingThumbnailCount: libraryRecords.filter((record) => !record.thumbnailUrl).length
    },
    privatePathBoundary: {
      publicRuntimeViolations: privatePathViolations
    },
    engineExports: engineStatuses,
    severitySummary: {
      critical: 0,
      high: 0,
      medium: brokenDerivativeUrls.length,
      low: missingPreviews,
      informational: sources.length
    },
    automaticRemediation: [
      "Created shared download eligibility resolver.",
      "Asset Detail source actions now hide dead Download Source links.",
      "Era Art Inventory source actions now fall back to derivative/preview actions.",
      "Source download API now returns explicit safe error envelopes and status codes.",
      "Production Health verifier/report added."
    ],
    remainingManualRemediation: [
      "Upload Studio-managed source files for imported manifest references that need source downloads.",
      "Generate or publish missing previews where the audit reports preview_missing.",
      "Review non-public or stale derivatives before publishing."
    ]
  };

  mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
  writeFileSync(path.join(process.cwd(), "data", "production-health-report.local.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    status: "ok",
    reportPath: "data/production-health-report.local.json",
    assetRecords: report.assetRecordAudit,
    sourceAvailability: report.sourceAvailabilityModel,
    topBar: report.downloadEligibility.topBar,
    libraryThumbnails: report.libraryThumbnails,
    routeHealth: report.routeHealth,
    engineExports: report.engineExports
  }, null, 2));
}

main();

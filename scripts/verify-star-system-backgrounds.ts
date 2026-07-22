import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { galaxyEnginePresentationContract, validateGalaxyEnginePresentationContract } from "@/lib/runtime/galaxy-engine-contract";
import { canonicalStarSystemBackgrounds, starSystemBackgroundTemplateSpec, validateStarSystemBackgroundRecords } from "@/lib/star-system-backgrounds";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function main() {
  const recordIssues = validateStarSystemBackgroundRecords();
  const recordErrors = recordIssues.filter((issue) => issue.severity === "error");
  assert(recordErrors.length === 0, `Star-system background records have blocking validation errors: ${recordErrors.map((issue) => issue.code).join(", ")}`);

  assert(starSystemBackgroundTemplateSpec.masterDesktop.width === 7680, "PSD template must publish the 7680px master desktop width.");
  assert(starSystemBackgroundTemplateSpec.minimumDesktop.width === 3840, "PSD template must publish the 3840px minimum desktop width.");
  assert(starSystemBackgroundTemplateSpec.requiredLayerGroups.includes("00_GUIDES_DO_NOT_EXPORT"), "PSD template must include required guide layer groups.");
  assert(canonicalStarSystemBackgrounds.every((record) => record.sourceFormat === "psd"), "Every authoring record must retain PSD as the source format.");

  const contractIssues = validateGalaxyEnginePresentationContract(galaxyEnginePresentationContract);
  const contractErrors = contractIssues.filter((issue) => issue.severity === "error");
  assert(contractErrors.length === 0, `Galaxy Engine contract has blocking errors: ${contractErrors.map((issue) => issue.code).join(", ")}`);
  assert(galaxyEnginePresentationContract.starSystemVisualProfiles.length >= 1, "Galaxy Engine contract must publish star-system visual profiles.");
  assert(galaxyEnginePresentationContract.starSystemVisualProfiles.every((profile) => profile.backgroundMode === "procedural" || Boolean(profile.starSystemBackgroundId)), "Authored/hybrid visual profiles must resolve a background asset.");

  const serializedPublicBackgrounds = JSON.stringify(galaxyEnginePresentationContract.starSystemBackgrounds);
  assert(!/\.psd|\/Users\/|studio-private:\/\//i.test(serializedPublicBackgrounds), "Public background contract must not expose PSD files or private paths.");

  buildCanonicalRuntimeExportPayload().then((runtime) => {
    assert(runtime.metadata.contentVersion >= 52, "Runtime contentVersion must include the star-system background contract migration.");
    assert(runtime.galaxyEngineContract.starSystemBackgroundTemplate.id === "star_system_background_psd_template_v1", "Runtime must publish the PSD template contract.");
    assert(runtime.galaxyEngineContract.starSystemVisualProfiles.length === galaxyEnginePresentationContract.starSystemVisualProfiles.length, "Runtime must publish deterministic star-system visual profiles.");
    assert(!/\.psd|\/Users\/|studio-private:\/\//i.test(JSON.stringify(runtime.galaxyEngineContract.starSystemBackgrounds)), "Runtime export must not leak PSD source paths.");
    console.log(JSON.stringify({
      status: "Ready",
      contentVersion: runtime.metadata.contentVersion,
      checksum: runtime.metadata.checksum,
      backgroundRecords: canonicalStarSystemBackgrounds.length,
      publishedRuntimeBackgrounds: runtime.galaxyEngineContract.starSystemBackgrounds.length,
      visualProfiles: runtime.galaxyEngineContract.starSystemVisualProfiles.length,
      warnings: recordIssues.filter((issue) => issue.severity === "warning").length,
      infos: recordIssues.filter((issue) => issue.severity === "info").length
    }, null, 2));
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

main();

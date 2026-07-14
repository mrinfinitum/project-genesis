import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getComponentLibraryState } from "@/lib/component-library";
import { buildGameEngineExport } from "@/lib/export/game-engine";
import { primaryHudEconomyIds } from "@/lib/economy/definitions";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { mobileAssetRequirements } from "@/lib/runtime/mobile-client-profiles";
import { getScreenDesignerState } from "@/lib/screen-designer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertNoPrivateLeak(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/\/Users\/|studio-private:\/\/|SUPABASE|SERVICE_ROLE|PRIVATE_KEY|clientSecret|apiKey|storeSecret/i.test(text), `${label} leaked a private path or secret marker.`);
}

async function main() {
  const [runtime, assetState] = await Promise.all([
    buildCanonicalRuntimeExportPayload(),
    getAssetProductionState()
  ]);
  const [screenState, componentState] = await Promise.all([
    getScreenDesignerState(assetState),
    getComponentLibraryState(assetState)
  ]);
  const genericExport = await buildGameEngineExport("generic");

  for (const profileName of ["ios", "android"] as const) {
    const profile = runtime.clientProfiles[profileName];
    assert(profile, `Missing clientProfiles.${profileName}.`);
    assert(profile.platform === profileName, `${profileName} platform marker is invalid.`);
    assert(profile.orientation?.primary === "landscape", `${profileName} must be landscape-first.`);
    assert(profile.orientation?.supported.includes("landscape-left") && profile.orientation.supported.includes("landscape-right"), `${profileName} must support both landscape directions.`);
    assert((profile.supportedDeviceClasses?.length ?? 0) >= 5, `${profileName} must expose phone/tablet device classes.`);
    assert(profile.safeAreaPolicy?.supportsCameraCutout && profile.safeAreaPolicy.supportsHomeIndicator, `${profileName} safe-area policy must cover cutouts and home indicators.`);
    assert((profile.touchProfile?.minimumTouchTarget ?? 0) >= 44, `${profileName} touch target is too small.`);
    assert((profile.hudProfile?.economyOrder ?? []).join("|") === primaryHudEconomyIds.join("|"), `${profileName} mobile HUD order must remain canonical.`);
    assert(profile.primaryHudResources?.join("|") === primaryHudEconomyIds.join("|"), `${profileName} profile HUD resources must remain canonical.`);
    assert(profile.primaryHudSlots?.map((slot) => slot.economyId).join("|") === primaryHudEconomyIds.join("|"), `${profileName} profile HUD slots must remain canonical.`);
    assert((profile.assetDensityProfile?.requiredScales ?? []).join("|") === "1x|2x|3x", `${profileName} asset density profile must include 1x/2x/3x.`);
    assert(profile.authenticationProfile?.accountDeletionTracked === true, `${profileName} must track account deletion readiness.`);
    assert(profile.authenticationProfile?.secretsExported === false, `${profileName} auth profile must not export secrets.`);
    assert(profile.purchaseProfile?.purchaseVerificationRequired === true, `${profileName} purchase profile must require verification.`);
    assert(profile.purchaseProfile?.serverAuthoritative === true, `${profileName} Premium Crystals must remain server-authoritative.`);
    assert(profile.purchaseProfile?.secretsExported === false, `${profileName} purchase profile must not export secrets.`);
    assert((profile.mobileAssetRequirements?.length ?? 0) >= mobileAssetRequirements.length, `${profileName} mobile asset requirements are incomplete.`);
    assertNoPrivateLeak(`${profileName} profile`, profile);
  }

  const screenIds = new Set(screenState.records.map((screen) => screen.screenId));
  for (const screenId of ["welcome", "login", "signup", "loading", "dashboard", "settings", "account", "cloud-saves", "save-conflict"]) {
    assert(screenIds.has(screenId), `Missing mobile Screen Designer record: ${screenId}.`);
  }
  assert(screenState.records.every((screen) => screen.mobileReadiness), "Every screen must expose mobile readiness metadata.");
  assert(screenState.records.every((screen) => screen.implementationTargets.some((target) => target.target === "iOS") && screen.implementationTargets.some((target) => target.target === "Android")), "Every screen must track iOS and Android implementation targets.");
  assert(screenState.stats.safeAreaBlockers >= 1, "Mobile safe-area blockers should be tracked.");
  assert(screenState.stats.touchBlockers >= 1, "Mobile touch blockers should be tracked.");
  assert(screenState.stats.accountDeletionReadiness >= 1, "Account deletion readiness should be tracked through Account/Settings screens.");

  const componentIds = new Set(componentState.records.map((component) => component.componentId));
  for (const componentId of ["TopHudBar", "SideNavigationRail", "ImageBackedActionButton", "ClickPowerControl", "AutoClickControl", "BottomDrawer", "Modal", "SettingsNavigation", "PlayerProfileCard", "EconomyCounter", "SaveConflictCard"]) {
    assert(componentIds.has(componentId), `Missing mobile Component Library record: ${componentId}.`);
  }
  assert(componentState.records.every((component) => component.mobileReadiness.minimumTouchTarget >= 44), "Every component must expose mobile touch target metadata.");
  assert(componentState.records.every((component) => component.implementationTargets.some((target) => target.target === "iOS") && component.implementationTargets.some((target) => target.target === "Android")), "Every component must track iOS and Android implementation targets.");
  assert(componentState.stats.touchBlockers >= 1, "Component touch blockers should be tracked.");

  assert(genericExport.validation.status === "Ready", `Generic export validation must remain Ready; got ${genericExport.validation.status}.`);
  assert(Boolean(genericExport.canonical.client_profiles), "Generic export must include client_profiles.");
  assert(Boolean((genericExport.canonical.client_profiles as Record<string, unknown>).ios), "Generic export must include client_profiles.ios.");
  assert(Boolean((genericExport.canonical.client_profiles as Record<string, unknown>).android), "Generic export must include client_profiles.android.");
  assert((genericExport.canonical.mobile_asset_requirements as unknown[]).length >= mobileAssetRequirements.length, "Generic export must include mobile asset requirements.");
  assertNoPrivateLeak("runtime mobile profiles", runtime.clientProfiles);
  assertNoPrivateLeak("generic mobile profiles", genericExport.canonical.client_profiles);

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    schemaVersion: runtime.metadata.schemaVersion,
    validationStatus: runtime.metadata.validationStatus,
    iosOrientation: runtime.clientProfiles.ios.orientation?.primary,
    androidOrientation: runtime.clientProfiles.android.orientation?.primary,
    deviceClasses: runtime.clientProfiles.ios.supportedDeviceClasses?.map((item) => item.id),
    mobileAssetRequirements: mobileAssetRequirements.length,
    screenMobileStats: {
      mobileReadyScreens: screenState.stats.mobileReadyScreens,
      safeAreaBlockers: screenState.stats.safeAreaBlockers,
      touchBlockers: screenState.stats.touchBlockers,
      iosBlockers: screenState.stats.iosBlockers,
      androidBlockers: screenState.stats.androidBlockers,
      accountDeletionReadiness: screenState.stats.accountDeletionReadiness
    },
    componentMobileStats: {
      mobileReadyComponents: componentState.stats.mobileReadyComponents,
      touchBlockers: componentState.stats.touchBlockers,
      safeAreaBlockers: componentState.stats.safeAreaBlockers,
      iosBlockers: componentState.stats.iosBlockers,
      androidBlockers: componentState.stats.androidBlockers
    },
    genericExportValidation: genericExport.validation.status
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

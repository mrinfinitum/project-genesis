import { primaryHudEconomyIds } from "@/lib/economy/definitions";
import type { ClientProfile, MobileAssetRequirement } from "@/types/runtime";

export const mobileDeviceClasses = [
  {
    id: "phone_compact",
    minimumLogicalWidth: 667,
    minimumLogicalHeight: 320,
    targetAspectRange: "1.78-2.25",
    hudScale: 0.82,
    typographyScale: 0.9,
    touchScale: 1,
    safeAreaPadding: { top: 20, right: 20, bottom: 20, left: 20 },
    compactLayoutRules: ["Collapse left navigation into menu button.", "Move right-column panels into drawers.", "Show current and next era only in compact journey."]
  },
  {
    id: "phone_standard",
    minimumLogicalWidth: 736,
    minimumLogicalHeight: 360,
    targetAspectRange: "1.78-2.35",
    hudScale: 0.88,
    typographyScale: 0.95,
    touchScale: 1,
    safeAreaPadding: { top: 22, right: 22, bottom: 24, left: 22 },
    compactLayoutRules: ["Use compact HUD labels.", "Keep upgrades in touch-friendly rows.", "Use bottom drawer for boosts and settings."]
  },
  {
    id: "phone_large",
    minimumLogicalWidth: 812,
    minimumLogicalHeight: 375,
    targetAspectRange: "1.78-2.4",
    hudScale: 0.94,
    typographyScale: 1,
    touchScale: 1.05,
    safeAreaPadding: { top: 24, right: 24, bottom: 26, left: 24 },
    compactLayoutRules: ["Allow slim side navigation.", "Keep critical stats visible when space permits.", "Use drawers for dense right-column content."]
  },
  {
    id: "tablet_standard",
    minimumLogicalWidth: 1024,
    minimumLogicalHeight: 640,
    targetAspectRange: "1.33-1.78",
    hudScale: 1,
    typographyScale: 1.05,
    touchScale: 1.05,
    safeAreaPadding: { top: 24, right: 24, bottom: 24, left: 24 },
    compactLayoutRules: ["Use tablet split panels.", "Keep fixed HUD order visible.", "Allow compact right column."]
  },
  {
    id: "tablet_large",
    minimumLogicalWidth: 1180,
    minimumLogicalHeight: 740,
    targetAspectRange: "1.33-1.78",
    hudScale: 1.08,
    typographyScale: 1.08,
    touchScale: 1.08,
    safeAreaPadding: { top: 28, right: 28, bottom: 28, left: 28 },
    compactLayoutRules: ["Use near-desktop density with touch sizing.", "Keep hero and current journey visible.", "Avoid unreadable compressed labels."]
  }
] as const;

export const mobileAssetRequirements: MobileAssetRequirement[] = [
  { id: "mobile_app_icon", label: "NOVERIS app icon", category: "app_icon", status: "Pending Source Art", requiredFor: ["ios", "android"], notes: "Use NOVERIS branding. Do not generate final store artwork unless source art exists." },
  { id: "mobile_android_adaptive_icon", label: "Android adaptive icon", category: "app_icon", status: "Pending Source Art", requiredFor: ["android"], notes: "Foreground/background layers required for Google Play." },
  { id: "mobile_ios_icon_set", label: "iOS app icon set", category: "app_icon", status: "Pending Source Art", requiredFor: ["ios"], notes: "Generate from approved master only." },
  { id: "mobile_splash_screen", label: "Splash screen", category: "launch", status: "Pending Source Art", requiredFor: ["ios", "android"], notes: "NOVERIS / The Future We Build." },
  { id: "mobile_launch_background", label: "Launch background", category: "launch", status: "Pending Source Art", requiredFor: ["ios", "android"], notes: "Safe for notches, rounded corners, and home indicators." },
  { id: "mobile_noveris_wordmark", label: "NOVERIS wordmark", category: "brand", status: "Pending Source Art", requiredFor: ["ios", "android", "web"], notes: "Canonical product name asset." },
  { id: "mobile_loading_screen", label: "Mobile loading screen", category: "loading", status: "Pending Source Art", requiredFor: ["ios", "android"], notes: "Use approved derivatives only." },
  { id: "mobile_login_background", label: "Login background", category: "account", status: "Pending Source Art", requiredFor: ["ios", "android"], notes: "Portrait may be approved for account/login only later." },
  { id: "mobile_store_feature_graphic", label: "Google Play feature graphic", category: "store", status: "Pending Source Art", requiredFor: ["android"], notes: "Store-art requirement only; not runtime gameplay content." },
  { id: "mobile_app_store_screenshots", label: "App Store screenshots", category: "store", status: "Pending Source Art", requiredFor: ["ios"], notes: "Capture from approved mobile UI when ready." },
  { id: "mobile_google_play_screenshots", label: "Google Play screenshots", category: "store", status: "Pending Source Art", requiredFor: ["android"], notes: "Capture from approved mobile UI when ready." }
];

const mobileHudProfile = {
  economyOrder: [...primaryHudEconomyIds],
  iconSize: 24,
  valueSize: 15,
  rateSize: 11,
  slotWidth: 116,
  slotCompression: "compact_numbers" as const,
  compactNumberFormatting: true,
  labelVisibility: "optional" as const,
  overflowBehavior: "Preserve all five economies; compress labels and values before moving overflow into an accessible drawer.",
  minimumTouchTarget: 48,
  rightSideUtilitySpacing: 12
};

const safeAreaPolicy = {
  supportsTopInset: true,
  supportsRightInset: true,
  supportsBottomInset: true,
  supportsLeftInset: true,
  supportsCameraCutout: true,
  supportsRoundedCorners: true,
  supportsHomeIndicator: true,
  supportsAndroidDisplayCutouts: true,
  criticalControlSafeZone: "Essential buttons, HUD values, and purchase/account controls must stay inside safe bounds.",
  decorativeOverflowAllowance: "Hero art, glows, particles, and background decoration may overflow when clipped safely.",
  minimumEdgePadding: 16,
  modalSafeBounds: "Insets plus 24 logical px on phones, 32 logical px on tablets.",
  bottomDrawerSafeOffset: 28,
  topHudSafeOffset: 20,
  notes: "No essential control may sit beneath a notch, camera island, rounded corner, or home indicator."
};

const touchProfile = {
  minimumTouchTarget: 48,
  touchPadding: 8,
  tapFeedback: "Immediate pressed state with audio/haptic hooks optional per client settings.",
  longPressBehavior: "Secondary details or tooltip; never required for essential actions.",
  dragThreshold: 8,
  swipeThreshold: 36,
  doubleTapPolicy: "Reserved for explicit zoom/inspect surfaces only.",
  hoverFallback: "All hover-only detail must also open on tap/focus.",
  tooltipActivation: "Tap info icon, focus, or long-press on nonessential metadata.",
  gestureConflictRules: ["Click Power tap wins over panel swipe.", "Drawers consume vertical swipes only from drag handles.", "Era rail horizontal gestures must not block core tap actions."]
};

const assetDensityProfile = {
  requiredScales: ["1x", "2x", "3x"] as const,
  preferredFormats: ["WebP", "PNG", "JPG", "SVG"] as const,
  sourcePolicy: "Generate mobile derivatives from canonical PSD/PSB/SVG/AI masters when available.",
  lowResolutionPolicy: "Do not upscale low-resolution Roblox PNGs; mark low-resolution warning and request source art.",
  derivativeRules: [
    { scale: "1x" as const, maxDimension: 512, compression: "balanced" },
    { scale: "2x" as const, maxDimension: 1024, compression: "balanced" },
    { scale: "3x" as const, maxDimension: 1536, compression: "quality" }
  ]
};

export function buildMobileClientProfile(platform: "ios" | "android", base: ClientProfile): ClientProfile {
  const isIos = platform === "ios";
  return {
    ...base,
    platform,
    orientation: {
      primary: "landscape",
      supported: ["landscape-left", "landscape-right"],
      portraitAllowedScreens: ["welcome", "login", "signup", "account", "legal"],
      notes: "Main dashboard gameplay is landscape only. Portrait may be approved later for account, login, or legal screens."
    },
    canonicalDesignSize: { width: 1920, height: 1080, unit: "logical_px" },
    scalingMode: "responsive_safe_area_fit",
    supportedDeviceClasses: mobileDeviceClasses.map((item) => ({
      ...item,
      safeAreaPadding: { ...item.safeAreaPadding },
      compactLayoutRules: [...item.compactLayoutRules]
    })),
    safeAreaPolicy,
    hudProfile: mobileHudProfile,
    navigationProfile: {
      leftNavigation: "collapsible",
      rightColumn: "drawer_or_compact_panel",
      boosts: "bottom_drawer",
      settings: "modal_or_fullscreen_sheet",
      notes: "Do not shrink desktop density until unreadable; use mobile-specific navigation surfaces."
    },
    touchProfile,
    inputCapabilities: {
      primary: "touch",
      touch: true,
      keyboard: true,
      mouse: true,
      controller: "future_in_progress",
      accessibilitySwitchInput: true
    },
    typographyProfile: {
      minimumReadableSize: 12,
      hudValueSize: 15,
      rateSize: 11,
      panelTitleSize: 18,
      buttonSize: 15,
      descriptionSize: 13,
      modalTitleSize: 20,
      tooltipSize: 12,
      legalAccountSize: 14,
      truncationRules: "Truncate optional metadata only; never truncate essential economy values without compact formatting.",
      multilineRules: "Allow descriptions and legal/account copy to wrap.",
      compactNumberFormatting: true,
      dynamicTypePolicy: "Respect accessibility scaling; allow modal/detail screens to scroll."
    },
    effectsProfile: {
      tiers: ["mobile_low", "mobile_standard", "mobile_high", "tablet_high"],
      defaultTier: isIos ? "mobile_high" : "mobile_standard",
      controls: {
        glowIntensity: "scaled_by_tier",
        blur: "reduced_on_mobile_low",
        particles: "limited",
        backgroundAnimation: "tiered",
        ringAnimation: "reduced_motion_aware",
        heroMotion: "subtle",
        shadowComplexity: "tiered",
        simultaneousAnimationCount: isIos ? 8 : 6,
        reducedMotionDefault: false
      }
    },
    assetDensityProfile: {
      ...assetDensityProfile,
      requiredScales: [...assetDensityProfile.requiredScales],
      preferredFormats: [...assetDensityProfile.preferredFormats],
      derivativeRules: assetDensityProfile.derivativeRules.map((rule) => ({ ...rule }))
    },
    lifecycleProfile: {
      events: ["launch", "background", "foreground", "pause", "resume", "interruption", "force_close", "network_lost", "network_restored", "orientation_change"],
      presentationHints: ["save_locally_on_background", "queue_cloud_sync", "pause_animations", "calculate_offline_progress_on_resume"],
      gameplayRuleOwnership: "Client hint only; offline progress rules remain canonical gameplay/service rules."
    },
    authenticationProfile: {
      supportedFlows: ["guest", "email_password", "magic_link", "google_login", "sign_in_with_apple", "account_conversion", "password_reset", "account_deletion", "deep_link_callback", "universal_app_link_callback"],
      signInWithApple: isIos ? "required_for_ios_when_social_login_present" : "available_if_supported",
      secretsExported: false,
      accountDeletionTracked: true
    },
    purchaseProfile: {
      provider: isIos ? "StoreKit" : "Google Play Billing",
      restorePurchases: true,
      acknowledgePurchases: !isIos,
      purchaseVerificationRequired: true,
      premiumEconomyId: "ECON-PREMIUM-CRYSTALS",
      serverAuthoritative: true,
      secretsExported: false
    },
    notificationProfile: {
      optInRequired: true,
      definitions: [
        { id: "production_complete", category: "production", cooldownMinutes: 30, localizationKey: "notification.production_complete", deepLinkDestination: "production" },
        { id: "research_complete", category: "research", cooldownMinutes: 30, localizationKey: "notification.research_complete", deepLinkDestination: "research" },
        { id: "offline_progress_available", category: "progress", cooldownMinutes: 60, localizationKey: "notification.offline_progress", deepLinkDestination: "dashboard" },
        { id: "event_starting", category: "event", cooldownMinutes: 120, localizationKey: "notification.event_starting", deepLinkDestination: "events" },
        { id: "daily_reward", category: "reward", cooldownMinutes: 1440, localizationKey: "notification.daily_reward", deepLinkDestination: "dashboard" },
        { id: "cloud_conflict", category: "account", cooldownMinutes: 0, localizationKey: "notification.cloud_conflict", deepLinkDestination: "cloud-saves" }
      ],
      sendNotificationsInStudio: false
    },
    accessibilityProfile: {
      switchInput: true,
      reducedMotion: true,
      highContrast: true,
      noHoverRequired: true,
      minimumTouchTarget: 48,
      screenReaderLabelsRequired: true
    },
    dashboardLayoutProfile: {
      topHud: "fixed_order_safe_area_aware",
      leftNavigation: "collapsible",
      clickPower: "large_touch_target",
      autoClick: "ai_agent_online_toggle_adjacent_to_labor_action",
      aiAgentPanel: {
        dataSource: "aiAgents",
        selectedIdField: "selectedAiAgentId",
        portraitSize: isIos ? 96 : 88,
        compactPortraitSize: 64,
        touchTarget: 48,
        defaultState: "idle",
        supportedStates: ["idle", "blink", "working", "thinking", "researching", "celebrating", "warning", "offline", "sleeping", "surprised"],
        cropProfiles: ["circular_hud", "panel_portrait", "compact_badge"],
        densityScales: ["1x", "2x", "3x"],
        reducedMotionBehavior: "static_open_eyes",
        offlineTreatment: "desaturate_and_show_agent_offline_label",
        notes: "Player-facing copy should use AI Agent, Labor Assistance, and Agent Online/Offline while preserving internal automation IDs."
      },
      criticalStats: "compact_or_drawer",
      hero: "dominant",
      objective: "compact_panel",
      eraRail: "compact_current_journey",
      upgrades: "touch_friendly_rows",
      rightColumnPanels: "drawer_or_compact_stack",
      boostsDrawer: "bottom_safe_area_drawer",
      settingsModal: "safe_bounds_fullscreen_sheet"
    },
    mobileAssetRequirements
  };
}

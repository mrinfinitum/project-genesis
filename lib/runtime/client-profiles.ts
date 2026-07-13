import type { EraNavigationProfile } from "@/types/runtime";

export const supportedEraNavigationDashboardModes = ["current_journey", "compact_timeline", "full_timeline"] as const;
export const supportedEraNavigationBoundaryModes = ["current_and_next", "previous_current_next", "previous_and_current"] as const;

export const defaultEraNavigationProfile: EraNavigationProfile = {
  dashboardMode: "current_journey",
  visibleEraCount: 3,
  fullTimelineEnabled: true,
  allowPrimaryHorizontalScroll: false,
  boundaryBehavior: {
    firstEraMode: "current_and_next",
    middleEraMode: "previous_current_next",
    lastEraMode: "previous_and_current"
  }
};

export const engineEraNavigationOverrides: Record<"roblox" | "web" | "unity" | "unreal" | "godot", Partial<EraNavigationProfile>> = {
  roblox: { visibleEraCount: 3 },
  web: { visibleEraCount: 3 },
  unity: { visibleEraCount: 3 },
  unreal: { visibleEraCount: 3 },
  godot: { visibleEraCount: 3 }
};

export function resolveEraNavigationProfile(overrides: Partial<EraNavigationProfile> = {}): EraNavigationProfile {
  const boundaryOverrides: Partial<NonNullable<EraNavigationProfile["boundaryBehavior"]>> = overrides.boundaryBehavior ?? {};
  return {
    ...defaultEraNavigationProfile,
    ...overrides,
    boundaryBehavior: {
      firstEraMode: boundaryOverrides.firstEraMode ?? defaultEraNavigationProfile.boundaryBehavior!.firstEraMode,
      middleEraMode: boundaryOverrides.middleEraMode ?? defaultEraNavigationProfile.boundaryBehavior!.middleEraMode,
      lastEraMode: boundaryOverrides.lastEraMode ?? defaultEraNavigationProfile.boundaryBehavior!.lastEraMode
    }
  };
}

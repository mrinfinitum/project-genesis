type EraNavigationHints = {
  dashboardMode?: string;
  visibleEraCount?: number;
  fullTimelineEnabled?: boolean;
  allowPrimaryHorizontalScroll?: boolean;
  boundaryBehavior?: {
    firstEraMode?: string;
    middleEraMode?: string;
    lastEraMode?: string;
  };
};

type RuntimeClientProfile = {
  eraNavigation?: EraNavigationHints;
  primaryHudResources?: string[];
  primaryHudSlots?: Array<{ economyId: string; order: number; showRate: boolean; compactLabel: string; premium: boolean }>;
};

type RuntimePayload = {
  metadata?: { schemaVersion?: string; contentVersion?: number; checksum?: string; accessLevel?: string; validationStatus?: string };
  eras?: Array<{ id: string; index?: number; name?: string; displayName?: string; shortDisplayName?: string }>;
  economyDefinitions?: Array<{ id: string; startingAmount?: number; startingRate?: number; premium?: boolean }>;
  economyUsageRelationships?: { unresolved?: Array<unknown> };
  inventoryResourceMetadata?: Array<{ resourceId: string; classification?: string }>;
  resources?: Array<{ id: string }>;
  upgradeCategories?: Array<{ id: string }>;
  upgrades?: Array<{ id: string; categoryId?: string; tabId?: string; eraId?: string; costResourceId?: string | null; costEconomyId?: string | null }>;
  clientProfiles?: {
    default?: RuntimeClientProfile;
    roblox?: RuntimeClientProfile;
    web?: RuntimeClientProfile;
    unity?: RuntimeClientProfile;
    unreal?: RuntimeClientProfile;
    godot?: RuntimeClientProfile;
  };
};

export {};

type RobloxPayload = RuntimePayload & {
  upgradeTabs?: Array<{ tabId: string }>;
  clientHints?: RuntimeClientProfile;
};

const baseUrl = process.env.PROJECT_GENESIS_STUDIO_URL ?? "http://127.0.0.1:3000";
const token = process.env.PROJECT_GENESIS_EXPORT_TOKEN;

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<{ status: number; payload: T; headers: Headers }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {})
    }
  });
  const text = await response.text();
  let payload = {} as T;
  try {
    payload = (text ? JSON.parse(text) : {}) as T;
  } catch {
    payload = { body: text } as T;
  }
  return { status: response.status, payload, headers: response.headers };
}

function authHeaders(): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {};
}

function validateRuntimeReferences(payload: RuntimePayload) {
  const eraIds = new Set((payload.eras ?? []).map((era) => era.id));
  const resourceIds = new Set((payload.resources ?? []).map((resource) => resource.id));
  const economyIds = new Set((payload.economyDefinitions ?? []).map((definition) => definition.id));
  const categoryIds = new Set((payload.upgradeCategories ?? []).map((category) => category.id));

  for (const upgrade of payload.upgrades ?? []) {
    if (upgrade.categoryId) assert(categoryIds.has(upgrade.categoryId), `Upgrade ${upgrade.id} has unresolved categoryId ${upgrade.categoryId}.`);
    if (upgrade.eraId) assert(eraIds.has(upgrade.eraId), `Upgrade ${upgrade.id} has unresolved eraId ${upgrade.eraId}.`);
    if (upgrade.costResourceId) assert(resourceIds.has(upgrade.costResourceId), `Upgrade ${upgrade.id} has unresolved costResourceId ${upgrade.costResourceId}.`);
    if (upgrade.costEconomyId) assert(economyIds.has(upgrade.costEconomyId), `Upgrade ${upgrade.id} has unresolved costEconomyId ${upgrade.costEconomyId}.`);
  }
}

function validateEconomy(payload: RuntimePayload | RobloxPayload, label: string) {
  const economyDefinitions = payload.economyDefinitions ?? [];
  const economyIds = new Set(economyDefinitions.map((definition) => definition.id));
  const materialIds = new Set((payload.resources ?? []).map((resource) => resource.id));
  const profile = "clientHints" in payload ? payload.clientHints : payload.clientProfiles?.default;
  const expectedHud = ["ECON-CREDITS", "ECON-POPULATION", "ECON-CIVILIZATION-ENERGY", "ECON-RESEARCH", "ECON-PREMIUM-CRYSTALS"];
  const hud = profile?.primaryHudResources ?? [];
  const slots = profile?.primaryHudSlots ?? [];
  const slotOrders = slots.map((slot) => slot.order);

  assert(economyDefinitions.length >= 6, `${label} must include canonical economy definitions.`);
  for (const id of ["ECON-CIVILIZATION-ENERGY", "ECON-CREDITS", "ECON-RESEARCH", "ECON-POPULATION", "ECON-CIVILIZATION-POINTS", "ECON-PREMIUM-CRYSTALS"]) {
    assert(economyIds.has(id), `${label} is missing economy definition ${id}.`);
  }
  assert(hud.join("|") === expectedHud.join("|"), `${label} primaryHudResources order is incorrect: ${hud.join(", ")}.`);
  assert(slots.length === expectedHud.length, `${label} must include slot metadata for every primary HUD economy ID.`);
  assert(new Set(slotOrders).size === slotOrders.length, `${label} HUD slot order values must be unique.`);
  assert(slots.every((slot) => economyIds.has(slot.economyId)), `${label} HUD slot economy IDs must resolve.`);
  assert(hud.every((id) => economyIds.has(id) && !materialIds.has(id)), `${label} HUD IDs must resolve only to economy definitions, not material resources.`);
  assert(economyDefinitions.every((definition) => Number.isFinite(definition.startingAmount) && Number.isFinite(definition.startingRate)), `${label} economy starting amounts and rates must be finite.`);
  assert(economyDefinitions.find((definition) => definition.id === "ECON-PREMIUM-CRYSTALS")?.premium === true, `${label} Premium Crystals must be explicitly premium.`);
  assert((payload.inventoryResourceMetadata?.length ?? 0) > 0, `${label} must include inventory resource metadata for the resources screen.`);
  assert(payload.inventoryResourceMetadata?.every((row) => row.classification === "inventory_resource"), `${label} inventory metadata must be classified as inventory_resource.`);
}

function validateEraNavigation(payload: RuntimePayload | RobloxPayload, label: string) {
  const eras = payload.eras ?? [];
  const eraNames = eras.map((era) => era.displayName ?? era.id);
  const expectedIds = ["survival", "ancient", "medieval", "renaissance", "industrial", "modern", "space-age", "interstellar", "galactic"];
  const eraNavigation = "clientHints" in payload ? payload.clientHints?.eraNavigation : payload.clientProfiles?.default?.eraNavigation;
  const supportedModes = new Set(["current_journey", "compact_timeline", "full_timeline"]);
  const supportedBoundaryModes = new Set(["current_and_next", "previous_current_next", "previous_and_current"]);

  assert(eras.length === 9, `${label} payload must include exactly nine eras; received ${eras.length}.`);
  assert(eraNames.join("|") === "Survival|Ancient|Medieval|Renaissance|Industrial|Modern|Space Age|Interstellar|Galactic", `${label} eras are not in canonical order: ${eraNames.join(", ")}.`);
  assert(eras.map((era) => era.id).join("|") === expectedIds.join("|"), `${label} era IDs are not in canonical order: ${eras.map((era) => era.id).join(", ")}.`);
  assert(eras.every((era, index) => era.index === index + 1), `${label} era indexes must be unique, sequential, and one-based.`);
  assert(eras[3]?.id === "renaissance", `${label} payload is missing Renaissance at position 4.`);
  assert(eras[3]?.index === 4 && eras[3]?.name === "renaissance" && eras[3]?.displayName === "Renaissance" && eras[3]?.shortDisplayName === "Renaissance", `${label} Renaissance record is not canonical.`);
  assert(eras[2]?.id === "medieval" && eras[4]?.id === "industrial", `${label} Renaissance must immediately follow Medieval and precede Industrial.`);
  assert(eras.every((era) => era.shortDisplayName), `${label} every era must expose shortDisplayName.`);
  assert(eras.map((era) => `${era.id}:${era.shortDisplayName}`).join("|") === "survival:Survival|ancient:Ancient|medieval:Medieval|renaissance:Renaissance|industrial:Industrial|modern:Modern|space-age:Space|interstellar:Interstellar|galactic:Galactic", `${label} shortDisplayName values are not canonical.`);
  assert(supportedModes.has(String(eraNavigation?.dashboardMode)), `${label} eraNavigation.dashboardMode is not supported.`);
  assert(eraNavigation?.dashboardMode === "current_journey", `${label} eraNavigation.dashboardMode must be current_journey.`);
  assert(Number.isInteger(eraNavigation?.visibleEraCount) && (eraNavigation?.visibleEraCount ?? 0) > 0 && (eraNavigation?.visibleEraCount ?? 0) <= eras.length, `${label} eraNavigation.visibleEraCount must be a positive integer no larger than era count.`);
  assert(eraNavigation?.visibleEraCount === 3, `${label} eraNavigation.visibleEraCount must be 3.`);
  assert(eraNavigation?.fullTimelineEnabled === true, `${label} eraNavigation.fullTimelineEnabled must be true.`);
  assert(eraNavigation?.allowPrimaryHorizontalScroll === false, `${label} eraNavigation.allowPrimaryHorizontalScroll must be false.`);
  assert(eraNavigation?.boundaryBehavior?.firstEraMode === "current_and_next", `${label} boundary firstEraMode must be current_and_next.`);
  assert(eraNavigation?.boundaryBehavior?.middleEraMode === "previous_current_next", `${label} boundary middleEraMode must be previous_current_next.`);
  assert(eraNavigation?.boundaryBehavior?.lastEraMode === "previous_and_current", `${label} boundary lastEraMode must be previous_and_current.`);
  for (const value of Object.values(eraNavigation?.boundaryBehavior ?? {})) {
    assert(supportedBoundaryModes.has(String(value)), `${label} boundary behavior value is not supported: ${value}.`);
  }

  if (!("clientHints" in payload)) {
    for (const profileName of ["roblox", "web", "unity", "unreal", "godot"] as const) {
      const profileNavigation = payload.clientProfiles?.[profileName]?.eraNavigation;
      assert(profileNavigation?.visibleEraCount === 3, `${label} ${profileName} eraNavigation override must inherit visibleEraCount 3.`);
      assert(profileNavigation?.dashboardMode === "current_journey", `${label} ${profileName} eraNavigation must inherit dashboardMode.`);
      assert(profileNavigation?.boundaryBehavior?.middleEraMode === "previous_current_next", `${label} ${profileName} eraNavigation must inherit boundary behavior.`);
    }
  }
}

function validateRobloxReferences(payload: RobloxPayload) {
  const eraIds = new Set((payload.eras ?? []).map((era) => era.id));
  const resourceIds = new Set((payload.resources ?? []).map((resource) => resource.id));
  const economyIds = new Set((payload.economyDefinitions ?? []).map((definition) => definition.id));
  const tabIds = new Set((payload.upgradeTabs ?? []).map((tab) => tab.tabId));

  assert(payload.upgradeTabs?.length === 4, `Expected exactly four Roblox upgrade tabs; received ${payload.upgradeTabs?.length ?? 0}.`);

  for (const upgrade of payload.upgrades ?? []) {
    assert(upgrade.tabId && tabIds.has(upgrade.tabId), `Upgrade ${upgrade.id} has unresolved tabId ${upgrade.tabId ?? "(missing)"}.`);
    assert(upgrade.eraId && eraIds.has(upgrade.eraId), `Upgrade ${upgrade.id} has unresolved eraId ${upgrade.eraId ?? "(missing)"}.`);
    if (upgrade.costResourceId) assert(resourceIds.has(upgrade.costResourceId), `Upgrade ${upgrade.id} has unresolved costResourceId ${upgrade.costResourceId}.`);
    if (upgrade.costEconomyId) assert(economyIds.has(upgrade.costEconomyId), `Upgrade ${upgrade.id} has unresolved costEconomyId ${upgrade.costEconomyId}.`);
  }
}

async function main() {
  const canonical = await requestJson<RuntimePayload>("/api/export/game-runtime-data.json");
  const roblox = await requestJson<RobloxPayload>("/api/export/roblox-game-data.json");
  const authenticatedCanonical = await requestJson<RuntimePayload>("/api/export/game-runtime-data.json", { headers: authHeaders() });
  const authenticatedRoblox = await requestJson<RobloxPayload>("/api/export/roblox-game-data.json", { headers: authHeaders() });
  const anonymousPublicMutation = await requestJson<Record<string, unknown>>("/api/export/roblox-game-data.json", { method: "POST" });
  const anonymousImportMutation = await requestJson<Record<string, unknown>>("/api/game-runtime/import/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({})
  });
  const anonymousAdmin = await requestJson<Record<string, unknown>>("/api/admin/users");

  assert(canonical.status === 200, `Canonical route returned ${canonical.status}.`);
  assert(roblox.status === 200, `Roblox route returned ${roblox.status}.`);
  assert(authenticatedCanonical.status === 200, `Authenticated canonical route returned ${authenticatedCanonical.status}.`);
  assert(authenticatedRoblox.status === 200, `Authenticated Roblox route returned ${authenticatedRoblox.status}.`);
  assert(anonymousPublicMutation.status >= 400, `Anonymous public route mutation was not rejected; received ${anonymousPublicMutation.status}.`);
  assert(anonymousImportMutation.status >= 400, `Anonymous import mutation was not rejected; received ${anonymousImportMutation.status}.`);
  assert(anonymousAdmin.status >= 400 || anonymousAdmin.status === 307 || anonymousAdmin.status === 308, `Anonymous admin route was not protected; received ${anonymousAdmin.status}.`);
  assert(canonical.payload.metadata?.schemaVersion, "Canonical metadata.schemaVersion is missing.");
  assert(canonical.payload.metadata?.contentVersion, "Canonical metadata.contentVersion is missing.");
  assert(canonical.payload.metadata?.checksum, "Canonical metadata.checksum is missing.");
  assert(canonical.payload.metadata?.accessLevel === "public-published", "Canonical accessLevel must be public-published.");
  assert(canonical.payload.metadata?.validationStatus, "Canonical validation status is missing.");
  assert(roblox.payload.metadata?.schemaVersion, "Roblox metadata.schemaVersion is missing.");
  assert(roblox.payload.metadata?.contentVersion, "Roblox metadata.contentVersion is missing.");
  assert(roblox.payload.metadata?.checksum, "Roblox metadata.checksum is missing.");
  assert(roblox.payload.metadata?.accessLevel === "public-published", "Roblox accessLevel must be public-published.");
  assert(roblox.payload.metadata?.validationStatus, "Roblox validation status is missing.");
  assert((canonical.payload.eras?.length ?? 0) > 0, "Canonical payload must include at least one era.");
  assert((canonical.payload.metadata?.contentVersion ?? 0) >= 2, "Canonical contentVersion must be at least 2 after adding Renaissance.");
  assert((roblox.payload.metadata?.contentVersion ?? 0) >= 2, "Roblox contentVersion must be at least 2 after adding Renaissance.");

  validateEraNavigation(canonical.payload, "Canonical");
  validateEraNavigation(roblox.payload, "Roblox");
  validateEconomy(canonical.payload, "Canonical");
  validateEconomy(roblox.payload, "Roblox");
  validateRuntimeReferences(canonical.payload);
  validateRobloxReferences(roblox.payload);

  console.log(JSON.stringify({
    canonical: {
      status: canonical.status,
      schemaVersion: canonical.payload.metadata?.schemaVersion,
      contentVersion: canonical.payload.metadata?.contentVersion,
      checksum: canonical.payload.metadata?.checksum,
      accessLevel: canonical.payload.metadata?.accessLevel,
      validationStatus: canonical.payload.metadata?.validationStatus,
      cacheControl: canonical.headers.get("cache-control"),
      eraCount: canonical.payload.eras?.length ?? 0,
      economyDefinitionCount: canonical.payload.economyDefinitions?.length ?? 0,
      primaryHudResources: canonical.payload.clientProfiles?.default?.primaryHudResources ?? [],
      resourceCount: canonical.payload.resources?.length ?? 0,
      upgradeCount: canonical.payload.upgrades?.length ?? 0
    },
    roblox: {
      status: roblox.status,
      schemaVersion: roblox.payload.metadata?.schemaVersion,
      contentVersion: roblox.payload.metadata?.contentVersion,
      checksum: roblox.payload.metadata?.checksum,
      accessLevel: roblox.payload.metadata?.accessLevel,
      validationStatus: roblox.payload.metadata?.validationStatus,
      cacheControl: roblox.headers.get("cache-control"),
      eraCount: roblox.payload.eras?.length ?? 0,
      economyDefinitionCount: roblox.payload.economyDefinitions?.length ?? 0,
      primaryHudResources: roblox.payload.clientHints?.primaryHudResources ?? [],
      resourceCount: roblox.payload.resources?.length ?? 0,
      upgradeTabCount: roblox.payload.upgradeTabs?.length ?? 0,
      upgradeCount: roblox.payload.upgrades?.length ?? 0
    },
    protection: {
      authenticatedCanonicalStatus: authenticatedCanonical.status,
      authenticatedRobloxStatus: authenticatedRoblox.status,
      anonymousPublicMutationStatus: anonymousPublicMutation.status,
      anonymousImportMutationStatus: anonymousImportMutation.status,
      anonymousAdminStatus: anonymousAdmin.status
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

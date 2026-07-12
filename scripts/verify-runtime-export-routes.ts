type RuntimePayload = {
  metadata?: { schemaVersion?: string; contentVersion?: number; checksum?: string; accessLevel?: string; validationStatus?: string };
  eras?: Array<{ id: string }>;
  resources?: Array<{ id: string }>;
  upgradeCategories?: Array<{ id: string }>;
  upgrades?: Array<{ id: string; categoryId?: string; tabId?: string; eraId?: string; costResourceId?: string | null }>;
};

export {};

type RobloxPayload = RuntimePayload & {
  upgradeTabs?: Array<{ tabId: string }>;
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
  const categoryIds = new Set((payload.upgradeCategories ?? []).map((category) => category.id));

  for (const upgrade of payload.upgrades ?? []) {
    if (upgrade.categoryId) assert(categoryIds.has(upgrade.categoryId), `Upgrade ${upgrade.id} has unresolved categoryId ${upgrade.categoryId}.`);
    if (upgrade.eraId) assert(eraIds.has(upgrade.eraId), `Upgrade ${upgrade.id} has unresolved eraId ${upgrade.eraId}.`);
    if (upgrade.costResourceId) assert(resourceIds.has(upgrade.costResourceId), `Upgrade ${upgrade.id} has unresolved costResourceId ${upgrade.costResourceId}.`);
  }
}

function validateRobloxReferences(payload: RobloxPayload) {
  const eraIds = new Set((payload.eras ?? []).map((era) => era.id));
  const resourceIds = new Set((payload.resources ?? []).map((resource) => resource.id));
  const tabIds = new Set((payload.upgradeTabs ?? []).map((tab) => tab.tabId));

  assert(payload.upgradeTabs?.length === 4, `Expected exactly four Roblox upgrade tabs; received ${payload.upgradeTabs?.length ?? 0}.`);

  for (const upgrade of payload.upgrades ?? []) {
    assert(upgrade.tabId && tabIds.has(upgrade.tabId), `Upgrade ${upgrade.id} has unresolved tabId ${upgrade.tabId ?? "(missing)"}.`);
    assert(upgrade.eraId && eraIds.has(upgrade.eraId), `Upgrade ${upgrade.id} has unresolved eraId ${upgrade.eraId ?? "(missing)"}.`);
    if (upgrade.costResourceId) assert(resourceIds.has(upgrade.costResourceId), `Upgrade ${upgrade.id} has unresolved costResourceId ${upgrade.costResourceId}.`);
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

export const universalDiscoveryRegistryVersion = "1.0.0";
export const universalDiscoveryIdentitySchemaVersion = "universal-object-id-v1";
export const universeGenerationVersion = "universe-generation-v1";
export const objectGenerationVersion = "object-generation-v1";

export type UniversalDiscoveryEntityType =
  | "galaxy"
  | "sector"
  | "star_system"
  | "star"
  | "planet"
  | "moon"
  | "major_celestial_body"
  | "unique_anomaly"
  | "ruin_site"
  | "unique_artifact"
  | "unique_alien_technology"
  | "unique_lifeform_species"
  | "unique_living_system"
  | "unique_stellar_phenomenon";

export type UniversalDiscoveryMilestoneType =
  | "first_detected"
  | "first_scanned"
  | "first_identified"
  | "first_visited"
  | "first_landed"
  | "first_sampled"
  | "first_artifact_recovered"
  | "first_ruin_completed"
  | "first_colonized"
  | "first_catalogued";

export type UniversalDiscoveryEnvironment = "development" | "staging" | "production" | "seasonal_test";

export type UniversalObjectIdentityInput = {
  environment: UniversalDiscoveryEnvironment;
  universeSeedVersion: string;
  universeId: string;
  galaxyId?: string;
  sectorId?: string;
  starSystemId?: string;
  celestialBodyId?: string;
  localSiteId?: string;
  discoveryEntityType: UniversalDiscoveryEntityType;
  generationVersion: string;
};

export type UniversalDiscoveryClaimInput = {
  requestId: string;
  universalObjectId: string;
  entityType: UniversalDiscoveryEntityType;
  milestoneType: UniversalDiscoveryMilestoneType;
  publicProfileId: string;
  civilizationId: string;
  clientRuntimeVersion: string;
  universeGenerationVersion: string;
  evidenceHash: string;
  serverReceivedAt: string;
};

export type SimulatedUniversalDiscoveryClaimResult = {
  accepted: boolean;
  idempotent: boolean;
  winnerRequestId: string;
  registryId: string;
  universalObjectId: string;
  milestoneType: UniversalDiscoveryMilestoneType;
  publicSummary: string;
};

function cleanSegment(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._:-]+/g, "-").replace(/^-+|-+$/g, "");
}

function pair(label: string, value: string | undefined) {
  const safe = value ? cleanSegment(value) : "";
  return safe ? `${label}:${safe}` : "";
}

export function buildUniversalObjectId(input: UniversalObjectIdentityInput) {
  return [
    pair("env", input.environment),
    pair("schema", universalDiscoveryIdentitySchemaVersion),
    pair("seed", input.universeSeedVersion),
    pair("universe", input.universeId),
    pair("galaxy", input.galaxyId),
    pair("sector", input.sectorId),
    pair("system", input.starSystemId),
    pair("body", input.celestialBodyId),
    pair("site", input.localSiteId),
    pair("type", input.discoveryEntityType),
    pair("generation", input.generationVersion)
  ].filter(Boolean).join("/");
}

export function registryIdForUniversalObject(universalObjectId: string) {
  return `registry:${universalObjectId}`;
}

export const universalDiscoveryEntityTypes: Array<{
  id: UniversalDiscoveryEntityType;
  displayName: string;
  registryEligible: boolean;
  firstDiscoveryEligible: boolean;
  playerNamingEligible: boolean;
  firstScanEligible: boolean;
  firstLandingEligible: boolean;
  firstColonizationEligible: boolean;
  publicAttributionEligible: boolean;
  primaryDiscoveryMilestone: UniversalDiscoveryMilestoneType;
  notes: string;
}> = [
  { id: "galaxy", displayName: "Galaxy", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: false, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_identified", notes: "Production galaxies use stable universe/generation IDs; major story galaxies may protect naming." },
  { id: "sector", displayName: "Sector", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_identified", notes: "Milky Way sectors are generated on demand but keep deterministic IDs." },
  { id: "star_system", displayName: "Star System", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_identified", notes: "Do not use display name as permanent identity." },
  { id: "star", displayName: "Star", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: false, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_scanned", notes: "Stars share system identity plus star object ID for binary/multi-star systems." },
  { id: "planet", displayName: "Planet", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: true, firstColonizationEligible: true, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_identified", notes: "Primary Discovered By label uses first verified identification/meaningful scan, not incidental client load." },
  { id: "moon", displayName: "Moon", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: true, firstColonizationEligible: true, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_identified", notes: "Moon identity includes parent body path and stable moon ID." },
  { id: "major_celestial_body", displayName: "Major Celestial Body", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: true, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_identified", notes: "Large persistent bodies only; not every debris particle." },
  { id: "unique_anomaly", displayName: "Unique Anomaly", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_catalogued", notes: "Only unique/persistent anomalies enter the global registry." },
  { id: "ruin_site", displayName: "Ruin / Site", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: true, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_catalogued", notes: "Ruin completion is tracked as a later milestone." },
  { id: "unique_artifact", displayName: "Unique Artifact", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: false, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_artifact_recovered", notes: "Ordinary duplicate artifacts remain personal collection records." },
  { id: "unique_alien_technology", displayName: "Unique Alien Technology", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: false, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_catalogued", notes: "Protected story tech may hide public attribution." },
  { id: "unique_lifeform_species", displayName: "Unique Lifeform Species", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_identified", notes: "Species identity is taxonomic and not tied to specimen count." },
  { id: "unique_living_system", displayName: "Unique Living System", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_catalogued", notes: "Persistent ecosystem-scale discoveries only." },
  { id: "unique_stellar_phenomenon", displayName: "Unique Stellar Phenomenon", registryEligible: true, firstDiscoveryEligible: true, playerNamingEligible: true, firstScanEligible: true, firstLandingEligible: false, firstColonizationEligible: false, publicAttributionEligible: true, primaryDiscoveryMilestone: "first_catalogued", notes: "Includes rare persistent stellar events, not transient client-only VFX." }
];

export const universalDiscoveryMilestones: Array<{
  id: UniversalDiscoveryMilestoneType;
  displayName: string;
  controlsPrimaryDiscoveryLabel: boolean;
  firstClaimUniqueConstraint: string;
  serverVerified: boolean;
  serverTimestampOnly: boolean;
  rewardReasonCode: string;
  notes: string;
}> = [
  { id: "first_detected", displayName: "First Detected", controlsPrimaryDiscoveryLabel: false, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_DETECTED", notes: "Sensor contact or faint signal. Does not automatically grant Discovered By." },
  { id: "first_scanned", displayName: "First Scanned", controlsPrimaryDiscoveryLabel: false, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_SCANNED", notes: "Completed scan threshold with equipment/progression validation." },
  { id: "first_identified", displayName: "First Identified", controlsPrimaryDiscoveryLabel: true, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_IDENTIFIED", notes: "Primary discovery milestone for planets, systems, sectors, and species." },
  { id: "first_visited", displayName: "First Visited", controlsPrimaryDiscoveryLabel: false, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_VISITED", notes: "Validated travel/contact state." },
  { id: "first_landed", displayName: "First Landed", controlsPrimaryDiscoveryLabel: false, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_LANDED", notes: "Landing milestone for eligible bodies." },
  { id: "first_sampled", displayName: "First Sampled", controlsPrimaryDiscoveryLabel: false, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_SAMPLED", notes: "Physical/resource/specimen sample verified by server." },
  { id: "first_artifact_recovered", displayName: "First Artifact Recovered", controlsPrimaryDiscoveryLabel: true, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_ARTIFACT_RECOVERED", notes: "Primary milestone for unique artifacts." },
  { id: "first_ruin_completed", displayName: "First Ruin Completed", controlsPrimaryDiscoveryLabel: false, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_RUIN_COMPLETED", notes: "Completion/solve state for ruin sites." },
  { id: "first_colonized", displayName: "First Colonized", controlsPrimaryDiscoveryLabel: false, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_COLONIZED", notes: "Civilization milestone, separate from first discovered." },
  { id: "first_catalogued", displayName: "First Catalogued", controlsPrimaryDiscoveryLabel: true, firstClaimUniqueConstraint: "universalObjectId + milestoneType", serverVerified: true, serverTimestampOnly: true, rewardReasonCode: "DISCOVERY_FIRST_CATALOGUED", notes: "Primary milestone for anomalies, ruins, unique phenomena, and special catalog objects." }
];

export const universalDiscoveryNamingPolicy = {
  policyVersion: "naming-policy-v1",
  displayPolicy: "Show current approved public display name where allowed, with discovery-time snapshot preserved in history.",
  safeFallback: "Always render canonicalFallbackName when approvedDisplayName is missing, rejected, blocked, or hidden.",
  eligibleEntityTypes: universalDiscoveryEntityTypes.filter((entityType) => entityType.playerNamingEligible).map((entityType) => entityType.id),
  ineligibleExamples: ["major canonical story objects", "protected historical objects", "licensed content", "quest-critical locations"],
  statuses: ["not_named", "proposed", "pending_review", "approved", "rejected", "auto_blocked", "renamed_by_moderation", "reverted_to_canonical"],
  moderationControls: ["profanity filtering", "impersonation safeguards", "harassment and slur controls", "personally identifying information detection", "trademark and brand policy", "report-name workflow", "moderator override", "audit history"],
  rejectionReasonCodes: ["profanity", "harassment", "personally_identifying_information", "impersonation", "trademark", "story_protected", "spam", "moderator_override"]
};

export const universalDiscoveryPrivacyPolicy = {
  attributionFallback: "Discovered by an Explorer",
  publicProfileControls: ["public discovery attribution enabled", "show current display name", "show civilization", "anonymous attribution", "hide profile link"],
  publicFieldsAllowed: ["public profile ID", "display-name snapshot", "current approved display name", "civilization ID", "civilization snapshot"],
  neverExpose: ["email", "auth user ID", "IP address", "device ID", "internal moderation notes", "security signals", "Supabase keys", "private account identifiers"],
  hiddenAttributionRule: "Do not erase immutable backend ownership when public attribution is hidden."
};

export const universalDiscoveryRecordContract = {
  registryVersion: universalDiscoveryRegistryVersion,
  sanitizedFields: [
    "registryId",
    "universalObjectId",
    "entityType",
    "canonicalObjectId",
    "canonicalFallbackName",
    "approvedDisplayName",
    "discoveryStatus",
    "primaryDiscoveryMilestone",
    "discoveredAt",
    "discoveredByPublicProfileId",
    "discoveredByDisplayNameSnapshot",
    "discoveredByCivilizationId",
    "discoveredByCivilizationNameSnapshot",
    "firstDetectedAt",
    "firstScannedAt",
    "firstVisitedAt",
    "firstLandedAt",
    "firstColonizedAt",
    "namingStatus",
    "moderationStatus",
    "verificationStatus",
    "generationVersion",
    "registryVersion",
    "publicAttribution",
    "discoveryHistorySummary"
  ],
  privateFieldsBlocked: universalDiscoveryPrivacyPolicy.neverExpose,
  canonicalDomains: {
    studioCanon: "Universe/content definitions, eligibility metadata, presentation schema, validation, and runtime contract.",
    gameCanon: "Verified shared player history, first-discovery attribution, approved names, discovery timestamp, and public history."
  }
};

export const universalDiscoveryClaimContract = {
  trustedOperation: "submit_discovery_claim",
  inputFields: ["requestId", "universalObjectId", "entityType", "milestoneType", "playerId", "civilizationId", "clientRuntimeVersion", "universeGenerationVersion", "evidence"],
  requiredBehavior: ["authenticate player", "validate object identity", "verify runtime and generation compatibility", "verify milestone conditions", "perform atomic insert or compare-and-set", "allow exactly one first claimant per milestone", "return winning canonical record", "return already-discovered status to later claimants"],
  concurrencyRules: ["unique constraint on universalObjectId + milestoneType", "transaction or atomic upsert", "deterministic winner based on committed server claim", "losing clients receive existing registry record", "retry-safe idempotency by claim request ID"],
  evidenceTypes: ["generated object seed and hierarchy", "server-known travel state", "scan completion", "required equipment/research", "distance/location validation", "completed interaction", "object generation hash", "gameplay session ID", "anti-cheat signals"],
  clientTrustRule: "Do not trust raw client declarations or client timestamps; server time is authoritative."
};

export const universalDiscoveryOfflinePolicy = {
  privateState: "Offline encounters may appear in the player's private journal.",
  pendingState: "Claims stay pending_verification until submitted online.",
  publicAwardRule: "First-discovery attribution is not guaranteed until server acceptance.",
  reconnectBehavior: "Submit queued claim requests; server returns winner/existing registry record.",
  personalProgressRule: "Player keeps personal discovery progress even if another player wins global first discovery.",
  distinction: "Personal discovery and global first discovery are separate."
};

export const universalDiscoveryHistoryContract = {
  appendOnly: true,
  publicEventTypes: ["discovered", "scanned", "visited", "landed", "named", "renamed", "colonized", "civilization_changed", "important_artifact_recovered", "catalog_entry_expanded"],
  privateEventTypes: ["moderation_action", "security_review", "suspicious_claim_quarantine"],
  publicEntryFields: ["eventType", "occurredAt", "publicActorProfileId", "civilizationId", "publicSummary", "visibility"],
  privateHistoryRule: "Internal moderation history remains private and is not exported by Studio runtime."
};

export const universalDiscoveryPresentationContract = {
  states: ["undiscovered", "personally_discovered_globally_unclaimed", "globally_discovered_by_another_player", "discovered_by_current_player", "pending_verification", "named", "name_pending_review", "hidden_protected_attribution"],
  labels: {
    discoveredBy: "Discovered by",
    namedBy: "Named by",
    firstScannedBy: "First scanned by",
    firstLandedBy: "First landed by",
    firstColonizedBy: "First colonized by",
    fallbackAttribution: universalDiscoveryPrivacyPolicy.attributionFallback,
    unlockPending: "Pending verification"
  },
  journalCategories: ["My Discoveries", "First Discoveries", "Recently Discovered", "Named by Me", "My Civilization's Discoveries", "Nearby Discoveries", "Unverified Offline Discoveries", "Unique Discoveries", "Legendary Discoveries"],
  galactopediaMergeRule: "Client combines Studio canonical content and art with Game registry attribution, naming, dates, and public history."
};

export const universalDiscoveryCivilizationCredit = {
  fields: ["discovering player", "discovering civilization at event time", "civilization contribution", "civilization discovery score", "first civilization to chart", "first civilization to colonize"],
  historicalRule: "If a player later changes civilization, historical credit remains with the civilization at the time of discovery unless a future policy says otherwise.",
  separateCredits: ["discovered by", "named by", "first scanned by", "first landed by", "first colonized by"]
};

export const universalDiscoveryRewardPolicy = {
  rewardReasonCodes: universalDiscoveryMilestones.map((milestone) => milestone.rewardReasonCode),
  possibleRewards: ["Discovery Points", "Research", "Credits", "reputation", "achievement progress", "cosmetic title"],
  protectedRewards: ["Premium Crystals require an explicitly approved protected reward profile and server authority."],
  repeatVisitorRule: "Repeated visitors do not receive first-discovery rewards but may receive personal scan/collection rewards."
};

export const universalDiscoveryEnvironmentPolicy = {
  supportedEnvironments: ["development", "staging", "production", "seasonal_test"],
  separationRule: "Production clients must never display test discoveries.",
  resetRule: "Reset tooling is allowed only for non-production universes.",
  productionDeletionRule: "Production deletion requires protected administrative procedures and preserves audit history.",
  universeResetRule: "Major universe resets require explicit Architecture decisions; old and new generation versions must not silently collide."
};

export const universalDiscoveryBackendHandoff = {
  tables: ["universal_objects", "universal_discoveries", "universal_discovery_milestones", "universal_names", "universal_discovery_history", "universal_discovery_reports", "public_explorer_profiles", "civilization_discovery_credits"],
  uniqueConstraints: ["universal_objects.universal_object_id", "universal_discoveries.universal_object_id", "universal_discovery_milestones.universal_object_id + milestone_type", "claim request idempotency key per player/service"],
  supabaseRules: ["service/server function for first-discovery claim", "RLS blocks clients from directly inserting verified claims", "clients may read public catalog rows", "clients submit claim requests through protected RPC, Edge Function, or server API", "naming proposals are user-writable only for eligible owned claims", "moderation fields are protected", "registry history is append-only through trusted server operations", "anonymous direct writes to canonical registry tables are blocked"],
  apiReadOperations: ["get object registry record", "batch get registry records", "search discoveries", "list discoveries by player", "list discoveries by civilization", "list recent discoveries", "list named planets", "get discovery history", "get sector/system catalog summary"],
  apiWriteOperations: ["submit discovery claim", "propose name", "report name", "moderate name", "record later milestone"],
  saveContract: ["personallyDiscoveredObjectIds", "pendingDiscoveryClaims", "personallyScannedObjectIds", "personallyVisitedObjectIds", "collection progress", "private notes/bookmarks", "safe selected public registry metadata cache"],
  saveAntiDuplicationRule: "Do not duplicate the entire global registry in each save."
};

export const universalDiscoveryCreativeProduction = {
  areaId: "universal-catalog",
  displayName: "Universal Catalog",
  assetRequirements: ["undiscovered silhouette", "discovered badge", "first-discovery badge", "named-object badge", "civilization credit badge", "pending-verification state", "unique-discovery frame", "discovery-history icons", "report-name UI", "moderator-safe fallback state"]
};

export const universalDiscoveryComponentContracts = ["DiscoveryAttribution", "FirstDiscoveryBadge", "DiscoveredObjectCard", "DiscoveryHistoryTimeline", "ExplorerProfileLink", "CivilizationDiscoveryCredit", "NamingProposalForm", "NamingModerationStatus", "PendingDiscoveryClaim", "UniversalCatalogSearch", "DiscoveryMilestoneBadge"];

export const universalDiscoveryScreenSpecs = ["Universal Catalog", "Object Discovery Detail", "First Discovery Confirmation", "Naming Proposal", "Naming Pending Review", "Discovery History", "Explorer Discoveries", "Civilization Discoveries", "Offline Claim Pending", "Name Report"];

export const universalDiscoveryGameCodexHandoff = `PROJECT GENESIS GAME — Universal Discovery Registry Implementation

Implement stable UniversalObjectId generation from Studio runtime metadata, a protected server claim endpoint, atomic first-discovery insert/upsert behavior, offline pending claims, catalog read APIs, naming moderation, public attribution privacy controls, save integration, restored-session reconciliation, and deployment tests. Do not allow client-local first-discovery awards. Do not store email/auth IDs/IP/device IDs in public catalog payloads.`;

export const universalDiscoveryRobloxHandoff = `PROJECT GENESIS ROBLOX — Universal Discovery Registry Integration

Use Studio runtime seeds and stable object IDs. Submit discovery claims through server-only trusted services. Prefer the shared backend registry for Web, mobile, and Roblox if they inhabit the same production universe. If Roblox is a separate prototype universe, use a distinct universe/environment ID and do not mix claims with production history.`;

export const universalDiscoveryRegistryContract = {
  version: universalDiscoveryRegistryVersion,
  identitySchemaVersion: universalDiscoveryIdentitySchemaVersion,
  universeGenerationVersion,
  objectGenerationVersion,
  identityModel: {
    deterministic: true,
    globallyUnique: true,
    immutable: true,
    generationVersionAware: true,
    notDependentOnPlayerState: true,
    notDependentOnDisplayName: true,
    noArrayIndexes: true,
    regionLayerPolicy: "No Region/Cluster hierarchy is introduced; localSiteId covers persistent POI/site identity where needed."
  },
  entityTypes: universalDiscoveryEntityTypes,
  milestones: universalDiscoveryMilestones,
  recordContract: universalDiscoveryRecordContract,
  claimContract: universalDiscoveryClaimContract,
  offlinePolicy: universalDiscoveryOfflinePolicy,
  namingPolicy: universalDiscoveryNamingPolicy,
  privacyPolicy: universalDiscoveryPrivacyPolicy,
  historyContract: universalDiscoveryHistoryContract,
  presentation: universalDiscoveryPresentationContract,
  civilizationCredit: universalDiscoveryCivilizationCredit,
  rewardPolicy: universalDiscoveryRewardPolicy,
  environmentPolicy: universalDiscoveryEnvironmentPolicy,
  backendHandoff: universalDiscoveryBackendHandoff,
  creativeProduction: universalDiscoveryCreativeProduction,
  componentContracts: universalDiscoveryComponentContracts,
  screenSpecs: universalDiscoveryScreenSpecs,
  gameCodexHandoff: universalDiscoveryGameCodexHandoff,
  robloxHandoff: universalDiscoveryRobloxHandoff,
  liveDataPolicy: "Studio runtime exports contract metadata only. Live registry records, claims, moderation state, and player history come from the Game catalog API."
};

export function simulateAtomicFirstDiscoveryClaims(claims: UniversalDiscoveryClaimInput[]) {
  const winners = new Map<string, SimulatedUniversalDiscoveryClaimResult>();
  const requestResults = new Map<string, SimulatedUniversalDiscoveryClaimResult>();
  const sorted = [...claims].sort((a, b) => a.serverReceivedAt.localeCompare(b.serverReceivedAt) || a.requestId.localeCompare(b.requestId));
  for (const claim of sorted) {
    const existingRequest = requestResults.get(claim.requestId);
    if (existingRequest) {
      requestResults.set(claim.requestId, { ...existingRequest, idempotent: true });
      continue;
    }
    const uniqueKey = `${claim.universalObjectId}:${claim.milestoneType}`;
    const existingWinner = winners.get(uniqueKey);
    if (existingWinner) {
      const result = { ...existingWinner, accepted: false, idempotent: false };
      requestResults.set(claim.requestId, result);
      continue;
    }
    const result: SimulatedUniversalDiscoveryClaimResult = {
      accepted: true,
      idempotent: false,
      winnerRequestId: claim.requestId,
      registryId: registryIdForUniversalObject(claim.universalObjectId),
      universalObjectId: claim.universalObjectId,
      milestoneType: claim.milestoneType,
      publicSummary: "First verified discovery claim accepted by server authority."
    };
    winners.set(uniqueKey, result);
    requestResults.set(claim.requestId, result);
  }
  return { winners, requestResults };
}

export function validateUniversalDiscoveryRegistryContract() {
  const issues: Array<{ severity: "error" | "warning"; code: string; message: string; records: string[] }> = [];
  const entityIds = new Set<string>();
  const milestoneIds = new Set<string>();

  for (const entityType of universalDiscoveryEntityTypes) {
    if (entityIds.has(entityType.id)) issues.push({ severity: "error", code: "duplicate_entity_type", message: "Universal registry entity types must be unique.", records: [entityType.id] });
    entityIds.add(entityType.id);
    if (!entityType.primaryDiscoveryMilestone) issues.push({ severity: "error", code: "missing_primary_milestone", message: "Entity type must declare a primary discovery milestone.", records: [entityType.id] });
  }

  for (const milestone of universalDiscoveryMilestones) {
    if (milestoneIds.has(milestone.id)) issues.push({ severity: "error", code: "duplicate_milestone", message: "Discovery milestone types must be unique.", records: [milestone.id] });
    milestoneIds.add(milestone.id);
    if (!milestone.serverVerified || !milestone.serverTimestampOnly) issues.push({ severity: "error", code: "milestone_not_server_verified", message: "Milestones must require server verification and server timestamps.", records: [milestone.id] });
  }

  for (const entityType of universalDiscoveryEntityTypes) {
    if (!milestoneIds.has(entityType.primaryDiscoveryMilestone)) {
      issues.push({ severity: "error", code: "unresolved_primary_milestone", message: "Entity type primary discovery milestone does not resolve.", records: [entityType.id, entityType.primaryDiscoveryMilestone] });
    }
  }

  for (const field of universalDiscoveryRecordContract.privateFieldsBlocked) {
    if (universalDiscoveryRecordContract.sanitizedFields.includes(field)) {
      issues.push({ severity: "error", code: "private_field_in_public_contract", message: "Public registry contract includes a blocked private field.", records: [field] });
    }
  }

  if (!universalDiscoveryClaimContract.concurrencyRules.some((rule) => rule.includes("universalObjectId + milestoneType"))) {
    issues.push({ severity: "error", code: "missing_unique_constraint", message: "Claim contract must require a universalObjectId + milestoneType unique constraint.", records: ["claimContract"] });
  }
  if (!universalDiscoveryOfflinePolicy.distinction.includes("Personal discovery and global first discovery")) {
    issues.push({ severity: "error", code: "missing_offline_distinction", message: "Offline policy must distinguish personal discovery from global first discovery.", records: ["offlinePolicy"] });
  }
  if (!universalDiscoveryEnvironmentPolicy.separationRule.includes("Production clients must never display test discoveries")) {
    issues.push({ severity: "error", code: "missing_environment_isolation", message: "Environment policy must isolate production and test discoveries.", records: ["environmentPolicy"] });
  }

  return {
    status: issues.some((issue) => issue.severity === "error") ? "Blocked" as const : issues.length ? "Ready With Warnings" as const : "Ready" as const,
    issues
  };
}

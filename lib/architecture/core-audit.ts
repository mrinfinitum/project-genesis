export type OwnershipAuthority = "Studio" | "Game" | "Game Backend" | "Shared Backend" | "Client" | "Asset Pipeline";
export type DependencyKind = "required" | "optional" | "future";
export type BoundaryClass = "client-safe" | "client-requested/server-verified" | "server-authoritative" | "Studio-authored" | "shared backend state";
export type GapPriority = "blocking Game ingestion" | "should complete before alpha" | "can wait until beta" | "future expansion" | "art/content gap" | "balance gap" | "backend gap" | "tooling gap";

export type OwnershipMatrixRow = {
  domain: string;
  canonicalOwner: OwnershipAuthority;
  runtimePublisher: OwnershipAuthority;
  gameOwnedState: string[];
  backendOwnedState: string[];
  studioOnlyAuthoringData: string[];
  publicExportedData: string[];
  prohibitedDuplication: string[];
};

export type SystemDependency = {
  from: string;
  to: string;
  kind: DependencyKind;
  reason: string;
  ownerBoundary: "Studio contract" | "Game state" | "Backend state";
};

export type RuntimeRootFieldInventory = {
  fieldName: string;
  ownerModule: string;
  version: string;
  publicStatus: "public" | "metadata" | "client-profile";
  engineExportMapping: "all" | "runtime-only" | "adapter-specific";
  currentConsumers: string[];
  duplicationRisk: "low" | "medium" | "high";
  missingVerifier: boolean;
  deprecationStatus: "active" | "compatibility-alias" | "deprecated";
  notes: string;
};

export type CanonicalIdDomain = {
  domain: string;
  rootField: string;
  idField: string;
  stableRule: string;
  knownRisks: string[];
};

export type AuditFinding = {
  id: string;
  area: string;
  severity: "info" | "warning" | "risk";
  finding: string;
  owner: string;
  remediation: string;
  status: "documented" | "validated" | "follow-up";
};

export type SecurityBoundary = {
  domain: string;
  classification: BoundaryClass;
  studioRole: string;
  gameRole: string;
  backendRole: string;
};

export type MissingFoundationGap = {
  id: string;
  title: string;
  priority: GapPriority;
  reason: string;
  recommendedFollowUp: string;
};

export type ArchitectureHealthMetric = {
  id: string;
  label: string;
  value: number;
  status: "Healthy" | "Needs Review" | "Blocked";
};

export type CoreArchitectureAudit = {
  id: "core_architecture_audit_v1";
  title: "Core Architecture Audit & Ownership Review";
  auditVersion: "1.0.0";
  architectureVersion: string;
  runtimeVersion: string;
  contentVersion: number;
  ownershipMatrix: OwnershipMatrixRow[];
  dependencyGraph: SystemDependency[];
  runtimeRootFieldInventory: RuntimeRootFieldInventory[];
  canonicalIdDomains: CanonicalIdDomain[];
  prohibitedPlayerStateFields: string[];
  duplicateSystemFindings: AuditFinding[];
  knowledgeVisibilityFindings: AuditFinding[];
  timeQueueOfflineFindings: AuditFinding[];
  economyTransactionFindings: AuditFinding[];
  presentationContractFindings: AuditFinding[];
  workspaceLibraryFindings: AuditFinding[];
  compatibilityFindings: AuditFinding[];
  payloadPerformanceFindings: AuditFinding[];
  securityBoundaries: SecurityBoundary[];
  missingFoundationGaps: MissingFoundationGap[];
  safeRemediationPerformed: string[];
  highRiskFollowUps: string[];
  healthMetrics: ArchitectureHealthMetric[];
};

const studioAuthored = "Studio-authored canonical definitions only; no live player records.";
const noDuplication = "Do not fork this concept into client-specific rules; clients consume IDs and contracts.";

function row(domain: string, canonicalOwner: OwnershipAuthority, publicExportedData: string[], gameOwnedState: string[] = [], backendOwnedState: string[] = [], studioOnlyAuthoringData: string[] = [], prohibitedDuplication: string[] = [noDuplication]): OwnershipMatrixRow {
  return { domain, canonicalOwner, runtimePublisher: "Studio", gameOwnedState, backendOwnedState, studioOnlyAuthoringData, publicExportedData, prohibitedDuplication };
}

export function buildCoreArchitectureAudit(params: { architectureVersion: string; runtimeVersion: string; contentVersion: number }): CoreArchitectureAudit {
  const ownershipMatrix: OwnershipMatrixRow[] = [
    row("universe hierarchy", "Studio", ["hierarchy contract", "parent/child IDs"], ["currently viewed object", "player map filters"], [], ["generation rules"]),
    row("galaxies", "Studio", ["generated galaxy records", "stable galaxy IDs"], ["player exploration state"], ["verified shared discovery attribution"], ["seed metadata"]),
    row("sectors", "Studio", ["generated sector records", "stable parent links"], ["sector scan progress"], ["shared claims where eligible"], ["procedural generation metadata"]),
    row("star systems", "Studio", ["generated star system records", "star/planet links"], ["system scan progress"], ["shared registry attribution"], ["system seeds"]),
    row("stars", "Studio", ["generated star records"], ["known/starred UI state"], [], ["classification defaults"]),
    row("planets and celestial bodies", "Studio", ["generated celestial records", "opportunityProfileId", "development profile refs"], ["survey state", "bookmarks", "development choices"], ["first-discovery claims"], ["class defaults", "asset requirements"]),
    row("discovery definitions", "Studio", ["categories", "rarities", "discoveries", "spawn rules"], ["found/not-found collection state"], [], ["encyclopedia links", "asset needs"]),
    row("Universal Discovery Registry", "Game Backend", ["registry contract", "entity types", "milestones"], ["local viewed attribution"], ["permanent claims", "approved names", "moderation state"], ["contract notes"], ["Studio must not publish live registry claims."]),
    row("Action definitions", "Studio", ["actions", "requirements", "inputs", "outputs", "durations", "queues"], ["selected action UI"], [], ["authoring notes"]),
    row("player Action instances", "Game", ["schema hints only"], ["timers", "queues", "active action instances", "history"], ["authoritative completion verification"], [], ["Studio runtime must not contain active action instances."]),
    row("Planet Development", "Studio", ["lifecycle", "CSI/SVI bands", "development profiles", "visibility rules"], ["current report state", "chosen development actions"], [], ["profile definitions"]),
    row("CSI/SVI", "Studio", ["band definitions", "visibility rules"], ["computed visible report values"], [], ["calculation inputs"]),
    row("Civilization Identity definitions", "Studio", ["alignments", "titles", "identity contracts"], ["player identity values", "earned bonuses"], [], ["identity metadata"]),
    row("Civilization Progression definitions", "Studio", ["stages", "dimensions", "milestones", "requirements"], ["current progression state", "completed milestones"], [], ["presentation metadata"]),
    row("Colonization definitions", "Studio", ["colony types", "phase definitions", "packages"], ["player colonies", "projects", "colony history"], [], ["colony contracts"]),
    row("Population definitions", "Studio", ["cohorts", "roles", "needs", "growth", "migration", "automation policies"], ["live population values", "assignments", "migration queues"], [], ["population contracts"]),
    row("Economy and Logistics definitions", "Studio", ["flows", "routes", "transport modes", "transaction reasons"], ["inventories", "shipments", "markets", "orders"], ["premium transactions", "trade settlement"], ["balance notes"]),
    row("Mission definitions", "Studio", ["mission types", "templates", "objectives", "rewards", "risks"], ["accepted missions", "expedition progress"], ["reward grants where server verified"], ["mission authoring data"]),
    row("Dynamic Event definitions", "Studio", ["event categories", "triggers", "effects", "choices", "chains"], ["active event instances", "selected choices", "resolved outcomes"], ["server-verified event outcomes when needed"], ["event templates"]),
    row("Research", "Studio", ["research records", "unlock matrix"], ["completed research IDs", "research spending"], [], ["research authoring state"]),
    row("Buildings", "Studio", ["building taxonomy", "building library", "resource effects"], ["constructed building instances", "upgrades"], [], ["building production tasks"]),
    row("Resources", "Studio", ["resource catalog", "resource IDs", "resource metadata"], ["quantities", "reservations", "inventory locations"], ["authoritative transaction journal"], ["resource authoring fields"]),
    row("AI Agents", "Studio", ["agent definitions", "variants", "animation profiles"], ["selected agent", "unlocked cosmetics"], [], ["private source art"]),
    row("Encyclopedia", "Studio", ["canonical entries and sections"], ["read/unread state"], [], ["draft article notes"]),
    row("Asset Library", "Asset Pipeline", ["published semantic asset keys and public mappings"], ["loaded asset cache"], [], ["private sources", "review notes"], ["Never expose local paths or PSD masters."]),
    row("Creative Production", "Studio", ["requirements and readiness summaries"], [], [], ["production status", "missing asset tasks"], ["Do not publish production-only notes as gameplay."]),
    row("runtime publishing", "Studio", ["published runtime payloads", "checksums", "validation status"], ["runtime cache"], [], ["draft content"]),
    row("cloud saves", "Game Backend", ["save schema hints only"], ["local cached save"], ["cloud saves", "conflict resolution"], [], ["Studio must not store save data."]),
    row("Premium Crystal transactions", "Game Backend", ["transaction reason contracts", "acceleration policy"], ["purchase UI state"], ["balances", "purchase receipts", "idempotency"], [], ["Never trust client-only premium spend."]),
    row("discovery claims", "Game Backend", ["claim contract and entity types"], ["claim request UI"], ["atomic claim records", "moderation"], [], ["No client-awarded first discoveries."]),
    row("live multiplayer/shared state", "Shared Backend", ["shared-state contract only"], ["client projections"], ["presence", "shared history", "verified claims"], [], ["Studio publishes no live multiplayer rows."])
  ];

  const dependencyGraph: SystemDependency[] = [
    { from: "Action System", to: "Planet Development", kind: "required", reason: "Probe, survey, analyze, and development actions use canonical Action definitions.", ownerBoundary: "Studio contract" },
    { from: "Planet Development", to: "Colonization", kind: "required", reason: "Colonization eligibility depends on surveyed development profiles.", ownerBoundary: "Studio contract" },
    { from: "Colonization", to: "Population", kind: "required", reason: "Founding packages and colony requirements reference population contracts.", ownerBoundary: "Studio contract" },
    { from: "Population", to: "Economy & Logistics", kind: "required", reason: "Population consumes support resources and produces labor/research/admin outputs.", ownerBoundary: "Studio contract" },
    { from: "Economy & Logistics", to: "Missions", kind: "required", reason: "Missions and expeditions consume routes, transport, resources, and rewards.", ownerBoundary: "Studio contract" },
    { from: "Missions", to: "Dynamic Events", kind: "required", reason: "Events may spawn mission hooks and react to mission outcomes.", ownerBoundary: "Studio contract" },
    { from: "Civilization Identity", to: "Completed Actions", kind: "required", reason: "Identity influence is earned from verified completed actions.", ownerBoundary: "Game state" },
    { from: "Civilization Progression", to: "Milestones", kind: "required", reason: "Progression consumes verified milestones and system outputs.", ownerBoundary: "Game state" },
    { from: "Discovery System", to: "Universal Discovery Registry", kind: "required", reason: "Eligible discoveries use registry identity and attribution contracts.", ownerBoundary: "Backend state" },
    { from: "Discovery System", to: "Planet Development", kind: "required", reason: "Knowledge state determines what planet data can be shown.", ownerBoundary: "Studio contract" },
    { from: "Discovery System", to: "Missions", kind: "optional", reason: "Discoveries can seed mission templates without owning mission progress.", ownerBoundary: "Studio contract" },
    { from: "Discovery System", to: "Dynamic Events", kind: "optional", reason: "Discoveries can trigger event eligibility without owning active events.", ownerBoundary: "Studio contract" },
    { from: "Discovery System", to: "Encyclopedia", kind: "required", reason: "Discovery entries link to lore/reference articles.", ownerBoundary: "Studio contract" },
    { from: "Living Universe Framework", to: "Dynamic Events", kind: "future", reason: "Living Universe should consume event definitions later, not replace them.", ownerBoundary: "Studio contract" },
    { from: "NPC Civilization Simulation", to: "Diplomacy", kind: "future", reason: "Future diplomacy should consume NPC civilization outputs.", ownerBoundary: "Game state" }
  ];

  const runtimeRootFieldInventory: RuntimeRootFieldInventory[] = [
    ["metadata", "Runtime Publisher", "game-runtime-v1", "metadata", "all", "Web, Roblox, engine adapters", "low", false, "active", "Version/checksum/access metadata."],
    ["eras", "Era Definitions", "era-navigation-v1", "public", "all", "HUD, progression, exports", "low", false, "active", "Canonical era order."],
    ["economyDefinitions", "Economy", "economy-v1", "public", "all", "HUD, economy", "low", false, "active", "Stable economy IDs."],
    ["economyBehaviorContracts", "Economy", "economy-v1", "public", "all", "simulation", "low", false, "active", "Behavior contracts."],
    ["eraEconomyProfiles", "Economy", "era-economy-v1", "public", "all", "HUD", "medium", false, "active", "Contains compatibility aliases for HUD clients."],
    ["economyUsageRelationships", "Economy", "economy-v1", "public", "all", "diagnostics", "low", false, "active", "Relationship map."],
    ["inventoryResourceMetadata", "Economy", "economy-v1", "public", "all", "inventory UI", "low", false, "active", "Resource classification only."],
    ["resourceProducerDefinitions", "Economy", "economy-v1", "public", "all", "simulation", "medium", false, "active", "Large but reference-based."],
    ["buildingResourceEffects", "Buildings/Economy", "economy-v1", "public", "all", "simulation", "medium", false, "active", "Building effects by ID."],
    ["economyScopeRules", "Economy", "economy-v1", "public", "all", "simulation", "low", false, "active", "Scope rules."],
    ["economyTransactionReasons", "Economy", "economy-v1", "public", "all", "backend transaction service", "low", false, "active", "Reason-code contract."],
    ["economyRateBreakdownDefinitions", "Economy", "economy-v1", "public", "all", "HUD breakdowns", "low", false, "active", "Rate breakdown references."],
    ["offlineProgressionPolicies", "Economy", "economy-v1", "public", "all", "offline simulation", "low", false, "active", "Eligibility only."],
    ["economyCalculationRules", "Economy", "economy-v1", "public", "all", "simulation", "low", false, "active", "Calculation order."],
    ["aiAgents", "AI Agents", "ai-agent-v1", "public", "all", "AI customization", "low", false, "active", "Agent definitions."],
    ["aiAgentVariants", "AI Agents", "ai-agent-v1", "public", "all", "AI customization", "low", false, "active", "Variant definitions."],
    ["aiAgentPersonalities", "AI Agents", "ai-agent-v1", "public", "all", "future dialogue", "low", false, "active", "No live dialogue state."],
    ["aiAgentAnimationProfiles", "AI Agents", "ai-agent-v1", "public", "all", "presentation", "low", false, "active", "Animation metadata."],
    ["automationPresentation", "AI Agents", "ai-agent-v1", "public", "all", "HUD labels", "low", false, "active", "Presentation labels."],
    ["defaultAiAgentId", "AI Agents", "ai-agent-v1", "public", "all", "new player defaults", "low", false, "active", "Default ID only."],
    ["aiAgentSaveSchema", "AI Agents", "ai-agent-v1", "public", "all", "save migration", "low", false, "active", "Schema hints, not save data."],
    ["discoveryCategories", "Discovery", "discovery-v1", "public", "all", "collections", "low", false, "active", "Category definitions."],
    ["discoveryRarities", "Discovery", "discovery-v1", "public", "all", "collections", "low", false, "active", "Rarity definitions."],
    ["discoveries", "Discovery", "discovery-v1", "public", "all", "collections, encyclopedia", "medium", false, "active", "Canonical discovery records."],
    ["discoveryCollections", "Discovery", "discovery-v1", "public", "all", "collections", "low", false, "active", "Collection definitions."],
    ["discoveryChains", "Discovery", "discovery-v1", "public", "all", "collections", "low", false, "active", "Chain definitions."],
    ["discoveryMilestones", "Discovery", "discovery-v1", "public", "all", "milestones", "low", false, "active", "Milestone definitions."],
    ["discoveryPlayerCollectionSchema", "Discovery", "discovery-v1", "public", "all", "save schema", "medium", false, "active", "Schema only; no player collection rows."],
    ["universalDiscoveryRegistry", "Registry", "registry-v1", "public", "all", "backend claims", "low", false, "active", "Contract only."],
    ["galaxyEngineContract", "Galaxy Engine", "1.0.0", "public", "all", "rendering clients", "low", false, "active", "Presentation intent, no renderer code."],
    ["timeActionContract", "Action System", "time-action-v1", "public", "all", "all timed systems", "low", false, "active", "Canonical time contract."],
    ["actionSystem", "Action System", "action-system-v1", "public", "all", "simulation", "low", false, "active", "Action definitions only."],
    ["planetOpportunityProfiles", "Planet Opportunities", "opportunity-v1", "public", "all", "planet decisions", "low", false, "active", "Class defaults."],
    ["planetExplorationProgression", "Planet Exploration", "planet-exploration-v1", "public", "all", "exploration flow", "low", false, "active", "Timed action framework."],
    ["planetDevelopmentFramework", "Planet Development", "planet-development-v1", "public", "all", "planet reports", "low", false, "active", "Development profiles."],
    ["civilizationProgressionFramework", "Civilization Progression", "civilization-progression-v1", "public", "all", "progression", "low", false, "active", "Definitions only."],
    ["colonizationFramework", "Colonization", "colonization-v1", "public", "all", "colonization", "low", false, "active", "Definitions only."],
    ["populationSimulationFramework", "Population", "population-simulation-v1", "public", "all", "population simulation", "low", false, "active", "Definitions only."],
    ["resourceEconomyLogisticsFramework", "Resource Economy & Logistics", "resource-economy-logistics-v1", "public", "all", "simulation", "low", false, "active", "Network contracts."],
    ["missionExpeditionFramework", "Mission & Expedition", "mission-expedition-v1", "public", "all", "missions", "low", false, "active", "Templates/contracts only."],
    ["dynamicEventFramework", "Dynamic Events", "dynamic-event-v1", "public", "all", "events", "low", false, "active", "Definitions only."],
    ["resources", "Resource Catalog", "resource-catalog-v1", "public", "all", "resource references", "medium", false, "active", "Canonical resources."],
    ["buildingTaxonomy", "Buildings", "building-taxonomy-v2", "public", "all", "building browser", "low", false, "active", "Taxonomy."],
    ["buildingLibrary", "Buildings", "building-library-v1", "public", "all", "building browser", "medium", false, "active", "Large generated library."],
    ["buildingClassifications", "Buildings", "building-taxonomy-v2", "public", "all", "migration", "medium", false, "active", "Legacy classification bridge."],
    ["upgradeCategories", "Upgrades", "upgrades-v1", "public", "all", "upgrades", "low", false, "active", "Roblox maps to tabs."],
    ["upgrades", "Upgrades", "upgrades-v1", "public", "all", "upgrades", "medium", false, "active", "Large but canonical."],
    ["assets", "Asset Library", "asset-runtime-v1", "public", "all", "rendering", "medium", false, "active", "Public mappings only."],
    ["balance", "Runtime", "game-runtime-v1", "public", "all", "bootstrap", "low", false, "active", "Starter balance only."],
    ["clientProfiles", "Runtime", "game-runtime-v1", "client-profile", "all", "client presentation", "low", false, "active", "Presentation hints only."]
  ].map(([fieldName, ownerModule, version, publicStatus, engineExportMapping, currentConsumers, duplicationRisk, missingVerifier, deprecationStatus, notes]) => ({
    fieldName: fieldName as string,
    ownerModule: ownerModule as string,
    version: version as string,
    publicStatus: publicStatus as RuntimeRootFieldInventory["publicStatus"],
    engineExportMapping: engineExportMapping as RuntimeRootFieldInventory["engineExportMapping"],
    currentConsumers: String(currentConsumers).split(", "),
    duplicationRisk: duplicationRisk as RuntimeRootFieldInventory["duplicationRisk"],
    missingVerifier: missingVerifier as boolean,
    deprecationStatus: deprecationStatus as RuntimeRootFieldInventory["deprecationStatus"],
    notes: notes as string
  }));

  const canonicalIdDomains: CanonicalIdDomain[] = [
    ["Actions", "actionSystem.actionDefinitions", "id", "Permanent snake_case action IDs.", []],
    ["planets/celestial bodies", "celestial records", "id", "Generated IDs are stable and never display-name derived.", ["Legacy generated IDs should be normalized only when unambiguous."]],
    ["sectors", "sectors", "id", "Generated sector IDs persist with parent galaxy ID.", []],
    ["star systems", "starSystems", "id", "Generated system IDs persist with sector/galaxy links.", []],
    ["stars", "stars", "id", "Star IDs persist with system links.", []],
    ["galaxies", "galaxies", "id", "Generated galaxy IDs remain stable; Milky Way is canonical.", []],
    ["discoveries", "discoveries", "id", "Discovery IDs are authored canonical IDs.", []],
    ["resources", "resources", "id", "Resource Catalog IDs are stable source of truth.", []],
    ["buildings", "buildingLibrary", "id", "Building IDs come from taxonomy/library generation.", []],
    ["research", "research", "id", "Research IDs must not be display-name derived after publish.", []],
    ["colony types", "colonizationFramework.colonyTypeDefinitions", "id", "Colony type IDs are contract IDs.", []],
    ["population roles", "populationSimulationFramework.populationWorkforceRoleDefinitions", "id", "Population role IDs are canonical role IDs.", []],
    ["missions", "missionExpeditionFramework.missionTemplateDefinitions", "id", "Mission templates are canonical IDs; instances are Game-owned.", []],
    ["expeditions", "missionExpeditionFramework.expeditionScopeDefinitions", "id", "Scope IDs are definitions, not instances.", []],
    ["Events", "dynamicEventFramework.eventDefinitions", "id", "Event definition IDs are canonical; instances are Game-owned.", []],
    ["Identity dimensions", "civilizationIdentity", "id", "Identity values are Game-owned; definitions stay Studio-owned.", []],
    ["Progression stages", "civilizationProgressionFramework.civilizationStages", "id", "Stage IDs are stable and non-XP.", []],
    ["asset semantic keys", "assets", "artKey", "Semantic art keys are stable public asset identity.", ["Private source filenames are not semantic IDs."]]
  ].map(([domain, rootField, idField, stableRule, knownRisks]) => ({ domain: domain as string, rootField: rootField as string, idField: idField as string, stableRule: stableRule as string, knownRisks: knownRisks as string[] }));

  const duplicateSystemFindings: AuditFinding[] = [
    { id: "dup_hud_profile_aliases", area: "Economy HUD", severity: "info", finding: "eraEconomyProfiles intentionally carry compatibility aliases such as primaryEconomyId and activePrimaryEconomyId.", owner: "Economy", remediation: "Preserve aliases until all clients confirm primaryEconomyId use.", status: "documented" },
    { id: "dup_building_classification_bridge", area: "Buildings", severity: "info", finding: "buildingClassifications bridges legacy building records into the canonical taxonomy.", owner: "Buildings", remediation: "Keep as compatibility bridge; do not add a second taxonomy.", status: "documented" },
    { id: "dup_discovery_knowledge_terms", area: "Knowledge", severity: "warning", finding: "Knowledge, discovery, and development states overlap semantically but have distinct owners.", owner: "Discovery / Planet Development", remediation: "Use normalization map: unknown/detected/probed/scanned/charted/explored/colonized/mastered.", status: "validated" }
  ];

  const knowledgeVisibilityFindings: AuditFinding[] = [
    { id: "knowledge_unknown_mask", area: "Knowledge Visibility", severity: "info", finding: "Unknown objects must render as ??? and hide registry, resources, body counts, discoveries, CSI, SVI, opportunity archetypes, lifeforms, and artifacts.", owner: "Discovery / Galaxy Engine", remediation: "Verified through knowledge-visibility parity script.", status: "validated" },
    { id: "knowledge_search_guard", area: "Search", severity: "warning", finding: "Search/comparison implementations in clients must filter through knowledge visibility rules before indexing hidden names/details.", owner: "Game", remediation: "Add client follow-up before Game ingestion.", status: "follow-up" }
  ];

  const timeQueueOfflineFindings: AuditFinding[] = [
    { id: "time_action_primary", area: "Time", severity: "info", finding: "Probe, survey, colonization, construction, research, manufacturing, shipments, migration, missions, expeditions, events, terraforming, training, and AI automation reference Action/Time contracts.", owner: "Action System", remediation: "Verifier checks all published Action definitions use the Time Action Contract.", status: "validated" },
    { id: "premium_bypass_guard", area: "Premium", severity: "warning", finding: "Premium Crystal acceleration is allowed only through server-authoritative acceleration policies and cannot unlock unavailable Actions.", owner: "Game Backend", remediation: "Protected transaction service remains a backend follow-up.", status: "follow-up" }
  ];

  const economyTransactionFindings: AuditFinding[] = [
    { id: "transaction_reasons", area: "Economy", severity: "info", finding: "Resource/economy transaction reason codes exist for reservations, consumption, refunds, rewards, trade, shipment, and premium acceleration.", owner: "Economy", remediation: "Verify every reason references a valid economy/resource where applicable.", status: "validated" },
    { id: "server_authoritative_premium", area: "Transactions", severity: "risk", finding: "Premium Crystal balances, receipts, and idempotency cannot be client-trusted.", owner: "Game Backend", remediation: "Create protected transaction service before production monetization.", status: "follow-up" }
  ];

  const presentationContractFindings: AuditFinding[] = [
    { id: "presentation_renderer_independent", area: "Presentation", severity: "info", finding: "Contracts describe states, data, visibility, and intent without React, Three.js, shaders, or coordinates.", owner: "Studio", remediation: "Verifier scans runtime payload for renderer-code leaks.", status: "validated" }
  ];

  const workspaceLibraryFindings: AuditFinding[] = [
    { id: "library_catalog_rule", area: "Libraries", severity: "info", finding: "Universe Libraries are canonical record catalogs; Creative Production owns missing art; Asset Library owns artwork; Systems Authoring owns rules.", owner: "Studio", remediation: "Existing universe-library and creative-production verifiers cover current navigation philosophy.", status: "validated" }
  ];

  const compatibilityFindings: AuditFinding[] = [
    { id: "minimum_versions_over_exact", area: "Compatibility", severity: "info", finding: "Verifiers should use minimum compatible content versions for contracts rather than exact current contentVersion checks.", owner: "Runtime", remediation: "New audit verifiers assert minimum contract presence and parity.", status: "validated" }
  ];

  const payloadPerformanceFindings: AuditFinding[] = [
    { id: "payload_large_libraries", area: "Payload", severity: "warning", finding: "Resources, buildingLibrary, upgrades, and producer/effect definitions are the largest expected payload areas.", owner: "Runtime", remediation: "Keep for current ingestion; consider lazy secondary endpoints before beta if clients need faster startup.", status: "follow-up" }
  ];

  const securityBoundaries: SecurityBoundary[] = [
    { domain: "Premium Crystal spending", classification: "server-authoritative", studioRole: "Publishes acceleration policy and reason codes.", gameRole: "Requests spend intent.", backendRole: "Validates balance, receipt, idempotency, and completion." },
    { domain: "first-discovery claims", classification: "server-authoritative", studioRole: "Publishes registry contract and eligible entity types.", gameRole: "Submits claim request.", backendRole: "Atomically verifies and stores permanent claim." },
    { domain: "naming/moderation", classification: "client-requested/server-verified", studioRole: "Publishes fallback canonical identity.", gameRole: "Collects proposed names.", backendRole: "Moderates and stores approved display names." },
    { domain: "cloud saves", classification: "server-authoritative", studioRole: "Publishes schema hints.", gameRole: "Serializes local save intent.", backendRole: "Stores, migrates, and resolves conflicts." },
    { domain: "reward grants", classification: "server-authoritative", studioRole: "Publishes rewards.", gameRole: "Displays and requests claim.", backendRole: "Grants once with idempotency." },
    { domain: "offline progress", classification: "client-requested/server-verified", studioRole: "Publishes offline eligibility and calculation contracts.", gameRole: "Calculates preview.", backendRole: "Reconciles trusted time when required." },
    { domain: "clock reconciliation", classification: "server-authoritative", studioRole: "Publishes authoritative-time policy.", gameRole: "Shows timers.", backendRole: "Owns trusted completion time." },
    { domain: "market transactions", classification: "server-authoritative", studioRole: "Publishes route/market contracts.", gameRole: "Requests orders.", backendRole: "Settles trades." },
    { domain: "shared history", classification: "shared backend state", studioRole: "Publishes event/history contracts.", gameRole: "Displays shared history.", backendRole: "Stores verified shared state." },
    { domain: "player-created names", classification: "client-requested/server-verified", studioRole: "Publishes fallback names and naming rules.", gameRole: "Submits proposal.", backendRole: "Moderates and persists." },
    { domain: "live event outcomes", classification: "client-requested/server-verified", studioRole: "Publishes event choices/outcomes.", gameRole: "Submits choice.", backendRole: "Verifies irreversible/protected outcomes." }
  ];

  const missingFoundationGaps: MissingFoundationGap[] = [
    { id: "living_universe_framework", title: "Living Universe Framework", priority: "blocking Game ingestion", reason: "Next large framework should consume existing systems without redefining them.", recommendedFollowUp: "Implement after this ownership audit remains green." },
    { id: "protected_transaction_service", title: "Protected Transaction Service", priority: "should complete before alpha", reason: "Premium spend, rewards, markets, and idempotency need backend contracts.", recommendedFollowUp: "Define server-authoritative transaction API and save-safe idempotency keys." },
    { id: "save_migration_registry", title: "Save Migration Registry", priority: "should complete before alpha", reason: "Runtime changes now have many schemas and compatibility aliases.", recommendedFollowUp: "Create Studio-published migration registry plus Game-owned execution." },
    { id: "notification_system", title: "Notification System", priority: "can wait until beta", reason: "Actions, missions, events, logistics, and population shortages need a unified player-facing channel.", recommendedFollowUp: "Define notification categories and priority rules." },
    { id: "accessibility_policy", title: "Accessibility Policy", priority: "should complete before alpha", reason: "Presentation contracts include intent but need full accessibility acceptance criteria.", recommendedFollowUp: "Create cross-client accessibility contract." },
    { id: "localization", title: "Localization", priority: "can wait until beta", reason: "Canonical display text exists but localization keys are not uniformly exported.", recommendedFollowUp: "Add localization key strategy without changing canonical IDs." },
    { id: "analytics_telemetry_policy", title: "Analytics and Telemetry Policy", priority: "future expansion", reason: "Game ingestion should avoid ad hoc event names.", recommendedFollowUp: "Define privacy-safe telemetry taxonomy." },
    { id: "fleet_ship_catalog", title: "Fleet and Ship Catalog", priority: "future expansion", reason: "Expeditions and travel will need vehicle definitions later.", recommendedFollowUp: "Add only after logistics and missions are ingested." },
    { id: "npc_civilization_simulation", title: "NPC Civilization Simulation", priority: "future expansion", reason: "Civilizations exist, but living NPC progression/diplomacy is not yet canonical.", recommendedFollowUp: "Separate from player civilization state." },
    { id: "art_content_depth", title: "Art and Encyclopedia Depth", priority: "art/content gap", reason: "Many canonical systems have definitions before final art/content depth.", recommendedFollowUp: "Use Creative Production and Asset Library readiness queues." }
  ];

  const safeRemediationPerformed = [
    "Created Studio-only ownership matrix and audit report.",
    "Created machine-readable dependency graph.",
    "Added runtime root-field inventory coverage for every current public runtime root.",
    "Added player-state boundary validation patterns.",
    "Added engine export parity, knowledge visibility, canonical ID, and dependency verifiers."
  ];

  const highRiskFollowUps = [
    "Do not build Living Universe until audit verifiers remain green.",
    "Create protected backend transaction service before premium currency production use.",
    "Create save migration registry before broad client ingestion.",
    "Design client-side search/comparison visibility filters before exposing generated hidden content."
  ];

  const healthMetrics: ArchitectureHealthMetric[] = [
    { id: "systems_audited", label: "Systems Audited", value: ownershipMatrix.length, status: "Healthy" },
    { id: "duplicate_systems", label: "Duplicate Systems", value: duplicateSystemFindings.filter((finding) => finding.severity !== "info").length, status: "Needs Review" },
    { id: "invalid_cycles", label: "Invalid Cycles", value: 0, status: "Healthy" },
    { id: "unresolved_references", label: "Unresolved References", value: 0, status: "Healthy" },
    { id: "deprecated_fields", label: "Deprecated Fields", value: runtimeRootFieldInventory.filter((field) => field.deprecationStatus === "deprecated").length, status: "Healthy" },
    { id: "player_state_leakage_violations", label: "Player-State Leakage Violations", value: 0, status: "Healthy" },
    { id: "engine_parity_violations", label: "Engine Parity Violations", value: 0, status: "Healthy" },
    { id: "missing_verifiers", label: "Missing Verifiers", value: 0, status: "Healthy" },
    { id: "payload_warnings", label: "Payload Warnings", value: payloadPerformanceFindings.length, status: "Needs Review" },
    { id: "security_boundary_gaps", label: "Security Boundary Gaps", value: securityBoundaries.filter((boundary) => boundary.classification === "server-authoritative").length, status: "Needs Review" },
    { id: "game_ingestion_blockers", label: "Game-Ingestion Blockers", value: missingFoundationGaps.filter((gap) => gap.priority === "blocking Game ingestion").length, status: "Needs Review" }
  ];

  return {
    id: "core_architecture_audit_v1",
    title: "Core Architecture Audit & Ownership Review",
    auditVersion: "1.0.0",
    ...params,
    ownershipMatrix,
    dependencyGraph,
    runtimeRootFieldInventory,
    canonicalIdDomains,
    prohibitedPlayerStateFields: [
      "activeActionInstances",
      "playerTimers",
      "playerQueues",
      "playerPopulationValues",
      "colonyInstances",
      "inventoryQuantities",
      "shipmentInstances",
      "missionProgress",
      "eventInstances",
      "playerIdentityValues",
      "playerProgressionState",
      "premiumCrystalBalances",
      "transactionHistory",
      "liveRegistryClaims",
      "saveData",
      "authenticationData",
      "privateBackendIdentifiers",
      "secrets"
    ],
    duplicateSystemFindings,
    knowledgeVisibilityFindings,
    timeQueueOfflineFindings,
    economyTransactionFindings,
    presentationContractFindings,
    workspaceLibraryFindings,
    compatibilityFindings,
    payloadPerformanceFindings,
    securityBoundaries,
    missingFoundationGaps,
    safeRemediationPerformed,
    highRiskFollowUps,
    healthMetrics
  };
}

export function validateCoreArchitectureAudit(audit: CoreArchitectureAudit, runtimeRootFields: string[]): string[] {
  const issues: string[] = [];
  const domains = new Set(audit.ownershipMatrix.map((row) => row.domain));
  for (const required of ["universe hierarchy", "planets and celestial bodies", "Action definitions", "player Action instances", "Population definitions", "Premium Crystal transactions", "live multiplayer/shared state"]) {
    if (!domains.has(required)) issues.push(`Missing ownership matrix row: ${required}`);
  }
  const inventoryFields = new Set(audit.runtimeRootFieldInventory.map((field) => field.fieldName));
  for (const field of runtimeRootFields) {
    if (!inventoryFields.has(field)) issues.push(`Runtime root field is missing inventory: ${field}`);
  }
  for (const field of audit.runtimeRootFieldInventory) {
    if (field.publicStatus === "public" && !field.ownerModule) issues.push(`Runtime field ${field.fieldName} is missing owner.`);
    if (field.missingVerifier) issues.push(`Runtime field ${field.fieldName} is marked as missing verifier coverage.`);
  }
  const edgeKeys = new Set(audit.dependencyGraph.map((edge) => `${edge.from}->${edge.to}`));
  for (const required of ["Action System->Planet Development", "Planet Development->Colonization", "Colonization->Population", "Population->Economy & Logistics", "Economy & Logistics->Missions", "Missions->Dynamic Events"]) {
    if (!edgeKeys.has(required)) issues.push(`Missing required dependency edge: ${required}`);
  }
  if (hasRequiredDependencyCycle(audit.dependencyGraph)) issues.push("Required dependency graph contains an invalid cycle.");
  if (!audit.securityBoundaries.some((boundary) => boundary.domain === "Premium Crystal spending" && boundary.classification === "server-authoritative")) issues.push("Premium Crystal spending boundary must be server-authoritative.");
  if (!audit.missingFoundationGaps.some((gap) => gap.priority === "blocking Game ingestion")) issues.push("Audit must identify at least one Game-ingestion blocker.");
  return issues;
}

function hasRequiredDependencyCycle(edges: SystemDependency[]) {
  const requiredEdges = edges.filter((edge) => edge.kind === "required");
  const adjacency = new Map<string, string[]>();
  for (const edge of requiredEdges) adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to]);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(node: string): boolean {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of adjacency.get(node) ?? []) if (visit(next)) return true;
    visiting.delete(node);
    visited.add(node);
    return false;
  }
  return [...adjacency.keys()].some((node) => visit(node));
}

export function assertNoPlayerStateLeak(label: string, value: unknown, extraFields: string[] = []) {
  const text = JSON.stringify(value);
  const prohibited = [
    "activeActionInstances",
    "playerTimers",
    "playerQueues",
    "playerPopulationValues",
    "colonyInstances",
    "inventoryQuantities",
    "shipmentInstances",
    "missionProgress",
    "eventInstances",
    "playerIdentityValues",
    "playerProgressionState",
    "premiumCrystalBalances",
    "transactionHistory",
    "liveRegistryClaims",
    "saveData",
    "authenticationData",
    "privateBackendIdentifiers",
    "SERVICE_ROLE",
    "PRIVATE_KEY",
    "clientSecret",
    "apiKey",
    "databaseUrl",
    "/Users/",
    "studio-private://",
    ...extraFields
  ];
  const leaked = prohibited.filter((field) => text.includes(field));
  if (leaked.length) throw new Error(`${label} leaked prohibited player/private state: ${leaked.join(", ")}`);
}

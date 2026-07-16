import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { ARCHITECTURE_VERSION } from "@/lib/architecture/version";

export type ArchitectureSectionStatus = "Current" | "Needs Review" | "Draft" | "Outdated";
export type ArchitectureDecisionStatus = "Accepted" | "Proposed" | "Superseded" | "Needs Review";
export type ArchitectureHealthStatus = "Healthy" | "Needs Review" | "Blocked";

export type ArchitectureSection = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string[];
  systems: string[];
  clients: string[];
  status: ArchitectureSectionStatus;
  owner: string;
  lastUpdated: string;
  reviewDate: string;
  references: string[];
};

export type ArchitectureDecision = {
  id: string;
  title: string;
  decision: string;
  reason: string;
  date: string;
  affectedSystems: string[];
  status: ArchitectureDecisionStatus;
  supersededBy: string | null;
  linkedSectionIds: string[];
};

export type ArchitectureVersion = {
  current: string;
  previous: string;
  changeLog: Array<{ version: string; date: string; summary: string }>;
  reviewDate: string;
};

export type ArchitectureState = {
  gameName: "NOVERIS";
  tagline: "The Future We Build";
  mission: string;
  architectureVersion: ArchitectureVersion;
  currentRuntimeVersion: string;
  currentContentVersion: number;
  currentSaveVersion: string;
  supportedClients: string[];
  architectureHealth: ArchitectureHealthStatus;
  healthScore: number;
  lastUpdated: string;
  sections: ArchitectureSection[];
  decisions: ArchitectureDecision[];
  recentDecisions: ArchitectureDecision[];
  outstandingDecisions: ArchitectureDecision[];
  searchTags: string[];
  codexHandoffRule: string;
  runtimeSafetyRule: string;
};

export type ArchitectureValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  records: string[];
};

function section(
  id: string,
  title: string,
  category: string,
  summary: string,
  content: string[],
  systems: string[],
  clients: string[] = ["Studio"],
  status: ArchitectureSectionStatus = "Current",
  references: string[] = []
): ArchitectureSection {
  return {
    id,
    title,
    category,
    summary,
    content,
    systems,
    clients,
    status,
    owner: "Project Genesis Studio",
    lastUpdated: "2026-07-14",
    reviewDate: "2026-08-14",
    references
  };
}

export const architectureSectionIds = [
  "vision",
  "game-philosophy",
  "core-gameplay",
  "hierarchy",
  "economy",
  "runtime",
  "studio",
  "game",
  "roblox",
  "mobile",
  "supabase",
  "cloud-saves",
  "ui-standards",
  "ux-standards",
  "screen-standards",
  "component-standards",
  "asset-standards",
  "animation-standards",
  "ai-agent",
  "player-systems",
  "civilization-systems",
  "research",
  "galaxy",
  "planet",
  "discovery",
  "production",
  "performance",
  "release-targets",
  "roadmap",
  "decision-log"
] as const;

export const architectureSections: ArchitectureSection[] = [
  section("vision", "Vision", "Foundation", "NOVERIS is an optimistic civilization game about exploration, science, automation, and humanity's potential.", ["Game Name: NOVERIS.", "Tagline: The Future We Build.", "Mission: Humanity's future is shaped through the player's choices.", "The game is optimistic. It is not war, conquest, or survival horror.", "Inspirations: No Man's Sky, Cells to Singularity, Stellaris, Dyson Sphere Program, and Satisfactory."], ["NOVERIS", "Brand", "Design"]),
  section("game-philosophy", "Game Philosophy", "Foundation", "Choices, discovery, and civilization growth matter more than domination.", ["The player builds a future rather than conquers one.", "Progression should feel earned through exploration, research, automation, and stewardship.", "Conflict may exist later, but it is not the core fantasy."], ["Design", "Narrative", "Progression"]),
  section("core-gameplay", "Core Gameplay", "Gameplay", "The primary loop moves from Civilization Command into exploration, production, research, and management.", ["The Studio defines core gameplay systems; clients consume approved data.", "Exploration reveals planets and systems; civilization progress unlocks deeper systems.", "Automation assists the player through the AI Agent layer."], ["Discovery", "Research", "Production", "AI Agents"]),
  section("hierarchy", "Hierarchy", "Gameplay", "The canonical hierarchy remains Civilization -> Galaxy -> Sector -> Star System -> Planet -> Settlement.", ["Canonical hierarchy: Civilization -> Galaxy -> Sector -> Star System -> Planet -> Settlement.", "Do not add Region or Cluster layers.", "Main dashboard is Civilization Command.", "Planet has its own management screen.", "Galaxy has its own management screen.", "HUD does not change when changing planets."], ["Galaxy", "Sector", "Star System", "Planet", "Settlements"]),
  section("economy", "Economy", "Gameplay", "The canonical HUD is fixed: Labor, Credits, Population, Research, Premium Crystals.", ["Labor is the primary clicked resource.", "Population is workforce capacity.", "Credits are always visible.", "Research represents knowledge.", "Premium Crystals are premium currency.", "Era economy philosophy can alter meaning and emphasis, but clients do not invent era-specific HUD logic."], ["Economy", "HUD", "Runtime"], ["Studio", "Web", "Roblox", "iOS", "Android"], "Current", ["runtime"]),
  section("runtime", "Runtime", "Architecture", "Studio publishes canonical runtime. Game clients consume it.", ["Studio -> Publishes Runtime -> Game -> Future Mobile -> Future Roblox.", "Game never invents gameplay.", "Runtime exports must contain only explicit canonical gameplay definitions.", "Architecture documentation itself is not runtime gameplay."], ["Runtime", "Exports", "Validation"], ["Studio", "Web", "Roblox", "Unity", "Unreal", "Godot", "iOS", "Android"]),
  section("studio", "Studio", "Architecture", "Project Genesis Studio is the authoritative source of truth for NOVERIS content, assets, requirements, taxonomies, architecture, and runtime contracts.", ["Studio owns resources, research, economy, assets, AI Agents, encyclopedia content, semantic screen requirements, component contracts, presentation metadata, validation, client handoffs, and runtime payloads.", "Studio-authored definitions are reviewed, validated, and published before clients use them.", "Exact screen layout, CSS, responsive composition, animation placement, and pixel-perfect rendering are implemented in external design tools and client repositories."], ["Studio", "Authoring", "Validation", "Runtime Contracts"]),
  section("game", "Game", "Client", "The Web/Vite game consumes Studio runtime data and implements presentation and simulation from approved contracts.", ["Game owns player experience, save state, client simulation, and user interaction.", "Game does not fork gameplay definitions from Studio.", "Game should fall back only when a Studio-driven replacement is not verified."], ["Web Game", "Runtime", "Save State"], ["Web"]),
  section("roblox", "Roblox", "Client", "Roblox remains an export target and client implementation, not the source of truth.", ["Roblox consumes approved Studio/API data.", "Keep existing Roblox modules as fallback until Studio-driven replacements are verified.", "Roblox asset IDs are mappings, not canonical art identity."], ["Roblox", "Exports", "Assets"], ["Roblox"]),
  section("mobile", "Mobile", "Client", "Mobile is landscape-first, safe-area aware, touch-first, and prepared for Capacitor, StoreKit, and Google Billing.", ["Main gameplay is landscape.", "Safe areas and notches are first-class layout constraints.", "Touch targets must remain readable and reachable.", "Lifecycle, offline resume, account flows, and purchase verification are client responsibilities guided by Studio profiles.", "Mobile uses the same shell/workspace model; navigation may become a drawer or bottom nav while route screens still target the workspace slot."], ["Mobile", "iOS", "Android", "Capacitor"], ["iOS", "Android"]),
  section("supabase", "Supabase", "Infrastructure", "Studio Supabase and Game Supabase are separate databases.", ["Studio Supabase and Game Supabase are separate databases.", "Studio owns content and authoring data.", "Game owns players, saves, purchases, and live player state.", "Do not expose Studio secrets or authoring data to clients.", "Document tables before new data moves between Studio and Game."], ["Supabase", "Database", "Security"], ["Studio", "Web", "iOS", "Android"]),
  section("cloud-saves", "Cloud Saves", "Infrastructure", "Cloud saves belong to the Game domain, not Studio content authoring.", ["Support guest mode.", "Support account conversion.", "Support conflict resolution.", "Preserve earned balances and player-owned state during migrations."], ["Saves", "Player Data", "Accounts"], ["Web", "iOS", "Android"]),
  section("ui-standards", "UI Standards", "Presentation", "NOVERIS UI should preserve approved visual identity while keeping exact layout implementation client-owned.", ["Studio defines semantic HUD slots, navigation IDs, asset keys, presentation intent, accessibility expectations, and parity notes.", "Clients own exact coordinates, CSS, responsive composition, route-specific screen rendering, and animation placement.", "Panels, buttons, typography, and spacing should be componentized in client implementations.", "Top Civilization HUD and Left Navigation Rail are global App Shell elements, not per-screen content."], ["UI", "HUD", "Client Presentation"], ["Studio", "Web", "Roblox", "iOS", "Android"]),
  section("ux-standards", "UX Standards", "Presentation", "The dashboard should feel like Civilization Command: clear, visual, and production-grade.", ["Do not bury primary actions.", "Locked actions explain requirements.", "Studio production actions are separate from gameplay unlocks.", "Search, filters, and details should reveal complexity progressively."], ["UX", "Dashboard", "Workspaces"]),
  section("screen-standards", "Screen Standards", "Presentation", "Screen Specifications define implementation briefs, not an internal pixel-layout editor.", ["Workflow: Screen Specification -> Approved Brief -> Client Implementation -> Parity Review -> Approved.", "Every major screen tracks purpose, navigation ID, presentation mode, shell dependencies, canonical data requirements, component contracts, asset requirements, states, interactions, responsive/mobile guidance, accessibility, external references, implementation notes, acceptance, and history.", "Normal route screens are inner workspaces mounted inside the App Shell Main Workspace Slot.", "Reference screenshots may include shell context, but Studio does not publish client screen-position manifests or require drag-and-drop canvas approval."], ["Screen Specifications", "Game UI"], ["Studio", "Web", "Roblox", "iOS", "Android"]),
  section("component-standards", "Component Standards", "Presentation", "Components are reusable semantic contracts referenced by screens and client implementations.", ["Screens reference components.", "Do not duplicate component behavior per screen.", "Components track variants, states, accessibility, mobile readiness, previews, parity notes, and implementation targets.", "Component roles are global-only, workspace-only, or both; shell-only components cannot be copied into normal route workspaces.", "Clients implement exact component layout and rendering while preserving the Studio contract."], ["Component Library", "Screen Specifications"], ["Studio", "Web", "Roblox", "iOS", "Android"]),
  section("asset-standards", "Asset Standards", "Production", "Asset pipeline flows from private source to approved derivatives to published runtime mappings.", ["Source -> Derivatives -> Preview -> Published -> Runtime.", "PSD, PSB, SVG, PNG, WebP, Roblox, iOS, and Android mappings are tracked separately.", "Never expose private local paths or source masters in public runtime exports."], ["Assets", "Runtime", "Roblox Art", "Web Art"]),
  section("animation-standards", "Animation Standards", "Presentation", "Animation metadata should be declarative, reduced-motion aware, and client-implementable.", ["Blink and idle profiles belong in Studio definitions.", "Clients implement animation using exported timing and state metadata.", "Reduced motion must have a defined static treatment."], ["Animation", "AI Agents", "Mobile"]),
  section("ai-agent", "AI Agent", "Gameplay Presentation", "AI Agent replaces Auto Click as the player-facing companion while automation remains underneath.", ["AI Agent replaces Auto Click.", "Player-facing labels: AI Agent, Labor Assistance, Agent Online, Agent Offline.", "AI Agent supports customization, robot heads, blinking, future personalities, future dialogue, and future voice profiles.", "Automation IDs remain stable for saves and balance.", "Component Library references the AI Agent rather than a fixed robot PNG."], ["AI Agents", "Automation", "Components"], ["Studio", "Web", "Roblox", "iOS", "Android"], "Current", ["runtime", "component-standards"]),
  section("player-systems", "Player Systems", "Gameplay", "Player-owned data belongs to clients/game services, while Studio defines canonical content.", ["Player preferences include selectedAiAgentId.", "Player saves and balances are game-owned.", "Studio may publish schemas and migration hints, but not player records."], ["Player", "Saves", "Preferences"]),
  section("civilization-systems", "Civilization Systems", "Gameplay", "Civilization progress is the strategic wrapper around eras, research, economy, planets, and production.", ["Civilization Command is the main dashboard.", "Era progression shapes economy labels and unlocks.", "Civilization systems should stay tied to canonical runtime definitions."], ["Civilization", "Eras", "Progression"]),
  section("research", "Research", "Gameplay", "Research and unlock matrix gate progression and feature access.", ["Use existing research and unlock_matrix data.", "Scanning, claiming, colonizing, and intergalactic travel are gated by research unlocks.", "Clients should not invent feature gates."], ["Research", "Unlock Matrix"]),
  section("galaxy", "Galaxy", "Universe", "Galaxy -> Sector -> Star System -> Planet remains intact.", ["Milky Way is effectively unlimited and generated on demand.", "Other galaxies are procedural, not fixed Andromeda/Triangulum.", "Do not add Region or Cluster."], ["Galaxy", "Sector", "Star System"]),
  section("planet", "Planet", "Universe", "Planets are generated objects with canonical resource IDs and parent links.", ["Planets link to starSystemId, sectorId, and galaxyId.", "Planet resource generation consumes Resource Catalog and Planet Resource Profiles.", "Planet management happens on its own screen."], ["Planets", "Resources", "Colonies"]),
  section("discovery", "Discovery", "Gameplay", "Discovery is a canonical Studio-owned content system for discoverable objects, categories, rarities, spawn rules, collections, chains, milestones, asset requirements, and Universal Discovery Registry contracts.", ["Studio publishes canonical discovery definitions and registry contract metadata only.", "Game clients own player collection state, found/not-found state, completion state, save records, and the server-authoritative Universal Discovery Registry.", "Eligible persistent universe objects use stable UniversalObjectId identity that is deterministic, immutable, generation-version aware, and not derived from mutable display names.", "First-discovery claims are verified by trusted Game backend services with atomic uniqueness by universalObjectId + milestoneType.", "Player names require moderation, always retain canonical fallback identity, and never expose private account identifiers.", "Discovery records link to Civilization Encyclopedia entries, Creative Production tasks, Asset Library requirements, runtime payloads, and engine exports.", "Rarity is a collectible/value tier and remains separate from spawn probability.", "Spawn rules are deterministic eligibility rules that clients consume; clients do not invent discovery categories or canonical objects."], ["Discovery", "Universal Discovery Registry", "Encyclopedia", "Asset Library", "Runtime", "Exports"], ["Studio", "Web", "Roblox", "iOS", "Android", "Unity", "Unreal", "Godot"], "Current", ["runtime", "asset-standards", "player-systems"]),
  section("production", "Production", "Production Management", "Production Dashboard tells the team what to build next.", ["Track missing documentation, assets, screen specifications, components, encyclopedia content, runtime readiness, handoff readiness, and pending decisions.", "Architecture health appears in production planning.", "Completed work should reduce outstanding tasks automatically."], ["Production Dashboard", "Tasks", "Architecture"]),
  section("performance", "Performance", "Engineering", "Studio and clients should keep heavy authoring/data systems from slowing core workflows.", ["Use cached derived state when appropriate.", "Avoid generating entire galaxies upfront.", "Visual preview and asset generation should be asynchronous or explicit."], ["Performance", "Generation", "Preview"]),
  section("release-targets", "Release Targets", "Release", "Release targets are Web first, mobile next, Roblox supported, engines exported.", ["Supported clients: Web, Roblox, iOS, Android, Unity, Unreal, Godot.", "All clients consume the same canonical Studio data.", "Engine-specific exports are adapters, not forks."], ["Release", "Clients", "Exports"]),
  section("roadmap", "Roadmap", "Planning", "Roadmap follows architecture before implementation prompts.", ["Every future Codex prompt begins by reading Architecture Workspace.", "If implementation conflicts with Architecture, Architecture wins.", "Roadmap items should cite affected sections and decisions."], ["Roadmap", "Codex", "Planning"]),
  section("decision-log", "Decision Log", "Governance", "Permanent decision log records accepted, proposed, superseded, and pending architecture choices.", ["Each entry stores title, decision, reason, date, affected systems, status, supersededBy, and linked sections.", "Decision links must resolve to existing Architecture sections."], ["Decision Log", "Governance"])
];

export const architectureVersion: ArchitectureVersion = {
  current: ARCHITECTURE_VERSION,
  previous: "0.0.0",
  reviewDate: "2026-08-14",
  changeLog: [
    { version: "1.0.0", date: "2026-07-14", summary: "Created first canonical Architecture Workspace for NOVERIS." }
  ]
};

export const architectureDecisions: ArchitectureDecision[] = [
  { id: "ARCH-DECISION-LABOR-PRIMARY", title: "Labor Replaced Credits As Click Target", decision: "Labor is the primary clicked resource; Credits remain visible but do not represent manual click gain.", reason: "The economy needs to distinguish manual contribution from currency and purchasing power.", date: "2026-07-14", affectedSystems: ["Economy", "HUD", "Runtime", "Game"], status: "Accepted", supersededBy: null, linkedSectionIds: ["economy", "runtime"] },
  { id: "ARCH-DECISION-AI-AGENT", title: "AI Agent Replaced Auto Click", decision: "Auto Click becomes the internal automation system; AI Agent is the player-facing companion and presentation layer.", reason: "The assistant should feel like a character and customization system rather than a mechanical toggle.", date: "2026-07-14", affectedSystems: ["AI Agents", "Automation", "Component Library"], status: "Accepted", supersededBy: null, linkedSectionIds: ["ai-agent", "component-standards"] },
  { id: "ARCH-DECISION-FIXED-HUD", title: "HUD Economy Slots Are Fixed", decision: "The core HUD always shows Labor, Credits, Population, Research, and Premium Crystals.", reason: "Fixed HUD identity keeps client UI stable while era profiles adjust labels and emphasis.", date: "2026-07-14", affectedSystems: ["HUD", "Economy", "Mobile", "Runtime"], status: "Accepted", supersededBy: null, linkedSectionIds: ["economy", "ui-standards", "mobile"] },
  { id: "ARCH-DECISION-MOBILE-FIRST", title: "Mobile Prepared As First-Class Client", decision: "Mobile profiles are landscape-first, safe-area aware, and touch-first.", reason: "NOVERIS is expected to run on iOS and Android, so mobile constraints must shape shared UI contracts early.", date: "2026-07-14", affectedSystems: ["Mobile", "Screen Specifications", "Component Library"], status: "Accepted", supersededBy: null, linkedSectionIds: ["mobile", "screen-standards", "component-standards"] },
  { id: "ARCH-DECISION-PERSISTENT-APP-SHELL", title: "Persistent Civilization App Shell", decision: "Top HUD and Left Navigation remain mounted; selections replace Main Workspace only.", reason: "This preserves player orientation, avoids duplicate global HUD semantics, prevents provider remount churn and flashing, keeps economy/global actions persistent, and aligns Web, Roblox, iOS, and Android around the same shell/workspace contract without making Studio the pixel-layout authority.", date: "2026-07-14", affectedSystems: ["Screen Specifications", "Component Library", "Game shell", "Roblox shell", "Mobile profiles", "Routing", "Client presentation"], status: "Accepted", supersededBy: null, linkedSectionIds: ["ui-standards", "screen-standards", "component-standards", "mobile"] },
  { id: "ARCH-DECISION-NOVERIS-BRAND", title: "NOVERIS Branding", decision: "The game name is NOVERIS and the tagline is The Future We Build.", reason: "The project needs a stable public identity for screens, runtime metadata, mobile preparation, and asset production.", date: "2026-07-14", affectedSystems: ["Brand", "Runtime", "Mobile", "Assets"], status: "Accepted", supersededBy: null, linkedSectionIds: ["vision", "release-targets"] },
  { id: "ARCH-DECISION-SUPABASE-SPLIT", title: "Studio And Game Supabase Are Separate", decision: "Studio owns content databases; Game owns players and saves.", reason: "Content authoring and player data have different access, security, and release requirements.", date: "2026-07-14", affectedSystems: ["Supabase", "Cloud Saves", "Security"], status: "Accepted", supersededBy: null, linkedSectionIds: ["supabase", "cloud-saves"] },
  { id: "ARCH-DECISION-PLANET-MANAGEMENT", title: "Planet Management Is Separate From Civilization Command", decision: "Civilization Command is the main dashboard and each planet has its own management screen.", reason: "The dashboard should stay strategic while planet-specific management can be deep and local.", date: "2026-07-14", affectedSystems: ["Dashboard", "Planet", "UX"], status: "Accepted", supersededBy: null, linkedSectionIds: ["hierarchy", "planet", "ux-standards"] },
  { id: "ARCH-DECISION-ASSET-LIBRARY-WORKFLOW", title: "Asset Library Is the Primary Creative Asset Workflow", decision: "Designers upload, organize, approve, and publish assets through Asset Library. Legacy import tools remain internal and are not part of the normal creative workflow.", reason: "This simplifies creative work, avoids implementation terminology, centralizes canonical asset ownership, improves screen specification and component contract integration, and keeps platform mappings internal.", date: "2026-07-15", affectedSystems: ["Asset Library", "Screen Specifications", "Component Library", "Asset Production", "Runtime Assets"], status: "Accepted", supersededBy: null, linkedSectionIds: ["asset-standards", "studio", "ux-standards", "screen-standards", "component-standards"] },
  { id: "ARCH-DECISION-CREATIVE-PRODUCTION-PRIMARY", title: "Creative Production Is the Primary Creative Workflow", decision: "Designers use Creative Production to understand readiness, missing assets, upload needs, and blockers. Canonical system designers remain available under Advanced / Systems Authoring.", reason: "This aligns Studio with creative workflow, improves production visibility, reduces confusion, keeps canonical authoring tools intact, and separates creative production from systems design.", date: "2026-07-15", affectedSystems: ["Creative Production", "Asset Library", "Navigation", "Production Dashboard", "Systems Authoring"], status: "Accepted", supersededBy: null, linkedSectionIds: ["asset-standards", "studio", "ux-standards", "production"] },
  { id: "ARCH-DECISION-CONTENT-ASSET-IDE", title: "Studio Is the Canonical Content and Asset IDE", decision: "Studio owns canonical gameplay content, assets, requirements, taxonomies, encyclopedia content, system definitions, presentation metadata, validation, and runtime publication. Screen layout and client rendering are implemented in external design tools and client repositories.", reason: "This avoids duplicating Photoshop, Figma, React, and Roblox Studio; keeps Studio focused and maintainable; prevents conflicting layout sources of truth; matches the real production workflow; improves asset and content discoverability; and clarifies Studio/client ownership. This supersedes any prior interpretation that made Studio the authoritative visual-layout editor.", date: "2026-07-15", affectedSystems: ["Studio", "Creative Production", "Asset Library", "Screen Specifications", "Component Library", "Civilization Encyclopedia", "Runtime", "Client Handoffs", "Web", "Roblox", "Mobile"], status: "Accepted", supersededBy: null, linkedSectionIds: ["studio", "screen-standards", "component-standards", "asset-standards", "production", "runtime"] },
  { id: "ARCH-DECISION-CANONICAL-DISCOVERY-SYSTEM", title: "Discovery Is Canonical Studio Content", decision: "Discovery records, categories, subcategories, rarities, spawn rules, asset profiles, collections, chains, milestones, and encyclopedia links are Studio-owned canonical content. Player collection state remains game-owned.", reason: "Discovery touches exploration, progression, assets, lore, and runtime exports, so it needs one canonical source of truth without leaking player save state into Studio exports.", date: "2026-07-15", affectedSystems: ["Discovery", "Civilization Encyclopedia", "Asset Library", "Creative Production", "Runtime", "Exports", "Game Saves"], status: "Accepted", supersededBy: null, linkedSectionIds: ["discovery", "studio", "runtime", "asset-standards", "player-systems"] },
  { id: "ARCH-DECISION-UNIVERSAL-DISCOVERY-REGISTRY", title: "Verified First Discoveries Become Permanent Universal History", decision: "Eligible generated universe objects have stable canonical object IDs. The first valid server-verified discovery claim creates a permanent Universal Discovery Registry record. Future players receive the same discovery attribution and approved naming metadata.", reason: "NOVERIS needs shared universe history without allowing local clients to award first-discovery status, duplicate permanent claims, mutable-name identity, or private account data exposure.", date: "2026-07-15", affectedSystems: ["Universal Discovery Registry", "Discovery", "Game Backend", "Supabase", "Galactopedia", "Roblox", "Mobile", "Runtime"], status: "Accepted", supersededBy: null, linkedSectionIds: ["discovery", "runtime", "supabase", "cloud-saves", "player-systems"] },
  { id: "ARCH-DECISION-TIME-PRIMARY", title: "Time Is the Primary Progression Resource", decision: "All meaningful NOVERIS actions require time unless explicitly designated as instant. Research, exploration, scanning, surveying, construction, harvesting, colonization, terraforming, manufacturing, expeditions, discovery, and other long-term systems progress through the shared Time Action Contract.", reason: "Time creates strategic pacing, preserves gameplay depth, allows research/upgrades/AI Agents/buildings/civilization bonuses to matter, and keeps Premium Crystals as acceleration rather than full progression bypass.", date: "2026-07-16", affectedSystems: ["Runtime", "Planet", "Discovery", "Research", "AI Agents", "Economy", "Premium Crystals", "Game"], status: "Accepted", supersededBy: null, linkedSectionIds: ["runtime", "planet", "discovery", "research", "player-systems"] },
  { id: "ARCH-DECISION-CANONICAL-ACTION-FRAMEWORK", title: "All Meaningful Gameplay Uses the Canonical Action Framework", decision: "Every meaningful gameplay activity is represented by a canonical Action Definition. Systems may specialize Actions through typed requirements, inputs, outputs, phases, duration policies, modifiers, queue rules, automation policies, and completion effects, but they may not create incompatible parallel action engines.", reason: "A single action framework prevents each gameplay feature from inventing its own timer, queue, requirement, reward, automation, acceleration, history, and event model.", date: "2026-07-16", affectedSystems: ["Runtime", "Actions", "Exploration", "Research", "Buildings", "Colonies", "Trade", "Travel", "AI Agents", "Premium Crystals", "Game"], status: "Accepted", supersededBy: null, linkedSectionIds: ["runtime", "studio", "game", "research", "planet", "discovery", "player-systems"] },
  { id: "ARCH-DECISION-CLIENT-RESPONSIBILITIES", title: "Client Responsibility Matrix Needs Expansion", decision: "Document exact responsibilities for Web, Roblox, iOS, Android, Unity, Unreal, and Godot before deeper client work.", reason: "Multiple clients now consume Studio data, and boundaries need to stay explicit.", date: "2026-07-14", affectedSystems: ["Clients", "Runtime", "Exports"], status: "Proposed", supersededBy: null, linkedSectionIds: ["game", "roblox", "mobile", "release-targets"] }
];

export function validateArchitectureState(state: ArchitectureState): ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];
  const sectionIds = new Set(state.sections.map((item) => item.id));
  for (const required of architectureSectionIds) {
    if (!sectionIds.has(required)) {
      issues.push({ severity: "error", code: "missing_architecture_section", message: `Missing Architecture section: ${required}.`, records: [required] });
    }
  }
  for (const section of state.sections) {
    if (!section.title || !section.summary || !section.content.length) {
      issues.push({ severity: "error", code: "incomplete_architecture_section", message: `Architecture section ${section.id} is missing title, summary, or content.`, records: [section.id] });
    }
    for (const reference of section.references) {
      if (!sectionIds.has(reference) && !["runtime", "studio", "game"].includes(reference)) {
        issues.push({ severity: "error", code: "broken_architecture_reference", message: `Architecture section ${section.id} references unknown section ${reference}.`, records: [section.id, reference] });
      }
    }
  }
  for (const decision of state.decisions) {
    for (const linkedSectionId of decision.linkedSectionIds) {
      if (!sectionIds.has(linkedSectionId)) {
        issues.push({ severity: "error", code: "broken_decision_link", message: `Decision ${decision.id} links to missing section ${linkedSectionId}.`, records: [decision.id, linkedSectionId] });
      }
    }
    if (decision.supersededBy && !state.decisions.some((item) => item.id === decision.supersededBy)) {
      issues.push({ severity: "error", code: "broken_superseded_by", message: `Decision ${decision.id} supersededBy does not resolve.`, records: [decision.id, decision.supersededBy] });
    }
  }
  if (!state.supportedClients.includes("Web") || !state.supportedClients.includes("Roblox") || !state.supportedClients.includes("iOS") || !state.supportedClients.includes("Android")) {
    issues.push({ severity: "error", code: "missing_supported_client", message: "Architecture must document Web, Roblox, iOS, and Android clients.", records: state.supportedClients });
  }
  if (!state.codexHandoffRule.includes("Architecture wins")) {
    issues.push({ severity: "error", code: "missing_codex_handoff_rule", message: "Architecture must include the Codex handoff conflict rule.", records: ["codexHandoffRule"] });
  }
  if (!state.runtimeSafetyRule.includes("not runtime gameplay")) {
    issues.push({ severity: "error", code: "missing_runtime_safety_rule", message: "Architecture must state that it is documentation and not runtime gameplay.", records: ["runtimeSafetyRule"] });
  }
  return issues;
}

export async function getArchitectureState(): Promise<ArchitectureState> {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const outstanding = architectureDecisions.filter((decision) => decision.status === "Proposed" || decision.status === "Needs Review");
  const currentSections = architectureSections.filter((item) => item.status === "Current").length;
  const healthScore = Math.round((currentSections / architectureSections.length) * 100);
  return {
    gameName: "NOVERIS",
    tagline: "The Future We Build",
    mission: "Humanity's future is shaped through the player's choices.",
    architectureVersion,
    currentRuntimeVersion: runtime.metadata.schemaVersion,
    currentContentVersion: runtime.metadata.contentVersion,
    currentSaveVersion: "save-schema-v1",
    supportedClients: ["Web", "Roblox", "iOS", "Android", "Unity", "Unreal", "Godot"],
    architectureHealth: outstanding.length ? "Needs Review" : "Healthy",
    healthScore,
    lastUpdated: "2026-07-14",
    sections: architectureSections,
    decisions: architectureDecisions,
    recentDecisions: architectureDecisions.slice(0, 6),
    outstandingDecisions: outstanding,
    searchTags: ["Topic", "System", "Client", "Decision", "Component", "Economy", "AI", "Runtime", "Mobile"],
    codexHandoffRule: "Every generated Codex prompt should begin with: Read Architecture Workspace. Follow Architecture. If implementation conflicts with Architecture: Architecture wins.",
    runtimeSafetyRule: "Architecture is authoritative project documentation, not runtime gameplay. Only explicit canonical gameplay definitions become runtime."
  };
}

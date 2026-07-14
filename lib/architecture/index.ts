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
  section("studio", "Studio", "Architecture", "Project Genesis Studio is the authoritative source of truth for NOVERIS content and architecture.", ["Studio owns resources, research, economy, assets, AI Agents, screen layouts, component standards, and runtime payloads.", "Studio-authored definitions are reviewed, validated, and published before clients use them."], ["Studio", "Authoring", "Validation"]),
  section("game", "Game", "Client", "The Web/Vite game consumes Studio runtime data and implements presentation and simulation from approved contracts.", ["Game owns player experience, save state, client simulation, and user interaction.", "Game does not fork gameplay definitions from Studio.", "Game should fall back only when a Studio-driven replacement is not verified."], ["Web Game", "Runtime", "Save State"], ["Web"]),
  section("roblox", "Roblox", "Client", "Roblox remains an export target and client implementation, not the source of truth.", ["Roblox consumes approved Studio/API data.", "Keep existing Roblox modules as fallback until Studio-driven replacements are verified.", "Roblox asset IDs are mappings, not canonical art identity."], ["Roblox", "Exports", "Assets"], ["Roblox"]),
  section("mobile", "Mobile", "Client", "Mobile is landscape-first, safe-area aware, touch-first, and prepared for Capacitor, StoreKit, and Google Billing.", ["Main gameplay is landscape.", "Safe areas and notches are first-class layout constraints.", "Touch targets must remain readable and reachable.", "Lifecycle, offline resume, account flows, and purchase verification are client responsibilities guided by Studio profiles."], ["Mobile", "iOS", "Android", "Capacitor"], ["iOS", "Android"]),
  section("supabase", "Supabase", "Infrastructure", "Studio Supabase and Game Supabase are separate databases.", ["Studio Supabase and Game Supabase are separate databases.", "Studio owns content and authoring data.", "Game owns players, saves, purchases, and live player state.", "Do not expose Studio secrets or authoring data to clients.", "Document tables before new data moves between Studio and Game."], ["Supabase", "Database", "Security"], ["Studio", "Web", "iOS", "Android"]),
  section("cloud-saves", "Cloud Saves", "Infrastructure", "Cloud saves belong to the Game domain, not Studio content authoring.", ["Support guest mode.", "Support account conversion.", "Support conflict resolution.", "Preserve earned balances and player-owned state during migrations."], ["Saves", "Player Data", "Accounts"], ["Web", "iOS", "Android"]),
  section("ui-standards", "UI Standards", "Presentation", "NOVERIS UI should preserve pixel-perfect Roblox parity where approved artwork defines coordinates.", ["Backgrounds define coordinates.", "Do not use generic flex spacing over HUD artwork.", "Use absolute coordinate manifests for art-backed screens.", "Panels, buttons, typography, and spacing should be componentized."], ["UI", "HUD", "Roblox Parity"], ["Studio", "Web", "Roblox", "iOS", "Android"]),
  section("ux-standards", "UX Standards", "Presentation", "The dashboard should feel like Civilization Command: clear, visual, and production-grade.", ["Do not bury primary actions.", "Locked actions explain requirements.", "Studio production actions are separate from gameplay unlocks.", "Search, filters, and details should reveal complexity progressively."], ["UX", "Dashboard", "Workspaces"]),
  section("screen-standards", "Screen Standards", "Presentation", "Screen Designer defines screens before implementation and parity approval.", ["Workflow: Screen Designer -> Approved -> Game -> Parity -> Approved.", "Every major screen tracks data requirements, assets, states, interactions, mobile readiness, and implementation targets."], ["Screen Designer", "Game UI"], ["Studio", "Web", "Roblox", "iOS", "Android"]),
  section("component-standards", "Component Standards", "Presentation", "Components are reusable contracts referenced by screens.", ["Screens reference components.", "Do not duplicate component behavior per screen.", "Components track variants, states, accessibility, mobile readiness, previews, and parity notes."], ["Component Library", "Screen Designer"], ["Studio", "Web", "Roblox", "iOS", "Android"]),
  section("asset-standards", "Asset Standards", "Production", "Asset pipeline flows from private source to approved derivatives to published runtime mappings.", ["Source -> Derivatives -> Preview -> Published -> Runtime.", "PSD, PSB, SVG, PNG, WebP, Roblox, iOS, and Android mappings are tracked separately.", "Never expose private local paths or source masters in public runtime exports."], ["Assets", "Runtime", "Roblox Art", "Web Art"]),
  section("animation-standards", "Animation Standards", "Presentation", "Animation metadata should be declarative, reduced-motion aware, and client-implementable.", ["Blink and idle profiles belong in Studio definitions.", "Clients implement animation using exported timing and state metadata.", "Reduced motion must have a defined static treatment."], ["Animation", "AI Agents", "Mobile"]),
  section("ai-agent", "AI Agent", "Gameplay Presentation", "AI Agent replaces Auto Click as the player-facing companion while automation remains underneath.", ["AI Agent replaces Auto Click.", "Player-facing labels: AI Agent, Labor Assistance, Agent Online, Agent Offline.", "AI Agent supports customization, robot heads, blinking, future personalities, future dialogue, and future voice profiles.", "Automation IDs remain stable for saves and balance.", "Component Library references the AI Agent rather than a fixed robot PNG."], ["AI Agents", "Automation", "Components"], ["Studio", "Web", "Roblox", "iOS", "Android"], "Current", ["runtime", "component-standards"]),
  section("player-systems", "Player Systems", "Gameplay", "Player-owned data belongs to clients/game services, while Studio defines canonical content.", ["Player preferences include selectedAiAgentId.", "Player saves and balances are game-owned.", "Studio may publish schemas and migration hints, but not player records."], ["Player", "Saves", "Preferences"]),
  section("civilization-systems", "Civilization Systems", "Gameplay", "Civilization progress is the strategic wrapper around eras, research, economy, planets, and production.", ["Civilization Command is the main dashboard.", "Era progression shapes economy labels and unlocks.", "Civilization systems should stay tied to canonical runtime definitions."], ["Civilization", "Eras", "Progression"]),
  section("research", "Research", "Gameplay", "Research and unlock matrix gate progression and feature access.", ["Use existing research and unlock_matrix data.", "Scanning, claiming, colonizing, and intergalactic travel are gated by research unlocks.", "Clients should not invent feature gates."], ["Research", "Unlock Matrix"]),
  section("galaxy", "Galaxy", "Universe", "Galaxy -> Sector -> Star System -> Planet remains intact.", ["Milky Way is effectively unlimited and generated on demand.", "Other galaxies are procedural, not fixed Andromeda/Triangulum.", "Do not add Region or Cluster."], ["Galaxy", "Sector", "Star System"]),
  section("planet", "Planet", "Universe", "Planets are generated objects with canonical resource IDs and parent links.", ["Planets link to starSystemId, sectorId, and galaxyId.", "Planet resource generation consumes Resource Catalog and Planet Resource Profiles.", "Planet management happens on its own screen."], ["Planets", "Resources", "Colonies"]),
  section("production", "Production", "Production Management", "Production Dashboard tells the team what to build next.", ["Track missing documentation, assets, screens, components, runtime readiness, and pending decisions.", "Architecture health appears in production planning.", "Completed work should reduce outstanding tasks automatically."], ["Production Dashboard", "Tasks", "Architecture"]),
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
  { id: "ARCH-DECISION-MOBILE-FIRST", title: "Mobile Prepared As First-Class Client", decision: "Mobile profiles are landscape-first, safe-area aware, and touch-first.", reason: "NOVERIS is expected to run on iOS and Android, so mobile constraints must shape shared UI contracts early.", date: "2026-07-14", affectedSystems: ["Mobile", "Screen Designer", "Component Library"], status: "Accepted", supersededBy: null, linkedSectionIds: ["mobile", "screen-standards", "component-standards"] },
  { id: "ARCH-DECISION-NOVERIS-BRAND", title: "NOVERIS Branding", decision: "The game name is NOVERIS and the tagline is The Future We Build.", reason: "The project needs a stable public identity for screens, runtime metadata, mobile preparation, and asset production.", date: "2026-07-14", affectedSystems: ["Brand", "Runtime", "Mobile", "Assets"], status: "Accepted", supersededBy: null, linkedSectionIds: ["vision", "release-targets"] },
  { id: "ARCH-DECISION-SUPABASE-SPLIT", title: "Studio And Game Supabase Are Separate", decision: "Studio owns content databases; Game owns players and saves.", reason: "Content authoring and player data have different access, security, and release requirements.", date: "2026-07-14", affectedSystems: ["Supabase", "Cloud Saves", "Security"], status: "Accepted", supersededBy: null, linkedSectionIds: ["supabase", "cloud-saves"] },
  { id: "ARCH-DECISION-PLANET-MANAGEMENT", title: "Planet Management Is Separate From Civilization Command", decision: "Civilization Command is the main dashboard and each planet has its own management screen.", reason: "The dashboard should stay strategic while planet-specific management can be deep and local.", date: "2026-07-14", affectedSystems: ["Dashboard", "Planet", "UX"], status: "Accepted", supersededBy: null, linkedSectionIds: ["hierarchy", "planet", "ux-standards"] },
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

import type { ExperienceAttachment, ExperienceDesignStatus, ExperienceHistoryEntry, ExperienceRelationship } from "@/lib/experience-design";

export type ExperienceBibleSectionType =
  | "prose"
  | "principle"
  | "callout"
  | "quote"
  | "image"
  | "image_gallery"
  | "comparison"
  | "do_do_not"
  | "checklist"
  | "reference"
  | "concept_link"
  | "mood_board_link"
  | "screen_link"
  | "material_link"
  | "token_link"
  | "experience_moment_link"
  | "table"
  | "annotation"
  | "open_question"
  | "decision"
  | "implementation_guidance";

export type ExperienceBibleBodySection = {
  id: string;
  type: ExperienceBibleSectionType;
  title: string;
  summary: string;
  content: string;
  relationships: ExperienceRelationship[];
  status: ExperienceDesignStatus;
};

export type ExperienceBiblePart = {
  id: string;
  roman: string;
  title: string;
  summary: string;
  order: number;
};

export type ExperienceBibleChapter = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  partId: string;
  chapterNumber: number;
  summary: string;
  purpose: string;
  canonicalStatus: "Draft" | "Canonical" | "Deprecated" | "Archived";
  reviewStatus: ExperienceDesignStatus | "Changes Requested";
  author: string;
  owner: string;
  reviewers: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  tags: string[];
  keywords: string[];
  bodySections: ExperienceBibleBodySection[];
  designPrinciples: string[];
  mustAlways: string[];
  mustNever: string[];
  references: Array<{ id: string; label: string; type: "asset" | "external" | "website_snapshot" | "design_reference"; target: string; notes: string }>;
  attachments: ExperienceAttachment[];
  linkedMoodBoards: string[];
  linkedConcepts: string[];
  linkedScreens: string[];
  linkedComponents: string[];
  linkedMaterials: string[];
  linkedTokens: string[];
  linkedThemes: string[];
  linkedExperienceMoments: string[];
  platformNotes: string[];
  accessibilityNotes: string[];
  implementationNotes: string[];
  openQuestions: string[];
  reviewNotes: string[];
  changeHistory: ExperienceHistoryEntry[];
};

export type ExperienceBibleRelease = {
  id: "DV-02" | "DV-02B" | "DV-02C" | "DV-03" | "DV-04" | "DS-02" | "DS-03" | "DS-04";
  version: "0.1";
  status: "Draft";
  title: string;
  createdAt: string;
  chapterIds: string[];
  notes: string[];
};

export type ExperienceBibleSignature = {
  id: "DV-02C";
  title: "The NOVERIS Signature";
  version: "0.1";
  status: "Draft";
  createdAt: string;
  purpose: string;
  signatureStatement: string;
  expands: string[];
  boundaries: string[];
  tags: string[];
  keywords: string[];
  sections: ExperienceBibleBodySection[];
  futureRelationships: Array<{ id: string; label: string; notes: string }>;
  reviewNotes: string[];
  changeHistory: ExperienceHistoryEntry[];
};

export type ExperienceBibleVisualDna = {
  id: "DV-03";
  title: "Visual DNA";
  version: "0.1";
  status: "Draft";
  createdAt: string;
  purpose: string;
  visualDnaStatement: string;
  expands: string[];
  inheritedBy: string[];
  boundaries: string[];
  tags: string[];
  keywords: string[];
  sections: ExperienceBibleBodySection[];
  futureRelationships: Array<{ id: string; label: string; notes: string }>;
  reviewNotes: string[];
  changeHistory: ExperienceHistoryEntry[];
};

export type ExperienceBibleState = {
  id: "DV-02";
  title: "The NOVERIS Experience Bible";
  version: "0.1";
  status: "Draft";
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  parts: ExperienceBiblePart[];
  chapters: ExperienceBibleChapter[];
  release: ExperienceBibleRelease;
  contentReleases: ExperienceBibleRelease[];
  signature: ExperienceBibleSignature;
  visualDna: ExperienceBibleVisualDna;
  governanceRules: string[];
  noverisLifeReferenceFramework: {
    enabled: true;
    supportedReferenceTypes: string[];
    guidance: string[];
  };
  sectionTypes: ExperienceBibleSectionType[];
};

const createdAt = "2026-07-16T00:00:00.000Z";

export const experienceBibleParts: ExperienceBiblePart[] = [
  part("part-01-soul-of-noveris", "I", "The Soul of NOVERIS", "Creative foundation, promise, philosophy, emotional pillars, and boundaries.", 1),
  part("part-02-visual-dna", "II", "Visual DNA", "Cinematic language, color, light, atmosphere, materials, scale, and form.", 2),
  part("part-03-experience-and-interaction", "III", "Experience and Interaction", "Interface, navigation, HUD, motion, feedback, accessibility, and platform adaptation.", 3),
  part("part-04-player-journey", "IV", "The Player Journey", "Milestone moments from first launch through civilization legacy.", 4),
  part("part-05-screen-and-world-application", "V", "Screen and World Application", "Application guidance for major screens, systems, and world contexts.", 5),
  part("part-06-brand-and-presentation", "VI", "Brand and Presentation", "NOVERIS brand identity, website continuity, typography, logo, and presentation language.", 6),
  part("part-07-creative-governance", "VII", "Creative Governance", "Approval, versioning, canonical status, change control, reference rules, and quality bar.", 7)
];

const chapterSeeds: Array<[number, string, string]> = [
  [1, "part-01-soul-of-noveris", "The Future We Build"],
  [2, "part-01-soul-of-noveris", "The Promise to the Player"],
  [3, "part-01-soul-of-noveris", "Core Creative Philosophy"],
  [4, "part-01-soul-of-noveris", "Emotional Pillars"],
  [5, "part-01-soul-of-noveris", "Humanity's Role"],
  [6, "part-01-soul-of-noveris", "What NOVERIS Is"],
  [7, "part-01-soul-of-noveris", "What NOVERIS Is Not"],
  [8, "part-02-visual-dna", "Cinematic Language"],
  [9, "part-02-visual-dna", "Color Philosophy"],
  [10, "part-02-visual-dna", "Light as Storytelling"],
  [11, "part-02-visual-dna", "Atmosphere and Depth"],
  [12, "part-02-visual-dna", "Materials"],
  [13, "part-02-visual-dna", "Scale and Composition"],
  [14, "part-02-visual-dna", "Environmental Storytelling"],
  [15, "part-02-visual-dna", "Architecture and Civilization Form"],
  [16, "part-02-visual-dna", "Technology and Interface Form"],
  [17, "part-03-experience-and-interaction", "The Interface Is Part of the World"],
  [18, "part-03-experience-and-interaction", "Information Hierarchy"],
  [19, "part-03-experience-and-interaction", "Navigation"],
  [20, "part-03-experience-and-interaction", "HUD Philosophy"],
  [21, "part-03-experience-and-interaction", "Motion and Transition"],
  [22, "part-03-experience-and-interaction", "Feedback and Response"],
  [23, "part-03-experience-and-interaction", "Accessibility"],
  [24, "part-03-experience-and-interaction", "Platform Adaptation"],
  [25, "part-04-player-journey", "First Launch"],
  [26, "part-04-player-journey", "First Discovery"],
  [27, "part-04-player-journey", "First Planet"],
  [28, "part-04-player-journey", "First Survey"],
  [29, "part-04-player-journey", "First Colony"],
  [30, "part-04-player-journey", "First Research Breakthrough"],
  [31, "part-04-player-journey", "First Major Expansion"],
  [32, "part-04-player-journey", "First Megastructure"],
  [33, "part-04-player-journey", "Intergalactic Travel"],
  [34, "part-04-player-journey", "Civilization Legacy"],
  [35, "part-05-screen-and-world-application", "Startup and Loading"],
  [36, "part-05-screen-and-world-application", "Civilization Command"],
  [37, "part-05-screen-and-world-application", "Galaxy"],
  [38, "part-05-screen-and-world-application", "Sector"],
  [39, "part-05-screen-and-world-application", "Star System"],
  [40, "part-05-screen-and-world-application", "Planet"],
  [41, "part-05-screen-and-world-application", "Colony"],
  [42, "part-05-screen-and-world-application", "Discovery"],
  [43, "part-05-screen-and-world-application", "Research"],
  [44, "part-05-screen-and-world-application", "Population"],
  [45, "part-05-screen-and-world-application", "Economy and Logistics"],
  [46, "part-05-screen-and-world-application", "Missions and Expeditions"],
  [47, "part-05-screen-and-world-application", "Dynamic Events"],
  [48, "part-05-screen-and-world-application", "Encyclopedia and Timeline"],
  [49, "part-05-screen-and-world-application", "Settings and Accessibility"],
  [50, "part-06-brand-and-presentation", "NOVERIS Brand Identity"],
  [51, "part-06-brand-and-presentation", "noveris.life Translation"],
  [52, "part-06-brand-and-presentation", "Game and Website Continuity"],
  [53, "part-06-brand-and-presentation", "Marketing and Storefront"],
  [54, "part-06-brand-and-presentation", "Trailer and Presentation Language"],
  [55, "part-06-brand-and-presentation", "Typography in Brand Context"],
  [56, "part-06-brand-and-presentation", "Logo and Symbol Use"],
  [57, "part-07-creative-governance", "Approval Workflow"],
  [58, "part-07-creative-governance", "Versioning"],
  [59, "part-07-creative-governance", "Canonical Status"],
  [60, "part-07-creative-governance", "Change Control"],
  [61, "part-07-creative-governance", "Deprecation"],
  [62, "part-07-creative-governance", "Reference and Inspiration Rules"],
  [63, "part-07-creative-governance", "AI-Assisted Design Governance"],
  [64, "part-07-creative-governance", "Design Quality Bar"],
  [65, "part-07-creative-governance", "Experience Bible Release Checklist"]
];

export const experienceBibleGovernanceRules = [
  "Approved Experience Bible chapters are canonical creative guidance.",
  "Implementation prompts must reference approved chapters when making creative or presentation changes.",
  "Draft chapters cannot silently become implementation authority.",
  "Game code may temporarily diverge, but divergence must be documented.",
  "Gameplay truth remains governed by gameplay systems.",
  "Design guidance cannot invent gameplay mechanics.",
  "Visual concepts cannot imply unavailable player actions.",
  "AI-generated concepts require review.",
  "Inspiration must not become direct imitation.",
  "Copyrighted references are guidance, not source material.",
  "noveris.life is a brand benchmark, not a literal one-to-one game layout."
];

export const experienceBibleSectionTypes: ExperienceBibleSectionType[] = [
  "prose",
  "principle",
  "callout",
  "quote",
  "image",
  "image_gallery",
  "comparison",
  "do_do_not",
  "checklist",
  "reference",
  "concept_link",
  "mood_board_link",
  "screen_link",
  "material_link",
  "token_link",
  "experience_moment_link",
  "table",
  "annotation",
  "open_question",
  "decision",
  "implementation_guidance"
];

type AuthoredPartIChapter = {
  subtitle: string;
  summary: string;
  purpose: string;
  bodySections: Array<Omit<ExperienceBibleBodySection, "id" | "relationships" | "status">>;
  designPrinciples: string[];
  mustAlways: string[];
  mustNever: string[];
  keywords: string[];
  creativeNotes: string[];
  futureConsiderations: string[];
};

const visualExperiencePillars = [
  {
    title: "Civilization Before Technology",
    content: "Technology supports civilization. Technology is not the hero by itself; its meaning comes from the futures it allows humanity to build, protect, understand, and inherit."
  },
  {
    title: "The Universe Is Always Present",
    content: "The player should retain awareness of place, scale, and environment. The world should not disappear behind software-like UI, even when systems become deep."
  },
  {
    title: "Monumental Human Achievement",
    content: "Civilization should feel engineered, intentional, durable, and worthy of long-term investment. Nothing should feel temporary without narrative or systemic reason."
  },
  {
    title: "Light Represents Progress",
    content: "As civilization advances, environments may become warmer, brighter, more refined, and more ordered. Darkness represents distance, mystery, and the unknown, not fear by default."
  },
  {
    title: "Calm Intelligence",
    content: "The experience should feel deliberate and controlled. Complexity should increasingly feel mastered. The player should feel capable, not frantic."
  }
];

const noverisSignatureFutureGuidance = "Future DV-02C and DV-03 elaboration should explore monumental civilization architecture, deep-space navy environments, warm amber and gold civilization light, restrained cyan technology light, rare violet advanced energy, celestial geometry, orbital arcs, navigation lines, worlds dominating composition, projected world-space interface language, scale before detail, hopeful futurism, and calm intelligence without defining final token values here.";

const partIAuthoredContent: Record<string, AuthoredPartIChapter> = {
  "The Future We Build": {
    subtitle: "The philosophical north star for NOVERIS.",
    summary: "NOVERIS is about the future humanity chooses to build through discovery, stewardship, science, civilization, and long-term progress.",
    purpose: "Define the central promise that guides every future visual, interactive, narrative, audio, and presentation decision.",
    bodySections: [
      section("prose", "Why NOVERIS Exists", "NOVERIS exists to make the future feel buildable.", "The experience should begin from a simple belief: humanity can look outward, learn, create, and leave something better behind. The game is not a warning about collapse. It is a design space for possibility, responsibility, invention, and patience."),
      section("principle", "Humanity's Future", "The future is authored through care and intelligence.", "Every major creative choice should imply that civilization is something players shape over time. Progress is not noise, extraction, or spectacle by itself. Progress has direction when it expands knowledge, improves life, protects worlds, and opens new horizons."),
      section("principle", "Discovery and Stewardship", "Discovery should create responsibility, not ownership fantasy alone.", "The unknown should feel inviting and consequential. When players reveal a world, resource, anomaly, or system, the experience should suggest a broader relationship: understand it, preserve what matters, build carefully, and choose what kind of civilization follows."),
      section("callout", "Long-Term Thinking", "The game should reward patience and vision.", "NOVERIS should feel comfortable with centuries, legacy, and systems that mature over time. The player is not just reacting to a crisis. They are cultivating a civilization whose meaning becomes clearer through sustained choices."),
      section("principle", "Core Principles", "The chapter closes with operating principles.", "Build from hope. Treat science as wonder. Treat civilization as responsibility. Let progress feel earned, legible, and humane."),
      section("checklist", "Must Always", "Required creative behavior.", "Always frame the future as constructible, beautiful, and worth caring for. Always connect scale to human purpose. Always let discovery lead to knowledge and better decisions."),
      section("checklist", "Must Never", "Protected boundaries.", "Never drift into grim fatalism, nihilism, or conquest-first fantasy. Never use complexity to intimidate. Never treat planets, people, or discoveries as disposable decoration."),
      section("annotation", "Creative Notes", "Practical authoring note.", "The tone should be confident and clear, not sentimental. The game can contain challenge, danger, and loss, but those elements should sharpen the value of building rather than define the whole identity."),
      section("open_question", "Future Considerations", "Questions for later review.", "Which approved visual references best communicate civilization-scale optimism without becoming marketing imagery?")
    ],
    designPrinciples: ["Build from hope", "Discovery creates responsibility", "Progress should feel earned", "Scale must retain human purpose"],
    mustAlways: ["Connect exploration to stewardship", "Use clarity as a creative value", "Preserve the optimistic civilization north star"],
    mustNever: ["Center despair as the main fantasy", "Treat conquest as the default expression of progress", "Use spectacle without purpose"],
    keywords: ["future", "optimism", "stewardship", "civilization", "discovery", "progress", "legacy"],
    creativeNotes: ["Tone should be confident, practical, and future-facing."],
    futureConsiderations: ["Link approved Part II visual references when authored."]
  },
  "The Promise to the Player": {
    subtitle: "The emotional contract of the experience.",
    summary: "Players should feel wonder, curiosity, hope, mastery, purpose, legacy, confidence, accomplishment, and scale without being overwhelmed.",
    purpose: "Define what players should feel before any mechanics, screens, or systems are discussed.",
    bodySections: [
      section("prose", "The Emotional Contract", "Players should feel capable inside something vast.", "NOVERIS should invite players into a universe larger than themselves while steadily proving that their decisions matter. The experience should create awe without helplessness, depth without confusion, and ambition without pressure to rush."),
      section("principle", "Wonder and Curiosity", "Wonder opens the door; curiosity keeps it open.", "The first emotional movement is not urgency. It is attention. Players should want to know what something is, why it matters, and what kind of future it makes possible."),
      section("principle", "Hope and Purpose", "Progress should feel morally and creatively meaningful.", "The player should feel that building, researching, exploring, and organizing are worthwhile because they expand possibility. Purpose comes from shaping a civilization, not checking boxes."),
      section("principle", "Mastery and Confidence", "Complexity should become understandable.", "Systems may be deep, but the experience should help players feel increasingly fluent. A good NOVERIS screen or interaction makes the player feel smarter after using it."),
      section("principle", "Core Principles", "The chapter closes with operating principles.", "Lead with emotion before systems. Make scale readable. Let accomplishment feel calm, durable, and earned."),
      section("checklist", "Must Always", "Required emotional outcomes.", "Always support wonder, curiosity, hope, mastery, purpose, legacy, confidence, accomplishment, and scale. Always help the player feel oriented."),
      section("checklist", "Must Never", "Protected boundaries.", "Never make the player feel punished for curiosity. Never rely on confusion to imply depth. Never reduce the promise to timers, rewards, or dashboards."),
      section("annotation", "Creative Notes", "Practical authoring note.", "This promise is emotional, not mechanical. Any mechanic can support it, but mechanics do not define it here."),
      section("open_question", "Future Considerations", "Questions for later review.", "Which first-session moments best prove the promise before deeper systems appear?")
    ],
    designPrinciples: ["Emotion precedes mechanics", "Depth should become fluency", "Accomplishment should feel durable"],
    mustAlways: ["Make the player feel oriented", "Reward curiosity with understanding", "Connect scale to agency"],
    mustNever: ["Mistake clutter for depth", "Make hope feel naive", "Explain the promise through mechanics alone"],
    keywords: ["wonder", "curiosity", "hope", "mastery", "purpose", "legacy", "confidence", "scale"],
    creativeNotes: ["Use this chapter to evaluate whether an experience moment feels like NOVERIS."],
    futureConsiderations: ["Map approved Experience Moments to these emotions."]
  },
  "Core Creative Philosophy": {
    subtitle: "How NOVERIS thinks.",
    summary: "Technology serves humanity, civilization serves discovery, discovery creates knowledge, and knowledge builds civilization.",
    purpose: "Define the practical creative philosophy that keeps NOVERIS empowering rather than overwhelming.",
    bodySections: [
      section("prose", "A Constructive Philosophy", "NOVERIS should make intelligence feel useful.", "The game should celebrate systems, tools, automation, research, and civilization because they help people understand and shape a larger universe. Technology is not cold decoration. It is an extension of human care and curiosity."),
      section("principle", "Technology Serves Humanity", "Technology is purposeful.", "Interfaces, machines, ships, probes, and infrastructure should feel designed to extend human capability. They should not make humanity feel obsolete or small."),
      section("principle", "Civilization Serves Discovery", "Civilization is a platform for understanding.", "The point of building is not accumulation alone. Civilization makes better questions possible: what is out there, what can be learned, and what kind of future can be sustained?"),
      section("principle", "Knowledge Builds Civilization", "Discovery and knowledge should feed back into growth.", "Learning should change what civilization can imagine and responsibly attempt. The creative loop is discovery, knowledge, design, and construction."),
      section("principle", "Core Principles", "The chapter closes with operating principles.", "Make complexity legible. Make tools humane. Make knowledge feel active. Make automation feel like assistance, not replacement of player meaning."),
      section("checklist", "Must Always", "Required creative behavior.", "Always show that systems exist to serve a larger human purpose. Always make complex ideas approachable through structure and presentation."),
      section("checklist", "Must Never", "Protected boundaries.", "Never let systems feel like admin software. Never imply that technology matters more than the civilization it supports. Never make automation erase the player's role."),
      section("annotation", "Creative Notes", "Practical authoring note.", "This chapter should guide UI language, AI Agent tone, research presentation, automation, and system onboarding."),
      section("open_question", "Future Considerations", "Questions for later review.", "How should future AI Agent personalities express assistance without replacing player authorship?")
    ],
    designPrinciples: ["Technology serves humanity", "Civilization serves discovery", "Knowledge builds civilization", "Complexity should become understandable"],
    mustAlways: ["Frame automation as assistance", "Make systems readable", "Connect research to human advancement"],
    mustNever: ["Make the interface feel like enterprise admin software", "Celebrate technology without purpose", "Let complexity become intimidation"],
    keywords: ["technology", "humanity", "knowledge", "civilization", "automation", "research", "systems"],
    creativeNotes: ["This chapter is the best test for whether a system presentation is NOVERIS or merely functional."],
    futureConsiderations: ["Link future AI Agent, Research, and Economy screen definitions."]
  },
  "Emotional Pillars": {
    subtitle: "The feelings every NOVERIS experience should protect.",
    summary: "The emotional pillars are Wonder, Discovery, Progress, Beauty, Scale, Hope, Achievement, Legacy, Intelligence, and Optimism.",
    purpose: "Define each emotional pillar with purpose, importance, visual implications, and interaction implications.",
    bodySections: [
      section("principle", "Wonder", "Purpose: create attentive awe.", "Wonder matters because it makes the player pause and care. Visuals should use depth, light, composition, and reveal. Interactions should avoid rushing the player past meaningful moments."),
      section("principle", "Discovery", "Purpose: turn the unknown into knowledge.", "Discovery matters because it gives exploration meaning. Visuals should suggest partial information becoming clear. Interactions should make scanning, cataloging, and revealing feel intentional."),
      section("principle", "Progress", "Purpose: make growth visible and understandable.", "Progress matters because long-term games need trust. Visuals should show advancement with restraint and clarity. Interactions should make the next meaningful step easy to understand."),
      section("principle", "Beauty", "Purpose: make the future worth protecting.", "Beauty matters because it gives stewardship emotional weight. Visuals should seek elegance, atmosphere, and contrast. Interactions should protect moments of appreciation."),
      section("principle", "Scale", "Purpose: place human choice inside vast systems.", "Scale matters because civilization should feel consequential. Visuals should show distance, hierarchy, and proportion. Interactions should let players zoom from cosmic context to specific decisions without losing orientation."),
      section("principle", "Hope", "Purpose: keep challenge constructive.", "Hope matters because NOVERIS is not despair-driven. Visuals should avoid hostile default tone. Interactions should make recovery, improvement, and better choices visible."),
      section("principle", "Achievement", "Purpose: honor what the player built.", "Achievement matters because effort should leave a trace. Visuals should make milestones feel real. Interactions should acknowledge completion without becoming noisy."),
      section("principle", "Legacy", "Purpose: make time feel meaningful.", "Legacy matters because the game spans long horizons. Visuals should imply continuity. Interactions should connect present choices to future consequences."),
      section("principle", "Intelligence", "Purpose: make the player feel capable.", "Intelligence matters because complexity should reward understanding. Visuals should clarify relationships. Interactions should reveal logic rather than hide it."),
      section("principle", "Optimism", "Purpose: define the overall posture.", "Optimism matters because it keeps the experience constructive. Visuals should favor possibility over decay. Interactions should leave the player feeling that better futures are achievable."),
      section("principle", "Calm Mastery", "Purpose: make complexity feel increasingly controlled.", "Calm Mastery matters because late-game civilization should feel more capable, not more frantic. Visuals should reduce noise as information deepens. Interactions should favor confidence, clear priorities, and stable orientation. Pacing should allow meaningful anticipation. Audio should support focus and controlled momentum. Failure mode: turning advanced play into alert spam, clutter, or panic."),
      section("principle", "Core Principles", "The chapter closes with operating principles.", "Each pillar should appear in visual, interaction, audio, and narrative decisions without becoming a slogan."),
      section("checklist", "Must Always", "Required creative behavior.", "Always protect wonder, discovery, progress, beauty, scale, hope, achievement, legacy, intelligence, optimism, and calm mastery."),
      section("checklist", "Must Never", "Protected boundaries.", "Never let efficiency remove wonder. Never let scale remove intimacy. Never let achievement become empty reward noise."),
      section("annotation", "Creative Notes", "Practical authoring note.", "Not every screen needs every pillar equally, but every major experience should know which pillars it serves."),
      section("open_question", "Future Considerations", "Questions for later review.", "Which pillars should be primary for each major screen definition?")
    ],
    designPrinciples: ["Protect emotional clarity", "Balance scale with agency", "Make beauty functional", "Make intelligence feel inviting", "Let calm mastery emerge from complexity"],
    mustAlways: ["Name the primary emotional pillar for major experiences", "Use visual and interaction design to support the chosen pillar", "Keep optimism present", "Make late-game depth feel controlled rather than frantic"],
    mustNever: ["Use rewards as a substitute for emotion", "Let density erase beauty", "Let scale become disorientation", "Turn advanced play into alert spam"],
    keywords: ["wonder", "discovery", "progress", "beauty", "scale", "hope", "achievement", "legacy", "intelligence", "optimism", "calm mastery"],
    creativeNotes: ["This chapter can become a review checklist for future screens and trailers."],
    futureConsiderations: ["Add pillar mappings to Screen Definitions after screen library authoring expands."]
  },
  "Humanity's Role": {
    subtitle: "Humanity as creator, explorer, and steward.",
    summary: "NOVERIS frames humanity as a constructive civilization capable of exploration, engineering, science, cooperation, and creation.",
    purpose: "Clarify humanity's place in the universe and prevent drift toward collapse-first or desperation-first framing.",
    bodySections: [
      section("prose", "A Constructive Humanity", "Humanity is not defined by ruin.", "NOVERIS should not begin from the assumption that humanity is only surviving its own failure. The human role is to create, explore, learn, cooperate, engineer, and build civilization with responsibility."),
      section("principle", "Creation Over Desperation", "The core posture is constructive.", "Challenge may exist, but the identity is not survival horror, collapse management, or resource misery. The player should feel like a builder of futures, not a scavenger of endings."),
      section("principle", "Science and Cooperation", "Human progress is collaborative.", "Science should feel like shared knowledge, not isolated genius. Cooperation can be expressed through colonies, AI Agents, institutions, infrastructure, and continuity across generations."),
      section("principle", "Engineering as Care", "Building is a form of stewardship.", "Engineering should not be presented only as extraction or expansion. It is how humanity makes hostile distances livable, protects fragile systems, and turns knowledge into durable support."),
      section("principle", "Core Principles", "The chapter closes with operating principles.", "Humanity creates, explores, engineers, studies, cooperates, and remembers. The universe is vast, but the human project remains meaningful."),
      section("checklist", "Must Always", "Required creative behavior.", "Always emphasize creation, exploration, engineering, science, cooperation, and civilization."),
      section("checklist", "Must Never", "Protected boundaries.", "Never define humanity primarily through collapse, desperation, survival panic, or inevitable self-destruction."),
      section("annotation", "Creative Notes", "Practical authoring note.", "Danger can appear, but it should not be the default identity of humanity or the visual language of the whole project."),
      section("open_question", "Future Considerations", "Questions for later review.", "How should civilizations and factions express cooperation without becoming utopian or flat?")
    ],
    designPrinciples: ["Humanity builds", "Science is shared knowledge", "Engineering can express care", "Cooperation supports scale"],
    mustAlways: ["Show humanity as capable", "Connect infrastructure to care", "Let science feel hopeful"],
    mustNever: ["Default to collapse imagery", "Make desperation the core fantasy", "Treat people as abstract counters only"],
    keywords: ["humanity", "creation", "exploration", "engineering", "science", "cooperation", "civilization"],
    creativeNotes: ["This chapter should guide population, colony, AI Agent, and civilization presentation."],
    futureConsiderations: ["Link Civilization Library and Population guidance when those experience chapters are authored."]
  },
  "What NOVERIS Is": {
    subtitle: "The identity of the project.",
    summary: "NOVERIS is a premium civilization builder about a persistent universe, long-term strategy, scientific exploration, idle progression, automation, discovery, and human advancement.",
    purpose: "Define NOVERIS clearly by identity rather than by feature comparison.",
    bodySections: [
      section("prose", "A Premium Civilization Builder", "NOVERIS is built around civilization-scale authorship.", "The experience should feel crafted, deliberate, and worthy of long-term attention. It is a civilization builder where growth, research, exploration, automation, and discovery contribute to a persistent sense of advancement."),
      section("principle", "Persistent Universe", "The universe should feel stable enough to matter.", "Places, discoveries, records, and legacies should feel like they belong to a continuing world. The player is not just clearing temporary screens; they are adding meaning to a universe."),
      section("principle", "Scientific Exploration", "Exploration is a way of knowing.", "NOVERIS treats discovery as more than travel. It is observation, study, classification, interpretation, and responsible action."),
      section("principle", "Idle Progression and Automation", "Time and assistance support civilization scale.", "Idle progression and automation should serve the fantasy of managing a growing civilization over long horizons. They should not make the experience feel disposable or passive."),
      section("principle", "Core Principles", "The chapter closes with operating principles.", "NOVERIS is premium, persistent, strategic, scientific, automated, discoverable, and human-centered."),
      section("checklist", "Must Always", "Required creative behavior.", "Always present NOVERIS as a long-term civilization experience with discovery and human advancement at its core."),
      section("checklist", "Must Never", "Protected boundaries.", "Never reduce NOVERIS to a generic idle dashboard, a resource spreadsheet, or a collection of disconnected upgrade buttons."),
      section("annotation", "Creative Notes", "Practical authoring note.", "This identity should guide store language, onboarding, UI hierarchy, art direction, and future noveris.life continuity."),
      section("open_question", "Future Considerations", "Questions for later review.", "Which approved screenshots best demonstrate premium civilization identity without relying on marketing copy?")
    ],
    designPrinciples: ["Premium craft", "Persistent meaning", "Scientific exploration", "Automation with purpose", "Human advancement"],
    mustAlways: ["Protect the civilization-builder identity", "Make discovery feel scientific", "Make automation feel purposeful"],
    mustNever: ["Become a generic mobile dashboard", "Describe identity only through mechanics", "Let idle progression feel disposable"],
    keywords: ["premium", "civilization builder", "persistent universe", "strategy", "scientific exploration", "idle progression", "automation", "discovery"],
    creativeNotes: ["This chapter is a compact identity reference for product, UX, art, and presentation decisions."],
    futureConsiderations: ["Align future noveris.life translation and storefront chapters to this identity."]
  },
  "What NOVERIS Is Not": {
    subtitle: "Creative boundaries that prevent drift.",
    summary: "NOVERIS is not grimdark, military-first, cyberpunk, post-apocalyptic, resource misery, constant warfare, a generic mobile dashboard, or admin software.",
    purpose: "Protect the creative identity of the project for years by defining clear negative space.",
    bodySections: [
      section("prose", "Why Negative Space Matters", "A strong identity needs boundaries.", "Creative drift often begins with reasonable additions that slowly change the center of a project. This chapter names what NOVERIS is not so future work can evaluate whether a direction supports the promise or quietly replaces it."),
      section("principle", "Not Grimdark or Post-Apocalyptic", "The default tone is not ruin.", "NOVERIS may contain danger, mystery, loss, and hard choices, but it should not adopt despair, decay, or inevitable collapse as its main language."),
      section("principle", "Not Military First or Constant Warfare", "Conflict is not the center.", "The project may later include risk, defense, or political tension, but war should not become the default purpose of civilization."),
      section("principle", "Not Cyberpunk or Resource Misery", "The future is not primarily alienation or scarcity.", "NOVERIS should avoid visual and narrative defaults built around neon cynicism, exploitation, and endless shortage. Its future can be complex without being hopeless."),
      section("principle", "Not Admin Software", "Depth must not look like bureaucracy.", "The Studio may author complex systems, but the player-facing experience should not feel like enterprise tools, generic dashboards, or unloved management panels."),
      section("principle", "Core Principles", "The chapter closes with operating principles.", "Use boundaries to protect the promise. Challenge can exist. Cynicism should not become the brand."),
      section("checklist", "Must Always", "Required creative behavior.", "Always test new concepts against the optimistic civilization identity. Always document intentional divergence."),
      section("checklist", "Must Never", "Protected boundaries.", "Never default to grimdark, military-first, conquest-first, cyberpunk, post-apocalyptic, resource-misery, constant-warfare, generic-dashboard, or admin-software language."),
      section("annotation", "Creative Notes", "Practical authoring note.", "This chapter should be used in reviews when a proposed asset, screen, event, or feature feels impressive but off-identity."),
      section("open_question", "Future Considerations", "Questions for later review.", "What review rubric should flag creative drift before it reaches client implementation?")
    ],
    designPrinciples: ["Boundaries protect identity", "Challenge is allowed but despair is not central", "Depth needs craft", "Conflict is not the core fantasy"],
    mustAlways: ["Name and review intentional tonal divergence", "Keep the future constructive", "Reject generic dashboard presentation"],
    mustNever: ["Use grimdark as default tone", "Make warfare the main progression fantasy", "Let production UI become player-facing identity"],
    keywords: ["not grimdark", "not cyberpunk", "not post apocalyptic", "not admin software", "creative drift", "boundaries"],
    creativeNotes: ["This is the strongest guardrail chapter for future art, UI, events, and marketing."],
    futureConsiderations: ["Create a creative drift checklist in a future governance pass."]
  }
};

export const experienceBibleChapters: ExperienceBibleChapter[] = chapterSeeds.map(([chapterNumber, partId, title]) => {
  const slug = slugify(title);
  const id = `dv02-chapter-${String(chapterNumber).padStart(2, "0")}-${slug}`;
  const authored = partIAuthoredContent[title];
  return {
    id,
    slug,
    title,
    subtitle: authored?.subtitle ?? "Framework chapter awaiting authored content.",
    partId,
    chapterNumber,
    summary: authored?.summary ?? `Defines the Experience Bible framework for ${title}.`,
    purpose: authored?.purpose ?? `Establish canonical creative guidance for ${title} without authoring full chapter content yet.`,
    canonicalStatus: "Draft",
    reviewStatus: "Draft",
    author: "Experience Design",
    owner: ownerForPart(partId),
    reviewers: ["Creative Direction", "UX Direction"],
    version: authored ? "0.1" : "0.1.0",
    createdAt,
    updatedAt: createdAt,
    approvedAt: null,
    tags: ["experience-bible", slug, partId, ...(authored ? ["dv-02b", "part-i-authored"] : [])],
    keywords: [...keywordsFor(title), ...(authored?.keywords ?? [])],
    bodySections: authored ? sectionsForPartIChapter(title, authored).map((bodySection, index) => ({
      ...bodySection,
      id: `${id}-${String(index + 1).padStart(2, "0")}-${slugify(bodySection.title)}`,
      relationships: [],
      status: "Draft"
    })) : [
      {
        id: `${id}-purpose`,
        type: "prose",
        title: "Purpose",
        summary: "Minimal seeded section for chapter authorship.",
        content: `Author the canonical guidance for ${title}.`,
        relationships: [],
        status: "Draft"
      },
      {
        id: `${id}-open-questions`,
        type: "open_question",
        title: "Open Questions",
        summary: "Questions to resolve during future authorship.",
        content: "What approved references, principles, and constraints should this chapter govern?",
        relationships: [],
        status: "Draft"
      }
    ],
    designPrinciples: authored?.designPrinciples ?? [],
    mustAlways: authored?.mustAlways ?? [],
    mustNever: authored?.mustNever ?? [],
    references: authored
      ? [
        { id: `${id}-reference-ds-01`, label: "DS-01 Visual Language", type: "design_reference", target: "DS-01", notes: "Use as visual-language reference; do not duplicate client implementation." },
        { id: `${id}-reference-ed-01`, label: "ED-01 Experience Design Domain", type: "design_reference", target: "ED-01", notes: "Experience Design owns creative guidance, not runtime or rendering." },
        { id: `${id}-reference-dv-02a`, label: "DV-02A Experience Bible Framework", type: "design_reference", target: "DV-02A", notes: "Defines the structured Bible model and review workflow." }
      ]
      : title === "noveris.life Translation"
      ? [{ id: "reference-noveris-life", label: "noveris.life", type: "external", target: "https://noveris.life", notes: "Brand benchmark framework only; do not scrape or duplicate content." }]
      : [],
    attachments: [],
    linkedMoodBoards: [],
    linkedConcepts: [],
    linkedScreens: [],
    linkedComponents: [],
    linkedMaterials: [],
    linkedTokens: [],
    linkedThemes: [],
    linkedExperienceMoments: [],
    platformNotes: [],
    accessibilityNotes: [],
    implementationNotes: ["Game/client implementation remains outside this chapter record.", ...(authored ? ["DV-02B is creative guidance only and does not define gameplay mechanics."] : [])],
    openQuestions: authored?.futureConsiderations ?? ["Which approved references should be linked before review?"],
    reviewNotes: authored ? ["DV-02B authored draft. Review before approving as canonical creative guidance."] : [],
    changeHistory: [
      {
        id: `${id}-seeded`,
        action: "created",
        author: "Experience Design",
        timestamp: createdAt,
        notes: "Seeded DV-02A canonical chapter structure."
      },
      ...(authored ? [{
        id: `${id}-dv-02b-authored`,
        action: "updated" as const,
        author: "Experience Design",
        timestamp: "2026-07-17T00:00:00.000Z",
        notes: "Authored Part I draft content for DV-02B."
      }] : [])
    ]
  };
});

export const experienceBiblePartIRelease: ExperienceBibleRelease = {
  id: "DV-02B",
  version: "0.1",
  status: "Draft",
  title: "The NOVERIS Experience Bible Part I: The Soul of NOVERIS",
  createdAt: "2026-07-17T00:00:00.000Z",
  chapterIds: experienceBibleChapters.filter((chapter) => chapter.partId === "part-01-soul-of-noveris").map((chapter) => chapter.id),
  notes: [
    "Authors Part I chapters 1-7 as draft creative guidance.",
    "Part I defines the identity, philosophy, emotional goals, and creative direction of NOVERIS.",
    "DV-02B does not approve content automatically and does not publish content to runtime."
  ]
};

function sectionsForPartIChapter(title: string, authored: AuthoredPartIChapter): Array<Omit<ExperienceBibleBodySection, "id" | "relationships" | "status">> {
  const supplements: Array<Omit<ExperienceBibleBodySection, "id" | "relationships" | "status">> = [];

  if (title === "The Future We Build") {
    supplements.push(
      section("principle", "Art-Direction Statement", "A civilization worthy of humanity's future.", "This statement means NOVERIS should not be merely futuristic, visually impressive, or technologically advanced. It should present a future worthy in values, scale, responsibility, and purpose: a future players should want to help create. The Future We Build remains the primary brand and thematic statement."),
      section("principle", "The Future Worth Inheriting", "Long-range decisions should feel meaningful across generations.", "The player is not only accumulating resources or clearing objectives. The player participates in shaping a civilization that remembers, improves, adapts, and leaves behind something more coherent than it inherited.")
    );
  }

  if (title === "Core Creative Philosophy") {
    supplements.push(
      section("principle", "The Five Visual-Experience Pillars", "Part I establishes the core presentation pillars for future visual and interaction work.", visualExperiencePillars.map((pillar, index) => `Pillar ${index + 1}: ${pillar.title}. ${pillar.content}`).join("\n\n")),
      section("principle", "Interface Supports the World", "The universe is the primary stage.", "The interface should help the player understand place, scale, progress, and consequence. It should not replace the world with a detached software layer or make the universe feel secondary to panels."),
      section("principle", "Automation as Mastery", "Automation represents fluency, not disengagement.", "NOVERIS is not about controlling every individual detail forever. It is about understanding systems, setting direction, and shaping a civilization that grows beyond manual control while preserving the player's authorship.")
    );
  }

  if (title === "What NOVERIS Is") {
    supplements.push(
      section("reference", "noveris.life Brand Relationship", "noveris.life is a primary brand benchmark.", "The Game should feel like a natural extension of the website through atmosphere, restraint, typography hierarchy, premium spacing, lighting philosophy, and brand tone. The Game must adapt that brand for interactive use and must not literally reproduce website layouts. Website references must be versioned and reviewed through the Experience Design framework."),
      section("principle", "NOVERIS Signature Future Seed", "Signature art language is reserved for future visual volumes.", noverisSignatureFutureGuidance)
    );
  }

  if (title === "What NOVERIS Is Not") {
    supplements.push(
      section("reference", "Influence Boundary", "Influences may inform strengths, but NOVERIS must remain distinct.", "Future reviews may compare individual qualities such as readability, scale, restraint, atmosphere, or clarity, but NOVERIS must not become a clone of any single inspiration or collapse into generic sci-fi presentation."),
      section("reference", "Brand Translation Boundary", "Do not overfit the Game to noveris.life layouts.", "The website relationship belongs to Experience Design review and future Brand Translation standards. Do not scrape noveris.life, invent website details, or treat the website as a literal screen layout source.")
    );
  }

  if (!supplements.length) return authored.bodySections;
  const closingIndex = authored.bodySections.findIndex((bodySection) => bodySection.title === "Core Principles");
  if (closingIndex < 0) return [...authored.bodySections, ...supplements];
  return [
    ...authored.bodySections.slice(0, closingIndex),
    ...supplements,
    ...authored.bodySections.slice(closingIndex)
  ];
}

function section(type: ExperienceBibleSectionType, title: string, summary: string, content: string): Omit<ExperienceBibleBodySection, "id" | "relationships" | "status"> {
  return {
    type,
    title,
    summary,
    content
  };
}

function signatureSection(order: number, type: ExperienceBibleSectionType, title: string, summary: string, content: string): ExperienceBibleBodySection {
  return {
    id: `dv-02c-section-${String(order).padStart(2, "0")}-${slugify(title)}`,
    type,
    title,
    summary,
    content,
    relationships: [],
    status: "Draft"
  };
}

function visualDnaSection(order: number, type: ExperienceBibleSectionType, title: string, summary: string, content: string): ExperienceBibleBodySection {
  return {
    id: `dv-03-section-${String(order).padStart(2, "0")}-${slugify(title)}`,
    type,
    title,
    summary,
    content,
    relationships: [],
    status: "Draft"
  };
}

export const experienceBibleSignature: ExperienceBibleSignature = {
  id: "DV-02C",
  title: "The NOVERIS Signature",
  version: "0.1",
  status: "Draft",
  createdAt: "2026-07-17T00:00:00.000Z",
  purpose: "Define the recurring visual identity that makes a NOVERIS screenshot recognizable before a logo, caption, or UI label is visible.",
  signatureStatement: "NOVERIS is recognized by monumental civilization set against an ever-present universe: calm, intelligent interfaces projected into celestial space; orbital geometry and deep scale; warm Civilization Gold carrying achievement and hope; restrained cyan analysis light; rare violet mystery; and a future that feels engineered, durable, beautiful, and worth building.",
  expands: ["DS-01", "DV-02A", "DV-02B"],
  boundaries: [
    "DV-02C is creative identity guidance, not gameplay.",
    "DV-02C is not implementation, rendering, CSS, design tokens, component code, shader logic, or engine-specific instruction.",
    "The signature must survive across Studio, Game, Website, Steam, Marketing, and Trailers independent of resolution, engine, platform, renderer, or UI framework."
  ],
  tags: ["experience-bible", "dv-02c", "noveris-signature", "visual-identity", "creative-direction"],
  keywords: [
    "NOVERIS Signature",
    "monumental civilization",
    "the universe is the hero",
    "celestial geometry",
    "light as civilization",
    "scale before detail",
    "calm intelligence",
    "hopeful futurism",
    "Civilization Gold",
    "instantly recognizable"
  ],
  sections: [
    signatureSection(1, "principle", "The NOVERIS Signature", "A cross-platform visual identity independent of renderer, resolution, and client framework.", "A NOVERIS screenshot should be recognizable even if the logo, route title, and labels disappear. The recurring signature is monumental civilization framed by an ever-present universe, calm intelligent systems, celestial geometry, purposeful light, and scale that arrives before detail. This signature must survive across Studio, Game, Website, Steam, Marketing, and Trailers without depending on Three.js, CSS, Roblox, Web, mobile layout, or any single renderer."),
    signatureSection(2, "principle", "Monumental Civilization", "Civilization should feel engineered, intentional, timeless, precise, optimistic, and durable.", "NOVERIS architecture should never feel temporary. Civilizations should look like the accumulated work of generations: purposeful structures, knowledge made visible, durable infrastructure, ceremonial scale, and precise engineering. Architecture communicates purpose, knowledge, achievement, continuity, and scale before it communicates decoration."),
    signatureSection(3, "principle", "The Universe Is The Hero", "The world remains visually dominant; the interface supports it.", "The universe is always the primary visual subject. Interfaces support the world, reveal context, and clarify consequence, but they never replace the world. Backgrounds remain meaningful, space remains visible, planets remain present, civilization remains present, and the interface should feel projected into the world rather than pasted over it."),
    signatureSection(4, "principle", "Celestial Geometry", "Orbital and navigational geometry is part of the brand, not ornament.", "Celestial geometry is a canonical NOVERIS motif: orbital arcs, planet trajectories, constellation lines, navigation circles, gravitational geometry, projection grids, and stellar paths. These forms should recur as intentional brand language and should suggest systems, motion, discovery, and relationship rather than decorative sci-fi noise."),
    signatureSection(5, "principle", "Light As Civilization", "Light carries story, progress, intelligence, distance, and mystery.", "Warm civilization light represents achievement, engineering, humanity, knowledge, and progress. Soft cyan represents interface, projection, AI, and analysis. Rare violet represents advanced energy, ancient technology, and rare discoveries. Darkness represents distance, scale, and mystery, not fear. Light should reveal what civilization has earned and what the universe still withholds."),
    signatureSection(6, "principle", "Scale Before Detail", "Players should notice the world before buttons, statistics, or fine ornament.", "The first read should be the world: large skies, large planets, large structures, large distances, and civilization situated inside cosmic scale. Detail supports scale. UI density, buttons, statistics, and decorative fragments must not become the first impression."),
    signatureSection(7, "principle", "Calm Intelligence", "NOVERIS should feel capable, thoughtful, strategic, and deliberate.", "The experience should never feel frantic. Complexity becomes elegant rather than chaotic. Information should feel organized by an intelligent civilization, not dumped by a dashboard. The player should feel calm, capable, strategic, thoughtful, and deliberate even when systems are deep."),
    signatureSection(8, "do_do_not", "Hopeful Futurism", "The future is worth building.", "NOVERIS is not grimdark, decaying, rust-first, war-first, or resource-misery science fiction. Its future is built from prosperity, science, engineering, beauty, responsibility, and civilization. Tension may exist, but the core fantasy is constructive: a humane, intelligent future that players want to help create."),
    signatureSection(9, "principle", "Civilization Gold", "Civilization Gold is a visual philosophy, not an economy value.", "Civilization Gold represents legacy, achievement, warmth, human accomplishment, guidance, and hope. It should recur as a recognizable visual identity for civilization-level progress and meaningful human achievement. It is not a token value, currency rule, or gameplay mechanic."),
    signatureSection(10, "callout", "The NOVERIS Test", "If the logo disappeared, the work should still read as NOVERIS.", "Every future screen, illustration, cinematic, trailer, website page, and interface should pass one test: if the logo disappeared, would someone still know this is NOVERIS? If not, the design has failed and should return to the signature principles."),
    signatureSection(11, "checklist", "Visual Checklist", "A reusable screen and art-direction review checklist.", "Every future screen should answer yes to these questions: Is the universe visible? Is civilization celebrated? Is the atmosphere optimistic? Does the interface support the world? Is scale immediately obvious? Does lighting tell a story? Does this feel calm? Does this feel intelligent? Does this feel monumental? Would this still feel timeless in ten years?"),
    signatureSection(12, "reference", "Future Relationships", "DV-02C names future relationship points without defining them.", "DV-02C creates relationship placeholders for future work only: DV-03 Visual DNA, DV-04 Inspiration Board Library, DS-02 Design Tokens, DS-03 Materials, DS-04 Motion, DS-05 Components, DS-06 Screen Library, and ED-02 Studio Experience. These future documents are not defined here.")
  ],
  futureRelationships: [
    { id: "DV-03", label: "Visual DNA", notes: "Future relationship only; not defined in DV-02C." },
    { id: "DV-04", label: "Inspiration Board Library", notes: "Future relationship only; not defined in DV-02C." },
    { id: "DS-02", label: "Design Tokens", notes: "Future relationship only; not defined in DV-02C." },
    { id: "DS-03", label: "Materials", notes: "Future relationship only; not defined in DV-02C." },
    { id: "DS-04", label: "Motion", notes: "Future relationship only; not defined in DV-02C." },
    { id: "DS-05", label: "Components", notes: "Future relationship only; not defined in DV-02C." },
    { id: "DS-06", label: "Screen Library", notes: "Future relationship only; not defined in DV-02C." },
    { id: "ED-02", label: "Studio Experience", notes: "Future relationship only; not defined in DV-02C." }
  ],
  reviewNotes: ["Route DV-02C through Experience Design review before treating it as approved canonical guidance."],
  changeHistory: [
    {
      id: "dv-02c-signature-created",
      action: "created",
      author: "Experience Design",
      timestamp: "2026-07-17T00:00:00.000Z",
      notes: "Created DV-02C The NOVERIS Signature as draft visual identity guidance."
    }
  ]
};

export const experienceBibleVisualDna: ExperienceBibleVisualDna = {
  id: "DV-03",
  title: "Visual DNA",
  version: "0.1",
  status: "Draft",
  createdAt: "2026-07-17T00:00:00.000Z",
  purpose: "Author the canonical artistic physics of NOVERIS: why it looks the way it does and what emotional rules every future visual decision inherits.",
  visualDnaStatement: "NOVERIS Visual DNA is the shared artistic physics of the project: deep space calm, warm civilization achievement, soft projection intelligence, rare violet transcendence, meaningful atmosphere, generous negative space, universe-first composition, emotional scale, ordered celestial geometry, durable materials, monumental architecture, quiet density, deliberate motion, and contrast built through light, depth, spacing, scale, and focus rather than saturation.",
  expands: ["DS-01", "DV-02A", "DV-02B", "DV-02C"],
  inheritedBy: ["Inspiration Boards", "Design Tokens", "Materials", "Motion", "Components", "Screen Templates", "Studio Experience", "Game Experience"],
  boundaries: [
    "DV-03 is emotional and artistic guidance, not UI implementation.",
    "DV-03 does not define CSS, rendering, shaders, design tokens, component code, or engine-specific output.",
    "Visual DNA must survive across Game, Studio, Website, Steam, Marketing, and Cinematics."
  ],
  tags: ["experience-bible", "dv-03", "visual-dna", "artistic-physics", "visual-principles"],
  keywords: [
    "Visual DNA",
    "color philosophy",
    "light philosophy",
    "atmosphere",
    "negative space",
    "composition",
    "scale",
    "geometry",
    "material language",
    "architecture",
    "information density",
    "motion",
    "visual contrast",
    "NOVERIS Image Test"
  ],
  sections: [
    visualDnaSection(1, "principle", "Visual DNA", "The recurring artistic principles, emotional language, visual physics, compositional rules, and atmospheric identity shared by every part of NOVERIS.", "Visual DNA explains why NOVERIS looks the way it does. It is inherited by the Game, Studio, Website, Steam, Marketing, and Cinematics. It creates continuity across Inspiration Boards, Design Tokens, Materials, Motion, Components, Screen Templates, Studio Experience, and Game Experience without becoming implementation."),
    visualDnaSection(2, "principle", "Color Philosophy", "Colors are emotional civilization meanings, not UI-only values or hexadecimal tokens.", "Deep Space Navy represents infinity, calm, knowledge, and possibility. Warm Civilization Gold represents achievement, humanity, legacy, engineering, and hope. Soft Projection Cyan represents analysis, guidance, AI, and interfaces. Rare Violet represents ancient technology, rare discoveries, transcendence, and advanced civilization. White represents clarity, knowledge, and precision. Black represents distance, scale, and the unknown. These belong to the civilization, not only to UI components."),
    visualDnaSection(3, "principle", "Light Philosophy", "Light tells the story of civilization, technology, and distance.", "Warm light means civilization, success, engineering, and human presence. Cool light means technology, projection, and systems. Darkness means mystery, distance, and possibility, not horror. As civilizations evolve, their environments should become warmer, cleaner, more elegant, and more ordered."),
    visualDnaSection(4, "principle", "Atmosphere", "Atmosphere is a storytelling layer that communicates wonder, immensity, time, and space.", "NOVERIS atmosphere may use stellar dust, nebula, fog, planet haze, volumetric depth, light scattering, distance, and scale. Atmosphere should create wonder and depth. Never become visual clutter."),
    visualDnaSection(5, "principle", "Space", "Negative space is intentional and creates scale, anticipation, focus, beauty, and calm.", "Do not fill every region with detail. Empty space and silence are part of the experience. Silence is part of the experience. The universe should be allowed to breathe so the player can feel distance, possibility, and focus."),
    visualDnaSection(6, "principle", "Composition", "The eye should move from Universe to Civilization to Player Focus to Information to Controls.", "The environment is always first. The interface is never the dominant element. Composition should reveal the world, then civilization, then what the player should care about, then supporting information, then controls."),
    visualDnaSection(7, "principle", "Scale", "Scale is emotional.", "Large planets. Large skies. Large structures. Large civilizations. Small UI. These choices should make the player constantly feel part of something much larger. Scale should be felt before it is measured."),
    visualDnaSection(8, "principle", "Geometry", "Canonical geometry represents order within the universe.", "NOVERIS geometry includes circles, orbits, celestial arcs, navigation paths, stellar vectors, projection grids, and constellation lines. These forms should express order, relationship, navigation, and discovery. Avoid arbitrary decoration."),
    visualDnaSection(9, "principle", "Material Language", "Materials communicate knowledge, craftsmanship, engineering, and longevity.", "Glass, Projection, Crystal, Stone, Metal, Energy, and Atmosphere should feel purposeful and durable. Materials should suggest learned craft and long-lived civilization. Avoid disposable aesthetics."),
    visualDnaSection(10, "principle", "Architecture", "Civilization architecture should feel intentional, engineered, timeless, monumental, and optimistic.", "Every structure should appear worthy of surviving centuries. Architecture should feel like civilization choosing to endure, not temporary set dressing or fragile decoration."),
    visualDnaSection(11, "principle", "Information Density", "Data may be dense; visual clutter is forbidden.", "Prefer hierarchy, spacing, typography, grouping, and whitespace instead of boxes, heavy borders, and visual noise. Dense systems should still feel calm, legible, and intelligently organized."),
    visualDnaSection(12, "principle", "Motion", "Movement communicates confidence.", "Motion should feel purposeful, deliberate, and calm. No frantic animation. Motion reinforces understanding, flow, and consequence. Never distraction."),
    visualDnaSection(13, "principle", "Visual Contrast", "Contrast is created primarily through light, depth, spacing, scale, and focus.", "Contrast is created through light, depth, spacing, scale, and focus, not saturated color. NOVERIS should achieve emphasis through composition, dimensionality, atmosphere, hierarchy, and lighting discipline."),
    visualDnaSection(14, "checklist", "The NOVERIS Image Test", "Every screenshot should prove the world can breathe and the identity still feels timeless.", "Every screenshot should answer: Can the world breathe? Can the player feel scale? Is civilization celebrated? Is humanity visible? Does light tell a story? Would this still feel timeless ten years from now?"),
    visualDnaSection(15, "reference", "Future Relationships", "DV-03 prepares relationships for future visual systems without defining implementation.", "DV-03 prepares relationships for DV-04 Inspiration Boards, DS-02 Design Tokens, DS-03 Material Library, DS-04 Motion Library, DS-05 Components, DS-06 Screen Library, ED-02 Studio Experience, and Game Rendering. It does not define implementation.")
  ],
  futureRelationships: [
    { id: "DV-04", label: "Inspiration Boards", notes: "Future relationship only; not defined in DV-03." },
    { id: "DS-02", label: "Design Tokens", notes: "Future relationship only; not defined in DV-03." },
    { id: "DS-03", label: "Material Library", notes: "Future relationship only; not defined in DV-03." },
    { id: "DS-04", label: "Motion Library", notes: "Future relationship only; not defined in DV-03." },
    { id: "DS-05", label: "Components", notes: "Future relationship only; not defined in DV-03." },
    { id: "DS-06", label: "Screen Library", notes: "Future relationship only; not defined in DV-03." },
    { id: "ED-02", label: "Studio Experience", notes: "Future relationship only; not defined in DV-03." },
    { id: "GAME-RENDERING", label: "Game Rendering", notes: "Future relationship only; not defined in DV-03." }
  ],
  reviewNotes: ["Route DV-03 through Experience Design review before treating it as approved canonical visual guidance."],
  changeHistory: [
    {
      id: "dv-03-visual-dna-created",
      action: "created",
      author: "Experience Design",
      timestamp: "2026-07-17T00:00:00.000Z",
      notes: "Created DV-03 Visual DNA as draft artistic physics guidance."
    }
  ]
};

export const experienceBibleVisualDnaRelease: ExperienceBibleRelease = {
  id: "DV-03",
  version: "0.1",
  status: "Draft",
  title: "Visual DNA",
  createdAt: "2026-07-17T00:00:00.000Z",
  chapterIds: [],
  notes: [
    "Defines the artistic physics, emotional language, composition, atmosphere, material, motion, and contrast principles of NOVERIS.",
    "Expands DS-01, DV-02A, DV-02B, and DV-02C without modifying existing chapters.",
    "DV-03 is not UI implementation, CSS, rendering, shaders, design tokens, runtime data, or an engine export contract."
  ]
};

export const experienceBibleInspirationBoardRelease: ExperienceBibleRelease = {
  id: "DV-04",
  version: "0.1",
  status: "Draft",
  title: "Inspiration Board Library",
  createdAt: "2026-07-17T00:00:00.000Z",
  chapterIds: [],
  notes: [
    "Creates the canonical Inspiration Board Library as the visual memory of NOVERIS.",
    "Uses the existing Experience Design mood_board content model without creating duplicate content models.",
    "DV-04 is not an image gallery, Pinterest board, generic asset store, runtime data, or an engine export contract."
  ]
};

export const experienceBibleDesignTokensRelease: ExperienceBibleRelease = {
  id: "DS-02",
  version: "0.1",
  status: "Draft",
  title: "Canonical Design Tokens",
  createdAt: "2026-07-17T00:00:00.000Z",
  chapterIds: [],
  notes: [
    "Creates the canonical semantic Design Token system for NOVERIS.",
    "Defines token libraries, relationships, search, review workflow, and versioning without implementation values.",
    "DS-02 is not CSS variables, Tailwind classes, implementation code, runtime gameplay data, or an engine export contract."
  ]
};

export const experienceBibleMaterialLibraryRelease: ExperienceBibleRelease = {
  id: "DS-03",
  version: "0.1",
  status: "Draft",
  title: "Canonical Material Library",
  createdAt: "2026-07-17T00:00:00.000Z",
  chapterIds: [],
  notes: [
    "Creates the canonical semantic Material Library for NOVERIS.",
    "Defines material categories, semantic material records, relationships, search, preview metadata, review workflow, and versioning.",
    "DS-03 is not CSS, shaders, textures, rendering code, engine materials, runtime gameplay data, or an engine export contract."
  ]
};

export const experienceBibleMotionSystemRelease: ExperienceBibleRelease = {
  id: "DS-04",
  version: "0.1",
  status: "Draft",
  title: "Canonical Motion System",
  createdAt: "2026-07-17T00:00:00.000Z",
  chapterIds: [],
  notes: [
    "Creates the canonical semantic Motion System for NOVERIS.",
    "Defines motion categories, semantic motion records, camera language, microinteraction intent, accessibility support, search, preview metadata, review workflow, and versioning.",
    "DS-04 is not CSS animation, easing curves, React transitions, Three.js camera code, Unity animation clips, Unreal timelines, runtime gameplay data, or an engine export contract."
  ]
};

export const experienceBibleSignatureRelease: ExperienceBibleRelease = {
  id: "DV-02C",
  version: "0.1",
  status: "Draft",
  title: "The NOVERIS Signature",
  createdAt: "2026-07-17T00:00:00.000Z",
  chapterIds: [],
  notes: [
    "Defines the recurring visual identity that makes NOVERIS recognizable across Studio, Game, Website, Steam, Marketing, and Trailers.",
    "Expands DS-01, DV-02A, and DV-02B without replacing existing chapters.",
    "DV-02C is not gameplay, rendering, CSS, design tokens, implementation, runtime data, or an engine export contract."
  ]
};

export const experienceBibleRelease: ExperienceBibleRelease = {
  id: "DV-02",
  version: "0.1",
  status: "Draft",
  title: "The NOVERIS Experience Bible",
  createdAt,
  chapterIds: experienceBibleChapters.map((chapter) => chapter.id),
  notes: [
    "Initial release seeds Parts I-VII and Chapters 1-65.",
    "The complete Bible is not approved or fully authored yet.",
    "Experience Bible content is not published to game runtime."
  ]
};

export function getExperienceBibleState(): ExperienceBibleState {
  return {
    id: "DV-02",
    title: "The NOVERIS Experience Bible",
    version: "0.1",
    status: "Draft",
    ownership: {
      studioOwns: [
        "Experience Bible structure",
        "chapter definitions",
        "creative principles",
        "visual and experience guidance",
        "references and attachments",
        "concept and screen relationships",
        "review states",
        "version history",
        "governance",
        "approved creative direction"
      ],
      gameOwns: [
        "React components",
        "CSS",
        "Three.js implementation",
        "shaders",
        "animation code",
        "platform-specific rendering",
        "live player state",
        "screen behavior implementation"
      ]
    },
    parts: experienceBibleParts,
    chapters: experienceBibleChapters,
    release: experienceBibleRelease,
    contentReleases: [experienceBibleRelease, experienceBiblePartIRelease, experienceBibleSignatureRelease, experienceBibleVisualDnaRelease, experienceBibleInspirationBoardRelease, experienceBibleDesignTokensRelease, experienceBibleMaterialLibraryRelease, experienceBibleMotionSystemRelease],
    signature: experienceBibleSignature,
    visualDna: experienceBibleVisualDna,
    governanceRules: experienceBibleGovernanceRules,
    noverisLifeReferenceFramework: {
      enabled: true,
      supportedReferenceTypes: ["website snapshots", "page references", "section references", "typography notes", "color notes", "spacing notes", "lighting notes", "motion notes", "composition notes", "approved translation guidance"],
      guidance: [
        "Treat noveris.life as a brand benchmark.",
        "Do not scrape or invent noveris.life content in Studio.",
        "Do not treat the website as a literal one-to-one game layout."
      ]
    },
    sectionTypes: experienceBibleSectionTypes
  };
}

export function getExperienceBibleChapter(chapterIdOrSlug: string) {
  return experienceBibleChapters.find((chapter) => chapter.id === chapterIdOrSlug || chapter.slug === chapterIdOrSlug);
}

export function getExperienceBiblePart(partId: string) {
  return experienceBibleParts.find((partItem) => partItem.id === partId);
}

export function chaptersForPart(partId: string) {
  return experienceBibleChapters.filter((chapter) => chapter.partId === partId).sort((left, right) => left.chapterNumber - right.chapterNumber);
}

export function adjacentExperienceBibleChapters(chapter: ExperienceBibleChapter) {
  const index = experienceBibleChapters.findIndex((item) => item.id === chapter.id);
  return {
    previous: index > 0 ? experienceBibleChapters[index - 1] : null,
    next: index >= 0 && index < experienceBibleChapters.length - 1 ? experienceBibleChapters[index + 1] : null
  };
}

function part(id: string, roman: string, title: string, summary: string, order: number): ExperienceBiblePart {
  return { id, roman, title, summary, order };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function keywordsFor(title: string) {
  return Array.from(new Set([title, ...title.split(/\s+/), "NOVERIS", "Experience Bible"].map((item) => item.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()).filter(Boolean)));
}

function ownerForPart(partId: string) {
  if (partId.includes("visual")) return "Art Direction";
  if (partId.includes("experience-and-interaction")) return "UX Direction";
  if (partId.includes("player-journey")) return "Experience Design";
  if (partId.includes("screen-and-world")) return "Screen Direction";
  if (partId.includes("brand")) return "Brand Direction";
  if (partId.includes("governance")) return "Creative Governance";
  return "Creative Direction";
}

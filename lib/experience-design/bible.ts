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
  id: "DV-02";
  version: "0.1";
  status: "Draft";
  title: "The NOVERIS Experience Bible";
  createdAt: string;
  chapterIds: string[];
  notes: string[];
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

export const experienceBibleChapters: ExperienceBibleChapter[] = chapterSeeds.map(([chapterNumber, partId, title]) => {
  const slug = slugify(title);
  const id = `dv02-chapter-${String(chapterNumber).padStart(2, "0")}-${slug}`;
  return {
    id,
    slug,
    title,
    subtitle: "Framework chapter awaiting authored content.",
    partId,
    chapterNumber,
    summary: `Defines the Experience Bible framework for ${title}.`,
    purpose: `Establish canonical creative guidance for ${title} without authoring full chapter content yet.`,
    canonicalStatus: "Draft",
    reviewStatus: "Draft",
    author: "Experience Design",
    owner: ownerForPart(partId),
    reviewers: ["Creative Direction", "UX Direction"],
    version: "0.1.0",
    createdAt,
    updatedAt: createdAt,
    approvedAt: null,
    tags: ["experience-bible", slug, partId],
    keywords: keywordsFor(title),
    bodySections: [
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
    designPrinciples: [],
    mustAlways: [],
    mustNever: [],
    references: title === "noveris.life Translation"
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
    implementationNotes: ["Game/client implementation remains outside this chapter record."],
    openQuestions: ["Which approved references should be linked before review?"],
    reviewNotes: [],
    changeHistory: [
      {
        id: `${id}-seeded`,
        action: "created",
        author: "Experience Design",
        timestamp: createdAt,
        notes: "Seeded DV-02A canonical chapter structure."
      }
    ]
  };
});

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

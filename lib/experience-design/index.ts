export type ExperienceDesignStatus = "Draft" | "In Review" | "Approved" | "Deprecated" | "Archived";

export type ExperienceDesignKind =
  | "experience_bible"
  | "mood_board"
  | "concept"
  | "screen_definition"
  | "design_token_collection"
  | "material_definition"
  | "motion_definition"
  | "component_definition"
  | "theme"
  | "brand_guideline"
  | "experience_moment"
  | "review";

export type ExperienceAttachmentType = "image" | "video" | "pdf" | "note" | "external_reference" | "asset_relationship";

export type ExperienceAttachment = {
  id: string;
  type: ExperienceAttachmentType;
  label: string;
  reference: string;
  status: ExperienceDesignStatus;
};

export type ExperienceRelationship = {
  id: string;
  targetType: string;
  targetId: string;
  label: string;
};

export type ExperienceHistoryEntry = {
  id: string;
  action: "created" | "updated" | "submitted" | "approved" | "deprecated" | "archived" | "restored" | "commented";
  author: string;
  timestamp: string;
  notes: string;
};

export type ExperienceDesignRecord = {
  id: string;
  kind: ExperienceDesignKind;
  name: string;
  description: string;
  status: ExperienceDesignStatus;
  created: string;
  modified: string;
  version: string;
  author: string;
  tags: string[];
  notes: string[];
  attachments: ExperienceAttachment[];
  relationships: ExperienceRelationship[];
  approvalStatus: ExperienceDesignStatus;
  history: ExperienceHistoryEntry[];
  category?: string;
  fields: Record<string, string | string[] | number | boolean>;
};

export type ExperienceContentModel = {
  kind: ExperienceDesignKind;
  displayName: string;
  description: string;
  requiredFields: string[];
  supportedCapabilities: string[];
  route: string;
};

export type ExperienceDesignSection = {
  id: string;
  label: string;
  description: string;
  route: string;
  kinds: ExperienceDesignKind[];
};

export type ExperienceDesignState = {
  frameworkId: "ED-01";
  version: "1.0";
  owner: "Project Genesis Studio";
  creativeDirectionOwner: "Studio";
  runtimePublishing: "not_published";
  implementationBoundary: string[];
  sections: ExperienceDesignSection[];
  contentModels: ExperienceContentModel[];
  records: ExperienceDesignRecord[];
  reviewWorkflow: ExperienceDesignStatus[];
  searchScopes: string[];
  dashboard: {
    recentActivity: ExperienceHistoryEntry[];
    draftReviews: ExperienceDesignRecord[];
    approvedChanges: ExperienceDesignRecord[];
    countsByKind: Record<ExperienceDesignKind, number>;
  };
};

export const EXPERIENCE_DESIGN_ROUTE = "/experience-design";

export const experienceReviewWorkflow: ExperienceDesignStatus[] = ["Draft", "In Review", "Approved", "Deprecated", "Archived"];

export const experienceDesignSections: ExperienceDesignSection[] = [
  { id: "dashboard", label: "Dashboard", description: "Creative direction command center for ED-01.", route: EXPERIENCE_DESIGN_ROUTE, kinds: [] },
  { id: "bible", label: "Experience Bible", description: "Canonical chapters, references, annotations, and creative principles.", route: `${EXPERIENCE_DESIGN_ROUTE}/bible`, kinds: ["experience_bible"] },
  { id: "mood-boards", label: "Mood Boards", description: "Visual reference boards by gameplay and presentation domain.", route: `${EXPERIENCE_DESIGN_ROUTE}/mood-boards`, kinds: ["mood_board"] },
  { id: "concepts", label: "Concept Library", description: "Versioned concept art, illustration, interface, material, and motion references.", route: `${EXPERIENCE_DESIGN_ROUTE}/concepts`, kinds: ["concept"] },
  { id: "screens", label: "Screen Library", description: "Canonical experience intent for screens without client implementation ownership.", route: `${EXPERIENCE_DESIGN_ROUTE}/screens`, kinds: ["screen_definition"] },
  { id: "tokens", label: "Design Tokens", description: "Framework for future color, type, spacing, radius, motion, and breakpoint collections.", route: `${EXPERIENCE_DESIGN_ROUTE}/tokens`, kinds: ["design_token_collection"] },
  { id: "materials", label: "Material Library", description: "Canonical material definitions such as glass, crystal, atmosphere, and energy.", route: `${EXPERIENCE_DESIGN_ROUTE}/materials`, kinds: ["material_definition"] },
  { id: "motion", label: "Motion Library", description: "Canonical motion purposes, accessibility notes, references, and intent.", route: `${EXPERIENCE_DESIGN_ROUTE}/motion`, kinds: ["motion_definition"] },
  { id: "components", label: "Component Library", description: "Design definitions for components, separate from React, Roblox, or CSS implementation.", route: `${EXPERIENCE_DESIGN_ROUTE}/components`, kinds: ["component_definition"] },
  { id: "themes", label: "Theme Library", description: "Future theme framework for default, accessibility, minimal, presentation, and prototype themes.", route: `${EXPERIENCE_DESIGN_ROUTE}/themes`, kinds: ["theme"] },
  { id: "brand", label: "Brand System", description: "Brand guidelines, tone, usage, and creative constraints for NOVERIS.", route: `${EXPERIENCE_DESIGN_ROUTE}/brand`, kinds: ["brand_guideline"] },
  { id: "accessibility", label: "Accessibility", description: "Experience accessibility notes, constraints, and review hooks.", route: `${EXPERIENCE_DESIGN_ROUTE}/accessibility`, kinds: ["brand_guideline", "motion_definition", "theme"] },
  { id: "journey", label: "Experience Journey", description: "Player moments and emotional, visual, audio, interaction, and narrative goals.", route: `${EXPERIENCE_DESIGN_ROUTE}/journey`, kinds: ["experience_moment"] },
  { id: "reviews", label: "Reviews", description: "Creative review workflow, history, comments, approvals, and archival status.", route: `${EXPERIENCE_DESIGN_ROUTE}/reviews`, kinds: ["review"] }
];

export const experienceContentModels: ExperienceContentModel[] = [
  model("experience_bible", "Experience Bible", "Long-form creative canon with chapters, subchapters, annotations, cross references, linked concepts, search, and history.", ["chapters", "subchapters", "annotations", "crossReferences", "linkedConcepts"], ["embedded images", "version history", "search", "future expansion"], "bible"),
  model("mood_board", "Mood Board", "Visual reference board with images, references, lighting notes, color notes, composition notes, approval, and history.", ["title", "description", "images", "references", "lightingNotes", "colorNotes", "compositionNotes"], ["categories", "approval", "version history"], "mood-boards"),
  model("concept", "Concept", "Versioned concept record for art, interface, environment, lighting, typography, material, or animation reference.", ["preview", "sourceAsset", "notes", "tags", "relationships"], ["approval workflow", "source asset links"], "concepts"),
  model("screen_definition", "Screen Definition", "Canonical screen intent, player goals, emotional goals, layout notes, interaction zones, accessibility, references, and approved concepts.", ["purpose", "playerGoals", "emotionalGoals", "narrativePurpose", "layoutNotes", "interactionZones"], ["attachments", "related components", "version history"], "screens"),
  model("design_token_collection", "Design Token Collection", "Framework for future token collections without defining token values yet.", ["tokenFamilies", "status", "approval"], ["color", "typography", "spacing", "radius", "blur", "elevation", "shadow", "opacity", "motion", "breakpoints"], "tokens"),
  model("material_definition", "Material Definition", "Material intent for Space Glass, Projection Glass, Nebula, Crystal, Atmosphere, Energy, Highlight, Selection, Warning, and Danger.", ["purpose", "visualIntent", "references"], ["accessibility notes", "asset relationships"], "materials"),
  model("motion_definition", "Motion Definition", "Canonical motion intent such as Fade, Expand, Orbit, Travel, Discovery, Projection, Notification, and Research.", ["purpose", "duration", "curve", "accessibilityNotes", "references"], ["reduced motion", "review workflow"], "motion"),
  model("component_definition", "Component Definition", "Design description for Button, Panel, Card, HUD, Sidebar, Dialog, Tree, List, Table, Tooltip, and Notification.", ["purpose", "states", "variants", "accessibility", "references"], ["component relationships", "approval workflow"], "components"),
  model("theme", "Theme", "Future theme framework for Default, Accessibility, Minimal, Presentation, and Prototype.", ["themeIntent", "status", "approval"], ["token relationships", "accessibility notes"], "themes"),
  model("brand_guideline", "Brand Guideline", "Brand system guidance for NOVERIS tone, naming, marks, usage, and creative boundaries.", ["principle", "usage", "constraints"], ["cross references", "history"], "brand"),
  model("experience_moment", "Experience Moment", "Journey record describing player emotion, visual goal, audio goal, interaction goal, narrative goal, and references.", ["playerEmotion", "visualGoal", "audioGoal", "interactionGoal", "narrativeGoal"], ["journey sequencing", "related screens"], "journey"),
  model("review", "Review", "Creative review workflow record with Draft, In Review, Approved, Deprecated, and Archived states.", ["subjectId", "reviewState", "comments", "decision"], ["diff", "restore", "comments", "author", "timestamp"], "reviews")
];

export const experienceDesignRecords: ExperienceDesignRecord[] = [
  record("experience-bible-framework", "experience_bible", "Experience Bible Framework", "Framework for NOVERIS creative canon chapters, annotations, cross references, and linked concepts.", "Draft", "Creative Direction", ["bible", "canon"], ["Create chapter scaffolding only; do not populate the complete Bible yet."], {
    chapters: ["Creative Pillars", "World Tone", "Interface Philosophy", "Moments of Wonder"],
    subchapters: ["Pending authoring"],
    annotations: ["Supported"],
    crossReferences: ["Supported"],
    linkedConcepts: ["Supported"]
  }),
  record("mood-board-galaxy", "mood_board", "Galaxy Mood Board", "Reference board for galaxy-scale wonder, navigation distance, light, scale, and discovery tone.", "Draft", "Art Direction", ["galaxy", "lighting", "composition"], ["Framework board; images can be attached later."], {
    category: "Galaxy",
    lightingNotes: "Cosmic scale, legible focus, restrained glow.",
    colorNotes: "Use approved design tokens when token values are authored.",
    compositionNotes: "Hero imagery supports game direction without becoming implementation."
  }),
  record("mood-board-hud", "mood_board", "HUD Mood Board", "Reference board for quiet, readable, canonical HUD experience intent.", "Draft", "UX Direction", ["hud", "interface", "accessibility"], ["Screen implementation remains game-owned."], {
    category: "HUD",
    lightingNotes: "Readable over bright and dark game scenes.",
    colorNotes: "State color must remain accessible.",
    compositionNotes: "Support gameplay without visually dominating the hero."
  }),
  record("concept-interface-projection", "concept", "Projection Glass Interface Study", "Concept placeholder for future interface material and projection studies.", "Draft", "Concept Art", ["interface", "material", "projection"], ["No final art attached yet."], {
    conceptType: "Interface Concepts",
    preview: "Pending",
    sourceAsset: "Pending"
  }),
  record("screen-definition-first-launch", "screen_definition", "First Launch Experience", "Canonical intent for the first launch moment, not a React or CSS layout.", "Draft", "Experience Design", ["first-launch", "screen", "journey"], ["Actual screen implementation belongs to the Game repository."], {
    purpose: "Introduce the promise of NOVERIS.",
    playerGoals: ["Understand the first action", "Feel oriented"],
    emotionalGoals: ["Curious", "Capable", "Invited"],
    narrativePurpose: "Begin civilization authorship without overload.",
    layoutNotes: "Reference screenshots and annotations only.",
    interactionZones: ["Primary start action", "Status context", "Optional settings"]
  }),
  record("design-token-framework", "design_token_collection", "Design Token Framework", "Framework for token families without defining final token values.", "Draft", "Design Systems", ["tokens", "framework"], ["Do not define token values yet."], {
    tokenFamilies: ["Color", "Typography", "Spacing", "Radius", "Blur", "Elevation", "Shadow", "Opacity", "Motion", "Breakpoints"],
    tokenValuesDefined: false
  }),
  record("material-space-glass", "material_definition", "Space Glass", "Material definition framework for projected, transparent, readable surfaces.", "Draft", "Art Direction", ["material", "glass", "interface"], ["Framework only; no shader or CSS implementation."], {
    purpose: "Canonical material intent.",
    visualIntent: "Subtle depth, transparency, and legibility.",
    references: ["Pending mood board attachments"]
  }),
  record("motion-discovery", "motion_definition", "Discovery Motion", "Motion intent for discovery reveal moments and reduced-motion alternatives.", "Draft", "Motion Design", ["motion", "discovery", "accessibility"], ["No implementation curves are final."], {
    purpose: "Signal a meaningful reveal without blocking interaction.",
    duration: "Framework pending",
    curve: "Framework pending",
    accessibilityNotes: "Must support reduced motion and non-motion affordances."
  }),
  record("component-design-panel", "component_definition", "Panel Design Definition", "Design definition for panels across NOVERIS without React, Roblox, or CSS implementation details.", "Draft", "Component Design", ["component", "panel"], ["Implementation remains client-owned."], {
    purpose: "Readable grouping surface.",
    states: ["default", "focused", "loading", "error", "disabled"],
    variants: ["standard", "dense", "modal"]
  }),
  record("theme-default-framework", "theme", "Default Theme Framework", "Future theme definition shell for default NOVERIS presentation.", "Draft", "Design Systems", ["theme", "default"], ["No theme values yet."], {
    themeIntent: "Canonical default presentation intent.",
    tokenRelationships: ["design-token-framework"]
  }),
  record("brand-novel-optimism", "brand_guideline", "Optimistic Civilization Tone", "Brand guidance for hopeful science, exploration, and civilization building.", "Approved", "Creative Direction", ["brand", "tone", "noveris"], ["Canonical creative guidance; not runtime gameplay."], {
    principle: "NOVERIS is about the future we build.",
    usage: "Use for copy, art direction, and review.",
    constraints: "Avoid conquest-first or horror-first framing."
  }),
  record("moment-first-discovery", "experience_moment", "First Discovery", "Experience journey moment for the first meaningful discovery.", "Draft", "Experience Design", ["journey", "discovery"], ["Links to Discovery Library when authored."], {
    playerEmotion: "Wonder and agency.",
    visualGoal: "Make discovery feel consequential but not noisy.",
    audioGoal: "Future audio reference support.",
    interactionGoal: "Clear next action.",
    narrativeGoal: "The universe is knowable through careful exploration."
  }),
  record("review-ed-01-framework", "review", "ED-01 Framework Review", "Creative review record for the first Experience Design framework implementation.", "In Review", "Studio", ["review", "ed-01"], ["Review the framework before populating complete content."], {
    subjectId: "ED-01",
    reviewState: "In Review",
    comments: ["Framework established; content population comes later."],
    decision: "Pending"
  })
];

function model(
  kind: ExperienceDesignKind,
  displayName: string,
  description: string,
  requiredFields: string[],
  supportedCapabilities: string[],
  route: string
): ExperienceContentModel {
  return {
    kind,
    displayName,
    description,
    requiredFields: ["id", "name", "description", "status", "created", "modified", "version", "author", "tags", "notes", "attachments", "relationships", "approvalStatus", "history", ...requiredFields],
    supportedCapabilities,
    route: `${EXPERIENCE_DESIGN_ROUTE}/${route}`
  };
}

function record(
  id: string,
  kind: ExperienceDesignKind,
  name: string,
  description: string,
  status: ExperienceDesignStatus,
  author: string,
  tags: string[],
  notes: string[],
  fields: Record<string, string | string[] | number | boolean>
): ExperienceDesignRecord {
  const timestamp = "2026-07-16T00:00:00.000Z";
  return {
    id,
    kind,
    name,
    description,
    status,
    created: timestamp,
    modified: timestamp,
    version: "1.0.0",
    author,
    tags,
    notes,
    attachments: [],
    relationships: [],
    approvalStatus: status,
    history: [
      {
        id: `${id}-created`,
        action: "created",
        author,
        timestamp,
        notes: "Created ED-01 framework record."
      }
    ],
    category: typeof fields.category === "string" ? fields.category : undefined,
    fields
  };
}

export function getExperienceDesignState(): ExperienceDesignState {
  const countsByKind = experienceContentModels.reduce((accumulator, item) => {
    accumulator[item.kind] = experienceDesignRecords.filter((recordItem) => recordItem.kind === item.kind).length;
    return accumulator;
  }, {} as Record<ExperienceDesignKind, number>);

  const history = experienceDesignRecords
    .flatMap((item) => item.history)
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, 8);

  return {
    frameworkId: "ED-01",
    version: "1.0",
    owner: "Project Genesis Studio",
    creativeDirectionOwner: "Studio",
    runtimePublishing: "not_published",
    implementationBoundary: [
      "Experience Design is canonical creative direction.",
      "Experience Design is not gameplay.",
      "Experience Design is not rendering.",
      "Experience Design is not React implementation.",
      "Experience Design is not CSS.",
      "Experience Design is not Three.js.",
      "Game clients consume approved design definitions in a future contract; ED-01 is not published to runtime yet."
    ],
    sections: experienceDesignSections,
    contentModels: experienceContentModels,
    records: experienceDesignRecords,
    reviewWorkflow: experienceReviewWorkflow,
    searchScopes: ["Bible", "Mood Boards", "Concepts", "Screens", "Tokens", "Materials", "Motion", "Components", "Themes", "Journey"],
    dashboard: {
      recentActivity: history,
      draftReviews: experienceDesignRecords.filter((item) => item.status === "Draft" || item.status === "In Review"),
      approvedChanges: experienceDesignRecords.filter((item) => item.status === "Approved"),
      countsByKind
    }
  };
}

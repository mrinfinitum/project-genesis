import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  experienceBibleSectionTypes,
  getExperienceBibleChapter,
  getExperienceBiblePart,
  getExperienceBibleState,
  getExperienceDesignState
} from "@/lib/experience-design";
import { searchStudio } from "@/lib/studio/global-search";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function exists(relativePath: string) {
  return existsSync(path.join(process.cwd(), relativePath));
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assertNoPrivateLeak(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/\/Users\/|studio-private:\/\/|SERVICE_ROLE|PRIVATE_KEY|clientSecret|databaseUrl/i.test(text), `${label} leaked a private path or secret marker.`);
}

function assertNoRuntimeLeak(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/"experienceBible"\s*:/.test(text), `${label} leaked Experience Bible root data.`);
  assert(!/"DV-02"\s*:/.test(text), `${label} leaked DV-02 as runtime data.`);
  assert(!text.includes("DV-02C"), `${label} leaked DV-02C signature data.`);
  assert(!text.includes("The NOVERIS Signature"), `${label} leaked NOVERIS Signature data.`);
  assert(!text.includes("Civilization Gold"), `${label} leaked visual identity guidance.`);
  assert(!text.includes("DV-03"), `${label} leaked DV-03 Visual DNA data.`);
  assert(!text.includes("Visual DNA"), `${label} leaked Visual DNA guidance.`);
  assert(!text.includes("Deep Space Navy"), `${label} leaked color philosophy guidance.`);
  assert(!text.includes("DV-04"), `${label} leaked DV-04 Inspiration Board data.`);
  assert(!text.includes("Inspiration Board Library"), `${label} leaked Inspiration Board Library data.`);
  assert(!text.includes("DS-02"), `${label} leaked DS-02 Design Token data.`);
  assert(!text.includes("Canonical Design Tokens"), `${label} leaked Canonical Design Token data.`);
  assert(!/"bodySections"\s*:/.test(text), `${label} leaked Bible body sections.`);
}

async function main() {
  const bible = getExperienceBibleState();
  const experience = getExperienceDesignState();

  assert(bible.id === "DV-02", "Bible ID must be DV-02.");
  assert(bible.version === "0.1", "Initial Bible release must be version 0.1.");
  assert(bible.status === "Draft", "Initial Bible release must remain Draft.");
  assert(bible.parts.length === 7, `Expected 7 Bible parts; received ${bible.parts.length}.`);
  assert(bible.chapters.length === 65, `Expected 65 Bible chapters; received ${bible.chapters.length}.`);
  assert(bible.release.chapterIds.length === 65, "Bible release must include all 65 seeded chapters.");
  assert(bible.contentReleases.length >= 3, "Bible must expose structural, authored, and signature content releases.");
  const partIRelease = bible.contentReleases.find((release) => release.id === "DV-02B");
  assert(partIRelease, "Missing DV-02B Part I authored content release.");
  assert(partIRelease.version === "0.1", "DV-02B must be version 0.1.");
  assert(partIRelease.status === "Draft", "DV-02B must remain Draft.");
  assert(partIRelease.chapterIds.length === 7, "DV-02B must include only Part I chapters 1-7.");
  const signatureRelease = bible.contentReleases.find((release) => release.id === "DV-02C");
  assert(signatureRelease, "Missing DV-02C NOVERIS Signature content release.");
  assert(signatureRelease.version === "0.1", "DV-02C must be version 0.1.");
  assert(signatureRelease.status === "Draft", "DV-02C must remain Draft.");
  assert(signatureRelease.chapterIds.length === 0, "DV-02C must be a signature section, not a numbered chapter release.");
  const visualDnaRelease = bible.contentReleases.find((release) => release.id === "DV-03");
  assert(visualDnaRelease, "Missing DV-03 Visual DNA content release.");
  assert(visualDnaRelease.version === "0.1", "DV-03 must be version 0.1.");
  assert(visualDnaRelease.status === "Draft", "DV-03 must remain Draft.");
  assert(visualDnaRelease.chapterIds.length === 0, "DV-03 must be a Visual DNA section, not a numbered chapter release.");
  const inspirationBoardRelease = bible.contentReleases.find((release) => release.id === "DV-04");
  assert(inspirationBoardRelease, "Missing DV-04 Inspiration Board Library content release.");
  assert(inspirationBoardRelease.version === "0.1", "DV-04 must be version 0.1.");
  assert(inspirationBoardRelease.status === "Draft", "DV-04 must remain Draft.");
  assert(inspirationBoardRelease.chapterIds.length === 0, "DV-04 must be an Inspiration Board Library release, not a numbered chapter release.");
  const designTokensRelease = bible.contentReleases.find((release) => release.id === "DS-02");
  assert(designTokensRelease, "Missing DS-02 Canonical Design Tokens content release.");
  assert(designTokensRelease.version === "0.1", "DS-02 must be version 0.1.");
  assert(designTokensRelease.status === "Draft", "DS-02 must remain Draft.");
  assert(designTokensRelease.chapterIds.length === 0, "DS-02 must be a Design Token system release, not a numbered chapter release.");
  assert(designTokensRelease.notes.some((note) => note.includes("not CSS variables")), "DS-02 release must reject CSS variable ownership.");
  assert(designTokensRelease.notes.some((note) => note.includes("implementation code")), "DS-02 release must reject implementation ownership.");
  assert(experience.experienceBible.chapters.length === 65, "Experience Design state must expose Bible chapters.");

  assert(bible.signature.id === "DV-02C", "Signature section ID must be DV-02C.");
  assert(bible.signature.title === "The NOVERIS Signature", "Signature section title must be The NOVERIS Signature.");
  assert(bible.signature.version === "0.1", "Signature section must be version 0.1.");
  assert(bible.signature.status === "Draft", "Signature section must remain Draft.");
  assert(bible.signature.expands.join("|") === "DS-01|DV-02A|DV-02B", "DV-02C must expand DS-01, DV-02A, and DV-02B.");
  for (const boundary of ["not gameplay", "not implementation", "rendering", "CSS", "design tokens", "engine-specific"]) {
    assert(bible.signature.boundaries.join(" ").includes(boundary), `DV-02C boundary missing ${boundary}.`);
  }
  for (const context of ["Studio", "Game", "Website", "Steam", "Marketing", "Trailers"]) {
    assert(bible.signature.boundaries.join(" ").includes(context), `DV-02C must survive across ${context}.`);
  }
  for (const independence of ["resolution", "engine", "platform", "renderer", "UI framework"]) {
    assert(bible.signature.boundaries.join(" ").includes(independence), `DV-02C must be independent of ${independence}.`);
  }
  const expectedSignatureSectionTitles = [
    "The NOVERIS Signature",
    "Monumental Civilization",
    "The Universe Is The Hero",
    "Celestial Geometry",
    "Light As Civilization",
    "Scale Before Detail",
    "Calm Intelligence",
    "Hopeful Futurism",
    "Civilization Gold",
    "The NOVERIS Test",
    "Visual Checklist",
    "Future Relationships"
  ];
  assert(bible.signature.sections.length === expectedSignatureSectionTitles.length, `DV-02C must include ${expectedSignatureSectionTitles.length} sections.`);
  for (const [index, title] of expectedSignatureSectionTitles.entries()) {
    const section = bible.signature.sections[index];
    assert(section.title === title, `DV-02C section ${index + 1} must be ${title}.`);
    assert(section.status === "Draft", `DV-02C section ${title} must remain Draft.`);
    assert(section.id.startsWith(`dv-02c-section-${String(index + 1).padStart(2, "0")}-`), `DV-02C section ${title} must use stable ID convention.`);
  }
  const signatureText = JSON.stringify(bible.signature);
  for (const required of [
    "monumental civilization",
    "ever-present universe",
    "calm, intelligent interfaces",
    "orbital geometry",
    "deep scale",
    "Civilization Gold",
    "engineered, durable, beautiful, and worth building",
    "engineered",
    "intentional",
    "timeless",
    "monumental",
    "precise",
    "optimistic",
    "durable",
    "accumulated work of generations",
    "The universe is always the primary visual subject",
    "projected into the world",
    "orbital arcs",
    "planet trajectories",
    "constellation lines",
    "navigation circles",
    "gravitational geometry",
    "projection grids",
    "stellar paths",
    "Warm civilization light represents achievement",
    "Soft cyan represents interface",
    "Rare violet represents advanced energy",
    "Darkness represents distance",
    "large skies",
    "large planets",
    "capable",
    "strategic",
    "grimdark",
    "resource-misery",
    "prosperity",
    "science",
    "engineering",
    "beauty",
    "responsibility",
    "legacy",
    "achievement",
    "warmth",
    "human accomplishment",
    "guidance",
    "hope",
    "if the logo disappeared",
    "Would this still feel timeless in ten years"
  ]) {
    assert(signatureText.includes(required), `DV-02C signature guidance missing ${required}.`);
  }
  const expectedFutureRelationships = ["DV-03", "DV-04", "DS-02", "DS-03", "DS-04", "DS-05", "DS-06", "ED-02"];
  assert(bible.signature.futureRelationships.map((relationship) => relationship.id).join("|") === expectedFutureRelationships.join("|"), "DV-02C future relationships must match the approved list.");
  for (const relationship of bible.signature.futureRelationships) {
    assert(relationship.notes.includes("not defined in DV-02C"), `DV-02C must not define future relationship ${relationship.id}.`);
  }

  assert(bible.visualDna.id === "DV-03", "Visual DNA section ID must be DV-03.");
  assert(bible.visualDna.title === "Visual DNA", "Visual DNA section title must be Visual DNA.");
  assert(bible.visualDna.version === "0.1", "Visual DNA section must be version 0.1.");
  assert(bible.visualDna.status === "Draft", "Visual DNA section must remain Draft.");
  assert(bible.visualDna.expands.join("|") === "DS-01|DV-02A|DV-02B|DV-02C", "DV-03 must expand DS-01, DV-02A, DV-02B, and DV-02C.");
  for (const inherited of ["Inspiration Boards", "Design Tokens", "Materials", "Motion", "Components", "Screen Templates", "Studio Experience", "Game Experience"]) {
    assert(bible.visualDna.inheritedBy.includes(inherited), `DV-03 must be inherited by ${inherited}.`);
  }
  for (const boundary of ["not UI implementation", "CSS", "rendering", "shaders", "design tokens", "engine-specific"]) {
    assert(bible.visualDna.boundaries.join(" ").includes(boundary), `DV-03 boundary missing ${boundary}.`);
  }
  for (const context of ["Game", "Studio", "Website", "Steam", "Marketing", "Cinematics"]) {
    assert(bible.visualDna.boundaries.join(" ").includes(context), `DV-03 must survive across ${context}.`);
  }
  const expectedVisualDnaSectionTitles = [
    "Visual DNA",
    "Color Philosophy",
    "Light Philosophy",
    "Atmosphere",
    "Space",
    "Composition",
    "Scale",
    "Geometry",
    "Material Language",
    "Architecture",
    "Information Density",
    "Motion",
    "Visual Contrast",
    "The NOVERIS Image Test",
    "Future Relationships"
  ];
  assert(bible.visualDna.sections.length === expectedVisualDnaSectionTitles.length, `DV-03 must include ${expectedVisualDnaSectionTitles.length} sections.`);
  for (const [index, title] of expectedVisualDnaSectionTitles.entries()) {
    const section = bible.visualDna.sections[index];
    assert(section.title === title, `DV-03 section ${index + 1} must be ${title}.`);
    assert(section.status === "Draft", `DV-03 section ${title} must remain Draft.`);
    assert(section.id.startsWith(`dv-03-section-${String(index + 1).padStart(2, "0")}-`), `DV-03 section ${title} must use stable ID convention.`);
  }
  const visualDnaText = JSON.stringify(bible.visualDna);
  for (const required of [
    "artistic physics",
    "emotional language",
    "visual physics",
    "compositional rules",
    "atmospheric identity",
    "Deep Space Navy",
    "infinity",
    "calm",
    "knowledge",
    "possibility",
    "Warm Civilization Gold",
    "achievement",
    "humanity",
    "legacy",
    "engineering",
    "hope",
    "Soft Projection Cyan",
    "analysis",
    "guidance",
    "AI",
    "interfaces",
    "Rare Violet",
    "ancient technology",
    "rare discoveries",
    "transcendence",
    "advanced civilization",
    "White represents clarity",
    "Black represents distance",
    "not only to UI components",
    "Warm light means civilization",
    "Cool light means technology",
    "Darkness means mystery",
    "not horror",
    "warmer, cleaner, more elegant, and more ordered",
    "stellar dust",
    "nebula",
    "fog",
    "planet haze",
    "volumetric depth",
    "light scattering",
    "wonder",
    "immensity",
    "Never become visual clutter",
    "Negative space is intentional",
    "Silence",
    "Universe",
    "Civilization",
    "Player Focus",
    "Information",
    "Controls",
    "The environment is always first",
    "Large planets",
    "Large skies",
    "Small UI",
    "circles",
    "orbits",
    "celestial arcs",
    "navigation paths",
    "stellar vectors",
    "projection grids",
    "constellation lines",
    "Avoid arbitrary decoration",
    "Glass",
    "Projection",
    "Crystal",
    "Stone",
    "Metal",
    "Energy",
    "Atmosphere",
    "Avoid disposable aesthetics",
    "surviving centuries",
    "Data may be dense",
    "visual clutter is forbidden",
    "hierarchy",
    "spacing",
    "typography",
    "grouping",
    "whitespace",
    "No frantic animation",
    "Never distraction",
    "not saturated color",
    "Can the world breathe",
    "Would this still feel timeless ten years from now"
  ]) {
    assert(visualDnaText.includes(required), `DV-03 Visual DNA guidance missing ${required}.`);
  }
  const expectedVisualDnaRelationships = ["DV-04", "DS-02", "DS-03", "DS-04", "DS-05", "DS-06", "ED-02", "GAME-RENDERING"];
  assert(bible.visualDna.futureRelationships.map((relationship) => relationship.id).join("|") === expectedVisualDnaRelationships.join("|"), "DV-03 future relationships must match the approved list.");
  for (const relationship of bible.visualDna.futureRelationships) {
    assert(relationship.notes.includes("not defined in DV-03"), `DV-03 must not define future relationship ${relationship.id}.`);
  }

  const expectedPartIds = [
    "part-01-soul-of-noveris",
    "part-02-visual-dna",
    "part-03-experience-and-interaction",
    "part-04-player-journey",
    "part-05-screen-and-world-application",
    "part-06-brand-and-presentation",
    "part-07-creative-governance"
  ];
  for (const partId of expectedPartIds) {
    assert(getExperienceBiblePart(partId), `Missing Bible part ${partId}.`);
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const chapterNumbers = new Set<number>();
  const validPartIds = new Set(bible.parts.map((part) => part.id));
  const allowedStatuses = new Set(["Draft", "In Review", "Approved", "Deprecated", "Archived", "Changes Requested"]);
  const requiredFields = [
    "id",
    "slug",
    "title",
    "subtitle",
    "partId",
    "chapterNumber",
    "summary",
    "purpose",
    "canonicalStatus",
    "reviewStatus",
    "author",
    "owner",
    "reviewers",
    "version",
    "createdAt",
    "updatedAt",
    "approvedAt",
    "tags",
    "keywords",
    "bodySections",
    "designPrinciples",
    "mustAlways",
    "mustNever",
    "references",
    "attachments",
    "linkedMoodBoards",
    "linkedConcepts",
    "linkedScreens",
    "linkedComponents",
    "linkedMaterials",
    "linkedTokens",
    "linkedThemes",
    "linkedExperienceMoments",
    "platformNotes",
    "accessibilityNotes",
    "implementationNotes",
    "openQuestions",
    "reviewNotes",
    "changeHistory"
  ] as const;

  for (const chapter of bible.chapters) {
    assert(!ids.has(chapter.id), `Duplicate chapter ID ${chapter.id}.`);
    assert(!slugs.has(chapter.slug), `Duplicate chapter slug ${chapter.slug}.`);
    assert(!chapterNumbers.has(chapter.chapterNumber), `Duplicate chapter number ${chapter.chapterNumber}.`);
    ids.add(chapter.id);
    slugs.add(chapter.slug);
    chapterNumbers.add(chapter.chapterNumber);
    assert(validPartIds.has(chapter.partId), `Chapter ${chapter.id} references invalid part ${chapter.partId}.`);
    assert(chapter.id.startsWith(`dv02-chapter-${String(chapter.chapterNumber).padStart(2, "0")}-`), `Chapter ${chapter.id} does not use stable DV-02 ID convention.`);
    assert(chapter.slug.length > 0, `Chapter ${chapter.id} missing slug.`);
    assert(allowedStatuses.has(chapter.reviewStatus), `Chapter ${chapter.id} has invalid review status ${chapter.reviewStatus}.`);
    for (const field of requiredFields) {
      assert(chapter[field] !== undefined, `Chapter ${chapter.id} missing required field ${field}.`);
    }
    assert(chapter.bodySections.length > 0, `Chapter ${chapter.id} must have minimal structured sections.`);
    for (const section of chapter.bodySections) {
      assert(experienceBibleSectionTypes.includes(section.type), `Chapter ${chapter.id} has invalid body section type ${section.type}.`);
      assert(section.id.startsWith(chapter.id), `Section ${section.id} must be namespaced to chapter ${chapter.id}.`);
    }
    assert(chapter.changeHistory.length > 0, `Chapter ${chapter.id} must include version history.`);
    if (chapter.reviewStatus === "Approved") {
      assert(chapter.approvedAt, `Approved chapter ${chapter.id} must have approvedAt.`);
    }
  }

  for (let index = 1; index <= 65; index += 1) {
    assert(chapterNumbers.has(index), `Missing chapter number ${index}.`);
  }

  assert(getExperienceBibleChapter("the-future-we-build")?.chapterNumber === 1, "Chapter slug lookup failed for The Future We Build.");
  assert(getExperienceBibleChapter("noveris-life-translation")?.chapterNumber === 51, "Chapter slug lookup failed for noveris.life Translation.");
  assert(getExperienceBibleChapter("experience-bible-release-checklist")?.chapterNumber === 65, "Chapter slug lookup failed for Release Checklist.");

  const partIChapters = bible.chapters.filter((chapter) => chapter.partId === "part-01-soul-of-noveris");
  assert(partIChapters.length === 7, `Expected 7 Part I chapters; received ${partIChapters.length}.`);
  const requiredPartISectionTitles = ["Core Principles", "Must Always", "Must Never", "Creative Notes", "Future Considerations"];
  const requiredEmotionalPillars = ["Wonder", "Discovery", "Progress", "Beauty", "Scale", "Hope", "Achievement", "Legacy", "Intelligence", "Optimism", "Calm Mastery"];
  const requiredVisualPillars = ["Civilization Before Technology", "The Universe Is Always Present", "Monumental Human Achievement", "Light Represents Progress", "Calm Intelligence"];
  for (const chapter of partIChapters) {
    assert(partIRelease.chapterIds.includes(chapter.id), `DV-02B release is missing chapter ${chapter.id}.`);
    assert(chapter.tags.includes("dv-02b"), `Part I chapter ${chapter.id} missing dv-02b tag.`);
    assert(chapter.tags.includes("part-i-authored"), `Part I chapter ${chapter.id} missing part-i-authored tag.`);
    assert(chapter.version === "0.1", `Part I chapter ${chapter.id} must be version 0.1.`);
    assert(chapter.reviewStatus === "Draft", `Part I chapter ${chapter.id} must remain Draft.`);
    assert(chapter.canonicalStatus === "Draft", `Part I chapter ${chapter.id} must not be canonical yet.`);
    assert(chapter.approvedAt === null, `Part I chapter ${chapter.id} must not have approval timestamp.`);
    assert(chapter.designPrinciples.length >= 3, `Part I chapter ${chapter.id} must include design principles.`);
    assert(chapter.mustAlways.length >= 3, `Part I chapter ${chapter.id} must include must-always guidance.`);
    assert(chapter.mustNever.length >= 3, `Part I chapter ${chapter.id} must include must-never guidance.`);
    for (const sectionTitle of requiredPartISectionTitles) {
      assert(chapter.bodySections.some((section) => section.title === sectionTitle), `Part I chapter ${chapter.id} missing ${sectionTitle} section.`);
    }
    for (const target of ["DS-01", "ED-01", "DV-02A"]) {
      assert(chapter.references.some((reference) => reference.target === target), `Part I chapter ${chapter.id} missing ${target} reference.`);
    }
    assert(chapter.implementationNotes.some((note) => note.includes("creative guidance only")), `Part I chapter ${chapter.id} must state creative guidance boundary.`);
    assert(chapter.implementationNotes.some((note) => note.includes("does not define gameplay mechanics")), `Part I chapter ${chapter.id} must not invent gameplay.`);
    assert(chapter.reviewNotes.some((note) => note.includes("DV-02B authored draft")), `Part I chapter ${chapter.id} must include DV-02B review note.`);
    assert(chapter.changeHistory.some((entry) => entry.id.endsWith("dv-02b-authored")), `Part I chapter ${chapter.id} missing DV-02B history entry.`);
  }

  const emotionalChapter = getExperienceBibleChapter("emotional-pillars");
  assert(emotionalChapter, "Missing Emotional Pillars chapter.");
  const emotionalText = JSON.stringify(emotionalChapter.bodySections);
  for (const pillar of requiredEmotionalPillars) {
    assert(emotionalText.includes(pillar), `Emotional Pillars chapter missing ${pillar}.`);
  }
  assert(emotionalText.includes("failure mode") || emotionalText.includes("Failure mode"), "Emotional Pillars must describe failure modes.");

  const philosophyChapter = getExperienceBibleChapter("core-creative-philosophy");
  assert(philosophyChapter, "Missing Core Creative Philosophy chapter.");
  const philosophyText = JSON.stringify(philosophyChapter.bodySections);
  for (const pillar of requiredVisualPillars) {
    assert(philosophyText.includes(pillar), `Core Creative Philosophy missing visual-experience pillar ${pillar}.`);
  }
  assert(philosophyText.includes("The universe is the primary stage"), "Core Creative Philosophy must state that the universe is the primary stage.");
  assert(philosophyText.includes("Automation represents fluency") || philosophyText.includes("Automation represents mastery"), "Core Creative Philosophy must frame automation as mastery.");

  const futureChapter = getExperienceBibleChapter("the-future-we-build");
  assert(futureChapter, "Missing The Future We Build chapter.");
  const futureText = JSON.stringify(futureChapter.bodySections);
  assert(futureText.includes("A civilization worthy of humanity's future"), "The Future We Build must include the canonical art-direction statement.");
  assert(futureText.includes("The Future We Build remains the primary brand and thematic statement"), "The Future We Build must preserve primary brand/thematic statement.");

  const identityChapter = getExperienceBibleChapter("what-noveris-is");
  assert(identityChapter, "Missing What NOVERIS Is chapter.");
  const identityText = JSON.stringify(identityChapter.bodySections);
  assert(identityText.includes("noveris.life is a primary brand benchmark"), "What NOVERIS Is must define noveris.life as a primary brand benchmark.");
  assert(identityText.includes("must not literally reproduce website layouts"), "What NOVERIS Is must prohibit literal website layout reproduction.");
  assert(identityText.includes("NOVERIS Signature Future Seed"), "What NOVERIS Is must seed future signature guidance.");
  for (const signature of ["monumental civilization architecture", "deep-space navy environments", "warm amber", "restrained cyan", "celestial geometry", "orbital arcs", "scale before detail", "calm intelligence"]) {
    assert(identityText.includes(signature), `NOVERIS signature seed missing ${signature}.`);
  }

  const boundaryChapter = getExperienceBibleChapter("what-noveris-is-not");
  assert(boundaryChapter, "Missing What NOVERIS Is Not chapter.");
  const boundaryText = JSON.stringify(boundaryChapter.bodySections);
  for (const boundary of ["grimdark", "military-first", "conquest-first", "cyberpunk", "post-apocalyptic", "resource-misery", "constant-warfare", "generic-dashboard", "admin-software"]) {
    assert(boundaryText.includes(boundary), `What NOVERIS Is Not missing boundary ${boundary}.`);
  }
  assert(boundaryText.includes("must not become a clone of any single inspiration"), "What NOVERIS Is Not must preserve distinct identity.");

  const futureChapters = bible.chapters.filter((chapter) => chapter.chapterNumber > 7);
  assert(futureChapters.every((chapter) => !chapter.tags.includes("dv-02b") && !chapter.tags.includes("part-i-authored")), "DV-02B authored tags must not leak into future chapters.");

  for (const route of [
    "app/experience-design/bible/page.tsx",
    "app/experience-design/bible/part/[partId]/page.tsx",
    "app/experience-design/bible/chapter/[chapterId]/page.tsx",
    "app/experience-design/bible/chapter/[chapterId]/edit/page.tsx",
    "app/experience-design/bible/chapter/[chapterId]/history/page.tsx",
    "app/experience-design/bible/chapter/[chapterId]/review/page.tsx",
    "app/experience-design/bible/versions/page.tsx"
  ]) {
    assert(exists(route), `Missing Bible route ${route}.`);
  }

  const search = await searchStudio("The Future We Build", 20);
  assert(search.results.some((result) => result.href === "/experience-design/bible/chapter/the-future-we-build"), "Search must deep-link to Bible chapter The Future We Build.");
  const philosophySearch = await searchStudio("Technology serves humanity", 20);
  assert(philosophySearch.results.some((result) => result.href === "/experience-design/bible/chapter/core-creative-philosophy"), "Search must index authored Part I philosophy content.");
  const pillarSearch = await searchStudio("Civilization Before Technology", 20);
  assert(pillarSearch.results.some((result) => result.href === "/experience-design/bible/chapter/core-creative-philosophy"), "Search must index visual-experience pillars.");
  const artDirectionSearch = await searchStudio("A civilization worthy of humanity's future", 20);
  assert(artDirectionSearch.results.some((result) => result.href === "/experience-design/bible/chapter/the-future-we-build"), "Search must index art-direction statement.");
  const boundarySearch = await searchStudio("not admin software", 20);
  assert(boundarySearch.results.some((result) => result.href === "/experience-design/bible/chapter/what-noveris-is-not"), "Search must index authored Part I boundary content.");
  const noverisLifeSearch = await searchStudio("noveris.life", 20);
  assert(noverisLifeSearch.results.some((result) => result.href === "/experience-design/bible/chapter/noveris-life-translation"), "Search must include noveris.life Bible reference chapter.");
  const signatureSearch = await searchStudio("The NOVERIS Signature", 20);
  assert(signatureSearch.results.some((result) => result.href === "/experience-design/bible#dv-02c-noveris-signature"), "Search must deep-link to DV-02C NOVERIS Signature.");
  const goldSearch = await searchStudio("Civilization Gold", 20);
  assert(goldSearch.results.some((result) => result.href === "/experience-design/bible#dv-02c-noveris-signature"), "Search must index Civilization Gold guidance.");
  const logoSearch = await searchStudio("if the logo disappeared", 20);
  assert(logoSearch.results.some((result) => result.href === "/experience-design/bible#dv-02c-noveris-signature"), "Search must index the NOVERIS Test.");
  const visualDnaSearch = await searchStudio("Visual DNA", 20);
  assert(visualDnaSearch.results.some((result) => result.href === "/experience-design/bible#dv-03-visual-dna"), "Search must deep-link to DV-03 Visual DNA.");
  const colorSearch = await searchStudio("Deep Space Navy", 20);
  assert(colorSearch.results.some((result) => result.href === "/experience-design/bible#dv-03-visual-dna"), "Search must index DV-03 color philosophy.");
  const motionSearch = await searchStudio("No frantic animation", 20);
  assert(motionSearch.results.some((result) => result.href === "/experience-design/bible#dv-03-visual-dna"), "Search must index DV-03 motion guidance.");
  const imageTestSearch = await searchStudio("Can the world breathe", 20);
  assert(imageTestSearch.results.some((result) => result.href === "/experience-design/bible#dv-03-visual-dna"), "Search must index the NOVERIS Image Test.");

  assert(bible.noverisLifeReferenceFramework.enabled, "noveris.life reference framework must be enabled.");
  assert(bible.noverisLifeReferenceFramework.guidance.some((rule) => rule.includes("brand benchmark")), "noveris.life must be framed as brand benchmark.");
  assert(bible.governanceRules.some((rule) => rule.includes("Draft chapters cannot silently become implementation authority")), "Bible governance must protect draft chapters.");
  assert(bible.governanceRules.some((rule) => rule.includes("Design guidance cannot invent gameplay mechanics")), "Bible governance must prevent gameplay invention.");

  assert(read("docs/experience-bible.md").includes("DV-02"), "Experience Bible documentation must document DV-02.");
  assert(read("docs/experience-bible.md").includes("DV-02B"), "Experience Bible documentation must document DV-02B.");
  assert(read("docs/experience-bible.md").includes("DV-02C"), "Experience Bible documentation must document DV-02C.");
  assert(read("docs/experience-bible.md").includes("The NOVERIS Signature"), "Experience Bible documentation must document The NOVERIS Signature.");
  assert(read("docs/experience-bible.md").includes("DV-03"), "Experience Bible documentation must document DV-03.");
  assert(read("docs/experience-bible.md").includes("Visual DNA"), "Experience Bible documentation must document Visual DNA.");
  assert(read("docs/experience-bible.md").includes("DV-04"), "Experience Bible documentation must document DV-04.");
  assert(read("docs/experience-bible.md").includes("Inspiration Board Library"), "Experience Bible documentation must document Inspiration Board Library.");
  assert(read("docs/experience-bible.md").includes("DS-02"), "Experience Bible documentation must document DS-02.");
  assert(read("docs/experience-bible.md").includes("Canonical Design Tokens"), "Experience Bible documentation must document Canonical Design Tokens.");
  assert(read("components/experience-bible-workspace.tsx").includes("aria-label=\"Experience Bible table of contents\""), "TOC must expose accessible label.");
  assert(read("components/experience-bible-workspace.tsx").includes("window.localStorage.setItem(storageKey"), "TOC expansion state must be remembered.");
  assert(read("components/experience-bible-workspace.tsx").includes("state.contentReleases"), "Bible versions view must expose all content releases.");
  assert(read("components/experience-bible-workspace.tsx").includes("dv-02c-noveris-signature"), "Bible workspace must expose DV-02C signature panel.");
  assert(read("components/experience-bible-workspace.tsx").includes("dv-03-visual-dna"), "Bible workspace must expose DV-03 Visual DNA panel.");
  assert(read("components/experience-bible-workspace.tsx").includes("focus-visible:outline"), "Bible workspace must expose visible focus styling.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  assertNoRuntimeLeak("Canonical runtime", runtime);
  assertNoPrivateLeak("Experience Bible", bible);
  assertNoPrivateLeak("Experience Bible docs", read("docs/experience-bible.md"));

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of engineExports.entries()) {
    assert(engineExport.metadata.validationStatus === "Ready", `${targets[index]} export must remain Ready.`);
    assertNoRuntimeLeak(`${targets[index]} export`, engineExport);
  }

  console.log(JSON.stringify({
    ok: true,
    bible: `${bible.id} v${bible.version}`,
    status: bible.status,
    parts: bible.parts.length,
    chapters: bible.chapters.length,
    releaseChapterCount: bible.release.chapterIds.length,
    authoredRelease: {
      id: partIRelease.id,
      version: partIRelease.version,
      status: partIRelease.status,
      chapters: partIRelease.chapterIds.length
    },
    signatureRelease: {
      id: signatureRelease.id,
      version: signatureRelease.version,
      status: signatureRelease.status,
      sections: bible.signature.sections.length,
      futureRelationships: bible.signature.futureRelationships.length
    },
    visualDnaRelease: {
      id: visualDnaRelease.id,
      version: visualDnaRelease.version,
      status: visualDnaRelease.status,
      sections: bible.visualDna.sections.length,
      futureRelationships: bible.visualDna.futureRelationships.length
    },
    inspirationBoardRelease: {
      id: inspirationBoardRelease.id,
      version: inspirationBoardRelease.version,
      status: inspirationBoardRelease.status,
      chapters: inspirationBoardRelease.chapterIds.length
    },
    designTokensRelease: {
      id: designTokensRelease.id,
      version: designTokensRelease.version,
      status: designTokensRelease.status,
      chapters: designTokensRelease.chapterIds.length
    },
    searchResults: {
      futureWeBuild: search.returned,
      philosophy: philosophySearch.returned,
      pillars: pillarSearch.returned,
      artDirection: artDirectionSearch.returned,
      boundary: boundarySearch.returned,
      noverisLife: noverisLifeSearch.returned,
      signature: signatureSearch.returned,
      civilizationGold: goldSearch.returned,
      noverisTest: logoSearch.returned,
      visualDna: visualDnaSearch.returned,
      colorPhilosophy: colorSearch.returned,
      motion: motionSearch.returned,
      imageTest: imageTestSearch.returned
    },
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      runtimeVersion: runtime.metadata.schemaVersion,
      validationStatus: runtime.metadata.validationStatus
    },
    engineExports: Object.fromEntries(engineExports.map((engineExport, index) => [targets[index], engineExport.metadata.validationStatus]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

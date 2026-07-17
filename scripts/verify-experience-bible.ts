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
  assert(experience.experienceBible.chapters.length === 65, "Experience Design state must expose Bible chapters.");

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
  const noverisLifeSearch = await searchStudio("noveris.life", 20);
  assert(noverisLifeSearch.results.some((result) => result.href === "/experience-design/bible/chapter/noveris-life-translation"), "Search must include noveris.life Bible reference chapter.");

  assert(bible.noverisLifeReferenceFramework.enabled, "noveris.life reference framework must be enabled.");
  assert(bible.noverisLifeReferenceFramework.guidance.some((rule) => rule.includes("brand benchmark")), "noveris.life must be framed as brand benchmark.");
  assert(bible.governanceRules.some((rule) => rule.includes("Draft chapters cannot silently become implementation authority")), "Bible governance must protect draft chapters.");
  assert(bible.governanceRules.some((rule) => rule.includes("Design guidance cannot invent gameplay mechanics")), "Bible governance must prevent gameplay invention.");

  assert(read("docs/experience-bible.md").includes("DV-02"), "Experience Bible documentation must document DV-02.");
  assert(read("components/experience-bible-workspace.tsx").includes("aria-label=\"Experience Bible table of contents\""), "TOC must expose accessible label.");
  assert(read("components/experience-bible-workspace.tsx").includes("window.localStorage.setItem(storageKey"), "TOC expansion state must be remembered.");
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
    searchResults: {
      futureWeBuild: search.returned,
      noverisLife: noverisLifeSearch.returned
    },
    engineExports: Object.fromEntries(engineExports.map((engineExport, index) => [targets[index], engineExport.metadata.validationStatus]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

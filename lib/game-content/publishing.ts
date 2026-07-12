import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { civilizationAges, civilizationAlignmentScores } from "@/data/civilization-identity";
import { buildGameEngineExport } from "@/lib/export/game-engine";
import { getGameData } from "@/lib/data";

export type ContentReleaseStatus = "published";

export type PublishedContentSnapshot = {
  contentVersion: number;
  version: string;
  publishedAt: string;
  source: "Project Genesis Studio";
  validation: Awaited<ReturnType<typeof buildGameEngineExport>>["validation"];
  contentHash: string;
  modules: {
    resource_catalog: unknown;
    research: unknown;
    unlock_matrix: unknown;
    era_definitions: unknown;
    alignment_definitions: unknown;
    production_chains: unknown;
    galaxies: unknown;
    sectors: unknown;
    star_systems: unknown;
    planets: unknown;
    factions: unknown;
    missions: unknown;
    mission_objectives: unknown;
    mission_rewards: unknown;
  };
  relationshipMap: Awaited<ReturnType<typeof buildGameEngineExport>>["relationshipMap"];
};

export type ContentRelease = {
  id: string;
  contentVersion: number;
  version: string;
  status: ContentReleaseStatus;
  title: string;
  notes: string;
  publishedAt: string;
  contentHash: string;
  validationStatus: string;
  errorCount: number;
  warningCount: number;
  moduleCounts: Record<string, number>;
  rollbackOf?: number;
  snapshot: PublishedContentSnapshot;
};

export type ContentReleaseStore = {
  releases: ContentRelease[];
};

export type ContentReleaseSummary = Omit<ContentRelease, "snapshot">;

const storePath = process.env.PROJECT_GENESIS_CONTENT_RELEASE_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_CONTENT_RELEASE_STORE)
  : path.join(process.cwd(), "data", "game-content-releases.local.json");

function stableJson(value: unknown) {
  return JSON.stringify(value);
}

function hashContent(value: unknown) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function moduleCount(value: unknown) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value).length;
  return value === null || value === undefined ? 0 : 1;
}

function summarizeRelease(release: ContentRelease): ContentReleaseSummary {
  const { snapshot: _snapshot, ...summary } = release;
  return summary;
}

function latestByVersion(releases: ContentRelease[]) {
  return [...releases].sort((a, b) => b.contentVersion - a.contentVersion)[0] ?? null;
}

async function readStore(): Promise<ContentReleaseStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ContentReleaseStore>;
    return { releases: Array.isArray(parsed.releases) ? parsed.releases : [] };
  } catch {
    return { releases: [] };
  }
}

async function writeStore(store: ContentReleaseStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

async function buildSnapshot(contentVersion: number, publishedAt: string): Promise<PublishedContentSnapshot> {
  const [genericExport, data] = await Promise.all([buildGameEngineExport("generic"), getGameData()]);
  const modules = {
    resource_catalog: genericExport.canonical.resource_catalog,
    research: genericExport.canonical.research,
    unlock_matrix: genericExport.canonical.unlock_matrix,
    era_definitions: civilizationAges.map((era, index) => ({ id: `era-${era.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`, order: index + 1, ...era })),
    alignment_definitions: civilizationAlignmentScores.map((alignment) => ({
      id: alignment.id,
      name: alignment.alignment_name,
      scoreRange: [0, 100],
      additive: true,
      summary: alignment.bonus_summary
    })),
    production_chains: data.building_chains,
    galaxies: genericExport.canonical.galaxies,
    sectors: genericExport.canonical.sectors,
    star_systems: genericExport.canonical.star_systems,
    planets: genericExport.canonical.planets,
    factions: genericExport.canonical.factions,
    missions: genericExport.canonical.missions,
    mission_objectives: genericExport.canonical.mission_objectives,
    mission_rewards: genericExport.canonical.mission_rewards
  };
  const contentHash = hashContent(modules);

  return {
    contentVersion,
    version: `content-v${contentVersion}`,
    publishedAt,
    source: "Project Genesis Studio",
    validation: genericExport.validation,
    contentHash,
    modules,
    relationshipMap: genericExport.relationshipMap
  };
}

function releaseFromSnapshot(snapshot: PublishedContentSnapshot, title: string, notes: string, rollbackOf?: number): ContentRelease {
  const moduleCounts = Object.fromEntries(Object.entries(snapshot.modules).map(([key, value]) => [key, moduleCount(value)]));
  return {
    id: `content-release-${snapshot.contentVersion}`,
    contentVersion: snapshot.contentVersion,
    version: snapshot.version,
    status: "published",
    title,
    notes,
    publishedAt: snapshot.publishedAt,
    contentHash: snapshot.contentHash,
    validationStatus: snapshot.validation.status,
    errorCount: snapshot.validation.errorCount,
    warningCount: snapshot.validation.warningCount,
    moduleCounts,
    rollbackOf,
    snapshot
  };
}

async function generatedInitialRelease() {
  const publishedAt = "2026-07-11T00:00:00.000Z";
  const snapshot = await buildSnapshot(1, publishedAt);
  return releaseFromSnapshot(
    snapshot,
    "Initial Published Content Snapshot",
    "Generated baseline published snapshot for Project Genesis Game clients."
  );
}

export async function validateDraftContent() {
  const snapshot = await buildSnapshot(0, new Date().toISOString());
  return {
    draftVersion: "draft-next",
    validation: snapshot.validation,
    moduleCounts: Object.fromEntries(Object.entries(snapshot.modules).map(([key, value]) => [key, moduleCount(value)])),
    contentHash: snapshot.contentHash,
    checkedAt: snapshot.validation.checkedAt
  };
}

export async function listContentReleases() {
  const store = await readStore();
  const initial = await generatedInitialRelease();
  const releases = [initial, ...store.releases.filter((release) => release.contentVersion !== initial.contentVersion)]
    .sort((a, b) => b.contentVersion - a.contentVersion);
  const latest = latestByVersion(releases);
  const draft = await validateDraftContent();

  return {
    latest: latest ? summarizeRelease(latest) : null,
    draft,
    releases: releases.map(summarizeRelease),
    endpoints: {
      manifest: "/api/game-content/manifest",
      snapshot: "/api/game-content/snapshot"
    }
  };
}

export async function getLatestPublishedRelease() {
  const store = await readStore();
  const initial = await generatedInitialRelease();
  return latestByVersion([initial, ...store.releases.filter((release) => release.contentVersion !== initial.contentVersion)]) ?? initial;
}

export async function getPublishedRelease(contentVersion?: number) {
  const store = await readStore();
  const initial = await generatedInitialRelease();
  const releases = [initial, ...store.releases.filter((release) => release.contentVersion !== initial.contentVersion)];
  if (!contentVersion) return latestByVersion(releases) ?? initial;
  return releases.find((release) => release.contentVersion === contentVersion) ?? null;
}

export async function publishCurrentDraft(input?: { title?: string; notes?: string }) {
  const store = await readStore();
  const latest = await getLatestPublishedRelease();
  const contentVersion = latest.contentVersion + 1;
  const snapshot = await buildSnapshot(contentVersion, new Date().toISOString());

  if (!snapshot.validation.valid) {
    return { ok: false as const, status: 409, message: "Draft content failed validation and was not published.", validation: snapshot.validation };
  }

  const release = releaseFromSnapshot(
    snapshot,
    input?.title?.trim() || `Published Content ${snapshot.version}`,
    input?.notes?.trim() || "Published from the Studio Content Releases workflow."
  );
  await writeStore({ releases: [...store.releases, release].sort((a, b) => a.contentVersion - b.contentVersion) });
  return { ok: true as const, release: summarizeRelease(release) };
}

export async function rollbackToRelease(contentVersion: number, input?: { title?: string; notes?: string }) {
  const target = await getPublishedRelease(contentVersion);
  if (!target) {
    return { ok: false as const, status: 404, message: `Published contentVersion ${contentVersion} was not found.` };
  }

  const store = await readStore();
  const latest = await getLatestPublishedRelease();
  const nextVersion = latest.contentVersion + 1;
  const snapshot: PublishedContentSnapshot = {
    ...target.snapshot,
    contentVersion: nextVersion,
    version: `content-v${nextVersion}`,
    publishedAt: new Date().toISOString()
  };
  const release = releaseFromSnapshot(
    snapshot,
    input?.title?.trim() || `Rollback to ${target.version}`,
    input?.notes?.trim() || `Rollback release created from ${target.version}.`,
    target.contentVersion
  );
  await writeStore({ releases: [...store.releases, release].sort((a, b) => a.contentVersion - b.contentVersion) });
  return { ok: true as const, release: summarizeRelease(release) };
}

export function manifestFromRelease(release: ContentRelease) {
  return {
    studio: "Project Genesis Studio",
    status: "published",
    latestContentVersion: release.contentVersion,
    latestVersion: release.version,
    publishedAt: release.publishedAt,
    contentHash: release.contentHash,
    validationStatus: release.validationStatus,
    errorCount: release.errorCount,
    warningCount: release.warningCount,
    moduleCounts: release.moduleCounts,
    endpoints: {
      manifest: "/api/game-content/manifest",
      snapshot: "/api/game-content/snapshot",
      versionedSnapshot: `/api/game-content/snapshot?version=${release.contentVersion}`
    }
  };
}

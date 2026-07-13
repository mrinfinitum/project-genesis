import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  duplicateSurvivalToEra,
  generateEraStarterKit,
  initialContentAuthoringState,
  type ContentAuthoringState,
  type EraScaffold
} from "@/lib/content-authoring/templates";

type ContentAuthoringStore = {
  scaffolds: EraScaffold[];
  updatedAt: string;
};

export type CreateEraScaffoldInput = {
  eraId: string;
  mode: "starter_kit" | "duplicate_survival";
};

const storePath = process.env.PROJECT_GENESIS_CONTENT_AUTHORING_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_CONTENT_AUTHORING_STORE)
  : path.join(process.cwd(), "data", "content-authoring.local.json");

async function readStore(): Promise<ContentAuthoringStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ContentAuthoringStore>;
    return {
      scaffolds: Array.isArray(parsed.scaffolds) ? parsed.scaffolds : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return { scaffolds: [], updatedAt: new Date().toISOString() };
  }
}

async function writeStore(store: ContentAuthoringStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getContentAuthoringState(): Promise<ContentAuthoringState> {
  const store = await readStore();
  return initialContentAuthoringState(store.scaffolds);
}

export async function createEraScaffold(input: CreateEraScaffoldInput): Promise<ContentAuthoringState> {
  const store = await readStore();
  const timestamp = new Date().toISOString();
  const scaffold = input.mode === "duplicate_survival"
    ? duplicateSurvivalToEra(input.eraId, timestamp)
    : generateEraStarterKit(input.eraId, timestamp);
  const nextScaffolds = [scaffold, ...store.scaffolds.filter((row) => row.id !== scaffold.id && !(row.eraId === scaffold.eraId && row.mode === scaffold.mode))];
  await writeStore({ scaffolds: nextScaffolds, updatedAt: timestamp });
  return initialContentAuthoringState(nextScaffolds);
}

export async function clearEraScaffold(eraId: string): Promise<ContentAuthoringState> {
  const store = await readStore();
  const nextScaffolds = store.scaffolds.filter((row) => row.eraId !== eraId);
  await writeStore({ scaffolds: nextScaffolds, updatedAt: new Date().toISOString() });
  return initialContentAuthoringState(nextScaffolds);
}

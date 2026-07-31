import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

type ImportedManifest = {
  packageId: string;
  volumeId: string;
  version: string;
  modelProfile: string;
  archetypeCount: number;
  outputTypeCount: number;
  promptRecordCount: number;
  files: Array<{ name: string; sha256: string }>;
};

type PromptRecord = {
  promptId: string;
  archetypeId: string;
  outputType: string;
  positivePrompt: string;
  negativePrompt: string;
  version: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function hash(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

async function main() {
  const root = path.join(process.cwd(), "data", "visual-prompt-libraries", "imported-source");
  const entries = await readdir(root, { withFileTypes: true });
  const packageFolders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert(packageFolders.length > 0, "No imported visual-prompt library packages were found.");

  let totalPrompts = 0;
  for (const folder of packageFolders) {
    const packageRoot = path.join(root, folder);
    const manifest = JSON.parse(await readFile(path.join(packageRoot, "manifest.json"), "utf8")) as ImportedManifest;
    assert(manifest.packageId && manifest.volumeId && manifest.version, `${folder}: manifest identity is incomplete.`);
    assert(manifest.modelProfile === "nano-banana-2", `${folder}: unsupported model profile ${manifest.modelProfile}.`);
    assert(/^[0-9]+\.[0-9]+\.[0-9]+$/.test(manifest.version), `${folder}: manifest version must be semantic.`);

    for (const item of manifest.files) {
      assert(!item.name.includes("/") && !item.name.includes("\\"), `${folder}: manifest file path must be local to the package.`);
      const content = await readFile(path.join(packageRoot, item.name));
      assert(hash(content) === item.sha256, `${folder}: checksum mismatch for ${item.name}.`);
    }

    const packageFiles = await readdir(packageRoot);
    const archetypeFile = packageFiles.find((filename) => filename === "archetypes.json")
      ?? packageFiles.find((filename) => filename.endsWith("-archetypes.json"));
    assert(archetypeFile, `${folder}: package is missing an archetypes file.`);

    const [archetypes, outputTypes, prompts] = await Promise.all([
      readFile(path.join(packageRoot, archetypeFile), "utf8").then((value) => JSON.parse(value) as Array<{ archetypeId: string }>),
      readFile(path.join(packageRoot, "output-types.json"), "utf8").then((value) => JSON.parse(value) as Array<{ outputType: string }>),
      readFile(path.join(packageRoot, "prompt-library.json"), "utf8").then((value) => JSON.parse(value) as PromptRecord[])
    ]);

    assert(archetypes.length === manifest.archetypeCount, `${folder}: archetype count does not match manifest.`);
    assert(outputTypes.length === manifest.outputTypeCount, `${folder}: output type count does not match manifest.`);
    assert(prompts.length === manifest.promptRecordCount, `${folder}: prompt count does not match manifest.`);

    const archetypeIds = new Set(archetypes.map((item) => item.archetypeId));
    const outputTypeIds = new Set(outputTypes.map((item) => item.outputType));
    const promptIds = new Set<string>();
    for (const prompt of prompts) {
      assert(prompt.promptId && !promptIds.has(prompt.promptId), `${folder}: prompt IDs must be unique.`);
      assert(archetypeIds.has(prompt.archetypeId), `${folder}: ${prompt.promptId} has an invalid archetype ID.`);
      assert(outputTypeIds.has(prompt.outputType), `${folder}: ${prompt.promptId} has an invalid output type.`);
      assert(prompt.positivePrompt.trim().length > 0 && prompt.negativePrompt.trim().length > 0, `${folder}: ${prompt.promptId} is missing prompt text.`);
      assert(prompt.version === manifest.version, `${folder}: ${prompt.promptId} does not match the package version.`);
      promptIds.add(prompt.promptId);
    }
    totalPrompts += prompts.length;
    console.log(`${manifest.volumeId}: ${prompts.length} imported ${manifest.modelProfile} prompts verified.`);
  }

  console.log(`Imported visual-prompt libraries verified: ${packageFolders.length} package(s), ${totalPrompts} prompt records.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

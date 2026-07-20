import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AI_LIBRARY_VERSION,
  AI_LIBRARY_VOLUME_ID,
  aiLibraryAssignmentRoles,
  aiLibraryCategories,
  aiLibraryLocalizationPlaceholders,
  aiLibraryPersonalities,
  aiLibraryRarities,
  aiLibraryVoices,
  canonicalAiLibraryAgents,
  validateCanonicalAiLibrary
} from "../lib/ai-agents/foundations";

const outputDirectory = path.join(process.cwd(), "data", "ai-agents", "exports");

function csvCell(value: unknown) {
  const serialized = Array.isArray(value) || (value && typeof value === "object") ? JSON.stringify(value) : String(value ?? "");
  return `"${serialized.replaceAll('"', '""')}"`;
}

function toCsv(rows: Array<Record<string, unknown>>) {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return `${headers.map(csvCell).join(",")}\n${rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")).join("\n")}\n`;
}

async function writeJson(filename: string, value: unknown) {
  await writeFile(path.join(outputDirectory, filename), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  await mkdir(outputDirectory, { recursive: true });
  const validation = validateCanonicalAiLibrary();
  const rarityCounts = Object.fromEntries(aiLibraryRarities.map((rarity) => [rarity.displayName, canonicalAiLibraryAgents.filter((agent) => agent.rarity === rarity.displayName).length]));
  const categoryCounts = Object.fromEntries(aiLibraryCategories.map((category) => [category.id, canonicalAiLibraryAgents.filter((agent) => agent.category_id === category.id).length]));

  await Promise.all([
    writeJson("ai_library.json", canonicalAiLibraryAgents),
    writeJson("ai_categories.json", aiLibraryCategories),
    writeJson("ai_rarity.json", aiLibraryRarities),
    writeJson("ai_personality_catalog.json", aiLibraryPersonalities),
    writeJson("ai_voice_catalog.json", aiLibraryVoices),
    writeJson("ai_assignment_roles.json", aiLibraryAssignmentRoles),
    writeJson("ai_validation_report.json", { libraryVersion: AI_LIBRARY_VERSION, volumeId: AI_LIBRARY_VOLUME_ID, ...validation }),
    writeJson("ai_statistics.json", { totalAgents: canonicalAiLibraryAgents.length, maxLevel: 50, categoryCounts, rarityCounts }),
    writeFile(path.join(outputDirectory, "ai_library.csv"), toCsv(canonicalAiLibraryAgents as unknown as Array<Record<string, unknown>>), "utf8"),
    writeFile(path.join(outputDirectory, "ai_portrait_prompts.csv"), toCsv(canonicalAiLibraryAgents.map((agent) => ({ ai_id: agent.ai_id, name: agent.name, art_key: agent.runtime_metadata.portraitArtKey, portrait_prompt: agent.portrait_prompt }))), "utf8"),
    writeFile(path.join(outputDirectory, "ai_localization.csv"), toCsv(aiLibraryLocalizationPlaceholders), "utf8")
  ]);

  if (validation.status !== "Ready") throw new Error(validation.issues.join("\n"));
  console.log(`Exported ${canonicalAiLibraryAgents.length} AI Library records to ${outputDirectory}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

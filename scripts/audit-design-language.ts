import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { noverisDesignLanguage } from "@/lib/design-language";

const root = process.cwd();
const scanRoots = ["app", "components"];
const extensions = new Set([".ts", ".tsx", ".css"]);

async function filesIn(directory: string): Promise<string[]> {
  const absolute = path.join(root, directory);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(relative) : extensions.has(path.extname(entry.name)) ? [relative] : [];
  }));
  return files.flat();
}

async function main() {
  const files = (await Promise.all(scanRoots.map(filesIn))).flat();
  const source = await Promise.all(files.map(async (file) => [file, await readFile(path.join(root, file), "utf8")] as const));
  const allText = source.map(([, text]) => text).join("\n");
  const colors = [...allText.matchAll(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/g)].map((match) => match[0]);
  const spacing = [...allText.matchAll(/(?:p|m|gap|space|rounded|w|h)-\d+/g)].map((match) => match[0]);
  const animations = [...allText.matchAll(/(?:duration|transition|animate)-[\w-]+/g)].map((match) => match[0]);
  const countDuplicates = (values: string[]) => Object.entries(values.reduce<Record<string, number>>((counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }), {})).filter(([, count]) => count > 1).sort((left, right) => right[1] - left[1]).slice(0, 24).map(([value, count]) => ({ value, count }));
  const report = {
    id: "design-language-migration-report",
    generatedAt: new Date().toISOString(),
    contract: { id: noverisDesignLanguage.id, version: noverisDesignLanguage.version },
    scannedFiles: files.length,
    migrationRule: "Map existing UI to canonical Design Language tokens before future screen work. Existing production screens are audited, not automatically restyled by this report.",
    findings: {
      duplicateButtons: source.filter(([file, text]) => /button|Button/.test(text)).map(([file]) => file),
      duplicatePanels: source.filter(([file, text]) => /panel|Panel|card|Card/.test(text)).map(([file]) => file),
      duplicateColors: countDuplicates(colors),
      duplicateSpacing: countDuplicates(spacing),
      duplicateTypography: source.filter(([file, text]) => /text-(?:xs|sm|base|lg|xl)|font-/.test(text)).map(([file]) => file),
      duplicateAnimations: countDuplicates(animations)
    },
    tokenMappings: [
      { legacy: "#050914 and deep canvas literals", canonical: "color.background.near-black (#05080F)", action: "normalize on future touch" },
      { legacy: "#07101e, #0a1425, and panel navy literals", canonical: "color.panel.dark-navy (#0B1324)", action: "normalize on future touch" },
      { legacy: "cyan utility and selected-state literals", canonical: "color.primary.electric-blue (#49A8FF)", action: "map selected and focus state" },
      { legacy: "rounded utility classes", canonical: "radius.standard (8px) or radius.large (12px)", action: "remove arbitrary radii" },
      { legacy: "tailwind spacing utilities", canonical: "space.4 through space.128", action: "map component padding and gaps" },
      { legacy: "ad hoc transition utilities", canonical: "motion.120 through motion.400 and canonical easing", action: "remove linear timing" }
    ],
    nextSteps: [
      "Replace duplicate component implementations with the canonical component definitions.",
      "Map existing screen visual values to Design Language token IDs during scheduled screen maintenance.",
      "Reject new independent visual values with DESIGN_LANGUAGE_VIOLATION."
    ]
  };
  await writeFile(path.join(root, "data", "design-language", "migration-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Design Language audit complete: ${files.length} files scanned.`);
}

void main();

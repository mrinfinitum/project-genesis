import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { componentLibraryInitialRecords } from "@/lib/component-library";
import {
  componentPreviewAuditItem,
  componentPreviewOutputs,
  generatedComponentPreviewIds
} from "@/lib/component-preview-generation";

type GenerationReport = {
  generatedAt: string;
  pendingBefore: number;
  pendingAfter: number;
  previewStatus: "Needs Review";
  generatedComponentCount: number;
  generatedOutputCount: number;
  outputFormat: "SVG";
  captureBlockers: string[];
  components: ReturnType<typeof componentPreviewAuditItem>[];
};

async function main() {
  const recordsById = new Map(componentLibraryInitialRecords.map((record) => [record.componentId, record]));
  const generatedAt = "2026-07-13T00:00:00.000Z";
  const components = [];
  let generatedOutputCount = 0;
  const captureBlockers = new Set<string>();

  for (const componentId of generatedComponentPreviewIds) {
    const record = recordsById.get(componentId);
    if (!record) throw new Error(`Cannot generate component preview for missing record ${componentId}.`);

    for (const output of componentPreviewOutputs(record)) {
      const absolutePath = path.join(process.cwd(), output.filesystemPath);
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, output.svg, "utf8");
      generatedOutputCount += 1;
    }

    const audit = componentPreviewAuditItem(record);
    audit.captureBlockers.forEach((blocker) => captureBlockers.add(blocker));
    components.push(audit);
  }

  const report: GenerationReport = {
    generatedAt,
    pendingBefore: generatedComponentPreviewIds.length,
    pendingAfter: 0,
    previewStatus: "Needs Review",
    generatedComponentCount: generatedComponentPreviewIds.length,
    generatedOutputCount,
    outputFormat: "SVG",
    captureBlockers: Array.from(captureBlockers),
    components
  };

  const reportPath = path.join(process.cwd(), "data", "component-preview-generation-report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

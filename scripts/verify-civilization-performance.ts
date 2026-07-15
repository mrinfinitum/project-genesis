import { readFile } from "node:fs/promises";
import { getEraArtInventory, getEraArtSummaryByEra } from "@/lib/assets/era-art-inventory";
import { canonicalTimelineEraId, createDefaultTimeline } from "@/components/civilization-timeline";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function measure<T>(label: string, fn: () => Promise<T>) {
  const start = performance.now();
  const value = await fn();
  const durationMs = Math.round((performance.now() - start) * 10) / 10;
  return { label, durationMs, value };
}

async function main() {
  const summary = await measure("getEraArtSummaryByEra", () => getEraArtSummaryByEra());
  const survival = await measure("getEraArtInventory survival", () => getEraArtInventory("survival"));
  const renaissance = await measure("getEraArtInventory renaissance", () => getEraArtInventory("renaissance"));
  const timeline = createDefaultTimeline("Renaissance");
  const componentSource = await readFile("components/era-art-inventory-workspace.tsx", "utf8");
  const sharedPreviewSource = await readFile("components/asset-preview.tsx", "utf8");
  const eraServiceSource = await readFile("lib/assets/era-art-inventory.ts", "utf8");

  assert(Object.keys(summary.value).length === 9, "Era art summary should cover all nine canonical eras.");
  assert(summary.durationMs < 1500, `Era summary loader is too slow: ${summary.durationMs} ms.`);
  assert(survival.value && survival.value.cards.length > 24, "Survival inventory should remain complete enough to exercise pagination.");
  assert(survival.value?.checklist.length === 0, "Era inventory should not serialize duplicate checklist rows.");
  assert(renaissance.value?.era.id === "renaissance", "Renaissance era inventory did not resolve.");
  assert(canonicalTimelineEraId("Space Age") === "space-age", "Space Age should keep canonical route id space-age.");
  assert(timeline.some((era) => era.state === "locked" && era.id), "Locked eras should still retain route IDs.");

  assert(componentSource.includes("initialCardPageSize = 24"), "Era art cards should use the 24-card initial page size.");
  assert(componentSource.includes("Load More Art Cards"), "Era art workspace should expose incremental loading.");
  assert(componentSource.includes('loading="lazy"') || sharedPreviewSource.includes('loading="lazy"'), "Era art previews should lazy-load images.");
  assert(componentSource.includes("useDeferredValue"), "Era art filters should defer text query recalculation.");
  assert(eraServiceSource.includes("loadEraArtInventoryContext"), "Era art service should use a shared cached loader context.");
  assert(eraServiceSource.includes("buildImportedCardsByEra"), "Imported art reconciliation should be precomputed by era.");
  assert(!eraServiceSource.includes("Promise.all(civilizationAges.map((era) => getEraArtInventory"), "Summary loader should not call full inventory loaders per era.");

  console.log(JSON.stringify({
    ok: true,
    measured: [
      { label: summary.label, durationMs: summary.durationMs, eras: Object.keys(summary.value).length },
      { label: survival.label, durationMs: survival.durationMs, cards: survival.value?.cards.length ?? 0, serializedChecklistRows: survival.value?.checklist.length ?? 0 },
      { label: renaissance.label, durationMs: renaissance.durationMs, cards: renaissance.value?.cards.length ?? 0 }
    ],
    pagination: {
      initialCardPageSize: 24,
      survivalTotalCards: survival.value?.cards.length ?? 0
    },
    canonicalRoutes: timeline.map((era) => era.id)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

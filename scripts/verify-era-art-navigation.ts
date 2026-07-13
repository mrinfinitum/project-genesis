import { readFile } from "node:fs/promises";
import { canonicalTimelineEraId, createDefaultTimeline } from "@/components/civilization-timeline";
import { getEraArtInventory } from "@/lib/assets/era-art-inventory";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const timeline = createDefaultTimeline("Renaissance");
  const byName = new Map(timeline.map((era) => [era.displayName, era]));

  assert(byName.get("Survival")?.id === "survival", "Survival era must route with canonical id survival.");
  assert(byName.get("Renaissance")?.id === "renaissance", "Renaissance era must route with canonical id renaissance.");
  assert(byName.get("Space Age")?.id === "space-age", "Space Age era must route with canonical id space-age.");
  assert(canonicalTimelineEraId("Space Age") === "space-age", "Space Age canonical ID normalization regressed.");

  const lockedEra = timeline.find((era) => era.state === "locked");
  assert(lockedEra, "Fixture should include at least one locked era.");
  assert(lockedEra ? `/assets/eras/${lockedEra.id}`.startsWith("/assets/eras/") : false, "Locked era must still have a View Era Art route.");

  const survival = await getEraArtInventory("survival");
  const renaissance = await getEraArtInventory("renaissance");
  const spaceAge = await getEraArtInventory("space-age");
  const invalid = await getEraArtInventory("not-a-real-era");

  assert(survival?.era.id === "survival", "Survival route inventory did not resolve.");
  assert(renaissance?.era.id === "renaissance", "Renaissance route inventory did not resolve.");
  assert(spaceAge?.era.id === "space-age", "Space Age route inventory did not resolve as space-age.");
  assert(invalid === null, "Invalid era ID should resolve to the route not-found state.");

  const componentSource = await readFile("components/civilization-timeline.tsx", "utf8");
  assert(componentSource.includes('href={`/assets/eras/${era.id}`}'), "View Era Art must build its route from era.id.");
  assert(!componentSource.includes("<button") && !componentSource.includes("<Button"), "Timeline card should not nest View Era Art inside a button.");
  assert(componentSource.includes("pointer-events-auto"), "View Era Art link should keep pointer events enabled.");
  assert(componentSource.includes("focus-visible:outline"), "View Era Art link should have a visible keyboard focus state.");

  console.log(JSON.stringify({
    status: "ok",
    routes: [
      "/assets/eras/survival",
      "/assets/eras/renaissance",
      "/assets/eras/space-age"
    ],
    lockedEraClickable: true,
    invalidEraNotFound: true
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

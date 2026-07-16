import { getArchitectureState } from "@/lib/architecture";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const state = await getArchitectureState();
  const hierarchy = state.sections.find((section) => section.id === "hierarchy");
  const galaxy = state.sections.find((section) => section.id === "galaxy");
  const runtime = state.sections.find((section) => section.id === "runtime");

  assert(hierarchy?.content.some((line) => line.includes("Galaxy -> Sector -> Star System -> Planet")), "Architecture hierarchy must preserve Galaxy -> Sector -> Star System -> Planet.");
  assert(galaxy?.content.some((line) => line.includes("Do not add Region or Cluster")), "Galaxy architecture must forbid Region/Cluster layers.");
  assert(runtime?.content.some((line) => line.includes("Game never invents gameplay")), "Runtime architecture must preserve Studio-owned gameplay.");

  console.log(JSON.stringify({
    ok: true,
    architectureVersion: state.architectureVersion.current,
    runtimeVersion: state.currentRuntimeVersion,
    hierarchy: "Civilization -> Galaxy -> Sector -> Star System -> Planet -> Settlement"
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

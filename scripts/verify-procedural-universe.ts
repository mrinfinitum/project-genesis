import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, gameRuntimeContentVersion, validateGameRuntimeData } from "@/lib/runtime/game-runtime";
import { generateGalaxy, generateSector, generateSectors, generateStarSystem, generateStarSystems, generateUniverse } from "@/lib/universe/generator";
import {
  VISUAL_SIGNATURE_VERSION,
  discoveryVisibilityMatrix,
  generateUniqueVisualSignature,
  generateVisualSignature,
  migrateLegacyVisualRecord,
  parentAffinity,
  proceduralUniverseVisualContract,
  validateVisualSignature,
  visualDeviceProfiles,
  visualDistance
} from "@/lib/universe/visual-signatures";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const input = { universeSeed: "NOVERIS-VERIFY-001", generationVersion: "seeded-cascade-v1", semanticLevel: "galaxy" as const, canonicalObjectId: "galaxy-verification" };
  const first = generateVisualSignature(input);
  const repeated = generateVisualSignature(input);
  assert(JSON.stringify(first) === JSON.stringify(repeated), "Visual signatures must be deterministic for identical inputs.");
  assert(first.fingerprint !== generateVisualSignature({ ...input, canonicalObjectId: "galaxy-verification-b" }).fingerprint, "Different canonical objects must resolve distinct signatures.");
  assert(!validateVisualSignature(first).some((issue) => issue.severity === "error"), "Generated fixture signature is invalid.");

  const siblings = [] as ReturnType<typeof generateVisualSignature>[];
  for (let index = 0; index < 8; index += 1) {
    const signature = generateUniqueVisualSignature({ ...input, semanticLevel: "sector", canonicalObjectId: `sector-${index}`, parentSignature: first }, siblings);
    assert(siblings.every((sibling) => visualDistance(signature, sibling) >= proceduralUniverseVisualContract.deterministicRules.siblingMinimumDistance), `Sibling uniqueness failed for sector-${index}.`);
    assert(parentAffinity(signature, first) >= 0.2, `Parent visual affinity failed for sector-${index}.`);
    siblings.push(signature);
  }

  const override = generateVisualSignature({ ...input, override: { paletteId: "palette_cyan_amber", luminosity: 0.5 } });
  assert(override.paletteId === "palette_cyan_amber" && override.luminosity === 0.5, "Explicit visual overrides must win over deterministic defaults.");
  assert(generateVisualSignature({ ...input, visualSignatureVersion: "visual-signature-v2-fixture" }).fingerprint !== first.fingerprint, "A visual-signature version change must invalidate visual identity.");
  const legacy = migrateLegacyVisualRecord({ id: "legacy-galaxy", seed: "legacy-seed" }, { generationVersion: "seeded-cascade-v1", semanticLevel: "galaxy" });
  assert(legacy.migrated && legacy.record.id === "legacy-galaxy" && legacy.preservedCanonicalId, "Legacy migration must derive a signature without changing the canonical ID.");

  const universe = generateUniverse("NOVERIS-VERIFY-001");
  const galaxy = generateGalaxy(universe.universe_seed, 1);
  const sector = generateSector(galaxy, 1);
  const system = generateStarSystem(sector, 1);
  assert(Boolean(universe.visual_signature && galaxy.visual_signature && sector.visual_signature && system.visual_signature), "Generated hierarchy records must publish visual signatures.");
  assert(galaxy.id === generateGalaxy(universe.universe_seed, 1).id, "Visual identity must not alter topology IDs.");
  const milkyWay = generateGalaxy(universe.universe_seed, 0);
  const localBubble = generateSectors(milkyWay, 1)[0];
  const sol = generateStarSystems(localBubble, 1)[0];
  assert(sol.visual_signature?.archetypeId === "warm_golden_single_star", "Sibling uniqueness must preserve the authored Sol visual override.");

  const profileIds = Object.values(proceduralUniverseVisualContract.profileLibraries).flatMap((library) => library.map((profile) => profile.id));
  assert(new Set(profileIds).size === profileIds.length, "Visual profile IDs must be globally unique.");
  const unknown = discoveryVisibilityMatrix.find((state) => state.id === "unknown");
  assert(unknown?.unknownDisplayName === "???" && !unknown.canShowName && !unknown.canShowResources && !unknown.canShowDiscoveries && !unknown.canShowRegistry, "Unknown discovery visibility must redact canonical knowledge.");
  assert(visualDeviceProfiles.every((profile) => profile.recommendationOnly), "Device budgets must remain renderer recommendations only.");
  const serializedContract = JSON.stringify(proceduralUniverseVisualContract);
  for (const forbidden of ["selectedObject", "probeState", "fogRevealMasks", "bookmarks", "saveData", "playerDiscovery"]) assert(!serializedContract.includes(`\"${forbidden}\"`), `Public contract leaks ${forbidden}.`);

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeValidation = validateGameRuntimeData(runtime);
  assert(gameRuntimeContentVersion >= 51, "Procedural visual signatures require contentVersion 51 or newer.");
  assert(runtime.galaxyEngineContract.proceduralUniverse.visualSignatureVersion === VISUAL_SIGNATURE_VERSION, "Canonical runtime is missing the procedural universe visual contract.");
  assert(runtimeValidation.status === "Ready", runtimeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map(async (target) => ({ target, payload: await buildGameEngineExport(target) })));
  for (const { target, payload } of exports) {
    assert(payload.validation.status === "Ready", `${target} export is ${payload.validation.status}.`);
    assert(payload.canonical.galaxy_engine_contract.proceduralUniverse.visualSignatureVersion === VISUAL_SIGNATURE_VERSION, `${target} export is missing visualSignatureVersion.`);
  }

  console.log(JSON.stringify({ status: "Ready", contentVersion: gameRuntimeContentVersion, checksum: runtime.metadata.checksum, visualSignatureVersion: VISUAL_SIGNATURE_VERSION, profiles: profileIds.length, siblingFixtures: siblings.length, engineExports: Object.fromEntries(exports.map(({ target, payload }) => [target, payload.validation.status])) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

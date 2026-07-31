import { speciesPlateSliceManifest, validateSpeciesPlateAssetPack } from "@/lib/species-plates/asset-pack";

export async function GET() {
  const issues = validateSpeciesPlateAssetPack();
  if (issues.length) return Response.json({ error: "Species plate slice manifest validation failed.", issues }, { status: 500 });
  return Response.json(speciesPlateSliceManifest, {
    headers: { "Content-Disposition": 'attachment; filename="SpeciesPlateMaster.slices.json"', "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" }
  });
}

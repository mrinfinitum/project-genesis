import { speciesPlateLayoutManifest, validateSpeciesPlateAssetPack } from "@/lib/species-plates/asset-pack";

export async function GET() {
  const issues = validateSpeciesPlateAssetPack();
  if (issues.length) return Response.json({ error: "Species plate layout manifest validation failed.", issues }, { status: 500 });
  return Response.json(speciesPlateLayoutManifest, {
    headers: { "Content-Disposition": 'attachment; filename="SpeciesPlateMaster.layout.json"', "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" }
  });
}

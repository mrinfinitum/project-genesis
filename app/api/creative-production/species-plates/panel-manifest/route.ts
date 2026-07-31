import { speciesPlatePanelManifest, validateSpeciesPlateAssetPack } from "@/lib/species-plates/asset-pack";

export async function GET() {
  const issues = validateSpeciesPlateAssetPack();
  if (issues.length) return Response.json({ error: "Species plate panel manifest validation failed.", issues }, { status: 500 });
  return Response.json(speciesPlatePanelManifest, {
    headers: { "Content-Disposition": 'attachment; filename="SpeciesPlateMaster.panels.json"', "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" }
  });
}

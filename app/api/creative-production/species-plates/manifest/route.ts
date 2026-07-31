import { speciesPlateAssetPackContract, speciesPlateLayoutManifest, speciesPlatePanelManifest, speciesPlateSliceManifest, validateSpeciesPlateAssetPack } from "@/lib/species-plates/asset-pack";

export async function GET() {
  const issues = validateSpeciesPlateAssetPack();
  if (issues.length) return Response.json({ error: "Species plate manifest validation failed.", issues }, { status: 500 });
  return Response.json({
    ...speciesPlateAssetPackContract.manifest,
    manifests: {
      layout: "/api/creative-production/species-plates/layout-manifest",
      panels: "/api/creative-production/species-plates/panel-manifest",
      slices: "/api/creative-production/species-plates/slice-manifest"
    },
    layoutGroupCount: speciesPlateLayoutManifest.groups.length,
    panelCount: speciesPlatePanelManifest.panels.length,
    sliceCount: speciesPlateSliceManifest.slices.length
  }, {
    headers: {
      "Content-Disposition": 'attachment; filename="SpeciesPlateMaster.manifest.json"',
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
    }
  });
}

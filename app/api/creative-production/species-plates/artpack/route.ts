import { buildSpeciesPlateArtpackDescriptor, validateSpeciesPlateAssetPack } from "@/lib/species-plates/asset-pack";

export const dynamic = "force-dynamic";

export async function GET() {
  const issues = validateSpeciesPlateAssetPack();
  if (issues.length) return Response.json({ error: "Species plate art pack validation failed.", issues }, { status: 500 });
  return new Response(JSON.stringify(buildSpeciesPlateArtpackDescriptor(), null, 2), {
    headers: {
      "Content-Type": "application/vnd.noveris.artpack+json",
      "Content-Disposition": 'attachment; filename="SpeciesPlateMaster.artpack"',
      "Cache-Control": "private, no-store"
    }
  });
}

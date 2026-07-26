import { planetDetailScreenRuntimeContract } from "@/lib/assets/planet-detail-screen";

export async function GET() {
  return Response.json(planetDetailScreenRuntimeContract.manifest, {
    headers: {
      "Content-Disposition": 'attachment; filename="PlanetDetailScreen.manifest.json"',
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
    }
  });
}

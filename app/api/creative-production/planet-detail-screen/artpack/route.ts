import { buildPlanetDetailArtpackDescriptor } from "@/lib/assets/planet-detail-screen";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = JSON.stringify(buildPlanetDetailArtpackDescriptor(), null, 2);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.noveris.artpack+json",
      "Content-Disposition": 'attachment; filename="PlanetDetailScreen.artpack"',
      "Cache-Control": "private, no-store"
    }
  });
}

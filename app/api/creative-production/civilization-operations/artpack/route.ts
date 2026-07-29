import { buildCivilizationOperationsArtpackDescriptor } from "@/lib/assets/civilization-operations-deck";

export async function GET() {
  return Response.json(buildCivilizationOperationsArtpackDescriptor(), {
    headers: {
      "Cache-Control": "private, max-age=0, must-revalidate",
      "Content-Disposition": 'attachment; filename="CivilizationOperationsDeck.artpack"'
    }
  });
}

import { civilizationOperationsDeckContract } from "@/lib/assets/civilization-operations-deck";

export async function GET() {
  return Response.json(civilizationOperationsDeckContract, {
    headers: {
      "Cache-Control": "private, max-age=0, must-revalidate",
      "Content-Disposition": 'attachment; filename="CivilizationOperationsDeck.manifest.json"'
    }
  });
}

import { createEngineExportResponse } from "@/lib/export/game-engine";

export async function GET(request: Request) {
  return createEngineExportResponse(request, "unreal");
}

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function byteLength(value: unknown) {
  return Buffer.byteLength(JSON.stringify(value));
}

function chunkFiles(directory: string): Array<{ file: string; bytes: number }> {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((file) => file.endsWith(".js"))
    .map((file) => ({ file, bytes: statSync(path.join(directory, file)).size }))
    .sort((a, b) => b.bytes - a.bytes);
}

async function main() {
  const chunkDir = path.join(process.cwd(), ".next", "static", "chunks");
  const chunks = chunkFiles(chunkDir);
  assert(chunks.length > 0, "Build chunks are missing. Run npm run build before performance verification.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  const runtimeBytes = byteLength(runtime);
  const runtimeGzipBytes = gzipSync(JSON.stringify(runtime)).byteLength;
  const exportSizes = exports.map((payload, index) => ({
    target: targets[index],
    status: payload.validation.status,
    bytes: byteLength(payload),
    gzipBytes: gzipSync(JSON.stringify(payload)).byteLength
  }));
  const publicPayloadText = JSON.stringify({ runtime, exports });
  const privateNeedles = ["/Users/", "SUPABASE_SERVICE_ROLE_KEY", "service_role", "studio-private://assets/", "studio-private://supabase/"];
  const privatePathViolations = privateNeedles.filter((needle) => publicPayloadText.includes(needle));
  const largestChunk = chunks[0];
  const totalChunkBytes = chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);
  const largestExport = exportSizes.slice().sort((a, b) => b.bytes - a.bytes)[0];

  assert(largestChunk.bytes <= 1_500_000, `Largest JS chunk is too large: ${largestChunk.file} ${largestChunk.bytes} bytes.`);
  assert(runtimeBytes <= 5_000_000, `Canonical runtime payload is too large: ${runtimeBytes} bytes.`);
  assert(largestExport.bytes <= 10_000_000, `Largest engine export payload is too large: ${largestExport.target} ${largestExport.bytes} bytes.`);
  assert(exports.every((payload) => payload.validation.status === "Ready"), "All six engine exports must remain Ready.");
  assert(privatePathViolations.length === 0, `Public runtime/export payload leaks private values: ${privatePathViolations.join(", ")}`);

  console.log(JSON.stringify({
    status: "ok",
    chunks: {
      count: chunks.length,
      totalBytes: totalChunkBytes,
      largest: largestChunk,
      topFive: chunks.slice(0, 5)
    },
    runtimePayload: {
      bytes: runtimeBytes,
      gzipBytes: runtimeGzipBytes,
      contentVersion: runtime.metadata.contentVersion,
      checksum: runtime.metadata.checksum,
      validationStatus: runtime.metadata.validationStatus
    },
    engineExports: exportSizes,
    privatePathViolations
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

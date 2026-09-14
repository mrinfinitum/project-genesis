import assert from "node:assert/strict";
import { gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";
import {
  UNITY_RUNTIME_CAPABILITIES,
  UNITY_RUNTIME_SCHEMA_ID,
  UNITY_RUNTIME_SCHEMA_VERSION,
  type UnityRuntimePackage
} from "@/lib/runtime/unity-runtime-contract";
import { validateUnityRuntimePackage } from "@/lib/runtime/unity-runtime-package";

const DEFAULT_ENDPOINT = "https://project-genesis-livid.vercel.app/api/export/unity-runtime.json";
const endpoint = process.argv[2] ?? DEFAULT_ENDPOINT;

type VerificationResult = {
  attempt: number;
  checksum: string;
  bytes: number;
  assets: number;
};

async function downloadAndValidate(attempt: number): Promise<VerificationResult> {
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    redirect: "error"
  });
  assert.equal(response.status, 200, `attempt ${attempt}: expected HTTP 200, received ${response.status}`);

  const body = await response.text();
  const runtimePackage = JSON.parse(body) as UnityRuntimePackage;
  const validation = validateUnityRuntimePackage(runtimePackage);

  assert.equal(validation.valid, true, `attempt ${attempt}: ${JSON.stringify(validation.issues)}`);
  assert.equal(runtimePackage.metadata.runtimeSchemaId, UNITY_RUNTIME_SCHEMA_ID);
  assert.equal(runtimePackage.metadata.runtimeSchemaVersion, UNITY_RUNTIME_SCHEMA_VERSION);
  assert.equal(runtimePackage.metadata.contentVersion, gameRuntimeContentVersion);
  assert.equal(runtimePackage.metadata.validationStatus, "Ready");
  for (const capability of UNITY_RUNTIME_CAPABILITIES) {
    assert.ok(runtimePackage.metadata.capabilities.includes(capability), `attempt ${attempt}: missing capability ${capability}`);
  }
  assert.equal(response.headers.get("x-noveris-runtime-schema"), runtimePackage.metadata.runtimeSchemaId);
  assert.equal(response.headers.get("x-noveris-content-version"), String(runtimePackage.metadata.contentVersion));
  assert.equal(response.headers.get("x-noveris-package-checksum"), runtimePackage.metadata.packageChecksum);
  assert.equal(response.headers.get("x-noveris-validation-status"), runtimePackage.metadata.validationStatus);
  assert.equal(response.headers.get("x-noveris-data-source"), "supabase", `attempt ${attempt}: production payload is not marked as Supabase-backed`);

  return {
    attempt,
    checksum: runtimePackage.metadata.packageChecksum,
    bytes: Buffer.byteLength(body),
    assets: runtimePackage.runtime.assets.length
  };
}

async function main() {
  const first = await downloadAndValidate(1);
  const second = await downloadAndValidate(2);
  assert.equal(second.checksum, first.checksum, "deployed package checksum changed between downloads");

  console.log(JSON.stringify({
    status: "Ready",
    endpoint,
    schema: `${UNITY_RUNTIME_SCHEMA_ID}@${UNITY_RUNTIME_SCHEMA_VERSION}`,
    contentVersion: gameRuntimeContentVersion,
    stableChecksum: first.checksum,
    attempts: [first, second]
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

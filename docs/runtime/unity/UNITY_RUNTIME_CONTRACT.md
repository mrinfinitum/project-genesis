# NOVERIS Unity Runtime Contract

## Authority

Unity must load only `GET /api/export/unity-runtime.json` for the canonical Studio gameplay runtime. The older `/api/export/unity` route is an engine starter/export bundle and is not an authoritative runtime endpoint.

The package envelope is `game-runtime-v2` version `2.0.0`, requires Unity client `2.0.0` or newer, and identifies the canonical source runtime schema separately as `sourceRuntimeSchemaId`.

## Load order

1. Download the package.
2. Require HTTP 200 and `metadata.validationStatus === "Ready"`.
3. Run compatibility negotiation before deserializing gameplay contracts.
4. Verify `metadata.packageChecksum` using the documented canonical serialization.
5. Validate references and schemas.
6. Cache by schema ID, content version, and checksum.
7. Reconcile saved instances using the published policies.

## Capabilities

- `progression-levels-v1`
- `upgrade-mastery-v1`
- `labor-level-up-v1`
- `crystal-acceleration-v1`
- `canonical-actions-v1`
- `action-queues-v1`
- `offline-reconciliation-v1`
- `reward-claim-policy-v1`
- `runtime-reconciliation-v1`
- `typed-action-requirements-v1`

All listed capabilities are required. A client missing any capability must reject the package.

## Runtime rules

- Generated progression rows are explicit, deterministic, checksummed, and contiguous.
- Every action cost and reward is fixed or references a typed deterministic resolver.
- Missing values never default to zero.
- Requirements use canonical target IDs and evaluator types.
- Offline, reward claim, and reconciliation behavior are data, not client-authored policy.
- The package contains no Studio source-master paths, prompts, credentials, or private notes.

See `UNITY_RUNTIME_SCHEMA.json` for the machine-readable envelope and `UNITY_RUNTIME_EXAMPLE.json` for a compact representative package.

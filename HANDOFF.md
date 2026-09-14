# Project Genesis Studio — Codex Handoff

Verified against the repository and deployed Unity endpoint on 2026-09-14.

## Start Here

Reconcile the Unity release record with the deployed deterministic package. The live endpoint currently serves checksum `602a0ee8173592014970d7e1f5efb844eea5d83055ad77af406385d1a946bc1d`, while `docs/runtime/unity/UNITY_RUNTIME_RELEASE_72.md` still records the pre-normalization checksum `07d14ad578634dbad5f8504d2d33bdd103a8d16e5b284bbef6be6161af7a3041`.

Before editing the release document, decide whether production is intentionally using bundled fallback data. The live payload contains 96 assets and matches the normalized fallback package. A local Supabase-backed build previously contained 137 assets and produced checksum `d0ff0a06761a5a8a0de2236fb9ff8f064d9d5b8f6eab3bc75fbb904728f7df2a`. Do not publish the Supabase checksum unless that exact package is deployed and independently verified.

Preserve runtime schema `game-runtime-v2@2.0.0`, content version `72`, stable canonical IDs, checksum semantics, and all existing engine exports.

## Project and Current State

Project Genesis Studio is the private/internal canonical content and asset-authoring IDE for NOVERIS/Project Genesis. Studio owns canonical definitions, validation, publishing, and engine-facing exports. Game clients own rendering, player state, active actions, queues, timestamps, and saves.

- Repository: `project-genesis-planner`
- Package: `project-genesis-studio`
- Branch: `main`
- Runtime implementation baseline: `44f6c8216c63951c59e7b6e4cf09f788961e2de2`; this handoff is committed immediately after it.
- Runtime content version: `72`
- Source runtime: `game-runtime-v1`
- Unity envelope: `game-runtime-v2@2.0.0`
- Authoritative route: `GET /api/export/unity-runtime.json`

## Work Completed

The runtime contract work is committed and pushed:

- `e83d892` — Add canonical progression curves, crystal acceleration, and timed actions.
- `087c178` — Resolve executable progression and action runtime policies.
- `30de64e` — Add Unity runtime compatibility and capabilities.
- `bc2b309` — Add checksummed authoritative Unity runtime endpoint.
- `5720387` — Add Unity runtime validation and contract package.
- `0e8ce7c` — Publish Unity runtime content version 72.
- `44f6c82` — Make Unity runtime generation deterministic.

The latest commit fixes database-row-order dependence by sorting source tables before deriving runtime structures. It also adds an injected-source-data test path and a regression that reverses relevant input tables and requires an identical final package checksum.

Relevant files:

- `lib/runtime/game-runtime.ts` — canonical source normalization and runtime construction.
- `lib/runtime/unity-runtime-package.ts` — Unity package construction, sanitization, canonical serialization, SHA-256 checksum, and validation.
- `scripts/verify-unity-runtime-package.ts` — compatibility, checksum, policy, leakage, and shuffled-input determinism tests.
- `app/api/export/unity-runtime.json/route.ts` — authoritative public GET endpoint.
- `middleware.ts` — anonymous GET whitelist; anonymous HEAD is not whitelisted.
- `docs/runtime/unity/` — schema, migration, compatibility, reconciliation, checksum, and release documentation.

## Runtime Contract

- Unity must load only `/api/export/unity-runtime.json` for authoritative gameplay data. `/api/export/unity` is a starter/export bundle, not the canonical runtime.
- Clients must reject incompatible schema versions, clients below version `2.0.0`, missing capabilities, unsupported required contracts, and checksum mismatches.
- SHA-256 covers recursively sorted object keys while preserving array order. Only `metadata.generatedAt` and `metadata.packageChecksum` are blanked before hashing.
- Publication fails closed for unresolved costs/rewards, malformed generated levels, missing policies/capabilities, checksum mismatch, or leaked private paths.
- Studio publishes definitions and reconciliation policies; Unity owns runtime/player instances.

Runtime inventory:

- 9 progression profiles and 900 generated profile rows.
- 556 upgrades with explicit levels 1–100 (55,600 generated upgrade rows).
- 16 mastery XP sources.
- 3 crystal acceleration profiles and 7 crystal chunks.
- 52 canonical action profiles.
- 10 required Unity capabilities.
- Default mastery overflow policy: `carry_forward`.

## Deployment Verification

Verified `https://project-genesis-livid.vercel.app/api/export/unity-runtime.json` on 2026-09-14:

- Anonymous GET: HTTP 200.
- Schema: `game-runtime-v2@2.0.0`.
- Content version: `72`.
- Validation header/status: `Ready`.
- Package checksum: `602a0ee8173592014970d7e1f5efb844eea5d83055ad77af406385d1a946bc1d`.
- Downloaded package passed `validateUnityRuntimePackage()` with zero issues.
- Uncompressed JSON: 67,447,624 bytes.
- Gzip transfer observed: 5,742,095 bytes in about 20.8 seconds.
- Assets: 96; upgrades: 556.
- Vercel reported `x-vercel-cache: MISS`.

The live checksum equals the normalized local fallback-data checksum. A Supabase-backed verification previously passed with 137 assets and checksum `d0ff0a06761a5a8a0de2236fb9ff8f064d9d5b8f6eab3bc75fbb904728f7df2a`. This indicates the endpoint's canonical contents depend on whether Supabase configuration/data is available, even though row ordering is now deterministic within either dataset.

## Verification Status

Successful after `44f6c82`:

- `npx tsc --noEmit --pretty false`
- `npm run verify:progression-actions`
- `npm run verify:unity-runtime-package` with fallback data
- Unity verifier with `.env.local` Supabase-backed data
- `npm run build`
- Local production HTTP GET: 200, content 72, `Ready`
- Shuffled-input regression for both fallback and Supabase-backed source data
- Live deployment download and repository validation on 2026-09-14

Known pre-existing gaps:

- `npm run lint` still uses deprecated `next lint` and lacks a committed noninteractive ESLint CLI setup.
- `verify:environment-composer` expects pending PSD layer-group parser support.
- Several legacy verifiers require exactly `Ready` while the broader source runtime reports `Ready With Warnings`.
- `verify:production-foundation` expects the retired phrase `Nano Banana 2`.

## Recommended Next Steps

1. Determine why the deployment is using fallback data rather than the Supabase-backed dataset, and decide which dataset is authoritative for Unity release 72.
2. After that decision, fetch the deployed endpoint twice, validate both payloads, and require identical checksums.
3. Update `docs/runtime/unity/UNITY_RUNTIME_RELEASE_72.md` with the verified authoritative deployed checksum and byte size; commit and push.
4. Add a CI/deployment integration verifier for HTTP status, schema, content version, required capabilities, checksum validity, stable repeated checksum, and payload-size reporting.
5. Improve delivery for the 67.4 MB JSON. Preserve the one authoritative entry point and deterministic content; evaluate a cached/static artifact or a versioned manifest/chunk transport.
6. Review the two prior production-only records named `asset-smoke-local-png` and `asset-smoke-local-psd` if Supabase is restored; they appear to be test artifacts but must not be deleted without confirmation.
7. Address legacy verifier drift and replace deprecated lint configuration separately from the runtime transport work.

## Working Tree and Safety

Before this handoff refresh, tracked files were clean and `main` matched `origin/main`. `HANDOFF.md` was an existing untracked handoff file. The following other untracked paths are user/local artifacts and must not be staged, deleted, moved, or reorganized without explicit confirmation:

- `Curiosity Codex Handoff/`
- `blender/`
- `design-review-package-2026-07-07/`
- `nav icons.ai`
- `paseo.json`
- `project-genesis-chatgpt-handoff-2026-07-09.zip`
- `project-genesis-chatgpt-handoff-2026-07-09/`
- `project-genesis-chatgpt-handoff-2026-07-10.zip`
- `project-genesis-chatgpt-handoff-2026-07-10/`
- `project-genesis-design-review-package-2026-07-07.zip`
- `project-genesis-planner-2026-07-07.zip`
- `tsconfig.tsbuildinfo`

The user prefers completed, verified project changes to be committed and pushed unless they say otherwise. Stage only files belonging to the active task.

## Environment

```bash
npm install
npm run dev
```

The app can use bundled fallback data without Supabase. Relevant environment variable names include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_ASSET_BUCKET`
- `NEXT_PUBLIC_REQUIRE_MFA`
- `REQUIRE_MFA`
- `PROJECT_GENESIS_EXPORT_TOKEN`
- `PROJECT_GENESIS_ADMIN_EMAILS`
- `PROCEDURAL_PLANET_SOURCE_SIZE`
- `PROCEDURAL_PLANET_VARIANT_SIZES`
- `NEXT_PUBLIC_AUTO_RENDER_PROCEDURAL_PLANETS`
- `MAGNIFIC_API_KEY`
- `OPENAI_API_KEY`
- `OPENAI_PLANET_METADATA_MODEL`

Never print or commit environment values or credentials.

## Prompt for the Next Codex Session

```text
Read HANDOFF.md completely, verify its branch/commit and working-tree claims, and inspect the live Unity endpoint before making changes. Continue from “Start Here.” Preserve schema game-runtime-v2@2.0.0, content version 72, stable canonical IDs, checksum semantics, all existing engine exports, and unrelated untracked artifacts. Determine whether fallback or Supabase-backed data is intended to be authoritative in production; do not update the release checksum until the deployed payload is validated twice and its data source is understood. Commit and push completed verified changes, staging only files in scope.
```

# Unity Runtime Release 72

- Runtime schema: `game-runtime-v2@2.0.0`
- Source runtime schema: `game-runtime-v1`
- Minimum Unity client: `2.0.0`
- Authoritative endpoint: `/api/export/unity-runtime.json`
- Content version: `72`
- Checksum algorithm: `sha256`
- Recorded pre-normalization checksum (not approved for activation): `07d14ad578634dbad5f8504d2d33bdd103a8d16e5b284bbef6be6161af7a3041`
- Contract validation status: `Ready`
- Publication status: `Blocked — authoritative Supabase source unavailable`
- Recorded uncompressed JSON bytes: `67,447,624`

## Data authority and publication status

Studio Supabase is the authoritative production content source for this release. The bundled handoff data is a local-development fallback and is not an implicit production release source.

Publication of the authoritative release checksum is currently blocked because Supabase reports that the project exceeds its storage quota. Existing data access silently fell back after those read failures; production Unity publication now fails closed instead of labeling fallback or mixed-source content authoritative.

On 2026-09-14, the deployed endpoint was downloaded and repository-validated twice before this guard was deployed. Both downloads were 67,447,624 bytes, contained 96 assets, and had stable checksum `602a0ee8173592014970d7e1f5efb844eea5d83055ad77af406385d1a946bc1d`. That checksum identifies the normalized bundled fallback package and is intentionally not the approved release checksum.

After Supabase service is restored, deploy the Supabase-backed package, run `npm run verify:unity-runtime-deployment`, and only then replace the recorded checksum and byte size with the twice-validated authoritative values.

## Included capabilities

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

## Contract versions

- `canonicalProgressionSystem@1.0.0`
- `canonicalActionSystem@1.0.0`
- `timeActionContract@1.0.0`
- `progressionReconciliation@1.0.0`
- `actionReconciliation@1.0.0`

## Verification

- Authoritative anonymous GET: HTTP 200, `Ready`
- Generic export: HTTP 200, `Ready`
- Roblox export: HTTP 200, `Ready`
- Web export: HTTP 200, `Ready`
- Unity starter export: HTTP 200, `Ready`
- Unreal export: HTTP 200, `Ready`
- Godot export: HTTP 200, `Ready`
- Progression/action verifier: `Ready`
- Unity runtime package verifier: `Ready`
- Production build: passed

Unity must negotiate the v2 envelope and verify the package checksum before activating this release. It must not treat `/api/export/unity` as the authoritative gameplay runtime.

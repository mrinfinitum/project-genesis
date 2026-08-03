# Unity Runtime Release 72

- Runtime schema: `game-runtime-v2@2.0.0`
- Source runtime schema: `game-runtime-v1`
- Minimum Unity client: `2.0.0`
- Authoritative endpoint: `/api/export/unity-runtime.json`
- Content version: `72`
- Checksum algorithm: `sha256`
- Package checksum: `07d14ad578634dbad5f8504d2d33bdd103a8d16e5b284bbef6be6161af7a3041`
- Validation status: `Ready`
- Uncompressed JSON bytes: `67,447,624`

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

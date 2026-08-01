# Runtime Export Audit

| Target | Route | Static review | Evidence |
| --- | --- | --- | --- |
| generic | /api/export/generic | route present; response not invoked | app/api/export/generic/route.ts |
| web | /api/export/web | route present; response not invoked | app/api/export/web/route.ts |
| roblox | /api/export/roblox | route present; response not invoked | app/api/export/roblox/route.ts |
| unity | /api/export/unity | route present; response not invoked | app/api/export/unity/route.ts |
| unreal | /api/export/unreal | route present; response not invoked | app/api/export/unreal/route.ts |
| godot | /api/export/godot | route present; response not invoked | app/api/export/godot/route.ts |

## Contract and leakage review

Static route presence is verified. This audit did not start authenticated runtime routes, so content version, checksum, validation status, and sanitized payload field contents remain explicitly unverified. Review targets include `lib/runtime/game-runtime.ts`, `lib/export/game-engine.ts`, and each adapter route.

Potential authoring-only leakage categories to verify through endpoint fixtures: Nano Banana prompts, source-master paths, rejected-asset metadata, production notes, and validation histories.

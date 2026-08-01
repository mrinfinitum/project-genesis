# Architecture Audit

## Framework and entry points

- Framework: Next.js `^15.1.0`, React `^19.0.0`, TypeScript `^5.7.2`.
- Application routes are file-system routes under `app/`.
- App shell and user-facing navigation are defined in `components/app-shell.tsx`.
- Persistence: `lib/data.ts` uses Supabase only when server configuration is present; otherwise it reads bundled handoff data and optional `.local-data` fallback files.
- Runtime builder: `lib/runtime/game-runtime.ts`; adapters: `lib/export/game-engine.ts`.

## Counts

| Area | Count |
| --- | --- |
| Source files | 2338 |
| Pages | 127 |
| API routes | 46 |
| Components | 71 |
| Library modules | 102 |
| Scripts | 44 |
| Tests | 0 |
| JSON | 547 |
| CSV | 33 |
| Markdown | 108 |

## Existing boundaries

| Boundary | Evidence | Audit reading |
| --- | --- | --- |
| Studio authoring | `lib/data.ts`, `data/handoff` | Studio owns canonical data and asset metadata. |
| Unity | `app/api/export/unity/route.ts`, asset manifests | Unity is an export consumer; live Unity project is outside this repository. |
| Roblox/Web/Unreal/Godot/Generic | `app/api/export/*` | Adapters are present; runtime payloads were not invoked in this audit. |
| Source masters | `source-masters -> game-art/source-masters` | Private art source tracking is local to Studio. |

## Inferred architecture concern

The repository contains both flat-environment-painting direction and legacy/multi-layer environment contracts. This is an evidence-backed overlap, not proof that either runtime path is active in a deployed client.

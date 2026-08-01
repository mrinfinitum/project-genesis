# Executive Summary

## Current purpose

Project Genesis Studio is a Next.js canonical content, visual-prompt, source-master, asset-production, and multi-engine export application. Static evidence shows a hybrid persistence model: bundled handoff data and local JSON fallback, with optional Supabase server access.

## Evidence snapshot

| Metric | Value |
| --- | --- |
| Commit | 7365e4e |
| Runtime content version | 65 |
| Routes | 191 |
| Pages | 127 |
| API routes | 46 |
| Components | 71 |
| Generator-related files | 28 |
| Schemas | 29 |
| Canonical libraries | 70 |
| Canonical records counted from bundled sources | 9950 |
| Prompt records | 13682 |
| Source-master files | 298 |
| Asset registry records | 96 |
| Approved/published assets | 0 |
| Missing assets | 2 |
| Runtime targets | 6 |
| Build commands passed | 4/7 |

## Strengths

- Canonical handoff data is extensive and traceable under `data/handoff/json`.
- Six engine export routes are present with a shared runtime builder and adapters.
- Source masters are centralized through the `source-masters` symbolic link.
- Prompt libraries, species plates, generator surfaces, and asset-production registry are all materially present.

## Primary risks

- Multi-layer environment records remain behind generators/API despite flat-background direction.
- PSD slice manifests can imply Studio ownership of Unity layout coordinates.
- Bundled fallback data and live Supabase can diverge.
- No automated screenshot evidence was available for current UI state.
- Some build-health commands are absent or incompatible with the current package script surface.

## Recommended next five actions

1. **Immediate:** Publish and review this audit before deleting additional architecture. Protects canonical content and asset references.
2. **Immediate:** Define a single flat-background record/manifest contract before retiring environment layer records. Current generators and API still represent multi-layer assets.
3. **Immediate:** Decide Unity ownership for Planet Detail sprite placement and freeze only semantic asset keys in Studio. PSD slicing contains presentation layout metadata.
4. **Next:** Consolidate generator inputs around canonical record IDs and source-master manifests. Reduces prompt and generator overlap.
5. **Next:** Add an automated route screenshot harness to the audit process. This audit could not capture live pages without browser automation.

## Limits

This audit inspected repository sources and ran the commands recorded in [BUILD_HEALTH_AUDIT.md](BUILD_HEALTH_AUDIT.md). It did not connect to a live Supabase instance, invoke authenticated exports, mutate data, or capture browser screenshots.

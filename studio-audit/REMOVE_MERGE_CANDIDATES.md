# Remove, Merge, and Deprecation Candidates

| Candidate | Category | Risk | Migration | Recommendation |
| --- | --- | --- | --- | --- |
| Environment Composer UI | retain | medium | No, if only UI routes are removed. | Keep narrow theme/export contract; do not reintroduce freeform composition. |
| Environment layer asset API | deprecate | high | Yes; preserve approved paintings as single background asset records first. | Inventory and migrate approved records before removal. |
| Species Plate layout contract | simplify | medium | No for prompts; yes for any active layout manifests. | Retain prompt and asset extraction contracts; move visual layout ownership to Unity or an offline art tool. |
| Planet Detail PSD slicing | migrate_data_first | high | Yes; retain source master, exported PNG assets, manifest semantic keys, and safe-area metadata. | Keep asset identity and exported sprites; discontinue Studio ownership of Unity coordinates. |
| Legacy map-named routes | rename | low | No; redirects preserve bookmarks. | Plan redirects only after confirming external links. |

## Flat-background direction

### Environment Builder removal

**Not yet safe to remove without migration.** The scene UI has been removed, but `components/environment-layer-generator.tsx` and `app/api/environment-layer-assets/route.ts` still model multi-layer environment records. Preserve approved paintings and semantic context IDs as flat asset records before retiring them.

### Screen Designer removal

No active Screen Designer route was found in this repository snapshot. However, Planet Detail PSD slicing and Creative Production screen manifests remain. Remove coordinate ownership only after Unity receives/owns layout contracts and Studio keeps semantic asset identity, exports, and safe-area metadata.

### Species Plates

Retain the prompt and asset-manifest parts. The panel coordinate/preset layer overlaps the planned Unity/authoring-tool ownership boundary and is a simplify candidate, not a safe immediate deletion.

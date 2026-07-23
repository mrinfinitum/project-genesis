# Environment Layer Generators

The Environment Layer Generators guide artists through creating canonical source layers for NOVERIS. They do not generate final runtime scenes and they do not replace artistic review.

## Relationship To Planet Generation

Planet Generation remains the canonical prompt library for planet and Sol-system body artwork. The four environment generators are separate production workspaces for reusable scene layers:

- `/universe-layer-generator`
- `/galaxy-layer-generator`
- `/sector-layer-generator`
- `/star-system-layer-generator`

Each route renders its own fixed canonical layer stack. The environments are not combined behind a selector or tab set.

## Canonical Layer Stacks

| Generator | Layers |
| --- | ---: |
| Universe | 6 |
| Galaxy | 10 |
| Sector | 10 |
| Star System | 13 |

Definitions and prompts live in `data/environment-layer-generator-definitions.json`. The source specification can be re-imported with `scripts/import-environment-layer-generator-spec.mjs`.

## Source-Masters Workflow

The artist-facing root is `source-masters/`, which resolves locally to the existing private `game-art/source-masters/` collection. Source artwork remains private and ignored by Git. Numbered environment folders contain tracked `.gitkeep` files only.

1. Copy the finished layer prompt.
2. Generate the image externally.
3. Refine it in Photoshop.
4. Save the PSD in the displayed numbered source folder.
5. Export a runtime PNG or WebP to the displayed export folder.
6. Add a repository-relative preview reference.
7. Register the asset metadata.
8. Update the production status.
9. Use the approved asset later in Environment Composer.

## Prompt Customization

Page-level artist controls add theme, palette, mood, color hierarchy, density, brightness, negative-space, safe-zone, resolution, aspect-ratio, style, and exclusion context. Every layer retains its fixed canonical purpose and exclusions.

`Copy Prompt` copies only the finished generation prompt. It does not include UI labels or JSON.

## Naming

Master filenames follow:

`PREFIX_###_DescriptiveSuffix.psd`

Examples:

- `FS_001_MidnightSapphire.psd`
- `NR_001_AncientViolet.psd`
- `GDL_003_ShadowArms.psd`

The generator inspects registered records for a layer and proposes the next unused three-digit index. Artists can edit the descriptive suffix.

## Registration

Registration creates a compatible Studio `assets` record and preserves canonical environment metadata:

- stable asset ID
- environment and layer identity
- source and runtime relative paths
- dimensions and aspect ratio
- transparency requirement
- theme and palette tags
- status, notes, and timestamps

Absolute local paths are rejected. PSD and PSB files are never emitted into runtime exports.

## Statuses

- `not_started`
- `prompt_copied`
- `generated`
- `psd_saved`
- `exported`
- `registered`
- `approved`
- `needs_revision`

Progress is stored locally per generator page. Resetting page progress does not delete registered Studio assets.

## Environment Composer

The generator pages produce source-layer records. Environment Composer consumes approved semantic layer references to define layered scene intent. Game clients remain responsible for final rendering, shaders, cameras, controls, and platform optimization.

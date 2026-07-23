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
| Star System | 8 |

Definitions and prompts live in `data/environment-layer-generator-definitions.json`. The source specification can be re-imported with `scripts/import-environment-layer-generator-spec.mjs`.

### Star System Environment Painting

The Star System workflow uses one foundational `Environment Painting` instead of separate Far Stars, Mid Stars, Rear Nebula, Front Nebula, Haze, and Space Dust production layers. Painting those atmospheric elements together improves artistic cohesion and reduces production complexity.

The master painting contains deep space, far and mid-distance stars, distant and foreground nebula, subtle interstellar dust, and subtle cosmic haze. It excludes planets, the central star, moons, orbit lines, galaxies, spacecraft, text, UI, vignettes, radial gradients, and decorative framing.

Light Rays, Foreground Dust, Ambient Particles, Fog of War, Orbit Styles, Asteroid Belts, and Selection Effects remain independent because they animate, change at runtime, carry gameplay meaning, or benefit from compositing.

Existing Star System progress and registered layer metadata are normalized when read. Legacy atmosphere records resolve to Environment Painting, surviving layer IDs remain stable, and their layer numbers and canonical folders shift to the new eight-layer order.

## Production-Locked Star System Environment Prompt

The Star System Environment Painting uses the canonical production prompt:

- Prompt ID: `star_system_astronomical_matte_painting_v1`
- Version: `1.0`
- Status: `LOCKED`
- Approved: yes
- Canonical: yes

Copy Prompt returns the locked text exactly. Artist controls and editable additions cannot alter it. Universe, Galaxy, Sector, and transparent Star System layer prompts retain their existing behavior.

The canonical visual benchmark is displayed directly on the Star System Layer Generator and stored at:

`public/images/environment-art-standard/noveris-environment-art-standard-v1.png`

Quiet Mode is permanently enabled for Star System Environment Paintings. It prioritizes the quieter, darker, more scientifically believable composition, reduces visual clutter and bright stars, and preserves negative space.

Its permanent principles are:

- the star, planets, and gameplay remain visually dominant over the environment
- 85–90% of a background remains visually quiet
- atmospheric artwork occupies approximately 10–15%
- stellar distribution targets 98% tiny, 1.5% medium, and 0.5% bright stars
- molecular clouds remain small, fragmented, subtle, low contrast, irregular, and partially dissolved
- no framing composition, recognizable Milky Way, fantasy spectacle, artificial vignette, large continuous dust bands, or exaggerated nebula
- every approval uses the artist review checklist displayed beneath the benchmark

This prompt is considered production locked.

Future variation should come from artistic curation and environment biome selection rather than continual prompt editing.

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

- `EP_001_MidnightSapphire.psd`
- `LR_001_AncientViolet.psd`
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

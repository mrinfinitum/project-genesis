# Render Library

The Render Library is the canonical Studio workspace for exact Blender render profile specifications used by the NOVERIS production pipeline.

## Purpose

Render profiles document the values artists need to recreate approved Blender materials, node graphs, object settings, and setup checklists. The library is production-facing and reference-oriented.

## Ownership Boundary

Studio owns:

- Stable render profile IDs and slugs
- Exact Blender values
- Node graph documentation
- Studio authoring contracts
- Copy-ready setup notes
- Validation rules

The Game and renderer tools own:

- Blender execution
- Python automation
- Runtime rendering
- Three.js, shaders, camera, lighting, and controls
- Gameplay simulation

Render Library profiles are not added to the canonical game runtime and must not change `runtimeVersion` or `contentVersion`.

## Profile Categories

- Surface
- Clouds
- Atmosphere
- Lighting
- Camera
- Background
- Moons
- Rings
- Output

## Naming Convention

Use descriptive stable slugs with version suffixes:

- `surface-profile-rock-v001`
- `cloud-profile-v001`

Material names should preserve their Blender source names, such as `Surface_Profile_Rock_v001`.

## Exact-Value Philosophy

Every numeric value records the exact parameter, value, unit, min, max, step, precision, description, Studio exposure, and Blender target path.

Color values record HEX and RGB values. ColorRamp values record ordered stops with position, HEX, RGB, interpolation, and stop name.

## Blender 5.2 LTS Baseline

The first seeded profiles use Blender `5.2 LTS` and the `NOVERIS Planet Renderer`.

## Studio Contract Rules

Each contract entry records what Studio may author. In this implementation, `studioEditable` may be true, but `runtimePublished` must remain false.

## Clipboard Workflow

Artists can copy:

- Full profile specification
- Exact values
- JSON export
- Blender setup checklist
- Studio render contract
- Individual values
- HEX colors
- Blender data paths

Copy actions provide visible success feedback through the shared Production clipboard component.

## JSON Export

The JSON export is a production handoff shape for one profile or all profiles. It is not a game runtime export.

## Validation

Validation checks duplicate IDs and slugs, categories, statuses, versions, object/material names, HEX colors, ColorRamp ordering, numeric ranges, contract keys, node references, Material Output wiring, and runtime publication isolation.

## Runtime Isolation

Any profile with `runtimePublished: true` is invalid. Render Library data must not flow into gameplay exports until a future explicitly approved runtime contract is created.

## Future Blender Automation Hooks

Future automation may read these profiles to drive Blender setup, but this task does not launch Blender, run subprocesses, or write Blender files.

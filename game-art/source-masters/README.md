# NOVERIS Source Masters

This is the canonical local home for layered artwork imported into Project Genesis Studio.
The artwork itself and `manifest.local.json` are intentionally ignored by git.

The canonical private root is `game-art/source-masters/`. The repository-relative
artist alias `source-masters/` points here so copied generator paths resolve
locally without creating or maintaining a second artwork collection.

The numbered Universe, Galaxy, Sector, and Star System directories are the
canonical destinations used by the dedicated Environment Layer Generator pages.
Empty production folders contain only `.gitkeep`; PSD artwork remains ignored.

## Folder structure

```text
source-masters/
  README.md
  manifest.local.json
  icons/
  ui/
  legacy/
  testing/
  planets/
    terrestrial/
    gas-giants/
    ice/
    lava/
    ocean/
    desert/
    toxic/
    barren/
    atmospheres/
    clouds/
    rings/
    moons/
  stars/
    yellow/
    blue/
    red/
    white/
    neutron/
    giant/
    binary/
    coronas/
    glows/
    surface-noise/
  star-systems/
    environment-painting/
      environment-painting-<system-slug>.psd
  environments/
    universe/
      backgrounds/
      galaxies/
      cosmic-web/
      haze/
      dust/
      light-rays/
    galaxy/
      backgrounds/
      spiral-arms/
      core-glow/
      dust-lanes/
      nebulas/
      star-clouds/
      particles/
    sector/
      backgrounds/
      deep-stars/
      clusters/
      nebulas/
      dust/
      haze/
      particles/
    star-system/
      01_environment-painting/
      02_light-rays/
      03_foreground-dust/
      04_particles/
      05_fog-of-war/
      06_orbit-styles/
      07_asteroid-belts/
      08_selection-effects/
    planet-surface/
      skies/
      mountains/
      terrain/
      vegetation/
      clouds/
      weather/
      fog/
      particles/
    settlements/
      backgrounds/
      skyline/
      atmosphere/
      lighting/
      particles/
  effects/
    selection/
    discovery/
    ping/
    glows/
    flares/
    fog/
    orbit-lines/
    ui-overlays/
  exports/
    unity/
    roblox/
    web/
    thumbnails/
```

## Naming

- Lowercase kebab-case filenames.
- Preserve meaningful canonical IDs and numeric sequence suffixes.
- Use `-landscape-` for surface/landscape variants.
- Keep ambiguous legacy artwork under `legacy/unclassified` until reviewed.
- Never put PSD, PSB, TIFF, AI, or other private source masters under `public/`.
- Keep editable masters outside `exports/`; exports contain approved derivatives only.
- Store star-system environment paintings under `star-systems/environment-painting/`
  using `environment-painting-<system-slug>.psd`; never register a generic
  painting as a system-specific source.
- Use the Environment Composer semantic asset ID in derivative metadata, not a
  machine-specific source path.

## Game-use derivatives

- PSD files remain private canonical masters and are never referenced by a game client.
- Studio PSD uploads automatically generate a native-resolution lossless PNG, a
  WebP preview, and a 480x270 library thumbnail.
- Raster masters are never upscaled beyond their source dimensions.
- Game clients consume the published derivative URL and checksum, never the PSD
  filename or a local filesystem path.
- Planet Detail Screen masters can be regenerated with
  `npm run generate:psd-game-derivatives`.
- Star-system environment paintings can be regenerated with
  `npm run generate:star-system-environment-paintings`.

## Organize local masters

Preview the migration:

```bash
npm run organize:source-masters
```

Apply it:

```bash
npm run organize:source-masters -- --apply
```

The command writes `manifest.local.json` with the original path, canonical path,
file size, and SHA-256 checksum for every copied source master. Legacy originals
remain in place as a rollback set until their retirement is explicitly approved.

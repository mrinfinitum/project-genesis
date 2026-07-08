# Planet Renders

Drop offline planet PNG renders in this folder. The PNG and JSON files in this folder are ignored by Git.

Example:

```text
planet-renders/
  ocean/deep-ocean/planet_ocean_deep_ocean_00001.png
  lava/volcanic/planet_lava_volcanic_00001.png
  ice/glacial/planet_ice_glacial_00001.png
  sol/earth.psd
  sol/mars_landscape.psd
```

The folder skeleton follows the Planet Generation prompt library:

```text
planet-renders/<planet-class>/<subclass>/
```

Do not use `rings` folders. Moons and rings are planet characteristics now, not render library folders.

Hardcoded Sol system bodies can live directly in `planet-renders/sol/`. Use the body name as the filename, for example `earth.psd`, `mars.png`, `jupiter.psd`, or `moon.webp`. Landscape and orbital companion files can use the same suffix pattern as procedural renders, for example `earth_landscape.psd` or `saturn_orbital.psd`.

Generate sidecar metadata JSON:

```bash
npm run describe:planet-renders -- ./planet-renders --limit=10
npm run describe:planet-renders -- ./planet-renders --write
```

Upload to Supabase Storage and register rows:

```bash
npm run import:planet-renders -- ./planet-renders --apply
```

Or run the full metadata + import flow:

```bash
npm run sync:planet-renders -- ./planet-renders
```

Useful checks:

```bash
npm run sync:planet-renders -- ./planet-renders --dry-run --limit=1
npm run sync:planet-renders -- ./planet-renders --overwrite
```

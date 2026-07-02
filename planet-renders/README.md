# Planet Renders

Drop offline planet PNG renders in this folder. The PNG and JSON files in this folder are ignored by Git.

Example:

```text
planet-renders/
  ocean/high-clouds/ocean-world-0001-4096.png
  lava/rings/lava-world-0002-4096.png
  ice/thin-atmosphere/ice-world-0003-4096.png
```

Generate sidecar metadata JSON:

```bash
npm run describe:planet-renders -- ./planet-renders --limit=10
npm run describe:planet-renders -- ./planet-renders --write
```

Upload to Supabase Storage and register rows:

```bash
npm run import:planet-renders -- ./planet-renders --apply
```

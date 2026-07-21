# NOVERIS Source Masters

This is the canonical local home for layered artwork imported into Project Genesis Studio.
The artwork itself and `manifest.local.json` are intentionally ignored by git.

## Folder structure

```text
source-masters/
  planets/<class>/<subclass>/
  icons/research/<legacy-stage>/
  icons/technology/<legacy-stage>/
  ui/screens/<screen>/
  ui/components/<component>/
  ui/navigation/
  legacy/unclassified/
  testing/
```

## Naming

- Lowercase kebab-case filenames.
- Preserve meaningful canonical IDs and numeric sequence suffixes.
- Use `-landscape-` for surface/landscape variants.
- Keep ambiguous legacy artwork under `legacy/unclassified` until reviewed.
- Never put PSD, PSB, TIFF, AI, or other private source masters under `public/`.

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

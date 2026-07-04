#!/usr/bin/env bash
set -euo pipefail

ROOT="./planet-renders"
DRY_RUN=0
OVERWRITE=0
UPLOAD_PSD_SOURCE=0
LIMIT=""

usage() {
  cat <<'USAGE'
Usage:
  npm run sync:planet-renders -- [folder] [options]

Examples:
  npm run sync:planet-renders -- ./planet-renders --dry-run --limit=1
  npm run sync:planet-renders -- ./planet-renders
  npm run sync:planet-renders -- ./planet-renders --overwrite
  npm run sync:planet-renders -- ./planet-renders --upload-psd-source

Options:
  --dry-run             Preview metadata and import rows without writing JSON or uploading.
  --overwrite           Regenerate existing sidecar JSON metadata.
  --upload-psd-source   Also upload PSD source files when importing.
  --limit=N             Limit metadata description to N image files.
  -h, --help            Show this help.
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1
      ;;
    --overwrite)
      OVERWRITE=1
      ;;
    --upload-psd-source)
      UPLOAD_PSD_SOURCE=1
      ;;
    --limit=*)
      LIMIT="${arg#--limit=}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --*)
      echo "Unknown option: $arg" >&2
      usage
      exit 1
      ;;
    *)
      ROOT="$arg"
      ;;
  esac
done

declare -a describe_flags=()
declare -a import_flags=()

if [[ "$DRY_RUN" == "0" ]]; then
  describe_flags+=("--write")
  import_flags+=("--apply")
fi

if [[ "$OVERWRITE" == "1" ]]; then
  describe_flags+=("--overwrite")
fi

if [[ -n "$LIMIT" ]]; then
  describe_flags+=("--limit=$LIMIT")
fi

if [[ "$UPLOAD_PSD_SOURCE" == "1" ]]; then
  import_flags+=("--upload-psd-source")
fi

echo "Planet render folder: $ROOT"
if [[ "$DRY_RUN" == "1" ]]; then
  echo "Mode: dry run"
else
  echo "Mode: write JSON + upload/register"
fi

if [[ "${#describe_flags[@]}" -gt 0 ]]; then
  npm run describe:planet-renders -- "$ROOT" "${describe_flags[@]}"
else
  npm run describe:planet-renders -- "$ROOT"
fi

if [[ "${#import_flags[@]}" -gt 0 ]]; then
  npm run import:planet-renders -- "$ROOT" "${import_flags[@]}"
else
  npm run import:planet-renders -- "$ROOT"
fi

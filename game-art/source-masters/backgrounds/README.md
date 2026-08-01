# Canonical Background Source Masters

This tree is the canonical home for flat, decorative background source masters.

- Studio owns source tracking, prompts, approval, derivatives, and sanitized manifests.
- Unity owns screen composition, coordinates, interaction, and rendering.
- Backgrounds must not contain interactive objects, labels, HUD, or gameplay data.
- Galaxy masters use `galaxy-background-<id>.psd`.
- Galactic Region masters use `galactic-region-background-<id>.psd`.
- Star System masters use `star-system-background-<id>.psd`.
- Existing public PNG and WebP derivative paths remain stable when a source master moves.

Each context folder may contain its PSD/PSB sources, non-runtime references, and a local manifest. Public runtime exports must never expose these local paths.

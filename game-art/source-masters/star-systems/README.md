# Star System Environment Paintings

Star-system masters are grouped by production role. The system identity is part
of the filename:

```text
source-masters/star-systems/
  environment-painting/
    environment-painting-<system-slug>.psd
```

For example, Sol is stored at:

```text
source-masters/star-systems/environment-painting/environment-painting-sol.psd
```

The PSD remains the canonical editable source. Studio generates the 4K game PNG,
review preview, and library thumbnail from that exact composite. Cards and game
clients use those derivatives; they never read the PSD or a private local path.

Use lowercase kebab-case system slugs and filenames. Do not register a shared or
generic space painting as the environment painting for a canonical system.

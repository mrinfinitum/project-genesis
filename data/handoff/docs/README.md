# Project Genesis Codex Handoff

This package contains the current Project Genesis master game database.

## Included

- `Project_Genesis_Master_Database_v2.2.xlsx` — full master workbook
- `/csv` — every worksheet exported as CSV
- `/json` — every worksheet exported as JSON records
- `/json/project_genesis_game_data.json` — combined JSON for the key gameplay tables
- `manifest.json` — sheet index with row counts and file paths
- `docs/codex_prompt.md` — prompt to give Codex

## Current Version

v2.2 Sprint 2 Relationships

## Key Tables

Start with these:

1. Research
2. Research Branches
3. Unlock Matrix
4. Buildings
5. Building Relationships
6. Districts
7. Building Chains
8. Wonders
9. All Upgrades
10. Game Constants
11. Feature Flags

## Data Rules

- IDs are permanent.
- Names can change.
- Use IDs for references.
- Research expands the game by unlocking new capabilities.
- Upgrades improve existing systems through levels.
- Unlock Matrix is the normalized source-to-unlock relationship table.
- Do not hardcode gameplay values in components; read from data files or database.

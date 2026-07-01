# Codex Task: Import Project Genesis Database

You are working on Project Genesis Studio, a private internal game database/admin tool for managing game content.

Use the provided handoff package as the source of truth.

## Files to inspect first

1. `json/project_genesis_game_data.json`
2. `json/Research.json`
3. `json/Unlock_Matrix.json`
4. `json/Buildings.json`
5. `json/Building_Relationships.json`
6. `json/Districts.json`
7. `json/Wonders.json`
8. `json/All_Upgrades.json`
9. `json/Game_Constants.json`
10. `json/Feature_Flags.json`

## Goal

Import this data into the Project Genesis Studio database and make it usable in the admin app.

## Important rules

- Treat IDs as permanent primary keys.
- Do not generate new IDs unless creating new records.
- Names are display labels and can change.
- Research is one-time progression that unlocks new gameplay.
- Upgrades are repeatable level-based improvements.
- The Unlock Matrix should power relationships between Research, Buildings, Wonders, Features, Systems, and future content.
- Do not hardcode gameplay values inside React components.
- Keep import scripts idempotent when possible.

## Suggested implementation

1. Create or update Supabase/Postgres schema for:
   - research_branches
   - research
   - unlock_matrix
   - buildings
   - building_relationships
   - districts
   - building_chains
   - wonders
   - upgrades
   - game_constants
   - feature_flags

2. Add an import script:
   - Read `json/project_genesis_game_data.json`
   - Upsert records by `ID`
   - Preserve display names and notes
   - Log inserted, updated, and skipped rows

3. Add admin pages or verify existing pages:
   - Dashboard
   - Research
   - Unlock Matrix
   - Buildings
   - Building Relationships
   - Districts
   - Wonders
   - Upgrades

4. Add exports:
   - `/api/export/research`
   - `/api/export/buildings`
   - `/api/export/unlock-matrix`
   - `/api/export/game-data`
   - JSON files should be clean enough for Roblox Lua module generation.

5. Add dashboard metrics:
   - Research count
   - Building count
   - Unlock Matrix count
   - Wonders count
   - District count
   - Upgrade count
   - Feature flags enabled/disabled

## Deliverable

When complete, the app should allow browsing, searching, filtering, editing, importing, and exporting the Project Genesis game database.

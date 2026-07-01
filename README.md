# Project Genesis Studio

Private internal game database/admin tool for Project Genesis. Phase 1 includes the dashboard, Supabase/Postgres schema, v2.2 handoff data, Research CRUD, Buildings CRUD, Unlock Matrix CRUD, Building Relationships CRUD, Upgrades CRUD, and JSON/CSV exports.

## Start Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app renders with local data from `data/handoff/json` when Supabase environment variables are not configured. CRUD changes in that mode are saved to `.local-data` so you can work without a Supabase account.

Uploads also work without Supabase during local development. PNG and PSD files are saved under `public/uploads/project-genesis-assets`, and their row links are saved in `.local-data`.

The Planetary Rules section stores the Project Genesis Planet Generation System v1.0 as procedural generation variables, including seed-driven planet fields, star systems, classes, biomes, climates, atmospheres, resources, flora, fauna, ancient civilizations, hazards, traits, modifiers, collectibles, visual themes, weather, colonization, science, economy, events, discovery journal fields, and story components. The Planets section generates and stores planet cards from those rules.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ASSET_BUCKET=project-genesis-assets
NEXT_PUBLIC_REQUIRE_MFA=true
REQUIRE_MFA=true
PROJECT_GENESIS_EXPORT_TOKEN=
PROJECT_GENESIS_ADMIN_EMAILS=
```

5. Seed the database:

```bash
npm run seed
```

## File Storage

The Assets, Upgrades, Buildings, and Research pages support source PSD uploads.

The Conceptual Art page stores standalone reference/source artwork in the separate `conceptual_art` table and accepts PSD, PNG, JPG/JPEG, WebP, GIF, TIFF, BMP, and PDF files. PSD uploads keep the original source file for download and generate a PNG preview for the gallery, dashboard feed, and image-only lightbox.

Without Supabase, files are saved locally to `public/uploads/project-genesis-assets`, while row metadata is saved to `.local-data`.

With Supabase:

1. Run `supabase/schema.sql`; it creates a public `project-genesis-assets` bucket and a public-read policy.
2. Keep `SUPABASE_ASSET_BUCKET=project-genesis-assets` in `.env.local`, or change it if you use another bucket name.
3. Open `/assets` and click `Source PSD` to upload a standalone Photoshop source file.
4. Open `/upgrades`, `/buildings`, or `/research` and click the source PSD action on a row to upload row-specific source art.
5. Row uploads create/link an asset record and generate PNG variants in Supabase Storage.

Source PSD uploads write to `assets.source_file_url` and mark the asset as `PSD Source`.

Uploads use the server-side `SUPABASE_SERVICE_ROLE_KEY`; the key is never sent to the browser.

### Migrating Local Uploads

If files were uploaded before Supabase Storage was configured, migrate local files from `public/uploads/project-genesis-assets` into Supabase Storage:

```bash
npm run migrate:local-assets
npm run migrate:local-assets -- --apply
```

The first command is a dry run. The `--apply` command uploads files, upserts asset rows, and links upgrade/building rows when asset IDs follow `asset-upgrades-*` or `asset-buildings-*`.

## Authentication

Project Genesis Studio uses Supabase Auth for private admin access.

1. In Supabase, open Authentication and enable the Email provider.
2. Create studio users from Authentication > Users, or invite them by email.
3. Enable TOTP multi-factor authentication in Supabase Auth settings.
4. Set `NEXT_PUBLIC_REQUIRE_MFA=true` and `REQUIRE_MFA=true` in local and Vercel environments.
5. Open `/login`, sign in with email/password, then enroll an authenticator app when prompted.

Protected admin routes require a Supabase session. When MFA is enabled, app pages and API routes require an `aal2` session after the authenticator code is verified.

Password recovery starts from `/login` and sends users to `/auth/update-password`. Add your production domain and `http://localhost:3000/**` to Supabase Auth redirect URLs so reset links can open the password update page.

Studio admins can create and delete users from `/settings`. Bootstrap the first admin by setting `PROJECT_GENESIS_ADMIN_EMAILS` to one or more comma-separated email addresses. Users created from the app are stored in Supabase Auth with `app_metadata.role` set to `admin` or `member`; only admins can call the user-management API.

For read-only automation or another project, set `PROJECT_GENESIS_EXPORT_TOKEN` and call export endpoints with:

```bash
Authorization: Bearer your-token
```

The export token only bypasses auth for `/api/export/*`.

## PSD to PNG Generation

Assets, Upgrades, Buildings, and Research with a source PSD generate transparent PNG variants.

1. Upload a source PSD for the row.
2. Upgrades generate 64x64, 96x96, 128x128, 160x160, 192x192, and 256x256 PNG variants.
3. Buildings and Research generate a 1024x1024 PNG variant.
4. Click the image-plus action to open the variant picker.
5. Click a size to download that transparent PNG.

Variants are trimmed, centered with `contain`, and saved with transparent backgrounds. The generator reads the PSD composite image data. For best results, save PSD files with Photoshop compatibility enabled.

## Phase 1 Routes

- `/` Dashboard
- `/research` Research CRUD
- `/buildings` Buildings CRUD
- `/building-relationships` Building Relationships CRUD
- `/unlock-matrix` Unlock Matrix CRUD
- `/upgrades` Upgrades CRUD
- `/wonders` Wonders CRUD
- `/districts` Districts CRUD
- `/planets` Generated planet card gallery
- `/planetary-rules` Planetary Rules variable CRUD
- `/assets` Assets CRUD
- `/conceptual-art` Conceptual Art gallery
- `/building-chains` Building Chains CRUD
- `/game-constants` Game Constants CRUD
- `/feature-flags` Feature Flags CRUD

## Exports

CSV exports:

- `/api/export/research?format=csv`
- `/api/export/buildings?format=csv`
- `/api/export/unlock_matrix?format=csv`
- `/api/export/upgrades?format=csv`
- `/api/export/building_relationships?format=csv`

Codex/Roblox-ready JSON exports:

- `/api/export/research.json`
- `/api/export/buildings.json`
- `/api/export/unlock_matrix.json`
- `/api/export/unlock-matrix`
- `/api/export/wonders.json`
- `/api/export/districts.json`
- `/api/export/upgrades.json`
- `/api/export/building_relationships.json`
- `/api/export/building-relationships`
- `/api/export/building_chains.json`
- `/api/export/game_constants.json`
- `/api/export/feature_flags.json`
- `/api/export/planets.json`
- `/api/export/planetary-rules.json`
- `/api/export/generated_planets.json`
- `/api/export/all`
- `/api/export/game-data`

## Structure

- `app` Next.js app routes and API routes
- `components` shell, tables, UI primitives
- `lib` Supabase, export, and table configuration helpers
- `types` shared TypeScript schemas
- `data/handoff` Project Genesis v2.2 handoff source JSON and docs
- `data/seed` generated Project Genesis seed data retained for development reference
- `scripts` database seed script
- `supabase` SQL schema

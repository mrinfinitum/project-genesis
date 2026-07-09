alter table public.planet_resource_profiles
  add column if not exists primary_resource_ids jsonb default '[]'::jsonb,
  add column if not exists secondary_resource_ids jsonb default '[]'::jsonb,
  add column if not exists rare_resource_ids jsonb default '[]'::jsonb,
  add column if not exists exotic_resource_ids jsonb default '[]'::jsonb,
  add column if not exists resource_weights jsonb default '{}'::jsonb,
  add column if not exists abundance_range jsonb default '{}'::jsonb,
  add column if not exists mining_difficulty_modifier numeric default 0,
  add column if not exists refinement_difficulty_modifier numeric default 0;

alter table public.generated_planets
  add column if not exists resource_ids jsonb default '[]'::jsonb;

update public.codex_readiness_items
set
  status = 'Complete',
  description = 'Planet resource profiles export canonical resource ID buckets and deterministic planet generation stores resource IDs.',
  notes = 'Completed with normalized ID export, strict validation, deterministic weighted generation, and generated planet resourceIds.'
where id = 'codex-planet-resource-profiles-v2';

update public.data_health_checks
set
  affected_count = 0,
  description = 'Planet resource profiles are normalized into canonical resource ID buckets for deterministic generation.',
  recommended_action = 'Resolved. Keep new profile resources catalog-backed before economy, mining, crafting, colonies, or trading work.',
  resolved = true,
  resolved_at = '2026-07-09T00:00:00.000Z'
where id = 'health-planet-resource-unknowns';

insert into public.codex_tasks (
  id,
  title,
  source_type,
  source_id,
  system,
  priority,
  status,
  description,
  related_tables,
  export_path,
  created_at,
  updated_at,
  notes
)
values (
  'task-codex-planet-resource-profiles-v2',
  'Planet Resource Profiles v2.0',
  'codex_readiness_item',
  'codex-planet-resource-profiles-v2',
  'Planet Resources',
  'Critical',
  'Complete',
  'Normalize all planet resource profile data so deterministic planet resource generation can reliably reference the canonical Resource Catalog.',
  '["planet_resource_profiles", "resource_catalog"]'::jsonb,
  '/api/export/planet_resource_profiles.json',
  '2026-07-09T00:00:00.000Z',
  '2026-07-09T00:00:00.000Z',
  'Completed: profiles export primaryResourceIds, secondaryResourceIds, rareResourceIds, exoticResourceIds; validation rejects invalid/missing/duplicate IDs; generation stores resourceIds and resolves display names from ResourceService.'
)
on conflict (id) do update set
  status = excluded.status,
  updated_at = excluded.updated_at,
  notes = excluded.notes;

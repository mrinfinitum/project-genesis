insert into codex_tasks (
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
  'task-codex-resource-catalog-v1',
  'Resource Catalog v1.0',
  'codex_readiness_item',
  'codex-resource-catalog-v1',
  'Resources',
  'High',
  'Complete',
  'Canonical resource definitions are ready for Roblox module generation.',
  '["resource_catalog", "planet_resource_profiles"]'::jsonb,
  '/api/export/resource_catalog.json',
  '2026-07-06T00:00:00.000Z',
  '2026-07-09T00:00:00.000Z',
  'Completed by centralizing resource catalog access through ResourceService/resource_catalog and removing hardcoded resource names from generation paths. Evidence: commit 4dbdc24 Centralize resource catalog access.'
)
on conflict (id) do update set
  title = excluded.title,
  source_type = excluded.source_type,
  source_id = excluded.source_id,
  system = excluded.system,
  priority = excluded.priority,
  status = excluded.status,
  description = excluded.description,
  related_tables = excluded.related_tables,
  export_path = excluded.export_path,
  updated_at = excluded.updated_at,
  notes = excluded.notes;

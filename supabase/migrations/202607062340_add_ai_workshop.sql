create table if not exists ai_inbox (
  id text primary key,
  title text not null,
  content_type text not null,
  source_table text,
  source_id text,
  system text,
  status text default 'Pending',
  priority text default 'Medium',
  prompt_template text,
  generated_prompt text,
  ai_result text,
  result_summary text,
  related_name text,
  related_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz,
  notes text
);

create table if not exists prompt_templates (
  id text primary key,
  name text not null,
  content_type text not null,
  system text,
  template_text text not null,
  output_format text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  notes text
);

create index if not exists ai_inbox_status_idx on ai_inbox(status);
create index if not exists ai_inbox_content_type_idx on ai_inbox(content_type);
create index if not exists ai_inbox_system_idx on ai_inbox(system);
create index if not exists ai_inbox_priority_idx on ai_inbox(priority);
create index if not exists ai_inbox_source_table_idx on ai_inbox(source_table);
create index if not exists ai_inbox_updated_at_idx on ai_inbox(updated_at desc);
create index if not exists prompt_templates_content_type_idx on prompt_templates(content_type);
create index if not exists prompt_templates_active_idx on prompt_templates(active);

insert into prompt_templates (id, name, content_type, system, template_text, output_format, active, notes)
values
(
  'prompt-template-planet-story',
  'Planet Story',
  'Planet Story',
  'Planets',
  'Write a cinematic sci-fi discovery story for this Project Genesis planet.

Use the following planet data:
Planet Name:
{{planet_name}}

Rarity:
{{planet_rarity}}

Class:
{{planet_class}}

Subclass:
{{planet_subclass}}

Biome:
{{biome}}

Atmosphere:
{{atmosphere}}

Resources:
{{resources}}

Traits:
{{traits}}

Hazards:
{{hazards}}

Ancient Civilization:
{{ancient_civilization}}

Anomalies:
{{anomalies}}

Tone:
Premium sci-fi strategy game, mysterious, cinematic, concise.',
  '1. One-sentence discovery summary
2. 120-word lore description
3. 3 short exploration hooks
4. Museum flavor text',
  true,
  'Default planet lore prompt.'
),
(
  'prompt-template-planet-image',
  'Planet Image Prompt',
  'Image Prompt',
  'Assets',
  'Create a high-resolution sci-fi planet asset on a clean black background.

Planet Type:
{{planet_class}} / {{planet_subclass}}

Visual Description:
{{image_prompt}}

Rarity:
{{planet_rarity}}

Constraints:
Fully visible spherical world viewed from orbit, centered, crisp circular edge, clean black background, no stars, no text, no ships, no protruding terrain, no glow, no aura, no bloom.',
  'Return one polished image-generation prompt ready to paste into an image model.',
  true,
  'No API call. Copy into external image generator.'
),
(
  'prompt-template-resource-description',
  'Resource Description',
  'Resource Description',
  'Resources',
  'Write a short resource description for Project Genesis.

Resource:
{{resource_name}}

Category:
{{category}}

Rarity:
{{rarity}}

Discovery Tier:
{{discovery_tier}}

Typical Planet Classes:
{{typical_planet_classes}}

Uses:
{{primary_uses}}',
  '1. Short UI description
2. Science/lore note
3. One gameplay use sentence',
  true,
  'For resource catalog copy.'
),
(
  'prompt-template-artifact-description',
  'Artifact Description',
  'Artifact Description',
  'Collectibles',
  'Write a collectible artifact description for Project Genesis.

Artifact Name:
{{artifact_name}}

Rarity:
{{rarity}}

Planet Class:
{{planet_class}}

Ancient Civilization:
{{ancient_civilization}}

Resource Influence:
{{resources}}',
  '1. Short collectible description
2. Museum label
3. Trade flavor text',
  true,
  'For collectibles and museum content.'
),
(
  'prompt-template-expedition-log',
  'Expedition Log',
  'Expedition Log',
  'Events',
  'Write an expedition log from explorers visiting a Project Genesis planet.

Planet:
{{planet_name}}

Class:
{{planet_class}}

Rarity:
{{planet_rarity}}

Hazards:
{{hazards}}

Discovery:
{{discovery_focus}}

Tone:
Cinematic, mysterious, not too long.',
  '1. Log title
2. 150-word expedition log
3. Outcome summary',
  true,
  'For exploration and event copy.'
),
(
  'prompt-template-research-flavor',
  'Research Flavor Text',
  'Research Flavor Text',
  'Research',
  'Write concise research flavor text for Project Genesis.

Research Node:
{{research_name}}

Era:
{{era}}

Purpose:
{{design_purpose}}

Gameplay Effect:
{{gameplay_effect}}

Related Systems:
{{related_systems}}',
  '1. One-line flavor text
2. Short research archive note
3. UI tooltip copy',
  true,
  'Saves back to research notes when approved.'
),
(
  'prompt-template-star-system-story',
  'Star System Story',
  'Star System Story',
  'Star Systems',
  'Write a short star system story for Project Genesis.

System:
{{system_name}}

Catalog:
{{catalog_designation}}

Rarity:
{{system_rarity}}

Star Count:
{{star_count}}

Planet Count:
{{planet_count}}

Danger Level:
{{danger_level}}',
  '1. One-sentence summary
2. 100-word system lore
3. 3 exploration hooks',
  true,
  'For Universe Explorer system lore.'
),
(
  'prompt-template-codex-task',
  'Codex Task',
  'Codex Task',
  'Development',
  'Create a clear implementation task for Codex inside Project Genesis Studio.

Task:
{{title}}

Target System:
{{system}}

Source Table:
{{source_table}}

Related Record:
{{related_name}}

Context:
{{notes}}',
  'Return a precise development task with acceptance criteria and files likely involved.',
  true,
  'For development queue prompts.'
)
on conflict (id) do update set
  name = excluded.name,
  content_type = excluded.content_type,
  system = excluded.system,
  template_text = excluded.template_text,
  output_format = excluded.output_format,
  active = excluded.active,
  notes = excluded.notes,
  updated_at = now();

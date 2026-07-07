alter table research
  add column if not exists exploration_scope_unlocked text,
  add column if not exists travel_tier text,
  add column if not exists space_system_unlocked text,
  add column if not exists requires_previous_space_research boolean not null default false,
  add column if not exists unlock_summary text;

create index if not exists research_travel_tier_idx on research(travel_tier);
create index if not exists research_space_system_idx on research(space_system_unlocked);

insert into research_branches (id, name, purpose)
values (
  'branch-space',
  'Space',
  'Space Research governs humanity''s expansion beyond Earth. It begins with astronomy and orbital flight, expands to local star system exploration in the Modern Era, unlocks full home-system colonization in Future Core, then progresses into interstellar, galactic, intergalactic, and Genesis-level travel.'
)
on conflict (id) do update set
  name = excluded.name,
  purpose = excluded.purpose;

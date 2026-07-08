create table if not exists civilization_identity (
  id text primary key,
  civilization_name text not null,
  current_age text not null,
  civilization_title text not null,
  primary_alignment text not null,
  secondary_alignment text not null,
  emerging_alignment text not null,
  future_prediction text not null,
  population bigint not null default 0,
  total_discovery_points bigint not null default 0,
  total_colonized_worlds integer not null default 0,
  total_wonders_built integer not null default 0,
  total_milestones_unlocked integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  notes text not null default ''
);

create table if not exists civilization_alignment_scores (
  id text primary key,
  civilization_id text not null references civilization_identity(id) on delete cascade,
  alignment_name text not null,
  score integer not null check (score >= 0 and score <= 100),
  bonus_summary text not null default '',
  last_changed_by text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists civilization_alignment_history (
  id text primary key,
  civilization_id text not null references civilization_identity(id) on delete cascade,
  alignment_name text not null,
  previous_score integer not null default 0,
  new_score integer not null default 0,
  change_amount integer not null default 0,
  source_type text not null default '',
  source_id text not null default '',
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists civilization_milestones (
  id text primary key,
  title text not null,
  age text not null,
  description text not null default '',
  unlocked_by text not null default '',
  icon text not null default '',
  importance text not null default 'Medium',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists civilization_unlocked_milestones (
  id text primary key,
  civilization_id text not null references civilization_identity(id) on delete cascade,
  milestone_id text not null references civilization_milestones(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  source_type text not null default '',
  source_id text not null default '',
  notes text not null default ''
);

create table if not exists civilization_titles (
  id text primary key,
  title text not null,
  description text not null default '',
  required_age text not null default '',
  primary_alignment text not null default '',
  secondary_alignment text not null default '',
  requirement_summary text not null default '',
  bonus_summary text not null default '',
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists civilization_bonuses (
  id text primary key,
  civilization_id text not null references civilization_identity(id) on delete cascade,
  bonus_name text not null,
  bonus_type text not null,
  bonus_value text not null default '',
  source_type text not null default '',
  source_id text not null default '',
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into civilization_identity (
  id,
  civilization_name,
  current_age,
  civilization_title,
  primary_alignment,
  secondary_alignment,
  emerging_alignment,
  future_prediction,
  population,
  total_discovery_points,
  total_colonized_worlds,
  total_wonders_built,
  total_milestones_unlocked,
  notes
) values (
  'civilization-humanity',
  'Humanity',
  'Survival Age',
  'The Survivors',
  'Technology',
  'Industry',
  'Exploration',
  'High Tech Singularity',
  125,
  150,
  1,
  0,
  3,
  'Persistent civilization identity layer for the incremental loop. No government, diplomacy, or military simulation in this module.'
) on conflict (id) do update set
  civilization_name = excluded.civilization_name,
  current_age = excluded.current_age,
  civilization_title = excluded.civilization_title,
  primary_alignment = excluded.primary_alignment,
  secondary_alignment = excluded.secondary_alignment,
  emerging_alignment = excluded.emerging_alignment,
  future_prediction = excluded.future_prediction,
  updated_at = now(),
  notes = excluded.notes;

insert into civilization_alignment_scores (id, civilization_id, alignment_name, score, bonus_summary, last_changed_by) values
  ('alignment-eco', 'civilization-humanity', 'Eco', 22, 'Improves sustainability, energy efficiency, lower pollution/event risk, and terraforming outcomes.', 'Seed Baseline'),
  ('alignment-technology', 'civilization-humanity', 'Technology', 46, 'Improves research generation, automation efficiency, and advanced unlock speed.', 'Seed Baseline'),
  ('alignment-industry', 'civilization-humanity', 'Industry', 38, 'Improves building production, construction speed, and resource extraction.', 'Seed Baseline'),
  ('alignment-cyber', 'civilization-humanity', 'Cyber', 18, 'Improves auto-click power, AI systems, simulations, and advanced computing unlocks.', 'Seed Baseline'),
  ('alignment-nature', 'civilization-humanity', 'Nature', 24, 'Improves population growth, food systems, living world compatibility, and ecological stability.', 'Seed Baseline'),
  ('alignment-exploration', 'civilization-humanity', 'Exploration', 31, 'Improves discovery points, probe speed, survey range, and rare planet detection.', 'Seed Baseline'),
  ('alignment-science', 'civilization-humanity', 'Science', 34, 'Improves research output, breakthrough chance, and experiment rewards.', 'Seed Baseline'),
  ('alignment-harmony', 'civilization-humanity', 'Harmony', 16, 'Improves cross-alignment synergy, stability, and special endgame path eligibility.', 'Seed Baseline'),
  ('alignment-commerce', 'civilization-humanity', 'Commerce', 20, 'Improves coin generation, trade value, and resource selling efficiency.', 'Seed Baseline')
on conflict (id) do update set
  score = excluded.score,
  bonus_summary = excluded.bonus_summary,
  last_changed_by = excluded.last_changed_by,
  updated_at = now();

insert into civilization_milestones (id, title, age, description, unlocked_by, icon, importance, sort_order) values
  ('milestone-discovered-fire', 'Discovered Fire', 'Survival Age', 'Humanity learns to preserve heat, cook food, and create safety around the first camps.', 'Start', 'Flame', 'Critical', 1),
  ('milestone-built-first-shelter', 'Built First Shelter', 'Survival Age', 'Basic structures protect early population and begin the building loop.', 'Start', 'Home', 'Critical', 2),
  ('milestone-founded-first-camp', 'Founded First Camp', 'Survival Age', 'Small groups organize labor, storage, and shared survival tasks.', 'Start', 'Tent', 'High', 3),
  ('milestone-unlocked-agriculture', 'Unlocked Agriculture', 'Village Age', 'Food production creates permanent settlement pressure and population stability.', 'Agriculture Research', 'Wheat', 'Critical', 4),
  ('milestone-founded-first-village', 'Founded First Village', 'Village Age', 'Permanent settlement becomes the first visible civilization identity marker.', 'Agriculture + Shelter', 'Houses', 'Critical', 5),
  ('milestone-established-first-trade-route', 'Established First Trade Route', 'Town Age', 'Local exchange begins Commerce alignment growth.', 'Commerce Research', 'Route', 'High', 6),
  ('milestone-built-first-city', 'Built First City', 'Town Age', 'Labor, districts, and civic systems support large-scale growth.', 'District Unlocks', 'City', 'Critical', 7),
  ('milestone-invented-writing', 'Invented Writing', 'Town Age', 'Knowledge storage unlocks deeper research and civilization memory.', 'Civilization Research', 'Scroll', 'High', 8),
  ('milestone-entered-industrial-age', 'Entered Industrial Age', 'Industrial Age', 'Factories and machines reshape output, labor, and expansion speed.', 'Manufacturing Research', 'Factory', 'Critical', 9),
  ('milestone-unlocked-electricity', 'Unlocked Electricity', 'Industrial Age', 'Power grids enable scalable production and modern systems.', 'Energy Research', 'Zap', 'Critical', 10),
  ('milestone-launched-first-satellite', 'Launched First Satellite', 'Modern Age', 'Orbit becomes part of the main progression loop.', 'Space Research', 'Satellite', 'Critical', 11),
  ('milestone-reached-orbit', 'Reached Orbit', 'Modern Age', 'The home planet is no longer the only playable horizon.', 'Orbital Launch', 'Orbit', 'Critical', 12),
  ('milestone-landed-on-moon', 'Landed on the Moon', 'Modern Age', 'First off-world surface milestone.', 'Lunar Exploration', 'Moon', 'Critical', 13),
  ('milestone-colonized-mars', 'Colonized Mars', 'Future Age', 'The first major planetary colony reshapes identity and resource logistics.', 'Planetary Colonization', 'Mars', 'Critical', 14),
  ('milestone-built-first-orbital-habitat', 'Built First Orbital Habitat', 'Future Age', 'Permanent orbital living begins.', 'Orbital Habitat Research', 'Habitat', 'High', 15),
  ('milestone-harvested-first-gas-giant', 'Harvested First Gas Giant', 'Future Age', 'Gas giants become orbital fuel engines for expansion.', 'Gas Giant Harvesting', 'Cloud', 'High', 16),
  ('milestone-launched-first-colony-ship', 'Launched First Colony Ship', 'Interstellar Age', 'Humanity prepares to leave the home star system.', 'Colony Ship Research', 'Rocket', 'Critical', 17),
  ('milestone-discovered-first-interstellar-system', 'Discovered First Interstellar System', 'Interstellar Age', 'Probe networks reveal nearby systems.', 'Interstellar Navigation', 'Radar', 'Critical', 18),
  ('milestone-founded-first-interstellar-colony', 'Founded First Interstellar Colony', 'Interstellar Age', 'Civilization becomes multi-system.', 'Interstellar Colony', 'Flag', 'Critical', 19),
  ('milestone-mapped-first-galactic-sector', 'Mapped First Galactic Sector', 'Galactic Age', 'Sector-scale mapping opens galactic strategy.', 'Galaxy Mapping', 'Map', 'Critical', 20),
  ('milestone-built-first-megastructure', 'Built First Megastructure', 'Galactic Age', 'Massive construction projects define civilization scale.', 'Megastructure Research', 'Landmark', 'Critical', 21),
  ('milestone-discovered-first-genesis-world', 'Discovered First Genesis World', 'Genesis Age', 'Reality-scale worlds become reachable.', 'Genesis World Discovery', 'Sparkles', 'Critical', 22),
  ('milestone-opened-genesis-gate', 'Opened Genesis Gate', 'Genesis Age', 'Universal navigation begins the Harmony Ascendant path.', 'Genesis Gate', 'Gate', 'Critical', 23)
on conflict (id) do update set
  title = excluded.title,
  age = excluded.age,
  description = excluded.description,
  unlocked_by = excluded.unlocked_by,
  icon = excluded.icon,
  importance = excluded.importance,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into civilization_unlocked_milestones (id, civilization_id, milestone_id, source_type, source_id, notes) values
  ('unlocked-discovered-fire', 'civilization-humanity', 'milestone-discovered-fire', 'Start', 'milestone-discovered-fire', 'Initial survival loop unlocked.'),
  ('unlocked-built-first-shelter', 'civilization-humanity', 'milestone-built-first-shelter', 'Start', 'milestone-built-first-shelter', 'First building identity marker.'),
  ('unlocked-founded-first-camp', 'civilization-humanity', 'milestone-founded-first-camp', 'Start', 'milestone-founded-first-camp', 'Baseline group identity established.')
on conflict (id) do update set notes = excluded.notes;

insert into civilization_alignment_history (id, civilization_id, alignment_name, previous_score, new_score, change_amount, source_type, source_id, reason) values
  ('alignment-history-fire-technology', 'civilization-humanity', 'Technology', 35, 46, 11, 'Milestone', 'milestone-discovered-fire', 'Harnessing fire begins humanity technical identity.'),
  ('alignment-history-shelter-industry', 'civilization-humanity', 'Industry', 30, 38, 8, 'Milestone', 'milestone-built-first-shelter', 'Shelter construction introduces organized labor and material use.'),
  ('alignment-history-survey-exploration', 'civilization-humanity', 'Exploration', 24, 31, 7, 'System', 'system-sol', 'The Sol starting map creates the first exploration path.')
on conflict (id) do update set
  previous_score = excluded.previous_score,
  new_score = excluded.new_score,
  change_amount = excluded.change_amount,
  reason = excluded.reason;

insert into civilization_titles (id, title, description, required_age, primary_alignment, secondary_alignment, requirement_summary, bonus_summary, priority) values
  ('civilization-title-the-survivors', 'The Survivors', 'Early title for Survival Age.', 'Survival Age', '', '', 'Default title in Survival Age.', 'Baseline survival stability.', 10),
  ('civilization-title-the-settlers', 'The Settlers', 'Village and Town growth identity.', 'Village Age', '', '', 'Default title for early settlement growth.', 'Improves early population and storage planning.', 20),
  ('civilization-title-the-builders', 'The Builders', 'High buildings and Industry identity.', 'Town Age', 'Industry', '', 'Industry is dominant and building completion passes threshold.', 'Construction and building production bonuses.', 40),
  ('civilization-title-the-engineers', 'The Engineers', 'Technology plus Industry identity.', 'Industrial Age', 'Technology', 'Industry', 'Technology and Industry are top alignments.', 'Engineering, construction, and automation synergy.', 50),
  ('civilization-title-the-scientists', 'The Scientists', 'Science plus Technology identity.', 'Modern Age', 'Science', 'Technology', 'Science and Technology are top alignments.', 'Research output and breakthrough chance.', 55),
  ('civilization-title-the-explorers', 'The Explorers', 'Discovery-focused civilization identity.', 'Modern Age', 'Exploration', '', 'Exploration is dominant and discovered systems pass threshold.', 'Survey speed and discovery point bonuses.', 60),
  ('civilization-title-the-industrialists', 'The Industrialists', 'Manufacturing and production identity.', 'Industrial Age', 'Industry', '', 'Industry and manufacturing systems dominate.', 'Manufacturing and extraction bonuses.', 65),
  ('civilization-title-the-harmonists', 'The Harmonists', 'Balanced high-Harmony identity.', 'Future Age', 'Harmony', '', 'Harmony is dominant and alignments remain balanced.', 'Stability and cross-alignment synergy.', 70),
  ('civilization-title-the-preservationists', 'The Preservationists', 'Nature plus Eco identity.', 'Town Age', 'Nature', 'Eco', 'Nature and Eco are top alignments.', 'Sustainability, food, and terraforming bonuses.', 45),
  ('civilization-title-the-synth-architects', 'The Synth Architects', 'Cyber plus Technology identity.', 'Future Age', 'Cyber', 'Technology', 'Cyber and Technology are top alignments.', 'AI, automation, and simulation bonuses.', 75),
  ('civilization-title-the-traders', 'The Traders', 'Commerce-dominant identity.', 'Town Age', 'Commerce', '', 'Commerce is dominant and trade systems exist.', 'Trade value and coin generation bonuses.', 50),
  ('civilization-title-the-starbound', 'The Starbound', 'Interstellar Exploration identity.', 'Interstellar Age', 'Exploration', '', 'Interstellar Age and Exploration is dominant.', 'Probe, colony ship, and survey range bonuses.', 90),
  ('civilization-title-the-galactic-founders', 'The Galactic Founders', 'Galactic multi-system identity.', 'Galactic Age', 'Exploration', 'Industry', 'Galactic Age and colonized systems pass threshold.', 'Galaxy infrastructure and sector expansion bonuses.', 95),
  ('civilization-title-the-ascendants', 'The Ascendants', 'Genesis Age Harmony/Science/Exploration identity.', 'Genesis Age', 'Harmony', 'Science', 'Genesis Age reached.', 'Genesis Gate and endgame path bonuses.', 100)
on conflict (id) do update set
  description = excluded.description,
  required_age = excluded.required_age,
  primary_alignment = excluded.primary_alignment,
  secondary_alignment = excluded.secondary_alignment,
  requirement_summary = excluded.requirement_summary,
  bonus_summary = excluded.bonus_summary,
  priority = excluded.priority,
  updated_at = now();

insert into civilization_bonuses (id, civilization_id, bonus_name, bonus_type, bonus_value, source_type, source_id, description, active) values
  ('civilization-bonus-survival-stability', 'civilization-humanity', 'Survival Stability', 'Population', '+5% early population stability', 'Title', 'civilization-title-the-survivors', 'The Survivors title reduces early volatility and supports the first growth loop.', true),
  ('civilization-bonus-fire-knowledge', 'civilization-humanity', 'Fire Knowledge', 'Technology', '+3% early research generation', 'Milestone', 'milestone-discovered-fire', 'Fire creates repeatable knowledge and early technical confidence.', true),
  ('civilization-bonus-shelter-labor', 'civilization-humanity', 'Shelter Labor', 'Industry', '+3% early construction speed', 'Milestone', 'milestone-built-first-shelter', 'Basic shelter teaches material handling and work coordination.', true)
on conflict (id) do update set
  bonus_value = excluded.bonus_value,
  description = excluded.description,
  active = excluded.active,
  updated_at = now();

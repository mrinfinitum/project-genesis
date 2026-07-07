create table if not exists public.planet_class_rarity_profiles (
  id text primary key,
  planet_class text not null unique,
  common_weight numeric default 0,
  uncommon_weight numeric default 0,
  rare_weight numeric default 0,
  epic_weight numeric default 0,
  legendary_weight numeric default 0,
  mythic_weight numeric default 0,
  relic_weight numeric default 0,
  cosmic_weight numeric default 0,
  genesis_weight numeric default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.system_rarity_modifiers (
  id text primary key,
  system_rarity text not null unique,
  rarity_shift numeric default 0,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.planet_class_rarity_profiles (
  id,
  planet_class,
  common_weight,
  uncommon_weight,
  rare_weight,
  epic_weight,
  legendary_weight,
  mythic_weight,
  relic_weight,
  cosmic_weight,
  genesis_weight,
  notes
)
values
  ('planet-class-rarity-terrestrial', 'Terrestrial', 55, 25, 12, 5, 2, 0.8, 0.18, 0.019, 0.001, 'Foundational rocky worlds favor Common and Uncommon, with rare high-value outliers.'),
  ('planet-class-rarity-ocean', 'Ocean', 45, 25, 17, 8, 3, 1.3, 0.55, 0.14, 0.01, 'Ocean worlds skew slightly richer than terrestrial worlds because water and biosphere hooks increase value.'),
  ('planet-class-rarity-desert', 'Desert', 50, 25, 15, 6, 2.5, 1, 0.35, 0.13, 0.02, 'Desert worlds remain common but can roll memorable rare mineral or ancient variants.'),
  ('planet-class-rarity-ice', 'Ice', 42, 25, 18, 9, 3.5, 1.5, 0.75, 0.23, 0.02, 'Ice worlds have stronger rare/exotic odds because cryo resources and hidden oceans matter.'),
  ('planet-class-rarity-lava', 'Lava', 30, 25, 22, 12, 6, 3, 1.3, 0.65, 0.05, 'Lava worlds are dangerous and resource-rich, so their curve starts higher.'),
  ('planet-class-rarity-gas-giant', 'Gas Giant', 45, 25, 16, 8, 4, 1.4, 0.45, 0.14, 0.01, 'Gas giants are frequent orbital resource worlds with occasional high-value fuel systems.'),
  ('planet-class-rarity-crystal', 'Crystal', 15, 25, 30, 15, 10, 3, 1.5, 0.45, 0.05, 'Crystal worlds naturally favor Rare and Epic discoveries.'),
  ('planet-class-rarity-toxic', 'Toxic', 28, 24, 22, 14, 7, 3, 1.4, 0.55, 0.05, 'Toxic worlds skew toward higher-risk, higher-reward discoveries.'),
  ('planet-class-rarity-artificial', 'Artificial', 8, 15, 28, 22, 15, 7, 3.5, 1.3, 0.2, 'Artificial worlds strongly favor rare technological and legendary outcomes.'),
  ('planet-class-rarity-living', 'Living', 5, 12, 23, 25, 18, 10, 5, 1.7, 0.3, 'Living planets are inherently unusual and favor Epic through Mythic outcomes.'),
  ('planet-class-rarity-bio', 'Bio', 6, 14, 24, 24, 17, 9, 4, 1.7, 0.3, 'Bio worlds behave like living worlds with slightly broader mid-tier odds.'),
  ('planet-class-rarity-ancient', 'Ancient', 4, 8, 18, 22, 24, 12, 9, 2.5, 0.5, 'Ancient worlds are biased toward Legendary and Relic discoveries.'),
  ('planet-class-rarity-energy', 'Energy', 3, 7, 17, 22, 25, 14, 8, 3.2, 0.8, 'Energy worlds skew strongly high because they drive late-game systems.'),
  ('planet-class-rarity-primordial', 'Primordial', 2, 5, 13, 20, 24, 18, 11, 5.5, 1.5, 'Primordial worlds are rare universe-history discoveries with strong high-tier odds.'),
  ('planet-class-rarity-void', 'Void', 2, 5, 10, 20, 25, 20, 12, 5, 1, 'Void worlds heavily favor Mythic, Relic, and Cosmic discoveries while still allowing common anomalies.')
on conflict (planet_class) do update set
  common_weight = excluded.common_weight,
  uncommon_weight = excluded.uncommon_weight,
  rare_weight = excluded.rare_weight,
  epic_weight = excluded.epic_weight,
  legendary_weight = excluded.legendary_weight,
  mythic_weight = excluded.mythic_weight,
  relic_weight = excluded.relic_weight,
  cosmic_weight = excluded.cosmic_weight,
  genesis_weight = excluded.genesis_weight,
  notes = excluded.notes,
  updated_at = now();

insert into public.system_rarity_modifiers (
  id,
  system_rarity,
  rarity_shift,
  description
)
values
  ('system-rarity-modifier-common', 'Common', 0, 'No upward rarity pressure.'),
  ('system-rarity-modifier-uncommon', 'Uncommon', 0.05, 'Small boost to higher planet rarity tiers.'),
  ('system-rarity-modifier-rare', 'Rare', 0.10, 'Moderate boost to higher planet rarity tiers.'),
  ('system-rarity-modifier-epic', 'Epic', 0.18, 'Noticeable boost to Epic and above planet outcomes.'),
  ('system-rarity-modifier-legendary', 'Legendary', 0.30, 'Strong boost to Legendary and above planet outcomes.'),
  ('system-rarity-modifier-mythic', 'Mythic', 0.45, 'Very strong boost to Mythic, Relic, Cosmic, and Genesis odds.'),
  ('system-rarity-modifier-relic', 'Relic', 0.60, 'Major high-tier planet rarity pressure.'),
  ('system-rarity-modifier-genesis', 'Genesis', 0.85, 'Extreme high-tier pressure while preserving surprise rolls.')
on conflict (system_rarity) do update set
  rarity_shift = excluded.rarity_shift,
  description = excluded.description,
  updated_at = now();

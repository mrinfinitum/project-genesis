create table if not exists public.canonical_prompt_templates (
  id text primary key,
  name text not null,
  master_prompt text not null,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.canonical_planets (
  id text primary key,
  display_name text not null,
  body_type text not null,
  planet_order integer not null,
  master_prompt text default '',
  planet_description text not null,
  image_prompt text default '',
  surface_prompt text default '',
  landscape_prompt text default '',
  art_style text default '',
  scientific_reference text default '',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists canonical_planets_planet_order_idx
  on public.canonical_planets(planet_order);

insert into public.canonical_prompt_templates (id, name, master_prompt, notes)
values (
  'canonical-sol-master',
  'Canonical Sol Master Prompt',
  $prompt$Create one high-resolution canonical Solar System body asset on a clean black background.

The body must be fully visible, centered in the image, scientifically grounded, and immediately recognizable as the real Solar System object being rendered.

Use accurate NASA-inspired coloration, physically believable lighting, realistic surface or atmospheric detail, and premium space exploration game asset quality.

Create this canonical Solar System body:
{{planet_description}}

Composition: square 1:1 image, one centered body only, generous black negative space around it, clean black background, no stars, no UI, no text, no labels, no watermark.

Lighting: single soft key light from upper left, realistic spherical shading, visible day side and subtle night side when appropriate, clean shadow falloff.

Accuracy: prioritize real-world scientific identity over fantasy variation. Keep recognizable planetary colors, cloud structures, crater patterns, ice patterns, rings, or solar surface behavior where applicable.

Avoid: stylized fantasy redesign, cartoon, anime, painterly brushwork, fictional terrain features, invented moons, extra planets, spacecraft, satellites, cities protruding from the surface, text, UI, watermark, signature, logo, cropped edges, distorted sphere, oval planet, excessive glow, excessive bloom, lens flare, nebula background, starfield, messy background.$prompt$,
  'Shared master prompt for handcrafted real Solar System renders.'
)
on conflict (id) do update set
  name = excluded.name,
  master_prompt = excluded.master_prompt,
  notes = excluded.notes,
  updated_at = now();

insert into public.canonical_planets
  (id, display_name, body_type, planet_order, planet_description, image_prompt, art_style, scientific_reference, notes)
values
  ('sol', 'Sol', 'Star', 0, 'Render Sol using scientifically accurate NASA coloration. Show a realistic yellow-white G-type main-sequence star with subtle solar granulation, realistic prominences, and physically believable solar activity.', '', 'NASA accurate star render', 'G-type main-sequence star', 'Canonical central star of the Sol system.'),
  ('mercury', 'Mercury', 'Terrestrial Planet', 1, 'Render Mercury using scientifically accurate NASA coloration. Show a heavily cratered grey rocky surface with ancient lava plains, large impact basins, steep scarps, subtle mineral variation, and almost no atmosphere.', '', 'NASA accurate rocky planet render', 'MESSENGER imagery and Mercury geological maps', 'Inner rocky planet with no meaningful atmosphere.'),
  ('venus', 'Venus', 'Terrestrial Planet', 2, 'Render Venus using scientifically accurate NASA coloration. Show the dense yellow-orange sulfuric cloud layer completely surrounding the planet with realistic atmospheric texture and no visible surface.', '', 'NASA accurate atmospheric planet render', 'Venus cloud deck and sulfuric acid atmosphere', 'Opaque atmosphere; surface should not be visible.'),
  ('earth', 'Earth', 'Terrestrial Planet', 3, 'Render Earth using scientifically accurate NASA coloration. Show deep blue oceans, green and brown continents, bright white cloud systems, polar ice caps, and a natural blue atmosphere.', '', 'NASA blue marble render', 'NASA Earth observation imagery', 'Canonical human homeworld.'),
  ('moon', 'Moon', 'Moon', 4, 'Render Earth''s Moon using scientifically accurate NASA coloration. Show grey highlands, dark basaltic maria, heavy impact craters, crater rays, and fine regolith with no atmosphere.', '', 'NASA accurate lunar render', 'Lunar Reconnaissance Orbiter imagery', 'Earth''s natural satellite.'),
  ('mars', 'Mars', 'Terrestrial Planet', 5, 'Render Mars using scientifically accurate NASA coloration. Show a red iron-rich surface with Olympus Mons, Valles Marineris, polar ice caps, dusty plains, and a thin atmosphere.', '', 'NASA accurate Mars render', 'Mars Reconnaissance Orbiter imagery', 'Primary early interplanetary expansion target.'),
  ('jupiter', 'Jupiter', 'Gas Giant', 6, 'Render Jupiter using scientifically accurate NASA coloration. Show cream, tan, orange, and brown atmospheric bands with the Great Red Spot and realistic atmospheric turbulence.', '', 'NASA accurate gas giant render', 'Juno and Voyager Jupiter imagery', 'Canonical gas giant with Great Red Spot.'),
  ('europa', 'Europa', 'Moon', 7, 'Render Europa using scientifically accurate NASA coloration. Show a bright icy shell with blue fracture lines, chaotic terrain, smooth ice plains, and subtle mineral staining.', '', 'NASA accurate icy moon render', 'Galileo Europa imagery', 'Jovian icy moon with subsurface ocean potential.'),
  ('ganymede', 'Ganymede', 'Moon', 8, 'Render Ganymede using scientifically accurate NASA coloration. Show bright and dark terrain, grooved ice regions, ancient craters, rocky patches, and subtle ice coloration.', '', 'NASA accurate icy moon render', 'Galileo Ganymede imagery', 'Largest moon in the Solar System.'),
  ('saturn', 'Saturn', 'Gas Giant', 9, 'Render Saturn using scientifically accurate NASA coloration. Show pale cream and golden atmospheric bands with the complete realistic ring system.', '', 'NASA accurate ringed gas giant render', 'Cassini Saturn imagery', 'Ring system is part of canonical identity and should be visible.'),
  ('titan', 'Titan', 'Moon', 10, 'Render Titan using scientifically accurate NASA coloration. Show the dense orange nitrogen atmosphere completely surrounding the moon with realistic atmospheric haze.', '', 'NASA accurate atmospheric moon render', 'Cassini-Huygens Titan imagery', 'Saturn moon with dense atmosphere.'),
  ('enceladus', 'Enceladus', 'Moon', 11, 'Render Enceladus using scientifically accurate NASA coloration. Show a brilliant white icy surface with blue fractures, cryovolcanic fissures, and exceptional reflectivity.', '', 'NASA accurate icy moon render', 'Cassini Enceladus imagery', 'High-albedo icy moon with cryovolcanic features.'),
  ('uranus', 'Uranus', 'Ice Giant', 12, 'Render Uranus using scientifically accurate NASA coloration. Show a smooth pale blue-green atmosphere with subtle methane haze and minimal cloud structure.', '', 'NASA accurate ice giant render', 'Voyager Uranus imagery', 'Smooth methane-tinted ice giant.'),
  ('neptune', 'Neptune', 'Ice Giant', 13, 'Render Neptune using scientifically accurate NASA coloration. Show a deep sapphire-blue atmosphere with bright methane clouds and realistic storm systems.', '', 'NASA accurate ice giant render', 'Voyager Neptune imagery', 'Deep blue ice giant with storm activity.'),
  ('pluto', 'Pluto', 'Dwarf Planet', 14, 'Render Pluto using scientifically accurate NASA coloration. Show Tombaugh Regio, nitrogen ice plains, reddish tholin deposits, rugged icy mountains, and subtle atmospheric haze.', '', 'NASA accurate dwarf planet render', 'New Horizons Pluto imagery', 'Canonical outer dwarf planet.')
on conflict (id) do update set
  display_name = excluded.display_name,
  body_type = excluded.body_type,
  planet_order = excluded.planet_order,
  planet_description = excluded.planet_description,
  image_prompt = excluded.image_prompt,
  art_style = excluded.art_style,
  scientific_reference = excluded.scientific_reference,
  notes = excluded.notes,
  updated_at = now();

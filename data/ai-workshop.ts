import type { PromptTemplate } from "@/types/schema";

const createdAt = "2026-07-06T00:00:00.000Z";

export const aiPromptTemplates: PromptTemplate[] = [
  {
    id: "prompt-template-planet-story",
    name: "Planet Story",
    content_type: "Planet Story",
    system: "Planets",
    active: true,
    template_text: `Write a cinematic sci-fi discovery story for this Project Genesis planet.

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
Premium sci-fi strategy game, mysterious, cinematic, concise.`,
    output_format: "1. One-sentence discovery summary\n2. 120-word lore description\n3. 3 short exploration hooks\n4. Museum flavor text",
    created_at: createdAt,
    updated_at: createdAt,
    notes: "Default planet lore prompt."
  },
  {
    id: "prompt-template-planet-image",
    name: "Planet Image Prompt",
    content_type: "Image Prompt",
    system: "Assets",
    active: true,
    template_text: `Create a high-resolution sci-fi planet asset on a clean black background.

Planet Type:
{{planet_class}} / {{planet_subclass}}

Visual Description:
{{image_prompt}}

Rarity:
{{planet_rarity}}

Constraints:
Fully visible spherical world viewed from orbit, centered, crisp circular edge, clean black background, no stars, no text, no ships, no protruding terrain, no glow, no aura, no bloom.`,
    output_format: "Return one polished image-generation prompt ready to paste into an image model.",
    created_at: createdAt,
    updated_at: createdAt,
    notes: "No API call. Copy into external image generator."
  },
  {
    id: "prompt-template-resource-description",
    name: "Resource Description",
    content_type: "Resource Description",
    system: "Resources",
    active: true,
    template_text: `Write a short resource description for Project Genesis.

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
{{primary_uses}}`,
    output_format: "1. Short UI description\n2. Science/lore note\n3. One gameplay use sentence",
    created_at: createdAt,
    updated_at: createdAt,
    notes: "For resource catalog copy."
  },
  {
    id: "prompt-template-artifact-description",
    name: "Artifact Description",
    content_type: "Artifact Description",
    system: "Collectibles",
    active: true,
    template_text: `Write a collectible artifact description for Project Genesis.

Artifact Name:
{{artifact_name}}

Rarity:
{{rarity}}

Planet Class:
{{planet_class}}

Ancient Civilization:
{{ancient_civilization}}

Resource Influence:
{{resources}}`,
    output_format: "1. Short collectible description\n2. Museum label\n3. Trade flavor text",
    created_at: createdAt,
    updated_at: createdAt,
    notes: "For collectibles and museum content."
  },
  {
    id: "prompt-template-expedition-log",
    name: "Expedition Log",
    content_type: "Expedition Log",
    system: "Events",
    active: true,
    template_text: `Write an expedition log from explorers visiting a Project Genesis planet.

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
Cinematic, mysterious, not too long.`,
    output_format: "1. Log title\n2. 150-word expedition log\n3. Outcome summary",
    created_at: createdAt,
    updated_at: createdAt,
    notes: "For exploration and event copy."
  },
  {
    id: "prompt-template-research-flavor",
    name: "Research Flavor Text",
    content_type: "Research Flavor Text",
    system: "Research",
    active: true,
    template_text: `Write concise research flavor text for Project Genesis.

Research Node:
{{research_name}}

Era:
{{era}}

Purpose:
{{design_purpose}}

Gameplay Effect:
{{gameplay_effect}}

Related Systems:
{{related_systems}}`,
    output_format: "1. One-line flavor text\n2. Short research archive note\n3. UI tooltip copy",
    created_at: createdAt,
    updated_at: createdAt,
    notes: "Saves back to research notes when approved."
  },
  {
    id: "prompt-template-star-system-story",
    name: "Star System Story",
    content_type: "Star System Story",
    system: "Star Systems",
    active: true,
    template_text: `Write a short star system story for Project Genesis.

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
{{danger_level}}`,
    output_format: "1. One-sentence summary\n2. 100-word system lore\n3. 3 exploration hooks",
    created_at: createdAt,
    updated_at: createdAt,
    notes: "For Universe Explorer system lore."
  },
  {
    id: "prompt-template-codex-task",
    name: "Codex Task",
    content_type: "Codex Task",
    system: "Development",
    active: true,
    template_text: `Create a clear implementation task for Codex inside Project Genesis Studio.

Task:
{{title}}

Target System:
{{system}}

Source Table:
{{source_table}}

Related Record:
{{related_name}}

Context:
{{notes}}`,
    output_format: "Return a precise development task with acceptance criteria and files likely involved.",
    created_at: createdAt,
    updated_at: createdAt,
    notes: "For development queue prompts."
  }
];

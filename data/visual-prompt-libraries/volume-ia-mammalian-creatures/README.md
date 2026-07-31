# NOVERIS Visual Prompt Library Volume IA Mammalian Creatures

This canonical Visual Production Engine package contains 1369 production prompt records for Nano Banana 2. It does not generate images or gameplay data.

## Use

1. Select a record by canonical subcategory and production output type.
2. Substitute only the variables defined in `prompt_variables.json` from canonical Studio data.
3. Copy the compiled prompt and its paired negative prompt into Nano Banana 2.
4. Save the resulting editable PSD/PSB in `source-masters/life/creatures`.
5. Let Studio create reviewed PNG/WebP derivatives; clients consume published derivatives, never PSD masters.

## Prompt guarantees

- Nano Banana 2 is the only declared image model.
- Isolated production studies use pure black backgrounds; only ecological composition outputs request environments.
- Camera, lighting, negative prompts, and supported variables are explicitly declared.
- Records preserve canonical identity through placeholders rather than inventing record data.

## Versioning

Each prompt is versioned independently through its `version` field. Recompile when a canonical source field changes; do not silently change a previously approved source-master record.

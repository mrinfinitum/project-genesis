# Generator Audit

| Generator-related module | Category | Path | Recommendation |
| --- | --- | --- | --- |
| creature-generator-workspace | generator | components/creature-generator-workspace.tsx | Retain pending contract review |
| environment-layer-generator | generator | components/environment-layer-generator.tsx | Review for flat-background migration |
| life-generator-workspace | generator | components/life-generator-workspace.tsx | Retain pending contract review |
| plant-life-generator-workspace | generator | components/plant-life-generator-workspace.tsx | Retain pending contract review |
| universe-generator-workflows | generator | components/universe-generator-workflows.tsx | Retain pending contract review |

## Generator workflow evidence

### Planet workflow

`Planet Generator → Planet Type → Biome → Weather → Resources → Flora/Fauna → Ecosystem → Planet Detail → Runtime Export` is the intended canonical workflow. Static modules show Planet, resource, life, and export systems, but no end-to-end transaction was executed in this audit.

### Visual production workflow

`Canonical Record → Prompt Compiler → Prompt Pack → Generated Asset → Review → Approved Asset → Source Master → Export Manifest → Runtime Asset Reference` is represented by visual-prompt libraries, asset production JSON, source masters, and export routes.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getExperienceDesignState, experienceReviewWorkflow, type ExperienceDesignKind } from "@/lib/experience-design";
import { searchStudio } from "@/lib/studio/global-search";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function exists(relativePath: string) {
  return existsSync(path.join(process.cwd(), relativePath));
}

function assertNoExperienceRuntimeLeak(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/"experienceDesign"\s*:/.test(text), `${label} leaked experienceDesign root data.`);
  assert(!/"inspirationBoards"\s*:/.test(text), `${label} leaked Inspiration Board library data.`);
  assert(!/"designTokens"\s*:/.test(text), `${label} leaked Design Token system data.`);
  assert(!/"materials"\s*:/.test(text), `${label} leaked Material Library data.`);
  assert(!/"motions"\s*:/.test(text), `${label} leaked Motion System definitions.`);
  assert(!/"cameraLanguage"\s*:/.test(text), `${label} leaked Motion System camera language.`);
  assert(!/"componentLibrary"\s*:/.test(text), `${label} leaked Component Library data.`);
  assert(!/"interactionPatterns"\s*:/.test(text), `${label} leaked Interaction Pattern Library data.`);
  assert(!/"screenLibrary"\s*:/.test(text), `${label} leaked Screen Library data.`);
  assert(!/"experience_bible"\s*:/.test(text), `${label} leaked Experience Bible model data.`);
  assert(!/"mood_board"\s*:/.test(text), `${label} leaked Mood Board model data.`);
  assert(!text.includes("Inspiration Board Library"), `${label} leaked DV-04 Inspiration Board data.`);
  assert(!text.includes("DS-02"), `${label} leaked DS-02 Design Token data.`);
  assert(!text.includes("Canonical Design Tokens"), `${label} leaked Canonical Design Token data.`);
  assert(!text.includes("DS-03"), `${label} leaked DS-03 Material Library data.`);
  assert(!text.includes("Canonical Material Library"), `${label} leaked Canonical Material Library data.`);
  assert(!text.includes("DS-04"), `${label} leaked DS-04 Motion System data.`);
  assert(!text.includes("Canonical Motion System"), `${label} leaked Canonical Motion System data.`);
  assert(!text.includes("DS-05"), `${label} leaked DS-05 Component Library data.`);
  assert(!text.includes("Canonical Component Library"), `${label} leaked Canonical Component Library data.`);
  assert(!text.includes("DS-05A"), `${label} leaked DS-05A Interaction Pattern Library data.`);
  assert(!text.includes("Canonical Interaction Pattern Library"), `${label} leaked Canonical Interaction Pattern Library data.`);
  assert(!text.includes("DS-06"), `${label} leaked DS-06 Screen Library data.`);
  assert(!text.includes("Canonical Screen Library"), `${label} leaked Canonical Screen Library data.`);
  assert(!/"screen_definition"\s*:/.test(text), `${label} leaked Screen Definition model data.`);
}

function assertBaseRecordFields(record: ReturnType<typeof getExperienceDesignState>["records"][number]) {
  for (const field of ["id", "kind", "name", "description", "status", "created", "modified", "version", "author", "tags", "notes", "attachments", "relationships", "approvalStatus", "history"] as const) {
    assert(record[field] !== undefined, `Experience record ${record.id} missing base field ${field}.`);
  }
  assert(experienceReviewWorkflow.includes(record.status), `Experience record ${record.id} has invalid status ${record.status}.`);
  assert(experienceReviewWorkflow.includes(record.approvalStatus), `Experience record ${record.id} has invalid approval status ${record.approvalStatus}.`);
  assert(record.history.length > 0, `Experience record ${record.id} must include version history.`);
}

async function main() {
  const state = getExperienceDesignState();
  const requiredKinds: ExperienceDesignKind[] = [
    "experience_bible",
    "mood_board",
    "concept",
    "screen_definition",
    "design_token_collection",
    "material_definition",
    "motion_definition",
    "component_definition",
    "interaction_pattern",
    "theme",
    "brand_guideline",
    "experience_moment",
    "review"
  ];

  assert(state.frameworkId === "ED-01", "Experience Design framework ID must be ED-01.");
  assert(state.version === "1.0", "Experience Design version must be 1.0.");
  assert(state.creativeDirectionOwner === "Studio", "Studio must own Experience Design creative direction.");
  assert(state.runtimePublishing === "not_published", "ED-01 must not be published to runtime.");
  assert(state.implementationBoundary.some((rule) => rule.includes("not gameplay")), "Experience Design must reject gameplay ownership.");
  assert(state.implementationBoundary.some((rule) => rule.includes("not React implementation")), "Experience Design must reject React implementation ownership.");
  assert(state.implementationBoundary.some((rule) => rule.includes("not Three.js")), "Experience Design must reject Three.js ownership.");

  for (const kind of requiredKinds) {
    assert(state.contentModels.some((model) => model.kind === kind), `Missing Experience Design content model ${kind}.`);
    assert(state.records.some((record) => record.kind === kind), `Missing starter Experience Design record for ${kind}.`);
  }

  for (const model of state.contentModels) {
    for (const field of ["id", "name", "description", "status", "created", "modified", "version", "author", "tags", "notes", "attachments", "relationships", "approvalStatus", "history"]) {
      assert(model.requiredFields.includes(field), `Content model ${model.kind} missing required base field ${field}.`);
    }
    assert(model.route.startsWith("/experience-design"), `Content model ${model.kind} route must stay under /experience-design.`);
  }

  for (const record of state.records) {
    assertBaseRecordFields(record);
  }

  for (const status of ["Draft", "In Review", "Approved", "Deprecated", "Archived"]) {
    assert(state.reviewWorkflow.includes(status as never), `Review workflow missing ${status}.`);
  }

  for (const section of ["bible", "inspiration-boards", "concepts", "screens", "tokens", "materials", "motion", "components", "patterns", "themes", "brand", "accessibility", "journey", "reviews"]) {
    assert(state.sections.some((item) => item.id === section), `Experience Design section missing ${section}.`);
  }

  const tokenSection = state.sections.find((item) => item.id === "tokens");
  assert(tokenSection?.label === "Design Tokens", "Experience Design must expose Design Tokens workspace.");
  assert(tokenSection.route === "/experience-design/tokens", "Design Tokens route must be canonical.");
  assert(tokenSection.description.includes("DS-02"), "Design Tokens section must identify DS-02.");
  const tokenModel = state.contentModels.find((model) => model.kind === "design_token_collection");
  assert(tokenModel?.displayName === "Canonical Design Tokens", "Design token model must be presented as Canonical Design Tokens.");
  for (const required of ["tokenLibraries", "semanticPath", "purpose", "experienceBibleReferences", "visualDnaReferences", "relatedMaterials", "relatedComponents", "relatedScreens", "owner", "reviewStatus"]) {
    assert(tokenModel?.requiredFields.includes(required), `Design token content model missing ${required}.`);
  }
  for (const capability of ["color", "typography", "spacing", "radius", "elevation", "shadow", "blur", "opacity", "motion", "timing", "breakpoints", "z-layer", "icons", "grid", "stroke", "glow", "atmosphere", "glass", "background", "transition", "search", "relationships", "versioning"]) {
    assert(tokenModel?.supportedCapabilities.includes(capability), `Design token content model missing capability ${capability}.`);
  }

  assert(state.designTokens.id === "DS-02", "Design Token system ID must be DS-02.");
  assert(state.designTokens.title === "Canonical Design Tokens", "DS-02 title must be Canonical Design Tokens.");
  assert(state.designTokens.version === "0.1", "DS-02 must be version 0.1.");
  assert(state.designTokens.status === "Draft", "DS-02 must remain Draft.");
  assert(state.designTokens.workspaceRoute === "/experience-design/tokens", "DS-02 workspace route must be /experience-design/tokens.");
  assert(!state.designTokens.implementationValuesPublished, "DS-02 must not publish implementation values.");
  assert(state.designTokens.runtimePublication === "future_design_runtime_milestone", "DS-02 runtime publication must be deferred to a future Design Runtime milestone.");
  for (const consumer of ["Project Genesis Studio", "NOVERIS Game", "noveris.life", "Steam", "Marketing", "Future platforms"]) {
    assert(state.designTokens.consumers.includes(consumer), `DS-02 consumer list missing ${consumer}.`);
  }
  for (const boundary of ["not CSS variables", "not Tailwind classes", "not implementation code", "Do not publish token values", "Do not modify gameplay", "contentVersion"]) {
    assert(state.designTokens.boundaries.join(" ").includes(boundary), `DS-02 boundary missing ${boundary}.`);
  }
  for (const philosophy of ["Tokens represent meaning.", "Tokens describe purpose, not appearance."]) {
    assert(state.designTokens.philosophy.includes(philosophy), `DS-02 philosophy missing ${philosophy}.`);
  }
  for (const searchField of ["purpose", "emotion", "category", "relationships", "Experience Bible chapter", "Visual DNA section"]) {
    assert(state.designTokens.searchFields.includes(searchField), `DS-02 search fields missing ${searchField}.`);
  }
  const expectedTokenLibraries = [
    "Color Tokens",
    "Typography Tokens",
    "Spacing Tokens",
    "Radius Tokens",
    "Elevation Tokens",
    "Shadow Tokens",
    "Blur Tokens",
    "Opacity Tokens",
    "Motion Tokens",
    "Timing Tokens",
    "Breakpoint Tokens",
    "Z-Layer Tokens",
    "Icon Tokens",
    "Grid Tokens",
    "Stroke Tokens",
    "Glow Tokens",
    "Atmosphere Tokens",
    "Glass Tokens",
    "Background Tokens",
    "Transition Tokens"
  ];
  assert(state.designTokens.libraries.map((library) => library.name).join("|") === expectedTokenLibraries.join("|"), "DS-02 token libraries must match the canonical list.");
  assert(state.designTokens.libraries.length === 20, "DS-02 must expose 20 canonical token libraries.");
  assert(state.designTokens.tokens.length >= 90, "DS-02 must expose a meaningful starter semantic token inventory.");
  const tokenIds = new Set(state.designTokens.tokens.map((token) => token.id));
  assert(tokenIds.size === state.designTokens.tokens.length, "DS-02 token IDs must be unique.");
  for (const expectedToken of ["accent.civilization.gold", "accent.projection.cyan", "accent.discovery.violet", "surface.command.glass", "text.primary", "motion.fade.standard", "glass.command", "atmosphere.deep-space", "grid.workspace", "background.universe"]) {
    assert(tokenIds.has(expectedToken), `DS-02 missing canonical token ${expectedToken}.`);
  }
  for (const badToken of ["gold500", "blue100", "radius12", "blur24"]) {
    assert(!tokenIds.has(badToken), `DS-02 must not include implementation token ${badToken}.`);
  }
  for (const library of state.designTokens.libraries) {
    assert(library.status === "Draft", `DS-02 library ${library.id} must remain Draft.`);
    assert(library.version === "0.1", `DS-02 library ${library.id} must be version 0.1.`);
    assert(library.tokenIds.length > 0, `DS-02 library ${library.id} must contain tokens.`);
    for (const tokenId of library.tokenIds) assert(tokenIds.has(tokenId), `DS-02 library ${library.id} references missing token ${tokenId}.`);
  }
  for (const token of state.designTokens.tokens) {
    assert(token.id === token.semanticPath, `DS-02 token ${token.id} must use semanticPath as stable ID.`);
    assert(token.status === "Draft", `DS-02 token ${token.id} must remain Draft.`);
    assert(token.version === "0.1", `DS-02 token ${token.id} must be version 0.1.`);
    assert(token.owner === "Design Systems", `DS-02 token ${token.id} must be owned by Design Systems.`);
    assert(token.reviewStatus === token.status, `DS-02 token ${token.id} review status must match current draft state.`);
    assert(token.experienceBibleReferences.length > 0, `DS-02 token ${token.id} must link to Experience Bible guidance.`);
    assert(token.visualDnaReferences.length > 0, `DS-02 token ${token.id} must link to Visual DNA guidance.`);
    assert(token.history.length > 0, `DS-02 token ${token.id} must include history.`);
    assert(!/^#/.test(token.semanticPath), `DS-02 token ${token.id} must not be a hexadecimal value.`);
    assert(!/(^|\.)(gold|blue|cyan|violet|gray|slate|amber)[0-9]{2,4}$/i.test(token.semanticPath), `DS-02 token ${token.id} must not use palette-step naming.`);
    assert(!/[0-9]+(?:px|rem|em|vh|vw)/.test(token.semanticPath), `DS-02 token ${token.id} must not use implementation units.`);
  }
  const tokenRecord = state.records.find((record) => record.id === "design-token-framework");
  assert(tokenRecord?.name === "Canonical Design Tokens", "Design token starter record must be Canonical Design Tokens.");
  assert(tokenRecord.fields.canonicalSystem === "DS-02", "Design token starter record must point to DS-02.");
  assert(tokenRecord.fields.tokenValuesDefined === false, "Design token starter record must not define token values.");
  assert(tokenRecord.fields.implementationValuesPublished === false, "Design token starter record must not publish implementation values.");

  const materialSection = state.sections.find((item) => item.id === "materials");
  assert(materialSection?.label === "Material Library", "Experience Design must expose Material Library workspace.");
  assert(materialSection.route === "/experience-design/materials", "Material Library route must be canonical.");
  assert(materialSection.description.includes("DS-03"), "Material Library section must identify DS-03.");
  const materialModel = state.contentModels.find((model) => model.kind === "material_definition");
  assert(materialModel?.displayName === "Canonical Material Library", "Material model must be presented as Canonical Material Library.");
  for (const required of ["category", "purpose", "emotionalIntent", "visualDnaReferences", "experienceBibleReferences", "relatedTokens", "relatedComponents", "relatedScreens", "relatedInspirationBoards", "lightingNotes", "transparencyNotes", "reflectionNotes", "depthNotes", "motionNotes", "accessibilityNotes", "futureRuntimeMapping", "owner", "reviewStatus"]) {
    assert(materialModel?.requiredFields.includes(required), `Material content model missing ${required}.`);
  }
  for (const capability of ["glass", "projection", "energy", "atmosphere", "planetary", "architecture", "natural", "industrial", "ancient", "organic", "liquid", "surface", "structural", "lighting", "special", "preview metadata", "relationships", "search", "versioning"]) {
    assert(materialModel?.supportedCapabilities.includes(capability), `Material content model missing capability ${capability}.`);
  }

  assert(state.materials.id === "DS-03", "Material Library ID must be DS-03.");
  assert(state.materials.title === "Canonical Material Library", "DS-03 title must be Canonical Material Library.");
  assert(state.materials.version === "0.1", "DS-03 must be version 0.1.");
  assert(state.materials.status === "Draft", "DS-03 must remain Draft.");
  assert(state.materials.workspaceRoute === "/experience-design/materials", "DS-03 workspace route must be /experience-design/materials.");
  assert(state.materials.runtimePublication === "future_design_runtime_milestone", "DS-03 runtime publication must be deferred to a future Design Runtime milestone.");
  for (const philosophy of ["Materials communicate meaning.", "Players should understand civilization by how materials behave.", "A material is part of storytelling, not decoration."]) {
    assert(state.materials.philosophy.includes(philosophy), `DS-03 philosophy missing ${philosophy}.`);
  }
  for (const boundary of ["not CSS", "not shaders", "not textures", "not rendering code", "not Unreal materials", "not Unity materials", "not Three.js materials", "not Roblox implementation"]) {
    assert(state.materials.boundaries.join(" ").includes(boundary), `DS-03 boundary missing ${boundary}.`);
  }
  const expectedMaterialCategories = ["Glass", "Projection", "Energy", "Atmosphere", "Planetary", "Architecture", "Natural", "Industrial", "Ancient", "Organic", "Liquid", "Surface", "Structural", "Lighting", "Special"];
  assert(state.materials.categories.map((category) => category.name).join("|") === expectedMaterialCategories.join("|"), "DS-03 material categories must match the canonical list.");
  assert(state.materials.categories.length === 15, "DS-03 must expose 15 canonical material categories.");
  assert(state.materials.materials.length >= 85, "DS-03 must expose a meaningful starter material inventory.");
  const materialIds = new Set(state.materials.materials.map((material) => material.id));
  assert(materialIds.size === state.materials.materials.length, "DS-03 material IDs must be unique.");
  for (const expectedMaterial of ["material-glass-command-glass", "material-glass-projection-glass", "material-projection-projection-discovery", "material-energy-civilization-energy", "material-atmosphere-deep-space", "material-planetary-terraforming-surface", "material-ancient-lost-civilization-material", "material-special-scanning"]) {
    assert(materialIds.has(expectedMaterial), `DS-03 missing canonical material ${expectedMaterial}.`);
  }
  for (const preview of ["Static Preview", "Animated Preview", "Reference Image", "Material Study", "Lighting Study", "Comparison"]) {
    assert(state.materials.previewSupport.includes(preview as never), `DS-03 preview support missing ${preview}.`);
  }
  for (const target of ["Design Tokens", "Visual DNA", "Experience Bible", "Inspiration Boards", "Components", "Screen Templates", "Themes", "Brand"]) {
    assert(state.materials.relationshipTargets.includes(target), `DS-03 relationship targets missing ${target}.`);
  }
  for (const searchField of ["Purpose", "Emotion", "Material Type", "Lighting", "Transparency", "Reflection", "Related Token", "Related Screen", "Experience Bible Chapter", "Visual DNA Section"]) {
    assert(state.materials.searchFields.includes(searchField), `DS-03 search fields missing ${searchField}.`);
  }
  for (const category of state.materials.categories) {
    assert(category.status === "Draft", `DS-03 category ${category.id} must remain Draft.`);
    assert(category.version === "0.1", `DS-03 category ${category.id} must be version 0.1.`);
    assert(category.materialIds.length > 0, `DS-03 category ${category.id} must contain materials.`);
    for (const materialId of category.materialIds) assert(materialIds.has(materialId), `DS-03 category ${category.id} references missing material ${materialId}.`);
  }
  const tokenIdsForMaterials = new Set(state.designTokens.tokens.map((token) => token.id));
  for (const material of state.materials.materials) {
    assert(material.status === "Draft", `DS-03 material ${material.id} must remain Draft.`);
    assert(material.version === "0.1", `DS-03 material ${material.id} must be version 0.1.`);
    assert(material.owner === "Material Design", `DS-03 material ${material.id} must be owned by Material Design.`);
    assert(material.reviewStatus === material.status, `DS-03 material ${material.id} review status must match current draft state.`);
    assert(material.futureRuntimeMapping === "future_design_runtime_milestone", `DS-03 material ${material.id} must defer runtime mapping.`);
    assert(material.experienceBibleReferences.length > 0, `DS-03 material ${material.id} must link to Experience Bible guidance.`);
    assert(material.visualDnaReferences.length > 0, `DS-03 material ${material.id} must link to Visual DNA guidance.`);
    assert(material.relatedTokens.length > 0, `DS-03 material ${material.id} must link to design tokens.`);
    for (const tokenId of material.relatedTokens) assert(tokenIdsForMaterials.has(tokenId), `DS-03 material ${material.id} references missing token ${tokenId}.`);
    assert(material.relatedInspirationBoards.length > 0, `DS-03 material ${material.id} must link to Inspiration Boards.`);
    assert(material.previewSupport.length === state.materials.previewSupport.length, `DS-03 material ${material.id} must support all preview metadata types.`);
    assert(material.history.length > 0, `DS-03 material ${material.id} must include history.`);
    assert(!/#[0-9a-f]{3,8}\b/i.test(JSON.stringify(material)), `DS-03 material ${material.id} must not define color values.`);
    assert(!/[0-9]+(?:px|rem|em|vh|vw)/.test(JSON.stringify(material)), `DS-03 material ${material.id} must not define implementation units.`);
  }
  const materialRecord = state.records.find((record) => record.id === "material-space-glass");
  assert(materialRecord?.name === "Canonical Material Library", "Material starter record must be Canonical Material Library.");
  assert(materialRecord.fields.canonicalSystem === "DS-03", "Material starter record must point to DS-03.");
  assert(materialRecord.fields.implementationValuesPublished === false, "Material starter record must not publish implementation values.");

  const motionSection = state.sections.find((item) => item.id === "motion");
  assert(motionSection?.label === "Motion Library", "Experience Design must expose Motion Library workspace.");
  assert(motionSection.route === "/experience-design/motion", "Motion Library route must be canonical.");
  assert(motionSection.description.includes("DS-04"), "Motion Library section must identify DS-04.");
  const motionModel = state.contentModels.find((model) => model.kind === "motion_definition");
  assert(motionModel?.displayName === "Canonical Motion System", "Motion model must be presented as Canonical Motion System.");
  for (const required of ["category", "purpose", "emotionalIntent", "trigger", "completionCondition", "expectedDuration", "intensity", "playerAttentionLevel", "accessibilityNotes", "visualDnaReferences", "experienceBibleReferences", "relatedTokens", "relatedMaterials", "relatedComponents", "relatedScreens", "relatedInspirationBoards", "futureRuntimeMapping", "reviewStatus"]) {
    assert(motionModel?.requiredFields.includes(required), `Motion content model missing ${required}.`);
  }
  for (const capability of ["arrival", "departure", "focus", "selection", "confirmation", "discovery", "navigation", "transition", "camera", "progress", "research", "construction", "civilization", "mission", "timeline", "galaxy", "planet", "colony", "notification", "celebration", "ambient", "microinteractions", "camera language", "accessibility", "preview metadata", "relationships", "search", "versioning"]) {
    assert(motionModel?.supportedCapabilities.includes(capability), `Motion content model missing capability ${capability}.`);
  }

  assert(state.motion.id === "DS-04", "Motion System ID must be DS-04.");
  assert(state.motion.title === "Canonical Motion System", "DS-04 title must be Canonical Motion System.");
  assert(state.motion.version === "0.1", "DS-04 must be version 0.1.");
  assert(state.motion.status === "Draft", "DS-04 must remain Draft.");
  assert(state.motion.workspaceRoute === "/experience-design/motion", "DS-04 workspace route must be /experience-design/motion.");
  assert(state.motion.runtimePublication === "future_design_runtime_milestone", "DS-04 runtime publication must be deferred to a future Design Runtime milestone.");
  for (const philosophy of ["Motion exists to improve understanding.", "Never animate for decoration.", "Every movement must answer why it moved."]) {
    assert(state.motion.philosophy.includes(philosophy), `DS-04 philosophy missing ${philosophy}.`);
  }
  for (const always of ["reinforce understanding", "respect hierarchy", "support readability", "maintain calm"]) {
    assert(state.motion.rules.always.includes(always), `DS-04 always rule missing ${always}.`);
  }
  for (const never of ["bounce without meaning", "spin for decoration", "flash unnecessarily", "compete with gameplay", "delay interaction"]) {
    assert(state.motion.rules.never.includes(never), `DS-04 never rule missing ${never}.`);
  }
  const expectedMotionCategories = ["Arrival", "Departure", "Focus", "Selection", "Confirmation", "Discovery", "Navigation", "Transition", "Camera", "Progress", "Research", "Construction", "Civilization", "Mission", "Timeline", "Galaxy", "Planet", "Colony", "Notification", "Celebration", "Ambient"];
  assert(state.motion.categories.map((category) => category.name).join("|") === expectedMotionCategories.join("|"), "DS-04 motion categories must match the canonical list.");
  assert(state.motion.categories.length === 21, "DS-04 must expose 21 canonical motion categories.");
  assert(state.motion.motions.length >= 80, "DS-04 must expose a meaningful starter motion inventory.");
  const motionIds = new Set(state.motion.motions.map((motion) => motion.id));
  assert(motionIds.size === state.motion.motions.length, "DS-04 motion IDs must be unique.");
  for (const expectedMotion of ["motion.arrival.standard", "motion.focus.inspect", "motion.discovery.reveal", "motion.civilization.expand", "motion.galaxy.travel", "motion.planet.descend", "motion.notification.success", "motion.ambient.orbital-drift"]) {
    assert(motionIds.has(expectedMotion), `DS-04 missing canonical motion ${expectedMotion}.`);
  }
  assert(state.motion.attentionLevels.join("|") === "Background|Peripheral|Primary|Critical", "DS-04 attention levels must match canonical list.");
  assert(state.motion.intensityLevels.join("|") === "Still|Subtle|Standard|Emphasized|Celebratory|Emergency", "DS-04 intensity levels must match canonical list.");
  for (const accessibility of ["Reduced Motion", "No Motion", "Alternative Feedback", "Timing Adjustments"]) {
    assert(state.motion.accessibilitySupport.includes(accessibility), `DS-04 accessibility support missing ${accessibility}.`);
  }
  for (const preview of ["Animated Preview", "Storyboard", "Motion Timeline", "Interaction Sequence", "Camera Path"]) {
    assert(state.motion.previewSupport.includes(preview as never), `DS-04 preview support missing ${preview}.`);
  }
  for (const target of ["Design Tokens", "Materials", "Visual DNA", "Experience Bible", "Inspiration Boards", "Components", "Screen Templates", "Themes", "Brand"]) {
    assert(state.motion.relationshipTargets.includes(target), `DS-04 relationship targets missing ${target}.`);
  }
  const cameraPath = state.motion.cameraLanguage.map((cameraMove) => `${cameraMove.from}->${cameraMove.to}`).join("|");
  assert(cameraPath === "Galaxy->Sector|Sector->Star System|Star System->Planet|Planet->Colony|Colony->Building", "DS-04 camera language must follow Galaxy -> Sector -> Star System -> Planet -> Colony -> Building.");
  const tokenIdsForMotion = new Set(state.designTokens.tokens.map((token) => token.id));
  const materialIdsForMotion = new Set(state.materials.materials.map((material) => material.id));
  for (const category of state.motion.categories) {
    assert(category.status === "Draft", `DS-04 category ${category.id} must remain Draft.`);
    assert(category.version === "0.1", `DS-04 category ${category.id} must be version 0.1.`);
    assert(category.motionIds.length > 0, `DS-04 category ${category.id} must contain motions.`);
    for (const motionId of category.motionIds) assert(motionIds.has(motionId), `DS-04 category ${category.id} references missing motion ${motionId}.`);
  }
  for (const motion of state.motion.motions) {
    assert(motion.id.startsWith("motion."), `DS-04 motion ${motion.id} must use motion.* semantic ID.`);
    assert(motion.status === "Draft", `DS-04 motion ${motion.id} must remain Draft.`);
    assert(motion.version === "0.1", `DS-04 motion ${motion.id} must be version 0.1.`);
    assert(motion.owner === "Motion Design", `DS-04 motion ${motion.id} must be owned by Motion Design.`);
    assert(motion.reviewStatus === motion.status, `DS-04 motion ${motion.id} review status must match current draft state.`);
    assert(motion.futureRuntimeMapping === "future_design_runtime_milestone", `DS-04 motion ${motion.id} must defer runtime mapping.`);
    assert(motion.experienceBibleReferences.length > 0, `DS-04 motion ${motion.id} must link to Experience Bible guidance.`);
    assert(motion.visualDnaReferences.length > 0, `DS-04 motion ${motion.id} must link to Visual DNA guidance.`);
    assert(motion.relatedTokens.length > 0, `DS-04 motion ${motion.id} must link to design tokens.`);
    for (const tokenId of motion.relatedTokens) assert(tokenIdsForMotion.has(tokenId), `DS-04 motion ${motion.id} references missing token ${tokenId}.`);
    assert(motion.relatedMaterials.length > 0, `DS-04 motion ${motion.id} must link to materials.`);
    for (const materialId of motion.relatedMaterials) assert(materialIdsForMotion.has(materialId), `DS-04 motion ${motion.id} references missing material ${materialId}.`);
    assert(motion.relatedInspirationBoards.length > 0, `DS-04 motion ${motion.id} must link to Inspiration Boards.`);
    assert(motion.previewSupport.length === state.motion.previewSupport.length, `DS-04 motion ${motion.id} must support all preview metadata types.`);
    assert(motion.accessibilityNotes.join("|") === state.motion.accessibilitySupport.join("|"), `DS-04 motion ${motion.id} must support all accessibility modes.`);
    assert(motion.history.length > 0, `DS-04 motion ${motion.id} must include history.`);
    const text = JSON.stringify(motion);
    assert(!/cubic-bezier|keyframes|@keyframes|requestAnimationFrame|gsap|framer-motion/i.test(text), `DS-04 motion ${motion.id} must not define animation implementation.`);
    assert(!/[0-9]+(?:ms|s)\b/.test(text), `DS-04 motion ${motion.id} must not define numeric timing values.`);
  }
  const motionRecord = state.records.find((record) => record.id === "motion-discovery");
  assert(motionRecord?.name === "Canonical Motion System", "Motion starter record must be Canonical Motion System.");
  assert(motionRecord.fields.canonicalSystem === "DS-04", "Motion starter record must point to DS-04.");
  assert(motionRecord.fields.implementationValuesPublished === false, "Motion starter record must not publish implementation values.");

  const componentSection = state.sections.find((item) => item.id === "components");
  assert(componentSection?.label === "Component Library", "Experience Design must expose Component Library workspace.");
  assert(componentSection.route === "/experience-design/components", "Component Library route must be canonical.");
  assert(componentSection.description.includes("DS-05"), "Component Library section must identify DS-05.");
  const componentModel = state.contentModels.find((model) => model.kind === "component_definition");
  assert(componentModel?.displayName === "Canonical Component Library", "Component model must be presented as Canonical Component Library.");
  for (const required of ["category", "purpose", "playerIntent", "studioIntent", "experienceBibleReferences", "visualDnaReferences", "relatedTokens", "relatedMaterials", "relatedMotion", "relatedComponents", "relatedScreens", "relatedInspirationBoards", "accessibilityNotes", "responsiveNotes", "interactionNotes", "states", "sizes", "futureRuntimeMapping", "owner", "reviewStatus"]) {
    assert(componentModel?.requiredFields.includes(required), `Component content model missing ${required}.`);
  }
  for (const capability of ["navigation", "command", "layout", "information", "data display", "interaction", "visualization", "media", "feedback", "input", "documentation", "creative", "runtime", "semantic states", "semantic sizes", "accessibility", "responsive intent", "preview metadata", "relationships", "search", "versioning"]) {
    assert(componentModel?.supportedCapabilities.includes(capability), `Component content model missing capability ${capability}.`);
  }

  assert(state.componentLibrary.id === "DS-05", "Component Library ID must be DS-05.");
  assert(state.componentLibrary.title === "Canonical Component Library", "DS-05 title must be Canonical Component Library.");
  assert(state.componentLibrary.version === "0.1", "DS-05 must be version 0.1.");
  assert(state.componentLibrary.status === "Draft", "DS-05 must remain Draft.");
  assert(state.componentLibrary.workspaceRoute === "/experience-design/components", "DS-05 workspace route must be /experience-design/components.");
  assert(state.componentLibrary.runtimePublication === "future_design_runtime_milestone", "DS-05 runtime publication must be deferred to a future Design Runtime milestone.");
  for (const philosophy of ["Components communicate information with clarity.", "Components should disappear into the experience.", "The player notices the civilization, not the controls."]) {
    assert(state.componentLibrary.philosophy.includes(philosophy), `DS-05 philosophy missing ${philosophy}.`);
  }
  for (const boundary of ["Components are not React components.", "Components are not Vue components.", "Components are not HTML.", "Components are not CSS.", "Components are not Tailwind.", "Components are not UIKit.", "Components are not Material UI.", "Components are not implementation code."]) {
    assert(state.componentLibrary.boundaries.includes(boundary), `DS-05 boundary missing ${boundary}.`);
  }
  const expectedComponentCategories = ["Navigation", "Command", "Layout", "Information", "Data Display", "Interaction", "Visualization", "Media", "Feedback", "Input", "Documentation", "Creative", "Runtime"];
  assert(state.componentLibrary.categories.map((category) => category.name).join("|") === expectedComponentCategories.join("|"), "DS-05 component categories must match the canonical list.");
  assert(state.componentLibrary.categories.length === 13, "DS-05 must expose 13 canonical component categories.");
  assert(state.componentLibrary.components.length >= 100, "DS-05 must expose a meaningful starter component inventory.");
  const componentIds = new Set(state.componentLibrary.components.map((component) => component.id));
  assert(componentIds.size === state.componentLibrary.components.length, "DS-05 component IDs must be unique.");
  for (const expectedComponent of ["component.navigation.navigation-rail", "component.command.primary-command-button", "component.layout.workspace", "component.information.status-chip", "component.data-display.table", "component.feedback.notification", "component.documentation.reading-panel", "component.runtime.validation-summary"]) {
    assert(componentIds.has(expectedComponent), `DS-05 missing canonical component ${expectedComponent}.`);
  }
  assert(state.componentLibrary.states.join("|") === "Default|Hover|Focus|Active|Selected|Pressed|Disabled|Loading|Success|Warning|Danger|Locked|Unavailable", "DS-05 states must match canonical semantic states.");
  assert(state.componentLibrary.sizes.join("|") === "Compact|Standard|Comfortable|Hero", "DS-05 sizes must match canonical semantic sizes.");
  for (const accessibility of ["Keyboard", "Touch", "Controller", "Reduced Motion", "High Contrast", "Screen Reader", "Localization"]) {
    assert(state.componentLibrary.accessibilitySupport.includes(accessibility), `DS-05 accessibility support missing ${accessibility}.`);
  }
  for (const responsive of ["Desktop", "Laptop", "Tablet", "Phone", "Ultrawide"]) {
    assert(state.componentLibrary.responsiveTargets.includes(responsive), `DS-05 responsive target missing ${responsive}.`);
  }
  for (const preview of ["Static Preview", "Interactive Preview", "State Preview", "Accessibility Preview", "Comparison Preview"]) {
    assert(state.componentLibrary.previewSupport.includes(preview as never), `DS-05 preview support missing ${preview}.`);
  }
  for (const target of ["Design Tokens", "Materials", "Motion", "Visual DNA", "Experience Bible", "Inspiration Boards", "Screen Templates", "Themes", "Brand"]) {
    assert(state.componentLibrary.relationshipTargets.includes(target), `DS-05 relationship target missing ${target}.`);
  }
  const tokenIdsForComponents = new Set(state.designTokens.tokens.map((token) => token.id));
  const materialIdsForComponents = new Set(state.materials.materials.map((material) => material.id));
  const motionIdsForComponents = new Set(state.motion.motions.map((motion) => motion.id));
  for (const category of state.componentLibrary.categories) {
    assert(category.status === "Draft", `DS-05 category ${category.id} must remain Draft.`);
    assert(category.version === "0.1", `DS-05 category ${category.id} must be version 0.1.`);
    assert(category.componentIds.length > 0, `DS-05 category ${category.id} must contain components.`);
    for (const componentId of category.componentIds) assert(componentIds.has(componentId), `DS-05 category ${category.id} references missing component ${componentId}.`);
  }
  for (const component of state.componentLibrary.components) {
    assert(component.id.startsWith("component."), `DS-05 component ${component.id} must use component.* semantic ID.`);
    assert(component.status === "Draft", `DS-05 component ${component.id} must remain Draft.`);
    assert(component.version === "0.1", `DS-05 component ${component.id} must be version 0.1.`);
    assert(component.owner === "Component Design", `DS-05 component ${component.id} must be owned by Component Design.`);
    assert(component.reviewStatus === component.status, `DS-05 component ${component.id} review status must match current draft state.`);
    assert(component.futureRuntimeMapping === "future_design_runtime_milestone", `DS-05 component ${component.id} must defer runtime mapping.`);
    assert(component.experienceBibleReferences.length > 0, `DS-05 component ${component.id} must link to Experience Bible guidance.`);
    assert(component.visualDnaReferences.length > 0, `DS-05 component ${component.id} must link to Visual DNA guidance.`);
    assert(component.relatedTokens.length > 0, `DS-05 component ${component.id} must link to design tokens.`);
    for (const tokenId of component.relatedTokens) assert(tokenIdsForComponents.has(tokenId), `DS-05 component ${component.id} references missing token ${tokenId}.`);
    assert(component.relatedMaterials.length > 0, `DS-05 component ${component.id} must link to materials.`);
    for (const materialId of component.relatedMaterials) assert(materialIdsForComponents.has(materialId), `DS-05 component ${component.id} references missing material ${materialId}.`);
    assert(component.relatedMotion.length > 0, `DS-05 component ${component.id} must link to motion.`);
    for (const motionId of component.relatedMotion) assert(motionIdsForComponents.has(motionId), `DS-05 component ${component.id} references missing motion ${motionId}.`);
    assert(component.relatedInspirationBoards.length > 0, `DS-05 component ${component.id} must link to Inspiration Boards.`);
    assert(component.states.join("|") === state.componentLibrary.states.join("|"), `DS-05 component ${component.id} must support all semantic states.`);
    assert(component.sizes.join("|") === state.componentLibrary.sizes.join("|"), `DS-05 component ${component.id} must support all semantic sizes.`);
    assert(component.accessibilityNotes.join("|") === state.componentLibrary.accessibilitySupport.join("|"), `DS-05 component ${component.id} must support all accessibility modes.`);
    assert(component.previewSupport.length === state.componentLibrary.previewSupport.length, `DS-05 component ${component.id} must support all preview metadata types.`);
    assert(component.history.length > 0, `DS-05 component ${component.id} must include history.`);
  }
  const componentRecord = state.records.find((record) => record.id === "component-design-panel");
  assert(componentRecord?.name === "Canonical Component Library", "Component starter record must be Canonical Component Library.");
  assert(componentRecord.fields.canonicalSystem === "DS-05", "Component starter record must point to DS-05.");
  assert(componentRecord.fields.implementationValuesPublished === false, "Component starter record must not publish implementation values.");

  const patternSection = state.sections.find((item) => item.id === "patterns");
  assert(patternSection?.label === "Interaction Patterns", "Experience Design must expose Interaction Patterns workspace.");
  assert(patternSection.route === "/experience-design/patterns", "Interaction Patterns route must be canonical.");
  assert(patternSection.description.includes("DS-05A"), "Interaction Patterns section must identify DS-05A.");
  const patternModel = state.contentModels.find((model) => model.kind === "interaction_pattern");
  assert(patternModel?.displayName === "Canonical Interaction Pattern Library", "Pattern model must be presented as Canonical Interaction Pattern Library.");
  for (const required of ["category", "purpose", "problemSolved", "primaryUserIntent", "studioIntent", "gameplayIntent", "experienceBibleReferences", "visualDnaReferences", "relatedTokens", "relatedMaterials", "relatedMotion", "relatedComponents", "relatedScreens", "relatedInspirationBoards", "accessibilityNotes", "responsiveNotes", "interactionFlow", "futureRuntimeMapping", "reviewStatus"]) {
    assert(patternModel?.requiredFields.includes(required), `Pattern content model missing ${required}.`);
  }
  for (const capability of ["navigation", "workspace", "exploration", "inspection", "creation", "review", "reading", "search", "dashboard", "data", "comparison", "visualization", "notification", "approval", "runtime", "interaction flow", "design contracts", "relationships", "search", "accessibility", "versioning"]) {
    assert(patternModel?.supportedCapabilities.includes(capability), `Pattern content model missing capability ${capability}.`);
  }

  assert(state.interactionPatterns.id === "DS-05A", "Interaction Pattern Library ID must be DS-05A.");
  assert(state.interactionPatterns.title === "Canonical Interaction Pattern Library", "DS-05A title must be Canonical Interaction Pattern Library.");
  assert(state.interactionPatterns.version === "0.1", "DS-05A must be version 0.1.");
  assert(state.interactionPatterns.status === "Draft", "DS-05A must remain Draft.");
  assert(state.interactionPatterns.workspaceRoute === "/experience-design/patterns", "DS-05A workspace route must be /experience-design/patterns.");
  assert(state.interactionPatterns.runtimePublication === "future_design_runtime_milestone", "DS-05A runtime publication must be deferred to a future Design Runtime milestone.");
  for (const philosophy of ["Components are atoms.", "Patterns are molecules.", "Screens are organisms.", "Patterns solve recurring interaction problems.", "Patterns prevent every screen from inventing its own behavior."]) {
    assert(state.interactionPatterns.philosophy.includes(philosophy), `DS-05A philosophy missing ${philosophy}.`);
  }
  for (const boundary of ["Patterns are not React layouts.", "Patterns are not HTML templates.", "Patterns are not CSS.", "Patterns are not Tailwind.", "Patterns are not implementation.", "Patterns are not screen-specific code."]) {
    assert(state.interactionPatterns.boundaries.includes(boundary), `DS-05A boundary missing ${boundary}.`);
  }
  const expectedPatternCategories = ["Navigation", "Workspace", "Exploration", "Inspection", "Creation", "Review", "Reading", "Search", "Dashboard", "Data", "Comparison", "Visualization", "Notification", "Approval", "Runtime"];
  assert(state.interactionPatterns.categories.map((category) => category.name).join("|") === expectedPatternCategories.join("|"), "DS-05A pattern categories must match the canonical list.");
  assert(state.interactionPatterns.categories.length === 15, "DS-05A must expose 15 canonical pattern categories.");
  assert(state.interactionPatterns.patterns.length >= 90, "DS-05A must expose a meaningful starter pattern inventory.");
  const patternIds = new Set(state.interactionPatterns.patterns.map((pattern) => pattern.id));
  assert(patternIds.size === state.interactionPatterns.patterns.length, "DS-05A pattern IDs must be unique.");
  for (const expectedPattern of ["pattern.navigation.navigation-rail", "pattern.workspace.command-center", "pattern.exploration.galaxy-exploration", "pattern.inspection.master-detail", "pattern.search.global-search", "pattern.reading.experience-bible", "pattern.approval.publish-release", "pattern.runtime.runtime-validation"]) {
    assert(patternIds.has(expectedPattern), `DS-05A missing canonical pattern ${expectedPattern}.`);
  }
  for (const preview of ["Static Preview", "Interaction Diagram", "Flow Diagram", "Sequence", "Accessibility Preview"]) {
    assert(state.interactionPatterns.previewSupport.includes(preview as never), `DS-05A preview support missing ${preview}.`);
  }
  for (const accessibility of ["Keyboard", "Touch", "Controller", "Reduced Motion", "High Contrast", "Screen Reader", "Localization"]) {
    assert(state.interactionPatterns.accessibilitySupport.includes(accessibility), `DS-05A accessibility support missing ${accessibility}.`);
  }
  for (const target of ["Components", "Tokens", "Materials", "Motion", "Screen Templates", "Themes", "Experience Bible", "Visual DNA"]) {
    assert(state.interactionPatterns.relationshipTargets.includes(target), `DS-05A relationship target missing ${target}.`);
  }
  const tokenIdsForPatterns = new Set(state.designTokens.tokens.map((token) => token.id));
  const materialIdsForPatterns = new Set(state.materials.materials.map((material) => material.id));
  const motionIdsForPatterns = new Set(state.motion.motions.map((motion) => motion.id));
  const componentIdsForPatterns = new Set(state.componentLibrary.components.map((component) => component.id));
  const boardIdsForPatterns = new Set(state.inspirationBoards.boards.map((board) => board.id));
  for (const category of state.interactionPatterns.categories) {
    assert(category.status === "Draft", `DS-05A category ${category.id} must remain Draft.`);
    assert(category.version === "0.1", `DS-05A category ${category.id} must be version 0.1.`);
    assert(category.patternIds.length > 0, `DS-05A category ${category.id} must contain patterns.`);
    for (const patternId of category.patternIds) assert(patternIds.has(patternId), `DS-05A category ${category.id} references missing pattern ${patternId}.`);
  }
  for (const pattern of state.interactionPatterns.patterns) {
    assert(pattern.id.startsWith("pattern."), `DS-05A pattern ${pattern.id} must use pattern.* semantic ID.`);
    assert(pattern.status === "Draft", `DS-05A pattern ${pattern.id} must remain Draft.`);
    assert(pattern.version === "0.1", `DS-05A pattern ${pattern.id} must be version 0.1.`);
    assert(pattern.owner === "Interaction Design", `DS-05A pattern ${pattern.id} must be owned by Interaction Design.`);
    assert(pattern.reviewStatus === pattern.status, `DS-05A pattern ${pattern.id} review status must match current draft state.`);
    assert(pattern.futureRuntimeMapping === "future_design_runtime_milestone", `DS-05A pattern ${pattern.id} must defer runtime mapping.`);
    assert(pattern.experienceBibleReferences.length > 0, `DS-05A pattern ${pattern.id} must link to Experience Bible guidance.`);
    assert(pattern.visualDnaReferences.length > 0, `DS-05A pattern ${pattern.id} must link to Visual DNA guidance.`);
    assert(pattern.relatedTokens.length > 0, `DS-05A pattern ${pattern.id} must link to design tokens.`);
    for (const tokenId of pattern.relatedTokens) assert(tokenIdsForPatterns.has(tokenId), `DS-05A pattern ${pattern.id} references missing token ${tokenId}.`);
    assert(pattern.relatedMaterials.length > 0, `DS-05A pattern ${pattern.id} must link to materials.`);
    for (const materialId of pattern.relatedMaterials) assert(materialIdsForPatterns.has(materialId), `DS-05A pattern ${pattern.id} references missing material ${materialId}.`);
    assert(pattern.relatedMotion.length > 0, `DS-05A pattern ${pattern.id} must link to motion.`);
    for (const motionId of pattern.relatedMotion) assert(motionIdsForPatterns.has(motionId), `DS-05A pattern ${pattern.id} references missing motion ${motionId}.`);
    assert(pattern.relatedComponents.length > 0, `DS-05A pattern ${pattern.id} must link to components.`);
    for (const componentId of pattern.relatedComponents) assert(componentIdsForPatterns.has(componentId), `DS-05A pattern ${pattern.id} references missing component ${componentId}.`);
    assert(pattern.relatedInspirationBoards.length > 0, `DS-05A pattern ${pattern.id} must link to Inspiration Boards.`);
    for (const boardId of pattern.relatedInspirationBoards) assert(boardIdsForPatterns.has(boardId), `DS-05A pattern ${pattern.id} references missing Inspiration Board ${boardId}.`);
    assert(pattern.accessibilityNotes.join("|") === state.interactionPatterns.accessibilitySupport.join("|"), `DS-05A pattern ${pattern.id} must support all accessibility modes.`);
    assert(pattern.previewSupport.length === state.interactionPatterns.previewSupport.length, `DS-05A pattern ${pattern.id} must support all preview metadata types.`);
    for (const flowField of ["entry", "primaryAction", "secondaryActions", "completion", "exit", "failureStates", "recovery"] as const) {
      const value = pattern.interactionFlow[flowField];
      assert(Array.isArray(value) ? value.length > 0 : Boolean(value), `DS-05A pattern ${pattern.id} interaction flow missing ${flowField}.`);
    }
    assert(pattern.history.length > 0, `DS-05A pattern ${pattern.id} must include history.`);
  }
  assert(state.interactionPatterns.designContracts.id === "DS-05A-CONTRACTS", "DS-05A design contracts ID must be stable.");
  assert(state.interactionPatterns.designContracts.status === "Ready", "DS-05A design contracts must be Ready.");
  for (const check of ["Missing Tokens", "Missing Materials", "Missing Motion", "Missing Components", "Missing Patterns", "Missing Inspiration Boards", "Missing Experience Bible References", "Duplicate IDs", "Orphaned Records", "Circular References", "Invalid Semantic IDs", "Broken Relationships"]) {
    const contractCheck = state.interactionPatterns.designContracts.checks.find((item) => item.label === check);
    assert(contractCheck, `DS-05A design contracts missing ${check}.`);
    assert(contractCheck.status === "Pass", `DS-05A design contract ${check} must pass.`);
    assert(contractCheck.count === 0, `DS-05A design contract ${check} must have zero issues.`);
  }
  const patternRecord = state.records.find((record) => record.id === "interaction-pattern-library");
  assert(patternRecord?.name === "Canonical Interaction Pattern Library", "Pattern starter record must be Canonical Interaction Pattern Library.");
  assert(patternRecord.fields.canonicalSystem === "DS-05A", "Pattern starter record must point to DS-05A.");
  assert(patternRecord.fields.implementationValuesPublished === false, "Pattern starter record must not publish implementation values.");

  const screenSection = state.sections.find((item) => item.id === "screens");
  assert(screenSection?.label === "Screen Library", "Experience Design must expose Screen Library workspace.");
  assert(screenSection.route === "/experience-design/screens", "Screen Library route must be canonical.");
  assert(screenSection.description.includes("DS-06"), "Screen Library section must identify DS-06.");
  const screenModel = state.contentModels.find((model) => model.kind === "screen_definition");
  assert(screenModel?.displayName === "Canonical Screen Library", "Screen model must be presented as Canonical Screen Library.");
  for (const required of ["purpose", "playerGoal", "studioGoal", "emotionalGoal", "experienceBibleReferences", "visualDnaReferences", "primaryInteractionPattern", "supportingPatterns", "componentComposition", "materialComposition", "motionComposition", "tokenReferences", "background", "lighting", "informationHierarchy", "interactionZones", "layoutRegions", "states", "responsiveBehavior", "accessibilityNotes", "platformVariants", "futureRuntimeMapping", "owner", "reviewStatus"]) {
    assert(screenModel?.requiredFields.includes(required), `Screen content model missing ${required}.`);
  }
  for (const capability of ["screen categories", "layout regions", "interaction zones", "platform variants", "responsive targets", "preview metadata", "relationships", "search", "accessibility", "versioning"]) {
    assert(screenModel?.supportedCapabilities.includes(capability), `Screen content model missing capability ${capability}.`);
  }

  assert(state.screenLibrary.id === "DS-06", "Screen Library ID must be DS-06.");
  assert(state.screenLibrary.title === "Canonical Screen Library", "DS-06 title must be Canonical Screen Library.");
  assert(state.screenLibrary.version === "0.1", "DS-06 must be version 0.1.");
  assert(state.screenLibrary.status === "Draft", "DS-06 must remain Draft.");
  assert(state.screenLibrary.workspaceRoute === "/experience-design/screens", "DS-06 workspace route must be /experience-design/screens.");
  assert(state.screenLibrary.runtimePublication === "future_design_runtime_milestone", "DS-06 runtime publication must be deferred to a future Design Runtime milestone.");
  for (const philosophy of ["Screen Definitions are the highest-level design assets.", "Patterns solve interaction behavior.", "Components provide reusable parts.", "Materials define visual surface language.", "Motion defines feeling.", "Tokens define semantic consistency.", "Screens compose all of them into a player-facing experience."]) {
    assert(state.screenLibrary.philosophy.includes(philosophy), `DS-06 philosophy missing ${philosophy}.`);
  }
  for (const boundary of ["Screen Definitions are not React pages.", "Screen Definitions are not HTML layouts.", "Screen Definitions are not CSS.", "Screen Definitions are not implementation.", "Screen Definitions are not routes.", "Screen Definitions are not runtime rendering code."]) {
    assert(state.screenLibrary.boundaries.includes(boundary), `DS-06 boundary missing ${boundary}.`);
  }
  const expectedScreenCategories = ["Game Shell", "Universe", "Civilization", "Gameplay", "Creative", "Studio", "Reference", "System", "Runtime"];
  assert(state.screenLibrary.categories.map((category) => category.name).join("|") === expectedScreenCategories.join("|"), "DS-06 screen categories must match the canonical list.");
  assert(state.screenLibrary.categories.length === 9, "DS-06 must expose nine canonical screen categories.");
  assert(state.screenLibrary.screens.length >= 60, "DS-06 must expose a meaningful starter screen inventory.");
  const screenIds = new Set(state.screenLibrary.screens.map((screen) => screen.id));
  assert(screenIds.size === state.screenLibrary.screens.length, "DS-06 screen IDs must be unique.");
  for (const expectedScreen of ["screen.game-shell.startup", "screen.game-shell.civilization-command", "screen.universe.galaxy", "screen.universe.star-system", "screen.civilization.research", "screen.gameplay.mission", "screen.creative.experience-bible", "screen.studio.asset-library", "screen.reference.specification-reference", "screen.system.command-palette", "screen.runtime.runtime-status"]) {
    assert(screenIds.has(expectedScreen), `DS-06 missing canonical screen ${expectedScreen}.`);
  }
  for (const region of ["Hero", "Navigation", "Sidebar", "Content", "Context Panel", "Bottom Status", "Overlay", "Modal", "Drawer", "Floating Panel", "Canvas", "Background"]) {
    assert(state.screenLibrary.layoutRegions.includes(region as never), `DS-06 layout regions missing ${region}.`);
  }
  for (const zone of ["Navigation", "Content", "Actions", "Reference", "Inspection", "Creation", "Review", "Visualization"]) {
    assert(state.screenLibrary.interactionZones.includes(zone as never), `DS-06 interaction zones missing ${zone}.`);
  }
  assert(state.screenLibrary.informationHierarchyLevels.join("|") === "primary|secondary|supporting|decorative", "DS-06 information hierarchy levels must match the canonical list.");
  for (const target of ["Desktop", "Laptop", "Tablet", "Phone", "Ultrawide", "Steam Deck", "Controller"]) {
    assert(state.screenLibrary.responsiveTargets.includes(target), `DS-06 responsive target missing ${target}.`);
  }
  for (const platform of ["Web", "Steam", "macOS", "Windows", "iOS", "Android", "Console"]) {
    assert(state.screenLibrary.platformVariants.includes(platform), `DS-06 platform variant missing ${platform}.`);
  }
  for (const preview of ["Static Preview", "Wireframe", "Composition Preview", "Interaction Flow", "Component Tree", "Accessibility Preview", "Presentation Mode"]) {
    assert(state.screenLibrary.previewSupport.includes(preview), `DS-06 preview support missing ${preview}.`);
  }
  for (const target of ["Patterns", "Components", "Materials", "Motion", "Tokens", "Themes", "Experience Bible", "Visual DNA", "Inspiration Boards"]) {
    assert(state.screenLibrary.relationshipTargets.includes(target), `DS-06 relationship target missing ${target}.`);
  }

  const tokenIdsForScreens = new Set(state.designTokens.tokens.map((token) => token.id));
  const materialIdsForScreens = new Set(state.materials.materials.map((material) => material.id));
  const motionIdsForScreens = new Set(state.motion.motions.map((motion) => motion.id));
  const componentIdsForScreens = new Set(state.componentLibrary.components.map((component) => component.id));
  const boardIdsForScreens = new Set(state.inspirationBoards.boards.map((board) => board.id));
  const bibleReferenceIdsForScreens = new Set([
    ...state.experienceBible.chapters.map((chapter) => chapter.id),
    ...state.experienceBible.signature.sections.map((section) => section.id)
  ]);
  const visualDnaReferenceIdsForScreens = new Set(state.experienceBible.visualDna.sections.map((section) => section.id));
  for (const category of state.screenLibrary.categories) {
    assert(category.status === "Draft", `DS-06 category ${category.id} must remain Draft.`);
    assert(category.version === "0.1", `DS-06 category ${category.id} must be version 0.1.`);
    assert(category.screenIds.length > 0, `DS-06 category ${category.id} must contain screens.`);
    for (const screenId of category.screenIds) assert(screenIds.has(screenId), `DS-06 category ${category.id} references missing screen ${screenId}.`);
  }
  for (const screen of state.screenLibrary.screens) {
    assert(/^screen\.[a-z0-9-]+\.[a-z0-9-]+$/.test(screen.id), `DS-06 screen ${screen.id} must use screen.category.name semantic ID.`);
    assert(screen.status === "Draft", `DS-06 screen ${screen.id} must remain Draft.`);
    assert(screen.version === "0.1", `DS-06 screen ${screen.id} must be version 0.1.`);
    assert(screen.owner === "Screen Design", `DS-06 screen ${screen.id} must be owned by Screen Design.`);
    assert(screen.reviewStatus === screen.status, `DS-06 screen ${screen.id} review status must match current draft state.`);
    assert(screen.futureRuntimeMapping === "future_design_runtime_milestone", `DS-06 screen ${screen.id} must defer runtime mapping.`);
    assert(screen.summary.includes("does not define React pages"), `DS-06 screen ${screen.id} must reject React page implementation ownership.`);
    assert(screen.summary.includes("routes"), `DS-06 screen ${screen.id} must reject route ownership.`);
    assert(screen.summary.includes("renderer behavior"), `DS-06 screen ${screen.id} must reject renderer ownership.`);
    assert(screen.experienceBibleReferences.length > 0, `DS-06 screen ${screen.id} must link to Experience Bible guidance.`);
    for (const referenceId of screen.experienceBibleReferences) assert(bibleReferenceIdsForScreens.has(referenceId), `DS-06 screen ${screen.id} references missing Bible guidance ${referenceId}.`);
    assert(screen.visualDnaReferences.length > 0, `DS-06 screen ${screen.id} must link to Visual DNA guidance.`);
    for (const referenceId of screen.visualDnaReferences) assert(visualDnaReferenceIdsForScreens.has(referenceId), `DS-06 screen ${screen.id} references missing Visual DNA guidance ${referenceId}.`);
    assert(boardIdsForScreens.has(screen.relatedInspirationBoards[0]), `DS-06 screen ${screen.id} must link to at least one Inspiration Board.`);
    for (const boardId of screen.relatedInspirationBoards) assert(boardIdsForScreens.has(boardId), `DS-06 screen ${screen.id} references missing Inspiration Board ${boardId}.`);
    assert(patternIds.has(screen.primaryInteractionPattern), `DS-06 screen ${screen.id} primary pattern ${screen.primaryInteractionPattern} must resolve.`);
    for (const patternId of screen.supportingPatterns) assert(patternIds.has(patternId), `DS-06 screen ${screen.id} references missing supporting pattern ${patternId}.`);
    assert(screen.componentComposition.length > 0, `DS-06 screen ${screen.id} must compose components.`);
    for (const componentId of screen.componentComposition) assert(componentIdsForScreens.has(componentId), `DS-06 screen ${screen.id} references missing component ${componentId}.`);
    assert(screen.materialComposition.length > 0, `DS-06 screen ${screen.id} must compose materials.`);
    for (const materialId of screen.materialComposition) assert(materialIdsForScreens.has(materialId), `DS-06 screen ${screen.id} references missing material ${materialId}.`);
    assert(screen.motionComposition.length > 0, `DS-06 screen ${screen.id} must compose motion.`);
    for (const motionId of screen.motionComposition) assert(motionIdsForScreens.has(motionId), `DS-06 screen ${screen.id} references missing motion ${motionId}.`);
    assert(screen.tokenReferences.length > 0, `DS-06 screen ${screen.id} must reference tokens.`);
    for (const tokenId of screen.tokenReferences) assert(tokenIdsForScreens.has(tokenId), `DS-06 screen ${screen.id} references missing token ${tokenId}.`);
    for (const region of state.screenLibrary.layoutRegions) assert(screen.layoutRegions.includes(region), `DS-06 screen ${screen.id} missing layout region ${region}.`);
    for (const zone of state.screenLibrary.interactionZones) assert(screen.interactionZones.includes(zone), `DS-06 screen ${screen.id} missing interaction zone ${zone}.`);
    for (const stateField of ["entryState", "normalState", "busyState", "successState", "failureState", "emptyState", "loadingState"] as const) {
      assert(Boolean(screen.states[stateField]), `DS-06 screen ${screen.id} missing state ${stateField}.`);
    }
    for (const hierarchyField of ["primary", "secondary", "supporting", "decorative"] as const) {
      assert(screen.informationHierarchy[hierarchyField].length > 0, `DS-06 screen ${screen.id} missing ${hierarchyField} information hierarchy.`);
    }
    assert(screen.responsiveBehavior.length === state.screenLibrary.responsiveTargets.length, `DS-06 screen ${screen.id} must describe every responsive target.`);
    assert(screen.platformVariants.join("|") === state.screenLibrary.platformVariants.join("|"), `DS-06 screen ${screen.id} must support all canonical platform variants.`);
    assert(screen.accessibilityNotes.join("|") === state.interactionPatterns.accessibilitySupport.join("|"), `DS-06 screen ${screen.id} must support all accessibility modes.`);
    assert(screen.controllerNotes.length > 0 && screen.touchNotes.length > 0 && screen.keyboardNotes.length > 0, `DS-06 screen ${screen.id} must include input modality notes.`);
    assert(screen.history.length > 0, `DS-06 screen ${screen.id} must include history.`);
  }
  assert(state.screenLibrary.designContracts.id === "DS-06-CONTRACTS", "DS-06 design contracts ID must be stable.");
  assert(state.screenLibrary.designContracts.status === "Ready", "DS-06 design contracts must be Ready.");
  for (const check of ["Missing Patterns", "Missing Components", "Missing Materials", "Missing Motion", "Missing Tokens", "Missing Experience Bible References", "Missing Visual DNA References", "Missing Inspiration Boards", "Duplicate IDs", "Orphaned Screens", "Circular Screen References", "Missing Dependencies", "Invalid Semantic IDs", "Broken Screen Graphs"]) {
    const contractCheck = state.screenLibrary.designContracts.checks.find((item) => item.label === check);
    assert(contractCheck, `DS-06 design contracts missing ${check}.`);
    assert(contractCheck.status === "Pass", `DS-06 design contract ${check} must pass.`);
    assert(contractCheck.count === 0, `DS-06 design contract ${check} must have zero issues.`);
  }
  const screenRecord = state.records.find((record) => record.id === "screen-definition-library");
  assert(screenRecord?.name === "Canonical Screen Library", "Screen starter record must be Canonical Screen Library.");
  assert(screenRecord.fields.canonicalSystem === "DS-06", "Screen starter record must point to DS-06.");
  assert(screenRecord.fields.implementationValuesPublished === false, "Screen starter record must not publish implementation values.");

  const inspirationSection = state.sections.find((item) => item.id === "inspiration-boards");
  assert(inspirationSection?.label === "Inspiration Boards", "Experience Design must expose Inspiration Boards workspace.");
  assert(inspirationSection.route === "/experience-design/inspiration-boards", "Inspiration Boards route must be canonical.");
  const boardModel = state.contentModels.find((model) => model.kind === "mood_board");
  assert(boardModel?.displayName === "Inspiration Board", "Existing mood_board model must be presented as Inspiration Board.");
  for (const required of ["title", "subtitle", "purpose", "creativeGoal", "experienceBibleReferences", "visualDnaReferences", "references", "annotations"]) {
    assert(boardModel?.requiredFields.includes(required), `Inspiration Board content model missing ${required}.`);
  }
  for (const capability of ["categories", "collections", "boards", "subboards", "references", "annotations", "relationships", "versions", "approval", "history", "search", "favorites", "presentation mode"]) {
    assert(boardModel?.supportedCapabilities.includes(capability), `Inspiration Board content model missing capability ${capability}.`);
  }

  assert(state.inspirationBoards.id === "DV-04", "Inspiration Board Library ID must be DV-04.");
  assert(state.inspirationBoards.title === "Inspiration Board Library", "DV-04 title must be Inspiration Board Library.");
  assert(state.inspirationBoards.status === "Draft", "DV-04 must remain Draft.");
  assert(state.inspirationBoards.workspaceRoute === "/experience-design/inspiration-boards", "DV-04 workspace route must be /experience-design/inspiration-boards.");
  const expectedCategories = ["Universe", "Galaxy", "Sector", "Star System", "Planet", "Moon", "Colony", "Civilization", "Architecture", "Megastructures", "Discovery", "Research", "Population", "Economy", "Logistics", "AI", "Interface", "HUD", "Navigation", "Loading", "Main Menu", "Settings", "Studio", "Typography", "Lighting", "Color", "Materials", "Motion", "Brand", "Marketing", "Website", "Steam", "Trailers", "Photography", "NASA", "Engineering", "Natural Phenomena"];
  assert(state.inspirationBoards.categories.map((category) => category.title).join("|") === expectedCategories.join("|"), "DV-04 categories must match the canonical list.");
  assert(state.inspirationBoards.boards.length === expectedCategories.length, "DV-04 must create one starter board per canonical category.");
  const expectedAnnotations = ["Lighting", "Color", "Composition", "Geometry", "Atmosphere", "Scale", "Materials", "Motion ideas", "Typography", "Negative space", "Visual rhythm", "Interaction inspiration"];
  assert(state.inspirationBoards.annotationCategories.join("|") === expectedAnnotations.join("|"), "DV-04 annotation categories must match the canonical list.");
  for (const target of ["Experience Bible Chapters", "Visual DNA Sections", "Screen Definitions", "Design Tokens", "Materials", "Motion Definitions", "Components", "Themes", "Brand Guidance", "Concept Art", "Future Tasks"]) {
    assert(state.inspirationBoards.relationshipTargets.includes(target), `DV-04 relationship targets missing ${target}.`);
  }
  for (const mode of ["Infinite Canvas", "Masonry", "Canvas", "Free Placement", "Clustering", "Presentation Mode"]) {
    assert(state.inspirationBoards.viewModes.includes(mode), `DV-04 view modes missing ${mode}.`);
  }
  assert(state.inspirationBoards.presentationMode.enabled, "DV-04 presentation mode must be enabled.");
  for (const purpose of ["creative reviews", "art direction", "team discussions", "design workshops"]) {
    assert(state.inspirationBoards.presentationMode.purpose.includes(purpose), `DV-04 presentation mode missing ${purpose}.`);
  }
  for (const dimension of ["Hope", "Wonder", "Scale", "Civilization", "Discovery", "Architecture", "Atmosphere", "Light", "Calm", "Engineering"]) {
    assert(state.inspirationBoards.scoreDimensions.includes(dimension), `DV-04 scoring dimensions missing ${dimension}.`);
  }
  for (const tag of ["Monumental Civilization", "Universe First", "Celestial Geometry", "Light Represents Progress", "Calm Intelligence", "Civilization Gold", "Hopeful Futurism"]) {
    assert(state.inspirationBoards.signatureTags.includes(tag), `DV-04 signature tags missing ${tag}.`);
  }
  for (const importSource of ["Asset Library", "Dropbox", "Local Upload", "Generated Concepts", "Approved Marketing Assets"]) {
    assert(state.inspirationBoards.importSources.includes(importSource), `DV-04 import sources missing ${importSource}.`);
  }
  for (const performance of ["lazy images", "virtualized masonry", "responsive images", "responsive previews", "deferred loading", "fast search", "future thousands of images"]) {
    assert(state.inspirationBoards.performanceRequirements.includes(performance), `DV-04 performance requirement missing ${performance}.`);
  }
  for (const accessibility of ["keyboard navigation", "screen readers", "zoom", "reduced motion", "high contrast"]) {
    assert(state.inspirationBoards.accessibilityRequirements.includes(accessibility), `DV-04 accessibility requirement missing ${accessibility}.`);
  }
  for (const board of state.inspirationBoards.boards) {
    assert(board.experienceBibleReferences.length > 0, `Inspiration Board ${board.id} must link to Experience Bible guidance.`);
    assert(board.visualDnaReferences.length > 0, `Inspiration Board ${board.id} must link to Visual DNA guidance.`);
    assert(board.history.length > 0, `Inspiration Board ${board.id} must include history.`);
    assert(board.annotationCategories.length === expectedAnnotations.length, `Inspiration Board ${board.id} must support all annotation categories.`);
    assert(board.relationships.some((relationship) => relationship.targetId === "DV-03"), `Inspiration Board ${board.id} must link to DV-03.`);
  }
  const websiteBoard = state.inspirationBoards.boards.find((board) => board.id === "inspiration-board-website");
  assert(websiteBoard, "Website Inspiration Board must exist.");
  assert(websiteBoard.owner === "Brand Direction", "Website Inspiration Board must be a Brand Reference Board.");
  assert(websiteBoard.status === "In Review", "Website Inspiration Board should begin In Review for approved noveris.life references.");

  assert(exists("app/experience-design/page.tsx"), "Experience Design dashboard route is missing.");
  assert(exists("app/experience-design/[section]/page.tsx"), "Experience Design section route is missing.");
  assert(read("components/app-shell.tsx").includes('id: "experience-design"'), "Sidebar must expose Experience Design as a primary workspace.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/bible"'), "Sidebar must link to Experience Bible.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/inspiration-boards"'), "Sidebar must link to Inspiration Boards.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/screens"'), "Sidebar must link to Screen Library.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/tokens"'), "Sidebar must link to Design Tokens.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/materials"'), "Sidebar must link to Material Library.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/motion"'), "Sidebar must link to Motion Library.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/components"'), "Sidebar must link to Component Library.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/patterns"'), "Sidebar must link to Interaction Patterns.");
  assert(read("app/experience-design/[section]/page.tsx").includes('redirect("/experience-design/inspiration-boards")'), "Old mood board route must redirect to Inspiration Boards.");
  assert(read("app/experience-design/page.tsx").includes("ExperienceDesignWorkspace"), "Experience Design Home must render the shared workspace.");
  assert(read("app/experience-design/[section]/page.tsx").includes("initialSection={section}"), "Experience Design section routes must pass the requested content workspace directly.");
  assert(read("components/studio-command-palette.tsx").includes("Open Experience Design"), "Command palette must expose Experience Design.");
  assert(read("components/studio-command-palette.tsx").includes("Open Inspiration Boards"), "Command palette must expose Inspiration Boards.");
  assert(read("components/studio-command-palette.tsx").includes("Open Screen Library"), "Command palette must expose Screen Library.");
  assert(read("components/studio-command-palette.tsx").includes("Open Design Tokens"), "Command palette must expose Design Tokens.");
  assert(read("components/studio-command-palette.tsx").includes("Open Material Library"), "Command palette must expose Material Library.");
  assert(read("components/studio-command-palette.tsx").includes("Open Motion Library"), "Command palette must expose Motion Library.");
  assert(read("components/studio-command-palette.tsx").includes("Open Component Library"), "Command palette must expose Component Library.");
  assert(read("components/studio-command-palette.tsx").includes("Open Interaction Patterns"), "Command palette must expose Interaction Patterns.");
  const experienceWorkspaceSource = read("components/experience-design-workspace.tsx");
  assert(experienceWorkspaceSource.includes("InspirationBoardsWorkspace"), "Experience Design workspace must expose Inspiration Boards workspace.");
  assert(experienceWorkspaceSource.includes("Experience Design Home"), "Experience Design must have a dedicated Home for dashboard-style widgets.");
  assert(experienceWorkspaceSource.includes("Content First Workspace"), "Experience Design section routes must use content-first workspace entry.");
  assert(experienceWorkspaceSource.includes("if (!isHome)"), "Experience Design must bypass dashboard chrome for individual workspaces.");
  assert(experienceWorkspaceSource.includes("NOVERIS Inspiration Wall"), "Inspiration Boards must open into the NOVERIS Inspiration Wall canvas.");
  assert(experienceWorkspaceSource.includes("Inspiration Board infinite masonry canvas"), "Inspiration Boards must expose an infinite masonry canvas region.");
  assert(experienceWorkspaceSource.includes("Creative reference wall"), "Inspiration Boards must frame the canvas as a creative reference wall.");
  assert(experienceWorkspaceSource.includes("columns-1 gap-5") && experienceWorkspaceSource.includes("break-inside-avoid"), "Inspiration Boards must use a masonry-style visual canvas.");
  for (const toolbarAction of ["Upload", "Color", "Note", "Text", "Link", "Draw", "Zoom", "Present"]) {
    assert(experienceWorkspaceSource.includes(toolbarAction), `Inspiration Board floating toolbar missing ${toolbarAction}.`);
  }
  assert(experienceWorkspaceSource.includes("Civilization Gold"), "Inspiration Boards must include color cards.");
  assert(experienceWorkspaceSource.includes("accent.civilization.gold"), "Inspiration Boards must expose token relationship notes on color cards.");
  assert(experienceWorkspaceSource.includes("Typography Card"), "Inspiration Boards must include typography cards.");
  for (const entryLabel of ["Token Browser", "Material Gallery", "Motion Library", "Component Browser", "Pattern Browser", "Screen Gallery"]) {
    assert(experienceWorkspaceSource.includes(entryLabel), `Experience Design content-first workspace missing ${entryLabel}.`);
  }
  assert(!experienceWorkspaceSource.includes('WorkspacePanel title="Board Categories"'), "Inspiration Boards must not render a database-style Board Categories panel.");
  assert(!experienceWorkspaceSource.includes('WorkspacePanel title="Annotations, Relationships, and Review"'), "Inspiration Boards must not render a permanent metadata inspector panel.");
  assert(!experienceWorkspaceSource.includes('WorkspaceMiniStat label="References"'), "Inspiration Board cards must not expose database metadata blocks by default.");
  assert(!experienceWorkspaceSource.includes('WorkspacePanel title="Semantic Libraries"'), "Design Tokens must not open with a dashboard-style Semantic Libraries panel.");
  assert(!experienceWorkspaceSource.includes('WorkspacePanel title="Material Categories"'), "Material Library must not open with a dashboard-style categories panel.");
  assert(!experienceWorkspaceSource.includes('WorkspacePanel title="Motion Categories"'), "Motion Library must not open with a dashboard-style categories panel.");
  assert(!experienceWorkspaceSource.includes('WorkspacePanel title="Component Categories"'), "Component Library must not open with a dashboard-style categories panel.");
  assert(!experienceWorkspaceSource.includes('WorkspacePanel title="Pattern Categories"'), "Pattern Library must not open with a dashboard-style categories panel.");
  assert(!experienceWorkspaceSource.includes('WorkspacePanel title="Screen Categories"'), "Screen Library must not open with a dashboard-style categories panel.");
  assert(read("components/experience-design-workspace.tsx").includes("ScreenLibraryWorkspace"), "Experience Design workspace must expose Screen Library workspace.");
  assert(experienceWorkspaceSource.includes("DesignTokensWorkspace"), "Experience Design workspace must expose Design Tokens workspace.");
  assert(experienceWorkspaceSource.includes("MaterialsWorkspace"), "Experience Design workspace must expose Materials workspace.");
  assert(experienceWorkspaceSource.includes("MotionWorkspace"), "Experience Design workspace must expose Motion workspace.");
  assert(experienceWorkspaceSource.includes("ComponentLibraryWorkspace"), "Experience Design workspace must expose Component Library workspace.");
  assert(experienceWorkspaceSource.includes("InteractionPatternsWorkspace"), "Experience Design workspace must expose Interaction Patterns workspace.");
  const bibleWorkspaceSource = read("components/experience-bible-workspace.tsx");
  assert(bibleWorkspaceSource.includes("readingChapter"), "Experience Bible landing must select a current chapter for reading mode.");
  assert(bibleWorkspaceSource.includes("table of contents stays beside the current chapter"), "Experience Bible must describe its content-first reading mode.");
  assert(!bibleWorkspaceSource.includes('{ label: "Release", value:'), "Experience Bible header must not open with dashboard statistics.");

  const search = await searchStudio("Inspiration Boards", 10);
  assert(search.results.some((result) => result.type === "Experience Design" && /Inspiration Boards|Inspiration Board/i.test(result.title)), "Global search must return Experience Design Inspiration Board results.");
  assert(search.diagnostics.sourceCollections.includes("experience design"), "Global search diagnostics must include Experience Design source collection.");
  const bibleSearch = await searchStudio("Technology serves humanity", 20);
  assert(bibleSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/bible/chapter/core-creative-philosophy"), "Global search must return authored Experience Bible philosophy content.");
  const signatureSearch = await searchStudio("The NOVERIS Signature", 20);
  assert(signatureSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/bible#dv-02c-noveris-signature"), "Global search must return DV-02C NOVERIS Signature content.");
  const visualDnaSearch = await searchStudio("Deep Space Navy", 20);
  assert(visualDnaSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/bible#dv-03-visual-dna"), "Global search must return DV-03 Visual DNA content.");
  const nasaSearch = await searchStudio("NASA", 20);
  assert(nasaSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/inspiration-boards")), "Global search must return NASA Inspiration Board content.");
  const boardSearch = await searchStudio("Light Represents Progress", 20);
  assert(boardSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/inspiration-boards")), "Global search must return signature-tagged Inspiration Board content.");
  const tokenSearch = await searchStudio("accent.civilization.gold", 20);
  assert(tokenSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/tokens#accent.civilization.gold"), "Global search must return exact DS-02 token results.");
  const glassTokenSearch = await searchStudio("surface command glass", 20);
  assert(glassTokenSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/tokens#surface.command.glass")), "Global search must return semantic glass token results.");
  const motionTokenSearch = await searchStudio("motion fade standard", 20);
  assert(motionTokenSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/tokens#motion.fade.standard")), "Global search must return semantic motion token results.");
  const materialSearch = await searchStudio("Command Glass", 20);
  assert(materialSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/materials#material-glass-command-glass"), "Global search must return exact DS-03 material results.");
  const energyMaterialSearch = await searchStudio("Civilization Energy", 20);
  assert(energyMaterialSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/materials#material-energy-civilization-energy")), "Global search must return semantic energy material results.");
  const scanningMaterialSearch = await searchStudio("Scanning related token", 20);
  assert(scanningMaterialSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/materials#material-special-scanning")), "Global search must return interaction material results.");
  const motionSearchExact = await searchStudio("motion.discovery.reveal", 20);
  assert(motionSearchExact.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/motion#motion.discovery.reveal"), "Global search must return exact DS-04 motion results.");
  const galaxyMotionSearch = await searchStudio("galaxy travel through space", 20);
  assert(galaxyMotionSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/motion#motion.galaxy.travel")), "Global search must return galaxy motion results.");
  const accessibilityMotionSearch = await searchStudio("Reduced Motion Alternative Feedback", 20);
  assert(accessibilityMotionSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/motion#")), "Global search must return accessibility motion results.");
  const componentSearch = await searchStudio("Primary Command Button", 20);
  assert(componentSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/components#component.command.primary-command-button"), "Global search must return exact DS-05 component results.");
  const componentAccessibilitySearch = await searchStudio("Screen Reader Localization component", 20);
  assert(componentAccessibilitySearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/components#")), "Global search must return accessibility component results.");
  const navigationComponentSearch = await searchStudio("Navigation Rail orientation", 20);
  assert(navigationComponentSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/components#component.navigation.navigation-rail")), "Global search must return navigation component results.");
  const patternSearch = await searchStudio("pattern.navigation.navigation-rail", 20);
  assert(patternSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/patterns#pattern.navigation.navigation-rail"), "Global search must return exact DS-05A pattern results.");
  const patternFlowSearch = await searchStudio("Failure States Recovery pattern", 80);
  assert(patternFlowSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/patterns#")), "Global search must return interaction flow pattern results.");
  const designContractSearch = await searchStudio("Missing Tokens Missing Components design contracts", 20);
  assert(designContractSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/patterns")), "Global search must return design contract pattern results.");
  const screenSearch = await searchStudio("screen.universe.galaxy", 20);
  assert(screenSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/screens#screen.universe.galaxy"), "Global search must return exact DS-06 screen results.");
  const screenCompositionSearch = await searchStudio("Component Tree Accessibility Preview Screen Library", 20);
  assert(screenCompositionSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/screens")), "Global search must return screen composition results.");
  const screenContractSearch = await searchStudio("Orphaned Screens Broken Screen Graphs", 20);
  assert(screenContractSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/screens")), "Global search must return screen contract results.");

  const canonicalRuntime = await buildCanonicalRuntimeExportPayload();
  assertNoExperienceRuntimeLeak("Canonical runtime", canonicalRuntime);

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of engineExports.entries()) {
    assert(engineExport.metadata.validationStatus === "Ready", `${targets[index]} export must remain Ready.`);
    assertNoExperienceRuntimeLeak(`${targets[index]} export`, engineExport);
  }

  console.log(JSON.stringify({
    ok: true,
    frameworkId: state.frameworkId,
    version: state.version,
    sections: state.sections.length,
    contentModels: state.contentModels.length,
    records: state.records.length,
    reviewWorkflow: state.reviewWorkflow,
    searchReturned: search.returned,
    bibleSearchReturned: bibleSearch.returned,
    signatureSearchReturned: signatureSearch.returned,
    visualDnaSearchReturned: visualDnaSearch.returned,
    inspirationBoards: {
      categories: state.inspirationBoards.categories.length,
      boards: state.inspirationBoards.boards.length,
      annotations: state.inspirationBoards.annotationCategories.length,
      viewModes: state.inspirationBoards.viewModes
    },
    designTokens: {
      id: state.designTokens.id,
      version: state.designTokens.version,
      status: state.designTokens.status,
      libraries: state.designTokens.libraries.length,
      tokens: state.designTokens.tokens.length,
      implementationValuesPublished: state.designTokens.implementationValuesPublished
    },
    materials: {
      id: state.materials.id,
      version: state.materials.version,
      status: state.materials.status,
      categories: state.materials.categories.length,
      materials: state.materials.materials.length,
      previewSupport: state.materials.previewSupport.length
    },
    motion: {
      id: state.motion.id,
      version: state.motion.version,
      status: state.motion.status,
      categories: state.motion.categories.length,
      motions: state.motion.motions.length,
      cameraLanguage: state.motion.cameraLanguage.length,
      previewSupport: state.motion.previewSupport.length
    },
    componentLibrary: {
      id: state.componentLibrary.id,
      version: state.componentLibrary.version,
      status: state.componentLibrary.status,
      categories: state.componentLibrary.categories.length,
      components: state.componentLibrary.components.length,
      states: state.componentLibrary.states.length,
      sizes: state.componentLibrary.sizes.length,
      previewSupport: state.componentLibrary.previewSupport.length
    },
    interactionPatterns: {
      id: state.interactionPatterns.id,
      version: state.interactionPatterns.version,
      status: state.interactionPatterns.status,
      categories: state.interactionPatterns.categories.length,
      patterns: state.interactionPatterns.patterns.length,
      designContracts: state.interactionPatterns.designContracts.status,
      previewSupport: state.interactionPatterns.previewSupport.length
    },
    screenLibrary: {
      id: state.screenLibrary.id,
      version: state.screenLibrary.version,
      status: state.screenLibrary.status,
      categories: state.screenLibrary.categories.length,
      screens: state.screenLibrary.screens.length,
      designContracts: state.screenLibrary.designContracts.status,
      previewSupport: state.screenLibrary.previewSupport.length
    },
    inspirationSearchReturned: search.returned,
    nasaSearchReturned: nasaSearch.returned,
    boardSearchReturned: boardSearch.returned,
    tokenSearchReturned: tokenSearch.returned,
    glassTokenSearchReturned: glassTokenSearch.returned,
    motionTokenSearchReturned: motionTokenSearch.returned,
    materialSearchReturned: materialSearch.returned,
    energyMaterialSearchReturned: energyMaterialSearch.returned,
    scanningMaterialSearchReturned: scanningMaterialSearch.returned,
    motionSearchReturned: motionSearchExact.returned,
    galaxyMotionSearchReturned: galaxyMotionSearch.returned,
    accessibilityMotionSearchReturned: accessibilityMotionSearch.returned,
    componentSearchReturned: componentSearch.returned,
    componentAccessibilitySearchReturned: componentAccessibilitySearch.returned,
    navigationComponentSearchReturned: navigationComponentSearch.returned,
    patternSearchReturned: patternSearch.returned,
    patternFlowSearchReturned: patternFlowSearch.returned,
    designContractSearchReturned: designContractSearch.returned,
    screenSearchReturned: screenSearch.returned,
    screenCompositionSearchReturned: screenCompositionSearch.returned,
    screenContractSearchReturned: screenContractSearch.returned,
    runtimePublishing: state.runtimePublishing,
    engineExports: Object.fromEntries(engineExports.map((engineExport, index) => [targets[index], engineExport.metadata.validationStatus]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

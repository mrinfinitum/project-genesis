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
  assert(!/"experience_bible"\s*:/.test(text), `${label} leaked Experience Bible model data.`);
  assert(!/"mood_board"\s*:/.test(text), `${label} leaked Mood Board model data.`);
  assert(!text.includes("Inspiration Board Library"), `${label} leaked DV-04 Inspiration Board data.`);
  assert(!text.includes("DS-02"), `${label} leaked DS-02 Design Token data.`);
  assert(!text.includes("Canonical Design Tokens"), `${label} leaked Canonical Design Token data.`);
  assert(!text.includes("DS-03"), `${label} leaked DS-03 Material Library data.`);
  assert(!text.includes("Canonical Material Library"), `${label} leaked Canonical Material Library data.`);
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

  for (const section of ["bible", "inspiration-boards", "concepts", "screens", "tokens", "materials", "motion", "components", "themes", "brand", "accessibility", "journey", "reviews"]) {
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
  for (const mode of ["Grid", "Masonry", "Canvas", "Presentation Mode"]) {
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
  for (const performance of ["lazy images", "virtualized grids", "responsive previews", "deferred loading", "fast search"]) {
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
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/tokens"'), "Sidebar must link to Design Tokens.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/materials"'), "Sidebar must link to Material Library.");
  assert(read("app/experience-design/[section]/page.tsx").includes('redirect("/experience-design/inspiration-boards")'), "Old mood board route must redirect to Inspiration Boards.");
  assert(read("components/studio-command-palette.tsx").includes("Open Experience Design"), "Command palette must expose Experience Design.");
  assert(read("components/studio-command-palette.tsx").includes("Open Inspiration Boards"), "Command palette must expose Inspiration Boards.");
  assert(read("components/studio-command-palette.tsx").includes("Open Design Tokens"), "Command palette must expose Design Tokens.");
  assert(read("components/studio-command-palette.tsx").includes("Open Material Library"), "Command palette must expose Material Library.");
  assert(read("components/experience-design-workspace.tsx").includes("InspirationBoardsWorkspace"), "Experience Design workspace must expose Inspiration Boards workspace.");
  assert(read("components/experience-design-workspace.tsx").includes("DesignTokensWorkspace"), "Experience Design workspace must expose Design Tokens workspace.");
  assert(read("components/experience-design-workspace.tsx").includes("MaterialsWorkspace"), "Experience Design workspace must expose Materials workspace.");

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
    inspirationSearchReturned: search.returned,
    nasaSearchReturned: nasaSearch.returned,
    boardSearchReturned: boardSearch.returned,
    tokenSearchReturned: tokenSearch.returned,
    glassTokenSearchReturned: glassTokenSearch.returned,
    motionTokenSearchReturned: motionTokenSearch.returned,
    materialSearchReturned: materialSearch.returned,
    energyMaterialSearchReturned: energyMaterialSearch.returned,
    scanningMaterialSearchReturned: scanningMaterialSearch.returned,
    runtimePublishing: state.runtimePublishing,
    engineExports: Object.fromEntries(engineExports.map((engineExport, index) => [targets[index], engineExport.metadata.validationStatus]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

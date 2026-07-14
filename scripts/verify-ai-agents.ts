import { aiAgentDerivativePresetIds, aiAgentInitialRecords, aiAgentRuntimeStates, aiAgentStates, defaultAiAgentId, getAiAgentLibraryState, validateAiAgentLibrary } from "@/lib/ai-agents";
import { derivativePresets, derivativeProfiles, getAssetProductionState, requirementProfiles } from "@/lib/assets/asset-production";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { getComponentLibraryState } from "@/lib/component-library";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [assetState, componentState, runtime] = await Promise.all([
    getAssetProductionState(),
    getComponentLibraryState(),
    buildCanonicalRuntimeExportPayload()
  ]);
  const aiAgentState = await getAiAgentLibraryState(assetState);
  const validation = validateAiAgentLibrary(aiAgentState);
  assert(validation.valid, `AI Agent Library validation failed: ${validation.issues.join("; ")}`);

  assert(aiAgentState.records.length >= 2, "Expected seeded AI agent records.");
  assert(aiAgentInitialRecords.length === aiAgentState.records.length, "Initial AI agent count diverged from resolved state.");

  const presetIds = new Set(derivativePresets.map((preset) => preset.id));
  for (const presetId of aiAgentDerivativePresetIds) {
    assert(presetIds.has(presetId), `Missing AI agent derivative preset ${presetId}.`);
  }

  const profile = derivativeProfiles.find((item) => item.id === "ai_agents");
  assert(profile, "Missing AI agent derivative profile.");
  assert(profile.masterFormats.includes("PSD") && profile.masterFormats.includes("PNG"), "AI agent profile must accept PSD and PNG sources.");
  for (const presetId of aiAgentDerivativePresetIds) {
    assert(profile.presetIds.includes(presetId), `AI agent profile does not include ${presetId}.`);
  }

  const requirementProfile = requirementProfiles.find((item) => item.id === "ai_agent_requirement_profile");
  assert(requirementProfile, "Missing AI agent requirement profile.");
  for (const size of [64, 96, 128, 256, 512, 1024]) {
    assert(requirementProfile.requirements.some((requirement) => requirement.presetId === `ai_agent_${size}_png`), `Missing AI agent ${size} requirement.`);
  }

  const componentIds = new Set(componentState.records.map((record) => record.componentId));
  for (const componentId of ["AiAgentPortrait", "AiAgentPanel", "AiAgentStatus", "AiAgentSelector", "AiAgentCard", "AiAgentExpressionPreview", "AiAgentBlinkPreview"]) {
    assert(componentIds.has(componentId), `Component Library is missing ${componentId}.`);
  }
  const portrait = componentState.records.find((record) => record.componentId === "AiAgentPortrait");
  assert(portrait?.dataInputs.some((input) => input.id === "aiAgentId" && input.classification === "Canonical Studio Definition"), "AiAgentPortrait must consume canonical aiAgentId.");
  const autoClick = componentState.records.find((record) => record.componentId === "AutoClickControl");
  assert(autoClick?.dataInputs.some((input) => input.id === "aiAgentId"), "AutoClickControl must consume aiAgentId.");
  assert(!JSON.stringify(autoClick).toLowerCase().includes("fixed robot png"), "AutoClickControl must not describe a fixed robot PNG.");

  assert(runtime.metadata.contentVersion >= 12, "Runtime contentVersion must be bumped for published AI Agent definitions.");
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  assert(runtime.defaultAiAgentId === defaultAiAgentId, "Runtime defaultAiAgentId must be AI-AGENT-DEFAULT.");
  assert(runtime.aiAgentSaveSchema.selectedAiAgentIdDefault === defaultAiAgentId, "AI Agent save schema default must resolve.");
  assert(runtime.automationPresentation.displayName === "AI Agent", "Automation presentation display name must be AI Agent.");
  assert(runtime.automationPresentation.powerLabel === "Labor Assistance", "Automation presentation power label must be Labor Assistance.");
  assert(runtime.automationPresentation.enabledLabel === "Agent Online", "Automation presentation enabled label must be Agent Online.");
  assert(runtime.automationPresentation.disabledLabel === "Agent Offline", "Automation presentation disabled label must be Agent Offline.");
  assert(runtime.aiAgentPersonalities.length >= 8, "Runtime must include future-ready AI Agent personalities.");
  assert(runtime.aiAgentAnimationProfiles.some((profile) => profile.id === "AI-ANIM-BLINK-DEFAULT" && profile.reducedMotionBehavior === "static_open"), "Default blink animation profile is missing.");
  assert(runtime.aiAgents.filter((agent) => agent.defaultForNewPlayers).length === 1, "Runtime must include exactly one default AI Agent.");

  for (const agent of aiAgentState.records) {
    for (const state of aiAgentStates) {
      if (agent.id === defaultAiAgentId) assert(agent.supportedStates.includes(state), `Default AI Agent must support ${state}.`);
    }
    assert(agent.artworkSlots.some((slot) => slot.kind === "head"), `${agent.id} is missing head artwork slot.`);
    assert(agent.artworkSlots.some((slot) => slot.kind === "eyes_open"), `${agent.id} is missing open-eye artwork slot.`);
    assert(agent.artworkSlots.some((slot) => slot.kind === "eyes_blink"), `${agent.id} is missing blink artwork slot.`);
    assert(agent.artworkSlots.some((slot) => slot.kind === "eyes_closed"), `${agent.id} is missing offline artwork slot.`);
    assert(agent.artworkSlots.some((slot) => slot.kind === "idle_animation"), `${agent.id} is missing idle animation slot.`);
    assert(agent.artworkSlots.some((slot) => slot.kind === "blink_animation"), `${agent.id} is missing blink animation slot.`);
    assert(agent.expressionVariants.length > 0, `${agent.id} is missing expression variants.`);
    for (const state of aiAgentRuntimeStates) {
      if (agent.id === defaultAiAgentId) assert(agent.expressionVariants.some((variant) => variant.id === state), `Default AI Agent is missing ${state} expression metadata.`);
    }
    assert(agent.dialogueProfile.greeting.length > 0, `${agent.id} is missing dialogue profile.`);
    assert(agent.voiceProfile.status === "Future" || agent.voiceProfile.voiceKey, `${agent.id} voice profile must stay future or provide a voice key.`);
    assert(!JSON.stringify(agent).includes("/Users/"), `${agent.id} leaked a private local path.`);
    assert(!JSON.stringify(agent).includes("studio-private://"), `${agent.id} leaked a private Studio URI.`);
  }

  console.log(JSON.stringify({
    ok: true,
    agents: aiAgentState.stats.total,
    published: aiAgentState.stats.published,
    missingArtwork: aiAgentState.stats.missingArtwork,
    derivativePresets: aiAgentDerivativePresetIds,
    acceptedSourceFormats: aiAgentState.acceptedSourceFormats,
    componentReferences: [...componentIds].filter((id) => id.startsWith("AiAgent")),
    runtimeContentVersion: runtime.metadata.contentVersion,
    runtimeValidation: runtime.metadata.validationStatus,
    defaultAiAgentId: runtime.defaultAiAgentId,
    assetProductionAssets: assetState.assets.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

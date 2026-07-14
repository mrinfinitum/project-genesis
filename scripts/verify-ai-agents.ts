import { aiAgentDerivativePresetIds, aiAgentInitialRecords, aiAgentStates, getAiAgentLibraryState, validateAiAgentLibrary } from "@/lib/ai-agents";
import { derivativePresets, derivativeProfiles, getAssetProductionState, requirementProfiles } from "@/lib/assets/asset-production";
import { getComponentLibraryState } from "@/lib/component-library";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [assetState, componentState] = await Promise.all([
    getAssetProductionState(),
    getComponentLibraryState()
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
    assert(requirementProfile.requirements.some((requirement) => requirement.derivativeType === `ai_agent_${size}`), `Missing AI agent ${size} requirement.`);
  }

  const componentIds = new Set(componentState.records.map((record) => record.componentId));
  assert(componentIds.has("AIAgentPortrait"), "Component Library is missing AIAgentPortrait.");
  assert(componentIds.has("AIAgentStatusBadge"), "Component Library is missing AIAgentStatusBadge.");
  const portrait = componentState.records.find((record) => record.componentId === "AIAgentPortrait");
  assert(portrait?.dataInputs.some((input) => input.id === "aiAgentId" && input.classification === "Canonical Studio Definition"), "AIAgentPortrait must consume canonical aiAgentId.");
  const autoClick = componentState.records.find((record) => record.componentId === "AutoClickControl");
  assert(autoClick?.dataInputs.some((input) => input.id === "aiAgentId"), "AutoClickControl must consume aiAgentId.");
  assert(!JSON.stringify(autoClick).toLowerCase().includes("fixed robot png"), "AutoClickControl must not describe a fixed robot PNG.");

  for (const agent of aiAgentState.records) {
    for (const state of aiAgentStates) {
      if (agent.id === "ai_agent_nova") assert(agent.supportedStates.includes(state), `NOVA must support ${state}.`);
    }
    assert(agent.artworkSlots.some((slot) => slot.kind === "head"), `${agent.id} is missing head artwork slot.`);
    assert(agent.artworkSlots.some((slot) => slot.kind === "eyes"), `${agent.id} is missing eye artwork slot.`);
    assert(agent.artworkSlots.some((slot) => slot.kind === "idle_animation"), `${agent.id} is missing idle animation slot.`);
    assert(agent.artworkSlots.some((slot) => slot.kind === "blink_animation"), `${agent.id} is missing blink animation slot.`);
    assert(agent.expressionVariants.length > 0, `${agent.id} is missing expression variants.`);
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
    componentReferences: [...componentIds].filter((id) => id.startsWith("AIAgent")),
    assetProductionAssets: assetState.assets.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

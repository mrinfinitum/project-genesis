import type { ImportIssue, LaborGenerationFramework } from "@/types/runtime";

export const laborGenerationFramework: LaborGenerationFramework = {
  id: "labor_generation_framework_v1",
  version: "1.1.0",
  architectureDecisionId: "ARCH-DECISION-LABOR-FIRST-ECONOMY",
  economyId: "ECON-LABOR",
  populationEconomyId: "ECON-POPULATION",
  actionSystemId: "canonical_action_system_v1",
  ownership: {
    studioOwns: ["labor source definitions", "formulas", "modifier contracts", "upgrade effects", "progression intent", "validation", "runtime publication"],
    gameOwns: ["player balances", "click events", "AI state", "population state", "workforce assignments", "offline timestamps", "Action instances", "save migration"]
  },
  sources: [
    {
      id: "manual_labor",
      displayName: "Manual Labor",
      economyId: "ECON-LABOR",
      productionMode: "per_click",
      producerIds: ["producer_labor_manual_click"],
      offlineEligible: false,
      unlockRule: "Available from Survival; remains optional after automated sources become dominant.",
      formula: "manualLabor = validClicks * (baseClick + clickUpgradeBonuses) * approvedClickMultipliers",
      modifierIds: ["click_upgrades", "civilization_bonuses", "events"],
      notes: "The click ring and click button must invoke the same Labor action."
    },
    {
      id: "ai_assisted_labor",
      displayName: "AI Assisted Labor",
      economyId: "ECON-LABOR",
      productionMode: "per_second",
      producerIds: ["producer_labor_ai_agent_assistance"],
      offlineEligible: true,
      unlockRule: "Requires canonical automation unlock and an online AI Assistant; offline production requires offline automation eligibility.",
      formula: "aiAssistedLabor = aiBaseRate * aiLevelMultiplier * researchMultiplier * automationMultiplier * civilizationMultiplier",
      modifierIds: ["ai_assistant_upgrades", "research", "automation", "ai_agents", "civilization_bonuses"],
      notes: "AI Assisted Labor replaces autoclicker semantics; cosmetic AI variants do not change output."
    },
    {
      id: "workforce_labor",
      displayName: "Workforce Labor",
      economyId: "ECON-LABOR",
      productionMode: "assigned_capacity",
      producerIds: ["producer_labor_base_passive"],
      offlineEligible: true,
      unlockRule: "Available when Population can participate in the eligible workforce; the Survival +1/sec baseline is the compatibility-floor workforce contribution.",
      formula: "workforceLabor = availableEligibleWorkforce * laborPerWorker * workforceEfficiency * approvedMultipliers",
      modifierIds: ["population_growth", "education", "health", "policies", "buildings", "research", "discoveries", "events"],
      notes: "Population is capacity, not currency. Assigned Labor is consumed or reserved by canonical Actions."
    }
  ],
  workforceConversion: {
    stages: ["population", "eligible_workforce", "available_workforce_labor", "assigned_labor"],
    populationSpendable: false,
    formula: "eligibleWorkforce = floor(population * eligibilityRate); availableWorkforceLabor = max(0, eligibleWorkforce - assignedWorkforce)",
    assignmentRule: "The Game assigns available workforce to canonical Actions; assignment never spends or destroys Population."
  },
  availableLaborFormula: "availableLabor = manualLabor + aiAssistedLabor + workforceLabor - assignedLabor",
  modifiers: [
    { id: "click_upgrades", sourceSystem: "upgrades", appliesTo: ["manual_labor"], operation: "add", notes: "Raises Labor per valid click." },
    { id: "ai_assistant_upgrades", sourceSystem: "ai_agents", appliesTo: ["ai_assisted_labor"], operation: "multiply", notes: "Raises AI generation after automation unlock." },
    { id: "population_growth", sourceSystem: "population", appliesTo: ["workforce_labor"], operation: "increase_capacity", notes: "Expands potential eligible workforce." },
    { id: "research", sourceSystem: "research", appliesTo: ["ai_assisted_labor", "workforce_labor"], operation: "multiply", notes: "Improves approved labor production or efficiency." },
    { id: "buildings", sourceSystem: "buildings", appliesTo: ["workforce_labor"], operation: "add", notes: "Adds structured production and workforce effects." },
    { id: "ai_agents", sourceSystem: "ai_agents", appliesTo: ["ai_assisted_labor"], operation: "multiply", notes: "Uses canonical capability, not cosmetic rarity." },
    { id: "education", sourceSystem: "population", appliesTo: ["workforce_labor"], operation: "multiply", notes: "Improves workforce efficiency." },
    { id: "health", sourceSystem: "population", appliesTo: ["workforce_labor"], operation: "multiply", notes: "Improves workforce eligibility and continuity." },
    { id: "policies", sourceSystem: "civilization", appliesTo: ["workforce_labor"], operation: "multiply", notes: "Applies canonical civilization policy effects." },
    { id: "automation", sourceSystem: "automation", appliesTo: ["ai_assisted_labor", "workforce_labor"], operation: "multiply", notes: "Increases automated output without autoclick simulation." },
    { id: "civilization_bonuses", sourceSystem: "civilization", appliesTo: ["manual_labor", "ai_assisted_labor", "workforce_labor"], operation: "multiply", notes: "Applies approved civilization-wide bonuses." },
    { id: "discoveries", sourceSystem: "discovery", appliesTo: ["workforce_labor"], operation: "multiply", notes: "Applies explicit discovery rewards only." },
    { id: "events", sourceSystem: "events", appliesTo: ["manual_labor", "ai_assisted_labor", "workforce_labor"], operation: "multiply", notes: "Applies time-bounded canonical event modifiers." }
  ],
  upgradeEffects: [
    { id: "labor_per_click", appliesTo: "manual_labor", operation: "add", notes: "Adds Labor per click." },
    { id: "ai_labor_rate", appliesTo: "ai_assisted_labor", operation: "multiply", notes: "Raises AI Labor generation." },
    { id: "population_labor_rate", appliesTo: "workforce_labor", operation: "multiply", notes: "Raises Labor generated by eligible workforce." },
    { id: "labor_efficiency", appliesTo: "all_labor_sources", operation: "multiply", notes: "Raises effective output in deterministic multiplier order." },
    { id: "action_labor_requirement", appliesTo: "canonical_actions", operation: "reduce_requirement", notes: "Reduces approved Action Labor requirements." },
    { id: "building_labor_requirement", appliesTo: "buildings", operation: "reduce_requirement", notes: "Reduces approved construction and staffing requirements." },
    { id: "research_labor_requirement", appliesTo: "research", operation: "reduce_requirement", notes: "Reduces approved research Action requirements." },
    { id: "exploration_labor_requirement", appliesTo: "exploration", operation: "reduce_requirement", notes: "Reduces approved exploration Action requirements." },
    { id: "maximum_available_labor", appliesTo: "available_labor", operation: "increase_capacity", notes: "Raises assignable Labor capacity." },
    { id: "automated_labor", appliesTo: "ai_assisted_labor", operation: "add", notes: "Adds approved automated Labor production." }
  ],
  progressionPhases: [
    { id: "early", primarySources: ["manual_labor"], playerRole: "I am building", flow: ["clicks", "Labor", "Actions", "resources", "buildings"] },
    { id: "mid", primarySources: ["ai_assisted_labor", "workforce_labor"], playerRole: "We are building", flow: ["AI Assistant", "Population", "Labor", "Actions", "growth"] },
    { id: "late", primarySources: ["workforce_labor", "ai_assisted_labor"], playerRole: "Civilization is building itself", flow: ["Population", "Automation", "AI", "allocation", "civilization-scale Actions"] }
  ],
  integrationSystems: ["canonical_action_system_v1", "planet_development_framework_v1", "civilization_identity", "civilization_progression_framework_v1", "population_simulation_framework_v1", "resource_economy_logistics_framework_v1"],
  saveContract: {
    storedBy: "game",
    fields: ["laborBalance", "manualLaborGenerated", "aiLaborGenerated", "workforceLaborGenerated", "eligibleWorkforce", "availableWorkforceLabor", "assignedLabor", "offlineLaborGenerated"],
    migrationRules: ["Do not reset earned Labor.", "Do not spend Population during workforce conversion.", "Preserve established saves and source attribution when available."]
  },
  validationRules: ["Exactly three canonical Labor sources must exist.", "Population remains non-spendable capacity.", "Manual Labor is never offline eligible.", "AI offline Labor requires automation eligibility.", "All assigned Labor must reference canonical Actions.", "Credits are never a Labor source."]
};

export function validateLaborGenerationFramework(contract: LaborGenerationFramework = laborGenerationFramework): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const sourceIds = contract.sources.map((source) => source.id);
  const expected = ["manual_labor", "ai_assisted_labor", "workforce_labor"];
  const duplicate = sourceIds.find((id, index) => sourceIds.indexOf(id) !== index);
  const modifierIds = contract.modifiers.map((modifier) => modifier.id);
  const upgradeIds = contract.upgradeEffects.map((effect) => effect.id);
  const add = (code: string, message: string, records: string[] = []) => issues.push({ severity: "error" as const, code, message, records });
  if (contract.id !== "labor_generation_framework_v1" || contract.version !== "1.1.0") add("labor_framework_identity_invalid", "Labor Generation Framework identity or version is invalid.");
  if (contract.economyId !== "ECON-LABOR" || contract.populationEconomyId !== "ECON-POPULATION") add("labor_framework_economy_invalid", "Labor framework must reference canonical Labor and Population economy IDs.");
  if (sourceIds.join("|") !== expected.join("|") || duplicate) add("labor_sources_invalid", "Labor framework must publish exactly Manual, AI Assisted, and Workforce Labor once and in canonical order.", sourceIds);
  if (contract.sources.find((source) => source.id === "manual_labor")?.offlineEligible) add("manual_labor_offline_invalid", "Manual Labor cannot be earned offline.");
  if (!contract.sources.find((source) => source.id === "ai_assisted_labor")?.unlockRule.includes("automation")) add("ai_labor_unlock_missing", "AI Assisted Labor must require automation eligibility.");
  if (contract.workforceConversion.populationSpendable !== false || !contract.workforceConversion.stages.includes("assigned_labor")) add("workforce_conversion_invalid", "Population must remain non-spendable and workforce conversion must end in assigned Labor.");
  if (!contract.availableLaborFormula.includes("manualLabor") || !contract.availableLaborFormula.includes("aiAssistedLabor") || !contract.availableLaborFormula.includes("workforceLabor")) add("available_labor_formula_invalid", "Available Labor must aggregate all three canonical sources.");
  if (new Set(modifierIds).size !== modifierIds.length) add("labor_modifier_duplicate", "Labor modifier IDs must be unique.", modifierIds);
  if (new Set(upgradeIds).size !== upgradeIds.length) add("labor_upgrade_effect_duplicate", "Labor upgrade effect IDs must be unique.", upgradeIds);
  return issues;
}

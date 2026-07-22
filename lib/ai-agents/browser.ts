import {
  aiLibraryAssignmentRoles,
  aiLibraryCategories,
  aiLibraryPersonalities,
  aiLibraryRarities,
  canonicalAiLibraryAgents
} from "@/lib/ai-agents/foundations";
import type { CanonicalAiLibraryAgent } from "@/types/runtime";

export type AiAgentBrowserRecord = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  rarity: string;
  aiType: string;
  primaryFunction: string;
  secondaryFunction: string;
  personality: string;
  voiceStyle: string;
  origin: string;
  discoveryMethod: string;
  activationMethod: string;
  maxLevel: number;
  libraryIndex: number;
  assignmentRoles: string[];
  runtimeStatus: string;
};

export type AiAgentBrowserState = {
  records: AiAgentBrowserRecord[];
  categories: typeof aiLibraryCategories;
  rarityCatalog: typeof aiLibraryRarities;
  personalityCatalog: typeof aiLibraryPersonalities;
  assignmentRoles: typeof aiLibraryAssignmentRoles;
  selectedDefinition?: CanonicalAiLibraryAgent;
  categoryCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
  rarityCount: number;
  maxLevel: number;
};

const records: AiAgentBrowserRecord[] = canonicalAiLibraryAgents.map((agent) => ({
  id: agent.ai_id,
  name: agent.name,
  description: agent.description,
  categoryId: agent.category_id,
  categoryName: agent.category,
  subcategory: agent.subcategory,
  rarity: agent.rarity,
  aiType: agent.ai_type,
  primaryFunction: agent.primary_function,
  secondaryFunction: agent.secondary_function,
  personality: agent.personality_primary,
  voiceStyle: agent.voice_style,
  origin: agent.origin,
  discoveryMethod: agent.discovery_method,
  activationMethod: agent.activation_method,
  maxLevel: agent.max_level,
  libraryIndex: agent.library_index,
  assignmentRoles: agent.assignment_roles,
  runtimeStatus: agent.runtime_status
}));

const categoryCounts: Record<string, number> = {};
const subcategoryCounts: Record<string, number> = {};
for (const record of records) {
  categoryCounts[record.categoryId] = (categoryCounts[record.categoryId] ?? 0) + 1;
  const key = `${record.categoryId}:${record.subcategory}`;
  subcategoryCounts[key] = (subcategoryCounts[key] ?? 0) + 1;
}

const browserState = {
  records,
  categories: aiLibraryCategories,
  rarityCatalog: aiLibraryRarities,
  personalityCatalog: aiLibraryPersonalities,
  assignmentRoles: aiLibraryAssignmentRoles,
  categoryCounts,
  subcategoryCounts,
  rarityCount: new Set(records.map((record) => record.rarity)).size,
  maxLevel: Math.max(...records.map((record) => record.maxLevel))
} satisfies Omit<AiAgentBrowserState, "selectedDefinition">;

export function getAiAgentBrowserState(activeEntry?: string): AiAgentBrowserState {
  return {
    ...browserState,
    selectedDefinition: activeEntry ? canonicalAiLibraryAgents.find((agent) => agent.ai_id === activeEntry) : undefined
  };
}

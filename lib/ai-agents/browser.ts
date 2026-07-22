import "server-only";

import { canonicalAiLibraryAgents } from "@/lib/ai-agents/foundations";
import { normalizeAiRecord, validateAiBrowserRecords, type AiAgentBrowserState } from "@/lib/ai-agents/browser-utils";

const records = canonicalAiLibraryAgents.map(normalizeAiRecord);
const browserState: AiAgentBrowserState = { records, totalRecords: records.length, validationWarnings: validateAiBrowserRecords(records) };

export function getAiAgentBrowserState(): AiAgentBrowserState { return browserState; }

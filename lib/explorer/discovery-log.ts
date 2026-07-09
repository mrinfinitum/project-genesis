export type DiscoveryObjectType =
  | "galaxy"
  | "sector"
  | "star_system"
  | "planet"
  | "celestial_body"
  | "resource"
  | "anomaly"
  | "colony"
  | "faction"
  | "civilization";

export type TimelineEventType =
  | "sector_detected"
  | "sector_scanned"
  | "star_system_discovered"
  | "planet_scanned"
  | "planet_claimed"
  | "planet_colonized"
  | "colony_founded"
  | "rare_resource_found"
  | "faction_discovered"
  | "research_completed"
  | "intergalactic_travel_unlocked";

export type TimelineImportance = "low" | "medium" | "high" | "legendary";

export type DiscoveryJournalEntry = {
  id: string;
  objectId: string;
  objectType: DiscoveryObjectType;
  objectName: string;
  generatedName?: string;
  displayName?: string;
  discoveryState: string;
  discoveredAt: string;
  discoveredBy: string;
  discoveryPoints: number;
  galaxyId?: string;
  sectorId?: string;
  starSystemId?: string;
  rarity?: string;
  tags: string[];
  notes: string;
};

export type TimelineEvent = {
  id: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  galaxyId?: string;
  sectorId?: string;
  starSystemId?: string;
  planetId?: string;
  relatedObjectId: string;
  relatedObjectType: DiscoveryObjectType;
  importance: TimelineImportance;
};

export type DiscoveryJournalInput = Omit<DiscoveryJournalEntry, "id" | "discoveredAt" | "tags" | "notes"> & {
  id?: string;
  discoveredAt?: string | null;
  tags?: string[];
  notes?: string;
};

export type TimelineEventInput = Omit<TimelineEvent, "id" | "timestamp"> & {
  id?: string;
  timestamp?: string | null;
};

export const DISCOVERY_JOURNAL_STORAGE_KEY = "project-genesis-discovery-journal";
export const TIMELINE_EVENTS_STORAGE_KEY = "project-genesis-timeline-events";
export const DISCOVERY_LOG_UPDATED_EVENT = "project-genesis-discovery-log-updated";

export const discoveryJournalSchema = {
  id: "string",
  objectId: "string",
  objectType: "galaxy | sector | star_system | planet | celestial_body | resource | anomaly | colony | faction | civilization",
  objectName: "string",
  generatedName: "string",
  displayName: "string",
  discoveryState: "undiscovered | detected | scanned | charted | explored | colonized",
  discoveredAt: "ISO timestamp",
  discoveredBy: "string",
  discoveryPoints: "number",
  galaxyId: "string",
  sectorId: "string",
  starSystemId: "string",
  rarity: "string",
  tags: "string[]",
  notes: "string"
};

export const timelineEventSchema = {
  id: "string",
  eventType: "sector_detected | sector_scanned | star_system_discovered | planet_scanned | planet_claimed | planet_colonized | colony_founded | rare_resource_found | faction_discovered | research_completed | intergalactic_travel_unlocked",
  title: "string",
  description: "string",
  timestamp: "ISO timestamp",
  galaxyId: "string",
  sectorId: "string",
  starSystemId: "string",
  planetId: "string",
  relatedObjectId: "string",
  relatedObjectType: "galaxy | sector | star_system | planet | celestial_body | resource | anomaly | colony | faction | civilization",
  importance: "low | medium | high | legendary"
};

export const sampleDiscoveryJournal: DiscoveryJournalEntry[] = [
  {
    id: "journal-sample-local-bubble",
    objectId: "sector-local-bubble",
    objectType: "sector",
    objectName: "Local Bubble",
    generatedName: "Local Bubble",
    displayName: "Local Bubble",
    discoveryState: "charted",
    discoveredAt: "derived",
    discoveredBy: "Studio Explorer",
    discoveryPoints: 100,
    galaxyId: "galaxy-milky-way",
    rarity: "Common",
    tags: ["starting-sector", "milky-way"],
    notes: "Sample schema row for engine exports. Player-specific journal data is stored by the client."
  }
];

export const sampleTimelineEvents: TimelineEvent[] = [
  {
    id: "timeline-sample-local-bubble-charted",
    eventType: "sector_scanned",
    title: "Local Bubble Charted",
    description: "Sample timeline row showing how discovery actions are recorded.",
    timestamp: "derived",
    galaxyId: "galaxy-milky-way",
    sectorId: "sector-local-bubble",
    relatedObjectId: "sector-local-bubble",
    relatedObjectType: "sector",
    importance: "medium"
  }
];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStorageArray<T>(key: string): T[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeStorageArray<T>(key: string, rows: T[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent(DISCOVERY_LOG_UPDATED_EVENT));
}

function stableId(prefix: string, seed: string) {
  return `${prefix}-${seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function readDiscoveryJournal() {
  return readStorageArray<DiscoveryJournalEntry>(DISCOVERY_JOURNAL_STORAGE_KEY);
}

export function readTimelineEvents() {
  return readStorageArray<TimelineEvent>(TIMELINE_EVENTS_STORAGE_KEY);
}

export function upsertDiscoveryJournalEntry(input: DiscoveryJournalInput) {
  const current = readDiscoveryJournal();
  const id = input.id ?? stableId("journal", `${input.objectType}-${input.objectId}`);
  const existing = current.find((entry) => entry.id === id || (entry.objectId === input.objectId && entry.objectType === input.objectType));
  const entry: DiscoveryJournalEntry = {
    id: existing?.id ?? id,
    objectId: input.objectId,
    objectType: input.objectType,
    objectName: input.displayName || input.objectName,
    generatedName: input.generatedName ?? existing?.generatedName ?? input.objectName,
    displayName: input.displayName ?? existing?.displayName,
    discoveryState: input.discoveryState,
    discoveredAt: input.discoveredAt || existing?.discoveredAt || nowIso(),
    discoveredBy: input.discoveredBy || existing?.discoveredBy || "Studio Explorer",
    discoveryPoints: input.discoveryPoints,
    galaxyId: input.galaxyId ?? existing?.galaxyId,
    sectorId: input.sectorId ?? existing?.sectorId,
    starSystemId: input.starSystemId ?? existing?.starSystemId,
    rarity: input.rarity ?? existing?.rarity,
    tags: input.tags ?? existing?.tags ?? [],
    notes: input.notes ?? existing?.notes ?? ""
  };
  writeStorageArray(
    DISCOVERY_JOURNAL_STORAGE_KEY,
    existing ? current.map((row) => (row.id === existing.id ? entry : row)) : [entry, ...current]
  );
  return entry;
}

export function appendTimelineEvent(input: TimelineEventInput) {
  const event: TimelineEvent = {
    id: input.id ?? stableId("timeline", `${input.eventType}-${input.relatedObjectId}-${input.timestamp ?? nowIso()}`),
    eventType: input.eventType,
    title: input.title,
    description: input.description,
    timestamp: input.timestamp || nowIso(),
    galaxyId: input.galaxyId,
    sectorId: input.sectorId,
    starSystemId: input.starSystemId,
    planetId: input.planetId,
    relatedObjectId: input.relatedObjectId,
    relatedObjectType: input.relatedObjectType,
    importance: input.importance
  };
  writeStorageArray(TIMELINE_EVENTS_STORAGE_KEY, [event, ...readTimelineEvents()].slice(0, 500));
  return event;
}

export function renameDiscoveryObject(objectId: string, objectType: DiscoveryObjectType, displayName: string) {
  const trimmed = displayName.trim();
  if (!trimmed) return;
  const entries = readDiscoveryJournal();
  writeStorageArray(
    DISCOVERY_JOURNAL_STORAGE_KEY,
    entries.map((entry) =>
      entry.objectId === objectId && entry.objectType === objectType
        ? { ...entry, displayName: trimmed, objectName: trimmed }
        : entry
    )
  );
}

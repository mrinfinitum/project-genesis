"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  Archive,
  Check,
  Clipboard,
  Copy,
  FileText,
  List,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Table2,
  Trash2,
  Wand2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { AiInboxItem, PromptTemplate } from "@/types/schema";

type Row = Record<string, unknown>;
type SourceRows = Record<string, Row[]>;
type ViewMode = "cards" | "table" | "templates";
type WorkshopModuleCard = {
  description: string;
  requiredInputs: string[];
  optionalInputs: string[];
  output: string[];
  actions: string[];
  about: string[];
  category: string;
  outputType: string;
  provider: string;
};

const contentTypes = [
  "Workshop Module",
  "Planet Name",
  "Planet Story",
  "Planet Discovery Journal",
  "Star System Story",
  "Artifact Description",
  "Collectible Description",
  "Resource Description",
  "Research Flavor Text",
  "Civilization Lore",
  "Expedition Log",
  "Event Text",
  "Image Prompt",
  "Codex Task"
];

const systems = [
  "AI Workshop",
  "Galaxy",
  "Star Systems",
  "Planets",
  "Resources",
  "Collectibles",
  "Research",
  "Civilizations",
  "Events",
  "Assets",
  "Development"
];

const statuses = ["Pending", "Prompt Ready", "In ChatGPT", "Result Pasted", "Approved", "Rejected", "Archived"];
const priorities = ["Low", "Medium", "High", "Critical"];
const sourceTables = [
  "generated_planets",
  "resource_catalog",
  "research",
  "buildings",
  "upgrades",
  "wonders",
  "assets",
  "conceptual_art",
  "planet_render_library"
];

const priorityStyles: Record<string, string> = {
  Low: "border-slate-400/30 text-slate-200",
  Medium: "border-cyan-300/35 text-cyan-100",
  High: "border-amber-300/45 text-amber-100",
  Critical: "border-red-300/50 text-red-100"
};

function stringify(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return value === null || value === undefined ? "" : String(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function titleFromRow(table: string, row: Row | undefined) {
  if (!row) {
    return "";
  }

  const candidates = [
    row.name,
    row.planet_name,
    row.resource_name,
    row.system_name,
    row.title,
    row.id
  ];
  return stringify(candidates.find((value) => stringify(value)));
}

function safeJson(value: string) {
  if (!value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function isDivider(line: string) {
  return /^[=\-─]{3,}$/.test(line.trim());
}

function normalizedSpecLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !isDivider(line));
}

function sectionizeSpec(lines: string[]) {
  const sectionNames = new Set([
    "AI WORKSHOP",
    "MODULE",
    "INPUTS",
    "OUTPUT",
    "PROMPT TEMPLATE",
    "LAYOUT",
    "SAVE",
    "FUTURE",
    "REQUIRED INPUTS",
    "OPTIONAL INPUTS",
    "ACTIONS",
    "ABOUT THIS TEMPLATE"
  ]);
  const sections: Record<string, string[]> = { ROOT: [] };
  let current = "ROOT";

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (sectionNames.has(upper)) {
      current = upper;
      sections[current] = sections[current] ?? [];
      continue;
    }
    sections[current].push(line);
  }

  return sections;
}

function valueAfter(label: string, lines: string[]) {
  const index = lines.findIndex((line) => line.toLowerCase() === label.toLowerCase());
  return index >= 0 ? lines[index + 1] ?? "" : "";
}

function valuesAfter(label: string, lines: string[]) {
  const index = lines.findIndex((line) => line.toLowerCase() === label.toLowerCase());
  return index >= 0 ? lines.slice(index + 1) : [];
}

function parseInputGroups(lines: string[]) {
  const controls = /^(Dropdown|Textarea|Input|Text Input|Multi-select|Multi Select|Checkbox|Toggle|Code Block|Large Code Block|Number)$/i;
  const required: string[] = [];
  const optional: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const label = lines[index];
    const control = lines[index + 1] ?? "";
    if (!control || !controls.test(control) || ["Examples", "Buttons", "Fields"].includes(label)) {
      continue;
    }

    const details: string[] = [control];
    index += 2;
    while (index < lines.length && !controls.test(lines[index + 1] ?? "")) {
      details.push(lines[index]);
      index += 1;
    }
    index -= 1;

    const isOptional = details.some((detail) => detail.toLowerCase() === "optional");
    const isRequired = details.some((detail) => detail.toLowerCase() === "required");
    const optionsIndex = details.findIndex((detail) => detail.toLowerCase() === "examples");
    const examples = optionsIndex >= 0 ? details.slice(optionsIndex + 1, optionsIndex + 5).join(", ") : "";
    const summary = [
      label,
      `Type: ${control}`,
      isRequired ? "Required" : isOptional ? "Optional" : "Optional",
      examples ? `Examples: ${examples}` : ""
    ].filter(Boolean).join(" | ");

    if (isRequired) {
      required.push(summary);
    } else {
      optional.push(summary);
    }
  }

  return { required, optional };
}

function workshopCardFromMetadata(metadata: Record<string, unknown> | undefined) {
  const card = metadata?.workshop_card;
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    return null;
  }

  return card as WorkshopModuleCard;
}

function parseWorkshopModuleSpec(raw: string): AiInboxItem {
  const timestamp = nowIso();
  const lines = normalizedSpecLines(raw);
  const sections = sectionizeSpec(lines);
  const moduleLines = sections.MODULE ?? sections.ROOT ?? [];
  const title =
    valueAfter("Title", lines) ||
    moduleLines.find((line) => !["Category", "Description", "Output Type", "AI Provider"].includes(line)) ||
    "Imported AI Workshop Module";
  const description = valueAfter("Description", moduleLines) || valueAfter("One sentence description", lines) || "Imported AI Workshop module.";
  const category = valueAfter("Category", moduleLines) || "AI Workshop";
  const outputType = valueAfter("Output Type", moduleLines) || "";
  const provider = valueAfter("AI Provider", moduleLines) || "";
  const inputGroups = parseInputGroups(sections.INPUTS ?? []);
  const requiredInputs = sections["REQUIRED INPUTS"]?.length ? sections["REQUIRED INPUTS"] : inputGroups.required;
  const optionalInputs = sections["OPTIONAL INPUTS"]?.length ? sections["OPTIONAL INPUTS"] : inputGroups.optional;
  const outputLines = sections.OUTPUT ?? [];
  const buttonsIndex = outputLines.findIndex((line) => line.toLowerCase() === "buttons");
  const output = (buttonsIndex >= 0 ? outputLines.slice(0, buttonsIndex) : outputLines).filter((line) => line.toLowerCase() !== "buttons");
  const actions = sections.ACTIONS?.length ? sections.ACTIONS : buttonsIndex >= 0 ? outputLines.slice(buttonsIndex + 1) : [];
  const about = sections["ABOUT THIS TEMPLATE"]?.length
    ? sections["ABOUT THIS TEMPLATE"]
    : [
        description,
        category ? `Category: ${category}` : "",
        outputType ? `Output Type: ${outputType}` : "",
        provider ? `Provider: ${provider}` : "",
        moduleLines.includes("No API Required") ? "No API required." : "",
        ...(sections.FUTURE?.length ? ["Future:", ...sections.FUTURE] : [])
      ].filter(Boolean);
  const promptTemplate = (sections["PROMPT TEMPLATE"] ?? []).join("\n");
  const card: WorkshopModuleCard = {
    description,
    requiredInputs,
    optionalInputs,
    output,
    actions,
    about,
    category,
    outputType,
    provider
  };

  return {
    id: newId("ai-module"),
    title,
    content_type: "Workshop Module",
    source_table: "",
    source_id: "",
    system: "AI Workshop",
    status: "Pending",
    priority: "Medium",
    prompt_template: "",
    generated_prompt: promptTemplate,
    ai_result: "",
    result_summary: description,
    related_name: category,
    related_metadata: {
      workshop_card: card,
      imported_spec: raw
    },
    created_at: timestamp,
    updated_at: timestamp,
    completed_at: null,
    notes: raw
  };
}

function emptyItem(): AiInboxItem {
  const timestamp = nowIso();
  return {
    id: newId("ai"),
    title: "",
    content_type: "Planet Story",
    source_table: "generated_planets",
    source_id: "",
    system: "Planets",
    status: "Pending",
    priority: "Medium",
    prompt_template: "",
    generated_prompt: "",
    ai_result: "",
    result_summary: "",
    related_name: "",
    related_metadata: {},
    created_at: timestamp,
    updated_at: timestamp,
    completed_at: null,
    notes: ""
  };
}

function emptyTemplate(): PromptTemplate {
  const timestamp = nowIso();
  return {
    id: newId("prompt-template"),
    name: "",
    content_type: "Codex Task",
    system: "Development",
    template_text: "",
    output_format: "",
    active: true,
    created_at: timestamp,
    updated_at: timestamp,
    notes: ""
  };
}

function getSourceRow(item: AiInboxItem, sourceRows: SourceRows) {
  return (sourceRows[item.source_table] ?? []).find((row) => stringify(row.id) === item.source_id);
}

function sourceOptions(sourceRows: SourceRows, table: string) {
  return (sourceRows[table] ?? []).map((row) => ({
    id: stringify(row.id),
    label: titleFromRow(table, row) || stringify(row.id)
  }));
}

function sourceMetadata(item: AiInboxItem, sourceRows: SourceRows) {
  const row = getSourceRow(item, sourceRows);
  const metadata: Record<string, unknown> = {
    title: item.title,
    system: item.system,
    source_table: item.source_table,
    source_id: item.source_id,
    related_name: item.related_name,
    notes: item.notes,
    ...item.related_metadata
  };

  if (row) {
    Object.assign(metadata, row);
  }

  if (item.source_table === "generated_planets" && row) {
    Object.assign(metadata, {
      planet_name: row.name,
      planet_rarity: row.rarity,
      planet_class: row.planet_class ?? row.primary_biome,
      planet_subclass: row.planet_subclass,
      biome: row.primary_biome,
      ancient_civilization: row.ancient_civilization,
      discovery_tier: row.discovery_points,
      discovery_focus: row.story,
      image_prompt: row.image_prompt ?? stringify(row.visual_theme)
    });
  }

  if (item.source_table === "resource_catalog" && row) {
    Object.assign(metadata, {
      resource_name: row.resource_name,
      category: row.category,
      rarity: row.rarity,
      discovery_tier: row.discovery_tier,
      typical_planet_classes: row.typical_planet_classes,
      primary_uses: row.primary_uses
    });
  }

  if (item.source_table === "research" && row) {
    Object.assign(metadata, {
      research_name: row.name,
      era: row.era,
      design_purpose: row.design_purpose,
      gameplay_effect: row.gameplay_effect,
      related_systems: row.related_systems
    });
  }

  return metadata;
}

function renderPrompt(template: PromptTemplate, item: AiInboxItem, sourceRows: SourceRows) {
  const metadata = sourceMetadata(item, sourceRows);
  const body = template.template_text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    return stringify(metadata[key]);
  });

  return template.output_format.trim() ? `${body.trim()}\n\nReturn:\n${template.output_format.trim()}` : body.trim();
}

function itemMatches(item: AiInboxItem, search: string) {
  if (!search.trim()) {
    return true;
  }

  const needle = search.toLowerCase();
  return [item.title, item.related_name, item.source_id, item.content_type, item.system, item.notes].some((value) =>
    value.toLowerCase().includes(needle)
  );
}

function templateForItem(item: AiInboxItem, templates: PromptTemplate[]) {
  return (
    templates.find((template) => template.id === item.prompt_template) ??
    templates.find((template) => template.active && template.content_type === item.content_type) ??
    templates.find((template) => template.content_type === item.content_type) ??
    null
  );
}

function canSaveToSource(item: AiInboxItem) {
  return (
    (item.content_type === "Planet Story" && item.source_table === "generated_planets") ||
    (item.content_type === "Resource Description" && item.source_table === "resource_catalog") ||
    (item.content_type === "Research Flavor Text" && item.source_table === "research")
  );
}

export function AIWorkshop({
  initialItems,
  initialTemplates,
  sourceRows
}: {
  initialItems: AiInboxItem[];
  initialTemplates: PromptTemplate[];
  sourceRows: SourceRows;
}) {
  const [items, setItems] = useState(initialItems);
  const [templates, setTemplates] = useState(initialTemplates);
  const [view, setView] = useState<ViewMode>("cards");
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState("all");
  const [system, setSystem] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [sourceTable, setSourceTable] = useState("all");
  const [editingItem, setEditingItem] = useState<AiInboxItem | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [moduleImportOpen, setModuleImportOpen] = useState(false);
  const [pasteItem, setPasteItem] = useState<AiInboxItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return (
        (contentType === "all" || item.content_type === contentType) &&
        (system === "all" || item.system === system) &&
        (priority === "all" || item.priority === priority) &&
        (status === "all" || item.status === status) &&
        (sourceTable === "all" || item.source_table === sourceTable) &&
        itemMatches(item, search)
      );
    });
  }, [contentType, items, priority, search, sourceTable, status, system]);

  const grouped = useMemo(() => {
    return statuses.map((groupStatus) => ({
      status: groupStatus,
      rows: filteredItems.filter((item) => item.status === groupStatus)
    }));
  }, [filteredItems]);

  async function saveItem(next: AiInboxItem) {
    setError("");
    const timestamp = nowIso();
    const row = { ...next, updated_at: timestamp };
    const response = await fetch("/api/data/ai_inbox", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(row)
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not save AI inbox item.");
      return null;
    }

    setItems((current) => {
      const index = current.findIndex((item) => item.id === payload.row.id);
      if (index >= 0) {
        const copy = [...current];
        copy[index] = payload.row;
        return copy;
      }
      return [payload.row, ...current];
    });
    return payload.row as AiInboxItem;
  }

  async function saveTemplate(next: PromptTemplate) {
    setError("");
    const timestamp = nowIso();
    const row = { ...next, updated_at: timestamp };
    const response = await fetch("/api/data/prompt_templates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(row)
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not save prompt template.");
      return null;
    }

    setTemplates((current) => {
      const index = current.findIndex((template) => template.id === payload.row.id);
      if (index >= 0) {
        const copy = [...current];
        copy[index] = payload.row;
        return copy;
      }
      return [payload.row, ...current];
    });
    return payload.row as PromptTemplate;
  }

  async function deleteItem(item: AiInboxItem) {
    if (!window.confirm(`Delete ${item.title || item.id}?`)) {
      return;
    }

    const response = await fetch(`/api/data/ai_inbox/${item.id}`, { method: "DELETE" });
    if (response.ok) {
      setItems((current) => current.filter((row) => row.id !== item.id));
    }
  }

  async function deleteTemplate(template: PromptTemplate) {
    if (!window.confirm(`Delete ${template.name || template.id}?`)) {
      return;
    }

    const response = await fetch(`/api/data/prompt_templates/${template.id}`, { method: "DELETE" });
    if (response.ok) {
      setTemplates((current) => current.filter((row) => row.id !== template.id));
    }
  }

  async function updateStatus(item: AiInboxItem, nextStatus: string) {
    const completedAt = nextStatus === "Approved" ? nowIso() : item.completed_at;
    await saveItem({ ...item, status: nextStatus, completed_at: completedAt });
  }

  async function generatePrompt(item: AiInboxItem) {
    const template = templateForItem(item, templates);
    if (!template) {
      setError(`No prompt template found for ${item.content_type}.`);
      return;
    }

    const source = getSourceRow(item, sourceRows);
    const generated = renderPrompt(template, item, sourceRows);
    await saveItem({
      ...item,
      prompt_template: template.id,
      generated_prompt: generated,
      related_name: item.related_name || titleFromRow(item.source_table, source),
      status: "Prompt Ready"
    });
  }

  async function copyPrompt(item: AiInboxItem) {
    const template = templateForItem(item, templates);
    if (!item.generated_prompt && !template) {
      setError(`No generated prompt or template found for ${item.content_type}.`);
      return;
    }

    const prompt = item.generated_prompt || renderPrompt(template as PromptTemplate, item, sourceRows);
    await navigator.clipboard.writeText(prompt);
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId(null), 1600);

    if (item.status === "Prompt Ready") {
      await updateStatus(item, "In ChatGPT");
    }
  }

  async function saveResult(item: AiInboxItem, aiResult: string, resultSummary: string) {
    await saveItem({ ...item, ai_result: aiResult, result_summary: resultSummary, status: "Result Pasted" });
    setPasteItem(null);
  }

  async function saveToSource(item: AiInboxItem) {
    const row = getSourceRow(item, sourceRows);
    if (!row || !item.ai_result.trim() || !canSaveToSource(item)) {
      return;
    }

    const nextRow = { ...row };
    if (item.content_type === "Planet Story" && item.source_table === "generated_planets") {
      nextRow.story = item.ai_result;
      nextRow.notes = item.result_summary || row.notes || "";
    }

    if (item.content_type === "Resource Description" && item.source_table === "resource_catalog") {
      nextRow.description = item.ai_result;
      nextRow.science_lore_notes = item.result_summary || row.science_lore_notes || "";
    }

    if (item.content_type === "Research Flavor Text" && item.source_table === "research") {
      nextRow.notes = item.ai_result;
    }

    const response = await fetch(`/api/data/${item.source_table}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(nextRow)
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not save result to source record.");
      return;
    }

    await updateStatus({ ...item, notes: `${item.notes}\nSaved to ${item.source_table}/${item.source_id}`.trim() }, "Approved");
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Zero API Cost Queue</p>
          <h2 className="mt-2 text-4xl font-bold text-white">AI Workshop</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Build copy-ready prompts, paste external ChatGPT results back into Studio, and track content tasks without calling an AI API.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setModuleImportOpen(true)} className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Clipboard className="h-4 w-4" /> Paste Module Spec
          </Button>
          <Button onClick={() => setEditingItem(emptyItem())}>
            <Plus className="h-4 w-4" /> New AI Item
          </Button>
          <Button onClick={() => setEditingTemplate(emptyTemplate())} className="border-blue-300/30 bg-blue-300/10 text-blue-100">
            <FileText className="h-4 w-4" /> New Template
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Open Items", items.filter((item) => !["Approved", "Archived"].includes(item.status)).length],
          ["Prompt Ready", items.filter((item) => item.status === "Prompt Ready").length],
          ["Needs Review", items.filter((item) => item.status === "Result Pasted").length],
          ["Templates", templates.length]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
        <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(5,minmax(0,0.8fr))]">
          <label className="flex h-11 items-center gap-3 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-slate-300">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              placeholder="Search title, related record, or source ID"
            />
          </label>
          <FilterSelect label="Content" value={contentType} options={contentTypes} onChange={setContentType} />
          <FilterSelect label="System" value={system} options={systems} onChange={setSystem} />
          <FilterSelect label="Priority" value={priority} options={priorities} onChange={setPriority} />
          <FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} />
          <FilterSelect label="Source" value={sourceTable} options={sourceTables} onChange={setSourceTable} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setView("cards")} className={view === "cards" ? "border-cyan-200/60 bg-cyan-300/20" : ""}>
            <List className="h-4 w-4" /> Queue Cards
          </Button>
          <Button onClick={() => setView("table")} className={view === "table" ? "border-cyan-200/60 bg-cyan-300/20" : ""}>
            <Table2 className="h-4 w-4" /> Table
          </Button>
          <Button onClick={() => setView("templates")} className={view === "templates" ? "border-cyan-200/60 bg-cyan-300/20" : ""}>
            <FileText className="h-4 w-4" /> Prompt Templates
          </Button>
        </div>
      </section>

      {error ? <div className="rounded-md border border-red-300/30 bg-red-950/30 p-4 text-sm text-red-100">{error}</div> : null}

      {view === "cards" ? (
        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {grouped.map((group) => (
            <div key={group.status} className="rounded-md border border-cyan-400/15 bg-genesis-panel/90">
              <div className="flex items-center justify-between border-b border-cyan-400/10 px-4 py-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">{group.status}</h3>
                <span className="text-xs text-slate-500">{group.rows.length}</span>
              </div>
              <div className="space-y-3 p-3">
                {group.rows.length ? (
                  group.rows.map((item) => (
                    <AIItemCard
                      key={item.id}
                      item={item}
                      copied={copiedId === item.id}
                      onArchive={() => window.confirm(`Archive ${item.title}?`) && updateStatus(item, "Archived")}
                      onApprove={() => updateStatus(item, "Approved")}
                      onCopy={() => copyPrompt(item)}
                      onDelete={() => deleteItem(item)}
                      onEdit={() => setEditingItem(item)}
                      onGenerate={() => generatePrompt(item)}
                      onPaste={() => setPasteItem(item)}
                      onReject={() => updateStatus(item, "Rejected")}
                      onSaveSource={() => saveToSource(item)}
                    />
                  ))
                ) : (
                  <div className="rounded-md border border-slate-800 bg-slate-950/35 p-4 text-sm text-slate-500">No items.</div>
                )}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {view === "table" ? (
        <section className="overflow-hidden rounded-md border border-cyan-400/15 bg-genesis-panel/90">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                {["Title", "Type", "System", "Priority", "Status", "Related", "Updated", "Actions"].map((column) => (
                  <th key={column} className="px-4 py-3">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="text-slate-300">
                  <td className="px-4 py-3 font-medium text-white">{item.title}</td>
                  <td className="px-4 py-3">{item.content_type}</td>
                  <td className="px-4 py-3">{item.system}</td>
                  <td className="px-4 py-3">{item.priority}</td>
                  <td className="px-4 py-3"><StatusBadge value={item.status} /></td>
                  <td className="px-4 py-3">{item.related_name || item.source_id}</td>
                  <td className="px-4 py-3">{formatDate(item.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button onClick={() => generatePrompt(item)} title="Generate Prompt"><Wand2 className="h-4 w-4" /></Button>
                      <Button onClick={() => copyPrompt(item)} title="Copy Prompt"><Copy className="h-4 w-4" /></Button>
                      <Button onClick={() => setEditingItem(item)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {view === "templates" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{template.content_type}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{template.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{template.system} {template.active ? "• Active" : "• Inactive"}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setEditingTemplate(template)}><Pencil className="h-4 w-4" /></Button>
                  <Button onClick={() => deleteTemplate(template)} className="border-red-300/30 bg-red-300/10 text-red-100"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
                {template.template_text}
              </pre>
            </div>
          ))}
        </section>
      ) : null}

      {editingItem ? (
        <ItemModal
          item={editingItem}
          templates={templates}
          sourceRows={sourceRows}
          onClose={() => setEditingItem(null)}
          onDelete={() => deleteItem(editingItem)}
          onSave={async (item) => {
            const saved = await saveItem(item);
            if (saved) {
              setEditingItem(null);
            }
          }}
        />
      ) : null}

      {editingTemplate ? (
        <TemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onDelete={() => deleteTemplate(editingTemplate)}
          onSave={async (template) => {
            const saved = await saveTemplate(template);
            if (saved) {
              setEditingTemplate(null);
            }
          }}
        />
      ) : null}

      {moduleImportOpen ? (
        <ModuleImportModal
          onClose={() => setModuleImportOpen(false)}
          onSave={async (raw) => {
            const saved = await saveItem(parseWorkshopModuleSpec(raw));
            if (saved) {
              setModuleImportOpen(false);
              setView("cards");
              setContentType("Workshop Module");
              setSystem("AI Workshop");
              setStatus("all");
            }
          }}
        />
      ) : null}

      {pasteItem ? (
        <PasteResultModal item={pasteItem} onClose={() => setPasteItem(null)} onSave={saveResult} />
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2">
      <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full bg-transparent text-sm text-slate-100 outline-none">
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function AIItemCard({
  item,
  copied,
  onArchive,
  onApprove,
  onCopy,
  onDelete,
  onEdit,
  onGenerate,
  onPaste,
  onReject,
  onSaveSource
}: {
  item: AiInboxItem;
  copied: boolean;
  onArchive: () => void;
  onApprove: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onGenerate: () => void;
  onPaste: () => void;
  onReject: () => void;
  onSaveSource: () => void;
}) {
  const workshopCard = workshopCardFromMetadata(item.related_metadata);

  return (
    <article className="rounded-md border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{item.content_type}</p>
          <h4 className="mt-1 text-lg font-semibold text-white">{item.title || "Untitled AI item"}</h4>
          <p className="mt-1 text-xs text-slate-500">{item.related_name || item.source_id || "No source linked"}</p>
        </div>
        <span className={cn("rounded-md border px-2 py-1 text-xs font-semibold", priorityStyles[item.priority] ?? priorityStyles.Medium)}>
          {item.priority}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Spec label="System" value={item.system} />
        <Spec label="Source" value={item.source_table || "Manual"} />
        <Spec label="Status" value={item.status} />
        <Spec label="Updated" value={formatDate(item.updated_at)} />
      </div>

      {workshopCard ? <WorkshopModuleSummary card={workshopCard} /> : null}

      {!workshopCard && item.result_summary ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{item.result_summary}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onGenerate}><Wand2 className="h-4 w-4" /> Generate</Button>
        <Button onClick={onCopy} disabled={!item.generated_prompt}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy Prompt"}
        </Button>
        <Button onClick={onPaste}><Clipboard className="h-4 w-4" /> Paste Result</Button>
        <Button onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={onApprove} disabled={!item.ai_result} className="border-green-300/30 bg-green-300/10 text-green-100">
          <ShieldCheck className="h-4 w-4" /> Approve
        </Button>
        <Button onClick={onReject} className="border-amber-300/30 bg-amber-300/10 text-amber-100">Reject</Button>
        <Button onClick={onSaveSource} disabled={!canSaveToSource(item) || !item.ai_result} className="border-blue-300/30 bg-blue-300/10 text-blue-100">
          Save to Source
        </Button>
        <Button onClick={onArchive} className="border-slate-500/30 bg-slate-500/10 text-slate-200"><Archive className="h-4 w-4" /></Button>
        <Button onClick={onDelete} className="border-red-300/30 bg-red-300/10 text-red-100"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </article>
  );
}

function WorkshopModuleSummary({ card }: { card: WorkshopModuleCard }) {
  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm leading-6 text-slate-300">{card.description}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <WorkshopModuleSection title="Required Inputs" rows={card.requiredInputs} empty="No required inputs listed." />
        <WorkshopModuleSection title="Optional Inputs" rows={card.optionalInputs} empty="No optional inputs listed." />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <WorkshopModuleSection title="Output" rows={card.output} empty="No output listed." />
        <WorkshopModuleSection title="Actions" rows={card.actions} empty="No actions listed." />
      </div>
      <WorkshopModuleSection title="About This Template" rows={card.about} empty="No template notes listed." />
    </div>
  );
}

function WorkshopModuleSection({ title, rows, empty }: { title: string; rows: string[]; empty: string }) {
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">{title}</p>
      <div className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
        {rows.length ? rows.map((row) => <p key={row}>{row}</p>) : <p className="text-slate-500">{empty}</p>}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/45 p-2">
      <p className="uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 truncate font-medium text-slate-200">{value}</p>
    </div>
  );
}

function ItemModal({
  item,
  templates,
  sourceRows,
  onClose,
  onDelete,
  onSave
}: {
  item: AiInboxItem;
  templates: PromptTemplate[];
  sourceRows: SourceRows;
  onClose: () => void;
  onDelete: () => void;
  onSave: (item: AiInboxItem) => void;
}) {
  const [metadata, setMetadata] = useState(JSON.stringify(item.related_metadata ?? {}, null, 2));
  const [selectedTable, setSelectedTable] = useState(item.source_table || "generated_planets");
  const tableOptions = sourceOptions(sourceRows, selectedTable);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sourceId = stringify(form.get("source_id"));
    const source = (sourceRows[selectedTable] ?? []).find((row) => stringify(row.id) === sourceId);
    onSave({
      ...item,
      title: stringify(form.get("title")),
      content_type: stringify(form.get("content_type")),
      source_table: selectedTable,
      source_id: sourceId,
      system: stringify(form.get("system")),
      status: stringify(form.get("status")),
      priority: stringify(form.get("priority")),
      prompt_template: stringify(form.get("prompt_template")),
      generated_prompt: stringify(form.get("generated_prompt")),
      ai_result: stringify(form.get("ai_result")),
      result_summary: stringify(form.get("result_summary")),
      related_name: stringify(form.get("related_name")) || titleFromRow(selectedTable, source),
      related_metadata: safeJson(metadata),
      notes: stringify(form.get("notes"))
    });
  }

  return (
    <Modal title={item.title ? "Edit AI Item" : "Create AI Item"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <TextInput name="title" label="Title" defaultValue={item.title} required />
        <div className="grid gap-3 md:grid-cols-2">
          <SelectInput name="content_type" label="Content Type" defaultValue={item.content_type} options={contentTypes} />
          <SelectInput name="system" label="System" defaultValue={item.system} options={systems} />
          <SelectInput name="priority" label="Priority" defaultValue={item.priority} options={priorities} />
          <SelectInput name="status" label="Status" defaultValue={item.status} options={statuses} />
          <label className="block">
            <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Source Table</span>
            <select value={selectedTable} onChange={(event) => setSelectedTable(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100">
              {sourceTables.map((table) => <option key={table} value={table}>{table}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Source Record</span>
            <input
              name="source_id"
              list={`source-options-${slug(selectedTable)}`}
              defaultValue={item.source_id}
              className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100"
            />
            <datalist id={`source-options-${slug(selectedTable)}`}>
              {tableOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </datalist>
          </label>
          <TextInput name="related_name" label="Related Name" defaultValue={item.related_name} />
          <SelectInput
            name="prompt_template"
            label="Prompt Template"
            defaultValue={item.prompt_template}
            options={["", ...templates.map((template) => template.id)]}
            labels={Object.fromEntries(templates.map((template) => [template.id, template.name]))}
          />
        </div>
        <Textarea name="generated_prompt" label="Generated Prompt" defaultValue={item.generated_prompt} rows={7} />
        <Textarea name="ai_result" label="AI Result" defaultValue={item.ai_result} rows={7} />
        <Textarea name="result_summary" label="Result Summary" defaultValue={item.result_summary} rows={3} />
        <Textarea name="notes" label="Notes" defaultValue={item.notes} rows={3} />
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Related Metadata JSON</span>
          <textarea
            value={metadata}
            onChange={(event) => setMetadata(event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </label>
        <ModalActions onClose={onClose} onDelete={onDelete} />
      </form>
    </Modal>
  );
}

function TemplateModal({
  template,
  onClose,
  onDelete,
  onSave
}: {
  template: PromptTemplate;
  onClose: () => void;
  onDelete: () => void;
  onSave: (template: PromptTemplate) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      ...template,
      name: stringify(form.get("name")),
      content_type: stringify(form.get("content_type")),
      system: stringify(form.get("system")),
      template_text: stringify(form.get("template_text")),
      output_format: stringify(form.get("output_format")),
      active: form.get("active") === "on",
      notes: stringify(form.get("notes"))
    });
  }

  return (
    <Modal title={template.name ? "Edit Prompt Template" : "Create Prompt Template"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <TextInput name="name" label="Name" defaultValue={template.name} required />
        <div className="grid gap-3 md:grid-cols-2">
          <SelectInput name="content_type" label="Content Type" defaultValue={template.content_type} options={contentTypes} />
          <SelectInput name="system" label="System" defaultValue={template.system} options={systems} />
        </div>
        <Textarea name="template_text" label="Template Text" defaultValue={template.template_text} rows={12} />
        <Textarea name="output_format" label="Output Format" defaultValue={template.output_format} rows={5} />
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input name="active" type="checkbox" defaultChecked={template.active} className="h-4 w-4" />
          Active template
        </label>
        <Textarea name="notes" label="Notes" defaultValue={template.notes} rows={3} />
        <ModalActions onClose={onClose} onDelete={onDelete} />
      </form>
    </Modal>
  );
}

function PasteResultModal({
  item,
  onClose,
  onSave
}: {
  item: AiInboxItem;
  onClose: () => void;
  onSave: (item: AiInboxItem, aiResult: string, resultSummary: string) => void;
}) {
  const [aiResult, setAiResult] = useState(item.ai_result);
  const [summary, setSummary] = useState(item.result_summary);

  return (
    <Modal title="Paste AI Result" onClose={onClose}>
      <div className="grid gap-4">
        <p className="text-sm text-slate-300">{item.title}</p>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-slate-400">AI Result</span>
          <textarea value={aiResult} onChange={(event) => setAiResult(event.target.value)} rows={12} className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Result Summary</span>
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose} className="border-slate-600 bg-slate-800/50 text-slate-200">Cancel</Button>
          <Button type="button" onClick={() => onSave(item, aiResult, summary)}>Save Result</Button>
        </div>
      </div>
    </Modal>
  );
}

function ModuleImportModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (raw: string) => void;
}) {
  const [raw, setRaw] = useState("");
  const preview = raw.trim() ? parseWorkshopModuleSpec(raw) : null;
  const previewCard = preview ? workshopCardFromMetadata(preview.related_metadata) : null;

  return (
    <Modal title="Paste Workshop Module Spec" onClose={onClose}>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Spec Text</span>
            <textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              rows={22}
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs leading-5 text-slate-100"
              placeholder="Paste the AI WORKSHOP / MODULE / INPUTS / OUTPUT block here"
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" onClick={onClose} className="border-slate-600 bg-slate-800/50 text-slate-200">Cancel</Button>
            <Button type="button" disabled={!raw.trim()} onClick={() => onSave(raw)}>Create Workshop Card</Button>
          </div>
        </div>
        <div className="rounded-md border border-cyan-400/15 bg-slate-950/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Preview</p>
          {preview && previewCard ? (
            <div className="mt-3">
              <h4 className="text-xl font-semibold text-white">{preview.title}</h4>
              <p className="mt-1 text-xs text-slate-500">{preview.related_name || "AI Workshop"}</p>
              <WorkshopModuleSummary card={previewCard} />
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">Paste a module spec to preview the generated card.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-md border border-cyan-400/20 bg-[#07101e] shadow-glow">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/15 bg-[#07101e] px-5 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Button onClick={onClose} className="h-8 w-8 px-0"><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function TextInput({ name, label, defaultValue, required }: { name: string; label: string; defaultValue: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <input name={name} defaultValue={defaultValue} required={required} className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100" />
    </label>
  );
}

function SelectInput({
  name,
  label,
  defaultValue,
  options,
  labels = {}
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100">
        {options.map((option) => <option key={option} value={option}>{(labels[option] ?? option) || "Auto match"}</option>)}
      </select>
    </label>
  );
}

function Textarea({ name, label, defaultValue, rows }: { name: string; label: string; defaultValue: string; rows: number }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={rows} className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
    </label>
  );
}

function ModalActions({ onClose, onDelete }: { onClose: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <Button type="button" onClick={onDelete} className="border-red-300/30 bg-red-300/10 text-red-100">
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
      <div className="flex gap-2">
        <Button type="button" onClick={onClose} className="border-slate-600 bg-slate-800/50 text-slate-200">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </div>
  );
}

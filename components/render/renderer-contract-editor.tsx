"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Copy, Download, FileJson, Plus, Search, Trash2 } from "lucide-react";
import {
  formatRendererContractEditor,
  rendererContractDefaults,
  validateRendererContract,
  type RendererContract,
  type RendererContractGroup,
  type RendererContractParameter,
  type RendererContractStatus,
  type RendererParameterType
} from "@/lib/render";
import { cn } from "@/lib/utils";

const parameterTypes: RendererParameterType[] = ["Boolean", "Integer", "Float", "String", "Enum", "Color", "File", "Vector2", "Vector3"];
const statuses: RendererContractStatus[] = ["Draft", "Review", "Approved", "Deprecated"];

function cloneContract(contract: RendererContract): RendererContract {
  return JSON.parse(JSON.stringify(contract)) as RendererContract;
}

function titleFromKey(key: string) {
  return key.split(".").pop()?.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? key;
}

function defaultValueForType(type: RendererParameterType): RendererContractParameter["defaultValue"] {
  if (type === "Boolean") return false;
  if (type === "Integer" || type === "Float") return 0;
  if (type === "Vector2") return [0, 0];
  if (type === "Vector3") return [0, 0, 0];
  if (type === "Color") return "#7dd3fc";
  return "";
}

function parseDefaultValue(value: string, type: RendererParameterType): RendererContractParameter["defaultValue"] {
  if (type === "Boolean") return value === "true";
  if (type === "Integer") return Number.parseInt(value || "0", 10);
  if (type === "Float") return Number.parseFloat(value || "0");
  if (type === "Vector2" || type === "Vector3") {
    return value.split(",").map((item) => Number.parseFloat(item.trim() || "0"));
  }
  return value;
}

function stringifyDefaultValue(value: RendererContractParameter["defaultValue"]) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function newParameter(group: RendererContractGroup): RendererContractParameter {
  const key = `${group.id}.newParameter`;
  return {
    key,
    displayName: "New Parameter",
    description: "Describe renderer expectation.",
    type: "String",
    defaultValue: "",
    required: true,
    rendererMapping: `renderer.parameters.${key}`,
    validation: "Required default must match type and range.",
    notes: "Contract definition only."
  };
}

function issueTextFor(key: string, issues: ReturnType<typeof validateRendererContract>["issues"]) {
  return issues.filter((issue) => issue.key === key).map((issue) => issue.message).join(" ");
}

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text);
}

function downloadJson(contract: RendererContract) {
  const blob = new Blob([formatRendererContractEditor("json", contract)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${contract.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function RendererContractEditor({ initialContract }: { initialContract: RendererContract }) {
  const [contract, setContract] = useState(() => cloneContract(initialContract));
  const [selectedGroupId, setSelectedGroupId] = useState(contract.groups[0]?.id ?? "");
  const [selectedKey, setSelectedKey] = useState(contract.groups[0]?.parameters[0]?.key ?? "");
  const [query, setQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const validation = useMemo(() => validateRendererContract(contract), [contract]);
  const defaultsJson = useMemo(() => JSON.stringify(rendererContractDefaults(contract), null, 2), [contract]);
  const selectedGroup = contract.groups.find((group) => group.id === selectedGroupId) ?? contract.groups[0];
  const selectedParameter = contract.groups.flatMap((group) => group.parameters).find((parameter) => parameter.key === selectedKey) ?? selectedGroup?.parameters[0];

  const updateContract = (updater: (draft: RendererContract) => void) => {
    setContract((current) => {
      const draft = cloneContract(current);
      updater(draft);
      return draft;
    });
  };

  const updateParameter = (key: string, updater: (parameter: RendererContractParameter) => void) => {
    updateContract((draft) => {
      for (const group of draft.groups) {
        const parameter = group.parameters.find((item) => item.key === key);
        if (parameter) {
          updater(parameter);
          return;
        }
      }
    });
  };

  const addGroup = () => {
    updateContract((draft) => {
      const id = `group-${draft.groups.length + 1}`;
      draft.groups.push({ id, name: "New Group", parameters: [] });
      setSelectedGroupId(id);
    });
  };

  const deleteGroup = (groupId: string) => {
    updateContract((draft) => {
      draft.groups = draft.groups.filter((group) => group.id !== groupId);
      const first = draft.groups[0];
      setSelectedGroupId(first?.id ?? "");
      setSelectedKey(first?.parameters[0]?.key ?? "");
    });
  };

  const moveGroup = (groupId: string, direction: -1 | 1) => {
    updateContract((draft) => {
      const index = draft.groups.findIndex((group) => group.id === groupId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= draft.groups.length) return;
      const [group] = draft.groups.splice(index, 1);
      draft.groups.splice(nextIndex, 0, group);
    });
  };

  const addParameter = (groupId: string) => {
    updateContract((draft) => {
      const group = draft.groups.find((item) => item.id === groupId);
      if (!group) return;
      const parameter = newParameter(group);
      group.parameters.push(parameter);
      setSelectedGroupId(group.id);
      setSelectedKey(parameter.key);
    });
  };

  const duplicateParameter = (key: string) => {
    updateContract((draft) => {
      for (const group of draft.groups) {
        const index = group.parameters.findIndex((parameter) => parameter.key === key);
        if (index < 0) continue;
        const duplicate = { ...group.parameters[index], key: `${group.parameters[index].key}.copy`, displayName: `${group.parameters[index].displayName} Copy` };
        group.parameters.splice(index + 1, 0, duplicate);
        setSelectedKey(duplicate.key);
        return;
      }
    });
  };

  const deleteParameter = (key: string) => {
    updateContract((draft) => {
      for (const group of draft.groups) {
        group.parameters = group.parameters.filter((parameter) => parameter.key !== key);
      }
      const first = draft.groups.flatMap((group) => group.parameters)[0];
      setSelectedKey(first?.key ?? "");
    });
  };

  const moveParameter = (key: string, direction: -1 | 1) => {
    updateContract((draft) => {
      for (const group of draft.groups) {
        const index = group.parameters.findIndex((parameter) => parameter.key === key);
        const nextIndex = index + direction;
        if (index < 0 || nextIndex < 0 || nextIndex >= group.parameters.length) continue;
        const [parameter] = group.parameters.splice(index, 1);
        group.parameters.splice(nextIndex, 0, parameter);
        return;
      }
    });
  };

  const setStatus = (status: RendererContractStatus) => {
    if (status === "Approved" && !validation.valid) return;
    updateContract((draft) => {
      draft.status = status;
    });
  };

  const filteredGroups = contract.groups.map((group) => ({
    ...group,
    parameters: group.parameters.filter((parameter) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [parameter.key, parameter.displayName, parameter.description, parameter.type].some((value) => String(value).toLowerCase().includes(needle));
    })
  }));

  return (
    <main className="space-y-5">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Renderer Contracts</p>
            <h1 className="mt-2 text-4xl font-black text-white">Planet Renderer Contract</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">Schema editor for renderer expectations. This page edits contract shape only; it does not launch Blender, Python, queue jobs, or external renderers.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatus(status)}
                disabled={status === "Approved" && !validation.valid}
                className={cn("rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition", contract.status === status ? "border-cyan-200/60 bg-cyan-300/15 text-white" : "border-cyan-300/15 bg-slate-950/45 text-slate-300 hover:border-cyan-200/40", status === "Approved" && !validation.valid ? "cursor-not-allowed opacity-45" : "")}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_24rem]">
        <aside className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">Groups</h2>
            <button type="button" onClick={addGroup} className="rounded-md border border-cyan-300/25 bg-cyan-400/10 p-2 text-cyan-100" aria-label="Add group"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 space-y-2">
            {contract.groups.map((group) => (
              <div key={group.id} className={cn("rounded-md border p-2", selectedGroupId === group.id ? "border-cyan-200/55 bg-cyan-300/10" : "border-cyan-300/10 bg-slate-950/35")}>
                <button type="button" onClick={() => setSelectedGroupId(group.id)} className="w-full text-left text-sm font-black text-white">{group.name}</button>
                <p className="mt-1 text-xs font-bold text-slate-500">{group.parameters.length} parameters</p>
                <div className="mt-2 flex gap-1">
                  <button type="button" onClick={() => moveGroup(group.id, -1)} className="rounded border border-slate-600/50 p-1 text-slate-300"><ChevronUp className="h-3 w-3" /></button>
                  <button type="button" onClick={() => moveGroup(group.id, 1)} className="rounded border border-slate-600/50 p-1 text-slate-300"><ChevronDown className="h-3 w-3" /></button>
                  <button type="button" onClick={() => setCollapsedGroups((current) => current.includes(group.id) ? current.filter((id) => id !== group.id) : [...current, group.id])} className="rounded border border-slate-600/50 px-2 text-xs font-bold text-slate-300">{collapsedGroups.includes(group.id) ? "Expand" : "Collapse"}</button>
                  <button type="button" onClick={() => deleteGroup(group.id)} className="ml-auto rounded border border-rose-300/25 p-1 text-rose-100"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
              <Search className="h-4 w-4 text-cyan-200" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search parameters" className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" />
            </label>
            <div className={cn("inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-black", validation.valid ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100" : "border-rose-300/30 bg-rose-400/10 text-rose-100")}>
              <CheckCircle2 className="h-4 w-4" />
              {validation.valid ? "Validation Clear" : `${validation.issues.length} Issues`}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {filteredGroups.map((group) => {
              const collapsed = collapsedGroups.includes(group.id);
              return (
                <div key={group.id} className="rounded-md border border-cyan-300/10 bg-slate-950/35">
                  <div className="flex items-center justify-between gap-3 border-b border-cyan-300/10 px-3 py-2">
                    <input
                      value={group.name}
                      onChange={(event) => updateContract((draft) => {
                        const target = draft.groups.find((item) => item.id === group.id);
                        if (target) target.name = event.target.value;
                      })}
                      className="min-w-0 flex-1 bg-transparent text-sm font-black uppercase tracking-[0.18em] text-cyan-100 outline-none"
                    />
                    <button type="button" onClick={() => addParameter(group.id)} className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-100">Add Parameter</button>
                  </div>
                  {!collapsed ? (
                    <div className="divide-y divide-cyan-300/10">
                      {group.parameters.map((parameter) => {
                        const issueText = issueTextFor(parameter.key, validation.issues);
                        return (
                          <button
                            type="button"
                            key={parameter.key}
                            onClick={() => {
                              setSelectedGroupId(group.id);
                              setSelectedKey(parameter.key);
                            }}
                            className={cn("grid w-full gap-2 px-3 py-3 text-left transition md:grid-cols-[minmax(0,1.2fr)_8rem_minmax(0,1.4fr)]", selectedKey === parameter.key ? "bg-cyan-300/10" : "hover:bg-cyan-300/5")}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-mono text-sm font-black text-cyan-100">{parameter.key}</span>
                              <span className="block truncate text-xs font-semibold text-slate-400">{parameter.displayName}</span>
                            </span>
                            <span className="rounded-md border border-cyan-300/15 bg-slate-950/50 px-2 py-1 text-center text-xs font-black text-slate-200">{parameter.type}</span>
                            <span className={cn("truncate text-xs font-bold", issueText ? "text-rose-200" : "text-slate-400")}>{issueText || parameter.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4">
          {selectedParameter ? (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">Parameter Inspector</h2>
              <InspectorText label="Key" value={selectedParameter.key} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => {
                parameter.key = value;
                parameter.displayName = parameter.displayName || titleFromKey(value);
                parameter.rendererMapping = `renderer.parameters.${value}`;
                setSelectedKey(value);
              })} />
              <InspectorText label="Display Name" value={selectedParameter.displayName} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.displayName = value; })} />
              <InspectorText label="Description" value={selectedParameter.description} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.description = value; })} multiline />
              <label className="block">
                <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">Type</span>
                <select value={selectedParameter.type} onChange={(event) => updateParameter(selectedParameter.key, (parameter) => {
                  parameter.type = event.target.value as RendererParameterType;
                  parameter.defaultValue = defaultValueForType(parameter.type);
                })} className="mt-1 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm font-bold text-white outline-none">
                  {parameterTypes.map((type) => <option key={type} value={type} className="bg-slate-950">{type}</option>)}
                </select>
              </label>
              <InspectorText label="Default Value" value={stringifyDefaultValue(selectedParameter.defaultValue)} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.defaultValue = parseDefaultValue(value, parameter.type); })} />
              <div className="grid grid-cols-2 gap-2">
                <InspectorText label="Minimum" value={selectedParameter.minimum ?? ""} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.minimum = value === "" ? undefined : Number(value); })} />
                <InspectorText label="Maximum" value={selectedParameter.maximum ?? ""} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.maximum = value === "" ? undefined : Number(value); })} />
              </div>
              <InspectorText label="Unit" value={selectedParameter.unit ?? ""} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.unit = value; })} />
              <InspectorText label="Renderer Mapping" value={selectedParameter.rendererMapping} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.rendererMapping = value; })} />
              <InspectorText label="Validation" value={selectedParameter.validation} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.validation = value; })} multiline />
              <InspectorText label="Notes" value={selectedParameter.notes} onChange={(value) => updateParameter(selectedParameter.key, (parameter) => { parameter.notes = value; })} multiline />
              <label className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <input type="checkbox" checked={selectedParameter.required} onChange={(event) => updateParameter(selectedParameter.key, (parameter) => { parameter.required = event.target.checked; })} />
                Required
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => duplicateParameter(selectedParameter.key)} className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-100">Duplicate</button>
                <button type="button" onClick={() => deleteParameter(selectedParameter.key)} className="rounded-md border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-xs font-black text-rose-100">Delete</button>
                <button type="button" onClick={() => moveParameter(selectedParameter.key, -1)} className="rounded-md border border-slate-600/50 px-3 py-2 text-xs font-black text-slate-200">Move Up</button>
                <button type="button" onClick={() => moveParameter(selectedParameter.key, 1)} className="rounded-md border border-slate-600/50 px-3 py-2 text-xs font-black text-slate-200">Move Down</button>
              </div>
            </div>
          ) : <p className="text-sm text-slate-400">Select a parameter to inspect it.</p>}

          <div className="mt-5 border-t border-cyan-300/10 pt-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => copyToClipboard(formatRendererContractEditor("json", contract))} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black text-cyan-100"><Copy className="h-3 w-3" /> JSON</button>
              <button type="button" onClick={() => copyToClipboard(formatRendererContractEditor("markdown", contract))} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black text-cyan-100"><Copy className="h-3 w-3" /> Markdown</button>
              <button type="button" onClick={() => copyToClipboard(formatRendererContractEditor("plain", contract))} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black text-cyan-100"><Copy className="h-3 w-3" /> Text</button>
              <button type="button" onClick={() => downloadJson(contract)} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black text-cyan-100"><Download className="h-3 w-3" /> Download</button>
            </div>
            <div className="mt-3 rounded-md border border-cyan-300/10 bg-slate-950/60">
              <div className="flex items-center gap-2 border-b border-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
                <FileJson className="h-4 w-4" />
                Live JSON
              </div>
              <pre className="max-h-[22rem] overflow-auto p-3 text-xs leading-5 text-slate-300">{defaultsJson}</pre>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function InspectorText({
  label,
  value,
  onChange,
  multiline = false
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {multiline ? (
        <textarea value={String(value)} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-20 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 py-2 text-sm font-bold text-white outline-none" />
      ) : (
        <input value={String(value)} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm font-bold text-white outline-none" />
      )}
    </label>
  );
}

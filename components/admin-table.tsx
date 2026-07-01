"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Download, FileJson, FileUp, ImagePlus, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { downloadBlob, titleCase } from "@/lib/utils";
import type { FieldConfig, TableConfig } from "@/lib/tables";

type Row = Record<string, unknown>;
type AssetVariant = {
  size: number;
  width?: number;
  height?: number;
  url: string;
  filename: string;
};

const fallbackStatusOptions = ["Draft", "In Progress", "Ready", "Blocked", "Deprecated", "Mapped", "Needs ID Mapping"];
const assetUploadTables = ["assets", "upgrades", "buildings", "research"];
const upgradeIconSizes = [64, 96, 128, 160, 192, 256];
const largeAssetSizes = [1024];

function stringifyValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function normalizeValue(value: string, field: FieldConfig) {
  if (field.type === "number") {
    return Number(value || 0);
  }

  if (field.type === "array") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (field.type === "boolean") {
    return value === "true" || value === "on";
  }

  return value === "" ? null : value;
}

function rowMatches(row: Row, keys: string[], search: string) {
  if (!search.trim()) {
    return true;
  }

  const needle = search.toLowerCase();
  return keys.some((key) => stringifyValue(row[key]).toLowerCase().includes(needle));
}

function singularTableLabel(table: string) {
  if (table === "assets") {
    return "asset";
  }

  if (table === "research") {
    return "research";
  }

  return table.replace(/s$/, "");
}

export function AdminTable({ config, initialRows }: { config: TableConfig; initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [era, setEra] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editing, setEditing] = useState<Row | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sourceUploadRow, setSourceUploadRow] = useState<Row | null>(null);
  const [sourceUploadingId, setSourceUploadingId] = useState<string | null>(null);
  const [generateRow, setGenerateRow] = useState<Row | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [variants, setVariants] = useState<AssetVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sourceFileInputRef = useRef<HTMLInputElement | null>(null);
  const supportsAssetUploads = assetUploadTables.includes(config.table);
  const assetVariantSizes = config.table === "buildings" || config.table === "research" ? largeAssetSizes : upgradeIconSizes;

  const eras = useMemo(() => {
    if (!config.eraKey) {
      return [];
    }

    return Array.from(new Set(rows.map((row) => stringifyValue(row[config.eraKey as string])).filter(Boolean))).sort();
  }, [config.eraKey, rows]);

  const statusOptions = useMemo(() => {
    if (!config.statusKey) {
      return fallbackStatusOptions;
    }

    return Array.from(new Set([...fallbackStatusOptions, ...rows.map((row) => stringifyValue(row[config.statusKey as string])).filter(Boolean)])).sort();
  }, [config.statusKey, rows]);

  const typeOptions = useMemo(() => {
    if (!config.typeKey) {
      return [];
    }

    return Array.from(new Set(rows.map((row) => stringifyValue(row[config.typeKey as string])).filter(Boolean))).sort();
  }, [config.typeKey, rows]);

  const filtered = rows.filter((row) => {
    const matchesStatus = !config.statusKey || status === "all" || stringifyValue(row[config.statusKey]) === status;
    const matchesEra = !config.eraKey || era === "all" || stringifyValue(row[config.eraKey]) === era;
    const matchesType = !config.typeKey || typeFilter === "all" || stringifyValue(row[config.typeKey]) === typeFilter;
    return matchesStatus && matchesEra && matchesType && rowMatches(row, config.searchKeys, search);
  });

  async function saveRow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const row = config.fields.reduce<Row>((result, field) => {
      result[field.key] = normalizeValue(String(formData.get(field.key) ?? ""), field);
      return result;
    }, {});

    const response = await fetch(`/api/data/${config.table}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(row)
    });
    const payload = await response.json();

    if (response.ok) {
      setRows((current) => {
        const index = current.findIndex((item) => item.id === payload.row.id);
        if (index >= 0) {
          const next = [...current];
          next[index] = payload.row;
          return next;
        }
        return [payload.row, ...current];
      });
      setFormOpen(false);
      setEditing(null);
    }

    setSaving(false);
  }

  async function deleteCurrent(row: Row) {
    const name = stringifyValue(row.name || row.source_name || row.id);
    if (!window.confirm(`Delete ${name}?`)) {
      return;
    }

    const response = await fetch(`/api/data/${config.table}/${row.id}`, { method: "DELETE" });
    if (response.ok) {
      setRows((current) => current.filter((item) => item.id !== row.id));
    }
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const csv = await file.text();
    const response = await fetch(`/api/data/${config.table}`, {
      method: "POST",
      headers: { "content-type": "text/csv" },
      body: csv
    });
    const payload = await response.json();
    if (response.ok) {
      setRows((current) => {
        const next = [...current];
        for (const row of payload.rows as Row[]) {
          const index = next.findIndex((item) => item.id === row.id);
          if (index >= 0) {
            next[index] = row;
          } else {
            next.unshift(row);
          }
        }
        return next;
      });
    }
    event.target.value = "";
  }

  async function generateVariantsFor(row: Row, sourceId: string, assetId: string) {
    const response = await fetch("/api/assets/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source_table: config.table,
          source_id: sourceId,
          asset_id: assetId,
          sizes: assetVariantSizes
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "PNG variant generation failed.");
    }

    setRows((current) =>
      current.map((item) =>
        item.id === sourceId
          ? {
              ...item,
              ...(config.table === "assets" ? payload.row ?? {} : {}),
              asset_id: payload.asset_id ?? item.asset_id,
              file_url: payload.row?.file_url ?? item.file_url,
              export_status: payload.row?.export_status ?? item.export_status
            }
          : item
      )
    );

    if (generateRow?.id === row.id) {
      setVariants(payload.variants ?? []);
    }

    return (payload.variants ?? []) as AssetVariant[];
  }

  async function uploadSourcePsd(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const row = sourceUploadRow;
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".psd")) {
      window.alert("Please choose a PSD file.");
      return;
    }

    const sourceId = row ? stringifyValue(row.id) : "";
    const currentAssetId = row ? stringifyValue(row.asset_id) : "";
    setSourceUploadingId(sourceId || "new-source");
    const body = new FormData();
    body.append("source_table", row ? config.table : "assets");
    body.append("source_id", sourceId);
    body.append("asset_id", row && config.table === "assets" ? sourceId : currentAssetId);
    body.append("upload_kind", "source");
    body.append("asset_name", row ? stringifyValue(row.name || row.source_name || row.id) : file.name.replace(/\.[^/.]+$/, ""));
    body.append("file", file);

    const response = await fetch("/api/assets/upload", {
      method: "POST",
      body
    });
    const payload = await response.json();

    if (!response.ok) {
      window.alert(payload.error ?? "Source PSD upload failed.");
      setSourceUploadingId(null);
      setSourceUploadRow(null);
      return;
    }

    if (row) {
      setRows((current) =>
        current.map((item) =>
          item.id === sourceId
            ? {
                ...item,
                ...(config.table === "assets" ? payload.row ?? {} : {}),
                asset_id: payload.asset_id ?? item.asset_id,
                source_file_url: payload.source_file_url ?? item.source_file_url,
                source_file_type: "PSD",
                export_status: payload.row?.export_status ?? item.export_status
              }
            : item
        )
      );
    } else if (config.table === "assets") {
      setRows((current) => {
        const row = payload.row as Row;
        const index = current.findIndex((item) => item.id === row.id);
        if (index >= 0) {
          const next = [...current];
          next[index] = row;
          return next;
        }
        return [row, ...current];
      });
    }

    try {
      const nextSourceId = row ? sourceId : stringifyValue(payload.asset_id);
      const nextAssetId = stringifyValue(payload.asset_id);
      if (nextSourceId && nextAssetId) {
        await generateVariantsFor(row ?? (payload.row as Row), nextSourceId, nextAssetId);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Source PSD uploaded, but PNG variants could not be generated.");
    } finally {
      setSourceUploadingId(null);
      setSourceUploadRow(null);
    }
  }

  async function openVariantMenu(row: Row) {
    setGenerateRow(row);
    setVariants([]);
    setVariantsLoading(true);
    const sourceId = stringifyValue(row.id);
    const assetId = config.table === "assets" ? sourceId : stringifyValue(row.asset_id);

    try {
      const params = new URLSearchParams({
        source_table: config.table,
        source_id: sourceId,
        asset_id: assetId
      });
      const response = await fetch(`/api/assets/generate?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load PNG variants.");
      }

      setVariants(payload.variants ?? []);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not load PNG variants.");
      setGenerateRow(null);
    } finally {
      setVariantsLoading(false);
    }
  }

  async function regenerateVariants() {
    const row = generateRow;
    if (!row) {
      return;
    }

    const sourceId = stringifyValue(row.id);
    const currentAssetId = config.table === "assets" ? sourceId : stringifyValue(row.asset_id);
    setGeneratingId(sourceId);

    try {
      const nextVariants = await generateVariantsFor(row, sourceId, currentAssetId);
      setVariants(nextVariants);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "PNG variant generation failed.");
    } finally {
      setGeneratingId(null);
    }
  }

  async function downloadVariant(variant: AssetVariant) {
    const response = await fetch(variant.url);
    if (!response.ok) {
      window.alert("This PNG has not been generated yet. Click Regenerate All first.");
      return;
    }

    const png = await response.blob();
    downloadBlob(variant.filename, png, "image/png");
  }

  async function exportCsv() {
    const response = await fetch(`/api/export/${config.table}?format=csv`);
    const csv = await response.text();
    downloadBlob(`${config.table}.csv`, csv, "text/csv");
  }

  async function exportJson() {
    const response = await fetch(`/api/export/${config.table}.json`);
    const json = await response.text();
    downloadBlob(`${config.table}.json`, json, "application/json");
  }

  function openNewForm() {
    const empty = config.fields.reduce<Row>((result, field) => {
      result[field.key] = field.type === "number" ? 0 : field.type === "array" ? [] : "";
      return result;
    }, {});
    setEditing(empty);
    setFormOpen(true);
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Content Table</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{config.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
          {supportsAssetUploads ? (
            <input ref={sourceFileInputRef} type="file" accept=".psd,image/vnd.adobe.photoshop" hidden onChange={uploadSourcePsd} />
          ) : null}
          {config.table === "assets" ? (
            <Button
              type="button"
              onClick={() => {
                setSourceUploadRow(null);
                sourceFileInputRef.current?.click();
              }}
              disabled={sourceUploadingId !== null}
            >
              <FileUp className="h-4 w-4" />
              {sourceUploadingId === "new-source" ? "Uploading..." : "Source PSD"}
            </Button>
          ) : null}
          <Button type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button type="button" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button type="button" onClick={exportJson}>
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
          <Button type="button" onClick={openNewForm}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </section>

      <section className="rounded-md border border-cyan-400/15 bg-genesis-panel/95">
        <div className="flex flex-col gap-3 border-b border-cyan-400/15 p-4 xl:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${config.title.toLowerCase()}`}
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/60"
            />
          </label>
          {config.statusKey ? (
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}
          {config.eraKey ? (
            <select
              value={era}
              onChange={(event) => setEra(event.target.value)}
              className="h-10 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
            >
              <option value="all">All eras</option>
              {eras.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}
          {config.typeKey ? (
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
            >
              <option value="all">All types</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-950/55 text-xs uppercase tracking-[0.14em] text-slate-400">
              <tr>
                {config.columns.map((column) => (
                  <th key={column} className="border-b border-cyan-400/15 px-4 py-3 font-medium">
                    {titleCase(column)}
                  </th>
                ))}
                <th className="w-56 border-b border-cyan-400/15 px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={String(row.id)} className="border-b border-slate-800/80 hover:bg-cyan-300/[0.04]">
                  {config.columns.map((column) => (
                    <td key={column} className="max-w-[320px] px-4 py-3 text-slate-300">
                      {column === config.statusKey ? <StatusBadge value={stringifyValue(row[column])} /> : stringifyValue(row[column])}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {supportsAssetUploads ? (
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center rounded-md border border-cyan-300/20 text-cyan-100 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => {
                            setSourceUploadRow(row);
                            sourceFileInputRef.current?.click();
                          }}
                          disabled={sourceUploadingId === stringifyValue(row.id)}
                          aria-label={`Upload source PSD for ${singularTableLabel(config.table)}`}
                          title={`Upload source PSD for this ${singularTableLabel(config.table)}`}
                        >
                          <FileUp className="h-4 w-4" />
                        </button>
                      ) : null}
                      {supportsAssetUploads ? (
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center rounded-md border border-emerald-300/20 text-emerald-200 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => openVariantMenu(row)}
                          disabled={generatingId === stringifyValue(row.id)}
                          aria-label="Open PNG variants"
                          title="Open PNG size variants"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-md border border-blue-300/20 text-blue-200 hover:bg-blue-300/10"
                        onClick={() => {
                          setEditing(row);
                          setFormOpen(true);
                        }}
                        aria-label="Edit row"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-md border border-red-300/20 text-red-200 hover:bg-red-300/10"
                        onClick={() => deleteCurrent(row)}
                        aria-label="Delete row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveRow} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md border border-cyan-300/25 bg-[#07101e] shadow-glow">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/15 bg-[#07101e] p-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{stringifyValue(editing.id) ? "Edit" : "Add"} {config.title}</h3>
                <p className="text-sm text-slate-400">Values use local session data until Supabase environment credentials are configured.</p>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-md border border-slate-700 text-slate-300" onClick={() => setFormOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2">
              {config.fields.map((field) => (
                <label key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.key}
                      defaultValue={stringifyValue(editing[field.key])}
                      required={field.required}
                      rows={3}
                      className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
                    />
                  ) : field.type === "status" ? (
                    <select
                      name={field.key}
                      defaultValue={stringifyValue(editing[field.key]) || "Draft"}
                      className="h-10 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "boolean" ? (
                    <select
                      name={field.key}
                      defaultValue={String(Boolean(editing[field.key]))}
                      className="h-10 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  ) : (
                    <input
                      name={field.key}
                      type={field.type === "number" ? "number" : "text"}
                      defaultValue={stringifyValue(editing[field.key])}
                      required={field.required}
                      className="h-10 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-cyan-400/15 p-4">
              <Button type="button" className="border-slate-600 bg-slate-800/60 text-slate-200" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {generateRow ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-md border border-cyan-300/25 bg-[#07101e] shadow-glow">
            <div className="flex items-center justify-between border-b border-cyan-400/15 p-4">
              <div>
                <h3 className="text-lg font-semibold text-white">PNG Variants</h3>
                <p className="text-sm text-slate-400">{stringifyValue(generateRow.name || generateRow.source_name || generateRow.id)}</p>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-md border border-slate-700 text-slate-300" onClick={() => setGenerateRow(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
              {variantsLoading ? (
                <p className="col-span-full text-sm text-slate-400">Loading variants...</p>
              ) : (
                variants.map((variant) => (
                  <button
                    key={variant.size}
                    type="button"
                    onClick={() => downloadVariant(variant)}
                    className="rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 py-4 text-center text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
                  >
                    {variant.size} x {variant.size}
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-cyan-400/15 p-4">
              <Button type="button" className="border-slate-600 bg-slate-800/60 text-slate-200" onClick={() => setGenerateRow(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={regenerateVariants} disabled={generatingId === stringifyValue(generateRow.id)}>
                {generatingId === stringifyValue(generateRow.id) ? "Generating..." : "Regenerate All"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

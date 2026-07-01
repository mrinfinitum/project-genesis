"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, FileArchive, Image as ImageIcon, Search, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConceptualArtRecord } from "@/types/schema";

const previewableTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp"]);

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function isPreviewable(row: ConceptualArtRecord) {
  return previewableTypes.has(row.file_type);
}

export function ConceptualArtGallery({ initialRows }: { initialRows: ConceptualArtRecord[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedRow, setSelectedRow] = useState<ConceptualArtRecord | null>(null);

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return rows;
    }

    return rows.filter((row) =>
      [row.name, row.category, row.description, row.file_name, row.file_type, row.notes].some((value) => value.toLowerCase().includes(search))
    );
  }, [query, rows]);

  async function refreshRows() {
    const response = await fetch("/api/conceptual-art");
    const payload = (await response.json()) as { rows?: ConceptualArtRecord[]; error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Could not load conceptual art.");
      return;
    }

    setRows(payload.rows ?? []);
  }

  async function uploadConceptArt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const body = new FormData();
    body.append("file", file);
    body.append("name", name);
    body.append("category", category);
    body.append("description", description);
    body.append("notes", notes);

    const response = await fetch("/api/conceptual-art", {
      method: "POST",
      body
    });
    const payload = (await response.json()) as { row?: ConceptualArtRecord; error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Upload failed.");
      setLoading(false);
      return;
    }

    setFile(null);
    setName("");
    setCategory("");
    setDescription("");
    setNotes("");
    setMessage("Concept art uploaded.");
    await refreshRows();
    setLoading(false);
  }

  async function deleteConceptArt(row: ConceptualArtRecord) {
    if (!window.confirm(`Delete ${row.name}?`)) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch(`/api/conceptual-art/${encodeURIComponent(row.id)}`, {
      method: "DELETE"
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Delete failed.");
      setLoading(false);
      return;
    }

    setMessage("Concept art deleted.");
    await refreshRows();
    setLoading(false);
  }

  useEffect(() => {
    if (!selectedRow) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedRow(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedRow]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Art Library</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Conceptual Art</h2>
        </div>

        <form className="grid gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow lg:grid-cols-[14rem_12rem_1fr_auto]" onSubmit={uploadConceptArt}>
          <label className="block text-sm text-slate-200">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">File</span>
            <input
              accept=".psd,.png,.jpg,.jpeg,.webp,.gif,.tif,.tiff,.bmp,.pdf,image/png,image/jpeg,image/webp,image/gif,image/bmp,image/tiff,application/pdf,image/vnd.adobe.photoshop"
              className="block h-10 w-full cursor-pointer rounded-md border border-cyan-300/20 bg-slate-950/60 text-sm text-slate-300 file:mr-3 file:h-10 file:border-0 file:bg-cyan-400/10 file:px-3 file:text-cyan-100"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              type="file"
              required
            />
          </label>
          <label className="block text-sm text-slate-200">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Category</span>
            <input
              className="h-10 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-white outline-none transition focus:border-cyan-300/60"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </label>
          <label className="block text-sm text-slate-200">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Name</span>
            <input
              className="h-10 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-white outline-none transition focus:border-cyan-300/60"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <div className="flex items-end">
            <Button className="h-10 w-full" disabled={loading} type="submit">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
          <label className="block text-sm text-slate-200 lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Description</span>
            <textarea
              className="min-h-20 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 py-2 text-white outline-none transition focus:border-cyan-300/60"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="block text-sm text-slate-200 lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Notes</span>
            <textarea
              className="min-h-20 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 py-2 text-white outline-none transition focus:border-cyan-300/60"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </form>
      </div>

      <div className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          placeholder="Search conceptual art"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {message ? <p className="rounded-md border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm text-green-100">{message}</p> : null}
      {error ? <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredRows.map((row) => (
          <article
            key={row.id}
            className="group cursor-pointer overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/85 shadow-glow transition hover:-translate-y-0.5 hover:border-cyan-300/45"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRow(row)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedRow(row);
              }
            }}
          >
            <div className="grid aspect-square place-items-center bg-slate-950/65">
              {isPreviewable(row) ? (
                <img className="h-full w-full object-contain transition group-hover:scale-[1.02]" src={row.file_url} alt={row.name} />
              ) : (
                <div className="grid place-items-center gap-3 text-center text-slate-300">
                  <FileArchive className="h-12 w-12 text-cyan-200" />
                  <span className="max-w-48 break-all font-mono text-xs uppercase tracking-[0.12em] text-cyan-100">{row.file_name}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-base font-semibold text-white">{row.name}</h3>
                  <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                    {row.category || "Art"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{formatDate(row.created_at)}</p>
              </div>
              {row.description ? <p className="line-clamp-3 text-sm leading-6 text-slate-300">{row.description}</p> : null}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {row.file_type || "file"}
                </span>
                <span>{formatBytes(row.file_size)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <a
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20"
                  href={row.file_url}
                  download={row.file_name}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
                <Button
                  className="h-9 border-red-400/25 bg-red-400/10 px-3 text-red-100 hover:border-red-300/60 hover:bg-red-400/20"
                  disabled={loading}
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteConceptArt(row);
                  }}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!filteredRows.length ? (
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-8 text-center text-sm text-slate-400 shadow-glow">No conceptual art uploaded.</div>
      ) : null}

      {selectedRow ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-4 backdrop-blur-md" onClick={() => setSelectedRow(null)}>
          <div
            className="grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-md border border-cyan-300/20 bg-[#07101e] shadow-glow xl:grid-cols-[minmax(0,1fr)_22rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid min-h-[50vh] place-items-center bg-slate-950/70 p-4">
              {isPreviewable(selectedRow) ? (
                <img className="max-h-[78vh] w-full object-contain" src={selectedRow.file_url} alt={selectedRow.name} />
              ) : (
                <div className="grid max-w-md place-items-center gap-4 text-center">
                  <FileArchive className="h-16 w-16 text-cyan-200" />
                  <div>
                    <p className="text-lg font-semibold text-white">{selectedRow.file_name}</p>
                    <p className="mt-2 text-sm text-slate-400">{selectedRow.file_type || "Source file"}</p>
                  </div>
                </div>
              )}
            </div>

            <aside className="flex max-h-[92vh] flex-col overflow-y-auto border-t border-cyan-300/15 p-5 xl:border-l xl:border-t-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{selectedRow.category || "Concept"}</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{selectedRow.name}</h3>
                </div>
                <Button className="h-9 w-9 px-0" onClick={() => setSelectedRow(null)} type="button">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 space-y-4 text-sm text-slate-300">
                {selectedRow.description ? <p className="leading-6">{selectedRow.description}</p> : null}
                {selectedRow.notes ? <p className="rounded-md border border-slate-700/70 bg-slate-950/45 p-3 leading-6 text-slate-300">{selectedRow.notes}</p> : null}

                <dl className="grid grid-cols-2 gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-xs">
                  <div>
                    <dt className="uppercase tracking-[0.16em] text-slate-500">Type</dt>
                    <dd className="mt-1 break-all text-slate-200">{selectedRow.file_type || "file"}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.16em] text-slate-500">Size</dt>
                    <dd className="mt-1 text-slate-200">{formatBytes(selectedRow.file_size)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="uppercase tracking-[0.16em] text-slate-500">Uploaded</dt>
                    <dd className="mt-1 text-slate-200">{formatDate(selectedRow.created_at)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="uppercase tracking-[0.16em] text-slate-500">File</dt>
                    <dd className="mt-1 break-all text-slate-200">{selectedRow.file_name}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20"
                  href={selectedRow.file_url}
                  download={selectedRow.file_name}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
                <a
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-600/60 bg-slate-900/80 px-3 text-sm font-medium text-slate-100 transition hover:border-slate-400"
                  href={selectedRow.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  );
}

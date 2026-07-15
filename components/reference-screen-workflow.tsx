"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, ClipboardList, Database, FileText, ImagePlus, Layers3, PencilLine, UploadCloud } from "lucide-react";
import { WorkspaceBadge, WorkspacePanel } from "@/components/ui/workspace";

type ReferenceScreenWorkflowProps = {
  featureId: string;
  title?: string;
  description?: string;
  assetsHref?: string;
  componentsHref?: string;
  runtimeHref?: string;
  handoffHref?: string;
  screenSpecHref?: string;
};

const storagePrefix = "project-genesis-reference-screen";

function storageKey(featureId: string) {
  return `${storagePrefix}:${featureId}`;
}

function workflowLinks(props: ReferenceScreenWorkflowProps) {
  return [
    { label: "Assets", icon: Box, href: props.assetsHref ?? `/asset-library?screen=${props.featureId}`, description: "Linked art, icons, backgrounds, derivatives, and publication status." },
    { label: "Components", icon: Layers3, href: props.componentsHref ?? `/component-library?screen=${props.featureId}`, description: "Shared component contracts and implementation targets." },
    { label: "Runtime", icon: Database, href: props.runtimeHref ?? "/api/export/game-runtime-data.json", description: "Canonical data consumed by clients. Visual layout is not exported." },
    { label: "Handoff", icon: ClipboardList, href: props.handoffHref ?? `/screen-designer/${props.featureId}#handoff`, description: "Copy-ready implementation brief for the Game repository." }
  ];
}

export function ReferenceScreenWorkflow(props: ReferenceScreenWorkflowProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState("No reference screenshot uploaded");
  const [notes, setNotes] = useState("");
  const links = useMemo(() => workflowLinks(props), [props]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey(props.featureId));
    if (!saved) return;
    try {
      const payload = JSON.parse(saved) as { screenshot?: string; fileLabel?: string; notes?: string };
      if (payload.screenshot) setScreenshot(payload.screenshot);
      if (payload.fileLabel) setFileLabel(payload.fileLabel);
      if (payload.notes) setNotes(payload.notes);
    } catch {
      window.localStorage.removeItem(storageKey(props.featureId));
    }
  }, [props.featureId]);

  function persist(next: { screenshot?: string | null; fileLabel?: string; notes?: string }) {
    const payload = {
      screenshot: next.screenshot ?? screenshot,
      fileLabel: next.fileLabel ?? fileLabel,
      notes: next.notes ?? notes
    };
    window.localStorage.setItem(storageKey(props.featureId), JSON.stringify(payload));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      const label = `${file.name} / ${Math.round(file.size / 1024)} KB`;
      setScreenshot(result);
      setFileLabel(label);
      persist({ screenshot: result, fileLabel: label });
    };
    reader.readAsDataURL(file);
  }

  return (
    <WorkspacePanel title={props.title ?? "Reference Screenshot"} icon={ImagePlus}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <WorkspaceBadge value="Game UI owned by Game repo" />
            <WorkspaceBadge value="Runtime unchanged" />
            <WorkspaceBadge value="Future annotations supported" />
          </div>
          <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-300">
            {props.description ?? "Use the current Game screenshot as the visual source of truth. Studio keeps assets, content, runtime contracts, components, specifications, and handoffs; it does not fabricate replacement game layouts."}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />

          {screenshot ? (
            <div className="mt-4 overflow-hidden rounded-md border border-cyan-300/20 bg-slate-950/60">
              <div className="relative aspect-video w-full">
                <Image src={screenshot} alt={`${props.featureId} reference screenshot`} fill unoptimized className="object-contain" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cyan-300/10 p-3">
                <p className="min-w-0 truncate text-sm font-semibold text-slate-300">{fileLabel}</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
                  <UploadCloud className="h-4 w-4" />
                  Replace Screenshot
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 flex min-h-72 w-full flex-col items-center justify-center rounded-md border border-dashed border-cyan-300/35 bg-slate-950/55 p-8 text-center transition hover:border-cyan-200 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
            >
              <UploadCloud className="h-12 w-12 text-cyan-200" />
              <span className="mt-4 text-2xl font-black text-white">Upload Current Game Screenshot</span>
              <span className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">PNG, JPG, or WebP. This screenshot becomes the visual reference for review, annotations, assets, components, runtime checks, and implementation handoff.</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
            <div className="flex items-center gap-2 text-cyan-100">
              <PencilLine className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">Annotations</p>
            </div>
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                persist({ notes: event.target.value });
              }}
              placeholder="Future markup notes, callouts, parity issues, or screenshot context"
              className="mt-3 min-h-28 w-full rounded-md border border-cyan-300/15 bg-slate-950/80 p-3 text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>
          {props.screenSpecHref ? (
            <Link href={props.screenSpecHref} className="flex items-start gap-3 rounded-md border border-cyan-300/15 bg-slate-950/45 p-3 transition hover:border-cyan-300/45 hover:bg-cyan-300/10">
              <FileText className="mt-0.5 h-4 w-4 text-cyan-200" />
              <span>
                <span className="block text-sm font-black text-white">Screen Specification</span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">Canonical component, data, state, and handoff contract.</span>
              </span>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {links.map(({ label, icon: Icon, href, description }) => (
          <Link key={label} href={href} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-3 transition hover:border-cyan-300/45 hover:bg-cyan-300/10">
            <div className="flex items-center gap-2 text-cyan-100">
              <Icon className="h-4 w-4" />
              <p className="text-sm font-black text-white">{label}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
          </Link>
        ))}
      </div>
    </WorkspacePanel>
  );
}

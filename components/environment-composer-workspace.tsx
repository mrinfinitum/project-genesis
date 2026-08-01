"use client";

import { Blend, CircleHelp, Download, FileImage, Palette, Sparkles } from "lucide-react";
import {
  environmentComposerContract,
  environmentComposerRuntimeContract,
  environmentThemes,
  type EnvironmentTheme
} from "@/lib/environment-composer";

export type EnvironmentComposerView = "themes" | "export";

const viewCopy: Record<EnvironmentComposerView, { eyebrow: string; title: string; description: string }> = {
  themes: {
    eyebrow: "Environment Composer",
    title: "Themes",
    description: "Define compatible color palettes, lighting, fog, particles, depth of field, and bloom for canonical environment presentation."
  },
  export: {
    eyebrow: "Environment Composer",
    title: "Runtime Export",
    description: "Review the sanitized environment contract published to clients. Runtime exports references and artistic intent, never textures or PSD source paths."
  }
};

function ThemeCard({ theme }: { theme: EnvironmentTheme }) {
  return (
    <article className="overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/88">
      <div className="flex h-24">
        {theme.colorPalette.map((color) => <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />)}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">{theme.displayName}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">{theme.description}</p>
          </div>
          <Palette className="h-5 w-5 shrink-0 text-cyan-200" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded border border-cyan-300/10 p-2"><p className="text-[0.58rem] uppercase text-slate-500">Assets</p><p className="mt-1 font-black text-white">{theme.allowedAssetIds.length}</p></div>
          <div className="rounded border border-cyan-300/10 p-2"><p className="text-[0.58rem] uppercase text-slate-500">Particles</p><p className="mt-1 font-black text-white">{Math.round(theme.particleDensity * 100)}%</p></div>
          <div className="rounded border border-cyan-300/10 p-2"><p className="text-[0.58rem] uppercase text-slate-500">Bloom</p><p className="mt-1 font-black text-white">{Math.round(theme.bloom * 100)}%</p></div>
        </div>
      </div>
    </article>
  );
}

export function EnvironmentComposerWorkspace({ initialView }: { initialView: EnvironmentComposerView }) {
  const copy = viewCopy[initialView];

  return (
    <main className="space-y-5">
      <section className="studio-material-command rounded-md p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{copy.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{copy.description}</p>
      </section>

      {initialView === "themes" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {environmentThemes.map((theme) => <ThemeCard key={theme.id} theme={theme} />)}
        </section>
      ) : null}

      {initialView === "export" ? (
        <section className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <aside className="studio-material-command rounded-md p-4">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-300">Contract Summary</p>
            <dl className="mt-4 space-y-3">
              {[
                ["Version", environmentComposerContract.version],
                ["Environment Types", environmentComposerContract.environmentTypes.length],
                ["Profiles", environmentComposerContract.profiles.length],
                ["Themes", environmentComposerContract.themes.length],
                ["Asset References", environmentComposerContract.layerAssets.length],
                ["Textures Embedded", "No"],
                ["Rendering Owner", "Client / Unity"]
              ].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 border-b border-cyan-300/10 pb-3"><dt className="text-xs font-bold text-slate-500">{label}</dt><dd className="text-right text-sm font-black text-white">{value}</dd></div>)}
            </dl>
            <a href="/api/export/environment-composer.json" download className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-50">
              <Download className="h-4 w-4" />
              Download Contract
            </a>
            <div className="mt-4 flex gap-2 rounded-md border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/80">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
              PSD source masters and private paths are intentionally excluded. Only stable references and public derivative paths can publish.
            </div>
          </aside>
          <div className="studio-material-command min-w-0 rounded-md p-4">
            <div className="flex items-center gap-2">
              <Blend className="h-4 w-4 text-cyan-200" />
              <h2 className="text-sm font-black text-white">Sanitized Runtime Preview</h2>
            </div>
            <pre className="mt-3 max-h-[42rem] overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/65 p-4 text-xs leading-6 text-cyan-50/85">{JSON.stringify(environmentComposerRuntimeContract(), null, 2)}</pre>
          </div>
        </section>
      ) : null}

      <section className="studio-material-command grid gap-3 rounded-md p-4 md:grid-cols-2">
        <div className="flex items-start gap-3"><FileImage className="mt-0.5 h-5 w-5 text-cyan-200" /><div><p className="text-sm font-black text-white">PSD stays the master</p><p className="mt-1 text-xs leading-5 text-slate-500">Photoshop files remain private source artwork. Studio publishes approved derivatives and canonical presentation intent.</p></div></div>
        <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-cyan-200" /><div><p className="text-sm font-black text-white">Client-owned rendering</p><p className="mt-1 text-xs leading-5 text-slate-500">Studio defines compatible themes and exports. Unity or another client owns final scene rendering.</p></div></div>
      </section>
    </main>
  );
}

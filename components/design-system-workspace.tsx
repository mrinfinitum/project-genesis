"use client";

import { useMemo, useState } from "react";
import {
  Accessibility,
  Box,
  CheckCircle2,
  Clipboard,
  Component,
  Download,
  Grid3X3,
  Layers3,
  MousePointer2,
  Palette,
  Sparkles,
  Type,
  WandSparkles
} from "lucide-react";
import { noverisDesignLanguage } from "@/lib/design-language";
import { cn } from "@/lib/utils";

type WorkspaceSection = "dashboard" | "tokens" | "colors" | "typography" | "spacing" | "grid" | "elevation" | "glass" | "glow" | "iconography" | "components" | "layouts" | "motion" | "interaction" | "accessibility" | "unity" | "documentation";

const sections: Array<{ id: WorkspaceSection; label: string; icon: typeof Palette }> = [
  { id: "dashboard", label: "Design Dashboard", icon: Palette },
  { id: "tokens", label: "Design Tokens", icon: Type },
  { id: "colors", label: "Color System", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "spacing", label: "Spacing System", icon: Layers3 },
  { id: "grid", label: "Grid System", icon: Grid3X3 },
  { id: "elevation", label: "Elevation & Shadows", icon: Layers3 },
  { id: "glass", label: "Glass Materials", icon: Box },
  { id: "glow", label: "Glow System", icon: Sparkles },
  { id: "iconography", label: "Iconography", icon: WandSparkles },
  { id: "components", label: "Component Library", icon: Component },
  { id: "layouts", label: "Layout Rules", icon: Grid3X3 },
  { id: "motion", label: "Motion System", icon: Sparkles },
  { id: "interaction", label: "Interaction Rules", icon: MousePointer2 },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "unity", label: "Unity Export", icon: Download },
  { id: "documentation", label: "Documentation", icon: Box }
];

function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <div className="border-b border-cyan-300/15 pb-5">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-50">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}

function TokenPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-cyan-300/20 bg-slate-950/50 px-2.5 py-1 text-xs font-medium text-slate-200">{children}</span>;
}

export function DesignSystemWorkspace() {
  const [section, setSection] = useState<WorkspaceSection>("dashboard");
  const [copied, setCopied] = useState(false);
  const language = noverisDesignLanguage;
  const validation = useMemo(() => ({ status: "Ready", issueCount: 0 }), []);
  const colorTokens = Object.values(language.tokens.colors);
  const typographyTokens = Object.values(language.tokens.typography);
  const tokenSections: WorkspaceSection[] = ["tokens", "colors", "typography", "spacing", "grid", "elevation", "glass", "glow", "iconography"];
  const tokenView = tokenSections.includes(section);

  async function copyPrompt() {
    await navigator.clipboard.writeText(language.promptProfile.prompt);
    setCopied(true);
  }

  return (
    <main className="mx-auto w-full max-w-[1800px] px-5 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-cyan-300/15 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Creative Production</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-50">NOVERIS Design Language</h1>
          <p className="mt-2 text-sm text-slate-400">Canonical definitions for every client surface. Version {language.version}.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 font-semibold text-emerald-100"><CheckCircle2 className="h-3.5 w-3.5" /> Published</span>
          <span className="rounded-full border border-cyan-300/20 px-3 py-1.5 font-medium text-slate-300">Unity JSON</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="h-fit rounded-lg border border-cyan-300/20 bg-slate-950/55 p-2 xl:sticky xl:top-5">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  section === item.id ? "bg-cyan-300/15 text-cyan-50 ring-1 ring-inset ring-cyan-300/35" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </aside>

        <section className="min-w-0 rounded-lg border border-cyan-300/20 bg-slate-950/45 p-5 lg:p-7">
          {section === "dashboard" && (
            <div className="space-y-6">
              <SectionTitle eyebrow="Canonical Library" title="A quiet, disciplined visual system" detail="NOVERIS combines NASA mission-control clarity, Apple-like restraint, and premium science-fiction strategy. The Design Language is the required source for future Unity screens; Unity owns the implementation." />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Token groups", "9", "Color, type, spacing, grid, borders, shadows, glass, glow, icons"],
                  ["Components", String(language.components.length), "Versioned controls with Unity prefab identifiers"],
                  ["Layout templates", String(language.layouts.length), "Required screen inheritance"],
                  ["Validation", validation.status, validation.issueCount ? `${validation.issueCount} issues` : "No open contract issues"]
                ].map(([label, value, detail]) => (
                  <div key={label} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-50">{value}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Visual Character</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Scientific", "Elegant", "Calm", "Minimal", "Purposeful", "Sophisticated", "High-end", "Timeless"].map((item) => <TokenPill key={item}>{item}</TokenPill>)}
                  </div>
                  <p className="mt-5 text-sm leading-6 text-slate-400">No cyberpunk, military, alien, fantasy, hacker UI, or neon overload. Glow remains reserved for meaningful state.</p>
                </div>
                <div className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Screen Inheritance</p>
                  <ol className="mt-4 space-y-3 text-sm text-slate-300">
                    {language.layouts[0].sequence.map((item, index) => <li key={item} className="flex gap-3"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-cyan-300/25 text-xs text-cyan-100">{index + 1}</span><span className="capitalize">{item.replaceAll("-", " ")}</span></li>)}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {tokenView && (
            <div className="space-y-7">
              <SectionTitle eyebrow="Design Tokens" title={section === "tokens" ? "Color, typography, material, and spatial definitions" : sections.find((item) => item.id === section)?.label ?? "Design Tokens"} detail="Values are canonical data, not local styling suggestions. Use token IDs in components and Unity mappings." />
              {(section === "tokens" || section === "colors") && <div>
                <h3 className="text-base font-semibold text-slate-100">Color System</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {colorTokens.map((token) => (
                    <div key={token.id} className="flex min-w-0 items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 p-3">
                      <span className="h-10 w-10 shrink-0 rounded-md border border-white/15" style={{ background: token.value.startsWith("rgba") ? "rgba(120,180,255,0.18)" : token.value }} />
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-100">{token.displayName}</p><p className="truncate font-mono text-xs text-cyan-100">{token.value}</p></div>
                    </div>
                  ))}
                </div>
              </div>}
              {(section === "tokens" || section === "typography") && <div><h3 className="text-base font-semibold text-slate-100">Typography</h3><div className="mt-4 space-y-2">{typographyTokens.map((token) => <div key={token.id} className="flex items-center justify-between gap-4 rounded-md border border-cyan-300/15 bg-slate-950/50 px-4 py-3"><span className="font-semibold text-slate-100">{token.id.replace("type.", "")}</span><span className="text-xs text-slate-400">{token.weight} / {token.size}px / {token.lineHeight}</span></div>)}</div></div>}
              {(section === "tokens" || section === "spacing" || section === "grid") && <div><h3 className="text-base font-semibold text-slate-100">Spacing and Grid</h3><div className="mt-4 flex flex-wrap gap-2">{language.tokens.spacing.values.map((value) => <TokenPill key={value}>{value}px</TokenPill>)}</div><div className="mt-4 space-y-2">{language.tokens.grid.map((grid) => <div key={grid.id} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-3 text-sm text-slate-300"><span className="font-semibold text-slate-100">{grid.columns}-column {grid.id.replace("grid.", "")}</span><span className="ml-3 text-slate-500">Gutter {grid.gutter}px / margin {grid.margin}px</span></div>)}</div></div>}
              {(section === "tokens" || section === "elevation" || section === "glass") && <div><h3 className="text-base font-semibold text-slate-100">Glass and Elevation</h3><div className="mt-4 flex flex-wrap gap-2">{language.tokens.glassMaterials.map((material) => <TokenPill key={material.id}>{material.displayName}</TokenPill>)}{Object.values(language.tokens.shadows).map((shadow) => <TokenPill key={shadow.id}>{shadow.id.replace("shadow.", "")}</TokenPill>)}</div></div>}
              {(section === "tokens" || section === "glow") && <div><h3 className="text-base font-semibold text-slate-100">Glow System</h3><div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{language.tokens.glow.map((glow) => <div key={glow.id} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-3"><p className="font-semibold text-slate-100">{glow.displayName}</p><p className="mt-1 text-xs text-slate-400">{glow.appliesTo.join(", ")}</p></div>)}</div></div>}
              {(section === "tokens" || section === "iconography") && <div><h3 className="text-base font-semibold text-slate-100">Iconography</h3><p className="mt-2 text-sm text-slate-400">White stroke, {language.tokens.iconography.strokeWidth}px consistent line width, minimal fill, and accent color only for state.</p><div className="mt-3 flex flex-wrap gap-2">{language.tokens.iconography.sizes.map((size) => <TokenPill key={size}>{size}px</TokenPill>)}</div></div>}
            </div>
          )}

          {section === "components" && (
            <div className="space-y-6"><SectionTitle eyebrow="Component Library" title="Versioned building blocks" detail="Every component resolves visual references through canonical token IDs and exposes a Unity prefab identifier." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{language.components.map((component) => <div key={component.id} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-100">{component.displayName}</p><p className="mt-1 text-xs text-slate-500">{component.category}</p></div><span className="rounded border border-cyan-300/20 px-2 py-0.5 font-mono text-[10px] text-cyan-100">v{component.version}</span></div><div className="mt-4 flex flex-wrap gap-1.5">{component.visualTokens.colors.slice(0, 2).map((token) => <TokenPill key={token}>{token.replace("color.", "")}</TokenPill>)}</div><p className="mt-4 truncate font-mono text-xs text-slate-500">{component.unityPrefabId}</p></div>)}</div></div>
          )}

          {section === "layouts" && <div className="space-y-6"><SectionTitle eyebrow="Layout Rules" title="Screen templates are required, not optional" detail="Every future screen inherits from one of these templates. Individual screens may compose content within the defined frame, but may not invent visual language." /><div className="space-y-4">{language.layouts.map((layout) => <div key={layout.id} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-50">{layout.displayName}</h3><p className="mt-1 text-sm text-slate-400">{layout.appliesTo.join(", ")}</p></div><TokenPill>Inheritance required</TokenPill></div><div className="mt-5 flex flex-wrap items-center gap-2">{layout.sequence.map((step, index) => <span key={step} className="flex items-center gap-2"><TokenPill>{step.replaceAll("-", " ")}</TokenPill>{index < layout.sequence.length - 1 ? <span className="text-slate-600">/</span> : null}</span>)}</div></div>)}</div></div>}

          {section === "motion" && <div className="space-y-6"><SectionTitle eyebrow="Motion System" title="Motion clarifies state" detail="NOVERIS uses short, deliberate transitions. Linear timing and continuous decorative animation are prohibited." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{language.motion.durations.map((duration) => <div key={duration.id} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-4"><p className="text-xl font-semibold text-slate-50">{duration.milliseconds}ms</p><p className="mt-1 text-xs text-slate-500">{duration.id}</p></div>)}</div><div className="grid gap-3 lg:grid-cols-2">{language.motion.easing.map((easing) => <div key={easing.id} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-4"><p className="font-semibold text-slate-100">{easing.id.replace("easing.", "")}</p><p className="mt-1 font-mono text-xs text-cyan-100">{easing.value}</p><p className="mt-2 text-sm text-slate-400">{easing.usage}</p></div>)}</div></div>}

          {section === "interaction" && <div className="space-y-6"><SectionTitle eyebrow="Interaction Rules" title="Consistent feedback for every control" detail="State changes stay quiet and legible. Glow is limited to hover, selection, focus, active Civilization Core, Research Ring, and Technology Ring." /><div className="grid gap-3 md:grid-cols-2">{language.interaction.stateRules.map((rule) => <div key={rule.state} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-4"><div className="flex items-center justify-between"><h3 className="font-semibold capitalize text-slate-100">{rule.state}</h3><span className="text-xs text-cyan-100">{rule.allowedGlow ? "Glow permitted" : "No glow"}</span></div><p className="mt-3 text-sm leading-6 text-slate-400">{rule.visualChange}</p><p className="mt-3 text-xs text-slate-500">{rule.requiredFeedback}</p></div>)}</div></div>}

          {section === "accessibility" && <div className="space-y-6"><SectionTitle eyebrow="Accessibility" title="A professional interface is accessible by default" detail="These requirements travel with every future Unity screen and component implementation." /><div className="grid gap-3 md:grid-cols-2">{[["Minimum text", `${language.accessibility.minimumFontSize}px`], ["Contrast", language.accessibility.minimumContrast], ["Focus outline", language.accessibility.focusOutline], ["Minimum target", `${language.accessibility.minimumTargetSize}px`], ["Keyboard", language.accessibility.keyboardNavigation], ["Controller", language.accessibility.controllerNavigation]].map(([label, value]) => <div key={label} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 text-sm leading-6 text-slate-200">{value}</p></div>)}</div></div>}

          {section === "unity" && <div className="space-y-6"><SectionTitle eyebrow="Unity Export" title="Definitions only. Unity owns implementation." detail="The published JSON contains all color, typography, spacing, component, layout, motion, and interaction definitions. No Unity layout implementation or generated code is stored here." /><div className="rounded-md border border-cyan-300/20 bg-slate-950/60 p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold text-slate-100">{language.unityExport.endpoint}</p><p className="mt-1 text-sm text-slate-400">{language.unityExport.format.toUpperCase()} / {language.unityExport.rootKey} / {language.unityExport.validationCode}</p></div><a className="inline-flex items-center gap-2 rounded-md border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-300/20" href={language.unityExport.endpoint} download><Download className="h-4 w-4" /> Download JSON</a></div></div></div>}

          {section === "documentation" && <div className="space-y-6"><SectionTitle eyebrow="Documentation" title="Reusable NOVERIS visual prompt profile" detail="This profile is used by the canonical visual generators so art and UI creation begin from the same design language." /><div className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-semibold text-slate-100">{language.promptProfile.title}</h3><p className="mt-1 text-sm text-slate-400">Used by {language.promptProfile.consumers.join(", ")}.</p></div><button type="button" onClick={copyPrompt} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-300/20"><Clipboard className="h-4 w-4" />{copied ? "Copied" : "Copy prompt"}</button></div><p className="mt-5 whitespace-pre-wrap rounded-md border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">{language.promptProfile.prompt}</p><div className="mt-4 flex flex-wrap gap-2">{language.promptProfile.consumers.map((consumer) => <TokenPill key={consumer}>{consumer}</TokenPill>)}</div></div></div>}
        </section>
      </div>
    </main>
  );
}

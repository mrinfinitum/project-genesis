"use client";

import { useMemo, useState } from "react";
import { Archive, CheckCircle2, Copy, Download, FileJson, GitBranch, History, Layers3, RotateCcw, SlidersHorizontal } from "lucide-react";
import { ProductionCopyButton } from "@/components/production/copy-button";
import {
  CANONICAL_SURFACE_PROFILE_ID,
  CANONICAL_SURFACE_PROFILE_NAME,
  blenderFieldMappings,
  canonicalSurfaceShaderContract,
  cloneSurfaceProfile,
  createSurfaceProfile,
  duplicateSurfaceProfile,
  formatJson,
  getModuleContract,
  minifyJson,
  relatedRenderSystems,
  resetSurfaceModule,
  surfaceShaderModules
} from "@/lib/render-engine/canonical-render-engine";
import { validateSurfaceProfile } from "@/lib/render-engine/render-validation";
import type { RenderColorStop, RenderParameterDefinition, RenderSurfaceModule, RenderSurfaceModuleId, RenderSurfaceProfile } from "@/types/render-engine";

type BottomTab = "validation" | "json" | "mapping" | "history";

function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "green" | "amber" | "red" | "slate" }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
      : tone === "amber"
        ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
        : tone === "red"
          ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
          : tone === "slate"
            ? "border-slate-500/30 bg-slate-950/50 text-slate-300"
            : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  return <span className={`rounded-md border px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] ${toneClass}`}>{children}</span>;
}

function Button({ children, onClick, disabled = false }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:border-slate-600/30 disabled:bg-slate-950/40 disabled:text-slate-500"
    >
      {children}
    </button>
  );
}

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function profileTimestamp() {
  return new Date().toISOString();
}

function coordinateAxis(key: string): 0 | 1 | 2 | null {
  if (key.endsWith("X")) return 0;
  if (key.endsWith("Y")) return 1;
  if (key.endsWith("Z")) return 2;
  return null;
}

function moduleStatusTone(status: string) {
  if (status === "Ready") return "green";
  if (status === "Error") return "red";
  if (status === "Warning") return "amber";
  return "slate";
}

function getParameterValue(profile: RenderSurfaceProfile, moduleId: RenderSurfaceModuleId, key: string): unknown {
  if (moduleId === "coordinates") {
    const axis = coordinateAxis(key);
    if (key.startsWith("location") && axis !== null) return profile.coordinates.location[axis];
    if (key.startsWith("rotation") && axis !== null) return profile.coordinates.rotation[axis];
    if (key.startsWith("scale") && axis !== null) return profile.coordinates.scale[axis];
    return profile.coordinates[key as "coordinateSource" | "mappingType"];
  }
  if (moduleId === "planetGeneration") {
    const sea = profile.planetGeneration.seaLevel;
    const mask = profile.planetGeneration.continentMask;
    const mapping: Record<string, unknown> = {
      continentNoiseType: profile.planetGeneration.continentNoiseType,
      continentDimensions: profile.planetGeneration.continentDimensions,
      continentNormalize: profile.planetGeneration.normalize,
      continentScale: profile.planetGeneration.scale,
      continentDetail: profile.planetGeneration.detail,
      continentRoughness: profile.planetGeneration.roughness,
      continentLacunarity: profile.planetGeneration.lacunarity,
      continentDistortion: profile.planetGeneration.distortion,
      seaLevelFromMin: sea.fromMin,
      seaLevelFromMax: sea.fromMax,
      seaLevelToMin: sea.toMin,
      seaLevelToMax: sea.toMax,
      seaLevelClamp: sea.clamp,
      continentMaskInterpolation: mask.interpolation,
      continentMaskBlackPosition: mask.blackPosition,
      continentMaskWhitePosition: mask.whitePosition
    };
    return mapping[key];
  }
  if (moduleId === "terrainGeneration") {
    const mapping: Record<string, unknown> = {
      terrainNoiseType: profile.terrainGeneration.noiseType,
      terrainDimensions: profile.terrainGeneration.dimensions,
      terrainNormalize: profile.terrainGeneration.normalize,
      terrainScale: profile.terrainGeneration.scale,
      terrainDetail: profile.terrainGeneration.detail,
      terrainRoughness: profile.terrainGeneration.roughness,
      terrainLacunarity: profile.terrainGeneration.lacunarity,
      terrainDistortion: profile.terrainGeneration.distortion,
      terrainBlendMode: profile.terrainGeneration.blendMode,
      terrainBlendFactor: profile.terrainGeneration.blendFactor,
      terrainClampResult: profile.terrainGeneration.clampResult,
      terrainClampFactor: profile.terrainGeneration.clampFactor
    };
    return mapping[key];
  }
  if (moduleId === "elevation") {
    const mapping: Record<string, unknown> = {
      mountainNoiseType: profile.elevation.mountainNoiseType,
      mountainDimensions: profile.elevation.mountainDimensions,
      mountainNormalize: profile.elevation.mountainNormalize,
      mountainScale: profile.elevation.mountainScale,
      mountainDetail: profile.elevation.mountainDetail,
      mountainRoughness: profile.elevation.mountainRoughness,
      mountainLacunarity: profile.elevation.mountainLacunarity,
      mountainDistortion: profile.elevation.mountainDistortion,
      elevationBlendMode: profile.elevation.blendMode,
      elevationBlendFactor: profile.elevation.blendFactor,
      elevationFromMin: profile.elevation.fromMin,
      elevationFromMax: profile.elevation.fromMax,
      elevationToMin: profile.elevation.toMin,
      elevationToMax: profile.elevation.toMax,
      elevationClamp: profile.elevation.clamp
    };
    return mapping[key];
  }
  if (moduleId === "landMaterial") {
    const mapping: Record<string, unknown> = {
      terrainColorInterpolation: profile.landMaterial.colorInterpolation,
      terrainColorStops: profile.landMaterial.colorStops,
      landMetallic: profile.landMaterial.metallic,
      landRoughness: profile.landMaterial.roughness,
      landIOR: profile.landMaterial.ior,
      landAlpha: profile.landMaterial.alpha
    };
    return mapping[key];
  }
  if (moduleId === "oceanMaterial") {
    const mapping: Record<string, unknown> = {
      oceanBaseColor: profile.oceanMaterial.baseColor,
      oceanMetallic: profile.oceanMaterial.metallic,
      oceanRoughness: profile.oceanMaterial.roughness,
      oceanIOR: profile.oceanMaterial.ior,
      oceanAlpha: profile.oceanMaterial.alpha
    };
    return mapping[key];
  }
  if (moduleId === "surfaceDetail") {
    const mapping: Record<string, unknown> = {
      terrainNormalStrength: profile.surfaceDetail.normalStrength,
      terrainNormalDistance: profile.surfaceDetail.normalDistance,
      terrainNormalInvert: profile.surfaceDetail.normalInvert,
      terrainNormalFilterWidth: profile.surfaceDetail.normalFilterWidth,
      applyNormalsToLand: profile.surfaceDetail.applyToLand,
      applyNormalsToOcean: profile.surfaceDetail.applyToOcean
    };
    return mapping[key];
  }
  const mapping: Record<string, unknown> = {
    surfaceMixFactorSource: profile.output.mixFactorSource,
    landShaderSource: profile.output.landShaderSource,
    oceanShaderSource: profile.output.oceanShaderSource,
    surfaceOutputTarget: profile.output.target
  };
  return mapping[key];
}

function updateArrayValue(values: [number, number, number], key: string, value: number): [number, number, number] {
  const index = key.endsWith("X") ? 0 : key.endsWith("Y") ? 1 : 2;
  const next: [number, number, number] = [...values];
  next[index] = value;
  return next;
}

function updateParameter(profile: RenderSurfaceProfile, moduleId: RenderSurfaceModuleId, key: string, value: unknown): RenderSurfaceProfile {
  const next = cloneSurfaceProfile(profile);
  next.modifiedAt = profileTimestamp();
  next.status = "Draft";
  if (moduleId === "coordinates") {
    if (key.startsWith("location")) next.coordinates.location = updateArrayValue(next.coordinates.location, key, Number(value));
    else if (key.startsWith("rotation")) next.coordinates.rotation = updateArrayValue(next.coordinates.rotation, key, Number(value));
    else if (key.startsWith("scale")) next.coordinates.scale = updateArrayValue(next.coordinates.scale, key, Number(value));
    else if (key === "coordinateSource") next.coordinates.coordinateSource = value as RenderSurfaceProfile["coordinates"]["coordinateSource"];
    else if (key === "mappingType") next.coordinates.mappingType = value as RenderSurfaceProfile["coordinates"]["mappingType"];
  }
  if (moduleId === "planetGeneration") {
    if (key === "continentNoiseType") next.planetGeneration.continentNoiseType = String(value);
    if (key === "continentDimensions") next.planetGeneration.continentDimensions = String(value);
    if (key === "continentNormalize") next.planetGeneration.normalize = Boolean(value);
    if (key === "continentScale") next.planetGeneration.scale = Number(value);
    if (key === "continentDetail") next.planetGeneration.detail = Number(value);
    if (key === "continentRoughness") next.planetGeneration.roughness = Number(value);
    if (key === "continentLacunarity") next.planetGeneration.lacunarity = Number(value);
    if (key === "continentDistortion") next.planetGeneration.distortion = Number(value);
    if (key === "seaLevelFromMin") next.planetGeneration.seaLevel.fromMin = Number(value);
    if (key === "seaLevelFromMax") next.planetGeneration.seaLevel.fromMax = Number(value);
    if (key === "seaLevelToMin") next.planetGeneration.seaLevel.toMin = Number(value);
    if (key === "seaLevelToMax") next.planetGeneration.seaLevel.toMax = Number(value);
    if (key === "seaLevelClamp") next.planetGeneration.seaLevel.clamp = Boolean(value);
    if (key === "continentMaskInterpolation") next.planetGeneration.continentMask.interpolation = value as RenderSurfaceProfile["planetGeneration"]["continentMask"]["interpolation"];
    if (key === "continentMaskBlackPosition") next.planetGeneration.continentMask.blackPosition = Number(value);
    if (key === "continentMaskWhitePosition") next.planetGeneration.continentMask.whitePosition = Number(value);
  }
  if (moduleId === "terrainGeneration") {
    if (key === "terrainNoiseType") next.terrainGeneration.noiseType = String(value);
    if (key === "terrainDimensions") next.terrainGeneration.dimensions = String(value);
    if (key === "terrainNormalize") next.terrainGeneration.normalize = Boolean(value);
    if (key === "terrainScale") next.terrainGeneration.scale = Number(value);
    if (key === "terrainDetail") next.terrainGeneration.detail = Number(value);
    if (key === "terrainRoughness") next.terrainGeneration.roughness = Number(value);
    if (key === "terrainLacunarity") next.terrainGeneration.lacunarity = Number(value);
    if (key === "terrainDistortion") next.terrainGeneration.distortion = Number(value);
    if (key === "terrainBlendMode") next.terrainGeneration.blendMode = value as RenderSurfaceProfile["terrainGeneration"]["blendMode"];
    if (key === "terrainBlendFactor") next.terrainGeneration.blendFactor = Number(value);
    if (key === "terrainClampResult") next.terrainGeneration.clampResult = Boolean(value);
    if (key === "terrainClampFactor") next.terrainGeneration.clampFactor = Boolean(value);
  }
  if (moduleId === "elevation") {
    if (key === "mountainNoiseType") next.elevation.mountainNoiseType = String(value);
    if (key === "mountainDimensions") next.elevation.mountainDimensions = String(value);
    if (key === "mountainNormalize") next.elevation.mountainNormalize = Boolean(value);
    if (key === "mountainScale") next.elevation.mountainScale = Number(value);
    if (key === "mountainDetail") next.elevation.mountainDetail = Number(value);
    if (key === "mountainRoughness") next.elevation.mountainRoughness = Number(value);
    if (key === "mountainLacunarity") next.elevation.mountainLacunarity = Number(value);
    if (key === "mountainDistortion") next.elevation.mountainDistortion = Number(value);
    if (key === "elevationBlendMode") next.elevation.blendMode = value as RenderSurfaceProfile["elevation"]["blendMode"];
    if (key === "elevationBlendFactor") next.elevation.blendFactor = Number(value);
    if (key === "elevationFromMin") next.elevation.fromMin = Number(value);
    if (key === "elevationFromMax") next.elevation.fromMax = Number(value);
    if (key === "elevationToMin") next.elevation.toMin = Number(value);
    if (key === "elevationToMax") next.elevation.toMax = Number(value);
    if (key === "elevationClamp") next.elevation.clamp = Boolean(value);
  }
  if (moduleId === "landMaterial") {
    if (key === "terrainColorInterpolation") next.landMaterial.colorInterpolation = value as RenderSurfaceProfile["landMaterial"]["colorInterpolation"];
    if (key === "terrainColorStops") next.landMaterial.colorStops = value as RenderColorStop[];
    if (key === "landMetallic") next.landMaterial.metallic = Number(value);
    if (key === "landRoughness") next.landMaterial.roughness = Number(value);
    if (key === "landIOR") next.landMaterial.ior = Number(value);
    if (key === "landAlpha") next.landMaterial.alpha = Number(value);
  }
  if (moduleId === "oceanMaterial") {
    if (key === "oceanBaseColor") next.oceanMaterial.baseColor = String(value);
    if (key === "oceanMetallic") next.oceanMaterial.metallic = Number(value);
    if (key === "oceanRoughness") next.oceanMaterial.roughness = Number(value);
    if (key === "oceanIOR") next.oceanMaterial.ior = Number(value);
    if (key === "oceanAlpha") next.oceanMaterial.alpha = Number(value);
  }
  if (moduleId === "surfaceDetail") {
    if (key === "terrainNormalStrength") next.surfaceDetail.normalStrength = Number(value);
    if (key === "terrainNormalDistance") next.surfaceDetail.normalDistance = Number(value);
    if (key === "terrainNormalInvert") next.surfaceDetail.normalInvert = Boolean(value);
    if (key === "terrainNormalFilterWidth") next.surfaceDetail.normalFilterWidth = Number(value);
    if (key === "applyNormalsToLand") next.surfaceDetail.applyToLand = Boolean(value);
    if (key === "applyNormalsToOcean") next.surfaceDetail.applyToOcean = Boolean(value);
  }
  return next;
}

function RenderNumberField({ parameter, value, onChange }: { parameter: RenderParameterDefinition; value: number; onChange: (value: number) => void }) {
  const hasSlider = typeof parameter.min === "number" && typeof parameter.max === "number";
  return (
    <label className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{parameter.label}</span>
      <div className="grid gap-2 sm:grid-cols-[1fr_7rem]">
        {hasSlider ? <input type="range" min={parameter.min} max={parameter.max} step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-cyan-300" /> : <div />}
        <input type="number" value={value} min={parameter.min} max={parameter.max} step="0.01" onChange={(event) => onChange(Number(event.target.value))} className="h-9 rounded-md border border-cyan-300/15 bg-[#07101e] px-2 text-sm font-bold text-white outline-none focus:border-cyan-200/60" />
      </div>
    </label>
  );
}

function RenderEnumField({ parameter, value, onChange }: { parameter: RenderParameterDefinition; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{parameter.label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={parameter.readonly} className="h-9 rounded-md border border-cyan-300/15 bg-[#07101e] px-2 text-sm font-bold text-white outline-none focus:border-cyan-200/60 disabled:text-slate-500">
        {(parameter.options ?? [String(parameter.defaultValue)]).map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function RenderBooleanField({ parameter, value, onChange }: { parameter: RenderParameterDefinition; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{parameter.label}</span>
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-cyan-300" />
    </label>
  );
}

function RenderColorField({ parameter, value, onChange }: { parameter: RenderParameterDefinition; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{parameter.label}</span>
      <div className="grid grid-cols-[3rem_1fr] gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-cyan-300/15 bg-[#07101e]" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="h-9 rounded-md border border-cyan-300/15 bg-[#07101e] px-2 text-sm font-bold text-white outline-none focus:border-cyan-200/60" />
      </div>
    </label>
  );
}

function RenderColorRampEditor({ value, onChange }: { value: RenderColorStop[]; onChange: (value: RenderColorStop[]) => void }) {
  const sorted = [...value].sort((a, b) => a.position - b.position);
  const gradient = `linear-gradient(90deg, ${sorted.map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`).join(", ")})`;

  function updateStop(index: number, patch: Partial<RenderColorStop>) {
    onChange(sorted.map((stop, stopIndex) => stopIndex === index ? { ...stop, ...patch } : stop).sort((a, b) => a.position - b.position));
  }

  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Terrain Color Stops</span>
        <Button onClick={() => onChange([...sorted, { position: 1, color: "#FFFFFF", label: "New Stop" }])}>Add Stop</Button>
      </div>
      <div className="mt-3 h-10 rounded-md border border-cyan-300/20" style={{ background: gradient }} />
      <div className="mt-3 space-y-2">
        {sorted.map((stop, index) => (
          <div key={`${stop.label}-${index}`} className="grid gap-2 rounded-md border border-cyan-300/10 bg-[#07101e]/70 p-2 md:grid-cols-[4rem_6rem_1fr_auto]">
            <input type="number" min={0} max={1} step="0.01" value={stop.position} onChange={(event) => updateStop(index, { position: Number(event.target.value) })} className="h-9 rounded-md border border-cyan-300/15 bg-slate-950 px-2 text-sm text-white" />
            <input value={stop.color} onChange={(event) => updateStop(index, { color: event.target.value })} className="h-9 rounded-md border border-cyan-300/15 bg-slate-950 px-2 text-sm text-white" />
            <input value={stop.label} onChange={(event) => updateStop(index, { label: event.target.value })} className="h-9 rounded-md border border-cyan-300/15 bg-slate-950 px-2 text-sm text-white" />
            <button type="button" onClick={() => onChange(sorted.filter((_, stopIndex) => stopIndex !== index))} className="rounded-md border border-slate-600/40 px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-300">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleParameterField({ parameter, profile, moduleId, onUpdate }: { parameter: RenderParameterDefinition; profile: RenderSurfaceProfile; moduleId: RenderSurfaceModuleId; onUpdate: (profile: RenderSurfaceProfile) => void }) {
  const value = getParameterValue(profile, moduleId, parameter.key);
  if (parameter.type === "number") return <RenderNumberField parameter={parameter} value={Number(value)} onChange={(next) => onUpdate(updateParameter(profile, moduleId, parameter.key, next))} />;
  if (parameter.type === "enum" || parameter.type === "readonly") return <RenderEnumField parameter={parameter} value={String(value)} onChange={(next) => onUpdate(updateParameter(profile, moduleId, parameter.key, next))} />;
  if (parameter.type === "boolean") return <RenderBooleanField parameter={parameter} value={Boolean(value)} onChange={(next) => onUpdate(updateParameter(profile, moduleId, parameter.key, next))} />;
  if (parameter.type === "color") return <RenderColorField parameter={parameter} value={String(value)} onChange={(next) => onUpdate(updateParameter(profile, moduleId, parameter.key, next))} />;
  if (parameter.type === "colorStops") return <RenderColorRampEditor value={value as RenderColorStop[]} onChange={(next) => onUpdate(updateParameter(profile, moduleId, parameter.key, next))} />;
  return null;
}

function moduleSummary(profile: RenderSurfaceProfile, moduleId: RenderSurfaceModuleId) {
  if (moduleId === "coordinates") return `source ${profile.coordinates.coordinateSource}, mapping ${profile.coordinates.mappingType}, scale ${profile.coordinates.scale.join("/")}`;
  if (moduleId === "planetGeneration") return `continent scale ${profile.planetGeneration.scale}, sea ${profile.planetGeneration.seaLevel.fromMin}-${profile.planetGeneration.seaLevel.fromMax}, mask ${profile.planetGeneration.continentMask.blackPosition}-${profile.planetGeneration.continentMask.whitePosition}`;
  if (moduleId === "terrainGeneration") return `terrain scale ${profile.terrainGeneration.scale}, ${profile.terrainGeneration.blendMode} ${profile.terrainGeneration.blendFactor}`;
  if (moduleId === "elevation") return `mountain scale ${profile.elevation.mountainScale}, blend ${profile.elevation.blendMode} ${profile.elevation.blendFactor}`;
  if (moduleId === "landMaterial") return `${profile.landMaterial.colorStops.length} color stops, roughness ${profile.landMaterial.roughness}`;
  if (moduleId === "oceanMaterial") return `${profile.oceanMaterial.baseColor}, roughness ${profile.oceanMaterial.roughness}, IOR ${profile.oceanMaterial.ior}`;
  if (moduleId === "surfaceDetail") return `normal strength ${profile.surfaceDetail.normalStrength}, distance ${profile.surfaceDetail.normalDistance}`;
  return `${profile.output.mixFactorSource} -> ${profile.output.target}`;
}

function RenderPipelineModuleCard({ module, profile, status, selected, onSelect }: { module: RenderSurfaceModule; profile: RenderSurfaceProfile; status: string; selected: boolean; onSelect: () => void }) {
  return (
    <article className={`rounded-md border bg-[#07101e]/84 p-4 transition ${selected ? "border-cyan-200/70 shadow-glow" : "border-cyan-300/15 hover:border-cyan-200/45"}`}>
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-cyan-200">{module.blenderNodes.join(" / ")}</p>
            <h3 className="mt-1 text-xl font-black text-white">{module.title}</h3>
          </div>
          <Badge tone={moduleStatusTone(status)}>{status}</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{module.responsibility}</p>
        <p className="mt-3 truncate text-sm font-bold text-cyan-100">{moduleSummary(profile, module.id)}</p>
      </button>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="slate">{module.parameters.length} fields</Badge>
        <button type="button" onClick={onSelect} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-100">Edit</button>
        <ProductionCopyButton label="Copy Module JSON" text={formatJson(getModuleContract(profile, module.id))} />
      </div>
    </article>
  );
}

function RenderModuleInspector({ module, profile, validation, onUpdate, onReset }: { module: RenderSurfaceModule; profile: RenderSurfaceProfile; validation: ReturnType<typeof validateSurfaceProfile>; onUpdate: (profile: RenderSurfaceProfile) => void; onReset: () => void }) {
  const moduleIssues = validation.issues.filter((row) => row.moduleId === module.id);
  return (
    <aside className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 shadow-glow xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-cyan-200">Inspector</p>
          <h2 className="mt-1 text-2xl font-black text-white">{module.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{module.responsibility}</p>
        </div>
        <Badge tone={moduleStatusTone(validation.moduleStatuses[module.id])}>{validation.moduleStatuses[module.id]}</Badge>
      </div>

      <div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Blender Nodes</p>
        <p className="mt-2 text-sm font-bold text-cyan-100">{module.blenderNodes.join(" / ")}</p>
      </div>

      <div className="mt-4 space-y-3">
        {module.parameters.map((parameter) => <ModuleParameterField key={parameter.key} parameter={parameter} profile={profile} moduleId={module.id} onUpdate={onUpdate} />)}
      </div>

      {module.id === "oceanMaterial" ? <div className="mt-4 h-16 rounded-md border border-cyan-300/20" style={{ background: profile.oceanMaterial.baseColor }} aria-label="Ocean material preview swatch" /> : null}

      <div className="mt-4 space-y-2">
        {moduleIssues.length ? moduleIssues.map((row) => (
          <p key={`${row.field}-${row.message}`} className={`rounded-md border p-3 text-sm font-bold ${row.severity === "error" ? "border-rose-300/20 bg-rose-300/10 text-rose-100" : "border-amber-300/20 bg-amber-300/10 text-amber-100"}`}>{row.field}: {row.message}</p>
        )) : <p className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">Module validates against the canonical contract.</p>}
      </div>

      <div className="mt-4 grid gap-2">
        <Button onClick={onReset}><RotateCcw className="h-4 w-4" /> Reset Module</Button>
        <ProductionCopyButton label="Copy Module Contract" text={formatJson(getModuleContract(profile, module.id))} />
      </div>
    </aside>
  );
}

function RenderProfileSidebar({ profiles, activeProfileId, onSelect, onCreate, onDuplicate, onArchive }: { profiles: RenderSurfaceProfile[]; activeProfileId: string; onSelect: (id: string) => void; onCreate: () => void; onDuplicate: () => void; onArchive: () => void }) {
  return (
    <aside className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 shadow-glow xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-auto">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-cyan-200">Render Asset</p>
      <div className="mt-3 space-y-2">
        {profiles.map((profile) => (
          <button key={profile.profileId} type="button" onClick={() => onSelect(profile.profileId)} className={`w-full rounded-md border p-3 text-left transition ${profile.profileId === activeProfileId ? "border-cyan-200/60 bg-cyan-300/10" : "border-cyan-300/10 bg-slate-950/40 hover:border-cyan-200/45"}`}>
            <p className="font-black text-white">{profile.profileName}</p>
            <p className="mt-1 truncate text-xs font-bold text-slate-400">{profile.profileId}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        <Button onClick={onCreate}>New Surface Profile</Button>
        <Button onClick={onDuplicate}>Duplicate Profile</Button>
        <Button onClick={onArchive}><Archive className="h-4 w-4" /> Archive Profile</Button>
      </div>
      <div className="mt-5">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-cyan-200">Pipeline</p>
        <div className="mt-2 space-y-1">
          {surfaceShaderModules.map((module) => <a key={module.id} href={`#module-${module.id}`} className="block rounded-md px-2 py-1.5 text-sm font-bold text-slate-300 hover:bg-cyan-300/10 hover:text-cyan-100">{module.title}</a>)}
        </div>
      </div>
      <div className="mt-5">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-cyan-200">Related Render Systems</p>
        <div className="mt-2 space-y-2">
          {relatedRenderSystems.map((system) => (
            <details key={system.id} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-2">
              <summary className="cursor-pointer text-sm font-bold text-slate-300">{system.label} <span className="text-slate-500">/ {system.status}</span></summary>
              <p className="mt-2 text-xs leading-5 text-slate-400">{system.note}</p>
            </details>
          ))}
        </div>
      </div>
    </aside>
  );
}

function RenderProfileHeader({ profile, validation, onRename, onResetAll }: { profile: RenderSurfaceProfile; validation: ReturnType<typeof validateSurfaceProfile>; onRename: (name: string) => void; onResetAll: () => void }) {
  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Surface Shader Editor</Badge>
            <Badge tone="green">Renderer Contract Ready</Badge>
          </div>
          <h1 className="mt-3 text-4xl font-black text-white">NOVERIS Render Engine</h1>
          <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-300">Canonical render contracts for procedural planets, surfaces, atmospheres, clouds, lighting, cameras, and production outputs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ProductionCopyButton label="Copy Full Contract" text={formatJson(profile)} />
          <Button onClick={() => downloadJson(`${profile.profileId}.json`, formatJson(profile))}><Download className="h-4 w-4" /> Download Contract JSON</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["Profile", profile.profileName],
          ["Renderer", "Blender 5.2 LTS"],
          ["Pipeline", "8 modules"],
          ["Validation", validation.status],
          ["Contract Version", profile.schemaVersion],
          ["Modified", profile.modifiedAt]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="mt-2 truncate text-sm font-black text-white" title={value}>{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Rename Profile</span>
          <input value={profile.profileName} onChange={(event) => onRename(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-cyan-300/15 bg-[#07101e] px-3 text-sm font-bold text-white outline-none focus:border-cyan-200/60" />
        </label>
        <Button onClick={onResetAll}><RotateCcw className="h-4 w-4" /> Restore Canonical Defaults</Button>
      </div>
    </section>
  );
}

function RenderBottomPanel({ profile, validation, history }: { profile: RenderSurfaceProfile; validation: ReturnType<typeof validateSurfaceProfile>; history: string[] }) {
  const [tab, setTab] = useState<BottomTab>("validation");
  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 shadow-glow">
      <div className="flex flex-wrap gap-2 border-b border-cyan-300/10 p-3">
        {(["validation", "json", "mapping", "history"] as BottomTab[]).map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ${tab === item ? "bg-cyan-300/15 text-cyan-100" : "text-slate-400 hover:bg-cyan-300/10 hover:text-cyan-100"}`}>{item}</button>
        ))}
      </div>
      <div className="p-4">
        {tab === "validation" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-200" />
              <Badge tone={validation.status === "Ready" ? "green" : validation.status === "Error" ? "red" : "amber"}>{validation.status}</Badge>
              <Badge tone="slate">External Blender execution is not connected</Badge>
            </div>
            {validation.issues.length ? validation.issues.map((row) => <p key={`${row.moduleId}-${row.field}-${row.message}`} className={`rounded-md border p-3 text-sm font-bold ${row.severity === "error" ? "border-rose-300/20 bg-rose-300/10 text-rose-100" : "border-amber-300/20 bg-amber-300/10 text-amber-100"}`}>{row.moduleId} / {row.field}: {row.message}</p>) : <p className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">All canonical surface shader rules validate.</p>}
            <div className="grid gap-2 md:grid-cols-4">{surfaceShaderModules.map((module) => <div key={module.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><p className="font-black text-white">{module.title}</p><Badge tone={moduleStatusTone(validation.moduleStatuses[module.id])}>{validation.moduleStatuses[module.id]}</Badge></div>)}</div>
          </div>
        ) : null}
        {tab === "json" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <ProductionCopyButton label="Copy JSON" text={formatJson(profile)} />
              <ProductionCopyButton label="Copy Minified JSON" text={minifyJson(profile)} />
              <Button onClick={() => downloadJson(`${profile.profileId}.json`, formatJson(profile))}><FileJson className="h-4 w-4" /> Download JSON</Button>
            </div>
            <pre className="max-h-[32rem] overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/70 p-4 text-xs leading-5 text-slate-200">{formatJson(profile)}</pre>
          </div>
        ) : null}
        {tab === "mapping" ? (
          <div className="overflow-auto">
            <table className="w-full min-w-[56rem] border-separate border-spacing-0 text-left text-sm">
              <thead className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">
                <tr><th className="p-2">Studio Field</th><th className="p-2">Blender Object</th><th className="p-2">Material</th><th className="p-2">Node</th><th className="p-2">Socket / Property</th></tr>
              </thead>
              <tbody>
                {blenderFieldMappings.map((row) => (
                  <tr key={`${row.studioField}-${row.blenderNode}`} className="text-slate-200">
                    <td className="border-t border-cyan-300/10 p-2 font-black text-cyan-100">{row.studioField}</td>
                    <td className="border-t border-cyan-300/10 p-2">{row.blenderObject}</td>
                    <td className="border-t border-cyan-300/10 p-2">{row.blenderMaterial}</td>
                    <td className="border-t border-cyan-300/10 p-2">{row.blenderNode}</td>
                    <td className="border-t border-cyan-300/10 p-2">{row.blenderSocket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {tab === "history" ? (
          <div className="space-y-2">
            {history.map((entry) => <p key={entry} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-bold text-slate-300"><History className="mr-2 inline h-4 w-4 text-cyan-200" />{entry}</p>)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PlanetRenderEngineWorkspace() {
  const [profiles, setProfiles] = useState<RenderSurfaceProfile[]>([cloneSurfaceProfile(canonicalSurfaceShaderContract)]);
  const [activeProfileId, setActiveProfileId] = useState(CANONICAL_SURFACE_PROFILE_ID);
  const [selectedModuleId, setSelectedModuleId] = useState<RenderSurfaceModuleId>("coordinates");
  const [history, setHistory] = useState<string[]>([`created ${CANONICAL_SURFACE_PROFILE_NAME}`]);

  const activeProfile = profiles.find((profile) => profile.profileId === activeProfileId) ?? profiles[0];
  const selectedModule = surfaceShaderModules.find((module) => module.id === selectedModuleId) ?? surfaceShaderModules[0];
  const validation = useMemo(() => validateSurfaceProfile(activeProfile), [activeProfile]);

  function replaceActive(nextProfile: RenderSurfaceProfile, historyMessage: string) {
    setProfiles((current) => current.map((profile) => profile.profileId === activeProfile.profileId ? nextProfile : profile));
    setHistory((current) => [`${historyMessage} / ${new Date().toLocaleString()}`, ...current].slice(0, 12));
  }

  function createProfile() {
    const next = createSurfaceProfile(`surface_profile_custom_${profiles.length + 1}`, "New Surface Profile");
    setProfiles((current) => [...current, next]);
    setActiveProfileId(next.profileId);
    setHistory((current) => [`created ${next.profileName} / ${new Date().toLocaleString()}`, ...current].slice(0, 12));
  }

  function duplicateProfile() {
    const next = duplicateSurfaceProfile(activeProfile);
    setProfiles((current) => [...current, next]);
    setActiveProfileId(next.profileId);
    setHistory((current) => [`duplicated ${activeProfile.profileName} / ${new Date().toLocaleString()}`, ...current].slice(0, 12));
  }

  return (
    <main className="grid gap-5 xl:grid-cols-[17rem_minmax(0,1fr)_23rem]">
      <RenderProfileSidebar
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelect={setActiveProfileId}
        onCreate={createProfile}
        onDuplicate={duplicateProfile}
        onArchive={() => replaceActive({ ...cloneSurfaceProfile(activeProfile), status: "Archived", modifiedAt: profileTimestamp() }, "archived profile")}
      />
      <section className="min-w-0 space-y-5">
        <RenderProfileHeader
          profile={activeProfile}
          validation={validation}
          onRename={(name) => replaceActive({ ...cloneSurfaceProfile(activeProfile), profileName: name, status: "Draft", modifiedAt: profileTimestamp() }, "renamed profile")}
          onResetAll={() => replaceActive(cloneSurfaceProfile(canonicalSurfaceShaderContract), "restored canonical defaults")}
        />
        <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 shadow-glow">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-cyan-200" />
            <h2 className="text-2xl font-black text-white">Surface Shader Pipeline</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {surfaceShaderModules.map((module, index) => (
              <div key={module.id} id={`module-${module.id}`} className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <RenderPipelineModuleCard module={module} profile={activeProfile} status={validation.moduleStatuses[module.id]} selected={module.id === selectedModuleId} onSelect={() => setSelectedModuleId(module.id)} />
                {index < surfaceShaderModules.length - 1 ? <div className="hidden items-center text-cyan-200/70 lg:flex"><SlidersHorizontal className="h-5 w-5" /></div> : null}
              </div>
            ))}
          </div>
        </section>
        <RenderBottomPanel profile={activeProfile} validation={validation} history={history} />
      </section>
      <RenderModuleInspector
        module={selectedModule}
        profile={activeProfile}
        validation={validation}
        onUpdate={(nextProfile) => replaceActive(nextProfile, `modified ${selectedModule.title}`)}
        onReset={() => replaceActive(resetSurfaceModule(activeProfile, selectedModule.id), `reset ${selectedModule.title}`)}
      />
    </main>
  );
}

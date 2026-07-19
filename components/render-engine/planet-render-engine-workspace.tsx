"use client";

import { useMemo, useState } from "react";
import { Archive, Camera, CheckCircle2, Copy, Download, Heart, Layers3, Play, RotateCcw, Sparkles } from "lucide-react";
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
  relatedRenderSystems,
  resetSurfaceModule,
  surfaceShaderModules
} from "@/lib/render-engine/canonical-render-engine";
import { validateSurfaceProfile } from "@/lib/render-engine/render-validation";
import type { RenderColorStop, RenderParameterDefinition, RenderSurfaceModuleId, RenderSurfaceProfile } from "@/types/render-engine";

type CreatorSection = "identity" | "shape" | "terrain" | "surface" | "atmosphere" | "lighting" | "camera" | "output";

const sectionFlow: Array<{ id: CreatorSection; label: string; moduleId?: RenderSurfaceModuleId }> = [
  { id: "identity", label: "Identity" },
  { id: "shape", label: "Shape", moduleId: "planetGeneration" },
  { id: "terrain", label: "Terrain", moduleId: "elevation" },
  { id: "surface", label: "Surface", moduleId: "landMaterial" },
  { id: "atmosphere", label: "Atmosphere", moduleId: "oceanMaterial" },
  { id: "lighting", label: "Lighting", moduleId: "surfaceDetail" },
  { id: "camera", label: "Camera", moduleId: "coordinates" },
  { id: "output", label: "Output", moduleId: "output" }
];

const presetWorlds = [
  { name: "Earth", description: "Balanced oceans, green lowlands, bright mountain stone.", type: "Earth-like" },
  { name: "Mars", description: "Dry highlands, low seas, dusty terrain complexity.", type: "Desert World" },
  { name: "Ocean World", description: "High sea level with island chains and deep blue water.", type: "Ocean World" },
  { name: "Ice World", description: "Quiet frozen continents and pale mountain ranges.", type: "Ice World" },
  { name: "Forest World", description: "Dense green surface bands with soft coastlines.", type: "Forest World" },
  { name: "Crystal World", description: "Sharp mountain relief and luminous surface contrast.", type: "Crystal World" },
  { name: "Gas Giant", description: "Atmospheric bands profile for future gas rendering.", type: "Gas Giant" },
  { name: "Moon", description: "Airless body with stone-forward palette and low seas.", type: "Moon" }
];

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
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:border-slate-600/30 disabled:bg-slate-950/40 disabled:text-slate-500"
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
    return {
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
    }[key];
  }
  if (moduleId === "terrainGeneration") {
    return {
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
    }[key];
  }
  if (moduleId === "elevation") {
    return {
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
    }[key];
  }
  if (moduleId === "landMaterial") {
    return {
      terrainColorInterpolation: profile.landMaterial.colorInterpolation,
      terrainColorStops: profile.landMaterial.colorStops,
      landMetallic: profile.landMaterial.metallic,
      landRoughness: profile.landMaterial.roughness,
      landIOR: profile.landMaterial.ior,
      landAlpha: profile.landMaterial.alpha
    }[key];
  }
  if (moduleId === "oceanMaterial") {
    return {
      oceanBaseColor: profile.oceanMaterial.baseColor,
      oceanMetallic: profile.oceanMaterial.metallic,
      oceanRoughness: profile.oceanMaterial.roughness,
      oceanIOR: profile.oceanMaterial.ior,
      oceanAlpha: profile.oceanMaterial.alpha
    }[key];
  }
  if (moduleId === "surfaceDetail") {
    return {
      terrainNormalStrength: profile.surfaceDetail.normalStrength,
      terrainNormalDistance: profile.surfaceDetail.normalDistance,
      terrainNormalInvert: profile.surfaceDetail.normalInvert,
      terrainNormalFilterWidth: profile.surfaceDetail.normalFilterWidth,
      applyNormalsToLand: profile.surfaceDetail.applyToLand,
      applyNormalsToOcean: profile.surfaceDetail.applyToOcean
    }[key];
  }
  return {
    surfaceMixFactorSource: profile.output.mixFactorSource,
    landShaderSource: profile.output.landShaderSource,
    oceanShaderSource: profile.output.oceanShaderSource,
    surfaceOutputTarget: profile.output.target
  }[key];
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
    if (key === "terrainScale") next.terrainGeneration.scale = Number(value);
    if (key === "terrainDetail") next.terrainGeneration.detail = Number(value);
    if (key === "terrainRoughness") next.terrainGeneration.roughness = Number(value);
    if (key === "terrainLacunarity") next.terrainGeneration.lacunarity = Number(value);
    if (key === "terrainDistortion") next.terrainGeneration.distortion = Number(value);
    if (key === "terrainBlendFactor") next.terrainGeneration.blendFactor = Number(value);
    if (key === "terrainBlendMode") next.terrainGeneration.blendMode = value as RenderSurfaceProfile["terrainGeneration"]["blendMode"];
    if (key === "terrainClampResult") next.terrainGeneration.clampResult = Boolean(value);
    if (key === "terrainClampFactor") next.terrainGeneration.clampFactor = Boolean(value);
  }
  if (moduleId === "elevation") {
    if (key === "mountainScale") next.elevation.mountainScale = Number(value);
    if (key === "mountainDetail") next.elevation.mountainDetail = Number(value);
    if (key === "mountainRoughness") next.elevation.mountainRoughness = Number(value);
    if (key === "mountainLacunarity") next.elevation.mountainLacunarity = Number(value);
    if (key === "mountainDistortion") next.elevation.mountainDistortion = Number(value);
    if (key === "elevationBlendFactor") next.elevation.blendFactor = Number(value);
    if (key === "elevationBlendMode") next.elevation.blendMode = value as RenderSurfaceProfile["elevation"]["blendMode"];
    if (key === "elevationFromMin") next.elevation.fromMin = Number(value);
    if (key === "elevationFromMax") next.elevation.fromMax = Number(value);
    if (key === "elevationClamp") next.elevation.clamp = Boolean(value);
  }
  if (moduleId === "landMaterial") {
    if (key === "terrainColorStops") next.landMaterial.colorStops = value as RenderColorStop[];
    if (key === "terrainColorInterpolation") next.landMaterial.colorInterpolation = value as RenderSurfaceProfile["landMaterial"]["colorInterpolation"];
    if (key === "landRoughness") next.landMaterial.roughness = Number(value);
    if (key === "landMetallic") next.landMaterial.metallic = Number(value);
    if (key === "landIOR") next.landMaterial.ior = Number(value);
    if (key === "landAlpha") next.landMaterial.alpha = Number(value);
  }
  if (moduleId === "oceanMaterial") {
    if (key === "oceanBaseColor") next.oceanMaterial.baseColor = String(value);
    if (key === "oceanRoughness") next.oceanMaterial.roughness = Number(value);
    if (key === "oceanIOR") next.oceanMaterial.ior = Number(value);
    if (key === "oceanAlpha") next.oceanMaterial.alpha = Number(value);
  }
  if (moduleId === "surfaceDetail") {
    if (key === "terrainNormalStrength") next.surfaceDetail.normalStrength = Number(value);
    if (key === "terrainNormalDistance") next.surfaceDetail.normalDistance = Number(value);
    if (key === "terrainNormalFilterWidth") next.surfaceDetail.normalFilterWidth = Number(value);
    if (key === "terrainNormalInvert") next.surfaceDetail.normalInvert = Boolean(value);
    if (key === "applyNormalsToLand") next.surfaceDetail.applyToLand = Boolean(value);
    if (key === "applyNormalsToOcean") next.surfaceDetail.applyToOcean = Boolean(value);
  }
  return next;
}

function Slider({ label, value, min, max, step = 0.01, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-3">
      <span className="flex items-center justify-between text-sm font-black text-white">
        {label}
        <span className="text-cyan-100">{Number.isInteger(value) ? value : value.toFixed(2)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-cyan-300" />
    </label>
  );
}

function AdvancedControl({ parameter, profile, moduleId, onUpdate }: { parameter: RenderParameterDefinition; profile: RenderSurfaceProfile; moduleId: RenderSurfaceModuleId; onUpdate: (profile: RenderSurfaceProfile) => void }) {
  const value = getParameterValue(profile, moduleId, parameter.key);
  if (parameter.type === "number") {
    return (
      <label className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{parameter.label}</span>
        <input type="number" value={Number(value)} min={parameter.min} max={parameter.max} step="0.01" onChange={(event) => onUpdate(updateParameter(profile, moduleId, parameter.key, Number(event.target.value)))} className="h-9 rounded-md border border-cyan-300/15 bg-[#07101e] px-2 text-sm font-bold text-white outline-none focus:border-cyan-200/60" />
      </label>
    );
  }
  if (parameter.type === "boolean") {
    return (
      <label className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{parameter.label}</span>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onUpdate(updateParameter(profile, moduleId, parameter.key, event.target.checked))} className="h-5 w-5 accent-cyan-300" />
      </label>
    );
  }
  if (parameter.type === "enum" || parameter.type === "readonly") {
    return (
      <label className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{parameter.label}</span>
        <select value={String(value)} disabled={parameter.readonly} onChange={(event) => onUpdate(updateParameter(profile, moduleId, parameter.key, event.target.value))} className="h-9 rounded-md border border-cyan-300/15 bg-[#07101e] px-2 text-sm font-bold text-white outline-none focus:border-cyan-200/60 disabled:text-slate-500">
          {(parameter.options ?? [String(parameter.defaultValue)]).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }
  return null;
}

function AdvancedBlenderControls({ moduleId, profile, onUpdate }: { moduleId: RenderSurfaceModuleId; profile: RenderSurfaceProfile; onUpdate: (profile: RenderSurfaceProfile) => void }) {
  const module = surfaceShaderModules.find((item) => item.id === moduleId);
  if (!module) return null;
  return (
    <details className="mt-6 rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
      <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.18em] text-cyan-100">Advanced Blender Controls</summary>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {module.parameters.filter((parameter) => parameter.type !== "colorStops" && parameter.type !== "color").map((parameter) => (
          <AdvancedControl key={parameter.key} parameter={parameter} profile={profile} moduleId={moduleId} onUpdate={onUpdate} />
        ))}
      </div>
    </details>
  );
}

function CreativeSection({ id, eyebrow, title, description, children }: { id: CreatorSection; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-cyan-200">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PlanetPreview({ profile }: { profile: RenderSurfaceProfile }) {
  const landGradient = `linear-gradient(135deg, ${profile.landMaterial.colorStops.map((stop) => stop.color).join(", ")})`;
  return (
    <div className="relative grid min-h-[34rem] overflow-hidden rounded-md border border-cyan-300/15 bg-[radial-gradient(circle_at_45%_35%,rgba(91,203,255,0.20),transparent_32%),linear-gradient(145deg,#020817,#071426_48%,#03111b)] shadow-glow lg:grid-cols-[1fr_28rem]">
      <div className="relative grid place-items-center p-8">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(103,232,249,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,.08)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative aspect-square w-full max-w-[34rem] rounded-full border border-cyan-100/25 shadow-[0_0_80px_rgba(34,211,238,0.25)]" style={{ background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), transparent 0 5%, rgba(255,255,255,0.12) 6%, transparent 28%), ${landGradient}` }}>
          <div className="absolute inset-[7%] rounded-full opacity-70 mix-blend-screen" style={{ background: `radial-gradient(circle at 62% 58%, ${profile.oceanMaterial.baseColor} 0 16%, transparent 17% 100%), radial-gradient(circle at 28% 62%, ${profile.oceanMaterial.baseColor} 0 22%, transparent 23% 100%)` }} />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,transparent_0_38%,rgba(0,0,0,0.68)_72%,rgba(0,0,0,0.95)_100%)]" />
          <div className="absolute -inset-3 rounded-full border border-cyan-200/20 blur-sm" />
        </div>
      </div>
      <div className="relative flex flex-col justify-end border-t border-cyan-300/10 bg-slate-950/30 p-6 lg:border-l lg:border-t-0">
        <Badge tone="green">Renderer Contract Ready</Badge>
        <h1 className="mt-4 text-5xl font-black text-white">Planet Creator</h1>
        <p className="mt-3 text-xl font-bold text-slate-300">Design living worlds. The renderer takes care of the rest.</p>
        <div className="mt-6 grid gap-3 text-sm font-bold text-cyan-100 sm:grid-cols-2">
          <span>Earth-like World</span>
          <span>Seed 481923</span>
          <span>Temperate</span>
          <span>Ocean Coverage 67%</span>
          <span>Dense Atmosphere</span>
          <span>{profile.status}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button><Sparkles className="h-4 w-4" /> Inspire Me</Button>
          <Button><Heart className="h-4 w-4" /> Save Profile</Button>
          <Button disabled><Play className="h-4 w-4" /> Render Preview</Button>
        </div>
      </div>
    </div>
  );
}

function PlanetLibrary({ profiles, activeProfileId, onSelect, onDuplicate, onArchive }: { profiles: RenderSurfaceProfile[]; activeProfileId: string; onSelect: (id: string) => void; onDuplicate: () => void; onArchive: () => void }) {
  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-cyan-200">Planet Library</p>
          <h2 className="mt-2 text-3xl font-black text-white">World Profiles</h2>
        </div>
        <Badge tone="slate">{profiles.length} profiles</Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {presetWorlds.map((preset, index) => (
          <button key={preset.name} type="button" onClick={() => onSelect(activeProfileId)} className={`group overflow-hidden rounded-md border bg-slate-950/45 text-left transition hover:border-cyan-200/60 ${index === 0 ? "border-cyan-200/60" : "border-cyan-300/10"}`}>
            <div className="h-28 bg-[radial-gradient(circle_at_45%_45%,rgba(125,211,252,0.34),transparent_18%),linear-gradient(135deg,rgba(15,77,138,.55),rgba(54,92,44,.55),rgba(216,211,198,.38))]" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-black text-white">{preset.name}</h3>
                <Heart className="h-4 w-4 text-cyan-100 opacity-70" />
              </div>
              <p className="mt-1 text-sm font-bold text-cyan-100">{preset.type}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{preset.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md border border-cyan-300/20 px-2 py-1 text-xs font-black text-cyan-100">Duplicate</span>
                <span className="rounded-md border border-slate-500/30 px-2 py-1 text-xs font-black text-slate-300">Archive</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onDuplicate}>Duplicate Active Profile</Button>
        <Button onClick={onArchive}><Archive className="h-4 w-4" /> Archive Active Profile</Button>
      </div>
    </section>
  );
}

function PlanetDNA({ profile, validation }: { profile: RenderSurfaceProfile; validation: ReturnType<typeof validateSurfaceProfile> }) {
  const oceanPercent = Math.round(profile.planetGeneration.seaLevel.fromMax * 100);
  const complexity = Math.round((profile.terrainGeneration.detail + profile.elevation.mountainDetail) * 10);
  const rows = [
    ["Planet Type", "Earth-like"],
    ["Seed", "481923"],
    ["Ocean", `${oceanPercent}%`],
    ["Surface", `${profile.landMaterial.colorStops.length} regions`],
    ["Atmosphere", "Dense"],
    ["Biome Count", "5"],
    ["Complexity", `${complexity}%`],
    ["Validation", validation.status],
    ["Renderer", "Ready"]
  ];
  return (
    <aside className="rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-4 shadow-glow xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-auto">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-cyan-200">Planet DNA</p>
      <h2 className="mt-2 text-2xl font-black text-white">{profile.profileName}</h2>
      <div className="mt-4 grid gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">Pipeline</p>
        <div className="mt-3 space-y-2">
          {sectionFlow.map((section, index) => (
            <a key={section.id} href={`#${section.id}`} className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-cyan-100">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-cyan-300/20 text-[0.65rem] text-cyan-100">{index + 1}</span>
              {section.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ColorRegionEditor({ profile, onUpdate }: { profile: RenderSurfaceProfile; onUpdate: (profile: RenderSurfaceProfile) => void }) {
  const stops = profile.landMaterial.colorStops;
  const gradient = `linear-gradient(90deg, ${stops.map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`).join(", ")})`;
  function updateStop(index: number, patch: Partial<RenderColorStop>) {
    onUpdate(updateParameter(profile, "landMaterial", "terrainColorStops", stops.map((stop, stopIndex) => stopIndex === index ? { ...stop, ...patch } : stop)));
  }
  return (
    <div className="space-y-4">
      <div className="h-16 rounded-md border border-cyan-300/20" style={{ background: gradient }} />
      <div className="grid gap-3 md:grid-cols-3">
        {stops.map((stop, index) => (
          <label key={stop.label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <span className="text-sm font-black text-white">{index === 0 ? "Lowlands" : index === 1 ? "Highlands" : "Mountains"}</span>
            <input type="color" value={stop.color} onChange={(event) => updateStop(index, { color: event.target.value })} className="mt-3 h-12 w-full rounded-md border border-cyan-300/20 bg-slate-950" />
          </label>
        ))}
      </div>
    </div>
  );
}

export function PlanetRenderEngineWorkspace() {
  const [profiles, setProfiles] = useState<RenderSurfaceProfile[]>([cloneSurfaceProfile(canonicalSurfaceShaderContract)]);
  const [activeProfileId, setActiveProfileId] = useState(CANONICAL_SURFACE_PROFILE_ID);
  const activeProfile = profiles.find((profile) => profile.profileId === activeProfileId) ?? profiles[0];
  const validation = useMemo(() => validateSurfaceProfile(activeProfile), [activeProfile]);

  function replaceActive(nextProfile: RenderSurfaceProfile) {
    setProfiles((current) => current.map((profile) => profile.profileId === activeProfile.profileId ? nextProfile : profile));
  }

  function createProfile() {
    const next = createSurfaceProfile(`surface_profile_custom_${profiles.length + 1}`, "New Surface Profile");
    setProfiles((current) => [...current, next]);
    setActiveProfileId(next.profileId);
  }

  function duplicateProfile() {
    const next = duplicateSurfaceProfile(activeProfile);
    setProfiles((current) => [...current, next]);
    setActiveProfileId(next.profileId);
  }

  if (!activeProfile) {
    return (
      <main className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-8 text-center shadow-glow">
        <h1 className="text-5xl font-black text-white">Create Your First World</h1>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {["Earth-like", "Ocean World", "Ice World", "Lava World", "Gas Giant", "Random Planet"].map((label) => <Button key={label} onClick={createProfile}>{label}</Button>)}
        </div>
      </main>
    );
  }

  return (
    <main className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="min-w-0 space-y-5">
        <PlanetPreview profile={activeProfile} />
        <PlanetLibrary profiles={profiles} activeProfileId={activeProfileId} onSelect={setActiveProfileId} onDuplicate={duplicateProfile} onArchive={() => replaceActive({ ...cloneSurfaceProfile(activeProfile), status: "Archived", modifiedAt: profileTimestamp() })} />

        <CreativeSection id="identity" eyebrow="Identity" title="Name the world" description="Planet seed is the DNA of the world. The contract remains stable while the experience stays creative.">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black text-white">Planet Name</span>
              <input value={activeProfile.profileName} onChange={(event) => replaceActive({ ...cloneSurfaceProfile(activeProfile), profileName: event.target.value, status: "Draft", modifiedAt: profileTimestamp() })} className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/70 px-4 text-lg font-black text-white outline-none focus:border-cyan-200/60" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black text-white">Planet Type</span>
              <select className="h-12 rounded-md border border-cyan-300/15 bg-slate-950/70 px-4 text-lg font-black text-white outline-none focus:border-cyan-200/60">
                {presetWorlds.map((preset) => <option key={preset.type}>{preset.type}</option>)}
              </select>
            </label>
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-black text-white">Description</span>
              <textarea defaultValue="A temperate living world with broad oceans, green lowlands, and pale mountain systems." className="min-h-28 rounded-md border border-cyan-300/15 bg-slate-950/70 p-4 text-sm font-bold text-white outline-none focus:border-cyan-200/60" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button><Sparkles className="h-4 w-4" /> Inspire Me</Button>
            <Button onClick={duplicateProfile}><Copy className="h-4 w-4" /> Duplicate</Button>
            <Button><Heart className="h-4 w-4" /> Favorite</Button>
            <Button onClick={() => downloadJson(`${activeProfile.profileId}.json`, formatJson(activeProfile))}><Download className="h-4 w-4" /> Export Contract</Button>
          </div>
        </CreativeSection>

        <CreativeSection id="shape" eyebrow="Shape" title="Choose the world silhouette" description="Large creative styles update the existing planet-generation contract without exposing procedural node terms.">
          <div className="grid gap-3 md:grid-cols-3">
            {["Earth-like", "Archipelago", "Ocean World", "Supercontinent", "Broken World", "Ice World"].map((style) => <button key={style} type="button" className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-5 text-left text-xl font-black text-white transition hover:border-cyan-200/60 hover:bg-cyan-300/10">{style}</button>)}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Slider label="Continent Size" value={activeProfile.planetGeneration.scale} min={0.1} max={20} onChange={(value) => replaceActive(updateParameter(activeProfile, "planetGeneration", "continentScale", value))} />
            <Slider label="Sea Level" value={activeProfile.planetGeneration.seaLevel.fromMax} min={0.1} max={0.95} onChange={(value) => replaceActive(updateParameter(activeProfile, "planetGeneration", "seaLevelFromMax", value))} />
            <Slider label="Coastline Style" value={activeProfile.planetGeneration.continentMask.whitePosition} min={0} max={1} onChange={(value) => replaceActive(updateParameter(activeProfile, "planetGeneration", "continentMaskWhitePosition", value))} />
          </div>
          <AdvancedBlenderControls moduleId="planetGeneration" profile={activeProfile} onUpdate={replaceActive} />
        </CreativeSection>

        <CreativeSection id="terrain" eyebrow="Terrain" title="Shape mountains and valleys" description="Shape mountains, valleys and rolling landscapes with artist-friendly controls.">
          <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
            <div className="space-y-5">
              <Slider label="Mountain Height" value={activeProfile.elevation.mountainScale} min={1} max={60} onChange={(value) => replaceActive(updateParameter(activeProfile, "elevation", "mountainScale", value))} />
              <Slider label="Mountain Density" value={activeProfile.elevation.mountainDetail} min={0} max={15} onChange={(value) => replaceActive(updateParameter(activeProfile, "elevation", "mountainDetail", value))} />
              <Slider label="Terrain Complexity" value={activeProfile.terrainGeneration.detail} min={0} max={15} onChange={(value) => replaceActive(updateParameter(activeProfile, "terrainGeneration", "terrainDetail", value))} />
              <Slider label="Terrain Variation" value={activeProfile.terrainGeneration.blendFactor} min={0} max={1} onChange={(value) => replaceActive(updateParameter(activeProfile, "terrainGeneration", "terrainBlendFactor", value))} />
            </div>
            <div className="rounded-md border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(148,163,184,.16),rgba(34,211,238,.08)),repeating-linear-gradient(135deg,rgba(255,255,255,.12)_0_1px,transparent_1px_18px)] p-5">
              <p className="text-sm font-black text-white">Terrain Preview</p>
              <div className="mt-4 h-44 rounded-md bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,.22),transparent_12%),linear-gradient(135deg,#102116,#475242,#d8d3c6)]" />
            </div>
          </div>
          <AdvancedBlenderControls moduleId="terrainGeneration" profile={activeProfile} onUpdate={replaceActive} />
          <AdvancedBlenderControls moduleId="elevation" profile={activeProfile} onUpdate={replaceActive} />
        </CreativeSection>

        <CreativeSection id="surface" eyebrow="Surface" title="Paint the living skin" description="Drag the surface palette as lowlands, highlands, mountains, and ocean regions.">
          <ColorRegionEditor profile={activeProfile} onUpdate={replaceActive} />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-black text-white">Ocean Color</span>
              <input type="color" value={activeProfile.oceanMaterial.baseColor} onChange={(event) => replaceActive(updateParameter(activeProfile, "oceanMaterial", "oceanBaseColor", event.target.value))} className="h-12 w-full rounded-md border border-cyan-300/20 bg-slate-950" />
            </label>
            <Slider label="Reflection" value={1 - activeProfile.oceanMaterial.roughness} min={0} max={1} onChange={(value) => replaceActive(updateParameter(activeProfile, "oceanMaterial", "oceanRoughness", 1 - value))} />
            <Slider label="Smoothness" value={1 - activeProfile.landMaterial.roughness} min={0} max={1} onChange={(value) => replaceActive(updateParameter(activeProfile, "landMaterial", "landRoughness", 1 - value))} />
          </div>
          <AdvancedBlenderControls moduleId="landMaterial" profile={activeProfile} onUpdate={replaceActive} />
          <AdvancedBlenderControls moduleId="oceanMaterial" profile={activeProfile} onUpdate={replaceActive} />
        </CreativeSection>

        <CreativeSection id="atmosphere" eyebrow="Atmosphere" title="Wrap the world in air" description="Atmospheric editing is creative intent only here; future dedicated contracts remain read-only until configured.">
          <div className="grid gap-5 md:grid-cols-5">
            {["Atmosphere Color", "Glow", "Cloud Coverage", "Cloud Height", "Fog"].map((label, index) => <Slider key={label} label={label} value={index === 0 ? 0.7 : 0.45} min={0} max={1} onChange={() => undefined} />)}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {relatedRenderSystems.slice(0, 3).map((system) => <div key={system.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><p className="font-black text-white">{system.label}</p><p className="mt-2 text-sm text-slate-400">{system.note}</p></div>)}
          </div>
        </CreativeSection>

        <CreativeSection id="lighting" eyebrow="Lighting" title="Set the cinematic read" description="Simple presentation intent for sun angle, exposure, and background.">
          <div className="grid gap-5 md:grid-cols-4">
            <Slider label="Sun Angle" value={0.35} min={0} max={1} onChange={() => undefined} />
            <Slider label="Sun Strength" value={0.72} min={0} max={1} onChange={() => undefined} />
            <Slider label="Exposure" value={0.5} min={0} max={1} onChange={() => undefined} />
            <Slider label="Background" value={0.3} min={0} max={1} onChange={() => undefined} />
          </div>
          <AdvancedBlenderControls moduleId="surfaceDetail" profile={activeProfile} onUpdate={replaceActive} />
        </CreativeSection>

        <CreativeSection id="camera" eyebrow="Camera" title="Frame the world" description="Camera settings stay high level in the creative workspace. Precise mapping remains in advanced controls.">
          <div className="grid gap-3 md:grid-cols-3">
            {["Hero Portrait", "Library Card", "Transparent Runtime"].map((name) => <div key={name} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-5"><Camera className="h-5 w-5 text-cyan-200" /><p className="mt-3 text-lg font-black text-white">{name}</p></div>)}
          </div>
          <AdvancedBlenderControls moduleId="coordinates" profile={activeProfile} onUpdate={replaceActive} />
        </CreativeSection>

        <CreativeSection id="output" eyebrow="Output" title="Choose production outputs" description="Beautiful output targets for future render execution. Studio exports the contract only.">
          <div className="grid gap-3 md:grid-cols-5">
            {["Hero", "Card", "Thumbnail", "Runtime", "Transparent PNG"].map((name) => <div key={name} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-5"><Layers3 className="h-5 w-5 text-cyan-200" /><p className="mt-3 text-lg font-black text-white">{name}</p></div>)}
          </div>
          <p className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-bold text-slate-300">External Blender execution is not connected. Planet Creator authors the world contract only.</p>
          <details className="mt-6 rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
            <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.18em] text-cyan-100">Contract and Blender Mapping</summary>
            <div className="mt-4 flex flex-wrap gap-2">
              <ProductionCopyButton label="Copy Contract" text={formatJson(activeProfile)} />
              <ProductionCopyButton label="Copy Output Module" text={formatJson(getModuleContract(activeProfile, "output"))} />
              <Button onClick={() => downloadJson(`${activeProfile.profileId}.json`, formatJson(activeProfile))}><Download className="h-4 w-4" /> Download Contract</Button>
            </div>
            <div className="mt-4 max-h-72 overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/55">
              {blenderFieldMappings.map((row) => <div key={`${row.studioField}-${row.blenderNode}`} className="grid gap-2 border-b border-cyan-300/10 p-3 text-sm text-slate-300 md:grid-cols-4"><span className="font-black text-cyan-100">{row.studioField}</span><span>{row.blenderObject}</span><span>{row.blenderNode}</span><span>{row.blenderSocket}</span></div>)}
            </div>
          </details>
        </CreativeSection>
      </section>
      <PlanetDNA profile={activeProfile} validation={validation} />
    </main>
  );
}

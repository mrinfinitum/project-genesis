import { createHash } from "node:crypto";
import type { ComponentDesignRecord, ComponentReferenceAttachment } from "@/lib/component-library";

export type ComponentPreviewOutputRole = "primary" | "card_thumbnail_256" | "grid_preview_512" | "state_matrix" | "large_1024";

export type ComponentPreviewOutputSpec = {
  role: ComponentPreviewOutputRole;
  width: number;
  height: number;
  format: "SVG";
  suffix: string;
};

export type ComponentPreviewAuditItem = {
  componentId: string;
  displayName: string;
  category: string;
  variants: string[];
  requiredStates: string[];
  preferredPreviewViewport: string;
  expectedAspectRatio: string;
  existingImplementationReference: string;
  viteImplementationPath: string;
  robloxImplementationPath: string;
  missingAssetsOrDataBlockers: string[];
  captureSource: "Studio-rendered component specimen";
  captureBlockers: string[];
};

export const generatedComponentPreviewIds = [
  "BoostLauncherButton",
  "SecondaryActionButton",
  "ArtRequirementCard",
  "MissionCard",
  "EmptyState",
  "ErrorState",
  "LoadingSkeleton",
  "LockedState",
  "MissingDataState",
  "SuccessState",
  "BoostSlot",
  "CostDisplay",
  "UnlockRequirementList",
  "BottomDrawer",
  "ContextMenu",
  "Modal",
  "Popover",
  "ReviewDrawer",
  "Toast",
  "Tooltip",
  "BeveledGamePanel",
  "HeroPanel",
  "StatsPanel",
  "CircularProgress",
  "ProgressBar",
  "SegmentedProgress"
] as const;

export const componentPreviewOutputSpecs: ComponentPreviewOutputSpec[] = [
  { role: "primary", width: 960, height: 540, format: "SVG", suffix: "primary" },
  { role: "card_thumbnail_256", width: 256, height: 160, format: "SVG", suffix: "card-256" },
  { role: "grid_preview_512", width: 512, height: 320, format: "SVG", suffix: "grid-512" },
  { role: "state_matrix", width: 1024, height: 640, format: "SVG", suffix: "state-matrix" },
  { role: "large_1024", width: 1024, height: 640, format: "SVG", suffix: "large-1024" }
];

const generatedPreviewIdSet = new Set<string>(generatedComponentPreviewIds);
const generationDate = "2026-07-13T00:00:00.000Z";
const preferredViewport = "1440x900";
const expectedAspectRatio = "16:9 primary / 16:10 card-grid";
const captureBlockers = [
  "Storybook capture unavailable in this Studio repository.",
  "Browser screenshot capture tooling is not installed in package dependencies.",
  "No approved Roblox reference screenshot is attached to this component."
];

function slug(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function componentPreviewPublicPath(componentId: string, output: ComponentPreviewOutputSpec) {
  const id = slug(componentId);
  return `/assets/component-previews/${id}/${id}-${output.suffix}.svg`;
}

export function componentPreviewFilesystemPath(componentId: string, output: ComponentPreviewOutputSpec) {
  const id = slug(componentId);
  return `public/assets/component-previews/${id}/${id}-${output.suffix}.svg`;
}

export function componentPreviewChecksum(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function paletteFor(category: string) {
  const key = category.toLowerCase();
  if (key.includes("button")) return { accent: "#67e8f9", accent2: "#22d3ee", surface: "#08111f" };
  if (key.includes("card")) return { accent: "#c4b5fd", accent2: "#8b5cf6", surface: "#0d1020" };
  if (key.includes("feedback")) return { accent: "#fbbf24", accent2: "#f59e0b", surface: "#111827" };
  if (key.includes("overlay")) return { accent: "#f0abfc", accent2: "#d946ef", surface: "#111022" };
  if (key.includes("panel")) return { accent: "#5eead4", accent2: "#14b8a6", surface: "#06151a" };
  if (key.includes("progress")) return { accent: "#86efac", accent2: "#22c55e", surface: "#07140f" };
  return { accent: "#67e8f9", accent2: "#38bdf8", surface: "#07101e" };
}

function importantStates(record: ComponentDesignRecord) {
  const wanted = ["Default", "Hover", "Pressed", "Focused", "Disabled", "Active", "Locked", "Empty", "Populated", "Loading", "Error", "Success", "Selected", "Current", "Completed", "Next", "Mystery"];
  const available = record.states.map((state) => state.label);
  const selected = wanted.filter((state) => available.includes(state));
  return (selected.length ? selected : available).slice(0, 8);
}

function stateTone(label: string) {
  const value = label.toLowerCase();
  if (value.includes("error") || value.includes("disabled")) return "#fb7185";
  if (value.includes("success") || value.includes("active") || value.includes("completed")) return "#86efac";
  if (value.includes("locked") || value.includes("loading")) return "#fbbf24";
  if (value.includes("hover") || value.includes("focused") || value.includes("selected")) return "#67e8f9";
  return "#94a3b8";
}

function specimenFor(record: ComponentDesignRecord, output: ComponentPreviewOutputSpec) {
  const palette = paletteFor(record.category);
  const states = output.role === "state_matrix" ? importantStates(record) : importantStates(record).slice(0, 5);
  const variants = record.variants.map((variant) => variant.displayName).slice(0, output.width < 512 ? 2 : 4);
  const compact = output.width <= 256;
  const titleSize = compact ? 16 : output.width <= 512 ? 24 : 38;
  const metaSize = compact ? 8 : output.width <= 512 ? 12 : 16;
  const cardX = Math.round(output.width * 0.08);
  const cardY = Math.round(output.height * 0.2);
  const cardW = Math.round(output.width * 0.84);
  const cardH = Math.round(output.height * 0.48);
  const chipW = Math.max(58, Math.round((cardW - 24) / Math.max(1, Math.min(4, states.length))));
  const chipH = compact ? 18 : 32;
  const stateRows = states.map((state, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const x = cardX + 12 + col * chipW;
    const y = cardY + cardH + 20 + row * (chipH + 10);
    return `<g>
      <rect x="${x}" y="${y}" width="${chipW - 8}" height="${chipH}" rx="6" fill="${stateTone(state)}22" stroke="${stateTone(state)}88"/>
      <text x="${x + Math.round((chipW - 8) / 2)}" y="${y + Math.round(chipH / 2) + 4}" text-anchor="middle" font-size="${Math.max(7, metaSize - 2)}" font-weight="800" fill="${stateTone(state)}">${escapeXml(state)}</text>
    </g>`;
  }).join("");
  const variantText = variants.length ? variants.join(" / ") : "default";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${output.width}" height="${output.height}" viewBox="0 0 ${output.width} ${output.height}" role="img" aria-label="${escapeXml(record.displayName)} generated Studio component preview">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="55%" stop-color="${palette.surface}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${palette.accent2}" stop-opacity="0.55"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <path d="M0 ${output.height * 0.82} C ${output.width * 0.28} ${output.height * 0.72}, ${output.width * 0.62} ${output.height * 0.94}, ${output.width} ${output.height * 0.78} L ${output.width} ${output.height} L 0 ${output.height} Z" fill="${palette.accent2}" opacity="0.08"/>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${compact ? 10 : 18}" fill="#020617cc" stroke="${palette.accent}" stroke-opacity="0.45"/>
  <rect x="${cardX + 12}" y="${cardY + 12}" width="${cardW - 24}" height="${compact ? 32 : 56}" rx="${compact ? 8 : 12}" fill="url(#accent)" opacity="0.18"/>
  <circle cx="${cardX + Math.round(cardW * 0.84)}" cy="${cardY + Math.round(cardH * 0.38)}" r="${Math.max(18, Math.round(output.height * 0.08))}" fill="none" stroke="${palette.accent}" stroke-width="${compact ? 3 : 6}" opacity="0.85" filter="url(#glow)"/>
  <rect x="${cardX + Math.round(cardW * 0.12)}" y="${cardY + Math.round(cardH * 0.46)}" width="${Math.round(cardW * 0.5)}" height="${compact ? 8 : 14}" rx="7" fill="${palette.accent}" opacity="0.6"/>
  <rect x="${cardX + Math.round(cardW * 0.12)}" y="${cardY + Math.round(cardH * 0.58)}" width="${Math.round(cardW * 0.36)}" height="${compact ? 6 : 10}" rx="5" fill="#94a3b8" opacity="0.45"/>
  <text x="${cardX + 18}" y="${cardY + (compact ? 34 : 48)}" font-family="Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="900" fill="#f8fafc">${escapeXml(compact ? record.componentId.replace(/([a-z])([A-Z])/g, "$1 $2") : record.displayName)}</text>
  <text x="${cardX + 18}" y="${cardY + (compact ? 54 : 78)}" font-family="Inter, Arial, sans-serif" font-size="${metaSize}" font-weight="800" letter-spacing="1.8" fill="${palette.accent}">${escapeXml(record.category.toUpperCase())} / GENERATED SPECIMEN</text>
  ${stateRows}
  <text x="${cardX}" y="${output.height - (compact ? 12 : 32)}" font-family="Inter, Arial, sans-serif" font-size="${metaSize}" fill="#cbd5e1">${escapeXml(variantText)}</text>
  <text x="${output.width - cardX}" y="${output.height - (compact ? 12 : 32)}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="${metaSize}" fill="#64748b">${escapeXml(output.role.replaceAll("_", " "))}</text>
</svg>`;
}

export function renderComponentPreviewSvg(record: ComponentDesignRecord, output: ComponentPreviewOutputSpec) {
  return specimenFor(record, output);
}

export function componentPreviewOutputs(record: ComponentDesignRecord) {
  return componentPreviewOutputSpecs.map((output) => {
    const svg = renderComponentPreviewSvg(record, output);
    return {
      ...output,
      source: componentPreviewPublicPath(record.componentId, output),
      filesystemPath: componentPreviewFilesystemPath(record.componentId, output),
      checksum: componentPreviewChecksum(svg),
      svg
    };
  });
}

export function generatedComponentPreviewReferences(record: ComponentDesignRecord): ComponentReferenceAttachment[] {
  if (!generatedPreviewIdSet.has(record.componentId)) return [];
  const outputs = componentPreviewOutputs(record);
  const primary = outputs.find((output) => output.role === "primary") ?? outputs[0];
  return [{
    id: `generated-component-preview-${slug(record.componentId)}`,
    type: "Studio specimen",
    source: primary.source,
    viewport: preferredViewport,
    version: record.version,
    crop: "component specimen stage",
    notes: "Generated Studio-rendered component specimen for preview/review. Not final artwork and not an implementation capture.",
    approvalStatus: "Changes Requested",
    captureSource: "Studio-rendered component specimen",
    previewStatus: "Needs Review",
    width: primary.width,
    height: primary.height,
    format: primary.format,
    checksum: primary.checksum,
    outputRole: "primary",
    storybook: {
      storyId: `component-library-${slug(record.componentId)}--generated-specimen`,
      state: importantStates(record)[0] ?? "Default",
      variant: record.variants[0]?.id ?? "default",
      theme: "Project Genesis Studio dark HUD",
      reducedMotion: true,
      captureCrop: "component specimen stage",
      expectedOutputDimensions: `${primary.width}x${primary.height}`
    },
    outputs: outputs.map((output) => ({
      role: output.role,
      source: output.source,
      width: output.width,
      height: output.height,
      format: output.format,
      checksum: output.checksum
    })),
    captureBlockers: [...captureBlockers]
  }];
}

export function componentPreviewAuditItem(record: ComponentDesignRecord): ComponentPreviewAuditItem {
  const vite = record.implementationTargets.find((target) => target.target === "Vite Web");
  const roblox = record.implementationTargets.find((target) => target.target === "Roblox");
  return {
    componentId: record.componentId,
    displayName: record.displayName,
    category: record.category,
    variants: record.variants.map((variant) => variant.id),
    requiredStates: record.states.filter((state) => state.required).map((state) => state.label),
    preferredPreviewViewport: preferredViewport,
    expectedAspectRatio,
    existingImplementationReference: record.references.find((reference) => reference.type === "Vite screenshot" || reference.type === "Roblox screenshot")?.source ?? "No implementation screenshot attached.",
    viteImplementationPath: vite?.implementationPath || "Not mapped",
    robloxImplementationPath: roblox?.implementationPath || "Not mapped",
    missingAssetsOrDataBlockers: [
      ...record.assetKeys.filter((asset) => asset.required && asset.status !== "Ready").map((asset) => `${asset.label}: ${asset.status}`),
      ...record.dataInputs.filter((input) => input.required && input.classification === "Player Runtime State").map((input) => `${input.label}: runtime data required`)
    ],
    captureSource: "Studio-rendered component specimen",
    captureBlockers: [...captureBlockers]
  };
}

export function isGeneratedComponentPreviewId(componentId: string) {
  return generatedPreviewIdSet.has(componentId);
}

export function generatedComponentPreviewStats(records: ComponentDesignRecord[]) {
  const generatedRecords = records.filter((record) => isGeneratedComponentPreviewId(record.componentId));
  return {
    componentPreviewsPending: 0,
    componentPreviewsGenerated: generatedRecords.length,
    componentPreviewsNeedsReview: generatedRecords.length,
    componentPreviewsApproved: generatedRecords.filter((record) => record.references.some((reference) => reference.approvalStatus === "Approved" && reference.captureSource === "Studio-rendered component specimen")).length,
    componentPreviewsBlockedByMissingImplementation: generatedRecords.filter((record) => record.implementationTargets.every((target) => target.status === "Not Started")).length,
    componentPreviewsBlockedByMissingBrowserCapture: generatedRecords.length,
    componentPreviewsBlockedByMissingArt: generatedRecords.filter((record) => record.assetKeys.some((asset) => asset.required && asset.status !== "Ready")).length
  };
}

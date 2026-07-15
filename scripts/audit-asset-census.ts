import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { getArchitectureState } from "@/lib/architecture";
import { getAiAgentLibraryState } from "@/lib/ai-agents";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { assetLibraryCategoryLabels, type AssetLibraryCategoryId } from "@/lib/assets/asset-library-routing";
import { getComponentLibraryState } from "@/lib/component-library";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { getScreenDesignerState } from "@/lib/screen-designer";

type SourceKind =
  | "Asset Registry"
  | "Visual Builder"
  | "Screen Designer"
  | "Component Library"
  | "App Shell"
  | "Research Screen"
  | "Upgrade Screen"
  | "Dashboard"
  | "AI Agents"
  | "Top HUD"
  | "Left Navigation"
  | "Economy Designer"
  | "Published Runtime"
  | "Roblox Mapping"
  | "Web Mapping"
  | "Preview"
  | "Derivative"
  | "Public Asset"
  | "Legacy Import";

type CensusRecord = {
  semanticKey: string;
  displayName: string;
  category: string;
  role: string;
  sources: Set<SourceKind>;
  sourceDetails: Set<string>;
  referencedScreens: Set<string>;
  referencedComponents: Set<string>;
  runtimeUsage: Set<string>;
  robloxUsage: boolean;
  webUsage: boolean;
  derivativeStatus: "none" | "partial" | "ready";
  sourceAssetIds: Set<string>;
  statusHints: Set<string>;
};

type SuggestedMapping = {
  semanticKey: string;
  displayName: string;
  suggestedCategory: string;
  suggestedRole: string;
  linkedScreens: string[];
  linkedComponents: string[];
  confidence: "high" | "medium" | "low";
  reason: string;
};

function normalizeKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/^asset_/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function titleFromKey(value: string) {
  return value.replace(/^asset_/, "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inferRole(key: string, label = "") {
  const text = `${key} ${label}`.toLowerCase();
  if (/audio|sound|music|voice/.test(text)) return "Audio";
  if (/video|cinematic|movie/.test(text)) return "Video";
  if (/animation|blink|idle/.test(text)) return "Animation";
  if (/icon|button|node|counter|crystal|labor|credits|population|research/.test(text)) return "Icon";
  if (/panel|frame|row|tab|drawer|modal/.test(text)) return "Panel";
  if (/background|hero|splash|loading|workspace|banner/.test(text)) return "Background";
  if (/agent|robot|eye|head|expression/.test(text)) return "AI Agent Art";
  return "Artwork";
}

function inferCategory(key: string, label = "", source?: SourceKind): AssetLibraryCategoryId {
  const text = `${key} ${label} ${source ?? ""}`.toLowerCase();
  if (/audio|sound|music|voice/.test(text)) return "audio";
  if (/video|cinematic|movie/.test(text)) return "video";
  if (/animation|blink_animation|idle_animation/.test(text)) return "animations";
  if (/ai[_ -]?agent|auto_robot|robot|eye|head|expression/.test(text)) return "ai-agents";
  if (/top[_ -]?hud|hud|economy_|premium|civilization_identity|calendar|trophy/.test(text)) return "top-hud";
  if (/left[_ -]?navigation|side[_ -]?navigation|nav[_ -]?rail|overview_icon|spaceport_icon/.test(text)) return "left-navigation";
  if (/research/.test(text)) return "research-ui";
  if (/building/.test(text)) return "buildings-ui";
  if (/upgrade|workforce|industry|science|technology/.test(text)) return "upgrade-categories";
  if (/galaxy|spaceport/.test(text)) return "galaxy-ui";
  if (/planet|earth|sol|biome|celestial/.test(text)) return "planet-ui";
  if (/settings|account|cloud|save[_ -]?conflict|toggle|slider/.test(text)) return "settings-ui";
  if (/login|signup|forgot|reset|welcome/.test(text)) return "login-ui";
  if (/loading|launch|splash|wordmark/.test(text)) return "loading-ui";
  if (/background|hero|splash|banner/.test(text)) return "backgrounds";
  if (/icon|button|node/.test(text)) return "icons";
  return "unmapped";
}

function addRecord(
  map: Map<string, CensusRecord>,
  input: {
    semanticKey: unknown;
    displayName?: string;
    source: SourceKind;
    detail: string;
    category?: string;
    role?: string;
    screen?: string;
    component?: string;
    runtime?: string;
    assetId?: string | null;
    status?: string;
    roblox?: boolean;
    web?: boolean;
    derivative?: boolean;
  }
) {
  const semanticKey = normalizeKey(input.semanticKey);
  if (!semanticKey) return null;
  const existing = map.get(semanticKey);
  const record = existing ?? {
    semanticKey,
    displayName: input.displayName || titleFromKey(semanticKey),
    category: input.category ?? assetLibraryCategoryLabels[inferCategory(semanticKey, input.displayName, input.source)],
    role: input.role ?? inferRole(semanticKey, input.displayName),
    sources: new Set<SourceKind>(),
    sourceDetails: new Set<string>(),
    referencedScreens: new Set<string>(),
    referencedComponents: new Set<string>(),
    runtimeUsage: new Set<string>(),
    robloxUsage: false,
    webUsage: false,
    derivativeStatus: "none" as const,
    sourceAssetIds: new Set<string>(),
    statusHints: new Set<string>()
  };
  record.sources.add(input.source);
  record.sourceDetails.add(input.detail);
  if (input.displayName && record.displayName === titleFromKey(semanticKey)) record.displayName = input.displayName;
  if (input.screen) record.referencedScreens.add(input.screen);
  if (input.component) record.referencedComponents.add(input.component);
  if (input.runtime) record.runtimeUsage.add(input.runtime);
  if (input.assetId) record.sourceAssetIds.add(input.assetId);
  if (input.status) record.statusHints.add(input.status);
  if (input.roblox) record.robloxUsage = true;
  if (input.web) record.webUsage = true;
  if (input.derivative) record.derivativeStatus = "ready";
  map.set(semanticKey, record);
  return record;
}

function primaryAssetKeys(asset: {
  id: string;
  name: string;
  artKey?: string;
  iconKey?: string;
  audioKey?: string;
  modelKey?: string;
  aliases?: string[];
}) {
  return [asset.artKey, asset.iconKey, asset.audioKey, asset.modelKey, asset.id].filter(Boolean) as string[];
}

function walkFiles(root: string, extensions = new Set([".ts", ".tsx"])) {
  const rows: string[] = [];
  function walk(current: string) {
    if (current.includes(`${path.sep}node_modules${path.sep}`) || current.includes(`${path.sep}.next${path.sep}`)) return;
    const stats = statSync(current);
    if (stats.isDirectory()) {
      for (const child of readdirSync(current)) walk(path.join(current, child));
      return;
    }
    if (extensions.has(path.extname(current))) rows.push(current);
  }
  walk(root);
  return rows;
}

function sourceKindForFile(relativePath: string): SourceKind {
  if (relativePath.includes("app-shell") || relativePath.includes("components/app-shell")) return "App Shell";
  if (relativePath.includes("research")) return "Research Screen";
  if (relativePath.includes("upgrade")) return "Upgrade Screen";
  if (relativePath === "app/page.tsx" || relativePath.includes("dashboard")) return "Dashboard";
  if (relativePath.includes("economy")) return "Economy Designer";
  if (relativePath.includes("ai-agent")) return "AI Agents";
  if (relativePath.includes("screen-designer")) return "Screen Designer";
  if (relativePath.includes("component-library")) return "Component Library";
  return "Public Asset";
}

function keyFromAssetPath(value: string) {
  const basename = path.basename(value).replace(/\.[a-z0-9]+$/i, "");
  return normalizeKey(basename);
}

function auditSourceCodeReferences(census: Map<string, CensusRecord>) {
  const roots = ["app", "components", "lib"].map((item) => path.join(process.cwd(), item));
  const keyPattern = /\b(?:artKey|iconKey|audioKey|modelKey|assetKey|assetOverride|backgroundArtKey|fallbackArtKey|heroArtKey|previewKey)\b\s*[:=]\s*["']([^"']+)["']/g;
  const publicAssetPattern = /["'](\/assets\/[^"']+\.(?:png|webp|jpg|jpeg|svg|gif|mp4|webm|mp3|wav|ogg))["']/g;
  for (const root of roots) {
    for (const filePath of walkFiles(root)) {
      const relativePath = path.relative(process.cwd(), filePath);
      const text = readFileSync(filePath, "utf8");
      const source = sourceKindForFile(relativePath);
      for (const match of text.matchAll(keyPattern)) {
        addRecord(census, {
          semanticKey: match[1],
          source,
          detail: relativePath,
          status: "code_reference"
        });
      }
      for (const match of text.matchAll(publicAssetPattern)) {
        addRecord(census, {
          semanticKey: keyFromAssetPath(match[1]),
          displayName: path.basename(match[1]),
          source: "Public Asset",
          detail: `${relativePath} -> ${match[1]}`,
          status: "public_asset_reference",
          web: true
        });
      }
    }
  }
}

function qualityRank(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("published")) return "Published";
  if (normalized.includes("approved")) return "Approved";
  if (normalized.includes("missing")) return "Missing";
  if (normalized.includes("draft")) return "Draft";
  return status || "Unknown";
}

function summarizeCategory(items: Array<{ status: string; sourceAssetId: string | null; previewUrl: string | null; categoryId: string }>) {
  return {
    total: items.length,
    mapped: items.filter((item) => item.sourceAssetId).length,
    published: items.filter((item) => item.status === "published").length,
    draft: items.filter((item) => ["needs_review", "uploaded", "processing", "approved"].includes(item.status)).length,
    missing: items.filter((item) => item.status === "missing").length,
    missingPreview: items.filter((item) => !item.previewUrl).length,
    unmapped: items.filter((item) => item.categoryId === "unmapped").length
  };
}

function confidenceFor(record: CensusRecord) {
  if (record.referencedScreens.size || record.referencedComponents.size || record.runtimeUsage.size) return "high";
  if (record.webUsage || record.robloxUsage || record.sourceAssetIds.size) return "medium";
  return "low";
}

async function main() {
  const [architecture, assetState, screenState, componentState, runtime] = await Promise.all([
    getArchitectureState(),
    getAssetProductionState(),
    getScreenDesignerState(),
    getComponentLibraryState(),
    buildCanonicalRuntimeExportPayload()
  ]);
  const aiAgentState = await getAiAgentLibraryState(assetState);

  const census = new Map<string, CensusRecord>();
  const libraryByKey = new Map(assetState.assetLibraryInventory.items.map((item) => [normalizeKey(item.semanticAssetKey), item]));
  const libraryAssetIds = new Set(assetState.assetLibraryInventory.items.map((item) => item.sourceAssetId).filter(Boolean));
  const assetById = new Map(assetState.assets.map((asset) => [asset.id, asset]));

  for (const asset of assetState.assets) {
    const keys = primaryAssetKeys(asset);
    for (const key of keys) {
      addRecord(census, {
        semanticKey: key,
        displayName: asset.name,
        source: "Asset Registry",
        detail: asset.id,
        category: asset.category,
        role: inferRole(key, asset.name),
        assetId: asset.id,
        status: qualityRank(asset.productionStatus || asset.status),
        roblox: Boolean(asset.platformMappings.roblox),
        web: Boolean(asset.platformMappings.web),
        derivative: asset.derivatives.length > 0
      });
    }
    for (const sourceFile of asset.sourceFiles) {
      addRecord(census, {
        semanticKey: keys[0],
        displayName: sourceFile.filename,
        source: "Preview",
        detail: `${asset.id}:${sourceFile.id}`,
        assetId: asset.id,
        status: sourceFile.previewStatus ?? "source_file",
        web: Boolean(sourceFile.previewUrl)
      });
    }
    for (const derivative of asset.derivatives) {
      addRecord(census, {
        semanticKey: keys[0],
        displayName: asset.name,
        source: "Derivative",
        detail: `${asset.id}:${derivative.derivativeType}:${derivative.publicUrl || derivative.storagePath}`,
        assetId: asset.id,
        status: derivative.publishStatus ?? derivative.status,
        roblox: derivative.publicUrl?.startsWith("rbxassetid://") ?? false,
        web: derivative.publicUrl?.startsWith("/assets/") ?? false,
        derivative: true
      });
    }
  }

  for (const item of assetState.assetLibraryInventory.items) {
    addRecord(census, {
      semanticKey: item.semanticAssetKey,
      displayName: item.displayName,
      source: "Asset Registry",
      detail: `asset-library:${item.id}`,
      category: item.categoryPath,
      role: item.role,
      assetId: item.sourceAssetId,
      status: item.status,
      web: item.platformReadiness.web === "ready",
      roblox: item.platformReadiness.roblox === "ready",
      derivative: Boolean(item.previewUrl)
    });
  }

  for (const screen of screenState.records) {
    const screenSource: SourceKind =
      screen.screenId === "dashboard" ? "Dashboard" :
      screen.displayName.toLowerCase().includes("research") ? "Research Screen" :
      screen.displayName.toLowerCase().includes("upgrade") ? "Upgrade Screen" :
      "Screen Designer";
    for (const requirement of screen.assetRequirements) {
      addRecord(census, {
        semanticKey: requirement.artKey ?? requirement.iconKey ?? requirement.id,
        displayName: requirement.label,
        source: screenSource,
        detail: `${screen.screenId}:${requirement.id}`,
        role: requirement.category,
        screen: screen.displayName,
        assetId: requirement.linkedAssetId ?? null,
        status: requirement.status
      });
    }
    for (const component of screen.componentSpecs) {
      const source: SourceKind = component.componentLibraryId?.toLowerCase().includes("nav") ? "Left Navigation" : component.componentLibraryId?.toLowerCase().includes("hud") ? "Top HUD" : "Visual Builder";
      for (const key of component.assetKeys ?? []) {
        addRecord(census, {
          semanticKey: key,
          displayName: `${component.displayName} asset`,
          source,
          detail: `${screen.screenId}:${component.id}`,
          screen: screen.displayName,
          component: component.componentLibraryId ?? component.displayName,
          status: "visual_builder_reference"
        });
      }
    }
  }

  for (const component of componentState.records) {
    for (const asset of component.assetKeys) {
      addRecord(census, {
        semanticKey: asset.assetKey,
        displayName: asset.label,
        source: "Component Library",
        detail: `${component.componentId}:${asset.id}`,
        role: component.category,
        component: component.displayName,
        assetId: asset.linkedAssetId ?? null,
        status: asset.status
      });
    }
    for (const attachment of component.references) {
      if (attachment.source.startsWith("/assets/")) {
        addRecord(census, {
          semanticKey: keyFromAssetPath(attachment.source),
          displayName: `${component.displayName} ${attachment.type}`,
          source: "Preview",
          detail: `${component.componentId}:${attachment.id}`,
          component: component.displayName,
          status: attachment.previewStatus ?? attachment.approvalStatus,
          web: true
        });
      }
      for (const output of attachment.outputs ?? []) {
        addRecord(census, {
        semanticKey: `${component.componentId}_${output.role}`,
          displayName: `${component.displayName} ${output.role}`,
          source: "Derivative",
          detail: `${component.componentId}:${attachment.id}:${output.role}`,
          component: component.displayName,
          status: "component_preview_output",
          web: output.source.startsWith("/assets/"),
          derivative: true
        });
      }
    }
  }

  for (const agent of aiAgentState.records) {
    for (const slot of agent.artworkSlots) {
      addRecord(census, {
        semanticKey: slot.artKey,
        displayName: `${agent.displayName} ${slot.label}`,
        source: "AI Agents",
        detail: `${agent.id}:${slot.id}`,
        role: slot.kind,
        component: agent.componentLibraryReferences.join(", "),
        assetId: slot.linkedAssetId ?? null,
        status: slot.status,
        web: slot.preview.source === "web_mapping" || Boolean(slot.preview.url),
        derivative: slot.preview.status === "Generated" || slot.preview.status === "Approved" || slot.preview.status === "Published"
      });
    }
    for (const expression of agent.expressionVariants) {
      addRecord(census, {
        semanticKey: expression.artKey,
        displayName: `${agent.displayName} ${expression.label}`,
        source: "AI Agents",
        detail: `${agent.id}:${expression.id}`,
        role: "expression",
        status: expression.status
      });
    }
  }

  for (const asset of runtime.assets) {
    for (const key of [asset.artKey, asset.iconKey, asset.audioKey, asset.modelKey, asset.id].filter(Boolean)) {
      addRecord(census, {
        semanticKey: key,
        displayName: asset.name,
        source: "Published Runtime",
        detail: asset.id,
        runtime: asset.id,
        status: asset.status,
        roblox: Boolean(asset.platformMappings.roblox?.assetId),
        web: Boolean(asset.platformMappings.web?.path)
      });
    }
    if (asset.platformMappings.roblox?.assetId) {
      addRecord(census, { semanticKey: asset.artKey || asset.iconKey || asset.id, displayName: asset.name, source: "Roblox Mapping", detail: asset.platformMappings.roblox.assetId, runtime: asset.id, roblox: true });
    }
    if (asset.platformMappings.web?.path) {
      addRecord(census, { semanticKey: asset.artKey || asset.iconKey || asset.id, displayName: asset.name, source: "Web Mapping", detail: asset.platformMappings.web.path, runtime: asset.id, web: true });
    }
  }

  for (const report of assetState.robloxManifestReports) {
    for (const imported of [...(report.matched ?? []), ...(report.created ?? [])]) {
      addRecord(census, {
        semanticKey: "artKey" in imported ? imported.artKey : imported.assetId,
        displayName: imported.assetId,
        source: "Legacy Import",
        detail: `${report.manifestPath}:${imported.assetId}`,
        assetId: imported.assetId,
        status: "matchedBy" in imported ? `matched:${imported.matchedBy}` : "created",
        roblox: Boolean(imported.robloxAssetId)
      });
    }
    for (const placeholder of report.placeholderAssets ?? []) {
      addRecord(census, {
        semanticKey: placeholder.asset,
        displayName: placeholder.usage || placeholder.asset,
        source: "Legacy Import",
        detail: `${report.manifestPath}:placeholder:${placeholder.usage}`,
        status: "placeholder_reference"
      });
    }
  }

  auditSourceCodeReferences(census);

  const records = [...census.values()].sort((left, right) => left.semanticKey.localeCompare(right.semanticKey));
  const assetPrimaryKeys = new Map<string, string[]>();
  const duplicateSourceFiles = new Map<string, string[]>();
  for (const asset of assetState.assets) {
    const primary = normalizeKey(asset.artKey || asset.iconKey || asset.audioKey || asset.modelKey || asset.id);
    assetPrimaryKeys.set(primary, [...(assetPrimaryKeys.get(primary) ?? []), asset.id]);
    for (const source of asset.sourceFiles) {
      const key = normalizeKey(`${source.filename}:${source.checksum || source.storagePath}`);
      duplicateSourceFiles.set(key, [...(duplicateSourceFiles.get(key) ?? []), `${asset.id}:${source.id}`]);
    }
  }

  const isRepresentedInLibrary = (record: CensusRecord) =>
    libraryByKey.has(record.semanticKey) || [...record.sourceAssetIds].some((assetId) => libraryAssetIds.has(assetId));
  const missingFromLibrary = records.filter((record) => !isRepresentedInLibrary(record));
  const representedButUnlinked = assetState.assetLibraryInventory.items.filter((item) =>
    !item.sourceAssetId &&
    !item.referencedByScreens.length &&
    !item.referencedByComponents.length &&
    !item.referencedByPlaceholders.length
  );
  const brokenReferences = [
    ...assetState.assetLibraryInventory.items
      .filter((item) => item.sourceAssetId && !assetById.has(item.sourceAssetId))
      .map((item) => ({ semanticKey: item.semanticAssetKey, issue: "Asset Library sourceAssetId does not resolve.", reference: item.sourceAssetId })),
    ...screenState.records.flatMap((screen) => screen.assetRequirements
      .filter((requirement) => requirement.linkedAssetId && !assetById.has(requirement.linkedAssetId))
      .map((requirement) => ({ semanticKey: normalizeKey(requirement.artKey ?? requirement.iconKey ?? requirement.id), issue: "Screen linkedAssetId does not resolve.", reference: `${screen.screenId}:${requirement.linkedAssetId}` }))),
    ...componentState.records.flatMap((component) => component.assetKeys
      .filter((asset) => asset.linkedAssetId && !assetById.has(asset.linkedAssetId))
      .map((asset) => ({ semanticKey: normalizeKey(asset.assetKey), issue: "Component linkedAssetId does not resolve.", reference: `${component.componentId}:${asset.linkedAssetId}` })))
  ];
  const missingPreviews = assetState.assetLibraryInventory.items.filter((item) => !item.previewUrl);
  const missingThumbnails = assetState.assets.filter((asset) => !asset.derivatives.some((item) => /thumb|preview|card/i.test(`${item.derivativeType} ${item.presetId ?? ""}`)));
  const missingDerivatives = assetState.assets.filter((asset) => !asset.derivatives.length);
  const unmappedAssets = assetState.assetLibraryInventory.unmappedAssets;
  const duplicateSemanticKeys = [
    ...assetState.assetLibraryInventory.duplicateSemanticKeys,
    ...[...assetPrimaryKeys.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([semanticAssetKey, itemIds]) => ({ semanticAssetKey, itemIds }))
  ];
  const duplicateSourceFileRows = [...duplicateSourceFiles.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([sourceKey, rows]) => ({ sourceKey, rows }));

  const suggestedMappings: SuggestedMapping[] = missingFromLibrary.slice(0, 80).map((record) => {
    const category = inferCategory(record.semanticKey, record.displayName, [...record.sources][0]);
    const confidence = confidenceFor(record);
    return {
      semanticKey: record.semanticKey,
      displayName: record.displayName,
      suggestedCategory: assetLibraryCategoryLabels[category],
      suggestedRole: record.role,
      linkedScreens: [...record.referencedScreens].sort(),
      linkedComponents: [...record.referencedComponents].sort(),
      confidence,
      reason: `${[...record.sources].join(", ")} reference not present in Asset Library inventory.`
    };
  });

  const health = {
    published: assetState.publishedAssets.length,
    needsMapping: unmappedAssets.length + missingFromLibrary.length,
    duplicate: duplicateSemanticKeys.length + duplicateSourceFileRows.length,
    orphaned: representedButUnlinked.length,
    missing: assetState.missingRequirements.length,
    broken: brokenReferences.length
  };
  const penalty = Math.min(65, Math.round((health.needsMapping * 0.12) + (health.duplicate * 2) + (health.orphaned * 0.08) + (health.broken * 3) + (missingPreviews.length * 0.02)));
  const healthScore = Math.max(0, 100 - penalty);

  const categoryAudit = {
    topHud: summarizeCategory(assetState.assetLibraryInventory.items.filter((item) => item.categoryId === "top-hud")),
    leftNavigation: summarizeCategory(assetState.assetLibraryInventory.items.filter((item) => item.categoryId === "left-navigation")),
    research: summarizeCategory(assetState.assetLibraryInventory.items.filter((item) => item.categoryId === "research-ui")),
    buildings: summarizeCategory(assetState.assetLibraryInventory.items.filter((item) => item.categoryId === "buildings-ui")),
    dashboard: summarizeCategory(assetState.assetLibraryInventory.items.filter((item) => item.referencedByScreens.some((reference) => /dashboard|civilization/i.test(reference.name)))),
    aiAgent: summarizeCategory(assetState.assetLibraryInventory.items.filter((item) => item.categoryId === "ai-agents")),
    upgradeCategories: summarizeCategory(assetState.assetLibraryInventory.items.filter((item) => item.categoryId === "upgrade-categories" || item.referencedByPlaceholders.some((reference) => reference.type === "upgrade_category")))
  };
  const topHudComponent = componentState.records.find((component) => component.componentId === "TopHudBar");
  const sideNavigationComponent = componentState.records.find((component) => component.componentId === "SideNavigationRail");
  const appShellScreen = screenState.records.find((screen) => screen.screenId === "noveris-app-shell");
  const uiShellAudit = {
    appShellScreenPresent: Boolean(appShellScreen),
    topHudComponentPresent: Boolean(topHudComponent),
    leftNavigationComponentPresent: Boolean(sideNavigationComponent),
    shellOwnsTopHud: Boolean(appShellScreen?.componentSpecs.some((component) => component.componentLibraryId === "TopHudBar")),
    shellOwnsLeftNavigation: Boolean(appShellScreen?.componentSpecs.some((component) => component.componentLibraryId === "SideNavigationRail")),
    topHudAssetKeys: topHudComponent?.assetKeys.map((asset) => ({ key: asset.assetKey, status: asset.status, representedInAssetLibrary: libraryByKey.has(normalizeKey(asset.assetKey)) })) ?? [],
    leftNavigationAssetKeys: sideNavigationComponent?.assetKeys.map((asset) => ({ key: asset.assetKey, status: asset.status, representedInAssetLibrary: libraryByKey.has(normalizeKey(asset.assetKey)) })) ?? [],
    assetLibraryTopHudItems: categoryAudit.topHud.total,
    assetLibraryLeftNavigationItems: categoryAudit.leftNavigation.total,
    buildSource: "components/app-shell.tsx"
  };

  const output = {
    ok: true,
    architecture: {
      architectureVersion: architecture.architectureVersion.current,
      contentVersion: architecture.currentContentVersion,
      rule: architecture.codexHandoffRule
    },
    totals: {
      knownAssets: records.length,
      assetRegistryAssets: assetState.assets.length,
      assetLibraryItems: assetState.assetLibraryInventory.items.length,
      mapped: records.length - missingFromLibrary.length,
      unmapped: unmappedAssets.length,
      duplicate: duplicateSemanticKeys.length,
      duplicateSourceFiles: duplicateSourceFileRows.length,
      broken: brokenReferences.length,
      orphaned: representedButUnlinked.length,
      missingPreviews: missingPreviews.length,
      missingThumbnails: missingThumbnails.length,
      missingDerivatives: missingDerivatives.length
    },
    registryHealth: {
      ...health,
      score: healthScore
    },
    uiShellAudit,
    categoryAudit,
    missingFromAssetLibrary: missingFromLibrary.slice(0, 80).map((record) => ({
      semanticKey: record.semanticKey,
      displayName: record.displayName,
      sources: [...record.sources].sort(),
      screens: [...record.referencedScreens].sort(),
      components: [...record.referencedComponents].sort(),
      runtimeUsage: [...record.runtimeUsage].sort()
    })),
    representedButUnlinked: representedButUnlinked.slice(0, 80).map((item) => ({
      semanticKey: item.semanticAssetKey,
      displayName: item.displayName,
      category: item.categoryPath,
      status: item.status
    })),
    duplicateSemanticKeys,
    duplicateSourceFiles: duplicateSourceFileRows.slice(0, 80),
    brokenReferences: brokenReferences.slice(0, 80),
    missingPreviewSamples: missingPreviews.slice(0, 40).map((item) => ({ semanticKey: item.semanticAssetKey, displayName: item.displayName, category: item.categoryPath, status: item.status })),
    suggestedMappings,
    notes: [
      "Audit only: no requirements, placeholders, asset records, mappings, or runtime records were generated.",
      "Suggested mappings are review candidates; designers should approve before mutation.",
      "Private source paths are intentionally not emitted."
    ]
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

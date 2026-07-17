import { canonicalDiscoveries } from "@/lib/discovery";
import { resolveCanonicalRecordArtwork, type CanonicalArtworkFallbackReason, type CanonicalArtworkState, type CanonicalRecordArtworkTone } from "@/lib/artwork/canonical-record-artwork";
import { generateFaction, generateFallbackFactions, type FactionRecord } from "@/lib/factions/procedural";
import {
  generateCelestialBodies,
  generateGalaxy,
  generateSector,
  generateStars,
  generateStarSystems,
  generateUniverse,
  type CelestialBodyNode,
  type GalaxyNode,
  type SectorNode,
  type StarNode,
  type StarSystemNode
} from "@/lib/universe/generator";

export const UNIVERSE_LIBRARY_SEED = "PROJECT-GENESIS-UNIVERSE";

export type UniverseLibraryKind = "galaxies" | "sectors" | "star-systems" | "stars" | "planets" | "discoveries" | "civilizations";

export type UniverseLibraryRecord = {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  parentLabel?: string;
  parentId?: string;
  seed?: string;
  childCountLabel?: string;
  status: "Generated" | "Draft" | "Needs Review" | "Approved" | "Published" | "Invalid";
  readiness: "Ready" | "Not Published" | "Invalid" | "Missing Required Relationship";
  href: string;
  previewTone: "galaxy" | "sector" | "system" | "star" | "planet" | "discovery" | "civilization";
  thumbnailUrl?: string;
  thumbnailAvifUrl?: string;
  thumbnailWebpUrl?: string;
  thumbnailRetinaUrl?: string;
  thumbnailSrcSet?: string;
  mediumPreviewUrl?: string;
  focalPoint?: string;
  artworkState?: CanonicalArtworkState;
  artworkFallbackReason?: CanonicalArtworkFallbackReason;
  artworkSourceAssetId?: string;
  artworkAltText?: string;
  artworkAspectRatio?: number;
  artworkWidth?: number;
  artworkHeight?: number;
  meta?: Array<{ label: string; value: string | number }>;
};

export type UniverseLibraryData = {
  galaxies: UniverseLibraryRecord[];
  sectors: UniverseLibraryRecord[];
  starSystems: UniverseLibraryRecord[];
  stars: UniverseLibraryRecord[];
  planets: UniverseLibraryRecord[];
  discoveries: UniverseLibraryRecord[];
  civilizations: UniverseLibraryRecord[];
};

export type UniverseLibrarySource = {
  galaxies: GalaxyNode[];
  sectors: SectorNode[];
  starSystems: StarSystemNode[];
  stars: StarNode[];
  bodies: CelestialBodyNode[];
  civilizations: FactionRecord[];
};

type GeneratedRecordType = UniverseLibraryKind | "star-system";

const allowedBodyTypes = new Set([
  "Planet",
  "Moon",
  "Dwarf Planet",
  "Gas Giant",
  "Ice Giant",
  "Ocean World",
  "Desert World",
  "Volcanic World",
  "Forest World",
  "Frozen World",
  "Toxic World",
  "Artificial World",
  "Exotic World",
  "Asteroid Belt"
]);

function compactCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value.toLocaleString()} ${value === 1 ? singular : plural}`;
}

function recordStatus(status?: string | null): UniverseLibraryRecord["status"] {
  if (status === "approved") return "Approved";
  if (status === "published") return "Published";
  if (status === "draft") return "Draft";
  if (status === "needs_review") return "Needs Review";
  if (status === "invalid") return "Invalid";
  return "Generated";
}

function libraryArtwork(input: {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  parentLabel?: string;
  previewTone: CanonicalRecordArtworkTone;
}) {
  const artwork = resolveCanonicalRecordArtwork({
    id: input.id,
    name: input.name,
    type: input.type,
    classification: input.subtype,
    parent: input.parentLabel,
    tone: input.previewTone
  });
  return {
    thumbnailUrl: artwork.thumbnail.url,
    thumbnailWebpUrl: artwork.thumbnail.webpUrl,
    thumbnailRetinaUrl: artwork.thumbnail.retinaUrl,
    thumbnailSrcSet: artwork.thumbnail.srcSet,
    mediumPreviewUrl: artwork.previewUrl,
    focalPoint: artwork.focalPoint,
    artworkState: artwork.artworkState,
    artworkFallbackReason: artwork.fallbackReason,
    artworkSourceAssetId: artwork.sourceAssetId,
    artworkAltText: artwork.altText,
    artworkAspectRatio: artwork.thumbnail.aspectRatio,
    artworkWidth: artwork.thumbnail.width,
    artworkHeight: artwork.thumbnail.height
  };
}

function hasCanonicalId(record: Record<string, unknown>) {
  return typeof record.id === "string" && record.id.trim().length > 0;
}

function isPlaceholderOrScaffold(record: Record<string, unknown>) {
  const flags = [record.is_placeholder, record.placeholder, record.is_scaffold, record.scaffold, record.is_asset_requirement, record.assetRequirement];
  const kind = String(record.kind ?? record.recordType ?? record.objectType ?? record.category ?? "").toLowerCase();
  return flags.some(Boolean) || ["placeholder", "scaffold", "asset_requirement", "ui", "component", "runtime", "research", "resource", "building"].includes(kind);
}

export function isGeneratedGameRecord(record: Record<string, unknown>, type: GeneratedRecordType, source: UniverseLibrarySource) {
  if (!hasCanonicalId(record) || isPlaceholderOrScaffold(record)) return false;

  const galaxyIds = new Set(source.galaxies.map((row) => row.id));
  const sectorIds = new Set(source.sectors.map((row) => row.id));
  const systemIds = new Set(source.starSystems.map((row) => row.id));
  const bodyIds = new Set(source.bodies.map((row) => row.id));

  if (type === "galaxies") return typeof record.galaxy_seed === "string" && typeof record.galaxy_type === "string";
  if (type === "sectors") return typeof record.sector_seed === "string" && typeof record.galaxy_id === "string" && galaxyIds.has(String(record.galaxy_id));
  if (type === "star-systems" || type === "star-system") return typeof record.system_seed === "string" && typeof record.sector_id === "string" && sectorIds.has(String(record.sector_id));
  if (type === "stars") return typeof record.star_seed === "string" && typeof record.system_id === "string" && systemIds.has(String(record.system_id));
  if (type === "planets") {
    const bodyType = String(record.celestial_body_type ?? "");
    return typeof record.system_id === "string" && systemIds.has(String(record.system_id)) && allowedBodyTypes.has(bodyType);
  }
  if (type === "discoveries") return typeof record.displayName === "string" && typeof record.categoryId === "string";
  if (type === "civilizations") {
    const homeGalaxyId = String(record.homeGalaxyId ?? "");
    const homeSectorId = String(record.homeSectorId ?? "");
    const homeStarSystemId = String(record.homeStarSystemId ?? "");
    const homePlanetId = String(record.homePlanetId ?? "");
    return galaxyIds.has(homeGalaxyId) && sectorIds.has(homeSectorId) && systemIds.has(homeStarSystemId) && (!homePlanetId || bodyIds.has(homePlanetId));
  }

  return false;
}

export function getUniverseLibrarySource(): UniverseLibrarySource {
  const universe = generateUniverse(UNIVERSE_LIBRARY_SEED);
  const galaxy = generateGalaxy(universe.universe_seed, 0);
  const sector = generateSector(galaxy, 0);
  const starSystems = generateStarSystems(sector, 12);
  const stars = starSystems.flatMap((system) => generateStars(system));
  const bodies = starSystems.flatMap((system) => generateCelestialBodies(system));
  const bodyBySystem = new Map<string, CelestialBodyNode[]>(starSystems.map((system) => [system.id, bodies.filter((body) => body.system_id === system.id)]));
  const generatedCivilizations = starSystems
    .flatMap((system) => {
      const systemBodies = bodyBySystem.get(system.id) ?? [];
      const contexts = [
        {
          galaxyId: galaxy.id,
          sectorId: sector.id,
          starSystemId: system.id,
          systemName: system.system_name,
          rarity: system.system_rarity,
          resourceBias: system.resource_bias,
          dangerLevel: system.danger_level
        },
        ...systemBodies.slice(0, 2).map((body) => ({
          galaxyId: galaxy.id,
          sectorId: sector.id,
          starSystemId: system.id,
          planetId: body.id,
          systemName: system.system_name,
          planetName: body.name,
          rarity: body.planet_rarity ?? system.system_rarity,
          resourceBias: system.resource_bias,
          dangerLevel: system.danger_level
        }))
      ];
      return contexts.map((context) => generateFaction(context)).filter((row): row is FactionRecord => Boolean(row));
    })
    .slice(0, 8);

  const civilizationIds = new Set<string>();
  const civilizations = [...generateFallbackFactions(), ...generatedCivilizations].filter((row) => {
    if (civilizationIds.has(row.id)) return false;
    civilizationIds.add(row.id);
    return true;
  });

  return {
    galaxies: [galaxy],
    sectors: [sector],
    starSystems,
    stars,
    bodies,
    civilizations
  };
}

export function getUniverseLibraryData(): UniverseLibraryData {
  const source = getUniverseLibrarySource();
  const sectorByGalaxy = new Map(source.galaxies.map((galaxy) => [galaxy.id, source.sectors.filter((sector) => sector.galaxy_id === galaxy.id)]));
  const systemsBySector = new Map(source.sectors.map((sector) => [sector.id, source.starSystems.filter((system) => system.sector_id === sector.id)]));
  const starsBySystem = new Map(source.starSystems.map((system) => [system.id, source.stars.filter((star) => star.system_id === system.id)]));
  const bodiesBySystem = new Map(source.starSystems.map((system) => [system.id, source.bodies.filter((body) => body.system_id === system.id)]));
  const galaxyById = new Map(source.galaxies.map((galaxy) => [galaxy.id, galaxy]));
  const sectorById = new Map(source.sectors.map((sector) => [sector.id, sector]));
  const systemById = new Map(source.starSystems.map((system) => [system.id, system]));

  const galaxies = source.galaxies
    .filter((record) => isGeneratedGameRecord(record as unknown as Record<string, unknown>, "galaxies", source))
    .map((galaxy): UniverseLibraryRecord => {
      const sectors = sectorByGalaxy.get(galaxy.id) ?? [];
      const systems = sectors.flatMap((sector) => systemsBySector.get(sector.id) ?? []);
      const bodies = systems.flatMap((system) => bodiesBySystem.get(system.id) ?? []);
      return {
        id: galaxy.id,
        name: galaxy.name,
        type: galaxy.galaxy_type,
        subtype: galaxy.galaxy_size,
        seed: galaxy.galaxy_seed,
        childCountLabel: [compactCount(sectors.length, "sector"), compactCount(systems.length, "system"), compactCount(bodies.length, "body")].join(" / "),
        status: recordStatus(),
        readiness: "Ready",
        href: `/galaxy?record=${encodeURIComponent(galaxy.id)}`,
        previewTone: "galaxy",
        ...libraryArtwork({ id: galaxy.id, name: galaxy.name, type: galaxy.galaxy_type, subtype: galaxy.galaxy_size, previewTone: "galaxy" }),
        meta: [{ label: "Export", value: "Ready" }]
      };
    });

  const sectors = source.sectors
    .filter((record) => isGeneratedGameRecord(record as unknown as Record<string, unknown>, "sectors", source))
    .map((sector): UniverseLibraryRecord => {
      const systems = systemsBySector.get(sector.id) ?? [];
      return {
        id: sector.id,
        name: sector.sector_name,
        type: sector.sector_type,
        subtype: sector.sector_rarity,
        parentLabel: galaxyById.get(sector.galaxy_id)?.name ?? sector.galaxy_id,
        parentId: sector.galaxy_id,
        seed: sector.sector_seed,
        childCountLabel: compactCount(systems.length, "star system"),
        status: recordStatus(),
        readiness: "Ready",
        href: `/sector-map?record=${encodeURIComponent(sector.id)}`,
        previewTone: "sector",
        ...libraryArtwork({ id: sector.id, name: sector.sector_name, type: sector.sector_type, subtype: sector.sector_rarity, parentLabel: galaxyById.get(sector.galaxy_id)?.name ?? sector.galaxy_id, previewTone: "sector" }),
        meta: [{ label: "Export", value: "Ready" }]
      };
    });

  const starSystems = source.starSystems
    .filter((record) => isGeneratedGameRecord(record as unknown as Record<string, unknown>, "star-systems", source))
    .map((system): UniverseLibraryRecord => ({
      id: system.id,
      name: system.system_name,
      type: system.system_type,
      subtype: system.star_type,
      parentLabel: sectorById.get(system.sector_id)?.sector_name ?? system.sector_id,
      parentId: system.sector_id,
      seed: system.system_seed,
      childCountLabel: [compactCount(starsBySystem.get(system.id)?.length ?? 0, "star"), compactCount(bodiesBySystem.get(system.id)?.length ?? 0, "body")].join(" / "),
      status: recordStatus(),
      readiness: "Ready",
      href: `/star-system-map?record=${encodeURIComponent(system.id)}`,
      previewTone: "system",
      ...libraryArtwork({ id: system.id, name: system.system_name, type: system.system_type, subtype: system.star_type, parentLabel: sectorById.get(system.sector_id)?.sector_name ?? system.sector_id, previewTone: "system" }),
      meta: [{ label: "Export", value: "Ready" }]
    }));

  const stars = source.stars
    .filter((record) => isGeneratedGameRecord(record as unknown as Record<string, unknown>, "stars", source))
    .map((star): UniverseLibraryRecord => ({
      id: star.id,
      name: star.star_name,
      type: star.star_type,
      subtype: star.star_size,
      parentLabel: systemById.get(star.system_id)?.system_name ?? star.system_id,
      parentId: star.system_id,
      seed: star.star_seed,
      childCountLabel: `${star.star_temperature.toLocaleString()}K`,
      status: recordStatus(),
      readiness: "Ready",
      href: `/celestial-bodies?record=${encodeURIComponent(star.id)}`,
      previewTone: "star",
      ...libraryArtwork({ id: star.id, name: star.star_name, type: star.star_type, subtype: star.star_size, parentLabel: systemById.get(star.system_id)?.system_name ?? star.system_id, previewTone: "star" }),
      meta: [{ label: "Export", value: "Ready" }]
    }));

  const planets = source.bodies
    .filter((record) => isGeneratedGameRecord(record as unknown as Record<string, unknown>, "planets", source))
    .map((body): UniverseLibraryRecord => ({
      id: body.id,
      name: body.name,
      type: body.celestial_body_type,
      subtype: [body.planet_class, body.planet_subclass].filter(Boolean).join(" / ") || "Celestial body",
      parentLabel: systemById.get(body.system_id)?.system_name ?? body.system_id,
      parentId: body.system_id,
      seed: body.seed,
      childCountLabel: body.planet_rarity ?? "Common",
      status: recordStatus(),
      readiness: "Ready",
      href: `/planets?record=${encodeURIComponent(body.id)}`,
      previewTone: "planet",
      ...libraryArtwork({ id: body.id, name: body.name, type: body.celestial_body_type, subtype: [body.planet_class, body.planet_subclass].filter(Boolean).join(" / ") || "Celestial body", parentLabel: systemById.get(body.system_id)?.system_name ?? body.system_id, previewTone: "planet" }),
      meta: [{ label: "Export", value: "Ready" }]
    }));

  const discoveries = canonicalDiscoveries
    .filter((record) => isGeneratedGameRecord(record as unknown as Record<string, unknown>, "discoveries", source))
    .map((discovery): UniverseLibraryRecord => ({
      id: discovery.id,
      name: discovery.displayName,
      type: discovery.categoryId.replace(/-/g, " "),
      subtype: discovery.rarity,
      seed: discovery.id,
      childCountLabel: discovery.publicationStatus,
      status: recordStatus(discovery.publicationStatus),
      readiness: discovery.publicationStatus === "published" || discovery.publicationStatus === "approved" ? "Ready" : "Not Published",
      href: `/discovery-journal?record=${encodeURIComponent(discovery.id)}`,
      previewTone: "discovery",
      ...libraryArtwork({ id: discovery.id, name: discovery.displayName, type: discovery.categoryId.replace(/-/g, " "), subtype: discovery.rarity, previewTone: "discovery" }),
      meta: [{ label: "Export", value: discovery.publicationStatus === "hidden" ? "Not Published" : "Ready" }]
    }));

  const civilizations = source.civilizations
    .filter((record) => isGeneratedGameRecord(record as unknown as Record<string, unknown>, "civilizations", source))
    .map((civilization): UniverseLibraryRecord => ({
      id: civilization.id,
      name: civilization.name,
      type: civilization.type,
      subtype: civilization.government,
      parentLabel: systemById.get(civilization.homeStarSystemId)?.system_name ?? civilization.homeStarSystemId,
      parentId: civilization.homeStarSystemId,
      seed: civilization.id,
      childCountLabel: compactCount(civilization.controlledSystemIds.length, "controlled system"),
      status: recordStatus(),
      readiness: "Ready",
      href: `/civilizations?record=${encodeURIComponent(civilization.id)}`,
      previewTone: "civilization",
      ...libraryArtwork({ id: civilization.id, name: civilization.name, type: civilization.type, subtype: civilization.government, parentLabel: systemById.get(civilization.homeStarSystemId)?.system_name ?? civilization.homeStarSystemId, previewTone: "civilization" }),
      meta: [{ label: "Export", value: "Ready" }]
    }));

  return { galaxies, sectors, starSystems, stars, planets, discoveries, civilizations };
}

export function getUniverseLibraryRecords(kind: UniverseLibraryKind) {
  const data = getUniverseLibraryData();
  return data[kind === "star-systems" ? "starSystems" : kind];
}

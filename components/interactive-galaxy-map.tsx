"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Button } from "@/components/ui/button";
import {
  generateCelestialBodies,
  generateGalaxy,
  generateSector,
  generateSectors,
  generateStarSystem,
  generateStarSystems,
  generateUniverse,
  type CelestialBodyNode,
  type GalaxyNode,
  type SectorNode,
  type StarSystemNode
} from "@/lib/universe/generator";
import { DEFAULT_UNIVERSE_SEED } from "@/lib/universe/fallback-data";

type QualityPreset = "low" | "medium" | "high" | "ultra";
type SemanticLevel = "galaxy" | "sector" | "system";
type RendererMode = "webgl-3d" | "2d-fallback";

type GalaxyMapObjectKind = "galaxy" | "sector" | "system" | "star" | "planet" | "moon" | "belt" | "unknown";

type GalaxyMapObject = {
  id: string;
  name: string;
  kind: GalaxyMapObjectKind;
  canonicalType: string;
  parentId: string | null;
  position: [number, number, number];
  radius: number;
  orbitRadius: number;
  orbitInclination: number;
  orbitTilt: number;
  planetClass: string;
  planetSubclass: string;
  atmosphere: string | null;
  resources: string[];
  notes: string;
  discoveryState: string;
  unlockRequirement: string;
  isKnown: boolean;
  hasAtmosphere: boolean;
  hasClouds: boolean;
  hasRings: boolean;
  source: CelestialBodyNode | SectorNode | StarSystemNode | GalaxyNode;
};

type DebugState = {
  pointerTarget: string;
  canvasHit: boolean;
  controlState: string;
  dragState: string;
  raycastResult: string;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
};

const missingContracts = [
  { id: "GALAXY_RENDERER_WEBGL_CONTRACT", category: "required for production rendering" },
  { id: "GALAXY_CAMERA_CONTROL_CONTRACT", category: "required for production rendering" },
  { id: "GALAXY_RAYCAST_SELECTION_CONTRACT", category: "required for production rendering" },
  { id: "GALAXY_SEMANTIC_ZOOM_CONTRACT", category: "required for production rendering" },
  { id: "CELESTIAL_VISUAL_PROFILE_CONTRACT", category: "required for production rendering" },
  { id: "STAR_VISUAL_PROFILE_CONTRACT", category: "required for production rendering" },
  { id: "PLANET_ATMOSPHERE_PROFILE_CONTRACT", category: "optional polish" },
  { id: "PLANET_CLOUD_PROFILE_CONTRACT", category: "optional polish" },
  { id: "PLANET_RING_PROFILE_CONTRACT", category: "optional polish" },
  { id: "GALAXY_POSTPROCESSING_PROFILE_CONTRACT", category: "safe client-owned presentation" },
  { id: "GALAXY_QUALITY_PRESET_CONTRACT", category: "safe client-owned presentation" },
  { id: "GALAXY_PLAYER_DISCOVERY_STATE_CONTRACT", category: "future gameplay" },
  { id: "UNIVERSAL_DISCOVERY_REGISTRY_RUNTIME_CONTRACT", category: "future gameplay" }
] as const;

function buttonVariantClass(active: boolean) {
  return active ? "" : "border-slate-500/40 bg-transparent text-slate-200 hover:border-cyan-300/50 hover:bg-slate-900/80";
}

const qualitySettings: Record<
  QualityPreset,
  {
    dpr: [number, number];
    starCount: number;
    planetSegments: number;
    bloom: boolean;
    atmosphere: boolean;
    clouds: boolean;
    corona: boolean;
    rings: boolean;
    noise: boolean;
  }
> = {
  low: { dpr: [1, 1], starCount: 900, planetSegments: 32, bloom: false, atmosphere: true, clouds: false, corona: false, rings: true, noise: false },
  medium: { dpr: [1, 1.5], starCount: 1700, planetSegments: 48, bloom: true, atmosphere: true, clouds: false, corona: true, rings: true, noise: false },
  high: { dpr: [1, 2], starCount: 2600, planetSegments: 64, bloom: true, atmosphere: true, clouds: true, corona: true, rings: true, noise: true },
  ultra: { dpr: [1.25, 2], starCount: 3800, planetSegments: 80, bloom: true, atmosphere: true, clouds: true, corona: true, rings: true, noise: true }
};

const classPalette: Record<string, { base: string; emissive: string; roughness: number; metalness: number }> = {
  Terrestrial: { base: "#4f8cb8", emissive: "#07111b", roughness: 0.82, metalness: 0.02 },
  Desert: { base: "#b36a3b", emissive: "#1b0d04", roughness: 0.9, metalness: 0.01 },
  Dead: { base: "#8f8a7a", emissive: "#090806", roughness: 0.94, metalness: 0.03 },
  Toxic: { base: "#b28b45", emissive: "#171006", roughness: 0.76, metalness: 0.01 },
  Lava: { base: "#5e2c24", emissive: "#ff5f1f", roughness: 0.7, metalness: 0.02 },
  Ice: { base: "#9fc6d8", emissive: "#06121a", roughness: 0.68, metalness: 0.04 },
  "Gas Giant": { base: "#c49b62", emissive: "#100905", roughness: 0.5, metalness: 0 },
  Artificial: { base: "#9da6b2", emissive: "#06202a", roughness: 0.45, metalness: 0.45 },
  Exotic: { base: "#786ee6", emissive: "#120a34", roughness: 0.55, metalness: 0.08 }
};

function seededUnit(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function bodyScale(body: CelestialBodyNode) {
  if (body.celestial_body_type === "Star") return 2.4;
  if (body.celestial_body_type === "Asteroid Belt") return 0.2;
  if (body.planet_class === "Gas Giant") return body.name === "Jupiter" ? 1.4 : 1.22;
  if (body.celestial_body_type === "Dwarf Planet") return 0.35;
  if (body.celestial_body_type === "Moon") return 0.28;
  return body.name === "Earth" ? 0.62 : 0.5;
}

function orbitDistance(body: CelestialBodyNode, index: number) {
  if (body.celestial_body_type === "Star") return 0;
  if (body.celestial_body_type === "Asteroid Belt") return 12;
  if (body.parent_body_id && body.celestial_body_type === "Moon") return 0.95 + (index % 6) * 0.24;
  return 3.2 + (body.orbit_position ?? index + 1) * 2.28;
}

function orbitPosition(radius: number, seed: string, inclination: number, tilt: number): [number, number, number] {
  const angle = seededUnit(`${seed}:angle`) * Math.PI * 2;
  const flat = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  flat.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
  flat.applyAxisAngle(new THREE.Vector3(0, 1, 0), tilt);
  return [flat.x, flat.y, flat.z];
}

function createSystemObjects(bodies: CelestialBodyNode[]) {
  const objects: GalaxyMapObject[] = [];
  const parentPositions = new Map<string, [number, number, number]>();

  bodies.forEach((body, index) => {
    const isStar = body.celestial_body_type === "Star";
    const orbitRadius = orbitDistance(body, index);
    const seed = body.seed ?? body.id;
    const inclination = isStar ? 0 : (seededUnit(`${seed}:inclination`) - 0.5) * 0.42;
    const tilt = isStar ? 0 : (seededUnit(`${seed}:tilt`) - 0.5) * 0.7;
    const local = orbitPosition(orbitRadius, seed, inclination, tilt);
    const parent = body.parent_body_id ? parentPositions.get(body.parent_body_id) : null;
    const position: [number, number, number] = parent ? [parent[0] + local[0], parent[1] + local[1], parent[2] + local[2]] : local;
    parentPositions.set(body.id, position);

    const isUnknown = body.discoveryState === "Undetected" || body.unlock_requirement === "Interstellar Navigation";
    const planetClass = body.planet_class ?? body.celestial_body_type;
    const hasAtmosphere = Boolean(body.atmosphere && body.atmosphere !== "None" && body.atmosphere !== "Trace");

    objects.push({
      id: body.id,
      name: isUnknown ? "???" : body.name,
      kind: isStar
        ? "star"
        : body.celestial_body_type === "Asteroid Belt"
          ? "belt"
          : body.celestial_body_type === "Moon"
            ? "moon"
            : isUnknown
              ? "unknown"
              : "planet",
      canonicalType: body.celestial_body_type,
      parentId: body.parent_body_id,
      position,
      radius: bodyScale(body),
      orbitRadius,
      orbitInclination: inclination,
      orbitTilt: tilt,
      planetClass,
      planetSubclass: body.planet_subclass ?? body.celestial_body_type,
      atmosphere: body.atmosphere,
      resources: body.resources,
      notes: isUnknown ? "Unresolved object. Survival-era sensors hide metadata until scanned." : body.notes,
      discoveryState: body.discoveryState ?? "Known",
      unlockRequirement: body.unlock_requirement,
      isKnown: !isUnknown,
      hasAtmosphere,
      hasClouds: hasAtmosphere && ["Terrestrial", "Toxic", "Ice"].includes(planetClass),
      hasRings: body.name === "Saturn" || body.planet_subclass?.toLowerCase().includes("ring") === true,
      source: body
    });
  });

  return objects;
}

function estimateSceneStats(scene: THREE.Scene) {
  let drawCalls = 0;
  let triangles = 0;

  scene.traverse((node) => {
    if (!node.visible) return;
    if (!(node instanceof THREE.Mesh) && !(node instanceof THREE.Line) && !(node instanceof THREE.Points)) return;

    drawCalls += 1;
    const geometry = node.geometry;
    if (!geometry) return;

    if (node instanceof THREE.Mesh) {
      const indexCount = geometry.index?.count;
      const positionCount = geometry.attributes.position?.count ?? 0;
      triangles += Math.floor((indexCount ?? positionCount) / 3);
      return;
    }

    const positionCount = geometry.attributes.position?.count ?? 0;
    triangles += positionCount;
  });

  return { drawCalls, triangles };
}

function createSectorObjects(sectors: SectorNode[]): GalaxyMapObject[] {
  return sectors.map((sector, index) => ({
    id: sector.id,
    name: sector.discovery_level === "Unknown" ? "???" : sector.sector_name,
    kind: "sector",
    canonicalType: sector.sector_type,
    parentId: sector.galaxy_id,
    position: [sector.coordinates_x / 18, sector.coordinates_z / 30, sector.coordinates_y / 18],
    radius: 0.55 + Math.min(1, sector.system_count / 140),
    orbitRadius: 0,
    orbitInclination: 0,
    orbitTilt: 0,
    planetClass: sector.sector_type,
    planetSubclass: sector.sector_rarity,
    atmosphere: null,
    resources: [sector.resource_signal],
    notes: `${sector.modifier}. ${sector.system_count} generated systems.`,
    discoveryState: sector.discovery_level,
    unlockRequirement: "Sector Scanning",
    isKnown: sector.discovery_level !== "Unknown",
    hasAtmosphere: false,
    hasClouds: false,
    hasRings: false,
    source: sector
  }));
}

function createGalaxyObjects(galaxy: GalaxyNode, sectors: SectorNode[]): GalaxyMapObject[] {
  return [
    {
      id: galaxy.id,
      name: galaxy.name,
      kind: "galaxy",
      canonicalType: galaxy.galaxy_type,
      parentId: galaxy.universe_id,
      position: [0, 0, 0],
      radius: 2,
      orbitRadius: 0,
      orbitInclination: 0,
      orbitTilt: 0,
      planetClass: galaxy.galaxy_type,
      planetSubclass: galaxy.galaxy_size,
      atmosphere: null,
      resources: [],
      notes: "Milky Way is generated on demand. Survival era starts with Local Bubble awareness.",
      discoveryState: galaxy.discovery_state ?? "Scanned",
      unlockRequirement: "Interstellar Navigation",
      isKnown: true,
      hasAtmosphere: false,
      hasClouds: false,
      hasRings: false,
      source: galaxy
    },
    ...createSectorObjects(sectors).slice(0, 14)
  ];
}

function useGalaxyRuntime() {
  return useMemo(() => {
    const universe = generateUniverse(DEFAULT_UNIVERSE_SEED);
    const galaxy = generateGalaxy(universe.universe_seed, 0);
    const sector = generateSector(galaxy, 0);
    const system = generateStarSystem(sector, 0);
    const sectors = generateSectors(galaxy, 24);
    const systems = generateStarSystems(sector, 14);
    const bodies = generateCelestialBodies(system);

    return {
      universe,
      galaxy,
      sector,
      system,
      sectors,
      systems,
      bodies,
      systemObjects: createSystemObjects(bodies),
      sectorObjects: createSectorObjects(systemsToSectorNodes(systems, sector)),
      galaxyObjects: createGalaxyObjects(galaxy, sectors)
    };
  }, []);
}

function systemsToSectorNodes(systems: StarSystemNode[], sector: SectorNode): SectorNode[] {
  return systems.map((system, index) => ({
    ...sector,
    id: system.id,
    sector_name: system.discovery_state === "Undetected" ? "???" : system.system_name,
    sector_type: system.system_type,
    sector_rarity: system.system_rarity,
    coordinates_x: Math.cos(index * 1.7) * (20 + index * 8),
    coordinates_y: Math.sin(index * 1.31) * (16 + index * 7),
    coordinates_z: (index % 5) * 18 - 36,
    system_count: system.planet_count,
    difficulty: system.danger_level,
    discovery_level: system.discovery_state,
    modifier: system.resource_bias,
    resource_signal: system.star_type,
    discovered: system.discovered,
    discovered_at: system.discovered_at
  }));
}

function GalaxyScene({
  objects,
  selectedId,
  hoveredId,
  semanticLevel,
  quality,
  showBloom,
  showAtmosphere,
  showOrbits,
  onHover,
  onSelect,
  focusRequest,
  setFocusRequest,
  setDebug
}: {
  objects: GalaxyMapObject[];
  selectedId: string;
  hoveredId: string | null;
  semanticLevel: SemanticLevel;
  quality: QualityPreset;
  showBloom: boolean;
  showAtmosphere: boolean;
  showOrbits: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  focusRequest: string | null;
  setFocusRequest: (id: string | null) => void;
  setDebug: (debug: DebugState | ((current: DebugState) => DebugState)) => void;
}) {
  const settings = qualitySettings[quality];
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const { camera, gl, scene } = useThree();

  const selected = objects.find((object) => object.id === selectedId) ?? objects[0];

  useFrame((state) => {
    const nextFocus = focusRequest ? objects.find((object) => object.id === focusRequest) : null;
    if (nextFocus) {
      const focusVector = new THREE.Vector3(...nextFocus.position);
      const offset = semanticLevel === "system" ? new THREE.Vector3(5, 3.4, 7) : new THREE.Vector3(8, 8, 12);
      camera.position.lerp(focusVector.clone().add(offset.multiplyScalar(Math.max(1.1, nextFocus.radius * 1.8))), 0.055);
      targetRef.current.lerp(focusVector, 0.08);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetRef.current);
        controlsRef.current.update();
      }
      if (camera.position.distanceTo(focusVector) < nextFocus.radius + 8) {
        setFocusRequest(null);
      }
    }

    if (state.clock.elapsedTime % 0.3 < 0.018) {
      const sceneStats = estimateSceneStats(scene);
      setDebug((current) => ({
        ...current,
        frameTime: Math.round(state.clock.getDelta() * 10000) / 10,
        drawCalls: sceneStats.drawCalls,
        triangles: sceneStats.triangles,
        cameraPosition: [Number(camera.position.x.toFixed(1)), Number(camera.position.y.toFixed(1)), Number(camera.position.z.toFixed(1))],
        cameraTarget: [
          Number((controlsRef.current?.target.x ?? 0).toFixed(1)),
          Number((controlsRef.current?.target.y ?? 0).toFixed(1)),
          Number((controlsRef.current?.target.z ?? 0).toFixed(1))
        ]
      }));
    }
  });

  return (
    <>
      <color attach="background" args={["#020510"]} />
      <fog attach="fog" args={["#020510", semanticLevel === "system" ? 38 : 72, semanticLevel === "system" ? 95 : 210]} />
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 0, 0]} intensity={semanticLevel === "system" ? 90 : 30} distance={140} color="#ffd08a" />
      <directionalLight position={[14, 12, 8]} intensity={0.5} color="#9fc8ff" />
      <StarField count={settings.starCount} quality={quality} />
      {showOrbits && semanticLevel === "system" && <OrbitPaths objects={objects} selectedId={selectedId} />}
      {semanticLevel !== "system" && <SemanticNetwork objects={objects} selectedId={selectedId} />}
      {objects.map((object) => (
        <MapObjectMesh
          key={object.id}
          object={object}
          selected={object.id === selectedId}
          hovered={object.id === hoveredId}
          quality={quality}
          showAtmosphere={showAtmosphere && settings.atmosphere}
          onHover={onHover}
          onSelect={onSelect}
          setDebug={setDebug}
        />
      ))}
      {selected && (
        <Html position={[selected.position[0], selected.position[1] + selected.radius + 0.45, selected.position[2]]} center distanceFactor={10}>
          <div className="pointer-events-none rounded-full border border-cyan-300/30 bg-slate-950/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.22)]">
            {selected.name}
          </div>
        </Html>
      )}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        enablePan
        enableRotate
        enableZoom
        screenSpacePanning={false}
        minDistance={semanticLevel === "system" ? 4 : 18}
        maxDistance={semanticLevel === "system" ? 58 : 180}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI - 0.08}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.PAN
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
        onStart={() => setDebug((current) => ({ ...current, dragState: "dragging", controlState: "controls active" }))}
        onEnd={() => setDebug((current) => ({ ...current, dragState: "idle", controlState: "controls damped" }))}
      />
      {showBloom && settings.bloom && (
        <EffectComposer multisampling={quality === "low" ? 0 : 4}>
          <Bloom intensity={quality === "ultra" ? 1.45 : 0.95} luminanceThreshold={0.35} luminanceSmoothing={0.22} mipmapBlur />
          <Noise opacity={settings.noise ? 0.025 : 0} />
          <Vignette darkness={0.52} eskil={false} offset={0.18} />
        </EffectComposer>
      )}
    </>
  );
}

function StarField({ count, quality }: { count: number; quality: QualityPreset }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = 80 + seededUnit(`${quality}:star:${index}:r`) * 140;
      const theta = seededUnit(`${quality}:star:${index}:t`) * Math.PI * 2;
      const phi = Math.acos(2 * seededUnit(`${quality}:star:${index}:p`) - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi) * 0.55;
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      const warmth = seededUnit(`${quality}:star:${index}:w`);
      colors[index * 3] = 0.55 + warmth * 0.45;
      colors[index * 3 + 1] = 0.68 + warmth * 0.24;
      colors[index * 3 + 2] = 0.86 + (1 - warmth) * 0.14;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return starGeometry;
  }, [count, quality]);

  return (
    <points geometry={geometry}>
      <pointsMaterial size={quality === "ultra" ? 0.12 : 0.09} vertexColors depthWrite={false} transparent opacity={0.88} />
    </points>
  );
}

function OrbitPaths({ objects, selectedId }: { objects: GalaxyMapObject[]; selectedId: string }) {
  return (
    <group>
      {objects
        .filter((object) => object.kind !== "star" && object.orbitRadius > 0 && object.parentId === "body-sol")
        .map((object) => (
          <OrbitLine key={object.id} object={object} selected={object.id === selectedId} />
        ))}
    </group>
  );
}

function OrbitLine({ object, selected }: { object: GalaxyMapObject; selected: boolean }) {
  const points = useMemo(() => {
    return Array.from({ length: 160 }, (_, index) => {
      const angle = (index / 160) * Math.PI * 2;
      const point = new THREE.Vector3(Math.cos(angle) * object.orbitRadius, 0, Math.sin(angle) * object.orbitRadius);
      point.applyAxisAngle(new THREE.Vector3(1, 0, 0), object.orbitInclination);
      point.applyAxisAngle(new THREE.Vector3(0, 1, 0), object.orbitTilt);
      return point;
    });
  }, [object.orbitInclination, object.orbitRadius, object.orbitTilt]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color={selected ? "#f6aa3d" : "#31556a"} transparent opacity={selected ? 0.88 : 0.22} />
    </lineLoop>
  );
}

function SemanticNetwork({ objects, selectedId }: { objects: GalaxyMapObject[]; selectedId: string }) {
  return (
    <group>
      {objects.map((object) => (
        <group key={`semantic-${object.id}`} position={object.position}>
          <mesh>
            <sphereGeometry args={[object.id === selectedId ? object.radius * 1.35 : object.radius, 32, 32]} />
            <meshStandardMaterial
              color={object.kind === "galaxy" ? "#74d7ff" : object.isKnown ? "#f2a33d" : "#4e6476"}
              emissive={object.kind === "galaxy" ? "#0c4d66" : object.isKnown ? "#4f2600" : "#121923"}
              emissiveIntensity={object.id === selectedId ? 1.8 : 0.8}
              roughness={0.58}
            />
          </mesh>
          <Html distanceFactor={22} position={[0, object.radius + 0.6, 0]} center>
            <div className="pointer-events-none whitespace-nowrap rounded border border-white/10 bg-slate-950/75 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-100">
              {object.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function MapObjectMesh({
  object,
  selected,
  hovered,
  quality,
  showAtmosphere,
  onHover,
  onSelect,
  setDebug
}: {
  object: GalaxyMapObject;
  selected: boolean;
  hovered: boolean;
  quality: QualityPreset;
  showAtmosphere: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  setDebug: (debug: DebugState | ((current: DebugState) => DebugState)) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const settings = qualitySettings[quality];
  const palette = classPalette[object.planetClass] ?? classPalette.Exotic;

  useFrame((state) => {
    if (!groupRef.current) return;
    const speed = object.kind === "star" ? 0.035 : object.kind === "moon" ? 0.22 : 0.08;
    groupRef.current.rotation.y += state.clock.getDelta() * speed;
  });

  const pointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(object.id);
    document.body.style.cursor = "pointer";
    setDebug((current) => ({
      ...current,
      pointerTarget: object.name,
      canvasHit: true,
      raycastResult: `${object.kind}:${object.id}`
    }));
  };

  const pointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(null);
    document.body.style.cursor = "";
    setDebug((current) => ({ ...current, pointerTarget: "canvas", raycastResult: "none" }));
  };

  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(object.id);
  };

  if (object.kind === "belt") {
    return (
      <group ref={groupRef} position={object.position} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={click}>
        <mesh rotation={[Math.PI / 2.12, 0, 0]}>
          <torusGeometry args={[object.orbitRadius, 0.045, 10, 220]} />
          <meshBasicMaterial color={selected ? "#f6aa3d" : "#7c8fa0"} transparent opacity={selected ? 0.72 : 0.28} />
        </mesh>
      </group>
    );
  }

  if (object.kind === "star") {
    return (
      <group ref={groupRef} position={object.position} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={click}>
        <mesh>
          <sphereGeometry args={[object.radius, 96, 96]} />
          <meshStandardMaterial color="#ffd37c" emissive="#ff9f24" emissiveIntensity={3.8} roughness={0.4} toneMapped={false} />
        </mesh>
        {settings.corona && (
          <mesh>
            <sphereGeometry args={[object.radius * 1.65, 64, 64]} />
            <meshBasicMaterial color="#ffb04f" transparent opacity={hovered || selected ? 0.22 : 0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )}
        <pointLight intensity={100} distance={160} color="#ffd08a" />
        {selected && <SelectionRing radius={object.radius * 1.9} />}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={object.position} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={click}>
      <mesh>
        <sphereGeometry args={[object.radius * (hovered ? 1.045 : 1), settings.planetSegments, settings.planetSegments]} />
        <meshStandardMaterial
          color={object.isKnown ? palette.base : "#223145"}
          emissive={selected ? "#4a2a08" : object.isKnown ? palette.emissive : "#04070d"}
          emissiveIntensity={selected ? 0.55 : hovered ? 0.24 : 0.08}
          roughness={palette.roughness}
          metalness={palette.metalness}
        />
      </mesh>
      {object.planetClass === "Gas Giant" && <GasBands radius={object.radius * 1.006} selected={selected} />}
      {showAtmosphere && object.hasAtmosphere && <Atmosphere radius={object.radius * 1.06} planetClass={object.planetClass} selected={selected || hovered} />}
      {settings.clouds && object.hasClouds && <CloudShell radius={object.radius * 1.025} />}
      {settings.rings && object.hasRings && <PlanetRings radius={object.radius * 1.72} selected={selected} />}
      {(selected || hovered) && <SelectionRing radius={object.radius * 1.4} />}
    </group>
  );
}

function GasBands({ radius, selected }: { radius: number; selected: boolean }) {
  return (
    <group>
      {[0.72, 0.9, 1.05].map((scale, index) => (
        <mesh key={scale} scale={[1, scale, 1]} rotation={[Math.PI / 2, 0, index * 0.18]}>
          <torusGeometry args={[radius * (0.68 + index * 0.16), 0.012, 8, 96]} />
          <meshBasicMaterial color={index === 1 ? "#f1c27b" : "#7f5731"} transparent opacity={selected ? 0.42 : 0.24} />
        </mesh>
      ))}
    </group>
  );
}

function Atmosphere({ radius, planetClass, selected }: { radius: number; planetClass: string; selected: boolean }) {
  const color = planetClass === "Toxic" ? "#f4c45f" : planetClass === "Ice" ? "#9ee8ff" : "#6ed5ff";
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshBasicMaterial color={color} side={THREE.BackSide} transparent opacity={selected ? 0.22 : 0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

function CloudShell({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.025;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  );
}

function PlanetRings({ radius, selected }: { radius: number; selected: boolean }) {
  return (
    <mesh rotation={[Math.PI / 2.7, 0.18, 0.28]}>
      <ringGeometry args={[radius, radius * 1.62, 160]} />
      <meshBasicMaterial color="#c6b18a" side={THREE.DoubleSide} transparent opacity={selected ? 0.54 : 0.32} depthWrite={false} />
    </mesh>
  );
}

function SelectionRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.018, 8, 128]} />
      <meshBasicMaterial color="#f6aa3d" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function FallbackMap({ objects, selectedId, onSelect }: { objects: GalaxyMapObject[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="relative h-full min-h-[680px] overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950">
      <div className="absolute left-5 top-5 rounded-full border border-amber-300/20 bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
        Renderer: 2D fallback
      </div>
      {objects.map((object) => (
        <button
          key={object.id}
          type="button"
          onClick={() => onSelect(object.id)}
          className={`absolute rounded-full border text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
            object.id === selectedId ? "border-amber-300 bg-amber-300 text-slate-950" : "border-cyan-200/30 bg-cyan-300/10 text-cyan-100"
          }`}
          style={{
            left: `${50 + object.position[0] * 2.1}%`,
            top: `${50 + object.position[2] * 2.1}%`,
            width: `${Math.max(22, object.radius * 18)}px`,
            height: `${Math.max(22, object.radius * 18)}px`
          }}
          aria-label={object.name}
        >
          <span className="sr-only">{object.name}</span>
        </button>
      ))}
    </div>
  );
}

const initialDebug: DebugState = {
  pointerTarget: "canvas",
  canvasHit: false,
  controlState: "enabled",
  dragState: "idle",
  raycastResult: "none",
  frameTime: 0,
  drawCalls: 0,
  triangles: 0,
  cameraPosition: [0, 18, 34],
  cameraTarget: [0, 0, 0]
};

export function InteractiveGalaxyMap() {
  const runtime = useGalaxyRuntime();
  const [quality, setQuality] = useState<QualityPreset>("high");
  const [semanticLevel, setSemanticLevel] = useState<SemanticLevel>("system");
  const [rendererMode, setRendererMode] = useState<RendererMode>("webgl-3d");
  const [showBloom, setShowBloom] = useState(true);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("body-earth");
  const [focusRequest, setFocusRequest] = useState<string | null>("body-earth");
  const [debug, setDebug] = useState<DebugState>(initialDebug);

  const objects = semanticLevel === "galaxy" ? runtime.galaxyObjects : semanticLevel === "sector" ? runtime.sectorObjects : runtime.systemObjects;
  const selected = objects.find((object) => object.id === selectedId) ?? objects[0];
  const selectedObjectId = selected?.id ?? objects[0]?.id ?? "";

  const selectObject = useCallback(
    (id: string) => {
      setSelectedId(id);
      setDebug((current) => ({ ...current, raycastResult: id }));
    },
    [setDebug]
  );

  const focusSelected = useCallback(() => {
    if (selectedObjectId) setFocusRequest(selectedObjectId);
  }, [selectedObjectId]);

  const resetCamera = useCallback(() => {
    setFocusRequest(semanticLevel === "system" ? "body-earth" : objects[0]?.id ?? null);
  }, [objects, semanticLevel]);

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-6 text-slate-100 md:px-6">
      <section className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-3xl border border-cyan-300/15 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Galaxy Navigation Runtime</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Interactive 3D Semantic Map</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Sol is rendered from canonical hierarchy data with a persistent WebGL canvas, perspective camera, raycast selection, camera focus, quality presets, and explicit fallback diagnostics.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex">
            {(["galaxy", "sector", "system"] as const).map((level) => (
              <Button key={level} className={buttonVariantClass(semanticLevel === level)} onClick={() => {
                setSemanticLevel(level);
                const nextId = level === "system" ? "body-earth" : level === "sector" ? runtime.sectorObjects[0]?.id : runtime.galaxyObjects[0]?.id;
                if (nextId) {
                  setSelectedId(nextId);
                  setFocusRequest(nextId);
                }
              }}>
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative min-h-[72vh] overflow-hidden rounded-3xl border border-cyan-300/15 bg-black">
            <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300">Survival era</p>
              <p className="mt-1 max-w-xs text-xs text-slate-300">Local system awareness is gated, but camera control remains fully interactive.</p>
            </div>
            {rendererMode === "webgl-3d" ? (
              <Canvas
                camera={{ fov: 45, near: 0.1, far: 260, position: semanticLevel === "system" ? [0, 18, 34] : [0, 42, 86] }}
                dpr={qualitySettings[quality].dpr}
                gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
                className="galaxy-webgl-canvas"
                onPointerMissed={() => {
                  setHoveredId(null);
                  document.body.style.cursor = "";
                  setDebug((current) => ({ ...current, pointerTarget: "canvas", canvasHit: true, raycastResult: "miss" }));
                }}
              >
                <GalaxyScene
                  objects={objects}
                  selectedId={selectedObjectId}
                  hoveredId={hoveredId}
                  semanticLevel={semanticLevel}
                  quality={quality}
                  showBloom={showBloom}
                  showAtmosphere={showAtmosphere}
                  showOrbits={showOrbits}
                  onHover={setHoveredId}
                  onSelect={selectObject}
                  focusRequest={focusRequest}
                  setFocusRequest={setFocusRequest}
                  setDebug={setDebug}
                />
              </Canvas>
            ) : (
              <FallbackMap objects={objects} selectedId={selectedObjectId} onSelect={selectObject} />
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-cyan-300/15 bg-slate-950/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Selected object</p>
              <h2 className="mt-3 text-3xl font-black text-white">{selected?.name ?? "None"}</h2>
              <p className="mt-1 text-sm text-cyan-200">{selected?.canonicalType} / {selected?.planetClass}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300">{selected?.notes}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="uppercase tracking-[0.2em] text-slate-500">Unlock</dt>
                  <dd className="mt-1 font-semibold text-slate-100">{selected?.unlockRequirement}</dd>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="uppercase tracking-[0.2em] text-slate-500">State</dt>
                  <dd className="mt-1 font-semibold text-slate-100">{selected?.discoveryState}</dd>
                </div>
              </dl>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button onClick={focusSelected}>Focus</Button>
                <Button className={buttonVariantClass(false)} onClick={resetCamera}>Reset</Button>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-300/15 bg-slate-950/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Quality and controls</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["low", "medium", "high", "ultra"] as const).map((preset) => (
                  <Button key={preset} className={buttonVariantClass(quality === preset)} onClick={() => setQuality(preset)}>
                    {preset}
                  </Button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button className={buttonVariantClass(showBloom)} onClick={() => setShowBloom((value) => !value)}>Bloom</Button>
                <Button className={buttonVariantClass(showAtmosphere)} onClick={() => setShowAtmosphere((value) => !value)}>Atmosphere</Button>
                <Button className={buttonVariantClass(showOrbits)} onClick={() => setShowOrbits((value) => !value)}>Orbit paths</Button>
                <Button className={buttonVariantClass(rendererMode === "2d-fallback")} onClick={() => setRendererMode((value) => (value === "webgl-3d" ? "2d-fallback" : "webgl-3d"))}>Fallback</Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button className={buttonVariantClass(false)} onClick={() => setFocusRequest("body-sol")}>Focus Sun</Button>
                <Button className={buttonVariantClass(false)} onClick={() => setFocusRequest("body-earth")}>Focus Earth</Button>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-300/15 bg-slate-950/80 p-5 text-xs">
              <p className="font-semibold uppercase tracking-[0.25em] text-cyan-300">Runtime diagnostics</p>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-slate-300">
                <span>Renderer</span><strong className="text-white">{rendererMode === "webgl-3d" ? "WebGL 3D" : "2D fallback"}</strong>
                <span>Hierarchy</span><strong className="text-white">Canonical Sol + typed presentation fallback</strong>
                <span>Canvas hit</span><strong className="text-white">{debug.canvasHit ? "yes" : "waiting"}</strong>
                <span>Pointer</span><strong className="text-white">{debug.pointerTarget}</strong>
                <span>Controls</span><strong className="text-white">{debug.controlState}</strong>
                <span>Drag</span><strong className="text-white">{debug.dragState}</strong>
                <span>Raycast</span><strong className="text-white">{debug.raycastResult}</strong>
                <span>Camera</span><strong className="text-white">{debug.cameraPosition.join(", ")}</strong>
                <span>Target</span><strong className="text-white">{debug.cameraTarget.join(", ")}</strong>
                <span>Level</span><strong className="text-white">{semanticLevel}</strong>
                <span>Draw calls</span><strong className="text-white">{debug.drawCalls}</strong>
                <span>Triangles</span><strong className="text-white">{debug.triangles}</strong>
                <span>Frame</span><strong className="text-white">{debug.frameTime}ms</strong>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-300/15 bg-amber-950/20 p-5 text-xs">
              <p className="font-semibold uppercase tracking-[0.25em] text-amber-300">Missing Studio contracts</p>
              <ul className="mt-4 max-h-56 space-y-2 overflow-auto pr-1 text-slate-300">
                {missingContracts.map((contract) => (
                  <li key={contract.id}>
                    <strong className="text-slate-100">{contract.id}</strong>
                    <br />
                    <span className="text-slate-500">{contract.category}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

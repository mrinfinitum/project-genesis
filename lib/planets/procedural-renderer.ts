import sharp from "sharp";
import type { GeneratedPlanet } from "@/types/schema";

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Palette = {
  water: Rgb;
  land: Rgb;
  highland: Rgb;
  accent: Rgb;
  cloud: Rgb;
  atmosphere: Rgb;
};

const colorWordMap: Record<string, Rgb> = {
  amber: { r: 255, g: 174, b: 64 },
  azure: { r: 64, g: 170, b: 255 },
  crimson: { r: 236, g: 65, b: 76 },
  cyan: { r: 76, g: 226, b: 255 },
  emerald: { r: 64, g: 214, b: 123 },
  indigo: { r: 107, g: 111, b: 255 },
  neon: { r: 90, g: 255, b: 222 },
  obsidian: { r: 28, g: 32, b: 48 },
  pale: { r: 196, g: 220, b: 235 },
  pearl: { r: 237, g: 232, b: 215 },
  prismatic: { r: 214, g: 126, b: 255 },
  radiant: { r: 255, g: 229, b: 142 },
  silver: { r: 178, g: 197, b: 214 },
  violet: { r: 177, g: 98, b: 255 }
};

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function lerp(left: number, right: number, amount: number) {
  return left + (right - left) * amount;
}

function mix(left: Rgb, right: Rgb, amount: number): Rgb {
  const t = clamp(amount);
  return {
    r: Math.round(lerp(left.r, right.r, t)),
    g: Math.round(lerp(left.g, right.g, t)),
    b: Math.round(lerp(left.b, right.b, t))
  };
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hashNoise(x: number, y: number, z: number, seed: number) {
  let value = Math.imul(Math.floor(x * 73856093) ^ Math.floor(y * 19349663) ^ Math.floor(z * 83492791) ^ seed, 1597334677);
  value = (value ^ (value >>> 15)) >>> 0;
  value = Math.imul(value, 2246822519) >>> 0;
  value = (value ^ (value >>> 13)) >>> 0;
  return value / 4294967295;
}

function smoothNoise(x: number, y: number, z: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const tx = x - xi;
  const ty = y - yi;
  const tz = z - zi;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const sz = tz * tz * (3 - 2 * tz);

  function sample(dx: number, dy: number, dz: number) {
    return hashNoise(xi + dx, yi + dy, zi + dz, seed);
  }

  const x00 = lerp(sample(0, 0, 0), sample(1, 0, 0), sx);
  const x10 = lerp(sample(0, 1, 0), sample(1, 1, 0), sx);
  const x01 = lerp(sample(0, 0, 1), sample(1, 0, 1), sx);
  const x11 = lerp(sample(0, 1, 1), sample(1, 1, 1), sx);
  const y0 = lerp(x00, x10, sy);
  const y1 = lerp(x01, x11, sy);
  return lerp(y0, y1, sz);
}

function fbm(x: number, y: number, z: number, seed: number) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;

  for (let octave = 0; octave < 5; octave += 1) {
    value += smoothNoise(x * frequency, y * frequency, z * frequency, seed + octave * 1013) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }

  return value / total;
}

function normalized(value: string) {
  return value.toLowerCase();
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function parsePercent(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? clamp(parsed / 100) : 0.5;
}

function parseMoonCount(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : value.includes("+") ? 5 : 0;
}

function listText(values: string[] | null | undefined) {
  return Array.isArray(values) ? values.join(" ").toLowerCase() : "";
}

function objectText(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  return Object.values(value).join(" ").toLowerCase();
}

function planetText(planet: GeneratedPlanet) {
  return [
    planet.planet_class,
    planet.primary_biome,
    planet.climate,
    planet.atmosphere,
    planet.temperature,
    planet.gravity,
    planet.water_coverage,
    planet.moons,
    planet.flora,
    planet.fauna,
    planet.ancient_civilization,
    planet.ruins,
    listText(planet.resources),
    listText(planet.hazards),
    listText(planet.traits),
    listText(planet.modifiers),
    listText(planet.weather),
    objectText(planet.visual_theme)
  ]
    .join(" ")
    .toLowerCase();
}

function themeColor(planet: GeneratedPlanet, keys: string[]) {
  const theme = planet.visual_theme ?? {};

  for (const key of keys) {
    const value = String(theme[key] ?? "").toLowerCase();
    const color = colorWordMap[value];
    if (color) {
      return color;
    }
  }

  return null;
}

function paletteForPlanet(planet: GeneratedPlanet): Palette {
  const text = planetText(planet);
  const groundTheme = themeColor(planet, ["Ground Color", "Vegetation Color", "Rock Color"]);
  const waterTheme = themeColor(planet, ["Water Color"]);
  const skyTheme = themeColor(planet, ["Sky Color", "Fog Color", "Lighting"]);
  let palette: Palette;

  if (hasAny(text, ["lava", "volcan", "magma", "ash", "extreme heat"])) {
    palette = {
      water: { r: 78, g: 18, b: 12 },
      land: { r: 82, g: 47, b: 37 },
      highland: { r: 185, g: 69, b: 28 },
      accent: { r: 255, g: 146, b: 39 },
      cloud: { r: 116, g: 91, b: 74 },
      atmosphere: { r: 255, g: 90, b: 34 }
    };
  } else if (hasAny(text, ["ice", "frozen", "snow", "blizzard", "extreme cold", "tundra"])) {
    palette = {
      water: { r: 57, g: 118, b: 153 },
      land: { r: 165, g: 207, b: 215 },
      highland: { r: 235, g: 248, b: 255 },
      accent: { r: 95, g: 194, b: 255 },
      cloud: { r: 245, g: 253, b: 255 },
      atmosphere: { r: 128, g: 218, b: 255 }
    };
  } else if (hasAny(text, ["desert", "sand", "dust", "arid", "canyon"])) {
    palette = {
      water: { r: 42, g: 100, b: 122 },
      land: { r: 181, g: 128, b: 61 },
      highland: { r: 229, g: 187, b: 98 },
      accent: { r: 244, g: 216, b: 127 },
      cloud: { r: 214, g: 189, b: 136 },
      atmosphere: { r: 255, g: 184, b: 82 }
    };
  } else if (hasAny(text, ["crystal", "crystalline", "crystal rain", "crystal growth"])) {
    palette = {
      water: { r: 53, g: 87, b: 155 },
      land: { r: 97, g: 70, b: 163 },
      highland: { r: 210, g: 145, b: 255 },
      accent: { r: 98, g: 241, b: 255 },
      cloud: { r: 223, g: 238, b: 255 },
      atmosphere: { r: 178, g: 112, b: 255 }
    };
  } else if (hasAny(text, ["void", "corruption", "rift"])) {
    palette = {
      water: { r: 26, g: 29, b: 75 },
      land: { r: 42, g: 35, b: 69 },
      highland: { r: 89, g: 63, b: 129 },
      accent: { r: 204, g: 73, b: 255 },
      cloud: { r: 85, g: 72, b: 118 },
      atmosphere: { r: 166, g: 75, b: 255 }
    };
  } else if (hasAny(text, ["toxic", "acid", "radioactive", "radiation", "methane"])) {
    palette = {
      water: { r: 64, g: 148, b: 91 },
      land: { r: 76, g: 73, b: 94 },
      highland: { r: 133, g: 212, b: 102 },
      accent: { r: 183, g: 255, b: 72 },
      cloud: { r: 119, g: 214, b: 105 },
      atmosphere: { r: 126, g: 255, b: 97 }
    };
  } else if (hasAny(text, ["ocean", "water", "aquatic", "world ocean", "coral"])) {
    palette = {
      water: { r: 17, g: 91, b: 159 },
      land: { r: 38, g: 125, b: 112 },
      highland: { r: 109, g: 199, b: 150 },
      accent: { r: 84, g: 214, b: 239 },
      cloud: { r: 226, g: 250, b: 255 },
      atmosphere: { r: 59, g: 184, b: 255 }
    };
  } else if (hasAny(text, ["living planet", "forest", "jungle", "swamp", "grassland", "dense forest", "ancient tree", "harmony"])) {
    palette = {
      water: { r: 28, g: 112, b: 135 },
      land: { r: 41, g: 139, b: 71 },
      highland: { r: 134, g: 202, b: 80 },
      accent: { r: 93, g: 255, b: 176 },
      cloud: { r: 220, g: 246, b: 232 },
      atmosphere: { r: 83, g: 228, b: 194 }
    };
  } else if (hasAny(text, ["machine", "cyber", "metal", "industrial", "hive", "artificial", "urban", "metropolis"])) {
    palette = {
      water: { r: 30, g: 72, b: 105 },
      land: { r: 72, g: 84, b: 96 },
      highland: { r: 142, g: 162, b: 178 },
      accent: { r: 75, g: 232, b: 255 },
      cloud: { r: 139, g: 170, b: 183 },
      atmosphere: { r: 77, g: 210, b: 255 }
    };
  } else {
    palette = {
      water: { r: 25, g: 92, b: 156 },
      land: { r: 52, g: 137, b: 78 },
      highland: { r: 153, g: 189, b: 94 },
      accent: { r: 108, g: 230, b: 204 },
      cloud: { r: 233, g: 244, b: 255 },
      atmosphere: { r: 88, g: 208, b: 255 }
    };
  }

  return {
    ...palette,
    water: waterTheme ? mix(palette.water, waterTheme, 0.35) : palette.water,
    land: groundTheme ? mix(palette.land, groundTheme, 0.28) : palette.land,
    highland: groundTheme ? mix(palette.highland, groundTheme, 0.18) : palette.highland,
    atmosphere: skyTheme ? mix(palette.atmosphere, skyTheme, 0.3) : palette.atmosphere
  };
}

function isGasLike(planet: GeneratedPlanet) {
  const text = normalized(`${planet.planet_class} ${planet.primary_biome} ${planet.atmosphere}`);
  return hasAny(text, ["gas", "jovian", "neptune", "storm giant"]);
}

function shouldHaveRings(planet: GeneratedPlanet, seed: number) {
  const text = planetText(planet);
  const moons = parseMoonCount(planet.moons);
  return (
    hasAny(text, ["ring world", "gas giant", "floating", "magnetic core"]) ||
    moons >= 4 ||
    (moons >= 2 && hashNoise(1, 2, 3, seed) > 0.38) ||
    hashNoise(4, 5, 6, seed) > 0.82
  );
}

function radiusFactorForPlanet(planet: GeneratedPlanet, seed: number) {
  const text = planetText(planet);
  let factor = 0.34 + (hashNoise(11, 13, 17, seed) - 0.5) * 0.05;

  if (hasAny(text, ["gas giant", "super earth", "ring world"])) {
    factor += 0.045;
  }

  if (hasAny(text, ["dwarf", "low gravity", "very low"])) {
    factor -= 0.055;
  }

  if (hasAny(text, ["artificial", "cyber", "ancient world", "void world"])) {
    factor -= 0.015;
  }

  return clamp(factor, 0.26, 0.4);
}

function effectiveWaterCoverage(planet: GeneratedPlanet) {
  const text = planetText(planet);
  let coverage = parsePercent(planet.water_coverage);

  if (hasAny(text, ["ocean", "world ocean", "coral"])) {
    coverage = Math.max(coverage, 0.78);
  }

  if (hasAny(text, ["desert", "arid", "lava", "volcanic", "frozen", "ice"])) {
    coverage = Math.min(coverage, 0.18);
  }

  if (hasAny(text, ["swamp", "jungle"])) {
    coverage = Math.max(coverage, 0.45);
  }

  return coverage;
}

function setPixel(data: Buffer, width: number, x: number, y: number, color: Rgb, alpha: number) {
  if (x < 0 || y < 0 || x >= width || y >= width || alpha <= 0) {
    return;
  }

  const index = (y * width + x) * 4;
  const existingAlpha = data[index + 3] / 255;
  const nextAlpha = clamp(alpha);
  const outAlpha = nextAlpha + existingAlpha * (1 - nextAlpha);

  if (outAlpha <= 0) {
    return;
  }

  data[index] = Math.round((color.r * nextAlpha + data[index] * existingAlpha * (1 - nextAlpha)) / outAlpha);
  data[index + 1] = Math.round((color.g * nextAlpha + data[index + 1] * existingAlpha * (1 - nextAlpha)) / outAlpha);
  data[index + 2] = Math.round((color.b * nextAlpha + data[index + 2] * existingAlpha * (1 - nextAlpha)) / outAlpha);
  data[index + 3] = Math.round(outAlpha * 255);
}

function renderRings(data: Buffer, width: number, planet: GeneratedPlanet, palette: Palette, seed: number, radius: number, frontOnly: boolean) {
  if (!shouldHaveRings(planet, seed)) {
    return;
  }

  const center = width / 2;
  const ringColor = mix(mix(palette.highland, palette.cloud, 0.35), palette.accent, hashNoise(5, 7, 9, seed) * 0.28);
  const angle = -0.42 + hashNoise(21, 23, 25, seed) * 0.34;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rx = radius * (1.58 + hashNoise(2, 4, 6, seed) * 0.36);
  const ry = radius * (0.28 + hashNoise(8, 10, 12, seed) * 0.18);
  const inner = 0.58 + hashNoise(30, 31, 32, seed) * 0.16;
  const outer = 1.02 + hashNoise(33, 34, 35, seed) * 0.16;
  const minX = Math.max(0, Math.floor(center - rx - 4));
  const maxX = Math.min(width - 1, Math.ceil(center + rx + 4));
  const minY = Math.max(0, Math.floor(center - ry - radius * 0.18));
  const maxY = Math.min(width - 1, Math.ceil(center + ry + radius * 0.18));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - center;
      const dy = y - center;
      const projectedY = dx * sin + dy * cos;

      if (frontOnly !== (projectedY > 0)) {
        continue;
      }

      const rotatedX = dx * cos - dy * sin;
      const ringDistance = Math.sqrt((rotatedX / rx) ** 2 + (projectedY / ry) ** 2);
      if (ringDistance < inner || ringDistance > outer) {
        continue;
      }

      const planetMask = Math.sqrt(dx * dx + dy * dy) < radius * 0.98 && !frontOnly;
      if (planetMask) {
        continue;
      }

      const band = smoothNoise(ringDistance * 60, rotatedX * 0.01, projectedY * 0.01, seed + 99);
      const edge = Math.min(ringDistance - inner, outer - ringDistance) / (outer - inner);
      const alpha = clamp(edge * 9) * (0.2 + band * 0.38);
      setPixel(data, width, x, y, ringColor, alpha);
    }
  }
}

function surfaceColor(planet: GeneratedPlanet, palette: Palette, nx: number, ny: number, nz: number, seed: number) {
  const gas = isGasLike(planet);
  const text = planetText(planet);
  const waterCoverage = effectiveWaterCoverage(planet);
  const warp = fbm(nx * 5.2 + 31, ny * 5.2 - 17, nz * 5.2 + 8, seed + 17) - 0.5;
  const continental = fbm(nx * 3.2 + 12 + warp * 1.8, ny * 3.2 - 4 - warp, nz * 3.2 + 8 + warp * 1.4, seed);
  const detail = fbm(nx * 10.5 - 3, ny * 10.5 + 9, nz * 10.5, seed + 41);
  const ridges = Math.abs(fbm(nx * 18, ny * 18, nz * 18, seed + 77) - 0.5) * 2;
  const latitude = Math.abs(ny);

  if (gas) {
    const bands = Math.sin((ny + detail * 0.18) * (28 + hashNoise(1, 1, 1, seed) * 22) + seed * 0.001) * 0.5 + 0.5;
    const storm = fbm(nx * 8, ny * 8, nz * 8, seed + 202);
    const stormMix = storm > 0.64 ? clamp((storm - 0.64) * 2.4) : 0.04;
    return mix(mix(palette.land, palette.highland, bands), palette.accent, stormMix);
  }

  const oceanThreshold = 1 - waterCoverage;
  const coast = clamp((continental - oceanThreshold + 0.11) / 0.22);
  const ice = hasAny(text, ["hot", "lava", "volcanic", "desert"]) ? 0 : latitude > 0.64 ? clamp((latitude - 0.64) * 3.2) : 0;
  const landBase = mix(palette.land, palette.highland, detail * 0.72 + ridges * 0.28);
  const ocean = mix(palette.water, palette.accent, detail * 0.28 + ridges * 0.08);
  const color = mix(ocean, landBase, coast);
  const withIce = mix(color, { r: 235, g: 248, b: 255 }, ice);

  if (hasAny(text, ["lava", "extreme heat", "volcano", "volcanic", "ash fall"])) {
    const lava = fbm(nx * 28, ny * 28, nz * 28, seed + 404);
    return mix(withIce, palette.accent, lava > 0.62 ? clamp((lava - 0.62) * 2.2) : 0);
  }

  if (hasAny(text, ["crystal", "quantum", "bioluminescent", "energy storm", "ionized"])) {
    const glow = fbm(nx * 24, ny * 24, nz * 24, seed + 505);
    return mix(withIce, palette.accent, glow > 0.66 ? clamp((glow - 0.66) * 1.9) : 0);
  }

  if (hasAny(text, ["artificial", "cyber", "machine", "urban", "metropolis"])) {
    const grid = Math.max(Math.abs(Math.sin((nx + warp) * 42)), Math.abs(Math.sin((ny - warp) * 42)));
    return mix(withIce, palette.accent, grid > 0.95 ? 0.42 : 0);
  }

  return withIce;
}

function cloudAlpha(planet: GeneratedPlanet, nx: number, ny: number, nz: number, seed: number) {
  const text = normalized(`${planet.atmosphere} ${planet.climate} ${listText(planet.weather)}`);
  if (hasAny(text, ["none", "thin"])) {
    return 0.02;
  }

  const cloud = fbm(nx * 9.5 + 5, ny * 9.5, nz * 9.5 - 2, seed + 700);
  const bands = Math.sin((ny + cloud * 0.18) * 20) * 0.5 + 0.5;
  const stormBoost = hasAny(text, ["storm", "cloud", "rain", "snow", "blizzard", "dense"]) ? 0.14 : 0;
  return clamp((cloud - 0.62) * 1.18 + bands * 0.08 + stormBoost, 0, 0.32);
}

export async function renderProceduralPlanetPng(planet: GeneratedPlanet, size = 4096) {
  const width = Math.max(256, Math.min(4096, Math.round(size)));
  const data = Buffer.alloc(width * width * 4);
  const seed = hashString(`${planet.id}:${planet.seed}:${planet.name}`);
  const palette = paletteForPlanet(planet);
  const center = width / 2;
  const radius = width * radiusFactorForPlanet(planet, seed);
  const text = planetText(planet);
  const atmosphereScale = hasAny(text, ["none"]) ? 1.02 : hasAny(text, ["dense", "toxic", "methane", "hydrogen", "ionized"]) ? 1.16 : 1.08;
  const atmosphereRadius = radius * atmosphereScale;
  const light = {
    x: -0.62 + hashNoise(42, 43, 44, seed) * 0.32,
    y: -0.76 + hashNoise(45, 46, 47, seed) * 0.36,
    z: 0.92
  };
  const lightLength = Math.sqrt(light.x * light.x + light.y * light.y + light.z * light.z);
  light.x /= lightLength;
  light.y /= lightLength;
  light.z /= lightLength;

  renderRings(data, width, planet, palette, seed, radius, false);

  const min = Math.max(0, Math.floor(center - atmosphereRadius - 2));
  const max = Math.min(width - 1, Math.ceil(center + atmosphereRadius + 2));

  for (let y = min; y <= max; y += 1) {
    const dy = (y + 0.5 - center) / radius;
    for (let x = min; x <= max; x += 1) {
      const dx = (x + 0.5 - center) / radius;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 1.1) {
        continue;
      }

      if (distance > 1) {
        const atmosphere = clamp((atmosphereScale - distance) / Math.max(0.02, atmosphereScale - 1)) * (hasAny(text, ["none"]) ? 0.08 : 0.28);
        setPixel(data, width, x, y, palette.atmosphere, atmosphere);
        continue;
      }

      const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
      const nx = dx;
      const ny = dy;
      const lambert = clamp(nx * light.x + ny * light.y + nz * light.z);
      const night = clamp((lambert + 0.18) / 1.18);
      const rim = clamp((1 - nz) ** 2.4);
      const base = surfaceColor(planet, palette, nx, ny, nz, seed);
      const clouds = cloudAlpha(planet, nx, ny, nz, seed);
      let color = mix(base, palette.cloud, clouds);
      color = mix({ r: 3, g: 10, b: 26 }, color, 0.22 + night * 0.95);
      color = mix(color, palette.atmosphere, rim * 0.46);

      const alpha = clamp((1 - distance) * 70);
      setPixel(data, width, x, y, color, alpha);

      const ruinGlow = hasAny(normalized(`${planet.ancient_civilization} ${planet.ruins}`), ["ancient", "machine", "city", "temple", "megacity", "laboratory"]);
      if (ruinGlow && lambert > 0.08) {
        const city = fbm(nx * 54, ny * 54, nz * 54, seed + 900);
        if (city > 0.84 && distance < 0.93) {
          setPixel(data, width, x, y, palette.accent, (city - 0.84) * 1.5);
        }
      }
    }
  }

  renderRings(data, width, planet, palette, seed, radius, true);

  return sharp(data, {
    raw: {
      width,
      height: width,
      channels: 4
    }
  })
    .png()
    .toBuffer();
}

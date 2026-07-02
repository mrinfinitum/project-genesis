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

function paletteForPlanet(planet: GeneratedPlanet): Palette {
  const text = [
    planet.planet_class,
    planet.primary_biome,
    planet.climate,
    planet.atmosphere,
    planet.temperature,
    listText(planet.resources),
    listText(planet.hazards),
    listText(planet.traits)
  ]
    .join(" ")
    .toLowerCase();

  if (hasAny(text, ["lava", "volcan", "magma", "ash", "extreme heat"])) {
    return {
      water: { r: 78, g: 18, b: 12 },
      land: { r: 82, g: 47, b: 37 },
      highland: { r: 185, g: 69, b: 28 },
      accent: { r: 255, g: 146, b: 39 },
      cloud: { r: 116, g: 91, b: 74 },
      atmosphere: { r: 255, g: 90, b: 34 }
    };
  }

  if (hasAny(text, ["ice", "frozen", "snow", "blizzard", "extreme cold"])) {
    return {
      water: { r: 57, g: 118, b: 153 },
      land: { r: 165, g: 207, b: 215 },
      highland: { r: 235, g: 248, b: 255 },
      accent: { r: 95, g: 194, b: 255 },
      cloud: { r: 245, g: 253, b: 255 },
      atmosphere: { r: 128, g: 218, b: 255 }
    };
  }

  if (hasAny(text, ["desert", "sand", "dust", "arid"])) {
    return {
      water: { r: 42, g: 100, b: 122 },
      land: { r: 181, g: 128, b: 61 },
      highland: { r: 229, g: 187, b: 98 },
      accent: { r: 244, g: 216, b: 127 },
      cloud: { r: 214, g: 189, b: 136 },
      atmosphere: { r: 255, g: 184, b: 82 }
    };
  }

  if (hasAny(text, ["toxic", "acid", "radioactive", "radiation", "void"])) {
    return {
      water: { r: 64, g: 148, b: 91 },
      land: { r: 76, g: 73, b: 94 },
      highland: { r: 133, g: 212, b: 102 },
      accent: { r: 183, g: 255, b: 72 },
      cloud: { r: 119, g: 214, b: 105 },
      atmosphere: { r: 126, g: 255, b: 97 }
    };
  }

  if (hasAny(text, ["ocean", "water", "aquatic", "world ocean"])) {
    return {
      water: { r: 17, g: 91, b: 159 },
      land: { r: 38, g: 125, b: 112 },
      highland: { r: 109, g: 199, b: 150 },
      accent: { r: 84, g: 214, b: 239 },
      cloud: { r: 226, g: 250, b: 255 },
      atmosphere: { r: 59, g: 184, b: 255 }
    };
  }

  if (hasAny(text, ["machine", "cyber", "metal", "industrial", "hive"])) {
    return {
      water: { r: 30, g: 72, b: 105 },
      land: { r: 72, g: 84, b: 96 },
      highland: { r: 142, g: 162, b: 178 },
      accent: { r: 75, g: 232, b: 255 },
      cloud: { r: 139, g: 170, b: 183 },
      atmosphere: { r: 77, g: 210, b: 255 }
    };
  }

  return {
    water: { r: 25, g: 92, b: 156 },
    land: { r: 52, g: 137, b: 78 },
    highland: { r: 153, g: 189, b: 94 },
    accent: { r: 108, g: 230, b: 204 },
    cloud: { r: 233, g: 244, b: 255 },
    atmosphere: { r: 88, g: 208, b: 255 }
  };
}

function isGasLike(planet: GeneratedPlanet) {
  const text = normalized(`${planet.planet_class} ${planet.primary_biome} ${planet.atmosphere}`);
  return hasAny(text, ["gas", "jovian", "neptune", "storm giant"]);
}

function shouldHaveRings(planet: GeneratedPlanet, seed: number) {
  const text = normalized(`${planet.planet_class} ${planet.primary_biome} ${listText(planet.traits)}`);
  return parseMoonCount(planet.moons) >= 3 || hasAny(text, ["ring", "gas", "floating"]) || hashNoise(1, 2, 3, seed) > 0.78;
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

function renderRings(data: Buffer, width: number, planet: GeneratedPlanet, palette: Palette, seed: number, frontOnly: boolean) {
  if (!shouldHaveRings(planet, seed)) {
    return;
  }

  const center = width / 2;
  const radius = width * 0.34;
  const ringColor = mix(palette.highland, palette.cloud, 0.35);
  const angle = -0.28;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rx = radius * 1.7;
  const ry = radius * 0.38;
  const inner = 0.72;
  const outer = 1.04;
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
      const alpha = clamp(edge * 7) * (0.18 + band * 0.28);
      setPixel(data, width, x, y, ringColor, alpha);
    }
  }
}

function surfaceColor(planet: GeneratedPlanet, palette: Palette, nx: number, ny: number, nz: number, seed: number) {
  const gas = isGasLike(planet);
  const waterCoverage = parsePercent(planet.water_coverage);
  const continental = fbm(nx * 2.2 + 12, ny * 2.2 - 4, nz * 2.2 + 8, seed);
  const detail = fbm(nx * 10.5 - 3, ny * 10.5 + 9, nz * 10.5, seed + 41);
  const ridges = Math.abs(fbm(nx * 18, ny * 18, nz * 18, seed + 77) - 0.5) * 2;
  const latitude = Math.abs(ny);

  if (gas) {
    const bands = Math.sin((ny + detail * 0.12) * 34 + seed * 0.001) * 0.5 + 0.5;
    const storm = fbm(nx * 8, ny * 8, nz * 8, seed + 202);
    return mix(mix(palette.land, palette.highland, bands), palette.accent, storm > 0.72 ? 0.42 : 0.06);
  }

  const oceanThreshold = 1 - waterCoverage;
  const coast = clamp((continental - oceanThreshold + 0.08) / 0.16);
  const ice = latitude > 0.72 ? clamp((latitude - 0.72) * 5) : 0;
  const landBase = mix(palette.land, palette.highland, detail * 0.56 + ridges * 0.22);
  const ocean = mix(palette.water, palette.accent, detail * 0.18);
  const color = mix(ocean, landBase, coast);
  const withIce = mix(color, { r: 235, g: 248, b: 255 }, ice);

  if (hasAny(listText(planet.hazards), ["lava", "extreme heat", "volcano"])) {
    const lava = fbm(nx * 28, ny * 28, nz * 28, seed + 404);
    return mix(withIce, palette.accent, lava > 0.74 ? 0.78 : 0);
  }

  if (hasAny(listText(planet.traits), ["crystal", "quantum", "bioluminescent"])) {
    const glow = fbm(nx * 24, ny * 24, nz * 24, seed + 505);
    return mix(withIce, palette.accent, glow > 0.78 ? 0.44 : 0);
  }

  return withIce;
}

function cloudAlpha(planet: GeneratedPlanet, nx: number, ny: number, nz: number, seed: number) {
  const text = normalized(`${planet.atmosphere} ${planet.climate} ${listText(planet.weather)}`);
  if (hasAny(text, ["none", "thin"])) {
    return 0.02;
  }

  const cloud = fbm(nx * 8.5 + 5, ny * 8.5, nz * 8.5 - 2, seed + 700);
  const bands = Math.sin((ny + cloud * 0.18) * 20) * 0.5 + 0.5;
  const stormBoost = hasAny(text, ["storm", "cloud", "rain", "snow", "blizzard"]) ? 0.18 : 0;
  return clamp((cloud - 0.56) * 1.35 + bands * 0.1 + stormBoost, 0, 0.48);
}

export async function renderProceduralPlanetPng(planet: GeneratedPlanet, size = 4096) {
  const width = Math.max(256, Math.min(4096, Math.round(size)));
  const data = Buffer.alloc(width * width * 4);
  const seed = hashString(`${planet.id}:${planet.seed}:${planet.name}`);
  const palette = paletteForPlanet(planet);
  const center = width / 2;
  const radius = width * 0.34;
  const atmosphereRadius = radius * 1.1;
  const light = { x: -0.45, y: -0.62, z: 0.98 };
  const lightLength = Math.sqrt(light.x * light.x + light.y * light.y + light.z * light.z);
  light.x /= lightLength;
  light.y /= lightLength;
  light.z /= lightLength;

  renderRings(data, width, planet, palette, seed, false);

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
        const atmosphere = clamp((1.1 - distance) / 0.1) * 0.24;
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
      color = mix({ r: 3, g: 10, b: 26 }, color, 0.28 + night * 0.9);
      color = mix(color, palette.atmosphere, rim * 0.4);

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

  renderRings(data, width, planet, palette, seed, true);

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

import type { GeneratedPlanet } from "@/types/schema";

export function hasLockedPlanetRender(planet: Pick<GeneratedPlanet, "image_url" | "image_variants">) {
  if (typeof planet.image_url === "string" && planet.image_url.trim()) {
    return true;
  }

  return Array.isArray(planet.image_variants) && planet.image_variants.some((variant) => typeof variant?.url === "string" && variant.url.trim());
}

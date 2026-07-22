export const AI_VOLUMES = [
  { volume: 1, roman: "I", title: "Foundations" },
  { volume: 2, roman: "II", title: "Industrial Systems" },
  { volume: 3, roman: "III", title: "Scientific Systems" },
  { volume: 4, roman: "IV", title: "Exploration Systems" },
  { volume: 5, roman: "V", title: "Civilization Systems" },
  { volume: 6, roman: "VI", title: "Economic Systems" },
  { volume: 7, roman: "VII", title: "Logistics & Transportation" },
  { volume: 8, roman: "VIII", title: "Medical & Population" },
  { volume: 9, roman: "IX", title: "Government & Administration" },
  { volume: 10, roman: "X", title: "Environmental Systems" },
  { volume: 11, roman: "XI", title: "Terraforming Initiative" },
  { volume: 12, roman: "XII", title: "Education & Knowledge" },
  { volume: 13, roman: "XIII", title: "Cultural Preservation" },
  { volume: 14, roman: "XIV", title: "Historical Archives" },
  { volume: 15, roman: "XV", title: "First Contact" },
  { volume: 16, roman: "XVI", title: "Ancient Intelligence" },
  { volume: 17, roman: "XVII", title: "Experimental Intelligence" },
  { volume: 18, roman: "XVIII", title: "Genesis Intelligence" },
  { volume: 19, roman: "XIX", title: "Companion AI" },
  { volume: 20, roman: "XX", title: "Legendary & Singularity AI" }
] as const;

export function romanNumeral(value: number) {
  if (!Number.isInteger(value) || value <= 0 || value >= 4000) return "";
  const numerals: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let remaining = value;
  let result = "";
  for (const [amount, symbol] of numerals) {
    while (remaining >= amount) {
      result += symbol;
      remaining -= amount;
    }
  }
  return result;
}

export function aiVolumeLabel(volume: number, fallbackTitle?: string) {
  const definition = AI_VOLUMES.find((entry) => entry.volume === volume);
  const roman = definition?.roman ?? romanNumeral(volume);
  const title = definition?.title ?? fallbackTitle ?? "Unknown Volume";
  return `Volume ${roman || volume} — ${title}`;
}

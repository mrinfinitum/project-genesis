import { ResourceService } from "@/lib/resources/service";
import type {
  PlanetActiveEnvironmentRules,
  PlanetDataCompleteness,
  PlanetDeepData,
  PlanetScientificSource,
  ScientificValue
} from "@/types/planet-deep-data";
import type { GeneratedPlanet } from "@/types/schema";

export const SOL_SYSTEM_DATA_VERSION = "sol-system-reference-v1";
const RETRIEVED_AT = "2026-07-24";

export const solScientificSources: PlanetScientificSource[] = [
  {
    sourceId: "jpl_planetary_physical_parameters",
    publisher: "NASA Jet Propulsion Laboratory",
    title: "Planetary Physical Parameters",
    sourceType: "government_science",
    url: "https://ssd.jpl.nasa.gov/planets/phys_par.html",
    retrievedAt: RETRIEVED_AT,
    dataDate: null,
    notes: "Primary reference for planetary radii, mass, density, rotation, orbital period, gravity, and escape velocity."
  },
  {
    sourceId: "jpl_satellite_physical_parameters",
    publisher: "NASA Jet Propulsion Laboratory",
    title: "Planetary Satellite Physical Parameters",
    sourceType: "government_science",
    url: "https://ssd.jpl.nasa.gov/sats/phys_par/",
    retrievedAt: RETRIEVED_AT,
    dataDate: null,
    notes: "Primary reference for major-moon radii, density, and orbital parameters."
  },
  {
    sourceId: "nasa_planetary_science",
    publisher: "NASA Science",
    title: "Solar System Exploration",
    sourceType: "government_science",
    url: "https://science.nasa.gov/solar-system/",
    retrievedAt: RETRIEVED_AT,
    dataDate: null,
    notes: "Reference for atmosphere, geology, climate, weather, rings, magnetospheres, and exploration context."
  },
  {
    sourceId: "nasa_dwarf_planets",
    publisher: "NASA Science",
    title: "Pluto and Dwarf Planets",
    sourceType: "government_science",
    url: "https://science.nasa.gov/dwarf-planets/",
    retrievedAt: RETRIEVED_AT,
    dataDate: null,
    notes: "Reference for the five IAU-recognized dwarf planets and their classifications."
  },
  {
    sourceId: "noaa_earth_climate",
    publisher: "NOAA",
    title: "Climate and Weather",
    sourceType: "government_science",
    url: "https://www.noaa.gov/climate",
    retrievedAt: RETRIEVED_AT,
    dataDate: null,
    notes: "Reference for Earth climate, weather, hydrosphere, and long-term climate context."
  },
  {
    sourceId: "noveris_sol_gameplay",
    publisher: "Project Genesis Studio",
    title: "NOVERIS Sol Gameplay Abstractions",
    sourceType: "canonical_gameplay",
    url: "",
    retrievedAt: RETRIEVED_AT,
    dataDate: null,
    notes: "Clearly separated gameplay values for suitability, progression, visibility, and presentation."
  }
];

type SolBodyFacts = {
  designation: string;
  family: string;
  subtype: string;
  radiusKm: number;
  massEarth: number;
  density: number;
  gravityG: number;
  escapeVelocity: number;
  axialTilt: number;
  rotationHours: number;
  orbitalPeriodDays: number;
  orbitalDistance: number;
  orbitalDistanceUnit?: "AU" | "km";
  eccentricity: number;
  inclination: number;
  meanTemperatureK: number;
  minimumTemperatureK: number;
  maximumTemperatureK: number;
  pressureBar: number;
  atmosphere: Array<[string, number]>;
  atmosphereLabel: string;
  tidalLock: string;
  ringSystem?: string;
  confirmedLife?: boolean;
  lifePotential?: string;
  climateLabel: string;
  weatherLabel: string;
  geology: string;
  sourceIds?: string[];
  estimatedFields?: number;
};

// Rounded display values are intentional. JPL/NASA remain authoritative through
// source metadata; Studio does not imply greater precision than the gameplay UI needs.
const facts: Record<string, SolBodyFacts> = {
  Mercury: { designation: "Sol I", family: "Terrestrial", subtype: "Airless rocky body", radiusKm: 2439.4, massEarth: 0.0553, density: 5.429, gravityG: 0.378, escapeVelocity: 4.25, axialTilt: 0.034, rotationHours: 1407.6, orbitalPeriodDays: 87.969, orbitalDistance: 0.3871, eccentricity: 0.2056, inclination: 7.005, meanTemperatureK: 440, minimumTemperatureK: 100, maximumTemperatureK: 700, pressureBar: 0, atmosphere: [], atmosphereLabel: "Surface-bound exosphere", tidalLock: "3:2 spin-orbit resonance", climateLabel: "No conventional climate", weatherLabel: "Solar exposure, micrometeorites, and exospheric variation", geology: "Heavily cratered silicate crust over an unusually large metallic core" },
  Venus: { designation: "Sol II", family: "Toxic", subtype: "Runaway-greenhouse terrestrial", radiusKm: 6051.8, massEarth: 0.815, density: 5.243, gravityG: 0.907, escapeVelocity: 10.36, axialTilt: 177.36, rotationHours: -5832.5, orbitalPeriodDays: 224.701, orbitalDistance: 0.7233, eccentricity: 0.0068, inclination: 3.3947, meanTemperatureK: 737, minimumTemperatureK: 735, maximumTemperatureK: 740, pressureBar: 92, atmosphere: [["Carbon Dioxide", 96.5], ["Nitrogen", 3.5]], atmosphereLabel: "Dense carbon-dioxide atmosphere", tidalLock: "unlocked retrograde rotation", climateLabel: "Runaway greenhouse", weatherLabel: "Sulfuric-acid clouds and atmospheric super-rotation", geology: "Volcanic plains and highlands; present-day volcanic activity remains under investigation", estimatedFields: 3 },
  Earth: { designation: "Sol III", family: "Terrestrial", subtype: "Temperate inhabited terrestrial", radiusKm: 6371.008, massEarth: 1, density: 5.514, gravityG: 1, escapeVelocity: 11.186, axialTilt: 23.439, rotationHours: 23.934, orbitalPeriodDays: 365.256, orbitalDistance: 1, eccentricity: 0.0167, inclination: 0, meanTemperatureK: 288, minimumTemperatureK: 184, maximumTemperatureK: 330, pressureBar: 1.01325, atmosphere: [["Nitrogen", 78.084], ["Oxygen", 20.946], ["Argon", 0.934], ["Carbon Dioxide", 0.036]], atmosphereLabel: "Nitrogen-oxygen atmosphere", tidalLock: "unlocked", ringSystem: "none", confirmedLife: true, lifePotential: "Confirmed global biosphere", climateLabel: "Diverse ocean-regulated climate", weatherLabel: "Full terrestrial weather system with hemispheric, equatorial, monsoon, and polar cycles", geology: "Differentiated active world with plate tectonics, volcanism, erosion, and a global hydrological cycle", sourceIds: ["jpl_planetary_physical_parameters", "nasa_planetary_science", "noaa_earth_climate"] },
  Mars: { designation: "Sol IV", family: "Desert", subtype: "Cold desert terrestrial", radiusKm: 3389.5, massEarth: 0.1074, density: 3.934, gravityG: 0.379, escapeVelocity: 5.03, axialTilt: 25.19, rotationHours: 24.623, orbitalPeriodDays: 686.98, orbitalDistance: 1.5237, eccentricity: 0.0934, inclination: 1.85, meanTemperatureK: 210, minimumTemperatureK: 130, maximumTemperatureK: 308, pressureBar: 0.00636, atmosphere: [["Carbon Dioxide", 95.32], ["Nitrogen", 2.7], ["Argon", 1.6], ["Oxygen", 0.13], ["Carbon Monoxide", 0.08]], atmosphereLabel: "Thin carbon-dioxide atmosphere", tidalLock: "unlocked", lifePotential: "Potential protected subsurface microbial habitats; unconfirmed", climateLabel: "Cold arid climate with unequal orbital seasons", weatherLabel: "Dust devils, regional storms, global dust events, frost, and carbon-dioxide ice cycles", geology: "Basaltic regolith, giant shield volcanoes, canyon systems, impact basins, polar layered deposits, and ancient fluvial terrain" },
  Jupiter: { designation: "Sol V", family: "Gas Giant", subtype: "Hydrogen-helium storm giant", radiusKm: 69911, massEarth: 317.83, density: 1.326, gravityG: 2.528, escapeVelocity: 59.5, axialTilt: 3.13, rotationHours: 9.925, orbitalPeriodDays: 4332.59, orbitalDistance: 5.2028, eccentricity: 0.0489, inclination: 1.304, meanTemperatureK: 165, minimumTemperatureK: 110, maximumTemperatureK: 2000, pressureBar: 1, atmosphere: [["Hydrogen", 89.8], ["Helium", 10.2]], atmosphereLabel: "Hydrogen-helium atmosphere without a solid surface", tidalLock: "unlocked", ringSystem: "faint ring system", climateLabel: "Layered giant-planet atmosphere", weatherLabel: "Powerful jets, long-lived vortices, lightning, convection, and the Great Red Spot", geology: "No solid surface; progressively compressed fluid and metallic-hydrogen interior" },
  Saturn: { designation: "Sol VI", family: "Gas Giant", subtype: "Ringed hydrogen-helium giant", radiusKm: 58232, massEarth: 95.16, density: 0.687, gravityG: 1.065, escapeVelocity: 35.5, axialTilt: 26.73, rotationHours: 10.656, orbitalPeriodDays: 10759.22, orbitalDistance: 9.5388, eccentricity: 0.0565, inclination: 2.485, meanTemperatureK: 134, minimumTemperatureK: 82, maximumTemperatureK: 1800, pressureBar: 1, atmosphere: [["Hydrogen", 96.3], ["Helium", 3.25], ["Methane", 0.45]], atmosphereLabel: "Hydrogen-helium atmosphere without a solid surface", tidalLock: "unlocked", ringSystem: "extensive water-ice ring system", climateLabel: "Layered giant-planet atmosphere", weatherLabel: "Fast winds, convective storms, seasonal color changes, and the north-polar hexagon", geology: "No solid surface; hydrogen-helium envelope above denser fluid and rocky/icy interior" },
  Uranus: { designation: "Sol VII", family: "Gas Giant", subtype: "Methane-bearing ice giant", radiusKm: 25362, massEarth: 14.536, density: 1.27, gravityG: 0.886, escapeVelocity: 21.3, axialTilt: 97.77, rotationHours: -17.24, orbitalPeriodDays: 30688.5, orbitalDistance: 19.191, eccentricity: 0.0472, inclination: 0.773, meanTemperatureK: 76, minimumTemperatureK: 49, maximumTemperatureK: 320, pressureBar: 1, atmosphere: [["Hydrogen", 82.5], ["Helium", 15.2], ["Methane", 2.3]], atmosphereLabel: "Hydrogen-helium-methane ice-giant atmosphere", tidalLock: "unlocked retrograde rotation", ringSystem: "narrow dark rings", climateLabel: "Extreme long-duration axial seasons", weatherLabel: "Methane clouds, polar circulation, intermittent storms, and long seasonal transitions", geology: "No solid surface; molecular envelope above water-ammonia-methane-rich interior" },
  Neptune: { designation: "Sol VIII", family: "Gas Giant", subtype: "Active methane-bearing ice giant", radiusKm: 24622, massEarth: 17.147, density: 1.638, gravityG: 1.137, escapeVelocity: 23.5, axialTilt: 28.32, rotationHours: 16.11, orbitalPeriodDays: 60182, orbitalDistance: 30.069, eccentricity: 0.0086, inclination: 1.77, meanTemperatureK: 72, minimumTemperatureK: 55, maximumTemperatureK: 300, pressureBar: 1, atmosphere: [["Hydrogen", 80], ["Helium", 19], ["Methane", 1]], atmosphereLabel: "Hydrogen-helium-methane ice-giant atmosphere", tidalLock: "unlocked", ringSystem: "faint dusty rings and arcs", climateLabel: "Cold active ice-giant atmosphere", weatherLabel: "Solar System's fastest measured winds, dark vortices, bright methane-ice clouds, and strong internal heat", geology: "No solid surface; molecular atmosphere above volatile-rich mantle and compact core" },
  Moon: { designation: "Earth I", family: "Dead", subtype: "Airless differentiated rocky moon", radiusKm: 1737.4, massEarth: 0.0123, density: 3.344, gravityG: 0.165, escapeVelocity: 2.38, axialTilt: 6.68, rotationHours: 655.72, orbitalPeriodDays: 27.322, orbitalDistance: 384400, orbitalDistanceUnit: "km", eccentricity: 0.0549, inclination: 5.145, meanTemperatureK: 250, minimumTemperatureK: 100, maximumTemperatureK: 390, pressureBar: 0, atmosphere: [], atmosphereLabel: "Surface-bound exosphere", tidalLock: "synchronous with Earth", climateLabel: "No conventional climate", weatherLabel: "Solar exposure, eclipse cooling, electrostatic dust, micrometeorites, and radiation", geology: "Anorthositic highlands, basaltic maria, regolith, impact basins, polar cold traps, and a small metallic core" },
  Phobos: { designation: "Mars I", family: "Dead", subtype: "Irregular inner Martian moon", radiusKm: 11.08, massEarth: 0.00000000178, density: 1.876, gravityG: 0.00058, escapeVelocity: 0.0114, axialTilt: 0, rotationHours: 7.65, orbitalPeriodDays: 0.319, orbitalDistance: 9376, orbitalDistanceUnit: "km", eccentricity: 0.0151, inclination: 1.075, meanTemperatureK: 233, minimumTemperatureK: 150, maximumTemperatureK: 300, pressureBar: 0, atmosphere: [], atmosphereLabel: "None", tidalLock: "synchronous with Mars", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling, radiation, and micrometeorites", geology: "Dark porous regolith and heavily cratered irregular body" },
  Deimos: { designation: "Mars II", family: "Dead", subtype: "Irregular outer Martian moon", radiusKm: 6.2, massEarth: 0.00000000025, density: 1.471, gravityG: 0.00031, escapeVelocity: 0.0056, axialTilt: 0, rotationHours: 30.3, orbitalPeriodDays: 1.263, orbitalDistance: 23463, orbitalDistanceUnit: "km", eccentricity: 0.0002, inclination: 1.788, meanTemperatureK: 233, minimumTemperatureK: 150, maximumTemperatureK: 300, pressureBar: 0, atmosphere: [], atmosphereLabel: "None", tidalLock: "synchronous with Mars", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling, radiation, and micrometeorites", geology: "Small porous body with a smooth regolith-covered cratered surface" },
  Io: { designation: "Jupiter I", family: "Lava", subtype: "Tidally heated volcanic moon", radiusKm: 1821.49, massEarth: 0.015, density: 3.528, gravityG: 0.183, escapeVelocity: 2.56, axialTilt: 0.04, rotationHours: 42.46, orbitalPeriodDays: 1.769, orbitalDistance: 421800, orbitalDistanceUnit: "km", eccentricity: 0.0041, inclination: 0.05, meanTemperatureK: 130, minimumTemperatureK: 90, maximumTemperatureK: 2000, pressureBar: 0.00000001, atmosphere: [["Sulfur Dioxide", 100]], atmosphereLabel: "Tenuous sulfur-dioxide atmosphere", tidalLock: "synchronous with Jupiter", climateLabel: "No conventional climate", weatherLabel: "Volcanic plumes, plasma interaction, eclipses, and sulfur frost cycles", geology: "Most volcanically active known body, powered by tidal heating" },
  Europa: { designation: "Jupiter II", family: "Ice", subtype: "Icy ocean moon", radiusKm: 1560.8, massEarth: 0.00804, density: 3.013, gravityG: 0.134, escapeVelocity: 2.03, axialTilt: 0.1, rotationHours: 85.23, orbitalPeriodDays: 3.551, orbitalDistance: 671100, orbitalDistanceUnit: "km", eccentricity: 0.009, inclination: 0.47, meanTemperatureK: 102, minimumTemperatureK: 50, maximumTemperatureK: 125, pressureBar: 0, atmosphere: [["Oxygen", 100]], atmosphereLabel: "Tenuous oxygen exosphere", tidalLock: "synchronous with Jupiter", lifePotential: "Potential subsurface ocean habitability; no confirmed life", climateLabel: "Ice-shell thermal environment", weatherLabel: "Radiation processing, possible plume activity, eclipses, and tidal flexing", geology: "Young fractured ice shell with bands, ridges, chaos terrain, and strong evidence for a global subsurface ocean", estimatedFields: 4 },
  Ganymede: { designation: "Jupiter III", family: "Ice", subtype: "Differentiated magnetic ocean moon", radiusKm: 2631.2, massEarth: 0.0248, density: 1.942, gravityG: 0.146, escapeVelocity: 2.74, axialTilt: 0.33, rotationHours: 171.7, orbitalPeriodDays: 7.155, orbitalDistance: 1070400, orbitalDistanceUnit: "km", eccentricity: 0.0013, inclination: 0.2, meanTemperatureK: 110, minimumTemperatureK: 70, maximumTemperatureK: 152, pressureBar: 0, atmosphere: [["Oxygen", 100]], atmosphereLabel: "Tenuous oxygen exosphere", tidalLock: "synchronous with Jupiter", lifePotential: "Layered internal oceans are plausible; no confirmed life", climateLabel: "Ice-shell thermal environment", weatherLabel: "Radiation, auroral activity, eclipse cooling, and charged-particle interaction", geology: "Mixed dark cratered terrain and younger grooved ice, differentiated interior, and intrinsic magnetic field", estimatedFields: 3 },
  Callisto: { designation: "Jupiter IV", family: "Ice", subtype: "Ancient cratered ocean-candidate moon", radiusKm: 2410.3, massEarth: 0.018, density: 1.834, gravityG: 0.126, escapeVelocity: 2.44, axialTilt: 0.4, rotationHours: 400.5, orbitalPeriodDays: 16.689, orbitalDistance: 1882700, orbitalDistanceUnit: "km", eccentricity: 0.0074, inclination: 0.19, meanTemperatureK: 134, minimumTemperatureK: 80, maximumTemperatureK: 165, pressureBar: 0, atmosphere: [["Carbon Dioxide", 100]], atmosphereLabel: "Extremely tenuous carbon-dioxide atmosphere", tidalLock: "synchronous with Jupiter", lifePotential: "A deep internal ocean is possible; no confirmed life", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling, low-level radiation, and micrometeorites", geology: "Heavily cratered ancient ice-rock surface with low present geological activity", estimatedFields: 2 },
  Mimas: { designation: "Saturn I", family: "Ice", subtype: "Small cratered icy moon", radiusKm: 198.2, massEarth: 0.0000063, density: 1.15, gravityG: 0.0064, escapeVelocity: 0.159, axialTilt: 0, rotationHours: 22.62, orbitalPeriodDays: 0.942, orbitalDistance: 185539, orbitalDistanceUnit: "km", eccentricity: 0.0196, inclination: 1.57, meanTemperatureK: 64, minimumTemperatureK: 45, maximumTemperatureK: 92, pressureBar: 0, atmosphere: [], atmosphereLabel: "None", tidalLock: "synchronous with Saturn", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling, ring-particle environment, and micrometeorites", geology: "Water-ice body dominated by Herschel crater", estimatedFields: 1 },
  Enceladus: { designation: "Saturn II", family: "Ice", subtype: "Active cryovolcanic ocean moon", radiusKm: 252.1, massEarth: 0.000018, density: 1.61, gravityG: 0.0115, escapeVelocity: 0.239, axialTilt: 0, rotationHours: 32.88, orbitalPeriodDays: 1.37, orbitalDistance: 238042, orbitalDistanceUnit: "km", eccentricity: 0.0047, inclination: 0.01, meanTemperatureK: 75, minimumTemperatureK: 33, maximumTemperatureK: 145, pressureBar: 0, atmosphere: [["Water", 100]], atmosphereLabel: "Localized water-vapor plume environment", tidalLock: "synchronous with Saturn", lifePotential: "Subsurface ocean has water, salts, organics, and hydrothermal energy; no confirmed life", climateLabel: "Ice-shell and plume thermal environment", weatherLabel: "South-polar plume activity, cryovolcanism, fallout, eclipses, and tidal flexing", geology: "Young resurfaced ice, tiger-stripe fractures, active plumes, subsurface ocean, and tidal heating", estimatedFields: 3 },
  Tethys: { designation: "Saturn III", family: "Ice", subtype: "Low-density fractured icy moon", radiusKm: 531.1, massEarth: 0.000103, density: 0.984, gravityG: 0.0149, escapeVelocity: 0.394, axialTilt: 0, rotationHours: 45.31, orbitalPeriodDays: 1.888, orbitalDistance: 294672, orbitalDistanceUnit: "km", eccentricity: 0.0001, inclination: 1.12, meanTemperatureK: 86, minimumTemperatureK: 60, maximumTemperatureK: 105, pressureBar: 0, atmosphere: [], atmosphereLabel: "None", tidalLock: "synchronous with Saturn", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling and micrometeorites", geology: "Water-ice-rich surface with Odysseus crater and Ithaca Chasma" },
  Dione: { designation: "Saturn IV", family: "Ice", subtype: "Fractured icy moon", radiusKm: 561.4, massEarth: 0.000183, density: 1.478, gravityG: 0.0237, escapeVelocity: 0.51, axialTilt: 0, rotationHours: 65.69, orbitalPeriodDays: 2.737, orbitalDistance: 377415, orbitalDistanceUnit: "km", eccentricity: 0.0022, inclination: 0.02, meanTemperatureK: 87, minimumTemperatureK: 55, maximumTemperatureK: 115, pressureBar: 0, atmosphere: [["Oxygen", 100]], atmosphereLabel: "Extremely tenuous oxygen exosphere", tidalLock: "synchronous with Saturn", lifePotential: "Internal ocean is possible; no confirmed life", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling, charged particles, and micrometeorites", geology: "Cratered ice-rock moon with tectonic wispy terrain and possible internal ocean", estimatedFields: 2 },
  Rhea: { designation: "Saturn V", family: "Ice", subtype: "Large cratered icy moon", radiusKm: 763.5, massEarth: 0.000386, density: 1.237, gravityG: 0.027, escapeVelocity: 0.635, axialTilt: 0, rotationHours: 108.4, orbitalPeriodDays: 4.518, orbitalDistance: 527068, orbitalDistanceUnit: "km", eccentricity: 0.001, inclination: 0.35, meanTemperatureK: 76, minimumTemperatureK: 53, maximumTemperatureK: 99, pressureBar: 0, atmosphere: [["Oxygen", 70], ["Carbon Dioxide", 30]], atmosphereLabel: "Extremely tenuous oxygen-carbon-dioxide exosphere", tidalLock: "synchronous with Saturn", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling and magnetospheric particle interaction", geology: "Cratered water-ice surface with bright tectonic fractures" },
  Titan: { designation: "Saturn VI", family: "Toxic", subtype: "Dense-atmosphere hydrocarbon world", radiusKm: 2574.76, massEarth: 0.0225, density: 1.881, gravityG: 0.138, escapeVelocity: 2.64, axialTilt: 0.3, rotationHours: 382.7, orbitalPeriodDays: 15.945, orbitalDistance: 1221870, orbitalDistanceUnit: "km", eccentricity: 0.0288, inclination: 0.33, meanTemperatureK: 94, minimumTemperatureK: 90, maximumTemperatureK: 95, pressureBar: 1.467, atmosphere: [["Nitrogen", 95], ["Methane", 5]], atmosphereLabel: "Dense nitrogen-methane atmosphere", tidalLock: "synchronous with Saturn", lifePotential: "Complex organic chemistry and a possible water ocean; no confirmed life", climateLabel: "Cold methane-cycle climate", weatherLabel: "Methane clouds, rain, rivers, lakes, seas, seasonal storms, and organic haze", geology: "Water-ice crust, hydrocarbon dunes and seas, probable internal ocean, and possible cryovolcanism", estimatedFields: 3 },
  Iapetus: { designation: "Saturn VIII", family: "Ice", subtype: "Two-tone outer icy moon", radiusKm: 734.3, massEarth: 0.000302, density: 1.089, gravityG: 0.0228, escapeVelocity: 0.572, axialTilt: 15.47, rotationHours: 1903.9, orbitalPeriodDays: 79.3215, orbitalDistance: 3560820, orbitalDistanceUnit: "km", eccentricity: 0.0286, inclination: 15.47, meanTemperatureK: 100, minimumTemperatureK: 70, maximumTemperatureK: 130, pressureBar: 0, atmosphere: [], atmosphereLabel: "None", tidalLock: "synchronous with Saturn", climateLabel: "No conventional climate", weatherLabel: "Strong albedo-driven thermal contrast and micrometeorites", geology: "Two-tone ice-rock surface, giant impact basins, and prominent equatorial ridge" },
  Miranda: { designation: "Uranus V", family: "Ice", subtype: "Tectonically disrupted icy moon", radiusKm: 235.8, massEarth: 0.000011, density: 1.2, gravityG: 0.0081, escapeVelocity: 0.193, axialTilt: 0, rotationHours: 33.9, orbitalPeriodDays: 1.413, orbitalDistance: 129900, orbitalDistanceUnit: "km", eccentricity: 0.0013, inclination: 4.34, meanTemperatureK: 59, minimumTemperatureK: 40, maximumTemperatureK: 86, pressureBar: 0, atmosphere: [], atmosphereLabel: "None", tidalLock: "synchronous with Uranus", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling and charged-particle exposure", geology: "Patchwork coronae, cliffs, canyons, and ancient cratered terrain" },
  Ariel: { designation: "Uranus I", family: "Ice", subtype: "Bright tectonic icy moon", radiusKm: 578.9, massEarth: 0.000226, density: 1.592, gravityG: 0.0275, escapeVelocity: 0.559, axialTilt: 0, rotationHours: 60.49, orbitalPeriodDays: 2.52, orbitalDistance: 190900, orbitalDistanceUnit: "km", eccentricity: 0.0012, inclination: 0.26, meanTemperatureK: 58, minimumTemperatureK: 40, maximumTemperatureK: 84, pressureBar: 0, atmosphere: [], atmosphereLabel: "None", tidalLock: "synchronous with Uranus", lifePotential: "Past or residual internal liquid is possible; unconfirmed", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling and charged-particle exposure", geology: "Young-looking fault valleys, canyons, smooth plains, and possible cryovolcanic resurfacing", estimatedFields: 2 },
  Umbriel: { designation: "Uranus II", family: "Ice", subtype: "Dark ancient icy moon", radiusKm: 584.7, massEarth: 0.0002, density: 1.39, gravityG: 0.0234, escapeVelocity: 0.52, axialTilt: 0, rotationHours: 99.46, orbitalPeriodDays: 4.144, orbitalDistance: 266000, orbitalDistanceUnit: "km", eccentricity: 0.0039, inclination: 0.13, meanTemperatureK: 75, minimumTemperatureK: 50, maximumTemperatureK: 85, pressureBar: 0, atmosphere: [], atmosphereLabel: "None", tidalLock: "synchronous with Uranus", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling and charged-particle exposure", geology: "Dark heavily cratered ice-rock surface with limited evidence of recent activity" },
  Titania: { designation: "Uranus III", family: "Ice", subtype: "Large faulted icy moon", radiusKm: 788.9, massEarth: 0.00059, density: 1.711, gravityG: 0.0387, escapeVelocity: 0.773, axialTilt: 0, rotationHours: 208.9, orbitalPeriodDays: 8.706, orbitalDistance: 435900, orbitalDistanceUnit: "km", eccentricity: 0.0011, inclination: 0.34, meanTemperatureK: 70, minimumTemperatureK: 45, maximumTemperatureK: 89, pressureBar: 0, atmosphere: [["Carbon Dioxide", 100]], atmosphereLabel: "Possible extremely tenuous carbon-dioxide exosphere", tidalLock: "synchronous with Uranus", lifePotential: "A deep internal ocean is possible; no confirmed life", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling and seasonal solar geometry", geology: "Mixed cratered terrain, large faults, scarps, and possible internal ocean", estimatedFields: 3 },
  Oberon: { designation: "Uranus IV", family: "Ice", subtype: "Large outer cratered icy moon", radiusKm: 761.4, massEarth: 0.000505, density: 1.63, gravityG: 0.0354, escapeVelocity: 0.727, axialTilt: 0, rotationHours: 323.1, orbitalPeriodDays: 13.463, orbitalDistance: 583500, orbitalDistanceUnit: "km", eccentricity: 0.0014, inclination: 0.07, meanTemperatureK: 75, minimumTemperatureK: 45, maximumTemperatureK: 90, pressureBar: 0, atmosphere: [], atmosphereLabel: "None detected", tidalLock: "synchronous with Uranus", lifePotential: "A deep internal ocean is possible; no confirmed life", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling and seasonal solar geometry", geology: "Ancient cratered ice-rock surface with chasmata and possible internal ocean", estimatedFields: 2 },
  Triton: { designation: "Neptune I", family: "Ice", subtype: "Captured retrograde cryovolcanic moon", radiusKm: 1353.4, massEarth: 0.00359, density: 2.061, gravityG: 0.0794, escapeVelocity: 1.455, axialTilt: 157.3, rotationHours: -141.0, orbitalPeriodDays: -5.877, orbitalDistance: 354759, orbitalDistanceUnit: "km", eccentricity: 0.000016, inclination: 156.9, meanTemperatureK: 38, minimumTemperatureK: 35, maximumTemperatureK: 40, pressureBar: 0.000014, atmosphere: [["Nitrogen", 99], ["Methane", 1]], atmosphereLabel: "Thin nitrogen-methane atmosphere", tidalLock: "synchronous retrograde orbit", lifePotential: "A residual internal ocean is plausible; no confirmed life", climateLabel: "Nitrogen volatile-transport seasons", weatherLabel: "Nitrogen geysers, plume fallout, haze, frost migration, and long seasonal cycles", geology: "Young nitrogen-ice plains, cantaloupe terrain, geysers, cryovolcanism, and possible internal ocean", estimatedFields: 3 },
  Ceres: { designation: "1 Ceres", family: "Ice", subtype: "Inner-system dwarf planet", radiusKm: 469.7, massEarth: 0.000157, density: 2.162, gravityG: 0.029, escapeVelocity: 0.51, axialTilt: 4, rotationHours: 9.074, orbitalPeriodDays: 1681.6, orbitalDistance: 2.7675, eccentricity: 0.0758, inclination: 10.59, meanTemperatureK: 167, minimumTemperatureK: 110, maximumTemperatureK: 235, pressureBar: 0, atmosphere: [["Water", 100]], atmosphereLabel: "Transient water-vapor exosphere", tidalLock: "unlocked", lifePotential: "Past or present brines may offer microbial niches; unconfirmed", climateLabel: "Airless asteroid-belt thermal environment", weatherLabel: "Solar exposure, micrometeorites, and possible transient sublimation", geology: "Water-rich differentiated body with hydrated minerals, salts, bright deposits, and evidence for brines", estimatedFields: 3 },
  Pluto: { designation: "134340 Pluto", family: "Ice", subtype: "Kuiper Belt dwarf planet", radiusKm: 1188.3, massEarth: 0.00218, density: 1.854, gravityG: 0.063, escapeVelocity: 1.21, axialTilt: 122.53, rotationHours: -153.29, orbitalPeriodDays: 90560, orbitalDistance: 39.482, eccentricity: 0.2488, inclination: 17.16, meanTemperatureK: 44, minimumTemperatureK: 33, maximumTemperatureK: 55, pressureBar: 0.00001, atmosphere: [["Nitrogen", 98], ["Methane", 1.5], ["Carbon Monoxide", 0.5]], atmosphereLabel: "Seasonally variable nitrogen atmosphere with methane and carbon monoxide", tidalLock: "mutually locked with Charon", lifePotential: "A residual internal ocean is possible; no confirmed life", climateLabel: "Long volatile-transport seasons", weatherLabel: "Nitrogen frost transport, haze layers, atmospheric collapse/expansion cycles, and long seasons", geology: "Nitrogen glacier Sputnik Planitia, water-ice mountains, methane ice, haze deposits, and possible internal ocean", estimatedFields: 4 },
  Haumea: { designation: "136108 Haumea", family: "Ice", subtype: "Rapidly rotating elongated dwarf planet", radiusKm: 780, massEarth: 0.00067, density: 2.0, gravityG: 0.044, escapeVelocity: 0.84, axialTilt: 28, rotationHours: 3.915, orbitalPeriodDays: 103774, orbitalDistance: 43.13, eccentricity: 0.191, inclination: 28.2, meanTemperatureK: 50, minimumTemperatureK: 32, maximumTemperatureK: 55, pressureBar: 0, atmosphere: [], atmosphereLabel: "No confirmed atmosphere", tidalLock: "unlocked rapid rotation", ringSystem: "narrow ring", climateLabel: "Airless trans-Neptunian thermal environment", weatherLabel: "Solar exposure and micrometeorites", geology: "Elongated rapidly rotating water-ice-rich body; detailed geology unresolved", estimatedFields: 8 },
  Makemake: { designation: "136472 Makemake", family: "Ice", subtype: "Methane-bearing dwarf planet", radiusKm: 715, massEarth: 0.0005, density: 1.7, gravityG: 0.05, escapeVelocity: 0.8, axialTilt: 29, rotationHours: 22.83, orbitalPeriodDays: 112897, orbitalDistance: 45.79, eccentricity: 0.161, inclination: 29, meanTemperatureK: 40, minimumTemperatureK: 30, maximumTemperatureK: 45, pressureBar: 0, atmosphere: [], atmosphereLabel: "No global atmosphere detected; transient local sublimation remains possible", tidalLock: "unlocked", climateLabel: "Airless trans-Neptunian volatile cycle", weatherLabel: "Solar exposure, methane frost transport, and micrometeorites", geology: "Methane-, ethane-, and nitrogen-bearing icy surface; detailed geology unresolved", estimatedFields: 8 },
  Eris: { designation: "136199 Eris", family: "Ice", subtype: "Distant massive dwarf planet", radiusKm: 1163, massEarth: 0.00278, density: 2.43, gravityG: 0.082, escapeVelocity: 1.38, axialTilt: 78, rotationHours: 25.9, orbitalPeriodDays: 203830, orbitalDistance: 67.67, eccentricity: 0.44, inclination: 44.04, meanTemperatureK: 30, minimumTemperatureK: 20, maximumTemperatureK: 35, pressureBar: 0, atmosphere: [], atmosphereLabel: "No present global atmosphere; a frozen atmosphere may sublimate near perihelion", tidalLock: "unlocked", climateLabel: "Extreme long-period trans-Neptunian volatile cycle", weatherLabel: "Solar exposure, volatile frost migration, and micrometeorites", geology: "Bright methane-ice-rich surface; detailed geology unresolved", estimatedFields: 8 },
  Charon: { designation: "Pluto I", family: "Ice", subtype: "Large binary companion moon", radiusKm: 606, massEarth: 0.000266, density: 1.702, gravityG: 0.029, escapeVelocity: 0.59, axialTilt: 0, rotationHours: 153.29, orbitalPeriodDays: 6.387, orbitalDistance: 19591, orbitalDistanceUnit: "km", eccentricity: 0.0002, inclination: 0, meanTemperatureK: 53, minimumTemperatureK: 35, maximumTemperatureK: 60, pressureBar: 0, atmosphere: [], atmosphereLabel: "No confirmed atmosphere", tidalLock: "mutually locked with Pluto", lifePotential: "Past internal ocean and cryovolcanism are plausible; no confirmed life", climateLabel: "No conventional climate", weatherLabel: "Thermal cycling and micrometeorites", geology: "Water-ice crust, vast canyon systems, resurfaced plains, and possible ancient cryovolcanism", estimatedFields: 3 }
};

function scientificValue(value: number, unit: string, confidence = 0.97, estimated = false): ScientificValue {
  const digits = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 1 ? 3 : 6;
  return {
    value,
    unit,
    displayValue: `${value.toLocaleString("en-US", { maximumFractionDigits: digits })} ${unit}`.trim(),
    confidence,
    estimated,
    verified: !estimated
  };
}

function resourceId(name: string) {
  return ResourceService.resolveId(name);
}

function atmosphereComposition(entries: Array<[string, number]>) {
  const resolved = entries
    .map(([name, percentage]) => ({ resourceId: resourceId(name), percentage }))
    .filter((entry): entry is { resourceId: string; percentage: number } => Boolean(entry.resourceId));
  const total = resolved.reduce((sum, entry) => sum + entry.percentage, 0);
  if (!total) return [];
  return resolved.map((entry) => ({
    resourceId: entry.resourceId,
    percentage: Number(((entry.percentage / total) * 100).toFixed(4)),
    confidence: 0.9,
    notes: "Rounded canonical composition; trace constituents may be omitted."
  }));
}

function environmentRules(data: PlanetDeepData, factsForBody: SolBodyFacts): PlanetActiveEnvironmentRules {
  const conventionalWeather = factsForBody.pressureBar >= 0.001;
  return {
    eligibleWeatherProfileIds: [...data.weatherProfileIds],
    weatherWeights: Object.fromEntries(data.weatherProfileIds.map((id, index) => [id, Math.max(10, 100 - index * 20)])),
    durationRangesMinutes: Object.fromEntries(data.weatherProfileIds.map((id) => [id, conventionalWeather ? [30, 1440] : [10, 360]])),
    transitionRules: conventionalWeather
      ? ["Transitions must use the body's canonical climate and seasonal modifiers.", "Unity owns active weather state."]
      : ["Use environmental events instead of Earth-like weather.", "Unity owns active environmental state."],
    seasonalModifiers: { canonical_cycle: factsForBody.axialTilt },
    regionalModifiers: {},
    hazardModifiers: {},
    simulationSeedInputs: ["planet.seed", "planet.id", "weatherProfileId", "seasonPhase", "timeBucket"],
    conventionalWeather,
    alternateStateLabel: conventionalWeather ? null : factsForBody.weatherLabel
  };
}

function completeness(factsForBody: SolBodyFacts): PlanetDataCompleteness {
  const estimated = factsForBody.estimatedFields ?? 0;
  const sections = ["identity", "classification", "orbital", "physical", "atmosphere", "climate", "weather", "seasons", "hydrosphere", "geology", "biomes", "resources", "life", "hazards", "habitability", "civilization", "history", "presentation", "validation", "runtimeExport"];
  const sectionCompletion = Object.fromEntries(sections.map((section) => [section, section === "civilization" && !factsForBody.confirmedLife ? 70 : estimated > 5 && ["geology", "atmosphere", "climate"].includes(section) ? 75 : 100]));
  const overallPercentage = Math.round(Object.values(sectionCompletion).reduce((sum, value) => sum + value, 0) / sections.length);
  return {
    sectionCompletion,
    overallPercentage,
    verifiedFieldCount: 42 - estimated,
    estimatedFieldCount: estimated,
    missingRequiredFieldCount: 0,
    scientificWarningCount: estimated ? 1 : 0,
    gameplayWarningCount: 0
  };
}

export function isCanonicalSolPlanet(planet: Pick<GeneratedPlanet, "id" | "seed">) {
  return planet.id.startsWith("fixed-sol-") || planet.seed.startsWith("PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble:sol");
}

export function applyCanonicalSolDeepData(planet: GeneratedPlanet, generated: PlanetDeepData): PlanetDeepData {
  if (!isCanonicalSolPlanet(planet)) return generated;
  const bodyFacts = facts[planet.name];
  if (!bodyFacts) {
    const fallback = structuredClone(generated);
    fallback.knowledgeModes = {
      canonicalHumanKnowledgeEnabled: true,
      gameplayDiscoveryEnabled: true,
      testPresetStates: ["unknown", "detected", "probed", "scanned", "surveyed", "explored", "catalogued", "colonized"]
    };
    fallback.scientificSources = solScientificSources.filter((source) =>
      ["jpl_satellite_physical_parameters", "nasa_planetary_science", "noveris_sol_gameplay"].includes(source.sourceId)
    );
    fallback.sourceIdsBySection = {
      identity: ["nasa_planetary_science"],
      classification: ["nasa_planetary_science"],
      gameplayEstimates: ["noveris_sol_gameplay"]
    };
    fallback.dataCompleteness = {
      sectionCompletion: { identity: 100, classification: 100, orbital: 35, physical: 35, atmosphere: 35, resources: 35, presentation: 70 },
      overallPercentage: 47,
      verifiedFieldCount: 4,
      estimatedFieldCount: 38,
      missingRequiredFieldCount: 0,
      scientificWarningCount: 1,
      gameplayWarningCount: 1
    };
    fallback.resourceOccurrences = fallback.resourceOccurrences.map((occurrence) => ({
      ...occurrence,
      biomeAffinities: occurrence.biomeIds,
      geologicalAffinities: [],
      atmosphereAffinities: [],
      oceanAffinities: [],
      scientificSourceIds: ["jpl_satellite_physical_parameters", "nasa_planetary_science"],
      sourceNote: "Canonical presence only; this partial minor-body profile does not assert a measured reserve quantity.",
      estimatedReserves: 0,
      reserveUnit: "not quantified",
      depositCountEstimate: 0
    }));
    fallback.life.estimatedSpeciesCount = 0;
    fallback.life.discoveredSpeciesCount = 0;
    fallback.life.biodiversityIndex = 0;
    fallback.life.ecologicalStability = 0;
    fallback.life.foodWebComplexity = 0;
    fallback.speciesOccurrences = [];
    fallback.habitability.explanation.push("Minor Sol body profile remains partially estimated and is not presented as a complete scientific reference.");
    return fallback;
  }

  const estimated = (bodyFacts.estimatedFields ?? 0) > 0;
  const confidence = estimated ? 0.78 : 0.97;
  const sourceIds = bodyFacts.sourceIds ?? [
    bodyFacts.orbitalDistanceUnit === "km" ? "jpl_satellite_physical_parameters" : "jpl_planetary_physical_parameters",
    bodyFacts.family === "Ice" && bodyFacts.orbitalDistanceUnit !== "km" ? "nasa_dwarf_planets" : "nasa_planetary_science"
  ];
  const sourceNote = estimated
    ? "Scientific values include model-dependent or incompletely observed fields; see source metadata and confidence."
    : "Rounded from authoritative NASA/JPL reference values for canonical display.";

  const next = structuredClone(generated);
  next.identity.scientificDesignation = bodyFacts.designation;
  next.identity.originalName = planet.name;
  next.identity.discoveryName = planet.name;
  next.identity.generationVersion = generated.generationVersion;
  next.classification.family = bodyFacts.family;
  next.classification.subclassName = bodyFacts.subtype;
  next.classification.tags = [...new Set([...next.classification.tags, "Sol System", "authoritative override", bodyFacts.lifePotential ? "life potential" : "no confirmed native life"])];
  next.orbital.radius = scientificValue(bodyFacts.radiusKm, "km", confidence, estimated);
  next.orbital.diameter = scientificValue(bodyFacts.radiusKm * 2, "km", confidence, estimated);
  next.orbital.circumference = scientificValue(2 * Math.PI * bodyFacts.radiusKm, "km", confidence, estimated);
  next.orbital.mass = scientificValue(bodyFacts.massEarth, "Earth masses", confidence, estimated);
  next.orbital.density = scientificValue(bodyFacts.density, "g/cm3", confidence, estimated);
  next.orbital.volume = scientificValue((4 / 3) * Math.PI * bodyFacts.radiusKm ** 3, "km3", confidence, estimated);
  next.orbital.surfaceArea = scientificValue(4 * Math.PI * bodyFacts.radiusKm ** 2, "km2", confidence, estimated);
  next.orbital.gravity = scientificValue(bodyFacts.gravityG, "g", confidence, estimated);
  next.orbital.escapeVelocity = scientificValue(bodyFacts.escapeVelocity, "km/s", confidence, estimated);
  next.orbital.axialTilt = scientificValue(bodyFacts.axialTilt, "deg", confidence, estimated);
  next.orbital.rotationPeriod = scientificValue(bodyFacts.rotationHours, "hours", confidence, estimated);
  next.orbital.dayLength = scientificValue(Math.abs(bodyFacts.rotationHours), "hours", confidence, estimated);
  next.orbital.orbitalPeriod = scientificValue(bodyFacts.orbitalPeriodDays, "days", confidence, estimated);
  next.orbital.yearLength = scientificValue(Math.abs(bodyFacts.orbitalPeriodDays), "days", confidence, estimated);
  next.orbital.orbitalDistance = scientificValue(bodyFacts.orbitalDistance, bodyFacts.orbitalDistanceUnit ?? "AU", confidence, estimated);
  next.orbital.eccentricity = scientificValue(bodyFacts.eccentricity, "ratio", confidence, estimated);
  next.orbital.inclination = scientificValue(bodyFacts.inclination, "deg", confidence, estimated);
  next.orbital.tidalLockState = bodyFacts.tidalLock;
  next.orbital.planetAge = scientificValue(4.568, "Gyr", 0.98, false);
  next.orbital.ringSystem = bodyFacts.ringSystem ?? next.orbital.ringSystem;
  next.physical.internalStructure = bodyFacts.geology;
  next.atmosphere.atmospherePresent = bodyFacts.pressureBar > 0 || bodyFacts.atmosphere.length > 0;
  next.atmosphere.atmosphereType = bodyFacts.atmosphereLabel;
  next.atmosphere.surfacePressure = scientificValue(bodyFacts.pressureBar, "bar", confidence, estimated);
  next.atmosphere.composition = atmosphereComposition(bodyFacts.atmosphere);
  next.climate.climateClassification = bodyFacts.climateLabel;
  next.climate.averageGlobalTemperature = scientificValue(bodyFacts.meanTemperatureK, "K", confidence, estimated);
  next.climate.minimumTemperature = scientificValue(bodyFacts.minimumTemperatureK, "K", confidence, estimated);
  next.climate.maximumTemperature = scientificValue(bodyFacts.maximumTemperatureK, "K", confidence, estimated);
  next.climate.climateTrend = planet.name === "Earth" ? "long-term warming with natural variability" : "canonical orbital and volatile cycle";
  next.geology.coreType = bodyFacts.geology;
  next.life.estimatedSpeciesCount = bodyFacts.confirmedLife ? Math.max(next.life.estimatedSpeciesCount, 8_700_000) : 0;
  next.life.discoveredSpeciesCount = bodyFacts.confirmedLife ? Math.max(next.life.discoveredSpeciesCount, 2_100_000) : 0;
  next.life.biodiversityIndex = bodyFacts.confirmedLife ? 100 : 0;
  next.life.ecologicalStability = bodyFacts.confirmedLife ? 62 : 0;
  next.life.foodWebComplexity = bodyFacts.confirmedLife ? 100 : 0;
  next.speciesOccurrences = bodyFacts.confirmedLife ? next.speciesOccurrences : [];
  next.habitability.explanation = [
    ...next.habitability.explanation,
    bodyFacts.lifePotential ?? (bodyFacts.confirmedLife ? "Earth is the only confirmed naturally inhabited Sol world." : "No confirmed native life."),
    sourceNote
  ];
  next.resourceOccurrences = next.resourceOccurrences.map((occurrence) => ({
    ...occurrence,
    biomeAffinities: occurrence.biomeIds,
    geologicalAffinities: [bodyFacts.geology],
    atmosphereAffinities: occurrence.sourceCategory === "atmospheric" ? [bodyFacts.atmosphereLabel] : [],
    oceanAffinities: occurrence.sourceCategory === "oceanic" ? [bodyFacts.lifePotential ?? bodyFacts.climateLabel] : [],
    scientificSourceIds: sourceIds,
    sourceNote,
    estimatedReserves: 0,
    reserveUnit: "not quantified",
    depositCountEstimate: 0,
    notes: `${occurrence.notes}${occurrence.notes ? " " : ""}Presence is canonical; reserves are not asserted where no defensible estimate exists.`
  }));
  next.history.summary = `${planet.story} ${bodyFacts.geology}.`;
  next.presentation.summary = `${planet.name}: ${bodyFacts.subtype}. ${bodyFacts.climateLabel}. ${bodyFacts.weatherLabel}.`;
  next.presentation.highlightMetricIds = ["orbital.radius", "orbital.gravity", "climate.averageGlobalTemperature", "habitability.overall"];
  next.simulationRules.profileVersion = SOL_SYSTEM_DATA_VERSION;
  next.knowledgeModes = {
    canonicalHumanKnowledgeEnabled: true,
    gameplayDiscoveryEnabled: true,
    testPresetStates: ["unknown", "detected", "probed", "scanned", "surveyed", "explored", "catalogued", "colonized"]
  };
  next.activeEnvironmentRules = environmentRules(next, bodyFacts);
  next.scientificSources = solScientificSources.filter((source) => sourceIds.includes(source.sourceId) || source.sourceId === "noveris_sol_gameplay");
  next.sourceIdsBySection = {
    identity: sourceIds,
    orbital: sourceIds,
    physical: sourceIds,
    atmosphere: sourceIds,
    climate: sourceIds,
    weather: sourceIds,
    geology: sourceIds,
    resources: sourceIds,
    life: sourceIds,
    habitability: ["noveris_sol_gameplay"],
    presentation: ["noveris_sol_gameplay"]
  };
  next.dataCompleteness = completeness(bodyFacts);
  next.overrides = {
    lockedSections: [
      "identity", "classification", "orbital", "physical", "atmosphere", "climate", "hydrosphere",
      "geology", "resourceOccurrences", "life", "habitability", "history", "activeEnvironmentRules",
      "scientificSources", "sourceIdsBySection", "dataCompleteness"
    ],
    lockedFields: [],
    values: {}
  };
  return next;
}

export const requiredCanonicalSolBodyNames = [
  "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
  "Ceres", "Pluto", "Haumea", "Makemake", "Eris", "Moon", "Phobos", "Deimos", "Io",
  "Europa", "Ganymede", "Callisto", "Mimas", "Enceladus", "Tethys", "Dione", "Rhea",
  "Titan", "Iapetus", "Miranda", "Ariel", "Umbriel", "Titania", "Oberon", "Triton", "Charon"
] as const;

export function solBodyFactsByName(name: string) {
  return facts[name] ?? null;
}

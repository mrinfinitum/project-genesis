import type { DiscoveryRecord } from "@/lib/discovery";

type AdditionGroup = { categoryId: string; classId: string; subclassId: string; names: string[] };

const groups: AdditionGroup[] = [
  { categoryId: "alien-technology", classId: "artificial-intelligence", subclassId: "cognitive-cores", names: [
    "Forgotten AI Terminal", "Dormant AI Core", "Damaged AI Core", "AI Memory Crystal", "Quantum Personality Matrix", "Neural Archive", "Explorer AI", "Medical AI", "Engineering AI", "Terraforming AI", "Research AI", "Civilization AI", "Orbital AI", "Deep Observatory AI"
  ] },
  { categoryId: "ruins-and-structures", classId: "laboratories", subclassId: "restricted-research-sites", names: [
    "Research Facility", "Observatory", "Orbital Station", "Factory", "Temple", "Vault", "Arcology", "Command Center", "Mining Facility", "AI Nexus"
  ] },
  { categoryId: "ruins-and-structures", classId: "settlements", subclassId: "abandoned-outposts", names: [
    "Destroyed Colony", "Ancient Battlefield", "Lost Capital", "Dead Megacity", "Orbital Dock", "Space Elevator", "Dyson Fragment"
  ] },
  { categoryId: "rare-collections-and-wonders", classId: "planetary-wonders", subclassId: "unknown-planetary-wonders", names: [
    "Crystal Forest", "Planetary Tree", "Floating Mountains", "Endless Volcano", "Living Ocean", "Black Ice Desert", "Infinite Canyon", "Planetary Ring Forest"
  ] },
  { categoryId: "geological", classId: "exotic-planetary-materials", subclassId: "unknown-geological-matter", names: [
    "Crystal Cavern", "Diamond Mountain", "Core Exposure", "Gravity Fault", "Magma Ocean", "Endless Glacier"
  ] },
  { categoryId: "rare-collections-and-wonders", classId: "living-relics", subclassId: "unknown-living-relics", names: [
    "World Tree", "Hive Queen", "Super Organism", "Planetary Coral Reef", "Living Fungus", "Intelligent Flora"
  ] },
  { categoryId: "ruins-and-structures", classId: "cities", subclassId: "planetary-capitals", names: [
    "Lost Colony", "Ancient Empire", "First Settlement", "First Capital", "Planetary Archive", "Military Fortress", "Planetary Library"
  ] }
];

groups.push(
  { categoryId: "fauna", classId: "terrestrial-creatures", subclassId: "small-terrestrial", names: [
    "Alien Mammals", "Crystal Life", "Energy Beings", "Floating Leviathans", "Hive Species", "Machine Species", "Plant Intelligence"
  ] },
  { categoryId: "anomalies", classId: "spatial-anomalies", subclassId: "micro-wormholes", names: [
    "Black Hole", "Wormhole", "Nebula", "Time Rift", "Dark Matter Storm", "Stellar Nursery", "Gravity Wave"
  ] },
  { categoryId: "ancient-relics", classId: "lost-knowledge", subclassId: "historical-chronicles", names: [
    "Star Maps", "Ancient Journals", "Lost Languages", "Civilization Records", "Planetary Logs", "AI Records"
  ] }
);

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function profile(id: string) {
  return {
    icon: `discovery_${id}_icon`, inventoryThumbnail: `discovery_${id}_thumbnail`, card: `discovery_${id}_card`, hero: `discovery_${id}_hero`,
    detailIllustration: `discovery_${id}_detail`, worldRender: `discovery_${id}_world`, discoveryAnimation: `discovery_${id}_discover`,
    scanAnimation: `discovery_${id}_scan`, sound: `discovery_${id}_sound`, narration: `discovery_${id}_narration`, video: `discovery_${id}_video`, variants: []
  };
}

export const resourceTaxonomyDiscoveryAdditions: DiscoveryRecord[] = groups.flatMap((group) => group.names.map((name) => {
  const recordSlug = slug(name);
  const id = `DISC-RESOURCE-V3-${recordSlug.toUpperCase()}`;
  return {
    id, slug: recordSlug, volumeId: "resource-taxonomy-v3", volumeName: "Resource Taxonomy v3 Discoveries", displayName: name,
    categoryId: group.categoryId, classId: group.classId, subclassId: group.subclassId, subcategoryId: group.subclassId,
    scientificName: "Classification pending", description: `${name} is a canonical discovery for scanning, research, preservation, and Codex attribution.`,
    lore: "Added during the Resource versus Discovery separation audit. This record is not a stackable economic resource.", rarity: "rare",
    spawnWeight: 0.005, discoveryXp: 100, creditsValue: 0, researchValue: 150, tradeValue: 0, unlocks: [],
    relatedResearchIds: ["planet_scan"], relatedBuildingIds: [], relatedResourceIds: [], relatedPlanetIds: [], relatedCivilizationIds: [], relatedLifeformIds: [],
    requiredEquipmentIds: ["survey_scanner_advanced"], requiredScanLevel: 2, spawnRules: { requiredResearchIds: ["planet_scan"] },
    assetProfile: profile(recordSlug), publicationStatus: "published", canonicalVersion: "resource-taxonomy-v3.0", tags: ["resource-separation", "canonical-discovery"]
  };
}));

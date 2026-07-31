import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "source-masters", "production", "visual-engine", "species-plates");
const folders = ["templates/SPECIES_PLATE_MASTER_V1/preview", "creatures", "plants", "fungi", "microorganisms", "exotic-life", "comparative", "ecosystem", "approved", "rejected", "manifests"];
await Promise.all(folders.map((folder) => mkdir(path.join(root, folder), { recursive: true })));
await writeFile(path.join(root, "templates", "SPECIES_PLATE_MASTER_V1", "README.md"), "# SPECIES_PLATE_MASTER_V1\n\nLocal canonical source-master workspace. Private PSDs and review artifacts stay here; runtime consumes only sanitized approved references.\n", "utf8");
console.log(`Species plate source-master workspace ready: ${root}`);

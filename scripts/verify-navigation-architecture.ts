import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function appRouteExists(href: string) {
  const pathname = href.split("?")[0].split("#")[0];
  if (pathname === "/") return existsSync(path.join(process.cwd(), "app/page.tsx"));
  const segments = pathname.replace(/^\//, "").split("/");

  function walk(directory: string, index: number): boolean {
    if (index >= segments.length) {
      return existsSync(path.join(directory, "page.tsx"));
    }

    const literal = path.join(directory, segments[index]);
    if (existsSync(literal) && walk(literal, index + 1)) {
      return true;
    }

    if (!existsSync(directory)) {
      return false;
    }

    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("[") && entry.name.endsWith("]"))
      .some((entry) => walk(path.join(directory, entry.name), index + 1));
  }

  return walk(path.join(process.cwd(), "app"), 0);
}

function section(text: string, start: string, end: string) {
  const startIndex = text.indexOf(start);
  assert(startIndex >= 0, `Missing section start ${start}.`);
  const endIndex = text.indexOf(end, startIndex);
  assert(endIndex >= 0, `Missing section end ${end}.`);
  return text.slice(startIndex, endIndex);
}

function labelsFor(groupSource: string) {
  return [...groupSource.matchAll(/label: "([^"]+)"/g)].map((match) => match[1]).slice(1);
}

function hrefsFor(groupSource: string) {
  return [...groupSource.matchAll(/href: "([^"]+)"/g)].map((match) => match[1]);
}

async function main() {
  const appShell = read("components/app-shell.tsx");
  const navigationSource = section(appShell, "const navigationGroups", "function hrefPath");
  const expectedGroups = [
    { id: "command-center", label: "Command Center", items: ["Dashboard", "Current Sprint"] },
    { id: "content-libraries", label: "Content Libraries", items: ["Asset Library", "Galaxy Library", "Sector Library", "Star System Library", "Star Library", "Planet Library", "Discovery Library", "Civilization Library", "Encyclopedia"] },
    { id: "civilization", label: "Civilization", items: ["Building Library", "Research Library", "Resource Catalog", "Population", "Colonies", "Districts", "AI Agents", "Era Starter Kits"] },
    { id: "experience-design", label: "Experience Design", items: ["Dashboard", "Experience Bible", "Inspiration Wall", "Concept Library", "Screen Library", "Design Tokens", "Material Library", "Motion Library", "Component Library", "Interaction Patterns", "Theme Library", "Brand System", "Accessibility", "Experience Journey", "Reviews"] },
    { id: "world-systems", label: "World Systems", items: ["Actions", "Economy & Trade", "Missions", "Dynamic Events"] },
    { id: "runtime-verification", label: "Runtime & Verification", items: ["Runtime", "Content Releases", "Exports", "Verification", "Architecture"] }
  ];

  let cursor = -1;
  for (const group of expectedGroups) {
    const marker = `id: "${group.id}"`;
    const index = navigationSource.indexOf(marker);
    assert(index > cursor, `${group.label} must appear in the requested order.`);
    cursor = index;
    const groupEnd = expectedGroups.find((candidate) => navigationSource.indexOf(`id: "${candidate.id}"`, index + 1) > index);
    const endIndex = groupEnd ? navigationSource.indexOf(`id: "${groupEnd.id}"`, index + 1) : navigationSource.length;
    const groupSource = navigationSource.slice(index, endIndex);
    assert(groupSource.includes(`label: "${group.label}"`), `${group.id} label must be ${group.label}.`);
    const actualLabels = labelsFor(groupSource);
    assert(JSON.stringify(actualLabels) === JSON.stringify(group.items), `${group.label} items mismatch: ${actualLabels.join(", ")}`);
  }

  assert(!navigationSource.includes('label: "Creative Production"'), "Creative Production must not be a primary navigation item.");
  assert(!navigationSource.includes('id: "authoring"'), "Top-level Authoring group must be removed.");
  assert(!navigationSource.includes('label: "Authoring"'), "Top-level Authoring label must be removed.");
  assert(!navigationSource.includes('id: "creative"'), "Old Creative group must be removed.");
  assert(!navigationSource.includes('id: "engine"'), "Old Engine & Validation group must be removed.");
  assert(!navigationSource.includes('id: "resources"'), "Old Resources group must be removed.");
  assert(!navigationSource.includes('id: "developer"'), "Old Developer group must be removed.");
  assert(!navigationSource.includes('href: "/creative-production'), "Primary nav must not link to Creative Production.");

  const allHrefs = [...navigationSource.matchAll(/href: "([^"]+)"/g)].map((match) => match[1]).filter((href) => !href.startsWith("#"));
  const duplicateHrefs = allHrefs.filter((href, index) => allHrefs.indexOf(href) !== index);
  assert(duplicateHrefs.length === 0, `Navigation contains duplicate hrefs: ${duplicateHrefs.join(", ")}`);
  for (const href of allHrefs) {
    assert(appRouteExists(href), `Navigation link does not resolve to an app route: ${href}`);
  }

  assert(appShell.includes("STORAGE_SECTIONS_KEY"), "Navigation must persist collapse state.");
  assert(appShell.includes("window.localStorage.setItem(STORAGE_SECTIONS_KEY"), "Navigation must remember collapse state between page changes.");
  assert(appShell.includes('uniqueSections(["command-center", activeGroup?.id])'), "Navigation must expand active section by default.");
  assert(appShell.includes("hrefSearch"), "Navigation must preserve query-aware active behavior.");

  for (const route of ["app/actions/page.tsx", "app/population/page.tsx", "app/dynamic-events/page.tsx", "app/runtime/page.tsx", "app/exports/page.tsx", "app/era-starter-kits/page.tsx", "app/content-releases/page.tsx", "app/validation-engine/page.tsx"]) {
    assert(existsSync(path.join(process.cwd(), route)), `New navigation route missing: ${route}`);
  }
  assert(existsSync(path.join(process.cwd(), "app/experience-design/page.tsx")), "Experience Design dashboard route missing.");
  assert(existsSync(path.join(process.cwd(), "app/experience-design/[section]/page.tsx")), "Experience Design section route missing.");
  assert(read("app/exports/page.tsx").includes('redirect("/game-engine-exports")'), "/exports must redirect to the existing exports workspace.");
  assert(read("app/content-authoring/page.tsx").includes('redirect("/era-starter-kits")'), "/content-authoring must redirect to Era Starter Kits.");
  assert(read("app/creative-production/page.tsx").includes("redirect("), "Creative Production route must remain a safe redirect.");
  assert(read("app/creative-production/[...path]/page.tsx").includes("redirect("), "Creative Production deep links must remain safe redirects.");

  console.log(JSON.stringify({
    ok: true,
    groups: Object.fromEntries(expectedGroups.map((group) => [group.label, group.items])),
    routeCount: allHrefs.length,
    redirects: {
      creativeProduction: "/assets?deprecated=creative-production",
      contentAuthoring: "/era-starter-kits",
      exports: "/game-engine-exports"
    },
    collapseState: "remembered",
    duplicateNavigationEntries: 0
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

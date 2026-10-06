import {
  indexSchema,
  personSchema,
  portfolioSchema,
  projectPatchSchema,
  projectSchema,
  siteSchema,
  techSchema,
  techsSchema,
  type Person,
  type Portfolio,
  type Project,
  type SiteCopy,
  type Tech,
} from "./schema";
import { type Change, MissingFile, publicRoot, source } from "./source";
import { orderStack } from "./stack-order";

export { publicRoot };

let writeQueue: Promise<unknown> = Promise.resolve();

// Repo-relative paths: the same on disk and in the GitHub repo
const personPath = "content/person.json";
const sitePath = "content/site.json";
const indexPath = "content/index.json";
const techsPath = "content/techs.json";
const projectFile = (id: string) => `content/projects/${id}.json`;

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

async function read(file: string) {
  try {
    return await source().read(file);
  } catch (reason) {
    if (reason instanceof MissingFile) throw new ContentError("not_found", `${file} is missing`);
    throw reason;
  }
}

async function locked<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readPortfolio(): Promise<Portfolio & { lead: number }> {
  const [personRaw, siteRaw, indexRaw, techs] = await Promise.all([
    read(personPath),
    read(sitePath),
    read(indexPath),
    readTechs(),
  ]);
  const index = indexSchema.parse(JSON.parse(indexRaw));
  const projects = await Promise.all(
    index.projectIds.map(async (id) => {
      const project = projectSchema.parse(JSON.parse(await read(projectFile(id))));
      if (project.id !== id) {
        throw new ContentError(
          "validation",
          `content/projects/${id}.json has id \"${project.id}\"`,
        );
      }
      // Every reader sees one technology order, however the file lists it
      return { ...project, stack: orderStack(project.stack, techs) };
    }),
  );
  return {
    ...portfolioSchema.parse({
      person: personSchema.parse(JSON.parse(personRaw)),
      site: siteSchema.parse(JSON.parse(siteRaw)),
      projects,
      updatedAt: index.updatedAt,
    }),
    lead: index.lead,
  };
}

export async function readTechs(): Promise<Tech[]> {
  const raw = await read(techsPath);
  return techsSchema.parse(JSON.parse(raw));
}

export function publishedProjects(portfolio: Portfolio): Project[] {
  return portfolio.projects.filter((project) => project.status === "published");
}

export function publicPortfolio(portfolio: Portfolio) {
  return {
    person: portfolio.person,
    site: portfolio.site,
    projects: publishedProjects(portfolio),
    updatedAt: portfolio.updatedAt,
  };
}

/** Commit message for a set of changes, e.g. "content: update projects/sona, index". */
function describe(changes: Change[]) {
  const names = changes.map((change) =>
    `${change.remove ? "remove " : ""}${change.path.replace(/^content\//, "").replace(/\.json$/, "")}`,
  );
  return `content: update ${names.join(", ")}`;
}

function sameJson(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function savePortfolio(portfolio: Portfolio & { lead?: number }) {
  const next = portfolioSchema.parse({
    person: portfolio.person,
    site: portfolio.site,
    projects: portfolio.projects,
    updatedAt: new Date().toISOString(),
  });
  const previous = await readPortfolio();
  const changes: Change[] = [];
  if (!sameJson(previous.person, next.person)) changes.push({ path: personPath, text: json(next.person) });
  if (!sameJson(previous.site, next.site)) changes.push({ path: sitePath, text: json(next.site) });
  const previousById = new Map(previous.projects.map((project) => [project.id, project]));
  for (const project of next.projects) {
    if (!sameJson(previousById.get(project.id), project)) {
      changes.push({ path: projectFile(project.id), text: json(project) });
    }
  }
  const nextIds = next.projects.map((project) => project.id);
  const lead = portfolio.lead ?? previous.lead;
  const orderChanged = !sameJson(previous.projects.map((project) => project.id), nextIds);
  const contentChanged = changes.length > 0;
  if (orderChanged || lead !== previous.lead || contentChanged) {
    changes.push({ path: indexPath, text: json({ updatedAt: next.updatedAt, lead, projectIds: nextIds }) });
  }
  const kept = new Set(nextIds);
  for (const project of previous.projects) {
    if (!kept.has(project.id)) changes.push({ path: projectFile(project.id), remove: true });
  }
  await source().commit(changes, describe(changes));
  const saved = changes.length > 0 ? next : { ...next, updatedAt: previous.updatedAt };
  return { ...saved, lead };
}

export function updatePortfolio(
  mutate: (draft: Portfolio & { lead: number }) => void,
): Promise<Portfolio & { lead: number }> {
  return locked(async () => {
    const draft = await readPortfolio();
    mutate(draft);
    return savePortfolio(draft);
  });
}

export function replacePerson(person: Person) {
  return updatePortfolio((draft) => {
    draft.person = person;
  });
}

export function replaceSite(site: SiteCopy) {
  return updatePortfolio((draft) => {
    draft.site = site;
  });
}

async function assertStack(ids: string[]) {
  const known = new Set((await readTechs()).map((tech) => tech.id));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length > 0) {
    throw new ContentError(
      "validation",
      `Unknown technology ids: ${missing.join(", ")}. Read content/techs.json`,
    );
  }
}

export async function createProject(input: unknown) {
  const project = projectSchema.parse(input);
  await assertStack(project.stack);
  return updatePortfolio((draft) => {
    if (draft.projects.some((item) => item.id === project.id)) {
      throw new ContentError("conflict", `Project \"${project.id}\" already exists`);
    }
    draft.projects.push(project);
  });
}

export async function patchProject(id: string, input: unknown) {
  const patch = projectPatchSchema.parse(input);
  if (patch.stack) await assertStack(patch.stack);
  return updatePortfolio((draft) => {
    const index = draft.projects.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ContentError("not_found", `Project \"${id}\" was not found`);
    }
    draft.projects[index] = projectSchema.parse({
      ...draft.projects[index],
      ...patch,
    });
  });
}

export function archiveProject(id: string) {
  return patchProject(id, { status: "archived" });
}

export function reorderProjects(ids: string[], lead?: number) {
  if (lead !== undefined && !indexSchema.shape.lead.safeParse(lead).success) {
    throw new ContentError("validation", "lead must be an integer from 1 to 12");
  }
  return updatePortfolio((draft) => {
    const current = draft.projects.map((project) => project.id);
    const same =
      ids.length === current.length &&
      new Set(ids).size === ids.length &&
      ids.every((id) => current.includes(id));
    if (!same) {
      throw new ContentError(
        "validation",
        "Order must list each project id exactly once",
      );
    }
    const byId = new Map(draft.projects.map((project) => [project.id, project]));
    draft.projects = ids.map((id) => byId.get(id)!);
    if (lead !== undefined) draft.lead = lead;
  });
}

async function assertTechsInUse(kept: Tech[]) {
  const known = new Set(kept.map((tech) => tech.id));
  const { projects } = await readPortfolio();
  const orphaned = projects.flatMap((project) =>
    project.stack.filter((id) => !known.has(id)).map((id) => `${id} (${project.id})`),
  );
  if (orphaned.length > 0) {
    throw new ContentError(
      "conflict",
      `Projects still use these technologies: ${orphaned.join(", ")}`,
    );
  }
}

export function replaceTechs(techs: Tech[]) {
  return locked(async () => {
    const parsed = techsSchema.parse(techs);
    await assertTechsInUse(parsed);
    await source().commit([{ path: techsPath, text: json(parsed) }], "content: update techs");
    return parsed;
  });
}

export function upsertTech(input: unknown) {
  const tech = techSchema.parse(input);
  return locked(async () => {
    const techs = await readTechs();
    const index = techs.findIndex((item) => item.id === tech.id);
    if (index === -1) techs.push(tech);
    else techs[index] = tech;
    const parsed = techsSchema.parse(techs);
    await source().commit([{ path: techsPath, text: json(parsed) }], `content: update tech ${tech.id}`);
    return tech;
  });
}

export function removeTech(id: string) {
  return locked(async () => {
    const techs = await readTechs();
    const next = techs.filter((tech) => tech.id !== id);
    if (next.length === techs.length) {
      throw new ContentError("not_found", `Tech \"${id}\" was not found`);
    }
    await assertTechsInUse(next);
    await source().commit([{ path: techsPath, text: json(next) }], `content: remove tech ${id}`);
    return next;
  });
}

export class ContentError extends Error {
  constructor(
    readonly code: "not_found" | "conflict" | "validation",
    message: string,
  ) {
    super(message);
  }
}

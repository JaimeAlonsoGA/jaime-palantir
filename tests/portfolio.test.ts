import assert from "node:assert/strict";
import { mkdtemp, cp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { authorize } from "../lib/api/auth";
import { siteGraph } from "../lib/seo";
import { projectSchema } from "../lib/content/schema";
import {
  archiveProject,
  createProject,
  publishedProjects,
  readPortfolio,
  readTechs,
  removeTech,
  reorderProjects,
} from "../lib/content/store";

const repoContent = path.join(import.meta.dirname, "..", "content");

test("shipped content matches the schema and stays published", async () => {
  process.env.CONTENT_ROOT = repoContent;
  const portfolio = await readPortfolio();
  const techs = await readTechs();
  const sona = JSON.parse(await readFile(path.join(repoContent, "projects", "sona.json"), "utf8"));
  assert.equal(sona.id, "sona");
  assert.equal(portfolio.projects.length, 15);
  assert.equal(publishedProjects(portfolio).length, 15);
  assert.equal(portfolio.person.name, "Jaime Alonso");
  assert.equal(portfolio.person.role, "Software Developer");
  assert.deepEqual(
    portfolio.person.experience.map((job) => job.company),
    ["Welloop AB", "MIRTO"],
  );
  assert.equal(portfolio.person.skills.length, 3);
  assert.ok(sona.stack.includes("react"));
  assert.equal(sona.body, undefined);
  assert.equal(sona.topics, undefined);
  assert.ok(techs.some((tech) => tech.id === "react"));
});

test("agents can create, archive, and reorder without touching other projects", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "portfolio-"));
  await cp(repoContent, directory, { recursive: true });
  process.env.CONTENT_ROOT = directory;
  try {
    const sonaBefore = await readFile(path.join(directory, "projects", "sona.json"), "utf8");
    const created = await createProject({
      id: "agent-note",
      title: "Agent note",
      summary: "A draft only an owner agent should see.",
      stack: ["typescript"],
      links: [],
      media: { images: ["/images/sona/frame1.webp"], video: null },
      status: "draft",
    });
    assert.equal(publishedProjects(created).length, 15);
    assert.equal(created.projects.at(-1)?.id, "agent-note");
    assert.equal(
      await readFile(path.join(directory, "projects", "sona.json"), "utf8"),
      sonaBefore,
    );

    const archived = await archiveProject("agent-note");
    assert.equal(
      archived.projects.find((project) => project.id === "agent-note")?.status,
      "archived",
    );

    const ids = archived.projects.map((project) => project.id).reverse();
    const reordered = await reorderProjects(ids, 3);
    assert.deepEqual(
      reordered.projects.map((project) => project.id),
      ids,
    );
    assert.equal(reordered.lead, 3);
    const index = JSON.parse(await readFile(path.join(directory, "index.json"), "utf8"));
    assert.equal(index.lead, 3);
    assert.deepEqual(index.projectIds, ids);
  } finally {
    process.env.CONTENT_ROOT = repoContent;
    await rm(directory, { recursive: true, force: true });
  }
});

test("project writes reject a bad slug", () => {
  const parsed = projectSchema.safeParse({
    id: "Bad Slug",
    title: "Nope",
    summary: "Nope",
    stack: [],
    links: [],
    media: { images: ["/a.webp"], video: null },
  });
  assert.equal(parsed.success, false);
});

test("the API is private and fails closed", () => {
  const request = (authorization?: string) =>
    new Request("http://localhost/api/v1/portfolio", authorization ? { headers: { authorization } } : {});

  delete process.env.PORTFOLIO_API_TOKEN;
  assert.equal(authorize(request("Bearer anything"))?.status, 503);

  process.env.PORTFOLIO_API_TOKEN = "local-secret";
  assert.equal(authorize(request())?.status, 401);
  assert.equal(authorize(request("Bearer other"))?.status, 401);
  assert.equal(authorize(request("Bearer local-secret-and-more"))?.status, 401);
  assert.equal(authorize(request("Bearer local-secret")), null);
  delete process.env.PORTFOLIO_API_TOKEN;
});

test("reserved slug and in-use technologies are rejected", async () => {
  const reserved = projectSchema.safeParse({
    id: "order",
    title: "Nope",
    summary: "Nope",
    stack: [],
    links: [],
    media: { images: ["/a.webp"], video: null },
  });
  assert.equal(reserved.success, false);

  const directory = await mkdtemp(path.join(tmpdir(), "portfolio-"));
  try {
    await cp(repoContent, directory, { recursive: true });
    process.env.CONTENT_ROOT = directory;
    await assert.rejects(() => removeTech("react"), /still use/);
    assert.ok((await readTechs()).some((tech) => tech.id === "react"));
  } finally {
    process.env.CONTENT_ROOT = repoContent;
    await rm(directory, { recursive: true, force: true });
  }
});

test("structured data names the person and links their profiles", async () => {
  process.env.CONTENT_ROOT = repoContent;
  const portfolio = await readPortfolio();
  const graph = siteGraph(portfolio);
  const person = graph["@graph"][0] as { name: string; jobTitle: string; sameAs: string[] };
  assert.equal(person.name, portfolio.person.fullName);
  assert.equal(person.jobTitle, "Software Developer");
  assert.ok(person.sameAs.some((url) => url.includes("github.com")));
});

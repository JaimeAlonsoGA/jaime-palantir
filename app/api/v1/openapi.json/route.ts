import { json } from "@/lib/api/http";

export const dynamic = "force-dynamic";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "jaimealonso",
    version: "1.0.0",
    description: "Owner API for jaimealonso.dev. Every route except GET /api/v1 and this spec needs the bearer token. In production each write is a commit to main, live after the deploy (~1 min). `?include=all` adds drafts and archived projects.",
  },
  security: [{ bearer: [] }],
  components: { securitySchemes: { bearer: { type: "http", scheme: "bearer" } } },
  servers: [{ url: "https://jaimealonso.dev" }],
  paths: {
    "/api/v1": { get: { summary: "Guide: auth, recipes and the project shape (public)", security: [] } },
    "/api/v1/portfolio": { get: { summary: "Profile, site copy, projects and technologies" } },
    "/api/v1/profile": { get: { summary: "Profile" }, put: { summary: "Replace content/person.json" } },
    "/api/v1/site": { get: { summary: "Site copy" }, put: { summary: "Replace content/site.json" } },
    "/api/v1/projects": { get: { summary: "Projects" }, post: { summary: "Create a project" } },
    "/api/v1/projects/{id}": {
      get: { summary: "One project" },
      patch: { summary: "Update fields of a project" },
      delete: { summary: "Archive a project (it stays in its file)" },
    },
    "/api/v1/projects/order": { put: { summary: "Set the order: { ids: [...], lead?: number }. ids lists every project id once. lead is how many of the first published projects are featured." } },
    "/api/v1/techs": { get: { summary: "Technology catalog" }, put: { summary: "Replace the catalog" } },
    "/api/v1/techs/{id}": { put: { summary: "Create or replace one technology" }, delete: { summary: "Remove one technology" } },
    "/api/v1/media": { post: { summary: "Upload an image (multipart field file); returns its /images path" } },
  },
};

export function GET() {
  return json(spec);
}

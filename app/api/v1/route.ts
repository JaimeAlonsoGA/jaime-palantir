import { json } from "@/lib/api/http";

export const dynamic = "force-dynamic";

// Public front door of the owner API: everything an agent needs to change the portfolio from one prompt.
const index = {
  name: "jaimealonso",
  what: "Owner API for jaimealonso.dev. Read and change every part of the portfolio: profile, CV, site copy, projects, technologies, order and images.",
  base: "https://jaimealonso.dev/api/v1",
  auth: "Every route except this one and /openapi.json needs `Authorization: Bearer <password>`. The password is the one Jaime gave you; it is never in the repo or on the site.",
  publishing:
    "In production a write is one commit to the main branch of github.com/JaimeAlonsoGA/jaimealonso; Vercel deploys it and the site shows it about a minute later. The response carries the commit in the X-Portfolio-Commit header. A 409 means the portfolio changed mid-request and nothing was written: send it again.",
  spec: "/api/v1/openapi.json",
  start: "GET /api/v1/portfolio?include=all returns the whole portfolio (drafts too) and the technology catalog. Read it before changing anything.",
  recipes: {
    addProject: [
      "POST /api/v1/media (multipart field `file`, webp/png/jpeg, max 8 MB) for each screenshot; keep each returned `path`. Prefer WebP, max 1920 px wide.",
      "GET /api/v1/techs: `stack` takes these ids only. Add a missing technology with PUT /api/v1/techs/{id} first.",
      "POST /api/v1/projects with the project (shape below).",
      "Optional: PUT /api/v1/projects/order with every id in order of importance; `lead` sets how many lead projects are featured.",
    ],
    editProject: "PATCH /api/v1/projects/{id} with only the fields that change.",
    removeProject: "DELETE /api/v1/projects/{id} archives it: it leaves the site, the file stays.",
    editProfileOrCv: "GET /api/v1/profile, change it, PUT /api/v1/profile with the whole object.",
    editSiteCopy: "GET /api/v1/site, change it, PUT /api/v1/site with the whole object.",
  },
  project: {
    id: "lowercase slug, also the file name: content/projects/<id>.json",
    title: "Display name",
    summary: "One or two short sentences: what it is, then what sets it apart. Plain English, no hype, no numbers you cannot prove.",
    kind: "App | Web | Tool | Plugin | CLI | Hardware",
    year: 2026,
    status: "published | draft | archived",
    stack: ["technology ids from /api/v1/techs"],
    links: [{ label: "GitHub | Website | Play Store | App Store", url: "https://…" }],
    media: { images: ["/images/uploads/… paths from /api/v1/media; the first one is the cover"], video: "YouTube embed URL or null" },
  },
  rules: "The full content contract is AGENTS.md in the repo: tone, what goes in a stack, image rules.",
};

export function GET() {
  return json(index);
}

import { guard, includeAll, json, readJson } from "@/lib/api/http";
import { refreshPages } from "@/lib/api/revalidate";
import { projectSchema } from "@/lib/content/schema";
import { createProject, publishedProjects, readPortfolio } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return guard(async () => {
    const portfolio = await readPortfolio();
    return json(includeAll(request) ? portfolio.projects : publishedProjects(portfolio));
  });
}

export function POST(request: Request) {
  return guard(async () => {
    const input = projectSchema.parse(await readJson(request));
    const saved = await createProject(input);
    refreshPages();
    return json(saved.projects.find((project) => project.id === input.id), 201);
  });
}

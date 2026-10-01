import { error, guard, json, readJson } from "@/lib/api/http";
import { refreshPages } from "@/lib/api/revalidate";
import { archiveProject, patchProject, readPortfolio } from "@/lib/content/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export function GET(_request: Request, context: Context) {
  return guard(async () => {
    const { id } = await context.params;
    const project = (await readPortfolio()).projects.find((item) => item.id === id);
    return project ? json(project) : error("not_found", `Project "${id}" was not found`, 404);
  });
}

export function PATCH(request: Request, context: Context) {
  return guard(async () => {
    const { id } = await context.params;
    const saved = await patchProject(id, await readJson(request));
    refreshPages();
    return json(saved.projects.find((project) => project.id === id));
  });
}

/** Archives: the project leaves the site but stays in its file. */
export function DELETE(_request: Request, context: Context) {
  return guard(async () => {
    const { id } = await context.params;
    const saved = await archiveProject(id);
    refreshPages();
    return json(saved.projects.find((project) => project.id === id));
  });
}

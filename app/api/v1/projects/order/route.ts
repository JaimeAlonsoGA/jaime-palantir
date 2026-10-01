import { z } from "zod";
import { guard, json, readJson } from "@/lib/api/http";
import { refreshPages } from "@/lib/api/revalidate";
import { reorderProjects } from "@/lib/content/store";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  ids: z.array(z.string()).max(200),
  // How many of the first published projects are featured on /contact and large on /projects.
  lead: z.number().int().min(1).max(12).optional(),
}).strict();

export function PUT(request: Request) {
  return guard(async () => {
    const { ids, lead } = bodySchema.parse(await readJson(request));
    const saved = await reorderProjects(ids, lead);
    refreshPages();
    return json(saved.projects.map((project) => project.id));
  });
}

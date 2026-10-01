import { guard, json, readJson } from "@/lib/api/http";
import { refreshPages } from "@/lib/api/revalidate";
import { techSchema } from "@/lib/content/schema";
import { removeTech, upsertTech } from "@/lib/content/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export function PUT(request: Request, context: Context) {
  return guard(async () => {
    const { id } = await context.params;
    const saved = await upsertTech(techSchema.parse({ ...(await readJson(request)), id }));
    refreshPages();
    return json(saved);
  });
}

export function DELETE(_request: Request, context: Context) {
  return guard(async () => {
    const { id } = await context.params;
    const saved = await removeTech(id);
    refreshPages();
    return json(saved);
  });
}

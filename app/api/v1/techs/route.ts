import { guard, json, readJson } from "@/lib/api/http";
import { refreshPages } from "@/lib/api/revalidate";
import { techsSchema } from "@/lib/content/schema";
import { readTechs, replaceTechs } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export function GET() {
  return guard(async () => json(await readTechs()));
}

export function PUT(request: Request) {
  return guard(async () => {
    const saved = await replaceTechs(techsSchema.parse(await readJson(request)));
    refreshPages();
    return json(saved);
  });
}

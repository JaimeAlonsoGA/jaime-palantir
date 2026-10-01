import { guard, json, readJson } from "@/lib/api/http";
import { refreshPages } from "@/lib/api/revalidate";
import { siteSchema } from "@/lib/content/schema";
import { readPortfolio, replaceSite } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export function GET() {
  return guard(async () => json((await readPortfolio()).site));
}

export function PUT(request: Request) {
  return guard(async () => {
    const saved = await replaceSite(siteSchema.parse(await readJson(request)));
    refreshPages();
    return json(saved.site);
  });
}

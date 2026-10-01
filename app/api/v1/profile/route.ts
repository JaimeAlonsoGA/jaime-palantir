import { guard, json, readJson } from "@/lib/api/http";
import { refreshPages } from "@/lib/api/revalidate";
import { personSchema } from "@/lib/content/schema";
import { readPortfolio, replacePerson } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export function GET() {
  return guard(async () => json((await readPortfolio()).person));
}

export function PUT(request: Request) {
  return guard(async () => {
    const saved = await replacePerson(personSchema.parse(await readJson(request)));
    refreshPages();
    return json(saved.person);
  });
}

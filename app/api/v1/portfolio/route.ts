import { guard, includeAll, json } from "@/lib/api/http";
import { publicPortfolio, readPortfolio, readTechs } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return guard(async () => {
    const [portfolio, techs] = await Promise.all([readPortfolio(), readTechs()]);
    const body = includeAll(request) ? portfolio : publicPortfolio(portfolio);
    return json({ ...body, lead: portfolio.lead, techs });
  });
}

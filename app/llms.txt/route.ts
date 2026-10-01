import { readPortfolio, readTechs } from "@/lib/content/store";
import { renderLlms } from "@/lib/seo/llms";

// Prerendered; API writes call refreshPages() to rebuild it.
export const dynamic = "force-static";

export async function GET() {
  const [portfolio, techs] = await Promise.all([readPortfolio(), readTechs()]);
  return new Response(renderLlms(portfolio, techs), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

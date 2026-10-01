import { renderCvText } from "@/lib/content/cv-text";
import { readPortfolio, readTechs } from "@/lib/content/store";

// Prerendered; API writes call refreshPages() to rebuild it.
export const dynamic = "force-static";

export async function GET() {
  const [portfolio, techs] = await Promise.all([readPortfolio(), readTechs()]);
  return new Response(renderCvText(portfolio, techs), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": "inline; filename=\"jaime-alonso-cv.txt\"",
    },
  });
}

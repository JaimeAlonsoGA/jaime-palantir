import { JsonLd } from "./json-ld";
import { ProjectsGrid } from "./projects-grid";
import type { TileProject } from "./project-tile";
import { PageShell } from "./ui/surface";
import { blurPlaceholder, imageRatio } from "@/lib/content/media";
import { shapeOf } from "@/lib/content/shape";
import { publishedProjects, readPortfolio, readTechs } from "@/lib/content/store";
import { projectPage, projectsList } from "@/lib/seo";

/** The projects page. /projects/<id> renders the same view with that project already open. */
export async function ProjectsView({ open = null }: { open?: string | null }) {
  const [portfolio, techs] = await Promise.all([readPortfolio(), readTechs()]);
  const byId = new Map(techs.map((tech) => [tech.id, tech]));
  const published = publishedProjects(portfolio);
  const opened = published.find((project) => project.id === open);
  const projects: TileProject[] = await Promise.all(
    published.map(async (project) => ({
      id: project.id,
      title: project.title,
      summary: project.summary,
      kind: project.kind,
      year: project.year,
      links: project.links,
      images: project.media.images,
      blurs: Object.fromEntries(
        (await Promise.all(project.media.images.map(async (src) => [src, await blurPlaceholder(src)] as const))).filter(
          (entry): entry is readonly [string, string] => entry[1] !== undefined,
        ),
      ),
      video: project.media.video,
      ratios: Object.fromEntries(
        await Promise.all(project.media.images.map(async (src) => [src, await imageRatio(src)] as const)),
      ),
      shape: project.media.images[0] ? shapeOf(await imageRatio(project.media.images[0])) : "none",
      stack: project.stack.flatMap((id) => byId.get(id) ?? []),
    })),
  );

  return (
    <PageShell className="bg-black/70">
      <JsonLd data={opened ? projectPage(portfolio, opened) : projectsList(portfolio, published)} />
      <div className="mx-auto max-w-7xl">
        <h1 className="enter-rise mb-8 text-4xl font-light text-white sm:text-5xl">{portfolio.site.projectsTitle}</h1>
        <ProjectsGrid projects={projects} lead={portfolio.lead} initialOpen={open} />
      </div>
    </PageShell>
  );
}

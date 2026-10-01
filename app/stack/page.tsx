import type { Metadata } from "next";
import { StackGrid } from "@/components/stack-grid";
import { PageShell } from "@/components/ui/surface";
import { publishedProjects, readPortfolio, readTechs } from "@/lib/content/store";

export async function generateMetadata(): Promise<Metadata> {
  const { person } = await readPortfolio();
  return {
    title: "Stack",
    description: `Technologies ${person.fullName} has shipped with, and the projects that use each one.`,
    alternates: { canonical: "/stack" },
  };
}

export default async function StackPage() {
  const [portfolio, techs] = await Promise.all([readPortfolio(), readTechs()]);
  const projects = publishedProjects(portfolio).map(({ id, title, kind, stack }) => ({ id, title, kind, stack }));

  return (
    <PageShell className="bg-black/80">
      <div className="mx-auto max-w-5xl">
        <h1 className="enter-rise mb-8 text-4xl font-light text-white sm:text-5xl">{portfolio.site.stackTitle}</h1>
        <StackGrid techs={techs} projects={projects} />
      </div>
    </PageShell>
  );
}

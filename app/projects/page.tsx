import type { Metadata } from "next";
import { ProjectsView } from "@/components/projects-view";
import { readPortfolio } from "@/lib/content/store";

export async function generateMetadata(): Promise<Metadata> {
  const { person, site } = await readPortfolio();
  return {
    title: site.projectsTitle,
    description: `Apps, plugins and tools built by ${person.fullName}, ${person.role.toLowerCase()}. ${site.projectsOverview}`,
    alternates: { canonical: "/projects" },
  };
}

export default function ProjectsPage() {
  return <ProjectsView />;
}

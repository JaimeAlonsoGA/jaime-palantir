import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectsView } from "@/components/projects-view";
import { publishedProjects, readPortfolio } from "@/lib/content/store";

export async function generateStaticParams() {
  return publishedProjects(await readPortfolio()).map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const portfolio = await readPortfolio();
  const project = publishedProjects(portfolio).find((item) => item.id === id);
  if (!project) return {};
  const cover = project.media.images[0];
  return {
    title: project.title,
    description: `${project.summary} Built by ${portfolio.person.fullName}.`,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: cover ? { images: [{ url: cover, alt: project.title }] } : undefined,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const portfolio = await readPortfolio();
  if (!publishedProjects(portfolio).some((project) => project.id === id)) notFound();
  // No separate case-study page: the grid opens with this project expanded
  return <ProjectsView open={id} />;
}

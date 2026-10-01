import type { MetadataRoute } from "next";
import { publishedProjects, readPortfolio } from "@/lib/content/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolio = await readPortfolio();
  const url = portfolio.site.siteUrl.replace(/\/$/, "");
  const lastModified = new Date(portfolio.updatedAt);
  const pages: [string, number][] = [
    ["/", 1],
    ["/cv", 0.9],
    ["/contact", 0.9],
    ["/projects", 0.8],
    ["/stack", 0.7],
  ];
  return [
    ...pages.map(([path, priority]) => ({ url: `${url}${path}`, lastModified, priority })),
    ...publishedProjects(portfolio).map((project) => ({
      url: `${url}/projects/${project.id}`,
      lastModified,
      priority: 0.6,
    })),
  ];
}

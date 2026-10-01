import { period } from "./format";
import { publishedProjects } from "./store";
import type { Portfolio, Tech } from "./schema";

export function renderCvText(portfolio: Portfolio, techs: Tech[]) {
  const { person, site } = portfolio;
  const names = new Map(techs.map((tech) => [tech.id, tech.name]));
  const projects = publishedProjects(portfolio);
  const experience = person.experience.map((job) =>
    [`## ${job.company} · ${job.role}`, period(job), ...job.points.map((point) => `- ${point}`)].join("\n"),
  );
  const blocks = projects.map((project) => {
    const stack = project.stack.map((id) => names.get(id) ?? id).join(", ");
    const links = project.links.map((link) => `${link.label}: ${link.url}`).join("\n");
    const heading = project.year ? `## ${project.title} (${project.year})` : `## ${project.title}`;
    return [heading, project.summary, stack, links]
      .filter((line) => line.length > 0)
      .join("\n");
  });
  return [
    person.fullName,
    person.role,
    `${person.location} · Work arrangement: ${person.workArrangement}`,
    "",
    person.headline,
    "",
    `Email: ${person.email}`,
    ...person.links
      .filter((link) => !link.href.startsWith("mailto:"))
      .map((link) => `${link.label}: ${link.href}`),
    "",
    "# Experience",
    "",
    experience.join("\n\n"),
    "",
    "# Skills",
    "",
    ...person.skills.map((group) => `${group.group}: ${group.items.join(" · ")}`),
    "",
    "# Education",
    "",
    ...person.education.map((item) => `${item.title} · ${item.school} · ${item.year}`),
    "",
    "# Languages",
    "",
    person.languages.map((language) => `${language.name}: ${language.level}`).join(" · "),
    "",
    "# Projects",
    "",
    site.projectsOverview,
    "",
    blocks.join("\n\n"),
    "",
  ].join("\n");
}

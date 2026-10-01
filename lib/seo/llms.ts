import { city } from "@/lib/content/format";
import { publishedProjects } from "@/lib/content/store";
import type { Portfolio, Tech } from "@/lib/content/schema";

/**
 * /llms.txt in the llmstxt.org shape: who this is in two lines, then where to read more.
 * Absolute links, so an agent can follow them from the file alone.
 */
export function renderLlms(portfolio: Portfolio, techs: Tech[]) {
  const { person, site } = portfolio;
  const url = site.siteUrl.replace(/\/$/, "");
  const names = new Map(techs.map((tech) => [tech.id, tech.name]));
  const current = person.experience.find((job) => job.end === null);
  const projects = publishedProjects(portfolio);

  const project = (item: (typeof projects)[number]) => {
    const meta = [item.kind, item.year, item.stack.map((id) => names.get(id) ?? id).join(", ")].filter(Boolean).join(" · ");
    return `- [${item.title}](${url}/projects/${item.id}): ${item.summary}${meta ? ` (${meta})` : ""}`;
  };

  return [
    `# ${person.fullName}`,
    "",
    `> ${person.role} in ${person.location}. ${person.headline}`,
    "",
    [
      `Work arrangement: ${person.workArrangement}.`,
      current ? `Currently ${current.role} at ${current.company}.` : "",
      `Core: ${person.skills[0]?.items.join(", ") ?? ""}.`,
      `Languages: ${person.languages.map((language) => `${language.name} (${language.level})`).join(", ")}.`,
      `To hire or contact: ${person.email}.`,
    ]
      .filter(Boolean)
      .join(" "),
    "",
    "## Profile",
    "",
    `- [CV](${url}/cv): experience, skills, education and languages`,
    `- [CV as plain text](${url}/cv.txt): the same CV, best for reading in full`,
    `- [Contact](${url}/contact): email and profiles, based in ${city(person.location)}`,
    `- [Stack](${url}/stack): every technology and the projects that use it`,
    "",
    "## Projects",
    "",
    ...projects.map(project),
    "",
    "## Elsewhere",
    "",
    ...person.links.filter((link) => /^https?:/.test(link.href)).map((link) => `- [${link.label}](${link.href})`),
    "",
  ].join("\n");
}

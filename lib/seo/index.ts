import type { Portfolio, Project } from "@/lib/content/schema";

// Everything search engines read comes from content/, like the pages.

export function seoKeywords(portfolio: Portfolio) {
  const { person } = portfolio;
  return [
    person.fullName,
    person.name,
    `hire ${person.role.toLowerCase()}`,
    `${person.workArrangement.toLowerCase()} ${person.role.toLowerCase()}`,
    `${person.role.toLowerCase()} ${person.location.split(",")[0]}`,
    "fullstack developer",
    "cross-platform app developer",
    "agentic software development",
    ...person.skills[0]?.items ?? [],
  ];
}

export function homeDescription(portfolio: Portfolio) {
  const { person } = portfolio;
  const core = person.skills[0]?.items.slice(0, 4).join(", ") ?? "";
  return `${person.fullName}: ${person.workArrangement.toLowerCase()} ${person.role.toLowerCase()} in ${person.location}. Fullstack web and mobile apps with ${core}. Open to hire.`;
}

const origin = (portfolio: Portfolio) => portfolio.site.siteUrl.replace(/\/$/, "");

/** schema.org: the person and the site. On every page, so any page alone says who this is. */
export function siteGraph(portfolio: Portfolio) {
  const { person, site } = portfolio;
  const url = origin(portfolio);
  const [city, country] = person.location.split(",").map((part) => part.trim());
  const current = person.experience.find((job) => job.end === null);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${url}/#person`,
        name: person.fullName,
        alternateName: person.name,
        jobTitle: person.role,
        description: person.headline,
        url,
        email: `mailto:${person.email}`,
        image: `${url}/opengraph-image`,
        address: { "@type": "PostalAddress", addressLocality: city, addressCountry: country },
        sameAs: person.links.filter((link) => /^https?:/.test(link.href)).map((link) => link.href),
        knowsAbout: person.skills.flatMap((group) => group.items),
        knowsLanguage: person.languages.map((language) => language.name),
        ...(current ? { worksFor: { "@type": "Organization", name: current.company } } : {}),
        alumniOf: person.education.map((item) => ({ "@type": "EducationalOrganization", name: item.school })),
        hasOccupation: {
          "@type": "Occupation",
          name: person.role,
          occupationLocation: { "@type": "City", name: city },
          skills: person.skills.flatMap((group) => group.items).join(", "),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: `${person.fullName} · ${person.role}`,
        inLanguage: site.locale,
        publisher: { "@id": `${url}/#person` },
      },
    ],
  };
}

/** A page that is about the person (home, CV, contact). */
export function profilePage(portfolio: Portfolio, path: string, name: string) {
  const url = origin(portfolio);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${url}${path}`,
    name,
    mainEntity: { "@id": `${url}/#person` },
    isPartOf: { "@id": `${url}/#website` },
  };
}

function projectNode(portfolio: Portfolio, project: Project) {
  const url = origin(portfolio);
  return {
    "@type": "CreativeWork",
    "@id": `${url}/projects/${project.id}`,
    url: `${url}/projects/${project.id}`,
    name: project.title,
    description: project.summary,
    ...(project.kind ? { genre: project.kind } : {}),
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    image: project.media.images.map((src) => (src.startsWith("/") ? `${url}${src}` : src)),
    keywords: project.stack.join(", "),
    sameAs: project.links.map((link) => link.url),
    author: { "@id": `${url}/#person` },
  };
}

/** The projects page: every published project, in order. */
export function projectsList(portfolio: Portfolio, projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Projects by ${portfolio.person.fullName}`,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: projectNode(portfolio, project),
    })),
  };
}

/** One project's own URL. */
export function projectPage(portfolio: Portfolio, project: Project) {
  return { "@context": "https://schema.org", ...projectNode(portfolio, project) };
}

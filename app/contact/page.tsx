import type { Metadata } from "next";
import { ContactCard } from "@/components/contact-card";
import { JsonLd } from "@/components/json-ld";
import { publishedProjects, readPortfolio } from "@/lib/content/store";
import { profilePage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { person } = await readPortfolio();
  return {
    title: { absolute: `Hire ${person.fullName} · ${person.role}` },
    description: `Contact ${person.fullName}, ${person.workArrangement.toLowerCase()} ${person.role.toLowerCase()} in ${person.location}. Web and mobile apps with TypeScript, React, Next.js and Node.js.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const portfolio = await readPortfolio();
  const { person, site } = portfolio;
  const featured = publishedProjects(portfolio)
    .slice(0, portfolio.lead)
    .map(({ id, title, summary }) => ({ id, title, summary }));

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black/60 px-5 py-28">
      {/* No backdrop blur on this page: it would be recomputed on every frame of the flip */}
      <JsonLd data={profilePage(portfolio, "/contact", `Contact ${person.fullName}`)} />
      <ContactCard person={person} title={site.contactTitle} cvLabel={site.cvLabel} featured={featured} />
    </div>
  );
}

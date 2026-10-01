import Hero from "@/components/hero";
import { JsonLd } from "@/components/json-ld";
import { readPortfolio } from "@/lib/content/store";
import { profilePage } from "@/lib/seo";

export default async function Home() {
  const portfolio = await readPortfolio();
  const { person, site } = portfolio;
  return (
    <>
      <JsonLd data={profilePage(portfolio, "/", `${person.fullName} · ${person.role}`)} />
      <Hero name={person.name} headline={site.heroTagline} skills={person.skills} />
    </>
  );
}

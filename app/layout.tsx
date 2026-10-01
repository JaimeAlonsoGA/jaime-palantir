import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/header";
import Container from "@/components/layout/container";
import Footer from "@/components/layout/footer";
import { readPortfolio } from "@/lib/content/store";
import { JsonLd } from "@/components/json-ld";
import { homeDescription, seoKeywords, siteGraph } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const portfolio = await readPortfolio();
  const { person, site } = portfolio;
  const title = `${person.fullName} · ${person.role}`;
  const description = homeDescription(portfolio);
  return {
    metadataBase: new URL(site.siteUrl),
    title: { default: title, template: `%s | ${person.name}` },
    description,
    keywords: seoKeywords(portfolio),
    applicationName: `${person.name} · ${person.role}`,
    authors: [{ name: person.fullName, url: site.siteUrl }],
    creator: person.fullName,
    category: "technology",
    alternates: {
      canonical: "/",
      types: {
        "text/plain": "/llms.txt",
      },
    },
    openGraph: {
      type: "profile",
      firstName: person.name.split(" ")[0],
      lastName: person.fullName.split(" ").slice(1).join(" "),
      locale: site.locale === "en" ? "en_US" : site.locale,
      url: "/",
      title,
      description,
      siteName: person.fullName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const portfolio = await readPortfolio();
  const { person, site } = portfolio;
  return (
    <html lang={site.locale} className="scroll-smooth">
      <head>
        {/* Ties this site to the same person's profiles, for search engines and agents */}
        {person.links
          .filter((link) => /^https?:/.test(link.href))
          .map((link) => (
            <link key={link.href} rel="me" href={link.href} />
          ))}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd data={siteGraph(portfolio)} />
        <Header role={person.role} cvLabel={site.cvLabel} />
        <Container>
          {children}
        </Container>
        <Footer
          fullName={person.fullName}
          role={person.role}
          location={person.location}
          workArrangement={person.workArrangement}
          links={person.links}
          cvLabel={site.cvLabel}
        />
      </body>
    </html>
  );
}
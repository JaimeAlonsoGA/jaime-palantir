import type { MetadataRoute } from "next";
import { readPortfolio } from "@/lib/content/store";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await readPortfolio();
  const url = site.siteUrl.replace(/\/$/, "");
  return {
    // The API is private; agents read the site, /llms.txt and /cv.txt instead
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}

import type { MetadataRoute } from "next";
import { readPortfolio } from "@/lib/content/store";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await readPortfolio();
  const url = site.siteUrl.replace(/\/$/, "");
  return {
    // The owner API stays crawlable: its guide is public and the rest answers 401 without the token
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}

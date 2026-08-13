import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/locale";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mazal.ae";

  const staticPages = [
    "",
    "/marketplace",
    "/auctions",
    "/private-deal",
    "/login",
    "/register",
  ];

  const locales = LOCALES;

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    staticPages.forEach((page) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
      });
    });
  });

  return sitemapEntries;
}

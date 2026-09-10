import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { articles, matches, teams, competitions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://futbetter.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/matches",
    "/news",
    "/analysis",
    "/results",
    "/rankings",
    "/about",
    "/advertise",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/community-rules",
    "/advertising-policy",
    "/affiliate-disclosure",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  try {
    const [allArticles, allMatches, allTeams, allCompetitions] = await Promise.all([
      db
        .select({ slug: articles.slug, type: articles.type, updatedAt: articles.updatedAt })
        .from(articles)
        .where(eq(articles.status, "PUBLISHED")),
      db.select({ slug: matches.slug, updatedAt: matches.updatedAt }).from(matches),
      db.select({ slug: teams.slug }).from(teams),
      db.select({ slug: competitions.slug }).from(competitions),
    ]);

    const articleRoutes = allArticles.map((a) => ({
      url: `${SITE_URL}/${a.type === "NEWS" ? "news" : "analysis"}/${a.slug}`,
      lastModified: a.updatedAt,
    }));
    const matchRoutes = allMatches.map((m) => ({
      url: `${SITE_URL}/match/${m.slug}`,
      lastModified: m.updatedAt,
    }));
    const teamRoutes = allTeams.map((t) => ({ url: `${SITE_URL}/team/${t.slug}` }));
    const competitionRoutes = allCompetitions.map((c) => ({
      url: `${SITE_URL}/competition/${c.slug}`,
    }));

    return [...staticRoutes, ...articleRoutes, ...matchRoutes, ...teamRoutes, ...competitionRoutes];
  } catch (e) {
    console.error("[sitemap] DB unavailable, returning static routes only:", e);
    return staticRoutes;
  }
}

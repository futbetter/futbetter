import { db } from "@/lib/db";
import {
  matches,
  articles,
  teams,
  competitions,
  users,
  watchProviders,
  predictionOutcomes,
  pages,
} from "@/lib/db/schema";
import { eq, desc, asc, and, gte, ne, sql, or } from "drizzle-orm";
import { DEFAULT_PAGES } from "@/lib/default-pages";

export async function getFeaturedMatch() {
  const [match] = await db.query.matches.findMany({
    where: and(eq(matches.featured, true), ne(matches.status, "FINISHED")),
    with: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: [asc(matches.kickoffAt)],
    limit: 1,
  });
  if (match) return match;

  // fall back to the soonest scheduled match
  const [fallback] = await db.query.matches.findMany({
    where: eq(matches.status, "SCHEDULED"),
    with: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: [asc(matches.kickoffAt)],
    limit: 1,
  });
  return fallback ?? null;
}

export async function getUpcomingMatches(limit = 8, excludeId?: string) {
  return db.query.matches.findMany({
    where: and(
      or(eq(matches.status, "SCHEDULED"), eq(matches.status, "LIVE")),
      excludeId ? ne(matches.id, excludeId) : undefined
    ),
    with: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: [asc(matches.kickoffAt)],
    limit,
  });
}

export async function getRecentResults(limit = 8) {
  return db.query.matches.findMany({
    where: eq(matches.status, "FINISHED"),
    with: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: [desc(matches.kickoffAt)],
    limit,
  });
}

export async function getAllMatches() {
  return db.query.matches.findMany({
    with: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: [asc(matches.kickoffAt)],
  });
}

export async function getMatchBySlug(slug: string) {
  return db.query.matches.findFirst({
    where: eq(matches.slug, slug),
    with: {
      homeTeam: true,
      awayTeam: true,
      competition: true,
      watchProviders: true,
    },
  });
}

export async function getWatchProviders(matchId: string) {
  return db
    .select()
    .from(watchProviders)
    .where(and(eq(watchProviders.matchId, matchId), eq(watchProviders.status, "active")));
}

export async function getRelatedArticlesForMatch(matchId: string, limit = 3) {
  return db.query.articles.findMany({
    where: and(eq(articles.relatedMatchId, matchId), eq(articles.status, "PUBLISHED")),
    orderBy: [desc(articles.publishAt)],
    limit,
  });
}

export async function getArticles(opts: {
  type?: "NEWS" | "ANALYSIS";
  category?: string;
  limit?: number;
  offset?: number;
  onlyPublished?: boolean;
}) {
  const { type, category, limit = 12, offset = 0, onlyPublished = true } = opts;
  const conditions = [];
  if (type) conditions.push(eq(articles.type, type));
  if (category) conditions.push(eq(articles.category, category));
  if (onlyPublished) conditions.push(eq(articles.status, "PUBLISHED"));

  return db.query.articles.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [desc(articles.publishAt), desc(articles.createdAt)],
    limit,
    offset,
    with: { author: true },
  });
}

export async function getArticleBySlug(slug: string) {
  return db.query.articles.findFirst({
    where: eq(articles.slug, slug),
    with: {
      author: true,
      relatedMatch: { with: { homeTeam: true, awayTeam: true } },
      relatedTeam: true,
      relatedCompetition: true,
    },
  });
}

export async function incrementArticleView(articleId: string) {
  await db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, articleId));
}

export async function getTrendingArticles(limit = 5) {
  return db.query.articles.findMany({
    where: eq(articles.status, "PUBLISHED"),
    orderBy: [desc(articles.viewCount)],
    limit,
  });
}

export async function getTeams() {
  return db.select().from(teams).orderBy(asc(teams.name));
}

export async function getTeamBySlug(slug: string) {
  return db.query.teams.findFirst({
    where: eq(teams.slug, slug),
    with: { competition: true },
  });
}

export async function getCompetitions() {
  return db.select().from(competitions).orderBy(asc(competitions.name));
}

export async function getCompetitionBySlug(slug: string) {
  return db.query.competitions.findFirst({ where: eq(competitions.slug, slug) });
}

export async function getMatchesForTeam(teamId: string) {
  return db.query.matches.findMany({
    where: or(eq(matches.homeTeamId, teamId), eq(matches.awayTeamId, teamId)),
    with: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: [desc(matches.kickoffAt)],
    limit: 20,
  });
}

export async function getMatchesForCompetition(competitionId: string) {
  return db.query.matches.findMany({
    where: eq(matches.competitionId, competitionId),
    with: { homeTeam: true, awayTeam: true, competition: true },
    orderBy: [asc(matches.kickoffAt)],
  });
}

export async function getUserByUsername(username: string) {
  return db.query.users.findFirst({ where: eq(users.username, username) });
}

export async function getUserPredictionHistory(userId: string, limit = 30) {
  return db.query.predictionOutcomes.findMany({
    where: eq(predictionOutcomes.userId, userId),
    orderBy: [desc(predictionOutcomes.evaluatedAt)],
    limit,
    with: {
      match: { with: { homeTeam: true, awayTeam: true } },
    },
  });
}

export async function getLeaderboard(limit = 20) {
  return db
    .select()
    .from(users)
    .where(gte(users.totalPredictions, 5))
    .orderBy(
      desc(
        sql<number>`case when ${users.totalPredictions} > 0 then (${users.correctPredictions}::float / ${users.totalPredictions}) else 0 end`
      )
    )
    .limit(limit);
}

export async function getStreakLeaderboard(limit = 20) {
  return db.select().from(users).orderBy(desc(users.bestStreak)).limit(limit);
}

export async function getPageBySlug(slug: string) {
  try {
    const [row] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
    if (row) return row;
  } catch (e) {
    console.error(`[pages] failed to load "${slug}" from DB:`, e);
  }
  const fallback = DEFAULT_PAGES.find((p) => p.slug === slug);
  if (!fallback) return null;
  return { id: slug, updatedAt: new Date(), ...fallback };
}

export async function getAllPages() {
  return db.select().from(pages).orderBy(asc(pages.title));
}

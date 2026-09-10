import { db } from "@/lib/db";
import {
  users,
  votes,
  articles,
  matches,
  adSlots,
  affiliateCampaigns,
  auditLogs,
  comments,
  reports,
} from "@/lib/db/schema";
import { sql, desc, gte, eq } from "drizzle-orm";

export async function getDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    [{ count: totalUsers }],
    [{ count: newUsersToday }],
    [{ count: totalVotes }],
    [{ count: totalArticles }],
    [{ count: totalMatches }],
    [{ sum: adClicks }],
    [{ sum: adImpressions }],
    [{ sum: affiliateClicks }],
    [{ correct, total }],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(users),
    db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, startOfDay)),
    db.select({ count: sql<number>`count(*)::int` }).from(votes),
    db.select({ count: sql<number>`count(*)::int` }).from(articles),
    db.select({ count: sql<number>`count(*)::int` }).from(matches),
    db.select({ sum: sql<number>`coalesce(sum(${adSlots.clicks}),0)::int` }).from(adSlots),
    db.select({ sum: sql<number>`coalesce(sum(${adSlots.impressions}),0)::int` }).from(adSlots),
    db.select({ sum: sql<number>`coalesce(sum(${affiliateCampaigns.clicks}),0)::int` }).from(affiliateCampaigns),
    db
      .select({
        correct: sql<number>`coalesce(sum(${users.correctPredictions}),0)::int`,
        total: sql<number>`coalesce(sum(${users.totalPredictions}),0)::int`,
      })
      .from(users),
  ]);

  return {
    totalUsers,
    newUsersToday,
    totalVotes,
    totalArticles,
    totalMatches,
    adClicks,
    adImpressions,
    affiliateClicks,
    predictionAccuracy: total > 0 ? Math.round((correct / total) * 1000) / 10 : 0,
  };
}

export async function getMostViewedArticles(limit = 5) {
  return db.select().from(articles).orderBy(desc(articles.viewCount)).limit(limit);
}

export async function getMostPredictedMatches(limit = 5) {
  return db
    .select({
      matchId: votes.matchId,
      voteCount: sql<number>`count(*)::int`,
    })
    .from(votes)
    .groupBy(votes.matchId)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getRecentAuditLogs(limit = 20) {
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

export async function getPendingComments() {
  return db.query.comments.findMany({
    where: eq(comments.status, "PENDING"),
    orderBy: [desc(comments.createdAt)],
    limit: 50,
  });
}

export async function getMatchOptions() {
  const rows = await db.query.matches.findMany({
    with: { homeTeam: true, awayTeam: true },
    orderBy: [desc(matches.kickoffAt)],
    limit: 100,
  });
  return rows.map((m) => ({
    id: m.id,
    label: `${m.homeTeam.name} vs ${m.awayTeam.name} — ${new Date(m.kickoffAt).toLocaleDateString("en-GB")}`,
  }));
}

export async function getOpenReports() {
  return db.query.reports.findMany({
    where: eq(reports.status, "OPEN"),
    orderBy: [desc(reports.createdAt)],
    limit: 50,
  });
}

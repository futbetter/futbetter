"use server";

import { db } from "@/lib/db";
import { matches, votes, users, predictionOutcomes, watchProviders, teams } from "@/lib/db/schema";
import { requireStaff } from "@/lib/auth-guards";
import { logAudit } from "@/lib/audit";
import { matchSlug } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}
function num(fd: FormData, key: string): number | undefined {
  const v = str(fd, key);
  return v === undefined ? undefined : Number(v);
}
function lines(fd: FormData, key: string): string[] {
  const v = str(fd, key);
  if (!v) return [];
  return v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function saveMatch(formData: FormData) {
  const user = await requireStaff();

  const id = str(formData, "id");
  const homeTeamId = str(formData, "homeTeamId");
  const awayTeamId = str(formData, "awayTeamId");
  const kickoffAtRaw = str(formData, "kickoffAt");
  if (!homeTeamId || !awayTeamId || !kickoffAtRaw) {
    throw new Error("Home team, away team and kickoff time are required");
  }

  const [homeTeam] = await db.select().from(teams).where(eq(teams.id, homeTeamId)).limit(1);
  const [awayTeam] = await db.select().from(teams).where(eq(teams.id, awayTeamId)).limit(1);

  const kickoffAt = new Date(kickoffAtRaw);
  const slugBase = homeTeam && awayTeam ? matchSlug(homeTeam.name, awayTeam.name, kickoffAt) : `match-${Date.now()}`;

  const values = {
    competitionId: str(formData, "competitionId") ?? null,
    homeTeamId,
    awayTeamId,
    kickoffAt,
    venue: str(formData, "venue") ?? null,
    status:
      (str(formData, "status") as "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED" | undefined) ??
      "SCHEDULED",
    featured: formData.get("featured") === "on",
    isMatchOfTheDay: formData.get("isMatchOfTheDay") === "on",
    preview: str(formData, "preview") ?? null,
    homeForm: str(formData, "homeForm") ?? null,
    awayForm: str(formData, "awayForm") ?? null,
    h2hNotes: str(formData, "h2hNotes") ?? null,
    keyPlayers: lines(formData, "keyPlayers"),
    injuries: lines(formData, "injuries"),
    predictionWinner: (str(formData, "predictionWinner") as "HOME" | "DRAW" | "AWAY" | undefined) ?? null,
    predictionConfidence: num(formData, "predictionConfidence") ?? null,
    predictionScoreHome: num(formData, "predictionScoreHome") ?? null,
    predictionScoreAway: num(formData, "predictionScoreAway") ?? null,
    predictionReasoning: str(formData, "predictionReasoning") ?? null,
    predictionFullAnalysis: str(formData, "predictionFullAnalysis") ?? null,
    predictionKeyFactors: lines(formData, "predictionKeyFactors"),
    expertName: str(formData, "expertName") ?? null,
    expertWinner: (str(formData, "expertWinner") as "HOME" | "DRAW" | "AWAY" | undefined) ?? null,
    expertConfidence: num(formData, "expertConfidence") ?? null,
    votingEnabled: formData.get("votingEnabled") !== "off",
    commentsEnabled: formData.get("commentsEnabled") !== "off",
    updatedAt: new Date(),
  };

  let matchId = id;

  if (id) {
    await db.update(matches).set(values).where(eq(matches.id, id));
    await logAudit({ adminId: user.id, adminName: user.name, action: "UPDATE", entityType: "match", entityId: id });
  } else {
    const [created] = await db.insert(matches).values({ ...values, slug: slugBase }).returning();
    matchId = created.id;
    await logAudit({ adminId: user.id, adminName: user.name, action: "CREATE", entityType: "match", entityId: created.id });
  }

  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath("/admin/matches");

  redirect(`/admin/matches/${matchId}`);
}

export async function deleteMatch(id: string) {
  const user = await requireStaff();
  await db.delete(matches).where(eq(matches.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "DELETE", entityType: "match", entityId: id });
  revalidatePath("/admin/matches");
  revalidatePath("/matches");
}

/**
 * Records the final result for a match: locks voting, evaluates every
 * community vote and the FutBetter editorial prediction, and updates each
 * predicting user's accuracy / streak counters. Idempotent — running it a
 * second time on an already-finished match only updates the raw score.
 */
export async function recordMatchResult(formData: FormData) {
  const user = await requireStaff();
  const id = str(formData, "id");
  const homeScore = num(formData, "homeScore");
  const awayScore = num(formData, "awayScore");
  if (!id || homeScore === undefined || awayScore === undefined) {
    throw new Error("Match id and both scores are required");
  }

  const [match] = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  if (!match) throw new Error("Match not found");

  const wasAlreadyFinished = match.status === "FINISHED";
  const actualOutcome: "HOME" | "DRAW" | "AWAY" =
    homeScore > awayScore ? "HOME" : homeScore < awayScore ? "AWAY" : "DRAW";

  await db
    .update(matches)
    .set({
      homeScore,
      awayScore,
      status: "FINISHED",
      votingLocked: true,
      predictionCorrect: match.predictionWinner ? match.predictionWinner === actualOutcome : null,
      updatedAt: new Date(),
    })
    .where(eq(matches.id, id));

  if (!wasAlreadyFinished) {
    const matchVotes = await db.select().from(votes).where(eq(votes.matchId, id));

    for (const vote of matchVotes) {
      const correct = vote.choice === actualOutcome;

      await db
        .insert(predictionOutcomes)
        .values({ matchId: id, userId: vote.userId, choice: vote.choice, correct })
        .onConflictDoNothing({ target: [predictionOutcomes.matchId, predictionOutcomes.userId] });

      const [u] = await db.select().from(users).where(eq(users.id, vote.userId)).limit(1);
      if (!u) continue;

      const newCurrentStreak = correct ? u.currentStreak + 1 : 0;
      await db
        .update(users)
        .set({
          totalPredictions: sql`${users.totalPredictions} + 1`,
          correctPredictions: correct ? sql`${users.correctPredictions} + 1` : users.correctPredictions,
          incorrectPredictions: correct ? users.incorrectPredictions : sql`${users.incorrectPredictions} + 1`,
          currentStreak: newCurrentStreak,
          bestStreak: Math.max(u.bestStreak, newCurrentStreak),
          updatedAt: new Date(),
        })
        .where(eq(users.id, vote.userId));
    }
  }

  await logAudit({
    adminId: user.id,
    adminName: user.name,
    action: "RECORD_RESULT",
    entityType: "match",
    entityId: id,
    details: { homeScore, awayScore, alreadyFinished: wasAlreadyFinished },
  });

  revalidatePath("/");
  revalidatePath("/results");
  revalidatePath("/rankings");
  revalidatePath(`/match/${match.slug}`);
  revalidatePath("/admin/matches");
  revalidatePath(`/admin/matches/${id}`);
}

export async function addWatchProvider(formData: FormData) {
  const user = await requireStaff();
  const matchId = str(formData, "matchId");
  const providerName = str(formData, "providerName");
  const url = str(formData, "url");
  if (!matchId || !providerName || !url) throw new Error("Provider name and URL are required");

  await db.insert(watchProviders).values({
    matchId,
    providerName,
    url,
    logoUrl: str(formData, "logoUrl") ?? null,
    region: str(formData, "region") ?? "Global",
    description: str(formData, "description") ?? null,
  });

  await logAudit({ adminId: user.id, adminName: user.name, action: "ADD_WATCH_PROVIDER", entityType: "match", entityId: matchId });
  revalidatePath(`/admin/matches/${matchId}`);
  revalidatePath("/match");
}

export async function deleteWatchProvider(id: string, matchId: string) {
  await requireStaff();
  await db.delete(watchProviders).where(eq(watchProviders.id, id));
  revalidatePath(`/admin/matches/${matchId}`);
}

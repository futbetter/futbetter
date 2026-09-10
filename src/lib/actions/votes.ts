"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { votes, matches } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Choice = "HOME" | "DRAW" | "AWAY";

export interface VoteTally {
  home: number;
  draw: number;
  away: number;
  total: number;
  homePct: number;
  drawPct: number;
  awayPct: number;
  userChoice: Choice | null;
}

export async function getVoteTally(matchId: string): Promise<VoteTally> {
  const session = await auth();
  const rows = await db
    .select({ choice: votes.choice, count: sql<number>`count(*)::int` })
    .from(votes)
    .where(eq(votes.matchId, matchId))
    .groupBy(votes.choice);

  let home = 0,
    draw = 0,
    away = 0;
  for (const r of rows) {
    if (r.choice === "HOME") home = r.count;
    if (r.choice === "DRAW") draw = r.count;
    if (r.choice === "AWAY") away = r.count;
  }
  const total = home + draw + away;

  let userChoice: Choice | null = null;
  if (session?.user?.id) {
    const [mine] = await db
      .select({ choice: votes.choice })
      .from(votes)
      .where(and(eq(votes.matchId, matchId), eq(votes.userId, session.user.id)))
      .limit(1);
    userChoice = mine?.choice ?? null;
  }

  return {
    home,
    draw,
    away,
    total,
    homePct: total ? Math.round((home / total) * 100) : 0,
    drawPct: total ? Math.round((draw / total) * 100) : 0,
    awayPct: total ? Math.round((away / total) * 100) : 0,
    userChoice,
  };
}

export async function castVote(
  matchId: string,
  choice: Choice
): Promise<{ ok: true; tally: VoteTally } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "AUTH_REQUIRED" };
  }

  const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!match) return { ok: false, error: "NOT_FOUND" };

  if (!match.votingEnabled) return { ok: false, error: "VOTING_DISABLED" };

  const kickedOff = Date.now() >= new Date(match.kickoffAt).getTime();
  if (match.votingLocked || kickedOff) {
    return { ok: false, error: "LOCKED" };
  }

  await db
    .insert(votes)
    .values({ matchId, userId: session.user.id, choice })
    .onConflictDoUpdate({
      target: [votes.matchId, votes.userId],
      set: { choice, updatedAt: new Date() },
    });

  revalidatePath(`/match/${match.slug}`);
  revalidatePath("/");

  const tally = await getVoteTally(matchId);
  return { ok: true, tally };
}

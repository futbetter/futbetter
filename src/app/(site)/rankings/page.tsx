import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Flame } from "lucide-react";
import { getLeaderboard, getStreakLeaderboard } from "@/lib/queries";
import { accuracy } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prediction Rankings",
  description: "The most accurate and consistent football predictors in the FutBetter community.",
};

export default async function RankingsPage() {
  const [byAccuracy, byStreak] = await Promise.all([getLeaderboard(20), getStreakLeaderboard(20)]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-black">Rankings</h1>
      <p className="mb-8 text-sm text-muted">
        Ranked by prediction accuracy and consistency — not just volume. Minimum 5 predictions to qualify.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Trophy size={18} className="text-brand" /> Most Accurate
          </h2>
          <ol className="space-y-2">
            {byAccuracy.map((u, i) => (
              <li key={u.id}>
                <Link
                  href={`/profile/${u.username ?? u.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 hover:border-brand/50"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-5 text-center font-black text-muted">{i + 1}</span>
                    <span className="font-semibold">{u.name}</span>
                  </span>
                  <span className="text-sm font-bold text-brand">
                    {accuracy(u.correctPredictions, u.totalPredictions)}%
                  </span>
                </Link>
              </li>
            ))}
            {byAccuracy.length === 0 && <p className="text-sm text-muted">Not enough data yet.</p>}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Flame size={18} className="text-brand" /> Best Streaks
          </h2>
          <ol className="space-y-2">
            {byStreak.map((u, i) => (
              <li key={u.id}>
                <Link
                  href={`/profile/${u.username ?? u.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 hover:border-brand/50"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-5 text-center font-black text-muted">{i + 1}</span>
                    <span className="font-semibold">{u.name}</span>
                  </span>
                  <span className="text-sm font-bold text-brand">{u.bestStreak} 🔥</span>
                </Link>
              </li>
            ))}
            {byStreak.length === 0 && <p className="text-sm text-muted">Not enough data yet.</p>}
          </ol>
        </section>
      </div>
    </div>
  );
}

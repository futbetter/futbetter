import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Flame, Target, TrendingUp } from "lucide-react";
import { getUserByUsername, getUserPredictionHistory } from "@/lib/queries";
import { accuracy } from "@/lib/utils";
import { TeamBadge } from "@/components/TeamBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return {};
  return { title: `${user.name ?? username} — Profile` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const history = await getUserPredictionHistory(user.id, 25);
  const acc = accuracy(user.correctPredictions, user.totalPredictions);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-border bg-surface p-6">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name ?? ""} className="h-16 w-16 rounded-full" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-xl font-black">
            {(user.name ?? "?")[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black">{user.name}</h1>
          {user.telegramUsername && (
            <p className="text-sm text-muted">@{user.telegramUsername} on Telegram</p>
          )}
          <p className="text-xs text-muted">
            Member since {new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Target size={16} />} label="Predictions" value={user.totalPredictions} />
        <StatCard icon={<TrendingUp size={16} />} label="Accuracy" value={`${acc}%`} highlight />
        <StatCard icon={<Flame size={16} />} label="Current Streak" value={user.currentStreak} />
        <StatCard icon={<Flame size={16} />} label="Best Streak" value={user.bestStreak} />
      </div>

      <h2 className="mb-4 text-lg font-bold">Prediction History</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Prediction</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/match/${h.match.slug}`} className="flex items-center gap-2 hover:text-brand">
                    <TeamBadge name={h.match.homeTeam.name} logoUrl={h.match.homeTeam.logoUrl} size={20} />
                    <span className="text-xs">vs</span>
                    <TeamBadge name={h.match.awayTeam.name} logoUrl={h.match.awayTeam.logoUrl} size={20} />
                  </Link>
                </td>
                <td className="px-4 py-3">{h.choice}</td>
                <td className="px-4 py-3">
                  {h.match.homeScore != null ? `${h.match.homeScore}-${h.match.awayScore}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${h.correct ? "text-brand" : "text-red-400"}`}>
                    {h.correct ? "Correct" : "Incorrect"}
                  </span>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No evaluated predictions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 text-center ${highlight ? "border-brand bg-brand/5" : "border-border bg-surface"}`}>
      <div className={`mx-auto mb-1 flex items-center justify-center ${highlight ? "text-brand" : "text-muted"}`}>
        {icon}
      </div>
      <p className={`text-xl font-black ${highlight ? "text-brand" : ""}`}>{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

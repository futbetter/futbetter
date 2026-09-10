import type { Metadata } from "next";
import { getAllMatches } from "@/lib/queries";
import { MatchCard } from "@/components/MatchCard";
import { LiveRefresher } from "@/components/LiveRefresher";

export const metadata: Metadata = {
  title: "Matches",
  description: "Every upcoming and recent football match with FutBetter predictions and community voting.",
};

export default async function MatchesPage() {
  const allMatches = await getAllMatches();
  const upcoming = allMatches.filter((m) => m.status !== "FINISHED");
  const finished = allMatches.filter((m) => m.status === "FINISHED");
  const hasLive = upcoming.some((m) => m.status === "LIVE");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <LiveRefresher active={hasLive} />
      <h1 className="mb-6 text-3xl font-black">Matches</h1>

      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand">
        <span className="h-3.5 w-1 rounded-full bg-brand" /> Upcoming
      </h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((m) => (
          <MatchCard key={m.id} match={{ ...m, competitionName: m.competition?.name, kickoffAt: m.kickoffAt.toString() }} />
        ))}
        {upcoming.length === 0 && <p className="text-sm text-muted">No upcoming matches.</p>}
      </div>

      {finished.length > 0 && (
        <>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-muted">
            <span className="h-3.5 w-1 rounded-full bg-border-strong" /> Recent Results
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {finished.map((m) => (
              <MatchCard key={m.id} match={{ ...m, competitionName: m.competition?.name, kickoffAt: m.kickoffAt.toString() }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

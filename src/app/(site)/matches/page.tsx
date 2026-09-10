import type { Metadata } from "next";
import { getAllMatches } from "@/lib/queries";
import { MatchCard } from "@/components/MatchCard";

export const metadata: Metadata = {
  title: "Matches",
  description: "Every upcoming and recent football match with FutBetter predictions and community voting.",
};

export default async function MatchesPage() {
  const allMatches = await getAllMatches();
  const upcoming = allMatches.filter((m) => m.status !== "FINISHED");
  const finished = allMatches.filter((m) => m.status === "FINISHED");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-black">Matches</h1>

      <h2 className="mb-4 text-lg font-bold text-brand">Upcoming</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((m) => (
          <MatchCard key={m.id} match={{ ...m, competitionName: m.competition?.name, kickoffAt: m.kickoffAt.toString() }} />
        ))}
        {upcoming.length === 0 && <p className="text-sm text-muted">No upcoming matches.</p>}
      </div>

      {finished.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-bold text-muted">Recent Results</h2>
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

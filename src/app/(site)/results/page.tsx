import type { Metadata } from "next";
import { getRecentResults } from "@/lib/queries";
import { MatchCard } from "@/components/MatchCard";

export const metadata: Metadata = {
  title: "Results",
  description: "Final scores for recently completed football matches, with community and FutBetter prediction accuracy.",
};

export default async function ResultsPage() {
  const results = await getRecentResults(40);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-black">Results</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((m) => (
          <MatchCard key={m.id} match={{ ...m, competitionName: m.competition?.name, kickoffAt: m.kickoffAt.toString() }} />
        ))}
        {results.length === 0 && <p className="text-sm text-muted">No results yet.</p>}
      </div>
    </div>
  );
}

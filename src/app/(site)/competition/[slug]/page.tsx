import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompetitionBySlug, getMatchesForCompetition } from "@/lib/queries";
import { MatchCard } from "@/components/MatchCard";
import { TeamBadge } from "@/components/TeamBadge";
import { LiveRefresher } from "@/components/LiveRefresher";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://futbetter.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug);
  if (!competition) return {};
  return {
    title: competition.name,
    description: `${competition.name} fixtures, results and FutBetter predictions.`,
    alternates: { canonical: `${SITE_URL}/competition/${slug}` },
  };
}

export default async function CompetitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug);
  if (!competition) notFound();

  const matches = await getMatchesForCompetition(competition.id);
  const upcoming = matches.filter((m) => m.status !== "FINISHED");
  const finished = matches.filter((m) => m.status === "FINISHED");
  const hasLive = matches.some((m) => m.status === "LIVE");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <LiveRefresher active={hasLive} />
      <div className="card mb-8 flex items-center gap-4 p-6">
        <TeamBadge name={competition.name} logoUrl={competition.logoUrl} size={64} />
        <div>
          <h1 className="text-2xl font-black">{competition.name}</h1>
          <p className="text-sm text-muted">{competition.country} {competition.season ? `· ${competition.season}` : ""}</p>
        </div>
      </div>

      {competition.description && <p className="mb-8 text-sm text-muted">{competition.description}</p>}

      <h2 className="mb-4 text-lg font-bold">Fixtures</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((m) => (
          <MatchCard key={m.id} match={{ ...m, competitionName: competition.name, kickoffAt: m.kickoffAt.toString() }} />
        ))}
        {upcoming.length === 0 && <p className="text-sm text-muted">No upcoming fixtures.</p>}
      </div>

      {finished.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-bold">Results</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {finished.map((m) => (
              <MatchCard key={m.id} match={{ ...m, competitionName: competition.name, kickoffAt: m.kickoffAt.toString() }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";
import { getTeamBySlug, getMatchesForTeam, getArticles } from "@/lib/queries";
import { TeamBadge } from "@/components/TeamBadge";
import { MatchCard } from "@/components/MatchCard";
import { ArticleCard } from "@/components/ArticleCard";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://futbetter.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) return {};
  return {
    title: team.name,
    description: `${team.name} fixtures, results, news and analysis on FutBetter.`,
    alternates: { canonical: `${SITE_URL}/team/${slug}` },
  };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const matches = await getMatchesForTeam(team.id);
  const upcoming = matches.filter((m) => m.status !== "FINISHED").slice(0, 6);
  const results = matches.filter((m) => m.status === "FINISHED").slice(0, 6);
  const news = await getArticles({ limit: 4 });
  const relatedNews = news.filter((a) => a.relatedTeamId === team.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-border bg-surface p-6">
        <TeamBadge name={team.name} logoUrl={team.logoUrl} color={team.primaryColor} size={72} />
        <div>
          <h1 className="text-2xl font-black">{team.name}</h1>
          <p className="text-sm text-muted">
            {team.country ?? ""} {team.competition?.name ? `· ${team.competition.name}` : ""}
          </p>
          {team.website && (
            <a
              href={team.website}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline"
            >
              <Globe size={12} /> Official website
            </a>
          )}
        </div>
      </div>

      {team.description && <p className="mb-8 text-sm leading-relaxed text-muted">{team.description}</p>}

      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold">Upcoming Fixtures</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={{ ...m, competitionName: m.competition?.name, kickoffAt: m.kickoffAt.toString() }} />
            ))}
          </div>
        </section>
      )}

      {results.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold">Recent Results</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((m) => (
              <MatchCard key={m.id} match={{ ...m, competitionName: m.competition?.name, kickoffAt: m.kickoffAt.toString() }} />
            ))}
          </div>
        </section>
      )}

      {relatedNews.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Related News</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedNews.map((a) => (
              <ArticleCard key={a.id} article={{ ...a, publishAt: a.publishAt?.toString() }} />
            ))}
          </div>
        </section>
      )}

      {team.competition && (
        <p className="mt-8 text-xs text-muted">
          Competing in{" "}
          <Link href={`/competition/${team.competition.slug}`} className="text-brand hover:underline">
            {team.competition.name}
          </Link>
        </p>
      )}
    </div>
  );
}

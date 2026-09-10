import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ShieldAlert, Users2 } from "lucide-react";
import {
  getMatchBySlug,
  getWatchProviders,
  getRelatedArticlesForMatch,
} from "@/lib/queries";
import { getVoteTally } from "@/lib/actions/votes";
import { TeamBadge } from "@/components/TeamBadge";
import { VoteWidget } from "@/components/VoteWidget";
import { PredictionBox } from "@/components/PredictionBox";
import { Countdown } from "@/components/Countdown";
import { ShareButtons } from "@/components/ShareButtons";
import { ArticleCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import { formatKickoff, isVotingLocked } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://futbetter.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);
  if (!match) return {};

  const title = `${match.homeTeam.name} vs ${match.awayTeam.name} — Prediction & Analysis`;
  const description = `${match.homeTeam.name} vs ${match.awayTeam.name}: FutBetter prediction, community vote, head-to-head stats and where to watch. ${match.competition?.name ?? ""}`.trim();

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/match/${slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);
  if (!match) notFound();

  const [tally, watchProviders, relatedArticles] = await Promise.all([
    getVoteTally(match.id),
    getWatchProviders(match.id),
    getRelatedArticlesForMatch(match.id),
  ]);

  const locked = isVotingLocked(match.votingLocked, match.kickoffAt);
  const finished = match.status === "FINISHED";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    startDate: new Date(match.kickoffAt).toISOString(),
    location: match.venue
      ? { "@type": "Place", name: match.venue }
      : undefined,
    competitor: [
      { "@type": "SportsTeam", name: match.homeTeam.name },
      { "@type": "SportsTeam", name: match.awayTeam.name },
    ],
    homeTeam: { "@type": "SportsTeam", name: match.homeTeam.name },
    awayTeam: { "@type": "SportsTeam", name: match.awayTeam.name },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-4 text-xs text-muted">
        <Link href="/matches" className="hover:text-brand">Matches</Link> /{" "}
        <span>{match.homeTeam.name} vs {match.awayTeam.name}</span>
      </nav>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-brand">
          <span>{match.competition?.name ?? "Football"}</span>
          {finished ? (
            <span className="text-muted">FULL TIME</span>
          ) : match.status === "LIVE" ? (
            <Countdown target={match.kickoffAt.toString()} live />
          ) : (
            <Countdown target={match.kickoffAt.toString()} />
          )}
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <TeamBadge name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} color={match.homeTeam.primaryColor} size={80} />
            <Link href={`/team/${match.homeTeam.slug}`} className="font-bold hover:text-brand">
              {match.homeTeam.name}
            </Link>
          </div>
          <div className="text-center">
            {finished ? (
              <span className="text-4xl font-black">
                {match.homeScore} - {match.awayScore}
              </span>
            ) : (
              <span className="text-2xl font-black text-muted">vs</span>
            )}
            <p className="mt-2 text-sm font-semibold">{formatKickoff(new Date(match.kickoffAt))}</p>
            {match.venue && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted">
                <MapPin size={12} /> {match.venue}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <TeamBadge name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} color={match.awayTeam.primaryColor} size={80} />
            <Link href={`/team/${match.awayTeam.slug}`} className="font-bold hover:text-brand">
              {match.awayTeam.name}
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <ShareButtons
            url={`${SITE_URL}/match/${slug}`}
            title={`${match.homeTeam.name} vs ${match.awayTeam.name} — FutBetter Prediction`}
          />
        </div>
      </div>

      <AdSlot code="AD_MATCH_TOP" className="my-8" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {match.preview && (
            <section>
              <h2 className="mb-3 text-xl font-black">Match Preview</h2>
              <p className="text-sm leading-relaxed text-muted">{match.preview}</p>
            </section>
          )}

          {(match.homeForm || match.awayForm || match.h2hNotes) && (
            <section id="analysis">
              <h2 className="mb-3 text-xl font-black">Form &amp; Head-to-Head</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {match.homeForm && (
                  <FormCard label={match.homeTeam.name} form={match.homeForm} />
                )}
                {match.awayForm && (
                  <FormCard label={match.awayTeam.name} form={match.awayForm} />
                )}
              </div>
              {match.h2hNotes && (
                <p className="mt-4 text-sm leading-relaxed text-muted">{match.h2hNotes}</p>
              )}
            </section>
          )}

          {match.predictionFullAnalysis && (
            <section>
              <h2 className="mb-3 text-xl font-black">Full Analysis</h2>
              <div className="prose-fb">
                {match.predictionFullAnalysis.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {(match.keyPlayers?.length || match.injuries?.length) && (
            <section className="grid gap-4 sm:grid-cols-2">
              {!!match.keyPlayers?.length && (
                <InfoList icon={<Users2 size={14} />} title="Key Players" items={match.keyPlayers} />
              )}
              {!!match.injuries?.length && (
                <InfoList icon={<ShieldAlert size={14} />} title="Injuries / Unavailable" items={match.injuries} />
              )}
            </section>
          )}

          <AdSlot code="AD_MATCH_BOTTOM" />

          {watchProviders.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-black">Where to Watch</h2>
              <div className="space-y-2">
                {watchProviders.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer sponsored"
                    className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 hover:border-brand/50"
                  >
                    <div>
                      <p className="font-semibold">{p.providerName}</p>
                      <p className="text-xs text-muted">{p.region}{p.description ? ` — ${p.description}` : ""}</p>
                    </div>
                    <span className="text-xs font-bold text-brand">Watch →</span>
                  </a>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Availability may vary by region. Links point to official/authorized providers only.
              </p>
            </section>
          )}

          {relatedArticles.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-black">Related News</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedArticles.map((a) => (
                  <ArticleCard key={a.id} article={{ ...a, publishAt: a.publishAt?.toString() }} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <VoteWidget
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            initialTally={tally}
            locked={locked}
          />
          <PredictionBox
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            tally={tally}
            predictionWinner={match.predictionWinner}
            predictionConfidence={match.predictionConfidence}
            predictionScoreHome={match.predictionScoreHome}
            predictionScoreAway={match.predictionScoreAway}
            predictionReasoning={match.predictionReasoning}
            predictionKeyFactors={match.predictionKeyFactors}
            expertName={match.expertName}
            expertWinner={match.expertWinner}
            expertConfidence={match.expertConfidence}
          />
          <AdSlot code="AD_MATCH_SIDEBAR" />
        </div>
      </div>
    </div>
  );
}

function FormCard({ label, form }: { label: string; form: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{label} — Last 5</p>
      <div className="flex gap-1.5">
        {form.split("").map((c, i) => (
          <span
            key={i}
            className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${
              c === "W" ? "bg-brand text-black" : c === "D" ? "bg-zinc-600 text-white" : "bg-red-500/80 text-white"
            }`}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
        {icon} {title}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted">{item}</li>
        ))}
      </ul>
    </div>
  );
}

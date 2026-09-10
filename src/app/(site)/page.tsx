import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import {
  getFeaturedMatch,
  getUpcomingMatches,
  getArticles,
  getTrendingArticles,
} from "@/lib/queries";
import { getVoteTally } from "@/lib/actions/votes";
import { MatchCard } from "@/components/MatchCard";
import { ArticleCard } from "@/components/ArticleCard";
import { VoteWidget } from "@/components/VoteWidget";
import { PredictionBox } from "@/components/PredictionBox";
import { TeamBadge } from "@/components/TeamBadge";
import { Countdown } from "@/components/Countdown";
import { LiveScore } from "@/components/LiveScore";
import { LiveRefresher } from "@/components/LiveRefresher";
import { AdSlot } from "@/components/AdSlot";
import { formatKickoff, isVotingLocked } from "@/lib/utils";

export default async function HomePage() {
  const featured = await getFeaturedMatch();
  const upcoming = await getUpcomingMatches(8, featured?.id);
  const news = await getArticles({ type: "NEWS", limit: 4 });
  const analysis = await getArticles({ type: "ANALYSIS", limit: 3 });
  const trending = await getTrendingArticles(5);
  const tally = featured ? await getVoteTally(featured.id) : null;

  const featuredLive = featured?.status === "LIVE";
  const featuredFinished = featured?.status === "FINISHED";
  const hasLiveMatch = featuredLive || upcoming.some((m) => m.status === "LIVE");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <LiveRefresher active={hasLiveMatch} />
      <AdSlot code="AD_HOME_TOP" className="mb-8" />

      {featured && tally && (
        <section className="mb-12">
          <div className="grid gap-4 lg:grid-cols-3">
            <div
              className={`card pitch-texture relative overflow-hidden lg:col-span-2 ${
                featuredLive ? "live-border" : "glow-gold"
              }`}
            >
              <span className={`corner-wedge ${featuredLive ? "is-live" : ""}`} />
              <div className="p-6 pt-8">
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
                    <Flame size={13} /> {featured.competition?.name ?? "Match of the Day"}
                  </span>
                  {!featuredLive && !featuredFinished && (
                    <Countdown target={featured.kickoffAt.toString()} />
                  )}
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-gradient-to-b from-white/5 to-transparent p-1">
                      <TeamBadge
                        name={featured.homeTeam.name}
                        logoUrl={featured.homeTeam.logoUrl}
                        color={featured.homeTeam.primaryColor}
                        size={72}
                      />
                    </div>
                    <span className="font-bold">{featured.homeTeam.name}</span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    {featuredLive || featuredFinished ? (
                      <LiveScore
                        status={featured.status}
                        homeScore={featured.homeScore}
                        awayScore={featured.awayScore}
                        homeTeamName={featured.homeTeam.name}
                        awayTeamName={featured.awayTeam.name}
                        latestEvent={featured.events?.[0] ?? null}
                        size="lg"
                      />
                    ) : (
                      <span className="text-3xl font-black text-muted">vs</span>
                    )}
                    <p className="mt-2 text-sm font-semibold text-muted">
                      {formatKickoff(new Date(featured.kickoffAt))}
                    </p>
                    {featured.venue && <p className="text-xs text-muted">{featured.venue}</p>}
                  </div>

                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-gradient-to-b from-white/5 to-transparent p-1">
                      <TeamBadge
                        name={featured.awayTeam.name}
                        logoUrl={featured.awayTeam.logoUrl}
                        color={featured.awayTeam.primaryColor}
                        size={72}
                      />
                    </div>
                    <span className="font-bold">{featured.awayTeam.name}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/match/${featured.slug}`} className="btn-angled">
                    PREDICT MATCH <ArrowRight size={15} />
                  </Link>
                  <Link href={`/match/${featured.slug}#analysis`} className="btn-angled-outline">
                    READ ANALYSIS
                  </Link>
                  <a
                    href="https://stake.com/?c=bo4ixMU7"
                    target="_blank"
                    rel="noopener sponsored"
                    className="btn-angled !bg-[#00e701] !text-black hover:!brightness-110"
                  >
                    BET ON STAKE ↗
                  </a>
                </div>
              </div>
            </div>

            <VoteWidget
              matchId={featured.id}
              homeTeam={featured.homeTeam}
              awayTeam={featured.awayTeam}
              initialTally={tally}
              locked={isVotingLocked(featured.votingLocked, featured.kickoffAt)}
            />
          </div>
        </section>
      )}

      <section className="mb-12">
        <SectionHeader title="Upcoming Matches" href="/matches" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((m) => (
            <MatchCard
              key={m.id}
              match={{ ...m, competitionName: m.competition?.name, kickoffAt: m.kickoffAt.toString() }}
            />
          ))}
          {upcoming.length === 0 && (
            <p className="col-span-full text-sm text-muted">No upcoming matches scheduled yet.</p>
          )}
        </div>
      </section>

      <AdSlot code="AD_HOME_MIDDLE" className="mb-12" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="mb-12">
            <SectionHeader title="Latest News" href="/news" />
            <div className="grid gap-4 sm:grid-cols-2">
              {news.map((a) => (
                <ArticleCard key={a.id} article={{ ...a, publishAt: a.publishAt?.toString() }} />
              ))}
              {news.length === 0 && <p className="text-sm text-muted">No news published yet.</p>}
            </div>
          </section>

          <section>
            <SectionHeader title="Match Analysis" href="/analysis" />
            <div className="grid gap-4 sm:grid-cols-2">
              {analysis.map((a) => (
                <ArticleCard key={a.id} article={{ ...a, publishAt: a.publishAt?.toString() }} />
              ))}
              {analysis.length === 0 && <p className="text-sm text-muted">No analysis published yet.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {featured && tally && (
            <div>
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-muted">
                <Flame size={14} className="text-gold" /> Match of the Day Predictions
              </h3>
              <PredictionBox
                homeTeamName={featured.homeTeam.name}
                awayTeamName={featured.awayTeam.name}
                tally={tally}
                predictionWinner={featured.predictionWinner}
                predictionConfidence={featured.predictionConfidence}
                predictionScoreHome={featured.predictionScoreHome}
                predictionScoreAway={featured.predictionScoreAway}
                predictionReasoning={featured.predictionReasoning}
                predictionKeyFactors={featured.predictionKeyFactors}
                expertName={featured.expertName}
                expertWinner={featured.expertWinner}
                expertConfidence={featured.expertConfidence}
              />
            </div>
          )}

          <div className="card p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-muted">
              <Flame size={14} className="text-gold" /> Trending
            </h3>
            <ul className="space-y-3">
              {trending.map((a, i) => (
                <li key={a.id}>
                  <Link
                    href={`/${a.type === "NEWS" ? "news" : "analysis"}/${a.slug}`}
                    className="flex gap-3 text-sm transition hover:text-brand"
                  >
                    <span className="font-black text-gold/70">{i + 1}</span>
                    <span className="line-clamp-2">{a.title}</span>
                  </Link>
                </li>
              ))}
              {trending.length === 0 && <p className="text-sm text-muted">Nothing trending yet.</p>}
            </ul>
          </div>

          <AdSlot code="AD_HOME_SIDEBAR" />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
      <h2 className="flex items-center gap-2.5 text-xl font-black italic">
        <span className="section-bar" /> {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-brand"
      >
        View all <ArrowRight size={14} />
      </Link>
    </div>
  );
}

import Link from "next/link";
import { TeamBadge } from "./TeamBadge";
import { Countdown } from "./Countdown";
import { LiveScore, type LatestMatchEvent } from "./LiveScore";
import { formatKickoff } from "@/lib/utils";

export interface MatchCardData {
  slug: string;
  competitionName?: string | null;
  kickoffAt: string | Date;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { name: string; logoUrl?: string | null; primaryColor?: string | null };
  awayTeam: { name: string; logoUrl?: string | null; primaryColor?: string | null };
  isMatchOfTheDay?: boolean;
  events?: LatestMatchEvent[];
}

export function MatchCard({ match }: { match: MatchCardData }) {
  const kickoff = new Date(match.kickoffAt);
  const finished = match.status === "FINISHED";
  const live = match.status === "LIVE";
  const latestEvent = match.events?.[0] ?? null;

  return (
    <Link
      href={`/match/${match.slug}`}
      className={`card card-hover group flex flex-col gap-3 p-4 ${live ? "live-border" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-bold uppercase tracking-wider text-muted transition group-hover:text-brand">
          {match.competitionName ?? "Football"}
        </span>
        {match.isMatchOfTheDay && (
          <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
            ★ MOTD
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 items-center gap-2 text-center">
        <TeamCol team={match.homeTeam} />

        <div className="flex flex-col items-center gap-1">
          {finished || live ? (
            <LiveScore
              status={match.status}
              homeScore={match.homeScore}
              awayScore={match.awayScore}
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
              latestEvent={latestEvent}
            />
          ) : (
            <>
              <span className="text-sm font-bold text-muted">
                {formatKickoff(kickoff, { day: undefined, month: undefined })}
              </span>
              <Countdown target={kickoff.toISOString()} />
            </>
          )}
        </div>

        <TeamCol team={match.awayTeam} />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] text-muted">{formatKickoff(kickoff)}</span>
        <span
          className={`rounded-md px-3 py-1 text-[11px] font-bold transition ${
            finished
              ? "border border-border text-muted group-hover:border-brand/50 group-hover:text-brand"
              : "bg-brand text-black group-hover:bg-brand-dark"
          }`}
        >
          {finished ? "VIEW RESULT" : "PREDICT"}
        </span>
      </div>
    </Link>
  );
}

function TeamCol({ team }: { team: MatchCardData["homeTeam"] }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <TeamBadge name={team.name} logoUrl={team.logoUrl} color={team.primaryColor} size={36} />
      <span className="line-clamp-1 text-[11px] font-semibold">{team.name}</span>
    </div>
  );
}

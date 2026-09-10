import Link from "next/link";
import { TeamBadge } from "./TeamBadge";
import { Countdown } from "./Countdown";
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
}

export function MatchCard({ match }: { match: MatchCardData }) {
  const kickoff = new Date(match.kickoffAt);
  const finished = match.status === "FINISHED";
  const live = match.status === "LIVE";

  return (
    <Link
      href={`/match/${match.slug}`}
      className="block rounded-xl border border-border bg-surface p-4 transition hover:border-brand/50"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
          {match.competitionName ?? "Football"}
        </span>
        {match.isMatchOfTheDay && (
          <span className="rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold text-brand">
            MATCH OF THE DAY
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 items-center gap-2 text-center">
        <TeamCol team={match.homeTeam} />

        <div className="flex flex-col items-center gap-1">
          {finished ? (
            <span className="text-xl font-black">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-sm font-bold text-muted">{formatKickoff(kickoff, { day: undefined, month: undefined })}</span>
          )}
          {!finished && (live ? <Countdown target={kickoff.toISOString()} live /> : <Countdown target={kickoff.toISOString()} />)}
          {finished && <span className="text-[10px] font-semibold text-muted">FULL TIME</span>}
        </div>

        <TeamCol team={match.awayTeam} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted">{formatKickoff(kickoff)}</span>
        <span className="rounded-md bg-brand px-3 py-1 text-[11px] font-bold text-black">
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

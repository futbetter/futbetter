"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { castVote, type Choice, type VoteTally } from "@/lib/actions/votes";
import { TeamBadge } from "./TeamBadge";

interface VoteWidgetProps {
  matchId: string;
  homeTeam: { name: string; logoUrl?: string | null; color?: string | null };
  awayTeam: { name: string; logoUrl?: string | null; color?: string | null };
  initialTally: VoteTally;
  locked: boolean;
  compact?: boolean;
}

const BAR_COLORS: Record<Choice, string> = {
  HOME: "bg-brand",
  DRAW: "bg-accent-draw",
  AWAY: "bg-accent-away",
};

const BORDER_COLORS: Record<Choice, string> = {
  HOME: "border-brand bg-brand/10",
  DRAW: "border-accent-draw bg-accent-draw/10",
  AWAY: "border-accent-away bg-accent-away/10",
};

export function VoteWidget({
  matchId,
  homeTeam,
  awayTeam,
  initialTally,
  locked,
  compact,
}: VoteWidgetProps) {
  const { status } = useSession();
  const [tally, setTally] = useState(initialTally);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasVoted = !!tally.userChoice;
  const showResults = hasVoted || locked;

  function vote(choice: Choice) {
    if (status !== "authenticated") {
      setError("LOGIN");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await castVote(matchId, choice);
      if (res.ok) {
        setTally(res.tally);
      } else if (res.error === "LOCKED") {
        setError("LOCKED");
      } else if (res.error === "AUTH_REQUIRED") {
        setError("LOGIN");
      } else {
        setError("GENERIC");
      }
    });
  }

  return (
    <div className="card p-4">
      {!compact && (
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
          Who will win?
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <VoteOption
          label={homeTeam.name}
          logoUrl={homeTeam.logoUrl}
          color={homeTeam.color}
          pct={tally.homePct}
          selected={tally.userChoice === "HOME"}
          showResults={showResults}
          disabled={locked || isPending}
          onClick={() => vote("HOME")}
          barColor={BAR_COLORS.HOME}
          selectedClass={BORDER_COLORS.HOME}
        />
        <VoteOption
          label="Draw"
          pct={tally.drawPct}
          selected={tally.userChoice === "DRAW"}
          showResults={showResults}
          disabled={locked || isPending}
          onClick={() => vote("DRAW")}
          barColor={BAR_COLORS.DRAW}
          selectedClass={BORDER_COLORS.DRAW}
          isDraw
        />
        <VoteOption
          label={awayTeam.name}
          logoUrl={awayTeam.logoUrl}
          color={awayTeam.color}
          pct={tally.awayPct}
          selected={tally.userChoice === "AWAY"}
          showResults={showResults}
          disabled={locked || isPending}
          onClick={() => vote("AWAY")}
          barColor={BAR_COLORS.AWAY}
          selectedClass={BORDER_COLORS.AWAY}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{tally.total.toLocaleString()} votes</span>
        {locked && <span className="font-semibold text-amber-400">Voting locked</span>}
      </div>

      {error === "LOGIN" && (
        <p className="mt-2 text-xs text-amber-400">
          <Link href="/login" className="underline">
            Log in with Telegram
          </Link>{" "}
          to cast your vote.
        </p>
      )}
      {error === "LOCKED" && (
        <p className="mt-2 text-xs text-amber-400">Voting closed at kick-off.</p>
      )}
      {error === "GENERIC" && (
        <p className="mt-2 text-xs text-red-400">Couldn&apos;t save your vote. Try again.</p>
      )}
    </div>
  );
}

function VoteOption({
  label,
  logoUrl,
  color,
  pct,
  selected,
  showResults,
  disabled,
  onClick,
  barColor,
  selectedClass,
  isDraw,
}: {
  label: string;
  logoUrl?: string | null;
  color?: string | null;
  pct: number;
  selected: boolean;
  showResults: boolean;
  disabled?: boolean;
  onClick: () => void;
  barColor: string;
  selectedClass: string;
  isDraw?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`card-sm flex flex-col items-center gap-1.5 border bg-surface-2 p-2 text-center transition disabled:cursor-not-allowed ${
        selected ? selectedClass : "border-border hover:border-border-strong"
      }`}
    >
      {isDraw ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-sm font-bold text-muted">
          X
        </div>
      ) : (
        <TeamBadge name={label} logoUrl={logoUrl} color={color} size={40} />
      )}
      <span className="line-clamp-1 text-[11px] font-semibold">{label}</span>
      {showResults ? (
        <>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold">{pct}%</span>
        </>
      ) : (
        <span className="text-[10px] text-muted">Tap to vote</span>
      )}
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export interface LatestMatchEvent {
  id: string;
  minute: number;
  team: "HOME" | "AWAY";
  type: string;
  scorerName?: string | null;
}

interface LiveScoreProps {
  status: string;
  homeScore: number | null | undefined;
  awayScore: number | null | undefined;
  homeTeamName: string;
  awayTeamName: string;
  latestEvent?: LatestMatchEvent | null;
  size?: "sm" | "lg";
}

const GOAL_TYPES = new Set(["GOAL", "PENALTY_GOAL", "OWN_GOAL"]);

/**
 * Renders the live/finished scoreline for a match and, when paired with
 * <LiveRefresher>, notices in real time when a new goal event arrives
 * (by comparing the latest event id across refreshes) — flashing the score
 * and popping up a brief "GOAL!" toast. On first mount it just remembers
 * the current event as the baseline, so nothing flashes for goals that
 * already happened before the page loaded.
 */
export function LiveScore({
  status,
  homeScore,
  awayScore,
  homeTeamName,
  awayTeamName,
  latestEvent,
  size = "sm",
}: LiveScoreProps) {
  const seenEventId = useRef<string | null | undefined>(undefined);
  const [flashing, setFlashing] = useState(false);
  const [toast, setToast] = useState<LatestMatchEvent | null>(null);

  useEffect(() => {
    const currentId = latestEvent?.id ?? null;

    if (seenEventId.current === undefined) {
      seenEventId.current = currentId;
      return;
    }

    if (currentId && currentId !== seenEventId.current && latestEvent && GOAL_TYPES.has(latestEvent.type)) {
      seenEventId.current = currentId;
      setFlashing(true);
      setToast(latestEvent);
      const clearFlash = setTimeout(() => setFlashing(false), 2400);
      const clearToast = setTimeout(() => setToast(null), 6000);
      return () => {
        clearTimeout(clearFlash);
        clearTimeout(clearToast);
      };
    }

    seenEventId.current = currentId;
  }, [latestEvent]);

  if (homeScore == null || awayScore == null) return null;

  const live = status === "LIVE";
  const finished = status === "FINISHED";
  const big = size === "lg";

  return (
    <div className="relative flex flex-col items-center gap-1">
      {toast && (
        <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-black shadow-[0_6px_20px_-6px_rgba(34,197,94,0.7)]">
          ⚽ GOAL! {toast.team === "HOME" ? homeTeamName : awayTeamName} {toast.minute}&apos;
        </div>
      )}

      <span
        className={`rounded-lg px-2 py-0.5 font-black tabular-nums transition ${
          big ? "text-4xl" : "text-xl"
        } ${flashing ? "goal-flash goal-pop" : ""}`}
      >
        {homeScore} – {awayScore}
      </span>

      {live && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-live">
          <span className="live-dot" /> LIVE
        </span>
      )}
      {finished && <span className="text-[10px] font-semibold text-muted">FULL TIME</span>}
    </div>
  );
}

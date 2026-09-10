"use client";

import { useEffect, useState } from "react";

function getParts(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { diff, days, hours, minutes, seconds };
}

export function Countdown({ target, live }: { target: string; live?: boolean }) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState(() => getParts(targetMs));

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (live) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
      </span>
    );
  }

  if (parts.diff <= 0) {
    return <span className="text-xs font-semibold text-muted">Kick-off started</span>;
  }

  const label =
    parts.days > 0
      ? `${parts.days}d ${parts.hours}h`
      : parts.hours > 0
      ? `${parts.hours}h ${parts.minutes}m`
      : `${parts.minutes}m ${parts.seconds}s`;

  return <span className="text-xs font-semibold text-brand">Kick-off in {label}</span>;
}

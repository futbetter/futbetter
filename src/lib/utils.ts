import slugify from "slugify";

export function toSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function matchSlug(homeTeamName: string, awayTeamName: string, kickoffAt: Date) {
  const datePart = kickoffAt.toISOString().slice(0, 10);
  return `${toSlug(homeTeamName)}-vs-${toSlug(awayTeamName)}-${datePart}`;
}

export function formatKickoff(date: Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  }).format(date);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function percentages(home: number, draw: number, away: number) {
  const total = home + draw + away;
  if (total === 0) return { home: 0, draw: 0, away: 0, total: 0 };
  return {
    home: Math.round((home / total) * 100),
    draw: Math.round((draw / total) * 100),
    away: Math.round((away / total) * 100),
    total,
  };
}

export function accuracy(correct: number, total: number) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Deliberately reads the current time: the whole app is force-dynamic, so
// on the server this runs fresh on every request rather than being cached
// or compiled.
export function isKickedOff(kickoffAt: Date | string) {
  return Date.now() >= new Date(kickoffAt).getTime();
}

export function isVotingLocked(votingLocked: boolean, kickoffAt: Date | string) {
  return votingLocked || isKickedOff(kickoffAt);
}

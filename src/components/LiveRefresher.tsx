"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Silently re-fetches the current route's server data on an interval.
 * Mount this (once per page) with `active` set to true whenever the page is
 * showing a LIVE match — it keeps scores, goal events and vote tallies
 * fresh without a full page reload or any client-side data-fetching layer
 * of its own. Renders nothing.
 */
export function LiveRefresher({
  active,
  intervalMs = 20000,
}: {
  active: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs, router]);

  return null;
}

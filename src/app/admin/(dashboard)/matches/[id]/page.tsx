import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MatchForm } from "@/components/admin/MatchForm";
import { getTeams, getCompetitions, getWatchProviders } from "@/lib/queries";
import { recordMatchResult, addWatchProvider, deleteWatchProvider } from "@/lib/actions/matches";

export const metadata = { title: "Edit Match" };

export default async function EditMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [match] = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  if (!match) notFound();

  const [teams, competitions, providers] = await Promise.all([
    getTeams(),
    getCompetitions(),
    getWatchProviders(id),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black">Edit Match</h1>

      <MatchForm match={match} teams={teams} competitions={competitions} />

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Final Result</legend>
        <form action={recordMatchResult} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={match.id} />
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Home score</span>
            <input type="number" min={0} name="homeScore" defaultValue={match.homeScore ?? ""} required className="input w-24" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Away score</span>
            <input type="number" min={0} name="awayScore" defaultValue={match.awayScore ?? ""} required className="input w-24" />
          </label>
          <button type="submit" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
            Record Result
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">
          Recording a result marks the match as finished, locks voting, and evaluates every user&apos;s prediction accuracy.
          This only runs once per match — editing the score afterwards updates the display only.
        </p>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Where to Watch</legend>
        <div className="mb-4 space-y-2">
          {providers.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
              <div className="text-sm">
                <p className="font-semibold">{p.providerName}</p>
                <p className="text-xs text-muted">{p.region} — {p.url}</p>
              </div>
              <form action={deleteWatchProvider.bind(null, p.id, match.id)}>
                <button className="rounded-md p-1.5 text-red-400 hover:bg-surface-2">
                  <Trash2 size={15} />
                </button>
              </form>
            </div>
          ))}
          {providers.length === 0 && <p className="text-sm text-muted">No providers added yet.</p>}
        </div>

        <form action={addWatchProvider} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="matchId" value={match.id} />
          <input name="providerName" placeholder="Provider name" required className="input" />
          <input name="url" placeholder="https://…" required className="input" />
          <input name="region" placeholder="Region (e.g. UK, Global)" className="input" />
          <input name="description" placeholder="Description (optional)" className="input" />
          <button type="submit" className="col-span-full rounded-lg border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand/10">
            Add Provider
          </button>
        </form>
      </fieldset>
    </div>
  );
}

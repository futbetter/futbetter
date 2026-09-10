import Link from "next/link";
import { Plus, Trash2, Star } from "lucide-react";
import { getAllMatches } from "@/lib/queries";
import { deleteMatch } from "@/lib/actions/matches";
import { formatKickoff } from "@/lib/utils";

export const metadata = { title: "Matches" };

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-zinc-600",
  LIVE: "bg-red-600",
  FINISHED: "bg-brand text-black",
  POSTPONED: "bg-amber-600",
  CANCELLED: "bg-zinc-700",
};

export default async function AdminMatchesPage() {
  const matches = await getAllMatches();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Matches</h1>
        <Link href="/admin/matches/new" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black">
          <Plus size={16} /> New Match
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Competition</th>
              <th className="px-4 py-3">Kick-off</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id} className="border-t border-border bg-surface hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/admin/matches/${m.id}`} className="flex items-center gap-1.5 font-medium hover:text-brand">
                    {m.featured && <Star size={13} className="fill-brand text-brand" />}
                    {m.homeTeam.name} vs {m.awayTeam.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{m.competition?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{formatKickoff(new Date(m.kickoffAt))}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[m.status]}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <form action={deleteMatch.bind(null, m.id)}>
                      <button title="Delete" className="rounded-md p-1.5 text-red-400 hover:bg-surface-2">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">No matches yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

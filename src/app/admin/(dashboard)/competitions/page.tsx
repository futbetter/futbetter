import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { getCompetitions } from "@/lib/queries";
import { deleteCompetition } from "@/lib/actions/competitions";

export const metadata = { title: "Competitions" };

export default async function AdminCompetitionsPage() {
  const competitions = await getCompetitions();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Competitions</h1>
        <Link href="/admin/competitions/new" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black">
          <Plus size={16} /> New Competition
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {competitions.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
            <Link href={`/admin/competitions/${c.id}`}>
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-muted">{c.country} · {c.type}</p>
            </Link>
            <form action={deleteCompetition.bind(null, c.id)}>
              <button className="rounded-md p-1.5 text-red-400 hover:bg-surface-2">
                <Trash2 size={15} />
              </button>
            </form>
          </div>
        ))}
        {competitions.length === 0 && <p className="text-sm text-muted">No competitions yet.</p>}
      </div>
    </div>
  );
}

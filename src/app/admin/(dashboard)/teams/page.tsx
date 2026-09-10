import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { getTeams } from "@/lib/queries";
import { deleteTeam } from "@/lib/actions/teams";
import { TeamBadge } from "@/components/TeamBadge";

export const metadata = { title: "Teams" };

export default async function AdminTeamsPage() {
  const teams = await getTeams();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Teams</h1>
        <Link href="/admin/teams/new" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black">
          <Plus size={16} /> New Team
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
            <Link href={`/admin/teams/${t.id}`} className="flex items-center gap-3">
              <TeamBadge name={t.name} logoUrl={t.logoUrl} color={t.primaryColor} size={36} />
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted">{t.country}</p>
              </div>
            </Link>
            <form action={deleteTeam.bind(null, t.id)}>
              <button className="rounded-md p-1.5 text-red-400 hover:bg-surface-2">
                <Trash2 size={15} />
              </button>
            </form>
          </div>
        ))}
        {teams.length === 0 && <p className="text-sm text-muted">No teams yet.</p>}
      </div>
    </div>
  );
}

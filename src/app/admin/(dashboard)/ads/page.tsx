import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { adSlots } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { deleteAdSlot, toggleAdSlot } from "@/lib/actions/ads";

export const metadata = { title: "Advertising" };

export default async function AdminAdsPage() {
  const slots = await db.select().from(adSlots).orderBy(desc(adSlots.createdAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Advertising</h1>
        <Link href="/admin/ads/new" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black">
          <Plus size={16} /> New Ad Slot
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Impressions</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id} className="border-t border-border bg-surface hover:bg-surface-2">
                <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/ads/${s.id}`} className="font-medium hover:text-brand">{s.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{s.impressions}</td>
                <td className="px-4 py-3 text-muted">{s.clicks}</td>
                <td className="px-4 py-3">
                  <form action={toggleAdSlot.bind(null, s.id, !s.enabled)}>
                    <button
                      type="submit"
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${s.enabled ? "bg-brand text-black" : "bg-zinc-600"}`}
                    >
                      {s.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <form action={deleteAdSlot.bind(null, s.id)}>
                      <button className="rounded-md p-1.5 text-red-400 hover:bg-surface-2">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {slots.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No ad slots configured yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

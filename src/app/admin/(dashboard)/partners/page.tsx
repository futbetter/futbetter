import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { partners, affiliateCampaigns } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { deletePartner, saveCampaign, deleteCampaign } from "@/lib/actions/partners";

export const metadata = { title: "Partners" };

export default async function AdminPartnersPage() {
  const [allPartners, allCampaigns] = await Promise.all([
    db.select().from(partners).orderBy(desc(partners.createdAt)),
    db.select().from(affiliateCampaigns).orderBy(desc(affiliateCampaigns.createdAt)),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-black">Partners</h1>
          <Link href="/admin/partners/new" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black">
            <Plus size={16} /> New Partner
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allPartners.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <Link href={`/admin/partners/${p.id}`} className="font-bold hover:text-brand">{p.name}</Link>
                  <p className="text-xs text-muted">{p.packageTier} · {p.placement} · {p.country}</p>
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${p.active ? "bg-brand text-black" : "bg-zinc-600"}`}>
                  {p.active ? "Active" : "Inactive"}
                </span>
              </div>
              <form action={deletePartner.bind(null, p.id)}>
                <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-400 hover:underline">
                  <Trash2 size={12} /> Delete
                </button>
              </form>
            </div>
          ))}
          {allPartners.length === 0 && <p className="text-sm text-muted">No partners yet.</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-black">Affiliate Campaigns</h2>

        <div className="mb-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allCampaigns.map((c) => (
                <tr key={c.id} className="border-t border-border bg-surface">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.campaignCode}</td>
                  <td className="px-4 py-3 text-muted">{c.placement}</td>
                  <td className="px-4 py-3 text-muted">{c.clicks}</td>
                  <td className="px-4 py-3 text-muted">{c.country}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <form action={deleteCampaign.bind(null, c.id)}>
                        <button className="rounded-md p-1.5 text-red-400 hover:bg-surface-2">
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {allCampaigns.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No campaigns yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <form action={saveCampaign} className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <input name="name" placeholder="Campaign name (e.g. Stake Homepage Campaign)" required className="input" />
          <input name="campaignCode" placeholder="Unique code (e.g. STAKE_HOME_01)" required className="input" />
          <input name="trackingUrl" placeholder="Tracking URL" required className="input" />
          <select name="partnerId" className="input">
            <option value="">No linked partner</option>
            {allPartners.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select name="placement" className="input">
            <option value="homepage">Homepage</option>
            <option value="match_page">Match Page</option>
            <option value="article">Article</option>
            <option value="telegram">Telegram</option>
            <option value="social">Social</option>
          </select>
          <input name="country" placeholder="Country / Region (default Global)" className="input" />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="active" defaultChecked className="h-4 w-4" /> Active
          </label>
          <button type="submit" className="col-span-full rounded-lg border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand/10">
            Add Campaign
          </button>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  Users,
  Vote,
  Newspaper,
  CalendarDays,
  MousePointerClick,
  Eye,
  Target,
  DollarSign,
  Plus,
} from "lucide-react";
import { getDashboardStats, getMostViewedArticles, getRecentAuditLogs } from "@/lib/admin-queries";

export const metadata = { title: "Dashboard" };

const QUICK_ACTIONS = [
  { href: "/admin/articles/new", label: "New Article" },
  { href: "/admin/matches/new", label: "New Match" },
  { href: "/admin/articles/new?type=ANALYSIS", label: "New Analysis" },
  { href: "/admin/ads/new", label: "New Ad" },
  { href: "/admin/partners/new", label: "New Partner" },
];

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const topArticles = await getMostViewedArticles(5);
  const recentLogs = await getRecentAuditLogs(10);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Dashboard</h1>

      <div className="mb-8 flex flex-wrap gap-3">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-black hover:bg-brand-dark"
          >
            <Plus size={16} /> {a.label}
          </Link>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile icon={<Users size={16} />} label="Total Users" value={stats.totalUsers} />
        <StatTile icon={<Users size={16} />} label="New Users Today" value={stats.newUsersToday} />
        <StatTile icon={<Vote size={16} />} label="Total Votes" value={stats.totalVotes} />
        <StatTile icon={<Newspaper size={16} />} label="Total Articles" value={stats.totalArticles} />
        <StatTile icon={<CalendarDays size={16} />} label="Total Matches" value={stats.totalMatches} />
        <StatTile icon={<Target size={16} />} label="Prediction Accuracy" value={`${stats.predictionAccuracy}%`} highlight />
        <StatTile icon={<Eye size={16} />} label="Ad Impressions" value={stats.adImpressions} />
        <StatTile icon={<MousePointerClick size={16} />} label="Ad Clicks" value={stats.adClicks} />
        <StatTile icon={<DollarSign size={16} />} label="Affiliate Clicks" value={stats.affiliateClicks} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Most Viewed Articles</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            {topArticles.map((a) => (
              <Link
                key={a.id}
                href={`/admin/articles/${a.id}`}
                className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 last:border-0 hover:bg-surface-2"
              >
                <span className="line-clamp-1 text-sm">{a.title}</span>
                <span className="text-xs font-bold text-brand">{a.viewCount} views</span>
              </Link>
            ))}
            {topArticles.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted">No articles yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Recent Activity</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            {recentLogs.map((log) => (
              <div key={log.id} className="border-b border-border bg-surface px-4 py-3 text-xs last:border-0">
                <span className="font-semibold text-brand">{log.adminName ?? "System"}</span>{" "}
                <span className="text-muted">
                  {log.action.toLowerCase().replace(/_/g, " ")} {log.entityType}
                </span>
                <span className="ml-2 text-muted">
                  {new Date(log.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted">No activity yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-brand bg-brand/5" : "border-border bg-surface"}`}>
      <div className={`mb-2 flex items-center gap-1.5 text-xs ${highlight ? "text-brand" : "text-muted"}`}>
        {icon} {label}
      </div>
      <p className={`text-2xl font-black ${highlight ? "text-brand" : ""}`}>{value}</p>
    </div>
  );
}
